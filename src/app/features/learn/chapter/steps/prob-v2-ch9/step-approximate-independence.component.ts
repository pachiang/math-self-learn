import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type ReplacementMode = 'with' | 'without';

@Component({
  selector: 'app-prob-v2-approximate-independence',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch9">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 9.3</p>
        <h2>影響小到看不見，和完全沒有影響，仍是兩回事</h2>
        <p class="lede">
          With replacement 讓袋子精確復原；without replacement
          一定改變下一抽比例。袋子很大時差異可能極小，這叫
          <strong>近似獨立（approximately independent）</strong>，不是 exact independence。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Scale experiment · always 60% red</p>
            <h3>已知第一抽是 red；放大母體後，第二抽 red 的比例改變多少？</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇是否放回">
            <button
              type="button"
              [class.active]="mode() === 'without'"
              (click)="mode.set('without')"
            >
              Without replacement
            </button>
            <button type="button" [class.active]="mode() === 'with'" (click)="mode.set('with')">
              With replacement
            </button>
          </div>
        </div>
        <div class="population-buttons" role="group" aria-label="選擇袋中總球數">
          @for (size of sizes; track size) {
            <button type="button" [class.active]="total() === size" (click)="total.set(size)">
              N={{ size }}
            </button>
          }
        </div>
      </section>

      <section class="replacement-board">
        <div class="shift-visual">
          <p class="eyebrow">Before / after ratio checker</p>
          <h3>{{ redCount() }} red + {{ blueCount() }} blue；first draw 已知是 red</h3>

          <div class="probability-bar">
            <span>Before · P(R₂)</span>
            <div class="probability-track">
              <div class="probability-fill" [style.width.%]="beforeProbability() * 100"></div>
            </div>
            <strong>{{ percent(beforeProbability()) }}</strong>
          </div>
          <div class="probability-bar">
            <span>After · P(R₂ | R₁)</span>
            <div class="probability-track">
              <div class="probability-fill" [style.width.%]="afterProbability() * 100"></div>
            </div>
            <strong>{{ percent(afterProbability()) }}</strong>
          </div>

          <div class="bag-scale" aria-label="袋中紅藍比例示意">
            @for (_ of previewRed(); track $index) {
              <i></i>
            }
            @for (_ of previewBlue(); track $index) {
              <i class="blue"></i>
            }
            <span>每顆示意約 {{ previewUnit() }} balls；比例固定為 60:40</span>
          </div>
        </div>

        <div
          class="shift-summary"
          [class.exact]="mode() === 'with'"
          [class.changed]="mode() === 'without' && total() <= 10"
          [class.approximate]="mode() === 'without' && total() > 10"
          aria-live="polite"
        >
          <span class="card-label">PROBABILITY SHIFT</span>
          <strong>{{ percentagePointShift() }} percentage points</strong>
          @if (mode() === 'with') {
            <h3>Exact independence</h3>
            <p>red 被放回後，袋子精確恢復成 {{ redCount() }}/{{ total() }}；比例完全不變。</p>
          } @else if (total() > 10) {
            <h3>Dependent, but approximately independent</h3>
            <p>
              一顆 red 仍已離開，所以不是 exact。只是相對於 N={{ total() }}
              的母體，這次更新非常小。
            </p>
          } @else {
            <h3>Clearly dependent</h3>
            <p>小袋子少一顆 red 的影響很明顯；after ratio 不再等於原本的 60%。</p>
          }
        </div>
      </section>

      <section class="invariant-badge">
        <span>固定 60% red，從 N=5 一路切到 N=1000</span>
        <strong> Without replacement 的 shift 會趨近 0，但只要 N 有限，就仍不是完全等於 0 </strong>
      </section>

      <aside class="insight-card">
        <div class="marginal-lock" aria-hidden="true">
          <div>
            <span>Exact independent</span>
            <strong>after = before</strong>
          </div>
          <i>vs</i>
          <div>
            <span>Approximately independent</span>
            <strong>after ≈ before</strong>
          </div>
        </div>
        <div>
          <span class="card-label">等號與約等號，是模型層級的差別</span>
          <p>
            <strong>large population 不是把 dependence 變不見，而是把它壓得很小。</strong>
            實務上可能足以近似；數學上仍應把 approximation 的理由與尺度說清楚。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>數值層：without replacement 的 shift 為什麼趨近 0？</summary>
        <div>
          <p>若 N 顆中有 R=0.6N 顆 red，已知第一抽 red 且不放回：</p>
          <div class="math-line">
            <app-math e="P(R_2)=\\frac{R}{N}=0.6,\\qquad P(R_2\\mid R_1)=\\frac{R-1}{N-1}" />
          </div>
          <div class="math-line">
            <app-math e="\\frac{R}{N}-\\frac{R-1}{N-1}=\\frac{N-R}{N(N-1)}" />
          </div>
          <p>
            當 N 增大，差異趨近 0。這是 sampling fraction
            很小時常用的近似；是否「夠小」取決於任務需要的精度。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ApproximateIndependenceComponent {
  readonly sizes = [5, 10, 50, 100, 1000];
  readonly total = signal(5);
  readonly mode = signal<ReplacementMode>('without');
  readonly redCount = computed(() => this.total() * 0.6);
  readonly blueCount = computed(() => this.total() - this.redCount());
  readonly beforeProbability = computed(() => this.redCount() / this.total());
  readonly afterProbability = computed(() =>
    this.mode() === 'with' ? this.beforeProbability() : (this.redCount() - 1) / (this.total() - 1),
  );
  readonly previewRed = computed(() => Array.from({ length: 6 }));
  readonly previewBlue = computed(() => Array.from({ length: 4 }));
  readonly previewUnit = computed(() => this.total() / 10);
  readonly percentagePointShift = computed(() =>
    Math.abs((this.afterProbability() - this.beforeProbability()) * 100).toFixed(3),
  );

  percent(value: number): string {
    return `${(value * 100).toFixed(value === 0.6 ? 1 : 3)}%`;
  }
}
