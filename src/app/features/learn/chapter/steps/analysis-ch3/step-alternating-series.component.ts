import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { partialSums } from './analysis-ch3-util';

const LN2 = Math.LN2;

@Component({
  selector: 'app-step-alternating-series',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="交替級數" subtitle="§3.5">
      <p>
        <strong>Leibniz 交替級數判別法</strong>：如果 bₙ 遞減且 bₙ → 0，那麼
      </p>
      <p class="formula">Σ (-1)ⁿ⁺¹ bₙ = b₁ − b₂ + b₃ − b₄ + … 收斂</p>
      <p>
        更厲害的是：<strong>誤差界</strong> |S − Sₙ| ≤ bₙ₊₁。
        截斷在第 n 項的誤差不超過下一項的大小。
      </p>
      <p>
        經典例子：Σ (-1)ⁿ⁺¹/n = 1 − 1/2 + 1/3 − 1/4 + … = <strong>ln 2</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看部分和怎麼「鋸齒形」逼近 ln 2——每一步的跳幅就是誤差界">
      <div class="ctrl-row">
        <button class="act-btn" (click)="step()">+1 項</button>
        <button class="act-btn" (click)="toggleRun()">{{ running() ? '⏸' : '▶ 自動' }}</button>
        <button class="act-btn reset" (click)="reset()">重置</button>
        <span class="info">n = {{ visible() }}　|S − Sₙ| ≤ {{ errorBound() }}</span>
      </div>

      <svg viewBox="0 0 520 250" class="alt-svg">
        <!-- Axes -->
        <line x1="40" y1="220" x2="510" y2="220" stroke="var(--border)" stroke-width="0.8" />

        <!-- ln 2 target line -->
        <line x1="40" [attr.y1]="ty(LN2)" x2="510" [attr.y2]="ty(LN2)"
              stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />
        <text x="512" [attr.y]="ty(LN2) + 4" class="lim-label">ln 2</text>

        <!-- Error band -->
        @if (visible() > 0) {
          <rect x="40" [attr.y]="ty(lastSum() + nextTerm())"
                width="470" [attr.height]="Math.max(1, ty(lastSum() - nextTerm()) - ty(lastSum() + nextTerm()))"
                fill="var(--accent)" fill-opacity="0.08" />
        }

        <!-- Zigzag path -->
        @if (visibleData().length > 1) {
          <path [attr.d]="zigzagPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
        }

        <!-- Dots -->
        @for (d of visibleData(); track d.n) {
          <circle [attr.cx]="nx(d.n)" [attr.cy]="ty(d.sum)" r="3.5"
                  [attr.fill]="d.term > 0 ? '#5a7faa' : '#aa5a6a'" />
        }
      </svg>
    </app-challenge-card>

    <app-prose-block>
      <p>
        交替級數收斂但<strong>不一定絕對收斂</strong>——Σ|(-1)ⁿ⁺¹/n| = Σ1/n 發散。
        這種情形叫<strong>條件收斂</strong>。下一節看條件收斂有什麼驚人的性質。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .act-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); } &.reset { color: var(--text-muted); } }
    .info { font-size: 12px; color: var(--text-muted); margin-left: auto;
      font-family: 'JetBrains Mono', monospace; }
    .alt-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .lim-label { font-size: 8px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepAlternatingSeriesComponent implements OnDestroy {
  readonly Math = Math;
  readonly LN2 = LN2;
  readonly visible = signal(1);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly allData = computed(() => partialSums((k) => ((-1) ** (k + 1)) / k, 50));
  readonly visibleData = computed(() => this.allData().slice(0, this.visible()));

  readonly lastSum = computed(() => {
    const d = this.visibleData();
    return d.length ? d[d.length - 1].sum : 0;
  });
  readonly nextTerm = computed(() => 1 / (this.visible() + 1));
  readonly errorBound = computed(() => this.nextTerm().toFixed(4));

  ty(v: number): number { return 220 - (v / 1.2) * 190; }
  nx(n: number): number { return 40 + (n / 52) * 470; }

  zigzagPath(): string {
    const d = this.visibleData();
    return 'M' + d.map((p) => `${this.nx(p.n)},${this.ty(p.sum)}`).join('L');
  }

  step(): void { if (this.visible() < 50) this.visible.update((v) => v + 1); }
  toggleRun(): void {
    if (this.running()) { this.stopRun(); } else {
      this.running.set(true);
      this.timer = setInterval(() => { if (this.visible() >= 50) this.stopRun(); else this.step(); }, 200);
    }
  }
  reset(): void { this.stopRun(); this.visible.set(1); }
  private stopRun(): void { this.running.set(false); if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  ngOnDestroy(): void { this.stopRun(); }
}
