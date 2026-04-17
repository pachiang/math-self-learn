import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-comparing-topologies',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="比較拓撲" subtitle="§1.7">
      <p>
        同一個集合上的兩個拓撲可以比較「粗細」：
      </p>
      <p class="formula">τ₁ ⊂ τ₂ ⟺ τ₂ 比 τ₁ 更<strong>細</strong>（finer）</p>
      <p>
        更細 = 更多開集 = 更容易區分點 = 更「挑剔」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拓撲的偏序：從最粗到最細">
      <div class="order-chain">
        <div class="o-node coarsest">密著拓撲（最粗）</div>
        <div class="o-arrow">⊂</div>
        <div class="o-node">餘有限拓撲</div>
        <div class="o-arrow">⊂</div>
        <div class="o-node standard">標準拓撲（R 上）</div>
        <div class="o-arrow">⊂</div>
        <div class="o-node">下限拓撲 [a, b)</div>
        <div class="o-arrow">⊂</div>
        <div class="o-node finest">離散拓撲（最細）</div>
      </div>

      <div class="tradeoff">
        <div class="t-row">
          <span class="t-label">更細 →</span>
          <span class="t-val">更多開集 → 更多連續函數「不連續」 → 更多拓撲性質可以區分</span>
        </div>
        <div class="t-row">
          <span class="t-label">更粗 →</span>
          <span class="t-val">更少開集 → 更多函數「連續」 → 更少性質可區分（更「模糊」）</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        好的拓撲在「粗」和「細」之間找平衡——
        細到能區分不同的點，粗到保留有趣的性質。
        下一節看<strong>子空間拓撲</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .order-chain { display: flex; flex-direction: column; align-items: center; gap: 0; margin-bottom: 14px; }
    .o-node { padding: 10px 20px; border: 2px solid var(--border); border-radius: 8px;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--bg-surface);
      &.coarsest { border-color: #a05a5a; color: #a05a5a; }
      &.standard { border-color: var(--accent); color: var(--accent); background: var(--accent-10); }
      &.finest { border-color: #5a8a5a; color: #5a8a5a; } }
    .o-arrow { font-size: 14px; color: var(--accent); font-weight: 700; padding: 2px 0; }
    .tradeoff { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .t-row { padding: 10px 14px; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);
      &:last-child { border-bottom: none; } }
    .t-label { font-weight: 700; color: var(--accent); margin-right: 6px; }
  `,
})
export class StepComparingTopologiesComponent {}
