import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-centering-scaling',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch19">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 19.3</p>
        <h2>Centering 防止 cloud 漂走；scaling 防止 cloud 消失</h2>
        <p class="lede">
          Standardization 的兩步各修一個問題。Sₙ 的 center 以 nμ 漂移，所以先 subtract nμ；centered
          cloud 的 width 又以 σ√n 長大，所以再 divide σ√n。
        </p>
      </header>
      <section class="clt-controls">
        <label
          >Number of terms n<input
            type="range"
            min="1"
            max="100"
            step="1"
            [value]="n()"
            (input)="n.set(+$any($event).target.value)"
          /><strong>{{ n() }}</strong></label
        >
        <div class="transform-switches">
          <button type="button" [class.active]="centered()" (click)="centered.set(!centered())">
            subtract nμ</button
          ><button type="button" [class.active]="scaled()" (click)="scaled.set(!scaled())">
            divide σ√n
          </button>
        </div>
      </section>
      <section class="standardization-board">
        <div class="sum-cloud" [style.left.%]="position()" [style.width.%]="width()">
          <i></i><b>{{ label() }}</b>
        </div>
        <div class="standard-axis"><span>− range</span><b>0</b><span>＋ range</span></div>
        <div class="transform-ledger">
          <div [class.done]="centered()">
            <span>DRIFT</span><strong>center = nμ</strong
            ><small>{{ centered() ? 'removed' : 'still present' }}</small>
          </div>
          <i>＋</i>
          <div [class.done]="scaled()">
            <span>SPREAD</span><strong>width = σ√n</strong
            ><small>{{ scaled() ? 'normalized' : 'still changing' }}</small>
          </div>
          <p>{{ reading() }}</p>
        </div>
      </section>
      <aside class="insight-card">
        <div class="clt-core">
          <span>subtract center</span><i>then</i><strong>divide natural width</strong>
        </div>
        <div>
          <span class="card-label">Standardization preserves shape for comparison</span>
          <p><strong>少任何一步，不同 n 的 clouds 就無法疊在同一固定座標上比較。</strong></p>
        </div>
      </aside>
      <details class="deep-dive">
        <summary>代數層：sum 與 mean 的兩種寫法</summary>
        <div class="clt-formulas">
          <app-math
            e="\\frac{S_n-n\\mu}{\\sigma\\sqrt n}=\\frac{\\bar X_n-\\mu}{\\sigma/\\sqrt n}"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CenteringScalingComponent {
  readonly n = signal(25);
  readonly centered = signal(false);
  readonly scaled = signal(false);
  readonly position = computed(() => (this.centered() ? 50 : Math.min(82, 50 + this.n() * 0.3)));
  readonly width = computed(() => (this.scaled() ? 28 : Math.min(70, 8 * Math.sqrt(this.n()))));
  readonly label = computed(() =>
    this.centered()
      ? this.scaled()
        ? 'fixed center · fixed width'
        : 'centered · width still changes'
      : 'raw sum drifts right',
  );
  readonly reading = computed(() =>
    !this.centered()
      ? 'Center 還隨 n 向右漂；先移除 predictable part nμ。'
      : !this.scaled()
        ? '現在 center 固定，但 cloud width 仍依 √n 改變。'
        : '兩步完成：不同 n 的 shapes 終於能在同一座標公平比較。',
  );
}
