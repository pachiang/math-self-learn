import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-reg-ch7-link-function',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="GLM：一個框架，三種需求" subtitle="§7.1">
      <p>
        線性迴歸假設 Y = Xβ + ε，ε 常態。但真實世界的 Y 不一定是「連續、常態」：
      </p>
      <ul class="needs">
        <li><strong>二元</strong>：「是否點擊」、「是否患病」 → Y ∈ &#123;0, 1&#125;，Bernoulli</li>
        <li><strong>計數</strong>：「每小時來客數」、「事故次數」 → Y ∈ &#123;0, 1, 2, …&#125;，Poisson</li>
        <li><strong>正偏右</strong>：「保險索賠額」、「反應時間」 → Y &gt; 0，Gamma</li>
      </ul>
      <p>
        硬套線性迴歸會得到荒謬結果：預測「點擊機率 = 1.3」或「來客數 = −5」。
        <strong>廣義線性模型 (GLM)</strong> 是修正的標準答案。
      </p>

      <h4>GLM 的三個元件</h4>
      <div class="components">
        <div class="c">
          <div class="c-head">① 隨機分量 (Random)</div>
          <div class="c-body">
            Y 服從某個<strong>指數族</strong>分佈：<br>
            Normal, Bernoulli, Binomial, Poisson, Gamma, Exponential, …
          </div>
        </div>
        <div class="c">
          <div class="c-head">② 系統分量 (Systematic)</div>
          <div class="c-body">
            線性預測器<br>
            <code>η = Xβ</code>
          </div>
        </div>
        <div class="c">
          <div class="c-head">③ 連結函數 (Link)</div>
          <div class="c-body">
            把「E[Y] 的自然範圍」映射到實數全域<br>
            <code>g(E[Y]) = η = Xβ</code>
          </div>
        </div>
      </div>
    </app-prose-block>

    <app-prose-block subtitle="Link 家族">
      <h4>四個常用 GLM</h4>
      <table class="glm-table">
        <thead><tr><th>Y 的分佈</th><th>連結 g(μ)</th><th>μ 範圍</th><th>反向 g⁻¹</th><th>名稱</th></tr></thead>
        <tbody>
          <tr>
            <td>Normal</td>
            <td><code>μ</code></td>
            <td>(−∞, ∞)</td>
            <td>μ = η</td>
            <td>線性迴歸</td>
          </tr>
          <tr>
            <td>Bernoulli</td>
            <td><code>log(μ/(1−μ))</code>（logit）</td>
            <td>(0, 1)</td>
            <td>μ = 1/(1+e⁻η)</td>
            <td>Logistic</td>
          </tr>
          <tr>
            <td>Poisson</td>
            <td><code>log μ</code></td>
            <td>(0, ∞)</td>
            <td>μ = eη</td>
            <td>Log-linear</td>
          </tr>
          <tr>
            <td>Gamma</td>
            <td><code>1/μ</code> 或 <code>log μ</code></td>
            <td>(0, ∞)</td>
            <td>μ = 1/η 或 eη</td>
            <td>Gamma 迴歸</td>
          </tr>
        </tbody>
      </table>

      <div class="key-idea">
        <strong>為什麼要 link 而不是<em>轉換 Y</em>？</strong>
        想像 Y ∈ &#123;0, 1&#125;——你沒辦法「先取 log 再做線性迴歸」（因為 log(0) = −∞）。
        GLM 把轉換放在<strong>期望值 E[Y]</strong> 上、而非 Y 本身——這讓 0/1 資料也能用。
      </div>
    </app-prose-block>

    <app-prose-block subtitle="Fisher 遇到 GLM">
      <h4>擬合法：最大概似 + IRLS</h4>
      <p>
        OLS 有封閉解 β̂ = (XᵀX)⁻¹XᵀY。GLM 沒有——要用數值優化。但 Fisher 提出的
        <strong>Iteratively Reweighted Least Squares (IRLS)</strong> 讓 GLM 的 MLE 等價於反覆做<em>加權</em>線性迴歸：
      </p>
      <pre class="pseudo">
repeat:
  1. 用目前 β 算 η = Xβ, μ = g⁻¹(η)
  2. 算工作響應 z = η + (y − μ)·g′(μ)
  3. 算權重 w = 1 / (Var(y)·g′(μ)²)
  4. 解加權 OLS：β̂ = (Xᵀ W X)⁻¹ Xᵀ W z
until 收斂
      </pre>
      <p>
        這是所有 GLM 軟體背後的引擎——包括 R 的 <code>glm()</code> 和 Python 的 <code>statsmodels</code>。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        GLM = 指數族分佈 + 線性預測器 + 連結函數。
        這個框架讓「線性迴歸的思維」擴展到 0/1、計數、正偏資料——
        下面三節逐一展開 Logistic、Poisson、Gamma 的細節。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: #b06c4a; font-style: normal; font-weight: 700; }
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }
    .needs { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .needs strong { color: var(--accent); }

    .components { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0; }
    .c { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .c-head { font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 6px; text-align: center; }
    .c-body { font-size: 12px; line-height: 1.7; color: var(--text-secondary); text-align: center; }
    .c-body strong { color: var(--text); }

    .glm-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .glm-table th, .glm-table td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .glm-table th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }

    .pseudo { background: var(--bg-surface); padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text); line-height: 1.8; margin: 10px 0; white-space: pre; overflow-x: auto; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh7LinkFunctionComponent {}
