import { Component, computed, signal } from '@angular/core';
import { formatPoly, polyMul, reduceTrace } from './fields-ch3-model';

const M = [-2, 0, 1]; // x² − 2

@Component({
  selector: 'app-fields-ch3-clock-isomorphism',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 3.3</p>
        <h2>加一個根 = 拿 minimal polynomial 當時鐘</h2>
        <p class="lede">
          在 <code>ℚ(√2)</code> 裡用 <code>α² = 2</code> 算，和把式子當多項式、再 <strong>mod (x² − 2)</strong> 算，是<strong>同一件事</strong>。
          兩欄逐字相同——<code>α</code> 只是 <code>x mod (x²−2)</code> 的名字。這就是 <code>K(α) ≅ K[x]/(m)</code>。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>「在 ℚ(√2) 裡乘」和「多項式乘完再 mod (x²−2)」，會得到一樣的答案嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'same'" (click)="prediction.set('same')">一樣</button>
          <button type="button" [class.active]="prediction() === 'diff'" (click)="prediction.set('diff')">不一樣</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'diff'">
            {{ prediction() === 'same'
              ? '對。調下面的係數，兩欄永遠給同一組數字——這就是「同構」。'
              : '其實一樣：α² 摺回 2，正是 x² ≡ 2 (mod x²−2)。調係數自己比對兩欄。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="兩個因子的係數">
        <span class="kicker">因子一：a + bα</span>
        <span class="mini">a</span>
        @for (v of vals; track v) { <button type="button" [class.active]="a() === v" (click)="a.set(v)">{{ v }}</button> }
        <span class="mini">b</span>
        @for (v of vals; track v) { <button type="button" [class.active]="b() === v" (click)="b.set(v)">{{ v }}</button> }
      </div>
      <div class="control-row" aria-label="第二個因子的係數">
        <span class="kicker">因子二：c + dα</span>
        <span class="mini">c</span>
        @for (v of vals; track v) { <button type="button" [class.active]="c() === v" (click)="c.set(v)">{{ v }}</button> }
        <span class="mini">d</span>
        @for (v of vals; track v) { <button type="button" [class.active]="d() === v" (click)="d.set(v)">{{ v }}</button> }
      </div>

      <section class="stage iso-grid">
        <div class="iso-col alpha-col">
          <p class="board-scope is-field">在 ℚ(√2) 裡 · 用 α² = 2</p>
          <div class="iso-line">{{ inputStr('α') }}</div>
          <div class="iso-line">= {{ productStr('α') }}</div>
          <div class="iso-line reduce">用 α² = 2 摺回</div>
          <div class="iso-result">= {{ resultStr('α') }}</div>
        </div>
        <div class="iso-eq" aria-hidden="true">≅</div>
        <div class="iso-col x-col">
          <p class="board-scope">在 ℚ[x]/(x²−2) 裡 · mod (x²−2)</p>
          <div class="iso-line">{{ inputStr('x') }}</div>
          <div class="iso-line">= {{ productStr('x') }}</div>
          <div class="iso-line reduce">mod (x² − 2)：x² ≡ 2</div>
          <div class="iso-result">= {{ resultStr('x') }}</div>
        </div>
      </section>

      <p class="equation">兩欄每一步、最後結果都相同——差別只是把 <code>x</code> 叫成 <code>α</code>。</p>

      <section class="insight">
        <span class="insight-icon">≅</span>
        <div>
          <strong>加一個根 = 把多項式環 quotient 掉它的 minimal polynomial</strong>
          <span>——<code>K(α) ≅ K[x]/(m)</code>；元素就是「次數 &lt; n 的多項式」，α 是 x mod m 的名字。</span>
        </div>
      </section>

      <details>
        <summary>接回環課：這就是 quotient ring</summary>
        <p>
          <code>K[x]</code> 是一個 ring，<code>(m)</code> 是它的一個 ideal。quotient <code>K[x]/(m)</code> 把「差一個 m 的倍數」的多項式視為相同，
          剩下的代表元就是次數 &lt; n 的餘式。把 <code>x</code> 這個 class 命名為 <code>α</code>，乘法規則 <code>x² ≡ 2</code> 就成了 <code>α² = 2</code>。
          這正是環課 quotient ring 的續集，只是這次拿它來「造一個根」。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh3ClockIsomorphismComponent {
  readonly vals = [-2, -1, 0, 1, 2];
  readonly a = signal(2);
  readonly b = signal(1);
  readonly c = signal(1);
  readonly d = signal(1);
  readonly prediction = signal<'same' | 'diff' | null>(null);

  private readonly product = computed(() => polyMul([this.a(), this.b()], [this.c(), this.d()]));
  private readonly result = computed(() => reduceTrace(this.product(), M, 'α').result);

  inputStr(sym: string): string {
    return `(${formatPoly([this.a(), this.b()], sym)})(${formatPoly([this.c(), this.d()], sym)})`;
  }
  productStr(sym: string): string {
    return formatPoly(this.product(), sym);
  }
  resultStr(sym: string): string {
    return formatPoly(this.result(), sym);
  }
}
