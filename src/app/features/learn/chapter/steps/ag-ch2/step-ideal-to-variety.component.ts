import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Generator step definitions ── */

interface GeneratorStep {
  label: string;
  tex: string;
  fn: (x: number, y: number) => number;
  color: string;
  dimLabel: string;
  sizeLabel: string;
}

interface Scenario {
  key: string;
  label: string;
  desc: string;
  steps: GeneratorStep[];
}

const SCENARIOS: Scenario[] = [
  {
    key: 'plane-to-point',
    label: '從面到線到點',
    desc: '逐步加入方程，維度從 2D 降到 1D 再到 0D',
    steps: [
      {
        label: 'x - y = 0',
        tex: 'x - y',
        fn: (x, y) => x - y,
        color: 'var(--accent)',
        dimLabel: '1D',
        sizeLabel: '直線',
      },
      {
        label: 'x\u00B2 + y\u00B2 - 2 = 0',
        tex: 'x^2 + y^2 - 2',
        fn: (x, y) => x * x + y * y - 2,
        color: '#5a8a5a',
        dimLabel: '0D',
        sizeLabel: '兩個點 (1,1), (-1,-1)',
      },
    ],
  },
  {
    key: 'ellipse-cut',
    label: '逐步刻出橢圓',
    desc: '從橢圓開始，用直線和二次曲線逐步裁切',
    steps: [
      {
        label: 'x\u00B2 + 4y\u00B2 - 4 = 0',
        tex: 'x^2 + 4y^2 - 4',
        fn: (x, y) => x * x + 4 * y * y - 4,
        color: 'var(--accent)',
        dimLabel: '1D',
        sizeLabel: '橢圓',
      },
      {
        label: 'x - 1 = 0',
        tex: 'x - 1',
        fn: (x, _y) => x - 1,
        color: '#5a8a5a',
        dimLabel: '0D',
        sizeLabel: '兩個點',
      },
      {
        label: '4y\u00B2 - 3 = 0',
        tex: '4y^2 - 3',
        fn: (_x, y) => 4 * y * y - 3,
        color: '#8a6a5a',
        dimLabel: '0D',
        sizeLabel: '單一點 (1, \\sqrt{3}/2)',
      },
    ],
  },
  {
    key: 'cross-constraints',
    label: '交叉約束',
    desc: '兩個二次方程把連續集縮減為離散點',
    steps: [
      {
        label: 'x\u00B2 - 1 = 0',
        tex: 'x^2 - 1',
        fn: (x, _y) => x * x - 1,
        color: 'var(--accent)',
        dimLabel: '1D',
        sizeLabel: '兩條直線 x = \\pm 1',
      },
      {
        label: 'y\u00B2 - 1 = 0',
        tex: 'y^2 - 1',
        fn: (_x, y) => y * y - 1,
        color: '#5a8a5a',
        dimLabel: '0D',
        sizeLabel: '四個點 (\\pm 1, \\pm 1)',
      },
    ],
  },
];

