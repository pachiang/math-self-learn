import { Component, computed, signal } from '@angular/core';
import { Coeffs, formatPoly, formatPolyHigh, polyMul, powerLabel, reduceTrace, relationString } from './fields-ch3-model';

interface Construction {
  id: string;
  base: string;
  p?: number;
  m: Coeffs;
  rootNote: string;
  finiteField?: string; // 若為 finite field 的名稱
  blurb: string;
}

const CONSTRUCTIONS: Construction[] = [
  { id: 'sqrt2', base: 'ℚ', m: [-2, 0, 1], rootNote: 'α = √2', blurb: '熟悉的 radical 根。' },
  { id: 'cubic', base: 'ℚ', m: [-1, -1, 0, 1], rootNote: 'α = x³−x−1 的一個根', blurb: '沒有漂亮 radical 形式，照樣造得出來。' },
  { id: 'f4', base: 'F₂', p: 2, m: [1, 1, 1], rootNote: 'α² = α + 1', finiteField: 'F₄', blurb: 'char 2 的 finite field——回收 Ch2.4 的 F₄，現在真的造出來。' },
];

@Component({
  selector: 'app-fields-ch3-any-root-recipe',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 3.5</p>
        <h2>一個配方，任何根都能造</h2>
        <p class="lede">
          這個配方對<strong>任何 base、任何 irreducible 方程</strong>都成立：給我一條 irreducible <code>m(x)</code>，我就交給你一個含它的根的 field，
          不需要 radical 形式、不限 characteristic。基底永遠是 <code>{{ '{' }}1, α, …, αⁿ⁻¹{{ '}' }}</code>，維度 = deg m。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>x³ − x − 1 沒有簡單的開根號解。它還造得出一個含根的 field 嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">造得出來</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">沒有根號就不行</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'no'">
            {{ prediction() === 'yes'
              ? '對。配方要的是「irreducible 方程」，不是「根號」。下面切三種 base 看同一台造根機。'
              : '其實可以：只要 m irreducible，ℚ[x]/(m) 就是含根的 field，跟能不能開根號無關。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選構造">
        <span class="kicker">造根機</span>
        @for (con of constructions; track con.id) {
          <button type="button" [class.active]="c().id === con.id" (click)="pick(con)">{{ con.base }}[x]/({{ mHigh(con) }})</button>
        }
      </div>

      <section class="stage recipe-grid">
        <div class="recipe-board">
          <p class="board-scope is-field">{{ c().base }}[x]/({{ mHigh(c()) }}){{ c().finiteField ? ' = ' + c().finiteField : '' }}</p>
          <div class="recipe-facts">
            <div class="fact"><span class="fk">base field</span><span class="fv">{{ c().base }}</span></div>
            <div class="fact"><span class="fk">modulus（irreducible）</span><span class="fv">{{ mHigh(c()) }}</span></div>
            <div class="fact"><span class="fk">還原規則</span><span class="fv">{{ relation() }}</span></div>
            <div class="fact"><span class="fk">basis</span><span class="fv">{{ '{' }} {{ basis().join('、 ') }} {{ '}' }}</span></div>
            <div class="fact"><span class="fk">維度 = deg m</span><span class="fv">{{ degM() }}</span></div>
            <div class="fact"><span class="fk">是 field？</span><span class="fv">是（m irreducible）</span></div>
          </div>
          <p class="recipe-blurb">{{ c().blurb }}</p>
        </div>

        <aside class="console" aria-live="polite">
          @if (c().p) {
            <p class="kicker">{{ c().finiteField }} 全部 {{ elements().length }} 個元素 · 每個非零都可逆</p>
            <ul class="inv-table">
              @for (row of invTable(); track row.e) {
                <li><span>{{ row.e }}</span><span class="inv-arrow">逆元</span><span>{{ row.inv }}</span></li>
              }
            </ul>
            <div class="readout">全部掃過（FINITE EXHAUSTION）：非零元都有逆元 → {{ c().finiteField }} 是 field。</div>
          } @else {
            <p class="kicker">同一台機器</p>
            <h3>irreducible → field</h3>
            <p>不論 base 是 ℚ 還是 F₂、根有沒有 radical 形式，配方與判準都一樣。</p>
            <div class="readout">元素 = 次數 &lt; {{ degM() }} 的多項式；維度 = deg m = {{ degM() }}。</div>
          }
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">K[x]/(m)</span>
        <div>
          <strong>加一個根 = 拿 minimal polynomial 當 modulus 做 quotient</strong>
          <span>——只要 m irreducible 就得到 field；radical 與否、char 幾都一樣。</span>
        </div>
      </section>

      <section class="teaser">
        <p class="kicker">留給下一章的問題</p>
        <p class="teaser-body">
          現在能一次造一個擴張。把它們<strong>疊起來</strong>——<code>ℚ → ℚ(√2) → ℚ(√2, √3)</code>——維度會怎麼合併？下一章：
          <em>tower law</em>，維度相乘 <code>[L:F] = [L:K][K:F]</code>。
        </p>
      </section>

      <details>
        <summary>符號層：universal construction</summary>
        <p>
          對任何 field <code>K</code> 與 irreducible <code>m ∈ K[x]</code>，<code>K[x]/(m)</code> 是一個 field，含有 <code>m</code> 的一個根
          <code>α = x mod m</code>，且 <code>[K[x]/(m) : K] = deg m</code>，basis 為 <code>{{ '{' }}1, α, …, αⁿ⁻¹{{ '}' }}</code>。這對 char 0 與 char p 一致成立。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh3AnyRootRecipeComponent {
  readonly constructions = CONSTRUCTIONS;
  readonly c = signal<Construction>(CONSTRUCTIONS[0]);
  readonly prediction = signal<'yes' | 'no' | null>(null);

  readonly degM = computed(() => this.c().m.length - 1);
  readonly relation = computed(() => relationString(this.c().m, 'α', this.c().p));
  readonly basis = computed(() => {
    const n = this.degM();
    return Array.from({ length: n }, (_, i) => powerLabel(i, 'α'));
  });
  readonly elements = computed<Coeffs[]>(() => {
    const p = this.c().p;
    const n = this.degM();
    if (!p) return [];
    const out: Coeffs[] = [];
    const total = p ** n;
    for (let k = 0; k < total; k++) {
      const e: Coeffs = [];
      let t = k;
      for (let i = 0; i < n; i++) {
        e.push(t % p);
        t = Math.floor(t / p);
      }
      out.push(e);
    }
    return out;
  });
  readonly invTable = computed(() => {
    const p = this.c().p;
    if (!p) return [];
    const m = this.c().m;
    const rows: { e: string; inv: string }[] = [];
    for (const e of this.elements()) {
      if (e.every((v) => v === 0)) continue; // 跳過 0
      let inv = '—';
      for (const g of this.elements()) {
        const prod = reduceTrace(polyMul(e, g, p), m, 'α', p).result;
        if (prod.length === 1 && prod[0] === 1) {
          inv = formatPoly(g, 'α', p);
          break;
        }
      }
      rows.push({ e: formatPoly(e, 'α', p), inv });
    }
    return rows;
  });

  mHigh(con: Construction): string {
    return formatPolyHigh(con.m, 'x', con.p);
  }
  pick(con: Construction): void {
    this.c.set(con);
  }
}
