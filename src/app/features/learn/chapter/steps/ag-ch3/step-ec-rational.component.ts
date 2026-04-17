import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Rational arithmetic helpers ── */

/** Fraction p/q in lowest terms. */
interface Frac { p: number; q: number; }

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function fracNew(p: number, q: number): Frac {
  if (q < 0) { p = -p; q = -q; }
  const g = gcd(Math.abs(p), q);
  return { p: p / g, q: q / g };
}

function fracAdd(a: Frac, b: Frac): Frac {
  return fracNew(a.p * b.q + b.p * a.q, a.q * b.q);
}

function fracSub(a: Frac, b: Frac): Frac {
  return fracNew(a.p * b.q - b.p * a.q, a.q * b.q);
}

function fracMul(a: Frac, b: Frac): Frac {
  return fracNew(a.p * b.p, a.q * b.q);
}

function fracDiv(a: Frac, b: Frac): Frac {
  return fracNew(a.p * b.q, a.q * b.p);
}

function fracStr(f: Frac): string {
  if (f.q === 1) return `${f.p}`;
  return `${f.p}/${f.q}`;
}

function fracVal(f: Frac): number {
  return f.p / f.q;
}

/* ── Elliptic curve point (rational coordinates) ── */

interface ECPoint { x: Frac; y: Frac; inf?: false; }
interface ECInf { inf: true; }
type ECPt = ECPoint | ECInf;

/**
 * Addition on y^2 = x^3 + ax + b using rational arithmetic.
 * Curve: y^2 = x^3 - 5x + 5  (a = -5, b = 5)
 */
const CURVE_A: Frac = { p: -5, q: 1 };

function ecDouble(P: ECPoint): ECPt {
  // m = (3 x1^2 + a) / (2 y1)
  const x1 = P.x, y1 = P.y;
  if (y1.p === 0) return { inf: true };
  const three: Frac = { p: 3, q: 1 };
  const two: Frac = { p: 2, q: 1 };
  const num = fracAdd(fracMul(three, fracMul(x1, x1)), CURVE_A);
  const den = fracMul(two, y1);
  const m = fracDiv(num, den);
  // x3 = m^2 - 2 x1
  const x3 = fracSub(fracMul(m, m), fracMul(two, x1));
  // y3 = m(x1 - x3) - y1
  const y3 = fracSub(fracMul(m, fracSub(x1, x3)), y1);
  return { x: x3, y: y3 };
}

function ecAdd(P: ECPoint, Q: ECPoint): ECPt {
  // Same point => doubling
  if (P.x.p * Q.x.q === Q.x.p * P.x.q) {
    if (P.y.p * Q.y.q === Q.y.p * P.y.q) {
      return ecDouble(P);
    }
    // P = -Q (same x, opposite y) => point at infinity
    return { inf: true };
  }
  // m = (y2 - y1) / (x2 - x1)
  const m = fracDiv(fracSub(Q.y, P.y), fracSub(Q.x, P.x));
  // x3 = m^2 - x1 - x2
  const x3 = fracSub(fracSub(fracMul(m, m), P.x), Q.x);
  // y3 = m(x1 - x3) - y1
  const y3 = fracSub(fracMul(m, fracSub(P.x, x3)), P.y);
  return { x: x3, y: y3 };
}

/** Compute multiples 1P, 2P, ..., nP iteratively. */
function computeMultiples(P: ECPoint, maxN: number): ECPt[] {
  const results: ECPt[] = [P];
  let current: ECPt = P;
  for (let i = 2; i <= maxN; i++) {
    if (current.inf) {
      results.push({ inf: true });
    } else {
      current = ecAdd(current, P);
      results.push(current);
    }
  }
  return results;
}

/* ── Component ── */

const STEP_LABELS = ['P', '2P', '3P', '4P', '5P', '6P'];

