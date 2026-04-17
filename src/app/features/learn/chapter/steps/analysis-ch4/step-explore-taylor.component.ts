import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface TaylorTarget {
  name: string; fn: (x: number) => number;
  coeffs: (n: number) => number; // n-th Taylor coefficient at x=0
  xRange: [number, number]; yRange: [number, number];
  convergenceRadius: string;
}

const TARGETS: TaylorTarget[] = [
  { name: 'sin(x)', fn: Math.sin,
    coeffs: (n) => { if (n % 2 === 0) return 0; const k = (n - 1) / 2; let f = 1; for (let i = 1; i <= n; i++) f *= i; return ((k % 2 === 0 ? 1 : -1)) / f; },
    xRange: [-5, 5], yRange: [-2, 2], convergenceRadius: '∞（整條實數線）' },
  { name: 'eˣ', fn: Math.exp,
    coeffs: (n) => { let f = 1; for (let i = 1; i <= n; i++) f *= i; return 1 / f; },
    xRange: [-3, 3], yRange: [-0.5, 8], convergenceRadius: '∞（整條實數線）' },
  { name: '1/(1−x)', fn: (x) => 1 / (1 - x),
    coeffs: () => 1, // all coefficients = 1 (geometric series)
    xRange: [-1.5, 1.5], yRange: [-3, 6], convergenceRadius: '1（|x| < 1 才收斂！）' },
];

