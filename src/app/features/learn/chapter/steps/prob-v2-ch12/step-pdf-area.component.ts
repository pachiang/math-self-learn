import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type SelectionMode = 'interval' | 'point';

@Component({
  selector: 'app-prob-v2-pdf-area',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch12">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 12.4</p>
        <h2>PDF 的高度是 density；probability 要用寬度換成面積</h2>
        <p class="lede">
          <strong>機率密度函數（probability density function, PDF）</strong
          >描述每單位寬度附近塞了多少 probability。continuous point 沒有寬度，因此曲線高度不等於單點
          probability。
        </p>
      </header>

      <section class="scene">
        <div class="dist-prediction">
          <div>
            <p class="eyebrow">先預測 · X uniform on 0–10 minutes</p>
            <h3>Density f(5)=0.1，是否代表 P(X=5)=0.1？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="判斷密度高度是否等於單點機率">
            <button
              type="button"
              [class.selected]="prediction() === 'yes'"
              (click)="prediction.set('yes')"
            >
              是
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'no'"
              (click)="prediction.set('no')"
            >
              不是
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'no') {
              <strong>對。</strong>f(5)=0.1 是 density height；單點寬度為 0，所以 area 與
              probability 都是 0。
            } @else {
              0.1 的 units 是「probability per minute」。還要乘上 interval width，才得到
              probability。
            }
          </p>
        }
      </section>

      <section class="pdf-controls">
        <div class="preset-row" role="group" aria-label="選擇區間或單點模式">
          <button
            type="button"
            [class.active]="mode() === 'interval'"
            (click)="mode.set('interval')"
          >
            Interval area
          </button>
          <button type="button" [class.active]="mode() === 'point'" (click)="mode.set('point')">
            Exact point
          </button>
        </div>
        @if (mode() === 'interval') {
          <label for="pdf-left">Left a = {{ left() }}</label>
          <input
            id="pdf-left"
            type="range"
            min="0"
            max="10"
            step="0.5"
            [value]="left()"
            (input)="left.set(+$any($event).target.value)"
          />
          <label for="pdf-right">Right b = {{ right() }}</label>
          <input
            id="pdf-right"
            type="range"
            min="0"
            max="10"
            step="0.5"
            [value]="right()"
            (input)="right.set(+$any($event).target.value)"
          />
        } @else {
          <label for="pdf-point">Point x = {{ point() }}</label>
          <input
            id="pdf-point"
            type="range"
            min="0"
            max="10"
            step="0.5"
            [value]="point()"
            (input)="point.set(+$any($event).target.value)"
          />
        }
      </section>

      <section class="pdf-board">
        <div class="density-panel">
          <p class="eyebrow">Uniform density · total area = 1</p>
          <h3>{{ selectionTitle() }}</h3>
          <div class="density-plot">
            <div class="density-y-label">density<br />0.1 / min</div>
            <div class="uniform-rectangle">
              <span
                class="selected-area"
                [class.point]="mode() === 'point'"
                [style.left.%]="selectionLeftPercent()"
                [style.width.%]="selectionWidthPercent()"
              ></span>
              @if (mode() === 'point') {
                <i class="point-marker" [style.left.%]="selectionLeftPercent()"></i>
              }
            </div>
            <div class="density-axis">
              @for (tick of [0, 2, 4, 6, 8, 10]; track tick) {
                <span [style.left.%]="tick * 10">{{ tick }}</span>
              }
            </div>
          </div>
          <p class="density-note">橫軸：waiting time（minutes）</p>
        </div>

        <div class="area-calculator">
          <span class="card-label">{{
            mode() === 'interval' ? 'INTERVAL AREA' : 'EXACT POINT'
          }}</span>
          <div class="area-factors">
            <div>
              <span>width</span><strong>{{ selectionWidth() }}</strong>
            </div>
            <i>×</i>
            <div><span>density</span><strong>0.1</strong></div>
            <i>=</i>
            <div class="result">
              <span>probability</span><strong>{{ probability() }}</strong>
            </div>
          </div>
          <strong class="area-percent">{{ percent(probability()) }}</strong>
          <p class="feedback">{{ areaExplanation() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="density-core-card" aria-hidden="true">
          <div><span>height</span><strong>density</strong></div>
          <i>× width</i>
          <div><span>area</span><strong>probability</strong></div>
        </div>
        <div>
          <span class="card-label">PDF 看高度；probability 看面積</span>
          <p>
            <strong>單點可以有很高的 density，卻仍沒有 area。</strong>
            continuous probability 必須問一段 interval；把區間縮到零寬，重量也跟著縮到 0。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：interval integral 與 endpoint</summary>
        <div>
          <div class="math-line">
            <app-math e="P(a\\le X\\le b)=\\int_a^b f_X(x)\\,dx" />
          </div>
          <div class="math-line">
            <app-math e="P(X=x)=\\int_x^x f_X(t)\\,dt=0" />
          </div>
          <p>
            因為 continuous point mass 為 0，&lt; 或 ≤ 是否包含 endpoints 不改變 interval
            probability。這點和 discrete PMF 不同。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2PdfAreaComponent {
  readonly prediction = signal<'yes' | 'no' | null>(null);
  readonly mode = signal<SelectionMode>('interval');
  readonly left = signal(2);
  readonly right = signal(7);
  readonly point = signal(5);
  readonly intervalStart = computed(() => Math.min(this.left(), this.right()));
  readonly intervalEnd = computed(() => Math.max(this.left(), this.right()));
  readonly selectionWidth = computed(() =>
    this.mode() === 'point' ? 0 : this.intervalEnd() - this.intervalStart(),
  );
  readonly selectionLeftPercent = computed(
    () => (this.mode() === 'point' ? this.point() : this.intervalStart()) * 10,
  );
  readonly selectionWidthPercent = computed(() =>
    this.mode() === 'point' ? 0 : this.selectionWidth() * 10,
  );
  readonly probability = computed(() => this.selectionWidth() * 0.1);
  readonly selectionTitle = computed(() =>
    this.mode() === 'point'
      ? `Exact X=${this.point()}：有高度，沒有寬度`
      : `選取 ${this.intervalStart()}–${this.intervalEnd()} 分鐘下方的 area`,
  );
  readonly areaExplanation = computed(() =>
    this.mode() === 'point'
      ? `x=${this.point()} 的 density height 仍是 0.1，但零寬度讓 probability area 成為 0。`
      : `${this.selectionWidth()} 分鐘寬 × 每分鐘 0.1 probability density。`,
  );

  percent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}
