import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch5-util';

@Component({
  selector: 'app-step-diff-continuous',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="可微與連續" subtitle="§5.2">
      <p><strong>可微 ⟹ 連續</strong>（如果導數存在，函數一定連續）。</p>
      <p>但<strong>連續 ⟹̸ 可微</strong>。反例：</p>
      <ul>
        <li>f(x) = |x|：在 x=0 連續但不可微（尖角）</li>
        <li>Weierstrass 函數：處處連續、<strong>處處</strong>不可微（Ch4 見過）</li>
      </ul>
      <p>
        可微是比連續<strong>更嚴格</strong>的條件。
        直覺：連續 = 「不跳」，可微 = 「不尖」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三個例子：可微、連續不可微、不連續">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <svg viewBox="0 0 500 220" class="dc-svg">
        <line x1="50" y1="180" x2="450" y2="180" stroke="var(--border)" stroke-width="0.8" />
        <line x1="250" y1="10" x2="250" y2="180" stroke="var(--border)" stroke-width="0.5" />

        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Point at x=0 -->
        <circle cx="250" [attr.cy]="fy(examples[selIdx()].fn(0))" r="5"
                [attr.fill]="examples[selIdx()].diffAt0 ? '#5a8a5a' : '#a05a5a'" stroke="white" stroke-width="1.5" />
      </svg>

      <div class="info-grid">
        <div class="info-card" [class.ok]="examples[selIdx()].contAt0">
          連續？ {{ examples[selIdx()].contAt0 ? '✓' : '✗' }}
        </div>
        <div class="info-card" [class.ok]="examples[selIdx()].diffAt0" [class.bad]="!examples[selIdx()].diffAt0">
          可微？ {{ examples[selIdx()].diffAt0 ? '✓' : '✗' }}
        </div>
        <div class="info-card">{{ examples[selIdx()].reason }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        「可微 → 連續」的證明很短：f(x) − f(x₀) = [f(x)−f(x₀)]/(x−x₀) · (x−x₀) → f'(x₀)·0 = 0。
      </p>
      <p>下一節：微分的<strong>運算法則</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .dc-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 8px; }
    @media (max-width: 500px) { .info-grid { grid-template-columns: 1fr; } }
    .info-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; font-size: 13px; font-weight: 600;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepDiffContinuousComponent {
  readonly selIdx = signal(0);
  readonly examples = [
    { name: 'x²（可微）', fn: (x: number) => x * x, contAt0: true, diffAt0: true,
      reason: '光滑拋物線，處處可微' },
    { name: '|x|（不可微）', fn: Math.abs, contAt0: true, diffAt0: false,
      reason: '在 0 有尖角：左導數 = −1，右導數 = +1' },
    { name: '跳躍（不連續）', fn: (x: number) => x >= 0 ? x + 1 : x, contAt0: false, diffAt0: false,
      reason: '不連續 → 不可能可微' },
  ];

  fx(x: number): number { return 250 + x * 80; }
  fy(y: number): number { return 180 - y * 50; }

  curvePath(): string {
    const fn = this.examples[this.selIdx()].fn;
    const pts = sampleFn(fn, -2.5, 2.5, 300);
    // Handle jump: break path at large gaps
    const segs: string[] = [];
    let prev: { x: number; y: number } | null = null;
    for (const p of pts) {
      if (Math.abs(p.y) > 4) { prev = null; continue; }
      if (!prev || Math.abs(p.y - prev.y) > 1.5) {
        segs.push(`M${this.fx(p.x)},${this.fy(p.y)}`);
      } else {
        segs.push(`L${this.fx(p.x)},${this.fy(p.y)}`);
      }
      prev = p;
    }
    return segs.join('');
  }
}
