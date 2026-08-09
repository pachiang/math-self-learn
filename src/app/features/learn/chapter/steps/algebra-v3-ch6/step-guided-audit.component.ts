import { Component, computed, signal } from '@angular/core';

type SystemId = 'Zadd' | 'Nadd' | 'allMatrices' | 'invertibleMatrices';
interface AuditTest { clause: string; question: string; pass: boolean; evidence: string; }
interface AuditSystem { id: SystemId; label: string; note: string; tests: readonly AuditTest[]; }
const SYSTEMS: readonly AuditSystem[] = [
  { id:'Zadd',label:'(ℤ,+)',note:'integers under addition',tests:[
    {clause:'Closure',question:'sum 是否仍為 integer？',pass:true,evidence:'任意 a,b∈ℤ，a+b∈ℤ。'}, {clause:'Associativity',question:'重新加括號是否改 sum？',pass:true,evidence:'integer addition 滿足 (a+b)+c=a+(b+c)。'}, {clause:'Identity',question:'是否有 universal no-op？',pass:true,evidence:'0+a=a=a+0。'}, {clause:'Inverse',question:'每個 integer 都能撤銷嗎？',pass:true,evidence:'a 的 additive inverse 是 −a，仍在 ℤ。'} ]},
  { id:'Nadd',label:'(ℕ₀,+)',note:'nonnegative integers under addition',tests:[
    {clause:'Closure',question:'sum 是否仍 nonnegative？',pass:true,evidence:'a,b≥0 時 a+b≥0。'}, {clause:'Associativity',question:'重新加括號是否改 sum？',pass:true,evidence:'繼承 integer addition 的 associativity。'}, {clause:'Identity',question:'0 是否在 set 中？',pass:true,evidence:'本頁 convention 的 ℕ₀ 包含 0。'}, {clause:'Inverse',question:'1 的 undo 是否在 set？',pass:false,evidence:'需要 −1，但 −1∉ℕ₀。'} ]},
  { id:'allMatrices',label:'(M₂,×)',note:'all 2×2 matrices',tests:[
    {clause:'Closure',question:'product 仍是 2×2 matrix？',pass:true,evidence:'兩個 2×2 matrices 的 product 仍為 2×2。'}, {clause:'Associativity',question:'matrix product 可重新分組？',pass:true,evidence:'matrix multiplication 對 compatible sizes associative。'}, {clause:'Identity',question:'是否有 matrix no-op？',pass:true,evidence:'identity matrix I 滿足 IA=A=AI。'}, {clause:'Inverse',question:'zero matrix 能撤銷嗎？',pass:false,evidence:'0A=0，沒有 B 能讓 0B=I；singular matrices 無 inverse。'} ]},
  { id:'invertibleMatrices',label:'(GL₂,×)',note:'invertible 2×2 matrices',tests:[
    {clause:'Closure',question:'invertible product 仍 invertible？',pass:true,evidence:'(AB)⁻¹=B⁻¹A⁻¹，因此 AB 仍 invertible。'}, {clause:'Associativity',question:'matrix product 可重新分組？',pass:true,evidence:'matrix multiplication associative。'}, {clause:'Identity',question:'I 是否留在 restricted set？',pass:true,evidence:'I invertible，且 IA=A=AI。'}, {clause:'Inverse',question:'每個 element 的 inverse 仍在 set？',pass:true,evidence:'set 的 membership 本來就要求 invertible；A⁻¹ 也 invertible。'} ]},
];

