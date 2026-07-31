import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type DirectionView = 'forward' | 'reverse';

@Component({
  selector: 'app-prob-v2-reverse-conditioning',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch10">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 10.1</p>
        <h2>原因很會產生 evidence，不代表 evidence 大多來自這個原因</h2>
        <p class="lede">
          <strong>likelihood</strong> 問「假設原因成立時，多常看見 evidence」；
          <strong>posterior</strong> 問「已看見 evidence
          後，這個原因占多少」。方向反轉時，其他能產生 evidence 的原因也必須一起進入 denominator。
        </p>
      </header>

      <section class="scene">
        <div class="bayes-prediction">
          <div>
            <p class="eyebrow">先預測 · 100 mornings</p>
            <h3>
              20 天下雨，其中 18 天草地濕；另有 8 個晴天也被 sprinkler 弄濕。看到 wet lawn 後，rain
              probability 是多少？
            </h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測看到濕草地後下雨的機率">
            @for (choice of [90, 69.2, 18]; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                {{ choice }}%
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 69.2) {
              <strong>對，是 18/26 ≈ 69.2%。</strong>wet pool 還有 8 個 sprinkler mornings。
            } @else if (prediction() === 90) {
              90% 是 P(wet|rain)：只站在 20 個 rainy mornings 裡看 wet；題目問的是反方向。
            } @else {
              18 是 true rain-and-wet mornings 的數量，但 posterior 還要除以全部 26 個 wet
              mornings。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Direction switch · same 100 mornings</p>
            <h3>只交換 given 的位置，觀察 denominator 如何改變</h3>
          </div>
          <div class="preset-row" role="group" aria-label="切換條件方向">
            <button
              type="button"
              [class.active]="view() === 'forward'"
              (click)="view.set('forward')"
            >
              P(wet | rain)
            </button>
            <button
              type="button"
              [class.active]="view() === 'reverse'"
              (click)="view.set('reverse')"
            >
              P(rain | wet)
            </button>
          </div>
        </div>
      </section>

      <section class="frequency-board">
        <div class="frequency-panel">
          <p class="eyebrow">Natural frequencies · each tile = one morning</p>
          <h3>{{ frameDescription() }}</h3>
          <div class="morning-grid" aria-label="一百個早晨中的下雨與濕草地分布">
            @for (morning of mornings; track morning) {
              <div
                class="morning-tile"
                [class.rain]="isRain(morning)"
                [class.wet]="isWet(morning)"
                [class.in-frame]="inConditionFrame(morning)"
                [class.outside-frame]="!inConditionFrame(morning)"
              >
                {{ morning + 1 }}
              </div>
            }
          </div>
          <div class="frequency-legend">
            <span><i></i>rain</span>
            <span><i class="wet"></i>wet lawn</span>
            <span>深色外框 = given world</span>
          </div>
        </div>

        <div class="evidence-pool">
          <p class="eyebrow">{{ view() === 'forward' ? 'LIKELIHOOD' : 'POSTERIOR' }}</p>
          <h3>{{ questionSentence() }}</h3>
          <div class="direction-fraction">
            <div>
              <span>{{ numeratorLabel() }}</span>
              <strong>18</strong>
            </div>
            <i>÷</i>
            <div>
              <span>{{ denominatorLabel() }}</span>
              <strong>{{ denominator() }}</strong>
            </div>
          </div>
          <div class="posterior-number">{{ resultFraction() }} = {{ resultPercent() }}</div>
          <p class="feedback">{{ resultExplanation() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="bayes-map" aria-hidden="true">
          <div>
            <span>Likelihood · P(E | H)</span>
            <strong>H 多會產生 E？</strong>
          </div>
          <i>≠ reverse</i>
          <div>
            <span>Posterior · P(H | E)</span>
            <strong>E 中有多少來自 H？</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Reverse conditioning 要讓競爭原因重新進場</span>
          <p>
            <strong>18 個 rain-and-wet mornings 同時出現在兩個方向，但 denominator 不同。</strong>
            反推原因時，sprinkler 產生的 8 個 wet mornings 不能被忽略。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：joint bridge 與 Bayes’ theorem 的需要</summary>
        <div>
          <p>同一塊 joint probability 可以從兩個方向抵達：</p>
          <div class="math-line">
            <app-math e="P(H\\cap E)=P(H)P(E\\mid H)=P(E)P(H\\mid E)" />
          </div>
          <p>因此方向反轉時：</p>
          <div class="math-line">
            <app-math e="P(H\\mid E)=\\frac{P(H)P(E\\mid H)}{P(E)}" />
          </div>
          <p>
            這就是<strong>貝氏定理（Bayes’ theorem）</strong>。本章後面會把 numerator 的
            prior×likelihood 與 denominator 的全部 evidence sources 分別畫出來。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ReverseConditioningComponent {
  readonly mornings = Array.from({ length: 100 }, (_, index) => index);
  readonly prediction = signal<number | null>(null);
  readonly view = signal<DirectionView>('reverse');
  readonly denominator = computed(() => (this.view() === 'forward' ? 20 : 26));
  readonly frameDescription = computed(() =>
    this.view() === 'forward'
      ? 'Given rain：只框住 20 個 rainy mornings'
      : 'Given wet：只框住 26 個 wet mornings',
  );
  readonly questionSentence = computed(() =>
    this.view() === 'forward' ? '下雨時，草地有多少會濕？' : '草地濕時，有多少來自 rain？',
  );
  readonly numeratorLabel = computed(() =>
    this.view() === 'forward' ? 'wet AND rain' : 'rain AND wet',
  );
  readonly denominatorLabel = computed(() =>
    this.view() === 'forward' ? 'all rain mornings' : 'all wet mornings',
  );
  readonly resultFraction = computed(() => (this.view() === 'forward' ? '18/20' : '18/26'));
  readonly resultPercent = computed(() => (this.view() === 'forward' ? '90.0%' : '69.2%'));
  readonly resultExplanation = computed(() =>
    this.view() === 'forward'
      ? '只問 rain 這個原因多常產生 wet evidence。'
      : 'wet evidence pool 中同時包含 rain 與 sprinkler 來源。',
  );

  isRain(morning: number): boolean {
    return morning < 20;
  }

  isWet(morning: number): boolean {
    return morning < 18 || (morning >= 20 && morning < 28);
  }

  inConditionFrame(morning: number): boolean {
    return this.view() === 'forward' ? this.isRain(morning) : this.isWet(morning);
  }
}
