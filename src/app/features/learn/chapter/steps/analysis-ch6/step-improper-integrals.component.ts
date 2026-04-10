import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { leftSum, sampleFn } from './analysis-ch6-util';

@Component({
  selector: 'app-step-improper-integrals',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="瑕積分" subtitle="§6.6">
      <p>
        Riemann 積分要求<strong>有界區間</strong>和<strong>有界函數</strong>。
        瑕積分處理兩種「越界」情形：
      </p>
      <ul>
        <li><strong>無窮區間</strong>：∫₁^∞ 1/x² dx = lim(b→∞) ∫₁ᵇ 1/x² dx = 1</li>
        <li><strong>無界函數</strong>：∫₀¹ 1/√x dx = lim(ε→0⁺) ∫ₑ¹ 1/√x dx = 2</li>
      </ul>
      <p>
        瑕積分收斂 ⟺ 極限存在且有限。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調上界 b → ∞ 看 ∫₁ᵇ 1/xᵖ dx 收斂還是發散">
      <div class="ctrl-row">
        <span class="cl">p = {{ p().toFixed(2) }}</span>
        <input type="range" min="0.3" max="3" step="0.05" [value]="p()"
               (input)="p.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">b = {{ bVal().toFixed(0) }}</span>
        <input type="range" min="2" max="100" step="1" [value]="bVal()"
               (input)="bVal.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 520 220" class="imp-svg">
        <line x1="40" y1="190" x2="500" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- Shaded area -->
        <path [attr.d]="areaPath()" fill="var(--accent)" fill-opacity="0.15" />

        <!-- Curve 1/x^p -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>

      <div class="result-row">
        <div class="r-card">∫₁ᵇ 1/xᵖ dx ≈ {{ integralVal().toFixed(6) }}</div>
        <div class="r-card" [class.conv]="p() > 1" [class.div]="p() <= 1">
          b → ∞：{{ p() > 1 ? '收斂到 ' + exactLimit() : '發散（→ ∞）' }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        跟 p 級數一樣：p > 1 收斂，p ≤ 1 發散。這不是巧合——
        積分判別法（Ch3）正是用瑕積分來判斷級數。
      </p>
      <p>下一節看積分和級數的交互——<strong>逐項積分</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .cl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .sl { width: 100px; accent-color: var(--accent); }
    .imp-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 10px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.conv { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.div { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepImproperIntegralsComponent {
  readonly p = signal(2.0);
  readonly bVal = signal(20);

  readonly integralVal = computed(() => {
    const pp = this.p(), b = this.bVal();
    if (Math.abs(pp - 1) < 0.01) return Math.log(b);
    return (1 / (pp - 1)) * (1 - Math.pow(b, 1 - pp));
  });

  readonly exactLimit = computed(() => {
    const pp = this.p();
    if (pp <= 1) return '∞';
    return (1 / (pp - 1)).toFixed(4);
  });

  fx(x: number): number { return 40 + Math.log(x) / Math.log(this.bVal()) * 460; }
  fy(y: number): number { return 190 - Math.min(y, 2) * 85; }

  curvePath(): string {
    const pp = this.p(), b = this.bVal();
    const pts: string[] = [];
    for (let x = 1; x <= b; x *= 1.02) {
      const y = 1 / Math.pow(x, pp);
      pts.push(`${this.fx(x)},${this.fy(y)}`);
    }
    return 'M' + pts.join('L');
  }

  areaPath(): string {
    const pp = this.p(), b = this.bVal();
    let d = `M${this.fx(1)},${this.fy(0)}`;
    for (let x = 1; x <= b; x *= 1.02) {
      d += `L${this.fx(x)},${this.fy(1 / Math.pow(x, pp))}`;
    }
    d += `L${this.fx(b)},${this.fy(0)}Z`;
    return d;
  }
}
