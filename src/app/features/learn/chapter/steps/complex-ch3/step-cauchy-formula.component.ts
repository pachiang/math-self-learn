import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAdd, cSub, cMul, cDiv, cExp, cSin, cAbs,
  cFromPolar, cScale, fmtC,
  PlaneView, toSvg, fromSvg, axesPath,
} from '../complex-ch1/complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 2.5, svgW: 520, svgH: 420, pad: 30 };

const TWO_PI = 2 * Math.PI;

interface FuncPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
}

const PRESETS: FuncPreset[] = [
  {
    label: 'z\u00B2+1',
    tex: 'f(z) = z^2 + 1',
    fn: (z: C): C => cAdd(cMul(z, z), [1, 0]),
  },
  {
    label: 'e^z',
    tex: 'f(z) = e^z',
    fn: (z: C): C => cExp(z),
  },
  {
    label: 'sin z',
    tex: 'f(z) = \\sin z',
    fn: (z: C): C => cSin(z),
  },
];

/**
 * Numerically compute the Cauchy integral (1/2\u03C0i)\u222E f(z)/(z-z\u2080) dz
 * over the unit circle using N sample points.
 * \u03B3(t) = e^{2\u03C0it}, t in [0,1]
 * Integral = \u2211 f(\u03B3(t_k)) / (\u03B3(t_k) - z0) * \u03B3'(t_k) * dt
 * where \u03B3'(t) = 2\u03C0i * e^{2\u03C0it}
 * Divide by 2\u03C0i at the end.
 */
function cauchyIntegral(f: (z: C) => C, z0: C, N: number): C {
  const dt = 1 / N;
  let sumRe = 0;
  let sumIm = 0;

  for (let k = 0; k < N; k++) {
    const t = (k + 0.5) * dt;
    const theta = TWO_PI * t;
    const gamma: C = [Math.cos(theta), Math.sin(theta)];
    // \u03B3'(t) = 2\u03C0i * e^{2\u03C0it} = 2\u03C0i * \u03B3
    // = 2\u03C0 * [-sin\u03B8, cos\u03B8]... or just cMul([0, 2\u03C0], \u03B3)
    const gammaPrime: C = [-TWO_PI * Math.sin(theta), TWO_PI * Math.cos(theta)];

    const fVal = f(gamma);
    const denom = cSub(gamma, z0);
    const integrand = cMul(cDiv(fVal, denom), gammaPrime);

    sumRe += integrand[0] * dt;
    sumIm += integrand[1] * dt;
  }

  // Divide by 2\u03C0i:  [sumRe, sumIm] / [0, 2\u03C0] = cDiv([sumRe, sumIm], [0, 2\u03C0])
  return cDiv([sumRe, sumIm], [0, TWO_PI]);
}

