import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch10-util';

@Component({
  selector: 'app-step-mct',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="單調收斂定理 (MCT)" subtitle="§10.4">
      <p>Lebesgue 積分的第一個收斂定理：</p>
      <p class="formula axiom">
        如果 0 ≤ f₁ ≤ f₂ ≤ … 且 fₙ → f 逐點，那麼<br />
        <strong>lim ∫ fₙ = ∫ lim fₙ = ∫ f</strong>
      </p>
      <p>
        注意：只需要<strong>逐點收斂 + 單調</strong>，不需要均勻收斂！
        這比 Riemann 積分的條件弱得多。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="fₙ(x) = min(n·x, 1)：單調遞增收斂到 1，積分也收斂">
      <div class="n-ctrl">
        <span class="nl">n = {{ nVal() }}</span>
        <input type="range" min="1" max="20" step="1" [value]="nVal()"
               (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 200" class="mct-svg">
        <line x1="40" y1="170" x2="500" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" stroke-width="0.8" />

        <!-- Limit function f = 1 on (0,1] -->
        <line x1="40" [attr.y1]="fy(1)" x2="500" [attr.y2]="fy(1)"
              stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />

        <!-- Ghost curves for previous n values (showing monotone increase) -->
        @for (ghost of ghostCurves(); track ghost.n) {
          <path [attr.d]="ghostPath(ghost.n)" fill="none"
                stroke="var(--accent)" [attr.stroke-opacity]="ghost.opacity" stroke-width="1" />
        }

        <!-- Shaded area under fₙ -->
        <path [attr.d]="areaPath()" fill="var(--accent)" fill-opacity="0.12" />

        <!-- fₙ curve (current) -->
        <path [attr.d]="fnPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <text x="490" [attr.y]="fy(1) - 5" class="lim-label">f = 1</text>
        <text x="490" [attr.y]="fy(fn(nVal(), 0.95)) + 12" class="fn-label">f{{ nVal() }}</text>
      </svg>

      <div class="result-row">
        <div class="r-card">∫ fₙ = {{ integralVal().toFixed(4) }}</div>
        <div class="r-card ok">∫ f = 1.0000</div>
        <div class="r-card">差距 = {{ (1 - integralVal()).toExponential(2) }}</div>
      </div>

      <!-- Convergence bar -->
      <div class="conv-bar">
        <div class="conv-fill" [style.width.%]="integralVal() * 100"></div>
        <span class="conv-label">∫fₙ → ∫f</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>MCT 是 Lebesgue 理論的基石。下一節看它的一個重要推論——<strong>Fatou 引理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } strong { color: var(--text); } }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .mct-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .lim-label { font-size: 9px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .fn-label { font-size: 9px; fill: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .conv-bar { position: relative; height: 16px; background: var(--bg); border: 1px solid var(--border);
      border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
    .conv-fill { height: 100%; background: var(--accent); opacity: 0.4; transition: width 0.2s; }
    .conv-label { position: absolute; top: 1px; left: 50%; transform: translateX(-50%);
      font-size: 10px; font-weight: 600; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepMctComponent {
  readonly nVal = signal(5);

  // fₙ(x) = min(n*x, 1) on [0, 1]
  fn(n: number, x: number): number { return Math.min(n * x, 1); }

  readonly ghostCurves = computed(() => {
    const current = this.nVal();
    const result: { n: number; opacity: number }[] = [];
    for (let n = 1; n < current; n++) {
      result.push({ n, opacity: 0.1 + 0.15 * (n / current) });
    }
    return result;
  });

  ghostPath(n: number): string {
    const pts: string[] = [];
    for (let x = 0; x <= 1; x += 0.005) pts.push(`${this.fx(x)},${this.fy(this.fn(n, x))}`);
    return 'M' + pts.join('L');
  }

  readonly integralVal = computed(() => {
    const n = this.nVal();
    // ∫₀¹ min(nx, 1) dx = ∫₀^(1/n) nx dx + ∫_(1/n)^1 1 dx = 1/(2n) + (1 - 1/n) = 1 - 1/(2n)
    return 1 - 1 / (2 * n);
  });

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 170 - y * 155; }

  fnPath(): string {
    const n = this.nVal();
    const pts: string[] = [];
    for (let x = 0; x <= 1; x += 0.005) pts.push(`${this.fx(x)},${this.fy(this.fn(n, x))}`);
    return 'M' + pts.join('L');
  }

  areaPath(): string {
    const n = this.nVal();
    let d = `M${this.fx(0)},${this.fy(0)}`;
    for (let x = 0; x <= 1; x += 0.005) d += `L${this.fx(x)},${this.fy(this.fn(n, x))}`;
    d += `L${this.fx(1)},${this.fy(0)}Z`;
    return d;
  }
}
