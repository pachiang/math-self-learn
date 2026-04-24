import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-stats-ch5-chi-square',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="χ² 檢定：類別資料的通用工具" subtitle="§5.2">
      <p>
        類別資料（次數、計數）不能用 t 檢定。χ² 檢定靠比較
        <strong>觀察次數 O</strong> 與 <strong>期望次數 E</strong>：
      </p>
      <div class="centered-eq big">
        χ² = Σ (O − E)² / E &nbsp;~&nbsp; χ²(df)
      </div>
      <p>
        直覺：若 H₀ 真，O 該和 E 差不多；χ² 越大 → O 偏離 E 越遠 → 證據越強。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="兩種最常見用法">
      <h4>1. 適合度檢定 (Goodness of Fit)</h4>
      <p>
        檢查資料是否符合某個假設分佈。例：骰子是否公正？
      </p>
      <div class="ex">
        擲 60 次骰子：觀察到 &#123;12, 8, 10, 11, 9, 10&#125;<br>
        H₀：骰子公正 → 期望每面 10 次<br>
        χ² = (12−10)²/10 + (8−10)²/10 + … = 0.4 + 0.4 + 0 + 0.1 + 0.1 + 0 = <strong>1.0</strong><br>
        df = k − 1 = 5，臨界值 χ²_(0.05, 5) = 11.07 → <strong>不拒絕 H₀</strong>
      </div>
      <p>
        若有估計參數，df 要再減：df = k − 1 − (估計參數數)。
      </p>

      <h4>2. 獨立性檢定 (Test of Independence)</h4>
      <p>
        給兩個類別變數的列聯表 (contingency table)，檢查它們是否獨立。
      </p>
      <div class="ex">
        問卷：「吸煙？」× 「有心臟病？」<br>
        若獨立，期望 E_ij = (第 i 列總和 × 第 j 行總和) / N<br>
        χ² = Σᵢⱼ (O_ij − E_ij)² / E_ij &nbsp;~&nbsp; χ²((r−1)(c−1))
      </div>
      <p>
        df = (列數 − 1) × (行數 − 1)——多了一個維度，自由度乘起來。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="陷阱">
      <h4>注意事項</h4>
      <ul class="caveats">
        <li><strong>期望次數太小</strong>（E &lt; 5）時 χ² 近似不準，改用 Fisher's exact test。</li>
        <li><strong>獨立性檢定只告訴你有沒有關係</strong>，不告訴你<em>關係有多強</em>。效應大小用 Cramér's V 或 φ 係數。</li>
        <li><strong>χ² 檢定 = LRT 在多項式分佈下的大樣本近似</strong>——所以它本質上仍然是 Neyman–Pearson 家族。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        類別資料、次數比較 → χ²。
        公式簡單（Σ(O−E)²/E），用途超廣：從孟德爾遺傳比例、民意調查交叉分析、
        到 A/B 測試的點擊率比較。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }

    .ex { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px;
      font-size: 13px; line-height: 1.8; font-family: 'JetBrains Mono', monospace; color: var(--text); margin: 8px 0; }
    .ex strong { color: var(--accent); }

    .caveats { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .caveats strong { color: var(--accent); }
    .caveats em { color: var(--text); font-style: normal; font-weight: 600; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class StatsCh5ChiSquareComponent {}
