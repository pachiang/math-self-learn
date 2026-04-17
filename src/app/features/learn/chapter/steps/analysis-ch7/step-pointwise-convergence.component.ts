import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { sampleFn } from './analysis-ch7-util';

interface Preset { name: string; fn: (n: number, x: number) => number; limit: (x: number) => number;
  xRange: [number, number]; yRange: [number, number]; desc: string; uniformlyConverges: boolean; }

const PRESETS: Preset[] = [
  { name: 'xⁿ on [0,1]', fn: (n, x) => Math.pow(x, n),
    limit: (x) => x < 1 ? 0 : 1, xRange: [0, 1], yRange: [0, 1.05],
    desc: '逐點收斂到不連續函數（x<1→0, x=1→1）。不是均勻收斂。', uniformlyConverges: false },
  { name: 'x/n on [0,1]', fn: (n, x) => x / n,
    limit: () => 0, xRange: [0, 1], yRange: [0, 1.05],
    desc: '均勻收斂到 0（在 [0,1] 上）。sup|x/n| = 1/n → 0。', uniformlyConverges: true },
  { name: 'nxe^(−nx²)', fn: (n, x) => n * x * Math.exp(-n * x * x),
    limit: () => 0, xRange: [0, 2], yRange: [0, 1.1],
    desc: '逐點收斂到 0，但 sup|fₙ| = √(n/(2e)) → ∞。不是均勻收斂。', uniformlyConverges: false },
];

@Component({
  selector: 'app-step-pointwise-convergence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="逐點收斂" subtitle="§7.1">
      <p>
        函數列 {{ '{' }}fₙ{{ '}' }} <strong>逐點收斂</strong>到 f，如果對每個固定的 x：
      </p>
      <app-math block [e]="formulaPW"></app-math>
      <p>
        注意「對每個 x」——不同的 x 收斂速度可以不同。
        這是逐點收斂的弱點：它<strong>不保證保持連續性</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 n 看函數列怎麼逐點趨向極限——注意 xⁿ 的極限是不連續的！">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">n = {{ nVal() }}</span>
          <input type="range" min="1" max="40" step="1" [value]="nVal()"
                 (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 240" class="pw-svg">
        <line x1="40" y1="200" x2="500" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="200" stroke="var(--border)" stroke-width="0.8" />

        @if (cur().yRange[0] < 0) {
          <line x1="40" [attr.y1]="fy(0)" x2="500" [attr.y2]="fy(0)"
                stroke="var(--text-muted)" stroke-width="0.5" stroke-dasharray="4 3" />
        }

        <!-- Limit function (dashed green) -->
        <path [attr.d]="limitPath()" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- Previous n (faded) -->
        @if (nVal() > 1) {
          <path [attr.d]="fnPath(nVal() - 1)" fill="none" stroke="var(--text-muted)" stroke-width="1" stroke-opacity="0.3" />
        }

        <!-- Current fₙ -->
        <path [attr.d]="fnPath(nVal())" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="info-row">
        <div class="i-card">f{{ nVal() }}(x)</div>
        <div class="i-card" [class.ok]="cur().uniformlyConverges" [class.warn]="!cur().uniformlyConverges">
          {{ cur().uniformlyConverges ? '均勻收斂 ✓' : '僅逐點收斂 ⚠' }}
        </div>
      </div>
      <div class="desc">{{ cur().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        xⁿ 的例子最經典：每個 fₙ(x) = xⁿ 都連續，但極限函數在 x = 1 跳躍。
        <strong>逐點收斂可以破壞連續性</strong>。我們需要更強的收斂概念。
      </p>
      <p>下一節：<strong>均勻收斂</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 120px; accent-color: var(--accent); }
    .pw-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .info-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .i-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); background: var(--bg-surface);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.warn { background: rgba(200,152,59,0.08); color: #c8983b; } }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepPointwiseConvergenceComponent {
  readonly formulaPW = String.raw`\lim_{n \to \infty} f_n(x) = f(x)`;
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly nVal = signal(5);
  readonly cur = computed(() => PRESETS[this.selIdx()]);

  fx(x: number, range: [number, number]): number { return 40 + ((x - range[0]) / (range[1] - range[0])) * 460; }
  fy(y: number): number {
    const [yMin, yMax] = this.cur().yRange;
    return 200 - ((y - yMin) / (yMax - yMin)) * 190;
  }

  fnPath(n: number): string {
    const c = this.cur();
    const pts = sampleFn((x) => c.fn(n, x), c.xRange[0], c.xRange[1], 300);
    return 'M' + pts.filter((p) => p.y > c.yRange[0] - 0.05 && p.y < c.yRange[1] + 0.05).map((p) => `${this.fx(p.x, c.xRange)},${this.fy(p.y)}`).join('L');
  }

  limitPath(): string {
    const c = this.cur();
    const pts = sampleFn(c.limit, c.xRange[0], c.xRange[1], 300);
    // Handle discontinuity by breaking path
    const segs: string[] = [];
    let prev: { x: number; y: number } | null = null;
    for (const p of pts) {
      if (!prev || Math.abs(p.y - prev.y) > 0.5) {
        segs.push(`M${this.fx(p.x, c.xRange)},${this.fy(p.y)}`);
      } else {
        segs.push(`L${this.fx(p.x, c.xRange)},${this.fy(p.y)}`);
      }
      prev = p;
    }
    return segs.join('');
  }
}
