import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-holder',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Hölder 不等式" subtitle="§11.2">
      <p>Lᵖ 空間的基本不等式：</p>
      <p class="formula axiom">
        ∫|fg| ≤ ||f||ₚ · ||g||_q<br />
        其中 1/p + 1/q = 1（共軛指數）
      </p>
      <p>
        p = q = 2 時就是 <strong>Cauchy-Schwarz 不等式</strong>：∫|fg| ≤ ||f||₂ · ||g||₂。
      </p>
      <p>
        Hölder 不等式說：f ∈ Lᵖ 和 g ∈ Lq 的乘積 fg ∈ L¹。
        它是 Lᵖ 理論的<strong>萬用工具</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="共軛指數 (p, q) 的配對">
      <div class="conjugate-table">
        <table class="ct">
          <thead><tr><th>p</th><th>q = p/(p−1)</th><th>名稱</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>∞</td><td>L¹ 和 L∞ 配對</td></tr>
            <tr><td>4/3</td><td>4</td><td></td></tr>
            <tr class="highlight"><td>2</td><td>2</td><td>自共軛 → Cauchy-Schwarz</td></tr>
            <tr><td>3</td><td>3/2</td><td></td></tr>
            <tr><td>∞</td><td>1</td><td>L∞ 和 L¹ 配對</td></tr>
          </tbody>
        </table>
      </div>

      <div class="proof-sketch">
        <div class="ps-title">證明的關鍵：Young 不等式</div>
        <div class="ps-body">
          ab ≤ aᵖ/p + bq/q（對 a, b ≥ 0）。<br />
          把 a = |f|/||f||ₚ，b = |g|/||g||_q 代入，兩邊積分即得 Hölder。
        </div>
      </div>

      <div class="applications">
        <div class="app-title">應用</div>
        <ul class="app-list">
          <li>證明 Minkowski 不等式（下一節）</li>
          <li>L² 的 Cauchy-Schwarz</li>
          <li>概率論：E[XY] ≤ (E[|X|ᵖ])^(1/p) · (E[|Y|^q])^(1/q)</li>
          <li>嵌入定理：Lᵖ ⊂ Lq 的條件</li>
        </ul>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節用 Hölder 證明 Lᵖ 的三角不等式——<strong>Minkowski 不等式</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .conjugate-table { margin-bottom: 14px; overflow-x: auto; }
    .ct { width: 100%; border-collapse: collapse; font-size: 13px; text-align: center; }
    .ct th { padding: 8px; color: var(--text-muted); border-bottom: 1px solid var(--border);
      font-weight: 600; background: var(--bg-surface); }
    .ct td { padding: 8px; border-bottom: 1px solid var(--border); color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .ct .highlight { background: var(--accent-10); }
    .proof-sketch { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; }
    .ps-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .ps-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      font-family: 'JetBrains Mono', monospace; }
    .applications { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .app-title { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .app-list { margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary);
      line-height: 1.8; }
  `,
})
export class StepHolderComponent {}
