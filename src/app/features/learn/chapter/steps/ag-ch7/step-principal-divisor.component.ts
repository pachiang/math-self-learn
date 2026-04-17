import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';

/* ── Rational function presets on P^1 ── */

interface ZeroPole {
  pos: number;         // position on number line (Infinity for the point at infinity)
  order: number;       // positive = zero, negative = pole
  label: string;       // display label
  isInfinity?: boolean;
}

interface RationalPreset {
  name: string;
  tex: string;
  divTex: string;
  points: ZeroPole[];
}

const PRESETS: RationalPreset[] = [
  {
    name: 'z\u00B2 / (z - 1)',
    tex: 'f(z) = \\frac{z^2}{z - 1}',
    divTex: '\\text{div}(f) = 2\\cdot[0] - [1] - [\\infty]',
    points: [
      { pos: 0, order: 2, label: '0' },
      { pos: 1, order: -1, label: '1' },
      { pos: 5.5, order: -1, label: '\\infty', isInfinity: true },
    ],
  },
  {
    name: '(z - 1)(z + 1) / z\u00B2',
    tex: 'f(z) = \\frac{(z-1)(z+1)}{z^2}',
    divTex: '\\text{div}(f) = [1] + [-1] - 2\\cdot[0]',
    points: [
      { pos: 1, order: 1, label: '1' },
      { pos: -1, order: 1, label: '-1' },
      { pos: 0, order: -2, label: '0' },
    ],
  },
  {
    name: 'z\u00B3',
    tex: 'f(z) = z^3',
    divTex: '\\text{div}(f) = 3\\cdot[0] - 3\\cdot[\\infty]',
    points: [
      { pos: 0, order: 3, label: '0' },
      { pos: 5.5, order: -3, label: '\\infty', isInfinity: true },
    ],
  },
];

/* ── Layout constants ── */

const SVG_W = 520;
const SVG_H = 400;
const LINE_Y = 200;           // y-coordinate of the number line
const LINE_LEFT = 40;
const LINE_RIGHT = 480;
const BAR_SCALE = 28;         // pixels per unit of order
const NUM_LEFT = -3;           // number line range left
const NUM_RIGHT = 4;           // number line range right (finite part)
const INF_X = LINE_RIGHT - 20; // position for the infinity point

@Component({
  selector: 'app-step-principal-divisor',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="主因子與線性等價" subtitle="&sect;7.2">
      <p>
        每個有理函數 <app-math e="f" /> 在曲線 <app-math e="C" /> 上都有零點和極點。
        函數 <app-math e="f" /> 的<strong>因子</strong>把這些記錄下來：
      </p>
      <app-math block [e]="formulaDiv"></app-math>
      <p>
        其中 <app-math e="\\text{ord}_P(f)" /> 是
        <app-math e="f" /> 在 <app-math e="P" /> 處的消失階——
        正數代表零點，負數代表極點。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        例如：在 <app-math e="\\mathbb{P}^1" /> 上，函數
        <app-math e="f(z) = z^2(z-1)/(z+1)^3" /> 有：
      </p>
      <ul>
        <li><app-math e="z = 0" /> 處二階零點</li>
        <li><app-math e="z = 1" /> 處一階零點</li>
        <li><app-math e="z = -1" /> 處三階極點</li>
      </ul>
      <p>
        所以 <app-math e="\\text{div}(f) = 2\\cdot[0] + [1] - 3\\cdot[-1]" />。
      </p>
      <p>
        <strong>重要事實：</strong>射影曲線上有理函數的因子度數<strong>恆為零</strong>！
        零點和極點必須完美平衡。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        形如 <app-math e="\\text{div}(f)" /> 的因子稱為<strong>主因子</strong>
        （principal divisor）。兩個因子
        <app-math e="D_1" /> 和 <app-math e="D_2" /> 若滿足
      </p>
      <app-math block [e]="formulaLinEq"></app-math>
      <p>
        則稱它們<strong>線性等價</strong>。這是因子的「正確」等價關係——
        如同路徑的同倫、群的同構。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>Picard 群</strong>
        <app-math e="\\text{Pic}(C)" /> 是因子除以主因子——
        即「因子在線性等價下的分類」。這是曲線最基本的不變量之一。
      </p>
      <app-math block [e]="formulaPic"></app-math>
    </app-prose-block>

    <app-challenge-card prompt="觀察有理函數的零點和極點如何構成主因子——度數總是為零">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i"
                  (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + svgW + ' ' + svgH" class="plot-svg">
        <defs>
          <linearGradient id="zeroGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#50b450" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#50b450" stop-opacity="0.2" />
          </linearGradient>
          <linearGradient id="poleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#c85050" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#c85050" stop-opacity="0.2" />
          </linearGradient>
        </defs>

        <!-- axis labels -->
        <text [attr.x]="lineLeft - 4" [attr.y]="lineY + 4"
              text-anchor="end" class="axis-label">
          <tspan>P</tspan><tspan font-size="8" dy="2">1</tspan>
        </text>

        <!-- number line -->
        <line [attr.x1]="lineLeft" [attr.y1]="lineY"
              [attr.x2]="lineRight" [attr.y2]="lineY"
              stroke="var(--text-muted)" stroke-width="1.2" />

        <!-- tick marks on number line -->
        @for (t of ticks; track t) {
          <line [attr.x1]="numToSvg(t)" [attr.y1]="lineY - 4"
                [attr.x2]="numToSvg(t)" [attr.y2]="lineY + 4"
                stroke="var(--text-muted)" stroke-width="0.8" />
          <text [attr.x]="numToSvg(t)" [attr.y]="lineY + 16"
                text-anchor="middle" class="tick-label">{{ t }}</text>
        }

        <!-- infinity mark -->
        <line [attr.x1]="infX" [attr.y1]="lineY - 4"
              [attr.x2]="infX" [attr.y2]="lineY + 4"
              stroke="var(--text-muted)" stroke-width="0.8" />
        <text [attr.x]="infX" [attr.y]="lineY + 16"
              text-anchor="middle" class="tick-label"
              style="font-style: normal;">&infin;</text>

        <!-- bars for zeros and poles -->
        @for (pt of activePreset().points; track pt.label) {
          @if (pt.order > 0) {
            <!-- zero: bar above the line (green) -->
            <rect [attr.x]="ptSvgX(pt) - 12"
                  [attr.y]="lineY - pt.order * barScale"
                  width="24"
                  [attr.height]="pt.order * barScale"
                  fill="url(#zeroGrad)" rx="3" />
            <text [attr.x]="ptSvgX(pt)"
                  [attr.y]="lineY - pt.order * barScale - 6"
                  text-anchor="middle" class="bar-label zero-text">
              +{{ pt.order }}
            </text>
          }

          @if (pt.order < 0) {
            <!-- pole: bar below the line (red) -->
            <rect [attr.x]="ptSvgX(pt) - 12"
                  [attr.y]="lineY"
                  width="24"
                  [attr.height]="-pt.order * barScale"
                  fill="url(#poleGrad)" rx="3" />
            <text [attr.x]="ptSvgX(pt)"
                  [attr.y]="lineY - pt.order * barScale + 14"
                  text-anchor="middle" class="bar-label pole-text">
              {{ pt.order }}
            </text>
          }

          <!-- dot on the number line -->
          <circle [attr.cx]="ptSvgX(pt)" [attr.cy]="lineY"
                  [attr.r]="3 + Math.abs(pt.order) * 1.5"
                  [attr.fill]="pt.order > 0 ? '#50b450' : '#c85050'"
                  stroke="#fff" stroke-width="0.8" />
        }

        <!-- degree = 0 annotation -->
        <text [attr.x]="svgW / 2" [attr.y]="svgH - 16"
              text-anchor="middle" class="deg-annotation">
          deg(div(f)) = {{ computeDeg() }}
        </text>

        <!-- green check if degree = 0 -->
        @if (computeDeg() === 0) {
          <rect [attr.x]="svgW / 2 + 72" [attr.y]="svgH - 28"
                width="16" height="16" rx="3"
                fill="rgba(80,180,80,0.2)" stroke="#50b450" stroke-width="0.8" />
          <text [attr.x]="svgW / 2 + 80" [attr.y]="svgH - 16"
                text-anchor="middle" class="check-mark">&#10003;</text>
        }
      </svg>

      <!-- Info row -->
      <div class="info-row">
        <div class="info-card" style="flex:2">
          <div class="ic-title">函數</div>
          <app-math [e]="activePreset().tex"></app-math>
        </div>
        <div class="info-card" style="flex:2">
          <div class="ic-title">主因子</div>
          <app-math [e]="activePreset().divTex"></app-math>
        </div>
        <div class="info-card badge-card">
          <span class="badge deg-badge">deg = {{ computeDeg() }}</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="legend-row">
        <span class="legend-dot" style="background:#50b450"></span>
        <span class="legend-text">零點（上方）</span>
        <span class="legend-dot" style="background:#c85050"></span>
        <span class="legend-text">極點（下方）</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        主因子的度數恆為零——這是代數幾何最基本的事實之一。
        它意味著一個函數不可能「只有零點沒有極點」。零極必須平衡。
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
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .axis-label {
      font-size: 13px; font-weight: 700; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .tick-label {
      font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .bar-label {
      font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .zero-text { fill: #50b450; }
    .pole-text { fill: #c85050; }
    .deg-annotation {
      font-size: 12px; font-weight: 600; fill: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    .check-mark {
      font-size: 12px; fill: #50b450; font-weight: 700;
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
    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .deg-badge {
      background: rgba(80,180,80,0.12); color: #50b450;
      border: 1px solid rgba(80,180,80,0.3);
    }

    .legend-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 12px; color: var(--text-secondary);
    }
    .legend-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .legend-text {
      font-family: 'JetBrains Mono', monospace; margin-right: 12px;
    }
  `,
})
export class StepPrincipalDivisorComponent {
  /* ── Formulae ── */

  readonly formulaDiv =
    `\\text{div}(f) = \\sum_{P \\in C} \\text{ord}_P(f) \\cdot P`;

  readonly formulaLinEq =
    `D_1 \\sim D_2 \\;\\Longleftrightarrow\\; D_1 - D_2 = \\text{div}(f) \\;\\text{for some } f`;

  readonly formulaPic =
    `\\text{Pic}(C) = \\text{Div}(C) \\,/\\, \\text{Prin}(C)`;

  /* ── Layout ── */

  readonly svgW = SVG_W;
  readonly svgH = SVG_H;
  readonly lineY = LINE_Y;
  readonly lineLeft = LINE_LEFT;
  readonly lineRight = LINE_RIGHT;
  readonly barScale = BAR_SCALE;
  readonly infX = INF_X;
  readonly Math = Math;

  readonly ticks = [-3, -2, -1, 0, 1, 2, 3];

  /* ── Presets ── */

  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.presetIdx()]);

  /** Map a finite number to SVG x-coordinate on the number line */
  numToSvg(n: number): number {
    const ratio = (n - NUM_LEFT) / (NUM_RIGHT - NUM_LEFT);
    return LINE_LEFT + ratio * (INF_X - 30 - LINE_LEFT);
  }

  /** Get SVG x for a ZeroPole point (handling infinity) */
  ptSvgX(pt: ZeroPole): number {
    return pt.isInfinity ? INF_X : this.numToSvg(pt.pos);
  }

  /** Compute total degree */
  readonly computeDeg = computed(() =>
    this.activePreset().points.reduce((s, p) => s + p.order, 0),
  );
}
