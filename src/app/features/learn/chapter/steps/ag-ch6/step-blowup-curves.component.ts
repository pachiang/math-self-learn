import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Preset definitions ── */

interface BlowupPreset {
  key: string;
  label: string;
  /** f(x,y) = 0 in the original plane */
  fn: (x: number, y: number) => number;
  /** g(x,s) = 0 strict transform (after cancelling x^m) */
  strictFn: (x: number, s: number) => number;
  texOriginal: string;
  texSubstitution: string;
  texStrict: string;
  /** Points where strict transform meets E (x=0) */
  meetPoints: number[];
  resolved: boolean;
  badge: string;
}

const PRESETS: BlowupPreset[] = [
  {
    key: 'line',
    label: '直線 y = 2x',
    fn: (x, y) => y - 2 * x,
    strictFn: (x, s) => s - 2,
    texOriginal: 'y - 2x = 0',
    texSubstitution: 'xs - 2x = x(s - 2)',
    texStrict: 's - 2 = 0 \\;\\Rightarrow\\; s = 2',
    meetPoints: [2],
    resolved: true,
    badge: '奇異點已消解',
  },
  {
    key: 'parabola',
    label: '拋物線 y = x\u00B2',
    fn: (x, y) => y - x * x,
    strictFn: (x, s) => s - x,
    texOriginal: 'y - x^2 = 0',
    texSubstitution: 'xs - x^2 = x(s - x)',
    texStrict: 's - x = 0 \\;\\Rightarrow\\; s = x',
    meetPoints: [0],
    resolved: true,
    badge: '奇異點已消解',
  },
  {
    key: 'node',
    label: '結點 y\u00B2 = x\u00B2(x+1)',
    fn: (x, y) => y * y - x * x * (x + 1),
    strictFn: (x, s) => s * s - x - 1,
    texOriginal: 'y^2 - x^2(x+1) = 0',
    texSubstitution: 'x^2 s^2 - x^2(x+1) = x^2(s^2 - x - 1)',
    texStrict: 's^2 - x - 1 = 0',
    meetPoints: [1, -1],
    resolved: true,
    badge: '奇異點已消解',
  },
  {
    key: 'cusp',
    label: '尖點 y\u00B2 = x\u00B3',
    fn: (x, y) => y * y - x * x * x,
    strictFn: (x, s) => s * s - x,
    texOriginal: 'y^2 - x^3 = 0',
    texSubstitution: 'x^2 s^2 - x^3 = x^2(s^2 - x)',
    texStrict: 's^2 - x = 0 \\;\\Rightarrow\\; s^2 = x',
    meetPoints: [0],
    resolved: false,
    badge: '仍有奇異點 -> 需要再次 blowup',
  },
  {
    key: 'tacnode',
    label: 'tacnode y\u00B2 = x\u2074',
    fn: (x, y) => y * y - x * x * x * x,
    strictFn: (x, s) => s * s - x * x,
    texOriginal: 'y^2 - x^4 = 0',
    texSubstitution: 'x^2 s^2 - x^4 = x^2(s^2 - x^2)',
    texStrict: 's^2 - x^2 = (s-x)(s+x) = 0',
    meetPoints: [0],
    resolved: false,
    badge: '仍有奇異點 -> 需要再次 blowup',
  },
  {
    key: 'triple',
    label: '三分支 y\u00B3 = x\u00B3',
    fn: (x, y) => y * y * y - x * x * x,
    strictFn: (x, s) => s * s * s - 1,
    texOriginal: 'y^3 - x^3 = 0',
    texSubstitution: 'x^3 s^3 - x^3 = x^3(s^3 - 1)',
    texStrict: 's^3 - 1 = 0 \\;\\Rightarrow\\; s = 1',
    meetPoints: [1],
    resolved: true,
    badge: '奇異點已消解',
  },
];

