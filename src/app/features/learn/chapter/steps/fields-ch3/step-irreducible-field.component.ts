import { Component, computed, signal } from '@angular/core';
import { formatPoly, formatReciprocal, polyMul, reciprocalQuadratic, reduceTrace } from './fields-ch3-model';

const M_RED = [-1, 0, 1]; // x² − 1 = (x−1)(x+1)，可約

@Component({
  selector: 'app-fields-ch3-irreducible-field',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 3.4</p>
        <h2>為什麼這個時鐘世界是 field？</h2>
        <p class="lede">
          Ch1 說「ℤ/n 是 field ⇔ n 是質數」。多項式版一模一樣：<code>K[x]/(m)</code> 是 field ⇔ <strong>m 不可分解（irreducible）</strong>。
          irreducible 就是多項式界的「質數」；可約的 <code>m</code> 會冒出 zero divisor，除法就壞了。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>x² − 2 不可分解、x² − 1 = (x−1)(x+1) 可分解。哪個 quotient 是 field？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'irr'" (click)="prediction.set('irr')">x² − 2</button>
          <button type="button" [class.active]="prediction() === 'red'" (click)="prediction.set('red')">x² − 1</button>
          <button type="button" [class.active]="prediction() === 'both'" (click)="prediction.set('both')">兩個都是</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'irr'">
            {{ prediction() === 'irr'
              ? '對。x²−2 irreducible → 每個非零元都可逆；x²−1 可約 → 出現 zero divisor。切下面兩個 modulus 對照。'
              : '只有 x²−2：它 irreducible。x²−1 可約，(x−1)(x+1) ≡ 0 會壞掉除法。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選 modulus">
        <span class="kicker">MODULUS</span>
        <button type="button" [class.active]="mode() === 'irr'" (click)="mode.set('irr')">x² − 2（irreducible）</button>
        <button type="button" [class.active]="mode() === 'red'" (click)="mode.set('red')">x² − 1（可約）</button>
      </div>

      @if (mode() === 'irr') {
        <div class="control-row" aria-label="選非零元 a + bα">
          <span class="kicker">非零元 a + bα · a</span>
          @for (v of vals; track v) { <button type="button" [class.active]="a() === v" (click)="a.set(v)">{{ v }}</button> }
          <span class="mini">b</span>
          @for (v of vals; track v) { <button type="button" [class.active]="b() === v" (click)="b.set(v)">{{ v }}</button> }
        </div>

        <section class="stage field-grid">
          <div class="field-board">
            <p class="board-scope is-field">ℚ[x]/(x²−2) · IRREDUCIBLE → FIELD</p>
            @if (recip()) {
              <div class="inv-line"><span>元素</span><strong>{{ elementStr() }}</strong></div>
              <div class="inv-line"><span>逆元</span><strong>{{ recipStr() }}</strong></div>
              <div class="inv-check ok">{{ elementStr() }} · ({{ recipStr() }}) = 1 ✓</div>
              <p class="equation">每個非零元都找得到逆元——除法安全。</p>
            } @else {
              <p class="equation">請選一個非零元（a、b 不同時為 0）。</p>
            }
          </div>
          <aside class="console" aria-live="polite">
            <p class="kicker">為什麼一定可逆</p>
            <h3>gcd(f, m) = 1 → 有逆</h3>
            <p>m irreducible 且不整除非零的 f，兩者互質；由 Bézout，存在 g 使 f·g ≡ 1 (mod m)。</p>
            <div class="readout">對映 Ch1：irreducible ⇔ 質數 ⇔ 每個非零可逆 ⇔ field。</div>
          </aside>
        </section>
      } @else {
        <section class="stage field-grid">
          <div class="field-board">
            <p class="board-scope">ℚ[x]/(x²−1) · REDUCIBLE → 只是 ring</p>
            <div class="inv-line"><span>取兩個非零元</span><strong>α − 1</strong> 與 <strong>α + 1</strong></div>
            <div class="inv-line"><span>相乘 mod (x²−1)</span><strong>(α − 1)(α + 1) = {{ witnessProduct() }} → {{ witnessReduced() }}</strong></div>
            <div class="inv-check no">兩個非零元相乘 = 0 → zero divisor（witness）</div>
            <p class="equation blocked">α − 1 不可能有逆元：若有 u，則 α+1 = u·(α−1)(α+1) = u·0 = 0，矛盾。</p>
          </div>
          <aside class="console" aria-live="polite">
            <p class="kicker">為什麼壞掉</p>
            <h3>可約 → zero divisor</h3>
            <p>m = (x−1)(x+1) 一分解，兩個因式的 class 相乘就變成 0，於是有非零元不可逆。</p>
            <div class="readout warn-readout">對映 Ch1：6 = 2·3 合數 → ℤ/6 不是 field。</div>
          </aside>
        </section>
      }

      <section class="insight">
        <span class="insight-icon">irr↔p</span>
        <div>
          <strong>時鐘世界是不是 field，看 modulus 是不是 irreducible</strong>
          <span>——就像 ℤ/n 看 n 是不是質數。irreducible ＝ 多項式版的質數。</span>
        </div>
      </section>

      <details>
        <summary>接回 Ch1 與環課</summary>
        <p>
          Ch1.3：field ⇔ 只有 <code>(0)</code> 與整個 ring 兩個 ideal。環課 Ch16：<code>R/M</code> 是 field ⇔ <code>M</code> maximal。
          在 <code>K[x]</code> 裡，<code>(m)</code> maximal ⇔ <code>m</code> irreducible——所以 <code>K[x]/(m)</code> 恰在 m irreducible 時是 field。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh3IrreducibleFieldComponent {
  readonly vals = [-2, -1, 0, 1, 2];
  readonly mode = signal<'irr' | 'red'>('irr');
  readonly a = signal(1);
  readonly b = signal(1);
  readonly prediction = signal<'irr' | 'red' | 'both' | null>(null);

  readonly recip = computed(() => reciprocalQuadratic(this.a(), this.b(), 2));
  readonly elementStr = computed(() => formatPoly([this.a(), this.b()], 'α'));
  readonly recipStr = computed(() => {
    const r = this.recip();
    return r ? formatReciprocal(r) : '—';
  });

  // 可約情形的 witness：(α−1)(α+1) mod (x²−1)
  readonly witnessProduct = computed(() => formatPoly(polyMul([-1, 1], [1, 1]), 'α'));
  readonly witnessReduced = computed(() => reduceTrace(polyMul([-1, 1], [1, 1]), M_RED, 'α').resultStr);
}
