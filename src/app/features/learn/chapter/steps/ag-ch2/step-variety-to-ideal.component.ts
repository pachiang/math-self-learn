import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Variety presets ── */

interface TestPoly {
  label: string;
  tex: string;
  fn: (x: number, y: number) => number;
  inIdeal: boolean;
}

interface VarietyPreset {
  key: string;
  label: string;
  desc: string;
  /** implicit equation f(x,y)=0 defining V */
  vFn: (x: number, y: number) => number;
  vTex: string;
  /** sample points on V for visual confirmation */
  samplePoints: [number, number][];
  testPolys: TestPoly[];
}

const PRESETS: VarietyPreset[] = [
  {
    key: 'circle',
    label: '單位圓 x\u00B2+y\u00B2=1',
    desc: '單位圓 V = {(x,y) : x\u00B2+y\u00B2 = 1}',
    vFn: (x, y) => x * x + y * y - 1,
    vTex: 'x^2 + y^2 - 1 = 0',
    samplePoints: [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [Math.SQRT1_2, Math.SQRT1_2], [-Math.SQRT1_2, Math.SQRT1_2],
      [Math.SQRT1_2, -Math.SQRT1_2], [-Math.SQRT1_2, -Math.SQRT1_2],
      [0.5, Math.sqrt(0.75)], [-0.5, -Math.sqrt(0.75)],
    ],
    testPolys: [
      { label: 'x\u00B2+y\u00B2-1', tex: 'x^2+y^2-1', fn: (x, y) => x * x + y * y - 1, inIdeal: true },
      { label: 'x', tex: 'x', fn: (x, _y) => x, inIdeal: false },
      { label: 'y', tex: 'y', fn: (_x, y) => y, inIdeal: false },
      { label: '(x\u00B2+y\u00B2-1)\u00B7x', tex: '(x^2+y^2-1)\\cdot x', fn: (x, y) => (x * x + y * y - 1) * x, inIdeal: true },
      { label: '(x\u00B2+y\u00B2-1)\u00B2', tex: '(x^2+y^2-1)^2', fn: (x, y) => { const t = x * x + y * y - 1; return t * t; }, inIdeal: true },
      { label: 'x\u00B2-y\u00B2', tex: 'x^2-y^2', fn: (x, y) => x * x - y * y, inIdeal: false },
    ],
  },
  {
    key: 'x-axis',
    label: 'x 軸 y=0',
    desc: 'x 軸 V = {(x,0) : x \\in \\mathbb{R}}',
    vFn: (_x, y) => y,
    vTex: 'y = 0',
    samplePoints: [
      [-2, 0], [-1.5, 0], [-1, 0], [-0.5, 0], [0, 0],
      [0.5, 0], [1, 0], [1.5, 0], [2, 0],
    ],
    testPolys: [
      { label: 'y', tex: 'y', fn: (_x, y) => y, inIdeal: true },
      { label: 'y\u00B2', tex: 'y^2', fn: (_x, y) => y * y, inIdeal: true },
      { label: 'xy', tex: 'xy', fn: (x, y) => x * y, inIdeal: true },
      { label: 'x', tex: 'x', fn: (x, _y) => x, inIdeal: false },
      { label: 'y+1', tex: 'y+1', fn: (_x, y) => y + 1, inIdeal: false },
      { label: 'y\u00B7(x\u00B2+1)', tex: 'y(x^2+1)', fn: (x, y) => y * (x * x + 1), inIdeal: true },
    ],
  },
  {
    key: 'origin',
    label: '原點 (0,0)',
    desc: '原點 V = {(0,0)}',
    vFn: (x, y) => x * x + y * y,
    vTex: 'x^2 + y^2 = 0 \\;(\\text{over } \\mathbb{R})',
    samplePoints: [[0, 0]],
    testPolys: [
      { label: 'x', tex: 'x', fn: (x, _y) => x, inIdeal: true },
      { label: 'y', tex: 'y', fn: (_x, y) => y, inIdeal: true },
      { label: 'x\u00B2+y\u00B2', tex: 'x^2+y^2', fn: (x, y) => x * x + y * y, inIdeal: true },
      { label: 'x-1', tex: 'x-1', fn: (x, _y) => x - 1, inIdeal: false },
      { label: 'xy', tex: 'xy', fn: (x, y) => x * y, inIdeal: true },
    ],
  },
  {
    key: 'two-axes',
    label: '兩條線 xy=0',
    desc: '兩坐標軸 V = {xy = 0}',
    vFn: (x, y) => x * y,
    vTex: 'xy = 0',
    samplePoints: [
      [0, -2], [0, -1], [0, 0], [0, 1], [0, 2],
      [-2, 0], [-1, 0], [1, 0], [2, 0],
    ],
    testPolys: [
      { label: 'xy', tex: 'xy', fn: (x, y) => x * y, inIdeal: true },
      { label: 'x\u00B7y\u00B2', tex: 'xy^2', fn: (x, y) => x * y * y, inIdeal: true },
      { label: 'x', tex: 'x', fn: (x, _y) => x, inIdeal: false },
      { label: 'y', tex: 'y', fn: (_x, y) => y, inIdeal: false },
      { label: 'x\u00B2y+xy\u00B2', tex: 'x^2y+xy^2', fn: (x, y) => x * x * y + x * y * y, inIdeal: true },
    ],
  },
];

