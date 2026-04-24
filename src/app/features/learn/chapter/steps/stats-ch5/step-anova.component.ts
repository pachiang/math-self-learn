import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-stats-ch5-anova',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="ANOVA：三群以上的比較" subtitle="§5.3">
      <p>
        要比三組以上的均值，能不能就跑 3 個雙樣本 t 檢定？<br>
        <strong>不行</strong>——每次檢定錯誤率 5%，三次就接近 1 − 0.95³ ≈ 14%。
        這叫 <strong>multiple comparison problem</strong>。
      </p>
      <p>
        變異數分析 (ANOVA) 用<em>單一檢定</em>同時比較所有組：
      </p>

      <h4>核心想法</h4>
      <p>
        把<strong>總變異</strong>拆成兩部分：
      </p>
      <div class="centered-eq big">
        SS_total = SS_between + SS_within
      </div>
      <ul class="ss">
        <li><strong>組間變異 SS_between</strong>：各組均值偏離總均值多遠</li>
        <li><strong>組內變異 SS_within</strong>：每組內部資料的離散程度（「noise」）</li>
      </ul>
      <p>
        若各組真的一樣，SS_between 只反映隨機波動，和 SS_within 比起來應該差不多。
        若各組真的不同，SS_between 會遠大於 SS_within。
      </p>

      <div class="centered-eq big">
        F = (SS_between / (k − 1)) / (SS_within / (N − k)) &nbsp;~&nbsp; F(k−1, N−k)  under H₀
      </div>
      <p>
        k = 組數、N = 總樣本。F 大 → 組間佔比重 → 拒絕 H₀（各組一樣）。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="例子">
      <h4>三種肥料、每組 5 盆花</h4>
      <p>
        測量生長高度。F = 6.8，df = (2, 12)，臨界值 F_(0.05, 2, 12) = 3.89。
        F &gt; 臨界值 → 至少有一組不同。
      </p>
      <p>
        但 ANOVA 只告訴你「有差異」，<strong>不告訴你哪兩組有差</strong>。
        後續需要 post-hoc 檢定（Tukey HSD、Bonferroni）去找出差異所在。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="ANOVA = 線性模型">
      <h4>和迴歸的關係</h4>
      <p>
        ANOVA 其實是線性迴歸的特例（預測變數全是類別 dummy variables）：
      </p>
      <div class="centered-eq">
        Yᵢⱼ = μ + αᵢ + εᵢⱼ，  εᵢⱼ ~ N(0, σ²)
      </div>
      <p>
        αᵢ 是第 i 組相對於總均值 μ 的偏移。檢定 H₀: α₁ = α₂ = ⋯ = α_k = 0。
      </p>

      <h4>延伸</h4>
      <ul class="ext">
        <li><strong>雙因子 ANOVA</strong>：兩個類別因子，可以看交互作用</li>
        <li><strong>重複量測 ANOVA</strong>：同個人多次量測，配對精神的多群版</li>
        <li><strong>ANCOVA</strong>：ANOVA + 連續協變量</li>
        <li><strong>MANOVA</strong>：多個依變量一起分析</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        要比三組以上 → ANOVA，用 F 檢定。發現有差異後，再用 post-hoc 找出哪幾組不同。
        整個 ANOVA 家族都是<strong>線性模型</strong>——下一章進入迴歸就是同個框架的連續版。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }
    .ss, .ext { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .ss strong, .ext strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class StatsCh5AnovaComponent {}
