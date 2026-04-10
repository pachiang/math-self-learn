import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-convergence-modes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="收斂的模式" subtitle="§11.7">
      <p>Lᵖ 空間裡有多種「收斂」的含義，它們<strong>不等價</strong>：</p>
    </app-prose-block>

    <app-challenge-card prompt="四種收斂的關係圖">
      <div class="modes">
        <div class="mode-card">
          <div class="mc-title">Lᵖ 收斂</div>
          <div class="mc-def">||fₙ − f||ₚ → 0</div>
          <div class="mc-meaning">整體的 p-範數距離趨向零</div>
        </div>
        <div class="mode-card">
          <div class="mc-title">幾乎處處收斂 (a.e.)</div>
          <div class="mc-def">fₙ(x) → f(x) 對幾乎所有 x</div>
          <div class="mc-meaning">逐點收斂，但可以有一個測度零的例外集</div>
        </div>
        <div class="mode-card">
          <div class="mc-title">依測度收斂</div>
          <div class="mc-def">m(|fₙ − f| > ε) → 0 ∀ε</div>
          <div class="mc-meaning">「偏差大的集合」越來越小</div>
        </div>
        <div class="mode-card">
          <div class="mc-title">均勻收斂</div>
          <div class="mc-def">sup|fₙ − f| → 0</div>
          <div class="mc-meaning">最強——整條曲線一起靠近（Ch7）</div>
        </div>
      </div>

      <div class="implications">
        <div class="imp-title">蘊含關係（箭頭 = 蘊含）</div>
        <div class="imp-diagram">
          <div class="imp-row">
            <span class="imp-node strong">均勻收斂</span>
            <span class="imp-arrow">→</span>
            <span class="imp-node">Lᵖ 收斂</span>
            <span class="imp-arrow">→</span>
            <span class="imp-node">依測度收斂</span>
          </div>
          <div class="imp-row">
            <span class="imp-node strong">均勻收斂</span>
            <span class="imp-arrow">→</span>
            <span class="imp-node">a.e. 收斂</span>
            <span class="imp-arrow">→</span>
            <span class="imp-node">依測度收斂</span>
          </div>
        </div>
        <div class="imp-note">
          ⚠ Lᵖ 收斂和 a.e. 收斂之間<strong>互不蘊含</strong>——
          但 Lᵖ 收斂蘊含一個子列 a.e. 收斂。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        收斂模式的區別是 Lebesgue 理論裡最微妙的地方。
        DCT 需要 a.e. 收斂 + 可積控制 → 得到 Lᵖ 收斂。
      </p>
      <p>下一節看 Lᵖ 的<strong>對偶空間</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .modes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
    @media (max-width: 500px) { .modes { grid-template-columns: 1fr; } }
    .mode-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .mc-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
    .mc-def { font-size: 12px; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      margin: 4px 0; }
    .mc-meaning { font-size: 11px; color: var(--text-secondary); }
    .implications { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .imp-title { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; }
    .imp-diagram { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
    .imp-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .imp-node { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      &.strong { background: var(--accent-10); border-color: var(--accent); font-weight: 700; } }
    .imp-arrow { color: var(--accent); font-weight: 700; }
    .imp-note { font-size: 12px; color: var(--text-secondary);
      strong { color: #a05a5a; } }
  `,
})
export class StepConvergenceModesComponent {}
