import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';

/* ── Algorithm step data ── */

interface AlgoStep {
  id: number;
  dividend: string;       // current polynomial in KaTeX (LT not highlighted)
  dividendLT: string;     // LT text
  tryDivisor: string;     // e.g. 'f_1' or 'f_2'
  tryDivisorTex: string;  // e.g. 'xy - 1'
  tryLT: string;          // LT of divisor
  divides: boolean;
  quotientTerm: string;   // KaTeX of quotient term added
  subtraction: string;    // KaTeX of what is subtracted
  result: string;         // KaTeX of result after subtraction
  addToQ: string;         // which q accumulator: 'q1' | 'q2' | ''
  addToR: string;         // term moved to remainder, or ''
  note: string;
}

/* ── Order 1: {f1=xy-1, f2=y²-1} ── */
const ALGO_ORDER1: AlgoStep[] = [
  {
    id: 1,
    dividend: 'x^2y + xy^2 + y^2',
    dividendLT: 'x^2y',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: true,
    quotientTerm: 'x',
    subtraction: 'x(xy - 1) = x^2y - x',
    result: 'xy^2 + y^2 + x',
    addToQ: 'q1', addToR: '',
    note: 'LT(f_1) = xy 整除 x^2y，商項 x 加入 q_1',
  },
  {
    id: 2,
    dividend: 'xy^2 + y^2 + x',
    dividendLT: 'xy^2',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: true,
    quotientTerm: 'y',
    subtraction: 'y(xy - 1) = xy^2 - y',
    result: 'y^2 + x + y',
    addToQ: 'q1', addToR: '',
    note: 'LT(f_1) = xy 整除 xy^2，商項 y 加入 q_1',
  },
  {
    id: 3,
    dividend: 'y^2 + x + y',
    dividendLT: 'y^2',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '',
    note: 'LT(f_1) = xy 不整除 y^2（x 指數不夠），嘗試下一個除數',
  },
  {
    id: 4,
    dividend: 'y^2 + x + y',
    dividendLT: 'y^2',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: true,
    quotientTerm: '1',
    subtraction: '1(y^2 - 1) = y^2 - 1',
    result: 'x + y + 1',
    addToQ: 'q2', addToR: '',
    note: 'LT(f_2) = y^2 整除 y^2，商項 1 加入 q_2',
  },
  {
    id: 5,
    dividend: 'x + y + 1',
    dividendLT: 'x',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '',
    note: 'LT(f_1) = xy 不整除 x',
  },
  {
    id: 6,
    dividend: 'x + y + 1',
    dividendLT: 'x',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: 'x',
    note: '無除數的 LT 整除 x，將 x 移入餘數 r',
  },
  {
    id: 7,
    dividend: 'y + 1',
    dividendLT: 'y',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '',
    note: 'LT(f_1) = xy 不整除 y',
  },
  {
    id: 8,
    dividend: 'y + 1',
    dividendLT: 'y',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: 'y',
    note: '無除數的 LT 整除 y，將 y 移入餘數 r',
  },
  {
    id: 9,
    dividend: '1',
    dividendLT: '1',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '',
    note: 'LT(f_1) = xy 不整除 1',
  },
  {
    id: 10,
    dividend: '1',
    dividendLT: '1',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '1',
    note: '無除數的 LT 整除 1，將 1 移入餘數 r。演算法結束。',
  },
];