@Component({selector:'app-algebra-v3-guided-audit',standalone:true,template:`
  <article class="algebra-v3-lesson alg-ch6-lesson">
    <header class="hero"><p class="eyebrow">Abstract Algebra · 6.2</p><h2>Group detector 檢查 system，不看物件長相</h2><p class="lede">同一份 contract 可以 audit numbers、matrices、shuffles 或 symmetries。每一項都要有 witness 或 general reason；熟悉的名字、漂亮的 table、前三項成功都不能替最後一項作答。</p></header>
    <section class="prediction"><p class="kicker">先找最小故障</p><h3>所有 2×2 matrices 在 multiplication 下是一個 group 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不是</button><button type="button" (click)="prediction.set(true)">是</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'zero matrix 與其他 singular matrices 沒有 multiplicative inverse。':'對。前三條可通過，但 inverse wire 在 singular matrices 上失敗。'}}</p>}</section>
    <section class="lab">
      <div class="lab-heading"><div><p class="kicker">Guided group audit</p><h3>逐項執行 tests，不預先亮出 verdict</h3></div><p>第一個 failure 已足以判定 not a group；仍可繼續 audit，了解這個 system 保留哪些能力，而不是把它只貼上「錯」的標籤。</p></div>
      <div class="system-picker" role="group" aria-label="選擇要 audit 的 system">@for(system of systems;track system.id){<button type="button" [attr.aria-pressed]="selected()===system.id" (click)="selectSystem(system.id)"><strong>{{system.label}}</strong><span>{{system.note}}</span></button>}</div>
      <div class="control-row"><button type="button" class="primary" (click)="runNext()" [disabled]="revealedCount()>=4">執行下一項 test</button><button type="button" (click)="runAll()" [disabled]="revealedCount()>=4">執行全部</button><button type="button" (click)="revealedCount.set(0)" [disabled]="revealedCount()===0">重設 audit</button></div>
      <div class="stage audit-layout">
        <div class="audit-list">@for(test of current().tests;track test.clause;let index=$index){<div class="audit-item" [class.passed]="index<revealedCount()&&test.pass" [class.failed]="index<revealedCount()&&!test.pass"><span class="index">{{index+1}}</span><div><strong>{{test.clause}}</strong><span>{{test.question}}</span></div><b class="status">{{index>=revealedCount()?'○ PENDING':test.pass?'✓ PASS':'× FAIL'}}</b></div>}</div>
        <section class="audit-console" aria-live="polite"><h4>{{current().label}} · AUDIT CONSOLE</h4><p>{{consoleReading()}}</p><div class="audit-verdict" [class.fail]="hasRevealedFailure()">{{auditVerdict()}}</div></section>
      </div>
    </section>
    <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>same four tests</span><i>→</i><span>different concrete evidence</span><i>→</i><span>group?</span></div><p><strong>抽象的價值是讓表面不同的 worlds 接受同一份責任。</strong>group verdict 屬於完整的 set + operation system；限制或擴大 set 都可能改變哪條 contract wire 通過。</p></aside>
    <section class="transfer"><p class="kicker">有限 operation table</p><h3>若 table 中找不到 left/right identity row and column，可以直接判定不是 group 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">可以</button><button type="button" (click)="transfer.set(false)">不可以</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="!transfer()">{{transfer()?'對。identity 是必要 wire；一項確定 failure 已足以拒絕 group verdict。':'沒有 universal no-op 已違反必要條件，不必等其他 tests。'}}</p>}</section>
    <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Verification 的責任不完全相同</summary><div>有限 table 可逐 cell 檢查 closure，找 identity row/column，再為每個 element 找 inverse。associativity 涉及 triples，通常要檢查所有 triples 或指出 operation 繼承自已知 associative structure。</div></details><details><summary>Proof Lab：invertible matrices 為何 closed？</summary><div>若 A、B invertible，候選 inverse 是 B⁻¹A⁻¹。由 associativity，(AB)(B⁻¹A⁻¹)=A(BB⁻¹)A⁻¹=AIA⁻¹=I；另一側同理。因此 AB 仍 invertible。</div></details></section>
  </article>
`})
export class AlgebraV3GuidedAuditComponent{
 readonly prediction=signal<boolean|null>(null);readonly transfer=signal<boolean|null>(null);readonly selected=signal<SystemId>('allMatrices');readonly revealedCount=signal(0);readonly systems=SYSTEMS;
 readonly current=computed(()=>SYSTEMS.find(system=>system.id===this.selected())??SYSTEMS[0]); readonly hasRevealedFailure=computed(()=>this.current().tests.slice(0,this.revealedCount()).some(test=>!test.pass));
 readonly consoleReading=computed(()=>this.revealedCount()===0?'尚未執行 test；不要從 system 名稱猜結論。':this.current().tests[this.revealedCount()-1].evidence);
 readonly auditVerdict=computed(()=>{if(this.hasRevealedFailure())return '× NOT A GROUP — 已有一條 necessary contract wire 失敗';if(this.revealedCount()<4)return `○ AUDIT INCOMPLETE — ${4-this.revealedCount()} 項尚未檢查`;return '✓ GROUP — 四條 contract wires 都有證據';});
 selectSystem(id:SystemId){this.selected.set(id);this.revealedCount.set(0);} runNext(){this.revealedCount.update(count=>Math.min(4,count+1));} runAll(){this.revealedCount.set(4);}
}
