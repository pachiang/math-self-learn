import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Surface presets ── */

interface SurfacePreset {
  key: string;
  label: string;
  fn: (x: number, y: number, z: number) => number;
  descFn: (z: number) => string;
}

const PRESETS: SurfacePreset[] = [
  {
    key: 'sphere',
    label: '球面 x\u00B2+y\u00B2+z\u00B2=1',
    fn: (x, y, z) => x * x + y * y + z * z - 1,
    descFn: (z) => {
      const r2 = 1 - z * z;
      if (r2 < -0.001) return '空集 (z\u00B2 > 1)';
      if (r2 < 0.001) return '一個點';
      return `圓，半徑 r = ${Math.sqrt(r2).toFixed(2)}`;
    },
  },
  {
    key: 'cylinder',
    label: '柱面 x\u00B2+y\u00B2=1',
    fn: (x, y, _z) => x * x + y * y - 1,
    descFn: (_z) => '單位圓 (不依賴 z)',
  },
  {
    key: 'hyperboloid',
    label: '雙曲面 x\u00B2+y\u00B2-z\u00B2=1',
    fn: (x, y, z) => x * x + y * y - z * z - 1,
    descFn: (z) => {
      const r2 = 1 + z * z;
      return `圓，半徑 r = ${Math.sqrt(r2).toFixed(2)}`;
    },
  },
  {
    key: 'cone',
    label: '圓錐 x\u00B2+y\u00B2=z\u00B2',
    fn: (x, y, z) => x * x + y * y - z * z,
    descFn: (z) => {
      const r = Math.abs(z);
      if (r < 0.01) return '一個點 (頂點)';
      return `圓，半徑 r = ${r.toFixed(2)}`;
    },
  },
];

@Component({
  selector: 'app-step-curves-to-surfaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="從曲線到曲面" subtitle="&sect;5.1">
      <p>
        在前面的章節中，我們研究了平面代數曲線——由一個方程
        f(x,y) = 0 定義的零點集。現在我們要跨入更高維度：
        <strong>代數曲面</strong>是由三變數多項式 f(x,y,z) = 0
        在空間中定義的零點集。
      </p>
      <p>
        關鍵觀察：在 k<sup>n</sup> 中，每一個方程把維度降低 1。
        一個方程在 k<sup>2</sup> 中給出一條曲線（1 維），
        在 k<sup>3</sup> 中給出一個曲面（2 維）。
      </p>
      <app-math block [e]="formulaVf" />
      <p>
        理解曲面的一個強大工具是<strong>截面法</strong>：
        固定 z = z<sub>0</sub>，觀察截面 f(x,y,z<sub>0</sub>) = 0
        如何隨 z 變化。這把三維問題化約為一系列二維截面。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇曲面預設，拖動 z 滑桿觀察截面如何變化">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i"
                  (click)="selectPreset(i)">{{ p.label }}</button>
        }
      </div>

      <!-- z slider -->
      <div class="slider-row">
        <div class="slider-group">
          <span class="sl-label">z = {{ zValue().toFixed(2) }}</span>
          <input type="range" min="-1.5" max="1.5" step="0.02"
                 [value]="zValue()"
                 (input)="zValue.set(+($any($event.target)).value)"
                 class="sl-input" />
        </div>
      </div>

      <!-- SVG plot -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Implicit curve (cross-section) -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.2"
              stroke-linecap="round" />

        <!-- Axis labels -->
        <text [attr.x]="v.svgW - v.pad + 8" [attr.y]="toSvgY(0) + 4"
              class="axis-label">x</text>
        <text [attr.x]="toSvgX(0) - 12" [attr.y]="v.pad - 6"
              class="axis-label">y</text>
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">曲面</div>
          <div class="ic-body">{{ curPreset().label }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">截面高度</div>
          <div class="ic-body">z = {{ zValue().toFixed(2) }}</div>
        </div>
        <div class="info-card accent-card">
          <div class="ic-title">截面形狀</div>
          <div class="ic-body accent">{{ sectionDesc() }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        截面法揭示了曲面的內部結構。球面的截面從一個點膨脹成圓再縮回一個點；
        圓錐的截面從一個點開始持續擴大；雙曲面的截面永遠是圓——但半徑先縮到最小再擴大。
        這些截面的變化模式完全由方程的代數性質決定。
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
    .slider-row {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .slider-group {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 160px;
    }
    .sl-label {
      font-size: 12px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 90px;
    }
    .sl-input { flex: 1; accent-color: var(--accent); }

    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .axis-label {
      font-size: 11px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 120px; padding: 10px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
    }
    .accent-card {
      background: var(--accent-10); border-color: var(--accent-30);
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .ic-body.accent {
      color: var(--accent);
    }
  `,
})
export class StepCurvesToSurfacesComponent {
  readonly presets = PRESETS;

  readonly formulaVf = String.raw`V(f) = \{(x,y,z) \in k^3 : f(x,y,z) = 0\}`;

  readonly v: PlotView = { xRange: [-2, 2], yRange: [-2, 2], svgW: 520, svgH: 400, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly selIdx = signal(0);
  readonly zValue = signal(0);

  readonly curPreset = computed(() => PRESETS[this.selIdx()]);

  readonly sectionDesc = computed(() => {
    const preset = this.curPreset();
    const z = this.zValue();
    return preset.descFn(z);
  });

  /* ── Cross-section curve ── */
  readonly curvePath = computed(() => {
    const preset = this.curPreset();
    const z = this.zValue();
    return implicitCurve(
      (x, y) => preset.fn(x, y, z),
      this.v.xRange, this.v.yRange,
      (x) => plotToSvgX(this.v, x),
      (y) => plotToSvgY(this.v, y),
      100,
    );
  });

  toSvgX(x: number): number { return plotToSvgX(this.v, x); }
  toSvgY(y: number): number { return plotToSvgY(this.v, y); }

  selectPreset(idx: number): void {
    this.selIdx.set(idx);
    this.zValue.set(0);
  }
}
