import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { normalCdf, normalPdf } from './clt-math';

@Component({
  selector: 'app-prob-v2-normal-approximation',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.7</p>
        <h2>CLT 把 sample-mean 問題搬到一把共用的 z 尺上</h2>
        <p class="lede">
          單筆處理時間 mean 10 分鐘、SD 3 分鐘，shape 未知。對 n 位顧客的 average，CLT 用 mean
          10、standard error 3/√n 的 Normal curve近似，讓 threshold probability 可由同一張 standard
          Normal map 讀取。
        </p>
      </header>
      <section class="clt-controls dual">
        <label
          >Customers n<input
            type="range"
            min="5"
            max="200"
            step="5"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        ><label
          >Average-time threshold<input
            type="range"
            min="9"
            max="12"
            step="0.1"
            [value]="threshold()"
            (input)="threshold.set(+$any($event).target.value)"
          /><strong>{{ threshold().toFixed(1) }}</strong></label
        >
      </section>
      <section class="approximation-board">
        <div class="approx-density">
          @for (bar of bars(); track bar.x) {
            <i [style.height.%]="bar.height" [class.tail]="bar.x >= z()"></i>
          }
          <b [style.left.%]="zPosition()"
            ><span>threshold z={{ z().toFixed(2) }}</span></b
          >
          <div><span>−4</span><span>standardized sample mean</span><span>4</span></div>
        </div>
        <div class="approx-pipeline">
          <div>
            <span>RAW THRESHOLD</span><strong>{{ threshold().toFixed(1) }} min</strong>
          </div>
          <i>subtract 10<br />divide {{ standardError().toFixed(3) }}</i>
          <div>
            <span>Z POSITION</span><strong>{{ z().toFixed(2) }}</strong>
          </div>
          <i>tail area</i>
          <div>
            <span>APPROX CHANCE</span><strong>{{ probabilityLabel() }}</strong>
          </div>
        </div>
        <p>{{ reading() }}</p>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>unknown source shape</span><i>large independent n</i
          ><strong>approximate mean with Normal</strong>
        </div>
        <div>
          <span class="card-label">Approximation carries conditions, not certainty</span>
          <p>
            <strong
              >CLT 提供 reusable scale 與 shape；它不會讓輸入假設、dependence 或有限 n
              誤差自動消失。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>計算層：standard error 與 tail</summary>
        <div class="clt-formulas">
          <app-math e="\\bar X_n\\approx N\\!\\left(10,\\frac{3^2}{n}\\right)" /><app-math
            e="z=\\frac{c-10}{3/\\sqrt n},\\qquad P(\\bar X_n>c)\\approx1-\\Phi(z)"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NormalApproximationComponent {
  readonly n = signal(40);
  readonly threshold = signal(10.5);
  readonly standardError = computed(() => 3 / Math.sqrt(this.n()));
  readonly z = computed(() => (this.threshold() - 10) / this.standardError());
  readonly zPosition = computed(() => Math.max(0, Math.min(100, ((this.z() + 4) / 8) * 100)));
  readonly probability = computed(() => 1 - normalCdf(this.z()));
  readonly probabilityLabel = computed(() => (this.probability() * 100).toFixed(1) + '%');
  readonly bars = computed(() => {
    const xs = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1);
    const vals = xs.map(normalPdf);
    const max = Math.max(...vals);
    return xs.map((x, i) => ({ x, height: (vals[i] / max) * 100 }));
  });
  readonly reading = computed(() =>
    this.n() < 20
      ? 'n is modest; if the source is strongly skewed, treat this approximation cautiously.'
      : 'The average has standard error ' +
        this.standardError().toFixed(3) +
        ' minutes, much narrower than individual SD 3.',
  );
}
