import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-why-fourier',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼需要 Fourier 分析" subtitle="§17.1">
      <p>
        任何周期函數都可以拆成<strong>正弦波的疊加</strong>——這是 Fourier 在 1807 年的驚人宣稱。
      </p>
      <p class="formula">f(x) = a₀ + Σ(aₙ cos nx + bₙ sin nx)</p>
      <p>
        就像白光通過稜鏡分解成彩虹——Fourier 分析把複雜的信號分解成簡單的頻率成分。
      </p>
      <p>應用遍布：音樂（和弦 = 頻率疊加）、影像壓縮（JPEG）、量子力學、偏微分方程。</p>
    </app-prose-block>

    <app-challenge-card prompt="拖動各頻率的振幅，看正弦波如何疊加成複雜波形">
      <div class="amp-grid">
        @for (i of [0,1,2,3,4]; track i) {
          <div class="amp-row">
            <span class="al">{{ i === 0 ? 'a₀' : 'sin ' + i + 'x' }}</span>
            <input type="range" [min]="i === 0 ? -1 : -1.5" [max]="i === 0 ? 1 : 1.5" step="0.05"
                   [value]="amps()[i]"
                   (input)="setAmp(i, +($any($event.target)).value)" class="sl" />
            <span class="av">{{ amps()[i].toFixed(2) }}</span>
          </div>
        }
      </div>

      <svg viewBox="-3.5 -2.5 7 5" class="wave-svg">
        <!-- Grid -->
        <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="var(--border)" stroke-width="0.015" />
        <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="var(--border)" stroke-width="0.015" />

        <!-- Individual components (faded) -->
        @for (i of [1,2,3,4]; track i) {
          @if (Math.abs(amps()[i]) > 0.01) {
            <path [attr.d]="componentPath(i)" fill="none"
                  [attr.stroke]="colors[i]" stroke-width="0.02" stroke-opacity="0.35" />
          }
        }

        <!-- Sum -->
        <path [attr.d]="sumPath()" fill="none" stroke="var(--accent)" stroke-width="0.04" />
      </svg>

      <div class="legend">
        @for (i of [1,2,3,4]; track i) {
          <span><span class="dot" [style.background]="colors[i]"></span>sin {{ i }}x</span>
        }
        <span><span class="dot accent"></span>疊加</span>
      </div>

      <div class="presets-row">
        <button class="pre-btn" (click)="preset('square')">方波近似</button>
        <button class="pre-btn" (click)="preset('sawtooth')">鋸齒近似</button>
        <button class="pre-btn" (click)="preset('reset')">歸零</button>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        你剛才親手體驗了 Fourier 的核心想法：<strong>用簡單的正弦波建構複雜的波形</strong>。
        下一節我們正式定義 Fourier 係數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .amp-grid { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .amp-row { display: flex; align-items: center; gap: 8px; }
    .al { font-size: 12px; font-weight: 600; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .av { font-size: 12px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .wave-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .legend { display: flex; gap: 12px; justify-content: center; margin-bottom: 10px; font-size: 12px; color: var(--text-muted); }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px;
      &.accent { background: var(--accent); } }
    .presets-row { display: flex; gap: 6px; justify-content: center; }
    .pre-btn { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); } }
  `,
})
export class StepWhyFourierComponent {
  readonly Math = Math;
  readonly colors = ['', '#bf6e6e', '#6e9a6e', '#6e8aa8', '#c8983b'];
  readonly amps = signal([0, 1, 0, 0, 0]);

  setAmp(i: number, v: number): void {
    const arr = [...this.amps()];
    arr[i] = v;
    this.amps.set(arr);
  }

  preset(name: string): void {
    switch (name) {
      case 'square': this.amps.set([0, 1.27, 0, 0.42, 0]); break;
      case 'sawtooth': this.amps.set([0, 0.64, -0.32, 0.21, -0.16]); break;
      case 'reset': this.amps.set([0, 0, 0, 0, 0]); break;
    }
  }

  private evalSum(x: number): number {
    const a = this.amps();
    let y = a[0];
    for (let n = 1; n <= 4; n++) {
      y += a[n] * Math.sin(n * x);
    }
    return y;
  }

  sumPath(): string {
    let path = '';
    for (let i = 0; i <= 300; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 300;
      const y = -this.evalSum(x);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${y.toFixed(4)}`;
    }
    return path;
  }

  componentPath(n: number): string {
    const a = this.amps()[n];
    let path = '';
    for (let i = 0; i <= 300; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 300;
      const y = -(a * Math.sin(n * x));
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${y.toFixed(4)}`;
    }
    return path;
  }
}
