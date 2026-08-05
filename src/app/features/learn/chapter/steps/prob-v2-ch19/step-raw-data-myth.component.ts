import { Component, computed, signal } from '@angular/core';
import { draw, histogram, standardizedMean } from './clt-math';

@Component({
  selector: 'app-prob-v2-raw-data-myth',
  standalone: true,
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.5</p>
        <h2>收集更多 skewed data，不會把 raw-data histogram 變成 Normal</h2>
        <p class="lede">
          CLT 對「每組 n 筆資料算出的 standardized sum」說話。把所有 raw Exponential observations
          堆在一起，無論收幾萬筆，仍會更清楚地顯示原本的 right-skewed source。
        </p>
      </header>
      <section class="scene clt-prediction">
        <div>
          <p class="eyebrow">先辨認 random object</p>
          <h3>收集 10,000 筆等待時間後，哪一張圖會接近 Normal？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.selected]="answer() === 'raw'" (click)="answer.set('raw')">
            10,000 個 raw waits</button
          ><button
            type="button"
            [class.selected]="answer() === 'means'"
            (click)="answer.set('means')"
          >
            許多組 sample means
          </button>
        </div>
        @if (answer()) {
          <p class="feedback">
            @if (answer() === 'means') {
              <strong>對。每一組先相加／平均，才是 CLT 作用的 random object。</strong>
            } @else {
              更多 raw data 只會更忠實描出 Exponential source，不會改寫 source law。
            }
          </p>
        }
      </section>
      <section class="clt-controls">
        <label
          >Raw observations / group size<input
            type="range"
            min="2"
            max="200"
            step="2"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="myth-board">
        <article>
          <span>RAW DATA HISTOGRAM</span>
          <div class="raw-skew">
            @for (bar of rawBars(); track bar.index) {
              <i [style.height.%]="bar.height"></i>
            }
          </div>
          <strong>stays Exponential</strong>
          <p>{{ n() * 8 }} individual waits</p>
        </article>
        <i class="not-equal">≠</i>
        <article>
          <span>STANDARDIZED MEAN HISTOGRAM</span>
          <div class="mean-bell">
            @for (bar of meanBars(); track bar.index) {
              <i [style.height.%]="bar.height"></i>
            }
          </div>
          <strong>becomes Normal-like</strong>
          <p>280 groups × {{ n() }} waits</p>
        </article>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>raw Xᵢ law stays fixed</span><i>while</i><strong>sum law changes with n</strong>
        </div>
        <div>
          <span class="card-label">CLT does not make all data Normal</span>
          <p>
            <strong
              >先指出 histogram 的每一個點代表 raw observation 還是一整組的 statistic。</strong
            >
          </p>
        </div>
      </aside>
    </article>
  `,
})
export class ProbV2RawDataMythComponent {
  readonly answer = signal<'raw' | 'means' | null>(null);
  readonly n = signal(20);
  readonly rawBars = computed(() => {
    const values = Array.from({ length: this.n() * 8 }, (_, i) =>
      Math.min(5, draw('exponential', i * 37)),
    );
    return histogram(values, 35, 0, 5);
  });
  readonly meanBars = computed(() =>
    histogram(
      Array.from({ length: 280 }, (_, w) => standardizedMean('exponential', w, this.n())),
      35,
    ),
  );
}
