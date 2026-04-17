import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { WAVE_FUNCTIONS, fourierCoeffs, fourierPartialSum, sampleWave } from './analysis-ch17-util';

@Component({
  selector: 'app-step-partial-sums',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="部分和逼近" subtitle="§17.3">
      <p>
        Fourier <strong>部分和</strong> Sₙ(x) = a₀ + Σ(k=1..N) (aₖ cos kx + bₖ sin kx)。
      </p>
      <p>
        N 越大，逼近越好。但在不連續點附近會有<strong>超調</strong>——這就是 Gibbs 現象（下一節詳述）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 N 看部分和如何逐漸逼近原始波形">
      <div class="fn-tabs">
        @for (w of waves; track w.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ w.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">N = {{ N() }}</span>
        <input type="range" min="1" max="50" step="1" [value]="N()"
               (input)="N.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg [attr.viewBox]="'-3.5 -1.8 7 3.6'" class="wave-svg">
        <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="var(--border)" stroke-width="0.015" />
        <line x1="0" y1="-1.8" x2="0" y2="1.8" stroke="var(--border)" stroke-width="0.015" />

        <!-- Original function -->
        <path [attr.d]="originalPath()" fill="none" stroke="var(--text-muted)" stroke-width="0.02"
              stroke-dasharray="0.06 0.04" />

        <!-- Partial sum -->
        <path [attr.d]="partialSumPath()" fill="none" stroke="var(--accent)" stroke-width="0.035" />
      </svg>

      <div class="legend">
        <span><span class="dot muted"></span>f(x) 原函數</span>
        <span><span class="dot accent"></span>Sₙ(x) 部分和 (N={{ N() }})</span>
      </div>

      <div class="info-row">
        <div class="i-card">使用 {{ 2 * N() + 1 }} 個頻率</div>
        <div class="i-card accent">L² 誤差 ≈ {{ l2Error().toFixed(6) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        N = 1 只用最低頻率，大致形狀；N = 50 已經非常精確。
        但注意方波的不連續處始終有「小角」——這不是 bug，而是 Fourier 的根本限制。
      </p>
    </app-prose-block>
  `,
  styles: `
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .wave-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .legend { display: flex; gap: 14px; justify-content: center; margin-bottom: 10px; font-size: 12px; color: var(--text-muted); }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px;
      &.muted { background: var(--text-muted); } &.accent { background: var(--accent); } }
    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepPartialSumsComponent {
  readonly waves = WAVE_FUNCTIONS;
  readonly sel = signal(0);
  readonly N = signal(5);

  private readonly coeffsCache = computed(() => {
    const w = WAVE_FUNCTIONS[this.sel()];
    return fourierCoeffs(w.fn, 50);
  });

  readonly l2Error = computed(() => {
    const w = WAVE_FUNCTIONS[this.sel()];
    const c = this.coeffsCache();
    const n = this.N();
    const samples = 500;
    const dx = (2 * Math.PI) / samples;
    let errSq = 0;
    for (let i = 0; i < samples; i++) {
      const x = -Math.PI + (i + 0.5) * dx;
      const diff = w.fn(x) - fourierPartialSum(x, c, n);
      errSq += diff * diff * dx;
    }
    return Math.sqrt(errSq);
  });

  originalPath(): string {
    const w = WAVE_FUNCTIONS[this.sel()];
    const pts = sampleWave(w.fn, -Math.PI, Math.PI, 500);
    return 'M' + pts.map(p => `${p.x.toFixed(4)},${(-p.y).toFixed(4)}`).join('L');
  }

  partialSumPath(): string {
    const c = this.coeffsCache();
    const n = this.N();
    let path = '';
    for (let i = 0; i <= 500; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 500;
      const y = -fourierPartialSum(x, c, n);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${y.toFixed(4)}`;
    }
    return path;
  }
}
