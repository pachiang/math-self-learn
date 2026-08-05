import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-sqrt-n-microscope',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.1</p>
        <h2>LLN 把 error cloud 壓扁；CLT 用 √n 顯微鏡把它重新放大</h2>
        <p class="lede">
          X̄ₙ−μ 的典型寬度是 σ/√n。<strong>中央極限定理（Central Limit Theorem, CLT）</strong>乘回
          √n/σ，抵消正在縮小的尺度，再問放大後的 shape 走向哪裡。
        </p>
      </header>
      <section class="scene clt-prediction">
        <div>
          <p class="eyebrow">先預測 · camera scale</p>
          <h3>n 變 100 倍，average error 約縮成 1/10；要保持畫面同寬，顯微鏡應放大幾倍？</h3>
        </div>
        <div class="choice-row">
          <button
            type="button"
            [class.selected]="prediction() === 100"
            (click)="prediction.set(100)"
          >
            100×</button
          ><button
            type="button"
            [class.selected]="prediction() === 10"
            (click)="prediction.set(10)"
          >
            10×
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 10) {
              <strong>對。Error 按 1/√n 縮，所以鏡頭按 √n 放大。</strong>
            } @else {
              放大 n 倍會過度補償；自然尺度來自 standard deviation 的 √n law。
            }
          </p>
        }
      </section>
      <section class="clt-controls">
        <label
          >Sample size n<input
            type="range"
            min="4"
            max="400"
            step="4"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="microscope-board">
        <div class="original-cloud">
          <span>ORIGINAL ERROR SCALE</span><i [style.width.%]="rawWidth()"></i><b>μ</b
          ><strong>width σ/√n = {{ rawWidthNumber().toFixed(3) }}σ</strong>
        </div>
        <div class="microscope-lens">
          <span>magnify</span><strong>× √{{ n() }} = {{ sqrtN().toFixed(1) }}</strong
          ><i>⌕</i>
        </div>
        <div class="magnified-cloud">
          <span>STANDARDIZED ERROR</span><i></i><b>0</b><strong>width restored to 1</strong>
        </div>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>error shrinks ÷√n</span><i>then zoom ×√n</i><strong>shape remains visible</strong>
        </div>
        <div>
          <span class="card-label">CLT is a microscope theorem</span>
          <p>
            <strong
              >不放大只會看見一個 point；放大太多則 cloud 逃出畫面。√n 是剛好抵消的尺度。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>標準化層：顯微鏡裡真正看的變數</summary>
        <div class="clt-formulas">
          <app-math
            e="Z_n=\\frac{\\sqrt n(\\bar X_n-\\mu)}{\\sigma}=\\frac{S_n-n\\mu}{\\sigma\\sqrt n}"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2SqrtNMicroscopeComponent {
  readonly prediction = signal<number | null>(null);
  readonly n = signal(25);
  readonly sqrtN = computed(() => Math.sqrt(this.n()));
  readonly rawWidthNumber = computed(() => 1 / this.sqrtN());
  readonly rawWidth = computed(() => Math.max(2, this.rawWidthNumber() * 100));
}
