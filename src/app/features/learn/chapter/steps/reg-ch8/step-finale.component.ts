import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-reg-ch8-finale',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="整門課的一張地圖" subtitle="§8.2 · 整課總結">
      <p>
        從 y = β₀ + β₁x + ε 的一條直線出發，我們走過了：
      </p>

      <div class="map">
        <div class="row">
          <div class="node core">β̂ = (XᵀX)⁻¹XᵀY</div>
          <div class="arrow">←── 所有方法的共同骨架</div>
        </div>

        <div class="branches">
          <div class="branch">
            <div class="b-head">擴充 X</div>
            <ul>
              <li>加類別變數 → <strong>ANOVA / ANCOVA</strong> (Ch6)</li>
              <li>加多項式 → 彎曲擬合</li>
              <li>加 spline → <strong>局部光滑</strong> (Ch8)</li>
              <li>加交互作用 → <strong>非加性效應</strong> (Ch6)</li>
            </ul>
          </div>
          <div class="branch">
            <div class="b-head">修改目標函數</div>
            <ul>
              <li>加 L2 → <strong>Ridge</strong>，解共線、降變異 (Ch5)</li>
              <li>加 L1 → <strong>Lasso</strong>，自動變數選擇 (Ch5)</li>
              <li>混合 → <strong>Elastic Net</strong> (Ch5)</li>
              <li>加權 → <strong>WLS</strong>，處理異方差</li>
            </ul>
          </div>
          <div class="branch">
            <div class="b-head">換 y 的分佈</div>
            <ul>
              <li>Bernoulli + logit → <strong>Logistic</strong> (Ch7)</li>
              <li>Poisson + log → <strong>Poisson 迴歸</strong> (Ch7)</li>
              <li>Gamma + log → <strong>Gamma 迴歸</strong></li>
              <li>任何指數族 → <strong>GLM 統一框架</strong> (Ch7)</li>
            </ul>
          </div>
          <div class="branch">
            <div class="b-head">驗證</div>
            <ul>
              <li>假設五條 (Ch3)</li>
              <li>殘差四件套 (Ch4.1)</li>
              <li>Q–Q plot 檢常態 (Ch4.2)</li>
              <li>Cook's D 檢影響力 (Ch4.3)</li>
              <li>VIF 檢共線 (Ch4.4)</li>
              <li>CV 估測試誤差 (Ch5.4)</li>
            </ul>
          </div>
        </div>
      </div>
    </app-prose-block>

    <app-prose-block subtitle="三條讓你不出錯的黃金法則">
      <h4>① 先看資料、再建模</h4>
      <p>
        畫散點圖、看分佈、找離群點。模型是資料的詮釋，不是讓<em>資料</em>去配合模型。
        Anscombe 四重奏的教訓永遠在。
      </p>

      <h4>② 先看殘差、再信結果</h4>
      <p>
        β̂ 和 R² 是一回事，模型合理是另一回事。殘差圖是所有假設的偵測器——
        別跳過這一步。
      </p>

      <h4>③ 相關 ≠ 因果</h4>
      <p>
        β̂ⱼ = 「其他變數固定下 xⱼ 的效應」——但這是<strong>統計意義上</strong>的控制，
        不等於實驗上的操控。觀察性資料永遠存在未觀察到的混淆變數。
        想說因果，先問：有隨機化嗎？有好的工具變數嗎？DAG 上控制的是後門路徑嗎？
      </p>
    </app-prose-block>

    <app-prose-block subtitle="這門課教了什麼，沒教什麼">
      <h4>我們到達的地方</h4>
      <ul class="covered">
        <li>經典的 OLS 與它的理論根（Gauss–Markov、MLE、投影）</li>
        <li>推論工具：t、F、CI、PI</li>
        <li>完整的診斷工具箱</li>
        <li>正則化 + 交叉驗證（現代機器學習的根基）</li>
        <li>ANOVA / ANCOVA 的線性模型化</li>
        <li>GLM：Logistic, Poisson 及以上</li>
        <li>非線性擴充：polynomial, spline, LOESS</li>
      </ul>

      <h4>沒談但值得繼續的方向</h4>
      <ul class="next">
        <li><strong>混合效應模型 (Mixed Models)</strong>：分層資料、重複量測、隨機效應</li>
        <li><strong>貝氏迴歸</strong>：prior + posterior + Stan/PyMC</li>
        <li><strong>因果推論</strong>：DAG、工具變數、DID、斷點迴歸</li>
        <li><strong>時間序列迴歸</strong>：ARMA 誤差、向量自迴歸</li>
        <li><strong>GAM</strong>：多維 spline 的可加模型</li>
        <li><strong>機器學習延伸</strong>：樹、森林、梯度提升、神經網路</li>
      </ul>
    </app-prose-block>

    <app-prose-block subtitle="結語">
      <div class="end-note">
        <p>
          線性模型看似「簡單」——但它是整個資料科學的核心。
        </p>
        <p>
          從 Gauss 為了計算穀神星軌道發明的最小平方法（1809），
          到 Fisher 統合出 ANOVA（1925），
          到 Nelder 與 Wedderburn 的 GLM（1972），
          再到 Tibshirani 的 Lasso（1996）——
          兩個世紀以來，這個「把資料投影到線性空間」的想法不斷擴張、始終不死。
        </p>
        <p>
          <strong>現在你手上的工具組，足以處理絕大多數真實的迴歸問題。</strong>
          深度學習？它最後一層就是 logistic 迴歸；embedding 空間裡做的都是線性運算。
          所謂 modern ML，很大部分仍然是這套古典工具的自動化和規模化。
        </p>
      </div>

      <p class="takeaway">
        <strong>恭喜完成迴歸與線性模型！</strong>
        你看懂了一條直線背後的深度——OLS、投影、BLUE、GLM、正則化、診斷⋯⋯
        <em>這門課學完，你有資格挑戰任何資料。</em>
      </p>
    </app-prose-block>
  `,
  styles: `
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }
    .map { display: flex; flex-direction: column; gap: 14px; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; margin: 12px 0; }

    .row { display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; }
    .node.core { padding: 12px 20px; background: var(--accent); color: white; border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; }
    .arrow { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .branches { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .branch { padding: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; }
    .b-head { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 6px; text-align: center; }
    .branch ul { margin: 0 0 0 18px; font-size: 12px; line-height: 1.8; color: var(--text-secondary); padding-left: 4px; }
    .branch strong { color: var(--accent); }

    .covered, .next { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .next strong { color: var(--accent); }

    .end-note { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 10px;
      font-size: 14px; line-height: 1.85; color: var(--text); }
    .end-note p { margin: 0 0 12px; }
    .end-note p:last-child { margin: 0; }
    .end-note strong { color: var(--accent); }

    .takeaway { padding: 16px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 10px;
      font-size: 15px; text-align: center; font-weight: 600; color: var(--accent); line-height: 1.7; margin-top: 14px; }
    .takeaway em { color: var(--text); font-style: normal; }
  `,
})
export class RegCh8FinaleComponent {}
