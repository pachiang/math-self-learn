import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-probability-mass',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch3">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 3.2</p>
        <h2>整個可能世界，只有一份重量可以分</h2>
        <p class="lede">
          probability mass 可以分得平均，也可以偏向某些 outcomes； 但所有 outcomes
          合在一起必須剛好拿完總量 1。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">先設定 relative weight，再看 probability</p>
            <h3>把骰子調成公平、偏向 6，或你自己的形狀</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇骰子重量 preset">
            <button type="button" [class.active]="preset() === 'fair'" (click)="setPreset('fair')">
              Fair die
            </button>
            <button
              type="button"
              [class.active]="preset() === 'loaded'"
              (click)="setPreset('loaded')"
            >
              Loaded toward 6
            </button>
            <button type="button" [class.active]="preset() === 'ramp'" (click)="setPreset('ramp')">
              Increasing
            </button>
          </div>
        </div>
      </section>

      <section class="normalization-board">
        <div class="weight-editor">
          <p class="eyebrow">Raw weights · 只表示相對偏好</p>
          <h3>拖動任一 outcome 的重量</h3>
          <div class="weight-grid">
            @for (weight of rawWeights(); track $index) {
              <div class="weight-column">
                <div class="bar-track">
                  <i class="weight-fill" [style.height.%]="(weight / maxWeight()) * 100"></i>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  [value]="weight"
                  [attr.aria-label]="'結果 ' + ($index + 1) + ' 的 relative weight'"
                  (input)="updateWeight($index, +$any($event).target.value)"
                />
                <strong>{{ $index + 1 }}</strong>
                <span>w={{ weight }}</span>
              </div>
            }
          </div>
        </div>

        <div class="normalization-side">
          <div class="total-card">
            <span>Raw weight total</span>
            <strong>{{ rawTotal() }}</strong>
            <p>raw weights 可以乘上同一個常數而不改變模型；真正重要的是彼此比例。</p>
          </div>
          <div class="normalization-flow">
            <div>
              <span>outcome 6 weight</span>
              <strong>{{ rawWeights()[5] }}</strong>
            </div>
            <i>÷ {{ rawTotal() }}</i>
            <div>
              <span>P(6)</span>
              <strong>{{ decimal(probabilities()[5]) }}</strong>
            </div>
          </div>
          <div class="total-card">
            <span>Normalized probability total</span>
            <strong>{{ probabilityTotal() }}</strong>
            <p>normalization 把 relative weights 轉成總和恰好為 1 的 probability distribution。</p>
          </div>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">同一份總量 1，被切成不同寬度</p>
            <h3>這才是 outcomes 真正承接的 probability mass</h3>
          </div>
          <p>
            每個區塊寬度是 normalized probability。你增加一個 raw weight 時， 其他區塊即使 raw
            weight 沒變，占總量 1 的比例也會縮小。
          </p>
        </div>
        <div class="distribution-strip" aria-label="骰子 outcomes 的 probability distribution">
          @for (probability of probabilities(); track $index) {
            <div [style.width.%]="probability * 100">
              <span>{{ $index + 1 }}</span>
              <span>{{ percent(probability) }}</span>
            </div>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="normalization-flow" aria-hidden="true">
          <div>
            <span>relative weights</span>
            <strong>2 : 3 : 5</strong>
          </div>
          <i>normalize</i>
          <div>
            <span>probability mass</span>
            <strong>.2 + .3 + .5 = 1</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Weight 決定形狀，normalization 固定總量</span>
          <p>
            <strong>probability distribution 是把總量 1 分配給所有 outcomes。</strong>
            relative weight 告訴我們彼此多重；除以總 weight 後，才得到 probability。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：normalization 做了什麼？</summary>
        <div>
          <p>
            若 outcomes 的非負 raw weights 是
            <app-math e="w_1,ldots,w_n" />，而且至少一個 weight 大於 0， normalized probability
            定義為：
          </p>
          <div class="math-line">
            <app-math e="p_i=rac{w_i}{sum_{j=1}^{n} w_j}" />
          </div>
          <p>因此所有 probabilities 自動加總為 1：</p>
          <div class="math-line">
            <app-math e="sum_{i=1}^{n}p_i=rac{sum_i w_i}{sum_j w_j}=1" />
          </div>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ProbabilityMassComponent {
  readonly preset = signal<'fair' | 'loaded' | 'ramp' | 'custom'>('fair');
  readonly rawWeights = signal([1, 1, 1, 1, 1, 1]);
  readonly rawTotal = computed(() => this.rawWeights().reduce((sum, weight) => sum + weight, 0));
  readonly maxWeight = computed(() => Math.max(...this.rawWeights()));
  readonly probabilities = computed(() =>
    this.rawWeights().map((weight) => weight / this.rawTotal()),
  );
  readonly probabilityTotal = computed(() =>
    this.probabilities()
      .reduce((sum, probability) => sum + probability, 0)
      .toFixed(3),
  );

  setPreset(preset: 'fair' | 'loaded' | 'ramp'): void {
    this.preset.set(preset);
    const weights = {
      fair: [1, 1, 1, 1, 1, 1],
      loaded: [1, 1, 1, 1, 1, 7],
      ramp: [1, 2, 3, 4, 5, 6],
    };
    this.rawWeights.set(weights[preset]);
  }

  updateWeight(index: number, value: number): void {
    const next = [...this.rawWeights()];
    next[index] = value;
    this.rawWeights.set(next);
    this.preset.set('custom');
  }

  percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  decimal(value: number): string {
    return value.toFixed(3);
  }
}
