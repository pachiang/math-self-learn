import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Divisor point on the curve ── */

interface DivisorPoint {
  label: string;
  x: number;
  y: number;       // computed from curve equation
  mult: number;    // multiplicity signal value
}

/* ── Elliptic curve: y^2 = x^3 - x + 1 ── */

function curveF(x: number, y: number): number {
  return y * y - (x * x * x - x + 1);
}

/** Solve y for a given x on the upper branch */
function curveY(x: number): number {
  const val = x * x * x - x + 1;
  return val >= 0 ? Math.sqrt(val) : 0;
}

/* Fixed x-values for divisor points, placed on the upper branch */
const POINT_XS = [-1, 0, 1, 1.5];
const POINT_LABELS = ['P_1', 'P_2', 'P_3', 'P_4'];

@Component({
  selector: 'app-step-what-is-divisor',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="什麼是因子" subtitle="&sect;7.1">
      <p>
        在代數曲線 <app-math e="C" /> 上，一個<strong>因子</strong>（divisor）
        是一組點的「帶整數權重的形式和」：
      </p>
      <app-math block [e]="formulaDivisor"></app-math>
      <p>
        正的重數代表「存款」（零點），負的代表「提款」（極點）。
        你可以把因子想成曲線上的一份<strong>清單</strong>——
        每個點旁邊標著一個整數。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        因子的<strong>度數</strong>（degree）是所有重數的總和：
      </p>
      <app-math block [e]="formulaDeg"></app-math>
      <p>
        若所有重數都是非負的，因子稱為<strong>有效因子</strong>
        （effective divisor），記為
        <app-math e="D \\geq 0" />。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        來看射影直線 <app-math e="\\mathbb{P}^1" /> 上的例子：
      </p>
      <ul>
        <li>
          <app-math e="D_1 = 2 \\cdot [0] + 1 \\cdot [1]" />
          &mdash; 在 0 處雙重、在 1 處單重（度數 3）
        </li>
        <li>
          <app-math e="D_2 = [0] - [\\infty]" />
          &mdash; 0 處一個零點，<app-math e="\\infty" /> 處一個極點（度數 0）
        </li>
        <li>
          <app-math e="D_3 = 3 \\cdot [2] - 2 \\cdot [0] - [1]" />
          &mdash; （度數 0）
        </li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        因子為什麼重要？因子精確地<strong>編碼</strong>了亞純函數
        在曲線上的零點和極點。它們是連接<strong>代數</strong>
        （多項式方程）和<strong>幾何</strong>（曲線上的點）的橋樑。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="在曲線上建構因子——拖動增減點的重數">
      <!-- SVG plot -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)"
              stroke-width="0.8" />

        <!-- elliptic curve -->
        <path [attr.d]="curvePath" fill="none" stroke="var(--accent)"
              stroke-width="2" stroke-linecap="round" />

        <!-- divisor points -->
        @for (pt of points; track pt.label; let i = $index) {
          <!-- connecting line from curve to badge -->
          @if (mults()[i] !== 0) {
            <line [attr.x1]="toSvgX(pt.x)" [attr.y1]="toSvgY(pt.y)"
                  [attr.x2]="toSvgX(pt.x)" [attr.y2]="toSvgY(pt.y) - 28"
                  stroke="var(--text-muted)" stroke-width="0.6"
                  stroke-dasharray="2 2" />
          }

          <!-- point dot — size scales with |mult| -->
          <circle [attr.cx]="toSvgX(pt.x)" [attr.cy]="toSvgY(pt.y)"
                  [attr.r]="dotRadius(mults()[i])"
                  [attr.fill]="dotColor(mults()[i])"
                  [attr.fill-opacity]="mults()[i] === 0 ? 0.25 : 0.85"
                  stroke="#fff" stroke-width="0.8" />

          <!-- multiplicity badge -->
          @if (mults()[i] !== 0) {
            <rect [attr.x]="toSvgX(pt.x) - 13"
                  [attr.y]="toSvgY(pt.y) - 44"
                  width="26" height="18" rx="4"
                  [attr.fill]="mults()[i] > 0 ? 'rgba(80,180,80,0.15)' : 'rgba(200,80,80,0.15)'"
                  [attr.stroke]="mults()[i] > 0 ? '#50b450' : '#c85050'"
                  stroke-width="0.8" />
            <text [attr.x]="toSvgX(pt.x)"
                  [attr.y]="toSvgY(pt.y) - 31"
                  text-anchor="middle" class="mult-label"
                  [attr.fill]="mults()[i] > 0 ? '#50b450' : '#c85050'">
              {{ mults()[i] > 0 ? '+' : '' }}{{ mults()[i] }}
            </text>
          }

          <!-- point label below -->
          <text [attr.x]="toSvgX(pt.x)"
                [attr.y]="toSvgY(pt.y) + 18"
                text-anchor="middle" class="pt-label">
            {{ pt.label }}
          </text>

          <!-- +/- buttons -->
          <!-- minus button -->
          <g class="btn-group" (click)="decrement(i)">
            <rect [attr.x]="toSvgX(pt.x) - 26"
                  [attr.y]="toSvgY(pt.y) + 24"
                  width="22" height="18" rx="4"
                  class="btn-rect" />
            <text [attr.x]="toSvgX(pt.x) - 15"
                  [attr.y]="toSvgY(pt.y) + 36.5"
                  text-anchor="middle" class="btn-text">&minus;</text>
          </g>
          <!-- plus button -->
          <g class="btn-group" (click)="increment(i)">
            <rect [attr.x]="toSvgX(pt.x) + 4"
                  [attr.y]="toSvgY(pt.y) + 24"
                  width="22" height="18" rx="4"
                  class="btn-rect" />
            <text [attr.x]="toSvgX(pt.x) + 15"
                  [attr.y]="toSvgY(pt.y) + 36.5"
                  text-anchor="middle" class="btn-text">+</text>
          </g>
        }
      </svg>

      <!-- Divisor display -->
      <div class="info-row">
        <div class="info-card" style="flex:2">
          <div class="ic-title">因子 D</div>
          <app-math [e]="divisorTex()"></app-math>
        </div>
        <div class="info-card">
          <div class="ic-title">度數</div>
          <div class="ic-body mono">deg(D) = {{ degree() }}</div>
        </div>
        <div class="info-card badge-card">
          @if (isEffective()) {
            <span class="badge eff-badge">有效因子 (D &ge; 0)</span>
          } @else {
            <span class="badge neutral-badge">非有效因子</span>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        因子看似只是「帶整數的點的列表」，但這個簡單的概念蘊含了巨大的力量。
        下一節看因子如何與函數的零極點聯繫。
      </p>
    </app-prose-block>
  `,
  styles: `
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .mult-label {
      font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .pt-label {
      font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-style: italic;
    }
    .btn-group { cursor: pointer; }
    .btn-rect {
      fill: var(--bg-surface); stroke: var(--border); stroke-width: 1;
      transition: fill 0.12s, stroke 0.12s;
    }
    .btn-group:hover .btn-rect {
      stroke: var(--accent); fill: rgba(102,170,255,0.08);
    }
    .btn-text {
      font-size: 13px; font-weight: 700; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; pointer-events: none;
    }

    .info-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 120px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 13px;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .ic-body {
      font-size: 13px; font-weight: 600; color: var(--text);
    }
    .ic-body.mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; white-space: nowrap;
    }
    .eff-badge {
      background: rgba(80,180,80,0.12); color: #50b450;
      border: 1px solid rgba(80,180,80,0.3);
    }
    .neutral-badge {
      background: var(--bg-surface); color: var(--text-muted);
      border: 1px solid var(--border);
    }
  `,
})
export class StepWhatIsDivisorComponent {
  /* ── Formulae ── */

  readonly formulaDivisor =
    `D = \\sum_{i} n_i P_i, \\quad n_i \\in \\mathbb{Z}, \\; P_i \\in C`;

  readonly formulaDeg = `\\deg(D) = \\sum_i n_i`;

  /* ── Plot view ── */

  readonly v: PlotView = {
    xRange: [-2, 2.5], yRange: [-2.5, 2.5],
    svgW: 520, svgH: 300, pad: 30,
  };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /* ── Elliptic curve path ── */

  readonly curvePath = implicitCurve(
    curveF, this.v.xRange, this.v.yRange,
    this.toSvgX, this.toSvgY, 120,
  );

  /* ── Divisor points (fixed positions on the curve) ── */

  readonly points: DivisorPoint[] = POINT_XS.map((x, i) => ({
    label: POINT_LABELS[i],
    x,
    y: curveY(x),
    mult: 0,
  }));

  /* ── Multiplicities ── */

  readonly mults = signal([1, -1, 2, 0]);

  increment(i: number): void {
    const arr = [...this.mults()];
    if (arr[i] < 3) { arr[i]++; this.mults.set(arr); }
  }

  decrement(i: number): void {
    const arr = [...this.mults()];
    if (arr[i] > -3) { arr[i]--; this.mults.set(arr); }
  }

  /* ── Derived display ── */

  readonly degree = computed(() =>
    this.mults().reduce((s, n) => s + n, 0),
  );

  readonly isEffective = computed(() =>
    this.mults().every(n => n >= 0),
  );

  readonly divisorTex = computed(() => {
    const ms = this.mults();
    const parts: string[] = [];
    for (let i = 0; i < ms.length; i++) {
      if (ms[i] === 0) continue;
      const absCoeff = Math.abs(ms[i]) === 1
        ? '' : String(Math.abs(ms[i])) + '\\cdot ';
      if (parts.length === 0) {
        parts.push(
          (ms[i] < 0 ? '-' : '') + absCoeff + POINT_LABELS[i],
        );
      } else {
        const sign = ms[i] < 0 ? ' - ' : ' + ';
        parts.push(sign + absCoeff + POINT_LABELS[i]);
      }
    }
    return parts.length === 0 ? '0' : 'D = ' + parts.join('');
  });

  /* ── Visual helpers ── */

  dotRadius(mult: number): number {
    const absMult = Math.abs(mult);
    if (absMult === 0) return 4;
    return 4 + absMult * 2.5;
  }

  dotColor(mult: number): string {
    if (mult > 0) return '#50b450';
    if (mult < 0) return '#c85050';
    return 'var(--text-muted)';
  }
}
