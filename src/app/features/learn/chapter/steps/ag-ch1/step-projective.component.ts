import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from './ag-util';

/* ── Types ── */

interface InfinityPoint {
  coords: string;   // e.g. "[1:2:0]"
  angle: number;     // angle on the boundary circle (radians)
}

interface ProjPreset {
  label: string;
  affineFns: ((x: number, y: number) => number)[];
  affineTeX: string;
  homoTeX: string;
  infinityPts: InfinityPoint[];
  desc: string;
}

/* ── Disk projection: maps infinite plane into unit disk ── */

function toDiskX(x: number, y: number, R: number): number {
  const r = Math.sqrt(x * x + y * y);
  return x * R / (1 + r);
}

function toDiskY(x: number, y: number, R: number): number {
  const r = Math.sqrt(x * x + y * y);
  return y * R / (1 + r);
}

/* ── Presets ── */

const PRESETS: ProjPreset[] = [
  {
    label: '平行線 \u2192 相交於無窮遠',
    affineFns: [
      (x, y) => y - 2 * x - 1,
      (x, y) => y - 2 * x + 1,
    ],
    affineTeX: 'y = 2x + 1 \\quad\\text{and}\\quad y = 2x - 1',
    homoTeX: 'Y - 2X - Z = 0 \\quad\\text{and}\\quad Y - 2X + Z = 0',
    infinityPts: [
      { coords: '[1:2:0]', angle: Math.atan2(2, 1) },
    ],
    desc: '兩條平行線在仿射空間中不相交，但在射影空間中交於無窮遠點 [1:2:0]。',
  },
  {
    label: '拋物線的補完',
    affineFns: [
      (x, y) => y - x * x,
    ],
    affineTeX: 'y = x^2',
    homoTeX: 'YZ = X^2',
    infinityPts: [
      { coords: '[0:1:0]', angle: Math.PI / 2 },
    ],
    desc: '拋物線的兩端在射影空間中閉合，於無窮遠點 [0:1:0] 相接。',
  },
  {
    label: '雙曲線的補完',
    affineFns: [
      (x, y) => x * x - y * y - 1,
    ],
    affineTeX: 'x^2 - y^2 = 1',
    homoTeX: 'X^2 - Y^2 = Z^2',
    infinityPts: [
      { coords: '[1:1:0]', angle: Math.PI / 4 },
      { coords: '[1:-1:0]', angle: -Math.PI / 4 },
    ],
    desc: '雙曲線的兩個分支通過無窮遠點 [1:1:0] 和 [1:-1:0] 連成一個閉合曲線。',
  },
  {
    label: '三次曲線',
    affineFns: [
      (x, y) => y * y - x * x * x + x,
    ],
    affineTeX: 'y^2 = x^3 - x',
    homoTeX: 'Y^2 Z = X^3 - XZ^2',
    infinityPts: [
      { coords: '[0:1:0]', angle: Math.PI / 2 },
    ],
    desc: '橢圓曲線在射影空間中只多一個無窮遠點 [0:1:0]，完成了閉合。',
  },
];

/* ── Curve colors ── */
const CURVE_COLORS = ['var(--accent)', '#5a7faa'];

