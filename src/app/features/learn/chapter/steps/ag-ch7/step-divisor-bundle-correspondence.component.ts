import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Elliptic-curve L(D) table ── */
interface EllipticRow {
  label: string;
  deg: number;
  lD: number;
  note: string;
}

const EC_TABLE: EllipticRow[] = [
  { label: '0',   deg: 0, lD: 1, note: '{常數}' },
  { label: 'P',   deg: 1, lD: 1, note: '{常數} (虧格效應!)' },
  { label: '2P',  deg: 2, lD: 2, note: 'span{1, x}' },
  { label: '3P',  deg: 3, lD: 3, note: 'span{1, x, y}' },
  { label: '4P',  deg: 4, lD: 4, note: 'span{1, x, y, x\u00B2}' },
  { label: '5P',  deg: 5, lD: 5, note: 'span{1, x, y, x\u00B2, xy}' },
];

@Component({
  selector: 'app-step-divisor-bundle-corresp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- ── Block 1: The three-way correspondence ── -->
    <app-prose-block title="因子與線叢的對應" subtitle="&sect;7.4">
      <p>
        The punchline: divisors and line bundles are <strong>TWO DESCRIPTIONS</strong>
        of the <strong>SAME thing</strong>. Every divisor D on a curve C gives a line bundle
        <app-math e="\\mathcal{O}(D)" />, and every line bundle comes from some divisor.
      </p>
      <app-math block [e]="formulaCorrespondence"></app-math>
      <p>
        This three-way correspondence is the foundation of modern algebraic geometry.
      </p>
    </app-prose-block>

    <!-- ── Block 2: How divisors give line bundles ── -->
    <app-prose-block>
      <p>
        How does a divisor D give a line bundle? The idea:
      </p>
      <ul>
        <li>
          If <app-math e="D = P" /> (a single point), the line bundle
          <app-math e="\\mathcal{O}(P)" /> is
          &laquo;trivial everywhere except near P, where the fiber has a pole&raquo;.
        </li>
        <li>
          More precisely: sections of <app-math e="\\mathcal{O}(D)" />
          are rational functions f with
          <app-math e="\\text{div}(f) + D \\geq 0" />.
        </li>
      </ul>
      <app-math block [e]="formulaLD"></app-math>
      <p>
        This is a vector space! Its dimension
        <app-math e="l(D) = \\dim L(D)" />
        counts &laquo;how many independent functions are allowed by D&raquo;.
      </p>
    </app-prose-block>

    <!-- ── Block 3: Examples on P1 ── -->
    <app-prose-block>
      <p>Examples on <app-math e="\\mathbb{P}^1" />:</p>
      <ul>
        <li><app-math e="L(0)" /> = &#123;constants&#125;, so l(0) = 1.</li>
        <li>
          <app-math e="L(n \\cdot [\\infty])" /> on
          <app-math e="\\mathbb{P}^1" />
          = &#123;polynomials of degree
          <app-math e="\\leq n" />&#125;, so
          <app-math e="l(n \\cdot [\\infty]) = n + 1" />.
        </li>
      </ul>
      <p>Concretely:</p>
      <ul>
        <li><app-math e="L(0 \\cdot [\\infty])" /> = &#123;常數&#125; &rarr; l = 1</li>
        <li><app-math e="L(1 \\cdot [\\infty])" /> = &#123;a + bz&#125; &rarr; l = 2</li>
        <li><app-math e="L(2 \\cdot [\\infty])" /> = &#123;a + bz + cz&sup2;&#125; &rarr; l = 3</li>
      </ul>
      <app-math block [e]="formulaP1"></app-math>
    </app-prose-block>

    <!-- ── Block 4: The pattern ── -->
    <app-prose-block>
      <p>
        The pattern: on <app-math e="\\mathbb{P}^1" />,
        <app-math e="l(D) = \\max(0,\\; \\deg(D) + 1)" />.
        This is a special case of the <strong>Riemann-Roch theorem</strong>!
      </p>
    </app-prose-block>

    <!-- ── Interactive correspondence diagram ── -->
    <app-challenge-card prompt="觀察因子、線叢和截面空間的三方對應">

      <!-- n slider -->
      <div class="ctrl-row">
        <label class="slider-label">
          n = {{ n() }}
          <input type="range" [min]="0" [max]="5" [step]="1"
                 [value]="n()"
                 (input)="n.set(+$any($event.target).value)" />
        </label>
        <button class="mode-btn" [class.active]="showElliptic()"
                (click)="showElliptic.set(!showElliptic())">
          {{ showElliptic() ? '隱藏橢圓曲線對比' : '顯示橢圓曲線對比' }}
        </button>
      </div>

      <!-- Three-column correspondence diagram (SVG) -->
      <svg [attr.viewBox]="'0 0 ' + diagW + ' ' + diagH" class="diagram-svg">
        <!-- Column headers -->
        <text [attr.x]="col1X" [attr.y]="28" class="col-header" text-anchor="middle">因子 D</text>
        <text [attr.x]="col2X" [attr.y]="28" class="col-header" text-anchor="middle">線叢 O(D)</text>
        <text [attr.x]="col3X" [attr.y]="28" class="col-header" text-anchor="middle">截面空間 L(D)</text>

        <!-- Separator lines -->
        <line x1="10" [attr.x2]="diagW - 10" y1="38" y2="38"
              stroke="var(--border)" stroke-width="1" />

        <!-- Column 1: Divisor on P1 -->
        <text [attr.x]="col1X" y="66" class="col-main" text-anchor="middle">
          {{ n() }} &middot; [&infin;]
        </text>
        <!-- Small P1 line with marked infinity -->
        <line [attr.x1]="col1X - 50" [attr.x2]="col1X + 50" y1="90" y2="90"
              stroke="var(--text-muted)" stroke-width="1.5" />
        <circle [attr.cx]="col1X + 50" cy="90" r="5"
                fill="var(--accent)" stroke="#fff" stroke-width="1" />
        <text [attr.x]="col1X + 50" y="108" class="col-sub" text-anchor="middle">&infin;</text>
        @if (n() > 0) {
          <text [attr.x]="col1X + 38" y="82" class="mult-label" text-anchor="middle">
            {{ n() }}
          </text>
        }

        <!-- Column 2: Line bundle icon (twisted band) -->
        <text [attr.x]="col2X" y="66" class="col-main" text-anchor="middle">
          O({{ n() }})
        </text>
        <!-- Twisted band icon -->
        @for (i of twistIndices(); track i) {
          <ellipse [attr.cx]="col2X - 30 + i * (60 / Math.max(n(), 1))"
                   cy="92"
                   [attr.rx]="Math.max(4, 28 / Math.max(n(), 1))"
                   ry="12"
                   fill="none" stroke="var(--accent)" stroke-width="1.5"
                   [attr.opacity]="0.4 + 0.6 * (i / Math.max(n(), 1))" />
        }
        @if (n() === 0) {
          <!-- trivial bundle: just a rectangle -->
          <rect [attr.x]="col2X - 30" y="80" width="60" height="24"
                fill="none" stroke="var(--text-muted)" stroke-width="1.2"
                rx="3" />
          <text [attr.x]="col2X" y="96" class="col-sub" text-anchor="middle"
                fill="var(--text-muted)">trivial</text>
        }

        <!-- Column 3: Section space -->
        <text [attr.x]="col3X" y="66" class="col-main" text-anchor="middle">
          {{ basisLabel() }}
        </text>
        <text [attr.x]="col3X" y="86" class="col-dim" text-anchor="middle">
          dim = {{ n() + 1 }}
        </text>

        <!-- Arrows between columns -->
        <line [attr.x1]="col1X + 65" [attr.x2]="col2X - 65" y1="70" y2="70"
              stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arrowR)" />
        <line [attr.x1]="col2X + 65" [attr.x2]="col3X - 65" y1="70" y2="70"
              stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arrowR)" />

        <defs>
          <marker id="arrowR" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="none" stroke="var(--accent)" stroke-width="1" />
          </marker>
        </defs>
      </svg>

      <!-- Small basis-polynomial plot -->
      <svg [attr.viewBox]="'0 0 ' + pv.svgW + ' ' + pv.svgH" class="plot-svg">
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />
        @for (curve of basisCurves(); track $index) {
          <path [attr.d]="curve.d" fill="none"
                [attr.stroke]="curve.color" stroke-width="1.8"
                stroke-linecap="round" />
        }
        <!-- Legend -->
        @for (curve of basisCurves(); track $index) {
          <rect [attr.x]="pv.svgW - 100"
                [attr.y]="10 + $index * 18"
                width="14" height="10" rx="2"
                [attr.fill]="curve.color" opacity="0.7" />
          <text [attr.x]="pv.svgW - 82"
                [attr.y]="19 + $index * 18"
                class="legend-text">{{ curve.label }}</text>
        }
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">因子</div>
          <div class="ic-body accent">D = {{ n() }}&middot;[&infin;]</div>
        </div>
        <div class="info-card">
          <div class="ic-title">度數</div>
          <div class="ic-body">deg(D) = {{ n() }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">截面空間維度</div>
          <div class="ic-body accent">l(D) = {{ n() + 1 }}</div>
        </div>
      </div>

      <!-- Elliptic curve comparison toggle -->
      @if (showElliptic()) {
        <div class="ec-section">
          <div class="ec-header">
            橢圓曲線 E（genus 1）上的 l(D) 對比
          </div>
          <table class="ec-table">
            <thead>
              <tr>
                <th>D</th>
                <th>deg(D)</th>
                <th>l(D) on E</th>
                <th>l(D) on P&sup1;</th>
                <th>基底</th>
              </tr>
            </thead>
            <tbody>
              @for (row of ecTable; track row.label) {
                <tr [class.highlight]="row.deg === n()">
                  <td>{{ row.label }}</td>
                  <td>{{ row.deg }}</td>
                  <td class="accent">{{ row.lD }}</td>
                  <td>{{ Math.max(0, row.deg + 1) }}</td>
                  <td class="note">{{ row.note }}</td>
                </tr>
              }
            </tbody>
          </table>
          <p class="ec-note">
            注意: l(P) = 1 而非 2 -- 因為虧格 g = 1 引入了偏移。
            在 P&sup1; 上（g = 0），l(D) = deg(D) + 1；
            但在橢圓曲線上，低度數時 l(D) 更小。
          </p>
        </div>
      }
    </app-challenge-card>

    <!-- ── Bottom prose ── -->
    <app-prose-block>
      <p>
        l(D) 是代數幾何最重要的數量之一。它告訴我們「有多少獨立的函數受到因子 D 的約束」。
        Riemann-Roch 定理將給出計算 l(D) 的精確公式。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 10px;
    }
    .slider-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
    .slider-label input[type="range"] {
      width: 140px; accent-color: var(--accent);
    }
    .mode-btn {
      padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .diagram-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .col-header {
      font-size: 12px; font-weight: 700; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .col-main {
      font-size: 14px; font-weight: 700; fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
    .col-sub {
      font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .col-dim {
      font-size: 12px; font-weight: 600; fill: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
    .mult-label {
      font-size: 11px; font-weight: 700; fill: var(--accent);
      font-family: 'JetBrains Mono', monospace;
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
      flex: 1; min-width: 120px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 14px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .ic-body.accent { color: var(--accent); }
    .ec-section {
      margin-top: 12px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface);
    }
    .ec-header {
      font-size: 12px; font-weight: 700; color: var(--text);
      margin-bottom: 8px; font-family: 'JetBrains Mono', monospace;
    }
    .ec-table {
      width: 100%; border-collapse: collapse; font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .ec-table th {
      padding: 4px 8px; text-align: center; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 700; font-size: 10px;
      text-transform: uppercase;
    }
    .ec-table td {
      padding: 4px 8px; text-align: center; color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
    }
    .ec-table td.accent { color: var(--accent); font-weight: 700; }
    .ec-table td.note { font-size: 10px; color: var(--text-muted); text-align: left; }
    .ec-table tr.highlight td { background: var(--accent-10); }
    .ec-note {
      margin-top: 8px; font-size: 11px; color: var(--text-muted);
      line-height: 1.5;
    }
  `,
})
export class StepDivisorBundleCorrespondenceComponent {
  readonly Math = Math;

  /* ── KaTeX formulas ── */
  readonly formulaCorrespondence =
    `D \\;\\longleftrightarrow\\; \\mathcal{O}(D) \\;\\longleftrightarrow\\; L(D)`;
  readonly formulaLD =
    `L(D) = H^0(C, \\mathcal{O}(D)) = \\{f \\in k(C)^* : \\text{div}(f) + D \\geq 0\\} \\cup \\{0\\}`;
  readonly formulaP1 =
    `L(n \\cdot [\\infty]) = \\{a_0 + a_1 z + \\cdots + a_n z^n\\}, \\quad l(n \\cdot [\\infty]) = n + 1`;

  /* ── State ── */
  readonly n = signal(2);
  readonly showElliptic = signal(false);

  /* ── Elliptic curve data ── */
  readonly ecTable = EC_TABLE;

  /* ── Diagram layout ── */
  readonly diagW = 520;
  readonly diagH = 126;
  readonly col1X = 90;
  readonly col2X = 260;
  readonly col3X = 430;

  /* ── Plot view for basis polynomials ── */
  readonly pv: PlotView = { xRange: [-2, 2], yRange: [-3, 3], svgW: 520, svgH: 240, pad: 30 };
  readonly axesPath = plotAxesPath(this.pv);
  private toX = (x: number) => plotToSvgX(this.pv, x);
  private toY = (y: number) => plotToSvgY(this.pv, y);

  /* ── Twist indices for the line bundle icon ── */
  readonly twistIndices = computed(() => {
    const nVal = this.n();
    if (nVal === 0) return [];
    const arr: number[] = [];
    for (let i = 0; i <= nVal; i++) arr.push(i);
    return arr;
  });

  /* ── Basis label ── */
  readonly basisLabel = computed(() => {
    const nVal = this.n();
    if (nVal === 0) return 'span{1}';
    const parts = ['1'];
    for (let k = 1; k <= nVal; k++) {
      parts.push(k === 1 ? 'z' : `z${superscript(k)}`);
    }
    return `span{${parts.join(', ')}}`;
  });

  /* ── Basis polynomial curves ── */
  readonly COLORS = ['#66aaff', '#55cc88', '#ddaa44', '#cc6699', '#88cccc', '#cc8855'];

  readonly basisCurves = computed(() => {
    const nVal = this.n();
    const curves: { d: string; color: string; label: string }[] = [];
    // Show up to 4 basis functions for clarity
    const maxShow = Math.min(nVal + 1, 4);
    for (let k = 0; k < maxShow; k++) {
      const color = this.COLORS[k % this.COLORS.length];
      const label = k === 0 ? '1' : k === 1 ? 'z' : `z${superscript(k)}`;
      const path = this.polyPath(k);
      curves.push({ d: path, color, label });
    }
    return curves;
  });

  /* ── Build SVG path for z^k ── */
  private polyPath(k: number): string {
    const steps = 200;
    const [x0, x1] = this.pv.xRange;
    const [y0, y1] = this.pv.yRange;
    const dx = (x1 - x0) / steps;
    let d = '';
    let started = false;

    for (let i = 0; i <= steps; i++) {
      const x = x0 + i * dx;
      const y = Math.pow(x, k);
      if (y < y0 || y > y1) {
        started = false;
        continue;
      }
      const sx = this.toX(x);
      const sy = this.toY(y);
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

/* ── Helper: Unicode superscript digits ── */
function superscript(n: number): string {
  const sup: Record<string, string> = {
    '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
    '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077',
    '8': '\u2078', '9': '\u2079',
  };
  return String(n).split('').map(c => sup[c] ?? c).join('');
}
