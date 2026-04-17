import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Component color palette ── */

const COMPONENT_COLORS = ['#7a6a5a', '#5a7a6a', '#6a5a7a', '#7a5a5a', '#5a6a7a'];

/* ── Irreducible decomposition presets ── */

interface IrreducibleFactor {
  label: string;
  fn: (x: number, y: number) => number;
  color: string;
}

interface DecompPreset {
  key: string;
  label: string;
  fn: (x: number, y: number) => number;
  tex: string;
  factoredTex: string;
  factors: IrreducibleFactor[];
  isIrreducible: boolean;
  desc: string;
  componentLabels: string[];
}

const PRESETS: DecompPreset[] = [
  {
    key: 'two-lines',
    label: 'x\u00B2-y\u00B2 = (x-y)(x+y)',
    fn: (x, y) => x * x - y * y,
    tex: 'x^2 - y^2 = 0',
    factoredTex: '(x - y)(x + y) = 0',
    factors: [
      { label: 'V(x - y)', fn: (x, y) => x - y, color: COMPONENT_COLORS[0] },
      { label: 'V(x + y)', fn: (x, y) => x + y, color: COMPONENT_COLORS[1] },
    ],
    isIrreducible: false,
    desc: '兩條直線 y = x 和 y = -x 的聯集',
    componentLabels: ['y = x', 'y = -x'],
  },
  {
    key: 'three-lines',
    label: 'x\u00B3-x = x(x-1)(x+1)',
    fn: (x, y) => x * x * x - x,
    tex: 'x^3 - x = 0',
    factoredTex: 'x(x - 1)(x + 1) = 0',
    factors: [
      { label: 'V(x)', fn: (x, _y) => x, color: COMPONENT_COLORS[0] },
      { label: 'V(x - 1)', fn: (x, _y) => x - 1, color: COMPONENT_COLORS[1] },
      { label: 'V(x + 1)', fn: (x, _y) => x + 1, color: COMPONENT_COLORS[2] },
    ],
    isIrreducible: false,
    desc: '三條垂直線 x = 0, x = 1, x = -1',
    componentLabels: ['x = 0', 'x = 1', 'x = -1'],
  },
  {
    key: 'axes-circle',
    label: 'xy(x\u00B2+y\u00B2-1)',
    fn: (x, y) => x * y * (x * x + y * y - 1),
    tex: 'xy(x^2 + y^2 - 1) = 0',
    factoredTex: 'x \\cdot y \\cdot (x^2 + y^2 - 1) = 0',
    factors: [
      { label: 'V(x)', fn: (x, _y) => x, color: COMPONENT_COLORS[0] },
      { label: 'V(y)', fn: (_x, y) => y, color: COMPONENT_COLORS[1] },
      { label: 'V(x\u00B2+y\u00B2-1)', fn: (x, y) => x * x + y * y - 1, color: COMPONENT_COLORS[2] },
    ],
    isIrreducible: false,
    desc: 'x 軸、y 軸與單位圓的聯集 = 3 個不可約分量',
    componentLabels: ['x 軸', 'y 軸', '單位圓'],
  },
  {
    key: 'nodal-cubic',
    label: 'y\u00B2-x\u00B3-x\u00B2',
    fn: (x, y) => y * y - x * x * x - x * x,
    tex: 'y^2 - x^2(x + 1) = 0',
    factoredTex: 'y^2 - x^2(x + 1) = 0 \\quad (\\text{irreducible!})',
    factors: [
      { label: 'V(y\u00B2-x\u00B3-x\u00B2)', fn: (x, y) => y * y - x * x * x - x * x, color: COMPONENT_COLORS[0] },
    ],
    isIrreducible: true,
    desc: '帶結點的三次曲線——不可約！自交點是奇異點，不是分解',
    componentLabels: ['y\u00B2 - x\u00B3 - x\u00B2 (不可約)'],
  },
  {
    key: 'two-circles',
    label: '(x\u00B2+y\u00B2-1)(x\u00B2+y\u00B2-4)',
    fn: (x, y) => (x * x + y * y - 1) * (x * x + y * y - 4),
    tex: '(x^2 + y^2 - 1)(x^2 + y^2 - 4) = 0',
    factoredTex: '(x^2 + y^2 - 1)(x^2 + y^2 - 4) = 0',
    factors: [
      { label: 'V(x\u00B2+y\u00B2-1)', fn: (x, y) => x * x + y * y - 1, color: COMPONENT_COLORS[0] },
      { label: 'V(x\u00B2+y\u00B2-4)', fn: (x, y) => x * x + y * y - 4, color: COMPONENT_COLORS[1] },
    ],
    isIrreducible: false,
    desc: '兩個同心圓：半徑 1 和半徑 2',
    componentLabels: ['r = 1 圓', 'r = 2 圓'],
  },
];

