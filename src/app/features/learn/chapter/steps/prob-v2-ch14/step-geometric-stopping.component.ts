import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-geometric-stopping',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.6</p>
        <h2>把框拿掉：不先決定做幾次，而是等到第一次 success</h2>
        <p class="lede">
          <strong>幾何分布（Geometric distribution）</strong>使用同一台 Bernoulli generator；
          改變的只有 stopping rule。現在固定的是「等到 first success」，random 的是 trial count T。
        </p>
      </header>

      <section class="scene binary-prediction">
        <div>
          <p class="eyebrow">先把 measurement 說清楚</p>
          <h3>sequence 0001 在第一次 success 停止。T 是 3 還是 4？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="判斷等待第一次成功的試驗次數">
          <button type="button" [class.selected]="prediction() === 3" (click)="prediction.set(3)">
            T = 3
          </button>
          <button type="button" [class.selected]="prediction() === 4" (click)="prediction.set(4)">
            T = 4
          </button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback">
            @if (prediction() === 4) {
              <strong>對。這裡的 T 計算包含成功的那一次 trial。</strong>
            } @else {
              3 是成功前的 failure 數；本頁採用的 T 是 trials until success，所以要把最後的 1
              算進去。
            }
          </p>
        }
      </section>

      <section class="binary-control">
        <label for="geometric-p">每次 success chance p</label>
        <input
          id="geometric-p"
          type="range"
          min="10"
          max="90"
          step="5"
          [value]="probability()"
          (input)="probability.set(+$any($event).target.value)"
        />
        <output>{{ probability() }}%</output>
      </section>

      <section class="stopping-lab">
        <div class="trial-tape">
          <div class="tape-heading">
            <span class="card-label">REVEAL THE TAPE</span>
            <button type="button" (click)="revealed.set(revealed() >= 4 ? 0 : revealed() + 1)">
              {{ revealed() >= 4 ? '重新播放' : '揭開下一格' }}
            </button>
          </div>
          <div class="tape-cells">
            @for (bit of ['0', '0', '0', '1']; track $index) {
              <div [class.revealed]="$index < revealed()" [class.success]="bit === '1'">
                <small>trial {{ $index + 1 }}</small>
                <strong>{{ $index < revealed() ? bit : '?' }}</strong>
                @if ($index < revealed() && bit === '1') {
                  <span>STOP</span>
                }
              </div>
            }
          </div>
          <p>{{ tapeMessage() }}</p>
        </div>

        <div class="geometric-bars">
          <span class="card-label">ALL POSSIBLE STOP TIMES</span>
          <div>
            @for (t of stopTimes; track t) {
              <button type="button" [class.active]="selectedT() === t" (click)="selectedT.set(t)">
                <span class="bar" [style.height.%]="(geometric(t) / geometric(1)) * 100"></span>
                <small>{{ percent(geometric(t)) }}%</small>
                <strong>T={{ t }}</strong>
              </button>
            }
          </div>
          <p>
            T={{ selectedT() }} 需要先看到
            <strong>{{ selectedT() - 1 }} 個 failures</strong>，最後再看到
            <strong>1 個 success</strong>。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="stopping-rule-core" aria-hidden="true">
          @for (item of failureCells(); track item) {
            <span>0</span><i>→</i>
          }
          <strong>1 · STOP</strong>
        </div>
        <div>
          <span class="card-label">Failures … then first success</span>
          <p>
            <strong
              >Binomial 固定 n、讓 success count 隨機；Geometric 固定 first success、讓 T
              隨機。</strong
            >
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式與 convention：T 從 1 開始，或 failures 從 0 開始</summary>
        <div class="binary-formulas">
          <app-math e="P(T=t)=(1-p)^{t-1}p,\\qquad t=1,2,\\ldots" />
          <p>
            有些資料把 random variable 定義成成功前的 failure 數 F=T−1，因此 support 從 0
            開始。使用前一定要先看作者在數什麼。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2GeometricStoppingComponent {
  readonly prediction = signal<number | null>(null);
  readonly probability = signal(35);
  readonly revealed = signal(0);
  readonly selectedT = signal(4);
  readonly stopTimes = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly tapeMessage = computed(() => {
    if (this.revealed() === 0)
      return '每個 failure 都只代表「繼續」，不會改變事前設定的 stopping target。';
    if (this.revealed() < 4) return `目前只有 ${this.revealed()} 個 failures；實驗尚未停止。`;
    return '第 4 格首次出現 1，所以 T=4。';
  });
  readonly failureCells = computed(() => Array.from({ length: this.selectedT() - 1 }, (_, i) => i));

  geometric(t: number): number {
    const p = this.probability() / 100;
    return (1 - p) ** (t - 1) * p;
  }
  percent(value: number): string {
    return (value * 100).toFixed(1);
  }
}
