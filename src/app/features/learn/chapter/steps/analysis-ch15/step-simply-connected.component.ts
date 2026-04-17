import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-simply-connected',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="單連通區域" subtitle="§15.9">
      <p>
        Green 定理（和保守場判定）需要區域<strong>單連通</strong>——沒有「洞」。
      </p>
      <p>
        直覺：區域內任何封閉曲線都能連續收縮成一個點。有洞的區域（如環形）不行。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較：單連通 vs 有洞的區域">
      <div class="side-by-side">
        <div class="panel">
          <svg viewBox="-1.5 -1.5 3 3" class="sc-svg">
            <circle cx="0" cy="0" r="1" fill="rgba(90,138,90,0.12)" stroke="#5a8a5a" stroke-width="0.03" />
            <text x="0" y="0.05" text-anchor="middle" fill="#5a8a5a" font-size="0.15" font-weight="700">D</text>
            <!-- Shrinking loop -->
            <circle cx="0.3" cy="0" r="0.3" fill="none" stroke="var(--accent)" stroke-width="0.02" stroke-dasharray="0.04 0.03" />
            <circle cx="0.3" cy="0" r="0.15" fill="none" stroke="var(--accent)" stroke-width="0.015" stroke-dasharray="0.04 0.03" opacity="0.5" />
            <circle cx="0.3" cy="0" r="0.04" fill="var(--accent)" />
          </svg>
          <div class="panel-label ok">單連通 ✓</div>
          <div class="panel-desc">任何迴路都能收縮成點</div>
        </div>
        <div class="panel">
          <svg viewBox="-1.5 -1.5 3 3" class="sc-svg">
            <circle cx="0" cy="0" r="1" fill="rgba(160,90,90,0.08)" stroke="#a05a5a" stroke-width="0.03" />
            <circle cx="0" cy="0" r="0.35" fill="var(--bg)" stroke="#a05a5a" stroke-width="0.03" />
            <text x="0" y="0.05" text-anchor="middle" fill="#a05a5a" font-size="0.12">洞</text>
            <!-- Loop stuck around hole -->
            <circle cx="0" cy="0" r="0.55" fill="none" stroke="var(--accent)" stroke-width="0.025" stroke-dasharray="0.05 0.03" />
          </svg>
          <div class="panel-label bad">非單連通 ✗</div>
          <div class="panel-desc">繞著洞的迴路無法收縮</div>
        </div>
      </div>

      <div class="consequence">
        <strong>後果</strong>：在有洞的區域，curl F = 0 <strong>不保證</strong>保守。
        例如 F = (−y/(x²+y²), x/(x²+y²)) 在 R²∖(0,0) 上 curl = 0，
        但繞原點一圈 ∮F·dr = 2π ≠ 0。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        單連通性是��撲學的概念。Green 定理把<strong>分析（積分）</strong>和<strong>拓撲（連通性）</strong>連在一起——
        這是現代數學「幾何即分析」精神的早期範例。
      </p>
    </app-prose-block>
  `,
  styles: `
    .side-by-side { display: flex; gap: 12px; margin-bottom: 14px; }
    .panel { flex: 1; text-align: center; }
    .sc-svg { width: 100%; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); aspect-ratio: 1; }
    .panel-label { font-size: 14px; font-weight: 700; margin-top: 6px;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }
    .panel-desc { font-size: 11px; color: var(--text-muted); }
    .consequence { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .consequence strong { color: var(--accent); }
  `,
})
export class StepSimplyConnectedComponent {}
