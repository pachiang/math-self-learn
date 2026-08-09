import { Component, computed, signal } from '@angular/core';

type SetId = 'Z' | 'even' | 'Qstar';
type OperationId = 'add' | 'multiply';

interface SystemEvidence { closed: boolean; reason: string; witness: string[]; conclusion: string; }

const SETS: Record<SetId, { label: string; description: string }> = {
  Z: { label: 'ℤ', description: 'all integers' },
  even: { label: '2ℤ', description: 'even integers' },
  Qstar: { label: 'ℚ*', description: 'nonzero rationals' },
};
const OPERATIONS: Record<OperationId, { symbol: string; label: string }> = {
  add: { symbol: '+', label: 'addition' }, multiply: { symbol: '×', label: 'multiplication' },
};
const EVIDENCE: Record<SetId, Record<OperationId, SystemEvidence>> = {
  Z: {
    add: { closed: true, reason: '任意 integers a、b 的 sum a+b 仍是 integer。', witness: ['−3', '+', '5', '=', '2 ∈ ℤ'], conclusion: 'general reason covers every integer pair' },
    multiply: { closed: true, reason: '任意 integers a、b 的 product ab 仍是 integer。', witness: ['−3', '×', '5', '=', '−15 ∈ ℤ'], conclusion: 'general reason covers every integer pair' },
  },
  even: {
    add: { closed: true, reason: 'a=2m、b=2n 時，a+b=2(m+n)，仍是 even。', witness: ['−4', '+', '6', '=', '2 ∈ 2ℤ'], conclusion: 'factor 2 survives for arbitrary m,n' },
    multiply: { closed: true, reason: 'a=2m、b=2n 時，ab=4mn=2(2mn)，仍是 even。', witness: ['−4', '×', '6', '=', '−24 ∈ 2ℤ'], conclusion: 'factor 2 survives for arbitrary m,n' },
  },
  Qstar: {
    add: { closed: false, reason: 'nonzero inputs 可能相加成 0，而 0 已被 set boundary 排除。', witness: ['1', '+', '−1', '=', '0 ∉ ℚ*'], conclusion: 'one escape pair refutes closure' },
    multiply: { closed: true, reason: '兩個 nonzero rationals 的 product 仍是 nonzero rational。', witness: ['2/3', '×', '3/5', '=', '2/5 ∈ ℚ*'], conclusion: 'nonzero numerators stay nonzero' },
  },
};

@Component({
  selector: 'app-algebra-v3-system-builder', standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch5-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 5.2</p><h2>Set 與 operation 必須綁在一起判斷</h2><p class="lede">「這些 numbers closed 嗎？」少了一半問題。closure 屬於一個 system：underlying set 決定邊界，operation 決定 inputs 如何產生 output；換掉任一 slot，命題就換了。</p></header>

      <section class="prediction"><p class="kicker">先補完整問題</p><h3>只說「integers ℤ 對自己 closed」，已經是完整數學敘述嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不完整</button><button type="button" (click)="prediction.set(true)">完整</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '必須指定 operation。ℤ 對 +、× closed，對 division 卻不是。' : '對。set 沒有自行產生 outputs；要先指定 operation。' }}</p> }</section>

      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Two-slot closure system</p><h3>只換一個 slot，觀察 universal claim 如何改變</h3></div><p>這裡刻意只掃 closure，不提前打開第 6 章的四條 group contract。每個 closed verdict 都附 general reason；每個 failure 都附 explicit escape pair。</p></div>
        <div class="slot-builder">
          <section class="system-slot"><h4>SET SLOT</h4><div class="choice-row">@for (set of setIds; track set) { <button type="button" [attr.aria-pressed]="selectedSet() === set" (click)="selectedSet.set(set)"><strong>{{ sets[set].label }}</strong> · {{ sets[set].description }}</button> }</div></section>
          <i class="slot-link" aria-hidden="true">+</i>
          <section class="system-slot"><h4>OPERATION SLOT</h4><div class="choice-row">@for (operation of operationIds; track operation) { <button type="button" [attr.aria-pressed]="selectedOperation() === operation" (click)="selectedOperation.set(operation)"><strong>{{ operations[operation].symbol }}</strong> · {{ operations[operation].label }}</button> }</div></section>
        </div>

        <div class="stage system-card" aria-live="polite">
          <div class="system-name">({{ sets[selectedSet()].label }}, {{ operations[selectedOperation()].symbol }})</div>
          <div class="witness-row" [class.escape]="!current().closed">@for (piece of current().witness; track $index) { @if ($index < current().witness.length - 1) { <span>{{ piece }}</span><i>→</i> } @else { <strong>{{ piece }}</strong> } }</div>
          <div class="general-reason"><strong>{{ current().closed ? 'GENERAL REASON' : 'ESCAPE REASON' }}</strong><br />{{ current().reason }}</div>
          <div class="world-verdict">{{ current().closed ? '✓ CLOSED — every legal pair stays in this set' : '× NOT CLOSED — a legal pair escapes this set' }}</div>
        </div>
        <p class="readout"><strong>{{ current().conclusion }}</strong><br />set 名稱沒有變成答案；它和 operation symbol 必須一起保留。</p>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>set boundary</span><i>+</i><span>operation machine</span><i>=</i><span>one structure</span></div><p><strong>代數結構不是一袋 objects；它是 objects 與操作規則的配對。</strong>同一 set 換 operation，或同一 operation 換 set，closure statement 都會跟著改變。</p></aside>

      <section class="transfer"><p class="kicker">判斷語句是否完整</p><h3>「所有 2×2 matrices 是一個群」這句話還缺 operation 與 set restriction 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">還缺</button><button type="button" (click)="transfer.set(false)">不缺</button></div>@if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。要指定例如 multiplication，且若要 inverse，通常還要限制為 invertible matrices。完整 group detector 留到下一章。' : 'matrix 的 operation 可以是 addition 或 multiplication；underlying set 也可能包含或排除 singular matrices。' }}</p> }</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>正式記號：ordered pair (G,◇)</summary><div>常把一個單一 operation 的 algebraic structure 寫成 (G,◇)，提醒讀者 underlying set G 與 operation ◇ 都是資料。同一 G 搭配不同 ◇ 是不同 structures。</div></details><details><summary>為什麼 ℚ* 對 + 失敗、對 × 成功？</summary><div>boundary 排除了 0。addition 有合法 pair 1、−1 會撞到 0；multiplication 中兩個 nonzero rationals 不可能相乘成 0。因此差異來自 operation 與 boundary 的交互，不是 ℚ* 本身「好」或「壞」。</div></details></section>
    </article>
  `,
})
export class AlgebraV3SystemBuilderComponent {
  readonly prediction = signal<boolean | null>(null); readonly transfer = signal<boolean | null>(null);
  readonly selectedSet = signal<SetId>('Qstar'); readonly selectedOperation = signal<OperationId>('add');
  readonly sets = SETS; readonly operations = OPERATIONS; readonly setIds: readonly SetId[] = ['Z', 'even', 'Qstar']; readonly operationIds: readonly OperationId[] = ['add', 'multiply'];
  readonly current = computed(() => EVIDENCE[this.selectedSet()][this.selectedOperation()]);
}
