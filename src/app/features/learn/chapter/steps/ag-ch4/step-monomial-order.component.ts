import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { PlotView, plotToSvgX, plotToSvgY } from '../ag-ch1/ag-util';

/* ── Monomial representation ── */

interface Mono {
  coeff: number;
  a: number;  // x-exponent
  b: number;  // y-exponent
}

type OrderType = 'lex' | 'grlex' | 'grevlex';

/* ── Ordering comparators ── */
/** Returns negative if m1 > m2 (m1 comes first), positive if m1 < m2. */
function compareLex(m1: Mono, m2: Mono): number {
  if (m1.a !== m2.a) return m2.a - m1.a; // higher x first
  return m2.b - m1.b; // then higher y first
}

function compareGrlex(m1: Mono, m2: Mono): number {
  const d1 = m1.a + m1.b;
  const d2 = m2.a + m2.b;
  if (d1 !== d2) return d2 - d1; // higher total degree first
  return compareLex(m1, m2);     // then lex tiebreak
}

function compareGrevlex(m1: Mono, m2: Mono): number {
  const d1 = m1.a + m1.b;
  const d2 = m2.a + m2.b;
  if (d1 !== d2) return d2 - d1; // higher total degree first
  // Reverse lex on LAST variable: smaller last-variable exponent wins
  if (m1.b !== m2.b) return m1.b - m2.b; // LESS y is BIGGER
  return m2.a - m1.a;
}

function sortByOrder(monos: Mono[], order: OrderType): Mono[] {
  const copy = [...monos];
  const cmp = order === 'lex' ? compareLex : order === 'grlex' ? compareGrlex : compareGrevlex;
  copy.sort(cmp);
  return copy;
}

/* ── Polynomial presets ── */
interface PolyPreset {
  label: string;
  terms: Mono[];
}

const PRESETS: PolyPreset[] = [
  {
    label: '2x^3 + 3x^2y - xy^2 + 5y^3 - x + 2',
    terms: [
      { coeff: 2, a: 3, b: 0 },
      { coeff: 3, a: 2, b: 1 },
      { coeff: -1, a: 1, b: 2 },
      { coeff: 5, a: 0, b: 3 },
      { coeff: -1, a: 1, b: 0 },
      { coeff: 2, a: 0, b: 0 },
    ],
  },
  {
    label: 'x^2y^2 - xy^3 + x^3 - y^4 + 1',
    terms: [
      { coeff: 1, a: 2, b: 2 },
      { coeff: -1, a: 1, b: 3 },
      { coeff: 1, a: 3, b: 0 },
      { coeff: -1, a: 0, b: 4 },
      { coeff: 1, a: 0, b: 0 },
    ],
  },
  {
    label: 'xy - x + y^2 - y',
    terms: [
      { coeff: 1, a: 1, b: 1 },
      { coeff: -1, a: 1, b: 0 },
      { coeff: 1, a: 0, b: 2 },
      { coeff: -1, a: 0, b: 1 },
    ],
  },
];

/* ── Render helpers ── */

function monoToTex(m: Mono): string {
  let s = '';
  const ac = Math.abs(m.coeff);
  if (ac !== 1 || (m.a === 0 && m.b === 0)) {
    s += ac.toString();
  }
  if (m.a === 1) s += 'x';
  else if (m.a > 1) s += `x^{${m.a}}`;
  if (m.b === 1) s += 'y';
  else if (m.b > 1) s += `y^{${m.b}}`;
  return s;
}

function monoToLmTex(m: Mono): string {
  let s = '';
  if (m.a === 0 && m.b === 0) return '1';
  if (m.a === 1) s += 'x';
  else if (m.a > 1) s += `x^{${m.a}}`;
  if (m.b === 1) s += 'y';
  else if (m.b > 1) s += `y^{${m.b}}`;
  return s;
}

function polyToTex(terms: Mono[]): string {
  if (terms.length === 0) return '0';
  return terms.map((m, i) => {
    const sign = m.coeff < 0 ? ' - ' : (i > 0 ? ' + ' : '');
    return sign + monoToTex(m);
  }).join('');
}

