import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-unification-ftc',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="大統一：微積分基本定理的推廣" subtitle="§16.9">
      <p>
        從一維到三維，所有定理都是同一件事的不同面貌：
      </p>
      <p class="formula thm">∫_∂Ω ω = ∫_Ω dω</p>
      <p>「邊界上的積分 = 內部導數的積分」</p>
    </app-prose-block>

    <app-challenge-card prompt="微積分基本定理的四層推廣">
      <div class="tower">
        <div class="level" style="--level-color: #8a6aaa">
          <div class="l-dim">1D</div>
          <div class="l-name">微積分基本定理</div>
          <div class="l-formula">∫ₐᵇ f'(x) dx = f(b) − f(a)</div>
          <div class="l-note">區間端點的值差 = 內部導數的積分</div>
        </div>
        <div class="arrow">↓ 推廣</div>
        <div class="level" style="--level-color: #5a7faa">
          <div class="l-dim">2D</div>
          <div class="l-name">Green 定理</div>
          <div class="l-formula">∮_C F · dr = ∬_D curl F dA</div>
          <div class="l-note">邊界曲線上的環流 = 內部旋度的面積分</div>
        </div>
        <div class="arrow">↓ 推廣</div>
        <div class="level" style="--level-color: #5a8a5a">
          <div class="l-dim">3D (Stokes)</div>
          <div class="l-name">Stokes 定理</div>
          <div class="l-formula">∮_C F · dr = ∬_S curl F · dS</div>
          <div class="l-note">邊界曲線的環流 = 曲面上旋度的通量</div>
        </div>
        <div class="arrow">↓ 推廣</div>
        <div class="level" style="--level-color: #c8983b">
          <div class="l-dim">3D (散度)</div>
          <div class="l-name">散度定理</div>
          <div class="l-formula">∬_S F · dS = ∭_V div F dV</div>
          <div class="l-note">邊界曲面的通量 = 內部散度的體積分</div>
        </div>
      </div>

      <div class="unify-box">
        <strong>全部統一為：∫_∂Ω ω = ∫_Ω dω</strong><br>
        這是微分形式（differential forms）的語言——現代微分幾何的基石。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        從 Ch1 的實數完備性，到 Ch16 的 Stokes 定理——
        實分析的故事就是<strong>把「積分 = 邊界值」推廣到任意維度</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.thm { border: 2px solid var(--accent); } }
    .tower { display: flex; flex-direction: column; gap: 0; margin-bottom: 14px; }
    .level { padding: 14px; border-radius: 10px; border: 2px solid var(--level-color); background: color-mix(in srgb, var(--level-color) 8%, transparent); }
    .l-dim { font-size: 11px; font-weight: 700; color: var(--level-color); }
    .l-name { font-size: 15px; font-weight: 700; color: var(--text); margin: 2px 0; }
    .l-formula { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .l-note { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .arrow { text-align: center; font-size: 14px; color: var(--text-muted); padding: 4px 0; }
    .unify-box { padding: 14px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent);
      text-align: center; font-size: 13px; font-family: 'JetBrains Mono', monospace; }
    .unify-box strong { color: var(--accent); font-size: 15px; display: block; margin-bottom: 4px; }
  `,
})
export class StepUnificationFtcComponent {}
