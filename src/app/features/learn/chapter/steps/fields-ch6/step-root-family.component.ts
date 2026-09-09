import { Component, computed, signal } from '@angular/core';
import { CRoot, ROOTS_X2_1, ROOTS_X2_2, ROOTS_X3_2, planeX, planeY } from './fields-ch6-model';

interface FamilyCase {
  id: string;
  poly: string;
  singleField: string;
  roots: CRoot[];
  inSingle: boolean[];
  note: string;
}

const CASES: FamilyCase[] = [
  {
    id: 'x32',
    poly: 'x³ − 2',
    singleField: 'ℚ(∛2)',
    roots: ROOTS_X3_2,
    inSingle: [true, false, false],
    note: 'ℚ(∛2) ⊂ ℝ，只裝得下實根 ∛2；兩個複根 ω∛2、ω²∛2 還在門外。',
  },
  {
    id: 'x22',
    poly: 'x² − 2',
    singleField: 'ℚ(√2)',
    roots: ROOTS_X2_2,
    inSingle: [true, true],
    note: 'ℚ(√2) 是實的，±√2 都在——剛好補齊全家。',
  },
  {
    id: 'x21',
    poly: 'x² + 1',
    singleField: 'ℚ(i)',
    roots: ROOTS_X2_1,
    inSingle: [true, true],
    note: 'ℚ(i) 含 i 與 −i（= −i 只是 i 的相反數）——兩根都在。',
  },
];

@Component({
  selector: 'app-fields-ch6-root-family',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 6.1</p>
        <h2>加一個根，另一個親戚不一定跟來</h2>
        <p class="lede">
          Ch3 造的 <code>ℚ(∛2)</code> 裝了 <code>x³ − 2</code> 的<strong>哪些</strong>根？把一條方程的所有根畫在複平面，再點亮
          「只加一個根」的世界裝得下的——你會發現，有時全家到齊，有時只來了一個。
        </p>
      </header>

      <span class="map-convention">ONE-ROOT EXTENSIONS · MEMBERSHIP ≠ REGION · CONTROLLED EXAMPLES</span>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>ℚ(∛2) 裝了 x³ − 2 的幾個根？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === '1'" (click)="prediction.set('1')">1 個</button>
          <button type="button" [class.active]="prediction() === '2'" (click)="prediction.set('2')">2 個</button>
          <button type="button" [class.active]="prediction() === '3'" (click)="prediction.set('3')">3 個全部</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== '1'">
            {{ prediction() === '1'
              ? '對。ℚ(∛2) 是實的，只裝得下實根 ∛2；另兩個複根不在。看下面複平面。'
              : '只有 1 個：ℚ(∛2) ⊂ ℝ，兩個複根 ω∛2、ω²∛2 進不去。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選多項式">
        <span class="kicker">多項式</span>
        @for (c of cases; track c.id) {
          <button type="button" [class.active]="case().id === c.id" (click)="case.set(c)">{{ c.poly }}</button>
        }
      </div>

      <section class="stage family-grid">
        <div class="plane-board">
          <p class="board-scope">複平面上 {{ case().poly }} 的根 · 點亮 = 在 {{ case().singleField }} 裡</p>
          <svg class="plane-svg" viewBox="0 0 300 300" role="img" [attr.aria-label]="ariaLabel()">
            <line class="axis" x1="20" y1="150" x2="280" y2="150" />
            <line class="axis" x1="150" y1="20" x2="150" y2="280" />
            <text class="axis-tag" x="284" y="154">Re</text>
            <text class="axis-tag" x="154" y="26">Im</text>
            @for (r of case().roots; track r.label; let i = $index) {
              <g [attr.transform]="'translate(' + px(r) + ' ' + py(r) + ')'">
                <circle class="root-dot" [class.lit]="case().inSingle[i]" [class.out]="!case().inSingle[i]" r="9" />
                <text class="root-label" [class.out]="!case().inSingle[i]" x="13" y="4">{{ r.label }}</text>
              </g>
            }
          </svg>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">全家到齊了嗎</p>
          <h3>{{ inCount() }} / {{ case().roots.length }} 個根在 {{ case().singleField }} 裡</h3>
          <p>{{ case().note }}</p>
          <div class="readout" [class.warn-readout]="!allIn()">
            {{ allIn() ? '這次一根帶來全家。' : '缺了 ' + (case().roots.length - inCount()) + ' 顆——半個家族。' }}
          </div>
          <p class="evidence-tag">{{ allIn() ? 'EXAMPLE' : 'WITNESS：指出一顆不在裡面的 sibling' }}</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">👥?</span>
        <div>
          <strong>加一個根，未必把它的親戚一起帶來</strong>
          <span>——∛2 進來了，另兩個複根還在門外；但 √2 卻順手帶來了 −√2。</span>
        </div>
      </section>

      <details>
        <summary>為什麼複根進不了 ℚ(∛2)</summary>
        <p>
          <code>ℚ(∛2)</code> 是 <code>ℝ</code> 的子 field（∛2 是實數），所以只含實數；而 <code>ω∛2</code>、<code>ω²∛2</code> 有非零虛部，不可能在裡面。
          相對地，<code>x² − 2</code> 的兩根 <code>±√2</code> 都是實數、且 <code>−√2 = −(√2)</code>，自然都在 <code>ℚ(√2)</code>。差別下一節用 splitting field 補齊。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh6RootFamilyComponent {
  readonly cases = CASES;
  readonly case = signal<FamilyCase>(CASES[0]);
  readonly prediction = signal<'1' | '2' | '3' | null>(null);

  readonly inCount = computed(() => this.case().inSingle.filter(Boolean).length);
  readonly allIn = computed(() => this.inCount() === this.case().roots.length);
  readonly ariaLabel = computed(
    () => `${this.case().poly} 的根在複平面，${this.inCount()} 個在 ${this.case().singleField} 裡`,
  );

  px(r: CRoot): number {
    return planeX(r.re);
  }
  py(r: CRoot): number {
    return planeY(r.im);
  }
}
