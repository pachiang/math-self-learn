import { Component, computed, signal } from '@angular/core';
import { histogram, standardizedMean, unit } from './clt-math';

type ConditionMode = 'classic' | 'rare' | 'cauchy' | 'clone';
@Component({
  selector: 'app-prob-v2-clt-conditions',
  standalone: true,
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.6</p>
        <h2>「n 很大」不是條件清單的替代品</h2>
        <p class="lede">
          Classic CLT 需要 finite variance 與足夠 independence。即使條件成立，rare-event source
          也可能收斂很慢；若 variance 不存在或 observations 全部同動，Normal target 可能根本不出現。
        </p>
      </header>
      <section class="condition-picker">
        @for (item of modes; track item.key) {
          <button type="button" [class.active]="mode() === item.key" (click)="mode.set(item.key)">
            <span>{{ item.label }}</span
            ><strong>{{ item.note }}</strong>
          </button>
        }
      </section>
      <section class="clt-controls">
        <label
          >Terms per sum n<input
            type="range"
            min="5"
            max="500"
            step="5"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="conditions-board">
        <div class="condition-lights">
          <span [class.off]="current().variance === 'fail'"
            >{{ current().variance === 'fail' ? '×' : '✓' }} finite variance</span
          ><span [class.off]="current().independence === 'fail'"
            >{{ current().independence === 'fail' ? '×' : '✓' }} fresh information</span
          ><span [class.warn]="current().dominance === 'slow'"
            >{{ current().dominance === 'slow' ? '△' : '✓' }} no dominant term</span
          >
        </div>
        <div class="condition-histogram">
          @for (bar of bars(); track bar.index) {
            <i [style.height.%]="bar.height"></i>
          }
          <div><span>−4</span><span>standardized output</span><span>4</span></div>
        </div>
        <div class="condition-reading">
          <span>{{ current().label }}</span
          ><strong>{{ current().verdict }}</strong>
          <p>{{ current().reading }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>large n</span><i>+</i><strong>no term controls the whole sum</strong>
        </div>
        <div>
          <span class="card-label">Convergence has a mechanism and a speed</span>
          <p>
            <strong
              >條件成立只保證 limit；有限 n 時 approximation 好不好，仍取決於 source 的 skewness 與
              tail。</strong
            >
          </p>
        </div>
      </aside>
    </article>
  `,
})
export class ProbV2CltConditionsComponent {
  readonly mode = signal<ConditionMode>('rare');
  readonly n = signal(100);
  readonly modes = [
    {
      key: 'classic' as const,
      label: 'CLASSIC',
      note: 'finite, independent',
      variance: 'pass',
      independence: 'pass',
      dominance: 'pass',
      verdict: 'CLT works normally',
      reading:
        'Exponential is skewed but has finite variance; standardized sums steadily approach Normal.',
    },
    {
      key: 'rare' as const,
      label: 'RARE SPIKE',
      note: 'valid but slow',
      variance: 'pass',
      independence: 'pass',
      dominance: 'slow',
      verdict: 'Valid limit, poor small-n fit',
      reading:
        'Most groups see no spike while a few are dominated by one; much larger n is needed.',
    },
    {
      key: 'cauchy' as const,
      label: 'CAUCHY',
      note: 'variance absent',
      variance: 'fail',
      independence: 'pass',
      dominance: 'slow',
      verdict: 'Classic CLT does not apply',
      reading:
        'Extreme terms remain comparable to the whole sum; √n scaling does not reveal a Normal target.',
    },
    {
      key: 'clone' as const,
      label: 'CLONED',
      note: 'perfect dependence',
      variance: 'pass',
      independence: 'fail',
      dominance: 'slow',
      verdict: 'No averaging of information',
      reading:
        'Every term repeats one draw, so one random source controls the entire sum regardless of n.',
    },
  ];
  readonly current = computed(() => this.modes.find((x) => x.key === this.mode())!);
  readonly values = computed(() => Array.from({ length: 260 }, (_, world) => this.value(world)));
  readonly bars = computed(() => histogram(this.values(), 41));
  private value(world: number): number {
    if (this.mode() === 'classic') return standardizedMean('exponential', world, this.n());
    if (this.mode() === 'rare') return standardizedMean('rare', world, this.n());
    if (this.mode() === 'clone')
      return unit(world * 91) < 0.5 ? -Math.sqrt(this.n()) : Math.sqrt(this.n());
    let sum = 0;
    for (let i = 0; i < this.n(); i++) {
      const u = Math.min(0.99999, Math.max(0.00001, unit(world * 10009 + i * 101)));
      sum += Math.tan(Math.PI * (u - 0.5));
    }
    return Math.max(-4, Math.min(4, sum / Math.sqrt(this.n())));
  }
}
