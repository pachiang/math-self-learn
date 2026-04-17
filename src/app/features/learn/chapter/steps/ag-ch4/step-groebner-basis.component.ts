import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Buchberger algorithm step data ── */

interface AlgoStep {
  title: string;
  pair: string;
  sPolyTex: string;
  computationLines: string[];
  remainderTex: string;
  remainderZero: boolean;
  newElement: string | null;
  basisAfter: string;
}

const STEPS: AlgoStep[] = [
  {
    title: '步驟 1：初始基底',
    pair: '',
    sPolyTex: '',
    computationLines: [
      'G = \\{f_1, f_2\\} = \\{xy - 1,\\; y^2 - 1\\}',
    ],
    remainderTex: '',
    remainderZero: false,
    newElement: null,
    basisAfter: 'G = \\{f_1, f_2\\}',
  },
  {
    title: '步驟 2：計算 S(f_1, f_2)',
    pair: '(f_1, f_2)',
    sPolyTex: 'S(f_1, f_2) = \\frac{\\text{lcm}(xy,\\, y^2)}{xy} \\cdot f_1 - \\frac{\\text{lcm}(xy,\\, y^2)}{y^2} \\cdot f_2',
    computationLines: [
      '\\text{LM}(f_1) = xy,\\quad \\text{LM}(f_2) = y^2',
      '\\text{lcm}(xy,\\, y^2) = xy^2',
      '= \\frac{xy^2}{xy}(xy - 1) - \\frac{xy^2}{y^2}(y^2 - 1)',
      '= y(xy - 1) - x(y^2 - 1)',
      '= xy^2 - y - xy^2 + x',
      '= x - y',
    ],
    remainderTex: '\\overline{x - y}^{G} = x - y \\neq 0',
    remainderZero: false,
    newElement: 'f_3 = x - y',
    basisAfter: 'G = \\{f_1, f_2, f_3\\} = \\{xy - 1,\\; y^2 - 1,\\; x - y\\}',
  },
  {
    title: '步驟 3：計算 S(f_1, f_3)',
    pair: '(f_1, f_3)',
    sPolyTex: 'S(f_1, f_3) = \\frac{xy}{xy} \\cdot f_1 - \\frac{xy}{x} \\cdot f_3',
    computationLines: [
      '\\text{lcm}(xy,\\, x) = xy',
      '= f_1 - y \\cdot f_3',
      '= (xy - 1) - y(x - y)',
      '= xy - 1 - xy + y^2',
      '= y^2 - 1 = f_2',
    ],
    remainderTex: '\\overline{y^2 - 1}^{G} = 0',
    remainderZero: true,
    newElement: null,
    basisAfter: 'G = \\{f_1, f_2, f_3\\}',
  },
  {
    title: '步驟 4：計算 S(f_2, f_3)',
    pair: '(f_2, f_3)',
    sPolyTex: 'S(f_2, f_3) = \\frac{xy^2}{y^2} \\cdot f_2 - \\frac{xy^2}{x} \\cdot f_3',
    computationLines: [
      '\\text{lcm}(y^2,\\, x) = xy^2',
      '= x(y^2 - 1) - y^2(x - y)',
      '= xy^2 - x - xy^2 + y^3',
      '= y^3 - x',
    ],
    remainderTex: '\\text{除以 } G:\\; y^3 - x \\xrightarrow{f_2} y^3 - y^2 \\cdot f_2 \\text{ ...}',
    remainderZero: true,
    newElement: null,
    basisAfter: 'G = \\{f_1, f_2, f_3\\}',
  },
  {
    title: '步驟 5：化簡為 reduced Groebner basis',
    pair: '',
    sPolyTex: '',
    computationLines: [
      '\\text{檢查: } \\text{LT}(f_1) = xy \\text{ 可被 } \\text{LT}(f_3) = x \\text{ 整除}',
      '\\Rightarrow \\text{移除 } f_1',
      '\\text{Reduced Groebner basis:}',
    ],
    remainderTex: '',
    remainderZero: true,
    newElement: null,
    basisAfter: 'G_{\\text{reduced}} = \\{x - y,\\; y^2 - 1\\}',
  },
];

