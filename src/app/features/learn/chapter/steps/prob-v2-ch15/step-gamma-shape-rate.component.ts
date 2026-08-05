import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { gammaPdf } from './event-stream-math';

@Component({
  selector: 'app-prob-v2-gamma-shape-rate',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.7</p>
        <h2>Shape 建造 checkpoint；rate 壓縮整條時間軸</h2>
        <p class="lede">
          Gamma 的兩個 controls 做的是不同工作：<strong>shape α</strong>
          決定要累積多少等待片段，<strong>rate β</strong> 決定 events 在時間上有多密。
        </p>
      </header>

      <section class="gamma-control-deck">
        <label
          >Shape α · checkpoints<input
            type="range"
            min="1"
            max="8"
            step="1"
            [value]="shape()"
            (input)="shape.set(+$any($event).target.value)"
          /><strong>{{ shape() }}</strong></label
        >
        <label
          >Rate β · events/min<input
            type="range"
            min="0.5"
            max="3"
            step="0.25"
            [value]="rate()"
            (input)="rate.set(+$any($event).target.value)"
          /><strong>{{ rate().toFixed(2) }}</strong></label
        >
        <div class="gamma-presets">
          <button type="button" (click)="setPreset(1, 1)">next event</button
          ><button type="button" (click)="setPreset(5, 1)">more checkpoints</button
          ><button type="button" (click)="setPreset(5, 2.5)">faster stream</button>
        </div>
      </section>

      <section class="gamma-shape-board">
        <div class="gamma-gap-strip">
          <span>NOW</span>
          @for (piece of pieces(); track piece) {
            <i
              ><small>gap {{ piece }}</small></i
            >
          }
          <strong>event #{{ shape() }}</strong>
        </div>
        <div class="gamma-density-large" aria-label="互動式 Gamma density">
          <div class="density-axis"><span>0</span><span>time →</span></div>
          @for (bar of density(); track bar.x) {
            <i [style.height.%]="bar.height"></i>
          }
          <b class="gamma-mean" [style.left.%]="meanPosition()"
            ><span>mean {{ mean().toFixed(2) }}</span></b
          >
        </div>
        <div class="gamma-stat-cards">
          <div>
            <span>中心</span><strong>{{ mean().toFixed(2) }}</strong
            ><small>α / β</small>
          </div>
          <div>
            <span>典型寬度</span><strong>{{ sd().toFixed(2) }}</strong
            ><small>√α / β</small>
          </div>
          <p>{{ reading() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="shape-rate-core" aria-hidden="true">
          <span>α adds gaps</span><i>↔</i><span>β rescales time</span>
        </div>
        <div>
          <span class="card-label">兩個 knobs，不是兩個待背參數</span>
          <p><strong>加 shape 是把更多隨機片段平均起來；加 rate 是讓所有片段一起變短。</strong></p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>參數層：rate 與 scale convention</summary>
        <div class="stream-formulas">
          <app-math
            e="X\\sim\\operatorname{Gamma}(\\alpha,\\beta),\\qquad f(x)=\\frac{\\beta^\\alpha}{\\Gamma(\\alpha)}x^{\\alpha-1}e^{-\\beta x}"
          /><app-math
            e="E[X]=\\frac{\\alpha}{\\beta},\\qquad \\operatorname{Var}(X)=\\frac{\\alpha}{\\beta^2}"
          />
          <p>
            有些書改用 <strong>scale θ=1/β</strong>。看到 Gamma 時先確認第二個參數是 rate 還是
            scale，避免同一符號代表相反方向。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2GammaShapeRateComponent {
  readonly shape = signal(4);
  readonly rate = signal(1);
  readonly pieces = computed(() => Array.from({ length: this.shape() }, (_, index) => index + 1));
  readonly mean = computed(() => this.shape() / this.rate());
  readonly sd = computed(() => Math.sqrt(this.shape()) / this.rate());
  readonly density = computed(() => {
    const limit = Math.max(8, this.mean() + 4 * this.sd());
    const points = Array.from({ length: 64 }, (_, index) => ((index + 0.5) / 64) * limit);
    const values = points.map((x) => gammaPdf(x, this.shape(), this.rate()));
    const max = Math.max(...values);
    return points.map((x, index) => ({ x, height: (values[index] / max) * 100 }));
  });
  readonly meanPosition = computed(() => {
    const limit = Math.max(8, this.mean() + 4 * this.sd());
    return Math.min(96, (this.mean() / limit) * 100);
  });
  readonly reading = computed(() =>
    this.rate() > 1.5
      ? 'Events 變密，整個等待世界往左壓縮。'
      : this.shape() > 4
        ? '更多 gaps 相加後，相對起伏被平均，山峰更集中。'
        : '調整一個 knob，觀察另一個保持不動時發生什麼。',
  );

  setPreset(shape: number, rate: number): void {
    this.shape.set(shape);
    this.rate.set(rate);
  }
}