@Component({
  selector: 'app-step-variety-to-ideal',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="從簇到理想 I(V)" subtitle="§2.1">
      <p>
        給定一個幾何形狀 V，我們可以問：哪些多項式在 V 的<strong>每一個點</strong>上都等於零？
        這些多項式構成多項式環中的一個<strong>理想</strong> I(V)。
      </p>
      <app-math block [e]="formulaIV"></app-math>
      <p>
        I(V) 確實是一個理想：如果 f, g 都在 V 上消失，那麼 f + g 也在 V 上消失；
        而 h &middot; f 對任意多項式 h 也在 V 上消失。
      </p>
      <p>
        <strong>例：</strong> V = 單位圓。 則
        <app-math [e]="'x^2+y^2-1 \\\\in I(V)'" />，也有
        <app-math [e]="'(x^2+y^2-1)\\\\cdot x \\\\in I(V)'" />。但
        <app-math [e]="'x \\\\notin I(V)'" />，因為 x 不在圓上的所有點消失
        （例如 (0,1) 上 x=0 但 (1,0) 上 x=1）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇一個簇，然後測試各多項式——它是否在每一點上為零？">
      <!-- Variety presets -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i"
                  (click)="selectPreset(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Test polynomial toggles -->
      <div class="poly-row">
        @for (tp of activePreset().testPolys; track tp.label; let i = $index) {
          <button class="poly-btn"
                  [class.active]="selectedPolyIdx() === i"
                  [class.in-ideal]="selectedPolyIdx() === i && tp.inIdeal"
                  [class.not-ideal]="selectedPolyIdx() === i && !tp.inIdeal"
                  (click)="selectedPolyIdx.set(i)">
            <app-math [e]="tp.tex"></app-math>
          </button>
        }
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Variety V (thick accent) -->
        <path [attr.d]="varietyPath()" fill="none" stroke="var(--accent)" stroke-width="2.5"
              stroke-linecap="round" />

        <!-- Test polynomial zero set (thin dashed) -->
        @if (selectedPolyIdx() !== null) {
          <path [attr.d]="testPolyPath()" fill="none" stroke="#7a9abf"
                stroke-width="1.5" stroke-dasharray="5 3" stroke-linecap="round" />
        }

        <!-- Sample points with verdict -->
        @for (sp of sampleVerdicts(); track $index) {
          @if (sp.isZero) {
            <!-- green dot for vanishes -->
            <circle [attr.cx]="sp.sx" [attr.cy]="sp.sy" r="5"
                    fill="#5a8a5a" stroke="#fff" stroke-width="1" />
            <text [attr.x]="sp.sx + 8" [attr.y]="sp.sy - 6"
                  class="verdict-label ok-label" font-size="9">0</text>
          } @else {
            <!-- red dot for non-zero -->
            <circle [attr.cx]="sp.sx" [attr.cy]="sp.sy" r="5"
                    fill="#cc4444" stroke="#fff" stroke-width="1" />
            <text [attr.x]="sp.sx + 8" [attr.y]="sp.sy - 6"
                  class="verdict-label fail-label" font-size="9">{{ sp.valStr }}</text>
          }
        }
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">簇 V</div>
          <app-math [e]="activePreset().vTex"></app-math>
        </div>
        @if (selectedPolyIdx() !== null) {
          <div class="info-card">
            <div class="ic-title">測試多項式 f</div>
            <app-math [e]="selectedPoly().tex"></app-math>
          </div>
          <div class="info-card badge-card">
            @if (selectedPoly().inIdeal) {
              <span class="badge ideal-badge">f &#8712; I(V) -- f 在 V 上處處為零</span>
            } @else {
              <span class="badge not-ideal-badge">f &#8713; I(V) -- 存在 V 上的點使 f &#8800; 0</span>
            }
          </div>
        } @else {
          <div class="info-card badge-card">
            <span class="badge muted-badge">選擇一個測試多項式</span>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        I(V) 收集了所有「知道 V 長什麼樣」的代數資訊。
        反過來的問題更有趣：如果我們從理想 I 出發，能不能恢復簇 V？
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
    .poly-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    }
    .poly-btn {
      padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { font-weight: 600; }
      &.in-ideal { background: rgba(90,138,90,0.1); border-color: #5a8a5a; color: #5a8a5a; }
      &.not-ideal { background: rgba(204,68,68,0.1); border-color: #cc4444; color: #cc4444; }
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .verdict-label {
      font-family: 'JetBrains Mono', monospace; font-weight: 700;
    }
    .ok-label { fill: #5a8a5a; }
    .fail-label { fill: #cc4444; }
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
    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .ideal-badge { background: rgba(90,138,90,0.12); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.3); }
    .not-ideal-badge { background: rgba(204,68,68,0.12); color: #cc4444; border: 1px solid rgba(204,68,68,0.3); }
    .muted-badge { background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border); }
  `,
})
export class StepVarietyToIdealComponent {
  readonly presets = PRESETS;

  readonly formulaIV = `I(V) = \\{f \\in k[x,y] : f(p) = 0 \\;\\;\\forall p \\in V\\}`;

  readonly v: PlotView = { xRange: [-2.5, 2.5], yRange: [-2.5, 2.5], svgW: 520, svgH: 400, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly presetIdx = signal(0);
  readonly selectedPolyIdx = signal<number | null>(null);

  readonly activePreset = computed(() => PRESETS[this.presetIdx()]);

  readonly selectedPoly = computed(() => {
    const idx = this.selectedPolyIdx();
    if (idx === null) return this.activePreset().testPolys[0];
    return this.activePreset().testPolys[idx];
  });

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  selectPreset(idx: number): void {
    this.presetIdx.set(idx);
    this.selectedPolyIdx.set(null);
  }

  readonly varietyPath = computed(() => {
    const preset = this.activePreset();
    // For origin preset, the implicit curve won't show a point well;
    // we handle it via sample points only
    return implicitCurve(
      preset.vFn, this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 120,
    );
  });

  readonly testPolyPath = computed(() => {
    const idx = this.selectedPolyIdx();
    if (idx === null) return '';
    const poly = this.activePreset().testPolys[idx];
    return implicitCurve(
      poly.fn, this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 100,
    );
  });

  readonly sampleVerdicts = computed(() => {
    const preset = this.activePreset();
    const idx = this.selectedPolyIdx();
    if (idx === null) {
      // Show sample points without verdict
      return preset.samplePoints.map(([px, py]) => ({
        sx: this.toSvgX(px),
        sy: this.toSvgY(py),
        isZero: true,
        valStr: '',
      }));
    }
    const poly = preset.testPolys[idx];
    return preset.samplePoints.map(([px, py]) => {
      const val = poly.fn(px, py);
      const isZero = Math.abs(val) < 1e-9;
      return {
        sx: this.toSvgX(px),
        sy: this.toSvgY(py),
        isZero,
        valStr: isZero ? '' : val.toFixed(2),
      };
    });
  });
}
