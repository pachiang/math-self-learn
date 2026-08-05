import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-z-coordinate',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.3</p>
        <h2>z-score 不是 probability；它是「離中心幾個 σ」的新座標</h2>
        <p class="lede">
          <strong>標準分數（z-score）</strong>先把 μ 移到 0，再用 σ 當新尺的一格。不同單位的
          measurements 因而能在同一條 standardized axis 上比較位置。
        </p>
      </header>
      <section class="normal-controls triple">
        <label
          >Measurement x<input
            type="range"
            min="40"
            max="100"
            step="1"
            [value]="value()"
            (input)="value.set(+$any($event).target.value)"
          /><strong>{{ value() }}</strong></label
        ><label
          >Center μ<input
            type="range"
            min="55"
            max="85"
            step="1"
            [value]="mean()"
            (input)="mean.set(+$any($event).target.value)"
          /><strong>{{ mean() }}</strong></label
        ><label
          >Scale σ<input
            type="range"
            min="5"
            max="15"
            step="1"
            [value]="sd()"
            (input)="sd.set(+$any($event).target.value)"
          /><strong>{{ sd() }}</strong></label
        >
      </section>
      <section class="z-board">
        <div class="raw-axis">
          <span>RAW UNIT</span><i></i><b class="raw-mean" [style.left.%]="rawMeanPosition()">μ</b
          ><strong [style.left.%]="rawPosition()">x={{ value() }}</strong>
        </div>
        <div class="standardize-machine">
          <span>subtract μ</span><i>→</i><span>divide by σ</span
          ><strong>{{ value() }}−{{ mean() }} / {{ sd() }}</strong>
        </div>
        <div class="z-axis">
          <span>Z COORDINATE</span>
          @for (tick of ticks; track tick) {
            <i [style.left.%]="((tick + 3) / 6) * 100"
              ><small>{{ tick }}</small></i
            >
          }
          <strong [style.left.%]="zPosition()">z={{ z().toFixed(2) }}</strong>
        </div>
        <p>{{ reading() }}</p>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>raw distance x−μ</span><i>÷ σ</i><strong>standardized distance z</strong>
        </div>
        <div>
          <span class="card-label">z 是位置，不是 area</span>
          <p>
            <strong
              >z=2 的意思是位於中心右方 2 個 σ；要得到 probability，仍需在 curve 下量 area。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>符號層：standard Normal</summary>
        <div class="normal-formulas">
          <app-math e="Z=\\frac{X-\\mu}{\\sigma}" /><app-math
            e="X\\sim N(\\mu,\\sigma^2)\\Longrightarrow Z\\sim N(0,1)"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ZCoordinateComponent {
  readonly value = signal(82);
  readonly mean = signal(70);
  readonly sd = signal(8);
  readonly ticks = [-3, -2, -1, 0, 1, 2, 3];
  readonly z = computed(() => (this.value() - this.mean()) / this.sd());
  readonly rawPosition = computed(() =>
    Math.max(0, Math.min(100, ((this.value() - 40) / 60) * 100)),
  );
  readonly rawMeanPosition = computed(() =>
    Math.max(0, Math.min(100, ((this.mean() - 40) / 60) * 100)),
  );
  readonly zPosition = computed(() => Math.max(0, Math.min(100, ((this.z() + 3) / 6) * 100)));
  readonly reading = computed(() =>
    this.z() > 0
      ? '這個 measurement 位於 center 右側 ' + this.z().toFixed(2) + ' 個 scale units。'
      : '這個 measurement 位於 center 左側 ' + Math.abs(this.z()).toFixed(2) + ' 個 scale units。',
  );
}
