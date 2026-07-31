import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

interface Bar {
  k: number;
  probability: number;
  x: number;
}

@Component({
  selector: 'app-prob-v2-binomial-shape',
  standalone: true,
  imports: [KatexComponent, DecimalPipe],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.4</p>
        <h2>不要背 curve 長相；看 n 與 p 如何改造生成世界</h2>
        <p class="lede">
          p 把每一步推向 1 或 0，n 決定有多少次可以累積。PMF 的位置與 spread
          是這兩個機制的結果，不是另一組待背的圖形規則。
        </p>
      </header>

      <section class="binary-dual-control">
        <label
          >Number of trials n
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            [value]="trials()"
            (input)="trials.set(+$any($event).target.value)"
          />
          <strong>{{ trials() }}</strong>
        </label>
        <label
          >Success chance p
          <input
            type="range"
            min="5"
            max="95"
            step="5"
            [value]="probability()"
            (input)="probability.set(+$any($event).target.value)"
          />
          <strong>{{ probability() }}%</strong>
        </label>
      </section>

      <section class="shape-console">
        <div class="shape-heading">
          <div>
            <span class="card-label">SAME GENERATOR · NEW PARAMETERS</span>
            <h3>
              {{ trials() }} trials, each leaning
              {{ probability() >= 50 ? 'toward 1' : 'toward 0' }}
            </h3>
          </div>
          <div class="binary-segmented" role="group" aria-label="切換成功次數或成功比例">
            <button type="button" [class.active]="view() === 'count'" (click)="view.set('count')">
              Count X
            </button>
            <button
              type="button"
              [class.active]="view() === 'proportion'"
              (click)="view.set('proportion')"
            >
              Proportion X/n
            </button>
          </div>
        </div>

        <div class="trial-cells" aria-hidden="true">
          @for (cell of cells(); track cell) {
            <i [style.--lean.%]="probability()"></i>
          }
        </div>

        <div class="dynamic-pmf">
          <div class="mean-marker" [style.left.%]="meanPosition()">
            <span>balance</span><strong>{{ meanLabel() }}</strong>
          </div>
          @for (bar of bars(); track bar.k) {
            <div class="dynamic-bar" [style.height.%]="(bar.probability / maxProbability()) * 100">
              <span>{{ bar.probability * 100 | number: '1.0-1' }}%</span>
              <i></i>
              <small>{{ tickLabel(bar) }}</small>
            </div>
          }
        </div>

        <div class="shape-readouts">
          <div>
            <span>Balance point</span><strong>{{ meanLabel() }}</strong>
          </div>
          <div>
            <span>Count SD</span><strong>{{ standardDeviation() | number: '1.2-2' }}</strong>
          </div>
          <div>
            <span>Proportion SD</span><strong>{{ proportionSd() | number: '1.3-3' }}</strong>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="shape-causal-chain" aria-hidden="true">
          <span>n, p</span><i>→</i><span>path weights</span><i>→</i><strong>PMF shape</strong>
        </div>
        <div>
          <span class="card-label">Parameters describe the generator</span>
          <p>
            <strong>np 是 distribution 的 balance point，不是「一定會成功 np 次」。</strong>
            切到 proportion view，也能看見 n 越大時 X/n 通常越集中在 p 附近。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：mean 與 variance 可由 indicators 得到</summary>
        <div class="binary-formulas">
          <app-math e="X=X_1+\\cdots+X_n,\\qquad E[X]=np" />
          <app-math e="\\operatorname{Var}(X)=np(1-p)" />
          <p>Variance 的相加在這裡使用 trials independent；expectation 的相加本身不需要。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BinomialShapeComponent {
  readonly trials = signal(12);
  readonly probability = signal(35);
  readonly view = signal<'count' | 'proportion'>('count');
  readonly cells = computed(() => Array.from({ length: this.trials() }, (_, index) => index));
  readonly bars = computed<Bar[]>(() => {
    const n = this.trials();
    const p = this.probability() / 100;
    return Array.from({ length: n + 1 }, (_, k) => ({
      k,
      x: this.view() === 'count' ? k : k / n,
      probability: this.choose(n, k) * p ** k * (1 - p) ** (n - k),
    }));
  });
  readonly maxProbability = computed(() => Math.max(...this.bars().map((bar) => bar.probability)));
  readonly meanPosition = computed(() => this.probability());
  readonly standardDeviation = computed(() =>
    Math.sqrt(this.trials() * (this.probability() / 100) * (1 - this.probability() / 100)),
  );
  readonly proportionSd = computed(() => this.standardDeviation() / this.trials());
  readonly meanLabel = computed(() =>
    this.view() === 'count'
      ? `np = ${((this.trials() * this.probability()) / 100).toFixed(1)}`
      : `p = ${(this.probability() / 100).toFixed(2)}`,
  );

  tickLabel(bar: Bar): string {
    if (this.trials() > 18 && bar.k % 2 !== 0) return '';
    return this.view() === 'count' ? `${bar.k}` : bar.x.toFixed(2);
  }
  choose(n: number, k: number): number {
    const r = Math.min(k, n - k);
    let result = 1;
    for (let i = 1; i <= r; i += 1) result = (result * (n - r + i)) / i;
    return result;
  }
}
