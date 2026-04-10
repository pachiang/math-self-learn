import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-interchange',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="逐項積分與微分" subtitle="§6.7">
      <p>
        什麼時候可以交換 Σ 和 ∫？什麼時候可以把微分搬進積分號裡？
      </p>
      <p>
        答案：需要<strong>均勻收斂</strong>（Ch4 的老朋友）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="交換極限和積分的條件">
      <div class="theorem-cards">
        <div class="thm-card">
          <div class="thm-title">逐項積分</div>
          <div class="thm-formula">
            如果 Σfₙ 在 [a,b] 上<strong>均勻收斂</strong>到 f，那麼
          </div>
          <div class="thm-result">∫ₐᵇ Σfₙ = Σ ∫ₐᵇ fₙ</div>
          <div class="thm-why">
            均勻收斂保證誤差可以整體控制 → 積分和求和可以交換。
          </div>
        </div>

        <div class="thm-card">
          <div class="thm-title">積分號下微分</div>
          <div class="thm-formula">
            如果 ∂f/∂t 存在且<strong>連續</strong>，那麼
          </div>
          <div class="thm-result">d/dt ∫ₐᵇ f(x,t) dx = ∫ₐᵇ ∂f/∂t dx</div>
          <div class="thm-why">Leibniz 積分法則。物理裡「先積分再對參數微分」的合法性。</div>
        </div>

        <div class="thm-card warning">
          <div class="thm-title">反例：不能隨便交換</div>
          <div class="thm-formula">
            fₙ(x) = n²x(1−x²)ⁿ on [0,1]
          </div>
          <div class="thm-result">
            lim ∫fₙ ≠ ∫ lim fₙ
          </div>
          <div class="thm-why">
            逐點收斂到 0，但 ∫fₙ → ½ ≠ 0 = ∫0。
            沒有均勻收斂 → 交換失敗。
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        「能不能交換極限」是分析裡反覆出現的主題。
        答案幾乎總是：<strong>均勻收斂就可以</strong>。
      </p>
      <p>下一節看積分的一個高級應用——<strong>Gamma 函數</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .theorem-cards { display: flex; flex-direction: column; gap: 10px; }
    .thm-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface);
      &.warning { border-color: #a05a5a; background: rgba(160,90,90,0.04); } }
    .thm-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .thm-formula { font-size: 12px; color: var(--text-secondary); margin: 4px 0;
      strong { color: var(--accent); } }
    .thm-result { font-size: 15px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 8px 12px; margin: 6px 0;
      background: var(--accent-10); border-radius: 6px; text-align: center; }
    .thm-why { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
  `,
})
export class StepInterchangeComponent {}
