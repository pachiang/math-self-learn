import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { poissonAtLeast, percent } from './event-stream-math';

@Component({
  selector: 'app-prob-v2-count-wait-duality',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.8</p>
        <h2>「窗內至少 k 件」就是「第 k 件已在窗尾前抵達」</h2>
        <p class="lede">
          Poisson count 與 Gamma wait 並非兩個碰巧相關的公式。它們在看<strong
            >同一條 event timeline</strong
          >，只是把問題的游標放在不同地方。
        </p>
      </header>

      <section class="duality-controls">
        <label
          >Window t<input
            type="range"
            min="1"
            max="8"
            step="0.5"
            [value]="time()"
            (input)="time.set(+$any($event).target.value)"
          /><strong>{{ time().toFixed(1) }}</strong></label
        >
        <label
          >Target k<input
            type="range"
            min="1"
            max="6"
            step="1"
            [value]="target()"
            (input)="target.set(+$any($event).target.value)"
          /><strong>#{{ target() }}</strong></label
        >
        <label
          >Rate λ<input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            [value]="rate()"
            (input)="rate.set(+$any($event).target.value)"
          /><strong>{{ rate().toFixed(2) }}</strong></label
        >
      </section>

      <section class="duality-board">
        <div class="duality-timeline">
          <span>0</span>
          <div class="duality-window">
            <b [style.left.%]="targetPosition()">event #{{ target() }}</b>
            @for (mark of marks(); track mark) {
              <i [style.left.%]="mark"></i>
            }
          </div>
          <strong>t={{ time().toFixed(1) }}</strong>
        </div>
        <div class="duality-statements">
          <div>
            <span>COUNT LENS · Poisson</span>
            <h3>N(t) ≥ {{ target() }}</h3>
            <p>到 window 結束，已累積至少 {{ target() }} 個 marks。</p>
          </div>
          <i aria-hidden="true">⇄</i>
          <div>
            <span>WAIT LENS · Gamma</span>
            <h3>T{{ target() }} ≤ t</h3>
            <p>第 {{ target() }} 個 mark 已在 deadline 前抵達。</p>
          </div>
        </div>
        <p class="duality-probability">
          <span>同一個 event</span><strong>{{ probabilityLabel() }}</strong
          ><small>μ = λt = {{ mean().toFixed(2) }}</small>
        </p>
      </section>

      <section class="stream-family-map" aria-label="constant-rate event stream 分布家族地圖">
        <div class="family-source">
          <span>mechanism</span><strong>constant-rate event stream</strong><small>rate λ</small>
        </div>
        <div class="family-branches">
          <article><span>畫 fixed window</span><i>count marks</i><strong>Poisson</strong></article>
          <article>
            <span>從 NOW 畫 arrow</span><i>wait for next</i><strong>Exponential</strong>
          </article>
          <article>
            <span>把 k 段 arrow 相加</span><i>wait for event #k</i><strong>Gamma</strong>
          </article>
        </div>
      </section>

      <aside class="insight-card">
        <div class="duality-core" aria-hidden="true">
          <span>≥ k by time t</span><i>≡</i><strong>event #k arrives by t</strong>
        </div>
        <div>
          <span class="card-label">Family map 的線是問題轉換，不是名詞分類</span>
          <p><strong>先認出 mechanism，再問你觀察的是 count 還是 waiting time。</strong></p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>等式層：Poisson tail 與 Gamma CDF</summary>
        <div class="stream-formulas">
          <app-math e="\\{N(t)\\ge k\\}=\\{T_k\\le t\\}" /><app-math
            e="P(T_k\\le t)=1-\\sum_{j=0}^{k-1}e^{-\\lambda t}\\frac{(\\lambda t)^j}{j!}"
          />
          <p>這是同一個 event 的兩種寫法，所以機率相等不需要靠巧合或硬背。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CountWaitDualityComponent {
  readonly time = signal(4);
  readonly target = signal(3);
  readonly rate = signal(1);
  readonly mean = computed(() => this.rate() * this.time());
  readonly probability = computed(() => poissonAtLeast(this.target(), this.mean()));
  readonly probabilityLabel = computed(() => percent(this.probability()));
  readonly marks = computed(() =>
    Array.from(
      { length: Math.max(1, Math.round(this.mean())) },
      (_, index) => ((index + 0.7) / Math.max(1, Math.round(this.mean()))) * 91,
    ),
  );
  readonly targetPosition = computed(() =>
    Math.min(94, ((this.target() - 0.3) / Math.max(this.target(), Math.round(this.mean()))) * 91),
  );
}
