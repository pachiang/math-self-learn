import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { fourierCoeffs, fourierPartialSum, WAVE_FUNCTIONS } from './analysis-ch17-util';

@Component({
  selector: 'app-step-applications-fourier',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="應用：壓縮與熱方程" subtitle="§17.9">
      <p>
        Fourier 分析的兩大經典應用：
      </p>
      <ul>
        <li><strong>信號壓縮</strong>：只保留最大的 K 個係數，丟掉其餘 → JPEG、MP3 的原理</li>
        <li><strong>熱方程</strong>：uₜ = uₓₓ → 每個 Fourier 模式以 e^(−n²t) 指數衰減</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="模擬：只保留 K 個最大係數的「壓縮」效果">
      <div class="ctrl-row">
        <span class="cl">保留 K = {{ K() }} 個係數</span>
        <input type="range" min="1" max="30" step="1" [value]="K()"
               (input)="K.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-3.5 -1.8 7 3.6" class="wave-svg">
        <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="var(--border)" stroke-width="0.015" />

        <!-- Original -->
        <path [attr.d]="originalPath()" fill="none" stroke="var(--text-muted)" stroke-width="0.02"
              stroke-dasharray="0.06 0.04" />

        <!-- Compressed -->
        <path [attr.d]="compressedPath()" fill="none" stroke="var(--accent)" stroke-width="0.035" />
      </svg>

      <div class="info-row">
        <div class="i-card">壓縮率 {{ compressionPct().toFixed(0) }}%</div>
        <div class="i-card accent">L² 誤差 {{ l2Error().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="模擬：熱方程讓初始方波逐漸「融化」">
      <div class="ctrl-row">
        <span class="cl">時間 t = {{ time().toFixed(3) }}</span>
        <input type="range" min="0" max="1" step="0.005" [value]="time()"
               (input)="time.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-3.5 -1.8 7 3.6" class="wave-svg">
        <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="var(--border)" stroke-width="0.015" />

        <!-- Initial condition -->
        <path [attr.d]="heatInitialPath()" fill="none" stroke="var(--text-muted)" stroke-width="0.02"
              stroke-dasharray="0.06 0.04" />

        <!-- Evolved -->
        <path [attr.d]="heatEvolvedPath()" fill="none" stroke="#bf8a5a" stroke-width="0.035" />
      </svg>

      <div class="heat-note">
        高頻衰減快（e^(−n²t)），低頻衰減慢 → 尖角先「圓掉」，整體形狀慢慢消散。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        壓縮說明了「少量係數就能代表大部分信息」；
        熱方程說明了「不同頻率以不同速率演化」。
        這兩個視角貫穿現代數學與工程。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 130px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .wave-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .info-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
    .heat-note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepApplicationsFourierComponent {
  readonly K = signal(5);
  readonly time = signal(0.02);

  private readonly squareFn = WAVE_FUNCTIONS[0].fn;
  private readonly fullCoeffs = fourierCoeffs(this.squareFn, 50);

  // --- Compression ---
  readonly compressionPct = computed(() => ((50 - this.K()) / 50) * 100);

  readonly l2Error = computed(() => {
    const k = this.K();
    const sorted = this.rankedIndices();
    const kept = new Set(sorted.slice(0, k));
    const samples = 400;
    const dx = (2 * Math.PI) / samples;
    let errSq = 0;
    for (let i = 0; i < samples; i++) {
      const x = -Math.PI + (i + 0.5) * dx;
      const orig = this.squareFn(x);
      const approx = this.evalCompressed(x, kept);
      const d = orig - approx;
      errSq += d * d * dx;
    }
    return Math.sqrt(errSq);
  });

  private rankedIndices(): number[] {
    const c = this.fullCoeffs;
    const energies: { idx: number; e: number }[] = [];
    for (let n = 0; n < c.an.length; n++) {
      energies.push({ idx: n, e: c.an[n] * c.an[n] + c.bn[n] * c.bn[n] });
    }
    energies.sort((a, b) => b.e - a.e);
    return energies.map(e => e.idx);
  }

  private evalCompressed(x: number, keptSet: Set<number>): number {
    const c = this.fullCoeffs;
    let sum = c.a0;
    for (let n = 0; n < c.an.length; n++) {
      if (keptSet.has(n)) {
        sum += c.an[n] * Math.cos((n + 1) * x) + c.bn[n] * Math.sin((n + 1) * x);
      }
    }
    return sum;
  }

  originalPath(): string {
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 400;
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${(-this.squareFn(x)).toFixed(4)}`;
    }
    return path;
  }

  compressedPath(): string {
    const k = this.K();
    const sorted = this.rankedIndices();
    const kept = new Set(sorted.slice(0, k));
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 400;
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${(-this.evalCompressed(x, kept)).toFixed(4)}`;
    }
    return path;
  }

  // --- Heat equation ---
  heatInitialPath(): string { return this.originalPath(); }

  heatEvolvedPath(): string {
    const c = this.fullCoeffs;
    const t = this.time();
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 400;
      let sum = c.a0;
      for (let n = 0; n < c.an.length; n++) {
        const decay = Math.exp(-((n + 1) * (n + 1)) * t);
        sum += (c.an[n] * Math.cos((n + 1) * x) + c.bn[n] * Math.sin((n + 1) * x)) * decay;
      }
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${(-sum).toFixed(4)}`;
    }
    return path;
  }
}
