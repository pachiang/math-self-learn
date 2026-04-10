import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-convergence-completeness',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="收斂與完備性" subtitle="§8.5">
      <p>
        度量空間中的<strong>收斂</strong>：xₙ → x ⟺ d(xₙ, x) → 0。
        跟 Ch2 一模一樣，只是把 |·| 換成 d。
      </p>
      <p>
        <strong>Cauchy 列</strong>：d(xₘ, xₙ) → 0。<strong>完備</strong>：每個 Cauchy 列都收斂。
      </p>
      <p>
        哪些空間完備？
      </p>
      <ul>
        <li><strong>R</strong>（Ch1 完備性公理）✓</li>
        <li><strong>Q</strong>（有理數有「洞」）✗</li>
        <li><strong>(C[0,1], d_sup)</strong>（均勻極限的連續函數還是連續）✓</li>
        <li><strong>(C[0,1], d_L¹)</strong>（L¹ 極限可以不連續）✗</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="完備 vs 不完備的對比">
      <div class="compare-grid">
        <div class="cmp-card ok">
          <div class="cc-title">R 完備 ✓</div>
          <svg viewBox="0 0 200 80" class="mini-svg">
            <!-- Number line with converging dots -->
            <line x1="10" y1="40" x2="190" y2="40" stroke="var(--border)" stroke-width="0.8" />
            @for (n of [1,2,3,4,5,6,7,8]; track n) {
              <circle [attr.cx]="100 + 60/n * (n%2===0?1:-1)" cy="40" r="3"
                      fill="#5a8a5a" [attr.fill-opacity]="0.3 + n * 0.08" />
            }
            <circle cx="100" cy="40" r="5" fill="#5a8a5a" stroke="white" stroke-width="1" />
            <text x="100" y="65" class="ml">極限 ∈ R ✓</text>
          </svg>
        </div>

        <div class="cmp-card bad">
          <div class="cc-title">Q 不完備 ✗</div>
          <svg viewBox="0 0 200 80" class="mini-svg">
            <line x1="10" y1="40" x2="190" y2="40" stroke="var(--border)" stroke-width="0.8" />
            @for (n of [1,2,3,4,5,6,7,8]; track n) {
              <circle [attr.cx]="100 + 60/n * (n%2===0?1:-1)" cy="40" r="3"
                      fill="#a05a5a" [attr.fill-opacity]="0.3 + n * 0.08" />
            }
            <circle cx="100" cy="40" r="5" fill="none" stroke="#a05a5a" stroke-width="1.5"
                    stroke-dasharray="2 1.5" />
            <text x="100" y="65" class="ml bad">極限 = √2 ∉ Q ✗</text>
          </svg>
        </div>

        <div class="cmp-card ok">
          <div class="cc-title">(C[0,1], d_sup) 完備 ✓</div>
          <div class="cc-desc">均勻收斂的連續函數列 → 極限還是連續</div>
        </div>

        <div class="cmp-card bad">
          <div class="cc-title">(C[0,1], d_L¹) 不完備 ✗</div>
          <div class="cc-desc">L¹ 收斂的連續函數列 → 極限可以是階梯函數（不連續）</div>
        </div>
      </div>

      <div class="insight">
        完備性公理（Ch1）就是 R 這個度量空間的完備性。
        <strong>同一個集合</strong> C[0,1]，配上不同度量，完備性可以不同！
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看度量空間裡最重要的性質之一——<strong>緊緻性</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    @media (max-width: 500px) { .compare-grid { grid-template-columns: 1fr; } }
    .cmp-card { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      &.ok { background: rgba(90,138,90,0.04); border-color: rgba(90,138,90,0.3); }
      &.bad { background: rgba(160,90,90,0.04); border-color: rgba(160,90,90,0.3); } }
    .cc-title { font-size: 13px; font-weight: 700; margin-bottom: 6px;
      .ok & { color: #5a8a5a; } .bad & { color: #a05a5a; } }
    .cc-desc { font-size: 12px; color: var(--text-secondary); }
    .mini-svg { width: 100%; display: block; }
    .ml { font-size: 9px; fill: #5a8a5a; text-anchor: middle; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      &.bad { fill: #a05a5a; } }
    .insight { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 8px;
      strong { color: var(--accent); } }
  `,
})
export class StepConvergenceCompletenessComponent {}
