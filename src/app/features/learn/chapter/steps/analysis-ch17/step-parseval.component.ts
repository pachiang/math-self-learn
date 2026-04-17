import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { WAVE_FUNCTIONS, fourierCoeffs, parsevalEnergy } from './analysis-ch17-util';

@Component({
  selector: 'app-step-parseval',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Parseval 等式" subtitle="§17.6">
      <p>
        <strong>Parseval 等式</strong>：時域的能量 = 頻域的能量。
      </p>
      <p class="formula">(1/π) ∫₋π^π |f(x)|² dx = 2a₀² + Σ(aₙ² + bₙ²)</p>
      <p>
        不管用什麼「語言」描述 f（原函數 or Fourier 係數），能量守恆。
        這是 L² 空間中 Pythagoras 定理的推廣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 N 看能量如何從頻域係數累積到時域能量">
      <div class="fn-tabs">
        @for (w of waves; track w.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ w.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">N = {{ N() }}</span>
        <input type="range" min="1" max="40" step="1" [value]="N()"
               (input)="N.set(+($any($event.target)).value)" class="sl" />
      </div>

      <div class="energy-viz">
        <div class="bar-container">
          <div class="bar-label">時域能量</div>
          <div class="bar-track">
            <div class="bar-fill time" [style.width.%]="100"></div>
          </div>
          <div class="bar-val">{{ timeEnergy().toFixed(4) }}</div>
        </div>
        <div class="bar-container">
          <div class="bar-label">頻域 (N={{ N() }})</div>
          <div class="bar-track">
            <div class="bar-fill freq" [style.width.%]="freqPct()"></div>
          </div>
          <div class="bar-val">{{ freqEnergy().toFixed(4) }}</div>
        </div>
      </div>

      <div class="pct-display">
        頻域已捕捉 <strong>{{ freqPct().toFixed(1) }}%</strong> 的能量
      </div>

      <!-- Spectrum bars -->
      <svg viewBox="-0.5 -0.3 21 1.5" class="spec-svg">
        @for (bar of specBars(); track bar.n) {
          <rect [attr.x]="bar.n * 0.5 - 0.15" [attr.y]="1 - bar.height"
                width="0.3" [attr.height]="bar.height"
                [attr.fill]="bar.n <= N() ? 'var(--accent)' : 'var(--border)'" rx="0.05" />
        }
        <line x1="0" y1="1" x2="20" y2="1" stroke="var(--border)" stroke-width="0.02" />
      </svg>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意：只要 N ≈ 10~20，已經捕捉到 &gt;95% 的能量。
        這就是<strong>頻譜壓縮</strong>的原理——JPEG 和 MP3 就是丟掉高頻的小係數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .cl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .energy-viz { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
    .bar-container { display: flex; align-items: center; gap: 8px; }
    .bar-label { font-size: 12px; color: var(--text-muted); min-width: 90px; font-family: 'JetBrains Mono', monospace; }
    .bar-track { flex: 1; height: 20px; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; transition: width 0.2s;
      &.time { background: var(--text-muted); opacity: 0.4; }
      &.freq { background: var(--accent); opacity: 0.6; } }
    .bar-val { font-size: 12px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; text-align: right; }
    .pct-display { text-align: center; font-size: 14px; color: var(--text-muted); margin-bottom: 12px; }
    .pct-display strong { color: var(--accent); font-size: 16px; }
    .spec-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
  `,
})
export class StepParsevalComponent {
  readonly waves = WAVE_FUNCTIONS;
  readonly sel = signal(0);
  readonly N = signal(10);

  private readonly coeffs = computed(() => fourierCoeffs(WAVE_FUNCTIONS[this.sel()].fn, 40));

  readonly timeEnergy = computed(() => {
    const w = WAVE_FUNCTIONS[this.sel()];
    const samples = 500;
    const dx = (2 * Math.PI) / samples;
    let sum = 0;
    for (let i = 0; i < samples; i++) {
      const x = -Math.PI + (i + 0.5) * dx;
      const v = w.fn(x);
      sum += v * v * dx;
    }
    return sum / Math.PI;
  });

  readonly freqEnergy = computed(() => {
    return parsevalEnergy(this.coeffs(), this.N()) / Math.PI;
  });

  readonly freqPct = computed(() => {
    const te = this.timeEnergy();
    return te > 0 ? (this.freqEnergy() / te) * 100 : 0;
  });

  readonly specBars = computed(() => {
    const c = this.coeffs();
    const bars: { n: number; height: number }[] = [];
    const maxE = Math.max(
      ...c.an.map((a, i) => a * a + c.bn[i] * c.bn[i]),
      0.01,
    );
    for (let n = 1; n <= 40; n++) {
      const e = c.an[n - 1] * c.an[n - 1] + c.bn[n - 1] * c.bn[n - 1];
      bars.push({ n, height: Math.min(1, (e / maxE) * 0.9) });
    }
    return bars;
  });
}
