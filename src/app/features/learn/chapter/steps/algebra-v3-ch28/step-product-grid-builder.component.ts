import { Component, computed, signal } from '@angular/core';
import { productGrid } from './product-model';

@Component({
  selector: 'app-algebra-v3-product-grid-builder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch28-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 28.1</p>
        <h2>Direct product 不是接長兩份清單；它把兩個選擇展成一張座標網格</h2>
        <p class="lede">
          一個 element 必須同時回答第一軸與第二軸的位置。每個橫向選擇都能配上每個縱向選擇，所以
          elements 是 ordered pairs。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>C₃ 有 3 個 states，C₄ 有 4 個 states；C₃×C₄ 有 7 個還是 12 個 elements？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(12)">12，每種 pair 都要算</button>
          <button type="button" (click)="prediction.set(7)">7，把兩份清單接起來</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 12">
            {{
              prediction() === 12
                ? '對。第一軸每個選擇都有 4 種第二座標，所以是 3×4。'
                : '那是 disjoint union 的計數。Direct product 的一個 state 同時帶兩個 coordinates。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Product-grid builder</p>
            <h3>調整兩軸，再點一格讀回它的 coordinates</h3>
          </div>
          <p>橫列、直欄與 pair label 同時保留；網格不只靠位置或顏色表達。</p>
        </div>
        <div class="dimension-controls">
          <fieldset>
            <legend>FIRST AXIS Cₘ</legend>
            @for (value of sizes; track value) {
              <button type="button" [attr.aria-pressed]="m() === value" (click)="setM(value)">
                m={{ value }}
              </button>
            }
          </fieldset>
          <fieldset>
            <legend>SECOND AXIS Cₙ</legend>
            @for (value of sizes; track value) {
              <button type="button" [attr.aria-pressed]="n() === value" (click)="setN(value)">
                n={{ value }}
              </button>
            }
          </fieldset>
        </div>
        <div class="stage product-builder-stage">
          <section class="axis-deck first-axis">
            <span>FIRST COORDINATE</span>
            @for (x of xValues(); track x) {
              <b>{{ x }}</b>
            }
          </section>
          <section class="axis-deck second-axis">
            <span>SECOND COORDINATE</span>
            @for (y of yValues(); track y) {
              <b>{{ y }}</b>
            }
          </section>
          <section
            class="product-grid"
            [style.grid-template-columns]="gridColumns()"
            [attr.aria-label]="gridLabel()"
          >
            @for (cell of cells(); track cell.key) {
              <button
                type="button"
                [attr.aria-pressed]="selected() === cell.key"
                (click)="selected.set(cell.key)"
              >
                <small>row {{ cell.y }}, col {{ cell.x }}</small
                ><strong>({{ cell.x }}, {{ cell.y }})</strong>
              </button>
            }
          </section>
          <section class="product-console" aria-live="polite">
            <p class="kicker">PAIR INVENTORY</p>
            <div>
              <span>AXIS SIZES</span><b>{{ m() }} × {{ n() }}</b>
            </div>
            <div>
              <span>ALL COMBINATIONS</span><b>{{ cells().length }}</b
              ><small>NO PAIR OMITTED</small>
            </div>
            <div>
              <span>SELECTED ADDRESS</span><b>({{ selected() }})</b
              ><small>FIRST, SECOND — ORDER MATTERS</small>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>m first choices</span><i>×</i><span>n second choices</span><i>→</i
          ><span>mn pairs</span>
        </div>
        <p>
          <strong>Product sign 先來自「每一種搭配」，不是 operation 公式。</strong>一格才是一個完整
          state；只知道其中一個 coordinate，還沒有指定 element。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>在 C₂×C₅ 中，固定第一座標為 1，還有幾個完整 states？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(5)">5 個</button
          ><button type="button" (click)="transfer.set(1)">1 個</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 5">
            {{
              transfer() === 5
                ? '對。第二 coordinate 仍可獨立取 0 到 4。'
                : '固定一軸只選定一欄；欄內仍有全部 5 種第二座標。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>正式定義與 group contract</summary>
          <div>
            G×H 的 elements 是 ordered pairs (g,h)，operation 逐 coordinate 執行。Identity 是
            (e_G,e_H)，inverse 是 (g⁻¹,h⁻¹)；closure 與 associativity 也分別從 G、H
            繼承。這些驗證確認網格本身是一個 group，但不需要先背才能理解網格。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3ProductGridBuilderComponent {
  readonly sizes = [2, 3, 4, 5];
  readonly m = signal(3);
  readonly n = signal(4);
  readonly selected = signal('1,2');
  readonly prediction = signal<number | null>(null);
  readonly transfer = signal<number | null>(null);
  readonly xValues = computed(() => Array.from({ length: this.m() }, (_, i) => i));
  readonly yValues = computed(() => Array.from({ length: this.n() }, (_, i) => i));
  readonly cells = computed(() => productGrid(this.m(), this.n()));
  setM(value: number) {
    this.m.set(value);
    this.selected.set('0,0');
  }
  setN(value: number) {
    this.n.set(value);
    this.selected.set('0,0');
  }
  gridColumns() {
    return `repeat(${this.m()}, minmax(74px, 1fr))`;
  }
  gridLabel() {
    return `C${this.m()} times C${this.n()} contains ${this.cells().length} ordered pairs`;
  }
}
