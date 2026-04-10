import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { fourierCoeffs, fourierEval, l2Norm, sampleFn } from './analysis-ch12-util';

interface Preset { name: string; fn: (x: number) => number; }

const PRESETS: Preset[] = [
  { name: '方波', fn: (x) => x < 0.5 ? 1 : -1 },
  { name: '鋸齒波', fn: (x) => 2 * x - 1 },
  { name: '三角波', fn: (x) => x < 0.5 ? 4 * x - 1 : 3 - 4 * x },
];

@Component({
  selector: 'app-step-fourier-expansion',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正交基底與 Fourier 展開" subtitle="§12.3">
      <p>
        L²[0,1] 有一組<strong>正交基底</strong>：1, √2 cos(2πnx), √2 sin(2πnx)。
        任何 f ∈ L² 都能展開：
      </p>
      <p class="formula">f = a₀/2 + Σ(aₙ cos 2πnx + bₙ sin 2πnx)</p>
      <p>
        <strong>Parseval 等式</strong>：||f||² = a₀²/4 + Σ(aₙ² + bₙ²)/2。
        能量守恆——時域的能量 = 頻域的能量。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 N 看 Fourier 部分和怎麼逼近原函數">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="select(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">N = {{ nTerms() }}</span>
          <input type="range" min="1" max="20" step="1" [value]="nTerms()"
                 (input)="nTerms.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 220" class="four-svg">
        <line x1="40" y1="110" x2="500" y2="110" stroke="var(--border)" stroke-width="0.5" />
        <line x1="40" y1="10" x2="40" y2="210" stroke="var(--border)" stroke-width="0.8" />

        <!-- Original -->
        <path [attr.d]="fPath()" fill="none" stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="4 3" />

        <!-- Fourier partial sum -->
        <path [attr.d]="fourierPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">||f − Sₙ||₂ = {{ errorNorm().toFixed(4) }}</div>
        <div class="r-card">N = {{ nTerms() }} 項</div>
      </div>

      <div class="legend">
        <span><span class="dot green"></span>原始函數</span>
        <span><span class="dot accent"></span>Fourier 部分和 Sₙ</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Fourier 展開就是<strong>L² 裡的正交投影</strong>——跟線代 Ch12 的傅立葉級數一樣，
        但現在有了 Lebesgue 積分做後盾，收斂是在 L² 範數意義下。
      </p>
      <p>下一節看<strong>正交補</strong>和直和分解。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 120px; accent-color: var(--accent); }
    .four-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .result-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px;
      font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text); }
    .legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.green { background: #5a8a5a; } &.accent { background: var(--accent); } }
  `,
})
export class StepFourierExpansionComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly nTerms = signal(5);

  private readonly curFn = computed(() => PRESETS[this.selIdx()].fn);
  private readonly coeffs = computed(() => fourierCoeffs(this.curFn(), 20));

  readonly errorNorm = computed(() => {
    const f = this.curFn();
    const c = this.coeffs();
    const N = this.nTerms();
    return l2Norm((x) => f(x) - fourierEval(c, x, N));
  });

  select(i: number): void { this.selIdx.set(i); }

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 110 - y * 80; }

  fPath(): string {
    const pts = sampleFn(this.curFn(), 0, 1, 300);
    // Break at discontinuities
    const segs: string[] = [];
    let prev: { x: number; y: number } | null = null;
    for (const p of pts) {
      if (!prev || Math.abs(p.y - prev.y) > 1) segs.push(`M${this.fx(p.x)},${this.fy(p.y)}`);
      else segs.push(`L${this.fx(p.x)},${this.fy(p.y)}`);
      prev = p;
    }
    return segs.join('');
  }

  fourierPath(): string {
    const c = this.coeffs(), N = this.nTerms();
    const pts = sampleFn((x) => fourierEval(c, x, N), 0, 1, 300);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
