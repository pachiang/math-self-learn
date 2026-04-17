import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-change-of-order',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="交換積分順序" subtitle="§14.5">
      <p>
        有些積分一個方向算不出來，<strong>反過來就能算</strong>。
      </p>
      <p class="formula">∫₀¹ ∫ᵧ¹ e^(x²) dx dy = ?（內層無初等反導數！）</p>
      <p>
        技巧：畫出區域 → 改用另一種方式描述 → 交換順序。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看同一個三角形區域，用兩種方式描述的差異">
      <div class="side-by-side">
        <div class="panel">
          <div class="panel-title">原始順序（先 dx）</div>
          <svg viewBox="-0.15 -0.15 1.5 1.5" class="sv">
            <line x1="0" y1="0" x2="1.2" y2="0" stroke="var(--border)" stroke-width="0.01" />
            <line x1="0" y1="0" x2="0" y2="1.2" stroke="var(--border)" stroke-width="0.01" />
            <path d="M0,0 L1,0 L1,1 Z" fill="rgba(var(--accent-rgb), 0.15)"
                  stroke="var(--accent)" stroke-width="0.02" />
            @for (i of ySlices(); track i) {
              <line [attr.x1]="i/8" y1="0" [attr.x2]="1" [attr.y2]="0"
                    stroke="#bf6e6e" stroke-width="0.01" stroke-opacity="0.5"
                    [attr.transform]="'translate(0,' + i/8 + ')'" />
              <line [attr.x1]="i/8" [attr.y1]="i/8" x2="1" [attr.y2]="i/8"
                    stroke="#bf6e6e" stroke-width="0.01" stroke-opacity="0.5" />
            }
            <text x="0.5" y="1.35" text-anchor="middle" fill="var(--text-muted)" font-size="0.07">
              ∫₀¹ ∫ᵧ¹ e^(x²) dx dy
            </text>
            <text x="0.5" y="-0.04" text-anchor="middle" fill="var(--text-muted)" font-size="0.06">
              y 固定, x: y→1（水平掃描）
            </text>
          </svg>
        </div>
        <div class="arrow">⇄</div>
        <div class="panel">
          <div class="panel-title">交換後（先 dy）</div>
          <svg viewBox="-0.15 -0.15 1.5 1.5" class="sv">
            <line x1="0" y1="0" x2="1.2" y2="0" stroke="var(--border)" stroke-width="0.01" />
            <line x1="0" y1="0" x2="0" y2="1.2" stroke="var(--border)" stroke-width="0.01" />
            <path d="M0,0 L1,0 L1,1 Z" fill="rgba(110,154,110,0.15)"
                  stroke="#6e9a6e" stroke-width="0.02" />
            @for (i of ySlices(); track i) {
              <line [attr.x1]="i/8" y1="0" [attr.x2]="i/8" [attr.y2]="i/8"
                    stroke="#6e9a6e" stroke-width="0.01" stroke-opacity="0.5" />
            }
            <text x="0.5" y="1.35" text-anchor="middle" fill="var(--text-muted)" font-size="0.07">
              ∫₀¹ ∫₀ˣ e^(x²) dy dx
            </text>
            <text x="0.5" y="-0.04" text-anchor="middle" fill="var(--text-muted)" font-size="0.06">
              x 固定, y: 0→x（垂直掃描）
            </text>
          </svg>
        </div>
      </div>

      <div class="result-box">
        <p>交換後：∫₀¹ ∫₀ˣ e^(x²) dy dx = ∫₀¹ x·e^(x²) dx = <strong>½(e−1) ≈ {{ halfEm1.toFixed(6) }}</strong></p>
        <p class="sub">內層先積 y → 乘出 x，外層變成 xe^(x²)，湊微分！</p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        交換順序不改變積分值（Fubini 保證），但可能把「不可解」變成「可解」。
        這是計算技巧的核心之一。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .side-by-side { display: flex; gap: 8px; align-items: center; margin-bottom: 14px; }
    .panel { flex: 1; }
    .panel-title { text-align: center; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .sv { width: 100%; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .arrow { font-size: 24px; color: var(--accent); font-weight: 700; }
    .result-box { padding: 14px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace; font-size: 13px; text-align: center; }
    .result-box strong { color: var(--accent); font-size: 15px; }
    .sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
  `,
})
export class StepChangeOfOrderComponent {
  readonly halfEm1 = (Math.E - 1) / 2;
  ySlices(): number[] { return [1, 2, 3, 4, 5, 6, 7]; }
}
