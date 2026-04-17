import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pulse {
  name: string;
  fn: (t: number) => number;
  ft: (w: number) => number; // magnitude of Fourier transform
  formula: string;
}

const PULSES: Pulse[] = [
  {
    name: '高斯',
    fn: (t) => Math.exp(-t * t),
    ft: (w) => Math.sqrt(Math.PI) * Math.exp(-w * w / 4),
    formula: 'e^(−t²) ↔ √π·e^(−ω²/4)',
  },
  {
    name: '矩形脈衝',
    fn: (t) => Math.abs(t) <= 1 ? 1 : 0,
    ft: (w) => Math.abs(w) < 0.01 ? 2 : 2 * Math.sin(w) / w,
    formula: 'rect(t) ↔ 2 sinc(ω)',
  },
  {
    name: '指數衰減',
    fn: (t) => t >= 0 ? Math.exp(-t) : 0,
    ft: (w) => 1 / Math.sqrt(1 + w * w),
    formula: 'e^(−t)u(t) ↔ 1/(1+iω)',
  },
];

@Component({
  selector: 'app-step-fourier-transform',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fourier 變換" subtitle="§17.7">
      <p>
        Fourier 級數處理<strong>周期函數</strong>。非周期函數呢？
        讓週期 T → ∞，級數變成<strong>積分</strong>：
      </p>
      <p class="formula">F̂(ω) = ∫₋∞^∞ f(t) e^(−iωt) dt</p>
      <p>
        Fourier 變換把「時域」映射到「頻域」——函數空間上的同構。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選信號，同時看時域和頻域的對偶關係">
      <div class="fn-tabs">
        @for (p of pulses; track p.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="dual-panel">
        <div class="panel">
          <div class="panel-title">時域 f(t)</div>
          <svg viewBox="-5 -0.3 10 1.5" class="panel-svg">
            <line x1="-5" y1="1.1" x2="5" y2="1.1" stroke="var(--border)" stroke-width="0.02" />
            <line x1="0" y1="0" x2="0" y2="1.2" stroke="var(--border)" stroke-width="0.02" />
            <path [attr.d]="timePath()" fill="none" stroke="var(--accent)" stroke-width="0.04" />
          </svg>
        </div>
        <div class="arrow">⇄</div>
        <div class="panel">
          <div class="panel-title">頻域 |F̂(ω)|</div>
          <svg viewBox="-5 -0.3 10 1.5" class="panel-svg">
            <line x1="-5" y1="1.1" x2="5" y2="1.1" stroke="var(--border)" stroke-width="0.02" />
            <line x1="0" y1="0" x2="0" y2="1.2" stroke="var(--border)" stroke-width="0.02" />
            <path [attr.d]="freqPath()" fill="none" stroke="#bf8a5a" stroke-width="0.04" />
          </svg>
        </div>
      </div>

      <div class="formula-display">{{ currentPulse().formula }}</div>

      <div class="duality-note">
        <strong>時域窄 ↔ 頻域寬</strong>（不確定性原理）：
        信號越「尖」，需要越多頻率成分。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        高斯函數的 Fourier 變換仍是高斯——它是 Fourier 變換的<strong>不動點</strong>。
        這也是量子力學中不確定性原理的數學根源。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .dual-panel { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .panel { flex: 1; }
    .panel-title { text-align: center; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .panel-svg { width: 100%; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .arrow { font-size: 20px; color: var(--accent); font-weight: 700; }
    .formula-display { text-align: center; padding: 10px; border-radius: 8px; background: var(--accent-10);
      font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--accent); font-weight: 600; margin-bottom: 10px; }
    .duality-note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 13px; text-align: center; color: var(--text-muted); }
    .duality-note strong { color: var(--accent); }
  `,
})
export class StepFourierTransformComponent {
  readonly pulses = PULSES;
  readonly sel = signal(0);
  readonly currentPulse = computed(() => PULSES[this.sel()]);

  timePath(): string {
    const p = this.currentPulse();
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const t = -5 + (10 * i) / 400;
      const y = 1.1 - p.fn(t) * 0.9;
      path += (i === 0 ? 'M' : 'L') + `${t.toFixed(3)},${y.toFixed(3)}`;
    }
    return path;
  }

  freqPath(): string {
    const p = this.currentPulse();
    const maxFt = p.ft(0) || 1;
    let path = '';
    for (let i = 0; i <= 400; i++) {
      const w = -5 + (10 * i) / 400;
      const y = 1.1 - (Math.abs(p.ft(w)) / maxFt) * 0.9;
      path += (i === 0 ? 'M' : 'L') + `${w.toFixed(3)},${y.toFixed(3)}`;
    }
    return path;
  }
}
