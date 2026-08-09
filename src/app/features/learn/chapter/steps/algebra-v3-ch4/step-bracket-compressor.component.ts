import { Component, computed, signal } from '@angular/core';

type Grouping = 'left' | 'right';

@Component({
  selector: 'app-algebra-v3-bracket-compressor',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch4-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 4.1</p>
        <h2>括號只決定先壓縮哪一段</h2>
        <p class="lede">三個 actions 的順序固定時，括號只是 packaging instruction：先把前兩步做成一個 composite，或先把後兩步做成一個 composite。raw path 本身不應被改寫。</p>
      </header>

      <section class="prediction">
        <p class="kicker">先分清 regroup 與 reorder</p>
        <h3>把 (f·g)·h 改寫成 f·(g·h)，有把 g 與 h 的執行順序交換嗎？</h3>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">沒有</button><button type="button" (click)="prediction.set(true)">有</button></div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '括號移動不會讓任何 chip 跨過另一張 chip；f、g、h 仍照原順序出現。' : '對。括號只框出先計算的 chunk，action tape 沒有重排。' }}</p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Bracket compressor</p><h3>固定 action tape，只移動 chunk frame</h3></div>
          <p>input x 可拖動；兩種 grouping 都顯示同一條逐步 state path。這讓「中間 package 不同、final effect 相同」可直接檢查。</p>
        </div>

        <div class="bracket-toggle" role="group" aria-label="選擇先壓縮的 action 區段">
          <button type="button" [attr.aria-pressed]="grouping() === 'left'" (click)="grouping.set('left')">先壓前兩步 (f·g)</button>
          <button type="button" [attr.aria-pressed]="grouping() === 'right'" (click)="grouping.set('right')">先壓後兩步 (g·h)</button>
        </div>
        <label class="input-control"><span>input x</span><input type="range" min="-3" max="5" step="1" [value]="input()" (input)="setInput($event)" /><strong>{{ input() }}</strong></label>

        <div class="stage">
          <div class="action-tape">
            <div class="chunk-brace" [class.left]="grouping() === 'left'" [class.right]="grouping() === 'right'"><span>{{ chunkLabel() }}</span></div>
            <div class="action-card first" [class.chunked]="grouping() === 'left'"><strong>f · +1</strong><span>first action</span></div>
            <div class="action-card second" [class.chunked]="true"><strong>g · ×2</strong><span>second action</span></div>
            <div class="action-card third" [class.chunked]="grouping() === 'right'"><strong>h · square</strong><span>third action</span></div>
          </div>
          <div class="raw-path" aria-label="不受括號影響的逐步 state path">
            <b>{{ path()[0] }}</b><i>+1 →</i><b>{{ path()[1] }}</b><i>×2 →</i><b>{{ path()[2] }}</b><i>square →</i><b>{{ path()[3] }}</b>
          </div>
        </div>

        <div class="readout chunk-result" aria-live="polite">
          <span>{{ groupedExpression() }}</span><i>→</i><strong>final output {{ path()[3] }}</strong>
          <small>｜ordered tape 始終是 +1 → ×2 → square</small>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>same ordered tape</span><i>+</i><span>different chunks</span><i>⇒</i><span>same effect</span></div>
        <p><strong>Associativity 允許重新分組，不允許交換 actions。</strong>變的是哪一段先被壓成 composite；保持不變的是 action order、每個 state 經過的 raw path，以及最後總效果。</p>
      </aside>

      <section class="transfer">
        <p class="kicker">不交換但可重新分組</p>
        <h3>字串串接中，(「群」+「論」)+「課」與「群」+(「論」+「課」) 都得到「群論課」嗎？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set(true)">是</button><button type="button" (click)="transfer.set(false)">否</button></div>
        @if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。字串順序完全不動，只先完成不同 substring。' : '兩種 grouping 都保留「群→論→課」，所以 output 相同。' }}</p> }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details><summary>正式條件：associative law</summary><div>對 operation 中的每個 a、b、c，都要求 (a·b)·c=a·(b·c)。量詞是「所有 triples」；幾個成功例子只能建立直覺，不能完成 general proof。</div></details>
        <details><summary>為什麼長 action chain 可以省略括號？</summary><div>associativity 允許一次移動一組括號，而每一步都不交換 elements。有限長 chain 的任何 parenthesization 因此能逐步對齊到同一種標準 grouping。</div></details>
      </section>
    </article>
  `,
})
export class AlgebraV3BracketCompressorComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly grouping = signal<Grouping>('left');
  readonly input = signal(2);
  readonly path = computed(() => {
    const x = this.input();
    return [x, x + 1, (x + 1) * 2, ((x + 1) * 2) ** 2];
  });
  readonly chunkLabel = computed(() => this.grouping() === 'left' ? '先打包 f → g' : '先打包 g → h');
  readonly groupedExpression = computed(() => this.grouping() === 'left' ? '((+1 → ×2) → square)' : '(+1 → (×2 → square))');
  setInput(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) this.input.set(Number(input.value));
  }
}
