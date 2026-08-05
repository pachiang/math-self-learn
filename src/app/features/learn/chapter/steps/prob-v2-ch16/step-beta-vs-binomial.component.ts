import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { betaPdf } from './continuous-math';

@Component({
  selector: 'app-prob-v2-beta-vs-binomial',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.7</p>
        <h2>Binomial 讓 count 隨機；Beta 讓 unknown proportion 本身隨機</h2>
        <p class="lede">
          同一筆「10 次中 7 次 success」可以支援不同問題。先看橫軸：是下次實驗的 0…10 count，還是
          0…1 的 possible success chance p？
        </p>
      </header>
      <section class="model-question-switch" role="group" aria-label="切換資料重做或未知比例問題">
        <button type="button" [class.active]="lens() === 'count'" (click)="lens.set('count')">
          <span>REPEAT DATA</span><strong>下次會成功幾次？</strong></button
        ><button
          type="button"
          [class.active]="lens() === 'proportion'"
          (click)="lens.set('proportion')"
        >
          <span>UNKNOWN p</span><strong>真正 chance 可能是多少？</strong>
        </button>
      </section>
      <section class="model-identity-board">
        <div class="observed-tape">
          <span>OBSERVED · fixed data</span>
          @for (trial of trials; track $index) {
            <i [class.success]="trial">{{ trial ? '1' : '0' }}</i>
          }
          <strong>7 / 10</strong>
        </div>
        @if (lens() === 'count') {
          <div class="identity-chart discrete-chart">
            <span>Binomial output</span>
            @for (bar of binomialBars(); track bar.k) {
              <i [style.height.%]="bar.height"
                ><small>{{ bar.k }}</small></i
              >
            }
          </div>
          <div class="identity-readout">
            <span>RANDOM VARIABLE</span><strong>future success count X</strong><b>0, 1, …, 10</b>
            <p>這裡必須先指定一個 fixed p；示意圖暫用 p=0.7。</p>
          </div>
        } @else {
          <div class="identity-chart continuous-chart">
            <span>Beta output</span>
            @for (bar of betaBars(); track bar.x) {
              <i [style.height.%]="bar.height"></i>
            }
            <b>possible p: 0 ───────── 1</b>
          </div>
          <div class="identity-readout">
            <span>RANDOM VARIABLE</span><strong>unknown success chance p</strong
            ><b>any value in [0,1]</b>
            <p>
              示意使用 uniform starting weight 後得到 Beta(8,4)；它不是 observed fraction 0.7
              的同義詞。
            </p>
          </div>
        }
      </section>
      <aside class="insight-card">
        <div class="identity-core" aria-hidden="true">
          <span>given p → random count</span><i>≠</i><strong>given data → uncertain p</strong>
        </div>
        <div>
          <span class="card-label">先問橫軸是什麼，再辨認 distribution</span>
          <p>
            <strong
              >Binomial 與 Beta 可以在 Bayes update 中合作，但它們描述的 random object
              不同。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>預告層：為什麼 Beta 與 Binomial 常一起出現？</summary>
        <div class="continuous-formulas">
          <app-math e="p\\sim\\operatorname{Beta}(\\alpha,\\beta)" /><app-math
            e="X\\mid p\\sim\\operatorname{Binomial}(n,p)"
          /><app-math e="p\\mid X=k\\sim\\operatorname{Beta}(\\alpha+k,\\beta+n-k)" />
          <p>
            這稱為 <strong>conjugacy</strong>。本頁只用它標出兩個層級；如何解讀 prior 與 posterior
            留到 Bayes 課。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BetaVsBinomialComponent {
  readonly lens = signal<'count' | 'proportion'>('count');
  readonly trials = [true, true, false, true, true, false, true, true, false, true];
  readonly binomialBars = computed(() => {
    const probabilities = Array.from(
      { length: 11 },
      (_, k) => this.choose(10, k) * 0.7 ** k * 0.3 ** (10 - k),
    );
    const max = Math.max(...probabilities);
    return probabilities.map((probability, k) => ({ k, height: (probability / max) * 100 }));
  });
  readonly betaBars = computed(() => {
    const points = Array.from({ length: 60 }, (_, index) => (index + 0.5) / 60);
    const values = points.map((x) => betaPdf(x, 8, 4));
    const max = Math.max(...values);
    return points.map((x, index) => ({ x, height: (values[index] / max) * 100 }));
  });
  private choose(n: number, k: number): number {
    let value = 1;
    for (let index = 1; index <= k; index += 1) value = (value * (n - index + 1)) / index;
    return value;
  }
}
