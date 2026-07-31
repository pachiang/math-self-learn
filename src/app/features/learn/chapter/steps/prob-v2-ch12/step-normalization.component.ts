import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type HeightMode = 'normalized' | 'fixed';

@Component({
  selector: 'app-prob-v2-normalization',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch12">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 12.5</p>
        <h2>Normalization 守的是總重量，不是曲線最高只能到 1</h2>
        <p class="lede">
          <strong>正規化（normalization）</strong>要求整張 distribution map 的總 mass 是 1。對
          PDF，守恆的是整體 area；support 變窄時，density 可以變得比 1 更高。
        </p>
      </header>

      <section class="scene">
        <div class="dist-prediction">
          <div>
            <p class="eyebrow">先預測 · X uniform on [0, 0.5]</p>
            <h3>Rectangle height 必須是 2 才能讓 area=1。Density 大於 1 合法嗎？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="判斷密度高度大於一是否合法">
            <button
              type="button"
              [class.selected]="prediction() === 'valid'"
              (click)="prediction.set('valid')"
            >
              合法
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'invalid'"
              (click)="prediction.set('invalid')"
            >
              不合法
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'valid') {
              <strong>合法。</strong>0.5×2=1；height 是 probability per unit，不是 probability
              本身。
            } @else {
              Probability 必須 ≤1，但 density 不是 probability。這裡限制的是總 area：0.5×2=1。
            }
          </p>
        }
      </section>

      <section class="normalization-controls">
        <label for="support-width">Support width W</label>
        <input
          id="support-width"
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          [value]="supportWidth()"
          (input)="supportWidth.set(+$any($event).target.value)"
        />
        <strong>{{ supportWidth().toFixed(1) }}</strong>
        <div class="preset-row" role="group" aria-label="選擇密度高度更新方式">
          <button
            type="button"
            [class.active]="mode() === 'normalized'"
            (click)="mode.set('normalized')"
          >
            Keep area = 1
          </button>
          <button type="button" [class.active]="mode() === 'fixed'" (click)="mode.set('fixed')">
            Fix height = 0.2
          </button>
        </div>
      </section>

      <section class="normalization-board">
        <div class="shape-stage">
          <p class="eyebrow">Stretch the support · watch height respond</p>
          <h3>{{ modeTitle() }}</h3>
          <div class="normalization-plot">
            <div
              class="support-rectangle"
              [class.invalid]="!isNormalized()"
              [style.width.%]="supportWidth() * 10"
              [style.height.px]="visualHeight()"
            >
              <span>height {{ density().toFixed(2) }}</span>
            </div>
            <div class="normalization-axis">
              <span>0</span><strong>support width {{ supportWidth().toFixed(1) }}</strong
              ><span>10</span>
            </div>
          </div>
        </div>

        <div class="mass-conservation">
          <span class="card-label">TOTAL MASS CHECK</span>
          <div class="area-equation">
            <div>
              <span>width</span><strong>{{ supportWidth().toFixed(1) }}</strong>
            </div>
            <i>×</i>
            <div>
              <span>height</span><strong>{{ density().toFixed(2) }}</strong>
            </div>
            <i>=</i>
            <div [class.valid]="isNormalized()" [class.invalid]="!isNormalized()">
              <span>area</span><strong>{{ totalArea().toFixed(2) }}</strong>
            </div>
          </div>
          <div class="mass-gauge">
            <i [style.width.%]="gaugeWidth()"></i>
            <b></b>
          </div>
          <p [class.valid-text]="isNormalized()" [class.invalid-text]="!isNormalized()">
            {{ validationMessage() }}
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="normalization-core-card" aria-hidden="true">
          <div class="wide-low"></div>
          <i>same area</i>
          <div class="narrow-high"></div>
        </div>
        <div>
          <span class="card-label">Probability 限制總重量；density 高度可以超過 1</span>
          <p>
            <strong>窄而高、寬而低都可能是合法 PDF。</strong>
            只要每處 density 非負，且整條曲線下方的 area 恰好等於 1。
          </p>
        </div>
      </aside>

      <section class="transfer-check">
        <p class="eyebrow">遷移一下</p>
        <h3>[0,4] 上高度 0.4 的 rectangle 是合法 PDF 嗎？</h3>
        <button type="button" (click)="transferOpen.set(!transferOpen())">
          {{ transferOpen() ? '收起檢查' : '檢查 total area' }}
        </button>
        @if (transferOpen()) {
          <p class="feedback">
            尚未 normalized：4×0.4=1.6。高度 0.4 雖然小於 1，但總 probability 超過 1。
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>公式層：PMF 與 PDF 的 normalization</summary>
        <div>
          <p>
            Discrete distribution 加總 point masses；continuous distribution 加總 infinitesimal
            areas：
          </p>
          <div class="math-line">
            <app-math e="\\sum_x p_X(x)=1,\\qquad \\int_{-\\infty}^{\\infty}f_X(x)\\,dx=1" />
          </div>
          <p>
            Density 帶有 inverse units。例如時間用 minutes，f(x) 的 units 就是
            probability/minute；乘上 minutes 後，area 才成為無單位的 probability。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NormalizationComponent {
  readonly prediction = signal<'valid' | 'invalid' | null>(null);
  readonly supportWidth = signal(0.5);
  readonly mode = signal<HeightMode>('normalized');
  readonly transferOpen = signal(false);
  readonly density = computed(() => (this.mode() === 'normalized' ? 1 / this.supportWidth() : 0.2));
  readonly totalArea = computed(() => this.supportWidth() * this.density());
  readonly isNormalized = computed(() => Math.abs(this.totalArea() - 1) < 0.001);
  readonly visualHeight = computed(() => Math.min(230, 48 + this.density() * 90));
  readonly gaugeWidth = computed(() => Math.min(100, this.totalArea() * 70));
  readonly modeTitle = computed(() =>
    this.mode() === 'normalized'
      ? 'W 改變時，height 自動補償，area 始終守恆'
      : 'Height 被鎖住後，改變 W 會漏掉或創造 total mass',
  );
  readonly validationMessage = computed(() =>
    this.isNormalized()
      ? 'Normalized：total probability mass = 1'
      : `Not normalized：還需要把整體乘以 ${(1 / this.totalArea()).toFixed(2)}`,
  );
}
