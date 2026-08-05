import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { percent } from './event-stream-math';

@Component({
  selector: 'app-prob-v2-exponential-wait',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.4</p>
        <h2>Exponential wait 的 tail，就是前方 window 完全空白</h2>
        <p class="lede">
          <strong>指數分布（Exponential distribution）</strong>不是新的 event machine。等待 W 超過
          t，等價於從 NOW 起長度 t 的 window 裡 Poisson count 正好是 0。
        </p>
      </header>

      <section class="scene stream-prediction">
        <div>
          <p class="eyebrow">先翻譯事件</p>
          <h3>「下一通電話要等超過 2 分鐘」代表前 2 分鐘內有幾通？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="判斷等待超過兩分鐘時的事件數">
          <button type="button" [class.selected]="prediction() === 0" (click)="prediction.set(0)">
            0 通</button
          ><button type="button" [class.selected]="prediction() === 1" (click)="prediction.set(1)">
            1 通
          </button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback">
            @if (prediction() === 0) {
              <strong>對。若 window 裡已經有 event，等待早就結束了。</strong>
            } @else {
              一通已足以停止等待；W&gt;2 要求整段 [0,2] 完全沒有 mark。
            }
          </p>
        }
      </section>

      <section class="stream-dual-controls">
        <label
          >Rate λ · events/min<input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            [value]="rate()"
            (input)="rate.set(+$any($event).target.value)"
          /><strong>{{ fixed(rate(), 1) }}</strong></label
        ><label
          >Threshold t · minutes<input
            type="range"
            min="0.5"
            max="8"
            step="0.5"
            [value]="threshold()"
            (input)="threshold.set(+$any($event).target.value)"
          /><strong>{{ fixed(threshold(), 1) }}</strong></label
        >
      </section>

      <section class="exponential-board">
        <div class="empty-window">
          <span class="now-mark">NOW</span>
          <div class="empty-zone" [style.width.%]="(threshold() / 8) * 100">
            <span>0 events through t={{ fixed(threshold(), 1) }}</span>
          </div>
          <i class="next-event" [style.left.%]="Math.min(96, (threshold() / 8) * 100 + 5)"
            ><b></b><small>next event</small></i
          >
        </div>
        <div class="survival-readout">
          <span class="card-label">SAME EVENT · TWO LANGUAGES</span>
          <div>
            <span>wait language</span><strong>W &gt; {{ fixed(threshold(), 1) }}</strong>
          </div>
          <i>⇔</i>
          <div><span>count language</span><strong>N(t) = 0</strong></div>
          <b>{{ probabilityLabel() }}</b>
        </div>
        <div class="density-strip">
          @for (bar of densityBars(); track bar.x) {
            <div [class.tail]="bar.x >= threshold()" [style.height.%]="(bar.height / rate()) * 100">
              <i></i><small>{{ showTick(bar.x) }}</small>
            </div>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="empty-core" aria-hidden="true">
          <span>W &gt; t</span><i>⇔</i><strong>zero marks in [0,t]</strong>
        </div>
        <div>
          <span class="card-label">Waiting tail = empty-window probability</span>
          <p><strong>Poisson 的 zero-count bar，正是 Exponential 的 survival curve。</strong></p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：survival、CDF、PDF 與平均等待</summary>
        <div class="stream-formulas">
          <app-math e="P(W>t)=P(N(t)=0)=e^{-\\lambda t}" /><app-math
            e="F_W(t)=1-e^{-\\lambda t},\\quad f_W(t)=\\lambda e^{-\\lambda t},\\quad E[W]=1/\\lambda"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ExponentialWaitComponent {
  protected readonly Math = Math;
  readonly prediction = signal<number | null>(null);
  readonly rate = signal(0.4);
  readonly threshold = signal(3);
  readonly survival = computed(() => Math.exp(-this.rate() * this.threshold()));
  readonly probabilityLabel = computed(
    () => `${percent(this.survival())} chance both statements are true`,
  );
  readonly densityBars = computed(() =>
    Array.from({ length: 33 }, (_, i) => {
      const x = i / 4;
      return { x, height: this.rate() * Math.exp(-this.rate() * x) };
    }),
  );
  fixed(value: number, digits: number): string {
    return value.toFixed(digits);
  }
  showTick(x: number): string {
    return x % 2 === 0 ? `${x}` : '';
  }
}
