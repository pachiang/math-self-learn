import { Component, computed, signal } from '@angular/core';

interface SepPoly {
  id: string;
  poly: string;
  distinct: number;
  note: string;
}

const POLYS: SepPoly[] = [
  { id: 'x22', poly: 'x² − 2', distinct: 2, note: '兩根 ±√2 彼此相異，沒有重根。' },
  { id: 'x32', poly: 'x³ − 2', distinct: 3, note: '三根 ∛2、ω∛2、ω²∛2 彼此相異，沒有重根。' },
  { id: 'x21', poly: 'x² + 1', distinct: 2, note: '兩根 i、−i 彼此相異，沒有重根。' },
];

@Component({
  selector: 'app-fields-ch6-separable-scope',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 6.4</p>
        <h2>根彼此相異（separable），舞台就到位了</h2>
        <p class="lede">
          在本課主線（<strong>char 0</strong> 與 finite field，皆 perfect）上，irreducible polynomial <strong>不會有重根</strong>——每個根都彼此相異。
          所以「根可區分」這層是<strong>免費</strong>的，不必時時提防重根。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>在 char 0 下，一個 irreducible polynomial 會不會有重根？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">可能有</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">不會</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'yes'">
            {{ prediction() === 'no'
              ? '對。char 0 下 gcd(f, f′) = 1，irreducible 一定沒有重根。這層是免費的。'
              : 'char 0 下不會：f 與其導數 f′ 互質，保證根彼此相異。（char p 才可能出例外）' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選多項式">
        <span class="kicker">CHAR 0 / FINITE (PERFECT)</span>
        @for (p of polys; track p.id) {
          <button type="button" [class.active]="poly().id === p.id" (click)="poly.set(p)">{{ p.poly }}</button>
        }
      </div>

      <section class="stage sep-grid">
        <div class="sep-board">
          <p class="board-scope is-field">{{ poly().poly }} · {{ poly().distinct }} 個相異根</p>
          <div class="root-pills">
            @for (k of countArray(); track k) {
              <span class="root-pill">根 {{ k + 1 }}</span>
            }
          </div>
          <div class="sep-badge">無重根 ✓（separable）</div>
          <p class="sep-note">{{ poly().note }}</p>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（gcd(f, f′) = 1）</p>
        </div>

        <aside class="console">
          <p class="kicker">談對稱的舞台到位了</p>
          <ul class="stage-check">
            <li class="ok">根到齊 —— splitting field（6.2）</li>
            <li class="ok">沒有半個家族 —— normal（6.3）</li>
            <li class="ok">彼此相異 —— separable（本節）</li>
          </ul>
          <div class="readout">三者到位 → 下一章可以問：怎麼重排這些根而不破壞任何關係？</div>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">🎭</span>
        <div>
          <strong>根到齊、沒有半個家族、還彼此相異——這就是能談對稱的舞台</strong>
          <span>——下一章開始重排這些根：field automorphism（對稱）。</span>
        </div>
      </section>

      <details>
        <summary>符號層：separable 與 char p 的例外</summary>
        <p>
          <strong>separable</strong> 指 minimal polynomial 沒有重根。判準：<code>gcd(f, f′) = 1</code>。char 0 下 <code>f′ ≠ 0</code> 且 f irreducible，兩者必互質 → 無重根；
          finite field 也 perfect，同樣免費。只有 char p 的 imperfect field（如 <code>𝔽_p(t)</code> 上的 <code>xᵖ − t</code>）才會出現 inseparable（重根）——不在本課主線。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh6SeparableScopeComponent {
  readonly polys = POLYS;
  readonly poly = signal<SepPoly>(POLYS[1]); // 預設 x³−2（3 相異根）
  readonly prediction = signal<'yes' | 'no' | null>(null);

  readonly countArray = computed(() => Array.from({ length: this.poly().distinct }, (_, i) => i));
}
