import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { unit } from './lln-math';

@Component({
  selector: 'app-prob-v2-heavy-tail-boundary',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch18">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 18.7</p>
        <h2>若 mean 本身不存在，sample average 沒有中心可以收束</h2>
        <p class="lede">
          資料多不保證 average 穩定。<strong>柯西分布（Cauchy distribution）</strong>的 rare
          extremes 強到 expectation 不存在；任何晚來的巨大 observation 都可能再次把 average 拉走。
        </p>
      </header>
      <section class="tail-picker">
        <button type="button" [class.active]="mode() === 'bounded'" (click)="mode.set('bounded')">
          <span>FINITE MEAN</span><strong>bounded observations</strong></button
        ><button type="button" [class.active]="mode() === 'cauchy'" (click)="mode.set('cauchy')">
          <span>NO MEAN</span><strong>Cauchy extremes</strong>
        </button>
      </section>
      <section class="lln-controls">
        <label
          >Observations n<input
            type="range"
            min="5"
            max="500"
            step="1"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
      </section>
      <section class="tail-board">
        <svg viewBox="0 0 1000 330" role="img" aria-label="有限平均與 Cauchy 樣本平均路徑">
          <line x1="0" y1="165" x2="1000" y2="165" />
          <polyline [attr.points]="path()" [class.cauchy]="mode() === 'cauchy'" />
        </svg>
        <div class="extreme-ledger">
          <span>LARGEST |observation| SO FAR</span><strong>{{ largest().toFixed(2) }}</strong
          ><small>current average {{ current().toFixed(3) }}</small>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="lln-core">
          <span>more data</span><i>needs</i><strong>a finite target mean</strong>
        </div>
        <div>
          <span class="card-label">LLN has conditions</span>
          <p>
            <strong
              >Heavy tail 不是「收束得慢」的同義詞；Cauchy 的問題是根本沒有 μ 可供平均靠近。</strong
            >
          </p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>邊界層：finite mean 與 finite variance</summary>
        <div class="lln-formulas">
          <p>
            常見的 iid Strong LLN 只要求 E|X|&lt;∞，不必有 finite variance；Chebyshev
            的簡單證明則使用 finite variance。Cauchy 連 E|X| 都不有限，因此不符合。
          </p>
          <app-math
            e="X\\sim\\operatorname{Cauchy}\\quad\\Rightarrow\\quad \\bar X_n\\overset{d}=X"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2HeavyTailBoundaryComponent {
  readonly mode = signal<'bounded' | 'cauchy'>('bounded');
  readonly n = signal(120);
  readonly values = computed(() =>
    Array.from({ length: this.n() }, (_, i) => {
      const u = unit(i * 173);
      return this.mode() === 'bounded'
        ? u * 2 - 1
        : Math.tan(Math.PI * (Math.min(0.9999, Math.max(0.0001, u)) - 0.5));
    }),
  );
  readonly averages = computed(() => {
    let sum = 0;
    return this.values().map((x, i) => (sum += x) / (i + 1));
  });
  readonly clipped = computed(() => this.averages().map((x) => Math.max(-5, Math.min(5, x))));
  readonly path = computed(() =>
    this.clipped()
      .map(
        (x, i) => ((i / (this.n() - 1)) * 1000).toFixed(1) + ',' + (165 - (x / 5) * 150).toFixed(1),
      )
      .join(' '),
  );
  readonly largest = computed(() => Math.max(...this.values().map(Math.abs)));
  readonly current = computed(() => this.averages().at(-1) ?? 0);
  readonly reading = computed(() =>
    this.mode() === 'bounded'
      ? 'Every observation is bounded, so no late point can overpower a large denominator.'
      : 'A rare extreme can be comparable to—or larger than—the entire accumulated sum, restarting the apparent convergence.',
  );
}
