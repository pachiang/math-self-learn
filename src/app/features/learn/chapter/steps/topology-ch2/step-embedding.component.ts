import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-embedding',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="嵌入" subtitle="§2.9">
      <p>
        <strong>拓撲嵌入</strong>：f: X → Y 是嵌入 ⟺ f 是到 f(X) 的同胚。
      </p>
      <p>
        直覺：X「住在」Y 裡面，保持自己的拓撲結構。
        f(X) 配上 Y 的子空間拓撲，和 X 是一樣的。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="嵌入的例子">
      <div class="emb-list">
        <div class="e-card ok">
          <div class="e-name">R ↪ R²</div>
          <div class="e-map">x ↦ (x, 0)</div>
          <div class="e-note">x 軸是 R 嵌入 R² 的像。保留了所有拓撲性質。</div>
        </div>
        <div class="e-card ok">
          <div class="e-name">S¹ ↪ R²</div>
          <div class="e-map">θ ↦ (cosθ, sinθ)</div>
          <div class="e-note">單位圓嵌入平面。S¹ 是 R² 的子空間。</div>
        </div>
        <div class="e-card bad">
          <div class="e-name">[0, 2π) → S¹</div>
          <div class="e-map">t ↦ e^(it)</div>
          <div class="e-note">連續雙射但<strong>不是嵌入</strong>——逆不連續（在 0 附近跳躍）。</div>
        </div>
      </div>

      <div class="summary">
        嵌入是同胚到像的映射。它讓我們精確地說「X 是 Y 的一部分」。
        例如 Whitney 嵌入定理：任何 n 維流形都可以嵌入 R²ⁿ。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>嵌入、商映射、積——這三種操作讓我們能用簡單的空間建構複雜的空間。</p>
    </app-prose-block>
  `,
  styles: `
    .emb-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .e-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      &.ok { background: rgba(90,138,90,0.04); }
      &.bad { background: rgba(160,90,90,0.04); } }
    .e-name { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .e-map { font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .e-note { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .e-note strong { color: #a05a5a; }
    .summary { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; }
  `,
})
export class StepEmbeddingComponent {}
