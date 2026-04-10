import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-dense-subsets',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="稠密子集" subtitle="§11.6">
      <p>
        哪些「簡單」的函數可以在 Lᵖ 範數下逼近任何 Lᵖ 函數？
      </p>
      <ul>
        <li><strong>簡單函數</strong>在 Lᵖ 中稠密（by construction——積分就是這樣定義的）</li>
        <li><strong>連續函數</strong>在 Lᵖ 中稠密（Lusin 定理的推論）</li>
        <li><strong>Cᶜ（具緊支撐的連續函數）</strong>在 Lᵖ 中稠密</li>
        <li><strong>C∞ᶜ（光滑 + 緊支撐）</strong>在 Lᵖ 中稠密（mollification）</li>
        <li><strong>階梯函數</strong>在 Lᵖ 中稠密</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="逼近的層級">
      <div class="chain">
        <div class="chain-node">簡單函數</div>
        <div class="chain-arrow">⊂ 稠密 ⊂</div>
        <div class="chain-node">階梯函數</div>
        <div class="chain-arrow">⊂ 稠密 ⊂</div>
        <div class="chain-node">連續函數</div>
        <div class="chain-arrow">⊂ 稠密 ⊂</div>
        <div class="chain-node">C∞ᶜ</div>
        <div class="chain-arrow">⊂ 稠密 ⊂</div>
        <div class="chain-node highlight">Lᵖ</div>
      </div>

      <div class="why-matters">
        <div class="wm-title">為什麼稠密性重要？</div>
        <div class="wm-body">
          <p>
            要證明 Lᵖ 的性質，通常先對<strong>簡單函數</strong>（容易算）證明，
            然後用「稠密 + 極限」推廣到一般函數。
            這就是分析裡的標準策略：<strong>先對簡單對象證明，再逼近</strong>。
          </p>
          <p>
            特別的：C∞ᶜ 在 Lᵖ 中稠密意味著你可以用<strong>無限光滑</strong>的函數
            逼近任何 Lᵖ 函數——即使原函數處處不連續。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看 Lᵖ 裡不同的<strong>收斂模式</strong>——它們之間的關係比你想的更微妙。</p>
    </app-prose-block>
  `,
  styles: `
    .chain { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: center;
      margin-bottom: 14px; padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .chain-node { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.highlight { background: var(--accent-10); border-color: var(--accent); color: var(--accent); } }
    .chain-arrow { font-size: 11px; color: var(--text-muted); }
    .why-matters { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .wm-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .wm-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; } strong { color: var(--text); } }
  `,
})
export class StepDenseSubsetsComponent {}
