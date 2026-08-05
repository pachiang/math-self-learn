import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-square-folding',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.4</p>
        <h2>平方把正負兩側折到同一條非負 energy 軸</h2>
        <p class="lede">
          Standard Normal 的 z 保留方向；Z² 只保留離 0 有多遠。+2 與 −2 因此被送到同一點 4，兩側
          probability mass 在 output 上疊合。
        </p>
      </header>
      <section class="scene normal-prediction">
        <div>
          <p class="eyebrow">先預測 · two-to-one map</p>
          <h3>Z=−2 與 Z=+2 經平方後，output 還能分辨原本方向嗎？</h3>
        </div>
        <div class="choice-row">
          <button
            type="button"
            [class.selected]="prediction() === 'yes'"
            (click)="prediction.set('yes')"
          >
            能分辨</button
          ><button
            type="button"
            [class.selected]="prediction() === 'fold'"
            (click)="prediction.set('fold')"
          >
            方向被折掉
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'fold') {
              <strong>對。平方保留 magnitude，刪除 sign。</strong>
            } @else {
              兩者都映到 4；只看 output 已無法知道 input 在左側還是右側。
            }
          </p>
        }
      </section>
      <section class="normal-controls">
        <label
          >|z| distance<input
            type="range"
            min="0"
            max="3"
            step="0.25"
            [value]="distance()"
            (input)="distance.set(+$any($event).target.value)"
          /><strong>{{ distance().toFixed(2) }}</strong></label
        >
      </section>
      <section class="fold-board">
        <div class="signed-axis">
          <span>STANDARD NORMAL AXIS</span><i></i
          ><b class="left-point" [style.left.%]="leftPosition()">−{{ distance().toFixed(2) }}</b
          ><b class="right-point" [style.left.%]="rightPosition()">+{{ distance().toFixed(2) }}</b
          ><strong>0</strong>
        </div>
        <div class="fold-arrows"><i>↘</i><span>square both</span><i>↙</i></div>
        <div class="energy-axis">
          <span>χ² AXIS · NO NEGATIVE SIDE</span><i></i
          ><b [style.left.%]="energyPosition()">{{ energy().toFixed(2) }}</b
          ><strong>0</strong>
        </div>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>signed deviation Z</span><i>square</i><strong>unsigned energy Z²</strong>
        </div>
        <div>
          <span class="card-label">χ² begins by forgetting direction</span>
          <p><strong>一個 standard Normal 的平方就是 1 degree-of-freedom 的 χ²。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>正式層：第一個 χ²</summary>
        <div class="normal-formulas">
          <app-math e="Z\\sim N(0,1)\\quad\\Longrightarrow\\quad Z^2\\sim\\chi_1^2" />
          <p>由於 z 與 −z 同時貢獻到 x=z²，output density 會把兩個 inverse branches 的重量相加。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2SquareFoldingComponent {
  readonly prediction = signal<'yes' | 'fold' | null>(null);
  readonly distance = signal(2);
  readonly energy = computed(() => this.distance() ** 2);
  readonly leftPosition = computed(() => ((3 - this.distance()) / 6) * 100);
  readonly rightPosition = computed(() => ((3 + this.distance()) / 6) * 100);
  readonly energyPosition = computed(() => (this.energy() / 9) * 100);
}
