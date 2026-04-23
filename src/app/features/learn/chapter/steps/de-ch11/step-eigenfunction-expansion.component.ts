import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface TargetFn {
  id: string;
  name: string;
  f: (x: number, L: number) => number;
}

const TARGETS: TargetFn[] = [
  {
    id: 'square',
    name: '方波（撥弦初姿）',
    f: (x, L) => (x < L / 2 ? 1 : -1),
  },
  {
    id: 'triangle',
    name: '三角波',
    f: (x, L) => (x < L / 2 ? (2 * x) / L : 2 - (2 * x) / L),
  },
  {
    id: 'hat',
    name: '正中央的扯開（撥吉他）',
    f: (x, L) => {
      const t = x / L;
      return t < 0.3 ? t / 0.3 : t < 0.7 ? 1 : (1 - t) / 0.3;
    },
  },
  {
    id: 'parabola',
    name: 'x(L−x)',
    f: (x, L) => (x * (L - x)) / (L * L) * 4,
  },
];

// Numerical coefficient b_n = (2/L) ∫₀^L f(x) sin(nπx/L) dx via Simpson
function bn(f: (x: number, L: number) => number, n: number, L: number, N = 200): number {
  const h = L / N;
  let sum = 0;
  for (let i = 0; i <= N; i++) {
    const x = i * h;
    const v = f(x, L) * Math.sin((n * Math.PI * x) / L);
    const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
    sum += w * v;
  }
  return ((2 / L) * h / 3) * sum;
}

