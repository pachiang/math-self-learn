import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { lpBallBoundary } from './analysis-ch8-util';

@Component({
  selector: 'app-step-lp-balls',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Lᵖ 範數的超級球" subtitle="§8.2">
      <p>
        R² 上的 <strong>Lᵖ 範數</strong>：
      </p>
      <p class="formula">||(x, y)||ₚ = (|x|ᵖ + |y|ᵖ)^(1/p)</p>
      <p>
        p = 1 → 菱形。p = 2 → 圓。p → ∞ → 正方形。中間的 p 值產生<strong>超橢圓</strong>。
      </p>
      <p>
        p &lt; 1 時形狀「凹進去」——不再滿足三角不等式，所以<strong>不是範數</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 p 看單位球怎麼從菱形 → 圓 → 方形連續變形">
      <div class="p-ctrl">
        <span class="pl">p = {{ pDisplay() }}</span>
        <input type="range" min="0.3" max="20" step="0.05" [value]="p()"
               (input)="p.set(+($any($event.target)).value)" class="p-slider" />
      </div>
      <div class="presets">
        <button class="pre-btn" (click)="p.set(0.5)">p = 0.5</button>
        <button class="pre-btn" (click)="p.set(1)">p = 1</button>
        <button class="pre-btn" (click)="p.set(2)">p = 2</button>
        <button class="pre-btn" (click)="p.set(4)">p = 4</button>
        <button class="pre-btn" (click)="p.set(20)">p = ∞</button>
      </div>

      <svg viewBox="-1.8 -1.8 3.6 3.6" class="lp-svg">
        <!-- Grid -->
        <line x1="-1.8" y1="0" x2="1.8" y2="0" stroke="var(--border)" stroke-width="0.01" />
        <line x1="0" y1="-1.8" x2="0" y2="1.8" stroke="var(--border)" stroke-width="0.01" />

        <!-- Reference: p=1, p=2, p=∞ outlines -->
        <path [attr.d]="refPath(1)" fill="none" stroke="var(--text-muted)" stroke-width="0.01" stroke-opacity="0.25" stroke-dasharray="0.04 0.03" />
        <path [attr.d]="refPath(2)" fill="none" stroke="var(--text-muted)" stroke-width="0.01" stroke-opacity="0.25" stroke-dasharray="0.04 0.03" />
        <path [attr.d]="refPath(50)" fill="none" stroke="var(--text-muted)" stroke-width="0.01" stroke-opacity="0.25" stroke-dasharray="0.04 0.03" />

        <!-- Current Lp ball -->
        <path [attr.d]="ballPath()" [attr.fill]="p() < 1 ? 'rgba(160,90,90,0.12)' : 'rgba(var(--accent-rgb), 0.12)'"
              [attr.stroke]="p() < 1 ? '#a05a5a' : 'var(--accent)'" stroke-width="0.03" />
      </svg>

      <div class="info-row">
        <div class="i-card" [class.bad]="p() < 1" [class.ok]="p() >= 1">
          @if (p() < 1) {
            p &lt; 1：不是範數（三角不等式不成立）
          } @else if (p() >= 20) {
            p = ∞：正方形（Chebyshev 距離）
          } @else {
            p = {{ p().toFixed(2) }}：合法的範數 ✓
          }
        </div>
        <div class="i-card">||(1,1)||ₚ = {{ norm11().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個連續變形揭示了「距離」的多樣性。p = 2 的圓只是其中一種——
        數學不偏心。下一節看函數空間裡的度量。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .p-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .pl { font-size: 18px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 100px; }
    .p-slider { flex: 1; accent-color: var(--accent); height: 24px; }
    .presets { display: flex; gap: 6px; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); } }
    .lp-svg { width: 100%; max-width: 420px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg);
      aspect-ratio: 1; }
    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepLpBallsComponent {
  readonly p = signal(2);
  readonly pDisplay = computed(() => this.p() >= 20 ? '∞' : this.p().toFixed(2));
  readonly norm11 = computed(() => {
    const pp = this.p();
    return pp >= 50 ? 1 : Math.pow(2, 1 / pp);
  });

  ballPath(): string {
    const pts = lpBallBoundary(this.p());
    return 'M' + pts.map((pt) => `${pt.x},${pt.y}`).join('L') + 'Z';
  }

  refPath(p: number): string {
    const pts = lpBallBoundary(p);
    return 'M' + pts.map((pt) => `${pt.x},${pt.y}`).join('L') + 'Z';
  }
}
