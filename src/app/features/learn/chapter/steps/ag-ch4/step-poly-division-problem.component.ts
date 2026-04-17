import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';

/* ── Division step data ── */

interface DivisionStep {
  current: string;       // current polynomial (KaTeX)
  currentLT: string;     // leading term highlighted
  divisor: string;       // which divisor is used (label)
  divisorTex: string;    // divisor in KaTeX
  divides: boolean;      // does LT of divisor divide LT of current?
  quotientTerm: string;  // quotient term added (KaTeX), '' if none
  subtraction: string;   // what is subtracted (KaTeX)
  result: string;        // result after subtraction (KaTeX)
  note: string;          // Chinese explanation
}

const ORDER1_STEPS: DivisionStep[] = [
  {
    current: 'x^2y + xy^2 + y^2',
    currentLT: 'x^2y',
    divisor: 'f_1',
    divisorTex: 'xy - 1',
    divides: true,
    quotientTerm: 'x',
    subtraction: 'x \\cdot (xy - 1) = x^2y - x',
    result: 'xy^2 + y^2 + x',
    note: 'LT(f_1) = xy 整除 x^2y，商項為 x',
  },
  {
    current: 'xy^2 + y^2 + x',
    currentLT: 'xy^2',
    divisor: 'f_1',
    divisorTex: 'xy - 1',
    divides: true,
    quotientTerm: 'y',
    subtraction: 'y \\cdot (xy - 1) = xy^2 - y',
    result: 'y^2 + x + y',
    note: 'LT(f_1) = xy 整除 xy^2，商項為 y',
  },
  {
    current: 'y^2 + x + y',
    currentLT: 'y^2',
    divisor: 'f_2',
    divisorTex: 'y^2 - 1',
    divides: true,
    quotientTerm: '1',
    subtraction: '1 \\cdot (y^2 - 1) = y^2 - 1',
    result: 'x + y + 1',
    note: 'LT(f_1) = xy 不整除 y^2，改試 f_2。LT(f_2) = y^2 整除 y^2，商項為 1',
  },
  {
    current: 'x + y + 1',
    currentLT: 'x',
    divisor: '',
    divisorTex: '',
    divides: false,
    quotientTerm: '',
    subtraction: '',
    result: '',
    note: 'x, y, 1 均不被 LT(f_1) = xy 或 LT(f_2) = y^2 整除，全部移入餘數',
  },
];

const ORDER2_STEPS: DivisionStep[] = [
  {
    current: 'x^2y + xy^2 + y^2',
    currentLT: 'x^2y',
    divisor: 'f_1',
    divisorTex: 'xy - 1',
    divides: true,
    quotientTerm: 'x',
    subtraction: 'x \\cdot (xy - 1) = x^2y - x',
    result: 'xy^2 + y^2 + x',
    note: 'LT(f_2) = y^2 不整除 x^2y（y 指數不夠），改試 f_1。LT(f_1) = xy 整除 x^2y，商項為 x',
  },
  {
    current: 'xy^2 + y^2 + x',
    currentLT: 'xy^2',
    divisor: 'f_2',
    divisorTex: 'y^2 - 1',
    divides: true,
    quotientTerm: 'x',
    subtraction: 'x \\cdot (y^2 - 1) = xy^2 - x',
    result: 'y^2 + 2x',
    note: 'LT(f_2) = y^2 整除 xy^2，商項為 x',
  },
  {
    current: 'y^2 + 2x',
    currentLT: 'y^2',
    divisor: 'f_2',
    divisorTex: 'y^2 - 1',
    divides: true,
    quotientTerm: '1',
    subtraction: '1 \\cdot (y^2 - 1) = y^2 - 1',
    result: '2x + 1',
    note: 'LT(f_2) = y^2 整除 y^2，商項為 1',
  },
  {
    current: '2x + 1',
    currentLT: '2x',
    divisor: '',
    divisorTex: '',
    divides: false,
    quotientTerm: '',
    subtraction: '',
    result: '',
    note: '2x, 1 均不被 LT(f_2) = y^2 或 LT(f_1) = xy 整除，全部移入餘數',
  },
];

