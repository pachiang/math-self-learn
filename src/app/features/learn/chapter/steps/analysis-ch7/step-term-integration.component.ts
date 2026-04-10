import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn, partialSumFn } from './analysis-ch7-util';

@Component({
  selector: 'app-step-term-integration',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="逐項積分" subtitle="§7.6">
      <p>
        <strong>定理</strong>：如果 Σfₙ 在 [a,b] 上<strong>均勻收斂</strong>到 f，
        且每個 fₙ 可積，那麼：
      </p>
      <p class="formula">∫ₐᵇ Σfₙ(x) dx = Σ ∫ₐᵇ fₙ(x) dx</p>
      <p>
        「先加再積 = 先積再加」。均勻收斂保證交換是安全的。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="用 ln(1+x) = Σ(-1)ⁿ⁺¹xⁿ/n 來算 ∫₀¹ ln(1+x) dx">
      <div class="n-ctrl">
        <span class="nl">取前 N = {{ nVal() }} 項</span>
        <input type="range" min="1" max="20" step="1" [value]="nVal()"
               (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <div class="calc-steps">
        <div class="cs-card">
          <div class="cs-title">直接算（精確值）</div>
          <div class="cs-formula">∫₀¹ ln(1+x) dx = 2ln2 − 1 ≈ {{ exact.toFixed(8) }}</div>
        </div>

        <div class="cs-card">
          <div class="cs-title">逐項積分（N = {{ nVal() }}）</div>
          <div class="cs-formula">
            Σ ∫₀¹ (-1)ⁿ⁺¹xⁿ/n dx = Σ (-1)ⁿ⁺¹/(n(n+1))
          </div>
          <div class="cs-result">≈ {{ termByTermSum().toFixed(8) }}</div>
        </div>

        <div class="cs-card err">
          <div class="cs-title">誤差</div>
          <div class="cs-result">|差| = {{ Math.abs(exact - termByTermSum()).toExponential(2) }}</div>
        </div>
      </div>

      <svg viewBox="0 0 500 200" class="ti-svg">
        <line x1="40" y1="160" x2="460" y2="160" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="160" stroke="var(--border)" stroke-width="0.8" />

        <!-- ln(1+x) -->
        <path [attr.d]="lnPath()" fill="none" stroke="#5a8a5a" stroke-width="2" />

        <!-- Partial sum -->
        <path [attr.d]="partialPath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Shaded area difference -->
      </svg>

      <div class="legend">
        <span><span class="dot green"></span>ln(1+x)</span>
        <span><span class="dot accent"></span>Sₙ(x)（前 N 項）</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看冪級數為什麼是「最乖」的函數——<strong>無限可微</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .calc-steps { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .cs-card { flex: 1; min-width: 120px; padding: 10px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface);
      &.err { background: rgba(200,152,59,0.06); } }
    .cs-title { font-size: 11px; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
    .cs-formula { font-size: 11px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .cs-result { font-size: 14px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px; }
    .ti-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .legend { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.green { background: #5a8a5a; } &.accent { background: var(--accent); } }
  `,
})
export class StepTermIntegrationComponent {
  readonly Math = Math;
  readonly nVal = signal(8);
  readonly exact = 2 * Math.LN2 - 1;

  readonly termByTermSum = computed(() => {
    let s = 0;
    for (let n = 1; n <= this.nVal(); n++) {
      s += ((-1) ** (n + 1)) / (n * (n + 1));
    }
    return s;
  });

  fx(x: number): number { return 40 + x * 420; }
  fy(y: number): number { return 160 - y * 200; }

  lnPath(): string {
    const pts = sampleFn((x) => Math.log(1 + x), 0, 1, 200);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  partialPath(): string {
    const N = this.nVal();
    const fn = partialSumFn((n, x) => n === 0 ? 0 : ((-1) ** (n + 1)) * Math.pow(x, n) / n, N);
    const pts = sampleFn(fn, 0, 1, 200);
    return 'M' + pts.filter((p) => Math.abs(p.y) < 1.5).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
