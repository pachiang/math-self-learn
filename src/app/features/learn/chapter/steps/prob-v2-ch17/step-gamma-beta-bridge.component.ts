import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { betaPdf } from './normal-family-math';

@Component({
  selector: 'app-prob-v2-gamma-beta-bridge',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.7</p>
        <h2>χ² 是固定 rate 的 Gamma；兩堆 χ² normalize 後又成為 Beta</h2>
        <p class="lede">
          Distribution family 的連線不是「曲線長得像」。χ²<sub>ν</sub> 正是 shape ν/2、rate 1/2 的
          Gamma；兩份 independent χ² energy 比較 share，便落到 Beta。
        </p>
      </header>
      <section class="normal-controls dual">
        <label
          >Left df ν₁<input
            type="range"
            min="1"
            max="12"
            step="1"
            [value]="leftDf()"
            (input)="leftDf.set(+$any($event).target.value)"
          /><strong>{{ leftDf() }}</strong></label
        ><label
          >Right df ν₂<input
            type="range"
            min="1"
            max="12"
            step="1"
            [value]="rightDf()"
            (input)="rightDf.set(+$any($event).target.value)"
          /><strong>{{ rightDf() }}</strong></label
        >
      </section>
      <section class="bridge-board">
        <div class="chi-pools">
          <article>
            <span>LEFT ENERGY</span
            ><strong
              >χ²<sub>{{ leftDf() }}</sub></strong
            ><small>Gamma shape {{ leftShape() }}</small
            ><i [style.flex]="leftDf()"></i>
          </article>
          <article>
            <span>RIGHT ENERGY</span
            ><strong
              >χ²<sub>{{ rightDf() }}</sub></strong
            ><small>Gamma shape {{ rightShape() }}</small
            ><i [style.flex]="rightDf()"></i>
          </article>
        </div>
        <div class="bridge-operation">
          <span>normalize total energy</span><strong>Q₁ / (Q₁ + Q₂)</strong><i>↓</i>
        </div>
        <div class="bridge-beta">
          @for (bar of betaBars(); track bar.x) {
            <i [style.height.%]="bar.height"></i>
          }
          <b [style.left.%]="share() * 100"
            ><span>mean {{ share().toFixed(2) }}</span></b
          >
          <div>
            <span>0</span><span>Beta({{ leftShape() }}, {{ rightShape() }})</span><span>1</span>
          </div>
        </div>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>Normal²</span><i>→ χ² = Gamma</i><span>normalize two</span><i>→ Beta</i>
        </div>
        <div>
          <span class="card-label">Family arrows describe operations</span>
          <p>
            <strong
              >平方、加總與 normalize，讓上一章分開遇見的 distributions 接成同一個生成系統。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>等價層：參數如何沿箭頭改寫</summary>
        <div class="normal-formulas">
          <app-math
            e="Q\\sim\\chi_\\nu^2\\iff Q\\sim\\operatorname{Gamma}(\\nu/2,\\text{rate}=1/2)"
          /><app-math e="\\frac{Q_1}{Q_1+Q_2}\\sim\\operatorname{Beta}(\\nu_1/2,\\nu_2/2)" />
          <p>
            第二條要求 Q₁、Q₂ independent。它們共享相同 Gamma rate，因此 total scale 能被 ratio
            消去。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2GammaBetaBridgeComponent {
  readonly leftDf = signal(4);
  readonly rightDf = signal(8);
  readonly leftShape = computed(() => this.leftDf() / 2);
  readonly rightShape = computed(() => this.rightDf() / 2);
  readonly share = computed(() => this.leftDf() / (this.leftDf() + this.rightDf()));
  readonly betaBars = computed(() => {
    const xs = Array.from({ length: 64 }, (_, i) => (i + 0.5) / 64);
    const vals = xs.map((x) => betaPdf(x, this.leftShape(), this.rightShape()));
    const max = Math.max(...vals);
    return xs.map((x, i) => ({ x, height: (vals[i] / max) * 100 }));
  });
}
