import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, gradient, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Presets ── */
interface ECPreset {
  label: string;
  a: number;
  b: number;
}

const PRESETS: ECPreset[] = [
  { label: '經典 a=-1, b=0', a: -1, b: 0 },
  { label: '一個分支 a=1, b=1', a: 1, b: 1 },
  { label: '結點 a=-3, b=2', a: -3, b: 2 },
  { label: '尖點 a=0, b=0', a: 0, b: 0 },
];

@Component({
  selector: 'app-step-ec-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="什麼是橢圓曲線" subtitle="&sect;3.1">
      <p>
        橢圓曲線是代數幾何最重要的研究對象之一。它不是橢圓——名字來自橢圓弧長積分。
      </p>
      <p>
        一條<strong>光滑</strong>的曲線，由 Weierstrass 方程定義：
      </p>
      <app-math block [e]="formulaWeierstrass"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>
        曲線光滑（非奇異）的條件是判別式不為零。當判別式為零時，曲線出現奇異點——結點或尖點——就<strong>不是</strong>橢圓曲線了。
      </p>
      <app-math block [e]="formulaDiscriminant"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>
        拓撲上，光滑的橢圓曲線（over 實數）是虧格 1 的曲面——也就是環面（torus，甜甜圈）。
        這就是為什麼它能承載群結構（下一節的主題）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 a 和 b 觀察曲線形狀——當判別式為零時曲線退化">
      <!-- Sliders -->
      <div class="slider-row">
        <label class="slider-label">
          <span class="sl-name">a</span>
          <input type="range" min="-3" max="1" step="0.05"
                 [value]="paramA()"
                 (input)="paramA.set(+$any($event.target).value)" />
          <span class="sl-val">{{ paramA().toFixed(2) }}</span>
        </label>
        <label class="slider-label">
          <span class="sl-name">b</span>
          <input type="range" min="-2" max="2" step="0.05"
                 [value]="paramB()"
                 (input)="paramB.set(+$any($event.target).value)" />
          <span class="sl-val">{{ paramB().toFixed(2) }}</span>
        </label>
      </div>

      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.label) {
          <button class="pre-btn"
                  [class.active]="paramA() === p.a && paramB() === p.b"
                  (click)="paramA.set(p.a); paramB.set(p.b)">{{ p.label }}</button>
        }
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Background shading -->
        @for (rect of shadingRects(); track $index) {
          <rect [attr.x]="rect.x" [attr.y]="rect.y"
                [attr.width]="rect.w" [attr.height]="rect.h"
                [attr.fill]="rect.color" />
        }

        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Elliptic curve -->
        <path [attr.d]="curvePath()" fill="none"
              [attr.stroke]="isSmooth() ? 'var(--accent)' : '#c05050'"
              stroke-width="2.2" stroke-linecap="round" />

        <!-- Singular point marker (red x) when discriminant ~ 0 -->
        @if (!isSmooth() && singularPt()) {
          <line [attr.x1]="toSvgX(singularPt()![0]) - 7"
                [attr.y1]="toSvgY(singularPt()![1]) - 7"
                [attr.x2]="toSvgX(singularPt()![0]) + 7"
                [attr.y2]="toSvgY(singularPt()![1]) + 7"
                stroke="#c05050" stroke-width="2.2" stroke-linecap="round" />
          <line [attr.x1]="toSvgX(singularPt()![0]) + 7"
                [attr.y1]="toSvgY(singularPt()![1]) - 7"
                [attr.x2]="toSvgX(singularPt()![0]) - 7"
                [attr.y2]="toSvgY(singularPt()![1]) + 7"
                stroke="#c05050" stroke-width="2.2" stroke-linecap="round" />
          <text [attr.x]="toSvgX(singularPt()![0]) + 12"
                [attr.y]="toSvgY(singularPt()![1]) - 10"
                class="sing-label">奇異點</text>
        }
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card mono-card">
          <div class="ic-row">
            <span class="ic-label">a</span>
            <span class="ic-val">{{ paramA().toFixed(2) }}</span>
          </div>
          <div class="ic-row">
            <span class="ic-label">b</span>
            <span class="ic-val">{{ paramB().toFixed(2) }}</span>
          </div>
        </div>
        <div class="info-card mono-card">
          <div class="ic-title">判別式</div>
          <div class="ic-val disc-val">{{ discriminantStr() }}</div>
        </div>
        <div class="info-card badge-card">
          @if (isSmooth()) {
            <span class="badge smooth-badge">光滑橢圓曲線</span>
          } @else {
            <span class="badge sing-badge">奇異！不是橢圓曲線</span>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        橢圓曲線的魔力在下一節：它上面的點可以「相加」——構成一個群！
      </p>
    </app-prose-block>
  `,
  styles: `
    .slider-row {
      display: flex; gap: 16px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .slider-label {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;
    }
    .sl-name {
      font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;
      color: var(--text); min-width: 14px;
    }
    .sl-val {
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-secondary);
      min-width: 40px; text-align: right;
    }
    input[type="range"] {
      flex: 1; accent-color: var(--accent);
    }
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
    }
    .sing-label {
      font-size: 11px; fill: #c05050; font-weight: 700;
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
      font-family: 'JetBrains Mono', monospace; font-size: 12px;
    }
    .ic-row {
      display: flex; justify-content: space-between; gap: 8px; margin: 2px 0;
    }
    .ic-label { color: var(--text-muted); }
    .ic-val { color: var(--text); font-weight: 600; }
    .disc-val { font-size: 14px; }
    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .smooth-badge {
      background: rgba(90,138,90,0.12); color: #5a8a5a;
      border: 1px solid rgba(90,138,90,0.3);
    }
    .sing-badge {
      background: rgba(192,80,80,0.12); color: #c05050;
      border: 1px solid rgba(192,80,80,0.3);
    }
  `,
})
export class StepEcIntroComponent {
  readonly presets = PRESETS;

  readonly formulaWeierstrass = `E: \\quad y^2 = x^3 + ax + b`;
  readonly formulaDiscriminant = `\\Delta = -16(4a^3 + 27b^2) \\neq 0`;

  readonly v: PlotView = {
    xRange: [-3, 4], yRange: [-4, 4], svgW: 520, svgH: 420, pad: 30,
  };
  readonly axesPath = plotAxesPath(this.v);

  readonly paramA = signal(-1);
  readonly paramB = signal(0);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /** Discriminant Delta = -16(4a^3 + 27b^2) */
  readonly discriminant = computed(() => {
    const a = this.paramA();
    const b = this.paramB();
    return -16 * (4 * a * a * a + 27 * b * b);
  });

  readonly discriminantStr = computed(() => {
    const d = this.discriminant();
    return Math.abs(d) < 0.01 ? '0' : d.toFixed(2);
  });

  readonly isSmooth = computed(() => Math.abs(this.discriminant()) >= 0.5);

  /** Curve implicit function: y^2 - x^3 - ax - b = 0 */
  readonly curvePath = computed(() => {
    const a = this.paramA();
    const b = this.paramB();
    return implicitCurve(
      (x, y) => y * y - x * x * x - a * x - b,
      this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120,
    );
  });

  /** Find singular point numerically when discriminant ~ 0 */
  readonly singularPt = computed((): [number, number] | null => {
    if (this.isSmooth()) return null;
    const a = this.paramA();
    const b = this.paramB();
    const f = (x: number, y: number) => y * y - x * x * x - a * x - b;

    // Singular point: both partials vanish
    // df/dx = -3x^2 - a = 0 => x = sqrt(-a/3)
    // df/dy = 2y = 0 => y = 0
    // Then f(x,0) = -x^3 - ax - b = 0
    let bestX = 0;
    let bestDist = Infinity;
    const step = 0.02;
    for (let x = this.v.xRange[0]; x <= this.v.xRange[1]; x += step) {
      const [gx, gy] = gradient(f, x, 0);
      const dist = gx * gx + gy * gy;
      if (dist < bestDist) {
        bestDist = dist;
        bestX = x;
      }
    }
    // Refine
    for (let x = bestX - 0.05; x <= bestX + 0.05; x += 0.001) {
      const [gx, gy] = gradient(f, x, 0);
      const dist = gx * gx + gy * gy;
      if (dist < bestDist) {
        bestDist = dist;
        bestX = x;
      }
    }
    if (bestDist < 1) {
      return [bestX, 0];
    }
    return null;
  });

  /** Background shading: faint blue where f>0, faint red where f<0 */
  readonly shadingRects = computed(() => {
    const a = this.paramA();
    const b = this.paramB();
    const f = (x: number, y: number) => y * y - x * x * x - a * x - b;
    const res = 40;
    const rects: { x: number; y: number; w: number; h: number; color: string }[] = [];
    const xSpan = this.v.xRange[1] - this.v.xRange[0];
    const ySpan = this.v.yRange[1] - this.v.yRange[0];
    const dxMath = xSpan / res;
    const dyMath = ySpan / res;
    const innerW = this.v.svgW - 2 * this.v.pad;
    const innerH = this.v.svgH - 2 * this.v.pad;
    const cellW = innerW / res;
    const cellH = innerH / res;

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const mx = this.v.xRange[0] + (i + 0.5) * dxMath;
        const my = this.v.yRange[0] + (j + 0.5) * dyMath;
        const val = f(mx, my);
        if (Math.abs(val) < 0.01) continue;
        const sx = this.v.pad + i * cellW;
        const sy = this.v.pad + (res - 1 - j) * cellH;
        rects.push({
          x: sx,
          y: sy,
          w: cellW + 0.5,
          h: cellH + 0.5,
          color: val > 0
            ? 'rgba(80,120,200,0.04)'
            : 'rgba(200,80,80,0.04)',
        });
      }
    }
    return rects;
  });
}
