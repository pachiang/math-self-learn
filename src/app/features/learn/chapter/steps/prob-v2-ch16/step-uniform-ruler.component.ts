import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { percent } from './continuous-math';

@Component({
  selector: 'app-prob-v2-uniform-ruler',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch16">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 16.2</p>
        <h2>Uniform：相同長度的 windows，接住相同重量</h2>
        <p class="lede">
          <strong>均勻分布（Uniform distribution）</strong>不是替無限多個 points
          各分一票；它把相同的 density 鋪滿整段 support。
        </p>
      </header>
      <section class="continuous-controls uniform-controls">
        <label
          >Window start<input
            type="range"
            min="0"
            max="8"
            step="0.25"
            [value]="start()"
            (input)="start.set(+$any($event).target.value)"
          /><strong>{{ start().toFixed(2) }}</strong></label
        ><label
          >Window length<input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            [value]="length()"
            (input)="length.set(+$any($event).target.value)"
          /><strong>{{ length().toFixed(2) }}</strong></label
        >
      </section>
      <section class="uniform-ruler-board">
        <div class="uniform-density">
          <span>flat density = 1 / 10</span>
          <div class="uniform-window" [style.left.%]="start() * 10" [style.width.%]="length() * 10">
            <b>window A</b><strong>{{ probabilityLabel() }}</strong>
          </div>
          <div
            class="uniform-window mirror"
            [style.left.%]="mirrorStart() * 10"
            [style.width.%]="length() * 10"
          >
            <b>same-length B</b><strong>{{ probabilityLabel() }}</strong>
          </div>
        </div>
        <div class="uniform-axis">
          @for (tick of ticks; track tick) {
            <span [style.left.%]="tick * 10">{{ tick }}</span>
          }
        </div>
        <div class="uniform-comparison">
          <div>
            <span>A starts at</span><strong>{{ start().toFixed(2) }}</strong>
          </div>
          <i>same length</i>
          <div>
            <span>B starts at</span><strong>{{ mirrorStart().toFixed(2) }}</strong>
          </div>
          <b>equal weight</b>
        </div>
      </section>
      <aside class="insight-card">
        <div class="uniform-core" aria-hidden="true">
          <span class="window-chip">same length</span><i>→</i><strong>same probability</strong>
        </div>
        <div>
          <span class="card-label">Uniform 的 invariant 是 length</span>
          <p>
            <strong>Window 搬到哪裡不重要；只要沒有超出 support，重量只由它有多寬決定。</strong>
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>公式層：Uniform(a,b) 的 density 與中心</summary>
        <div class="continuous-formulas">
          <app-math e="f_X(x)=\\frac{1}{b-a},\\quad a\\le x\\le b" /><app-math
            e="E[X]=\\frac{a+b}{2},\\qquad \\operatorname{Var}(X)=\\frac{(b-a)^2}{12}"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2UniformRulerComponent {
  readonly start = signal(1);
  readonly length = signal(2);
  readonly ticks = Array.from({ length: 11 }, (_, index) => index);
  readonly mirrorStart = computed(() => Math.min(8, 9 - this.start()));
  readonly probabilityLabel = computed(() => percent(this.length() / 10));
}
