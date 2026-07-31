import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-geometric-memoryless',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.7</p>
        <h2>Memorylessness：剪掉已知的 failures，未來的機制沒有變</h2>
        <p class="lede">
          在 fixed p、independent trials 下，已經等待多久不會讓下一次 success 更「欠你」。
          <strong>無記憶性（memorylessness）</strong>來自機制沒有改變，不是忘記資料。
        </p>
      </header>

      <section class="scene binary-prediction">
        <div>
          <p class="eyebrow">先預測 · gambler's fallacy check</p>
          <h3>公平硬幣已連續五次反面，第六次正面的 chance 是多少？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="預測連續反面後正面機率">
          @for (choice of [40, 50, 60]; track choice) {
            <button
              type="button"
              [class.selected]="prediction() === choice"
              (click)="prediction.set(choice)"
            >
              {{ choice }}%
            </button>
          }
        </div>
        @if (prediction() !== null) {
          <p class="feedback">
            @if (prediction() === 50) {
              <strong>仍是 50%。</strong>先前反面很罕見，不會回頭改寫下一次硬幣的 p。
            } @else {
              「應該補回來」是對長期比例的誤讀；independent trial 的下一次 chance 仍是原來的 p。
            }
          </p>
        }
      </section>

      <section class="memory-controls">
        <label
          >已經 failure 了 m 次
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            [value]="history()"
            (input)="history.set(+$any($event).target.value)"
          />
          <strong>{{ history() }}</strong>
        </label>
        <label
          >再等至少 s 次
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            [value]="future()"
            (input)="future.set(+$any($event).target.value)"
          />
          <strong>{{ future() }}</strong>
        </label>
        <button type="button" [class.active]="fatigue()" (click)="fatigue.set(!fatigue())">
          {{ fatigue() ? 'Fatigue mode ON' : 'Stable p mode' }}
        </button>
      </section>

      <section class="memory-board">
        <div class="memory-tape">
          <span class="card-label">CONDITION ON SURVIVING m FAILURES</span>
          <div class="history-strip">
            @for (item of historyCells(); track item) {
              <i>0</i>
            }
            <b>NOW</b>
            @for (item of futureCells(); track item) {
              <span>?</span>
            }
          </div>
          <button type="button" (click)="cutView.set(!cutView())">
            {{ cutView() ? '還原完整歷史' : '剪掉已知歷史' }}
          </button>
        </div>

        <div class="tail-comparison" [class.cut]="cutView()">
          <div>
            <span>從一開始看</span>
            <strong>P(T &gt; {{ history() + future() }} | T &gt; {{ history() }})</strong>
            <div class="tail-meter"><i [style.width.%]="conditionalTail() * 100"></i></div>
            <b>{{ percent(conditionalTail()) }}</b>
          </div>
          <div>
            <span>從現在重新看</span>
            <strong>P(T &gt; {{ future() }})</strong>
            <div class="tail-meter fresh"><i [style.width.%]="freshTail() * 100"></i></div>
            <b>{{ percent(freshTail()) }}</b>
          </div>
          <p [class.warning]="fatigue()">{{ comparisonMessage() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="memory-core" aria-hidden="true">
          <span>known failures</span><i>✂</i><strong>same future machine</strong>
        </div>
        <div>
          <span class="card-label">History 可丟掉，是因為 mechanism 沒變</span>
          <p>
            <strong>一旦 p 隨等待時間改變，memorylessness 就消失。</strong>
            它不是普遍的「過去不重要」，而是一個非常具體的 model property。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>推導層：兩段 tail 為什麼會完全相消？</summary>
        <div class="binary-formulas">
          <app-math e="P(T>m+s\\mid T>m)=\\frac{(1-p)^{m+s}}{(1-p)^m}=(1-p)^s=P(T>s)" />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2GeometricMemorylessComponent {
  readonly prediction = signal<number | null>(null);
  readonly history = signal(5);
  readonly future = signal(3);
  readonly fatigue = signal(false);
  readonly cutView = signal(false);
  readonly historyCells = computed(() => Array.from({ length: this.history() }, (_, i) => i));
  readonly futureCells = computed(() => Array.from({ length: this.future() }, (_, i) => i));
  readonly freshTail = computed(() => 0.5 ** this.future());
  readonly conditionalTail = computed(() => {
    if (!this.fatigue()) return this.freshTail();
    const futureProbability = Math.max(0.2, 0.5 - this.history() * 0.025);
    return (1 - futureProbability) ** this.future();
  });
  readonly comparisonMessage = computed(() =>
    this.fatigue()
      ? 'p 隨歷史改變：兩條 tail 不再重合，因此不能剪掉 history。'
      : '兩個 meters 完全重合：conditioning 只裁掉已知前段，未來 law 不變。',
  );

  percent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}
