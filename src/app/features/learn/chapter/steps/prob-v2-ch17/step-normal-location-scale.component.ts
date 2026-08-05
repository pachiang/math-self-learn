import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { normalPdf } from './normal-family-math';

@Component({
  selector: 'app-prob-v2-normal-location-scale',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.2</p>
        <h2>μ 搬動中心；σ 伸縮整個偏差座標</h2>
        <p class="lede">
          Normal family 只有兩個幾何 knobs：<strong>location μ</strong> 決定 balance point，<strong
            >scale σ</strong
          >
          決定典型偏差有多寬。Stretch 變寬時，curve 必須同步變矮以保存 area。
        </p>
      </header>
      <section class="normal-controls dual">
        <label
          >Location μ<input
            type="range"
            min="-3"
            max="3"
            step="0.5"
            [value]="mean()"
            (input)="mean.set(+$any($event).target.value)"
          /><strong>{{ mean().toFixed(1) }}</strong></label
        ><label
          >Scale σ<input
            type="range"
            min="0.5"
            max="2.5"
            step="0.25"
            [value]="sd()"
            (input)="sd.set(+$any($event).target.value)"
          /><strong>{{ sd().toFixed(2) }}</strong></label
        >
      </section>
      <section class="normal-shape-board">
        <div class="normal-density">
          @for (bar of bars(); track bar.x) {
            <i [style.height.%]="bar.height" [class.within]="bar.within"></i>
          }
          <b class="mean-line" [style.left.%]="meanPosition()"
            ><span>μ={{ mean().toFixed(1) }}</span></b
          >
          <div class="sigma-bracket" [style.left.%]="sigmaLeft()" [style.width.%]="sigmaWidth()">
            <span>one σ each side</span>
          </div>
        </div>
        <div class="location-scale-readout">
          <div>
            <span>MOVE μ</span><strong>whole curve slides</strong><small>shape unchanged</small>
          </div>
          <i>＋</i>
          <div>
            <span>STRETCH σ</span><strong>curve spreads</strong><small>height compensates</small>
          </div>
          <b>area = 1</b>
        </div>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>μ = where</span><i>·</i><span>σ = unit of deviation</span>
        </div>
        <div>
          <span class="card-label">Location 與 scale 做不同工作</span>
          <p><strong>σ 不是「curve 的高度」；它是橫軸上一個典型偏差單位。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>公式層：Normal density</summary>
        <div class="normal-formulas">
          <app-math e="X\\sim N(\\mu,\\sigma^2)" /><app-math
            e="f_X(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left[-\\frac12\\left(\\frac{x-\\mu}{\\sigma}\\right)^2\\right]"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NormalLocationScaleComponent {
  readonly mean = signal(0);
  readonly sd = signal(1);
  readonly bars = computed(() => {
    const xs = Array.from({ length: 81 }, (_, i) => -6 + (i * 12) / 80);
    const vals = xs.map((x) => normalPdf(x, this.mean(), this.sd()));
    const max = Math.max(...vals);
    return xs.map((x, i) => ({
      x,
      height: (vals[i] / max) * 100,
      within: Math.abs(x - this.mean()) <= this.sd(),
    }));
  });
  readonly meanPosition = computed(() => ((this.mean() + 6) / 12) * 100);
  readonly sigmaLeft = computed(() => Math.max(0, ((this.mean() - this.sd() + 6) / 12) * 100));
  readonly sigmaWidth = computed(() => Math.min(100 - this.sigmaLeft(), (this.sd() / 6) * 100));
}
