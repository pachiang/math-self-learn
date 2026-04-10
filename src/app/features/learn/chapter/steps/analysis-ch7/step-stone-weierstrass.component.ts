import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn, supNorm } from './analysis-ch7-util';

// Bernstein polynomial approximation
function bernsteinApprox(f: (x: number) => number, n: number): (x: number) => number {
  return (x: number) => {
    let s = 0;
    for (let k = 0; k <= n; k++) {
      const binom = binomial(n, k);
      s += f(k / n) * binom * Math.pow(x, k) * Math.pow(1 - x, n - k);
    }
    return s;
  };
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return r;
}

interface Preset { name: string; fn: (x: number) => number; }

const PRESETS: Preset[] = [
  { name: '|x − 0.5|', fn: (x) => Math.abs(x - 0.5) },
  { name: 'sin(πx)', fn: (x) => Math.sin(Math.PI * x) },
  { name: 'x(1−x)', fn: (x) => x * (1 - x) },
  { name: '階梯（不連續）', fn: (x) => x < 0.5 ? 0 : 1 },
];

@Component({
  selector: 'app-step-stone-weierstrass',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Stone-Weierstrass 定理" subtitle="§7.8">
      <p>
        <strong>Weierstrass 逼近定理</strong>：[a,b] 上的任何連續函數都能被
        <strong>多項式均勻逼近</strong>。
      </p>
      <p class="formula">
        ∀ε > 0, ∃ 多項式 p 使得 sup|f(x) − p(x)| &lt; ε
      </p>
      <p>
        構造性證明用 <strong>Bernstein 多項式</strong>：
        Bₙ(f)(x) = Σ f(k/n) C(n,k) xᵏ(1−x)ⁿ⁻ᵏ。
      </p>
      <p>
        Stone-Weierstrass 是推廣：把「多項式」換成任何「分離點的子代數」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 n 看 Bernstein 多項式怎麼逼近——連 |x| 這種尖角也能逼">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">n = {{ nVal() }}</span>
          <input type="range" min="1" max="50" step="1" [value]="nVal()"
                 (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 220" class="sw-svg">
        <line x1="40" y1="190" x2="500" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- Original function -->
        <path [attr.d]="fPath()" fill="none" stroke="#5a8a5a" stroke-width="2.5" />

        <!-- Bernstein approximation -->
        <path [attr.d]="bPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>

      <div class="result-row">
        <div class="r-card">‖f − Bₙ‖_sup = {{ normVal().toFixed(4) }}</div>
        <div class="r-card" [class.ok]="normVal() < 0.05">
          {{ normVal() < 0.05 ? '非常接近 ✓' : '還在逼近…' }}
        </div>
      </div>

      <div class="legend">
        <span><span class="dot green"></span>原始函數 f</span>
        <span><span class="dot accent"></span>Bernstein Bₙ（n = {{ nVal() }}）</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Stone-Weierstrass 說：連續函數和多項式之間的「距離」可以任意小。
        這是函數逼近理論的基石，也是數值計算（插值、擬合）的理論保障。
      </p>
      <p>下一節看函數列的 BW 定理——<strong>Arzela-Ascoli</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 120px; accent-color: var(--accent); }
    .sw-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .result-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .legend { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.green { background: #5a8a5a; } &.accent { background: var(--accent); } }
  `,
})
export class StepStoneWeierstrassComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly nVal = signal(10);

  private readonly curFn = computed(() => PRESETS[this.selIdx()].fn);
  private readonly bernFn = computed(() => bernsteinApprox(this.curFn(), this.nVal()));
  readonly normVal = computed(() => supNorm(this.curFn(), this.bernFn(), 0, 1));

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 190 - ((y + 0.1) / 1.2) * 175; }

  fPath(): string {
    const pts = sampleFn(this.curFn(), 0, 1, 200);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  bPath(): string {
    const pts = sampleFn(this.bernFn(), 0, 1, 200);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
