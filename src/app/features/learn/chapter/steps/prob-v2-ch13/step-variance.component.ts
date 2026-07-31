import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type DistanceView = 'signed' | 'squared';

@Component({
  selector: 'app-prob-v2-variance',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch13">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 13.4</p>
        <h2>Variance 固定 center，再問 probability mass 離它多遠</h2>
        <p class="lede">
          <strong>變異數（variance）</strong>是離 expectation 的平均 squared distance。左右 signed
          deviations 會互相抵消；平方讓兩側都以正面積記錄 spread。
        </p>
      </header>

      <section class="scene">
        <div class="moment-prediction">
          <div>
            <p class="eyebrow">先預測 · 50% at μ−d, 50% at μ+d</p>
            <h3>d 從 1 拉到 4，平均 signed deviation 會變大嗎？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測平均帶符號偏差">
            <button
              type="button"
              [class.selected]="prediction() === 'grow'"
              (click)="prediction.set('grow')"
            >
              會變大
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'zero'"
              (click)="prediction.set('zero')"
            >
              永遠是 0
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'zero') {
              <strong>對。</strong>−d 與 +d 等重相消；即使 distribution 很散，raw average deviation
              仍看起來是 0。
            } @else {
              左側貢獻 −d、右側 +d，兩者始終抵消。要量 spread，必須先去掉 sign cancellation。
            }
          </p>
        }
      </section>

      <section class="variance-controls">
        <label for="spread-distance">Spread distance d</label>
        <input
          id="spread-distance"
          type="range"
          min="0"
          max="5"
          step="0.5"
          [value]="spread()"
          (input)="spread.set(+$any($event).target.value)"
        />
        <strong>d = {{ spread().toFixed(1) }}</strong>
        <div class="preset-row" role="group" aria-label="切換偏差視圖">
          <button type="button" [class.active]="view() === 'signed'" (click)="view.set('signed')">
            Signed deviations
          </button>
          <button type="button" [class.active]="view() === 'squared'" (click)="view.set('squared')">
            Squared distances
          </button>
        </div>
      </section>

      <section class="variance-board">
        <div class="variance-stage">
          <p class="eyebrow">Center μ stays fixed at 5</p>
          <h3>{{ viewTitle() }}</h3>
          <div class="deviation-line">
            <i class="mean-marker"><strong>μ=5</strong></i>
            <div class="variance-mass left" [style.left.%]="50 - spread() * 10">50%</div>
            <div class="variance-mass right" [style.left.%]="50 + spread() * 10">50%</div>
            <span class="deviation-arrow left" [style.width.%]="spread() * 10">
              −{{ spread().toFixed(1) }}
            </span>
            <span class="deviation-arrow right" [style.width.%]="spread() * 10">
              +{{ spread().toFixed(1) }}
            </span>
          </div>
          @if (view() === 'squared') {
            <div class="square-distance-row">
              <div [style.width.px]="squareSize()" [style.height.px]="squareSize()">
                d²={{ variance().toFixed(2) }}
              </div>
              <span>× 50% +</span>
              <div [style.width.px]="squareSize()" [style.height.px]="squareSize()">
                d²={{ variance().toFixed(2) }}
              </div>
              <span>× 50%</span>
            </div>
          }
        </div>

        <div class="variance-readout">
          <span class="card-label">{{
            view() === 'signed' ? 'CANCELLATION' : 'SPREAD MEASURE'
          }}</span>
          @if (view() === 'signed') {
            <div class="signed-equation">
              <strong>−{{ spread().toFixed(1) }}</strong
              ><i>+</i><strong>+{{ spread().toFixed(1) }}</strong
              ><i>→ average</i><strong>0</strong>
            </div>
            <p>這個量無法分辨 d=0 與 d=5。</p>
          } @else {
            <strong class="variance-number">Var(X) = {{ variance().toFixed(2) }}</strong>
            <p>Standard deviation = {{ spread().toFixed(1) }}，回到原本 X 的 units。</p>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="variance-core" aria-hidden="true">
          <span>distance from μ</span><strong>square it</strong><i>→</i
          ><span>weight and average</span><strong>variance</strong>
        </div>
        <div>
          <span class="card-label">Variance = average squared distance from μ</span>
          <p>
            <strong>Expectation 決定中心；variance 描述 mass 如何散在中心周圍。</strong>
            平方不是裝飾，它阻止左右 deviations 互相消失。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：variance、shortcut 與 standard deviation</summary>
        <div>
          <div class="math-line"><app-math e="\\operatorname{Var}(X)=E[(X-\\mu)^2]" /></div>
          <div class="math-line"><app-math e="\\operatorname{Var}(X)=E[X^2]-\\mu^2" /></div>
          <p>
            Variance 的 units 是 X units 的平方。<strong>標準差（standard deviation）</strong>
            σ=√Var(X) 將尺度帶回原 units。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2VarianceComponent {
  readonly prediction = signal<'grow' | 'zero' | null>(null);
  readonly spread = signal(4);
  readonly view = signal<DistanceView>('squared');
  readonly variance = computed(() => this.spread() ** 2);
  readonly squareSize = computed(() => 34 + this.spread() * 16);
  readonly viewTitle = computed(() =>
    this.view() === 'signed'
      ? '帶 sign 的 arrows 一正一負，無論多長都互相抵消'
      : '把 distance 折成 square area，兩側都成為正貢獻',
  );
}
