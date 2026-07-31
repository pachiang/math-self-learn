import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type EventChoice = 'even' | 'greater-than-four';

@Component({
  selector: 'app-prob-v2-equal-likelihood',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch3">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 3.3</p>
        <h2>數格子不是定義，而是一條有條件的捷徑</h2>
        <p class="lede">
          只有基本 outcomes <strong>等可能（equally likely）</strong>時， 「符合數 ÷
          總數」才會正確。格子一樣多，不代表每格一樣重。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">同一個 sample space，同一個 event</p>
            <h3>換一顆骰子，數格子的答案會不會變？</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇事件">
            <button
              type="button"
              [class.active]="eventChoice() === 'even'"
              (click)="eventChoice.set('even')"
            >
              A = 偶數
            </button>
            <button
              type="button"
              [class.active]="eventChoice() === 'greater-than-four'"
              (click)="eventChoice.set('greater-than-four')"
            >
              A = 大於 4
            </button>
          </div>
        </div>
        <p class="feedback">
          兩個模型都有 Ω = {{ '{1, 2, 3, 4, 5, 6}' }}，事件 A = <strong>{{ eventLabel() }}</strong
          >。差別只在每個 outcome 的重量。
        </p>
      </section>

      <section class="shortcut-demo">
        <div class="die-model">
          <p class="eyebrow">Fair die · 每格等重</p>
          <h3>公平骰子</h3>
          <p>六個 outcomes 的 relative weight 都是 1。</p>
          <div class="weighted-outcomes">
            @for (weight of fairWeights; track $index) {
              <div class="weighted-outcome" [class.in-event]="isInEvent($index + 1)">
                <div class="weight-pillar-wrap">
                  <i class="weight-pillar" [style.height.%]="(weight / 7) * 100"></i>
                </div>
                <strong>{{ $index + 1 }}</strong>
                <span>w={{ weight }}</span>
              </div>
            }
          </div>
          <div class="model-result">
            <div>
              <span>數格子 shortcut</span>
              <strong>{{ favorableCount() }} / 6</strong>
            </div>
            <i>=</i>
            <div>
              <span>實際 weight</span>
              <strong>{{ fraction(fairEventWeight(), 6) }}</strong>
            </div>
          </div>
          <p class="shortcut-verdict valid">
            <strong>捷徑成立。</strong>
            每一格都承接相同重量，所以格子數與 probability mass 成正比。
          </p>
        </div>

        <div class="die-model">
          <p class="eyebrow">Loaded die · 6 比其他面重七倍</p>
          <h3>偏向 6 的骰子</h3>
          <p>outcomes 仍有六個，但第 6 格背後有更多重量。</p>
          <div class="weighted-outcomes">
            @for (weight of loadedWeights; track $index) {
              <div class="weighted-outcome" [class.in-event]="isInEvent($index + 1)">
                <div class="weight-pillar-wrap">
                  <i class="weight-pillar" [style.height.%]="(weight / 7) * 100"></i>
                </div>
                <strong>{{ $index + 1 }}</strong>
                <span>w={{ weight }}</span>
              </div>
            }
          </div>
          <div class="model-result">
            <div>
              <span>數格子 shortcut</span>
              <strong>{{ favorableCount() }} / 6</strong>
            </div>
            <i>≠</i>
            <div>
              <span>實際 weight</span>
              <strong>{{ fraction(loadedEventWeight(), 12) }}</strong>
            </div>
          </div>
          <p class="shortcut-verdict invalid">
            <strong>捷徑失效。</strong>
            第 6 格與其他格不等重；必須把 event 內真正的 weights 加起來。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="three-levels" aria-hidden="true">
          <div>
            <span>永遠可靠</span>
            <strong>event weight / total weight</strong>
          </div>
          <i>→</i>
          <div>
            <span>等可能時簡化</span>
            <strong>符合格數 / 全部格數</strong>
          </div>
        </div>
        <div>
          <span class="card-label">先問 weights，再決定能不能數</span>
          <p>
            <strong
              >favorable outcomes ÷ total outcomes 是推論結果，不是 probability 的定義。</strong
            >
            它偷偷使用了「每個基本 outcome 等可能」這個前提。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：為什麼 equally likely 時可以數格子？</summary>
        <div>
          <p>
            若有限 sample space Ω 有 n 個 equally likely outcomes，每一個的 probability 都必須是
            1/n。若 event A 含有 k 個 outcomes，互不重疊的重量相加後：
          </p>
          <div class="math-line">
            <app-math
              e="P(A)=\\underbrace{\\frac1n+\\cdots+\\frac1n}_{k\\text{ 個}}=\\frac{k}{n}=\\frac{|A|}{|\\Omega|}"
            />
          </div>
          <p>
            一旦各 outcome 的 probability 不同，就要改用
            <app-math e="P(A)=\\sum_{\\omega\\in A}P(\\{\\omega\\})" />， 不能只看 cardinality。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2EqualLikelihoodComponent {
  readonly eventChoice = signal<EventChoice>('even');
  readonly fairWeights = [1, 1, 1, 1, 1, 1];
  readonly loadedWeights = [1, 1, 1, 1, 1, 7];

  readonly eventOutcomes = computed(() => (this.eventChoice() === 'even' ? [2, 4, 6] : [5, 6]));
  readonly eventLabel = computed(() => `{${this.eventOutcomes().join(', ')}}`);
  readonly favorableCount = computed(() => this.eventOutcomes().length);
  readonly fairEventWeight = computed(() =>
    this.eventOutcomes().reduce((sum, outcome) => sum + this.fairWeights[outcome - 1], 0),
  );
  readonly loadedEventWeight = computed(() =>
    this.eventOutcomes().reduce((sum, outcome) => sum + this.loadedWeights[outcome - 1], 0),
  );

  isInEvent(outcome: number): boolean {
    return this.eventOutcomes().includes(outcome);
  }

  fraction(numerator: number, denominator: number): string {
    const divisor = this.gcd(numerator, denominator);
    return `${numerator / divisor} / ${denominator / divisor}`;
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
