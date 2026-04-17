import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-topological-invariants',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="拓撲不變量" subtitle="§2.4">
      <p>
        怎麼證明兩個空間<strong>不</strong>同胚？找一個<strong>拓撲不變量</strong>——
        同胚映射保持不變的性質。如果兩個空間的某個不變量不同，它們就不同胚。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="常見的拓撲不變量——用來區分空間">
      <div class="inv-table">
        <div class="inv-header">
          <span class="invh">不變量</span><span class="invh">直覺</span><span class="invh">例子</span>
        </div>
        <div class="inv-row">
          <span class="invd name">連通性</span>
          <span class="invd">能否「一筆畫」走遍</span>
          <span class="invd ex">(0,1) ∪ (2,3) 不連通 ≠ (0,1) 連通</span>
        </div>
        <div class="inv-row">
          <span class="invd name">緊緻性</span>
          <span class="invd">是否「有限大」</span>
          <span class="invd ex">[0,1] 緊緻 ≠ R 非緊緻</span>
        </div>
        <div class="inv-row">
          <span class="invd name">Hausdorff</span>
          <span class="invd">能否用開集分離兩個點</span>
          <span class="invd ex">R 是 Hausdorff，餘有限拓撲的 R 不是</span>
        </div>
        <div class="inv-row">
          <span class="invd name">基本群 π₁</span>
          <span class="invd">「洞」的數量和形狀</span>
          <span class="invd ex">π₁(S¹) = Z ≠ π₁(S²) = 0</span>
        </div>
        <div class="inv-row">
          <span class="invd name">Euler 特徵</span>
          <span class="invd">V − E + F</span>
          <span class="invd ex">χ(球) = 2 ≠ χ(甜甜圈) = 0</span>
        </div>
      </div>

      <div class="strategy">
        <strong>證明不同胚的策略</strong>：找一個不變量使兩個空間的值不同。<br>
        <strong>注意</strong>：不變量相同不代表同胚！（必要但不充分）
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        拓撲學的核心問題：<strong>分類</strong>——哪些空間是同胚的？
        不變量是分類的工具。越多不變量，分辨能力越強。
      </p>
    </app-prose-block>
  `,
  styles: `
    .inv-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .inv-header { display: grid; grid-template-columns: 90px 1fr 1fr; background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .invh { padding: 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .inv-row { display: grid; grid-template-columns: 90px 1fr 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .invd { padding: 8px; font-size: 11px; color: var(--text-secondary);
      &.name { font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
      &.ex { font-family: 'JetBrains Mono', monospace; font-size: 10px; } }
    .strategy { padding: 10px; border-radius: 8px; background: var(--accent-10); border: 1px solid var(--accent);
      font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.7; }
    .strategy strong { color: var(--accent); }
  `,
})
export class StepTopologicalInvariantsComponent {}
