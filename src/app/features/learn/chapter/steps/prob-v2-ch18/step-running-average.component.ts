import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { bernoulli } from './lln-math';

@Component({
  selector: 'app-prob-v2-running-average',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.1</p>
        <h2>平均值的穩定來自稀釋，不是每一步都往中心走</h2>
        <p class="lede">
          <strong>樣本平均（sample mean）</strong>把前 n 個 observations
          壓成一個位置。新資料仍會讓它上下晃動，但每一筆只占 1/n，因此後期單步影響逐漸變小。
        </p>
      </header>
      <section class="scene lln-prediction">
        <div>
          <p class="eyebrow">先判斷 · one more observation</p>
          <h3>已看過 10 筆與已看過 500 筆時，再加入一個 1，哪一次更能拉動平均？</h3>
        </div>
        <div class="choice-row">
          <button
            type="button"
            [class.selected]="prediction() === 'late'"
            (click)="prediction.set('late')"
          >
            500 筆後</button
          ><button
            type="button"
            [class.selected]="prediction() === 'early'"
            (click)="prediction.set('early')"
          >
            10 筆後
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'early') {
              <strong>對。相同新 observation 在小樣本中占更大份量。</strong>
            } @else {
              到第 501 筆時，新值只占 1/501，拉動幅度很有限。
            }
          </p>
        }
      </section>
      <section class="lln-controls">
        <label
          >Reveal observations n<input
            type="range"
            min="2"
            max="500"
            step="1"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="running-board">
        <svg viewBox="0 0 1000 330" role="img" aria-label="樣本平均隨觀察數變化">
          <line x1="0" [attr.y1]="targetY" x2="1000" [attr.y2]="targetY" class="target-line" />
          <polyline [attr.points]="path()" class="average-path" />
          <circle [attr.cx]="1000" [attr.cy]="currentY()" r="7" />
          <text x="12" [attr.y]="targetY - 10">μ = 0.60</text>
        </svg>
        <div class="running-readout">
          <div>
            <span>current average</span><strong>{{ currentAverage().toFixed(3) }}</strong>
          </div>
          <div>
            <span>last step size</span><strong>{{ lastMove().toFixed(4) }}</strong>
          </div>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>new value weight</span><i>= 1/n</i><strong>old noise gets diluted</strong>
        </div>
        <div>
          <span class="card-label">Convergence can wobble</span>
          <p><strong>LLN 不要求每一步更接近 μ；它說大 n 時，仍離很遠的 worlds 會變少。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>更新公式：為何單步影響縮成 1/n？</summary>
        <div class="lln-formulas">
          <app-math e="\\bar X_n=\\bar X_{n-1}+\\frac{X_n-\\bar X_{n-1}}{n}" />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2RunningAverageComponent {
  readonly prediction = signal<'late' | 'early' | null>(null);
  readonly n = signal(80);
  readonly targetY = 330 * (1 - 0.6);
  readonly averages = computed(() => {
    let sum = 0;
    return Array.from({ length: this.n() }, (_, i) => {
      sum += bernoulli(i * 97, 0.6);
      return sum / (i + 1);
    });
  });
  readonly currentAverage = computed(() => this.averages().at(-1) ?? 0);
  readonly currentY = computed(() => 330 * (1 - this.currentAverage()));
  readonly lastMove = computed(() => {
    const values = this.averages();
    return values.length < 2 ? 0 : Math.abs(values.at(-1)! - values.at(-2)!);
  });
  readonly path = computed(() =>
    this.averages()
      .map(
        (value, i) =>
          ((i / (this.n() - 1)) * 1000).toFixed(1) + ',' + (330 * (1 - value)).toFixed(1),
      )
      .join(' '),
  );
  readonly reading = computed(() =>
    this.n() < 30
      ? '早期每筆資料都能明顯改變平均，路徑自然劇烈。'
      : this.lastMove() < 0.01
        ? '路徑仍可能換方向，但單筆 observation 已很難大幅拉動它。'
        : '這一步造成可見晃動；LLN 從不承諾單調靠近。',
  );
}
