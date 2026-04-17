import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, gradient, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from './ag-util';

/* ── Curve presets ── */

interface CurvePreset {
  key: string;
  label: string;
  fn: (x: number, y: number) => number;
  tex: string;
  desc: string;
  knownSingular: [number, number][];
  singType: string;
}

const CURVES: CurvePreset[] = [
  {
    key: 'node',
    label: '結點 y\u00B2 = x\u00B2(x+1)',
    fn: (x, y) => y * y - x * x * (x + 1),
    tex: 'y^2 - x^2(x+1) = 0',
    desc: '原點是結點（node）：兩個分支在此交叉。梯度 = (0,0)。',
    knownSingular: [[0, 0]],
    singType: '結點',
  },
  {
    key: 'cusp',
    label: '尖點 y\u00B2 = x\u00B3',
    fn: (x, y) => y * y - x * x * x,
    tex: 'y^2 - x^3 = 0',
    desc: '原點是尖點（cusp）：曲線在此折回自身，形成尖銳的角。',
    knownSingular: [[0, 0]],
    singType: '尖點',
  },
  {
    key: 'smooth',
    label: '光滑三次 y\u00B2 = x\u00B3 - x',
    fn: (x, y) => y * y - x * x * x + x,
    tex: 'y^2 - x^3 + x = 0',
    desc: '這條橢圓曲線處處光滑——梯度永遠不為零。每個點都有明確的切線。',
    knownSingular: [],
    singType: '無',
  },
  {
    key: 'isolated',
    label: '孤立點 x\u00B2 + y\u00B2 = 0',
    fn: (x, y) => x * x + y * y,
    tex: 'x^2 + y^2 = 0',
    desc: '在實數上，只有 (0,0) 滿足方程。這是一個孤立奇異點。',
    knownSingular: [[0, 0]],
    singType: '孤立點',
  },
  {
    key: 'tacnode',
    label: 'tacnode y\u00B2 = x\u2074',
    fn: (x, y) => y * y - x * x * x * x,
    tex: 'y^2 - x^4 = 0',
    desc: 'Tacnode：兩個分支在原點以更高階相切。比結點更「扁」的接觸。',
    knownSingular: [[0, 0]],
    singType: 'tacnode',
  },
];

const SINGULAR_THRESHOLD = 0.15;