@Component({
  selector: 'app-step-cauchy-formula',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Cauchy \u7A4D\u5206\u516C\u5F0F" subtitle="&sect;3.3">
      <p>
        Cauchy \u7A4D\u5206\u516C\u5F0F\uFF1A\u82E5 f \u5728\u7C21\u55AE\u9589\u8DEF\u5F91 \u03B3 \u4E0A\u53CA\u5167\u90E8\u89E3\u6790\uFF0C
        \u4E14 z\u2080 \u5728 \u03B3 \u5167\u90E8\uFF0C\u5247\uFF1A
      </p>
      <app-math block [e]="formulaMain" />
      <p>
        f \u5728\u4EFB\u610F\u5167\u90E8\u9EDE\u7684\u503C\u5B8C\u5168\u7531\u908A\u754C\u4E0A\u7684\u503C\u6C7A\u5B9A\uFF01\u9019\u662F\u975E\u5E38\u9A5A\u4EBA\u7684
        \u2014\u2014 \u5728\u5BE6\u8B8A\u6578\u4E2D\u6C92\u6709\u985E\u4F3C\u7684\u7D50\u679C\u3002
      </p>
      <p>\u5C0E\u6578\u516C\u5F0F\u540C\u6A23\u6210\u7ACB\uFF1A</p>
      <app-math block [e]="formulaDeriv" />
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u52D5 z\u2080\uFF0C\u89C0\u5BDF Cauchy \u516C\u5F0F\u5982\u4F55\u5F9E\u908A\u754C\u503C\u6062\u5FA9 f(z\u2080)">
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
           class="plane-svg"
           (mousedown)="startDrag($event)"
           (mousemove)="onDrag($event)"
           (mouseup)="dragging.set(false)"
           (mouseleave)="dragging.set(false)">

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

        <!-- Unit circle contour \u03B3 (filled disk, transparent) -->
        <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]"
                [attr.r]="unitRadiusPx"
                fill="var(--accent-10)" stroke="none" />

        <!-- Unit circle border -->
        <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]"
                [attr.r]="unitRadiusPx"
                fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Counterclockwise arrow on contour -->
        <path [attr.d]="arrowOnCircle" fill="var(--accent)" />

        <!-- \u03B3 label -->
        <text [attr.x]="gammaLabelPos[0]" [attr.y]="gammaLabelPos[1]"
              class="gamma-label">\u03B3</text>

        <!-- Line from z\u2080 to nearest boundary point (when inside) -->
        @if (isInside()) {
          <line [attr.x1]="z0Svg()[0]" [attr.y1]="z0Svg()[1]"
                [attr.x2]="boundaryPointSvg()[0]" [attr.y2]="boundaryPointSvg()[1]"
                stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 3"
                stroke-opacity="0.6" />
        }

        <!-- Draggable z\u2080 point -->
        <circle [attr.cx]="z0Svg()[0]" [attr.cy]="z0Svg()[1]" r="8"
                [attr.fill]="isInside() ? '#c06060' : '#888'"
                stroke="white" stroke-width="2" class="drag-pt" />
        <text [attr.x]="z0Svg()[0] + 12" [attr.y]="z0Svg()[1] - 10"
              class="pt-label">z\u2080</text>
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="info-label">|z\u2080|</div>
          <div class="info-val">{{ z0Abs().toFixed(3) }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">f(z\u2080) \u76F4\u63A5\u8A08\u7B97</div>
          <div class="info-val">{{ directValueStr() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Cauchy \u516C\u5F0F</div>
          <div class="info-val">{{ cauchyValueStr() }}</div>
        </div>
      </div>

      <!-- Match badge -->
      <div class="match-badge" [class.ok]="isInside()" [class.outside]="!isInside()">
        @if (isInside()) {
          <span>\u5403\u5408 \u2014 \u908A\u754C\u7A4D\u5206\u6062\u5FA9\u4E86\u5167\u90E8\u503C</span>
        } @else {
          <span>z\u2080 \u5728\u8DEF\u5F91\u5916 \u2192 \u516C\u5F0F\u4E0D\u9069\u7528</span>
        }
      </div>

      <div class="func-info">
        <app-math [e]="activeTex()" />
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u908A\u754C\u6C7A\u5B9A\u5167\u90E8\u2014\u2014\u9019\u662F\u8907\u5206\u6790\u6700\u6838\u5FC3\u7684\u601D\u60F3\u3002
        \u4E00\u500B\u89E3\u6790\u51FD\u6578\u5982\u679C\u5728\u908A\u754C\u4E0A\u5DF2\u77E5\uFF0C\u5167\u90E8\u7684\u503C\u5C31\u88AB\u5B8C\u5168\u9396\u5B9A\u3002
        \u4E0B\u4E00\u7BC0\u770B\u9019\u500B\u601D\u60F3\u7684\u63A8\u8AD6\u3002
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
      border-radius: 10px; background: var(--bg); margin-bottom: 12px;
      cursor: crosshair; user-select: none; }
    .drag-pt { cursor: grab; }
    .axis-lbl { font-size: 11px; fill: var(--text-muted); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }
    .tick-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .pt-label { font-size: 13px; fill: #c06060; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .gamma-label { font-size: 14px; fill: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .info-row { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .info-card { flex: 1; min-width: 120px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
      font-family: 'JetBrains Mono', monospace; }
    .info-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .info-val { font-size: 14px; font-weight: 600; color: var(--text); }

    .match-badge { display: inline-block; padding: 6px 16px; border-radius: 6px;
      font-size: 13px; font-weight: 700; margin-bottom: 12px;
      font-family: 'JetBrains Mono', monospace;
      &.ok { background: rgba(90, 138, 90, 0.12); color: #3a7a3a;
        border: 1px solid rgba(90, 138, 90, 0.3); }
      &.outside { background: rgba(192, 80, 80, 0.10); color: #c05050;
        border: 1px solid rgba(192, 80, 80, 0.25); } }

    .func-info { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
  `,
})
export class StepCauchyFormulaComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;

  readonly formulaMain = String.raw`f(z_0) = \frac{1}{2\pi i}\oint_\gamma \frac{f(z)}{z - z_0}\,dz`;
  readonly formulaDeriv = String.raw`f'(z_0) = \frac{1}{2\pi i}\oint_\gamma \frac{f(z)}{(z - z_0)^2}\,dz`;

  readonly activeIdx = signal(0);
  readonly z0 = signal<C>([0.3, 0.4]);
  readonly dragging = signal(false);

  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);
  readonly activeTex = computed(() => this.activePreset().tex);

  /** Pixel radius of the unit circle on SVG */
  readonly unitRadiusPx = (() => {
    const [ox] = toSvg(VIEW, [0, 0]);
    const [rx] = toSvg(VIEW, [1, 0]);
    return rx - ox;
  })();

  /** Small arrowhead on the circle to indicate CCW direction */
  readonly arrowOnCircle = (() => {
    // Place arrow at top of circle (angle = \u03C0/2)
    const angle = Math.PI / 2;
    const [cx, cy] = this.originSvg;
    const r = this.unitRadiusPx;
    const px = cx + r * Math.cos(angle);
    const py = cy - r * Math.sin(angle);
    // CCW tangent direction at this point: perpendicular, pointing left
    const tx = -Math.sin(angle);
    const ty = -Math.cos(angle);
    const s = 8;
    const nx = -ty;
    const ny = tx;
    return `M${px + tx * s},${py + ty * s} L${px - nx * 3},${py - ny * 3} L${px - tx * s},${py + ty * s} Z`;
  })();

  /** Label position for \u03B3 */
  readonly gammaLabelPos = (() => {
    const angle = Math.PI / 4;
    const [cx, cy] = this.originSvg;
    const r = this.unitRadiusPx + 14;
    return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)] as [number, number];
  })();

  /* Pre-compute tick labels */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (let k = -2; k <= 2; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  readonly z0Svg = computed(() => toSvg(VIEW, this.z0()));
  readonly z0Abs = computed(() => cAbs(this.z0()));
  readonly isInside = computed(() => this.z0Abs() < 1);

  /** Direct computation: f(z\u2080) */
  readonly directValue = computed(() => this.activePreset().fn(this.z0()));
  readonly directValueStr = computed(() => fmtC(this.directValue(), 4));

  /** Cauchy integral computation */
  readonly cauchyValue = computed(() =>
    cauchyIntegral(this.activePreset().fn, this.z0(), 500),
  );
  readonly cauchyValueStr = computed(() => {
    const v = this.cauchyValue();
    return fmtC(v, 4);
  });

  /** Point on boundary circle closest to z\u2080 for the "reach" line */
  readonly boundaryPointSvg = computed(() => {
    const z = this.z0();
    const r = cAbs(z);
    if (r < 1e-9) return toSvg(VIEW, [1, 0]);
    const bx = z[0] / r;
    const by = z[1] / r;
    return toSvg(VIEW, [bx, by]);
  });

  /* ── Drag handling ── */

  startDrag(ev: MouseEvent): void {
    this.dragging.set(true);
    this.updateZ0(ev);
  }

  onDrag(ev: MouseEvent): void {
    if (!this.dragging()) return;
    this.updateZ0(ev);
  }

  private updateZ0(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) / rect.width * VIEW.svgW;
    const sy = (ev.clientY - rect.top) / rect.height * VIEW.svgH;
    const pt = fromSvg(VIEW, sx, sy);
    // Clamp to view but allow outside the unit circle
    const limit = VIEW.radius - 0.1;
    const clamped: C = [
      Math.max(-limit, Math.min(limit, pt[0])),
      Math.max(-limit, Math.min(limit, pt[1])),
    ];
    this.z0.set(clamped);
  }
}
