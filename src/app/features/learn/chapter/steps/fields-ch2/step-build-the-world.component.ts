import { Component, computed, signal } from '@angular/core';
import {
  formatElement,
  formatFractionElement,
  mulByAlpha,
  polyMulMod,
  reciprocalQuadratic,
} from './fields-ch2-model';

const BASIS = ['1', '√2'];

@Component({
  selector: 'app-fields-ch2-build-the-world',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 2.1</p>
        <h2>接著上一章：把 √2 丟進 ℚ，最少還得帶進哪些數？</h2>
        <p class="lede">
          Ch1 收在一個沒解決的問題：<code>x² − 2</code> 在 ℚ 無解，得造一個裝下 √2 的最小世界。現在動手造。
          只要還想加減乘除，就得帶進所有 <strong>a + b√2</strong>——而神奇的是，這樣就<strong>封閉</strong>了，連倒數都跑不出去。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>把兩個 a + b√2 相乘、或取倒數，會不會逼出「第三種形式」（例如冒出 √3 或 2^(1/4)）？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'escape'" (click)="prediction.set('escape')">會跑出新形式</button>
          <button type="button" [class.active]="prediction() === 'closed'" (click)="prediction.set('closed')">不會，還是 a + b√2</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'escape'">
            {{ prediction() === 'closed'
              ? '對。下面調 a、b，看 ×√2、平方、倒數三種結果永遠摺回「兩個槽」。'
              : '其實不會：√2·√2 = 2 會摺回 1 的方向，所以永遠只need 1 與 √2 兩個方向。自己調調看。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選 a（1 的係數）">
        <span class="kicker">a（1 的係數）</span>
        @for (v of values; track v) {
          <button type="button" [class.active]="a() === v" (click)="a.set(v)">{{ v }}</button>
        }
      </div>
      <div class="control-row" aria-label="選 b（√2 的係數）">
        <span class="kicker">b（√2 的係數）</span>
        @for (v of values; track v) {
          <button type="button" [class.active]="b() === v" (click)="b.set(v)">{{ v }}</button>
        }
        <button type="button" (click)="reset()">重設 3 + 2√2</button>
      </div>

      <section class="stage">
        <p class="board-scope is-field">最小世界 ℚ(√2) = 所有 a + b√2 · 每個結果都落在 [1 槽][√2 槽]</p>
        <div class="element-headline">
          目前元素 <strong>x = {{ element() }}</strong>
        </div>
        <div class="result-tiles">
          <div class="rtile">
            <span class="rtile-op">x · √2</span>
            <span class="rtile-val">{{ timesRoot() }}</span>
            <span class="rtile-note">√2 的方向被推去哪，1 的方向補上來</span>
          </div>
          <div class="rtile">
            <span class="rtile-op">x²</span>
            <span class="rtile-val">{{ square() }}</span>
            <span class="rtile-note">(√2)² = 2 摺回 1 的方向</span>
          </div>
          <div class="rtile" [class.blocked]="recip() === null">
            <span class="rtile-op">1 / x</span>
            <span class="rtile-val">{{ recip() ?? '0 沒有倒數' }}</span>
            <span class="rtile-note">{{ recip() === null ? '' : '1/(a+b√2) = (a−b√2)/(a²−2b²)，仍是 a + b√2' }}</span>
          </div>
        </div>
        <p class="equation">三種結果都留在同樣的兩槽形式——沒有跑出第三種形式，也沒有跑出世界。</p>
      </section>

      <section class="insight">
        <span class="insight-icon">a+b√2</span>
        <div>
          <strong>裝下 √2 的最小世界，恰好是所有 a + b√2</strong>
          <span>——兩個方向就封閉；而且倒數仍在裡面，所以它還是一個 field（Ch1 的透鏡依然成立）。</span>
        </div>
      </section>

      <details>
        <summary>為什麼 ℚ(√2) 仍是 field</summary>
        <p>
          對非零的 <code>a + b√2</code>，分母 <code>a² − 2b²</code> 不會是 0（否則 <code>√2 = a/b</code> 是有理數，矛盾），所以
          <code>1/(a+b√2) = (a − b√2)/(a² − 2b²)</code> 存在且仍是 <code>a + b√2</code> 形式。因此每個非零元都可逆——ℚ(√2) 是 field。
          「為什麼高次冪一定摺回」由 √2 滿足 <code>x² = 2</code> 保證；下一章會把這件事變成「拿這條方程當時鐘」。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh2BuildTheWorldComponent {
  readonly values = [-3, -2, -1, 0, 1, 2, 3];
  readonly a = signal(3);
  readonly b = signal(2);
  readonly prediction = signal<'escape' | 'closed' | null>(null);

  readonly element = computed(() => formatElement([this.a(), this.b()], BASIS));
  readonly timesRoot = computed(() =>
    formatElement(mulByAlpha([this.a(), this.b()], 2, 2), BASIS),
  );
  readonly square = computed(() =>
    formatElement(polyMulMod([this.a(), this.b()], [this.a(), this.b()], 2, 2), BASIS),
  );
  readonly recip = computed(() => {
    const r = reciprocalQuadratic(this.a(), this.b(), 2);
    return r ? formatFractionElement(r.coeffs, BASIS) : null;
  });

  reset(): void {
    this.a.set(3);
    this.b.set(2);
    this.prediction.set(null);
  }
}
