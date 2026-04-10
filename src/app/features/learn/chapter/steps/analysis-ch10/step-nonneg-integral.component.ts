import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-nonneg-integral',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="非負可測函數的積分" subtitle="§10.2">
      <p>
        對非負可測函數 f ≥ 0，<strong>Lebesgue 積分</strong>定義為：
      </p>
      <p class="formula axiom">
        ∫ f dm = sup ∫ φ dm，取遍所有 0 ≤ φ ≤ f 的簡單函數 φ
      </p>
      <p>
        直覺：用越來越精細的簡單函數從下方逼近 f，取所有近似積分的<strong>上確界</strong>。
      </p>
      <p>
        注意跟 Riemann 的區別：
      </p>
      <ul>
        <li>Riemann 用<strong>上和 + 下和</strong>夾擠</li>
        <li>Lebesgue 只從<strong>下方</strong>逼近（簡單函數 ≤ f），取 sup</li>
        <li>這個 sup 永遠存在（可能 = ∞），不需要額外的可積性條件</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="構造過程">
      <div class="construction">
        <div class="step-card">
          <div class="sc-num">1</div>
          <div class="sc-body">
            取簡單函數列 φ₁ ≤ φ₂ ≤ … ≤ f，每個 φₙ 有 n·2ⁿ 個水平層
          </div>
        </div>
        <div class="step-card">
          <div class="sc-num">2</div>
          <div class="sc-body">
            計算每個 ∫φₙ dm = Σ aₖ · m(Eₖ)（有限和，很容易算）
          </div>
        </div>
        <div class="step-card">
          <div class="sc-num">3</div>
          <div class="sc-body">
            取極限：∫ f dm = lim ∫φₙ dm = sup ∫φₙ dm
          </div>
        </div>
      </div>

      <div class="key-point">
        <div class="kp-title">為什麼只從下方？</div>
        <div class="kp-body">
          Riemann 需要上和下和都收斂到同一值才叫「可積」。
          Lebesgue 只用下方逼近，結果永遠有定義（可能 = ∞）。
          這讓 Lebesgue 積分涵蓋更多函數。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節處理帶符號的函數：f = f⁺ − f⁻。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .construction { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .step-card { display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); }
    .sc-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; flex-shrink: 0; }
    .sc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .key-point { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .kp-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .kp-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class StepNonnegIntegralComponent {}
