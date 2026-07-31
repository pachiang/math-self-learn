import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-bayes-weight-update',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch10">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 10.3</p>
        <h2>Bayes update：先讓 evidence 篩選 weights，再把 survivors 拉回 100%</h2>
        <p class="lede">
          <strong>先驗（prior）</strong>是 evidence 前的起始重量；
          <strong>likelihood</strong>決定每個 hypothesis 有多少重量能通過 evidence gate；
          <strong>後驗（posterior）</strong>則是 survivors 重新正規化後的比例。
        </p>
      </header>

      <section class="scene">
        <div class="bayes-prediction">
          <div>
            <p class="eyebrow">先預測 · competing hypotheses</p>
            <h3>
              P(H)=10%、P(E|H)=80%、P(E|not H)=30%。雖然 H 更會產生 E，看到 E 後 P(H|E) 約多少？
            </h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測 evidence 後假設的後驗機率">
            @for (choice of [80, 22.9, 72.7]; track choice) {
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
            @if (prediction() === 22.9) {
              <strong>對。</strong>H 留下 10%×80%=8%；alternative 留下 90%×30%=27%。H 只占 survivors
              的 8/35。
            } @else if (prediction() === 80) {
              80% 是 likelihood，不是 posterior；它尚未和 90% 起始重量的 alternative 競爭。
            } @else {
              72.7% 只比較 80 與 30，忽略兩個 hypotheses 的 prior weights 並不相同。
            }
          </p>
        }
      </section>

      <section class="updater-controls">
        <div class="updater-control">
          <label for="prior-h">Prior P(H)</label>
          <input
            id="prior-h"
            type="range"
            min="1"
            max="99"
            [value]="priorH()"
            (input)="priorH.set(+$any($event).target.value)"
          />
          <strong>{{ priorH() }}%</strong>
        </div>
        <div class="updater-control">
          <label for="likelihood-h">Likelihood P(E|H)</label>
          <input
            id="likelihood-h"
            type="range"
            min="1"
            max="99"
            [value]="likelihoodH()"
            (input)="likelihoodH.set(+$any($event).target.value)"
          />
          <strong>{{ likelihoodH() }}%</strong>
        </div>
        <div class="updater-control">
          <label for="likelihood-alt">P(E|not H)</label>
          <input
            id="likelihood-alt"
            type="range"
            min="1"
            max="99"
            [value]="likelihoodAlternative()"
            (input)="likelihoodAlternative.set(+$any($event).target.value)"
          />
          <strong>{{ likelihoodAlternative() }}%</strong>
        </div>
      </section>

      <section class="updater-board">
        <div class="weight-machine">
          <p class="eyebrow">Unnormalized evidence weights</p>
          <h3>每條 lane：prior width 通過自己的 likelihood gate</h3>

          <div class="weight-lane">
            <span>Hypothesis H</span>
            <div class="weight-track">
              <div class="weight-fill" [style.width.%]="priorH()">prior {{ priorH() }}%</div>
            </div>
            <div class="likelihood-gate">× {{ likelihoodH() }}%</div>
            <div class="weight-track">
              <div class="weight-fill" [style.width.%]="weightH()">
                {{ fixed(weightH()) }}
              </div>
            </div>
          </div>

          <div class="weight-lane">
            <span>Alternative</span>
            <div class="weight-track">
              <div class="weight-fill alternative" [style.width.%]="priorAlternative()">
                prior {{ priorAlternative() }}%
              </div>
            </div>
            <div class="likelihood-gate">× {{ likelihoodAlternative() }}%</div>
            <div class="weight-track">
              <div class="weight-fill alternative" [style.width.%]="weightAlternative()">
                {{ fixed(weightAlternative()) }}
              </div>
            </div>
          </div>

          <div class="bayes-map">
            <div>
              <span>H SURVIVES</span>
              <strong>{{ fixed(weightH()) }}%</strong>
            </div>
            <i>+</i>
            <div>
              <span>ALTERNATIVE SURVIVES</span>
              <strong>{{ fixed(weightAlternative()) }}%</strong>
            </div>
          </div>
        </div>

        <div class="posterior-panel">
          <span class="card-label">NORMALIZE THE SURVIVORS</span>
          <strong>P(H | E) = {{ posteriorPercent() }}</strong>
          <div class="posterior-bar" aria-label="兩個假設的後驗比例">
            <div class="posterior-h" [style.width.%]="posteriorH() * 100">
              @if (posteriorH() > 0.12) {
                H<br />{{ posteriorPercent() }}
              }
            </div>
            <div class="posterior-alt" [style.width.%]="(1 - posteriorH()) * 100">
              not H<br />{{ posteriorAlternativePercent() }}
            </div>
          </div>
          <p>
            Evidence-compatible total =
            {{ fixed(totalEvidenceWeight()) }}%。重新正規化只改尺度，不改兩段 survivors 的相對重量。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="bayes-map" aria-hidden="true">
          <div>
            <span>Unnormalized posterior</span>
            <strong>prior × likelihood</strong>
          </div>
          <i>normalize</i>
          <div>
            <span>Posterior</span>
            <strong>survivor / all survivors</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Posterior ∝ prior × likelihood</span>
          <p>
            <strong>likelihood 決定 evidence 偏愛誰，prior 決定比賽從哪裡開始。</strong>
            Bayes update 同時尊重兩者；normalize 則讓更新後 weights 再次合計為 1。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：binary Bayes formula 與 odds form</summary>
        <div>
          <div class="math-line">
            <app-math
              e="P(H\\mid E)=\\frac{P(H)P(E\\mid H)}{P(H)P(E\\mid H)+P(H^c)P(E\\mid H^c)}"
            />
          </div>
          <p>若用 odds 表示，normalization denominator 會在比例中消去：</p>
          <div class="math-line">
            <app-math
              e="\\frac{P(H\\mid E)}{P(H^c\\mid E)}=\\frac{P(H)}{P(H^c)}\\times\\frac{P(E\\mid H)}{P(E\\mid H^c)}"
            />
          </div>
          <p>也就是 posterior odds = prior odds × likelihood ratio。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BayesWeightUpdateComponent {
  readonly prediction = signal<number | null>(null);
  readonly priorH = signal(10);
  readonly likelihoodH = signal(80);
  readonly likelihoodAlternative = signal(30);
  readonly priorAlternative = computed(() => 100 - this.priorH());
  readonly weightH = computed(() => (this.priorH() * this.likelihoodH()) / 100);
  readonly weightAlternative = computed(
    () => (this.priorAlternative() * this.likelihoodAlternative()) / 100,
  );
  readonly totalEvidenceWeight = computed(() => this.weightH() + this.weightAlternative());
  readonly posteriorH = computed(() => this.weightH() / this.totalEvidenceWeight());
  readonly posteriorPercent = computed(() => `${(this.posteriorH() * 100).toFixed(1)}%`);
  readonly posteriorAlternativePercent = computed(
    () => `${((1 - this.posteriorH()) * 100).toFixed(1)}%`,
  );

  fixed(value: number): string {
    return value.toFixed(1);
  }
}