@Component({
  selector: 'app-de-ch11-expansion',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="本徵函數展開 = Fourier 級數" subtitle="§11.4">
      <p>
        既然正弦族 <code>sin(nπx/L)</code> 是正交基底，
        把任何函數 f(x) 表成它們的線性組合是自然的——這叫做<strong>本徵函數展開</strong>。
      </p>
      <div class="centered-eq big">
        f(x) ≈ Σ<sub>n=1</sub><sup>N</sup> bₙ sin(nπx/L),&nbsp;&nbsp;bₙ = (2/L) ∫₀<sup>L</sup> f·sin(nπx/L) dx
      </div>
      <p>
        當 N → ∞，這個和收斂到 f（在恰當意義下）。
        下面的互動讓你親眼看到：任意波形如何由正弦「模態」逐步拼出。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選目標波形 + 滑動 N：看展開如何逼近">
      <div class="targets">
        @for (t of targets; track t.id) {
          <button class="tgt" [class.active]="target() === t.id" (click)="target.set(t.id)">
            {{ t.name }}
          </button>
        }
      </div>

      <div class="plot">
        <div class="plot-title">
          f(x)（灰）與部分和 S_N(x)（橘）
        </div>
        <svg viewBox="-20 -80 420 150" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-75" x2="0" y2="55" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="400" y1="-75" x2="400" y2="55" stroke="var(--border-strong)" stroke-width="1" />
          <text x="-4" y="14" class="tick">0</text>
          <text x="400" y="14" class="tick" text-anchor="middle">L</text>

          <!-- Target -->
          <path [attr.d]="targetPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.8" stroke-dasharray="4 3" />

          <!-- Partial sum -->
          <path [attr.d]="partialPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />
        </svg>
        <div class="legend">
          <span class="leg"><span class="sw accent"></span>S_N(x)</span>
          <span class="leg"><span class="sw dashed"></span>目標 f(x)</span>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">項數 N</span>
          <input type="range" min="1" max="50" step="1" [value]="N()"
            (input)="N.set(+$any($event).target.value)" />
          <span class="sl-val">N = {{ N() }}</span>
        </div>
      </div>

      <div class="coef-vis">
        <div class="cv-title">前 {{ displayCount() }} 項係數 bₙ：</div>
        <div class="bars">
          @for (bar of bars(); track $index) {
            <div class="bar-wrap">
              <div class="bar"
                [style.height.px]="bar.h"
                [style.background]="bar.color"
                [class.above]="bar.above"></div>
              <div class="bar-label">{{ $index + 1 }}</div>
            </div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>不同邊界 → 不同本徵函數族</h4>
      <p>
        邊界條件改變，本徵函數族也跟著變。例如：
      </p>
      <div class="bc-grid">
        <div class="bc-card">
          <div class="bc-name">Dirichlet：y(0) = y(L) = 0</div>
          <code>y_n = sin(nπx/L)</code>
          <p>兩端綁住的弦。正弦級數。</p>
        </div>
        <div class="bc-card">
          <div class="bc-name">Neumann：y′(0) = y′(L) = 0</div>
          <code>y_n = cos(nπx/L)</code>
          <p>兩端絕熱的散熱棒。餘弦級數。</p>
        </div>
        <div class="bc-card">
          <div class="bc-name">Periodic：y(0) = y(L), y′(0) = y′(L)</div>
          <code>sin(2nπx/L), cos(2nπx/L)</code>
          <p>圓周上的函數。完整 Fourier 級數。</p>
        </div>
        <div class="bc-card">
          <div class="bc-name">Mixed / Robin：αy + βy′ = 0</div>
          <code>tan(kL) = −k/α 的零點</code>
          <p>對流散熱邊界。本徵值需要數值求解。</p>
        </div>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        本徵函數展開是「把函數<strong>投影</strong>到各個模態」。
        下一節引入 Sturm-Liouville 的統一框架，讓同樣的流程也適用於 Bessel、Legendre、Hermite。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0;
    }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }

    .targets { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .tgt { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .tgt.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .tgt:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .plot-svg { width: 100%; display: block; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: end; font-family: 'JetBrains Mono', monospace; }
    .legend { display: flex; gap: 14px; justify-content: center; margin-top: 6px; font-size: 11px; color: var(--text-muted); }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.accent { background: var(--accent); }
    .sw.dashed { background-image: linear-gradient(to right, var(--text-muted) 50%, transparent 50%); background-size: 4px 3px; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }

    .coef-vis { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .cv-title { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
    .bars { display: flex; align-items: flex-end; justify-content: space-around; gap: 4px; height: 80px; border-bottom: 1px solid var(--border); position: relative; }
    .bars::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--border); }
    .bar-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 18px; height: 100%; justify-content: center; position: relative; }
    .bar { width: 14px; border-radius: 2px; transition: height 0.12s ease; align-self: center; }
    .bar.above { align-self: flex-end; }
    .bar-label { position: absolute; bottom: -16px; font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 6px; }
    .bc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .bc-card { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .bc-name { font-weight: 700; color: var(--accent); margin-bottom: 6px; font-size: 13px; }
    .bc-card code { display: inline-block; margin-bottom: 6px; font-size: 12px; }
    .bc-card p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh11ExpansionComponent {
  readonly Math = Math;
  readonly L = Math.PI;
  readonly target = signal('square');
  readonly N = signal(5);
  readonly targets = TARGETS;

  readonly targetFn = computed(() => TARGETS.find(t => t.id === this.target())!.f);

  readonly coefs = computed(() => {
    const arr: number[] = [];
    const f = this.targetFn();
    for (let n = 1; n <= 50; n++) arr.push(bn(f, n, this.L));
    return arr;
  });

  readonly displayCount = computed(() => Math.min(12, this.N()));
  readonly firstCoefs = computed(() => this.coefs().slice(0, this.displayCount()));
  readonly maxCoef = computed(() => Math.max(0.01, ...this.coefs().slice(0, 12).map(Math.abs)));
  readonly bars = computed(() => {
    const m = this.maxCoef();
    return this.firstCoefs().map(b => {
      const h = Math.max(2, (Math.abs(b) / m) * 34);
      return {
        h,
        color: b >= 0 ? 'var(--accent)' : '#5a8aa8',
        above: b >= 0,
      };
    });
  });

  targetPath(): string {
    const pts: string[] = [];
    const W = 400;
    const H = 35;
    const N = 200;
    const f = this.targetFn();
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = f(x, this.L);
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * W).toFixed(1)} ${(-y * H).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  partialPath(): string {
    const pts: string[] = [];
    const W = 400;
    const H = 35;
    const N = 200;
    const b = this.coefs();
    const Nmax = this.N();
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      let y = 0;
      for (let n = 1; n <= Nmax; n++) {
        y += b[n - 1] * Math.sin((n * Math.PI * x) / this.L);
      }
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * W).toFixed(1)} ${(-y * H).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
