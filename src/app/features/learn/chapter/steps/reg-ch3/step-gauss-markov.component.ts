import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-reg-ch3-gauss-markov',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="Gauss–Markov 定理：OLS 是 BLUE" subtitle="§3.2">
      <p>
        在下列條件下（比五條假設弱——<strong>不需要 Normality</strong>）：
      </p>
      <ul class="gm-conds">
        <li>模型線性：E[Y] = Xβ</li>
        <li>X 滿秩（無共線性）</li>
        <li>E[ε|X] = 0</li>
        <li>Var(ε|X) = σ²I（等變異 + 不相關）</li>
      </ul>

      <div class="centered-eq big">
        OLS 是 <strong>BLUE</strong>：<em>Best Linear Unbiased Estimator</em>
      </div>

      <h4>拆解 BLUE</h4>
      <ul class="blue-terms">
        <li><strong>Linear</strong>：β̂ 是 Y 的線性組合（AY 的形式）</li>
        <li><strong>Unbiased</strong>：E[β̂] = β</li>
        <li><strong>Best</strong>：在所有線性無偏估計中，Var(β̂) 最小</li>
      </ul>

      <p>
        「Best」的具體意思：對任意線性無偏估計 β̃，Var(β̃) − Var(β̂) 是<em>半正定</em>矩陣——
        每個係數的變異都 ≥ OLS 給出的，且所有線性組合也是。
      </p>

      <div class="key-idea">
        <strong>為什麼 Gauss–Markov 這麼重要？</strong>
        它不需要 Normality——就算誤差是 Laplace、t(3)、任何分佈，只要前四條滿足，
        OLS 仍是所有線性無偏估計中變異最小的。
        這讓 OLS 成為<em>穩健的預設選擇</em>。
      </div>

      <h4>但「Best」不是無敵</h4>
      <p>
        定理只保證「在<em>線性無偏</em>這個家族裡」OLS 最好。走出這個家族，有可能做得更好：
      </p>
      <ul class="beyond">
        <li><strong>有偏估計</strong>：Ridge、Lasso 接受一點偏誤換更大變異降幅 → 總 MSE 更低（Ch5）</li>
        <li><strong>非線性估計</strong>：重尾誤差下，中位數迴歸（LAD）變異更小</li>
        <li><strong>有違反假設</strong>：異方差時 WLS 更好；AR 誤差時 GLS 更好</li>
      </ul>
    </app-prose-block>

    <app-prose-block subtitle="最短證明大綱">
      <h4>Gauss–Markov 證明兩頁版</h4>
      <ol class="proof">
        <li>任一線性無偏估計可寫成 β̃ = (XᵀX)⁻¹Xᵀ Y + CY，其中 CX = 0（才能無偏）</li>
        <li>算 Var(β̃) = σ²(XᵀX)⁻¹ + σ²CCᵀ</li>
        <li>CCᵀ 是半正定 → Var(β̃) ≥ Var(β̂_OLS) = σ²(XᵀX)⁻¹</li>
      </ol>
      <p>
        關鍵代數事實：<strong>CCᵀ 永遠半正定</strong>。OLS 剛好對應 C = 0——
        它把「Y 的加權」選得最精準，沒浪費一點資訊。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="加上 Normality">
      <h4>多加一條：ε ~ N(0, σ²I)</h4>
      <p>
        這時 β̂ 不只變異最小，<strong>所有</strong>無偏估計都沒它好（不限線性）：
      </p>
      <div class="centered-eq">
        OLS = MLE = UMVUE
      </div>
      <ul class="crown">
        <li><strong>MLE</strong>：β̂ 是最大概似估計（Ch2 數統觀點）</li>
        <li><strong>UMVUE</strong>：Uniformly Minimum Variance Unbiased Estimator</li>
        <li>達到 Cramér–Rao 下界 → 不可能更有效</li>
      </ul>
      <p>
        Normality 是「甜蜜點」：多付出一個假設，換來「所有好性質同時成立」。
        大樣本時即使 ε 不是 Normal，CLT 讓 β̂ 漸近 Normal——推論公式依然能用。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Gauss–Markov = 「OLS 在線性無偏家族裡變異最小」，<em>不需要 Normality</em>。
        加上 Normality，OLS 更成為最大概似、Cramér–Rao 達標的最優估計。
        這兩層結果是整個古典統計對 OLS 的最高背書。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 14px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; color: var(--accent); font-weight: 600; margin: 12px 0; }
    .centered-eq.big { font-size: 18px; padding: 18px; }
    .centered-eq em { color: var(--accent); font-style: normal; font-weight: 700; }
    .centered-eq strong { font-size: 22px; letter-spacing: 0.05em; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }

    .gm-conds, .blue-terms, .beyond, .proof, .crown { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .blue-terms strong, .beyond strong, .crown strong { color: var(--accent); }
    .blue-terms em, .proof strong { color: var(--text); font-style: normal; font-weight: 700; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh3GaussMarkovComponent {}
