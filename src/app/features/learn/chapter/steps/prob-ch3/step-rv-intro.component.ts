import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch3-rv-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="隨機變數與 PMF" subtitle="§3.1">
      <p>
        <strong>隨機變數 (random variable, RV)</strong> 是把樣本空間每個結果映射到一個數字的函數：
      </p>
      <div class="centered-eq">
        X : Ω → ℝ
      </div>
      <p>
        例子：擲兩顆骰，X = 兩骰之和。Ω 有 36 個結果，X 的可能值是 2, 3, …, 12。
        RV 把「抽象結果」變成「可以加減乘除的數字」——機率論因此能跟微積分連線。
      </p>

      <h4>機率質量函數 (PMF)</h4>
      <p>
        對離散 RV，PMF 列出每個值出現的機率：
      </p>
      <div class="centered-eq big">
        p_X(k) = P(X = k), &nbsp;&nbsp; Σₖ p_X(k) = 1
      </div>
    </app-prose-block>

    <app-challenge-card prompt="擲兩顆骰：PMF of X = 骰和">
      <div class="pmf-plot">
        <div class="pmf-title">X = 兩骰之和，PMF</div>
        <svg viewBox="-20 -170 420 220" class="pmf-svg">
          <line [attr.x1]="0" y1="0" [attr.x2]="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-165" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          @for (b of bars(); track b.k) {
            <rect [attr.x]="b.x - 14" [attr.y]="-b.h"
              width="28" [attr.height]="b.h"
              fill="var(--accent)" opacity="0.8" />
            <text [attr.x]="b.x" y="14" class="tk" text-anchor="middle">{{ b.k }}</text>
            <text [attr.x]="b.x" [attr.y]="-b.h - 4" class="vl" text-anchor="middle">{{ b.p.toFixed(3) }}</text>
          }
        </svg>
      </div>

      <div class="facts">
        <div class="f">
          <div class="f-lab">最可能值</div>
          <div class="f-val">X = 7 (p = {{ (6/36).toFixed(3) }})</div>
        </div>
        <div class="f">
          <div class="f-lab">期望值 E[X]</div>
          <div class="f-val">7</div>
        </div>
        <div class="f">
          <div class="f-lab">變異數 Var(X)</div>
          <div class="f-val">{{ (35/6).toFixed(2) }}</div>
        </div>
        <div class="f">
          <div class="f-lab">Σ p(k)</div>
          <div class="f-val">1</div>
        </div>
      </div>

      <p class="note">
        PMF 像一個<strong>離散密度</strong>——面積總和為 1，每個柱高 = 該值的機率。
        7 最高是因為組成 7 的方式最多（1+6, 2+5, 3+4, 4+3, 5+2, 6+1）。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>CDF：累積分佈函數</h4>
      <div class="centered-eq">
        F_X(x) = P(X ≤ x) = Σₖ≤ₓ p(k)
      </div>
      <p>
        CDF 對離散 RV 是階梯函數——每個跳躍高度 = 該點的 PMF 值。
        CDF 永遠是從 0 上升到 1 的不減函數。
      </p>

      <h4>四種常見離散分佈</h4>
      <div class="dist-grid">
        <div class="d">
          <div class="d-name">Bernoulli(p)</div>
          <code class="d-eq">X ∈ [0 或 1]</code>
          <p>一次實驗是否成功。擲一次硬幣正面/反面。</p>
        </div>
        <div class="d">
          <div class="d-name">Binomial(n, p)</div>
          <code class="d-eq">X ∈ [0, 1, …, n]</code>
          <p>n 次獨立 Bernoulli 的成功次數。民調、品管、A/B 測試。</p>
        </div>
        <div class="d">
          <div class="d-name">Geometric(p)</div>
          <code class="d-eq">X ∈ [1, 2, 3, …]</code>
          <p>第一次成功前的嘗試次數。等電梯、釣魚。</p>
        </div>
        <div class="d">
          <div class="d-name">Poisson(λ)</div>
          <code class="d-eq">X ∈ [0, 1, 2, …]</code>
          <p>單位時間內的罕見事件數。電話量、放射衰變、流星雨。</p>
        </div>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        RV 把結果變成數字，PMF 描述機率分佈。
        下一節開始：Bernoulli 和它的 n 次總和——Binomial 分佈。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .pmf-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pmf-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pmf-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .vl { font-size: 8px; fill: var(--accent); font-family: 'JetBrains Mono', monospace; }

    .facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .f { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .f-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
    .f-val { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .note strong { color: var(--accent); }

    .dist-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .d { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .d-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
    .d-eq { display: inline-block; font-size: 11px; margin-bottom: 4px; }
    .d p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh3RvIntroComponent {
  readonly bars = computed(() => {
    const out: Array<{ k: number; x: number; h: number; p: number }> = [];
    for (let k = 2; k <= 12; k++) {
      const count = k <= 7 ? k - 1 : 13 - k;
      const p = count / 36;
      out.push({
        k,
        x: ((k - 1) / 12) * 400,
        h: p * 800,
        p,
      });
    }
    return out;
  });
}
