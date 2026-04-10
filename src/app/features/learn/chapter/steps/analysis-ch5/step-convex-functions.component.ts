import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch5-util';

interface Preset { name: string; fn: (x: number) => number; convex: boolean; desc: string; }

const PRESETS: Preset[] = [
  { name: 'x²（凸）', fn: (x) => x * x, convex: true, desc: 'f"=2>0 everywhere → 凸' },
  { name: 'eˣ（凸）', fn: Math.exp, convex: true, desc: 'f"=eˣ>0 → 凸' },
  { name: '−x²（凹）', fn: (x) => -x * x, convex: false, desc: 'f"=−2<0 → 凹' },
  { name: 'x³（非凸非凹）', fn: (x) => x * x * x, convex: false, desc: 'f"=6x 變號 → 既非凸也非凹' },
];

@Component({
  selector: 'app-step-convex-functions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="凸函數" subtitle="§5.7">
      <p>
        f 在區間上是<strong>凸</strong>的，如果任意兩點之間的<strong>割線在曲線上方</strong>：
      </p>
      <p class="formula">
        f(tx + (1−t)y) ≤ t·f(x) + (1−t)·f(y)，0 ≤ t ≤ 1
      </p>
      <p>
        等價條件（如果 f 二次可微）：<strong>f'' ≥ 0</strong>。
      </p>
      <p>
        凸函數在優化裡極其重要：局部最小值 = 全局最小值。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖兩個點看割線——凸函數的割線永遠在曲線上方">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>
      <div class="ctrl-row">
        <span class="cl">x₁ = {{ x1().toFixed(1) }}</span>
        <input type="range" min="-2" max="0" step="0.1" [value]="x1()"
               (input)="x1.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">x₂ = {{ x2().toFixed(1) }}</span>
        <input type="range" min="0" max="2" step="0.1" [value]="x2()"
               (input)="x2.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 250" class="cvx-svg">
        <line x1="50" y1="200" x2="450" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="250" y1="10" x2="250" y2="200" stroke="var(--border)" stroke-width="0.5" />

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Secant line -->
        <line [attr.x1]="fx(x1())" [attr.y1]="fy(cur().fn(x1()))"
              [attr.x2]="fx(x2())" [attr.y2]="fy(cur().fn(x2()))"
              stroke="#c8983b" stroke-width="2" />

        <!-- Points -->
        <circle [attr.cx]="fx(x1())" [attr.cy]="fy(cur().fn(x1()))" r="5" fill="#5a7faa" stroke="white" stroke-width="1" />
        <circle [attr.cx]="fx(x2())" [attr.cy]="fy(cur().fn(x2()))" r="5" fill="#5a7faa" stroke="white" stroke-width="1" />
      </svg>

      <div class="verdict" [class.ok]="cur().convex" [class.bad]="!cur().convex">
        {{ cur().desc }}
        @if (cur().convex) {
          — 割線永遠在曲線<strong>上方</strong> ✓
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        凸性的重要推論是<strong>Jensen 不等式</strong>：
        f(E[X]) ≤ E[f(X)]（凸函數的期望值 ≥ 期望值的凸函數值）。
        這在概率論和資訊論裡無所不在。
      </p>
      <p>下一節看微分的最後一個主題——<strong>反函數定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 8px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .cl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { width: 80px; accent-color: var(--accent); }
    .cvx-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .verdict { padding: 10px; text-align: center; font-size: 13px; font-weight: 600; border-radius: 8px;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(200,152,59,0.08); color: #c8983b; }
      strong { color: var(--accent); } }
  `,
})
export class StepConvexFunctionsComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly x1 = signal(-1.5);
  readonly x2 = signal(1.5);

  readonly cur = computed(() => PRESETS[this.selIdx()]);

  fx(x: number): number { return 250 + x * 80; }
  fy(y: number): number { return 200 - ((y + 1) / 6) * 190; }

  curvePath(): string {
    const pts = sampleFn(this.cur().fn, -2.5, 2.5, 200);
    return 'M' + pts.filter((p) => Math.abs(p.y) < 5).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
