import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFunction } from './analysis-ch4-util';

interface DiscType { name: string; fn: (x: number) => number; c: number; type: string;
  xRange: [number, number]; desc: string; }

const TYPES: DiscType[] = [
  { name: '可去間斷', fn: (x) => x === 1 ? 5 : (x*x-1)/(x-1), c: 1, type: 'removable',
    xRange: [-1, 3], desc: '極限存在但 ≠ f(c)。「挖個洞填錯值」→ 可以修復。' },
  { name: '跳躍間斷', fn: (x) => Math.floor(x), c: 2, type: 'jump',
    xRange: [0, 4], desc: '左右極限都存在但不相等。函數「跳」了一步。' },
  { name: '振盪間斷', fn: (x) => x === 0 ? 0 : Math.sin(1/x), c: 0, type: 'essential',
    xRange: [-1, 1], desc: '極限不存在。函數在 c 附近瘋狂振盪。' },
];

@Component({
  selector: 'app-step-discontinuity-types',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="間斷點分類" subtitle="§4.4">
      <p>不連續有三種：</p>
      <ul>
        <li><strong>可去間斷</strong>：左右極限相等，只是 f(c) 的值不對（或未定義）。改一個點就修好了。</li>
        <li><strong>跳躍間斷</strong>：左右極限都存在但不等。函數「跳」了。</li>
        <li><strong>振盪間斷</strong>（本性間斷）：至少一側極限不存在。沒救。</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="三種間斷——看圖形的差別">
      <div class="ctrl-row">
        @for (t of types; track t.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ t.name }}</button>
        }
      </div>

      <svg viewBox="0 0 500 250" class="disc-svg">
        <line x1="50" y1="200" x2="450" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="200" stroke="var(--border)" stroke-width="0.8" />

        <!-- c vertical line -->
        <line [attr.x1]="fx(currentType().c)" y1="20" [attr.x2]="fx(currentType().c)" y2="200"
              stroke="#c8983b" stroke-width="1" stroke-dasharray="3 3" />

        <!-- Curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Discontinuity marker -->
        <circle [attr.cx]="fx(currentType().c)" cy="110" r="6"
                fill="none" stroke="#a05a5a" stroke-width="2" stroke-dasharray="3 2" />
      </svg>

      <div class="type-card" [class.rem]="currentType().type === 'removable'"
           [class.jump]="currentType().type === 'jump'"
           [class.ess]="currentType().type === 'essential'">
        <div class="tc-title">{{ currentType().name }}</div>
        <div class="tc-desc">{{ currentType().desc }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看連續函數的第一個大定理——<strong>中間值定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .disc-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .type-card { padding: 14px; border-radius: 10px; border: 1px solid var(--border);
      &.rem { background: rgba(200,152,59,0.06); border-color: #c8983b; }
      &.jump { background: rgba(90,127,170,0.06); border-color: #5a7faa; }
      &.ess { background: rgba(160,90,90,0.06); border-color: #a05a5a; } }
    .tc-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .tc-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class StepDiscontinuityTypesComponent {
  readonly types = TYPES;
  readonly selIdx = signal(0);

  readonly currentType = () => TYPES[this.selIdx()];

  fx(x: number): number {
    const [lo, hi] = this.currentType().xRange;
    return 50 + ((x - lo) / (hi - lo)) * 400;
  }

  fy(y: number): number { return 200 - ((y + 2) / 6) * 180; }

  curvePath(): string {
    const t = this.currentType();
    const pts = sampleFunction(t.fn, t.xRange[0], t.xRange[1], 400);
    const segs: string[] = [];
    let prevY = NaN;
    for (const p of pts) {
      if (!isFinite(p.y) || Math.abs(p.y) > 5) { prevY = NaN; continue; }
      if (isNaN(prevY) || Math.abs(p.y - prevY) > 2) {
        segs.push(`M${this.fx(p.x)},${this.fy(p.y)}`);
      } else {
        segs.push(`L${this.fx(p.x)},${this.fy(p.y)}`);
      }
      prevY = p.y;
    }
    return segs.join('');
  }
}
