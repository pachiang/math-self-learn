import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface WorkedStep {
  n: number;
  title: string;
  body: string;
  explain: string;
}

const EXAMPLE_STEPS: WorkedStep[] = [
  {
    n: 1,
    title: '寫下 IVP',
    body: 'y″ + 3y′ + 2y = 0,   y(0) = 1,  y′(0) = 0',
    explain: '一個二階線性齊次方程，帶兩個初值。我們要找 y(t)。',
  },
  {
    n: 2,
    title: '兩邊取 Laplace 變換',
    body: 'ℒ[y″] + 3 ℒ[y′] + 2 ℒ[y] = 0',
    explain: '變換是線性的，所以各項可分開處理。常數 3、2 被直接提出來。',
  },
  {
    n: 3,
    title: '套用微分公式',
    body:
      'ℒ[y′] = s·Y(s) − y(0) = sY − 1\n' +
      'ℒ[y″] = s²·Y(s) − s·y(0) − y′(0) = s²Y − s',
    explain: '關鍵一步：微分變成「乘 s、減去初值」。初值自動登場。',
  },
  {
    n: 4,
    title: '代回方程、整理',
    body: '(s²Y − s) + 3(sY − 1) + 2Y = 0\n(s² + 3s + 2)·Y = s + 3',
    explain: '所有 y 的相關項都被 Y(s) 取代——這是代數方程，不是微分方程！',
  },
  {
    n: 5,
    title: '解 Y(s)',
    body: 'Y(s) = (s + 3) / (s² + 3s + 2)',
    explain:
      '直接解出 Y(s)。分母是特徵多項式！——跟 Ch5 的 r² + 3r + 2 = 0 一模一樣。',
  },
  {
    n: 6,
    title: '因式分解 + 部分分式',
    body:
      '分母 = (s + 1)(s + 2)\n' +
      '(s + 3)/((s+1)(s+2)) = 2/(s+1) − 1/(s+2)',
    explain:
      'A/(s+1) + B/(s+2) = (s+3)/((s+1)(s+2))。Cover-up 法： A = (−1+3)/1 = 2, B = (−2+3)/(−1) = −1。',
  },
  {
    n: 7,
    title: '反變換',
    body: 'y(t) = 2·e^(−t) − e^(−2t)',
    explain:
      '查表：ℒ⁻¹[1/(s−a)] = e^(at)。兩項分別對應 a = −1, −2。得到 y(t)！',
  },
];

