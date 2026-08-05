import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { histogram, sampleMean } from './lln-math';

type DependenceMode = 'independent' | 'blocks' | 'clone';
@Component({
  selector: 'app-prob-v2-lln-dependence',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.6</p>
        <h2>More rows 不一定代表 more information</h2>
        <p class="lede">
          LLN 需要 observations 提供足夠新的訊息。把同一筆資料複製 500 次，表格雖然變長，average 的
          uncertainty 完全沒有縮小；強 dependence 會降低 effective sample size。
        </p>
      </header>
      <section class="dependence-picker">
        @for (item of modes; track item.key) {
          <button type="button" [class.active]="mode() === item.key" (click)="mode.set(item.key)">
            <span>{{ item.label }}</span
            ><strong>{{ item.note }}</strong>
          </button>
        }
      </section>
      <section class="lln-controls">
        <label
          >Rows n<input
            type="range"
            min="10"
            max="500"
            step="10"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="dependence-board">
        <div class="dependency-tape">
          @for (cell of cells(); track $index) {
            <i [class.same]="cell.group % 2 === 0" [class.group-start]="cell.start">{{
              cell.value
            }}</i>
          }
        </div>
        <div class="dependence-histogram">
          @for (bar of bars(); track bar.index) {
            <i [style.height.%]="bar.height"></i>
          }
          <b style="left:60%">μ</b>
        </div>
        <div class="effective-readout">
          <span>ROWS</span><strong>{{ n() }}</strong
          ><i>vs</i><span>INDEPENDENT SOURCES</span><strong>{{ effectiveN() }}</strong>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>row count</span><i>≠</i><strong>independent information count</strong>
        </div>
        <div>
          <span class="card-label">Dependence can stop averaging from learning</span>
          <p>
            <strong>先問資料如何生成，再決定 n 是否真的能讓 sampling distribution 變窄。</strong>
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>條件層：LLN 是否一定要求 iid？</summary>
        <div class="lln-formulas">
          <p>
            iid 是最清楚的入門版本，但不是唯一版本；某些 weakly dependent sequences 仍滿足
            LLN。真正的問題是 correlations 是否衰減得足夠快，使平均 variance 仍趨近 0。
          </p>
          <app-math
            e="\\operatorname{Var}(\\bar X_n)=\\frac{1}{n^2}\\sum_{i,j}\\operatorname{Cov}(X_i,X_j)"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2LlnDependenceComponent {
  readonly mode = signal<DependenceMode>('independent');
  readonly n = signal(100);
  readonly modes = [
    { key: 'independent' as const, label: 'Independent', note: 'every row adds a source' },
    { key: 'blocks' as const, label: 'Blocks of 10', note: 'ten rows share one source' },
    { key: 'clone' as const, label: 'One clone', note: 'all rows copy one source' },
  ];
  readonly effectiveN = computed(() =>
    this.mode() === 'independent'
      ? this.n()
      : this.mode() === 'blocks'
        ? Math.ceil(this.n() / 10)
        : 1,
  );
  readonly cells = computed(() =>
    Array.from({ length: Math.min(80, this.n()) }, (_, i) => {
      const group =
        this.mode() === 'independent' ? i : this.mode() === 'blocks' ? Math.floor(i / 10) : 0;
      return {
        group,
        start: i === 0 || (this.mode() === 'blocks' && i % 10 === 0),
        value: (group * 17 + 3) % 5 < 3 ? 1 : 0,
      };
    }),
  );
  readonly means = computed(() =>
    Array.from({ length: 180 }, (_, world) => sampleMean(world, this.effectiveN(), 0.6)),
  );
  readonly bars = computed(() => histogram(this.means(), 30));
  readonly reading = computed(() =>
    this.mode() === 'clone'
      ? '500 copied rows still contain only one random draw; averages remain at 0 or 1.'
      : this.mode() === 'blocks'
        ? 'Rows arrive in clusters, so uncertainty shrinks roughly like the number of blocks—not raw rows.'
        : 'Every row contributes fresh variation, so increasing n produces the usual narrowing.',
  );
}
