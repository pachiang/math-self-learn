import { Component, computed, signal } from '@angular/core';

const POOL = ['√2', '∛2', 'π', 'e', '√3', '√5', '⁴√2', 'log₂3', 'φ', '∛5', 'π²', '√7'];

@Component({
  selector: 'app-fields-ch2-finite-infinite',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 2.4</p>
        <h2>有些擴張列得完，有些永遠列不完</h2>
        <p class="lede">
          <code>ℚ(√2)</code>、<code>ℚ(∛2)</code> 的基底列得完——它們是<strong>有限維</strong>擴張，本課的主場。但把
          <strong>整個 ℝ</strong> 當作 ℚ 上的向量空間，方向卻怎麼加都加不完。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>把 ℝ 當作 ℚ 上的 vector space，維度是有限還是無限？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'finite'" (click)="prediction.set('finite')">有限</button>
          <button type="button" [class.active]="prediction() === 'infinite'" (click)="prediction.set('infinite')">無限</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'finite'">
            {{ prediction() === 'infinite'
              ? '對。右邊按「加入一個新方向」，會發現永遠停不下來 → 無限維。'
              : '其實是無限：√2、∛2、π、e… 彼此獨立，列不完。右邊試試看。' }}
          </p>
        }
      </section>

      <section class="stage compare-grid">
        <div class="cmp-panel">
          <p class="board-scope">FINITE EXTENSION · 基底列得完（本課主場）</p>
          <div class="fin-row"><span class="fin-name">ℚ(√2)</span><span class="fin-basis">{{ '{' }} 1, √2 {{ '}' }}</span><span class="fin-dim">維度 2 · 完整</span></div>
          <div class="fin-row"><span class="fin-name">ℚ(∛2)</span><span class="fin-basis">{{ '{' }} 1, ∛2, ∛4 {{ '}' }}</span><span class="fin-dim">維度 3 · 完整</span></div>
          <div class="fin-row"><span class="fin-name">ℂ = ℝ(i)</span><span class="fin-basis">{{ '{' }} 1, i {{ '}' }}</span><span class="fin-dim">維度 2 · 完整</span></div>
        </div>

        <div class="cmp-panel">
          <p class="board-scope">INFINITE · ℝ 當作 ℚ 上的向量空間</p>
          <div class="inf-chips" role="list" aria-live="polite">
            @for (d of directions(); track d) {
              <span class="chip inf" role="listitem">{{ d }}</span>
            }
            <span class="chip ghost">…</span>
          </div>
          <div class="control-row">
            <button type="button" (click)="addOne()" [disabled]="directions().length >= pool.length">加入一個新獨立方向 →</button>
            <button type="button" (click)="reset()">重設</button>
          </div>
          <p class="equation blocked">已列出 {{ directions().length }} 個獨立方向，還沒完——ℝ/ℚ 是無限維。π 這種 transcendental 根本落不進任何有限維塔。</p>
        </div>
      </section>

      <section class="insight">
        <span class="insight-icon">👓×2</span>
        <div>
          <strong>同一個擴張，兩個透鏡</strong>
          <span>——對自己是 field（Ch1：能除）；對 base 是（有限維）vector space（Ch2：維度 [L:K]）。</span>
        </div>
      </section>

      <section class="transfer-strip" aria-label="換世界保持機制">
        <p class="kicker">受控遷移 · 換 base，機制不變</p>
        <p class="strip-note">
          <strong>F₄ 當作 F₂ 上的 vector space</strong>：F₄ = F₂(α)（α² + α + 1 = 0），基底 <code>{{ '{' }} 1, α {{ '}' }}</code>，
          <code>[F₄ : F₂] = 2</code>——和 ℚ(√2)/ℚ 完全同一種座標結構，只是 base 換成 <strong>char 2</strong> 的 finite field。
          「擴張＝vector space」與 characteristic 無關（回收 Ch1 的 finite field，也預告 Ch12）。
        </p>
      </section>

      <section class="teaser">
        <p class="kicker">留給下一章的問題</p>
        <p class="teaser-body">
          我們一直看到「高次冪一定摺回」：<code>√2·√2 = 2</code>、<code>(∛2)³ = 2</code>。為什麼恰好在第 <code>n</code> 次摺回？因為根滿足它自己的一條方程
          （minimal polynomial）。下一章把「摺回」變成<em>拿這條方程當時鐘</em>的 modular arithmetic：<code>K(α) ≅ K[x]/(m(x))</code>——
          而這正是環課 quotient ring 的續集。
        </p>
      </section>

      <details>
        <summary>符號層：finite extension 與 ℝ/ℚ 無限維</summary>
        <p>
          <code>[L:K]</code> 有限就稱 <strong>finite extension</strong>，是本課主線。<code>ℝ/ℚ</code> 為無限維：若它有限維，則 ℝ 會是可數集合（有限多個 ℚ-基底的有限線性組合），
          但 ℝ 不可數，矛盾。維度 <code>[L:K]</code> 不依賴選定的基底，因此是良定義的「擴張大小」。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh2FiniteInfiniteComponent {
  readonly pool = POOL;
  readonly directions = signal<string[]>(['√2', '∛2', 'π']);
  readonly prediction = signal<'finite' | 'infinite' | null>(null);

  addOne(): void {
    const next = this.pool[this.directions().length];
    if (next) this.directions.set([...this.directions(), next]);
  }
  reset(): void {
    this.directions.set(['√2', '∛2', 'π']);
    this.prediction.set(null);
  }
}
