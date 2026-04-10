import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-diff-rules',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="微分法則" subtitle="§5.3">
      <p>導數的運算律——每一條都能從定義嚴格證明：</p>
    </app-prose-block>

    <app-challenge-card prompt="五大法則一覽">
      <div class="rules">
        <div class="rule">
          <div class="r-name">和差</div>
          <div class="r-formula">(f ± g)' = f' ± g'</div>
          <div class="r-why">極限的線性</div>
        </div>
        <div class="rule">
          <div class="r-name">乘法（Leibniz）</div>
          <div class="r-formula">(fg)' = f'g + fg'</div>
          <div class="r-why">加減 f(x)g(x+h) 拆成兩部分</div>
        </div>
        <div class="rule">
          <div class="r-name">除法</div>
          <div class="r-formula">(f/g)' = (f'g − fg') / g²</div>
          <div class="r-why">從乘法規則推導</div>
        </div>
        <div class="rule">
          <div class="r-name">鏈式（Chain Rule）</div>
          <div class="r-formula">(f∘g)'(x) = f'(g(x)) · g'(x)</div>
          <div class="r-why">「外層的導數 × 內層的導數」</div>
        </div>
        <div class="rule">
          <div class="r-name">冪次</div>
          <div class="r-formula">(xⁿ)' = nxⁿ⁻¹</div>
          <div class="r-why">二項式展開後取極限</div>
        </div>
      </div>

      <div class="chain-example">
        <div class="ce-title">鏈式法則的直覺</div>
        <div class="ce-body">
          如果 y = f(u) 且 u = g(x)，那麼 dy/dx = (dy/du) · (du/dx)。<br />
          「y 對 x 的變化率 = y 對 u 的變化率 × u 對 x 的變化率」。<br />
          就像匯率換算：美元/台幣 = (美元/日圓) × (日圓/台幣)。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這些法則讓我們不用每次回到定義去算導數。
        但更重要的是<strong>均值定理</strong>——連結導數和函數值的橋樑。
      </p>
    </app-prose-block>
  `,
  styles: `
    .rules { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .rule { display: grid; grid-template-columns: 100px 1fr auto; gap: 10px; align-items: center;
      padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .r-name { font-size: 12px; font-weight: 700; color: var(--text-muted); }
    .r-formula { font-size: 14px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }
    .r-why { font-size: 11px; color: var(--text-muted); text-align: right; }

    .chain-example { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .ce-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .ce-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; }
  `,
})
export class StepDiffRulesComponent {}
