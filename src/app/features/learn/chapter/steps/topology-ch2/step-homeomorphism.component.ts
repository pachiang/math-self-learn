import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-homeomorphism',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="同胚" subtitle="§2.3">
      <p>
        <strong>同胚</strong>（homeomorphism）= 拓撲空間的「同構」：
      </p>
      <p class="formula def">f: X → Y 是同胚 ⟺ f 連續 + 雙射 + f⁻¹ 連續</p>
      <p>
        X ≅ Y（同胚）意味著從拓撲的角度來看，它們是<strong>同一個東西</strong>。
        拓撲學家不區分同胚的空間。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="經典同胚例子——「橡皮幾何」">
      <div class="homeo-grid">
        <div class="h-card">
          <div class="h-pair">
            <svg viewBox="0 0 80 50" class="h-svg">
              <line x1="10" y1="25" x2="70" y2="25" stroke="var(--accent)" stroke-width="3" />
            </svg>
            <span class="h-eq">≅</span>
            <svg viewBox="0 0 80 50" class="h-svg">
              <path d="M10,40 Q40,5 70,40" fill="none" stroke="var(--accent)" stroke-width="3" />
            </svg>
          </div>
          <div class="h-name">(0,1) ≅ R</div>
          <div class="h-note">f(x) = tan(π(x − ½)) 是同胚。有限區間和整條實數線拓撲一樣！</div>
        </div>

        <div class="h-card">
          <div class="h-pair">
            <svg viewBox="0 0 80 60" class="h-svg">
              <circle cx="40" cy="30" r="20" fill="none" stroke="var(--accent)" stroke-width="3" />
            </svg>
            <span class="h-eq">≇</span>
            <svg viewBox="0 0 80 60" class="h-svg">
              <line x1="10" y1="30" x2="70" y2="30" stroke="#a05a5a" stroke-width="3" />
            </svg>
          </div>
          <div class="h-name">S¹ ≇ R</div>
          <div class="h-note">圓是緊緻的，R 不是。緊緻性是拓撲不變量 → 不同胚。</div>
        </div>

        <div class="h-card">
          <div class="h-pair">
            <svg viewBox="0 0 80 60" class="h-svg">
              <rect x="15" y="10" width="50" height="40" rx="3" fill="none" stroke="var(--accent)" stroke-width="3" />
            </svg>
            <span class="h-eq">≅</span>
            <svg viewBox="0 0 80 60" class="h-svg">
              <circle cx="40" cy="30" r="22" fill="none" stroke="var(--accent)" stroke-width="3" />
            </svg>
          </div>
          <div class="h-name">正方形邊界 ≅ 圓</div>
          <div class="h-note">可以連續變形。角的「尖」不影響拓撲。</div>
        </div>

        <div class="h-card">
          <div class="h-pair">
            <svg viewBox="0 0 80 60" class="h-svg">
              <text x="40" y="38" text-anchor="middle" fill="var(--accent)" font-size="28">🍩</text>
            </svg>
            <span class="h-eq">≅</span>
            <svg viewBox="0 0 80 60" class="h-svg">
              <text x="40" y="38" text-anchor="middle" fill="var(--accent)" font-size="28">☕</text>
            </svg>
          </div>
          <div class="h-name">甜甜圈 ≅ 咖啡杯</div>
          <div class="h-note">拓撲學的經典笑話。兩者都有恰好一個「洞」。</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        ⚠ 注意：連續雙射<strong>不一定</strong>是同胚！還需要反函數也連續。
        例：[0, 2π) → S¹, t ↦ e^(it) 是連續雙射，但不是同胚（在 0 附近拉回不連續）。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.def { border: 2px solid var(--accent); } }
    .homeo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .h-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .h-pair { display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 6px; }
    .h-svg { width: 60px; height: 40px; }
    .h-eq { font-size: 16px; font-weight: 700; color: var(--accent); }
    .h-name { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; text-align: center; }
    .h-note { font-size: 10px; color: var(--text-muted); margin-top: 4px; text-align: center; }
  `,
})
export class StepHomeomorphismComponent {}
