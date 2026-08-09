import { Component, computed, signal } from '@angular/core';

type ClauseId = 'closure' | 'associativity' | 'identity' | 'inverse';
interface FailureStory { title: string; summary: string; example: string; lost: string; nodes: string[]; outside?: number; arrow: string; }
const CLAUSES: ReadonlyArray<{ id: ClauseId; label: string; job: string }> = [
  { id: 'closure', label: 'Closure', job: 'output 不掉出世界' }, { id: 'associativity', label: 'Associativity', job: '長鏈沒有括號歧義' }, { id: 'identity', label: 'Identity', job: '存在 universal standby' }, { id: 'inverse', label: 'Inverse', job: '每個 action 都能折返' },
];
const STORIES: Record<ClauseId, FailureStory> = {
  closure: { title: 'Composite 變成外來物', summary: '兩個合法 elements 經 operation 後，output 不再是可繼續使用的 element。', example: 'positive integers：2 − 5 = −3 ∉ ℤ₊', lost: '失去：無法保證 action chain 能一直在同一個 system 裡接續。', nodes: ['2','5','−3'], outside: 2, arrow: 'legal inputs → escaped output' },
  associativity: { title: '同一條 tape 出現兩個總效果', summary: '只改括號就換掉 output，長 sequence 沒有唯一 composite。', example: 'subtraction：(5−3)−1 = 1，但 5−(3−1) = 3', lost: '失去：不能安全省略括號，也不能把 action chunks 任意打包。', nodes: ['(ab)c','≠','a(bc)'], arrow: 'same order → bracket fork' },
  identity: { title: '世界裡沒有真正的停留', summary: '找不到一個 element 對所有 states 都不造成淨改變。', example: 'positive integers under +：需要 0，但 0 ∉ ℤ₊', lost: '失去：沒有 universal no-op，也沒有統一的 inverse target。', nodes: ['state','?','same state'], outside: 1, arrow: 'standby loop is missing' },
  inverse: { title: '有些路只能前進，不能回來', summary: 'action 壓掉或合併資訊後，不存在 whole-world return route。', example: 'sorting：ABC、BCA、CAB 都被送到 ABC', lost: '失去：不能 universal undo，也不能保證 cancellation。', nodes: ['source','action','output'], outside: 0, arrow: 'return arrow is broken' },
};
const STABLE: FailureStory = { title: '四條 wires 全部連接', summary: '每次合成都合法、長鏈無歧義、可以停留，而且每個 action 都能撤銷。', example: 'stable reversible action world', lost: '✓ GROUP CONTRACT ONLINE — 四項能力同時可依賴。', nodes: ['state','action','state'], arrow: 'forward ↔ return' };

@Component({ selector: 'app-algebra-v3-contract-wires', standalone: true, template: `
  <article class="algebra-v3-lesson alg-ch6-lesson">
    <header class="hero"><p class="eyebrow">Abstract Algebra · 6.1</p><h2>四條 axioms 各自阻止一種故障</h2><p class="lede">現在才把前五章收束成 group contract。四條不是名詞 checklist；每一條 wire 都替 action world 保住一種不同能力，其他三條無法代班。</p></header>
    <section class="prediction"><p class="kicker">先測試能否互相代替</p><h3>若 system closed、有 identity、每個 element 有 inverse，就可以跳過 associativity 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不可以</button><button type="button" (click)="prediction.set(true)">可以</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '如果括號會改變 output，三步以上的 action chain 仍沒有唯一總效果。' : '對。每條 wire 對應不同 failure mode，不能由其餘三條推出。' }}</p> }</section>
    <section class="lab">
      <div class="lab-heading"><div><p class="kicker">Contract wire board</p><h3>一次切斷一條 wire，看能力在哪裡失效</h3></div><p>按鈕直接控制 missing axiom。主舞台回放最小故障，不先要求背定義；全部接回後才得到完整 group contract。</p></div>
      <div class="contract-grid" role="group" aria-label="選擇要切斷的 group contract wire">@for (clause of clauses; track clause.id) { <button type="button" [attr.aria-pressed]="cutWire() === clause.id" (click)="cutWire.set(clause.id)"><strong>切斷 {{ clause.label }}</strong><span>{{ clause.job }}</span></button> }</div>
      <div class="control-row"><button type="button" class="primary" (click)="cutWire.set(null)" [attr.aria-pressed]="cutWire() === null">接回全部 wires</button></div>
      <div class="contract-ledger">@for (clause of clauses; track clause.id) { <div [class.cut]="cutWire() === clause.id"><span>{{ clause.label }}</span><strong>{{ cutWire() === clause.id ? '× CUT' : '✓ CONNECTED' }}</strong></div> }</div>
      <div class="stage failure-stage" aria-live="polite">
        <div class="machine-schematic"><div class="state-nodes">@for (node of story().nodes; track $index) { <b class="state-node" [class.outside]="story().outside === $index">{{ node }}</b> }</div><div class="machine-arrow" [class.broken]="cutWire() !== null">{{ story().arrow }}</div></div>
        <section class="failure-story"><h4>{{ story().title }}</h4><p>{{ story().summary }}</p><div class="failure-example">{{ story().example }}</div><div class="lost-capability">{{ story().lost }}</div></section>
      </div>
    </section>
    <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>stay legal</span><i>+</i><span>chunk safely</span><i>+</i><span>stand still</span><i>+</i><span>undo</span></div><p><strong>Group 是四種可靠能力同時在線的 action system。</strong>closure 保住世界邊界，associativity 保住長鏈唯一性，identity 提供 universal no-op，inverse 提供 whole-world return route。</p></aside>
    <section class="transfer"><p class="kicker">矩陣世界</p><h3>所有 invertible 2×2 matrices 在 multiplication 下能讓四條 wires 全部連接嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">能</button><button type="button" (click)="transfer.set(false)">不能</button></div>@if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。product 仍 invertible、multiplication associative、I 是 identity、每個 matrix 已有 inverse。' : '限制為 invertible 正是為了保住 closure 與 inverse；其餘兩條也成立。' }}</p> }</section>
    <section class="secondary"><p>SECONDARY LAYER</p><details><summary>正式 group definition</summary><div>Group 是 set G 與 binary operation ·，滿足 closure；對所有 a,b,c∈G 有 (ab)c=a(bc)；存在 e∈G 使 ea=a=ae；且每個 a∈G 都有 a⁻¹∈G 使 aa⁻¹=e=a⁻¹a。</div></details><details><summary>延伸地圖：semigroup、monoid</summary><div>只有 associative operation 的 system 常稱 semigroup；再有 identity 稱 monoid；再要求每個 element 有 inverse 才是 group。這些名字只用來定位 missing wires，不是本節記憶目標。</div></details></section>
  </article>
` })
export class AlgebraV3ContractWiresComponent {
  readonly prediction=signal<boolean|null>(null); readonly transfer=signal<boolean|null>(null); readonly cutWire=signal<ClauseId|null>('associativity'); readonly clauses=CLAUSES;
  readonly story=computed(()=>this.cutWire()===null?STABLE:STORIES[this.cutWire()!]);
}