/* ── Visualization helper: find intersection points ── */
function findIntersections(
  curves: ((x: number, y: number) => number)[],
  xRange: [number, number],
  yRange: [number, number],
): [number, number][] {
  const N = 200;
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const dx = (x1 - x0) / N;
  const dy = (y1 - y0) / N;
  const threshold = 0.12;
  const raw: [number, number][] = [];

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const cx = x0 + (i + 0.5) * dx;
      const cy = y0 + (j + 0.5) * dy;
      let allSmall = true;
      for (const fn of curves) {
        if (Math.abs(fn(cx, cy)) >= threshold) { allSmall = false; break; }
      }
      if (allSmall) raw.push([cx, cy]);
    }
  }

  const merged: [number, number][] = [];
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
    merged.push([sx / cnt, sy / cnt]);
    used.add(i);
  }
  return merged;
}

@Component({
  selector: 'app-step-groebner-basis',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- §4.4 Prose block 1: Definition -->
    <app-prose-block title="Groebner 基與 Buchberger 演算法" subtitle="&sect;4.4">
      <p>
        Groebner 基 G 是理想 I 的一組特殊生成元，使得 I 的<strong>首項理想</strong>恰由 G 的首項生成：
      </p>
      <app-math block [e]="formulaLTIdeal"></app-math>
      <p>
        換言之：I 中<strong>每個</strong>元素的首項，都可以被某個
        <app-math [e]="'\\\\text{LT}(g_i)'" /> 整除。
        這使得多項式除法產生<strong>唯一</strong>的餘數——不再有歧義。
      </p>
    </app-prose-block>

    <!-- Prose block 2: Membership test -->
    <app-prose-block>
      <p>
        Groebner 基的關鍵性質：多項式 f 屬於理想 I，若且唯若 f 除以 G 的餘數為零：
      </p>
      <app-math block [e]="formulaMembership"></app-math>
      <p>
        這解決了<strong>理想成員判定問題</strong>：要檢驗一個多項式是否在理想中，
        只要做除法運算，看餘數是不是 0。
      </p>
    </app-prose-block>

    <!-- Prose block 3: Buchberger's algorithm -->
    <app-prose-block>
      <p>
        Buchberger 演算法從任意生成元出發，計算 Groebner 基：
      </p>
      <ol class="algo-list">
        <li>從 <app-math [e]="'F = \\\\{f_1, \\\\ldots, f_s\\\\}'" /> 開始</li>
        <li>對每一對 <app-math [e]="'(f_i, f_j)'" />，計算 S-多項式
            <app-math [e]="'S(f_i, f_j)'" /></li>
        <li>將 <app-math [e]="'S(f_i, f_j)'" /> 除以當前基底。若餘數
            <app-math [e]="'r \\\\neq 0'" />，加入基底</li>
        <li>重複，直到沒有新元素產生</li>
      </ol>
    </app-prose-block>

    <!-- Prose block 4: S-polynomial -->
    <app-prose-block>
      <p>
        S-多項式抵消 <app-math [e]="'f_i'" /> 和 <app-math [e]="'f_j'" />
        的首項，測試它們之間是否存在「隱藏」的關聯：
      </p>
      <app-math block [e]="formulaSPoly"></app-math>
    </app-prose-block>

    <!-- Interactive Buchberger demo -->
    <app-challenge-card prompt="觀察 Buchberger 演算法如何逐步構建 Groebner 基">
      <!-- Example description -->
      <div class="example-header">
        <div class="example-label">範例</div>
        <div class="example-ideal">
          <app-math [e]="exampleIdeal" />
        </div>
        <div class="example-note">lex 序 (x &gt; y)</div>
      </div>

      <!-- Current basis display -->
      <div class="basis-display">
        <div class="basis-label">當前基底</div>
        <div class="basis-content">
          <app-math block [e]="currentBasisTex()" />
        </div>
      </div>

      <!-- Step timeline -->
      <div class="timeline">
        @for (step of visibleSteps(); track $index; let i = $index) {
          <div class="step-card" [class.active]="i === currentStep() - 1"
               [class.success]="step.remainderZero && step.pair !== ''"
               [class.added]="step.newElement !== null">
            <div class="step-header">
              <span class="step-num">{{ i + 1 }}</span>
              <span class="step-title">{{ step.title }}</span>
            </div>

            <div class="step-body">
              @for (line of step.computationLines; track $index) {
                <app-math block [e]="line" />
              }

              @if (step.sPolyTex) {
                <div class="spoly-box">
                  <app-math block [e]="step.sPolyTex" />
                </div>
              }

              @if (step.remainderTex) {
                <div class="remainder-line" [class.zero]="step.remainderZero"
                     [class.nonzero]="!step.remainderZero">
                  <app-math [e]="step.remainderTex" />
                </div>
              }

              @if (step.newElement) {
                <div class="new-element">
                  <span class="new-tag">NEW</span>
                  <app-math [e]="step.newElement" />
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Controls -->
      <div class="controls">
        <button class="ctrl-btn" (click)="prevStep()" [disabled]="currentStep() <= 1">
          上一步
        </button>
        <span class="step-indicator">
          {{ currentStep() }} / {{ totalSteps }}
        </span>
        <button class="ctrl-btn primary" (click)="nextStep()"
                [disabled]="currentStep() >= totalSteps">
          下一步
        </button>
        <button class="ctrl-btn" (click)="resetSteps()">重置</button>
      </div>

      <!-- Final reduced basis (shown at end) -->
      @if (currentStep() >= totalSteps) {
        <div class="reduced-box">
          <div class="reduced-label">Reduced Groebner Basis</div>
          <app-math block [e]="reducedBasis" />
        </div>
      }
    </app-challenge-card>

    <!-- Insight -->
    @if (currentStep() >= totalSteps) {
      <app-prose-block title="幾何洞察">
        <p>
          Reduced Groebner 基
          <app-math [e]="'\\\\{x - y,\\; y^2 - 1\\\\}'" />
          告訴我們：簇 <app-math [e]="'V(I)'" /> 由
          <app-math [e]="'x = y'" /> <strong>且</strong>
          <app-math [e]="'y^2 = 1'" /> 定義，
          也就是只有兩個點 <app-math [e]="'(1, 1)'" /> 和
          <app-math [e]="'(-1, -1)'" />。
          比原始生成元直觀得多！
        </p>
      </app-prose-block>
    }

    <!-- SVG: original vs Groebner geometric comparison -->
    <app-challenge-card prompt="幾何對照：原始生成元 vs Groebner 基定義相同的簇">
      <div class="dual-panel">
        <!-- Left: V(f1, f2) original -->
        <div class="panel">
          <div class="panel-title">原始生成元</div>
          <div class="panel-subtitle">
            <app-math [e]="'V(xy - 1,\\; y^2 - 1)'" />
          </div>
          <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg-sm">
            <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)"
                  stroke-width="0.8" />
            <path [attr.d]="hyperbolaPath" fill="none" stroke="var(--accent)"
                  stroke-width="2" stroke-linecap="round" />
            <path [attr.d]="hLinesPosPath" fill="none" stroke="#5a8a5a"
                  stroke-width="2" stroke-linecap="round" />
            <path [attr.d]="hLinesNegPath" fill="none" stroke="#5a8a5a"
                  stroke-width="2" stroke-linecap="round" />
            @for (pt of intPoints; track $index) {
              <circle [attr.cx]="toSvgX(pt[0])" [attr.cy]="toSvgY(pt[1])" r="6"
                      fill="#cc4444" stroke="#fff" stroke-width="1.5" />
            }
            <!-- Labels -->
            <text [attr.x]="toSvgX(1.8)" [attr.y]="toSvgY(0.6)" class="curve-label accent-text">
              xy = 1
            </text>
            <text [attr.x]="toSvgX(1.5)" [attr.y]="toSvgY(1.15)" class="curve-label green-text">
              y = 1
            </text>
            <text [attr.x]="toSvgX(1.5)" [attr.y]="toSvgY(-0.8)" class="curve-label green-text">
              y = -1
            </text>
          </svg>
        </div>

        <!-- Right: V(Groebner basis) -->
        <div class="panel">
          <div class="panel-title">Groebner 基</div>
          <div class="panel-subtitle">
            <app-math [e]="'V(x - y,\\; y^2 - 1)'" />
          </div>
          <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg-sm">
            <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)"
                  stroke-width="0.8" />
            <path [attr.d]="diagLinePath" fill="none" stroke="var(--accent)"
                  stroke-width="2" stroke-linecap="round" />
            <path [attr.d]="hLinesPosPath" fill="none" stroke="#5a8a5a"
                  stroke-width="2" stroke-linecap="round" />
            <path [attr.d]="hLinesNegPath" fill="none" stroke="#5a8a5a"
                  stroke-width="2" stroke-linecap="round" />
            @for (pt of intPoints; track $index) {
              <circle [attr.cx]="toSvgX(pt[0])" [attr.cy]="toSvgY(pt[1])" r="6"
                      fill="#cc4444" stroke="#fff" stroke-width="1.5" />
            }
            <!-- Labels -->
            <text [attr.x]="toSvgX(1.6)" [attr.y]="toSvgY(1.8)" class="curve-label accent-text">
              x = y
            </text>
            <text [attr.x]="toSvgX(1.5)" [attr.y]="toSvgY(1.15)" class="curve-label green-text">
              y = 1
            </text>
            <text [attr.x]="toSvgX(1.5)" [attr.y]="toSvgY(-0.8)" class="curve-label green-text">
              y = -1
            </text>
          </svg>
        </div>
      </div>

      <div class="insight-box">
        兩組生成元定義<strong>完全相同</strong>的簇：(1, 1) 和 (-1, -1)。
        Groebner 基的三角結構讓解的結構一目了然。
      </div>
    </app-challenge-card>

    <!-- Closing prose -->
    <app-prose-block>
      <p>
        Buchberger 演算法是計算代數幾何的基石。它把任意生成元轉換成 Groebner 基，
        使得理想成員判定和商環計算都變得可行。下一節看它最強大的應用：消去變數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .algo-list {
      margin: 8px 0 4px 0; padding-left: 20px; line-height: 2;
      font-size: 14px;
    }
    .algo-list li { margin: 2px 0; }

    /* ── Example header ── */
    .example-header {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      margin-bottom: 12px; padding: 8px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
    }
    .example-label {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .example-ideal { font-size: 14px; flex: 1; }
    .example-note {
      font-size: 11px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Current basis ── */
    .basis-display {
      margin-bottom: 14px; padding: 10px 14px;
      border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10);
    }
    .basis-label {
      font-size: 10px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .basis-content { font-size: 14px; }

    /* ── Timeline ── */
    .timeline {
      display: flex; flex-direction: column; gap: 10px;
      margin-bottom: 14px;
    }
    .step-card {
      border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .step-card.active {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-10);
    }
    .step-card.added {
      border-color: #5a8a5a;
    }
    .step-header {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 14px;
      background: var(--bg); border-bottom: 1px solid var(--border);
    }
    .step-num {
      width: 24px; height: 24px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; flex-shrink: 0;
      background: var(--accent-10); color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
    .step-title {
      font-size: 13px; font-weight: 600; color: var(--text);
    }
    .step-body {
      padding: 10px 14px;
    }
    .spoly-box {
      margin: 8px 0; padding: 8px 12px;
      border-left: 3px solid var(--accent); background: var(--bg);
      border-radius: 0 6px 6px 0;
    }
    .remainder-line {
      margin: 8px 0; padding: 6px 12px; border-radius: 6px;
      font-size: 13px;
    }
    .remainder-line.zero {
      background: rgba(90, 138, 90, 0.1); border: 1px solid rgba(90, 138, 90, 0.3);
    }
    .remainder-line.nonzero {
      background: rgba(204, 160, 68, 0.1); border: 1px solid rgba(204, 160, 68, 0.3);
    }
    .new-element {
      display: flex; align-items: center; gap: 8px;
      margin: 8px 0; padding: 6px 12px; border-radius: 6px;
      background: rgba(90, 138, 90, 0.1); border: 1px solid rgba(90, 138, 90, 0.3);
    }
    .new-tag {
      font-size: 9px; font-weight: 700; color: #fff;
      background: #5a8a5a; padding: 2px 6px; border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Controls ── */
    .controls {
      display: flex; align-items: center; gap: 8px; justify-content: center;
      margin-bottom: 14px;
    }
    .ctrl-btn {
      padding: 7px 16px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover:not(:disabled) { border-color: var(--accent); }
      &:disabled { opacity: 0.4; cursor: default; }
      &.primary {
        background: var(--accent); color: #fff; border-color: var(--accent);
        &:hover:not(:disabled) { opacity: 0.85; }
      }
    }
    .step-indicator {
      font-size: 12px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      min-width: 50px; text-align: center;
    }

    /* ── Reduced basis ── */
    .reduced-box {
      margin-bottom: 14px; padding: 14px;
      border: 2px solid #5a8a5a; border-radius: 10px;
      background: rgba(90, 138, 90, 0.06); text-align: center;
    }
    .reduced-label {
      font-size: 11px; font-weight: 700; color: #5a8a5a;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
    }

    /* ── Dual-panel SVG ── */
    .dual-panel {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      margin-bottom: 12px;
    }
    @media (max-width: 600px) {
      .dual-panel { grid-template-columns: 1fr; }
    }
    .panel {
      display: flex; flex-direction: column; align-items: center;
    }
    .panel-title {
      font-size: 12px; font-weight: 700; color: var(--text);
      margin-bottom: 2px;
    }
    .panel-subtitle {
      font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;
    }
    .plot-svg-sm {
      width: 100%; max-width: 280px; display: block;
      border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg);
    }
    .curve-label {
      font-size: 10px; font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    .accent-text { fill: var(--accent); }
    .green-text { fill: #5a8a5a; }

    /* ── Insight box ── */
    .insight-box {
      padding: 10px 14px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--bg-surface);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      text-align: center;
    }
  `,
})
export class StepGroebnerBasisComponent {
  /* ── KaTeX formulas ── */
  readonly formulaLTIdeal = `\\langle \\text{LT}(I) \\rangle = \\langle \\text{LT}(g_1), \\ldots, \\text{LT}(g_t) \\rangle`;

  readonly formulaMembership = `f \\in I \\;\\Longleftrightarrow\\; \\overline{f}^{\\,G} = 0`;

  readonly formulaSPoly = `S(f, g) = \\frac{\\text{lcm}(\\text{LM}(f),\\, \\text{LM}(g))}{\\text{LT}(f)} \\cdot f \\;-\\; \\frac{\\text{lcm}(\\text{LM}(f),\\, \\text{LM}(g))}{\\text{LT}(g)} \\cdot g`;

  readonly exampleIdeal = `I = \\langle f_1, f_2 \\rangle = \\langle xy - 1,\\; y^2 - 1 \\rangle`;

  readonly reducedBasis = `G_{\\text{reduced}} = \\{\\, x - y,\\; y^2 - 1 \\,\\}`;

  /* ── Algorithm steps ── */
  readonly steps = STEPS;
  readonly totalSteps = STEPS.length;
  readonly currentStep = signal(1);

  readonly visibleSteps = computed(() => this.steps.slice(0, this.currentStep()));

  readonly currentBasisTex = computed(() => {
    const idx = this.currentStep() - 1;
    return this.steps[idx].basisAfter;
  });

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(v => v + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    }
  }

  resetSteps(): void {
    this.currentStep.set(1);
  }

  /* ── SVG visualization ── */
  readonly v: PlotView = {
    xRange: [-3, 3], yRange: [-3, 3], svgW: 280, svgH: 280, pad: 24,
  };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /* Original: xy = 1 (hyperbola) */
  readonly hyperbolaPath = implicitCurve(
    (x, y) => x * y - 1,
    this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120,
  );

  /* y = 1 and y = -1 horizontal lines */
  readonly hLinesPosPath = implicitCurve(
    (_x, y) => y - 1,
    this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 80,
  );

  readonly hLinesNegPath = implicitCurve(
    (_x, y) => y + 1,
    this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 80,
  );

  /* Groebner: x = y (diagonal line) */
  readonly diagLinePath = implicitCurve(
    (x, y) => x - y,
    this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 80,
  );

  /* Intersection points: (1,1) and (-1,-1) */
  readonly intPoints: [number, number][] = [[1, 1], [-1, -1]];
}
