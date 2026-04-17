import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, PlaneView, toSvg, axesPath,
} from '../complex-ch1/complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 2.5, svgW: 520, svgH: 420, pad: 30 };

interface HarmonicPreset {
  label: string;
  tex: string;
  u: (x: number, y: number) => number;
  v: (x: number, y: number) => number;
}

const PRESETS: HarmonicPreset[] = [
  {
    label: 'z\u00B2 (u=x\u00B2\u2212y\u00B2, v=2xy)',
    tex: 'f(z) = z^2',
    u: (x, y) => x * x - y * y,
    v: (x, y) => 2 * x * y,
  },
  {
    label: 'e\u1DBB (u=e\u02E3cosy, v=e\u02E3siny)',
    tex: 'f(z) = e^z',
    u: (x, y) => Math.exp(x) * Math.cos(y),
    v: (x, y) => Math.exp(x) * Math.sin(y),
  },
  {
    label: 'log z',
    tex: 'f(z) = \\log z',
    u: (x, y) => 0.5 * Math.log(x * x + y * y),
    v: (x, y) => Math.atan2(y, x),
  },
];

const CONTOUR_LEVELS = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

@Component({
  selector: 'app-step-harmonic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="\u8ABF\u548C\u51FD\u6578" subtitle="&sect;2.4">
      <p>
        \u82E5 f = u + iv \u662F\u89E3\u6790\u51FD\u6578\uFF0C\u5247 u \u548C v \u90FD\u6EFF\u8DB3 Laplace \u65B9\u7A0B\uFF1A
      </p>
      <app-math block [e]="laplaceFormula" />
      <p>
        \u5B83\u5011\u662F<strong>\u8ABF\u548C\u51FD\u6578</strong>\u3002\u66F4\u6709\u8DA3\u7684\u662F\uFF0Cu \u548C v \u7684\u7B49\u9AD8\u7DDA\u6C38\u9060\u6B63\u4EA4\uFF08\u4EE5\u76F4\u89D2\u76F8\u4EA4\uFF09\u3002
        u \u548C v \u4E92\u70BA<strong>\u8ABF\u548C\u5171\u8EDB</strong>\u3002
      </p>
      <app-math block [e]="conjugateFormula" />
    </app-prose-block>

    <app-challenge-card prompt="\u89C0\u5BDF\u89E3\u6790\u51FD\u6578\u7684\u7B49\u9AD8\u7DDA\uFF1Au \u548C v \u7684\u7B49\u9AD8\u7DDA\u6C38\u9060\u6B63\u4EA4">
      <div class="preset-row">
        @for (p of presets; track p.label) {
          <button class="preset-btn"
                  [class.active]="activeIdx() === $index"
                  (click)="activeIdx.set($index)">
            {{ p.label }}
          </button>
        }
      </div>

      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH"
           class="plane-svg">
        <!-- Axes -->
        <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="1" fill="none" />

        <!-- Axis labels -->
        <text [attr.x]="view.svgW - view.pad + 8" [attr.y]="originSvg[1] + 4"
              class="axis-lbl">x</text>
        <text [attr.x]="originSvg[0] + 8" [attr.y]="view.pad - 8"
              class="axis-lbl">y</text>

        <!-- Tick labels -->
        @for (t of tickLabels; track t.key) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- u contour lines (accent) -->
        @for (p of uPaths(); track $index) {
          <path [attr.d]="p" fill="none" stroke="var(--accent)" stroke-width="1.2"
                stroke-opacity="0.5" stroke-linecap="round" />
        }

        <!-- v contour lines (green) -->
        @for (p of vPaths(); track $index) {
          <path [attr.d]="p" fill="none" stroke="#5a8a5a" stroke-width="1.2"
                stroke-opacity="0.5" stroke-linecap="round" />
        }
      </svg>

      <div class="legend-row">
        <span class="legend-item">
          <span class="legend-line accent-line"></span> u = c \u7B49\u9AD8\u7DDA
        </span>
        <span class="legend-item">
          <span class="legend-line green-line"></span> v = c \u7B49\u9AD8\u7DDA
        </span>
      </div>

      <div class="func-info">
        <div class="fi-formula">
          <app-math [e]="activePreset().tex" />
        </div>
        <div class="fi-desc">
          &Delta;u = 0, &Delta;v = 0 &mdash; \u5169\u8005\u90FD\u662F\u8ABF\u548C\u51FD\u6578\uFF0C\u7B49\u9AD8\u7DDA\u4E92\u76F8\u6B63\u4EA4
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8ABF\u548C\u51FD\u6578\u5728\u7269\u7406\u4E2D\u7121\u8655\u4E0D\u5728\uFF1A\u96FB\u4F4D\u3001\u6EAB\u5EA6\u5206\u5E03\u3001\u6D41\u9AD4\u901F\u5EA6\u52E2\u3002
        \u89E3\u6790\u51FD\u6578\u628A\u5169\u500B\u8ABF\u548C\u51FD\u6578\u6253\u5305\u6210\u4E00\u500B\u2014\u2014\u9019\u5C31\u662F\u8907\u5206\u6790\u7684\u5A01\u529B\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .preset-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; } }

    .plane-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 12px; }

    .axis-lbl { font-size: 11px; fill: var(--text-muted); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }
    .tick-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }

    .legend-row { display: flex; gap: 16px; margin-bottom: 10px; justify-content: center;
      flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px;
      color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .legend-line { display: inline-block; width: 24px; height: 2px; border-radius: 1px; }
    .accent-line { background: var(--accent); }
    .green-line { background: #5a8a5a; }

    .func-info { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .fi-formula { margin-bottom: 6px; }
    .fi-desc { font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepHarmonicComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;

  readonly laplaceFormula = String.raw`\Delta u = \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} = 0`;
  readonly conjugateFormula = String.raw`\text{u \u548C v \u4E92\u70BA\u8ABF\u548C\u5171\u8EDB\uFF1A} \quad \frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}, \quad \frac{\partial u}{\partial y} = -\frac{\partial v}{\partial x}`;

  readonly activeIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);

  /* Pre-compute tick labels */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (let k = -2; k <= 2; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}` });
    }
    return labels;
  })();

  /**
   * Marching-squares contour extraction.
   * For each contour level c, scan every grid cell.
   * If the function value crosses c between adjacent corners,
   * interpolate crossing points on cell edges and connect them.
   */
  private contourPaths(func: (x: number, y: number) => number, levels: number[]): string[] {
    const v = this.view;
    const n = 60;
    const lo = -v.radius;
    const hi = v.radius;
    const dx = (hi - lo) / n;

    // Sample the function on the grid
    const grid: number[][] = [];
    for (let i = 0; i <= n; i++) {
      grid[i] = [];
      for (let j = 0; j <= n; j++) {
        const x = lo + i * dx;
        const y = lo + j * dx;
        const val = func(x, y);
        grid[i][j] = isFinite(val) ? val : NaN;
      }
    }

    return levels.map(c => {
      let d = '';
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const v0 = grid[i][j];
          const v1 = grid[i + 1][j];
          const v2 = grid[i + 1][j + 1];
          const v3 = grid[i][j + 1];

          // Skip cells with NaN
          if (isNaN(v0) || isNaN(v1) || isNaN(v2) || isNaN(v3)) continue;

          const x0 = lo + i * dx;
          const y0 = lo + j * dx;

          // Find edge crossings
          const edges: C[] = [];

          // Bottom edge: (i,j) -> (i+1,j)
          if ((v0 - c) * (v1 - c) < 0) {
            const t = (c - v0) / (v1 - v0);
            edges.push([x0 + t * dx, y0]);
          }
          // Right edge: (i+1,j) -> (i+1,j+1)
          if ((v1 - c) * (v2 - c) < 0) {
            const t = (c - v1) / (v2 - v1);
            edges.push([x0 + dx, y0 + t * dx]);
          }
          // Top edge: (i+1,j+1) -> (i,j+1)
          if ((v2 - c) * (v3 - c) < 0) {
            const t = (c - v2) / (v3 - v2);
            edges.push([x0 + dx - t * dx, y0 + dx]);
          }
          // Left edge: (i,j+1) -> (i,j)
          if ((v3 - c) * (v0 - c) < 0) {
            const t = (c - v3) / (v0 - v3);
            edges.push([x0, y0 + dx - t * dx]);
          }

          // Connect pairs of crossings with line segments
          if (edges.length >= 2) {
            const [s1x, s1y] = toSvg(v, edges[0]);
            const [s2x, s2y] = toSvg(v, edges[1]);
            d += `M${s1x.toFixed(1)},${s1y.toFixed(1)}L${s2x.toFixed(1)},${s2y.toFixed(1)}`;
          }
          // Saddle case: 4 crossings => two line segments
          if (edges.length === 4) {
            const [s3x, s3y] = toSvg(v, edges[2]);
            const [s4x, s4y] = toSvg(v, edges[3]);
            d += `M${s3x.toFixed(1)},${s3y.toFixed(1)}L${s4x.toFixed(1)},${s4y.toFixed(1)}`;
          }
        }
      }
      return d;
    });
  }

  private readonly allContours = computed(() => {
    const preset = this.activePreset();
    const uPaths = this.contourPaths(preset.u, CONTOUR_LEVELS);
    const vPaths = this.contourPaths(preset.v, CONTOUR_LEVELS);
    return { uPaths, vPaths };
  });

  readonly uPaths = computed(() => this.allContours().uPaths.filter(p => p.length > 0));
  readonly vPaths = computed(() => this.allContours().vPaths.filter(p => p.length > 0));
}
