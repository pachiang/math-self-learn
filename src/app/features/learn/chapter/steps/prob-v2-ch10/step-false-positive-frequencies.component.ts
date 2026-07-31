import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type PopulationView = 'all' | 'positive';

@Component({
  selector: 'app-prob-v2-false-positive-frequencies',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch10">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 10.2</p>
        <h2>Test 有 90% sensitivity，不代表 positive 後有 90%</h2>
        <p class="lede">
          當 condition 很少見，龐大的 healthy population 即使只有少量
          <strong>false positives</strong>，也可能淹過 true positives。這就是忽略
          <strong>base rate</strong> 的典型陷阱。
        </p>
      </header>

      <section class="scene">
        <div class="bayes-prediction">
          <div>
            <p class="eyebrow">先預測 · 1000 people</p>
            <h3>
              Prevalence 1%、sensitivity 90%、false-positive rate 10%；positive 後真的有 condition
              約多少？
            </h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測陽性後真的有狀況的比例">
            @for (choice of [90, 8.3, 1]; track choice) {
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
            @if (prediction() === 8.3) {
              <strong>對，約 8.3%。</strong>positive pool 裡是 9 true positives 與 99 false
              positives。
            } @else if (prediction() === 90) {
              90% 是 sensitivity：在真正有 condition 的 10 人裡抓到 9 人，不是 positive pool
              的組成。
            } @else {
              1% 是 test 前的 base rate；positive evidence 確實會提高 probability，只是提高不到
              90%。
            }
          </p>
        }
      </section>

      <section class="prevalence-control">
        <label for="prevalence">Prevalence · base rate</label>
        <input
          id="prevalence"
          type="range"
          min="1"
          max="20"
          step="1"
          [value]="prevalence()"
          (input)="prevalence.set(+$any($event).target.value)"
        />
        <strong>{{ prevalence() }}%</strong>
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Natural-frequency filter</p>
            <h3>固定 sensitivity 90%、false-positive rate 10%，只改 base rate</h3>
          </div>
          <div class="preset-row" role="group" aria-label="切換全體與陽性人群">
            <button type="button" [class.active]="view() === 'all'" (click)="view.set('all')">
              All 1000 people
            </button>
            <button
              type="button"
              [class.active]="view() === 'positive'"
              (click)="view.set('positive')"
            >
              Positive only
            </button>
          </div>
        </div>
      </section>

      <section class="test-board">
        <div class="icon-array-panel">
          <p class="eyebrow">Each square = one person</p>
          <h3>{{ conditionCount() }} 有 condition；{{ healthyCount() }} 沒有</h3>
          <div class="icon-array" aria-label="一千人的檢測結果自然頻率圖">
            @for (person of people; track person) {
              <i
                class="person-dot"
                [class.true-positive]="isTruePositive(person)"
                [class.false-negative]="isFalseNegative(person)"
                [class.false-positive]="isFalsePositive(person)"
                [class.filtered-out]="view() === 'positive' && !isPositive(person)"
              ></i>
            }
          </div>
          <div class="frequency-legend">
            <span><i></i>true positive</span>
            <span><i class="false-positive"></i>false positive</span>
            <span>斜紋 = false negative</span>
          </div>
        </div>

        <div class="test-stats">
          <div class="test-stat">
            <span>TRUE POSITIVES</span>
            <strong>{{ truePositiveCount() }}</strong>
          </div>
          <div class="test-stat">
            <span>FALSE POSITIVES</span>
            <strong>{{ falsePositiveCount() }}</strong>
          </div>
          <div class="test-stat">
            <span>ALL POSITIVES</span>
            <strong>{{ positiveCount() }}</strong>
          </div>
          <div class="test-stat highlight">
            <span>CONDITION GIVEN POSITIVE</span>
            <strong>{{ posteriorPercent() }}</strong>
          </div>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Positive evidence pool</p>
            <h3>只在所有 positive 中重新分配來源</h3>
          </div>
          <p>
            {{ truePositiveCount() }} true positives + {{ falsePositiveCount() }} false positives =
            {{ positiveCount() }} positives
          </p>
        </div>
        <div class="positive-pool-bar" aria-label="陽性人群中真假陽性的比例">
          <div class="true-positive-mass" [style.width.%]="posterior() * 100">
            @if (posterior() > 0.08) {
              TP<br />{{ posteriorPercent() }}
            }
          </div>
          <div class="false-positive-mass" [style.width.%]="(1 - posterior()) * 100">
            FP<br />{{ falsePositiveShare() }}
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="bayes-map" aria-hidden="true">
          <div>
            <span>Positive from condition</span>
            <strong>{{ truePositiveCount() }}</strong>
          </div>
          <i>competes with</i>
          <div>
            <span>Positive from healthy</span>
            <strong>{{ falsePositiveCount() }}</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Posterior 的 denominator 是所有 positive，不是所有 sick</span>
          <p>
            <strong>test characteristics 要和 base rate 一起看。</strong>
            sensitivity 再高，只要 alternative population 足夠大，false positives 就可能成為
            evidence pool 的主要來源。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>術語與邊界：sensitivity、specificity、false-positive rate</summary>
        <div>
          <div class="math-line">
            <app-math
              e="\\text{sensitivity}=P(+\\mid H),\\qquad \\text{false-positive rate}=P(+\\mid H^c)"
            />
          </div>
          <p>Specificity 是 true-negative rate，因此 specificity = 1 − false-positive rate。</p>
          <div class="math-line">
            <app-math
              e="P(H\\mid +)=\\frac{P(H)P(+\\mid H)}{P(H)P(+\\mid H)+P(H^c)P(+\\mid H^c)}"
            />
          </div>
          <p>這是教學用的簡化 test model，不構成任何醫療判讀或決策建議。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2FalsePositiveFrequenciesComponent {
  readonly people = Array.from({ length: 1000 }, (_, index) => index);
  readonly prediction = signal<number | null>(null);
  readonly prevalence = signal(1);
  readonly view = signal<PopulationView>('all');
  readonly conditionCount = computed(() => this.prevalence() * 10);
  readonly healthyCount = computed(() => 1000 - this.conditionCount());
  readonly truePositiveCount = computed(() => this.conditionCount() * 0.9);
  readonly falsePositiveCount = computed(() => this.healthyCount() * 0.1);
  readonly positiveCount = computed(() => this.truePositiveCount() + this.falsePositiveCount());
  readonly posterior = computed(() => this.truePositiveCount() / this.positiveCount());
  readonly posteriorPercent = computed(() => `${(this.posterior() * 100).toFixed(1)}%`);
  readonly falsePositiveShare = computed(() => `${((1 - this.posterior()) * 100).toFixed(1)}%`);

  isTruePositive(person: number): boolean {
    return person < this.truePositiveCount();
  }

  isFalseNegative(person: number): boolean {
    return person >= this.truePositiveCount() && person < this.conditionCount();
  }

  isFalsePositive(person: number): boolean {
    return (
      person >= this.conditionCount() && person < this.conditionCount() + this.falsePositiveCount()
    );
  }

  isPositive(person: number): boolean {
    return this.isTruePositive(person) || this.isFalsePositive(person);
  }
}
