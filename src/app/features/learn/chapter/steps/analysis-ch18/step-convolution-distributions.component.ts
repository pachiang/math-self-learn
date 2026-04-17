import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { gaussianDelta, samplePath } from './analysis-ch18-util';

@Component({
  selector: 'app-step-convolution-distributions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="卷積與逼近恆等式" subtitle="§18.8">
      <p>
        δ 是卷積的<strong>恆等元</strong>：f * δ = f。用 δε 逼近：
      </p>
      <p class="formula">f * δε → f (ε → 0)</p>
      <p>
        δε * f 就是 f 的「平滑版」——把 f 和一個平滑的 bump 做卷積，磨平所有的角。
        這是 <strong>mollifier</strong>（磨光器）的原理。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看磨光器如何平滑一個有跳躍的函數">
      <div class="ctrl-row">
        <span class="cl">ε = {{ eps().toFixed(3) }}</span>
        <input type="range" min="-2" max="0" step="0.02" [value]="epsLog()"
               (input)="epsLog.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 200" class="conv-svg">
        <line x1="40" y1="150" x2="460" y2="150" stroke="var(--border)" stroke-width="0.8" />
        <line x1="250" y1="20" x2="250" y2="150" stroke="var(--border)" stroke-width="0.5" />

        <!-- Original: step function with two jumps -->
        <path [attr.d]="originalPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="5 3" />

        <!-- Mollified -->
        <path [attr.d]="mollifiedPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="legend">
        <span><span class="dot muted"></span>f(x)（有跳躍）</span>
        <span><span class="dot accent"></span>f * δε（平滑後）</span>
      </div>

      <div class="properties">
        <div class="prop"><span class="pk">C∞</span> f * δε 永遠是光滑的（即使 f 不連續）</div>
        <div class="prop"><span class="pk">收斂</span> ε → 0 時 f * δε → f（在 L¹ / L² / 逐點等意義下）</div>
        <div class="prop"><span class="pk">恆等</span> f * δ = f（delta 是卷積的恆等元）</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Mollifier 在 PDE、數值分析、機器學習（高斯模糊）中無處不在。
        它的理論基礎就是分佈論。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .conv-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 8px; }
    .legend { display: flex; gap: 14px; justify-content: center; margin-bottom: 12px; font-size: 12px; color: var(--text-muted); }
    .dot { display: inline-block; width: 12px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.muted { background: var(--text-muted); } &.accent { background: var(--accent); } }
    .properties { display: flex; flex-direction: column; gap: 6px; }
    .prop { padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-secondary); }
    .pk { font-weight: 700; color: var(--accent); margin-right: 8px; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepConvolutionDistributionsComponent {
  readonly epsLog = signal(-0.5);
  readonly eps = computed(() => Math.pow(10, this.epsLog()));

  // Step function with jumps
  private readonly stepFn = (x: number) => {
    if (x < -1) return 0;
    if (x < 0) return 1;
    if (x < 1) return -0.5;
    return 0.5;
  };

  originalPath(): string {
    return samplePath(this.stepFn, -3, 3, 60, 150, 70, 250);
  }

  mollifiedPath(): string {
    const e = this.eps();
    const mollified = (x: number) => {
      // Numerical convolution: (f * δε)(x) = ∫ f(t) δε(x−t) dt
      let sum = 0;
      const dt = 0.02;
      for (let t = -4; t <= 4; t += dt) {
        sum += this.stepFn(t) * gaussianDelta(x - t, e) * dt;
      }
      return sum;
    };
    return samplePath(mollified, -3, 3, 60, 150, 70, 250);
  }
}