@Component({
  selector: 'app-step-projective',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="射影化：加上無窮遠" subtitle="§1.5">
      <p>
        在仿射空間中，平行線永遠不相交。但代數幾何追求的是簡潔：
        <strong>我們希望任何兩條直線都恰好交於一點。</strong>
      </p>
      <p>
        解決方案：加上「無窮遠點」——構成<strong>射影平面</strong>
        <app-math [e]="'\\mathbb{P}^2'" />。
        齊次坐標 [X : Y : Z] 把仿射點 (x, y) 表示為 [x : y : 1]，
        而 Z = 0 的點 [X : Y : 0] 就是「無窮遠點」。
      </p>
      <app-math block [e]="projDef"></app-math>
      <p>
        把多項式<strong>齊次化</strong>：用 x = X/Z, y = Y/Z 代入，再乘 Z<sup>d</sup> 消去分母：
      </p>
      <app-math block [e]="homoFormula"></app-math>
      <p>
        例如直線 y = 2x + 1 變成 Y = 2X + Z。令 Z = 0 得 Y = 2X，
        即無窮遠點 [1 : 2 : 0]。兩條平行線 y = 2x + 1 和 y = 2x + 3
        齊次化後在 Z = 0 處都給出 [1 : 2 : 0]——它們交於無窮遠！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察仿射曲線 vs 射影曲線——無窮遠的點讓一切更完整">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.label; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i"
                  (click)="selIdx.set(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Dual panel -->
      <div class="dual-panel">
        <!-- Left: Affine view -->
        <div class="panel-wrap">
          <div class="panel-title">仿射視圖</div>
          <svg [attr.viewBox]="'0 0 ' + vA.svgW + ' ' + vA.svgH" class="panel-svg">
            <path [attr.d]="affineAxes" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />
            @for (cp of affinePaths(); track $index) {
              <path [attr.d]="cp.path" fill="none"
                    [attr.stroke]="cp.color" stroke-width="2" stroke-linecap="round" />
            }
          </svg>
        </div>

        <!-- Right: Projective (disk) view -->
        <div class="panel-wrap">
          <div class="panel-title">射影視圖（從北極看）</div>
          <svg [attr.viewBox]="'0 0 ' + diskSvgW + ' ' + diskSvgH" class="panel-svg">
            <!-- Boundary circle = "infinity" -->
            <circle [attr.cx]="diskCx" [attr.cy]="diskCy" [attr.r]="diskR"
                    fill="none" stroke="var(--border)" stroke-width="1.5"
                    stroke-dasharray="4 2" />

            <!-- Compressed axes inside the disk -->
            <line [attr.x1]="diskCx - diskR + 4" [attr.y1]="diskCy"
                  [attr.x2]="diskCx + diskR - 4" [attr.y2]="diskCy"
                  stroke="var(--text-muted)" stroke-width="0.5" stroke-opacity="0.5" />
            <line [attr.x1]="diskCx" [attr.y1]="diskCy - diskR + 4"
                  [attr.x2]="diskCx" [attr.y2]="diskCy + diskR - 4"
                  stroke="var(--text-muted)" stroke-width="0.5" stroke-opacity="0.5" />

            <!-- Curves projected into disk -->
            @for (dp of diskPaths(); track $index) {
              <path [attr.d]="dp.path" fill="none"
                    [attr.stroke]="dp.color" stroke-width="1.8" stroke-linecap="round" />
            }

            <!-- Points at infinity on boundary -->
            @for (pt of curPreset().infinityPts; track pt.coords) {
              <circle [attr.cx]="diskCx + diskR * Math.cos(pt.angle)"
                      [attr.cy]="diskCy - diskR * Math.sin(pt.angle)"
                      r="5" fill="var(--accent)" stroke="var(--bg)" stroke-width="2" />
              <text [attr.x]="diskCx + (diskR + 14) * Math.cos(pt.angle)"
                    [attr.y]="diskCy - (diskR + 14) * Math.sin(pt.angle)"
                    class="inf-label" dominant-baseline="middle" text-anchor="middle">
                {{ pt.coords }}
              </text>
            }

            <!-- Label -->
            <text [attr.x]="diskCx" [attr.y]="diskCy + diskR + 22"
                  class="disk-label" text-anchor="middle">
              邊界 = 無窮遠
            </text>
          </svg>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">仿射方程</div>
          <div class="ic-body"><app-math [e]="curPreset().affineTeX"></app-math></div>
        </div>
        <div class="info-card">
          <div class="ic-title">齊次方程</div>
          <div class="ic-body"><app-math [e]="curPreset().homoTeX"></app-math></div>
        </div>
        <div class="info-card accent-card">
          <div class="ic-title">無窮遠點</div>
          <div class="ic-body mono">
            @for (pt of curPreset().infinityPts; track pt.coords) {
              <span class="inf-coord">{{ pt.coords }}</span>
            }
          </div>
        </div>
      </div>

      <div class="desc-box">{{ curPreset().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        射影空間讓代數幾何的定理更簡潔。在仿射空間中，兩條直線交 0 或 1 個點。
        在射影空間中，B&eacute;zout 定理保證 d 次和 e 次的兩條曲線精確地交
        <app-math [e]="'d \\cdot e'" /> 個點（計算重數和無窮遠）。這種統一性是射影幾何的魅力。
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;
    }
    .pre-btn {
      padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }

    .dual-panel {
      display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;
    }
    .panel-wrap {
      flex: 1; min-width: 230px;
    }
    .panel-title {
      font-size: 11px; font-weight: 700; color: var(--text-muted);
      text-align: center; margin-bottom: 4px; letter-spacing: 0.04em;
    }
    .panel-svg {
      width: 100%; display: block;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .inf-label {
      font-size: 8px; fill: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .disk-label {
      font-size: 8px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .info-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 130px; padding: 10px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
    }
    .accent-card {
      background: var(--accent-10); border-color: var(--accent);
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 12px; color: var(--text); margin-top: 4px;
    }
    .ic-body.mono {
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
    }
    .inf-coord {
      display: inline-block; padding: 2px 8px; margin: 2px;
      background: var(--accent-18); border-radius: 4px;
      font-size: 12px; font-weight: 700; color: var(--accent);
    }

    .desc-box {
      padding: 8px 12px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); font-size: 11px; color: var(--text-secondary);
      text-align: center;
    }
  `,
})
export class StepProjectiveComponent {
  readonly Math = Math;
  readonly presets = PRESETS;

  readonly projDef = `\\mathbb{P}^2 = \\{[X:Y:Z] \\neq [0:0:0]\\} \\;/\\; {\\sim}`;
  readonly homoFormula = `f(x,y) \\;\\longrightarrow\\; F(X,Y,Z) = Z^d \\cdot f\\!\\left(\\frac{X}{Z},\\, \\frac{Y}{Z}\\right)`;

  /* ── Affine panel view ── */
  readonly vA: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 250, svgH: 250, pad: 20 };
  readonly affineAxes = plotAxesPath(this.vA);

  /* ── Disk panel geometry ── */
  readonly diskSvgW = 250;
  readonly diskSvgH = 250;
  readonly diskCx = 125;
  readonly diskCy = 118;
  readonly diskR = 90;

  readonly selIdx = signal(0);
  readonly curPreset = computed(() => PRESETS[this.selIdx()]);

  /* ── Affine curve paths ── */
  readonly affinePaths = computed(() => {
    const preset = this.curPreset();
    return preset.affineFns.map((fn, i) => ({
      path: implicitCurve(
        fn,
        this.vA.xRange, this.vA.yRange,
        (x) => plotToSvgX(this.vA, x),
        (y) => plotToSvgY(this.vA, y),
        100,
      ),
      color: CURVE_COLORS[i % CURVE_COLORS.length],
    }));
  });

  /* ── Disk (projective) curve paths ── */
  readonly diskPaths = computed(() => {
    const preset = this.curPreset();
    const cx = this.diskCx;
    const cy = this.diskCy;
    const R = this.diskR;

    // We sample the implicit curve on a large affine grid, then map
    // each marching-squares segment through the disk projection.
    const largeRange: [number, number] = [-10, 10];
    const resolution = 160;

    return preset.affineFns.map((fn, fi) => {
      // Gather marching-squares line segments in affine coords, then project
      const segments = this.marchingSquaresSegments(fn, largeRange, largeRange, resolution);
      let d = '';
      for (const seg of segments) {
        const [x1, y1, x2, y2] = seg;
        const dx1 = toDiskX(x1, y1, R);
        const dy1 = -toDiskY(x1, y1, R); // flip y for SVG
        const dx2 = toDiskX(x2, y2, R);
        const dy2 = -toDiskY(x2, y2, R);
        d += `M${(cx + dx1).toFixed(1)},${(cy + dy1).toFixed(1)}` +
             `L${(cx + dx2).toFixed(1)},${(cy + dy2).toFixed(1)}`;
      }
      return {
        path: d,
        color: CURVE_COLORS[fi % CURVE_COLORS.length],
      };
    });
  });

  /**
   * Run marching squares and return raw line segments as [x1,y1,x2,y2] arrays
   * in math coordinates (not SVG).
   */
  private marchingSquaresSegments(
    f: (x: number, y: number) => number,
    xRange: [number, number],
    yRange: [number, number],
    resolution: number,
  ): number[][] {
    const [x0, x1] = xRange;
    const [y0, y1] = yRange;
    const dx = (x1 - x0) / resolution;
    const dy = (y1 - y0) / resolution;

    // Sample grid
    const grid: number[][] = [];
    for (let i = 0; i <= resolution; i++) {
      grid[i] = [];
      for (let j = 0; j <= resolution; j++) {
        const val = f(x0 + i * dx, y0 + j * dy);
        grid[i][j] = isFinite(val) ? val : 1e6;
      }
    }

    const segments: number[][] = [];

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const v00 = grid[i][j];
        const v10 = grid[i + 1][j];
        const v11 = grid[i + 1][j + 1];
        const v01 = grid[i][j + 1];

        const cx = x0 + i * dx;
        const cy = y0 + j * dy;

        const crossings: [number, number][] = [];

        if (v00 * v10 < 0) {
          const t = v00 / (v00 - v10);
          crossings.push([cx + t * dx, cy]);
        }
        if (v10 * v11 < 0) {
          const t = v10 / (v10 - v11);
          crossings.push([cx + dx, cy + t * dy]);
        }
        if (v11 * v01 < 0) {
          const t = v11 / (v11 - v01);
          crossings.push([cx + dx - t * dx, cy + dy]);
        }
        if (v01 * v00 < 0) {
          const t = v01 / (v01 - v00);
          crossings.push([cx, cy + dy - t * dy]);
        }

        if (crossings.length >= 2) {
          segments.push([crossings[0][0], crossings[0][1], crossings[1][0], crossings[1][1]]);
        }
        if (crossings.length >= 4) {
          segments.push([crossings[2][0], crossings[2][1], crossings[3][0], crossings[3][1]]);
        }
      }
    }

    return segments;
  }
}
