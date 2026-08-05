import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-chi-square-energy',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.5</p>
        <h2>χ² 是多個 standardized directions 的總 squared distance</h2>
        <p class="lede">
          <strong>卡方分布（chi-square distribution, χ²）</strong>不只是檢定表格裡的名稱。每個
          independent standard Normal coordinate 貢獻一份 Zᵢ²；全部相加就是點到原點的 squared
          distance。
        </p>
      </header>
      <section class="normal-controls">
        <label
          >Active dimensions ν<input
            type="range"
            min="1"
            max="6"
            step="1"
            [value]="dimensions()"
            (input)="dimensions.set(+$any($event).target.value)"
          /><strong>{{ dimensions() }}</strong></label
        ><button type="button" (click)="rotate()">new point</button>
      </section>
      <section class="energy-board">
        <div class="coordinate-energy">
          <span>STANDARDIZED COORDINATES</span>
          @for (value of activeValues(); track $index) {
            <div>
              <b>Z{{ $index + 1 }}={{ value.toFixed(2) }}</b
              ><i
                [style.width.%]="Math.min(100, (Math.abs(value) / 2) * 100)"
                [class.negative]="value < 0"
              ></i
              ><strong>Z²={{ (value * value).toFixed(2) }}</strong>
            </div>
          }
        </div>
        <div class="energy-sum">
          <span>SQUARE, THEN ADD</span>
          @for (value of activeValues(); track $index) {
            <i [style.flex]="value * value + 0.15"
              ><small>{{ (value * value).toFixed(1) }}</small></i
            >
          }
          <strong>Q = {{ energy().toFixed(2) }}</strong>
        </div>
        <div class="distance-orbit">
          <div class="origin"></div>
          <i [style.width.px]="radius()" [style.height.px]="radius()"></i
          ><b [style.transform]="'translate(' + pointX() + 'px,' + pointY() + 'px)'"></b
          ><span>same Q = same radius²</span>
        </div>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>Z₁² + ··· + Zᵥ²</span><i>=</i><strong>distance² from origin</strong>
        </div>
        <div>
          <span class="card-label">χ² measures total standardized energy</span>
          <p><strong>方向正負都消失；留下的是每個 independent direction 偏離中心多少。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>正式層：χ² 的生成定義</summary>
        <div class="normal-formulas">
          <app-math e="Z_1,\\ldots,Z_\\nu\\overset{\\text{iid}}\\sim N(0,1)" /><app-math
            e="Q=\\sum_{i=1}^{\\nu}Z_i^2\\sim\\chi_\\nu^2"
          />
          <p>
            ν 稱為 <strong>degrees of freedom</strong>；在這個生成模型中，它就是可獨立貢獻 squared
            energy 的 coordinates 數。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ChiSquareEnergyComponent {
  protected readonly Math = Math;
  readonly dimensions = signal(3);
  readonly phase = signal(0);
  readonly base = [1.2, -0.8, 0.55, 1.5, -1.1, 0.35];
  readonly activeValues = computed(() =>
    this.base.slice(0, this.dimensions()).map((x, i) => x * Math.cos(this.phase() + i * 0.37)),
  );
  readonly energy = computed(() => this.activeValues().reduce((sum, x) => sum + x * x, 0));
  readonly radius = computed(() => Math.min(180, 45 + this.energy() * 18));
  readonly pointX = computed(() => (Math.cos(this.phase() + 0.6) * this.radius()) / 2);
  readonly pointY = computed(() => (Math.sin(this.phase() + 0.6) * this.radius()) / 2);
  rotate(): void {
    this.phase.update((x) => x + 0.8);
  }
}
