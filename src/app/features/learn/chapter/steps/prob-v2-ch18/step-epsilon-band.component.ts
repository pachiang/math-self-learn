import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { sampleMean } from './lln-math';

@Component({
  selector: 'app-prob-v2-epsilon-band',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.3</p>
        <h2>先固定一條容許帶 ε，再看留在帶外的 worlds 是否消失</h2>
        <p class="lede">
          <strong>大數法則（Law of Large Numbers, LLN）</strong>的精確直覺不是「差距等於
          0」，而是：無論先指定多窄但固定的 ε-band，X̄ₙ 留在外面的 probability 都趨近 0。
        </p>
      </header>
      <section class="lln-controls dual">
        <label
          >Sample size n<input
            type="range"
            min="10"
            max="1000"
            step="10"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        ><label
          >Tolerance ε<input
            type="range"
            min="0.02"
            max="0.2"
            step="0.01"
            [value]="epsilon()"
            (input)="epsilon.set(+$any($event).target.value)"
          /><strong>{{ epsilon().toFixed(2) }}</strong></label
        >
      </section>
      <section class="epsilon-board">
        <div class="epsilon-ruler">
          <div
            class="safe-band"
            [style.left.%]="(0.6 - epsilon()) * 100"
            [style.width.%]="epsilon() * 200"
          >
            <span>within ε</span>
          </div>
          <b style="left:60%">μ</b>
          @for (mean of means(); track $index) {
            <i [style.left.%]="mean * 100" [class.outside]="Math.abs(mean - 0.6) > epsilon()"></i>
          }
        </div>
        <div class="outside-meter">
          <span>worlds outside band</span><i><b [style.width.%]="outsideRate() * 100"></b></i
          ><strong>{{ (outsideRate() * 100).toFixed(1) }}%</strong
          ><small>{{ outsideCount() }} / {{ worldCount }} worlds</small>
        </div>
        <p>{{ reading() }}</p>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>fix ε &gt; 0</span><i>then n → ∞</i><strong>outside probability → 0</strong>
        </div>
        <div>
          <span class="card-label">Band 固定，worlds 收束</span>
          <p>
            <strong>不要讓 ε 跟著 n 任意縮；LLN 的順序是先定義「多遠算遠」，再增加資料。</strong>
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>正式層：Weak Law 與 Chebyshev bound</summary>
        <div class="lln-formulas">
          <app-math e="P(|\\bar X_n-\\mu|>\\varepsilon)\\to0" /><app-math
            e="P(|\\bar X_n-\\mu|>\\varepsilon)\\le\\frac{\\sigma^2}{n\\varepsilon^2}"
          />
          <p>
            這個簡單證明使用 independent、同分布且 finite variance 的版本；更一般的 LLN
            可以放寬條件。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2EpsilonBandComponent {
  protected readonly Math = Math;
  readonly n = signal(100);
  readonly epsilon = signal(0.08);
  readonly worldCount = 200;
  readonly means = computed(() =>
    Array.from({ length: this.worldCount }, (_, world) => sampleMean(world, this.n(), 0.6)),
  );
  readonly outsideCount = computed(
    () => this.means().filter((x) => Math.abs(x - 0.6) > this.epsilon()).length,
  );
  readonly outsideRate = computed(() => this.outsideCount() / this.worldCount);
  readonly reading = computed(() =>
    this.outsideRate() === 0
      ? '這批有限模擬沒有 outside world；理論說的是 probability 趨近 0，不是有限 n 後絕對不可能。'
      : this.epsilon() < 0.05
        ? 'Band 很窄，因此需要更大的 n 才能把多數 worlds 收進來。'
        : '增加 n，觀察紅色 outside marks 如何逐步減少。',
  );
}
