import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAbs, cExp, cSin, cCos, cLog, PlaneView, toSvg, axesPath,
} from '../complex-ch1/complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 3, svgW: 520, svgH: 420, pad: 30 };

interface FuncPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
  note: string;
  minAbs: number;
}

const PRESETS: FuncPreset[] = [
  {
    label: 'e^z',
    tex: 'f(z) = e^z',
    fn: (z: C) => cExp(z),
    note: 'e^z 是週期函數：e^(z+2\u03C0i) = e^z。水平線映射為射線，垂直線映射為同心圓。',
    minAbs: 0,
  },
  {
    label: 'sin z',
    tex: 'f(z) = \\sin z',
    fn: (z: C) => cSin(z),
    note: 'sin z \u5728\u8907\u6578\u5E73\u9762\u4E0A\u7121\u754C\uFF01\u6CBF\u865B\u8EF8\u6307\u6578\u589E\u9577\u3002',
    minAbs: 0,
  },
  {
    label: 'cos z',
    tex: 'f(z) = \\cos z',
    fn: (z: C) => cCos(z),
    note: 'cos z \u540C\u6A23\u7121\u754C\uFF0C\u662F sin z \u7684\u5E73\u79FB\u3002',
    minAbs: 0,
  },
  {
    label: 'log z',
    tex: 'f(z) = \\log z',
    fn: (z: C) => cLog(z),
    note: 'log z \u6709\u5206\u652F\u9EDE z=0\u3002\u4E3B\u503C\u5206\u652F\u6CBF\u8CA0\u5BE6\u8EF8\u6709\u4E0D\u9023\u7E8C\uFF08branch cut\uFF09\u3002',
    minAbs: 0.05,
  },
];

