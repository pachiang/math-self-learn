import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-orthogonal-complement',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正交補與直和分解" subtitle="§12.4">
      <p>
        M 是 Hilbert 空間 H 的閉子空間。<strong>正交補</strong>：
      </p>
      <p class="formula">M⊥ = {{ '{' }}f ∈ H : ⟨f, m⟩ = 0 ∀ m ∈ M{{ '}' }}</p>
      <p>
        <strong>直和分解</strong>：H = M ⊕ M⊥。每個 f ∈ H 唯一地分解為 f = m + m⊥。
      </p>
      <p>
        這跟線代 Ch5（四個基本子空間）和 Ch18（零化子）是同一個故事的 Hilbert 版本。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="直和分解的類比">
      <div class="analogy">
        <table class="at">
          <thead><tr><th></th><th>Rⁿ（線代）</th><th>Hilbert 空間</th></tr></thead>
          <tbody>
            <tr>
              <th>子空間</th>
              <td>col(A)（列空間）</td>
              <td>M（閉子空間）</td>
            </tr>
            <tr>
              <th>正交補</th>
              <td>null(Aᵀ)（左零空間）</td>
              <td>M⊥</td>
            </tr>
            <tr>
              <th>分解</th>
              <td>Rⁿ = col(A) ⊕ null(Aᵀ)</td>
              <td>H = M ⊕ M⊥</td>
            </tr>
            <tr>
              <th>投影</th>
              <td>A(AᵀA)⁻¹Aᵀ（線代 Ch16）</td>
              <td>正交投影算子 P_M</td>
            </tr>
            <tr>
              <th>維度</th>
              <td>dim M + dim M⊥ = n</td>
              <td>（無限維的推廣）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="key-point">
        <div class="kp-title">「閉」很重要！</div>
        <div class="kp-body">
          在有限維空間裡，所有子空間自動是閉的。但在無限維裡不是——
          如果 M 不是閉的，M⊥⊥ ≠ M（M⊥⊥ = M 的閉包）。
          這就是為什麼 Hilbert 空間理論強調「閉子空間」。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看 Hilbert 空間的<strong>Riesz 表示定理</strong>——對偶空間的完美描述。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .analogy { margin-bottom: 14px; overflow-x: auto; }
    .at { width: 100%; border-collapse: collapse; font-size: 12px; }
    .at th { padding: 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; background: var(--bg-surface); }
    .at td { padding: 8px; border-bottom: 1px solid var(--border); color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; }
    .key-point { padding: 14px; border: 1px solid #c8983b; border-radius: 10px;
      background: rgba(200,152,59,0.06); }
    .kp-title { font-size: 14px; font-weight: 700; color: #c8983b; margin-bottom: 6px; }
    .kp-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class StepOrthogonalComplementComponent {}
