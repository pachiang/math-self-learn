import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-convolution-fourier',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="卷積定理" subtitle="§17.8">
      <p>
        <strong>卷積</strong>：(f * g)(x) = ∫ f(t) g(x−t) dt — 把 g 「滑過」 f 並加總。
      </p>
      <p class="formula">F̂[f * g] = F̂[f] · F̂[g]</p>
      <p>
        時域的卷積 = 頻域的乘法。這就是為什麼 Fourier 變換如此強大——
        把卷積（複雜的積分）變成逐點相乘（簡單的乘法）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 g 的寬度，觀察卷積如何平滑信號">
      <div class="ctrl-row">
        <span class="cl">核寬度 σ = {{ sigma().toFixed(2) }}</span>
        <input type="range" min="0.1" max="2" step="0.05" [value]="sigma()"
               (input)="sigma.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-4 -1.5 8 3" class="conv-svg">
        <line x1="-4" y1="0" x2="4" y2="0" stroke="var(--border)" stroke-width="0.015" />
        <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="var(--border)" stroke-width="0.015" />

        <!-- Original signal (square wave) -->
        <path [attr.d]="originalPath()" fill="none" stroke="var(--text-muted)" stroke-width="0.025"
              stroke-dasharray="0.06 0.04" />

        <!-- Kernel (shifted) -->
        <path [attr.d]="kernelPath()" fill="none" stroke="#bf8a5a" stroke-width="0.02" stroke-opacity="0.5" />

        <!-- Convolution result -->
        <path [attr.d]="convPath()" fill="none" stroke="var(--accent)" stroke-width="0.04" />
      </svg>

      <div class="legend">
        <span><span class="dot muted"></span>f(x) 方波</span>
        <span><span class="dot orange"></span>g(x) 高斯核</span>
        <span><span class="dot accent"></span>(f*g)(x) 卷積</span>
      </div>

      <div class="note">
        σ 越大，高斯核越寬，卷積越「平滑」。
        頻域解釋：寬高斯的 Fourier 變換是<strong>窄</strong>高斯 → 更多高頻被砍掉 → 更平滑。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        卷積是信號處理、PDE、概率（分佈的和 = 卷積）的核心操作。
        卷積定理讓 FFT 算法成為可能——把 O(n²) 的卷積變成 O(n log n)。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 110px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .conv-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .legend { display: flex; gap: 14px; justify-content: center; margin-bottom: 10px; font-size: 12px; color: var(--text-muted); }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px;
      &.muted { background: var(--text-muted); } &.orange { background: #bf8a5a; } &.accent { background: var(--accent); } }
    .note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; text-align: center; color: var(--text-muted); }
    .note strong { color: var(--accent); }
  `,
})
export class StepConvolutionComponent {
  readonly sigma = signal(0.5);

  private readonly squareWave = (x: number) => Math.abs(x) <= 1 ? 1 : 0;
  private readonly gaussian = (x: number, s: number) =>
    (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-x * x / (2 * s * s));

  originalPath(): string {
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -4 + (8 * i) / 400;
      const y = -this.squareWave(x);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(3)},${y.toFixed(3)}`;
    }
    return path;
  }

  kernelPath(): string {
    const s = this.sigma();
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -4 + (8 * i) / 400;
      const y = -this.gaussian(x, s) * s * 2; // scale for visibility
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(3)},${y.toFixed(3)}`;
    }
    return path;
  }

  convPath(): string {
    const s = this.sigma();
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -4 + (8 * i) / 400;
      // Numerical convolution (square * gaussian)
      let sum = 0;
      const dt = 0.05;
      for (let t = -4; t <= 4; t += dt) {
        sum += this.squareWave(t) * this.gaussian(x - t, s) * dt;
      }
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(3)},${(-sum).toFixed(3)}`;
    }
    return path;
  }
}
