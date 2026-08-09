import { Component, computed, signal } from '@angular/core';

type Candidate='h03'|'h024'|'k02';

@Component({selector:'app-algebra-v3-subworld-boundary',standalone:true,template:`
<article class="algebra-v3-lesson alg-ch11-lesson">
  <header class="hero"><p class="eyebrow">Abstract Algebra · 11.1</p><h2>Subgroup 不是圈一塊：圈內必須能靠自己運轉</h2><p class="lede">Ambient group ℤ₆ 已經是一台完整機器。現在圈出一些 elements，只准使用同一個 addition operation；若合成或 undo 需要跑到圈外借 element，這個 subset 就不是 subgroup。</p></header>
  <section class="prediction"><p class="kicker">先預測</p><h3>ℤ₆ 中的 subset {{'{0,2}'}} 是 subgroup 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不是</button><button type="button" (click)="prediction.set(true)">是</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'試 2+2=4；4 沒被圈進來，而且 −2=4 也必須向圈外借。':'對。一個 escape witness 已足以推翻它。'}}</p>}</section>
  <section class="lab">
    <div class="lab-heading"><div><p class="kicker">Subworld boundary machine</p><h3>選兩個圈內 inputs，看 output 與 undo 留不留得住</h3></div><p>粗框表示候選 boundary；每個 node 同時用 INSIDE／OUTSIDE 文字標記，不只靠顏色。</p></div>
    <div class="candidate-picker" role="group" aria-label="選擇候選 subset"><button type="button" [attr.aria-pressed]="candidate()==='h03'" (click)="selectCandidate('h03')">H={{'{0,3}'}}</button><button type="button" [attr.aria-pressed]="candidate()==='h024'" (click)="selectCandidate('h024')">H={{'{0,2,4}'}}</button><button type="button" [attr.aria-pressed]="candidate()==='k02'" (click)="selectCandidate('k02')">K={{'{0,2}'}}</button></div>
    <div class="input-pickers"><div><span>選 a</span>@for(value of members();track value){<button type="button" [attr.aria-pressed]="a()===value" (click)="a.set(value)">{{value}}</button>}</div><div><span>選 b</span>@for(value of members();track value){<button type="button" [attr.aria-pressed]="b()===value" (click)="b.set(value)">{{value}}</button>}</div></div>
    <div class="stage subworld-layout">
      <div class="residue-world" aria-label="ℤ₆ 與候選 subset">
        @for(value of universe;track value){<div class="residue-node" [class.inside]="members().includes(value)" [class.active-input]="value===a()||value===b()" [class.active-output]="value===output()"><strong>{{value}}</strong><span>{{members().includes(value)?'INSIDE CANDIDATE':'OUTSIDE CANDIDATE'}}</span>@if(value===output()){<b>OUTPUT a+b</b>}</div>}
      </div>
      <section class="boundary-console" aria-live="polite"><p class="kicker">BOUNDARY READOUT</p><div class="operation-tape"><span>{{a()}}</span><i>+</i><span>{{b()}}</span><i>=</i><strong>{{output()}}</strong></div><div class="contract-line" [class.fail]="!outputInside()">{{outputInside()?'✓ COMPOSITION STAYS INSIDE':'× ESCAPE: COMPOSITION NEEDS AN OUTSIDE ELEMENT'}}</div><div class="contract-line" [class.fail]="!inverseInside()">{{inverseInside()?'✓ UNDO OF a IS INSIDE: −'+a()+' = '+inverseA():'× ESCAPE: −'+a()+' = '+inverseA()+' IS OUTSIDE'}}</div><div class="subgroup-verdict" [class.fail]="!candidateIsSubgroup()">{{candidateIsSubgroup()?'✓ SELF-CONTAINED SUBGROUP':'× ONLY A SUBSET · NOT SELF-CONTAINED'}}</div><p>{{candidateIsSubgroup()?'不管選哪兩個圈內 elements，sum 與 additive inverse 都留在 boundary 內。':'目前候選存在 escape edge；不必再替它補借圈外 element。'}}</p></section>
    </div>
  </section>
  <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>subset</span><i>+</i><span>no escape</span><i>→</i><span>subgroup</span></div><p><strong>Subgroup 是同一台機器裡的自給自足子機器。</strong>它沿用 ambient group 的 operation；identity、composition 與 undo 都必須在自己的 boundary 內完成。</p></aside>
  <section class="transfer"><p class="kicker">遷移</p><h3>Even integers 在 ℤ addition 中能自行運轉嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">能，是 subgroup</button><button type="button" (click)="transfer.set(false)">不能</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="!transfer()">{{transfer()?'對。0 是偶數，偶數相加與取負仍是偶數。':'它不需離開偶整數就能完成 additive group 的所有動作。'}}</p>}</section>
  <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Subgroup 的正式定義</summary><div>若 H⊆G，使用 G 的同一 operation 時 H 本身也形成 group，就寫 H≤G。Associativity 由 G 自動繼承，仍須確保 identity、inverse 與 closure 留在 H。</div></details><details><summary>為什麼不能換一套 operation？</summary><div>Subgroup 描述 ambient group 內部的 structure；若在同一 subset 上改用另一種 operation，那是在定義另一個 algebraic system，不是 G 的 subgroup。</div></details></section>
</article>`})
export class AlgebraV3SubworldBoundaryComponent{
  readonly universe=[0,1,2,3,4,5];readonly prediction=signal<boolean|null>(null);readonly transfer=signal<boolean|null>(null);readonly candidate=signal<Candidate>('k02');readonly a=signal(2);readonly b=signal(2);
  readonly members=computed(()=>({h03:[0,3],h024:[0,2,4],k02:[0,2]})[this.candidate()]);
  readonly output=computed(()=>(this.a()+this.b())%6);readonly inverseA=computed(()=>(6-this.a())%6);readonly outputInside=computed(()=>this.members().includes(this.output()));readonly inverseInside=computed(()=>this.members().includes(this.inverseA()));
  readonly candidateIsSubgroup=computed(()=>this.members().includes(0)&&this.members().every(x=>this.members().includes((6-x)%6))&&this.members().every(x=>this.members().every(y=>this.members().includes((x+y)%6))));
  selectCandidate(candidate:Candidate):void{this.candidate.set(candidate);const m=({h03:[0,3],h024:[0,2,4],k02:[0,2]})[candidate];this.a.set(m[m.length-1]);this.b.set(m[m.length-1]);}
}
