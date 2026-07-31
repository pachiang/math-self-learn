import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-nested-proportion',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch8">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 8.3</p>
        <h2>「B 裡面的 25%」不是全世界的 25%</h2>
        <p class="lede">
          conditional percentage 的分母是 B。要找 <strong>A 與 B 同時發生</strong>占原世界多少，
          必須先留下 B 的份額，再在那塊區域裡留下 A 的比例。
        </p>
      </header>

      <section class="scene">
        <div class="condition-prediction">
          <div>
            <p class="eyebrow">先預測 · website sessions</p>
            <h3>全站 60% 是 mobile；mobile 中 25% 購買。全站「mobile 且購買」占多少？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測行動裝置且購買的全站比例">
            @for (choice of [15, 25, 85]; track choice) {
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
            @if (prediction() === 15) {
              <strong>對，是 15%。</strong>先保留全站的 60%，再取那一塊的四分之一：100% × 60% ×
              25%。
            } @else if (prediction() === 25) {
              25% 的 denominator 是 mobile sessions，不是全站；它只切割原世界中 60% 的那一塊。
            } @else {
              60% + 25% 把兩個不同 denominator 的比例相加了；題目要的是 nested intersection。
            }
          </p>
        }
      </section>

      <section class="nested-controls">
        <div class="nested-control">
          <label for="condition-share">B 占原世界</label>
          <input
            id="condition-share"
            type="range"
            min="10"
            max="90"
            step="5"
            [value]="conditionShare()"
            (input)="conditionShare.set(+$any($event).target.value)"
          />
          <strong>{{ conditionShare() }}%</strong>
        </div>
        <div class="nested-control">
          <label for="target-given-condition">A given B</label>
          <input
            id="target-given-condition"
            type="range"
            min="10"
            max="90"
            step="5"
            [value]="targetGivenCondition()"
            (input)="targetGivenCondition.set(+$any($event).target.value)"
          />
          <strong>{{ targetGivenCondition() }}%</strong>
        </div>
      </section>

      <section class="nested-board">
        <div
          class="nested-canvas"
          role="img"
          [attr.aria-label]="
            '整個世界中 B 占 ' +
            conditionShare() +
            '%，A 在 B 中占 ' +
            targetGivenCondition() +
            '%，交集占全體 ' +
            intersectionShare() +
            '%'
          "
        >
          <span class="whole-label">整個 sample space · 100%</span>
          <div class="condition-area" [style.width.%]="conditionShare()">
            <span>B · {{ conditionShare() }}% of Ω</span>
            <div class="intersection-area" [style.height.%]="targetGivenCondition()">
              <div>
                <strong>{{ intersectionShare() }}%</strong><br />
                <span>A ∩ B of Ω</span>
              </div>
            </div>
          </div>
        </div>

        <div class="nested-readout">
          <div class="nested-stat">
            <span>FIRST CUT · KEEP B</span>
            <strong>{{ conditionShare() }}%</strong>
            <p>先從原世界保留 B；這是外層區域的寬度。</p>
          </div>
          <div class="nested-stat">
            <span>SECOND CUT · A GIVEN B</span>
            <strong>{{ targetGivenCondition() }}%</strong>
            <p>這個比例只在 B 內部切割，不以整個 Ω 為 denominator。</p>
          </div>
          <div class="nested-stat highlight">
            <span>NESTED AREA · A ∩ B</span>
            <strong>{{ intersectionShare() }}%</strong>
            <p>
              {{ conditionShare() }}% × {{ targetGivenCondition() }}% = {{ intersectionShare() }}%
              of Ω
            </p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="renormalize-map" aria-hidden="true">
          <div>
            <span>Inside B</span>
            <strong>A 占 {{ targetGivenCondition() }}%</strong>
          </div>
          <i>× B 的重量</i>
          <div>
            <span>Back in Ω</span>
            <strong>A∩B 占 {{ intersectionShare() }}%</strong>
          </div>
        </div>
        <div>
          <span class="card-label">要從 conditional world 回到原世界，就乘回父區域的重量</span>
          <p>
            <strong>乘法是在量 nested area。</strong>
            P(A|B) 告訴你 A 在 B 裡的相對比例；再乘 P(B)，才得到 intersection 在 Ω 中的總重量。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：conditional definition 如何變成 multiplication rule</summary>
        <div>
          <p>從 conditional probability 的定義開始：</p>
          <div class="math-line">
            <app-math e="P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}" />
          </div>
          <p>把 P(B) 乘回去，就是畫面中的 nested area：</p>
          <div class="math-line">
            <app-math e="P(A\\cap B)=P(B)P(A\\mid B)=P(A)P(B\\mid A)" />
          </div>
          <p>
            這是一般情況，不需要假設 independent。第九章會問：什麼特殊情況下 P(A|B) 恰好等於 P(A)？
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NestedProportionComponent {
  readonly prediction = signal<number | null>(null);
  readonly conditionShare = signal(60);
  readonly targetGivenCondition = signal(25);
  readonly intersectionShare = computed(() =>
    Number(((this.conditionShare() * this.targetGivenCondition()) / 100).toFixed(2)),
  );
}
