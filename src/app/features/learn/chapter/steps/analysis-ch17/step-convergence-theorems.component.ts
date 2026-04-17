import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-convergence-theorems',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="收斂定理" subtitle="§17.5">
      <p>Fourier 級數何時收斂？有三個層次：</p>
    </app-prose-block>

    <app-challenge-card prompt="比較三種收斂定理的條件和結論">
      <div class="theorem-stack">
        <div class="thm-card">
          <div class="thm-name">L² 收斂</div>
          <div class="thm-cond">條件：f ∈ L²[-π, π]（平方可積）</div>
          <div class="thm-result">結論：||Sₙ − f||₂ → 0</div>
          <div class="thm-note">
            最寬鬆——幾乎所有「合理」的函數都滿足。Fourier 是 L² 中的<strong>最佳逼近</strong>（Bessel 不等式升級為等式）。
          </div>
        </div>

        <div class="thm-card">
          <div class="thm-name">逐點收斂（Dirichlet 條件）</div>
          <div class="thm-cond">條件：f 分段光滑（有限個間斷點，有左右導數）</div>
          <div class="thm-result">結論：Sₙ(x) → [f(x⁺) + f(x⁻)] / 2</div>
          <div class="thm-note">
            在連續點收斂到 f(x)。在跳躍處收斂到<strong>左右極限的平均</strong>。
          </div>
        </div>

        <div class="thm-card">
          <div class="thm-name">均勻收斂</div>
          <div class="thm-cond">條件：f 連續且分段光滑</div>
          <div class="thm-result">結論：sup|Sₙ(x) − f(x)| → 0</div>
          <div class="thm-note">
            最嚴格——需要 f <strong>連續</strong>。有間斷就有 Gibbs，不可能均勻收斂。
          </div>
        </div>
      </div>

      <div class="hierarchy">
        <span class="h-box ok">均勻收斂</span>
        <span class="arrow">⇒</span>
        <span class="h-box ok">逐點收斂</span>
        <span class="arrow">⇒</span>
        <span class="h-box ok">L² 收斂</span>
      </div>
      <div class="hierarchy-note">反過來<strong>不成立</strong>！</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這三層收斂反映了 Ch7 和 Ch11 的主題：不同的「距離」定義產生不同的收斂概念。
        Fourier 分析是這些抽象概念的最佳練兵場。
      </p>
    </app-prose-block>
  `,
  styles: `
    .theorem-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .thm-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .thm-name { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .thm-cond { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .thm-result { font-size: 13px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .thm-note { font-size: 12px; color: var(--text-secondary); }
    .thm-note strong { color: var(--accent); }
    .hierarchy { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px; }
    .h-box { padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
      &.ok { background: rgba(90,138,90,0.1); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.3); } }
    .arrow { font-size: 16px; color: var(--accent); }
    .hierarchy-note { text-align: center; font-size: 11px; color: var(--text-muted); }
    .hierarchy-note strong { color: #bf6e6e; }
  `,
})
export class StepConvergenceTheoremsComponent {}
