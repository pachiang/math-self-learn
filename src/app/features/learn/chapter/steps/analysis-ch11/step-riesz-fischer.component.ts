import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-riesz-fischer',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Riesz-Fischer 定理" subtitle="§11.4">
      <p><strong>Riesz-Fischer</strong>：Lᵖ（1 ≤ p ≤ ∞）是<strong>完備</strong>的。</p>
      <p class="formula axiom">
        Lᵖ 中的 Cauchy 列一定收斂到某個 Lᵖ 中的函數<br />
        → Lᵖ 是 <strong>Banach 空間</strong>
      </p>
      <p>
        這是 Lebesgue 積分相比 Riemann 的<strong>關鍵優勢</strong>。
        Riemann 可積函數空間在 L¹ 範數下不完備——Cauchy 列可以收斂到不可積的函數。
        Lebesgue 的 L¹ 完備。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Banach 空間 = 完備的賦範線性空間">
      <div class="banach-card">
        <div class="bc-title">Banach 空間的三要素</div>
        <div class="bc-grid">
          <div class="bc-item">
            <div class="bi-num">1</div>
            <div class="bi-text"><strong>線性空間</strong>：可以加法和純量乘法</div>
          </div>
          <div class="bc-item">
            <div class="bi-num">2</div>
            <div class="bi-text"><strong>範數</strong>：||·||ₚ 滿足三角不等式（Minkowski）</div>
          </div>
          <div class="bc-item">
            <div class="bi-num">3</div>
            <div class="bi-text"><strong>完備</strong>：Cauchy 列收斂（Riesz-Fischer）</div>
          </div>
        </div>
      </div>

      <div class="compare">
        <table class="cmp">
          <thead><tr><th>空間</th><th>完備？</th><th>類型</th></tr></thead>
          <tbody>
            <tr><td>R</td><td class="ok">✓</td><td>完備有序域</td></tr>
            <tr><td>Rⁿ</td><td class="ok">✓</td><td>有限維 Banach</td></tr>
            <tr><td>(C[a,b], ||·||_sup)</td><td class="ok">✓</td><td>Banach（Ch7）</td></tr>
            <tr><td>(C[a,b], ||·||_L¹)</td><td class="bad">✗</td><td>不完備</td></tr>
            <tr class="highlight"><td>Lᵖ[a,b]</td><td class="ok">✓</td><td>Banach（Riesz-Fischer）</td></tr>
          </tbody>
        </table>
      </div>

      <div class="insight">
        完備性讓我們能安心取極限——Cauchy 列不會「逃出」空間。
        這就是為什麼現代分析用 Lᵖ 而不是 Riemann 可積函數空間。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>p = 2 的特殊之處：L² 不只是 Banach 空間，還是 <strong>Hilbert 空間</strong>——有內積。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } strong { color: var(--text); } }
    .banach-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; }
    .bc-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
    .bc-grid { display: flex; flex-direction: column; gap: 8px; }
    .bc-item { display: flex; gap: 10px; align-items: center; }
    .bi-num { width: 24px; height: 24px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .bi-text { font-size: 13px; color: var(--text-secondary);
      strong { color: var(--text); } }
    .compare { margin-bottom: 14px; overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 13px; }
    .cmp th { padding: 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; background: var(--bg-surface); }
    .cmp td { padding: 8px; border-bottom: 1px solid var(--border);
      color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.ok { color: #5a8a5a; font-weight: 700; } &.bad { color: #a05a5a; font-weight: 700; } }
    .cmp .highlight { background: var(--accent-10); }
    .insight { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--accent); } }
  `,
})
export class StepRieszFischerComponent {}