@Component({
  selector: 'app-step-analytic-examples',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="\u57FA\u672C\u89E3\u6790\u51FD\u6578" subtitle="&sect;2.3">
      <p>
        \u6700\u91CD\u8981\u7684\u89E3\u6790\u51FD\u6578\uFF1A\u6307\u6578\u51FD\u6578 e<sup>z</sup>\u3001\u4E09\u89D2\u51FD\u6578 sin z / cos z\u3001
        \u4EE5\u53CA\u5C0D\u6578 log z\u3002\u5B83\u5011\u5728\u8907\u6578\u5E73\u9762\u4E0A\u7684\u884C\u70BA\u8207\u5BE6\u6578\u7DDA\u4E0A\u622A\u7136\u4E0D\u540C\u3002
      </p>
      <p>\u5E7E\u500B\u4EE4\u4EBA\u9A5A\u8A1D\u7684\u4E8B\u5BE6\uFF1A</p>
      <ul>
        <li>
          <app-math [e]="factPeriodic" /> \u2014\u2014 e<sup>z</sup> \u662F\u9031\u671F\u51FD\u6578
        </li>
        <li>sin z \u548C cos z \u5728\u8907\u6578\u5E73\u9762\u4E0A<strong>\u7121\u754C</strong>\uFF08\u8207\u5BE6\u6578\u60C5\u6CC1\u5B8C\u5168\u4E0D\u540C\uFF01\uFF09</li>
        <li>log z \u662F<strong>\u591A\u503C</strong>\u51FD\u6578\uFF0C\u9700\u8981\u5207\u5272\u7DDA\uFF08branch cut\uFF09</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u64C7\u51FD\u6578\uFF0C\u89C0\u5BDF\u5B83\u5982\u4F55\u6620\u5C04\u7279\u5B9A\u66F2\u7DDA\uFF08\u5713\u548C\u76F4\u7DDA\uFF09">
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
              class="axis-lbl">Re</text>
        <text [attr.x]="originSvg[0] + 8" [attr.y]="view.pad - 8"
              class="axis-lbl">Im</text>

        <!-- Tick labels -->
        @for (t of tickLabels; track t.key) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- Original horizontal lines (dashed gray) -->
        @for (p of origHPaths; track $index) {
          <path [attr.d]="p" fill="none" stroke="var(--text-muted)" stroke-width="0.7"
                stroke-dasharray="4 3" stroke-opacity="0.4" />
        }

        <!-- Original vertical lines (dashed gray) -->
        @for (p of origVPaths; track $index) {
          <path [attr.d]="p" fill="none" stroke="var(--text-muted)" stroke-width="0.7"
                stroke-dasharray="4 3" stroke-opacity="0.4" />
        }

        <!-- Transformed horizontal lines (accent) -->
        @for (p of hPaths(); track $index) {
          <path [attr.d]="p" fill="none" stroke="var(--accent)" stroke-width="1.4"
                stroke-opacity="0.7" stroke-linecap="round" />
        }

        <!-- Transformed vertical lines (green) -->
        @for (p of vPaths(); track $index) {
          <path [attr.d]="p" fill="none" stroke="#5a8a5a" stroke-width="1.4"
                stroke-opacity="0.7" stroke-linecap="round" />
        }
      </svg>

      <div class="legend-row">
        <span class="legend-item">
          <span class="legend-line accent-line"></span> \u6C34\u5E73\u7DDA\u7684\u50CF
        </span>
        <span class="legend-item">
          <span class="legend-line green-line"></span> \u5782\u76F4\u7DDA\u7684\u50CF
        </span>
        <span class="legend-item">
          <span class="legend-line dashed-line"></span> \u539F\u59CB\u66F2\u7DDA
        </span>
      </div>

      <div class="func-info">
        <div class="fi-formula">
          <app-math [e]="activePreset().tex" />
        </div>
        <div class="fi-desc">{{ activePreset().note }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u4E9B\u51FD\u6578\u5728\u5BE6\u6578\u7DDA\u4E0A\u300C\u6EAB\u99B4\u300D\uFF0C\u5230\u4E86\u8907\u6578\u5E73\u9762\u537B\u5C55\u73FE\u622A\u7136\u4E0D\u540C\u7684\u9762\u8C8C\u3002
        \u89E3\u6790\u51FD\u6578\u7684\u6027\u8CEA\u2014\u2014\u5982\u7121\u7AAE\u6B21\u53EF\u5FAE\u2014\u2014\u8B93\u5B83\u5011\u7684\u884C\u70BA\u6975\u70BA\u8C50\u5BCC\u3002
        \u4E0B\u4E00\u7BC0\u770B\u89E3\u6790\u51FD\u6578\u7684\u300C\u642D\u6A94\u300D\uFF1A\u8ABF\u548C\u51FD\u6578\u3002
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
    .dashed-line { background: var(--text-muted); opacity: 0.5;
      background-image: repeating-linear-gradient(
        90deg, var(--text-muted) 0px, var(--text-muted) 4px, transparent 4px, transparent 7px
      ); background-color: transparent; height: 1px; }

    .func-info { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .fi-formula { margin-bottom: 6px; }
    .fi-desc { font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepAnalyticExamplesComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;

  readonly factPeriodic = String.raw`e^{z + 2\pi i} = e^z`;

  readonly activeIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);

  /* Pre-compute tick labels */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  /* Pre-compute original (untransformed) grid lines as SVG paths */
  readonly origHPaths: string[] = (() => {
    const paths: string[] = [];
    const yVals = [-1, 0, 1];
    for (const y of yVals) {
      const [sx1, sy1] = toSvg(VIEW, [-2, y]);
      const [sx2, sy2] = toSvg(VIEW, [2, y]);
      paths.push(`M${sx1.toFixed(1)},${sy1.toFixed(1)}L${sx2.toFixed(1)},${sy2.toFixed(1)}`);
    }
    return paths;
  })();

  readonly origVPaths: string[] = (() => {
    const paths: string[] = [];
    const xVals = [-1, 0, 1];
    for (const x of xVals) {
      const [sx1, sy1] = toSvg(VIEW, [x, -2]);
      const [sx2, sy2] = toSvg(VIEW, [x, 2]);
      paths.push(`M${sx1.toFixed(1)},${sy1.toFixed(1)}L${sx2.toFixed(1)},${sy2.toFixed(1)}`);
    }
    return paths;
  })();

  /**
   * Build SVG path for a transformed curve, sampling at ~100 points.
   * Breaks the path when the output goes out of bounds or is not finite.
   */
  private buildCurvePath(
    paramFn: (t: number) => C,
    f: (z: C) => C,
    tMin: number,
    tMax: number,
    minAbsInput: number,
    nSamples = 100,
  ): string {
    const dt = (tMax - tMin) / nSamples;
    let d = '';
    let penDown = false;

    for (let i = 0; i <= nSamples; i++) {
      const t = tMin + i * dt;
      const z = paramFn(t);
      if (cAbs(z) < minAbsInput) {
        penDown = false;
        continue;
      }
      const w = f(z);
      if (!isFinite(w[0]) || !isFinite(w[1]) || cAbs(w) > 10) {
        penDown = false;
        continue;
      }
      const [sx, sy] = toSvg(VIEW, w);
      if (!penDown) {
        d += `M${sx.toFixed(1)},${sy.toFixed(1)}`;
        penDown = true;
      } else {
        d += `L${sx.toFixed(1)},${sy.toFixed(1)}`;
      }
    }
    return d;
  }

  private readonly allPaths = computed(() => {
    const preset = this.activePreset();
    const f = preset.fn;
    const minAbs = preset.minAbs;

    const hPaths: string[] = [];
    const vPaths: string[] = [];

    // 3 horizontal lines at y = -1, 0, 1 (x from -2 to 2)
    for (const y of [-1, 0, 1]) {
      const path = this.buildCurvePath(
        (t: number): C => [t, y],
        f, -2, 2, minAbs,
      );
      if (path) hPaths.push(path);
    }

    // 3 vertical lines at x = -1, 0, 1 (y from -2 to 2)
    for (const x of [-1, 0, 1]) {
      const path = this.buildCurvePath(
        (t: number): C => [x, t],
        f, -2, 2, minAbs,
      );
      if (path) vPaths.push(path);
    }

    return { hPaths, vPaths };
  });

  readonly hPaths = computed(() => this.allPaths().hPaths);
  readonly vPaths = computed(() => this.allPaths().vPaths);
}
