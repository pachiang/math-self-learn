import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Solution steps for the elimination example ── */

interface SolveStep {
  title: string;
  descLines: string[];
  mathLines: string[];
  highlight: 'neutral' | 'eliminate' | 'solve' | 'result';
}

const SOLVE_STEPS: SolveStep[] = [
  {
    title: '步驟 1：計算 lex Groebner 基',
    descLines: [
      '對 I = (x^2 + y^2 - 5,\\; xy - 2) 使用 lex 序 (x > y)，',
      '計算 Groebner 基。經過 Buchberger 演算法：',
    ],
    mathLines: [
      'G = \\{\\, g_1,\\; g_2 \\,\\}',
      'g_1 = 2x + y^3 - 5y',
      'g_2 = y^4 - 5y^2 + 4',
    ],
    highlight: 'neutral',
  },
  {
    title: '步驟 2：消去 x',
    descLines: [
      'g_2 只含 y，不含 x——這就是消去的力量！',
      'g_2 屬於消去理想 I_1 = I \\cap k[y]。',
    ],
    mathLines: [
      '\\text{消去理想: } I_1 = I \\cap k[y]',
      'g_2 = y^4 - 5y^2 + 4 \\;\\in\\; k[y]',
    ],
    highlight: 'eliminate',
  },
  {
    title: '步驟 3：解一元方程',
    descLines: [
      '將 g_2 因式分解，得到 y 的所有可能值：',
    ],
    mathLines: [
      'y^4 - 5y^2 + 4 = (y^2 - 1)(y^2 - 4) = 0',
      'y = \\pm 1,\\quad y = \\pm 2',
    ],
    highlight: 'solve',
  },
  {
    title: '步驟 4：回代求 x',
    descLines: [
      '由 g_1 = 2x + y^3 - 5y = 0 得 x = -(y^3 - 5y)/2，',
      '逐一代入每個 y 值：',
    ],
    mathLines: [
      'y = 1:\\; x = \\tfrac{-(1 - 5)}{2} = 2 \\;\\Rightarrow\\; (2,\\, 1)',
      'y = -1:\\; x = \\tfrac{-(-1 + 5)}{2} = -2 \\;\\Rightarrow\\; (-2,\\, -1)',
      'y = 2:\\; x = \\tfrac{-(8 - 10)}{2} = 1 \\;\\Rightarrow\\; (1,\\, 2)',
      'y = -2:\\; x = \\tfrac{-(-8 + 10)}{2} = -1 \\;\\Rightarrow\\; (-1,\\, -2)',
    ],
    highlight: 'result',
  },
];

/* ── The four solution points ── */
const SOLUTIONS: { x: number; y: number; label: string }[] = [
  { x: 2,  y: 1,  label: '(2, 1)' },
  { x: -2, y: -1, label: '(-2, -1)' },
  { x: 1,  y: 2,  label: '(1, 2)' },
  { x: -1, y: -2, label: '(-1, -2)' },
];

/* ── Analogy table data ── */
interface AnalogyRow {
  topic: string;
  linear: string;
  algebraic: string;
}

const ANALOGY: AnalogyRow[] = [
  { topic: '輸入', linear: '線性方程組 Ax = b', algebraic: '多項式方程組' },
  { topic: '演算法', linear: '高斯消去法', algebraic: 'Buchberger 演算法' },
  { topic: '標準形', linear: '行簡化梯形 (RREF)', algebraic: 'Groebner 基' },
  { topic: '求解', linear: '回代', algebraic: '消去 + 回代' },
];

