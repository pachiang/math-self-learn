import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { samplePath, gaussianDelta } from './analysis-ch18-util';

@Component({
  selector: 'app-step-fourier-distributions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="分佈的 Fourier 變換" subtitle="§18.7">
      <p>
        在 S' 中，Fourier 變換有完美的定義：
      </p>
      <p class="formula">⟨F(T), φ⟩ = ⟨T, F(φ)⟩</p>
      <p>經典結果：</p>
      <ul>
        <li>F(δ) = 1 — delta 的頻譜是<strong>所有頻率等量</strong>（白噪音）</li>
        <li>F(1) = 2πδ — 常數函數只有零頻率</li>
        <li>F(e^(iωx)) = 2πδ(ξ−ω) — 純正弦波對應單一頻率</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="delta 的 Fourier 變換：時域的「尖峰」= 頻域的「平坦」">
      <div class="ctrl-row">
        <span class="cl">ε = {{ eps().toFixed(3) }}</span>
        <input type="range" min="-1.5" max="0" step="0.02" [value]="epsLog()"
               (input)="epsLog.set(+($any($event.target)).value)" class="sl" />
      </div>

      <div class="dual-panel">
        <div class="panel">
          <div class="panel-title">時域：δε(x)</div>
          <svg viewBox="0 0 220 130" class="panel-svg">
            <line x1="10" y1="110" x2="210" y2="110" stroke="var(--border)" stroke-width="0.5" />
            <line x1="110" y1="10" x2="110" y2="110" stroke="var(--border)" stroke-width="0.3" />
            <path [attr.d]="timePath()" fill="none" stroke="var(--accent)" stroke-width="2" />
          </svg>
          <div class="panel-note">越窄越高</div>
        </div>
        <div class="arrow">F ⇄</div>
        <div class="panel">
          <div class="panel-title">頻域：F(δε)(ξ)</div>
          <svg viewBox="0 0 220 130" class="panel-svg">
            <line x1="10" y1="110" x2="210" y2="110" stroke="var(--border)" stroke-width="0.5" />
            <line x1="110" y1="10" x2="110" y2="110" stroke="var(--border)" stroke-width="0.3" />
            <path [attr.d]="freqPath()" fill="none" stroke="#bf8a5a" stroke-width="2" />
            <!-- Reference: constant 1 -->
            <line x1="10" y1="30" x2="210" y2="30" stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="4 3" />
            <text x="205" y="25" fill="var(--text-muted)" font-size="6" text-anchor="end">1</text>
          </svg>
          <div class="panel-note">越寬越平 → 趨向常數 1</div>
        </div>
      </div>

      <div class="result">
        ε → 0 時：δε → δ，F(δε) → <strong>1</strong>（處處等於 1）
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        F(δ) = 1 是不確定性原理的極端情況：時域「完全集中」→ 頻域「完全展開」。
        反過來 F(1) = 2πδ：頻域完全集中在零頻率。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .dual-panel { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .panel { flex: 1; text-align: center; }
    .panel-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .panel-svg { width: 100%; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .panel-note { font-size: 10px; color: var(--text-muted); margin-top: 4px; }
    .arrow { font-size: 18px; font-weight: 700; color: var(--accent); }
    .result { padding: 12px; border-radius: 8px; background: var(--accent-10); border: 2px solid var(--accent);
      text-align: center; font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .result strong { color: var(--accent); font-size: 16px; }
  `,
})
export class StepFourierDistributionsComponent {
  readonly epsLog = signal(-0.3);
  readonly eps = computed(() => Math.pow(10, this.epsLog()));

  timePath(): string {
    const e = this.eps();
    const peak = gaussianDelta(0, e);
    const yScale = Math.min(80, 80 / (peak * 0.6));
    return samplePath((x) => gaussianDelta(x, e), -3, 3, yScale, 110, 33, 110);
  }

  freqPath(): string {
    const e = this.eps();
    // F(gaussian_ε) = exp(-ε²ξ²/2) — wider in freq as ε shrinks
    return samplePath((xi) => Math.exp(-e * e * xi * xi / 2), -3, 3, 80, 110, 33, 110);
  }
}
