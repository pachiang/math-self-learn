import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { betaMean, betaPdf, betaVariance } from './continuous-math';

@Component({
  selector: 'app-prob-v2-beta-shape',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.6</p>
        <h2>Beta 的 ratio 決定中心；sum 決定 concentration</h2>
        <p class="lede">
          <strong>Beta(α,β)</strong> 的兩個參數可以看成 0 與 1 兩側的 shape forces。α/(α+β) 放置
          balance point；α+β 決定重量有多集中。
        </p>
      </header>
      <section class="scene continuous-prediction">
        <div>
          <p class="eyebrow">先比較 · same symmetry</p>
          <h3>Beta(1,1) 與 Beta(8,8) 都左右對稱，它們會是同一條 flat curve 嗎？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="判斷對稱 Beta 是否皆為均勻">
          <button
            type="button"
            [class.selected]="prediction() === 'flat'"
            (click)="prediction.set('flat')"
          >
            都 flat</button
          ><button
            type="button"
            [class.selected]="prediction() === 'focus'"
            (click)="prediction.set('focus')"
          >
            中心相同，集中度不同
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'focus') {
              <strong>對。相同 ratio 固定 center；更大的 total 把重量收緊在 center 附近。</strong>
            } @else {
              α=β 只保證左右對稱；只有 α=β=1 才是 Uniform。
            }
          </p>
        }
      </section>
      <section class="continuous-controls beta-controls">
        <label
          >Left shape α<input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            [value]="alpha()"
            (input)="alpha.set(+$any($event).target.value)"
          /><strong>{{ alpha().toFixed(1) }}</strong></label
        ><label
          >Right shape β<input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            [value]="beta()"
            (input)="beta.set(+$any($event).target.value)"
          /><strong>{{ beta().toFixed(1) }}</strong></label
        >
        <div class="beta-presets">
          <button type="button" (click)="preset(1, 1)">Uniform</button
          ><button type="button" (click)="preset(8, 8)">Centered</button
          ><button type="button" (click)="preset(2, 8)">Left</button
          ><button type="button" (click)="preset(0.5, 0.5)">Edges</button>
        </div>
      </section>
      <section class="beta-shape-board">
        <div class="beta-density" aria-label="互動式 Beta density">
          @for (bar of density(); track bar.x) {
            <i [style.height.%]="bar.height"></i>
          }
          <b class="beta-center" [style.left.%]="mean() * 100"
            ><span>center {{ mean().toFixed(2) }}</span></b
          >
          <div class="beta-axis">
            <span>0</span><span>possible proportion p</span><span>1</span>
          </div>
        </div>
        <div class="beta-force-bar">
          <div class="alpha-force" [style.width.%]="mean() * 100"><span>α share</span></div>
          <div class="beta-force"><span>β share</span></div>
          <b [style.left.%]="mean() * 100"></b>
        </div>
        <div class="beta-stats">
          <div>
            <span>center ratio</span><strong>{{ mean().toFixed(3) }}</strong
            ><small>α / (α+β)</small>
          </div>
          <div>
            <span>concentration</span><strong>{{ concentration().toFixed(1) }}</strong
            ><small>α + β</small>
          </div>
          <div>
            <span>SD</span><strong>{{ sd().toFixed(3) }}</strong
            ><small>typical width</small>
          </div>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="beta-core" aria-hidden="true">
          <span>α : β</span><i>sets center</i><span>α + β</span><i>sets focus</i>
        </div>
        <div>
          <span class="card-label">Shape parameters 是兩種可見操作</span>
          <p><strong>先看 ratio 把山峰拉去哪裡，再看 total 決定它攤平還是集中。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>公式層：Beta function、mean 與 variance</summary>
        <div class="continuous-formulas">
          <app-math
            e="f(x)=\\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{B(\\alpha,\\beta)},\\quad 0<x<1"
          /><app-math e="E[X]=\\frac{\\alpha}{\\alpha+\\beta}" /><app-math
            e="\\operatorname{Var}(X)=\\frac{\\alpha\\beta}{(\\alpha+\\beta)^2(\\alpha+\\beta+1)}"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BetaShapeComponent {
  readonly prediction = signal<'flat' | 'focus' | null>(null);
  readonly alpha = signal(2);
  readonly beta = signal(5);
  readonly mean = computed(() => betaMean(this.alpha(), this.beta()));
  readonly concentration = computed(() => this.alpha() + this.beta());
  readonly sd = computed(() => Math.sqrt(betaVariance(this.alpha(), this.beta())));
  readonly density = computed(() => {
    const points = Array.from({ length: 72 }, (_, index) => (index + 0.5) / 72);
    const values = points.map((x) => betaPdf(x, this.alpha(), this.beta()));
    const max = Math.max(...values);
    return points.map((x, index) => ({ x, height: (values[index] / max) * 100 }));
  });
  readonly reading = computed(() =>
    this.alpha() < 1 || this.beta() < 1
      ? '參數低於 1 時，boundary 本身會成為吸引重量的區域。'
      : this.concentration() > 12
        ? 'Total shape 很大：重量被緊密收在 ratio 指定的位置。'
        : '目前 curve 保留明顯不確定性；它描述整段 possible proportions。',
  );
  preset(alpha: number, beta: number): void {
    this.alpha.set(alpha);
    this.beta.set(beta);
  }
}
