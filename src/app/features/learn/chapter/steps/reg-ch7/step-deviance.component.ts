import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-reg-ch7-deviance',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="Deviance 與 GLM 的模型比較" subtitle="§7.4">
      <p>
        線性迴歸用 SSE 衡量擬合好壞。GLM 用 <strong>Deviance</strong>——
        基於 likelihood 的自然替代。
      </p>

      <h4>定義</h4>
      <div class="centered-eq big">
        D(y, μ̂) = 2 [ ℓ(y; y) − ℓ(μ̂; y) ]
      </div>
      <p>
        ℓ(y; y) 是「飽和模型」（每個觀察各擬合一個參數）的 log-likelihood——完美擬合。<br>
        ℓ(μ̂; y) 是當前模型的 log-likelihood。<br>
        D 衡量「當前模型離完美擬合有多遠」——類似線性迴歸的 SSE。
      </p>

      <h4>對 Normal 就是 SSE</h4>
      <p>
        Normal GLM 的 deviance = Σ(y − μ̂)²/σ² = SSE/σ²。
        線性迴歸的世界其實是 GLM 的子集——SSE 是 deviance 的特例。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="兩個重要用途">
      <h4>① 模型擬合度：Deviance vs χ²</h4>
      <p>
        在大樣本下：
      </p>
      <div class="centered-eq">
        D ~ χ²(n − p)  under H₀（模型正確）
      </div>
      <p>
        若 D 遠大於 n − p → 拒絕「模型正確」的 H₀ → 模型擬合差。
        一個經驗比：D / (n − p) 應接近 1；遠大於 1 → 擬合不良 / 過度離散。
      </p>

      <h4>② 巢狀模型比較：Likelihood Ratio Test</h4>
      <p>
        要比較兩個巢狀 GLM（M₀ ⊂ M₁），取 deviance 差：
      </p>
      <div class="centered-eq big">
        ΔD = D(M₀) − D(M₁) ~ χ²(q)
      </div>
      <p>
        q = M₁ 比 M₀ 多出的參數數。這就是 GLM 版的 F 檢定——
        <strong>Wilks 定理的直接應用</strong>（數統 Ch4 NP 引理的推廣）。
      </p>

      <div class="key-idea">
        <strong>AIC / BIC 也用 deviance：</strong>
        <br>AIC = D + 2k &nbsp; / &nbsp; BIC = D + k log n
        <br>選最小 AIC / BIC 的模型。這和線性迴歸用 RSS 組合 AIC 的邏輯一致。
      </div>
    </app-prose-block>

    <app-prose-block subtitle="Pseudo R²">
      <h4>GLM 沒有傳統 R²</h4>
      <p>
        Logistic 迴歸的 y 是 0/1，算「Σ(y − ŷ)² / Σ(y − ȳ)²」意義不大。
        改用 <strong>pseudo R²</strong>：
      </p>
      <div class="centered-eq">
        McFadden R² = 1 − ℓ(M) / ℓ(null)
      </div>
      <ul class="mcf">
        <li>ℓ(M)：當前模型的 log-likelihood</li>
        <li>ℓ(null)：只含截距的模型</li>
        <li>McFadden 的 0.2 – 0.4 就算「很好」（直覺上不像線性 R²）</li>
      </ul>
      <p>
        其他版本：Cox–Snell、Nagelkerke、Tjur。都各有缺點——報告時明確說哪個版本。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="診斷：殘差類型">
      <h4>GLM 的殘差不只一種</h4>
      <table class="res-types">
        <thead><tr><th>類型</th><th>公式</th><th>用途</th></tr></thead>
        <tbody>
          <tr>
            <td>Raw (response)</td>
            <td>y − μ̂</td>
            <td>最直觀但異方差嚴重</td>
          </tr>
          <tr>
            <td>Pearson</td>
            <td>(y − μ̂) / √Var(μ̂)</td>
            <td>標準化，Σr² ≈ Pearson χ²</td>
          </tr>
          <tr>
            <td>Deviance</td>
            <td>sign(y − μ̂) √(deviance 貢獻)</td>
            <td>最推薦，近似 Normal</td>
          </tr>
        </tbody>
      </table>
      <p>
        看診斷圖時用 <strong>deviance residuals</strong>——
        它們在 GLM 裡扮演「普通殘差」的角色，該看的都看（異方差、結構、Q–Q）。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Deviance 是 GLM 的 SSE——越小越好。
        ΔDeviance 做巢狀模型比較（LRT）。
        AIC / BIC 做非巢狀模型比較。
        Deviance 殘差做診斷。
        這套工具和線性迴歸一一對應，只是從「平方距離」升級到「likelihood 距離」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }
    .mcf { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }

    .res-types { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .res-types th, .res-types td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .res-types th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .res-types td:first-child { font-weight: 700; color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh7DevianceComponent {}
