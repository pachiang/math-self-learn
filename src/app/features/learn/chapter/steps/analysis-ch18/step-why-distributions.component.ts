import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { gaussianDelta, heaviside, heavisideSmooth, samplePath } from './analysis-ch18-util';

@Component({
  selector: 'app-step-why-distributions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼需要廣義函數" subtitle="§18.1">
      <p>
        物理學家一直在用「Dirac delta 函數」δ(x)——
        它在 x=0 處「無限高」，其餘為零，但積分等於 1。
      </p>
      <p>
        問題：<strong>這不是函數</strong>。沒有任何函數 f 能滿足 f(x)=0 (x≠0) 且 ∫f=1。
      </p>
      <p>
        同樣，Heaviside 階梯函數 H(x) 在 x=0 處不可微，但物理上我們想要 H' = δ。
        <strong>廣義函數</strong>（distributions）讓這些都變成嚴格的數學。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 ε 看 Heaviside 的「平滑版導數」如何逼近 delta">
      <div class="ctrl-row">
        <span class="cl">ε = {{ eps().toFixed(3) }}</span>
        <input type="range" min="-2.5" max="0" step="0.05" [value]="epsLog()"
               (input)="epsLog.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 220" class="intro-svg">
        <line x1="40" y1="180" x2="460" y2="180" stroke="var(--border)" stroke-width="0.8" />
        <line x1="250" y1="10" x2="250" y2="180" stroke="var(--border)" stroke-width="0.5" />

        <!-- Heaviside (dashed) -->
        <path [attr.d]="heavisidePath()" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="5 3" />

        <!-- Smooth Heaviside -->
        <path [attr.d]="smoothHPath()" fill="none" stroke="#5a8a5a" stroke-width="2" />

        <!-- Its derivative ≈ delta -->
        <path [attr.d]="deltaPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <text x="460" y="110" fill="var(--text-muted)" font-size="8">H(x)</text>
        <text x="460" y="80" fill="#5a8a5a" font-size="8">Hε(x)</text>
        <text x="270" y="25" fill="var(--accent)" font-size="8">H'ε ≈ δε</text>
      </svg>

      <div class="info-row">
        <div class="i-card">ε = {{ eps().toFixed(3) }}</div>
        <div class="i-card">峰高 ≈ {{ peakHeight().toFixed(1) }}</div>
        <div class="i-card accent">∫ δε = 1（始終為 1）</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        ε → 0 時，「導數」越來越尖但積分永遠是 1——這就是 delta「函數」。
        下一節正式定義它。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .intro-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 12px; }
    .info-row { display: flex; gap: 8px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepWhyDistributionsComponent {
  readonly epsLog = signal(-1);
  readonly eps = computed(() => Math.pow(10, this.epsLog()));
  readonly peakHeight = computed(() => gaussianDelta(0, this.eps()));

  heavisidePath(): string {
    return samplePath(heaviside, -3, 3, 80, 180, 70, 250);
  }
  smoothHPath(): string {
    const e = this.eps();
    return samplePath((x) => heavisideSmooth(x, e), -3, 3, 80, 180, 70, 250);
  }
  deltaPath(): string {
    const e = this.eps();
    return samplePath((x) => gaussianDelta(x, e), -3, 3, Math.min(80, 80 / (gaussianDelta(0, e) * 0.5)), 180, 70, 250);
  }
}
