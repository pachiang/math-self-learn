import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, contourPaths, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Preset examples ── */

interface NullExample {
  key: string;
  label: string;
  /** Original ideal generators */
  jTex: string;
  jDesc: string;
  /** The function f whose powers define J */
  f: (x: number, y: number) => number;
  /** f squared (or higher power) */
  fPow: (x: number, y: number) => number;
  fTex: string;
  fPowTex: string;
  fPowLabel: string;
  /** Radical generators */
  radTex: string;
  radDesc: string;
  /** Variety description */
  varietyTex: string;
  varietyDesc: string;
  /** Contour levels for comparison */
  contourLevels: number[];
  /** Optional note */
  note?: string;
}

const EXAMPLES: NullExample[] = [
  {
    key: 'x2-vs-x',
    label: 'x\u00B2 vs x',
    jTex: '(x^2)',
    jDesc: 'J = (x\u00B2)',
    f: (x, _y) => x,
    fPow: (x, _y) => x * x,
    fTex: 'x',
    fPowTex: 'x^2',
    fPowLabel: 'x\u00B2',
    radTex: '\\sqrt{(x^2)} = (x)',
    radDesc: '\u221AJ = (x)',
    varietyTex: 'V(J) = V(x) = \\{x = 0\\}',
    varietyDesc: 'y 軸',
    contourLevels: [-1.5, -1, -0.5, 0.25, 0.5, 1, 1.5],
  },
  {
    key: 'x2y-vs-xy',
    label: 'x\u00B2y vs xy',
    jTex: '(x^2 y)',
    jDesc: 'J = (x\u00B2y)',
    f: (x, y) => x * y,
    fPow: (x, y) => x * x * y,
    fTex: 'xy',
    fPowTex: 'x^2 y',
    fPowLabel: 'x\u00B2y',
    radTex: '\\sqrt{(x^2 y)} = (xy)',
    radDesc: '\u221AJ = (xy)',
    varietyTex: 'V(J) = V(xy) = \\{x=0\\} \\cup \\{y=0\\}',
    varietyDesc: '兩坐標軸',
    contourLevels: [-1, -0.5, -0.25, 0.25, 0.5, 1],
  },
  {
    key: 'circle-sq',
    label: '(x\u00B2+y\u00B2-1)\u00B2 vs x\u00B2+y\u00B2-1',
    jTex: '((x^2+y^2-1)^2)',
    jDesc: 'J = ((x\u00B2+y\u00B2-1)\u00B2)',
    f: (x, y) => x * x + y * y - 1,
    fPow: (x, y) => { const t = x * x + y * y - 1; return t * t; },
    fTex: 'x^2+y^2-1',
    fPowTex: '(x^2+y^2-1)^2',
    fPowLabel: '(x\u00B2+y\u00B2-1)\u00B2',
    radTex: '\\sqrt{((x^2+y^2-1)^2)} = (x^2+y^2-1)',
    radDesc: '\u221AJ = (x\u00B2+y\u00B2-1)',
    varietyTex: 'V(J) = \\{x^2+y^2 = 1\\}',
    varietyDesc: '單位圓',
    contourLevels: [-1, -0.5, -0.25, 0.25, 0.5, 1],
  },
  {
    key: 'origin-real',
    label: 'x\u00B2+y\u00B2 (原點)',
    jTex: '(x^2+y^2)',
    jDesc: 'J = (x\u00B2+y\u00B2)',
    f: (x, y) => Math.sqrt(x * x + y * y),
    fPow: (x, y) => x * x + y * y,
    fTex: '\\sqrt{x^2+y^2}',
    fPowTex: 'x^2+y^2',
    fPowLabel: 'x\u00B2+y\u00B2',
    radTex: '\\sqrt{(x^2+y^2)} = (x, y)',
    radDesc: '\u221AJ = (x, y) = 極大理想',
    varietyTex: 'V(x^2+y^2) = \\{(0,0)\\}',
    varietyDesc: '原點',
    contourLevels: [0.25, 0.5, 1, 2, 3, 4],
    note: '在實數域上 V 只有原點 (0,0)。在複數域上 x\u00B2+y\u00B2 = (x+iy)(x-iy)，零點集是兩條複直線!',
  },
];

@Component({
  selector: 'app-step-ag-nullstellensatz',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Nullstellensatz：代數幾何的基石" subtitle="§2.3">
      <p>
        <strong>弱 Nullstellensatz</strong>（Weak Nullstellensatz）：
        V(I) 是空集若且唯若 1 屬於 I——也就是說，理想就是整個多項式環。
      </p>
      <app-math block [e]="formulaWeak"></app-math>
      <p>
        「沒有公共零點」等價於「理想包含常數 1」。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>強 Nullstellensatz</strong>（Strong Nullstellensatz）：
        對任意理想 J，I(V(J)) 等於 J 的<strong>根式</strong>（radical）。
      </p>
      <app-math block [e]="formulaStrong"></app-math>
      <p>
        根式「忘記重數」：
        <app-math [e]="'x^2'" /> 和 <app-math [e]="'x'" /> 定義相同的簇 V(x) = V(x²)，
        但 <app-math [e]="'(x^2) \\\\neq (x)'" />。
        根式 <app-math [e]="'\\\\sqrt{(x^2)} = (x)'" />。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>直覺</strong>：<app-math [e]="'f^2'" /> 在 V(f) 上消失得和 f 一樣好——
        平方不改變零點集。從簇的角度看，<app-math [e]="'f^2'" /> 和 f 是「同一個約束」。
        根式正好抓住了這一點：<app-math [e]="'\\\\sqrt{(f^2)} = (f)'" />。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察：不同的理想可以定義相同的簇——根式理想抓住了這個等價">
      <!-- Example presets -->
      <div class="preset-row">
        @for (ex of examples; track ex.key; let i = $index) {
          <button class="pre-btn" [class.active]="exIdx() === i"
                  (click)="exIdx.set(i)">{{ ex.label }}</button>
        }
      </div>

      <!-- View toggle -->
      <div class="mode-row">
        <button class="mode-btn" [class.active]="viewMode() === 'zero-set'"
                (click)="viewMode.set('zero-set')">零點集比較</button>
        <button class="mode-btn" [class.active]="viewMode() === 'contours'"
                (click)="viewMode.set('contours')">等高線比較</button>
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        @if (viewMode() === 'zero-set') {
          <!-- f = 0 thick accent -->
          <path [attr.d]="fZeroPath()" fill="none" stroke="var(--accent)"
                stroke-width="3" stroke-linecap="round" />
          <!-- f^n = 0 dashed overlay (same set!) -->
          <path [attr.d]="fPowZeroPath()" fill="none" stroke="#5a8a5a"
                stroke-width="2" stroke-dasharray="6 3" stroke-linecap="round" />
          <!-- Label -->
          <text x="40" y="30" class="curve-label accent-text">
            f = {{ activeExample().fTex.length > 12 ? 'original' : activeExample().fTex }}
          </text>
          <text x="40" y="48" class="curve-label green-text">
            f\u00B2 = {{ activeExample().fPowLabel }} (same zeros)
          </text>
          <!-- Origin marker for origin example -->
          @if (activeExample().key === 'origin-real') {
            <circle [attr.cx]="toSvgX(0)" [attr.cy]="toSvgY(0)" r="6"
                    fill="var(--accent)" stroke="#fff" stroke-width="1.5" />
          }
        } @else {
          <!-- Contour comparison mode -->
          <!-- f contours in accent -->
          @for (c of fContours(); track c.level) {
            <path [attr.d]="c.path" fill="none" stroke="var(--accent)"
                  stroke-width="1" stroke-linecap="round" opacity="0.6" />
          }
          <!-- f^n contours in green -->
          @for (c of fPowContours(); track c.level) {
            <path [attr.d]="c.path" fill="none" stroke="#5a8a5a"
                  stroke-width="1" stroke-linecap="round" opacity="0.6" />
          }
          <!-- Zero set (shared) as bold -->
          <path [attr.d]="fZeroPath()" fill="none" stroke="var(--text)"
                stroke-width="2.5" stroke-linecap="round" />
          <!-- Origin marker for origin example -->
          @if (activeExample().key === 'origin-real') {
            <circle [attr.cx]="toSvgX(0)" [attr.cy]="toSvgY(0)" r="6"
                    fill="var(--text)" stroke="#fff" stroke-width="1.5" />
          }
          <!-- Legend -->
          <text x="40" y="30" class="curve-label accent-text">
            f 等高線
          </text>
          <text x="40" y="48" class="curve-label green-text">
            f\u00B2 等高線 (更稀疏 = 更高階零點)
          </text>
        }
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">理想 J</div>
          <app-math [e]="'J = ' + activeExample().jTex"></app-math>
        </div>
        <div class="info-card">
          <div class="ic-title">簇 V(J)</div>
          <app-math [e]="activeExample().varietyTex"></app-math>
        </div>
      </div>
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">根式 &#8730;J</div>
          <app-math [e]="activeExample().radTex"></app-math>
        </div>
        <div class="info-card badge-card">
          <span class="badge ok-badge">I(V(J)) = &#8730;J</span>
        </div>
      </div>

      <!-- Note -->
      @if (activeExample().note) {
        <div class="note-box">
          {{ activeExample().note }}
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Nullstellensatz 是代數幾何的 Rosetta Stone：
        它翻譯代數語言（理想）和幾何語言（簇）。
        根式理想正好對應簇——不多不少。這個對應是整個學科的基礎。
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
    .mode-row {
      display: flex; gap: 8px; margin-bottom: 8px;
    }
    .mode-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .curve-label {
      font-size: 10px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .accent-text { fill: var(--accent); }
    .green-text { fill: #5a8a5a; }
    .info-row {
      display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 140px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 13px;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .ok-badge {
      background: rgba(90,138,90,0.12); color: #5a8a5a;
      border: 1px solid rgba(90,138,90,0.3);
    }
    .note-box {
      padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); font-size: 12px; color: var(--text-secondary);
      line-height: 1.6; margin-top: 4px;
    }
  `,
})
export class StepAgNullstellensatzComponent {
  readonly examples = EXAMPLES;

  readonly formulaWeak = `V(I) = \\varnothing \\;\\;\\Longleftrightarrow\\;\\; 1 \\in I`;
  readonly formulaStrong = `I(V(J)) = \\sqrt{J} = \\{f : f^n \\in J \\text{ for some } n \\geq 1\\}`;

  readonly v: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 520, svgH: 400, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly exIdx = signal(0);
  readonly viewMode = signal<'zero-set' | 'contours'>('zero-set');

  readonly activeExample = computed(() => EXAMPLES[this.exIdx()]);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /** Zero set of f */
  readonly fZeroPath = computed(() => {
    const ex = this.activeExample();
    return implicitCurve(
      ex.f, this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 120,
    );
  });

  /** Zero set of f^n (should be identical to fZeroPath) */
  readonly fPowZeroPath = computed(() => {
    const ex = this.activeExample();
    return implicitCurve(
      ex.fPow, this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 120,
    );
  });

  /** Contours of f */
  readonly fContours = computed(() => {
    const ex = this.activeExample();
    return contourPaths(
      ex.f, ex.contourLevels,
      this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 80,
    );
  });

  /** Contours of f^n — same levels, but curves are more spread apart near the zero set */
  readonly fPowContours = computed(() => {
    const ex = this.activeExample();
    return contourPaths(
      ex.fPow, ex.contourLevels,
      this.v.xRange, this.v.yRange,
      this.toSvgX, this.toSvgY, 80,
    );
  });
}