@Component({
  selector: 'app-step-poly-division-problem',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="多項式除法的困難" subtitle="${'\\S'}4.1">
      <p>
        在一元多項式中，除法是直觀的：將
        <app-math [e]="'x^3 + 2x + 1'" /> 除以 <app-math [e]="'x - 1'" />，
        得到商和餘數。關鍵在於：只有<strong>一種</strong>方式排序各項（按次數）。
        這使得演算法是確定性的。
      </p>
      <app-math block [e]="'x^3 + 2x + 1 = (x-1)(x^2 + x + 3) + 4'" />
    </app-prose-block>

    <app-prose-block>
      <p>
        在兩個以上的變數中，一切都崩潰了。考慮將
        <app-math [e]="'f = x^2y + xy^2 + y^2'" /> 除以
        <app-math [e]="'f_1 = xy - 1'" /> 和 <app-math [e]="'f_2 = y^2 - 1'" />。
        結果<strong>取決於</strong>我們嘗試除數的順序！
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        先除 <app-math [e]="'f_1'" /> 再除 <app-math [e]="'f_2'" /> 得到一個餘數；
        先除 <app-math [e]="'f_2'" /> 再除 <app-math [e]="'f_1'" /> 得到另一個餘數！
        這種歧義是 Groebner 基所解決的根本問題。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        問題的根源：多變數多項式有多個「前導項」，取決於你如何排序單項式。
        不同的排序給出不同的除法結果。我們需要一個系統化的方法。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察：同一個除法，不同的除法順序給出不同的餘數！">
      <!-- Problem statement -->
      <div class="problem-card">
        <div class="problem-label">被除多項式</div>
        <div class="problem-poly">
          <app-math [e]="'f = x^2y + xy^2 + y^2'" />
        </div>
        <div class="problem-divisors">
          <span class="div-chip">
            <app-math [e]="'f_1 = xy - 1'" />
          </span>
          <span class="div-chip">
            <app-math [e]="'f_2 = y^2 - 1'" />
          </span>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="two-col">
        <!-- Order 1: f1 first -->
        <div class="col" [class.active-col]="activeCol() === 1">
          <div class="col-header">
            <button class="col-title-btn" [class.active]="activeCol() === 1"
                    (click)="activeCol.set(1)">
              先除 <app-math [e]="'f_1'" /> 再除 <app-math [e]="'f_2'" />
            </button>
          </div>

          @for (step of order1Steps; track $index; let i = $index) {
            @if (i < revealedSteps1()) {
              <div class="step-card" [class.final-step]="!step.divides">
                <div class="step-num">{{ i + 1 }}</div>
                <div class="step-body">
                  <div class="step-row">
                    <span class="step-label">當前：</span>
                    <span class="poly-display">
                      <app-math [e]="step.current" />
                    </span>
                  </div>
                  @if (step.divides) {
                    <div class="step-row">
                      <span class="step-label">除以：</span>
                      <span class="divisor-tag match">
                        <app-math [e]="step.divisor + ' = ' + step.divisorTex" />
                      </span>
                    </div>
                    <div class="step-row">
                      <span class="step-label">商項：</span>
                      <span class="quotient-term">
                        <app-math [e]="step.quotientTerm" />
                      </span>
                    </div>
                    <div class="step-row">
                      <span class="step-label">相減：</span>
                      <span class="subtraction-display">
                        <app-math [e]="step.subtraction" />
                      </span>
                    </div>
                    <div class="step-row">
                      <span class="step-label">結果：</span>
                      <span class="poly-display result">
                        <app-math [e]="step.result" />
                      </span>
                    </div>
                  } @else {
                    <div class="step-row remainder-note">
                      移入餘數
                    </div>
                  }
                  <div class="step-note">{{ step.note }}</div>
                </div>
              </div>
            }
          }

          <div class="step-controls">
            @if (revealedSteps1() < order1Steps.length) {
              <button class="step-btn" (click)="revealedSteps1.set(revealedSteps1() + 1)">
                {{ revealedSteps1() === 0 ? '開始' : '下一步' }}
              </button>
            }
            @if (revealedSteps1() > 0) {
              <button class="step-btn reset-btn" (click)="revealedSteps1.set(0)">重置</button>
            }
          </div>

          @if (revealedSteps1() >= order1Steps.length) {
            <div class="result-card">
              <div class="result-label">結果</div>
              <div class="result-line">
                <app-math [e]="'q_1 = x + y, \\quad q_2 = 1'" />
              </div>
              <div class="result-line remainder-highlight">
                <app-math [e]="'R_1 = x + y + 1'" />
              </div>
            </div>
          }
        </div>

        <!-- Order 2: f2 first -->
        <div class="col" [class.active-col]="activeCol() === 2">
          <div class="col-header">
            <button class="col-title-btn" [class.active]="activeCol() === 2"
                    (click)="activeCol.set(2)">
              先除 <app-math [e]="'f_2'" /> 再除 <app-math [e]="'f_1'" />
            </button>
          </div>

          @for (step of order2Steps; track $index; let i = $index) {
            @if (i < revealedSteps2()) {
              <div class="step-card" [class.final-step]="!step.divides">
                <div class="step-num">{{ i + 1 }}</div>
                <div class="step-body">
                  <div class="step-row">
                    <span class="step-label">當前：</span>
                    <span class="poly-display">
                      <app-math [e]="step.current" />
                    </span>
                  </div>
                  @if (step.divides) {
                    <div class="step-row">
                      <span class="step-label">除以：</span>
                      <span class="divisor-tag match">
                        <app-math [e]="step.divisor + ' = ' + step.divisorTex" />
                      </span>
                    </div>
                    <div class="step-row">
                      <span class="step-label">商項：</span>
                      <span class="quotient-term">
                        <app-math [e]="step.quotientTerm" />
                      </span>
                    </div>
                    <div class="step-row">
                      <span class="step-label">相減：</span>
                      <span class="subtraction-display">
                        <app-math [e]="step.subtraction" />
                      </span>
                    </div>
                    <div class="step-row">
                      <span class="step-label">結果：</span>
                      <span class="poly-display result">
                        <app-math [e]="step.result" />
                      </span>
                    </div>
                  } @else {
                    <div class="step-row remainder-note">
                      移入餘數
                    </div>
                  }
                  <div class="step-note">{{ step.note }}</div>
                </div>
              </div>
            }
          }

          <div class="step-controls">
            @if (revealedSteps2() < order2Steps.length) {
              <button class="step-btn" (click)="revealedSteps2.set(revealedSteps2() + 1)">
                {{ revealedSteps2() === 0 ? '開始' : '下一步' }}
              </button>
            }
            @if (revealedSteps2() > 0) {
              <button class="step-btn reset-btn" (click)="revealedSteps2.set(0)">重置</button>
            }
          </div>

          @if (revealedSteps2() >= order2Steps.length) {
            <div class="result-card">
              <div class="result-label">結果</div>
              <div class="result-line">
                <app-math [e]="'q_1 = x, \\quad q_2 = x + 1'" />
              </div>
              <div class="result-line remainder-highlight">
                <app-math [e]="'R_2 = 2x + 1'" />
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Comparison card -->
      @if (revealedSteps1() >= order1Steps.length && revealedSteps2() >= order2Steps.length) {
        <div class="comparison-card">
          <div class="compare-row">
            <div class="compare-item">
              <app-math [e]="'R_1 = x + y + 1'" />
            </div>
            <div class="compare-vs">vs</div>
            <div class="compare-item">
              <app-math [e]="'R_2 = 2x + 1'" />
            </div>
          </div>
          <div class="diff-badge">餘數不同！除法結果依賴順序</div>
          <div class="compare-note">
            這就是我們需要 Groebner 基的原因——讓餘數<strong>唯一</strong>。
          </div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        一元多項式除法之所以「好用」，是因為只有一種排序方式。多元多項式有多種排序，導致除法結果不唯一。
        下一節我們來系統化這些排序。
      </p>
    </app-prose-block>
  `,
  styles: `
    .problem-card {
      padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; text-align: center;
    }
    .problem-label {
      font-size: 11px; color: var(--text-muted); text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .problem-poly {
      font-size: 16px; margin-bottom: 10px;
    }
    .problem-divisors {
      display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;
    }
    .div-chip {
      padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg); font-size: 13px;
    }

    .two-col {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;
    }
    @media (max-width: 700px) {
      .two-col { grid-template-columns: 1fr; }
    }
    .col {
      border: 1px solid var(--border); border-radius: 10px;
      padding: 10px; background: var(--bg); transition: border-color 0.2s;
    }
    .col.active-col { border-color: var(--accent); }
    .col-header { margin-bottom: 10px; }
    .col-title-btn {
      width: 100%; padding: 8px 12px; border-radius: 6px;
      border: 1px solid var(--border); background: var(--bg-surface);
      color: var(--text-secondary); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      display: flex; align-items: center; gap: 4px; justify-content: center;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active {
        background: var(--accent-10); border-color: var(--accent);
        color: var(--accent); font-weight: 600;
      }
    }

    .step-card {
      display: flex; gap: 8px; padding: 8px 10px; margin-bottom: 6px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 12px;
      animation: fadeSlide 0.25s ease-out;
    }
    .step-card.final-step {
      border-color: rgba(138, 106, 90, 0.3);
      background: rgba(138, 106, 90, 0.06);
    }
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .step-num {
      width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
      background: var(--accent-10); color: var(--accent);
      font-size: 11px; font-weight: 700; display: flex;
      align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .step-body { flex: 1; min-width: 0; }
    .step-row {
      display: flex; align-items: baseline; gap: 6px;
      margin-bottom: 3px; flex-wrap: wrap;
    }
    .step-label {
      font-size: 11px; color: var(--text-muted); flex-shrink: 0;
      font-family: 'JetBrains Mono', monospace; min-width: 40px;
    }
    .poly-display { font-size: 13px; }
    .poly-display.result { color: var(--accent); font-weight: 500; }
    .divisor-tag {
      padding: 2px 6px; border-radius: 4px; font-size: 12px;
    }
    .divisor-tag.match {
      background: rgba(90, 138, 90, 0.1); border: 1px solid rgba(90, 138, 90, 0.3);
    }
    .quotient-term {
      color: #5a6a8a; font-weight: 600; font-size: 13px;
    }
    .subtraction-display {
      font-size: 12px; color: var(--text-secondary);
    }
    .remainder-note {
      color: #8a6a5a; font-weight: 600; font-style: italic; font-size: 12px;
    }
    .step-note {
      font-size: 10px; color: var(--text-muted); margin-top: 4px;
      line-height: 1.5; border-top: 1px solid var(--border); padding-top: 4px;
    }

    .step-controls {
      display: flex; gap: 8px; margin: 8px 0;
    }
    .step-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid var(--accent);
      background: var(--accent-10); color: var(--accent);
      font-size: 12px; cursor: pointer; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s;
      &:hover { background: var(--accent-18); }
    }
    .reset-btn {
      border-color: var(--border); background: var(--bg-surface);
      color: var(--text-secondary); font-weight: 400;
      &:hover { border-color: var(--text-muted); }
    }

    .result-card {
      padding: 10px 14px; border-radius: 8px; border: 1px solid var(--accent);
      background: var(--accent-10); text-align: center;
    }
    .result-label {
      font-size: 11px; color: var(--accent); text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
    }
    .result-line { margin: 4px 0; font-size: 13px; }
    .remainder-highlight { font-weight: 700; }

    .comparison-card {
      padding: 16px; border-radius: 10px;
      border: 2px solid rgba(204, 68, 68, 0.4);
      background: rgba(204, 68, 68, 0.04);
      text-align: center; margin-top: 4px;
    }
    .compare-row {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .compare-item {
      padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); font-size: 15px;
    }
    .compare-vs {
      font-size: 14px; font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .diff-badge {
      display: inline-block; padding: 6px 16px; border-radius: 8px;
      background: rgba(204, 68, 68, 0.12); border: 1px solid rgba(204, 68, 68, 0.35);
      color: #cc4444; font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; margin-bottom: 8px;
    }
    .compare-note {
      font-size: 12px; color: var(--text-secondary); line-height: 1.6;
    }
  `,
})
export class StepPolyDivisionProblemComponent {
  readonly order1Steps = ORDER1_STEPS;
  readonly order2Steps = ORDER2_STEPS;

  readonly revealedSteps1 = signal(0);
  readonly revealedSteps2 = signal(0);
  readonly activeCol = signal(1);
}
