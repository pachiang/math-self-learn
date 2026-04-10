import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-term-differentiation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="逐項微分" subtitle="§7.5">
      <p>
        什麼時候可以交換 Σ 和 d/dx？比逐項積分<strong>更嚴格</strong>。
      </p>
      <p class="formula">
        如果 Σfₙ 逐點收斂，且 Σfₙ' <strong>均勻收斂</strong>，那麼<br />
        (Σfₙ)' = Σfₙ'
      </p>
      <p>
        注意：是<strong>導數的級數</strong>均勻收斂，不只是原級數。
        這是因為微分是「放大局部行為」的操作，需要更強的控制。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="逐項微分的條件比較">
      <div class="compare-table">
        <table class="cmp">
          <thead>
            <tr><th></th><th>逐項積分</th><th>逐項微分</th></tr>
          </thead>
          <tbody>
            <tr>
              <th>需要什麼收斂？</th>
              <td>Σfₙ <strong>均勻收斂</strong></td>
              <td>Σfₙ' <strong>均勻收斂</strong></td>
            </tr>
            <tr>
              <th>難度</th>
              <td class="easy">較易（積分是平滑操作）</td>
              <td class="hard">較難（微分放大波動）</td>
            </tr>
            <tr>
              <th>公式</th>
              <td>∫Σfₙ = Σ∫fₙ</td>
              <td>(Σfₙ)' = Σfₙ'</td>
            </tr>
            <tr>
              <th>對冪級數</th>
              <td>在收斂半徑內成立</td>
              <td>在收斂半徑內成立</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="insight">
        <p>
          <strong>冪級數是最好的情形</strong>：在收斂半徑裡面，
          逐項微分和逐項積分都自動成立。
          這讓冪級數成為分析裡最「乖」的對象。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節再看一次逐項積分的條件，跟微分做對比。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }
    .compare-table { margin-bottom: 14px; overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 8px 10px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); background: var(--bg-surface); font-weight: 600; }
    .cmp td { padding: 8px 10px; border-bottom: 1px solid var(--border);
      color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--accent); }
      &.easy { color: #5a8a5a; } &.hard { color: #c8983b; } }
    .insight { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); font-size: 13px; color: var(--text-secondary);
      p { margin: 0; } strong { color: var(--accent); } }
  `,
})
export class StepTermDifferentiationComponent {}
