import { Component, computed, signal } from '@angular/core';

type SetId = 'positive' | 'even' | 'odd';
type OperationId = 'add' | 'subtract' | 'multiply';

const SET_LABEL: Record<SetId, string> = { positive: 'positive integers ℤ₊', even: 'even integers 2ℤ', odd: 'odd integers 2ℤ+1' };
const SET_VALUES: Record<SetId, readonly number[]> = {
  positive: [1, 2, 3, 4, 5, 6, 7, 8],
  even: [-6, -4, -2, 0, 2, 4, 6],
  odd: [-5, -3, -1, 1, 3, 5, 7],
};
const OP_SYMBOL: Record<OperationId, string> = { add: '+', subtract: '−', multiply: '×' };

@Component({
  selector: 'app-algebra-v3-set-boundary-machine',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch5-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 5.1</p>
        <h2>Closure 問 output 有沒有掉出這個世界</h2>
        <p class="lede">closure（封閉性）不是圖形畫成封閉形狀，也不是數值不能變大。它問的是：拿 set 內兩個合法 inputs 做指定 operation，output 是否仍屬於同一個 set。</p>
      </header>

      <section class="prediction">
        <p class="kicker">先找一個 escape</p><h3>positive integers 在 subtraction 下 closed 嗎？</h3>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不 closed</button><button type="button" (click)="prediction.set(true)">closed</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '2−5=−3，兩個 inputs 都合法，output 卻掉出 positive integers。' : '對。一個合法 input pair 的 escape 已足以推翻 universal closure claim。' }}</p> }
      </section>

      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Set-boundary machine</p><h3>固定世界邊界，實際計算一個 input pair</h3></div><p>set selector 只提供該 set 內的 elements，所以 inputs 永遠合法。你改變的只有 set、operation 與 pair；output membership 由規則即時計算。</p></div>

        <div class="machine-controls">
          <fieldset><legend>SET</legend><div class="choice-row">
            @for (set of sets; track set) { <button type="button" [attr.aria-pressed]="selectedSet() === set" (click)="selectSet(set)">{{ setLabel[set] }}</button> }
          </div></fieldset>
          <fieldset><legend>OPERATION</legend><div class="choice-row">
            @for (operation of operations; track operation) { <button type="button" [attr.aria-pressed]="selectedOperation() === operation" (click)="selectedOperation.set(operation)">{{ opSymbol[operation] }} {{ operation }}</button> }
          </div></fieldset>
          <div class="number-pair">
            <label>INPUT a<select [value]="a()" (change)="setOperand('a', $event)">@for (value of availableValues(); track value) { <option [value]="value" [selected]="value === a()">{{ value }}</option> }</select></label>
            <i>{{ opSymbol[selectedOperation()] }}</i>
            <label>INPUT b<select [value]="b()" (change)="setOperand('b', $event)">@for (value of availableValues(); track value) { <option [value]="value" [selected]="value === b()">{{ value }}</option> }</select></label>
          </div>
        </div>

        <div class="stage boundary-machine" aria-live="polite">
          <div class="set-boundary"><span>INSIDE · {{ setLabel[selectedSet()] }}</span><div class="input-tokens"><b>{{ a() }}</b><b>{{ b() }}</b></div></div>
          <div class="operation-gate"><span>OPERATION MACHINE</span><b>{{ opSymbol[selectedOperation()] }}</b><i aria-hidden="true">→</i></div>
          <div class="output-zone" [class.escape]="!outputInside()"><span class="output-token">{{ output() }}</span><strong>{{ outputInside() ? '✓ output 留在 set 內' : '× ESCAPE：output 在 set 外' }}</strong></div>
        </div>

        <div class="pair-ledger">
          <div><span>input membership</span><strong>✓ a,b 都合法</strong></div><div><span>computed output</span><strong>{{ a() }} {{ opSymbol[selectedOperation()] }} {{ b() }} = {{ output() }}</strong></div><div><span>this pair</span><strong>{{ outputInside() ? 'STAYS INSIDE' : 'ESCAPES' }}</strong></div>
        </div>
        <p class="readout">{{ evidenceReading() }}</p>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>inside input</span><i>◇</i><span>inside input</span><i>→</i><span>inside output?</span></div><p><strong>Closure 是 operation 對 world boundary 的 no-escape 承諾。</strong>一個 escape pair 就能判定不 closed；一個 stay-inside pair 只證明這次成功，尚未涵蓋其他 pairs。</p></aside>

      <section class="transfer"><p class="kicker">回到 actions</p><h3>所有平面 rotations 合成後仍是 rotation，因此 rotations 對 composition closed 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">是</button><button type="button" (click)="transfer.set(false)">否</button></div>@if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。轉角相加仍描述一個 rotation，不會合成出刪除或投影。' : 'rotation composition 的 output 仍在 rotation set 中。' }}</p> }</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>正式寫法：binary operation 與 closure</summary><div>若 ◇ 是 G 上的 binary operation，它承諾 ◇:G×G→G；也就是對所有 a,b∈G，a◇b∈G。教材有時把 closure 收進「binary operation」這個詞，本課仍把 no-escape 工作獨立畫出。</div></details><details><summary>Proof Lab：odd × odd 為何一定 odd？</summary><div>任取 odd a=2m+1、b=2n+1。ab=(2m+1)(2n+1)=2(2mn+m+n)+1，仍能寫成 2k+1，因此對任意 odd pair 都留在 odd integers。</div></details></section>
    </article>
  `,
})
export class AlgebraV3SetBoundaryMachineComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly selectedSet = signal<SetId>('positive');
  readonly selectedOperation = signal<OperationId>('subtract');
  readonly a = signal(2);
  readonly b = signal(5);
  readonly sets: readonly SetId[] = ['positive', 'even', 'odd'];
  readonly operations: readonly OperationId[] = ['add', 'subtract', 'multiply'];
  readonly setLabel = SET_LABEL;
  readonly opSymbol = OP_SYMBOL;
  readonly availableValues = computed(() => SET_VALUES[this.selectedSet()]);
  readonly output = computed(() => this.calculate(this.a(), this.b(), this.selectedOperation()));
  readonly outputInside = computed(() => this.belongs(this.output(), this.selectedSet()));
  readonly evidenceReading = computed(() => this.outputInside()
    ? `這一對 stays inside；它是 closure 的一份正面證據，但不是 universal proof。`
    : `${this.a()} ${OP_SYMBOL[this.selectedOperation()]} ${this.b()} = ${this.output()} 是 escape witness；closure 已被推翻。`);
  selectSet(set: SetId): void { const values = SET_VALUES[set]; this.selectedSet.set(set); this.a.set(values[1]); this.b.set(values.at(-2)!); }
  setOperand(which: 'a' | 'b', event: Event): void { const select = event.currentTarget; if (select instanceof HTMLSelectElement) (which === 'a' ? this.a : this.b).set(Number(select.value)); }
  private calculate(a: number, b: number, operation: OperationId): number { return operation === 'add' ? a + b : operation === 'subtract' ? a - b : a * b; }
  private belongs(value: number, set: SetId): boolean { return set === 'positive' ? Number.isInteger(value) && value > 0 : set === 'even' ? Number.isInteger(value) && value % 2 === 0 : Number.isInteger(value) && Math.abs(value % 2) === 1; }
}
