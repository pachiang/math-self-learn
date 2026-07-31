import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type RetryModel = 'independent' | 'shared';
type JointOutcome = 'SS' | 'SF' | 'FS' | 'FF';

@Component({
  selector: 'app-prob-v2-shared-cause',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch9">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 9.4</p>
        <h2>每次都是 80%，不代表兩次合起來一定能相乘</h2>
        <p class="lede">
          相同的單次成功率只描述 <strong>marginal probabilities</strong>。兩次結果如何一起生成，屬於
          joint structure；shared cause 可以讓兩次一起成功或一起失敗。
        </p>
      </header>

      <section class="scene">
        <div class="independence-prediction">
          <div>
            <p class="eyebrow">先預測 · two API attempts</p>
            <h3>每次 attempt 的 success rate 都是 80%，至少一次成功一定是 96% 嗎？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="判斷相同單次成功率是否保證獨立">
            <button
              type="button"
              [class.selected]="prediction() === 'yes'"
              (click)="prediction.set('yes')"
            >
              一定 96%
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'depends'"
              (click)="prediction.set('depends')"
            >
              要看生成機制
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'depends') {
              <strong>對。</strong>independent retries 是 96%；若兩次共用同一個 outage state，則只有
              80%。
            } @else {
              96% 偷渡了 independence：它假設 first failure 後，second success rate 仍然是 80%。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Same marginals · different joint worlds</p>
            <h3>兩邊每次都 80% success，只改變兩次如何一起生成</h3>
          </div>
          <div class="preset-row" role="group" aria-label="切換重試生成模型">
            <button
              type="button"
              [class.active]="model() === 'independent'"
              (click)="model.set('independent')"
            >
              Independent retries
            </button>
            <button
              type="button"
              [class.active]="model() === 'shared'"
              (click)="model.set('shared')"
            >
              Shared outage
            </button>
          </div>
        </div>
      </section>

      <section class="joint-board">
        <div class="joint-grid-panel">
          <p class="eyebrow">100 equally weighted scenarios</p>
          <h3>{{ modelTitle() }}</h3>
          <div class="joint-grid" aria-label="兩次嘗試的一百個聯合結果">
            @for (outcome of outcomes(); track $index) {
              <div class="joint-tile" [class]="outcome.toLowerCase()">{{ outcome }}</div>
            }
          </div>
          <div class="joint-legend">
            <span>SS · both success</span>
            <span>SF / FS · mixed</span>
            <span>FF · both fail</span>
          </div>
        </div>

        <div class="joint-stats">
          <div class="joint-stat">
            <span>FIRST ATTEMPT SUCCESS</span>
            <strong>80%</strong>
          </div>
          <div class="joint-stat">
            <span>SECOND ATTEMPT SUCCESS</span>
            <strong>80%</strong>
          </div>
          <div class="joint-stat">
            <span>BOTH FAIL · JOINT</span>
            <strong>{{ bothFail() }}%</strong>
          </div>
          <div class="joint-stat highlight">
            <span>AT LEAST ONE SUCCESS</span>
            <strong>{{ atLeastOne() }}%</strong>
          </div>
        </div>
      </section>

      <section class="marginal-lock">
        <div>
          <span>Marginals in both models</span>
          <strong>80% · 80%</strong>
        </div>
        <i>joint structure changes</i>
        <div>
          <span>Mixed outcomes</span>
          <strong>{{ mixedCount() }} / 100</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="marginal-lock" aria-hidden="true">
          <div>
            <span>Same marginals</span>
            <strong>每次各 80%</strong>
          </div>
          <i>≠</i>
          <div>
            <span>Same joint distribution</span>
            <strong>4% FF 或 20% FF</strong>
          </div>
        </div>
        <div>
          <span class="card-label">能不能相乘，要問 joint-generation mechanism</span>
          <p>
            <strong>independence 不是從兩個 marginal numbers 看出來的。</strong>
            若 first failure 暗示 shared outage，second attempt 的 conditioned success rate
            就不再是原本 80%。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>正式層：repeated-trial product 與 pairwise independence 預告</summary>
        <div>
          <p>若 n 次 Bernoulli trials mutually independent，指定 path 的 probability 才能寫成：</p>
          <div class="math-line">
            <app-math e="P(x_1,\\ldots,x_n)=\\prod_{i=1}^{n}P(x_i)" />
          </div>
          <p>
            「每一對都 independent」稱為 pairwise independence，但仍可能不夠。例：X、Y 是兩個 fair
            bits，Z=X XOR Y。任兩個 bits 都 independent；知道 X 與 Y 後，Z
            卻被完全決定，因此三者不是 mutually independent。
          </p>
          <div class="math-line">
            <app-math e="P(X=0,Y=0,Z=0)=\\frac14\\neq\\frac12\\cdot\\frac12\\cdot\\frac12" />
          </div>
          <p>本章只需記住：事件超過兩個時，「逐對檢查」未必足以保證整組能完全拆乘。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2SharedCauseComponent {
  readonly prediction = signal<'yes' | 'depends' | null>(null);
  readonly model = signal<RetryModel>('independent');
  readonly outcomes = computed<JointOutcome[]>(() => {
    if (this.model() === 'shared') {
      return Array.from({ length: 100 }, (_, index) => (index < 80 ? 'SS' : 'FF'));
    }
    return Array.from({ length: 100 }, (_, index) => {
      if (index < 64) return 'SS';
      if (index < 80) return 'SF';
      if (index < 96) return 'FS';
      return 'FF';
    });
  });
  readonly bothFail = computed(() => (this.model() === 'independent' ? 4 : 20));
  readonly atLeastOne = computed(() => 100 - this.bothFail());
  readonly mixedCount = computed(() => (this.model() === 'independent' ? 32 : 0));
  readonly modelTitle = computed(() =>
    this.model() === 'independent'
      ? '每次重新抽樣：64 SS、16 SF、16 FS、4 FF'
      : '同一個 hidden system state：80 SS、20 FF',
  );
}
