import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-stats-ch6-r-squared',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="R² 與殘差診斷" subtitle="§6.2">
      <h4>R²：模型解釋了多少變異</h4>
      <p>
        把總變異拆成「被模型解釋」與「殘差（沒被解釋）」兩部分——和 ANOVA 同個精神：
      </p>
      <div class="centered-eq big">
        SS_total = SS_reg + SS_res
      </div>
      <div class="centered-eq big">
        R² = SS_reg / SS_total = 1 − SS_res / SS_total
      </div>
      <p>
        R² ∈ [0, 1]：
      </p>
      <ul class="rsq">
        <li>R² = 1：完美擬合（殘差全 0）</li>
        <li>R² = 0.8：模型解釋了 80% 的 y 變異</li>
        <li>R² = 0：模型不比「永遠猜 ȳ」好</li>
      </ul>
      <p>
        在簡單線性迴歸，R² = r²（相關係數的平方）。所以 r = 0.9 → R² = 0.81。
      </p>

      <div class="key-idea">
        <strong>陷阱：R² 高 ≠ 模型好。</strong>
        極端離群點可以騙高 R²；非線性關係硬擬直線 R² 也不低。
        一定要配合<strong>殘差圖</strong>檢查。
      </div>
    </app-prose-block>

    <app-prose-block subtitle="Anscombe 四重奏">
      <h4>R² 看不出的問題</h4>
      <p>
        1973 年 Anscombe 做了四組資料：
      </p>
      <ul class="anscombe">
        <li>四組的 β̂₀、β̂₁、R²、x̄、ȳ、Var(x)、Var(y) <strong>全部相同</strong></li>
        <li>但畫出來四張圖差異極大：一張正常、一張明顯非線性、一張有離群點、一張只靠一個點決定斜率</li>
      </ul>
      <p>
        這是統計史上最有名的警告：<strong>不要只看數字，要畫圖</strong>。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="殘差四診">
      <h4>殘差圖看什麼</h4>
      <ol class="diag">
        <li>
          <strong>殘差 vs 預測值</strong>：應該像「沒結構的霧」。
          若出現漏斗（variance 隨 ŷ 變）→ <em>異方差</em>。
          若出現曲線 → 關係根本不是線性。
        </li>
        <li>
          <strong>殘差直方圖 / Q-Q plot</strong>：應該接近 Normal。
          有偏 / 長尾 → 檢定與 CI 的推論需要打折。
        </li>
        <li>
          <strong>殘差 vs 時間（或觀察順序）</strong>：應該隨機。
          有趨勢或週期 → 資料有時序相依，需時間序列模型。
        </li>
        <li>
          <strong>影響力點</strong>：Cook's distance, leverage。
          少數「超重」點可能主導整條線——要回去看是資料錯誤還是真實現象。
        </li>
      </ol>

      <h4>修正 R²（adjusted R²）</h4>
      <p>
        加更多預測變數 R² 必不降——即使變數完全無關。為懲罰過度擬合：
      </p>
      <div class="centered-eq">
        R²_adj = 1 − (1 − R²) · (n − 1) / (n − p − 1)
      </div>
      <p>
        p = 預測變數數。R²_adj 可能下降——若新增變數不夠有用。
        比模型大小時用它而不是 R²。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        R² 給你「解釋比例」，但不保證模型合理。一定要看殘差圖——Anscombe 四重奏的教訓。
        多變數比較記得用 R²_adj。
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
    .rsq, .anscombe { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .rsq strong, .anscombe strong { color: var(--accent); }

    .diag { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .diag strong { color: var(--accent); }
    .diag em { color: #b06c4a; font-style: normal; font-weight: 600; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class StatsCh6RSquaredComponent {}