@Component({
  selector: 'app-step-singular-points',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="奇異點：曲線的「打結」處" subtitle="§1.3">
      <p>
        曲線 V(f) 上的一點 p 是<strong>奇異點</strong>（singular point），
        如果梯度在該點消失：
      </p>
      <app-math block [e]="formulaSing"></app-math>
      <p>
        在光滑點，梯度不為零，曲線有明確的切線方向。
        但在奇異點——結點（自交）、尖點（折回）、孤立點——
        切線退化，幾何行為變得複雜且有趣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="在曲線上拖動探針，觀察切線——當梯度消失時，切線退化">
      <!-- Curve presets -->
      <div class="preset-row">
        @for (c of curves; track c.key; let i = $index) {
          <button class="pre-btn" [class.active]="curveIdx() === i"
                  (click)="curveIdx.set(i)">{{ c.label }}</button>
        }
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg"
           (pointermove)="onPointerMove($event)"
           (pointerdown)="dragging.set(true)"
           (pointerup)="dragging.set(false)"
           (pointerleave)="dragging.set(false)">

        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Implicit curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2"
              stroke-linecap="round" />

        <!-- Known singular points markers -->
        @for (sp of activeCurve().knownSingular; track $index) {
          <circle [attr.cx]="toSvgX(sp[0])" [attr.cy]="toSvgY(sp[1])" r="7"
                  fill="none" stroke="#cc4444" stroke-width="1.5" stroke-dasharray="3 2" />
          <line [attr.x1]="toSvgX(sp[0]) - 4" [attr.y1]="toSvgY(sp[1]) - 4"
                [attr.x2]="toSvgX(sp[0]) + 4" [attr.y2]="toSvgY(sp[1]) + 4"
                stroke="#cc4444" stroke-width="1.2" />
          <line [attr.x1]="toSvgX(sp[0]) + 4" [attr.y1]="toSvgY(sp[1]) - 4"
                [attr.x2]="toSvgX(sp[0]) - 4" [attr.y2]="toSvgY(sp[1]) + 4"
                stroke="#cc4444" stroke-width="1.2" />
        }

        <!-- Tangent line at probe (when smooth) -->
        @if (probeInfo().nearCurve && !probeInfo().isSingular) {
          <line [attr.x1]="probeInfo().tangentX1" [attr.y1]="probeInfo().tangentY1"
                [attr.x2]="probeInfo().tangentX2" [attr.y2]="probeInfo().tangentY2"
                stroke="#5a8a5a" stroke-width="1.8" stroke-linecap="round" />
        }

        <!-- Gradient arrow at probe -->
        @if (probeInfo().nearCurve && probeInfo().gradMag > 0.05) {
          <line [attr.x1]="probeInfo().probeSx" [attr.y1]="probeInfo().probeSy"
                [attr.x2]="probeInfo().gradArrowX" [attr.y2]="probeInfo().gradArrowY"
                stroke="var(--text-muted)" stroke-width="1.2"
                marker-end="url(#arrowhead)" />
        }

        <!-- Probe circle -->
        @if (probeInfo().nearCurve) {
          <circle [attr.cx]="probeInfo().probeSx" [attr.cy]="probeInfo().probeSy"
                  [attr.r]="probeInfo().isSingular ? 8 : 4"
                  [attr.fill]="probeInfo().isSingular ? '#cc4444' : '#5a8a5a'"
                  [attr.fill-opacity]="probeInfo().isSingular ? 0.7 : 0.9"
                  stroke="#fff" stroke-width="1" />
        }

        <!-- Singular label -->
        @if (probeInfo().isSingular && probeInfo().nearCurve) {
          <text [attr.x]="probeInfo().probeSx + 12" [attr.y]="probeInfo().probeSy - 12"
                class="sing-label">奇異點!</text>
        }

        <!-- Arrow marker definition -->
        <defs>
          <marker id="arrowhead" markerWidth="7" markerHeight="5"
                  refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">方程</div>
          <app-math [e]="activeCurve().tex"></app-math>
        </div>
        <div class="info-card mono-card">
          <div class="ic-row">
            <span class="ic-label">&part;f/&part;x</span>
            <span class="ic-val">{{ probeInfo().dfdx }}</span>
          </div>
          <div class="ic-row">
            <span class="ic-label">&part;f/&part;y</span>
            <span class="ic-val">{{ probeInfo().dfdy }}</span>
          </div>
          <div class="ic-row">
            <span class="ic-label">|&#8711;f|</span>
            <span class="ic-val">{{ probeInfo().gradMagStr }}</span>
          </div>
        </div>
        <div class="info-card badge-card">
          @if (probeInfo().nearCurve) {
            @if (probeInfo().isSingular) {
              <span class="badge sing-badge">奇異點</span>
            } @else {
              <span class="badge smooth-badge">光滑點</span>
            }
          } @else {
            <span class="badge muted-badge">拖動探針到曲線上</span>
          }
        </div>
      </div>

      <!-- Curve description -->
      <div class="desc-box">{{ activeCurve().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        奇異點是曲線上最有趣的地方。結點是兩個分支交叉，尖點是分支折回自身。
        代數幾何的一大目標是理解和分類這些奇異性——這就是「奇異點消解」（resolution of singularities）的主題。
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
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
      cursor: crosshair; touch-action: none;
    }
    .sing-label {
      font-size: 11px; fill: #cc4444; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
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
    .mono-card {
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
    }
    .ic-row {
      display: flex; justify-content: space-between; gap: 8px; margin: 2px 0;
    }
    .ic-label { color: var(--text-muted); }
    .ic-val { color: var(--text); font-weight: 600; }

    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .smooth-badge { background: rgba(90,138,90,0.12); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.3); }
    .sing-badge { background: rgba(204,68,68,0.12); color: #cc4444; border: 1px solid rgba(204,68,68,0.3); }
    .muted-badge { background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border); }

    .desc-box {
      padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); font-size: 12px; color: var(--text-secondary);
      line-height: 1.6;
    }
  `,
})
export class StepSingularPointsComponent {
  readonly curves = CURVES;

  readonly formulaSing = `\\text{奇異點: } \\nabla f(p) = \\left(\\frac{\\partial f}{\\partial x}(p),\\; \\frac{\\partial f}{\\partial y}(p)\\right) = (0, 0)`;

  readonly v: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 520, svgH: 420, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly curveIdx = signal(0);
  readonly probeX = signal(0.5);
  readonly probeY = signal(0.5);
  readonly dragging = signal(false);

  readonly activeCurve = computed(() => CURVES[this.curveIdx()]);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  readonly curvePath = computed(() =>
    implicitCurve(
      this.activeCurve().fn, this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 120,
    ),
  );

  readonly probeInfo = computed(() => {
    const curve = this.activeCurve();
    const px = this.probeX();
    const py = this.probeY();

    // Snap to curve: search nearby for the closest point where |f| is small
    let bestX = px, bestY = py, bestF = Math.abs(curve.fn(px, py));
    const step = 0.05;
    for (let dx = -0.5; dx <= 0.5; dx += step) {
      for (let dy = -0.5; dy <= 0.5; dy += step) {
        const tx = px + dx, ty = py + dy;
        const fv = Math.abs(curve.fn(tx, ty));
        if (fv < bestF) {
          bestF = fv; bestX = tx; bestY = ty;
        }
      }
    }

    // Refine with smaller step
    const cx = bestX, cy = bestY;
    const step2 = 0.01;
    for (let dx = -0.06; dx <= 0.06; dx += step2) {
      for (let dy = -0.06; dy <= 0.06; dy += step2) {
        const tx = cx + dx, ty = cy + dy;
        const fv = Math.abs(curve.fn(tx, ty));
        if (fv < bestF) {
          bestF = fv; bestX = tx; bestY = ty;
        }
      }
    }

    const nearCurve = bestF < 0.15;
    const [dfdx, dfdy] = gradient(curve.fn, bestX, bestY);
    const gradMag = Math.sqrt(dfdx * dfdx + dfdy * dfdy);
    const isSingular = nearCurve && gradMag < SINGULAR_THRESHOLD;

    const probeSx = this.toSvgX(bestX);
    const probeSy = this.toSvgY(bestY);

    // Tangent line: perpendicular to gradient, extend +/- 1.5 units
    const tangentLen = 1.5;
    let tangentX1 = probeSx, tangentY1 = probeSy;
    let tangentX2 = probeSx, tangentY2 = probeSy;
    if (gradMag > 0.05) {
      const tx = -dfdy / gradMag;
      const ty = dfdx / gradMag;
      tangentX1 = this.toSvgX(bestX - tangentLen * tx);
      tangentY1 = this.toSvgY(bestY - tangentLen * ty);
      tangentX2 = this.toSvgX(bestX + tangentLen * tx);
      tangentY2 = this.toSvgY(bestY + tangentLen * ty);
    }

    // Gradient arrow: scale for visibility
    const arrowScale = Math.min(0.8, 1.0 / Math.max(gradMag, 0.01));
    const gradArrowX = this.toSvgX(bestX + dfdx * arrowScale);
    const gradArrowY = this.toSvgY(bestY + dfdy * arrowScale);

    return {
      nearCurve,
      isSingular,
      probeSx,
      probeSy,
      dfdx: dfdx.toFixed(3),
      dfdy: dfdy.toFixed(3),
      gradMag,
      gradMagStr: gradMag.toFixed(3),
      tangentX1,
      tangentY1,
      tangentX2,
      tangentY2,
      gradArrowX,
      gradArrowY,
    };
  });

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const ratioX = (ev.clientX - rect.left) / rect.width;
    const ratioY = (ev.clientY - rect.top) / rect.height;
    const svgX = ratioX * this.v.svgW;
    const svgY = ratioY * this.v.svgH;

    // Convert SVG coords back to math coords
    const mathX = this.v.xRange[0] +
      ((svgX - this.v.pad) / (this.v.svgW - 2 * this.v.pad)) * (this.v.xRange[1] - this.v.xRange[0]);
    const mathY = this.v.yRange[0] +
      ((this.v.svgH - this.v.pad - svgY) / (this.v.svgH - 2 * this.v.pad)) * (this.v.yRange[1] - this.v.yRange[0]);

    this.probeX.set(Math.max(this.v.xRange[0], Math.min(this.v.xRange[1], mathX)));
    this.probeY.set(Math.max(this.v.yRange[0], Math.min(this.v.yRange[1], mathY)));
  }
}
