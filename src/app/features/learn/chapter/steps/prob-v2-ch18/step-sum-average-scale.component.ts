import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-sum-average-scale',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.4</p>
        <h2>Sum 的 noise 會長大；除以 n 後，average 的 noise 才縮小</h2>
        <p class="lede">
          加入更多 observations 時，總和 Sₙ 的 absolute spread 是 σ√n，並沒有消失。但平均 X̄ₙ 再除以
          n，使 spread 變成 σ/√n。穩定化來自這個 scale competition。
        </p>
      </header>
      <section class="scene lln-prediction">
        <div>
          <p class="eyebrow">先預測 · same data, two measurements</p>
          <h3>樣本數變四倍，sample mean 的 typical width 會變成原本多少？</h3>
        </div>
        <div class="choice-row">
          <button
            type="button"
            [class.selected]="prediction() === 'quarter'"
            (click)="prediction.set('quarter')"
          >
            1/4</button
          ><button
            type="button"
            [class.selected]="prediction() === 'half'"
            (click)="prediction.set('half')"
          >
            1/2
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'half') {
              <strong>對。Width 依 1/√n 縮放，n×4 才換來 width÷2。</strong>
            } @else {
              平均的 noise 不是 1/n；independent fluctuations 先以 √n 累積，再除以 n。
            }
          </p>
        }
      </section>
      <section class="lln-controls">
        <label
          >Sample size n<input
            type="range"
            min="1"
            max="400"
            step="1"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="scale-board">
        <div class="scale-row sum">
          <span>SUM Sₙ</span>
          <div>
            <i [style.width.%]="sumWidth()"></i><b>SD = √n = {{ sumSd().toFixed(1) }}</b>
          </div>
          <strong>grows</strong>
        </div>
        <div class="divide-machine"><span>same random sum</span><i>÷ n</i></div>
        <div class="scale-row average">
          <span>AVERAGE X̄ₙ</span>
          <div>
            <i [style.width.%]="averageWidth()"></i><b>SD = 1/√n = {{ averageSd().toFixed(3) }}</b>
          </div>
          <strong>shrinks</strong>
        </div>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>sum noise × √n</span><i>÷ n</i><strong>average noise ÷ √n</strong>
        </div>
        <div>
          <span class="card-label">The denominator wins</span>
          <p>
            <strong>資料變多不是讓每筆變安靜，而是讓 independent noise 的增長追不上 n。</strong>
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>Variance 層：independence 在哪裡被使用？</summary>
        <div class="lln-formulas">
          <app-math e="\\operatorname{Var}(S_n)=n\\sigma^2" /><app-math
            e="\\operatorname{Var}(\\bar X_n)=\\frac{\\sigma^2}{n}"
          />
          <p>
            第一式使用 covariance terms 為 0。若 observations 強烈同動，variance 不一定按 n 相加。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2SumAverageScaleComponent {
  readonly prediction = signal<'quarter' | 'half' | null>(null);
  readonly n = signal(25);
  readonly sumSd = computed(() => Math.sqrt(this.n()));
  readonly averageSd = computed(() => 1 / Math.sqrt(this.n()));
  readonly sumWidth = computed(() => Math.min(100, (this.sumSd() / 20) * 100));
  readonly averageWidth = computed(() => Math.max(2, this.averageSd() * 100));
}