@Component({
  selector: 'app-step-ag-elimination',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- §4.5 Prose block 1: Elimination idea -->
    <app-prose-block title="應用：消去與求解" subtitle="&sect;4.5">
      <p>
        Groebner 基最強大的應用是<strong>消去</strong>。給定一組多變數多項式方程，
        使用 lex 序 <app-math [e]="'(x > y > z)'" /> 的 Groebner 基會呈現
        <strong>三角結構</strong>：
      </p>
      <ul class="triangle-list">
        <li>某些元素只含 <app-math [e]="'z'" /></li>
        <li>某些元素含 <app-math [e]="'y, z'" />（不含 <app-math [e]="'x'" />）</li>
        <li>某些元素含 <app-math [e]="'x, y, z'" /></li>
      </ul>
      <p>
        這就像線性代數的行簡化梯形！
      </p>
      <app-math block [e]="formulaElimIdeal"></app-math>
    </app-prose-block>

    <!-- Prose block 2: Elimination theorem -->
    <app-prose-block>
      <p>
        <strong>消去定理：</strong>若 G 是理想 I 在 lex 序
        <app-math [e]="'x_1 > x_2 > \\\\cdots > x_n'" /> 下的 Groebner 基，則
      </p>
      <app-math block [e]="formulaElimThm"></app-math>
      <p>
        換言之：要從方程組中消去 <app-math [e]="'x_1'" />，
        只要取 G 中<strong>不含 <app-math [e]="'x_1'" /></strong> 的那些元素！
      </p>
    </app-prose-block>

    <!-- Prose block 3: Solving strategy -->
    <app-prose-block>
      <p>
        用消去法解多項式方程組的策略：
      </p>
      <ol class="solve-list">
        <li>計算 lex Groebner 基</li>
        <li>最後幾個元素只含最後一個變數 &rarr; 解一元方程</li>
        <li>逐一回代，求出其他變數</li>
        <li>這和高斯消去法的回代完全類似！</li>
      </ol>
    </app-prose-block>

    <!-- Main interactive section -->
    <app-challenge-card prompt="觀察消去法如何把多變數方程組化簡成可解的三角形">
      <div class="elim-layout">
        <!-- Left: SVG plot -->
        <div class="elim-plot">
          <div class="plot-label">
            <app-math [e]="'V(x^2 + y^2 - 5) \\\\cap V(xy - 2)'" />
          </div>
          <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
            <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)"
                  stroke-width="0.8" />
            <!-- Circle x^2 + y^2 = 5 -->
            <path [attr.d]="circlePath" fill="none" stroke="var(--accent)"
                  stroke-width="2" stroke-linecap="round" />
            <!-- Hyperbola xy = 2 -->
            <path [attr.d]="hyperbolaPath" fill="none" stroke="#5a8a5a"
                  stroke-width="2" stroke-linecap="round" />

            <!-- Solution points (visible after step 4) -->
            @if (currentStep() >= 4) {
              @for (sol of solutions; track sol.label) {
                <circle [attr.cx]="toSvgX(sol.x)" [attr.cy]="toSvgY(sol.y)" r="6"
                        fill="#cc4444" stroke="#fff" stroke-width="1.5" />
                <text [attr.x]="toSvgX(sol.x) + 8"
                      [attr.y]="toSvgY(sol.y) - 8"
                      class="sol-label">{{ sol.label }}</text>
              }
            }

            <!-- Legend -->
            <text [attr.x]="v.pad + 4" [attr.y]="v.pad + 12"
                  class="curve-label accent-text">
              x&#178; + y&#178; = 5
            </text>
            <text [attr.x]="v.pad + 4" [attr.y]="v.pad + 24"
                  class="curve-label green-text">
              xy = 2
            </text>
          </svg>
        </div>

        <!-- Right: Step-by-step solution -->
        <div class="elim-steps">
          <!-- Step selector buttons -->
          <div class="step-btns">
            @for (s of solveSteps; track $index; let i = $index) {
              <button class="step-btn"
                      [class.active]="currentStep() >= i + 1"
                      [class.current]="currentStep() === i + 1"
                      (click)="goToStep(i + 1)">
                {{ i + 1 }}
              </button>
            }
          </div>

          <!-- Visible steps -->
          @for (step of visibleSteps(); track $index; let i = $index) {
            <div class="solve-card"
                 [class.highlight-eliminate]="step.highlight === 'eliminate'"
                 [class.highlight-solve]="step.highlight === 'solve'"
                 [class.highlight-result]="step.highlight === 'result'"
                 [class.is-current]="i === currentStep() - 1">
              <div class="solve-header">
                <span class="solve-num" [class]="'hl-' + step.highlight">
                  {{ i + 1 }}
                </span>
                <span class="solve-title">{{ step.title }}</span>
              </div>
              <div class="solve-body">
                @for (desc of step.descLines; track $index) {
                  <p class="solve-desc"><app-math [e]="desc" /></p>
                }
                @for (math of step.mathLines; track $index) {
                  <app-math block [e]="math" />
                }
              </div>
            </div>
          }

          <!-- Controls -->
          <div class="controls">
            <button class="ctrl-btn" (click)="prevStep()" [disabled]="currentStep() <= 1">
              上一步
            </button>
            <button class="ctrl-btn primary" (click)="nextStep()"
                    [disabled]="currentStep() >= totalSteps">
              下一步
            </button>
            <button class="ctrl-btn" (click)="resetSteps()">重置</button>
          </div>
        </div>
      </div>

      <!-- Solutions summary (after all steps) -->
      @if (currentStep() >= totalSteps) {
        <div class="solutions-summary">
          <div class="summary-label">全部解</div>
          <div class="sol-grid">
            @for (sol of solutions; track sol.label) {
              <div class="sol-chip">
                <app-math [e]="sol.label" />
              </div>
            }
          </div>
        </div>
      }
    </app-challenge-card>

    <!-- Analogy table -->
    <app-prose-block title="類比：線性代數 vs 代數幾何">
      <div class="analogy-table-wrap">
        <table class="analogy-table">
          <thead>
            <tr>
              <th></th>
              <th>線性代數</th>
              <th>代數幾何</th>
            </tr>
          </thead>
          <tbody>
            @for (row of analogy; track row.topic) {
              <tr>
                <td class="topic-cell">{{ row.topic }}</td>
                <td>{{ row.linear }}</td>
                <td>{{ row.algebraic }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-prose-block>

    <!-- Closing prose -->
    <app-prose-block>
      <p>
        Groebner 基把「解多項式方程組」這個看似不可能的任務，化簡成系統化的演算法。
        lex 序的消去性質就像線性代數的行簡化——先消去變數，得到三角形結構，再逐一回代。
        這是計算代數幾何最實用的工具之一。
      </p>
      <p>
        Bruno Buchberger 在 1965 年的博士論文中發明了這個演算法
        （並以他的導師 Groebner 命名），至今仍是 Mathematica、Maple、SageMath
        等數學軟體的核心引擎。
      </p>
    </app-prose-block>
  `,
  styles: `
    /* ── List styles ── */
    .triangle-list, .solve-list {
      margin: 6px 0 4px 0; padding-left: 20px; line-height: 1.9;
      font-size: 14px;
    }
    .triangle-list li, .solve-list li { margin: 2px 0; }

    /* ── Layout: dual panel ── */
    .elim-layout {
      display: grid; grid-template-columns: 260px 1fr; gap: 14px;
      margin-bottom: 12px;
    }
    @media (max-width: 640px) {
      .elim-layout { grid-template-columns: 1fr; }
    }

    /* ── Plot panel ── */
    .elim-plot {
      display: flex; flex-direction: column; align-items: center;
    }
    .plot-label {
      font-size: 11px; color: var(--text-secondary); margin-bottom: 6px;
      text-align: center;
    }
    .plot-svg {
      width: 100%; max-width: 260px; display: block;
      border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg);
    }
    .curve-label {
      font-size: 10px; font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    .accent-text { fill: var(--accent); }
    .green-text { fill: #5a8a5a; }
    .sol-label {
      font-size: 9px; fill: #cc4444; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Step buttons row ── */
    .step-btns {
      display: flex; gap: 6px; margin-bottom: 10px;
    }
    .step-btn {
      width: 32px; height: 32px; border-radius: 50%;
      border: 2px solid var(--border); background: var(--bg-surface);
      color: var(--text-muted); font-size: 12px; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
      font-family: 'JetBrains Mono', monospace;
      display: flex; align-items: center; justify-content: center;
      &:hover { border-color: var(--accent); }
      &.active {
        border-color: var(--accent); color: var(--accent);
        background: var(--accent-10);
      }
      &.current {
        background: var(--accent); color: #fff;
        border-color: var(--accent);
      }
    }

    /* ── Solve cards ── */
    .solve-card {
      border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 8px;
      overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .solve-card.is-current {
      box-shadow: 0 0 0 2px var(--accent-10);
    }
    .solve-card.highlight-eliminate {
      border-color: #c49b3a;
    }
    .solve-card.highlight-solve {
      border-color: #5a8a5a;
    }
    .solve-card.highlight-result {
      border-color: #cc4444;
    }
    .solve-header {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; background: var(--bg);
      border-bottom: 1px solid var(--border);
    }
    .solve-num {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; flex-shrink: 0;
      background: var(--accent-10); color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
    .solve-num.hl-eliminate { background: rgba(196, 155, 58, 0.15); color: #c49b3a; }
    .solve-num.hl-solve { background: rgba(90, 138, 90, 0.15); color: #5a8a5a; }
    .solve-num.hl-result { background: rgba(204, 68, 68, 0.15); color: #cc4444; }
    .solve-title {
      font-size: 13px; font-weight: 600; color: var(--text);
    }
    .solve-body {
      padding: 10px 12px;
    }
    .solve-desc {
      font-size: 13px; color: var(--text-secondary); margin: 2px 0;
      line-height: 1.6;
    }

    /* ── Controls ── */
    .controls {
      display: flex; align-items: center; gap: 8px; justify-content: center;
      margin-top: 4px;
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

    /* ── Solutions summary ── */
    .solutions-summary {
      margin-top: 12px; padding: 14px;
      border: 2px solid #cc4444; border-radius: 10px;
      background: rgba(204, 68, 68, 0.04); text-align: center;
    }
    .summary-label {
      font-size: 11px; font-weight: 700; color: #cc4444;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
    }
    .sol-grid {
      display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
    }
    .sol-chip {
      padding: 6px 14px; border-radius: 8px;
      background: rgba(204, 68, 68, 0.1); border: 1px solid rgba(204, 68, 68, 0.3);
      font-size: 14px; font-weight: 600;
    }

    /* ── Analogy table ── */
    .analogy-table-wrap {
      overflow-x: auto; margin: 8px 0;
    }
    .analogy-table {
      width: 100%; border-collapse: collapse; font-size: 13px;
    }
    .analogy-table th {
      padding: 8px 12px; text-align: left;
      border-bottom: 2px solid var(--border);
      font-size: 12px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.3px;
    }
    .analogy-table td {
      padding: 8px 12px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary); line-height: 1.5;
    }
    .analogy-table tr:last-child td { border-bottom: none; }
    .topic-cell {
      font-weight: 600; color: var(--text) !important;
      white-space: nowrap;
    }
    .analogy-table tbody tr {
      transition: background 0.1s;
      &:hover { background: var(--bg-surface); }
    }
  `,
})
export class StepAgEliminationComponent {
  /* ── KaTeX formulas ── */
  readonly formulaElimIdeal = `I_k = I \\cap k[x_{k+1}, \\ldots, x_n]`;

  readonly formulaElimThm = `G \\cap k[x_{k+1}, \\ldots, x_n] \\;\\text{ is a Groebner basis of }\\; I_k`;

  /* ── Solve steps ── */
  readonly solveSteps = SOLVE_STEPS;
  readonly totalSteps = SOLVE_STEPS.length;
  readonly currentStep = signal(1);

  readonly visibleSteps = computed(() => SOLVE_STEPS.slice(0, this.currentStep()));

  readonly solutions = SOLUTIONS;
  readonly analogy = ANALOGY;

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

  goToStep(n: number): void {
    this.currentStep.set(n);
  }

  /* ── SVG visualization ── */
  readonly v: PlotView = {
    xRange: [-3.5, 3.5], yRange: [-3.5, 3.5], svgW: 260, svgH: 260, pad: 22,
  };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /* Circle: x^2 + y^2 - 5 = 0 */
  readonly circlePath = implicitCurve(
    (x, y) => x * x + y * y - 5,
    this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120,
  );

  /* Hyperbola: xy - 2 = 0 */
  readonly hyperbolaPath = implicitCurve(
    (x, y) => x * y - 2,
    this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120,
  );
}