@Component({
  selector: 'app-step-explore-taylor',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="深入探索 B：Taylor 多項式近似" subtitle="§4.8 附錄">
      <p>
        §4.8 問：「用多項式近似 sin(x)，誤差是多少？」
        Taylor 多項式就是做這件事的工具——用<strong>多項式</strong>（最簡單的函數）去<strong>逼近</strong>複雜函數。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="Taylor 多項式是什麼？">
      <p>
        在 x = 0 附近，用 f 的各階導數建構一個 N 次多項式：
      </p>
      <p class="formula">Tₙ(x) = f(0) + f'(0)x + f''(0)x²/2! + ⋯ + f⁽ⁿ⁾(0)xⁿ/n!</p>
      <p>
        每多加一項，Tₙ 就在 x = 0 附近多「貼合」原函數一階導數。
        <strong>N 越大 → 貼合範圍越大</strong>（如果級數收斂）。
      </p>
      <p>
        但關鍵問題是：Tₙ 在<strong>多遠的地方</strong>還能用？
        這就是<strong>收斂半徑</strong>——有些函數全域收斂（sin, eˣ），有些只在一段範圍內收斂（1/(1−x)）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 N 看 Taylor 多項式怎麼越來越貼合——注意收斂半徑外會爆掉！">
      <div class="ctrl-row">
        @for (t of targets; track t.name; let i = $index) {
          <button class="pre-btn" [class.active]="sel() === i" (click)="sel.set(i)">{{ t.name }}</button>
        }
      </div>

      <div class="n-ctrl">
        <span class="nl">N = {{ N() }}（多項式次數）</span>
        <input type="range" min="0" max="15" step="1" [value]="N()"
               (input)="N.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 280" class="taylor-svg">
        <line x1="60" y1="240" x2="490" y2="240" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="20" x2="60" y2="240" stroke="var(--border)" stroke-width="0.8" />

        @for (yt of yTicks(); track yt) {
          <line x1="55" [attr.y1]="tfy(yt)" x2="490" [attr.y2]="tfy(yt)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="tfy(yt) + 3" class="ax-label" text-anchor="end">{{ yt }}</text>
        }

        <!-- Ghost Taylor polynomials for lower N -->
        @for (k of ghostNs(); track k) {
          <path [attr.d]="taylorPath(k)" fill="none" stroke="var(--accent)" stroke-width="0.8"
                [attr.stroke-opacity]="0.1 + 0.04 * k" />
        }

        <!-- True function (dashed green) -->
        <path [attr.d]="truePath()" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- Current Taylor polynomial -->
        <path [attr.d]="taylorPath(N())" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">
          <span class="r-label">sup 距離 (在顯示範圍)</span>
          <span class="r-val">{{ supErr().toFixed(4) }}</span>
        </div>
        <div class="r-card">
          <span class="r-label">收斂半徑</span>
          <span class="r-val">{{ curTarget().convergenceRadius }}</span>
        </div>
      </div>

      <div class="note">
        試 1/(1−x)：即使 N 很大，<strong>x ≥ 1 處多項式完全偏離</strong>——
        因為 Taylor 級數的收斂半徑只有 1。在收斂半徑之外，多項式反而越加越糟。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Taylor 逼近在收斂半徑內越來越好（sup 距離 → 0），但在外面完全失效。
        Ch5 會正式定義 Taylor 定理和餘項估計。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .pre-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 150px; }
    .n-slider { flex: 1; accent-color: var(--accent); height: 22px; }
    .taylor-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .result-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface); }
    .r-label { font-size: 11px; color: var(--text-muted); display: block; }
    .r-val { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .note { padding: 10px; border-radius: 8px; background: rgba(160,90,90,0.06);
      border: 1px solid rgba(160,90,90,0.2); font-size: 12px; color: var(--text-muted); text-align: center; }
    .note strong { color: #a05a5a; }
  `,
})
export class StepExploreTaylorComponent {
  readonly targets = TARGETS;
  readonly sel = signal(0);
  readonly N = signal(5);
  readonly curTarget = computed(() => TARGETS[this.sel()]);

  private taylorEval(x: number, n: number): number {
    const c = this.curTarget().coeffs;
    let sum = 0, xPow = 1;
    for (let k = 0; k <= n; k++) {
      sum += c(k) * xPow;
      xPow *= x;
    }
    return sum;
  }

  tfx(x: number): number {
    const [lo, hi] = this.curTarget().xRange;
    return 60 + ((x - lo) / (hi - lo)) * 430;
  }
  tfy(y: number): number {
    const [lo, hi] = this.curTarget().yRange;
    return 240 - ((y - lo) / (hi - lo)) * 220;
  }

  readonly yTicks = computed(() => {
    const [lo, hi] = this.curTarget().yRange;
    const step = Math.ceil((hi - lo) / 5);
    const ticks: number[] = [];
    for (let v = Math.ceil(lo); v <= hi; v += step) ticks.push(v);
    return ticks;
  });

  truePath(): string {
    const t = this.curTarget();
    let path = '';
    for (let i = 0; i <= 300; i++) {
      const x = t.xRange[0] + (t.xRange[1] - t.xRange[0]) * i / 300;
      const y = t.fn(x);
      if (y < t.yRange[0] - 2 || y > t.yRange[1] + 2) { path += path ? '' : ''; continue; }
      path += (path === '' ? 'M' : 'L') + `${this.tfx(x).toFixed(1)},${this.tfy(y).toFixed(1)}`;
    }
    return path;
  }

  taylorPath(n: number): string {
    const t = this.curTarget();
    let path = '';
    for (let i = 0; i <= 300; i++) {
      const x = t.xRange[0] + (t.xRange[1] - t.xRange[0]) * i / 300;
      const y = this.taylorEval(x, n);
      if (y < t.yRange[0] - 2 || y > t.yRange[1] + 2) {
        if (path && !path.endsWith('M')) path = path; // break
        continue;
      }
      path += (path === '' ? 'M' : 'L') + `${this.tfx(x).toFixed(1)},${this.tfy(y).toFixed(1)}`;
    }
    return path;
  }

  readonly ghostNs = computed(() => {
    const n = this.N();
    const gs: number[] = [];
    for (let k = 0; k < n; k += Math.max(1, Math.floor(n / 4))) gs.push(k);
    return gs;
  });

  readonly supErr = computed(() => {
    const t = this.curTarget();
    const n = this.N();
    let mx = 0;
    for (let i = 0; i <= 300; i++) {
      const x = t.xRange[0] + (t.xRange[1] - t.xRange[0]) * i / 300;
      const err = Math.abs(t.fn(x) - this.taylorEval(x, n));
      if (isFinite(err)) mx = Math.max(mx, err);
    }
    return mx;
  });
}
