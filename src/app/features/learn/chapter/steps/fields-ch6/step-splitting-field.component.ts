import { Component, computed, signal } from '@angular/core';
import { CRoot, ROOTS_X3_2, planeX, planeY } from './fields-ch6-model';

interface BuildState {
  field: string;
  factor: string;
  litCount: number; // 前幾顆根點亮
  linearFactors: number;
  dim: number;
  caption: string;
}

const STATES: BuildState[] = [
  { field: 'ℚ', factor: 'x³ − 2 （在 ℚ 上 irreducible）', litCount: 0, linearFactors: 0, dim: 1, caption: '起點：一個都還沒抓出來。' },
  { field: 'ℚ(∛2)', factor: '(x − ∛2)(x² + ∛2·x + ∛4)', litCount: 1, linearFactors: 1, dim: 3, caption: '抓出實根 ∛2；剩下的二次在 ℚ(∛2) 上仍 irreducible。' },
  { field: 'ℚ(∛2, ω)', factor: '(x − ∛2)(x − ω∛2)(x − ω²∛2)', litCount: 3, linearFactors: 3, dim: 6, caption: '再加 ω，二次也裂開——完全分解！這就是 splitting field。' },
];

@Component({
  selector: 'app-fields-ch6-splitting-field',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 6.2</p>
        <h2>splitting field：把全部根裝進來的最小世界</h2>
        <p class="lede">
          既然一個根裝不下全家，就<strong>一直加根，加到多項式完全散成一次因式</strong>為止。這個最小的世界叫
          <strong>splitting field</strong>。對 <code>x³ − 2</code>，它是 <code>ℚ(∛2, ω)</code>，維度 <code>3 × 2 = 6</code>。
        </p>
      </header>

      <span class="map-convention">ONE POLYNOMIAL · x³−2 · EXAMPLE + GENERAL RECIPE</span>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>要把 x³ − 2 三根全裝進來，從 ℚ(∛2) 起最少還要加什麼？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'real'" (click)="prediction.set('real')">再加一個實數</button>
          <button type="button" [class.active]="prediction() === 'omega'" (click)="prediction.set('omega')">加 ω（複數）</button>
          <button type="button" [class.active]="prediction() === 'inf'" (click)="prediction.set('inf')">要加無窮多東西</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'omega'">
            {{ prediction() === 'omega'
              ? '對。加 ω（或第二個根），二次因式就裂開，三根到齊。下面逐步看。'
              : '只要再加 ω：剩下的二次因式一旦有根，就完全分解，不需要無窮多。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="加根到完全分解">
        <span class="kicker">加到完全分解</span>
        <button type="button" (click)="next()" [disabled]="step() >= 2">下一步加根 →</button>
        <button type="button" (click)="step.set(0)">重播</button>
      </div>

      <section class="stage split-grid">
        <div class="plane-board">
          <p class="board-scope" [class.is-field]="step() >= 2">在 {{ state().field }} 裡，x³ − 2 的根</p>
          <svg class="plane-svg" viewBox="0 0 300 300" role="img" [attr.aria-label]="'x³−2 的根，' + state().litCount + ' 顆已納入 ' + state().field">
            <line class="axis" x1="20" y1="150" x2="280" y2="150" />
            <line class="axis" x1="150" y1="20" x2="150" y2="280" />
            <text class="axis-tag" x="284" y="154">Re</text>
            <text class="axis-tag" x="154" y="26">Im</text>
            @for (r of roots; track r.label; let i = $index) {
              <g [attr.transform]="'translate(' + px(r) + ' ' + py(r) + ')'">
                <circle class="root-dot" [class.lit]="i < state().litCount" [class.out]="i >= state().litCount" r="9" />
                <text class="root-label" [class.out]="i >= state().litCount" x="13" y="4">{{ r.label }}</text>
              </g>
            }
          </svg>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">分解進度</p>
          <h3>{{ state().linearFactors }} / 3 個一次因式</h3>
          <p class="factor-line">{{ state().factor }}</p>
          <p>{{ state().caption }}</p>
          <div class="readout">目前世界 {{ state().field }} · 維度 {{ state().dim }}{{ step() >= 2 ? '（splitting field 達成）' : '' }}</div>
          <p class="evidence-tag">證據強度：EXAMPLE（x³−2）＋ GENERAL RECIPE（有限次逐根加入）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">⋯→|||</span>
        <div>
          <strong>splitting field：加根加到多項式完全散成一次因式的最小世界</strong>
          <span>——對 x³ − 2 就是 ℚ(∛2, ω)，維度 3 × 2 = 6（tower law）。</span>
        </div>
      </section>

      <details>
        <summary>符號層：splitting field</summary>
        <p>
          <code>f</code> 在 <code>K</code> 上的 <strong>splitting field</strong> 是使 <code>f</code> 分解成一次因式的最小擴張。做法：抓出一個根 → 對商多項式重複，直到全裂開。
          對 <code>x³ − 2</code>：<code>ℚ → ℚ(∛2)</code>（次數 3）<code>→ ℚ(∛2, ω)</code>（再 ×2）→ <code>[ℚ(∛2,ω):ℚ] = 6</code>。它存在且在同構意義下唯一。
          一般 recipe 會終止，因為每加入一根就至少移除一個一次因式，而 <code>deg f</code> 有限；「最小」指任何能讓 <code>f</code> 完全分解的 field 都必須含住由全部根生成的 field。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh6SplittingFieldComponent {
  readonly roots: CRoot[] = ROOTS_X3_2;
  readonly states = STATES;
  readonly step = signal(0);
  readonly prediction = signal<'real' | 'omega' | 'inf' | null>(null);

  readonly state = computed(() => this.states[this.step()]);

  next(): void {
    this.step.set(Math.min(2, this.step() + 1));
  }
  px(r: CRoot): number {
    return planeX(r.re);
  }
  py(r: CRoot): number {
    return planeY(r.im);
  }
}
