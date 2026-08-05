import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { poissonPmf, percent } from './event-stream-math';

@Component({
  selector: 'app-prob-v2-poisson-window',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.2</p>
        <h2>Poisson：固定 window，讓 event count 隨機</h2>
        <p class="lede">
          <strong>卜瓦松分布（Poisson distribution）</strong>回答一段 exposure 裡會接住幾個
          events。Rate λ 與 window length t 會先合成一個量：expected count μ=λt。
        </p>
      </header>

      <section class="scene stream-prediction">
        <div>
          <p class="eyebrow">先預測 · stretch exposure</p>
          <h3>平均每小時 3 通電話；window 從 1 小時拉成 2 小時，重量中心在哪裡？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="預測延長時間後的期望次數">
          <button type="button" [class.selected]="prediction() === 3" (click)="prediction.set(3)">
            仍是 3</button
          ><button type="button" [class.selected]="prediction() === 6" (click)="prediction.set(6)">
            移到 6
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 6) {
              <strong>對。Exposure 加倍，expected count 也加倍。</strong>
            } @else {
              λ 是每單位時間的 rate；真正控制 count map 的是 λt。
            }
          </p>
        }
      </section>

      <section class="stream-dual-controls">
        <label
          >Rate λ · events/hour<input
            type="range"
            min="1"
            max="6"
            step="0.5"
            [value]="rate()"
            (input)="rate.set(+$any($event).target.value)"
          /><strong>{{ format(rate()) }}</strong></label
        >
        <label
          >Window t · hours<input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            [value]="duration()"
            (input)="duration.set(+$any($event).target.value)"
          /><strong>{{ format(duration()) }}</strong></label
        >
      </section>

      <section class="poisson-board">
        <div class="exposure-line">
          <span class="rate-label">λ = {{ format(rate()) }} / hour</span>
          <div class="window-ruler" [style.width.%]="(duration() / 3) * 100">
            <span>t = {{ format(duration()) }} h</span>
            @for (mark of expectedMarks(); track mark) {
              <i [style.left.%]="mark"></i>
            }
          </div>
        </div>
        <div class="poisson-chart">
          <div class="mean-pin" [style.left.%]="meanPosition()">
            <span>balance μ={{ format(mean()) }}</span>
          </div>
          @for (bar of bars(); track bar.k) {
            <button
              type="button"
              [class.active]="selectedK() === bar.k"
              (click)="selectedK.set(bar.k)"
            >
              <small>{{ percentValue(bar.p) }}</small
              ><i [style.height.%]="(bar.p / maxProbability()) * 100"></i
              ><strong>{{ bar.k }}</strong>
            </button>
          }
        </div>
        <p class="poisson-reading">
          P(N={{ selectedK() }}) = <strong>{{ percentValue(bars()[selectedK()].p) }}</strong
          >；μ={{ format(mean()) }} 是 balance point，不保證這次正好出現 {{ format(mean()) }} 件。
        </p>
      </section>

      <aside class="insight-card">
        <div class="exposure-core" aria-hidden="true">
          <span>rate λ</span><i>×</i><span>exposure t</span><i>=</i
          ><strong>expected count μ</strong>
        </div>
        <div>
          <span class="card-label">Rate × exposure，不是 guaranteed count</span>
          <p>
            <strong
              >相同 μ 會得到相同 Poisson count map，不管它來自高 rate 短 window 或低 rate 長
              window。</strong
            >
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：Poisson PMF、mean 與 variance</summary>
        <div class="stream-formulas">
          <app-math e="P(N(t)=k)=e^{-\\lambda t}\\frac{(\\lambda t)^k}{k!}" /><app-math
            e="E[N(t)]=\\operatorname{Var}(N(t))=\\lambda t"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2PoissonWindowComponent {
  readonly prediction = signal<number | null>(null);
  readonly rate = signal(3);
  readonly duration = signal(1.5);
  readonly selectedK = signal(4);
  readonly mean = computed(() => this.rate() * this.duration());
  readonly bars = computed(() =>
    Array.from({ length: 13 }, (_, k) => ({ k, p: poissonPmf(k, this.mean()) })),
  );
  readonly maxProbability = computed(() => Math.max(...this.bars().map((bar) => bar.p)));
  readonly meanPosition = computed(() => Math.min(100, (this.mean() / 12) * 100));
  readonly expectedMarks = computed(() =>
    Array.from(
      { length: Math.max(1, Math.round(this.mean())) },
      (_, i) => ((i + 0.65) / Math.max(1, Math.round(this.mean()))) * 92,
    ),
  );
  format(value: number): string {
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }
  percentValue(value: number): string {
    return percent(value);
  }
}
