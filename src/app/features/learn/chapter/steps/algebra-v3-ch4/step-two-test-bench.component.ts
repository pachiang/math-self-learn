import { Component, computed, signal } from '@angular/core';

type OperationId = 'add' | 'subtract' | 'concat';

@Component({
  selector: 'app-algebra-v3-two-test-bench',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch4-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 4.2</p>
        <h2>重新分組與交換順序是兩道不同的測試</h2>
        <p class="lede">associative 問三個 operands 換括號後是否相同；commutative 問兩個 operands 換位置後是否相同。operation 可以只通過其中一項，不能用一個結果猜另一個。</p>
      </header>

      <section class="prediction">
        <p class="kicker">拆開兩個 yes/no 問題</p>
        <h3>字串串接不 commutative，因此它也一定不 associative。這個推論成立嗎？</h3>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不成立</button><button type="button" (click)="prediction.set(true)">成立</button></div>
        @if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '「群」+「論」與「論」+「群」不同；但兩種 grouping 都保留群→論→課，所以仍 associative。' : '對。reorder 失敗不會自動讓 regroup 失敗。' }}</p> }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Two-test bench</p><h3>同一個 operation，分別送進 regroup 與 reorder</h3></div>
          <p>兩張 test cards 使用不同數量的 inputs，也改變不同東西。紅綠之外，每張卡都以 SAME／DIFFERENT 文字回報結果。</p>
        </div>

        <div class="operation-toggle" role="group" aria-label="選擇 operation">
          <button type="button" [attr.aria-pressed]="operation() === 'add'" (click)="operation.set('add')">integer addition</button>
          <button type="button" [attr.aria-pressed]="operation() === 'subtract'" (click)="operation.set('subtract')">number subtraction</button>
          <button type="button" [attr.aria-pressed]="operation() === 'concat'" (click)="operation.set('concat')">string concatenation</button>
        </div>

        @if (operation() !== 'concat') {
          <div class="operand-controls" aria-label="調整數值 operands">
            <span>OPERANDS</span>
            <label>a <input type="number" min="-9" max="9" [value]="a()" (input)="setNumber('a', $event)" /></label>
            <label>b <input type="number" min="-9" max="9" [value]="b()" (input)="setNumber('b', $event)" /></label>
            <label>c <input type="number" min="-9" max="9" [value]="c()" (input)="setNumber('c', $event)" /></label>
          </div>
        } @else {
          <p class="readout">OPERANDS：a=「群」、b=「論」、c=「課」</p>
        }

        <div class="stage test-grid" aria-live="polite">
          <section class="property-test">
            <h4>TEST A · REGROUP</h4><p>順序 a→b→c 不動，只換括號</p>
            <div class="equation-comparison">
              <div><span>(a ◇ b) ◇ c</span><strong>{{ regroupLeft().expression }}</strong><b>= {{ regroupLeft().value }}</b></div>
              <i>vs.</i>
              <div><span>a ◇ (b ◇ c)</span><strong>{{ regroupRight().expression }}</strong><b>= {{ regroupRight().value }}</b></div>
            </div>
            <div class="property-verdict" [class.fail]="!regroupSame()">{{ regroupSame() ? '✓ SAME for this triple' : '× DIFFERENT — associativity 已被此反例推翻' }}</div>
          </section>

          <section class="property-test">
            <h4>TEST B · REORDER</h4><p>括號不相關，只交換 a、b</p>
            <div class="equation-comparison">
              <div><span>a ◇ b</span><strong>{{ reorderLeft().expression }}</strong><b>= {{ reorderLeft().value }}</b></div>
              <i>vs.</i>
              <div><span>b ◇ a</span><strong>{{ reorderRight().expression }}</strong><b>= {{ reorderRight().value }}</b></div>
            </div>
            <div class="property-verdict" [class.fail]="!reorderSame()">{{ reorderSame() ? '✓ SAME for this pair' : '× DIFFERENT — commutativity 已被此反例推翻' }}</div>
          </section>
        </div>

        <div class="truth-summary">
          <div><span>這次 regroup witness</span><strong>{{ regroupSame() ? 'SAME' : 'DIFFERENT' }}</strong></div>
          <div><span>這次 reorder witness</span><strong>{{ reorderSame() ? 'SAME' : 'DIFFERENT' }}</strong></div>
        </div>
        <p class="readout">{{ interpretation() }}</p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>(ab)c ? a(bc)</span><i>≠ question ≠</i><span>ab ? ba</span></div>
        <p><strong>括號問「怎麼分 chunk」；順序問「誰先誰後」。</strong>一個 counterexample 足以推翻對應性質；多個成功 samples 仍不能替代「對所有 inputs」的 proof。</p>
      </aside>

      <section class="transfer">
        <p class="kicker">典型分家案例</p><h3>function composition 可以 associative、但通常不 commutative 嗎？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set(true)">可以</button><button type="button" (click)="transfer.set(false)">不可以</button></div>
        @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。pipeline 可重新打包，但交換 functions 通常會換掉 output。' : '下一節會逐點看見：parenthesization 不改 path，reorder 才會。' }}</p> }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details><summary>兩條量詞敘述</summary><div>Associativity：對所有 triples a,b,c，有 (ab)c=a(bc)。Commutativity：對所有 pairs a,b，有 ab=ba。它們的 inputs 數不同、比較方式不同、反例也必須分開找。</div></details>
        <details><summary>operation table 能快速看出哪一條？</summary><div>table 沿 diagonal 對稱可直接顯示 ab=ba，因此可診斷 commutativity。associativity 涉及 triples 與 nested lookups；方格表面對稱不能代替 triple test。</div></details>
      </section>
    </article>
  `,
})
export class AlgebraV3TwoTestBenchComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly operation = signal<OperationId>('subtract');
  readonly a = signal(5);
  readonly b = signal(3);
  readonly c = signal(1);
  readonly regroupLeft = computed(() => this.regroup('left'));
  readonly regroupRight = computed(() => this.regroup('right'));
  readonly reorderLeft = computed(() => this.pair('left'));
  readonly reorderRight = computed(() => this.pair('right'));
  readonly regroupSame = computed(() => this.regroupLeft().value === this.regroupRight().value);
  readonly reorderSame = computed(() => this.reorderLeft().value === this.reorderRight().value);
  readonly interpretation = computed(() => {
    if (this.operation() === 'add') return 'Addition 對這些 tests 都是 SAME；general laws 仍需處理 arbitrary integers。';
    if (this.operation() === 'subtract') return 'Subtraction 在預設 witness 中兩項都 DIFFERENT；兩條性質各自被一個反例推翻。';
    return 'String concatenation 的 regroup 是 SAME、reorder 是 DIFFERENT：associative 不代表 commutative。';
  });

  setNumber(which: 'a' | 'b' | 'c', event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;
    const value = Number(input.value);
    ({ a: this.a, b: this.b, c: this.c })[which].set(value);
  }
  private combine(left: number | string, right: number | string): number | string {
    if (this.operation() === 'concat') return `${left}${right}`;
    return this.operation() === 'add' ? Number(left) + Number(right) : Number(left) - Number(right);
  }
  private symbols(): [number | string, number | string, number | string] {
    return this.operation() === 'concat' ? ['群', '論', '課'] : [this.a(), this.b(), this.c()];
  }
  private opSymbol(): string { return this.operation() === 'add' ? '+' : this.operation() === 'subtract' ? '−' : '+'; }
  private regroup(side: 'left' | 'right') {
    const [a, b, c] = this.symbols();
    const op = this.opSymbol();
    return side === 'left'
      ? { expression: `(${a}${op}${b})${op}${c}`, value: this.combine(this.combine(a, b), c) }
      : { expression: `${a}${op}(${b}${op}${c})`, value: this.combine(a, this.combine(b, c)) };
  }
  private pair(side: 'left' | 'right') {
    const [a, b] = this.symbols();
    const op = this.opSymbol();
    return side === 'left' ? { expression: `${a}${op}${b}`, value: this.combine(a, b) } : { expression: `${b}${op}${a}`, value: this.combine(b, a) };
  }
}
