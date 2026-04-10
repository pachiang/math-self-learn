import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-measurable-functions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="可測函數" subtitle="§9.7">
      <p>
        有了可測集，就能定義<strong>可測函數</strong>——Lebesgue 積分的對象。
      </p>
      <p class="formula">
        f 可測 ⟺ 對所有 a ∈ R，集合 {{ '{' }}x : f(x) > a{{ '}' }} 是可測的
      </p>
      <p>
        直覺：f 的「水平切片」都是可測集。這正是 Lebesgue 的「水平切法」所需要的。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="哪些函數可測？">
      <div class="fn-grid">
        <div class="fn-card ok">
          <div class="fc-name">連續函數</div>
          <div class="fc-why">連續函數的原像是開集 → 可測</div>
        </div>
        <div class="fn-card ok">
          <div class="fc-name">單調函數</div>
          <div class="fc-why">原像是區間或空集 → 可測</div>
        </div>
        <div class="fn-card ok">
          <div class="fc-name">逐點極限</div>
          <div class="fc-why">可測函數的逐點極限仍可測（跟 Riemann 不同！）</div>
        </div>
        <div class="fn-card ok">
          <div class="fc-name">Dirichlet 函數</div>
          <div class="fc-why">1_Q 可測（Q 可測），但 Riemann 不可積！</div>
        </div>
        <div class="fn-card ok">
          <div class="fc-name">簡單函數</div>
          <div class="fc-why">Σ aₖ · 1(Eₖ)，有限個可測集的加權指示函數</div>
        </div>
      </div>

      <div class="simple-fn-box">
        <div class="sf-title">簡單函數的角色</div>
        <div class="sf-body">
          <p>
            每個非負可測函數 f 都能寫成<strong>遞增簡單函數列的極限</strong>：
            0 ≤ s₁ ≤ s₂ ≤ … ↗ f。
          </p>
          <p>
            這是 Lebesgue 積分的構造方式：先定義簡單函數的積分（很容易），
            再用極限推廣到一般可測函數。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節把 Lebesgue 測度和 Riemann 積分做正面比較。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 8px; margin-bottom: 14px; }
    .fn-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      text-align: center;
      &.ok { background: rgba(90,138,90,0.04); border-color: rgba(90,138,90,0.3); } }
    .fc-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .fc-why { font-size: 11px; color: var(--text-secondary); }
    .simple-fn-box { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .sf-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .sf-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; } strong { color: var(--text); } }
  `,
})
export class StepMeasurableFunctionsComponent {}
