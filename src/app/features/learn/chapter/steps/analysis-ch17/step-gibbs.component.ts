import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { fourierCoeffs, fourierPartialSum } from './analysis-ch17-util';

@Component({
  selector: 'app-step-gibbs-phenomenon',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Gibbs 現象" subtitle="§17.4">
      <p>
        在不連續點附近，Fourier 部分和永遠<strong>過衝約 9%</strong>——不管 N 多大。
      </p>
      <p class="formula">lim(N→∞) max|Sₙ(x) − f(x)| ≈ 0.089... (不等於 0！)</p>
      <p>
        這不是計算誤差，而是 Fourier 級數的<strong>結構性限制</strong>。
        過衝的高度不隨 N 減小，只是變得越來越「窄」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="放大方波的不連續點，觀察 Gibbs 過衝如何隨 N 改變">
      <div class="ctrl-row">
        <span class="cl">N = {{ N() }}</span>
        <input type="range" min="3" max="100" step="1" [value]="N()"
               (input)="N.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-0.5 -1.5 1.5 3" class="gibbs-svg">
        <!-- Grid -->
        <line x1="-0.5" y1="0" x2="1" y2="0" stroke="var(--border)" stroke-width="0.008" />
        <line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="var(--border)" stroke-width="0.008" />

        <!-- f(x) = ±1 reference -->
        <line x1="-0.5" y1="-1" x2="0" y2="-1" stroke="var(--text-muted)" stroke-width="0.015" stroke-dasharray="0.03 0.02" />
        <line x1="0" y1="1" x2="1" y2="1" stroke="var(--text-muted)" stroke-width="0.015" stroke-dasharray="0.03 0.02" />

        <!-- 9% overshoot line -->
        <line x1="0" [attr.y1]="-1.0895" x2="0.8" [attr.y2]="-1.0895"
              stroke="#bf6e6e" stroke-width="0.008" stroke-dasharray="0.02 0.015" />
        <text x="0.82" [attr.y]="-1.0595" fill="#bf6e6e" font-size="0.055">~9% 過衝</text>

        <!-- Partial sum curve -->
        <path [attr.d]="gibbsPath()" fill="none" stroke="var(--accent)" stroke-width="0.02" />
      </svg>

      <div class="info-row">
        <div class="i-card">N = {{ N() }}</div>
        <div class="i-card">實際過衝 ≈ {{ overshoot().toFixed(3) }}</div>
        <div class="i-card" [class.bad]="true">理論極限 ≈ 0.0895</div>
      </div>

      <div class="note">
        N = {{ N() }} 時波峰已移到 x ≈ {{ peakX().toFixed(4) }}（離不連續點越來越近），
        但<strong>高度不變</strong>。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Gibbs 現象告訴我們：<strong>逐點收斂</strong>和<strong>均勻收斂</strong>是不同的。
        Fourier 級數在 L² 意義下收斂（能量最優），但在不連續點不均勻收斂。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .gibbs-svg { width: 100%; max-width: 450px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .i-card { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.bad { color: #bf6e6e; background: rgba(191,110,110,0.08); } }
    .note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; text-align: center; color: var(--text-muted); }
    .note strong { color: var(--accent); }
  `,
})
export class StepGibbsPhenomenonComponent {
  readonly N = signal(20);

  private readonly squareWave = (x: number) => {
    const xn = ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    return xn >= 0 ? 1 : -1;
  };

  private readonly coeffs = computed(() => fourierCoeffs(this.squareWave, 100));

  readonly overshoot = computed(() => {
    const c = this.coeffs();
    const n = this.N();
    // Find max near x=0+
    let maxVal = 0;
    for (let i = 1; i <= 500; i++) {
      const x = (Math.PI * i) / 500;
      const v = fourierPartialSum(x, c, n);
      if (v > maxVal) maxVal = v;
    }
    return maxVal - 1;
  });

  readonly peakX = computed(() => {
    const c = this.coeffs();
    const n = this.N();
    let maxVal = 0, maxX = 0;
    for (let i = 1; i <= 500; i++) {
      const x = (Math.PI * i) / 500;
      const v = fourierPartialSum(x, c, n);
      if (v > maxVal) { maxVal = v; maxX = x; }
    }
    return maxX;
  });

  gibbsPath(): string {
    const c = this.coeffs();
    const n = this.N();
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -0.5 + (1.5 * i) / 400;
      const y = -fourierPartialSum(x, c, n);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${y.toFixed(4)}`;
    }
    return path;
  }
}
