import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from './ag-util';

/* ── Preset definitions ── */

interface Preset {
  key: string;
  label: string;
  fn: (x: number, y: number, params: number[]) => number;
  tex: (params: number[]) => string;
  desc: string;
  sliders: SliderDef[];
  defaults: number[];
}

interface SliderDef {
  label: string;
  min: number;
  max: number;
  step: number;
}

const PRESETS: Preset[] = [
  {
    key: 'line',
    label: '直線 x + y - 1',
    fn: (x, y, p) => x + y - p[0],
    tex: (p) => `x + y - ${p[0].toFixed(1)} = 0`,
    desc: '一次多項式定義直線。改變常數項平移直線。',
    sliders: [{ label: 'c', min: -3, max: 3, step: 0.1 }],
    defaults: [1],
  },
  {
    key: 'parabola',
    label: '拋物線 y - x\u00B2',
    fn: (x, y, _p) => y - x * x,
    tex: (_p) => `y - x^2 = 0`,
    desc: '二次多項式。拋物線是所有與焦點和準線等距的點集。',
    sliders: [],
    defaults: [],
  },
  {
    key: 'circle',
    label: '圓 x\u00B2 + y\u00B2 - 1',
    fn: (x, y, p) => x * x + y * y - p[0] * p[0],
    tex: (p) => `x^2 + y^2 - ${(p[0] * p[0]).toFixed(2)} = 0 \\quad (r=${p[0].toFixed(1)})`,
    desc: '圓是到原點等距的點集。調整半徑 r 縮放圓。',
    sliders: [{ label: 'r', min: 0.3, max: 2.5, step: 0.1 }],
    defaults: [1],
  },
  {
    key: 'ellipse',
    label: '橢圓 x\u00B2/4 + y\u00B2 - 1',
    fn: (x, y, _p) => x * x / 4 + y * y - 1,
    tex: (_p) => `\\frac{x^2}{4} + y^2 - 1 = 0`,
    desc: '橢圓是到兩個焦點距離和為常數的點集。',
    sliders: [],
    defaults: [],
  },
  {
    key: 'hyperbola',
    label: '雙曲線 x\u00B2 - y\u00B2 - 1',
    fn: (x, y, _p) => x * x - y * y - 1,
    tex: (_p) => `x^2 - y^2 - 1 = 0`,
    desc: '雙曲線有兩個分支，延伸到無窮遠處逼近漸近線。',
    sliders: [],
    defaults: [],
  },
  {
    key: 'cubic',
    label: '三次曲線 y\u00B2 - x\u00B3 + x',
    fn: (x, y, p) => y * y - x * x * x + p[0] * x,
    tex: (p) => `y^2 - x^3 + ${p[0].toFixed(1)}x = 0`,
    desc: '橢圓曲線型三次曲線。改變係數 a 可以讓曲線拓撲改變。',
    sliders: [{ label: 'a', min: -2, max: 2, step: 0.1 }],
    defaults: [1],
  },
];

/* ── Heat-map colour ── */
const HEAT_POS = 'rgba(90,127,170,1)';   // faint blue
const HEAT_NEG = 'rgba(170,90,106,1)';   // faint red

