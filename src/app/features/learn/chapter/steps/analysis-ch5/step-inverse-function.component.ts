import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch5-util';

@Component({
  selector: 'app-step-inverse-function',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="反函數定理" subtitle="§5.8">
      <p>
        如果 f 在 x₀ 可微且 <strong>f'(x₀) ≠ 0</strong>，那麼 f 在 x₀ 附近有<strong>反函數</strong>，
        而且反函數也可微：
      </p>
      <p class="formula">(f⁻¹)'(y₀) = 1 / f'(x₀)，其中 y₀ = f(x₀)</p>
      <p>
        幾何意義：把圖形關於 y = x 做鏡射。如果原函數切線斜率 m，
        反函數切線斜率就是 1/m。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看 f 和 f⁻¹ 的圖——關於 y = x 的鏡射，切線斜率互為倒數">
      <div class="ctrl-row">
        <span class="cl">x₀ = {{ x0().toFixed(2) }}</span>
        <input type="range" min="0.2" max="2.5" step="0.05" [value]="x0()"
               (input)="x0.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 400 400" class="inv-svg">
        <!-- y = x line -->
        <line x1="0" y1="400" x2="400" y2="0" stroke="var(--border)" stroke-width="1" stroke-dasharray="5 5" />

        <!-- Axes -->
        <line x1="40" y1="360" x2="380" y2="360" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="20" x2="40" y2="360" stroke="var(--border)" stroke-width="0.8" />

        <!-- f(x) = x² curve -->
        <path [attr.d]="fPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- f⁻¹(x) = √x curve (mirror) -->
        <path [attr.d]="finvPath()" fill="none" stroke="#5a8a5a" stroke-width="2.5" />

        <!-- Tangent at x₀ on f -->
        <line [attr.x1]="sx(x0() - 1)" [attr.y1]="sy(fTangent(x0() - 1))"
              [attr.x2]="sx(x0() + 1)" [attr.y2]="sy(fTangent(x0() + 1))"
              stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.5" />

        <!-- Tangent at y₀ on f⁻¹ -->
        <line [attr.x1]="sx(y0() - 1)" [attr.y1]="sy(finvTangent(y0() - 1))"
              [attr.x2]="sx(y0() + 1)" [attr.y2]="sy(finvTangent(y0() + 1))"
              stroke="#5a8a5a" stroke-width="1.5" stroke-opacity="0.5" />

        <!-- Points -->
        <circle [attr.cx]="sx(x0())" [attr.cy]="sy(y0())" r="5"
                fill="var(--accent)" stroke="white" stroke-width="1.5" />
        <circle [attr.cx]="sx(y0())" [attr.cy]="sy(x0())" r="5"
                fill="#5a8a5a" stroke="white" stroke-width="1.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">f'(x₀) = {{ fDeriv().toFixed(3) }}</div>
        <div class="r-card ok">(f⁻¹)'(y₀) = 1/f'(x₀) = {{ invDeriv().toFixed(3) }}</div>
      </div>

      <div class="legend">
        <span><span class="dot accent"></span>f(x) = x²</span>
        <span><span class="dot green"></span>f⁻¹(y) = √y</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節用心智圖把整個微分章串起來。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .inv-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .result-row { display: flex; gap: 10px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .legend { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); justify-content: center; }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.accent { background: var(--accent); } &.green { background: #5a8a5a; } }
  `,
})
export class StepInverseFunctionComponent {
  readonly x0 = signal(1.5);
  readonly y0 = computed(() => this.x0() * this.x0()); // f(x) = x²
  readonly fDeriv = computed(() => 2 * this.x0()); // f'(x) = 2x
  readonly invDeriv = computed(() => 1 / this.fDeriv()); // (f⁻¹)'(y₀) = 1/f'(x₀)

  sx(x: number): number { return 40 + (x / 4) * 340; }
  sy(y: number): number { return 360 - (y / 4) * 340; }

  fTangent(x: number): number { return this.y0() + this.fDeriv() * (x - this.x0()); }
  finvTangent(y: number): number { return this.x0() + this.invDeriv() * (y - this.y0()); }

  fPath(): string {
    const pts: string[] = [];
    for (let x = 0; x <= 2.8; x += 0.02) pts.push(`${this.sx(x)},${this.sy(x * x)}`);
    return 'M' + pts.join('L');
  }

  finvPath(): string {
    const pts: string[] = [];
    for (let y = 0; y <= 7; y += 0.02) pts.push(`${this.sx(y)},${this.sy(Math.sqrt(y))}`);
    return 'M' + pts.join('L');
  }
}
