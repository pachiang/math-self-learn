import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { CltSource, draw, histogram, standardizedMean } from './clt-math';

@Component({
  selector: 'app-prob-v2-source-to-sum',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.2</p>
        <h2>保留 source 的古怪外形，看看 standardized sums 如何換掉它</h2>
        <p class="lede">
          Bernoulli 是兩點、Uniform 是平的、Exponential 強烈右偏。CLT 的驚人之處不是 Normal 加
          Normal，而是許多<strong>非 Normal sources</strong> 的標準化總和也會逐步接近同一個 bell
          shape。
        </p>
      </header>
      <section class="source-picker">
        @for (item of sources; track item.key) {
          <button
            type="button"
            [class.active]="source() === item.key"
            (click)="source.set(item.key)"
          >
            <span>{{ item.label }}</span
            ><strong>{{ item.shape }}</strong>
          </button>
        }
      </section>
      <section class="clt-controls">
        <label
          >Terms per sum n<input
            type="range"
            min="1"
            max="200"
            step="1"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="source-sum-board">
        <div class="source-samples">
          <span>RAW SOURCE · first 40 draws</span>
          <div>
            @for (value of rawValues(); track $index) {
              <i [style.height.%]="rawHeight(value)"></i>
            }
          </div>
          <p>{{ currentSource().description }}</p>
        </div>
        <div class="sum-operation">
          <span>center</span><i>＋</i><span>add n</span><i>＋</i><span>scale √n</span>
        </div>
        <div class="clt-histogram">
          <span>320 STANDARDIZED SUMS</span>
          @for (bar of bars(); track bar.index) {
            <i [style.height.%]="bar.height"></i>
          }
          <svg viewBox="0 0 410 180" preserveAspectRatio="none">
            <polyline [attr.points]="normalCurve()" />
          </svg>
          <div><b>−4</b><b>0</b><b>4</b></div>
        </div>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>source can be discrete or skewed</span><i>→</i
          ><strong>standardized sum becomes Normal-like</strong>
        </div>
        <div>
          <span class="card-label">The output changes shape; the source does not</span>
          <p>
            <strong>CLT 描述 sums 的 distribution，不會把原始 observations 變成 Normal。</strong>
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>定理層：iid finite-variance CLT</summary>
        <div class="clt-formulas">
          <app-math
            e="X_i\\overset{\\text{iid}}\\sim(\\mu,\\sigma^2),\\quad 0<\\sigma^2<\\infty"
          /><app-math e="\\frac{S_n-n\\mu}{\\sigma\\sqrt n}\\xrightarrow{d}N(0,1)" />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2SourceToSumComponent {
  readonly source = signal<CltSource>('exponential');
  readonly n = signal(8);
  readonly sources = [
    {
      key: 'bernoulli' as const,
      label: 'Bernoulli',
      shape: 'two points',
      description: 'Raw values only visit 0 or 1.',
    },
    {
      key: 'uniform' as const,
      label: 'Uniform',
      shape: 'flat interval',
      description: 'Every equal interval carries equal weight.',
    },
    {
      key: 'exponential' as const,
      label: 'Exponential',
      shape: 'right skew',
      description: 'Most waits are short, with a long right tail.',
    },
  ];
  readonly currentSource = computed(() => this.sources.find((x) => x.key === this.source())!);
  readonly rawValues = computed(() =>
    Array.from({ length: 40 }, (_, i) => draw(this.source(), i * 71)),
  );
  readonly sums = computed(() =>
    Array.from({ length: 320 }, (_, world) => standardizedMean(this.source(), world, this.n())),
  );
  readonly bars = computed(() => histogram(this.sums()));
  readonly normalCurve = computed(() =>
    Array.from({ length: 81 }, (_, i) => {
      const x = -4 + i * 0.1;
      return ((i / 80) * 410).toFixed(1) + ',' + (175 - Math.exp((-x * x) / 2) * 160).toFixed(1);
    }).join(' '),
  );
  rawHeight(value: number): number {
    return Math.min(100, this.source() === 'exponential' ? (value / 4) * 100 : value * 100);
  }
}
