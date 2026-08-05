import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { chiSquarePdf } from './normal-family-math';

@Component({
  selector: 'app-prob-v2-degrees-freedom',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch17">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 17.6</p>
        <h2>Degrees of freedom 增加，是加入更多獨立 energy pieces</h2>
        <p class="lede">
          χ² 的 ν 不是神祕修正值。多一個 degree of freedom，就多一個 Z² contribution；center
          向右增加 1，而相對起伏因加總而逐漸穩定。
        </p>
      </header>
      <section class="scene normal-prediction">
        <div>
          <p class="eyebrow">先預測 · add one coordinate</p>
          <h3>ν 從 2 增到 10，χ² center 應留在 2，還是移到 10？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.selected]="prediction() === 2" (click)="prediction.set(2)">
            留在 2</button
          ><button
            type="button"
            [class.selected]="prediction() === 10"
            (click)="prediction.set(10)"
          >
            移到 10
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 10) {
              <strong>對。每個 Z² 平均貢獻 1，十份平均 energy 的總和是 10。</strong>
            } @else {
              ν 直接數 contributions；加入八份新的平均 energy，center 不可能保持不動。
            }
          </p>
        }
      </section>
      <section class="normal-controls">
        <label
          >Degrees of freedom ν<input
            type="range"
            min="1"
            max="16"
            step="1"
            [value]="df()"
            (input)="df.set(+$any($event).target.value)"
          /><strong>{{ df() }}</strong></label
        >
      </section>
      <section class="df-board">
        <div class="df-density">
          @for (bar of bars(); track bar.x) {
            <i [style.height.%]="bar.height"></i>
          }
          <b class="df-mean" [style.left.%]="meanPosition()"
            ><span>mean ν={{ df() }}</span></b
          >
          <div>
            <span>0</span><span>total squared energy</span><span>{{ limit().toFixed(0) }}</span>
          </div>
        </div>
        <div class="df-pieces">
          @for (piece of pieces(); track piece) {
            <i
              ><small>Z{{ piece }}²</small><b>mean 1</b></i
            >
          }
          <strong>{{ df() }} pieces</strong>
        </div>
        <div class="df-stats">
          <div>
            <span>mean</span><strong>{{ df() }}</strong>
          </div>
          <div>
            <span>SD</span><strong>{{ sd().toFixed(2) }}</strong>
          </div>
          <div>
            <span>relative SD</span><strong>{{ relativeSd().toFixed(2) }}</strong>
          </div>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="normal-family-core">
          <span>ν pieces</span><i>→</i><strong>mean ν · relative noise ↓</strong>
        </div>
        <div>
          <span class="card-label">More dimensions add energy and average irregularity</span>
          <p><strong>Absolute width 仍變大，但相對於 center 的寬度會縮小。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>公式層：χ² density 與 moments</summary>
        <div class="normal-formulas">
          <app-math e="Q\\sim\\chi_\\nu^2" /><app-math
            e="E[Q]=\\nu,\\qquad \\operatorname{Var}(Q)=2\\nu"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2DegreesFreedomComponent {
  readonly prediction = signal<number | null>(null);
  readonly df = signal(4);
  readonly sd = computed(() => Math.sqrt(2 * this.df()));
  readonly relativeSd = computed(() => this.sd() / this.df());
  readonly limit = computed(() => Math.max(10, this.df() + 4 * this.sd()));
  readonly bars = computed(() => {
    const xs = Array.from({ length: 72 }, (_, i) => ((i + 0.5) / 72) * this.limit());
    const vals = xs.map((x) => chiSquarePdf(x, this.df()));
    const max = Math.max(...vals);
    return xs.map((x, i) => ({ x, height: (vals[i] / max) * 100 }));
  });
  readonly meanPosition = computed(() => (this.df() / this.limit()) * 100);
  readonly pieces = computed(() => Array.from({ length: this.df() }, (_, i) => i + 1));
  readonly reading = computed(() =>
    this.df() < 3
      ? '少數 squared pieces 使 distribution 強烈右偏，0 附近仍很重要。'
      : this.df() > 10
        ? '許多 pieces 相加後，center 變大，relative width 明顯縮小。'
        : '增加 ν 時，curve 向右移，同時逐步減少相對偏斜。',
  );
}