@Component({
  selector: 'app-step-ec-rational',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="有理點與 Mordell 定理" subtitle="§3.4">
      <p>
        An elliptic curve over
        <app-math e="\\mathbb{Q}"></app-math>
        may have rational points — points (x, y) where both coordinates are rational numbers.
        Finding these is a central problem in number theory.
      </p>
      <p>
        Example: on <app-math e="y^2 = x^3 - 5x + 5"></app-math>,
        the point (1, 1) is rational. Can we find more?
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        Key insight: if P and Q are rational points, then P + Q is also rational!
        (The group law only uses addition, multiplication, and division of coordinates
        — all of which preserve rationality.)
        So starting from one rational point, we can generate more by adding it to itself.
      </p>
      <app-math block [e]="formulaNp"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>
        Mordell's theorem (1922, now called Mordell-Weil):
        The group of rational points
        <app-math e="E(\\mathbb{Q})"></app-math>
        is finitely generated. That is:
      </p>
      <app-math block [e]="formulaMW"></app-math>
      <p>
        where r is the rank (number of independent generators) and the torsion part is finite.
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        The rank r is mysterious — there's no known algorithm guaranteed to compute it for all curves.
        The famous Birch and Swinnerton-Dyer conjecture (one of the Millennium Prize Problems, worth $1 million!)
        relates r to an analytic quantity.
      </p>
    </app-prose-block>

    <app-challenge-card prompt="從一個有理點出發，反覆做加法，生成新的有理點">
      <!-- Step buttons -->
      <div class="step-row">
        @for (lbl of stepLabels; track lbl; let i = $index) {
          <button class="step-btn" [class.active]="stepIdx() >= i"
                  [class.current]="stepIdx() === i"
                  (click)="stepIdx.set(i)">{{ lbl }}</button>
        }
      </div>

      <!-- SVG plot -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Curve -->
        <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2"
              stroke-linecap="round" />

        <!-- Construction lines (most recent only, for clarity) -->
        @if (latestLine(); as ln) {
          <line [attr.x1]="ln.x1" [attr.y1]="ln.y1"
                [attr.x2]="ln.x2" [attr.y2]="ln.y2"
                stroke="#8a7a6a" stroke-width="1" stroke-dasharray="5 3"
                opacity="0.55" />
        }

        <!-- Vertical reflection line (most recent) -->
        @if (latestReflection(); as rl) {
          <line [attr.x1]="rl.x1" [attr.y1]="rl.y1"
                [attr.x2]="rl.x2" [attr.y2]="rl.y2"
                stroke="#8a7a6a" stroke-width="0.8" stroke-dasharray="2 2"
                opacity="0.45" />
        }

        <!-- Points -->
        @for (pt of displayPoints(); track $index; let i = $index) {
          @if (!pt.inf && pt.inView) {
            <circle [attr.cx]="pt.sx" [attr.cy]="pt.sy" r="5"
                    [attr.fill]="i === stepIdx() ? '#c05050' : '#5a7fa0'"
                    stroke="#fff" stroke-width="1.2" />
            <text [attr.x]="pt.sx + 8" [attr.y]="pt.sy - 8"
                  class="pt-label"
                  [style.fill]="i === stepIdx() ? '#c05050' : '#5a7fa0'">
              {{ stepLabels[i] }}
            </text>
          }
        }
      </svg>

      <!-- Coordinates table -->
      <div class="table-wrap">
        <table class="coord-table">
          <thead>
            <tr><th>n</th><th>x</th><th>y</th></tr>
          </thead>
          <tbody>
            @for (row of tableRows(); track row.n) {
              <tr [class.active-row]="row.n - 1 === stepIdx()">
                <td class="n-col">{{ row.n }}</td>
                <td class="coord-col">{{ row.x }}</td>
                <td class="coord-col">{{ row.y }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Denomination growth note -->
      @if (stepIdx() >= 2) {
        <div class="denom-note">
          注意座標的分母越來越大——有理點的「高度」在增長
        </div>
      }

      <!-- Info card -->
      <div class="info-box">
        <div class="info-title">秩 r 與有理點結構</div>
        <p>
          秩 r 決定了有理點的「豐富程度」。
          r = 0: 只有有限多個有理點。
          r &ge; 1: 無窮多個有理點，但都由有限個生成元產生。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Mordell-Weil 定理告訴我們：橢圓曲線的有理點雖然可能無窮多，但結構是有限生成的。
        計算秩 r 是當代數論最核心的問題之一。
        BSD 猜想若被證明，將是數學史上的里程碑。
      </p>
    </app-prose-block>
  `,
  styles: `
    .step-row {
      display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .step-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      font-weight: 600; transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); }
      &.current { background: var(--accent); color: #fff; border-color: var(--accent); }
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .pt-label {
      font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .table-wrap {
      overflow-x: auto; margin-bottom: 10px;
    }
    .coord-table {
      width: 100%; border-collapse: collapse; font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .coord-table th {
      padding: 6px 10px; text-align: left; font-size: 10px;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: var(--text-muted); border-bottom: 1px solid var(--border);
    }
    .coord-table td {
      padding: 5px 10px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
    }
    .n-col { width: 40px; font-weight: 700; color: var(--accent); }
    .coord-col { word-break: break-all; }
    .active-row td { background: var(--accent-10); color: var(--text); }
    .denom-note {
      padding: 8px 12px; border-radius: 6px; font-size: 11px;
      background: rgba(170,130,90,0.08); border: 1px solid rgba(170,130,90,0.2);
      color: #8a6a3a; margin-bottom: 10px; line-height: 1.6;
    }
    .info-box {
      padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); font-size: 12px; color: var(--text-secondary);
      line-height: 1.7;
    }
    .info-title {
      font-size: 11px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .info-box p { margin: 0; }
  `,
})
export class StepEcRationalComponent {
  readonly stepLabels = STEP_LABELS;

  readonly formulaNp = `\\text{If } P \\in E(\\mathbb{Q}),\\; \\text{then } nP = \\underbrace{P + P + \\cdots + P}_{n} \\in E(\\mathbb{Q})`;
  readonly formulaMW = `E(\\mathbb{Q}) \\cong \\mathbb{Z}^r \\oplus E(\\mathbb{Q})_{\\text{tors}}`;

  readonly v: PlotView = { xRange: [-4, 8], yRange: [-12, 12], svgW: 520, svgH: 480, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /** Implicit curve: y^2 - x^3 + 5x - 5 = 0 */
  readonly curvePath = implicitCurve(
    (x, y) => y * y - x * x * x + 5 * x - 5,
    this.v.xRange, this.v.yRange,
    this.toSvgX, this.toSvgY, 160,
  );

  /** Starting point P = (1, 1) on y^2 = x^3 - 5x + 5 */
  private readonly baseP: ECPoint = { x: { p: 1, q: 1 }, y: { p: 1, q: 1 } };

  /** Pre-compute all multiples 1P..6P */
  readonly multiples: ECPt[] = computeMultiples(this.baseP, 6);

  readonly stepIdx = signal(0);

  /** Points to display (up to current step), with view-clipping flag */
  readonly displayPoints = computed(() => {
    const idx = this.stepIdx();
    const pts: { sx: number; sy: number; inf: boolean; inView: boolean; x: number; y: number }[] = [];
    for (let i = 0; i <= idx; i++) {
      const m = this.multiples[i];
      if (m.inf) {
        pts.push({ sx: 0, sy: 0, inf: true, inView: false, x: 0, y: 0 });
      } else {
        const xv = fracVal(m.x);
        const yv = fracVal(m.y);
        const inView = xv >= this.v.xRange[0] && xv <= this.v.xRange[1]
                    && yv >= this.v.yRange[0] && yv <= this.v.yRange[1];
        pts.push({
          sx: this.toSvgX(xv),
          sy: this.toSvgY(yv),
          inf: false,
          inView,
          x: xv,
          y: yv,
        });
      }
    }
    return pts;
  });

  /** Most recent construction line (tangent for 2P, secant for nP+P) */
  readonly latestLine = computed(() => {
    const idx = this.stepIdx();
    if (idx < 1) return null;

    const prev = this.multiples[idx - 1];
    const base = this.multiples[0];
    if (prev.inf || base.inf) return null;

    const prevX = fracVal(prev.x), prevY = fracVal(prev.y);
    const baseX = fracVal(base.x), baseY = fracVal(base.y);

    let slope: number;
    let refX: number, refY: number;
    if (idx === 1) {
      // Tangent at P: m = (3x^2 + a)/(2y), a = -5
      slope = (3 * baseX * baseX - 5) / (2 * baseY);
      refX = baseX; refY = baseY;
    } else {
      if (Math.abs(prevX - baseX) < 1e-12) return null;
      slope = (prevY - baseY) / (prevX - baseX);
      refX = baseX; refY = baseY;
    }

    const x0 = this.v.xRange[0], x1 = this.v.xRange[1];
    return {
      x1: this.toSvgX(x0), y1: this.toSvgY(refY + slope * (x0 - refX)),
      x2: this.toSvgX(x1), y2: this.toSvgY(refY + slope * (x1 - refX)),
    };
  });

  /** Vertical reflection line for the latest computed point */
  readonly latestReflection = computed(() => {
    const idx = this.stepIdx();
    if (idx < 1) return null;
    const pt = this.multiples[idx];
    if (pt.inf) return null;
    const xv = fracVal(pt.x), yv = fracVal(pt.y);
    if (xv < this.v.xRange[0] || xv > this.v.xRange[1]) return null;
    const clampedNeg = Math.max(this.v.yRange[0], Math.min(this.v.yRange[1], -yv));
    const clampedPos = Math.max(this.v.yRange[0], Math.min(this.v.yRange[1], yv));
    return {
      x1: this.toSvgX(xv), y1: this.toSvgY(clampedNeg),
      x2: this.toSvgX(xv), y2: this.toSvgY(clampedPos),
    };
  });

  /** Table rows showing coordinates */
  readonly tableRows = computed(() => {
    const idx = this.stepIdx();
    const rows: { n: number; x: string; y: string }[] = [];
    for (let i = 0; i <= idx; i++) {
      const m = this.multiples[i];
      if (m.inf) {
        rows.push({ n: i + 1, x: 'O (無窮遠點)', y: '' });
      } else {
        rows.push({ n: i + 1, x: fracStr(m.x), y: fracStr(m.y) });
      }
    }
    return rows;
  });
}