@Component({
  selector: 'app-step-ag-irreducible',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="不可約分解：形狀的「質因數分解」" subtitle="\u00A72.4">
      <p>
        簇 V 是<strong>不可約</strong>的，如果 V = V&#x2081; &#x222A; V&#x2082; 蘊含 V = V&#x2081; 或 V = V&#x2082;。
        換言之，不可約簇無法拆成兩個更小的簇的聯集。
      </p>
      <p>
        每個簇都有唯一的<strong>不可約分解</strong>：
        V = V&#x2081; &#x222A; &#x2026; &#x222A; V&#x2096;，其中每個 V&#x1D62; 都不可約。
        這正如整數的質因數分解！
      </p>
      <app-math block [e]="formulaUnion"></app-math>
      <p>
        代數上的對應：不可約簇對應<strong>質理想</strong>（prime ideal），
        正如不可約多項式對應質元素。因式分解多項式就是分解簇！
      </p>
      <app-math block [e]="formulaIrreducible"></app-math>
    </app-prose-block>

    <app-challenge-card prompt="觀察多項式因式分解如何對應簇的幾何拆分">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i"
                  (click)="selectPreset(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Toggle decomposition -->
      <div class="toggle-row">
        <button class="toggle-btn" [class.active]="showDecomp()"
                (click)="showDecomp.set(!showDecomp())">
          {{ showDecomp() ? '顯示全部' : '顯示分解' }}
        </button>
      </div>

      <!-- SVG plot -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Combined curve (shown when not decomposed) -->
        @if (!showDecomp()) {
          <path [attr.d]="combinedPath()" fill="none" stroke="var(--accent)" stroke-width="2.2"
                stroke-linecap="round" class="curve-path combined-in" />
        }

        <!-- Decomposed curves (shown when decomposed) -->
        @if (showDecomp()) {
          @for (comp of componentPaths(); track $index) {
            <path [attr.d]="comp.path" fill="none" [attr.stroke]="comp.color" stroke-width="2.5"
                  stroke-linecap="round" class="curve-path decomp-in" />
          }
        }

        <!-- Component labels when decomposed -->
        @if (showDecomp()) {
          @for (comp of componentPaths(); track $index; let i = $index) {
            <rect [attr.x]="v.svgW - 148" [attr.y]="12 + i * 22" width="140" height="18" rx="4"
                  fill="var(--bg-surface)" fill-opacity="0.85" stroke="var(--border)" stroke-width="0.5" />
            <circle [attr.cx]="v.svgW - 138" [attr.cy]="21 + i * 22" r="4"
                    [attr.fill]="comp.color" />
            <text [attr.x]="v.svgW - 130" [attr.y]="25 + i * 22"
                  class="legend-text">{{ comp.label }}</text>
          }
        }
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">因式分解</div>
          <app-math [e]="curPreset().factoredTex"></app-math>
        </div>
        <div class="info-card">
          <div class="ic-title">不可約因子數</div>
          <div class="ic-big">{{ curPreset().factors.length }}</div>
        </div>
      </div>

      <!-- Component list -->
      <div class="component-list">
        <div class="ic-title">不可約分量</div>
        <div class="comp-chips">
          @for (f of curPreset().factors; track $index; let i = $index) {
            <span class="comp-chip" [style.border-color]="f.color" [style.color]="f.color">
              {{ f.label }}
            </span>
          }
        </div>
      </div>

      <!-- Irreducible badge for the nodal cubic -->
      @if (curPreset().isIrreducible) {
        <div class="irreducible-badge">
          此簇不可約！（結點是奇異點，不是分解）
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        不可約分解是代數幾何版的質因數分解。每個簇都能唯一地拆成不可約分量——
        這些分量是簇的「基本構件」。注意：奇異點（如結點）不代表可約！
        可約性由多項式的因式分解決定。
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
    .toggle-row {
      display: flex; justify-content: flex-end; margin-bottom: 8px;
    }
    .toggle-btn {
      padding: 6px 16px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
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

    .curve-path {
      transition: opacity 0.4s ease;
    }
    .combined-in {
      animation: fadeIn 0.35s ease;
    }
    .decomp-in {
      animation: fadeIn 0.35s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .legend-text {
      font-size: 10px; fill: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }

    .info-row {
      display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
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
    .ic-big {
      font-size: 28px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .component-list {
      padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); margin-bottom: 8px;
    }
    .comp-chips {
      display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;
    }
    .comp-chip {
      padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      border: 1px solid; background: var(--bg);
    }

    .irreducible-badge {
      padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(122,90,90,0.10); color: #7a5a5a;
      border: 1px solid rgba(122,90,90,0.30);
      text-align: center;
    }
  `,
})
export class StepAgIrreducibleComponent {
  readonly presets = PRESETS;

  readonly formulaUnion = `V(f \\cdot g) = V(f) \\cup V(g)`;
  readonly formulaIrreducible = `f \\text{ 不可約} \\implies V(f) \\text{ 不可約}`;

  readonly v: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 520, svgH: 420, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly selIdx = signal(0);
  readonly showDecomp = signal(false);

  readonly curPreset = computed(() => PRESETS[this.selIdx()]);

  readonly toSvgX = (x: number) => plotToSvgX(this.v, x);
  readonly toSvgY = (y: number) => plotToSvgY(this.v, y);

  /* ── Combined curve path ── */
  readonly combinedPath = computed(() => {
    const preset = this.curPreset();
    return implicitCurve(
      preset.fn,
      this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 120,
    );
  });

  /* ── Per-component curve paths ── */
  readonly componentPaths = computed(() => {
    const preset = this.curPreset();
    return preset.factors.map(f => ({
      path: implicitCurve(
        f.fn,
        this.v.xRange, this.v.yRange,
        this.toSvgX, this.toSvgY, 120,
      ),
      color: f.color,
      label: f.label,
    }));
  });

  selectPreset(idx: number): void {
    this.selIdx.set(idx);
    this.showDecomp.set(false);
  }
}
