import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-reliability',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch7">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 7.3</p>
        <h2>多一次機會，不是在 success 上硬加；是在壓縮「全部失敗」</h2>
        <p class="lede">
          <strong>可靠度（reliability）</strong>問題常問「n 次內至少成功一次」。最乾淨的動畫不是把
          success cases 一一累加，而是看 all-failure probability 每次再縮一截。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Reality check · 先抓錯誤直覺</p>
            <h3>單次成功率 40%，獨立嘗試 3 次，至少一次成功最接近哪個？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測三次內至少一次成功機率">
            @for (choice of [40, 78.4, 120]; track choice) {
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
            @if (prediction() === 78.4) {
              <strong>對，是 78.4%。</strong>三次全失敗只剩 0.6³ = 21.6%，其餘都是至少一次成功。
            } @else if (prediction() === 120) {
              40% × 3 會把「兩次或三次都成功」的 worlds 重複計入，而且 probability 不可能超過 100%。
            } @else {
              40% 只看了一次；增加獨立機會會降低「一路都沒成功」的 probability。
            }
          </p>
        }
      </section>

      <section class="reliability-controls">
        <div class="reliability-control">
          <label for="success-probability">單次 success probability</label>
          <input
            id="success-probability"
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            [value]="successProbability()"
            (input)="successProbability.set(+$any($event).target.value)"
          />
          <strong>{{ percent(successProbability()) }}</strong>
        </div>
        <div class="reliability-control">
          <label for="attempt-count">獨立嘗試次數 n</label>
          <input
            id="attempt-count"
            type="range"
            min="1"
            max="10"
            [value]="attempts()"
            (input)="attempts.set(+$any($event).target.value)"
          />
          <strong>{{ attempts() }} 次</strong>
        </div>
      </section>

      <section class="reliability-board">
        <div class="mass-decay">
          <p class="eyebrow">Probability mass after {{ attempts() }} attempts</p>
          <h3>all-failure 逐次縮小，空出的 mass 全屬於「至少一次成功」</h3>
          <div class="reliability-strip" aria-label="至少一次成功與全部失敗的機率比例">
            <div class="success-mass" [style.width.%]="atLeastOne() * 100">
              @if (atLeastOne() >= 0.16) {
                <span>≥ 1 success<br />{{ percent(atLeastOne()) }}</span>
              }
            </div>
            <div class="failure-mass" [style.width.%]="allFailure() * 100">
              @if (allFailure() >= 0.08) {
                <span>all F<br />{{ percent(allFailure()) }}</span>
              }
            </div>
          </div>

          <div class="decay-steps" aria-label="一到十次嘗試後全部失敗機率">
            @for (step of decaySteps(); track step.attempt) {
              <div class="decay-step">
                <div class="decay-track">
                  <div class="decay-fill" [style.height.%]="step.probability * 100"></div>
                </div>
                <span [class.current]="step.attempt === attempts()">n={{ step.attempt }}</span>
              </div>
            }
          </div>
        </div>

        <div class="reliability-stats">
          <div class="reliability-stat">
            <span>ONE-TRY FAILURE</span>
            <strong>{{ percent(failureProbability()) }}</strong>
            <p>每多一次獨立嘗試，all-failure mass 再乘上這個比例。</p>
          </div>
          <div class="reliability-stat">
            <span>ALL {{ attempts() }} FAIL</span>
            <strong>{{ percent(allFailure()) }}</strong>
            <p>
              {{ decimal(failureProbability()) }} 的 {{ attempts() }} 次方，是唯一需要追蹤的反面。
            </p>
          </div>
          <div class="reliability-stat highlight">
            <span>AT LEAST ONE SUCCESS</span>
            <strong>{{ percent(atLeastOne()) }}</strong>
            <p>整個 probability mass 扣掉 all-failure 後留下的部分。</p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="flip-map" aria-hidden="true">
          <div>
            <span>More attempts</span>
            <strong>failure mass × q</strong>
          </div>
          <i>repeated decay</i>
          <div>
            <span>At least one</span>
            <strong>1 − shrinking mass</strong>
          </div>
        </div>
        <div>
          <span class="card-label">新增機會，是乘法式地消滅全敗世界</span>
          <p>
            <strong>不要把 p 重複相加。</strong>「至少一次」的 cases
            會彼此重疊；在固定成功率且獨立的 model 中，all-failure path 才能乾淨地一路相乘。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式與假設：何時可以寫成 1−(1−p)ⁿ？</summary>
        <div>
          <p>
            若每次 success probability 都是 p，而且各次嘗試 independent（獨立），則每次 failure
            probability 是 q=1−p：
          </p>
          <div class="math-line">
            <app-math e="P(\\text{all fail})=q^n=(1-p)^n" />
          </div>
          <div class="math-line">
            <app-math e="P(\\text{at least one success})=1-(1-p)^n" />
          </div>
          <p>
            如果重試會改變環境、共用同一個故障原因，或各次成功率不同，就不能直接用同一個 q
            連乘。independence 會在第九章正式拆解；這裡先把假設標清楚。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ReliabilityComponent {
  readonly prediction = signal<number | null>(null);
  readonly successProbability = signal(0.4);
  readonly attempts = signal(3);
  readonly failureProbability = computed(() => 1 - this.successProbability());
  readonly allFailure = computed(() => this.failureProbability() ** this.attempts());
  readonly atLeastOne = computed(() => 1 - this.allFailure());
  readonly decaySteps = computed(() =>
    Array.from({ length: 10 }, (_, index) => ({
      attempt: index + 1,
      probability: this.failureProbability() ** (index + 1),
    })),
  );

  percent(value: number): string {
    const amount = value * 100;
    return `${amount >= 10 ? amount.toFixed(1) : amount.toFixed(2)}%`;
  }

  decimal(value: number): string {
    return value.toFixed(2);
  }
}
