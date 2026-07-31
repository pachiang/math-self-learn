import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type SourceId = 'web' | 'mobile' | 'api';

interface Source {
  id: SourceId;
  label: string;
  prior: number;
  errorRate: number;
  weight: number;
  posterior: number;
}

@Component({
  selector: 'app-prob-v2-total-evidence-pool',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch10">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 10.4</p>
        <h2>Bayes 的 denominator，是所有能通往 evidence 的路徑總和</h2>
        <p class="lede">
          <strong>全機率法則（law of total probability）</strong>把不同原因產生的 evidence weights
          收進同一個 pool。某個原因的 posterior，就是它那條 path 在 pool 中占多少。
        </p>
      </header>

      <section class="scene">
        <div class="bayes-prediction">
          <div>
            <p class="eyebrow">先預測 · observed one error</p>
            <h3>
              Traffic：Web 50%、Mobile 30%、API 20%；error rates：2%、5%、10%。看到 error
              後，最可能來自哪裡？
            </h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測錯誤最可能來自哪個來源">
            @for (choice of ['Web', 'Mobile', 'API']; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                {{ choice }}
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'API') {
              <strong>對，API 約占 errors 的 44.4%。</strong>雖然 traffic 最少，20%×10%=2% 的 error
              mass 仍是三條 path 中最大。
            } @else if (prediction() === 'Web') {
              Web traffic 最大，但 error rate 最低；它只貢獻 50%×2%=1% 的全站 error mass。
            } @else {
              Mobile 貢獻 30%×5%=1.5%，高於 Web，但仍低於 API 的 2%。
            }
          </p>
        }
      </section>

      <section class="api-control">
        <label for="api-error-rate">調整 API error rate</label>
        <input
          id="api-error-rate"
          type="range"
          min="1"
          max="20"
          step="1"
          [value]="apiErrorRate()"
          (input)="apiErrorRate.set(+$any($event).target.value)"
        />
        <strong>{{ apiErrorRate() }}%</strong>
      </section>

      <section class="source-board">
        <div class="source-lanes">
          <p class="eyebrow">Prior × likelihood paths</p>
          <h3>每個 source 都能產生 error evidence</h3>
          @for (source of sources(); track source.id) {
            <div class="source-lane" [class.focused]="focus() === source.id">
              <button type="button" (click)="focus.set(source.id)">{{ source.label }}</button>
              <div class="source-prior-track">
                <div class="source-prior-fill" [style.width.%]="source.prior"></div>
              </div>
              <span>{{ source.prior }}% × {{ source.errorRate }}%</span>
              <strong>{{ fixed(source.weight) }}%</strong>
            </div>
          }

          <div class="evidence-tray" aria-label="所有來源的錯誤證據重量">
            @for (source of sources(); track source.id) {
              <div
                class="evidence-segment"
                [class.mobile]="source.id === 'mobile'"
                [class.api]="source.id === 'api'"
                [style.width.%]="source.posterior * 100"
              >
                {{ source.label }}<br />{{ percent(source.posterior) }}
              </div>
            }
          </div>
        </div>

        <div class="source-posterior">
          <span class="card-label">{{ focusedSource().label.toUpperCase() }} GIVEN ERROR</span>
          <strong>{{ percent(focusedSource().posterior) }}</strong>
          <p>
            {{ fixed(focusedSource().weight) }}% source-specific error mass ÷
            {{ fixed(totalErrorWeight()) }}% total error mass。
          </p>
          <p class="feedback">
            全站 error probability P(error) = {{ fixed(totalErrorWeight()) }}%；它正是三條 evidence
            paths 相加後的 denominator。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="bayes-map" aria-hidden="true">
          <div>
            <span>Each evidence path</span>
            <strong>source prior × error rate</strong>
          </div>
          <i>sum all paths</i>
          <div>
            <span>Total evidence pool</span>
            <strong>P(error) = {{ fixed(totalErrorWeight()) }}%</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Total probability 建造 Bayes denominator</span>
          <p>
            <strong>只算目標 source 的 path 只能得到 numerator。</strong>
            要反推 source，必須把所有能產生同一 evidence 的互斥 paths 合併，再問目標 path 占總 pool
            多少。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：多原因的 total probability 與 Bayes</summary>
        <div>
          <p>若 H₁,…,Hₖ 互斥且涵蓋所有可能原因：</p>
          <div class="math-line">
            <app-math e="P(E)=\\sum_{j=1}^{k}P(H_j)P(E\\mid H_j)" />
          </div>
          <div class="math-line">
            <app-math
              e="P(H_i\\mid E)=\\frac{P(H_i)P(E\\mid H_i)}{\\sum_{j=1}^{k}P(H_j)P(E\\mid H_j)}"
            />
          </div>
          <p>
            視覺上的 evidence tray 就是 denominator；每一段 source-specific error mass 則是對應的
            numerator。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2TotalEvidencePoolComponent {
  readonly prediction = signal<string | null>(null);
  readonly apiErrorRate = signal(10);
  readonly focus = signal<SourceId>('api');
  readonly sources = computed<Source[]>(() => {
    const base = [
      { id: 'web' as const, label: 'Web', prior: 50, errorRate: 2 },
      { id: 'mobile' as const, label: 'Mobile', prior: 30, errorRate: 5 },
      { id: 'api' as const, label: 'API', prior: 20, errorRate: this.apiErrorRate() },
    ];
    const weighted = base.map((source) => ({
      ...source,
      weight: (source.prior * source.errorRate) / 100,
    }));
    const total = weighted.reduce((sum, source) => sum + source.weight, 0);
    return weighted.map((source) => ({ ...source, posterior: source.weight / total }));
  });
  readonly totalErrorWeight = computed(() =>
    this.sources().reduce((sum, source) => sum + source.weight, 0),
  );
  readonly focusedSource = computed(
    () => this.sources().find((source) => source.id === this.focus()) ?? this.sources()[0],
  );

  fixed(value: number): string {
    return value.toFixed(2);
  }

  percent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}
