import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-minkowski',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Minkowski 不等式" subtitle="§11.3">
      <p>Lᵖ 的<strong>三角不等式</strong>：</p>
      <p class="formula axiom">||f + g||ₚ ≤ ||f||ₚ + ||g||ₚ</p>
      <p>
        這保證 ||·||ₚ 確實是一個<strong>範數</strong>。
        有了範數，Lᵖ 就是一個<strong>賦範線性空間</strong>——可以談距離、收斂、完備性。
      </p>
      <p>
        證明用 Hölder 不等式：
        ||f+g||ₚᵖ = ∫|f+g|ᵖ ≤ ∫|f+g|ᵖ⁻¹|f| + ∫|f+g|ᵖ⁻¹|g|，
        然後對每一項用 Hölder。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三角不等式的層級">
      <div class="hierarchy">
        <div class="h-card">
          <div class="hc-level">R</div>
          <div class="hc-ineq">|a + b| ≤ |a| + |b|</div>
          <div class="hc-name">絕對值三角不等式</div>
        </div>
        <div class="h-arrow">↓ 推廣到向量</div>
        <div class="h-card">
          <div class="hc-level">Rⁿ</div>
          <div class="hc-ineq">||x + y|| ≤ ||x|| + ||y||</div>
          <div class="hc-name">向量三角不等式（線代 Ch1）</div>
        </div>
        <div class="h-arrow">↓ 推廣到函數</div>
        <div class="h-card highlight">
          <div class="hc-level">Lᵖ</div>
          <div class="hc-ineq">||f + g||ₚ ≤ ||f||ₚ + ||g||ₚ</div>
          <div class="hc-name">Minkowski 不等式</div>
        </div>
      </div>

      <div class="insight">
        Minkowski 不等式說：Lᵖ 空間的「幾何」跟 Rⁿ 的<strong>一模一樣</strong>——
        距離滿足三角不等式，可以談「球」、「收斂」、「完備」。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>有了範數，下一個問題：Lᵖ 完備嗎？答案是<strong>是</strong>——<strong>Riesz-Fischer 定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.axiom { border: 2px solid var(--accent); } }
    .hierarchy { display: flex; flex-direction: column; align-items: center; gap: 0; margin-bottom: 14px; }
    .h-card { width: 100%; max-width: 400px; padding: 14px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg-surface); text-align: center;
      &.highlight { border-color: var(--accent); background: var(--accent-10); } }
    .hc-level { font-size: 12px; color: var(--text-muted); font-weight: 700; }
    .hc-ineq { font-size: 15px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .hc-name { font-size: 12px; color: var(--text-secondary); }
    .h-arrow { padding: 6px; font-size: 12px; color: var(--text-muted); }
    .insight { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--accent); } }
  `,
})
export class StepMinkowskiComponent {}
