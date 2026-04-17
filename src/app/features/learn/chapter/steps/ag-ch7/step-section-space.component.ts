import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Comparison table rows ── */
interface CompRow {
  dLabel: string;
  deg: number;
  lD: number;
}

const COMP_TABLE: CompRow[] = [
  { dLabel: '0',              deg: 0,  lD: 1 },
  { dLabel: '[&infin;]',      deg: 1,  lD: 2 },
  { dLabel: '2[&infin;]',     deg: 2,  lD: 3 },
  { dLabel: '[0]+[1]+[&infin;]', deg: 3, lD: 4 },
  { dLabel: '-[0]',           deg: -1, lD: 0 },
];

@Component({
  selector: 'app-step-section-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- ── Block 1: What is L(D) ── -->
    <app-prose-block title="截面空間 L(D)" subtitle="&sect;7.5">
      <p>
        <app-math e="L(D)" /> is the vector space of rational functions f satisfying
        <app-math e="\\text{div}(f) + D \\geq 0" />.
        In plain language: f is allowed to have poles, but only where D has positive coefficients,
        and only up to the order specified by D.
      </p>
      <p>
        Think of D as a <strong>&laquo;budget for poles&raquo;</strong>:
      </p>
      <ul>
        <li>
          <app-math e="D = 3[P]" /> means &laquo;f can have a pole of order
          <app-math e="\\leq 3" /> at P, and must be regular everywhere else&raquo;.
        </li>
        <li>
          <app-math e="D = 2[P] + [Q]" /> means &laquo;pole
          <app-math e="\\leq 2" /> at P, pole
          <app-math e="\\leq 1" /> at Q, regular elsewhere&raquo;.
        </li>
      </ul>
    </app-prose-block>

    <!-- ── Block 2: Computing on P1 ── -->
    <app-prose-block>
      <p>
        On <app-math e="\\mathbb{P}^1" />, these spaces are easy to compute:
      </p>
      <ul>
        <li>
          <app-math e="L(n \\cdot [\\infty])" /> = polynomials of degree
          <app-math e="\\leq n" />
          &rarr; dim = n + 1.
        </li>
        <li>
          For <app-math e="D = 2[0] + [1]" />:
          need <app-math e="\\text{div}(f) + 2[0] + [1] \\geq 0" />,
          so f can have pole order <app-math e="\\leq 2" /> at z=0
          and <app-math e="\\leq 1" /> at z=1. Since deg(D) = 3,
          we get l(D) = 4 on <app-math e="\\mathbb{P}^1" />.
        </li>
      </ul>
    </app-prose-block>

    <!-- ── Block 3: Growth ── -->
    <app-prose-block>
      <p>
        As deg(D) increases, L(D) gets <strong>BIGGER</strong> --
        more &laquo;budget&raquo; means more allowed functions.
        The Riemann-Roch theorem gives the precise growth rate.
      </p>
    </app-prose-block>

    <!-- ── Interactive section ── -->
    <app-challenge-card prompt="調整因子 D 的各點重數，觀察截面空間 L(D) 如何變化">

      <!-- Multiplicity sliders -->
      <div class="slider-grid">
        <div class="slider-item">
          <span class="pt-label">n&#8320; &middot; [0]</span>
          <input type="range" [min]="-1" [max]="3" [step]="1"
                 [value]="n0()"
                 (input)="n0.set(+$any($event.target).value)" />
          <span class="pt-val" [class.neg]="n0() < 0">{{ n0() }}</span>
        </div>
        <div class="slider-item">
          <span class="pt-label">n&#8321; &middot; [1]</span>
          <input type="range" [min]="-1" [max]="3" [step]="1"
                 [value]="n1()"
                 (input)="n1.set(+$any($event.target).value)" />
          <span class="pt-val" [class.neg]="n1() < 0">{{ n1() }}</span>
        </div>
        <div class="slider-item">
          <span class="pt-label">n&#8322; &middot; [2]</span>
          <input type="range" [min]="-1" [max]="3" [step]="1"
                 [value]="n2()"
                 (input)="n2.set(+$any($event.target).value)" />
          <span class="pt-val" [class.neg]="n2() < 0">{{ n2() }}</span>
        </div>
        <div class="slider-item">
          <span class="pt-label">n&#8734; &middot; [&infin;]</span>
          <input type="range" [min]="-1" [max]="3" [step]="1"
                 [value]="nInf()"
                 (input)="nInf.set(+$any($event.target).value)" />
          <span class="pt-val" [class.neg]="nInf() < 0">{{ nInf() }}</span>
        </div>
      </div>

      <!-- SVG: Divisor on number line + pole budget bars -->
      <svg [attr.viewBox]="'0 0 ' + topW + ' ' + topH" class="top-svg">
        <!-- Number line -->
        <line x1="40" [attr.x2]="topW - 40" [attr.y1]="nlY" [attr.y2]="nlY"
              stroke="var(--text-muted)" stroke-width="1.5" />

        <!-- Points and bars -->
        @for (pt of divPoints(); track pt.label) {
          <!-- Tick mark -->
          <line [attr.x1]="pt.sx" [attr.x2]="pt.sx"
                [attr.y1]="nlY - 5" [attr.y2]="nlY + 5"
                stroke="var(--text-muted)" stroke-width="1" />
          <!-- Label below line -->
          <text [attr.x]="pt.sx" [attr.y]="nlY + 20"
                class="tick-label" text-anchor="middle">{{ pt.label }}</text>

          <!-- Pole budget bar -->
          @if (pt.mult > 0) {
            <rect [attr.x]="pt.sx - 10" [attr.y]="nlY - 6 - pt.mult * 18"
                  width="20" [attr.height]="pt.mult * 18"
                  fill="#5a8a5a" opacity="0.25" rx="3" />
            <rect [attr.x]="pt.sx - 10" [attr.y]="nlY - 6 - pt.mult * 18"
                  width="20" [attr.height]="pt.mult * 18"
                  fill="none" stroke="#5a8a5a" stroke-width="1" rx="3" />
            <text [attr.x]="pt.sx" [attr.y]="nlY - 10 - pt.mult * 18"
                  class="bar-label pos-label" text-anchor="middle">+{{ pt.mult }}</text>
          }
          @if (pt.mult < 0) {
            <rect [attr.x]="pt.sx - 10" [attr.y]="nlY + 6"
                  width="20" [attr.height]="Math.abs(pt.mult) * 18"
                  fill="#cc4444" opacity="0.2" rx="3" />
            <rect [attr.x]="pt.sx - 10" [attr.y]="nlY + 6"
                  width="20" [attr.height]="Math.abs(pt.mult) * 18"
                  fill="none" stroke="#cc4444" stroke-width="1" rx="3" />
            <text [attr.x]="pt.sx" [attr.y]="nlY + 22 + Math.abs(pt.mult) * 18"
                  class="bar-label neg-label" text-anchor="middle">{{ pt.mult }}</text>
          }

          <!-- Point dot -->
          <circle [attr.cx]="pt.sx" [attr.cy]="nlY" r="4"
                  [attr.fill]="pt.mult > 0 ? '#5a8a5a' : pt.mult < 0 ? '#cc4444' : 'var(--text-muted)'"
                  stroke="#fff" stroke-width="1" />
        }

        <!-- Budget label -->
        <text x="10" [attr.y]="nlY - 60" class="section-label"
              fill="var(--text-muted)">pole budget</text>
      </svg>

      <!-- SVG: Function plot -->
      <svg [attr.viewBox]="'0 0 ' + pv.svgW + ' ' + pv.svgH" class="plot-svg">
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Pole location markers -->
        @for (pt of finitePolePoints(); track pt.label) {
          @if (pt.mult > 0) {
            <line [attr.x1]="toSvgX(pt.z)" [attr.x2]="toSvgX(pt.z)"
                  [attr.y1]="pv.pad" [attr.y2]="pv.svgH - pv.pad"
                  stroke="#cc4444" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.5" />
          }
        }

        <!-- Basis function curves -->
        @for (curve of sectionCurves(); track $index) {
          <path [attr.d]="curve.d" fill="none"
                [attr.stroke]="curve.color" stroke-width="1.8"
                stroke-linecap="round" />
        }

        <!-- Legend -->
        @for (curve of sectionCurves(); track $index) {
          <rect [attr.x]="pv.svgW - 120"
                [attr.y]="10 + $index * 18"
                width="14" height="10" rx="2"
                [attr.fill]="curve.color" opacity="0.7" />
          <text [attr.x]="pv.svgW - 102"
                [attr.y]="19 + $index * 18"
                class="legend-text">{{ curve.label }}</text>
        }
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">D</div>
          <div class="ic-body">{{ divisorLabel() }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">deg(D)</div>
          <div class="ic-body">{{ degD() }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">l(D) = dim L(D)</div>
          <div class="ic-body accent">{{ lD() }}</div>
        </div>
        <div class="info-card badge-card">
          @if (lD() > 0) {
            <span class="badge pos-badge">l(D) > 0: 存在非零截面</span>
          } @else {
            <span class="badge zero-badge">l(D) = 0: 無非零截面</span>
          }
        </div>
      </div>

      <!-- Comparison table -->
      <div class="comp-section">
        <div class="comp-header">P&sup1; 上的 l(D) 比較表</div>
        <table class="comp-table">
          <thead>
            <tr>
              <th>D</th>
              <th>deg(D)</th>
              <th>l(D)</th>
            </tr>
          </thead>
          <tbody>
            @for (row of compTable; track row.dLabel) {
              <tr>
                <td [innerHTML]="row.dLabel"></td>
                <td [class.neg-text]="row.deg < 0">{{ row.deg }}</td>
                <td class="accent">{{ row.lD }}</td>
              </tr>
            }
          </tbody>
        </table>
        <p class="comp-note">
          Pattern: l(D) = deg(D) + 1 when deg(D) &ge; 0 (on P&sup1;, genus = 0).
        </p>
      </div>
    </app-challenge-card>

    <!-- ── Bottom prose ── -->
    <app-prose-block>
      <p>
        在 <app-math e="\\mathbb{P}^1" /> 上，
        <app-math e="l(D) = \\deg(D) + 1" />（當 deg &ge; 0）。
        但在高虧格曲線上，情況更複雜 --
        l(D) 受到曲線拓撲（虧格）的影響。
        Riemann-Roch 定理精確量化了這個影響。
      </p>
    </app-prose-block>
  `,
  styles: `
    .slider-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px; margin-bottom: 12px;
    }
    .slider-item {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
    }
    .pt-label {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 56px;
    }
    .slider-item input[type="range"] {
      flex: 1; accent-color: var(--accent); min-width: 60px;
    }
    .pt-val {
      font-size: 14px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 24px; text-align: center;
    }
    .pt-val.neg { color: #cc4444; }
    .top-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .tick-label {
      font-size: 11px; fill: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    .bar-label {
      font-size: 10px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .pos-label { fill: #5a8a5a; }
    .neg-label { fill: #cc4444; }
    .section-label {
      font-size: 10px; font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .legend-text {
      font-size: 10px; fill: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .info-card {
      flex: 1; min-width: 100px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .ic-body.accent { color: var(--accent); }
    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .pos-badge { background: rgba(90,138,90,0.12); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.3); }
    .zero-badge { background: rgba(204,68,68,0.12); color: #cc4444; border: 1px solid rgba(204,68,68,0.3); }
    .neg-text { color: #cc4444; }
    .comp-section {
      padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
    }
    .comp-header {
      font-size: 12px; font-weight: 700; color: var(--text);
      margin-bottom: 8px; font-family: 'JetBrains Mono', monospace;
    }
    .comp-table {
      width: 100%; border-collapse: collapse; font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .comp-table th {
      padding: 4px 8px; text-align: center; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 700; font-size: 10px;
      text-transform: uppercase;
    }
    .comp-table td {
      padding: 4px 8px; text-align: center; color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
    }
    .comp-table td.accent { color: var(--accent); font-weight: 700; }
    .comp-note {
      margin-top: 8px; font-size: 11px; color: var(--text-muted);
      line-height: 1.5;
    }
  `,
})
export class StepSectionSpaceComponent {
  readonly Math = Math;

  /* ── State: multiplicity at each point ── */
  readonly n0 = signal(0);
  readonly n1 = signal(0);
  readonly n2 = signal(0);
  readonly nInf = signal(2);

  /* ── Comparison table ── */
  readonly compTable = COMP_TABLE;

  /* ── Plot view ── */
  readonly pv: PlotView = { xRange: [-1, 4], yRange: [-3, 3], svgW: 520, svgH: 300, pad: 30 };
  readonly axesPath = plotAxesPath(this.pv);

  /* ── Top SVG layout ── */
  readonly topW = 520;
  readonly topH = 140;
  readonly nlY = 90; // number line y position

  toSvgX = (x: number) => plotToSvgX(this.pv, x);
  toSvgY = (y: number) => plotToSvgY(this.pv, y);

  /* ── Computed: degree and l(D) ── */
  readonly degD = computed(() => this.n0() + this.n1() + this.n2() + this.nInf());

  readonly lD = computed(() => {
    const d = this.degD();
    return Math.max(0, d + 1);
  });

  /* ── Points for the divisor diagram ── */
  readonly divPoints = computed(() => {
    const pts = [
      { label: '0', z: 0, mult: this.n0(), sx: 120 },
      { label: '1', z: 1, mult: this.n1(), sx: 220 },
      { label: '2', z: 2, mult: this.n2(), sx: 320 },
      { label: '\u221E', z: Infinity, mult: this.nInf(), sx: 440 },
    ];
    return pts;
  });

  /* ── Finite-position pole points (for dashed lines on plot) ── */
  readonly finitePolePoints = computed(() =>
    this.divPoints().filter(p => isFinite(p.z)),
  );

  /* ── Divisor label ── */
  readonly divisorLabel = computed(() => {
    const parts: string[] = [];
    const items = [
      { m: this.n0(), label: '[0]' },
      { m: this.n1(), label: '[1]' },
      { m: this.n2(), label: '[2]' },
      { m: this.nInf(), label: '[\u221E]' },
    ];
    for (const it of items) {
      if (it.m === 0) continue;
      if (it.m === 1) parts.push(it.label);
      else if (it.m === -1) parts.push(`-${it.label}`);
      else parts.push(`${it.m}${it.label}`);
    }
    return parts.length > 0 ? parts.join(' + ').replace(/\+ -/g, '- ') : '0';
  });

  /* ── Section curves: show some example basis functions ── */
  private readonly COLORS = ['#66aaff', '#55cc88', '#ddaa44', '#cc6699', '#88cccc'];

  readonly sectionCurves = computed(() => {
    const lVal = this.lD();
    if (lVal <= 0) return [];

    // Build simple basis descriptions
    // On P1 the space L(D) has dim = deg(D)+1
    // We show up to 3 example basis functions
    const basis = this.computeBasis();
    const curves: { d: string; color: string; label: string }[] = [];
    const maxShow = Math.min(basis.length, 3);

    for (let i = 0; i < maxShow; i++) {
      const fn = basis[i];
      const path = this.functionPath(fn.eval);
      curves.push({
        d: path,
        color: this.COLORS[i % this.COLORS.length],
        label: fn.label,
      });
    }
    return curves;
  });

  /* ── Compute a simple basis for L(D) on P1 ── */
  private computeBasis(): { label: string; eval: (z: number) => number }[] {
    const m0 = this.n0();
    const m1 = this.n1();
    const m2 = this.n2();
    const mInf = this.nInf();
    const deg = m0 + m1 + m2 + mInf;
    const lVal = Math.max(0, deg + 1);
    if (lVal === 0) return [];

    // Strategy: enumerate monomials of the form z^a (z-1)^b (z-2)^c
    // where a >= -m0, b >= -m1, c >= -m2, and a+b+c <= mInf
    // Collect up to lVal basis elements
    const basis: { label: string; eval: (z: number) => number; totalDeg: number }[] = [];

    const maxExp = Math.max(mInf, 3) + 1;

    for (let a = -Math.max(m0, 0); a <= maxExp && basis.length < lVal; a++) {
      for (let b = -Math.max(m1, 0); b <= maxExp && basis.length < lVal; b++) {
        for (let c = -Math.max(m2, 0); c <= maxExp && basis.length < lVal; c++) {
          // Check pole constraints
          if (a < -m0 || b < -m1 || c < -m2) continue;
          // Check degree at infinity: total degree a+b+c <= mInf
          if (a + b + c > mInf) continue;
          // Must also satisfy: the function has no worse singularity than allowed
          // For negative a, pole at 0 of order |a|; same for b at 1, c at 2
          const label = basisLabel(a, b, c);
          const evalFn = (z: number) => {
            let val = 1;
            val *= Math.pow(z, a);
            val *= Math.pow(z - 1, b);
            val *= Math.pow(z - 2, c);
            return val;
          };
          basis.push({ label, eval: evalFn, totalDeg: a + b + c });
        }
      }
    }

    // Sort by total degree for nicer display
    basis.sort((x, y) => x.totalDeg - y.totalDeg);
    return basis.slice(0, lVal);
  }

  /* ── Build SVG path for a function, clipping to view ── */
  private functionPath(fn: (z: number) => number): string {
    const steps = 400;
    const [x0, x1] = this.pv.xRange;
    const [y0, y1] = this.pv.yRange;
    const dx = (x1 - x0) / steps;
    let d = '';
    let started = false;

    for (let i = 0; i <= steps; i++) {
      const x = x0 + i * dx;
      let y: number;
      try {
        y = fn(x);
      } catch {
        started = false;
        continue;
      }
      if (!isFinite(y) || Math.abs(y) > 1e6) {
        started = false;
        continue;
      }
      // Clip to view
      if (y < y0 - 0.5 || y > y1 + 0.5) {
        started = false;
        continue;
      }
      const sy = Math.max(this.pv.pad, Math.min(this.pv.svgH - this.pv.pad, this.toSvgY(y)));
      const sx = this.toSvgX(x);
      if (!started) {
        d += `M${sx.toFixed(1)},${sy.toFixed(1)}`;
        started = true;
      } else {
        d += `L${sx.toFixed(1)},${sy.toFixed(1)}`;
      }
    }
    return d;
  }
}

/* ── Helper: build label for z^a (z-1)^b (z-2)^c ── */
function basisLabel(a: number, b: number, c: number): string {
  if (a === 0 && b === 0 && c === 0) return '1';
  const parts: string[] = [];

  if (a !== 0) {
    if (a === 1) parts.push('z');
    else if (a === -1) parts.push('1/z');
    else if (a > 0) parts.push(`z${sup(a)}`);
    else parts.push(`1/z${sup(-a)}`);
  }
  if (b !== 0) {
    const base = '(z-1)';
    if (b === 1) parts.push(base);
    else if (b === -1) parts.push(`1/${base}`);
    else if (b > 0) parts.push(`${base}${sup(b)}`);
    else parts.push(`1/${base}${sup(-b)}`);
  }
  if (c !== 0) {
    const base = '(z-2)';
    if (c === 1) parts.push(base);
    else if (c === -1) parts.push(`1/${base}`);
    else if (c > 0) parts.push(`${base}${sup(c)}`);
    else parts.push(`1/${base}${sup(-c)}`);
  }

  // Separate numerator and denominator parts
  const numParts = parts.filter(p => !p.startsWith('1/'));
  const denParts = parts.filter(p => p.startsWith('1/')).map(p => p.slice(2));

  if (denParts.length === 0) return numParts.join('\u00B7') || '1';
  const num = numParts.length > 0 ? numParts.join('\u00B7') : '1';
  return `${num}/(${denParts.join('\u00B7')})`;
}

function sup(n: number): string {
  if (n === 1) return '';
  const digits: Record<string, string> = {
    '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
    '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077',
    '8': '\u2078', '9': '\u2079',
  };
  return String(n).split('').map(c => digits[c] ?? c).join('');
}
