import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-stats-ch4-neyman-pearson',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="Neyman–Pearson 引理：最強檢定" subtitle="§4.4">
      <p>
        在所有 Type I 錯誤 ≤ α 的檢定中，<strong>哪一個檢定力最高？</strong>
        Neyman–Pearson (1933) 給了漂亮的答案：<strong>概似比檢定 (LRT)</strong>。
      </p>

      <h4>簡單對簡單的情況</h4>
      <p>
        當 H₀: θ = θ₀ vs H₁: θ = θ₁（兩個具體的值）：
      </p>
      <div class="centered-eq big">
        Λ(X) = L(θ₁; X) / L(θ₀; X)
      </div>
      <p>
        當 Λ &gt; k 就拒絕 H₀（k 由 α 決定）。這個檢定<strong>在所有滿足 α 的檢定中檢定力最高</strong>——
        稱為 Uniformly Most Powerful (UMP)。
      </p>

      <h4>直覺</h4>
      <p>
        Λ 衡量「資料對 H₁ 的支持度 相對於 對 H₀ 的支持度」。比值大 → 資料像 H₁ 多過 H₀ → 拒絕 H₀。
        這和 MLE 是同個精神：讓資料說話，選擇資料最偏向的假設。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="複合假設的推廣">
      <h4>廣義概似比檢定 (GLRT)</h4>
      <p>
        實務中 H₀, H₁ 通常是複合的（例如 μ = 0 vs μ &gt; 0）。此時用：
      </p>
      <div class="centered-eq big">
        Λ = max_&#123;θ ∈ H₀&#125; L(θ) / max_&#123;θ ∈ H₀ ∪ H₁&#125; L(θ)
      </div>
      <p>
        小 Λ → 約束到 H₀ 的最大 likelihood 遠不如放開——拒絕 H₀。
      </p>

      <h4>Wilks 定理</h4>
      <p>
        大樣本極限：
      </p>
      <div class="centered-eq">
        −2 log Λ &nbsp;→ᵈ&nbsp; χ²(df)
      </div>
      <p>
        df = H₁ 參數數 − H₀ 參數數。這讓 GLRT 變成<strong>通用檢定工具</strong>——
        迴歸、GLM、混合效應模型、類神經網路的模型比較通通用它。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="具體例子">
      <h4>Z 檢定就是 LRT</h4>
      <p>
        N(μ, σ²)，σ 已知，H₀: μ = μ₀ vs H₁: μ = μ₁（μ₁ &gt; μ₀）：
      </p>
      <div class="centered-eq">
        Λ = exp(n(μ₁ − μ₀)(X̄ − (μ₀ + μ₁)/2) / σ²)
      </div>
      <p>
        Λ 是 X̄ 的單調函數——「Λ &gt; k」等價於「X̄ &gt; c」，也就是 z 檢定的拒絕規則。
        <strong>原來 z 檢定就是 NP 最強檢定</strong>。
      </p>

      <h4>LRT 的威力</h4>
      <ul class="lrt-uses">
        <li>迴歸裡比較兩個巢狀模型：看加的變數是否顯著</li>
        <li>混合模型看某隨機效應是否值得保留</li>
        <li>深度學習的模型選擇（AIC, BIC 都是 GLRT 的變形）</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        Neyman–Pearson 為假設檢定打下最深的理論根：概似比檢定在固定 α 下檢定力最高。
        常見的 z 檢定、t 檢定、χ² 檢定都是它的特例。Wilks 定理則把這套推進<strong>任何</strong>參數模型。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    h4 { color: var(--accent); font-size: 16px; margin: 8px 0 6px; }
    .lrt-uses { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class StatsCh4NeymanPearsonComponent {}
