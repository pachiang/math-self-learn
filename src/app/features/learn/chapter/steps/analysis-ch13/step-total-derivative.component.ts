import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-total-derivative',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="全微分" subtitle="§13.4">
      <p>
        偏導數只看座標方向。<strong>全微分</strong>（Fréchet 導數）看<strong>所有方向</strong>：
      </p>
      <p class="formula axiom">
        f 在 a 可微 ⟺ 存在線性映射 Df(a): Rⁿ → Rᵐ 使得<br />
        f(a + h) = f(a) + Df(a)·h + o(||h||)
      </p>
      <p>
        Df(a) 就是 <strong>Jacobian 矩陣</strong>——偏導數排成的矩陣。
        但「Jacobian 存在」和「可微」不是一回事——可微更強。
      </p>
      <p>
        幾何意義：f 在 a 附近的<strong>最佳線性近似</strong>。
        曲面 z = f(x,y) 在 a 處的切平面。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="偏導數 vs 全微分">
      <div class="compare">
        <div class="cmp-card">
          <div class="cc-title partial">偏導數存在</div>
          <div class="cc-body">
            只保證在<strong>座標軸方向</strong>有導數。<br />
            不保證連續。不保證其他方向有導數。
          </div>
        </div>
        <div class="cmp-card">
          <div class="cc-title total">全微分（可微）</div>
          <div class="cc-body">
            <strong>所有方向</strong>都有導數，而且由一個線性映射統一描述。<br />
            保證連續。保證方向導數 = ∇f · v。
          </div>
        </div>
      </div>

      <div class="implication">
        <div class="imp-chain">
          <span class="imp-node">偏導數連續</span>
          <span class="imp-arrow">→</span>
          <span class="imp-node strong">可微（全微分）</span>
          <span class="imp-arrow">→</span>
          <span class="imp-node">偏導數存在</span>
        </div>
        <div class="imp-note">
          反過來不成立！偏導數存在但不可微的例子：f(x,y) = xy/√(x²+y²)
        </div>
      </div>

      <div class="tangent-plane">
        <div class="tp-title">切平面公式</div>
        <div class="tp-body">
          z = f(a,b) + fₓ(a,b)(x−a) + f_y(a,b)(y−b)<br />
          這就是 f 在 (a,b) 的<strong>最佳線性近似</strong>——全微分的幾何。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看多變數的<strong>鏈式法則</strong>——用 Jacobian 矩陣乘法表達。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 12px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    @media (max-width: 500px) { .compare { grid-template-columns: 1fr; } }
    .cmp-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .cc-title { font-size: 14px; font-weight: 700; margin-bottom: 6px;
      &.partial { color: #c8983b; } &.total { color: #5a8a5a; } }
    .cc-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
    .implication { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 14px; }
    .imp-chain { display: flex; align-items: center; gap: 8px; justify-content: center;
      flex-wrap: wrap; margin-bottom: 8px; }
    .imp-node { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px;
      font-size: 12px; font-family: 'JetBrains Mono', monospace;
      &.strong { background: var(--accent-10); border-color: var(--accent); font-weight: 700; } }
    .imp-arrow { color: var(--accent); font-weight: 700; }
    .imp-note { font-size: 11px; color: var(--text-muted); text-align: center; }
    .tangent-plane { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .tp-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .tp-body { font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepTotalDerivativeComponent {}
