import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-lp-dual',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Lᵖ 的對偶空間" subtitle="§11.8">
      <p>
        線代 Ch18 介紹了對偶空間。Lᵖ 的對偶是什麼？
      </p>
      <p class="formula axiom">
        (Lᵖ)* ≅ Lq，其中 1/p + 1/q = 1（1 &lt; p &lt; ∞）
      </p>
      <p>
        每個 Lᵖ 上的連續線性泛函 φ 都可以寫成：
        φ(f) = ∫ fg dm，其中 g ∈ Lq 唯一。
      </p>
      <p>
        這是 <strong>Riesz 表示定理</strong>。在 p = 2 時：(L²)* ≅ L² 自身——
        跟有限維的 Rⁿ 一樣（每個線性泛函 = 內積）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="對偶配對表">
      <div class="dual-table">
        <table class="dt">
          <thead><tr><th>空間 Lᵖ</th><th>對偶 (Lᵖ)*</th><th>配對</th></tr></thead>
          <tbody>
            <tr><td>L¹</td><td>L∞</td><td>φ(f) = ∫fg, g ∈ L∞</td></tr>
            <tr><td>L^(4/3)</td><td>L⁴</td><td></td></tr>
            <tr class="highlight"><td>L²</td><td>L²</td><td>自對偶！φ(f) = ⟨f, g⟩</td></tr>
            <tr><td>L³</td><td>L^(3/2)</td><td></td></tr>
            <tr><td>Lᵖ (1&lt;p&lt;∞)</td><td>Lq</td><td>1/p + 1/q = 1</td></tr>
          </tbody>
        </table>
      </div>

      <div class="connection">
        <div class="cn-title">跟線代的連結</div>
        <div class="cn-body">
          <p>
            有限維：(Rⁿ)* ≅ Rⁿ（Ch18 對偶空間）。<br />
            無限維：(Lᵖ)* ≅ Lq（Riesz 表示）。<br />
            p = 2 時最漂亮：(L²)* ≅ L² 自身——
            <strong>Hilbert 空間是自對偶的</strong>。
          </p>
          <p>
            這就是量子力學選 L² 的原因：態（ket）和觀測量（bra）住在同一個空間裡。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節心智圖總結。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .dual-table { margin-bottom: 14px; overflow-x: auto; }
    .dt { width: 100%; border-collapse: collapse; font-size: 13px; text-align: center; }
    .dt th { padding: 8px; color: var(--text-muted); border-bottom: 1px solid var(--border);
      font-weight: 600; background: var(--bg-surface); }
    .dt td { padding: 8px; border-bottom: 1px solid var(--border); color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .dt .highlight { background: var(--accent-10); }
    .connection { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .cn-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .cn-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; } strong { color: var(--text); } }
  `,
})
export class StepLpDualComponent {}
