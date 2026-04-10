import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { bisectSubsequence } from './analysis-ch2-util';

const COLORS = ['#5a7faa', '#c8983b', '#5a8a5a', '#aa5a6a', '#8a6aaa', '#6aaa8a'];

// Generate a bounded oscillating sequence
function bouncingSeq(count: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.sin(i + 1) * 0.8 + 0.1 * Math.cos(3.7 * (i + 1)));
}

@Component({
  selector: 'app-step-bolzano-weierstrass',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Bolzano-Weierstrass 定理" subtitle="§2.5">
      <p>
        <strong>Bolzano-Weierstrass</strong>：每個<strong>有界</strong>數列都有收斂的<strong>子數列</strong>。
      </p>
      <p>
        不需要單調！只要有界——一定能從裡面挑出一個收斂的子列。
      </p>
      <p>
        證明用<strong>二分法</strong>（跟第一章的區間套一樣）：
        把包含所有項的區間一切為二，至少一半有無限多項。
        重複切下去 → 嵌套閉區間 → 交出一個極限點。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看二分法怎麼從一個亂跳的數列裡找出收斂子列">
      <div class="ctrl-row">
        <button class="act-btn" (click)="addStep()">加一層二分</button>
        <button class="act-btn" (click)="toggleRun()">{{ running() ? '暫停' : '自動' }}</button>
        <button class="act-btn reset" (click)="reset()">重置</button>
        <span class="step-info">二分層數：{{ bisectLevel() }}</span>
      </div>

      <svg viewBox="-10 -15 520 180" class="bw-svg">
        <!-- All terms as dots -->
        @for (val of rawTerms; track $index; let i = $index) {
          <circle [attr.cx]="toX(val)" [attr.cy]="dotY(i)" r="2.5"
                  [attr.fill]="isInSubseq(i) ? '#5a8a5a' : 'var(--text-muted)'"
                  [attr.fill-opacity]="isInSubseq(i) ? 1 : 0.25" />
        }

        <!-- Number line -->
        <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border)" stroke-width="0.8" />

        <!-- Nested intervals -->
        @for (iv of intervals(); track $index; let k = $index) {
          <rect [attr.x]="toX(iv.a)" [attr.y]="145 + k * 8"
                [attr.width]="Math.max(1, toX(iv.b) - toX(iv.a))" height="6"
                [attr.fill]="COLORS[k % COLORS.length]" fill-opacity="0.3"
                [attr.stroke]="COLORS[k % COLORS.length]" stroke-width="0.8" rx="2" />
        }
      </svg>

      @if (bisectLevel() >= 5) {
        <div class="result-box">
          子數列收斂到約 {{ approxLimit().toFixed(4) }}
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Bolzano-Weierstrass 是分析裡最常用的「存在性」工具之一。
        它說的是：<strong>有界 → 有聚點</strong>。
      </p>
      <p>
        下一節看一個跟收斂等價但「不需要知道極限」的條件：<strong>Cauchy 列</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .act-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.reset { color: var(--text-muted); } }
    .step-info { font-size: 12px; color: var(--text-muted); margin-left: auto;
      font-family: 'JetBrains Mono', monospace; }

    .bw-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }

    .result-box { padding: 10px; text-align: center; background: rgba(90, 138, 90, 0.08);
      border-radius: 8px; border: 1px solid rgba(90, 138, 90, 0.2);
      font-size: 14px; font-weight: 700; color: #5a8a5a;
      font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepBolzanoWeierstrassComponent implements OnDestroy {
  readonly Math = Math;
  readonly COLORS = COLORS;
  readonly rawTerms = bouncingSeq(40);
  readonly bisectLevel = signal(0);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly bisectResult = computed(() => bisectSubsequence(this.rawTerms, this.bisectLevel()));
  readonly intervals = computed(() => this.bisectResult().intervals);
  readonly subseqIndices = computed(() => new Set(this.bisectResult().subseqIndices));

  readonly approxLimit = computed(() => {
    const ivs = this.intervals();
    if (ivs.length === 0) return 0;
    const last = ivs[ivs.length - 1];
    return (last.a + last.b) / 2;
  });

  toX(v: number): number { return 20 + (v + 1.2) * 200; }
  dotY(i: number): number { return 10 + (i % 8) * 15; }
  isInSubseq(i: number): boolean { return this.subseqIndices().has(i); }

  addStep(): void { if (this.bisectLevel() < 10) this.bisectLevel.update((v) => v + 1); }

  toggleRun(): void {
    if (this.running()) { this.stopRun(); } else {
      this.running.set(true);
      this.timer = setInterval(() => {
        if (this.bisectLevel() >= 10) this.stopRun(); else this.addStep();
      }, 500);
    }
  }

  reset(): void { this.stopRun(); this.bisectLevel.set(0); }
  private stopRun(): void { this.running.set(false); if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  ngOnDestroy(): void { this.stopRun(); }
}