/* ── Order 2: {f2=y²-1, f1=xy-1} ── */
const ALGO_ORDER2: AlgoStep[] = [
  {
    id: 1,
    dividend: 'x^2y + xy^2 + y^2',
    dividendLT: 'x^2y',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '',
    note: 'LT(f_2) = y^2 不整除 x^2y（y 指數 1 < 2），嘗試下一個除數',
  },
  {
    id: 2,
    dividend: 'x^2y + xy^2 + y^2',
    dividendLT: 'x^2y',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: true,
    quotientTerm: 'x',
    subtraction: 'x(xy - 1) = x^2y - x',
    result: 'xy^2 + y^2 + x',
    addToQ: 'q1', addToR: '',
    note: 'LT(f_1) = xy 整除 x^2y，商項 x 加入 q_1',
  },
  {
    id: 3,
    dividend: 'xy^2 + y^2 + x',
    dividendLT: 'xy^2',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: true,
    quotientTerm: 'x',
    subtraction: 'x(y^2 - 1) = xy^2 - x',
    result: 'y^2 + 2x',
    addToQ: 'q2', addToR: '',
    note: 'LT(f_2) = y^2 整除 xy^2，商項 x 加入 q_2',
  },
  {
    id: 4,
    dividend: 'y^2 + 2x',
    dividendLT: 'y^2',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: true,
    quotientTerm: '1',
    subtraction: '1(y^2 - 1) = y^2 - 1',
    result: '2x + 1',
    addToQ: 'q2', addToR: '',
    note: 'LT(f_2) = y^2 整除 y^2，商項 1 加入 q_2',
  },
  {
    id: 5,
    dividend: '2x + 1',
    dividendLT: '2x',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '',
    note: 'LT(f_2) = y^2 不整除 2x',
  },
  {
    id: 6,
    dividend: '2x + 1',
    dividendLT: '2x',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '2x',
    note: '無除數的 LT 整除 2x，將 2x 移入餘數 r',
  },
  {
    id: 7,
    dividend: '1',
    dividendLT: '1',
    tryDivisor: 'f_2', tryDivisorTex: 'y^2 - 1', tryLT: 'y^2',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '',
    note: 'LT(f_2) = y^2 不整除 1',
  },
  {
    id: 8,
    dividend: '1',
    dividendLT: '1',
    tryDivisor: 'f_1', tryDivisorTex: 'xy - 1', tryLT: 'xy',
    divides: false,
    quotientTerm: '', subtraction: '', result: '',
    addToQ: '', addToR: '1',
    note: '無除數的 LT 整除 1，將 1 移入餘數 r。演算法結束。',
  },
];

/* ── Accumulator state computation ── */
interface AccumState {
  q1: string;
  q2: string;
  r: string;
}

function computeAccum(steps: AlgoStep[], revealed: number): AccumState {
  const q1Parts: string[] = [];
  const q2Parts: string[] = [];
  const rParts: string[] = [];
  for (let i = 0; i < revealed; i++) {
    const s = steps[i];
    if (s.addToQ === 'q1' && s.quotientTerm) q1Parts.push(s.quotientTerm);
    if (s.addToQ === 'q2' && s.quotientTerm) q2Parts.push(s.quotientTerm);
    if (s.addToR) rParts.push(s.addToR);
  }
  return {
    q1: q1Parts.length ? q1Parts.join(' + ') : '0',
    q2: q2Parts.length ? q2Parts.join(' + ') : '0',
    r: rParts.length ? rParts.join(' + ') : '0',
  };
}

@Component({
  selector: 'app-step-multi-division',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="多變數除法演算法" subtitle="${'\\S'}4.3">
      <p>
        現在有了排序，我們可以定義多變數多項式的除法演算法。給定
        <app-math [e]="'f'" /> 和除數
        <app-math [e]="'F = (f_1, \\ldots, f_s)'" />，
        我們產生商
        <app-math [e]="'q_1, \\ldots, q_s'" /> 和餘數
        <app-math [e]="'r'" /> 使得：
      </p>
      <app-math block [e]="divisionFormula" />
      <p>
        其中 <app-math [e]="'r'" /> 的任何項都不被任何
        <app-math [e]="'\\text{LT}(f_i)'" /> 整除。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>演算法步驟：</p>
      <ol>
        <li>查看被除數的當前前導項</li>
        <li>若被 <app-math [e]="'\\text{LT}(f_1)'" /> 整除，減去適當的
            <app-math [e]="'f_1'" /> 的倍數</li>
        <li>若不整除，依次嘗試 <app-math [e]="'\\text{LT}(f_2)'" />、
            <app-math [e]="'\\text{LT}(f_3)'" /> 等</li>
        <li>若全部不整除，將該項移入餘數</li>
        <li>重複直到被除數為零</li>
      </ol>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>注意：</strong>餘數取決於除數
        <app-math [e]="'f_1, \\ldots, f_s'" /> 的<strong>排列順序</strong>。
        這正是 &sect;4.1 的問題。Groebner 基將在下一節修復這個問題。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="逐步觀察多變數除法演算法的每一步">
      <!-- Problem display -->
      <div class="problem-card">
        <div class="problem-label">被除多項式 (grlex 序)</div>
        <div class="problem-poly">
          <app-math [e]="'f = x^2y + xy^2 + y^2'" />
        </div>
      </div>

      <!-- Order toggle -->
      <div class="order-row">
        <button class="order-btn" [class.active]="divisorOrder() === 1"
                (click)="switchOrder(1)">
          除數順序: <app-math [e]="'\\{f_1 = xy-1,\\; f_2 = y^2-1\\}'" />
        </button>
        <button class="order-btn" [class.active]="divisorOrder() === 2"
                (click)="switchOrder(2)">
          除數順序: <app-math [e]="'\\{f_2 = y^2-1,\\; f_1 = xy-1\\}'" />
        </button>
      </div>

      <!-- Step controls -->
      <div class="step-controls-top">
        <button class="step-btn" (click)="stepBack()"
                [disabled]="currentStep() === 0">
          上一步
        </button>
        <span class="step-counter">
          {{ currentStep() }} / {{ totalSteps() }}
        </span>
        <button class="step-btn" (click)="stepForward()"
                [disabled]="currentStep() >= totalSteps()">
          下一步
        </button>
        <button class="reset-btn" (click)="resetSteps()">重置</button>
      </div>

      <!-- Current state display -->
      @if (currentStep() > 0 && currentStep() <= totalSteps()) {
        <div class="current-step-card">
          <div class="cs-header">
            <span class="cs-step-badge">{{ currentStepData().id }}</span>
          </div>

          <!-- Current dividend -->
          <div class="cs-row">
            <span class="cs-label">當前被除數</span>
            <span class="cs-value dividend-value">
              <app-math [e]="highlightLT(currentStepData().dividend, currentStepData().dividendLT)" />
            </span>
          </div>

          <!-- Trying divisor -->
          <div class="cs-row">
            <span class="cs-label">嘗試除以</span>
            <span class="cs-value">
              <span class="divisor-chip" [class.match]="currentStepData().divides"
                    [class.nomatch]="!currentStepData().divides">
                <app-math [e]="currentStepData().tryDivisor + ' :\\; \\text{LT} = ' + currentStepData().tryLT" />
                <span class="divides-tag">
                  {{ currentStepData().divides ? '整除' : '不整除' }}
                </span>
              </span>
            </span>
          </div>

          @if (currentStepData().divides) {
            <!-- Quotient term -->
            <div class="cs-row">
              <span class="cs-label">商項</span>
              <span class="cs-value quotient-value">
                <app-math [e]="currentStepData().quotientTerm" />
              </span>
            </div>

            <!-- Subtraction -->
            <div class="cs-row">
              <span class="cs-label">相減</span>
              <span class="cs-value subtraction-value">
                <app-math [e]="currentStepData().subtraction" />
              </span>
            </div>

            <!-- Result -->
            <div class="cs-row">
              <span class="cs-label">結果</span>
              <span class="cs-value result-value">
                <app-math [e]="currentStepData().result" />
              </span>
            </div>
          }

          @if (currentStepData().addToR) {
            <div class="cs-row">
              <span class="cs-label">移入餘數</span>
              <span class="cs-value remainder-value">
                <app-math [e]="currentStepData().addToR" />
              </span>
            </div>
          }

          <!-- Note -->
          <div class="cs-note">{{ currentStepData().note }}</div>
        </div>
      }

      <!-- Accumulator boxes -->
      <div class="accum-grid">
        <div class="accum-box q-box">
          <div class="accum-label">
            <app-math [e]="'q_1'" />
          </div>
          <div class="accum-value">
            <app-math [e]="accumState().q1" />
          </div>
        </div>
        <div class="accum-box q-box">
          <div class="accum-label">
            <app-math [e]="'q_2'" />
          </div>
          <div class="accum-value">
            <app-math [e]="accumState().q2" />
          </div>
        </div>
        <div class="accum-box r-box">
          <div class="accum-label">
            <app-math [e]="'r'" /> (餘數)
          </div>
          <div class="accum-value">
            <app-math [e]="accumState().r" />
          </div>
        </div>
      </div>

      <!-- Final result (when all steps revealed) -->
      @if (currentStep() >= totalSteps()) {
        <div class="final-card">
          <div class="final-label">最終結果</div>
          <div class="final-equation">
            <app-math block [e]="finalEquation()" />
          </div>
          <div class="final-detail">
            <app-math [e]="finalDetail()" />
          </div>

          @if (divisorOrder() === 1) {
            <div class="final-note">
              切換到另一個除數順序，觀察餘數是否相同
            </div>
          }
        </div>
      }

      <!-- Comparison if both orders have been completed -->
      @if (completed1() && completed2()) {
        <div class="comparison-card">
          <div class="compare-row">
            <div class="compare-item">
              <div class="compare-sub">順序 <app-math [e]="'\\{f_1, f_2\\}'" /></div>
              <app-math [e]="'r = x + y + 1'" />
            </div>
            <div class="compare-vs">vs</div>
            <div class="compare-item">
              <div class="compare-sub">順序 <app-math [e]="'\\{f_2, f_1\\}'" /></div>
              <app-math [e]="'r = 2x + 1'" />
            </div>
          </div>
          <div class="diff-badge">餘數不同！</div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        多變數除法演算法本身不能保證餘數唯一——結果取決於除數的排列順序。
        我們需要一個特殊的除數集合，使得無論怎麼排列，餘數都一樣。這就是 Groebner 基。
      </p>
    </app-prose-block>
  `,
  styles: `
    .problem-card {
      padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 12px; text-align: center;
    }
    .problem-label {
      font-size: 11px; color: var(--text-muted); text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .problem-poly { font-size: 16px; }

    .order-row {
      display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;
    }
    .order-btn {
      flex: 1; min-width: 200px; padding: 8px 12px; border-radius: 6px;
      border: 1px solid var(--border); background: var(--bg-surface);
      color: var(--text-secondary); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      display: flex; align-items: center; gap: 6px; justify-content: center;
      flex-wrap: wrap;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active {
        background: var(--accent-10); border-color: var(--accent);
        color: var(--accent); font-weight: 600;
      }
    }

    .step-controls-top {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .step-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid var(--accent);
      background: var(--accent-10); color: var(--accent);
      font-size: 12px; cursor: pointer; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s;
      &:hover:not(:disabled) { background: var(--accent-18); }
      &:disabled { opacity: 0.35; cursor: not-allowed; }
    }
    .reset-btn {
      padding: 6px 14px; border-radius: 6px;
      border: 1px solid var(--border); background: var(--bg-surface);
      color: var(--text-secondary); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: border-color 0.15s;
      &:hover { border-color: var(--text-muted); }
    }
    .step-counter {
      font-size: 12px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
      min-width: 50px; text-align: center;
    }

    .current-step-card {
      padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 12px;
      animation: fadeSlide 0.25s ease-out;
    }
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cs-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    }
    .cs-step-badge {
      width: 26px; height: 26px; border-radius: 50%;
      background: var(--accent-10); color: var(--accent);
      font-size: 12px; font-weight: 700; display: flex;
      align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .cs-row {
      display: flex; align-items: baseline; gap: 10px;
      margin-bottom: 6px; flex-wrap: wrap;
    }
    .cs-label {
      font-size: 11px; color: var(--text-muted); min-width: 80px;
      font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
    }
    .cs-value { font-size: 14px; }
    .dividend-value { font-weight: 500; }
    .quotient-value { color: #5a6a8a; font-weight: 600; }
    .subtraction-value { color: var(--text-secondary); }
    .result-value { color: var(--accent); font-weight: 600; }
    .remainder-value { color: #8a6a5a; font-weight: 600; }

    .divisor-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 3px 10px; border-radius: 6px; font-size: 13px;
    }
    .divisor-chip.match {
      background: rgba(90, 138, 90, 0.08);
      border: 1px solid rgba(90, 138, 90, 0.3);
    }
    .divisor-chip.nomatch {
      background: rgba(128, 128, 128, 0.06);
      border: 1px solid var(--border);
    }
    .divides-tag {
      font-size: 10px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      padding: 1px 6px; border-radius: 4px;
    }
    .match .divides-tag {
      background: rgba(90, 138, 90, 0.15); color: #5a8a5a;
    }
    .nomatch .divides-tag {
      background: rgba(128, 128, 128, 0.1); color: var(--text-muted);
    }

    .cs-note {
      font-size: 11px; color: var(--text-muted); margin-top: 8px;
      padding-top: 8px; border-top: 1px solid var(--border); line-height: 1.5;
    }

    .accum-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
      margin-bottom: 12px;
    }
    @media (max-width: 600px) {
      .accum-grid { grid-template-columns: 1fr; }
    }
    .accum-box {
      padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border);
    }
    .q-box { background: rgba(90, 106, 138, 0.06); }
    .r-box { background: rgba(138, 106, 90, 0.06); }
    .accum-label {
      font-size: 11px; color: var(--text-muted); margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .accum-value { font-size: 14px; font-weight: 600; }
    .q-box .accum-value { color: #5a6a8a; }
    .r-box .accum-value { color: #8a6a5a; }

    .final-card {
      padding: 16px; border-radius: 10px; border: 1px solid var(--accent);
      background: var(--accent-10); text-align: center; margin-bottom: 12px;
    }
    .final-label {
      font-size: 11px; color: var(--accent); text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 8px;
      font-family: 'JetBrains Mono', monospace; font-weight: 700;
    }
    .final-equation { font-size: 15px; margin-bottom: 6px; }
    .final-detail { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
    .final-note {
      font-size: 12px; color: var(--text-muted); font-style: italic;
    }

    .comparison-card {
      padding: 16px; border-radius: 10px;
      border: 2px solid rgba(204, 68, 68, 0.4);
      background: rgba(204, 68, 68, 0.04);
      text-align: center;
    }
    .compare-row {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .compare-item {
      padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); font-size: 15px;
    }
    .compare-sub {
      font-size: 10px; color: var(--text-muted); margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .compare-vs {
      font-size: 14px; font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .diff-badge {
      display: inline-block; padding: 6px 16px; border-radius: 8px;
      background: rgba(204, 68, 68, 0.12); border: 1px solid rgba(204, 68, 68, 0.35);
      color: #cc4444; font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepMultiDivisionComponent {
  readonly divisionFormula = `f = q_1 f_1 + q_2 f_2 + \\cdots + q_s f_s + r`;

  readonly divisorOrder = signal<1 | 2>(1);
  readonly currentStep = signal(0);
  readonly completed1 = signal(false);
  readonly completed2 = signal(false);

  readonly activeSteps = computed(() =>
    this.divisorOrder() === 1 ? ALGO_ORDER1 : ALGO_ORDER2,
  );

  readonly totalSteps = computed(() => this.activeSteps().length);

  readonly currentStepData = computed(() => {
    const idx = this.currentStep() - 1;
    const steps = this.activeSteps();
    return steps[Math.max(0, Math.min(idx, steps.length - 1))];
  });

  readonly accumState = computed(() =>
    computeAccum(this.activeSteps(), this.currentStep()),
  );

  readonly finalEquation = computed(() => {
    const a = this.accumState();
    return `f = (${a.q1})(f_1) + (${a.q2})(f_2) + ${a.r}`;
  });

  readonly finalDetail = computed(() => {
    if (this.divisorOrder() === 1) {
      return `q_1 = x + y, \\quad q_2 = 1, \\quad r = x + y + 1`;
    }
    return `q_1 = x, \\quad q_2 = x + 1, \\quad r = 2x + 1`;
  });

  switchOrder(order: 1 | 2): void {
    if (this.divisorOrder() !== order) {
      this.divisorOrder.set(order);
      this.currentStep.set(0);
    }
  }

  stepForward(): void {
    const cur = this.currentStep();
    const total = this.totalSteps();
    if (cur < total) {
      this.currentStep.set(cur + 1);
      if (cur + 1 >= total) {
        if (this.divisorOrder() === 1) this.completed1.set(true);
        else this.completed2.set(true);
      }
    }
  }

  stepBack(): void {
    const cur = this.currentStep();
    if (cur > 0) this.currentStep.set(cur - 1);
  }

  resetSteps(): void {
    this.currentStep.set(0);
  }

  highlightLT(poly: string, lt: string): string {
    // Highlight the leading term portion in the polynomial
    const escaped = lt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^(${escaped})`);
    if (re.test(poly)) {
      return poly.replace(re, `{\\color{#5882a8}{\\mathbf{${lt}}}}`);
    }
    return `{\\color{#5882a8}{\\mathbf{${lt}}}}` + poly.substring(lt.length);
  }
}