@Component({
  selector: 'app-step-ideal-to-variety',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="從理想到簇 V(I)：方程組的幾何" subtitle="§2.2">
      <p>
        給定生成元
        <app-math [e]="'f_1, \\\\ldots, f_k'" />，理想
        <app-math [e]="'I = (f_1, \\\\ldots, f_k)'" /> 決定簇：
      </p>
      <app-math block [e]="formulaVI"></app-math>
      <p>
        更多生成元意味著更多約束，簇因此<strong>縮小</strong>。
        Hilbert 基底定理保證：每個理想都是有限生成的——你永遠不需要無窮多個方程。
      </p>
      <p>
        關鍵洞見：V(I) 只取決於理想 I 本身，而不是你選擇的特定生成元。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="逐步加入方程，觀察零點集如何一步步縮小">
      <!-- Scenario presets -->
      <div class="preset-row">
        @for (s of scenarios; track s.key; let i = $index) {
          <button class="pre-btn" [class.active]="scenarioIdx() === i"
                  (click)="selectScenario(i)">{{ s.label }}</button>
        }
      </div>

      <!-- Step controls -->
      <div class="step-panel">
        <div class="step-header">
          <span class="step-title">生成元</span>
          <button class="reset-btn" (click)="resetSteps()">重置</button>
        </div>
        @for (step of activeScenario().steps; track step.label; let i = $index) {
          <button class="step-btn"
                  [class.active]="activeStepCount() > i"
                  [class.next]="activeStepCount() === i"
                  (click)="toggleStep(i)">
            <span class="step-num"
                  [style.background]="activeStepCount() > i ? step.color : 'var(--text-muted)'"
            >{{ i + 1 }}</span>
            <app-math [e]="step.tex + ' = 0'"></app-math>
            @if (activeStepCount() > i) {
              <span class="step-check">&#10003;</span>
            }
          </button>
        }
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Individual generator curves (dimmed, labeled) -->
        @for (gi of activeGenerators(); track gi.idx) {
          <path [attr.d]="gi.path" fill="none"
                [attr.stroke]="gi.color" stroke-width="1.2"
                stroke-dasharray="4 3" stroke-linecap="round" opacity="0.5" />
        }

        <!-- Intersection variety (bold) -->
        @if (activeStepCount() === 0) {
          <!-- No constraints: entire plane — show a label -->
          <text [attr.x]="v.svgW / 2" [attr.y]="v.svgH / 2"
                text-anchor="middle" class="plane-label">
            V = 整個平面 (無約束)
          </text>
        } @else {
          <path [attr.d]="intersectionPath()" fill="none" stroke="var(--accent)"
                stroke-width="3" stroke-linecap="round" />
          <!-- Mark intersection points if 0D -->
          @for (pt of intersectionPoints(); track $index) {
            <circle [attr.cx]="pt.sx" [attr.cy]="pt.sy" r="5"
                    fill="var(--accent)" stroke="#fff" stroke-width="1.5" />
          }
        }
      </svg>

      <!-- Info row -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">生成元數</div>
          <span class="ic-val">{{ activeStepCount() }}</span>
        </div>
        <div class="info-card">
          <div class="ic-title">維度</div>
          <span class="ic-val">{{ currentDimLabel() }}</span>
        </div>
        <div class="info-card">
          <div class="ic-title">零點集</div>
          @if (activeStepCount() > 0) {
            <app-math [e]="currentSizeLabel()"></app-math>
          } @else {
            <span class="ic-val">整個平面</span>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Hilbert 基底定理保證：無論多複雜的簇，都可以用有限多個多項式方程定義。
        這是計算代數幾何的基礎。下一節看代數和幾何之間最深刻的橋樑。
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
    .step-panel {
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); padding: 10px 12px; margin-bottom: 10px;
    }
    .step-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
    }
    .step-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .reset-btn {
      padding: 3px 10px; border-radius: 4px; border: 1px solid var(--border);
      background: var(--bg); color: var(--text-muted); font-size: 10px;
      cursor: pointer; font-family: 'JetBrains Mono', monospace;
      &:hover { border-color: var(--accent); color: var(--text); }
    }
    .step-btn {
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: 6px 8px; margin-bottom: 4px; border-radius: 6px;
      border: 1px solid var(--border); background: var(--bg);
      color: var(--text-secondary); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); }
      &.next { border-style: dashed; }
    }
    .step-num {
      width: 20px; height: 20px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; color: #fff;
      font-size: 10px; font-weight: 700; flex-shrink: 0;
    }
    .step-check {
      margin-left: auto; color: #5a8a5a; font-weight: 700; font-size: 14px;
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .plane-label {
      font-size: 14px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
    }
    .info-row {
      display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 100px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 13px;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .ic-val {
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
      color: var(--text); font-size: 14px;
    }
  `,
})
export class StepIdealToVarietyComponent {
  readonly scenarios = SCENARIOS;

  readonly formulaVI = `V(f_1, \\ldots, f_k) = \\bigcap_{i=1}^k V(f_i)`;

  readonly v: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 520, svgH: 400, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly scenarioIdx = signal(0);
  readonly activeStepCount = signal(0);

  readonly activeScenario = computed(() => SCENARIOS[this.scenarioIdx()]);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  selectScenario(idx: number): void {
    this.scenarioIdx.set(idx);
    this.activeStepCount.set(0);
  }

  resetSteps(): void {
    this.activeStepCount.set(0);
  }

  toggleStep(idx: number): void {
    // Clicking step i activates steps 0..i
    if (this.activeStepCount() > idx) {
      // Clicking an active step deactivates it and all after
      this.activeStepCount.set(idx);
    } else {
      this.activeStepCount.set(idx + 1);
    }
  }

  /** Individual generator curve paths */
  readonly activeGenerators = computed(() => {
    const scenario = this.activeScenario();
    const count = this.activeStepCount();
    const result: { idx: number; path: string; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const step = scenario.steps[i];
      result.push({
        idx: i,
        path: implicitCurve(
          step.fn, this.v.xRange, this.v.yRange,
          this.toSvgX, this.toSvgY, 100,
        ),
        color: step.color,
      });
    }
    return result;
  });

  /** Combined intersection variety path */
  readonly intersectionPath = computed(() => {
    const scenario = this.activeScenario();
    const count = this.activeStepCount();
    if (count === 0) return '';

    // For the intersection, use a product-of-squares approach:
    // the zero set of sum(fi^2) approximates intersection of V(fi)
    // But that gives a single point variety which marching squares can miss.
    // Instead, for single generator show it directly; for multiple,
    // use a penalty function: max(|f1|, |f2|, ...) ≈ 0
    if (count === 1) {
      return implicitCurve(
        scenario.steps[0].fn, this.v.xRange, this.v.yRange,
        this.toSvgX, this.toSvgY, 120,
      );
    }

    // For intersection of multiple curves, we draw using the trick:
    // f1^2 + f2^2 + ... = epsilon (a very small constant) approximates
    // the intersection. We use implicitCurve with f = f1^2+f2^2+...- eps.
    const eps = 0.01;
    const fns = scenario.steps.slice(0, count).map(s => s.fn);
    return implicitCurve(
      (x, y) => {
        let sum = 0;
        for (const fn of fns) {
          const v = fn(x, y);
          sum += v * v;
        }
        return sum - eps;
      },
      this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 160,
    );
  });

  /** Find intersection points numerically for 0D cases */
  readonly intersectionPoints = computed(() => {
    const scenario = this.activeScenario();
    const count = this.activeStepCount();
    if (count < 2) return [];

    const fns = scenario.steps.slice(0, count).map(s => s.fn);
    const pts: { sx: number; sy: number }[] = [];
    const [x0, x1] = this.v.xRange;
    const [y0, y1] = this.v.yRange;
    const N = 200;
    const dx = (x1 - x0) / N;
    const dy = (y1 - y0) / N;
    const raw: [number, number][] = [];

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const cx = x0 + (i + 0.5) * dx;
        const cy = y0 + (j + 0.5) * dy;
        let maxAbs = 0;
        for (const fn of fns) {
          maxAbs = Math.max(maxAbs, Math.abs(fn(cx, cy)));
        }
        if (maxAbs < 0.08) {
          raw.push([cx, cy]);
        }
      }
    }

    // Cluster
    const used = new Set<number>();
    for (let i = 0; i < raw.length; i++) {
      if (used.has(i)) continue;
      let sx = raw[i][0], sy = raw[i][1], cnt = 1;
      for (let j = i + 1; j < raw.length; j++) {
        if (used.has(j)) continue;
        if (Math.abs(raw[j][0] - raw[i][0]) < 0.3 && Math.abs(raw[j][1] - raw[i][1]) < 0.3) {
          sx += raw[j][0]; sy += raw[j][1]; cnt++;
          used.add(j);
        }
      }
      pts.push({ sx: this.toSvgX(sx / cnt), sy: this.toSvgY(sy / cnt) });
      used.add(i);
    }

    return pts;
  });

  readonly currentDimLabel = computed(() => {
    const count = this.activeStepCount();
    if (count === 0) return '2D';
    const scenario = this.activeScenario();
    return scenario.steps[count - 1].dimLabel;
  });

  readonly currentSizeLabel = computed(() => {
    const count = this.activeStepCount();
    if (count === 0) return '整個平面';
    const scenario = this.activeScenario();
    return scenario.steps[count - 1].sizeLabel;
  });
}
