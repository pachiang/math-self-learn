import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { findDelta, sampleFunction } from './analysis-ch4-util';

interface Preset { name: string; fn: (x: number) => number; c: number; L: number; exists: boolean; desc: string; }

const PRESETS: Preset[] = [
  { name: 'sin(x)/x → 1', fn: (x) => x === 0 ? 1 : Math.sin(x)/x, c: 0, L: 1, exists: true,
    desc: '經典極限，L = 1' },
  { name: '(x²−1)/(x−1) → 2', fn: (x) => x === 1 ? 2 : (x*x-1)/(x-1), c: 1, L: 2, exists: true,
    desc: '消去因子後 = x+1，在 x=1 處極限 = 2' },
  { name: '|x|/x（不存在）', fn: (x) => x > 0 ? 1 : x < 0 ? -1 : 0, c: 0, L: 0, exists: false,
    desc: '左極限 = −1，右極限 = 1，極限不存在' },
];

@Component({
  selector: 'app-step-function-limits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="函數的極限" subtitle="§4.1">
      <p>
        第二章用 ε-N 定義了數列極限。現在搬到函數上——用 <strong>ε-δ</strong>：
      </p>
      <p class="formula axiom">
        lim(x→c) f(x) = L ⟺<br />
        ∀ε > 0, ∃δ > 0 使得 0 &lt; |x−c| &lt; δ ⟹ |f(x)−L| &lt; ε
      </p>
      <p>
        直覺跟 ε-N 一模一樣：不管 ε 多小（水平帶子多薄），
        都能找到 δ（垂直帶子多窄），使得 x 在 δ 帶子裡時 f(x) 在 ε 帶子裡。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 ε 看 δ 怎麼跟著變——帶子越薄，視窗越窄">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="eps-ctrl">
          <span class="el">ε = {{ epsilon().toFixed(3) }}</span>
          <input type="range" min="0.05" max="1.5" step="0.01" [value]="epsilon()"
                 (input)="epsilon.set(+($any($event.target)).value)" class="es" />
        </div>
      </div>

      <svg viewBox="0 0 500 300" class="ed-svg">
        <!-- Axes -->
        <line x1="50" y1="250" x2="450" y2="250" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="250" stroke="var(--border)" stroke-width="0.8" />

        <!-- ε band (horizontal) around L -->
        <rect x="50" [attr.y]="fy(current().L + epsilon())" width="400"
              [attr.height]="Math.max(1, fy(current().L - epsilon()) - fy(current().L + epsilon()))"
              fill="var(--accent)" fill-opacity="0.1" />
        <line x1="50" [attr.y1]="fy(current().L)" x2="450" [attr.y2]="fy(current().L)"
              stroke="#5a8a5a" stroke-width="1" stroke-dasharray="4 3" />

        <!-- δ band (vertical) around c -->
        <rect [attr.x]="fx(current().c - delta())" y="20"
              [attr.width]="Math.max(1, fx(current().c + delta()) - fx(current().c - delta()))"
              height="230" fill="#c8983b" fill-opacity="0.08" />
        <line [attr.x1]="fx(current().c)" y1="20" [attr.x2]="fx(current().c)" y2="250"
              stroke="#c8983b" stroke-width="1" stroke-dasharray="3 3" />

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Point c marker -->
        <circle [attr.cx]="fx(current().c)" [attr.cy]="fy(current().L)" r="4"
                fill="none" stroke="#5a8a5a" stroke-width="2" />
      </svg>

      <div class="result-row">
        <div class="r-card">ε = {{ epsilon().toFixed(3) }}</div>
        <div class="r-card">δ = {{ delta().toFixed(4) }}</div>
        <div class="r-card" [class.ok]="current().exists" [class.bad]="!current().exists">
          {{ current().exists ? '極限存在 ✓' : '極限不存在 ✗' }}
        </div>
      </div>
      <div class="desc">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>ε-δ 語言是連續性的基礎。下一節用它來定義<strong>連續</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .eps-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .el { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 90px; }
    .es { width: 120px; accent-color: var(--accent); }
    .ed-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px;
      font-weight: 600; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepFunctionLimitsComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly epsilon = signal(0.3);

  readonly current = computed(() => PRESETS[this.selIdx()]);
  readonly delta = computed(() => {
    const p = this.current();
    if (!p.exists) return 0;
    return findDelta(p.fn, p.c, p.L, this.epsilon());
  });

  private readonly xRange = [-2, 4];
  private readonly yRange = [-1.5, 3.5];

  fx(x: number): number { return 50 + ((x - this.xRange[0]) / (this.xRange[1] - this.xRange[0])) * 400; }
  fy(y: number): number { return 250 - ((y - this.yRange[0]) / (this.yRange[1] - this.yRange[0])) * 230; }

  curvePath(): string {
    const pts = sampleFunction(this.current().fn, this.xRange[0], this.xRange[1], 200);
    const valid = pts.filter((p) => p.y > this.yRange[0] - 0.5 && p.y < this.yRange[1] + 0.5);
    if (valid.length < 2) return '';
    return 'M' + valid.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
