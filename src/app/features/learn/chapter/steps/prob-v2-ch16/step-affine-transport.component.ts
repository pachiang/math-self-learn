import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-affine-transport',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.3</p>
        <h2>把尺拉寬幾倍，density 就必須壓低幾倍</h2>
        <p class="lede">
          <strong>仿射變換（affine transformation）</strong> Y=a+bX
          只平移、翻轉或等比例伸縮整條尺。所有 pieces 受到同一倍率，因此 flatness 不會被破壞。
        </p>
      </header>
      <section class="scene continuous-prediction">
        <div>
          <p class="eyebrow">先預測 · conserve mass</p>
          <h3>把寬度 1 的 Uniform rectangle 拉成寬度 4，若總 area 仍是 1，高度應是多少？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="預測拉寬後密度高度">
          <button type="button" [class.selected]="prediction() === 1" (click)="prediction.set(1)">
            仍是 1</button
          ><button
            type="button"
            [class.selected]="prediction() === 0.25"
            (click)="prediction.set(0.25)"
          >
            降成 1/4
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 0.25) {
              <strong>對。寬四倍、高四分之一，area 才仍是 1。</strong>
            } @else {
              若高度也維持 1，總 area 會膨脹成 4，等於憑空創造 probability。
            }
          </p>
        }
      </section>
      <section class="continuous-controls affine-controls">
        <label
          >Shift a<input
            type="range"
            min="-4"
            max="4"
            step="1"
            [value]="shift()"
            (input)="shift.set(+$any($event).target.value)"
          /><strong>{{ signed(shift()) }}</strong></label
        ><label
          >Stretch b<input
            type="range"
            min="-4"
            max="4"
            step="1"
            [value]="stretch()"
            (input)="setStretch(+$any($event).target.value)"
          /><strong>{{ signed(stretch()) }}×</strong></label
        >
      </section>
      <section class="affine-board">
        <div class="affine-ruler source">
          <span>SOURCE X</span>
          <div class="affine-rectangle"></div>
          <div class="affine-ticks"><b>0</b><b>0.25</b><b>0.5</b><b>0.75</b><b>1</b></div>
        </div>
        <div class="transport-lines" aria-hidden="true">
          @for (line of lines; track line) {
            <i [style.--offset]="line"></i>
          }
        </div>
        <div class="affine-ruler output">
          <span>OUTPUT Y</span>
          <div
            class="affine-rectangle"
            [style.width.%]="outputWidth()"
            [style.height.px]="outputHeight()"
          ></div>
          <div class="affine-ticks" [class.reverse]="stretch() < 0">
            <b>{{ endpoint(0) }}</b
            ><b>{{ endpoint(0.25) }}</b
            ><b>{{ endpoint(0.5) }}</b
            ><b>{{ endpoint(0.75) }}</b
            ><b>{{ endpoint(1) }}</b>
          </div>
        </div>
        <div class="affine-readout">
          <span>width × {{ absStretch() }}</span
          ><i>↔</i><span>height ÷ {{ absStretch() }}</span
          ><strong>area = 1</strong>
        </div>
      </section>
      <aside class="insight-card">
        <div class="affine-core" aria-hidden="true">
          <span>space × |b|</span><i>⇄</i><strong>density ÷ |b|</strong>
        </div>
        <div>
          <span class="card-label">Transformation 搬運重量，不製造重量</span>
          <p><strong>Shift 只換地址；stretch 改變每單位長度需要承載多少 mass。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>公式層：一維 affine change of variables</summary>
        <div class="continuous-formulas">
          <app-math e="Y=a+bX" /><app-math
            e="f_Y(y)=\\frac{1}{|b|}f_X\\!\\left(\\frac{y-a}{b}\\right)"
          />
          <p>絕對值 |b| 也涵蓋 b&lt;0 的翻轉：方向改變，但寬度倍率仍是正的。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2AffineTransportComponent {
  readonly prediction = signal<number | null>(null);
  readonly shift = signal(0);
  readonly stretch = signal(3);
  readonly lines = [0, 25, 50, 75, 100];
  readonly absStretch = computed(() => Math.abs(this.stretch()));
  readonly outputWidth = computed(() => 25 + (this.absStretch() / 4) * 70);
  readonly outputHeight = computed(() => 120 / this.absStretch());
  setStretch(value: number): void {
    this.stretch.set(value === 0 ? 1 : value);
  }
  endpoint(x: number): string {
    return (this.shift() + this.stretch() * x).toFixed(2).replace('.00', '');
  }
  signed(value: number): string {
    return value > 0 ? '+' + value : String(value);
  }
}
