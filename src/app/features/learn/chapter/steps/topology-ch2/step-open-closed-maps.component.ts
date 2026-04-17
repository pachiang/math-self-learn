import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-open-closed-maps',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="開映射與閉映射" subtitle="§2.8">
      <p>連續映射保證「開集的<strong>原像</strong>是開集」。反過來呢？</p>
      <ul>
        <li><strong>開映射</strong>：開集的<strong>像</strong>是開集（f(U) ∈ τ_Y）</li>
        <li><strong>閉映射</strong>：閉集的<strong>像</strong>是閉集</li>
      </ul>
      <p>
        連續 ≠ 開映射 ≠ 閉映射。它們是三個獨立的概念。
        <strong>同胚 = 連續 + 雙射 + 開映射</strong>（等價於連續雙射且逆也連續）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三種映射性質的獨立性">
      <div class="venn">
        <div class="v-card">
          <div class="v-name">連續但不開</div>
          <div class="v-ex">f: R → R, f(x) = x²</div>
          <div class="v-why">開集 (−1, 1) 的像 = [0, 1)，不是開集</div>
        </div>
        <div class="v-card">
          <div class="v-name">開但不連續</div>
          <div class="v-ex">f: R → R, f(x) = 1/x (x≠0), f(0)=0</div>
          <div class="v-why">在 0 處不連續，但把開區間映到開集</div>
        </div>
        <div class="v-card highlight">
          <div class="v-name">連續 + 雙射 + 開 = 同胚</div>
          <div class="v-ex">f: (0,1) → R, f(x) = tan(π(x−½))</div>
          <div class="v-why">三個條件都滿足 → (0,1) ≅ R</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        投影映射 π: X×Y → X 是連續且開的（但通常不是閉的）。
        商映射 q: X → X/~ 是連續且滿的（但不一定開也不一定閉）。
      </p>
    </app-prose-block>
  `,
  styles: `
    .venn { display: flex; flex-direction: column; gap: 10px; }
    .v-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      &.highlight { border: 2px solid var(--accent); background: var(--accent-10); } }
    .v-name { font-size: 13px; font-weight: 700; color: var(--accent); }
    .v-ex { font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .v-why { font-size: 11px; color: var(--text-muted); }
  `,
})
export class StepOpenClosedMapsComponent {}
