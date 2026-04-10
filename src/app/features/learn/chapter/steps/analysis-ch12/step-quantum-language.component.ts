import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-quantum-language',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="量子力學的語言" subtitle="§12.8">
      <p>
        量子力學的數學框架<strong>就是</strong> Hilbert 空間。
        線代 Ch10（複矩陣與量子）是有限維的預覽——
        現在有了完整的 Hilbert 空間理論，可以看到全貌。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="量子力學 = Hilbert 空間的物理詮釋">
      <div class="dictionary">
        <table class="dict-table">
          <thead>
            <tr><th>物理</th><th>數學（Hilbert 空間）</th><th>線代 Ch10</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>量子態 |ψ⟩</td>
              <td>H 中的單位向量</td>
              <td>Cⁿ 中的向量</td>
            </tr>
            <tr>
              <td>可觀測量 A</td>
              <td>自伴算子 A = A*</td>
              <td>Hermitian 矩陣</td>
            </tr>
            <tr>
              <td>測量結果</td>
              <td>A 的特徵值</td>
              <td>矩陣的特徵值</td>
            </tr>
            <tr>
              <td>測量機率</td>
              <td>|⟨eₙ, ψ⟩|²</td>
              <td>|⟨eₙ|ψ⟩|²</td>
            </tr>
            <tr>
              <td>時間演化</td>
              <td>e^(-iHt/ℏ)（Unitary 群）</td>
              <td>Unitary 矩陣</td>
            </tr>
            <tr>
              <td>態疊加</td>
              <td>向量加法</td>
              <td>向量加法</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="key-examples">
        <div class="ke-card">
          <div class="kec-title">位置空間</div>
          <div class="kec-body">
            H = L²(R)。波函數 ψ(x) 是 L² 裡的向量。<br />
            |ψ(x)|² = 在 x 處找到粒子的機率密度。<br />
            ||ψ||₂ = 1（歸一化 = 機率總和 = 1）。
          </div>
        </div>
        <div class="ke-card">
          <div class="kec-title">動量空間</div>
          <div class="kec-body">
            Fourier 變換把位置空間映射到動量空間。<br />
            Parseval 等式 → 兩個空間的「能量」相同。<br />
            不確定性原理 = Cauchy-Schwarz 不等式的推論。
          </div>
        </div>
      </div>

      <div class="uncertainty">
        <div class="unc-title">Heisenberg 不確定性 = Cauchy-Schwarz</div>
        <div class="unc-body">
          ΔxΔp ≥ ℏ/2 的證明只需要一步 Cauchy-Schwarz 不等式。
          這個深刻的物理定律<strong>就是 Hilbert 空間幾何的直接結果</strong>。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節心智圖總結 Hilbert 空間和整個 Part II。</p>
    </app-prose-block>
  `,
  styles: `
    .dictionary { margin-bottom: 14px; overflow-x: auto; }
    .dict-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .dict-table th { padding: 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; background: var(--bg-surface); }
    .dict-table td { padding: 8px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .key-examples { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    @media (max-width: 500px) { .key-examples { grid-template-columns: 1fr; } }
    .ke-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .kec-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
    .kec-body { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .uncertainty { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .unc-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .unc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepQuantumLanguageComponent {}
