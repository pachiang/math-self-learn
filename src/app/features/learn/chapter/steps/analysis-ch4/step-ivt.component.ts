import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { bisectionRoot, sampleFunction } from './analysis-ch4-util';

@Component({
  selector: 'app-step-ivt',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="中間值定理" subtitle="§4.5">
      <p>
        <strong>中間值定理</strong>（IVT）：如果 f 在 [a,b] 上連續，且 f(a) &lt; y &lt; f(b)
        （或 f(b) &lt; y &lt; f(a)），那麼存在 c ∈ (a,b) 使得 f(c) = y。
      </p>
      <p class="formula">連續函數不能「跳過」中間的值</p>
      <p>
        IVT 的證明用<strong>二分法</strong>（區間套，回到第一章的完備性）。
        同時這也是一個強大的<strong>求根演算法</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="二分法求根：f(x) = x³ − x − 2 在 [1, 2] 之間有一個根">
      <div class="ctrl-row">
        <button class="act-btn" (click)="step()">二分一步</button>
        <button class="act-btn" (click)="toggleRun()">{{ running() ? '⏸' : '▶ 自動' }}</button>
        <button class="act-btn reset" (click)="reset()">重置</button>
        <span class="step-info">步驟 {{ bisectStep() }} / {{ maxSteps }}</span>
      </div>

      <svg viewBox="0 0 520 280" class="ivt-svg">
        <line x1="50" y1="200" x2="480" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="200" stroke="var(--border)" stroke-width="0.8" />

        <!-- y = 0 line (target) -->
        <line x1="50" [attr.y1]="fy(0)" x2="480" [attr.y2]="fy(0)"
              stroke="#5a8a5a" stroke-width="1" stroke-dasharray="4 3" />

        <!-- Function curve -->
        <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Current interval [a, b] -->
        @if (currentStep()) {
          <rect [attr.x]="fx(currentStep()!.a)" [attr.y]="20"
                [attr.width]="Math.max(1, fx(currentStep()!.b) - fx(currentStep()!.a))"
                height="180" fill="#c8983b" fill-opacity="0.1" />
          <!-- Midpoint -->
          <circle [attr.cx]="fx(currentStep()!.mid)" [attr.cy]="fy(currentStep()!.fMid)"
                  r="5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
          <line [attr.x1]="fx(currentStep()!.mid)" y1="20" [attr.x2]="fx(currentStep()!.mid)" y2="200"
                stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" />
        }

        <!-- Step info below chart -->
        <text x="260" y="225" class="step-label">
          @if (currentStep()) {
            [{{ currentStep()!.a.toFixed(4) }}, {{ currentStep()!.b.toFixed(4) }}]
            mid = {{ currentStep()!.mid.toFixed(6) }}
          }
        </text>

        <!-- Interval width bar -->
        <rect x="50" y="240" [attr.width]="Math.max(1, intervalWidthPx())" height="8"
              fill="var(--accent)" fill-opacity="0.4" rx="3" />
        <text x="50" y="260" class="width-label">
          區間寬 = {{ intervalWidth().toExponential(2) }}
        </text>
      </svg>
    </app-challenge-card>

    <app-prose-block>
      <p>
        每一步區間<strong>減半</strong>。20 步後精度達到 10⁻⁶。
        IVT 保證根<strong>一定在區間裡</strong>——完備性讓二分法永遠成功。
      </p>
      <p>下一節看連續函數在閉區間上的另一個大定理——<strong>極值定理</strong>。</p>
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
    .step-info { font-size: 12px; color: var(--text-muted); margin-left: auto;
      font-family: 'JetBrains Mono', monospace; }
    .ivt-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .step-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .width-label { font-size: 8px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepIvtComponent implements OnDestroy {
  readonly Math = Math;
  readonly maxSteps = 25;
  readonly bisectStep = signal(0);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly f = (x: number) => x * x * x - x - 2;
  readonly allSteps = bisectionRoot(this.f, 1, 2, this.maxSteps);

  readonly currentStep = computed(() => this.allSteps[this.bisectStep()] ?? null);
  readonly intervalWidth = computed(() => {
    const s = this.currentStep();
    return s ? s.b - s.a : 1;
  });
  readonly intervalWidthPx = computed(() => Math.max(1, this.intervalWidth() / 1 * 430));

  fx(x: number): number { return 50 + ((x - 0.5) / 2) * 430; }
  fy(y: number): number { return 200 - ((y + 3) / 8) * 180; }

  readonly curvePath = (() => {
    const pts = sampleFunction(this.f, 0.5, 2.5, 200);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  })();

  step(): void { if (this.bisectStep() < this.maxSteps - 1) this.bisectStep.update((v) => v + 1); }
  toggleRun(): void {
    if (this.running()) { this.stopRun(); } else {
      this.running.set(true);
      this.timer = setInterval(() => { if (this.bisectStep() >= this.maxSteps - 1) this.stopRun(); else this.step(); }, 300);
    }
  }
  reset(): void { this.stopRun(); this.bisectStep.set(0); }
  private stopRun(): void { this.running.set(false); if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  ngOnDestroy(): void { this.stopRun(); }
}
