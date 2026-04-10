import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ratioSequence, rootSequence } from './analysis-ch3-util';

interface SeriesEx { name: string; fn: (k: number) => number; ratioLimit: number; verdict: string; }

const EXAMPLES: SeriesEx[] = [
  { name: 'n!/nⁿ', fn: (k) => { let f=1; for(let i=2;i<=k;i++) f*=i; return f/Math.pow(k,k); },
    ratioLimit: 1/Math.E, verdict: 'L = 1/e < 1 → 收斂' },
  { name: '2ⁿ/n!', fn: (k) => { let f=1; for(let i=2;i<=k;i++) f*=i; return Math.pow(2,k)/f; },
    ratioLimit: 0, verdict: 'L = 0 < 1 → 收斂' },
  { name: '1/nᵖ (p=2)', fn: (k) => 1/(k*k),
    ratioLimit: 1, verdict: 'L = 1 → 比值法無法判斷（需其他方法）' },
  { name: 'nⁿ/n!', fn: (k) => { let f=1; for(let i=2;i<=k;i++) f*=i; return Math.pow(k,k)/f; },
    ratioLimit: Math.E, verdict: 'L = e > 1 → 發散' },
];

@Component({
  selector: 'app-step-ratio-root-tests',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="收斂判別法（二）：比值法與根式法" subtitle="§3.3">
      <p><strong>比值法</strong>（Ratio test）：設 L = lim |aₙ₊₁/aₙ|</p>
      <ul>
        <li>L &lt; 1 → <strong>收斂</strong>（像幾何級數，公比 &lt; 1）</li>
        <li>L > 1 → <strong>發散</strong></li>
        <li>L = 1 → <strong>無法判斷</strong></li>
      </ul>
      <p><strong>根式法</strong>（Root test）：設 L = lim |aₙ|^(1/n)，判準同上。根式法「更強」——比值法無法判斷時根式法有時可以。</p>
    </app-prose-block>

    <app-challenge-card prompt="看比值 rₙ = |aₙ₊₁/aₙ| 怎麼趨向極限——跟 1 比大小就知道收斂性">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <svg viewBox="0 0 520 200" class="rr-svg">
        <line x1="40" y1="170" x2="510" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" stroke-width="0.8" />

        <!-- Threshold line at 1 -->
        <line x1="40" [attr.y1]="ty(1)" x2="510" [attr.y2]="ty(1)"
              stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="5 3" />
        <text x="512" [attr.y]="ty(1) + 4" class="thr-label">1</text>

        <!-- Ratio dots -->
        @for (d of ratioData(); track d.n) {
          <circle [attr.cx]="40 + d.n * 12" [attr.cy]="ty(d.val)" r="3"
                  fill="var(--accent)" fill-opacity="0.7" />
        }

        <!-- Limit line -->
        <line x1="40" [attr.y1]="ty(current().ratioLimit)" x2="510" [attr.y2]="ty(current().ratioLimit)"
              stroke="#5a8a5a" stroke-width="1" stroke-dasharray="3 3" />
        <text x="512" [attr.y]="ty(current().ratioLimit) + 4" class="lim-label">L = {{ current().ratioLimit.toFixed(3) }}</text>
      </svg>

      <div class="verdict" [class.conv]="current().ratioLimit < 1" [class.div]="current().ratioLimit > 1"
           [class.inc]="Math.abs(current().ratioLimit - 1) < 0.01">
        {{ current().verdict }}
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>比值法和根式法對含階乘和指數的級數特別好用。下一節看跟積分比較的方法——<strong>積分判別法</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .rr-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .thr-label { font-size: 9px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .lim-label { font-size: 8px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .verdict { padding: 10px; text-align: center; font-size: 13px; font-weight: 600;
      border-radius: 8px; border: 1px solid var(--border); font-family: 'JetBrains Mono', monospace;
      &.conv { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.div { background: rgba(160,90,90,0.08); color: #a05a5a; }
      &.inc { background: rgba(200,152,59,0.08); color: #c8983b; } }
  `,
})
export class StepRatioRootTestsComponent {
  readonly Math = Math;
  readonly examples = EXAMPLES;
  readonly selIdx = signal(0);
  readonly current = computed(() => EXAMPLES[this.selIdx()]);
  readonly ratioData = computed(() => ratioSequence(this.current().fn, 40));

  ty(v: number): number {
    // Map 0..max(2, ratioLimit+0.5) to 170..10
    const mx = Math.max(2, this.current().ratioLimit + 0.5);
    return 170 - (v / mx) * 155;
  }
}
