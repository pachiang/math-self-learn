import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch6-util';

// Approximate Gamma function via Lanczos approximation
function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

@Component({
  selector: 'app-step-gamma-function',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Gamma 函數" subtitle="§6.8">
      <p>
        積分能定義全新的函數。最重要的例子是 <strong>Gamma 函數</strong>：
      </p>
      <p class="formula">Γ(s) = ∫₀^∞ t^(s−1) e^(−t) dt</p>
      <p>
        它是<strong>階乘的連續版本</strong>：Γ(n) = (n−1)!。
        但它對所有 s > 0（甚至複數）都有定義。
      </p>
      <p>
        關鍵性質：<strong>Γ(s+1) = s · Γ(s)</strong>（分部積分即得）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 s 看 Γ(s) 的圖——整數點上就是 (s−1)!">
      <div class="s-ctrl">
        <span class="sl">s = {{ sVal().toFixed(2) }}</span>
        <input type="range" min="0.1" max="5" step="0.05" [value]="sVal()"
               (input)="sVal.set(+($any($event.target)).value)" class="s-slider" />
      </div>

      <svg viewBox="0 0 520 260" class="gam-svg">
        <line x1="40" y1="230" x2="500" y2="230" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="230" stroke="var(--border)" stroke-width="0.8" />

        <!-- Gamma curve -->
        <path [attr.d]="gammaPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Integer points (factorials) -->
        @for (pt of factorialPoints; track pt.n) {
          <circle [attr.cx]="gx(pt.n)" [attr.cy]="gy(pt.val)" r="4"
                  fill="#5a8a5a" stroke="white" stroke-width="1" />
          <text [attr.x]="gx(pt.n) + 6" [attr.y]="gy(pt.val) - 6" class="fac-label">{{ pt.n-1 }}!</text>
        }

        <!-- Current s -->
        <circle [attr.cx]="gx(sVal())" [attr.cy]="gy(gammaVal())" r="6"
                fill="var(--accent)" stroke="white" stroke-width="2" />
        <line [attr.x1]="gx(sVal())" y1="10" [attr.x2]="gx(sVal())" y2="230"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" />
      </svg>

      <div class="result-row">
        <div class="r-card">Γ({{ sVal().toFixed(2) }}) = {{ gammaVal().toFixed(4) }}</div>
        @if (isInteger()) {
          <div class="r-card ok">= {{ factorial() }}! = {{ factorialVal() }} ✓</div>
        }
        <div class="r-card">Γ(1/2) = √π ≈ {{ Math.sqrt(Math.PI).toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Gamma 函數出現在統計學（常態分佈）、物理（量子力學）、數論（Riemann zeta 函數）——
        它是瑕積分最成功的應用之一。
      </p>
      <p>下一節心智圖總結。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .s-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .sl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .s-slider { flex: 1; accent-color: var(--accent); }
    .gam-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .fac-label { font-size: 8px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 100px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepGammaFunctionComponent {
  readonly Math = Math;
  readonly sVal = signal(3.5);
  readonly gammaVal = computed(() => gamma(this.sVal()));
  readonly isInteger = computed(() => Math.abs(this.sVal() - Math.round(this.sVal())) < 0.05 && this.sVal() > 0.5);
  readonly factorial = computed(() => Math.round(this.sVal()) - 1);
  readonly factorialVal = computed(() => { let f = 1; for (let i = 2; i <= this.factorial(); i++) f *= i; return f; });

  readonly factorialPoints = [1, 2, 3, 4, 5].map((n) => ({
    n, val: gamma(n),
  }));

  gx(s: number): number { return 40 + (s / 5.5) * 460; }
  gy(y: number): number { return 230 - Math.min(y / 25, 1) * 215; }

  gammaPath(): string {
    const pts: string[] = [];
    for (let s = 0.15; s <= 5.5; s += 0.03) {
      const y = gamma(s);
      if (isFinite(y) && y > 0 && y < 30) pts.push(`${this.gx(s)},${this.gy(y)}`);
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }
}
