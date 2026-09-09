import { Component, computed, signal } from '@angular/core';
import { CRoot, ROOTS_X2_2, ROOTS_X3_2, planeX, planeY } from './fields-ch6-model';

interface ExtCase {
  id: string;
  field: string;
  testPoly: string;
  roots: CRoot[];
  inFlags: boolean[];
  normal: boolean;
  note: string;
  certificate: string;
}

const CASES: ExtCase[] = [
  {
    id: 'q_cbrt2',
    field: 'ℚ(∛2)',
    testPoly: 'x³ − 2',
    roots: ROOTS_X3_2,
    inFlags: [true, false, false],
    normal: false,
    note: 'x³ − 2 有一個根 ∛2 在裡面，卻不完全分解——缺 2 顆複根。半個家族 → NOT normal。',
    certificate: 'WITNESS · 一個 K-irreducible 有根卻不分解，足以判 NOT normal',
  },
  {
    id: 'q_sqrt2',
    field: 'ℚ(√2)',
    testPoly: 'x² − 2',
    roots: ROOTS_X2_2,
    inFlags: [true, true],
    normal: true,
    note: 'ℚ(√2) 正是 x² − 2 的 splitting field；有限 splitting field 的一般定理保證它 normal。',
    certificate: 'GENERAL CERTIFICATE · finite splitting field ⇒ normal',
  },
  {
    id: 'q_cbrt2_omega',
    field: 'ℚ(∛2, ω)',
    testPoly: 'x³ − 2',
    roots: ROOTS_X3_2,
    inFlags: [true, true, true],
    normal: true,
    note: 'ℚ(∛2, ω) 正是 x³ − 2 的 splitting field；不是只靠眼前這一族抽查便宣稱 normal。',
    certificate: 'GENERAL CERTIFICATE · finite splitting field ⇒ normal',
  },
];

@Component({
  selector: 'app-fields-ch6-normal-detector',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 6.3</p>
        <h2>normal：進來一個親戚，全家都得進來</h2>
        <p class="lede">
          有些擴張只裝了半個家族（∛2 在、兄弟不在），有些一裝就是全家。<strong>normal</strong> 就是後者：任一 irreducible 只要有一個根在裡面，
          <strong>整個家族</strong>都在——沒有「半個家族」。
        </p>
      </header>

      <span class="map-convention">FINITE EXTENSIONS L/K · ALL K-IRREDUCIBLES · NOT A ONE-FAMILY SCAN</span>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>ℚ(∛2)、ℚ(√2)、ℚ(∛2, ω) —— 哪些「不會只裝半個家族」（normal）？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'all'" (click)="prediction.set('all')">三個都是</button>
          <button type="button" [class.active]="prediction() === 'not_cbrt2'" (click)="prediction.set('not_cbrt2')">除了 ℚ(∛2)</button>
          <button type="button" [class.active]="prediction() === 'only_sqrt2'" (click)="prediction.set('only_sqrt2')">只有 ℚ(√2)</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'not_cbrt2'">
            {{ prediction() === 'not_cbrt2'
              ? '對。只有 ℚ(∛2) 裝了半個家族（缺 2 顆複根）；另兩個都全家到齊。切下面比對。'
              : 'ℚ(∛2) 例外：它有 ∛2 卻缺 2 顆複根 → 半個家族 → NOT normal。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選擴張">
        <span class="kicker">EXTENSION</span>
        @for (c of cases; track c.id) {
          <button type="button" [class.active]="case().id === c.id" (click)="case.set(c)">{{ c.field }}</button>
        }
      </div>

      <section class="stage family-grid">
        <div class="plane-board">
          <p class="board-scope" [class.is-field]="case().normal">
            {{ case().field }} 對 {{ case().testPoly }} 的家族 · {{ case().normal ? '全家在（normal）' : '半個家族（NOT normal）' }}
          </p>
          <svg class="plane-svg" viewBox="0 0 300 300" role="img" [attr.aria-label]="ariaLabel()">
            <line class="axis" x1="20" y1="150" x2="280" y2="150" />
            <line class="axis" x1="150" y1="20" x2="150" y2="280" />
            <text class="axis-tag" x="284" y="154">Re</text>
            <text class="axis-tag" x="154" y="26">Im</text>
            @for (r of case().roots; track r.label; let i = $index) {
              <g [attr.transform]="'translate(' + px(r) + ' ' + py(r) + ')'">
                <circle class="root-dot" [class.lit]="case().inFlags[i]" [class.out]="!case().inFlags[i]" r="9" />
                <text class="root-label" [class.out]="!case().inFlags[i]" x="13" y="4">{{ r.label }}</text>
              </g>
            }
          </svg>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">normal？</p>
          <h3>{{ case().field }} · {{ case().normal ? 'NORMAL' : 'NOT normal' }}</h3>
          <p>{{ case().note }}</p>
          <div class="readout" [class.warn-readout]="!case().normal">
            {{ case().normal ? '這一族全亮；splitting-field 證書把結論提升到整個 extension。' : '缺 ' + missing() + ' 顆 → 這一個 witness 已足以推翻 normal。' }}
          </div>
          <p class="evidence-tag">{{ case().certificate }}</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">👪</span>
        <div>
          <strong>normal ＝ 沒有半個家族</strong>
          <span>——這是對所有 K-irreducible families 的要求；finite case 中，「是某個 polynomial 的 splitting field」提供一般證書。</span>
        </div>
      </section>

      <details>
        <summary>符號層：normal ⇔ splitting field</summary>
        <p>
          有限擴張 <code>L/K</code> 是 <strong>normal</strong>，若每個在 <code>K[x]</code> 中 irreducible、且在 <code>L</code> 有一個根的多項式，都在 <code>L</code> 完全分解。
          等價說法：<code>L</code> 是某個多項式在 <code>K</code> 上的 splitting field。<code>ℚ(∛2)</code> 不 normal（x³−2 有根卻不分解）；<code>ℚ(∛2,ω)</code> normal（它是 x³−2 的 splitting field）。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh6NormalDetectorComponent {
  readonly cases = CASES;
  readonly case = signal<ExtCase>(CASES[0]);
  readonly prediction = signal<'all' | 'not_cbrt2' | 'only_sqrt2' | null>(null);

  readonly missing = computed(() => this.case().inFlags.filter((v) => !v).length);
  readonly ariaLabel = computed(
    () => `${this.case().field} 對 ${this.case().testPoly}，${this.case().normal ? '家族全在' : '缺 ' + this.missing() + ' 顆'}`,
  );

  px(r: CRoot): number {
    return planeX(r.re);
  }
  py(r: CRoot): number {
    return planeY(r.im);
  }
}
