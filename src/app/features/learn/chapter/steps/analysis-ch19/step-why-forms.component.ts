import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-why-forms',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼需要微分形式" subtitle="§19.1">
      <p>
        回顧 Ch15–16 的定理，我們有四個看起來不同的東西：
      </p>
      <ul>
        <li>微積分基本定理：∫ₐᵇ f' dx = f(b) − f(a)</li>
        <li>Green 定理：∮ P dx + Q dy = ∬ (∂Q/∂x − ∂P/∂y) dA</li>
        <li>Stokes 定理：∮ F · dr = ∬ curl F · dS</li>
        <li>散度定理：∬ F · dS = ∭ div F dV</li>
      </ul>
      <p>
        它們的結構完全一樣：<strong>邊界上的積分 = 內部「某種導數」的積分</strong>。
        但每一個都用不同的符號、不同的「導數」定義。能不能統一？
      </p>
    </app-prose-block>

    <app-challenge-card prompt="四個定理其實是同一件事的不同面貌">
      <div class="unify-table">
        <div class="ut-header">
          <span class="uth">維度</span>
          <span class="uth">邊界上的積分</span>
          <span class="uth">內部的「導數」</span>
          <span class="uth">傳統名稱</span>
        </div>
        <div class="ut-row">
          <span class="utd dim">1D</span>
          <span class="utd">f(b) − f(a)</span>
          <span class="utd">∫ f' dx</span>
          <span class="utd name">FTC</span>
        </div>
        <div class="ut-row">
          <span class="utd dim">2D</span>
          <span class="utd">∮ ω</span>
          <span class="utd">∬ dω</span>
          <span class="utd name">Green</span>
        </div>
        <div class="ut-row">
          <span class="utd dim">3D 面</span>
          <span class="utd">∮ ω</span>
          <span class="utd">∬ dω</span>
          <span class="utd name">Stokes</span>
        </div>
        <div class="ut-row">
          <span class="utd dim">3D 體</span>
          <span class="utd">∬ ω</span>
          <span class="utd">∭ dω</span>
          <span class="utd name">Gauss</span>
        </div>
        <div class="ut-row highlight">
          <span class="utd dim">nD</span>
          <span class="utd">∫_∂Ω ω</span>
          <span class="utd">∫_Ω dω</span>
          <span class="utd name">Stokes!</span>
        </div>
      </div>

      <div class="punchline">
        <strong>微分形式</strong>（differential forms）就是讓最後一行嚴格成立的語言。<br>
        ω = 被積的對象，d = 外微分（統一所有「導數」），∂Ω = 邊界。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        微分形式不是新的數學——它是一種<strong>更乾淨的語言</strong>，
        讓你只學一個定理就覆蓋所有情況。下一節從最簡單的 1-form 開始。
      </p>
    </app-prose-block>
  `,
  styles: `
    .unify-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
    .ut-header { display: grid; grid-template-columns: 50px 1fr 1fr 70px; background: var(--bg-surface);
      border-bottom: 1px solid var(--border); }
    .uth { padding: 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .ut-row { display: grid; grid-template-columns: 50px 1fr 1fr 70px; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.highlight { background: var(--accent-10); } }
    .utd { padding: 8px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.dim { font-weight: 700; color: var(--accent); }
      &.name { font-weight: 600; color: var(--text-muted); } }
    .punchline { padding: 14px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent);
      text-align: center; font-size: 13px; color: var(--text); line-height: 1.8; }
    .punchline strong { color: var(--accent); }
  `,
})
export class StepWhyFormsComponent {}