@Component({
  selector: 'app-de-ch7-solve-ode',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="解 ODE：微分變 s 相乘" subtitle="§7.2">
      <p>
        上一節的關鍵公式：
      </p>
      <div class="centered-eq big">
        ℒ[y′] = s·Y(s) − y(0)
      </div>
      <div class="centered-eq big">
        ℒ[y″] = s²·Y(s) − s·y(0) − y′(0)
      </div>
      <p class="key-idea">
        <strong>這兩個公式把整個 ODE 問題翻轉</strong>：在時域要積分、解聯立的事，
        在 s-域只需要<strong>代數操作</strong>——提項、合併、因式分解、部分分式。
      </p>
      <p>
        典型流程：
      </p>
      <ol>
        <li><strong>時域 ODE + 初值</strong></li>
        <li>→ 兩邊取 Laplace：ℒ[y] = Y(s)、微分變 s 項</li>
        <li><strong>s-域代數方程</strong>（初值自然吸收）</li>
        <li>→ 解 Y(s)，得到分式</li>
        <li>→ 部分分式拆解</li>
        <li>→ 查表反變換</li>
        <li><strong>時域解 y(t)</strong></li>
      </ol>
      <p>
        對比 Ch2 的「分離變數、積分因子、代換」——Laplace 是一套<strong>機械化、可自動化</strong>的流程。
        工程上的 ODE 幾乎都這樣解。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="完整範例：y″ + 3y′ + 2y = 0, y(0)=1, y′(0)=0">
      <div class="steps-wrap">
        @for (s of steps; track s.n) {
          <div class="step" [class.visible]="step() >= s.n">
            <div class="step-head">
              <span class="step-num">{{ s.n }}</span>
              <div class="step-title">{{ s.title }}</div>
            </div>
            @if (step() >= s.n) {
              <code class="step-body">{{ s.body }}</code>
              <p class="step-explain">{{ s.explain }}</p>
            }
          </div>
        }
      </div>

      <div class="step-nav">
        <button class="nav-btn" [disabled]="step() <= 1" (click)="prevStep()">← 上一步</button>
        <span class="step-counter">{{ step() }} / {{ steps.length }}</span>
        <button class="nav-btn primary" [disabled]="step() >= steps.length" (click)="nextStep()">下一步 →</button>
      </div>

      @if (step() >= steps.length) {
        <!-- Verify with plot -->
        <div class="verify">
          <div class="v-head">驗證：y(t) = 2·e^(−t) − e^(−2t)</div>
          <svg viewBox="-10 -60 320 130" class="v-svg">
            <line x1="0" y1="0" x2="300" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-55" x2="0" y2="60" stroke="var(--border-strong)" stroke-width="1" />
            <text x="304" y="4" class="ax">t</text>
            <text x="-4" y="-57" class="ax">y</text>

            @for (g of [0.5, 1]; track g) {
              <line x1="0" [attr.y1]="-g * 40" x2="300" [attr.y2]="-g * 40"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
              <text x="-4" [attr.y]="-g * 40 + 3" class="tick">{{ g }}</text>
            }

            <!-- Component 1: 2e^(-t) -->
            <path [attr.d]="comp1Path" fill="none"
              stroke="#8a9aa8" stroke-width="1.4" stroke-dasharray="4 3" />
            <!-- Component 2: -e^(-2t) -->
            <path [attr.d]="comp2Path" fill="none"
              stroke="#c87b5e" stroke-width="1.4" stroke-dasharray="4 3" />
            <!-- Total -->
            <path [attr.d]="totalPath" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />
          </svg>
          <div class="v-legend">
            <span class="leg"><span class="leg-dot dashed" style="color:#8a9aa8"></span>2·e^(−t)</span>
            <span class="leg"><span class="leg-dot dashed" style="color:#c87b5e"></span>−e^(−2t)</span>
            <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>總和 y(t)</span>
          </div>
          <p class="v-note">
            驗算：y(0) = 2·1 − 1 = 1 ✓， y′(0) = −2 + 2 = 0 ✓。完美符合初值。
          </p>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Laplace 法的幾個優勢：
      </p>
      <ul>
        <li><strong>初值自動處理</strong>：微分公式本身就含 y(0), y′(0)，不需要最後套入。</li>
        <li><strong>非齊次「免費」</strong>：右側外力 F(t) 只要會變換，整個流程一樣——不需要猜 y_p。</li>
        <li><strong>階梯、衝擊、延遲都可處理</strong>：u(t−a) 和 δ(t−a) 有簡單的變換（下一節詳細）。</li>
        <li><strong>連接代數與微積分</strong>：特徵多項式跟 Y(s) 的分母完全一樣——從這裡能讀出所有 Ch5 學過的結構。</li>
      </ul>
      <p>
        缺點：需要對 <strong>部分分式</strong> 熟練，需要 <strong>變換表</strong>。
        但一旦熟練，比 Ch5/Ch6 的方法<strong>快得多</strong>，尤其對工程問題。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Laplace 變換把「解 ODE」變成「代數操作 + 查表反變換」的兩步流程。
        下一節專攻「反變換」的核心技巧——部分分式。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 20px; padding: 16px; }

    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .steps-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .step {
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      opacity: 0.3;
      transition: all 0.2s;
    }

    .step.visible {
      opacity: 1;
      border-color: var(--accent-30);
      background: var(--bg);
    }

    .step-head {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 8px;
    }

    .step-num {
      display: inline-flex;
      width: 24px;
      height: 24px;
      background: var(--accent);
      color: white;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 700;
      justify-content: center;
      align-items: center;
    }

    .step-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
    }

    .step-body {
      display: block;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 500;
      white-space: pre-wrap;
      margin-bottom: 6px;
    }

    .step-explain {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .step-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 0;
      border-top: 1px dashed var(--border);
    }

    .nav-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 12px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: 6px;
      cursor: pointer;
      color: var(--text);
    }

    .nav-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .nav-btn.primary {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      font-weight: 600;
    }

    .step-counter {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .verify {
      margin-top: 14px;
      padding: 12px;
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      background: var(--bg);
    }

    .v-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .v-svg { width: 100%; display: block; }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: end;
      font-family: 'JetBrains Mono', monospace;
    }

    .v-legend {
      display: flex;
      gap: 14px;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
      justify-content: center;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .leg-dot {
      display: inline-block;
      width: 12px;
      height: 3px;
      border-radius: 2px;
    }

    .leg-dot.dashed {
      background-image: linear-gradient(to right, currentColor 50%, transparent 50%);
      background-size: 4px 3px;
      background-color: transparent !important;
    }

    .v-note {
      margin: 10px 0 0;
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }
  `,
})
export class DeCh7SolveOdeComponent {
  readonly steps = EXAMPLE_STEPS;
  readonly step = signal(1);

  nextStep(): void {
    if (this.step() < EXAMPLE_STEPS.length) this.step.set(this.step() + 1);
  }

  prevStep(): void {
    if (this.step() > 1) this.step.set(this.step() - 1);
  }

  // Plot coords: x = t * 40, y = -val * 40 (clamp ±1.5)
  readonly comp1Path = (() => {
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * 7;
      const y = 2 * Math.exp(-t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 40).toFixed(1)} ${(-y * 40).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly comp2Path = (() => {
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * 7;
      const y = -Math.exp(-2 * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 40).toFixed(1)} ${(-y * 40).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly totalPath = (() => {
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * 7;
      const y = 2 * Math.exp(-t) - Math.exp(-2 * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 40).toFixed(1)} ${(-y * 40).toFixed(1)}`);
    }
    return pts.join(' ');
  })();
}
