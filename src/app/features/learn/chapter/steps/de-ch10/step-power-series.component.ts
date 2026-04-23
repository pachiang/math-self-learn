import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/** Airy y'' + xy = 0 coefficient recursion: a_(n+2) * (n+2)(n+1) = - a_(n-1) for n >= 1, a_2 = 0. */
function airyCoefficients(a0: number, a1: number, N: number): number[] {
  const a = new Array(N + 1).fill(0);
  a[0] = a0;
  a[1] = a1;
  a[2] = 0;
  // a_(n+2)(n+2)(n+1) + a_(n-1) = 0 → a_(n+2) = -a_(n-1) / ((n+2)(n+1))  (for n >= 1)
  for (let n = 1; n <= N - 2; n++) {
    a[n + 2] = -a[n - 1] / ((n + 2) * (n + 1));
  }
  return a;
}

/** Evaluate truncated series sum_(n=0)^N a_n x^n at x */
function evalSeries(a: number[], x: number, N: number): number {
  let sum = 0;
  let xp = 1;
  for (let n = 0; n <= N; n++) {
    sum += a[n] * xp;
    xp *= x;
  }
  return sum;
}

/** Reference Airy via RK4 (same as in why-series) */
function airyRef(x: number): number {
  const h = 0.01;
  let y = 1, yp = 0, xx = 0;
  const dir = x >= 0 ? 1 : -1;
  const steps = Math.ceil(Math.abs(x / h));
  for (let i = 0; i < steps; i++) {
    const f = (a: number, b: number, c: number): [number, number] => [c, -a * b];
    const [k1a, k1b] = f(xx, y, yp);
    const [k2a, k2b] = f(xx + dir * h / 2, y + dir * h / 2 * k1a, yp + dir * h / 2 * k1b);
    const [k3a, k3b] = f(xx + dir * h / 2, y + dir * h / 2 * k2a, yp + dir * h / 2 * k2b);
    const [k4a, k4b] = f(xx + dir * h, y + dir * h * k3a, yp + dir * h * k3b);
    y += (dir * h / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
    yp += (dir * h / 6) * (k1b + 2 * k2b + 2 * k3b + k4b);
    xx += dir * h;
  }
  return y;
}

@Component({
  selector: 'app-de-ch10-power-series',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="冪級數解法的操作" subtitle="§10.2">
      <p>
        以 Airy 方程 <code>y'' + x·y = 0</code> 為例，完整跑一次流程。
      </p>

      <h4>步驟 1：假設級數形式</h4>
      <div class="centered-eq">y = Σ aₙ xⁿ = a₀ + a₁x + a₂x² + a₃x³ + a₄x⁴ + ⋯</div>

      <h4>步驟 2：逐項微分</h4>
      <div class="centered-eq">y' = Σ n·aₙ xⁿ⁻¹,&nbsp;&nbsp;y'' = Σ n(n−1)·aₙ xⁿ⁻²</div>

      <h4>步驟 3：代入 ODE</h4>
      <div class="centered-eq">Σ n(n−1)aₙ xⁿ⁻² + x · Σ aₙ xⁿ = 0</div>
      <p>
        把第一項 reindex（令 <code>m = n−2</code>），第二項併入 <code>xⁿ⁺¹</code>：
      </p>
      <div class="centered-eq">Σ (n+2)(n+1)aₙ₊₂ xⁿ + Σ aₙ xⁿ⁺¹ = 0</div>

      <h4>步驟 4：比對同次項得遞迴</h4>
      <ul class="recur-list">
        <li><strong>x⁰ 項</strong>：2·1·a₂ = 0 &rArr; <code>a₂ = 0</code></li>
        <li><strong>xⁿ 項 (n ≥ 1)</strong>：(n+2)(n+1)aₙ₊₂ + aₙ₋₁ = 0</li>
      </ul>
      <div class="centered-eq big">
        a<sub>n+2</sub> = −a<sub>n−1</sub> / [(n+2)(n+1)]
      </div>
      <p>
        從 <code>a₀, a₁</code> 兩個初值出發（由 y(0)=a₀、y'(0)=a₁ 決定），其他係數全部算得出來。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="滑動 N：看截斷級數逐漸逼近真實解">
      <div class="plot">
        <div class="plot-title">部分和 S_N(x) = a₀ + a₁x + ⋯ + a_N xᴺ（a₀=1, a₁=0）</div>
        <svg viewBox="-220 -100 440 190" class="plot-svg">
          <line [attr.x1]="-200" y1="0" [attr.x2]="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" [attr.y1]="-95" x2="0" [attr.y2]="85" stroke="var(--border-strong)" stroke-width="1" />
          <text x="204" y="4" class="ax">x</text>
          <text x="4" y="-98" class="ax">y</text>
          @for (i of [-4,-3,-2,-1,1,2,3,4]; track i) {
            <line [attr.x1]="i * 30" [attr.y1]="-4" [attr.x2]="i * 30" [attr.y2]="4" stroke="var(--border-strong)" />
            <text [attr.x]="i * 30" y="14" class="tick">{{ i }}</text>
          }
          <!-- Reference -->
          <path [attr.d]="refPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="4 3" opacity="0.7" />
          <!-- Series truncation -->
          <path [attr.d]="seriesPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />
        </svg>
        <div class="legend">
          <span class="leg"><span class="sw accent"></span>截斷級數 S_N(x)</span>
          <span class="leg"><span class="sw dashed"></span>真實 Airy 解</span>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">項數 N</span>
          <input type="range" min="2" max="30" step="1" [value]="N()"
            (input)="N.set(+$any($event).target.value)" />
          <span class="sl-val">{{ N() }}</span>
        </div>
        <p class="note">
          隨 N 增加，藍線越來越貼合灰色參考曲線。
          小 N 在 |x| 大時偏離很大（Taylor 截斷誤差 ~ |x|ᴺ⁺¹）；
          大 N 幾乎重合直到<strong>收斂半徑</strong>以外。Airy 的收斂半徑 = ∞，所以我們能無限延伸。
        </p>
      </div>

      <div class="coef-table">
        <div class="coef-title">前 8 項係數（a₀=1, a₁=0）：</div>
        <div class="coef-row">
          @for (ai of first8(); track $index) {
            <div class="coef-cell">
              <div class="coef-idx">a_{{ $index }}</div>
              <div class="coef-val">{{ ai.toFixed(4) }}</div>
            </div>
          }
        </div>
        <p class="note">
          觀察：<strong>a₂ = a₅ = a₈ = ⋯ = 0</strong>。
          係數分成三族（n mod 3）各自遞迴——這是 Airy 方程的特色。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼這能一路算下去？</h4>
      <p>
        當 <code>x₀ = 0</code> 是一個 <strong>ordinary point</strong>（ODE 係數在這點解析），
        冪級數解必然存在、收斂半徑至少等於最近奇異點的距離，<strong>且由 a₀, a₁ 兩個初值唯一決定</strong>。
        這在 Airy、Hermite、Legendre（|x|&lt;1）都成立。
      </p>
      <p class="takeaway">
        <strong>take-away：</strong>
        對 ordinary point，冪級數永遠有效。剩下的挑戰是<strong>奇異點</strong>——
        例如 Bessel 方程在 x=0 處係數爆炸。下一節引入 Frobenius 方法處理它。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 15px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .recur-list { margin: 8px 0 8px 20px; font-size: 14px; line-height: 1.8; color: var(--text-secondary); }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }
    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }
    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .plot-svg { width: 100%; display: block; }
    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .legend { display: flex; gap: 16px; justify-content: center; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.accent { background: var(--accent); }
    .sw.dashed { background-image: linear-gradient(to right, var(--text-muted) 50%, transparent 50%); background-size: 4px 3px; }
    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 66px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right; }
    .note { font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin: 6px 0 0; }
    .coef-table { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .coef-title { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
    .coef-row { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
    .coef-cell { padding: 5px 2px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; text-align: center; }
    .coef-idx { font-size: 10px; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .coef-val { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text); }
  `,
})
export class DeCh10PowerSeriesComponent {
  readonly N = signal(10);
  readonly NMAX = 40;
  private readonly coefs = computed(() => airyCoefficients(1, 0, this.NMAX));

  readonly first8 = computed(() => this.coefs().slice(0, 8));

  readonly seriesPath = computed(() => {
    const a = this.coefs();
    const N = this.N();
    const pts: string[] = [];
    const SCALE_X = 30;
    const SCALE_Y = 45;
    const xs: number[] = [];
    for (let i = 0; i <= 200; i++) xs.push(-6 + (12 * i) / 200);
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const y = evalSeries(a, x, N);
      const yc = Math.max(-2, Math.min(2, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(x * SCALE_X).toFixed(1)} ${(-yc * SCALE_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly refPath = computed(() => {
    const pts: string[] = [];
    const SCALE_X = 30;
    const SCALE_Y = 45;
    for (let i = 0; i <= 200; i++) {
      const x = -6 + (12 * i) / 200;
      const y = airyRef(x);
      const yc = Math.max(-2, Math.min(2, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(x * SCALE_X).toFixed(1)} ${(-yc * SCALE_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