@Component({
  selector: 'app-step-blowup-curves',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="平面曲線的 Blowup" subtitle="&sect;6.2">
      <p>
        當我們 blowup 原點時，曲線 C: f(x,y) = 0 會怎樣？
      </p>
      <ol>
        <li>代入 y = xs（使用圖 s = y/x）得 f(x, xs) = 0</li>
        <li>
          提出因子：<app-math e="f(x, xs) = x^m \\cdot g(x, s)" />，
          其中 m 是可提取的最大次數
        </li>
        <li>
          因子 <app-math e="x^m = 0" /> 是例外除子 E（計 m 次）
        </li>
        <li>
          剩餘因子 g(x, s) = 0 是<strong>嚴格變換</strong>——
          「真正的」變換曲線
        </li>
      </ol>
      <app-math block [e]="formulaStrict"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>
        嚴格變換「記住」方向：如果原始曲線以斜率 s&#8320; 接近原點，
        嚴格變換會通過 E 上的點 (0, s&#8320;)。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇曲線，觀察 blowup 前後的對比——奇異點消失了嗎？">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i"
                  (click)="selIdx.set(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Dual panel SVG -->
      <div class="dual-panel">
        <!-- Left: original curve -->
        <div class="panel-wrap">
          <div class="panel-title">原始曲線</div>
          <svg [attr.viewBox]="'0 0 ' + vL.svgW + ' ' + vL.svgH" class="plot-svg">
            <path [attr.d]="axesL" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />
            <path [attr.d]="curvePathL()" fill="none" stroke="var(--accent)" stroke-width="2.2"
                  stroke-linecap="round" />
            <!-- Origin marker -->
            <circle [attr.cx]="toSvgXL(0)" [attr.cy]="toSvgYL(0)" r="4"
                    fill="#cc4444" fill-opacity="0.8" stroke="#cc4444" stroke-width="1" />
            <!-- Axis labels -->
            <text [attr.x]="vL.svgW - vL.pad + 8" [attr.y]="toSvgYL(0) + 4"
                  class="axis-label">x</text>
            <text [attr.x]="toSvgXL(0) + 6" [attr.y]="vL.pad - 4"
                  class="axis-label">y</text>
          </svg>
        </div>

        <!-- Right: strict transform -->
        <div class="panel-wrap">
          <div class="panel-title">嚴格變換</div>
          <svg [attr.viewBox]="'0 0 ' + vR.svgW + ' ' + vR.svgH" class="plot-svg">
            <path [attr.d]="axesR" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />
            <!-- Exceptional divisor E (x=0 line) -->
            <line [attr.x1]="toSvgXR(0)" [attr.y1]="vR.pad"
                  [attr.x2]="toSvgXR(0)" [attr.y2]="vR.svgH - vR.pad"
                  stroke="#c06060" stroke-width="2.5" stroke-opacity="0.7" />
            <!-- E label -->
            <text [attr.x]="toSvgXR(0) - 16" [attr.y]="vR.pad + 14"
                  class="e-label">E</text>
            <!-- Strict transform curve -->
            <path [attr.d]="curvePathR()" fill="none" stroke="var(--accent)" stroke-width="2.2"
                  stroke-linecap="round" />
            <!-- Meeting points on E -->
            @for (s of curPreset().meetPoints; track s) {
              <circle [attr.cx]="toSvgXR(0)" [attr.cy]="toSvgYR(s)" r="5"
                      fill="var(--accent)" stroke="#fff" stroke-width="1.5" />
              <text [attr.x]="toSvgXR(0) + 10" [attr.y]="toSvgYR(s) + 4"
                    class="meet-label">s={{ s }}</text>
            }
            <!-- Axis labels -->
            <text [attr.x]="vR.svgW - vR.pad + 8" [attr.y]="toSvgYR(0) + 4"
                  class="axis-label">x</text>
            <text [attr.x]="toSvgXR(0) + 6" [attr.y]="vR.pad - 4"
                  class="axis-label">s</text>
          </svg>
        </div>
      </div>

      <!-- Badge -->
      <div class="badge-row">
        <span class="badge" [class.resolved]="curPreset().resolved"
              [class.unresolved]="!curPreset().resolved">
          {{ curPreset().badge }}
        </span>
      </div>

      <!-- Math details -->
      <div class="math-steps">
        <div class="math-step">
          <span class="step-label">原始方程</span>
          <app-math [e]="curPreset().texOriginal"></app-math>
        </div>
        <div class="math-step">
          <span class="step-label">代入 y = xs</span>
          <app-math [e]="curPreset().texSubstitution"></app-math>
        </div>
        <div class="math-step">
          <span class="step-label">嚴格變換</span>
          <app-math [e]="curPreset().texStrict"></app-math>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        結點只需一次 blowup 就能消解——因為兩條分支有不同的切線方向。
        尖點更頑固：一次 blowup 後仍有奇異點。下一節看如何處理結點的消解過程。
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

    .dual-panel {
      display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .panel-wrap {
      flex: 1; min-width: 240px;
    }
    .panel-title {
      font-size: 12px; font-weight: 700; color: var(--text-secondary);
      text-align: center; margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .plot-svg {
      width: 100%; display: block;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .axis-label {
      font-size: 11px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
    }
    .e-label {
      font-size: 13px; fill: #c06060; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .meet-label {
      font-size: 10px; fill: var(--accent); font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .badge-row {
      display: flex; justify-content: center; margin-bottom: 10px;
    }
    .badge {
      padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge.resolved {
      background: rgba(90,138,90,0.12); color: #5a8a5a;
      border: 1px solid rgba(90,138,90,0.3);
    }
    .badge.unresolved {
      background: rgba(200,160,60,0.12); color: #c8a040;
      border: 1px solid rgba(200,160,60,0.3);
    }

    .math-steps {
      display: flex; flex-direction: column; gap: 6px;
      padding: 10px 14px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface);
    }
    .math-step {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .step-label {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
      min-width: 80px; font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepBlowupCurvesComponent {
  readonly presets = PRESETS;

  readonly formulaStrict =
    `f(x, xs) = x^m \\cdot \\tilde{f}(x, s) \\qquad\\text{（去掉 } x^m \\text{ 後得到嚴格變換 } \\tilde{f}\\text{）}`;

  readonly selIdx = signal(2); // default to node
  readonly curPreset = computed(() => PRESETS[this.selIdx()]);

  /* ── Plot views ── */

  readonly vL: PlotView = { xRange: [-2, 2], yRange: [-2, 2], svgW: 260, svgH: 260, pad: 28 };
  readonly vR: PlotView = { xRange: [-2, 2], yRange: [-2, 2], svgW: 260, svgH: 260, pad: 28 };

  readonly axesL = plotAxesPath(this.vL);
  readonly axesR = plotAxesPath(this.vR);

  toSvgXL = (x: number) => plotToSvgX(this.vL, x);
  toSvgYL = (y: number) => plotToSvgY(this.vL, y);
  toSvgXR = (x: number) => plotToSvgX(this.vR, x);
  toSvgYR = (y: number) => plotToSvgY(this.vR, y);

  /* ── Curve paths ── */

  readonly curvePathL = computed(() =>
    implicitCurve(
      this.curPreset().fn,
      this.vL.xRange, this.vL.yRange,
      this.toSvgXL, this.toSvgYL, 120,
    ),
  );

  readonly curvePathR = computed(() =>
    implicitCurve(
      this.curPreset().strictFn,
      this.vR.xRange, this.vR.yRange,
      this.toSvgXR, this.toSvgYR, 120,
    ),
  );
}
