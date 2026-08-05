import { Component, computed, signal } from '@angular/core';
import { CltSource, histogram, standardizedMean } from './clt-math';

@Component({
  selector: 'app-prob-v2-universality',
  standalone: true,
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.4</p>
        <h2>不同 source 不會失去身份；是它們的 standardized sums 共享一個 attractor</h2>
        <p class="lede">
          <strong>Universality</strong> 指很多不同 micro-level shapes
          經過相加與標準化後，macro-level distribution 走向同一個 Normal target。共同的是 output
          law，不是 input data。
        </p>
      </header>
      <section class="clt-controls">
        <label
          >Terms per sum n<input
            type="range"
            min="1"
            max="200"
            step="1"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="universality-board">
        @for (panel of panels(); track panel.key) {
          <article>
            <span>{{ panel.label }} SOURCE</span>
            <div>
              @for (bar of panel.bars; track bar.index) {
                <i [style.height.%]="bar.height"></i>
              }
            </div>
            <strong>{{ panel.reading }}</strong>
          </article>
        }
        <div class="normal-attractor">
          <span>shared target</span><strong>STANDARD NORMAL</strong
          ><i>same center 0 · same scale 1</i>
        </div>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>different microscopic shapes</span><i>same operation</i
          ><strong>shared macroscopic limit</strong>
        </div>
        <div>
          <span class="card-label">Universal does not mean condition-free</span>
          <p>
            <strong
              >Finite variance、足夠 independence 與沒有單一項支配總和，才讓這個 attractor
              出現。</strong
            >
          </p>
        </div>
      </aside>
    </article>
  `,
})
export class ProbV2UniversalityComponent {
  readonly n = signal(20);
  readonly sources: { key: CltSource; label: string }[] = [
    { key: 'bernoulli', label: 'BERNOULLI' },
    { key: 'uniform', label: 'UNIFORM' },
    { key: 'exponential', label: 'EXPONENTIAL' },
  ];
  readonly panels = computed(() =>
    this.sources.map((item) => {
      const values = Array.from({ length: 260 }, (_, w) => standardizedMean(item.key, w, this.n()));
      return {
        ...item,
        bars: histogram(values, 31),
        reading:
          this.n() < 5
            ? 'source shape still visible'
            : this.n() > 60
              ? 'strongly aligned with target'
              : 'moving toward the same target',
      };
    }),
  );
}
