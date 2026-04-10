import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-fubini-preview',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fubini 定理預覽" subtitle="§10.8">
      <p>
        多變數積分的核心工具：
      </p>
      <p class="formula axiom">
        Fubini 定理：如果 f(x,y) ∈ L¹(R²)，那麼<br />
        ∫∫ f(x,y) d(x,y) = ∫ (∫ f(x,y) dy) dx = ∫ (∫ f(x,y) dx) dy
      </p>
      <p>
        「重積分可以化成逐次積分，而且積分順序可以交換。」
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Fubini 讓我們能「一次積一個變數」">
      <div class="visual">
        <div class="v-card">
          <div class="vc-title">先積 y 再積 x</div>
          <svg viewBox="0 0 180 180" class="fb-svg">
            <!-- Grid -->
            <rect x="20" y="20" width="140" height="140" fill="var(--accent)" fill-opacity="0.06"
                  stroke="var(--border)" stroke-width="0.5" />
            <!-- Vertical slice -->
            <rect x="80" y="20" width="10" height="140" fill="var(--accent)" fill-opacity="0.2"
                  stroke="var(--accent)" stroke-width="1" />
            <text x="85" y="170" class="dir-label">固定 x，積 y</text>
          </svg>
        </div>

        <div class="eq-sign">=</div>

        <div class="v-card">
          <div class="vc-title">先積 x 再積 y</div>
          <svg viewBox="0 0 180 180" class="fb-svg">
            <rect x="20" y="20" width="140" height="140" fill="var(--accent)" fill-opacity="0.06"
                  stroke="var(--border)" stroke-width="0.5" />
            <!-- Horizontal slice -->
            <rect x="20" y="80" width="140" height="10" fill="#5a8a5a" fill-opacity="0.2"
                  stroke="#5a8a5a" stroke-width="1" />
            <text x="90" y="170" class="dir-label">固定 y，積 x</text>
          </svg>
        </div>
      </div>

      <div class="conditions">
        <div class="cd-title">Fubini 需要什麼條件？</div>
        <ul class="cd-list">
          <li><strong>Lebesgue 版</strong>：f ∈ L¹ 就夠了（f 可積）</li>
          <li><strong>Tonelli 版</strong>：f ≥ 0 可測就行（不需要可積——但結果可能是 ∞）</li>
          <li><strong>Riemann 版</strong>：需要更強的條件（連續或更多）</li>
        </ul>
      </div>

      <div class="preview-note">
        Fubini 定理在概率論（獨立隨機變數的期望值）、PDE（Green 函數積分）、
        物理（多維積分）裡<strong>無處不在</strong>。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節心智圖總結 Lebesgue 積分。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 12px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .visual { display: flex; gap: 12px; align-items: center; justify-content: center;
      margin-bottom: 14px; flex-wrap: wrap; }
    .v-card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .vc-title { padding: 6px 10px; font-size: 12px; font-weight: 600; color: var(--text-muted);
      text-align: center; background: var(--bg-surface); }
    .fb-svg { width: 180px; display: block; background: var(--bg); }
    .dir-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .eq-sign { font-size: 24px; color: var(--text-muted); font-weight: 300; }
    .conditions { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 12px; }
    .cd-title { font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
    .cd-list { margin: 0; padding-left: 20px; font-size: 13px; color: var(--text-secondary);
      line-height: 1.8; strong { color: var(--accent); } }
    .preview-note { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 8px;
      strong { color: var(--accent); } }
  `,
})
export class StepFubiniPreviewComponent {}
