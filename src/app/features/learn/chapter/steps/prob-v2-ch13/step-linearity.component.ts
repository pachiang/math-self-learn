import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type Coupling = 'together' | 'opposite';

interface Scenario {
  x: number;
  y: number;
  total: number;
}

@Component({
  selector: 'app-prob-v2-linearity',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch13">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 13.3</p>
        <h2>Linearity：先相加再平均，等於先平均再相加</h2>
        <p class="lede">
          <strong>期望值的線性（linearity of expectation）</strong>不要求 independence。重新配對
          X、Y 會改變 total distribution，但不會改變 total 的 weighted center。
        </p>
      </header>

      <section class="scene">
        <div class="moment-prediction">
          <div>
            <p class="eyebrow">先預測 · rearrange Y across four scenarios</p>
            <h3>只重新配對、不改 X 與 Y 各自 values，E[X+Y] 會改變嗎？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測重新配對是否改變總期望值">
            <button
              type="button"
              [class.selected]="prediction() === 'change'"
              (click)="prediction.set('change')"
            >
              會改變
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'same'"
              (click)="prediction.set('same')"
            >
              不會改變
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'same') {
              <strong>對，兩種 coupling 的 E[X+Y] 都是 2.5。</strong>Total outcomes 會變，但四張
              cards 的總和再平均不變。
            } @else {
              配對會把 totals 從 0/5 改成 2/3；但所有 X chips 與 Y chips 的總量都沒變，所以 center
              仍是 2.5。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Coupling switch · same marginals</p>
            <h3>重新排列 Y chips，觀察哪一層改變、哪一層不變</h3>
          </div>
          <div class="preset-row" role="group" aria-label="切換 X Y 配對方式">
            <button
              type="button"
              [class.active]="coupling() === 'together'"
              (click)="coupling.set('together')"
            >
              Move together
            </button>
            <button
              type="button"
              [class.active]="coupling() === 'opposite'"
              (click)="coupling.set('opposite')"
            >
              Move opposite
            </button>
          </div>
        </div>
      </section>

      <section class="linearity-board">
        <div class="scenario-grid">
          @for (scenario of scenarios(); track $index) {
            <div class="scenario-card">
              <span>scenario {{ $index + 1 }} · 25%</span>
              <div class="chip x-chip">
                <small>X</small><strong>{{ scenario.x }}</strong>
              </div>
              <i>+</i>
              <div class="chip y-chip">
                <small>Y</small><strong>{{ scenario.y }}</strong>
              </div>
              <i>=</i>
              <div class="chip total-chip">
                <small>total</small><strong>{{ scenario.total }}</strong>
              </div>
            </div>
          }
        </div>

        <div class="linearity-readouts">
          <div>
            <span>Center of X</span><strong>E[X] = {{ meanX() }}</strong>
          </div>
          <i>+</i>
          <div>
            <span>Center of Y</span><strong>E[Y] = {{ meanY() }}</strong>
          </div>
          <i>=</i>
          <div class="total">
            <span>Center of totals</span><strong>E[X+Y] = {{ meanTotal() }}</strong>
          </div>
        </div>
        <p class="coupling-note">{{ couplingNote() }}</p>
      </section>

      <aside class="insight-card">
        <div class="linearity-core" aria-hidden="true">
          <div><span>add each scenario</span><strong>then average</strong></div>
          <i>=</i>
          <div><span>average separately</span><strong>then add</strong></div>
        </div>
        <div>
          <span class="card-label">Averaging commutes with addition</span>
          <p>
            <strong>Independence 會決定 totals 如何分布，卻不影響 total 的 expectation。</strong>
            Linearity 只需要每個 scenario 中 ordinary addition 的總量守恆。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>證明層：linearity 與 affine transformation</summary>
        <div>
          <div class="math-line">
            <app-math e="E[X+Y]=\\sum_\\omega (X(\\omega)+Y(\\omega))P(\\omega)" />
          </div>
          <div class="math-line">
            <app-math e="=E[X]+E[Y]" />
          </div>
          <p>沒有一步使用 independence。更一般地：</p>
          <div class="math-line"><app-math e="E[aX+b]=aE[X]+b" /></div>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2LinearityComponent {
  readonly prediction = signal<'change' | 'same' | null>(null);
  readonly coupling = signal<Coupling>('together');
  readonly scenarios = computed<Scenario[]>(() => {
    const xValues = [0, 0, 2, 2];
    const yValues = this.coupling() === 'together' ? [0, 0, 3, 3] : [3, 3, 0, 0];
    return xValues.map((x, index) => ({ x, y: yValues[index], total: x + yValues[index] }));
  });
  readonly meanX = computed(() => this.mean(this.scenarios().map((item) => item.x)));
  readonly meanY = computed(() => this.mean(this.scenarios().map((item) => item.y)));
  readonly meanTotal = computed(() => this.mean(this.scenarios().map((item) => item.total)));
  readonly couplingNote = computed(() =>
    this.coupling() === 'together'
      ? 'Strong positive dependence：totals 是 0、0、5、5，spread 很大。'
      : 'Strong negative dependence：totals 是 3、3、2、2，spread 很小。',
  );

  mean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}
