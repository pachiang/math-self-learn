import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-improper-2d',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="多維瑕積分" subtitle="§14.8">
      <p>
        一維的瑕積分推廣到多維：積分區域無界或被積函數無界。
      </p>
      <p class="formula">∬ₘ² e^(−x²−y²) dA = π</p>
      <p>
        經典的 <strong>Gauss 積分</strong>：一維算不出 ∫e^(−x²)dx 的封閉形式，
        但二維用極座標可以！這就是 √π 的來歷。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動截斷半徑 R，看積分如何收斂到 π">
      <div class="ctrl-row">
        <span class="cl">R = {{ R().toFixed(1) }}</span>
        <input type="range" min="0.5" max="5" step="0.1" [value]="R()"
               (input)="R.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-0.1 -0.2 6.2 3.8" class="conv-svg">
        <!-- Axes -->
        <line x1="0" y1="3.4" x2="5.5" y2="3.4" stroke="var(--border)" stroke-width="0.02" />
        <line x1="0" y1="0" x2="0" y2="3.4" stroke="var(--border)" stroke-width="0.02" />

        <!-- π reference line -->
        <line x1="0" [attr.y1]="3.4 - piScale" x2="5.5" [attr.y2]="3.4 - piScale"
              stroke="var(--accent)" stroke-width="0.015" stroke-dasharray="0.08 0.05" />
        <text x="5.6" [attr.y]="3.4 - piScale + 0.08" fill="var(--accent)" font-size="0.18">π</text>

        <!-- Convergence curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="0.04" />

        <!-- Current point -->
        <circle [attr.cx]="R() * xScale" [attr.cy]="3.4 - integralAtR() * yScale"
                r="0.08" fill="#bf6e6e" stroke="white" stroke-width="0.02" />

        <!-- Labels -->
        <text x="2.7" y="3.7" text-anchor="middle" fill="var(--text-muted)" font-size="0.17">截斷半徑 R</text>
      </svg>

      <div class="info-row">
        <div class="i-card">∬(|x|≤R) e^(−r²) dA = {{ integralAtR().toFixed(6) }}</div>
        <div class="i-card accent">誤差 = {{ (Math.PI - integralAtR()).toExponential(3) }}</div>
      </div>

      <div class="derivation">
        <p><strong>推導</strong>：極座標 → ∫₀²π∫₀ᴿ e^(−r²)·r dr dθ = 2π · [−½e^(−r²)]₀ᴿ = π(1 − e^(−R²))</p>
        <p>R → ∞ 時 → <strong>π</strong>。因此 ∫₋∞^∞ e^(−x²) dx = √π。</p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Gauss 積分是概率論、統計、物理的基石。正態分佈的歸一化常數 1/√(2π) 就來自這裡。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .conv-svg { width: 100%; max-width: 450px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .info-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
    .derivation { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 13px; font-family: 'JetBrains Mono', monospace; }
    .derivation p { margin: 4px 0; }
    .derivation strong { color: var(--accent); }
  `,
})
export class StepImproper2dComponent {
  readonly Math = Math;
  readonly R = signal(2.0);
  readonly xScale = 1.0;
  readonly yScale = 1.0;
  readonly piScale = Math.PI * this.yScale;

  readonly integralAtR = computed(() => {
    const r = this.R();
    return Math.PI * (1 - Math.exp(-r * r));
  });

  curvePath(): string {
    let path = '';
    for (let i = 0; i <= 100; i++) {
      const r = (i / 100) * 5;
      const val = Math.PI * (1 - Math.exp(-r * r));
      const x = r * this.xScale;
      const y = 3.4 - val * this.yScale;
      path += (i === 0 ? 'M' : 'L') + `${x},${y}`;
    }
    return path;
  }
}
