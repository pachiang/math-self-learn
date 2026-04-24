import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-reg-ch2-matrix-form',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="矩陣形式：Y = Xβ + ε" subtitle="§2.2">
      <p>
        有 p 個預測變數時，逐個對 βⱼ 求偏導太繁。改用矩陣，所有公式一眼可見。
      </p>

      <h4>把資料疊成矩陣</h4>
      <div class="matrix-row">
        <div class="mat">
          <div class="mat-lab">Y (n×1)</div>
          <div class="mat-grid y">
            <div>y₁</div><div>y₂</div><div>⋮</div><div>yₙ</div>
          </div>
        </div>
        <div class="eq">=</div>
        <div class="mat">
          <div class="mat-lab">X (n×(p+1))</div>
          <div class="mat-grid x">
            <div>1</div><div>x₁₁</div><div>…</div><div>x₁ₚ</div>
            <div>1</div><div>x₂₁</div><div>…</div><div>x₂ₚ</div>
            <div>⋮</div><div>⋮</div><div>⋱</div><div>⋮</div>
            <div>1</div><div>xₙ₁</div><div>…</div><div>xₙₚ</div>
          </div>
        </div>
        <div class="eq">·</div>
        <div class="mat">
          <div class="mat-lab">β ((p+1)×1)</div>
          <div class="mat-grid b">
            <div>β₀</div><div>β₁</div><div>⋮</div><div>βₚ</div>
          </div>
        </div>
        <div class="eq">+</div>
        <div class="mat">
          <div class="mat-lab">ε (n×1)</div>
          <div class="mat-grid e">
            <div>ε₁</div><div>ε₂</div><div>⋮</div><div>εₙ</div>
          </div>
        </div>
      </div>

      <p>
        第一行都是 1，讓 β₀ 吸收截距。其他每一行是一筆觀察（n 筆）、每一列是一個變數（p 個 + 1 個截距）。
      </p>

      <h4>目標函數</h4>
      <div class="centered-eq big">
        SSE(β) = ‖Y − Xβ‖² = (Y − Xβ)ᵀ (Y − Xβ)
      </div>

      <h4>正規方程 (Normal Equations)</h4>
      <p>
        對 β 取梯度設為 0：
      </p>
      <div class="centered-eq big">
        ∂SSE/∂β = −2Xᵀ(Y − Xβ) = 0
      </div>
      <div class="centered-eq big">
        XᵀX β̂ = XᵀY
      </div>
      <p>
        若 XᵀX 可逆（即 X 的欄線性獨立——無完美共線性）：
      </p>
      <div class="centered-eq big accent">
        β̂ = (XᵀX)⁻¹ XᵀY
      </div>
    </app-prose-block>

    <app-prose-block subtitle="推論公式一眼可見">
      <h4>抽樣分佈</h4>
      <div class="centered-eq">
        β̂ ~ N(β, σ² (XᵀX)⁻¹)
      </div>
      <p>
        每個 β̂ⱼ 的變異 = σ² · [(XᵀX)⁻¹]ⱼⱼ。
        預估 σ² 用 <code>σ̂² = SSE / (n − p − 1)</code>（消掉 p + 1 個自由度）。
      </p>

      <h4>擬合值與殘差</h4>
      <div class="centered-eq">
        Ŷ = Xβ̂ = X(XᵀX)⁻¹Xᵀ Y = H Y
      </div>
      <p>
        H = X(XᵀX)⁻¹Xᵀ 稱為 <strong>帽子矩陣</strong>（<em>「把 Y 戴上帽子」</em>）。
        下一節會深入 H 的幾何意義。
      </p>

      <div class="centered-eq">
        e = Y − Ŷ = (I − H) Y
      </div>

      <div class="key-idea">
        <strong>線性代數的勝利：</strong>
        一個 β̂ = (XᵀX)⁻¹XᵀY 公式統一簡單迴歸、多元迴歸、ANOVA、ANCOVA、多項式迴歸——
        只要 X 換不同東西，所有「線性模型」全用這條公式。
        這也是為何這門課叫「線性模型」而非只叫「迴歸」。
      </div>
    </app-prose-block>

    <app-prose-block subtitle="數值計算的注意事項">
      <h4>實務不要真的算 (XᵀX)⁻¹</h4>
      <p>
        教科書寫 β̂ = (XᵀX)⁻¹XᵀY，但真實軟體（R 的 lm、Python 的 sklearn）用：
      </p>
      <ul class="impl">
        <li><strong>QR 分解</strong>：X = QR → β̂ = R⁻¹QᵀY（數值穩定）</li>
        <li><strong>SVD</strong>：X = UΣVᵀ → β̂ = V Σ⁻¹ UᵀY（即使 X 病態也能處理）</li>
        <li><strong>Cholesky</strong>：XᵀX = LLᵀ → 解 LLᵀβ̂ = XᵀY（快但要求 XᵀX 正定）</li>
      </ul>
      <p>
        <strong>教學用封閉解 vs 實務用矩陣分解</strong>——和線代 Ch4、Ch5、Ch8 的內容完全呼應。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        β̂ = (XᵀX)⁻¹XᵀY 是一條公式解決所有線性模型的問題。
        幾何上它是 Y 到 X 欄空間的投影（下一節）；實務上用 QR / SVD 穩定計算。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .centered-eq.accent { font-size: 18px; background: var(--accent); color: white; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .matrix-row { display: flex; align-items: center; gap: 8px; justify-content: center; margin: 16px 0; flex-wrap: wrap; }
    .mat { display: flex; flex-direction: column; align-items: center; }
    .mat-lab { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
    .mat-grid { display: grid; border: 2px solid var(--border-strong); border-radius: 4px; padding: 6px 8px; gap: 4px 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text); }
    .mat-grid.y, .mat-grid.b, .mat-grid.e { grid-template-columns: 1fr; }
    .mat-grid.x { grid-template-columns: repeat(4, auto); }
    .eq { font-size: 18px; color: var(--accent); font-weight: 700; }

    .impl { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .impl strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh2MatrixFormComponent {}
