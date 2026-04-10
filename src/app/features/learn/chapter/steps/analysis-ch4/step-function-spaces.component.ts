import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-function-spaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="連續函數空間" subtitle="§4.8">
      <p>
        所有在 [a,b] 上連續的函數組成一個集合 C[a,b]。
        它本身是一個<strong>向量空間</strong>（加法、純量乘法保持連續性）。
      </p>
      <p>
        定義<strong>sup 範數</strong>：‖f‖ = sup|f(x)| over [a,b]。
        這量的是函數的「最大偏差」。
      </p>
      <p class="formula">sup 範數收斂 = 均勻收斂</p>
      <p>
        關鍵事實：<strong>連續函數的均勻極限仍然連續</strong>，
        但逐點極限可以不連續。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="fₙ(x) = xⁿ on [0,1]：逐點收斂到不連續的極限">
      <div class="n-ctrl">
        <span class="nl">n = {{ nVal() }}</span>
        <input type="range" min="1" max="30" step="1" [value]="nVal()"
               (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 500 260" class="fs-svg">
        <line x1="50" y1="210" x2="450" y2="210" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="210" stroke="var(--border)" stroke-width="0.8" />
        <text x="450" y="225" class="ax">x</text>
        <text x="35" y="25" class="ax">y</text>

        <!-- Pointwise limit (step function) -->
        <line x1="50" [attr.y1]="fy(0)" x2="440" [attr.y2]="fy(0)"
              stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="4 3" />
        <circle cx="450" [attr.cy]="fy(1)" r="4" fill="#a05a5a" />
        <text x="455" [attr.y]="fy(1) + 4" class="lim-note">逐點極限</text>

        <!-- x^n curves for a few values -->
        @for (k of [1, 2, 5]; track k) {
          @if (k < nVal()) {
            <path [attr.d]="powerPath(k)" fill="none" stroke="var(--text-muted)"
                  stroke-width="0.8" stroke-opacity="0.3" />
          }
        }

        <!-- Current x^n -->
        <path [attr.d]="powerPath(nVal())" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="info-grid">
        <div class="info-card">
          <div class="ic-label">每個 fₙ(x) = xⁿ</div>
          <div class="ic-val ok">連續 ✓</div>
        </div>
        <div class="info-card">
          <div class="ic-label">逐點極限 f(x)</div>
          <div class="ic-val bad">不連續 ✗（在 x=1 跳躍）</div>
        </div>
        <div class="info-card">
          <div class="ic-label">‖fₙ − f‖_sup</div>
          <div class="ic-val">= 1（不趨向 0）→ 不是均勻收斂</div>
        </div>
      </div>

      <div class="moral">
        逐點收斂可以破壞連續性。<strong>均勻收斂</strong>才能保持連續性。
        這就是 sup 範數的意義。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節用心智圖把第四章總結。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .fs-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .ax { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .lim-note { font-size: 8px; fill: #a05a5a; font-family: 'JetBrains Mono', monospace; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
    .info-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .ic-label { font-size: 11px; color: var(--text-muted); }
    .ic-val { font-size: 12px; font-weight: 700; margin-top: 2px;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }
    .moral { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 8px;
      strong { color: var(--accent); } }
  `,
})
export class StepFunctionSpacesComponent {
  readonly nVal = signal(3);

  fx(x: number): number { return 50 + x * 400; }
  fy(y: number): number { return 210 - y * 190; }

  powerPath(n: number): string {
    const pts: string[] = [];
    for (let x = 0; x <= 1; x += 0.005) {
      pts.push(`${this.fx(x)},${this.fy(Math.pow(x, n))}`);
    }
    return 'M' + pts.join('L');
  }
}
