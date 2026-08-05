import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-nonlinear-compression',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.4</p>
        <h2>Nonlinear map 在哪裡壓縮空間，density 就在哪裡堆高</h2>
        <p class="lede">
          把 Uniform input 切成十份<strong>等重量</strong> strips。經過 Y=U<sup>q</sup>
          後，每份重量不變；但 output width 不再相同，所以高度必須補償。
        </p>
      </header>
      <section class="continuous-controls">
        <label
          >Power q<input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            [value]="power()"
            (input)="power.set(+$any($event).target.value)"
          /><strong>{{ power().toFixed(1) }}</strong></label
        >
        <div class="power-presets">
          <button type="button" (click)="power.set(0.5)">√U</button
          ><button type="button" (click)="power.set(1)">U</button
          ><button type="button" (click)="power.set(2)">U²</button>
        </div>
      </section>
      <section class="nonlinear-board">
        <div class="mass-strip source-strips">
          <span>U · ten equal widths and masses</span>
          @for (piece of pieces(); track piece.index) {
            <i
              ><small>{{ piece.index + 1 }}</small></i
            >
          }
        </div>
        <div class="map-arrows">
          <strong
            >Y = U<sup>{{ power() }}</sup></strong
          ><span>{{ mapReading() }}</span>
        </div>
        <div class="output-density">
          <span>Y · same masses, new widths</span>
          <div>
            @for (piece of pieces(); track piece.index) {
              <i [style.width.%]="piece.width * 100" [style.height.%]="piece.height"
                ><small>{{ piece.index + 1 }}</small></i
              >
            }
          </div>
        </div>
        <div class="compression-focus">
          <span>Most compressed piece</span><strong>#{{ mostCompressed() + 1 }}</strong
          ><i>→</i><span>Highest density</span>
        </div>
      </section>
      <aside class="insight-card">
        <div class="compression-core" aria-hidden="true">
          <span>same mass</span><i>÷</i><span>smaller width</span><b>→</b
          ><strong>higher density</strong>
        </div>
        <div>
          <span class="card-label">看 local stretch，不只看 output range</span>
          <p>
            <strong
              >Uniform input 經 nonlinear transformation 後通常不再
              Uniform，因為不同位置被拉伸的倍率不同。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>推導層：CDF method 與 inverse derivative</summary>
        <div class="continuous-formulas">
          <app-math e="Y=U^q,\\quad 0\\le U\\le1" /><app-math
            e="F_Y(y)=P(U\\le y^{1/q})=y^{1/q}"
          /><app-math e="f_Y(y)=\\frac{1}{q}y^{1/q-1}" />
          <p>一維的 Jacobian 因子，就是「output 每單位長度對應回多少 input 長度」。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NonlinearCompressionComponent {
  readonly power = signal(2);
  readonly pieces = computed(() => {
    const widths = Array.from({ length: 10 }, (_, index) => {
      const left = (index / 10) ** this.power();
      const right = ((index + 1) / 10) ** this.power();
      return right - left;
    });
    const densities = widths.map((width) => 0.1 / width);
    const maxDensity = Math.max(...densities);
    return widths.map((width, index) => ({
      index,
      width,
      height: (densities[index] / maxDensity) * 100,
    }));
  });
  readonly mostCompressed = computed(
    () => this.pieces().reduce((best, item) => (item.width < best.width ? item : best)).index,
  );
  readonly mapReading = computed(() =>
    this.power() > 1
      ? '左側 pieces 被壓窄，mass 堆向 0。'
      : this.power() < 1
        ? '右側 pieces 被壓窄，mass 堆向 1。'
        : '所有位置 stretch 相同，flat density 保持 flat。',
  );
}
