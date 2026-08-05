import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { percent } from './event-stream-math';

@Component({
  selector: 'app-prob-v2-exponential-memoryless',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.5</p>
        <h2>已經等多久不重要，前提是 rate 從未改變</h2>
        <p class="lede">
          連續時間的<strong>無記憶性（memorylessness）</strong>不是「過去沒有資訊」，而是已知空白區段剪掉後，未來仍由相同
          constant-rate machine 生成。
        </p>
      </header>

      <section class="scene stream-prediction">
        <div>
          <p class="eyebrow">先預測 · already waited</p>
          <h3>固定 rate 下已等 8 分鐘；再等超過 3 分鐘的 chance 會因久候而變小嗎？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="判斷已等待時間是否改變未來機率">
          <button
            type="button"
            [class.selected]="prediction() === 'smaller'"
            (click)="prediction.set('smaller')"
          >
            會變小</button
          ><button
            type="button"
            [class.selected]="prediction() === 'same'"
            (click)="prediction.set('same')"
          >
            完全相同
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'same') {
              <strong>對。若 mechanism 沒變，NOW 右側仍是一條全新的 Exponential wait。</strong>
            } @else {
              久候讓完整 history 變罕見，卻不會讓 constant-rate machine 在 NOW 之後加速。
            }
          </p>
        }
      </section>

      <section class="memory-stream-controls">
        <label
          >Known empty history m<input
            type="range"
            min="0"
            max="10"
            step="1"
            [value]="history()"
            (input)="history.set(+$any($event).target.value)"
          /><strong>{{ history() }} min</strong></label
        ><label
          >Future threshold s<input
            type="range"
            min="1"
            max="6"
            step="1"
            [value]="future()"
            (input)="future.set(+$any($event).target.value)"
          /><strong>{{ future() }} min</strong></label
        ><button type="button" [class.active]="aging()" (click)="aging.set(!aging())">
          {{ aging() ? 'Aging rate ON' : 'Constant rate' }}
        </button>
      </section>

      <section class="continuous-memory-board">
        <div class="cut-timeline">
          <span class="history-zone" [style.flex]="Math.max(1, history())"
            >known empty · {{ history() }}</span
          ><b>NOW</b><span class="future-zone" [style.flex]="future()">future · {{ future() }}</span
          ><button type="button" (click)="cut.set(!cut())">
            {{ cut() ? '還原 history' : '剪掉已知空白' }}
          </button>
        </div>
        <div class="continuous-meters" [class.aging]="aging()">
          <div>
            <span>Conditioned after m</span><strong>P(W&gt;m+s | W&gt;m)</strong
            ><i><b [style.width.%]="conditioned() * 100"></b></i><em>{{ label(conditioned()) }}</em>
          </div>
          <div>
            <span>Fresh start at NOW</span><strong>P(W&gt;s)</strong
            ><i><b [style.width.%]="fresh() * 100"></b></i><em>{{ label(fresh()) }}</em>
          </div>
          <p>{{ comparison() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="cut-core" aria-hidden="true">
          <span>known empty history</span><i>✂</i><strong>same future rate</strong>
        </div>
        <div>
          <span class="card-label">History 可剪掉，只因 mechanism 沒變</span>
          <p><strong>一旦 hazard 隨年齡改變，兩條 meters 就不再重合。</strong></p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>推導層：Exponential survival 如何相消？</summary>
        <div class="stream-formulas">
          <app-math
            e="P(W>m+s\\mid W>m)=\\frac{e^{-\\lambda(m+s)}}{e^{-\\lambda m}}=e^{-\\lambda s}=P(W>s)"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ExponentialMemorylessComponent {
  protected readonly Math = Math;
  readonly prediction = signal<'smaller' | 'same' | null>(null);
  readonly history = signal(8);
  readonly future = signal(3);
  readonly aging = signal(false);
  readonly cut = signal(false);
  readonly rate = 0.25;
  readonly fresh = computed(() => Math.exp(-this.rate * this.future()));
  readonly conditioned = computed(() =>
    this.aging() ? Math.exp(-(this.rate + this.history() * 0.025) * this.future()) : this.fresh(),
  );
  readonly comparison = computed(() =>
    this.aging()
      ? 'Rate 隨已等待時間提高：history 真的改變了未來 law。'
      : '兩條 meters 完全重合：剪掉 history 後仍是相同的 machine。',
  );
  label(value: number): string {
    return percent(value);
  }
}
