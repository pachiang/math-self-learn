import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-quotient-topology',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="商拓撲（黏合空間）" subtitle="§2.6">
      <p>
        <strong>商拓撲</strong>：把空間的某些點「黏在一起」。
        定義等價關係 ~ 後，X/~ 上的拓撲由「原像是開集」決定。
      </p>
      <p class="formula">V ⊂ X/~ 是開集 ⟺ π⁻¹(V) ⊂ X 是開集</p>
    </app-prose-block>

    <app-challenge-card prompt="經典的黏合操作——看平面如何變成曲面">
      <div class="glue-grid">
        <div class="g-card">
          <div class="g-before">
            <svg viewBox="0 0 100 30" class="g-svg">
              <line x1="10" y1="15" x2="90" y2="15" stroke="var(--accent)" stroke-width="3" />
              <circle cx="10" cy="15" r="4" fill="#bf6e6e" />
              <circle cx="90" cy="15" r="4" fill="#bf6e6e" />
            </svg>
          </div>
          <div class="g-arrow">→ 黏合兩端</div>
          <div class="g-after">
            <svg viewBox="0 0 60 60" class="g-svg">
              <circle cx="30" cy="30" r="20" fill="none" stroke="var(--accent)" stroke-width="3" />
              <circle cx="30" cy="10" r="4" fill="#bf6e6e" />
            </svg>
          </div>
          <div class="g-name">[0,1]/(0~1) ≅ S¹</div>
          <div class="g-note">把線段的兩端黏在一起 → 圓</div>
        </div>

        <div class="g-card">
          <div class="g-before">
            <svg viewBox="0 0 80 80" class="g-svg">
              <rect x="10" y="10" width="60" height="60" fill="none" stroke="var(--accent)" stroke-width="2" />
              <line x1="10" y1="10" x2="10" y2="70" stroke="#bf6e6e" stroke-width="3" />
              <line x1="70" y1="10" x2="70" y2="70" stroke="#bf6e6e" stroke-width="3" />
              <text x="8" y="42" fill="#bf6e6e" font-size="10">→</text>
              <text x="68" y="42" fill="#bf6e6e" font-size="10">→</text>
            </svg>
          </div>
          <div class="g-arrow">→ 黏合左右</div>
          <div class="g-after">
            <svg viewBox="0 0 60 80" class="g-svg">
              <ellipse cx="30" cy="40" rx="18" ry="30" fill="none" stroke="var(--accent)" stroke-width="3" />
            </svg>
          </div>
          <div class="g-name">正方形/(左邊~右邊) ≅ 圓柱</div>
          <div class="g-note">左右兩邊同方向黏合 → 圓柱</div>
        </div>

        <div class="g-card">
          <div class="g-before">
            <svg viewBox="0 0 80 80" class="g-svg">
              <rect x="10" y="10" width="60" height="60" fill="none" stroke="var(--accent)" stroke-width="2" />
              <line x1="10" y1="10" x2="10" y2="70" stroke="#bf6e6e" stroke-width="3" />
              <line x1="70" y1="70" x2="70" y2="10" stroke="#bf6e6e" stroke-width="3" />
              <text x="8" y="42" fill="#bf6e6e" font-size="10">→</text>
              <text x="68" y="42" fill="#bf6e6e" font-size="10">→</text>
            </svg>
          </div>
          <div class="g-arrow">→ 黏合（反向）</div>
          <div class="g-after">
            <svg viewBox="0 0 80 50" class="g-svg">
              <path d="M10,25 C10,10 40,10 40,25 C40,10 70,10 70,25 C70,40 40,40 40,25 C40,40 10,40 10,25" fill="none" stroke="var(--accent)" stroke-width="2.5" />
            </svg>
          </div>
          <div class="g-name">正方形/(左邊~右邊反向) ≅ Mobius 帶</div>
          <div class="g-note">反方向黏合 → 不可定向！</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        商拓撲是建構新空間的有力工具——環面(torus)、射影平面、Klein 瓶都是正方形的不同黏合方式。
        它也和抽象代數的商群/商環精神一致：「把等價的東西視為同一個」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .glue-grid { display: flex; flex-direction: column; gap: 12px; }
    .g-card { display: flex; align-items: center; gap: 8px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); flex-wrap: wrap; }
    .g-before, .g-after { display: flex; align-items: center; justify-content: center; }
    .g-svg { width: 60px; height: auto; }
    .g-arrow { font-size: 11px; color: var(--accent); font-weight: 700; }
    .g-name { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; width: 100%; }
    .g-note { font-size: 10px; color: var(--text-muted); width: 100%; }
  `,
})
export class StepQuotientTopologyComponent {}
