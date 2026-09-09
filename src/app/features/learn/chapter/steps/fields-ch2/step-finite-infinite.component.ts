import { Component, computed, signal } from '@angular/core';

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
              ? '對。但一直按出更多 cards 不是證明；右邊的 transcendence gate 才說明為什麼永遠收不完。'
              : '其實是無限。只要在 ℝ 裡找到一組永遠增加的獨立方向就夠；右邊用 π 的冪做出這組 family。' }}
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

        <div class="cmp-panel infinite-panel">
          <p class="board-scope">INFINITE SUBEXTENSION · ℚ(π) / ℚ</p>
          <div class="power-rail" role="list" aria-live="polite" aria-label="目前已顯示的 π 冪獨立方向">
            @for (power of powers(); track power) {
              <span class="power-card" role="listitem">
                <small>DIRECTION {{ power + 1 }}</small>
                <strong>{{ powerLabel(power) }}</strong>
                <span>independent</span>
              </span>
            }
            <span class="rail-continuation" aria-hidden="true">···</span>
          </div>
          <div class="control-row">
            <button type="button" (click)="addPower()" [disabled]="maxPower() >= 8">加入下一個 π 的冪 →</button>
            <button type="button" [class.active]="argumentVisible()" (click)="argumentVisible.set(true)">為什麼永遠不會收完？</button>
            <button type="button" (click)="reset()">重設</button>
          </div>
          <div class="relation-gate" [class.open]="argumentVisible()" aria-live="polite">
            <span class="gate-tag">TRANSCENDENCE GATE · GENERAL ARGUMENT</span>
            @if (argumentVisible()) {
              <strong>{{ candidateRelation() }}</strong>
              <p>若最新一張能由前面的 cards 組成，就得到一條 π 滿足的非零有理係數多項式。但 π 是 transcendental，這不可能。</p>
            } @else {
              <strong>有限次點擊只能展示 pattern，還不能證明「永遠」。</strong>
              <p>打開 gate，檢查為什麼下一個方向必定是新的。</p>
            }
          </div>
          <p class="infinite-verdict"><strong>{{ powers().length }}</strong> 張只是目前視窗；<code>1,π,π²,…</code> 是無限 linearly independent family。因 <code>ℚ(π)⊂ℝ</code>，所以 <code>[ℝ:ℚ]</code> 也必為無限。</p>
        </div>
      </section>

      <section class="insight">
        <span class="insight-icon">👓×2</span>
        <div>
          <strong>有限維要有一組有限 basis；證明無限維，只要找到一組永遠增加的獨立方向</strong>
          <span>——π 的 transcendence 保證 <code>1,π,π²,…</code> 不可能被任何有限 relation 收起來。</span>
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
          <code>[L:K]</code> 有限就稱 <strong>finite extension</strong>，是本課主線。主畫面先證明 <code>ℚ(π)/ℚ</code> 無限維：若
          <code>1,π,…,πⁿ</code> 有非平凡 ℚ-linear relation，清掉分母後 π 就會滿足非零整係數多項式，違反 transcendental。又因 <code>ℚ(π)⊂ℝ</code>，<code>ℝ/ℚ</code> 不可能有限維。
          另一條證明是 cardinality：若 <code>ℝ/ℚ</code> 有限維，ℝ 會是有限多個 ℚ-基底的線性組合，因此可數；但 ℝ 不可數，矛盾。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh2FiniteInfiniteComponent {
  readonly maxPower = signal(2);
  readonly prediction = signal<'finite' | 'infinite' | null>(null);
  readonly argumentVisible = signal(false);
  readonly powers = computed(() => Array.from({ length: this.maxPower() + 1 }, (_, index) => index));
  readonly candidateRelation = computed(() => {
    const n = this.maxPower();
    const priorCombination = Array.from({ length: n }, (_, power) =>
      `q${this.subscript(power)}${power === 0 ? '' : '·' + this.powerLabel(power)}`,
    ).join(' + ');
    return `${this.powerLabel(n)} = ${priorCombination} ?`;
  });

  addPower(): void {
    this.maxPower.update((value) => Math.min(8, value + 1));
  }

  powerLabel(power: number): string {
    if (power === 0) return '1';
    if (power === 1) return 'π';
    return `π${this.superscript(power)}`;
  }

  private superscript(value: number): string {
    const digits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return String(value).split('').map((digit) => digits[Number(digit)]).join('');
  }

  private subscript(value: number): string {
    const digits = '₀₁₂₃₄₅₆₇₈₉';
    return String(value).split('').map((digit) => digits[Number(digit)]).join('');
  }

  reset(): void {
    this.maxPower.set(2);
    this.prediction.set(null);
    this.argumentVisible.set(false);
  }
}
