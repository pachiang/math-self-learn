import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-stats-ch4-z-t-test',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="z 檢定與 t 檢定" subtitle="§4.2">
      <p>
        檢定均值最常見的工具，依 σ 是否已知、樣本大小分成 z 與 t。
      </p>

      <h4>z 檢定（σ 已知或 n 大）</h4>
      <div class="centered-eq big">
        Z = (X̄ − μ₀) / (σ / √n) &nbsp;~&nbsp; N(0, 1)  under H₀
      </div>
      <p>
        H₀: μ = μ₀；雙尾：|Z| &gt; z_(α/2) 拒絕。95% 水準下臨界值 1.96。
      </p>

      <h4>t 檢定（σ 未知，用 S 估）</h4>
      <div class="centered-eq big">
        T = (X̄ − μ₀) / (S / √n) &nbsp;~&nbsp; t(n − 1)  under H₀
      </div>
      <p>
        相同結構，換成樣本標準差 + 查 t 表。實務上 99% 的情況都用這個。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="範例">
      <h4>一個實際例子</h4>
      <p>
        宣稱某廠零件壽命 μ₀ = 1000 小時。抽 n = 25 個，算得 X̄ = 965、S = 80。
        宣稱是否成立？（α = 0.05）
      </p>
      <div class="work">
        <div class="work-line">H₀: μ = 1000, &nbsp; H₁: μ ≠ 1000（雙尾）</div>
        <div class="work-line">T = (965 − 1000) / (80 / √25) = −35 / 16 = <strong>−2.19</strong></div>
        <div class="work-line">df = 24，t_(0.025, 24) ≈ 2.064</div>
        <div class="work-line">|−2.19| &gt; 2.064 → <strong>拒絕 H₀</strong>（p-value ≈ 0.039）</div>
      </div>
      <p>
        結論：有統計顯著的證據，說廠家宣稱的 1000 小時不實（實際較低）。
      </p>
    </app-prose-block>

    <app-prose-block>
      <h4>單尾 vs 雙尾</h4>
      <ul class="tails">
        <li><strong>雙尾</strong>：H₁ 是 μ ≠ μ₀（「不等於」）——拒絕區在兩邊，α 平分。</li>
        <li><strong>單尾</strong>：H₁ 是 μ &gt; μ₀ 或 μ &lt; μ₀——拒絕區只在一邊，全部 α 在那邊。</li>
      </ul>
      <p>
        單尾更容易拒絕 H₀（同 α 下臨界值較小），但<strong>只能在事前</strong>決定方向——
        看完資料再選「哪一邊」是 <strong>p-hacking</strong>。
      </p>

      <h4>檢定 vs CI：同一個硬幣的兩面</h4>
      <div class="centered-eq">
        拒絕 H₀: μ = μ₀ &nbsp;⟺&nbsp; μ₀ 不在 X̄ 的 CI 裡
      </div>
      <p>
        95% CI 剛好反映「哪些 μ₀ 我們<em>不會</em>拒絕」。
        在實務上 CI 更有資訊量：它告訴你範圍，檢定只給 yes/no。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        z / t 檢定都是「觀察 X̄ 偏離 μ₀ 幾個 SE」。
        差 2 個 SE 以上通常就顯著；差 3 個以上就很強。
        下一節我們問：<em>若 H₁ 為真，我們多大機率會偵測到？</em>——那叫檢定力。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .work { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.9; color: var(--text); }
    .work-line strong { color: var(--accent); }

    .tails { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .tails strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class StatsCh4ZtTestComponent {}
