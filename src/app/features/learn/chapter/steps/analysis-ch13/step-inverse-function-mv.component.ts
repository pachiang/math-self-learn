import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-inverse-function-mv',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="反函數定理" subtitle="§13.7">
      <p>一變數：f'(a) ≠ 0 → f 在 a 附近局部可逆。多變數推廣：</p>
      <p class="formula axiom">
        如果 F: Rⁿ → Rⁿ 在 a 可微且 <strong>det DF(a) ≠ 0</strong>，<br />
        那麼 F 在 a 的某鄰域上有<strong>可微的反函數</strong>
      </p>
      <p>
        det DF(a) ≠ 0 ⟺ Jacobian 矩陣可逆 ⟺ F 在 a 附近是<strong>局部微分同胚</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="極座標換成直角座標——反函數定理在哪裡失效？">
      <div class="example-card">
        <div class="ec-title">F(r, θ) = (r cos θ, r sin θ)</div>
        <div class="ec-jacob">
          DF = [cos θ, −r sin θ; sin θ, r cos θ]<br />
          det DF = r
        </div>
        <div class="ec-analysis">
          <div class="ea-row ok">r ≠ 0 → det DF ≠ 0 → <strong>局部可逆</strong></div>
          <div class="ea-row bad">r = 0（原點）→ det DF = 0 → <strong>不可逆</strong>（所有角度對同一個點）</div>
        </div>
      </div>

      <div class="global-note">
        <div class="gn-title">局部 vs 全局</div>
        <div class="gn-body">
          反函數定理只保證<strong>局部</strong>可逆。F(r,θ) 全局不是一對一
          （θ 和 θ + 2π 映射到同一點）。全局可逆需要額外條件（如單射）。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看反函數定理的「雙胞胎」——<strong>隱函數定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } strong { color: var(--text); } }
    .example-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; }
    .ec-title { font-size: 15px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
    .ec-jacob { font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      padding: 8px 12px; background: var(--accent-10); border-radius: 6px; margin-bottom: 10px; }
    .ec-analysis { }
    .ea-row { padding: 8px 12px; border-radius: 6px; margin: 4px 0; font-size: 13px;
      &.ok { background: rgba(90,138,90,0.06); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.06); color: #a05a5a; }
      strong { font-weight: 700; } }
    .global-note { padding: 14px; border: 1px solid #c8983b; border-radius: 10px;
      background: rgba(200,152,59,0.06); }
    .gn-title { font-size: 14px; font-weight: 700; color: #c8983b; margin-bottom: 6px; }
    .gn-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepInverseFunctionMvComponent {}
