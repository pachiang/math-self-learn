import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-m-test',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="均勻收斂的判定" subtitle="§7.3">
      <p>
        <strong>Weierstrass M-test</strong>：如果 |fₙ(x)| ≤ Mₙ <strong>對所有 x</strong>，
        而且 ΣMₙ 收斂，那 Σfₙ(x) <strong>均勻且絕對收斂</strong>。
      </p>
      <p class="formula">|fₙ(x)| ≤ Mₙ ∀x，且 ΣMₙ &lt; ∞ ⟹ Σfₙ 均勻收斂</p>
      <p>
        直覺：用一列<strong>跟 x 無關</strong>的常數 Mₙ 來「壓住」fₙ。
        如果常數級數 ΣMₙ 收斂，原級數一定均勻收斂。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Weierstrass M-test 的例子">
      <div class="examples">
        <div class="ex-card ok">
          <div class="ex-title">✓ 可以用 M-test</div>
          <div class="ex-formula">Σ sin(nx)/n² on R</div>
          <div class="ex-bound">|sin(nx)/n²| ≤ 1/n² = Mₙ</div>
          <div class="ex-sum">Σ1/n² = π²/6 &lt; ∞ → 均勻收斂</div>
        </div>

        <div class="ex-card ok">
          <div class="ex-title">✓ 冪級數在收斂半徑內</div>
          <div class="ex-formula">Σ xⁿ/n! on [−R, R]</div>
          <div class="ex-bound">|xⁿ/n!| ≤ Rⁿ/n! = Mₙ</div>
          <div class="ex-sum">Σ Rⁿ/n! = eᴿ &lt; ∞ → 均勻收斂</div>
        </div>

        <div class="ex-card bad">
          <div class="ex-title">✗ M-test 不適用</div>
          <div class="ex-formula">Σ xⁿ on (−1, 1)</div>
          <div class="ex-bound">sup|xⁿ| = 1（不趨向 0）</div>
          <div class="ex-note">
            在任何 [−r, r]（r &lt; 1）上均勻收斂，
            但在整個 (−1,1) 上<strong>不</strong>均勻收斂。
          </div>
        </div>
      </div>

      <div class="insight">
        M-test 是最常用的均勻收斂判定法。記住：找到<strong>跟 x 無關的上界 Mₙ</strong>，
        然後檢查 ΣMₙ。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看均勻收斂最重要的應用：<strong>保持連續性</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .examples { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .ex-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      &.ok { background: rgba(90,138,90,0.04); border-color: rgba(90,138,90,0.3); }
      &.bad { background: rgba(160,90,90,0.04); border-color: rgba(160,90,90,0.3); } }
    .ex-title { font-size: 13px; font-weight: 700; margin-bottom: 6px;
      .ok & { color: #5a8a5a; } .bad & { color: #a05a5a; } }
    .ex-formula { font-size: 14px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .ex-bound { font-size: 12px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; padding: 4px 10px;
      background: var(--bg); border-radius: 4px; margin: 4px 0; }
    .ex-sum { font-size: 12px; color: #5a8a5a; font-weight: 600; margin-top: 4px; }
    .ex-note { font-size: 12px; color: #a05a5a; margin-top: 4px; strong { font-weight: 700; } }
    .insight { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--accent); } }
  `,
})
export class StepMTestComponent {}
