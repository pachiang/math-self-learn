import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { partialSums } from './analysis-ch3-util';

interface Pair { name: string; aFn: (k: number) => number; bFn: (k: number) => number; aName: string; bName: string; verdict: string; }

const PAIRS: Pair[] = [
  { name: '1/(n²+n) vs 1/n²', aFn: (k) => 1/(k*k+k), bFn: (k) => 1/(k*k),
    aName: '1/(n²+n)', bName: '1/n²', verdict: 'aₙ ≤ bₙ，Σbₙ 收斂 → Σaₙ 收斂 ✓' },
  { name: '1/n vs 1/√n', aFn: (k) => 1/k, bFn: (k) => 1/Math.sqrt(k),
    aName: '1/n', bName: '1/√n', verdict: 'aₙ ≤ bₙ，但兩者都發散 → 比較法給不出結論' },
  { name: '1/(2ⁿ−1) vs 1/2ⁿ', aFn: (k) => 1/(Math.pow(2,k)-1), bFn: (k) => 1/Math.pow(2,k),
    aName: '1/(2ⁿ−1)', bName: '1/2ⁿ', verdict: 'aₙ/bₙ → 1（極限比較），Σbₙ 收斂 → Σaₙ 收斂 ✓' },
];

@Component({
  selector: 'app-step-comparison-tests',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="收斂判別法（一）：比較法" subtitle="§3.2">
      <p><strong>直接比較</strong>：如果 0 ≤ aₙ ≤ bₙ 且 Σbₙ 收斂，那 Σaₙ 收斂。</p>
      <p><strong>極限比較</strong>：如果 aₙ/bₙ → L（0 &lt; L &lt; ∞），那兩者同收斂同發散。</p>
      <p>直覺：跟一個「已知的」級數比大小。比它小就跟著收斂，比它大就跟著發散。</p>
    </app-prose-block>

    <app-challenge-card prompt="看兩個級數的部分和並排比較">
      <div class="ctrl-row">
        @for (p of pairs; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <svg viewBox="0 0 520 200" class="cmp-svg">
        <line x1="40" y1="170" x2="510" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" stroke-width="0.8" />

        <!-- bₙ terms (larger, faded) -->
        @for (d of bData(); track d.n) {
          <rect [attr.x]="nx(d.n) - 3" [attr.y]="ty(d.term)" width="6"
                [attr.height]="Math.max(0.5, 170 - ty(d.term))"
                fill="#5a7faa" fill-opacity="0.2" />
        }
        <!-- aₙ terms (smaller, solid) -->
        @for (d of aData(); track d.n) {
          <rect [attr.x]="nx(d.n) - 2" [attr.y]="ty(d.term)" width="4"
                [attr.height]="Math.max(0.5, 170 - ty(d.term))"
                fill="var(--accent)" fill-opacity="0.6" />
        }
      </svg>

      <div class="legend">
        <span><span class="dot a"></span>{{ current().aName }}（aₙ）</span>
        <span><span class="dot b"></span>{{ current().bName }}（bₙ）</span>
      </div>
      <div class="verdict">{{ current().verdict }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>比較法需要你「猜」一個合適的比較對象。下一節看更機械化的判別法——<strong>比值法和根式法</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .cmp-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .legend { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
    .dot { display: inline-block; width: 12px; height: 8px; margin-right: 4px; border-radius: 2px;
      &.a { background: var(--accent); } &.b { background: #5a7faa; opacity: 0.4; } }
    .verdict { padding: 10px; text-align: center; font-size: 13px; font-weight: 600;
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepComparisonTestsComponent {
  readonly Math = Math;
  readonly pairs = PAIRS;
  readonly selIdx = signal(0);
  readonly current = computed(() => PAIRS[this.selIdx()]);
  readonly aData = computed(() => partialSums(this.current().aFn, 30));
  readonly bData = computed(() => partialSums(this.current().bFn, 30));

  private readonly maxTerm = computed(() => {
    const all = [...this.aData(), ...this.bData()].map((d) => d.term);
    return Math.max(...all, 0.01);
  });

  ty(v: number): number { return 170 - (v / this.maxTerm()) * 155; }
  nx(n: number): number { return 40 + (n / 32) * 470; }
}
