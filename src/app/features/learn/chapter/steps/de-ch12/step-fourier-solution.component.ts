import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface InitialShape {
  id: string;
  name: string;
  f: (x: number, L: number) => number;
}

const SHAPES: InitialShape[] = [
  { id: 'triangle', name: '三角形', f: (x, L) => (x < L / 2 ? (2 * x) / L : 2 - (2 * x) / L) },
  { id: 'hot-middle', name: '熱塊在中間', f: (x, L) => (Math.abs(x - L / 2) < L / 6 ? 1 : 0) },
  { id: 'sine', name: '純 sin(πx/L)', f: (x, L) => Math.sin((Math.PI * x) / L) },
  { id: 'uneven', name: '不平均', f: (x, L) => (x < L / 3 ? 0.3 : x < 2 * L / 3 ? 1 : 0.6) },
];

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
  selector: 'app-de-ch12-fourier-solution',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="完整解：從初始形狀到演化" subtitle="§12.4">
      <p>
        全流程解一個標準問題：兩端固定為 0 的散熱棒（Dirichlet），熱擴散率 α，初始溫度分佈 f(x)。
      </p>
      <div class="problem">
        <div class="p-title">問題</div>
        <div class="p-line"><strong>PDE：</strong> <code>uₜ = α·uₓₓ</code>, &nbsp;&nbsp; 0 &lt; x &lt; L, t &gt; 0</div>
        <div class="p-line"><strong>BC：</strong> u(0, t) = 0, u(L, t) = 0</div>
        <div class="p-line"><strong>IC：</strong> u(x, 0) = f(x)</div>
      </div>

      <h4>三步走</h4>
      <ol class="steps">
        <li>
          <strong>本徵分解：</strong> §12.3 已知 <code>λₙ = (nπ/L)²</code>, <code>Xₙ(x) = sin(nπx/L)</code>。
        </li>
        <li>
          <strong>基本解疊加：</strong>
          <div class="centered-eq">
            u(x, t) = Σ bₙ · sin(nπx/L) · e^(−α(nπ/L)²·t)
          </div>
        </li>
        <li>
          <strong>用初值定係數 bₙ：</strong> 令 t = 0 →
          <code>f(x) = Σ bₙ sin(nπx/L)</code>，由 §11.4 投影公式：
          <div class="centered-eq">
            bₙ = (2/L) ∫₀<sup>L</sup> f(x)·sin(nπx/L) dx
          </div>
        </li>
      </ol>
    </app-prose-block>

    <app-challenge-card prompt="選初始形狀 + 播放：看溫度如何被擴散抹平">
      <div class="shape-row">
        @for (s of shapes; track s.id) {
          <button class="pill" [class.active]="shape() === s.id" (click)="shape.set(s.id)">{{ s.name }}</button>
        }
      </div>

      <div class="plot">
        <div class="plot-title">u(x, t)，以顏色表示時間流逝</div>
        <svg viewBox="-10 -80 420 150" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-75" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="400" y1="-75" x2="400" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <text x="-4" y="14" class="tick">0</text>
          <text x="400" y="14" class="tick" text-anchor="middle">L</text>

          <!-- Historical snapshots (fade) -->
          @for (s of snapshots(); track s.t) {
            <path [attr.d]="s.d" fill="none"
              [attr.stroke]="s.color" [attr.stroke-width]="1" [attr.opacity]="s.op" />
          }
          <!-- Initial f(x) dashed -->
          <path [attr.d]="initialPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.4" stroke-dasharray="3 2" opacity="0.7" />
          <!-- Current -->
          <path [attr.d]="currentPath()" fill="none" stroke="var(--accent)" stroke-width="2.4" />
        </svg>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <span class="t-display">t = {{ t().toFixed(3) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">時間 t</span>
          <input type="range" [min]="0" [max]="T_MAX" step="0.001" [value]="t()"
            (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(3) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">α</span>
          <input type="range" min="0.01" max="0.5" step="0.01" [value]="alpha()"
            (input)="alpha.set(+$any($event).target.value)" />
          <span class="sl-val">{{ alpha().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">項數 N</span>
          <input type="range" min="1" max="30" step="1" [value]="N()"
            (input)="N.set(+$any($event).target.value)" />
          <span class="sl-val">{{ N() }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>觀察到的兩個關鍵現象</h4>
      <div class="obs-grid">
        <div class="obs">
          <div class="obs-num">1</div>
          <div class="obs-body">
            <strong>高頻先消失：</strong>
            尖銳的方波→一開始下降最快的就是「邊緣 Gibbs」，因為它們由高 n 項組成、
            衰減因子 e^(−αn²π²t/L²) 在 n 大時極快。
          </div>
        </div>
        <div class="obs">
          <div class="obs-num">2</div>
          <div class="obs-body">
            <strong>長時間 → 最低模態：</strong>
            所有高頻消失後，留下的幾乎只有 n=1 那個 sin(πx/L) 形狀，以速率 α·π²/L² 指數衰減到 0。
          </div>
        </div>
      </div>

      <h4>「為什麼」級數會收斂到真實解？</h4>
      <p>
        三件事必須吻合：(1) 每個 <code>bₙ sin(nπx/L)·e^(−αλₙt)</code> 都滿足 PDE 與齊次 BC，
        (2) 對 t &gt; 0，<strong>指數衰減因子 e^(−λₙt)</strong> 補償了 bₙ 的平方可加性 → 和一致收斂，
        (3) t → 0 時級數收斂到 f（Fourier 級數收斂定理）。三者合起來，就得到唯一的古典解。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        本徵分解 + 指數衰減 + Fourier 投影 = 熱方程的完整解法。
        每個初始形狀被分解為「模態」，每個模態以自己的速度衰減，最終所有模態消失，棒子歸零。
        下一節看不同邊界條件怎麼改變這個故事。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }

    .problem { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin: 10px 0; }
    .p-title { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .p-line { font-size: 13px; color: var(--text-secondary); padding: 3px 0; }
    .p-line strong { color: var(--accent); }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .steps { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .steps strong { color: var(--accent); }

    .shape-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .plot-svg { width: 100%; display: block; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: end; font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .obs-grid { display: grid; gap: 10px; margin: 10px 0; }
    .obs { display: grid; grid-template-columns: 36px 1fr; gap: 10px; align-items: start; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .obs-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .obs-body { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .obs-body strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh12FourierSolutionComponent implements OnInit, OnDestroy {
  readonly shape = signal('triangle');
  readonly t = signal(0);
  readonly alpha = signal(0.2);
  readonly N = signal(12);
  readonly playing = signal(false);
  readonly T_MAX = 3;
  readonly L = Math.PI;
  readonly shapes = SHAPES;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 0.25;
        if (newT >= this.T_MAX) {
          this.t.set(this.T_MAX);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  togglePlay() {
    if (this.t() >= this.T_MAX - 0.01) this.t.set(0);
    this.playing.set(!this.playing());
  }
  reset() { this.t.set(0); this.playing.set(false); }

  readonly shapeFn = computed(() => SHAPES.find(s => s.id === this.shape())!.f);
  readonly coefs = computed(() => {
    const arr: number[] = [];
    const f = this.shapeFn();
    for (let n = 1; n <= 40; n++) arr.push(bn(f, n, this.L));
    return arr;
  });

  solutionAt(x: number, t: number): number {
    const b = this.coefs();
    const alpha = this.alpha();
    const N = this.N();
    let u = 0;
    for (let n = 1; n <= N; n++) {
      const lam = (n * Math.PI / this.L) ** 2;
      u += b[n - 1] * Math.sin((n * Math.PI * x) / this.L) * Math.exp(-alpha * lam * t);
    }
    return u;
  }

  buildPath(tVal: number, scaleY = 55): string {
    const pts: string[] = [];
    const W = 400;
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = this.solutionAt(x, tVal);
      const yc = Math.max(-1.2, Math.min(1.5, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * W).toFixed(1)} ${(-yc * scaleY).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  initialPath(): string { return this.buildPath(0); }
  currentPath(): string { return this.buildPath(this.t()); }

  readonly snapshots = computed(() => {
    const ts = [0.05, 0.15, 0.3, 0.6, 1.2];
    const currT = this.t();
    return ts.filter(ts => ts <= currT + 0.01).map((ts, i) => ({
      t: ts,
      d: this.buildPath(ts),
      color: `rgba(200, 123, 94, ${0.35 - i * 0.05})`,
      op: 1,
    }));
  });
}
