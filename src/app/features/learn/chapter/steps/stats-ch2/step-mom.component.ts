import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-stats-ch2-mom',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="動差法 (Method of Moments)" subtitle="§2.3">
      <p>
        動差法是最早（Pearson, 1894）也最直觀的估計法：
        <strong>讓「理論動差」等於「樣本動差」</strong>，解方程求參數。
      </p>

      <h4>流程</h4>
      <ol class="steps">
        <li>從母體模型寫出前 k 個理論動差：E[X], E[X²], …, E[X^k]（k = 參數個數）</li>
        <li>對應的樣本動差：X̄, (1/n)Σ Xᵢ², …</li>
        <li>解聯立方程：E[X^j] = (1/n) Σ Xᵢ^j &nbsp; (j = 1, …, k)</li>
      </ol>
    </app-prose-block>

    <app-prose-block subtitle="例 1">
      <h4>Exponential(λ)</h4>
      <p>
        E[X] = 1/λ，所以 <code>1/λ = X̄</code> → <code>λ̂ = 1/X̄</code>。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="例 2">
      <h4>N(μ, σ²)</h4>
      <p>
        E[X] = μ → <code>μ̂ = X̄</code><br>
        E[X²] = μ² + σ² → σ̂² = (1/n) Σ Xᵢ² − X̄² = (1/n) Σ (Xᵢ − X̄)²
      </p>
      <p>
        這正好是 MLE 的答案（有偏的 σ̂²）。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="例 3 — MoM ≠ MLE 的情況">
      <h4>Uniform(0, θ)</h4>
      <p>
        E[X] = θ / 2 → <strong>MoM</strong>：θ̂ = 2X̄<br>
        <strong>MLE</strong>：θ̂ = max(X₁, …, Xₙ)（必須至少等於最大觀察值）
      </p>
      <div class="key-idea">
        <strong>MoM 給出荒謬結果的可能性：</strong>
        若真 θ = 10，你抽到樣本 &#123;2, 3, 9.8&#125;，MoM 給 2·4.93 = 9.87——低於實際觀察到的 9.8！
        這違反「θ 必須 ≥ 所有 Xᵢ」的模型約束。
        MLE 不會犯這錯——它考慮模型的支撐集邊界。
      </div>
    </app-prose-block>

    <app-prose-block>
      <h4>MoM vs MLE</h4>
      <table class="cmp">
        <thead>
          <tr><th></th><th>動差法</th><th>MLE</th></tr>
        </thead>
        <tbody>
          <tr><td>直覺</td><td>match moments</td><td>maximize likelihood</td></tr>
          <tr><td>計算</td><td>解代數方程</td><td>解最佳化</td></tr>
          <tr><td>一致性</td><td>一致</td><td>一致</td></tr>
          <tr><td>漸近效率</td><td>通常次之</td><td>達到 Cramér–Rao 下界</td></tr>
          <tr><td>尊重支撐集</td><td>不一定</td><td>是</td></tr>
          <tr><td>當 MLE 難算時</td><td>好用起點</td><td>—</td></tr>
        </tbody>
      </table>

      <p class="takeaway">
        <strong>take-away：</strong>
        MoM 快且直觀，常用作 MLE 的初始猜測或當 likelihood 太複雜難解析時的替代。
        但在漸近效率與模型合理性上，MLE 通常是更好的選擇。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 16px; margin: 8px 0 6px; }
    .steps { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }

    .cmp { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .cmp th, .cmp td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .cmp th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .cmp td:first-child { font-weight: 600; color: var(--text); width: 30%; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh2MomComponent {}
