import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-product-topology',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="積拓撲" subtitle="§2.5">
      <p>
        兩個拓撲空間 X, Y 的<strong>積空間</strong> X × Y 上最自然的拓撲：
      </p>
      <p class="formula">基底 = U × V，其中 U ∈ τ_X, V ∈ τ_Y</p>
      <p>即「開矩形」的聯集。這讓兩個投影映射 π₁, π₂ 都連續。</p>
    </app-prose-block>

    <app-challenge-card prompt="R × R = R² 的積拓撲就是我們熟悉的標準拓撲">
      <svg viewBox="0 0 300 300" class="prod-svg">
        <!-- Grid -->
        @for (t of [50,100,150,200,250]; track t) {
          <line [attr.x1]="t" y1="10" [attr.x2]="t" y2="290" stroke="var(--border)" stroke-width="0.5" />
          <line x1="10" [attr.y1]="t" x2="290" [attr.y2]="t" stroke="var(--border)" stroke-width="0.5" />
        }

        <!-- Open rectangle (basis element) -->
        <rect x="80" y="100" width="120" height="80" rx="4"
              fill="rgba(var(--accent-rgb), 0.12)" stroke="var(--accent)" stroke-width="2" />
        <text x="140" y="145" text-anchor="middle" fill="var(--accent)" font-size="11" font-weight="700">U × V</text>

        <!-- Another one -->
        <rect x="160" y="40" width="90" height="100" rx="4"
              fill="rgba(90,138,90,0.08)" stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="4 3" />

        <!-- Axes labels -->
        <text x="150" y="298" text-anchor="middle" fill="var(--text-muted)" font-size="10">X</text>
        <text x="5" y="155" fill="var(--text-muted)" font-size="10">Y</text>

        <!-- Projection arrows -->
        <line x1="140" y1="185" x2="140" y2="260" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" />
        <text x="148" y="250" fill="var(--accent)" font-size="8">π₁</text>
        <line x1="80" y1="140" x2="20" y2="140" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" />
        <text x="28" y="135" fill="var(--accent)" font-size="8">π₂</text>
      </svg>

      <div class="note">
        積拓撲是讓所有投影映射 πᵢ: X₁×X₂×... → Xᵢ 都連續的<strong>最粗</strong>拓撲。
        這是「泛性質」的思維——用想要的性質反過來定義結構。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        無限積也可以定義——但要小心！<strong>Box 拓撲</strong>（所有開矩形）和
        <strong>積拓撲</strong>（有限多個非 X 分量）不同。Tychonoff 定理用的是積拓撲。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .prod-svg { width: 100%; max-width: 300px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; }
    .note strong { color: var(--accent); }
  `,
})
export class StepProductTopologyComponent {}
