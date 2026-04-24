import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-stats-ch6-finale',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="整門數統的一張圖" subtitle="§6.3 · 整課總結">
      <p>
        整個數理統計只有一個問題：<strong>從有限樣本，對母體說些什麼？</strong>
        圍繞這個問題，我們發展了三套工具——三者結構相同，差在「問題怎麼問」。
      </p>

      <div class="three-pillars">
        <div class="pillar">
          <div class="p-head">估計 Estimation</div>
          <div class="p-q">「θ 多少？」</div>
          <div class="p-tools">
            點估計：MLE, MoM<br>
            區間估計：CI<br>
            評價：Bias, Var, MSE, CRLB
          </div>
        </div>
        <div class="pillar">
          <div class="p-head">檢定 Testing</div>
          <div class="p-q">「θ 等於某值嗎？」</div>
          <div class="p-tools">
            z, t, χ², F<br>
            α, β, p-value, power<br>
            Neyman–Pearson 引理
          </div>
        </div>
        <div class="pillar">
          <div class="p-head">迴歸 Regression</div>
          <div class="p-q">「y 如何隨 x 變化？」</div>
          <div class="p-tools">
            OLS, Gauss–Markov<br>
            R², 殘差診斷<br>
            ANOVA = 類別 x 的迴歸
          </div>
        </div>
      </div>
    </app-prose-block>

    <app-prose-block subtitle="一條主線">
      <h4>所有工具的共同骨架</h4>
      <div class="centered-eq big">
        估計 ± 臨界值 · SE
      </div>
      <p>
        CI 是這個；檢定統計量 (X̄ − μ₀) / SE 是這個；迴歸係數的 t 檢定也是這個。
        記住這條 + SE 隨 1/√n 變小——你就抓到了古典統計的靈魂。
      </p>

      <h4>四個貫穿整課的概念</h4>
      <ul class="themes">
        <li><strong>CLT 是基石</strong>：X̄ 近似 Normal 讓 z、t、卡方、F 全都有大樣本依據</li>
        <li><strong>自由度 df</strong>：樣本數 − 估計的參數數，從 Bessel 到 t、χ²、ANOVA 都在用</li>
        <li><strong>偏誤 vs 變異取捨</strong>：MSE 分解成 Bias² + Var，是 regularization 的理論根</li>
        <li><strong>概似 L(θ)</strong>：MLE、CRLB、LRT 全都是它的衍生</li>
      </ul>
    </app-prose-block>

    <app-prose-block subtitle="往前看">
      <h4>這門課之後能走的方向</h4>
      <ul class="next">
        <li><strong>貝氏統計</strong>：把 θ 當隨機變數，從 prior 更新到 posterior</li>
        <li><strong>廣義線性模型 (GLM)</strong>：logistic, Poisson 迴歸——當 y 不是連續</li>
        <li><strong>統計學習</strong>：bias-variance、cross-validation、正則化</li>
        <li><strong>因果推論</strong>：相關 ≠ 因果；DAG、工具變數、倍差法</li>
        <li><strong>時間序列</strong>：資料不再獨立——ARIMA、狀態空間模型</li>
        <li><strong>無母數 & bootstrap</strong>：當 Normal 假設不合理時</li>
      </ul>

      <h4>一句話結尾</h4>
      <p class="final">
        機率論告訴你<strong>「世界會發生什麼」</strong>；數理統計告訴你
        <strong>「從看到的事能推出世界是什麼」</strong>——
        這就是所有資料科學、機器學習、科學研究背後的真正底層。
      </p>

      <p class="takeaway">
        <strong>恭喜完成數理統計！</strong>
        你現在擁有從資料到結論的完整工具組。
        機率 + 統計 + 線性代數 + 微積分，是資料科學的四大支柱——你已經集齊三塊。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 14px; background: var(--accent-10); border-radius: 8px;
      font-size: 16px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 18px; padding: 16px; }
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }

    .three-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0; }
    .pillar { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; text-align: center; }
    .p-head { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .p-q { font-size: 12px; color: var(--text); font-style: italic; margin-bottom: 10px; }
    .p-tools { font-size: 11px; color: var(--text-secondary); line-height: 1.7; font-family: 'JetBrains Mono', monospace; }

    .themes, .next { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .themes strong, .next strong { color: var(--accent); }

    .final { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 10px;
      font-size: 15px; line-height: 1.8; color: var(--text); margin: 10px 0; }
    .final strong { color: var(--accent); }

    .takeaway { padding: 16px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 10px;
      font-size: 15px; text-align: center; font-weight: 600; color: var(--accent); line-height: 1.7; }
  `,
})
export class StatsCh6FinaleComponent {}
