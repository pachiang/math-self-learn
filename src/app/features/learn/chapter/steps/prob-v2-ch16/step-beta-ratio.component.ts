import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-beta-ratio',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.5</p>
        <h2>Proportion 是兩份正重量 normalize 後留下的位置</h2>
        <p class="lede">
          把左、右兩份正重量的 total size 除掉，只留下 relative share。當兩份 independent Gamma
          weights 被這樣 normalize，指標的位置會形成 <strong>Beta distribution</strong>。
        </p>
      </header>
      <section class="scene continuous-prediction">
        <div>
          <p class="eyebrow">先判斷 · common scale</p>
          <h3>左 3 kg、右 7 kg 同時加倍成 6 kg、14 kg，左側 share 會改變嗎？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="判斷共同縮放是否改變比例">
          <button
            type="button"
            [class.selected]="prediction() === 'change'"
            (click)="prediction.set('change')"
          >
            會改變</button
          ><button
            type="button"
            [class.selected]="prediction() === 'same'"
            (click)="prediction.set('same')"
          >
            仍是 30%
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'same') {
              <strong>對。Normalize 會消掉共同 scale，只保留相對大小。</strong>
            } @else {
              分子與分母一起加倍，倍數會相消；真正決定 pointer 的是兩邊的 ratio。
            }
          </p>
        }
      </section>
      <section class="continuous-controls ratio-controls">
        <label
          >Left weight G₁<input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            [value]="leftWeight()"
            (input)="leftWeight.set(+$any($event).target.value)"
          /><strong>{{ leftWeight().toFixed(1) }}</strong></label
        ><label
          >Right weight G₂<input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            [value]="rightWeight()"
            (input)="rightWeight.set(+$any($event).target.value)"
          /><strong>{{ rightWeight().toFixed(1) }}</strong></label
        ><label
          >Common scale<input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            [value]="scale()"
            (input)="scale.set(+$any($event).target.value)"
          /><strong>{{ scale().toFixed(1) }}×</strong></label
        >
      </section>
      <section class="ratio-board">
        <div class="weight-vessels">
          <div class="left-vessel">
            <span>G₁ × scale</span><i [style.height.%]="leftHeight()"></i
            ><strong>{{ scaledLeft().toFixed(1) }}</strong>
          </div>
          <div class="right-vessel">
            <span>G₂ × scale</span><i [style.height.%]="rightHeight()"></i
            ><strong>{{ scaledRight().toFixed(1) }}</strong>
          </div>
        </div>
        <div class="normalize-arrow">
          <span>divide by total</span><strong>G₁ / (G₁ + G₂)</strong><i>↓</i>
        </div>
        <div class="ratio-ruler">
          <div class="ratio-left" [style.width.%]="ratio() * 100"></div>
          <b [style.left.%]="ratio() * 100"
            ><span>{{ ratioLabel() }}</span></b
          ><span class="zero">0</span><span class="one">1</span>
        </div>
        <p>
          Scale 改成 {{ scale().toFixed(1) }}× 時，total 變成 {{ total().toFixed(1) }}，但 pointer
          仍停在 <strong>{{ ratioLabel() }}</strong
          >。
        </p>
      </section>
      <aside class="insight-card">
        <div class="ratio-core" aria-hidden="true">
          <span>two positive weights</span><i>÷ total</i><strong>one point in [0,1]</strong>
        </div>
        <div>
          <span class="card-label">Normalize removes size; keeps share</span>
          <p>
            <strong
              >Beta 自然描述 proportion，因為它就是兩份正重量競爭後留下的 relative
              position。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>生成層：Gamma ratio 為何得到 Beta？</summary>
        <div class="continuous-formulas">
          <app-math
            e="G_1\\sim\\operatorname{Gamma}(\\alpha,1),\\quad G_2\\sim\\operatorname{Gamma}(\\beta,1)"
          /><app-math e="R=\\frac{G_1}{G_1+G_2}\\sim\\operatorname{Beta}(\\alpha,\\beta)" />
          <p>
            這裡要求兩份 Gamma weights independent 且使用相同 rate；共同 rate 正是 normalize
            後被消掉的 scale。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BetaRatioComponent {
  readonly prediction = signal<'change' | 'same' | null>(null);
  readonly leftWeight = signal(3);
  readonly rightWeight = signal(7);
  readonly scale = signal(1);
  readonly scaledLeft = computed(() => this.leftWeight() * this.scale());
  readonly scaledRight = computed(() => this.rightWeight() * this.scale());
  readonly total = computed(() => this.scaledLeft() + this.scaledRight());
  readonly ratio = computed(() => this.scaledLeft() / this.total());
  readonly ratioLabel = computed(() => (this.ratio() * 100).toFixed(1) + '%');
  readonly maxWeight = computed(() => Math.max(this.scaledLeft(), this.scaledRight(), 1));
  readonly leftHeight = computed(() => (this.scaledLeft() / this.maxWeight()) * 100);
  readonly rightHeight = computed(() => (this.scaledRight() / this.maxWeight()) * 100);
}