function ltTexHighlighted(terms: Mono[]): string {
  if (terms.length === 0) return '0';
  return terms.map((m, i) => {
    const sign = m.coeff < 0 ? ' - ' : (i > 0 ? ' + ' : '');
    const body = monoToTex(m);
    if (i === 0) return sign + `{\\color{#5882a8}{\\mathbf{${body}}}}`;
    return sign + body;
  }).join('');
}

/* ── Degree color mapping ── */
const DEG_COLORS = ['#888', '#5a8a5a', '#5a6a8a', '#8a5a8a', '#8a6a5a', '#5a8a8a'];
function degColor(d: number): string {
  return DEG_COLORS[d % DEG_COLORS.length];
}

@Component({
  selector: 'app-step-monomial-order',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="單項式序與前導項" subtitle="${'\\S'}4.2">
      <p>
        要在多變數中進行多項式除法，首先需要決定如何<strong>排序單項式</strong>。
        單項式序是單項式上的全序，滿足：
      </p>
      <ol>
        <li>
          <strong>相容於乘法：</strong>若
          <app-math [e]="'\\alpha > \\beta'" />，則
          <app-math [e]="'\\alpha \\cdot \\gamma > \\beta \\cdot \\gamma'" />
        </li>
        <li>
          <strong>良序：</strong>每個單項式集合都有最小元素
        </li>
      </ol>
    </app-prose-block>

    <app-prose-block>
      <p>三種最常見的單項式序：</p>
      <p>
        <strong>Lex（字典序）：</strong>先比較 x 指數，再比較 y。如同字典排序。
      </p>
      <app-math block [e]="lexExample" />
      <p style="color: var(--text-muted); font-size: 13px;">
        x 永遠勝過 y，無論 y 的指數多大。
      </p>
      <p>
        <strong>Grlex（分級字典序）：</strong>先比較總次數，再用 lex 打破平手。
      </p>
      <app-math block [e]="grlexExample" />
      <p>
        <strong>Grevlex（分級反字典序）：</strong>先比較總次數，再用反字典序（最後一個變數指數較小者勝出）。
        對於兩個變數，grevlex 與 grlex 相同。差異在三個以上變數時才出現。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>前導項</strong> <app-math [e]="'\\text{LT}(f)'" /> 是在選定序下 f 中最大的單項式（含係數）。
        前導項決定了除法如何進行。
      </p>
      <p>例如 <app-math [e]="'f = 3x^2y + 2xy^2 - y^3 + 1'" />：</p>
      <ul>
        <li>Lex: <app-math [e]="'\\text{LT}(f) = 3x^2y'" /></li>
        <li>Grlex: <app-math [e]="'\\text{LT}(f) = 3x^2y'" /></li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="切換不同的單項式序，觀察前導項如何改變">
      <!-- Preset polynomials -->
      <div class="preset-row">
        @for (p of presets; track $index; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i"
                  (click)="presetIdx.set(i)">
            {{ p.label }}
          </button>
        }
      </div>

      <!-- Order toggle -->
      <div class="order-row">
        @for (o of orders; track o.key) {
          <button class="order-btn" [class.active]="selectedOrder() === o.key"
                  (click)="selectedOrder.set(o.key)">
            {{ o.label }}
          </button>
        }
      </div>

      <!-- Sorted polynomial display -->
      <div class="sorted-poly-card">
        <div class="sorted-label">
          排序後（{{ orderLabel() }}）
        </div>
        <div class="sorted-display">
          <app-math [e]="sortedPolyTexHighlighted()" />
        </div>
      </div>

      <!-- Monomial chips -->
      <div class="mono-chips">
        @for (m of sortedTerms(); track $index; let i = $index) {
          <div class="mono-chip" [class.leading]="i === 0"
               [style.border-color]="getChipColor(m)">
            <app-math [e]="monoToTexFn(m)" />
            <span class="deg-badge" [style.background]="getChipColor(m)">
              deg {{ m.a + m.b }}
            </span>
            @if (i === 0) {
              <span class="lt-badge">LT</span>
            }
          </div>
        }
      </div>

      <!-- Monomial grid SVG -->
      <div class="grid-section">
        <div class="grid-label">單項式指數圖</div>
        <svg [attr.viewBox]="'0 0 ' + gv.svgW + ' ' + gv.svgH" class="grid-svg">
          <!-- Grid lines -->
          @for (i of gridTicks; track i) {
            <line [attr.x1]="gToSvgX(i)" [attr.y1]="gToSvgY(0)"
                  [attr.x2]="gToSvgX(i)" [attr.y2]="gToSvgY(gridMax)"
                  stroke="var(--border)" stroke-width="0.5" />
            <line [attr.x1]="gToSvgX(0)" [attr.y1]="gToSvgY(i)"
                  [attr.x2]="gToSvgX(gridMax)" [attr.y2]="gToSvgY(i)"
                  stroke="var(--border)" stroke-width="0.5" />
            <!-- Tick labels -->
            <text [attr.x]="gToSvgX(i)" [attr.y]="gToSvgY(0) + 14"
                  text-anchor="middle" fill="var(--text-muted)" font-size="10"
                  font-family="'JetBrains Mono', monospace">{{ i }}</text>
            <text [attr.x]="gToSvgX(0) - 10" [attr.y]="gToSvgY(i) + 3"
                  text-anchor="middle" fill="var(--text-muted)" font-size="10"
                  font-family="'JetBrains Mono', monospace">{{ i }}</text>
          }

          <!-- Axis labels -->
          <text [attr.x]="gToSvgX(gridMax) + 6" [attr.y]="gToSvgY(0) + 4"
                fill="var(--text-secondary)" font-size="12"
                font-family="'JetBrains Mono', monospace">a (x)</text>
          <text [attr.x]="gToSvgX(0) - 6" [attr.y]="gToSvgY(gridMax) - 8"
                fill="var(--text-secondary)" font-size="12" text-anchor="middle"
                font-family="'JetBrains Mono', monospace">b (y)</text>

          <!-- Ordering direction arrows (connecting sorted monomials) -->
          @for (seg of arrowSegments(); track $index) {
            <line [attr.x1]="gToSvgX(seg.x1)" [attr.y1]="gToSvgY(seg.y1)"
                  [attr.x2]="gToSvgX(seg.x2)" [attr.y2]="gToSvgY(seg.y2)"
                  stroke="var(--accent)" stroke-width="1.2" stroke-opacity="0.35"
                  marker-end="url(#arrowhead)" />
          }

          <!-- Monomial dots -->
          @for (m of sortedTerms(); track $index; let i = $index) {
            <circle [attr.cx]="gToSvgX(m.a)" [attr.cy]="gToSvgY(m.b)" r="7"
                    [attr.fill]="i === 0 ? 'var(--accent)' : getChipColor(m)"
                    [attr.stroke]="i === 0 ? 'var(--accent)' : 'var(--border)'"
                    stroke-width="1.5"
                    [attr.fill-opacity]="i === 0 ? 1 : 0.6" />
            @if (i === 0) {
              <circle [attr.cx]="gToSvgX(m.a)" [attr.cy]="gToSvgY(m.b)" r="11"
                      fill="none" stroke="var(--accent)" stroke-width="1.5"
                      stroke-dasharray="3,2" />
            }
          }

          <!-- Arrow marker definition -->
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4"
                    refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="var(--accent)" fill-opacity="0.4" />
            </marker>
          </defs>
        </svg>
      </div>

      <!-- Info cards -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">前導項 LT(f)</span>
          <span class="info-val">
            <app-math [e]="ltTex()" />
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">前導單項式 LM(f)</span>
          <span class="info-val">
            <app-math [e]="lmTex()" />
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">前導係數 LC(f)</span>
          <span class="info-val">
            <app-math [e]="lcTex()" />
          </span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        單項式序決定了「哪個項最重要」。不同的序可能導致不同的前導項，從而影響除法過程。
        Groebner 基的美妙之處在於：無論用哪個序，基底都能保證除法結果唯一。
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    }
    .pre-btn {
      padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active {
        background: var(--accent-10); border-color: var(--accent);
        color: var(--accent); font-weight: 600;
      }
    }

    .order-row {
      display: flex; gap: 8px; margin-bottom: 12px;
    }
    .order-btn {
      flex: 1; padding: 8px 14px; border-radius: 6px;
      border: 1px solid var(--border); background: var(--bg-surface);
      color: var(--text-secondary); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; font-weight: 500;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active {
        background: var(--accent-10); border-color: var(--accent);
        color: var(--accent); font-weight: 700;
      }
    }

    .sorted-poly-card {
      padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border);
      background: var(--bg-surface); margin-bottom: 12px; text-align: center;
    }
    .sorted-label {
      font-size: 11px; color: var(--text-muted); margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sorted-display { font-size: 16px; }

    .mono-chips {
      display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;
      justify-content: center;
    }
    .mono-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 10px; border-radius: 6px;
      border: 1.5px solid var(--border); background: var(--bg);
      font-size: 13px; position: relative;
      transition: border-color 0.2s, background 0.2s;
    }
    .mono-chip.leading {
      border-color: var(--accent); background: var(--accent-10);
      font-weight: 600;
    }
    .deg-badge {
      font-size: 9px; padding: 1px 5px; border-radius: 4px;
      color: #fff; font-family: 'JetBrains Mono', monospace; font-weight: 600;
    }
    .lt-badge {
      font-size: 9px; padding: 1px 5px; border-radius: 4px;
      background: var(--accent); color: #fff;
      font-family: 'JetBrains Mono', monospace; font-weight: 700;
    }

    .grid-section { margin-bottom: 14px; }
    .grid-label {
      font-size: 11px; color: var(--text-muted); margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
      letter-spacing: 0.5px; text-align: center;
    }
    .grid-svg {
      width: 100%; max-width: 360px; display: block; margin: 0 auto;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .info-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    }
    @media (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
    }
    .info-item {
      padding: 10px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); text-align: center;
    }
    .info-label {
      display: block; font-size: 10px; color: var(--text-muted);
      margin-bottom: 4px; font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase; letter-spacing: 0.3px;
    }
    .info-val { font-size: 15px; font-weight: 600; }
  `,
})
export class StepMonomialOrderComponent {
  readonly presets = PRESETS;
  readonly orders: { key: OrderType; label: string }[] = [
    { key: 'lex', label: 'Lex' },
    { key: 'grlex', label: 'Grlex' },
    { key: 'grevlex', label: 'Grevlex' },
  ];

  readonly lexExample = `x^3 > x^2y^5 > x^2y > xy^8 > y^{100}`;
  readonly grlexExample = `x^2y > xy^2 > y^3 > x^2 > xy > y^2 > x > y > 1`;

  readonly presetIdx = signal(0);
  readonly selectedOrder = signal<OrderType>('lex');

  /* Grid view config */
  readonly gridMax = 4;
  readonly gridTicks = [0, 1, 2, 3, 4];
  readonly gv: PlotView = {
    xRange: [-0.5, 4.8], yRange: [-0.5, 4.8],
    svgW: 340, svgH: 340, pad: 30,
  };

  gToSvgX = (x: number) => plotToSvgX(this.gv, x);
  gToSvgY = (y: number) => plotToSvgY(this.gv, y);

  monoToTexFn = monoToTex;

  readonly currentTerms = computed(() => PRESETS[this.presetIdx()].terms);

  readonly sortedTerms = computed(() =>
    sortByOrder(this.currentTerms(), this.selectedOrder()),
  );

  readonly orderLabel = computed(() => {
    const o = this.selectedOrder();
    return o === 'lex' ? '字典序' : o === 'grlex' ? '分級字典序' : '分級反字典序';
  });

  readonly sortedPolyTexHighlighted = computed(() =>
    ltTexHighlighted(this.sortedTerms()),
  );

  readonly ltTex = computed(() => {
    const terms = this.sortedTerms();
    if (terms.length === 0) return '0';
    const lt = terms[0];
    const sign = lt.coeff < 0 ? '-' : '';
    return sign + monoToTex(lt);
  });

  readonly lmTex = computed(() => {
    const terms = this.sortedTerms();
    if (terms.length === 0) return '1';
    return monoToLmTex(terms[0]);
  });

  readonly lcTex = computed(() => {
    const terms = this.sortedTerms();
    if (terms.length === 0) return '0';
    return terms[0].coeff.toString();
  });

  readonly arrowSegments = computed(() => {
    const terms = this.sortedTerms();
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < terms.length - 1; i++) {
      segs.push({
        x1: terms[i].a, y1: terms[i].b,
        x2: terms[i + 1].a, y2: terms[i + 1].b,
      });
    }
    return segs;
  });

  getChipColor(m: Mono): string {
    return degColor(m.a + m.b);
  }
}