@Component({
  selector: 'app-step-poly-shapes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="多項式 = 形狀" subtitle="§1.1">
      <p>
        代數幾何的基本洞察：<strong>每一個多項式方程 f(x,y) = 0 都定義了平面上的一條曲線。</strong>
      </p>
      <p>
        直線（ax + by + c = 0）、圓錐曲線（x<sup>2</sup> + y<sup>2</sup> - 1 = 0）、
        三次曲線（y<sup>2</sup> - x<sup>3</sup> + x = 0）——從最簡單到最複雜，
        全部都是多項式零點集的實例。
      </p>
      <app-math block [e]="formulaVf"></app-math>
      <p>
        代數幾何研究的就是這些形狀——用代數（多項式的性質）來理解幾何（形狀的性質）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇方程式預設或拖動係數，觀察多項式如何定義形狀">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i"
                  (click)="selectPreset(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Sliders -->
      @if (curPreset().sliders.length > 0) {
        <div class="slider-row">
          @for (s of curPreset().sliders; track s.label; let si = $index) {
            <div class="slider-group">
              <span class="sl-label">{{ s.label }} = {{ params()[si].toFixed(1) }}</span>
              <input type="range" [min]="s.min" [max]="s.max" [step]="s.step"
                     [value]="params()[si]"
                     (input)="setParam(si, +($any($event.target)).value)"
                     class="sl-input" />
            </div>
          }
        </div>
      }

      <!-- SVG plot -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Heat map background -->
        @for (cell of heatCells(); track cell.idx) {
          <rect [attr.x]="cell.sx" [attr.y]="cell.sy"
                [attr.width]="cell.w" [attr.height]="cell.h"
                [attr.fill]="cell.positive ? heatPos : heatNeg"
                fill-opacity="0.06" />
        }

        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Implicit curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2"
              stroke-linecap="round" />
      </svg>

      <!-- Info card -->
      <div class="info-row">
        <div class="info-eq">
          <app-math [e]="curTex()"></app-math>
        </div>
        <div class="info-desc">{{ curPreset().desc }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        從直線到橢圓曲線，所有這些形狀都由多項式的零點集定義。
        代數幾何的核心問題：能否用代數（多項式的性質）來理解幾何（形狀的性質）？
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
      font-family: 'JetBrains Mono', monospace; min-width: 70px;
    }
    .sl-input { flex: 1; accent-color: var(--accent); }

    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .info-row {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
    }
    .info-eq {
      padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 14px;
    }
    .info-desc {
      flex: 1; font-size: 12px; color: var(--text-secondary); line-height: 1.6;
    }
  `,
})
export class StepPolyShapesComponent {
  readonly presets = PRESETS;
  readonly heatPos = HEAT_POS;
  readonly heatNeg = HEAT_NEG;

  readonly formulaVf = `V(f) = \\{(x,y) \\in \\mathbb{R}^2 : f(x,y) = 0\\}`;

  readonly v: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 520, svgH: 420, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly selIdx = signal(0);
  readonly params = signal<number[]>([1]);

  readonly curPreset = computed(() => PRESETS[this.selIdx()]);
  readonly curTex = computed(() => this.curPreset().tex(this.params()));

  /* ── Heat-map cells ── */
  readonly heatCells = computed(() => {
    const preset = this.curPreset();
    const p = this.params();
    const cells: { idx: number; sx: number; sy: number; w: number; h: number; positive: boolean }[] = [];
    const N = 40;
    const [x0, x1] = this.v.xRange;
    const [y0, y1] = this.v.yRange;
    const dx = (x1 - x0) / N;
    const dy = (y1 - y0) / N;
    let idx = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const cx = x0 + (i + 0.5) * dx;
        const cy = y0 + (j + 0.5) * dy;
        const val = preset.fn(cx, cy, p);
        const sx = plotToSvgX(this.v, x0 + i * dx);
        const sy = plotToSvgY(this.v, y0 + (j + 1) * dy);
        const sw = plotToSvgX(this.v, x0 + (i + 1) * dx) - sx;
        const sh = plotToSvgY(this.v, y0 + j * dy) - sy;
        cells.push({ idx: idx++, sx, sy, w: sw, h: sh, positive: val > 0 });
      }
    }
    return cells;
  });

  /* ── Implicit curve ── */
  readonly curvePath = computed(() => {
    const preset = this.curPreset();
    const p = this.params();
    return implicitCurve(
      (x, y) => preset.fn(x, y, p),
      this.v.xRange, this.v.yRange,
      (x) => plotToSvgX(this.v, x),
      (y) => plotToSvgY(this.v, y),
      120,
    );
  });

  selectPreset(idx: number): void {
    this.selIdx.set(idx);
    this.params.set([...PRESETS[idx].defaults]);
  }

  setParam(idx: number, value: number): void {
    const p = [...this.params()];
    p[idx] = value;
    this.params.set(p);
  }
}
