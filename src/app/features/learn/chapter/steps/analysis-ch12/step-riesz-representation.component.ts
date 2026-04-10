import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-riesz-representation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Riesz 表示定理" subtitle="§12.5">
      <p>Hilbert 空間版的 Riesz 表示（比 Ch11 的 Lᵖ 版更強）：</p>
      <p class="formula axiom">
        H* ≅ H<br />
        每個連續線性泛函 φ: H → R 都唯一地表示為<br />
        φ(f) = ⟨f, g⟩，其中 g ∈ H 唯一
      </p>
      <p>
        Hilbert 空間是<strong>自對偶</strong>的——跟自己的對偶空間自然同構。
        這比一般 Banach 空間（需要 (Lᵖ)* = Lq，p ≠ q）漂亮得多。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="自對偶的意義">
      <div class="dual-chain">
        <div class="dc-card">
          <div class="dc-space">Rⁿ</div>
          <div class="dc-dual">(Rⁿ)* ≅ Rⁿ</div>
          <div class="dc-how">φ(x) = ⟨y, x⟩（線代 Ch18）</div>
        </div>
        <div class="dc-arrow">推廣到無限維 ↓</div>
        <div class="dc-card highlight">
          <div class="dc-space">Hilbert H</div>
          <div class="dc-dual">H* ≅ H</div>
          <div class="dc-how">φ(f) = ⟨g, f⟩（Riesz）</div>
        </div>
      </div>

      <div class="consequences">
        <div class="cq-title">推論</div>
        <ul class="cq-list">
          <li><strong>弱收斂</strong>可以用內積定義：fₙ ⇀ f ⟺ ⟨fₙ, g⟩ → ⟨f, g⟩ ∀g</li>
          <li><strong>Lax-Milgram</strong>：雙線性形式的表示定理（PDE 的基礎）</li>
          <li><strong>量子力學</strong>：bra ⟨ψ| 和 ket |ψ⟩ 住在同一個空間（Dirac 記號）</li>
        </ul>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看 Hilbert 空間裡的<strong>弱收斂</strong>——比範數收斂弱但比逐點收斂有用。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .dual-chain { display: flex; flex-direction: column; align-items: center; gap: 0; margin-bottom: 14px; }
    .dc-card { width: 100%; max-width: 350px; padding: 14px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg-surface); text-align: center;
      &.highlight { border-color: var(--accent); background: var(--accent-10); } }
    .dc-space { font-size: 16px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .dc-dual { font-size: 14px; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      margin: 4px 0; }
    .dc-how { font-size: 12px; color: var(--text-secondary); }
    .dc-arrow { padding: 6px; font-size: 12px; color: var(--text-muted); }
    .consequences { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .cq-title { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .cq-list { margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary);
      line-height: 1.8; strong { color: var(--text); } }
  `,
})
export class StepRieszRepresentationComponent {}
