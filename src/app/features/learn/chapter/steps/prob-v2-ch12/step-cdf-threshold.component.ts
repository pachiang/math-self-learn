import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-cdf-threshold',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch12">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 12.3</p>
        <h2>CDF 把 threshold 左邊的重量全部收進來</h2>
        <p class="lede">
          <strong>累積分布函數（cumulative distribution function, CDF）</strong>不問「剛好在 t
          有多少」，而問「到 t 為止一共累積多少」。threshold 往右，只會收進更多 mass。
        </p>
      </header>

      <section class="scene">
        <div class="dist-prediction">
          <div>
            <p class="eyebrow">先預測 · S = sum of two dice</p>
            <h3>F(7) 代表哪一個事件？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="判斷 F(7) 的事件意義">
            <button
              type="button"
              [class.selected]="prediction() === 'exact'"
              (click)="prediction.set('exact')"
            >
              S = 7
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'at-most'"
              (click)="prediction.set('at-most')"
            >
              S ≤ 7
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'above'"
              (click)="prediction.set('above')"
            >
              S ≥ 7
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'at-most') {
              <strong>對，F(7)=P(S≤7)=21/36。</strong>它收進 sums 2、3、4、5、6、7 的全部 bars。
            } @else {
              CDF 的 F(7) 是 cumulative mass through 7，也就是 S≤7，不是單獨的 7 或右側 tail。
            }
          </p>
        }
      </section>

      <section class="cdf-control">
        <label for="cdf-threshold">移動 threshold t</label>
        <input
          id="cdf-threshold"
          type="range"
          min="1"
          max="12"
          step="1"
          [value]="threshold()"
          (input)="threshold.set(+$any($event).target.value)"
        />
        <strong>t = {{ threshold() }}</strong>
      </section>

      <section class="cdf-board">
        <div class="cdf-pmf-panel">
          <p class="eyebrow">Sweep across the PMF</p>
          <h3>深色 bars 已被 threshold 收進 cumulative tank</h3>
          <div class="cdf-bars" aria-label="兩骰點數和與目前累積範圍">
            @for (value of sums; track value) {
              <div [class.included]="value <= threshold()">
                <i [style.height.%]="(countFor(value) / 6) * 100"></i>
                <strong>{{ countFor(value) }}</strong>
                <span>{{ value }}</span>
              </div>
            }
            <b class="threshold-line" [style.left.%]="thresholdPosition()">
              <span>t={{ threshold() }}</span>
            </b>
          </div>
          <div class="cdf-tank">
            <span>累積進來的 outcome weights</span>
            <div><i [style.width.%]="cdfValue() * 100"></i></div>
            <strong>{{ cumulativeCount() }}/36 = {{ percent(cdfValue()) }}</strong>
          </div>
        </div>

        <div class="cdf-curve-panel">
          <p class="eyebrow">Same weights · cumulative view</p>
          <h3>Staircase 只會持平或上升</h3>
          <svg viewBox="0 0 700 270" role="img" aria-label="兩骰點數和的累積分布函數階梯圖">
            <line x1="42" y1="230" x2="670" y2="230" class="cdf-axis" />
            <line x1="42" y1="35" x2="42" y2="230" class="cdf-axis" />
            <path [attr.d]="cdfPath()" class="cdf-staircase" />
            <line [attr.x1]="cursorX()" y1="35" [attr.x2]="cursorX()" y2="230" class="cdf-guide" />
            <circle [attr.cx]="cursorX()" [attr.cy]="cursorY()" r="7" class="cdf-cursor" />
            <text x="17" y="41">1</text>
            <text x="17" y="235">0</text>
            <text x="42" y="254">1</text>
            <text x="650" y="254">12</text>
          </svg>
          <div class="cdf-readout">
            <span>F({{ threshold() }}) = P(S ≤ {{ threshold() }})</span>
            <strong>{{ percent(cdfValue()) }}</strong>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="cdf-core-card" aria-hidden="true">
          <span>threshold →</span>
          <div><i [style.width.%]="cdfValue() * 100"></i></div>
          <strong>mass to the left = {{ percent(cdfValue()) }}</strong>
        </div>
        <div>
          <span class="card-label">CDF = probability to the left of a threshold</span>
          <p>
            <strong>往右移不會把已收進來的 outcomes 丟出去。</strong>
            所以任何 CDF 都必須 monotone nondecreasing：可以持平，也可以上升，但不能下降。
          </p>
        </div>
      </aside>

      <section class="transfer-check">
        <p class="eyebrow">遷移一下 · delivery time T</p>
        <h3>F(30)=0.8 的自然語言意思是什麼？</h3>
        <button type="button" (click)="transferOpen.set(!transferOpen())">
          {{ transferOpen() ? '收起解讀' : '揭曉解讀' }}
        </button>
        @if (transferOpen()) {
          <p class="feedback">
            約 80% 的 deliveries 能在 30 分鐘以內完成；不是剛好 30 分鐘占 80%。
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>定義層：CDF 的一般性質與區間 probability</summary>
        <div>
          <div class="math-line"><app-math e="F_X(t)=P(X\\le t)" /></div>
          <p>
            每個 CDF 都 monotone nondecreasing、right-continuous，並滿足 t→−∞ 時趨近 0、t→∞ 時趨近
            1。對 a&lt;b：
          </p>
          <div class="math-line">
            <app-math e="P(a<X\\le b)=F_X(b)-F_X(a)" />
          </div>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CdfThresholdComponent {
  readonly sums = Array.from({ length: 11 }, (_, index) => index + 2);
  readonly prediction = signal<string | null>(null);
  readonly threshold = signal(7);
  readonly transferOpen = signal(false);
  readonly cumulativeCount = computed(() =>
    this.sums
      .filter((value) => value <= this.threshold())
      .reduce((sum, value) => sum + this.countFor(value), 0),
  );
  readonly cdfValue = computed(() => this.cumulativeCount() / 36);
  readonly thresholdPosition = computed(() => ((this.threshold() - 1) / 12) * 100);
  readonly cursorX = computed(() => this.xFor(this.threshold()));
  readonly cursorY = computed(() => this.yFor(this.cdfAt(this.threshold())));

  countFor(value: number): number {
    if (value < 2 || value > 12) return 0;
    return value <= 7 ? value - 1 : 13 - value;
  }

  cdfAt(value: number): number {
    return (
      this.sums
        .filter((sumValue) => sumValue <= value)
        .reduce((sum, sumValue) => sum + this.countFor(sumValue), 0) / 36
    );
  }

  xFor(value: number): number {
    return 42 + ((value - 1) / 11) * 628;
  }

  yFor(probability: number): number {
    return 230 - probability * 195;
  }

  cdfPath(): string {
    let path = `M ${this.xFor(1)} ${this.yFor(0)}`;
    for (let value = 2; value <= 12; value++) {
      const x = this.xFor(value);
      const previousY = this.yFor(this.cdfAt(value - 1));
      const nextY = this.yFor(this.cdfAt(value));
      path += ` H ${x} V ${nextY}`;
      if (previousY === nextY) path += '';
    }
    return path;
  }

  percent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}
