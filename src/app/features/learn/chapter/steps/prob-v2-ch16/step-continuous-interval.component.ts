import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { percent } from './continuous-math';

@Component({
  selector: 'app-prob-v2-continuous-interval',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.1</p>
        <h2>Continuous probability 住在有寬度的區間，不住在單一 point</h2>
        <p class="lede">
          曲線的高度是<strong>密度（probability density）</strong>：每單位長度承載多少重量。真正的
          probability 是底下的 area。
        </p>
      </header>
      <section class="scene continuous-prediction">
        <div>
          <p class="eyebrow">先判斷 · exact point</p>
          <h3>在 0–1 尺上隨機落點，P(X=0.5)=0，代表 0.5 不可能被抽到嗎？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="判斷零機率是否代表不可能">
          <button
            type="button"
            [class.selected]="prediction() === 'impossible'"
            (click)="prediction.set('impossible')"
          >
            不可能</button
          ><button
            type="button"
            [class.selected]="prediction() === 'width'"
            (click)="prediction.set('width')"
          >
            只是沒有寬度
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'width') {
              <strong>對。零 area 不等於這個位置不能成為 outcome。</strong>
            } @else {
              每次實驗仍會落在某一點；只是任何事先指定的單點都沒有可見寬度，因此分不到正 area。
            }
          </p>
        }
      </section>
      <section class="continuous-controls">
        <label
          >Interval width<input
            type="range"
            min="0"
            max="0.8"
            step="0.02"
            [value]="width()"
            (input)="width.set(+$any($event).target.value)"
          /><strong>{{ width().toFixed(2) }}</strong></label
        ><button type="button" (click)="width.set(0)">collapse to point</button>
      </section>
      <section class="interval-mass-board">
        <div class="density-stage">
          <div class="flat-density"><span>density = 1</span></div>
          <div class="selected-area" [style.left.%]="left() * 100" [style.width.%]="width() * 100">
            <i></i><strong>{{ probabilityLabel() }}</strong>
          </div>
          <div class="continuous-axis"><span>0</span><b>0.5</b><span>1</span></div>
        </div>
        <div class="area-equation">
          <div><span>height</span><strong>1</strong></div>
          <i>×</i>
          <div>
            <span>width</span><strong>{{ width().toFixed(2) }}</strong>
          </div>
          <i>=</i>
          <div class="mass-result">
            <span>probability</span><strong>{{ probabilityLabel() }}</strong>
          </div>
        </div>
        <p class="interval-reading">{{ reading() }}</p>
      </section>
      <aside class="insight-card">
        <div class="interval-core" aria-hidden="true">
          <span>density</span><i>×</i><span>width</span><b>→</b><strong>probability area</strong>
        </div>
        <div>
          <span class="card-label">Point 沒有 width，所以沒有 area</span>
          <p>
            <strong
              >Continuous outcome 會落在某點；但 probability 要問一段範圍接住多少重量。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>正式層：單點、interval 與積分</summary>
        <div class="continuous-formulas">
          <app-math e="P(X=x)=0" /><app-math e="P(a\\le X\\le b)=\\int_a^b f_X(x)\\,dx" />
          <p>
            因此在 continuous model 裡，&lt; 與 ≤ 對 probability
            沒有差別；兩者只差一個零重量的端點。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ContinuousIntervalComponent {
  readonly prediction = signal<'impossible' | 'width' | null>(null);
  readonly width = signal(0.4);
  readonly left = computed(() => 0.5 - this.width() / 2);
  readonly probabilityLabel = computed(() => percent(this.width()));
  readonly reading = computed(() =>
    this.width() === 0
      ? '區間已縮成單點：height 還在，但 width 與 area 都變成 0。'
      : '目前 [' +
        this.left().toFixed(2) +
        ', ' +
        (this.left() + this.width()).toFixed(2) +
        '] 用寬度接住 ' +
        this.probabilityLabel() +
        ' 的重量。',
  );
}
