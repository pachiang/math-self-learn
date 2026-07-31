import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-expectation-balance',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch13">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 13.1</p>
        <h2>Expectation 不是最可能的答案，而是整張重量圖的平衡點</h2>
        <p class="lede">
          <strong>期望值（expected value / expectation）</strong>把每個 possible value
          的位置與重量一起納入。它是 distribution 的 center of mass，不保證下一次會真的出現。
        </p>
      </header>

      <section class="scene">
        <div class="moment-prediction">
          <div>
            <p class="eyebrow">先預測 · one lottery ticket</p>
            <h3>90% 得 $0、10% 得 $100。這張 ticket 的 expectation 在哪裡？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測彩票期望值">
            @for (choice of [0, 10, 100]; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                &#36;{{ choice }}
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 10) {
              <strong>對，balance point 是 $10。</strong>它不是 possible payout，卻能平衡 0 與 100
              的 weighted pulls。
            } @else if (prediction() === 0) {
              $0 是 mode，也就是最可能 outcome；expectation 還要讓右端 10% 的 $100 weight 參與。
            } @else {
              $100 是 jackpot value，但只有 10% mass；它無法代表整張 distribution 的中心。
            }
          </p>
        }
      </section>

      <section class="expectation-control">
        <label for="jackpot-probability">Jackpot probability</label>
        <input
          id="jackpot-probability"
          type="range"
          min="5"
          max="50"
          step="5"
          [value]="jackpotProbability()"
          (input)="jackpotProbability.set(+$any($event).target.value)"
        />
        <strong>{{ jackpotProbability() }}%</strong>
      </section>

      <section class="balance-board">
        <div class="balance-stage">
          <p class="eyebrow">Probability mass on a number line</p>
          <h3>調整右端重量，fulcrum 會自己尋找平衡</h3>
          <div class="seesaw">
            <div class="mass-block zero" [style.height.px]="zeroMassHeight()">
              <strong>{{ 100 - jackpotProbability() }}%</strong><span>$0</span>
            </div>
            <div class="mass-block jackpot" [style.height.px]="jackpotMassHeight()">
              <strong>{{ jackpotProbability() }}%</strong><span>$100</span>
            </div>
            <div class="beam"></div>
            <div class="fulcrum" [style.left.%]="expectation()">
              <i></i><strong>E[X] = &#36;{{ expectation() }}</strong>
            </div>
            <div class="number-line">
              @for (tick of [0, 20, 40, 60, 80, 100]; track tick) {
                <span [style.left.%]="tick">{{ tick }}</span>
              }
            </div>
          </div>
        </div>

        <div class="balance-readout">
          <span class="card-label">WEIGHTED BALANCE</span>
          <div class="torque-row">
            <div>
              <span>$0 mass</span><strong>{{ 100 - jackpotProbability() }}%</strong>
            </div>
            <i>balances at</i>
            <div>
              <span>$100 mass</span><strong>{{ jackpotProbability() }}%</strong>
            </div>
          </div>
          <strong class="expectation-number">&#36;{{ expectation() }}</strong>
          <p>
            最可能 payout 仍是 &#36;{{ jackpotProbability() < 50 ? 0 : 100 }}；possible payouts
            仍只有 &#36;0 與 &#36;100。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="expectation-core" aria-hidden="true">
          <span>mode</span><strong>$0</strong><i>≠</i><span>balance point</span
          ><strong>&#36;{{ expectation() }}</strong>
        </div>
        <div>
          <span class="card-label">Most likely 看最高 mass；expectation 看整體 balance</span>
          <p>
            <strong>Expectation 可以落在沒有任何 probability mass 的位置。</strong>
            它是 distribution 的摘要，不是單次 outcome 的預言。
          </p>
        </div>
      </aside>

      <section class="transfer-check">
        <p class="eyebrow">遷移一下 · fair die</p>
        <h3>公平骰子的 expectation 是 3.5；這有矛盾嗎？</h3>
        <button type="button" (click)="transferOpen.set(!transferOpen())">
          {{ transferOpen() ? '收起解讀' : '揭曉解讀' }}
        </button>
        @if (transferOpen()) {
          <p class="feedback">
            沒有。3.5 是 1–6 等重 masses 的 balance point，不需要是骰子能出現的點數。
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>公式層：discrete、continuous expectation 與 LOTUS</summary>
        <div>
          <div class="math-line"><app-math e="E[X]=\\sum_x x\\,P(X=x)" /></div>
          <div class="math-line"><app-math e="E[X]=\\int_{-\\infty}^{\\infty}x f_X(x)\\,dx" /></div>
          <p>
            更一般地，<strong>LOTUS（law of the unconscious statistician）</strong>允許直接在 X 的
            distribution 上計算 transformed value：
          </p>
          <div class="math-line"><app-math e="E[g(X)]=\\sum_x g(x)p_X(x)" /></div>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ExpectationBalanceComponent {
  readonly prediction = signal<number | null>(null);
  readonly jackpotProbability = signal(10);
  readonly transferOpen = signal(false);
  readonly expectation = computed(() => this.jackpotProbability());
  readonly zeroMassHeight = computed(() => 42 + (100 - this.jackpotProbability()) * 1.15);
  readonly jackpotMassHeight = computed(() => 42 + this.jackpotProbability() * 1.15);
}
