import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type EstId = 'mean' | 'median' | 'firstObs' | 'mid';

function randNormal(mu: number, sigma: number): number {
  const u1 = Math.random() || 1e-9;
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

@Component({
  selector: 'app-stats-ch2-estimator-properties',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是「好」的估計量？" subtitle="§2.1">
      <p>
        給定觀察 X₁, …, Xₙ，我們用一個函數 <code>T(X)</code> 估計某個未知參數 θ。
        T 是隨機的——換一批資料就會得到不同的值。怎麼評價 T 好不好？
      </p>

      <h4>三個核心概念</h4>
      <div class="centered-eq big">
        偏誤 Bias(T) = E[T] − θ
      </div>
      <div class="centered-eq big">
        變異 Var(T) = E[(T − E[T])²]
      </div>
      <div class="centered-eq big">
        均方誤差 MSE(T) = E[(T − θ)²] = Bias² + Var
      </div>

      <p>
        <strong>無偏（unbiased）</strong>：Bias = 0，平均來說剛好命中 θ。<br>
        <strong>有效（efficient）</strong>：在所有無偏估計量中變異最小。<br>
        <strong>一致（consistent）</strong>：n → ∞ 時 T → θ（機率意義下）。
      </p>

      <div class="key-idea">
        <strong>偏誤 vs 變異的取捨：</strong>
        MSE 同時含兩者。有時稍微有偏但變異超小的估計量，MSE 反而更低——
        這是機器學習「regularization」、嶺迴歸的理論根源。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="同一組資料，四種估計量哪個好？看 1000 次重複抽樣的結果">
      <div class="truth">
        母體 N(μ = {{ trueMu }}, σ² = {{ trueSigma * trueSigma }})，樣本大小 n = {{ n() }}
      </div>

      <div class="est-tabs">
        @for (e of ests; track e.id) {
          <button class="pill" [class.active]="est() === e.id" (click)="est.set(e.id)">{{ e.name }}</button>
        }
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">樣本數 n</span>
          <input type="range" min="3" max="100" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <button class="resample" (click)="resample()">重跑</button>
      </div>

      <svg viewBox="-10 -80 420 100" class="p-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        @for (i of ticks; track i) {
          <line [attr.x1]="mapX(i)" y1="-2" [attr.x2]="mapX(i)" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
          <text [attr.x]="mapX(i)" y="14" class="tk" text-anchor="middle">{{ i }}</text>
        }
        @for (b of hist(); track b.x) {
          <rect [attr.x]="b.x" [attr.y]="-b.h" [attr.width]="b.w" [attr.height]="b.h"
                fill="var(--accent)" opacity="0.7" />
        }
        <line [attr.x1]="mapX(trueMu)" y1="-75" [attr.x2]="mapX(trueMu)" y2="5"
              stroke="#5ca878" stroke-width="2" />
        <text [attr.x]="mapX(trueMu)" y="-78" class="tk grn" text-anchor="middle">真實 μ</text>
      </svg>

      <div class="stats">
        <div class="st">
          <div class="st-l">E[T]（實測）</div>
          <div class="st-v">{{ empMean().toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">Bias</div>
          <div class="st-v">{{ (empMean() - trueMu).toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">Var</div>
          <div class="st-v">{{ empVar().toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">MSE</div>
          <div class="st-v">{{ empMSE().toFixed(3) }}</div>
        </div>
      </div>

      <p class="note">
        <strong>樣本均值</strong>是黃金標準：無偏、變異最小。<br>
        <strong>中位數</strong>也無偏但變異較大（約 π/2 倍），代價是對離群值更穩健。<br>
        <strong>「只看第一個觀察」</strong>無偏但變異 = σ²（完全浪費剩下 n − 1 個資料）。<br>
        <strong>(min + max) / 2</strong>（midrange）無偏，但極值敏感，變異非常大。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        好的估計量要同時低偏誤與低變異。下一節我們介紹 <strong>MLE</strong>——
        對大樣本而言，它在常見情況下同時是漸近無偏 + 漸近有效的「最好」估計量。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 8px 0; }
    .centered-eq.big { font-size: 15px; padding: 12px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .truth { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; text-align: center; margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }

    .est-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .ctrl { display: flex; gap: 10px; align-items: center; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh2EstimatorPropertiesComponent {
  readonly TRIALS = 1000;
  readonly BINS = 40;
  readonly trueMu = 5;
  readonly trueSigma = 2;
  readonly ticks = [0, 2, 4, 5, 6, 8, 10];

  readonly ests: Array<{ id: EstId; name: string }> = [
    { id: 'mean', name: '樣本均值 X̄' },
    { id: 'median', name: '中位數' },
    { id: 'firstObs', name: '只用 X₁' },
    { id: 'mid', name: '(min+max)/2' },
  ];
  readonly est = signal<EstId>('mean');
  readonly n = signal(20);
  private readonly seed = signal(0);

  mapX(x: number): number {
    return (x / 10) * 400;
  }

  private readonly samples = computed(() => {
    this.seed();
    const n = this.n();
    const est = this.est();
    const out: number[] = [];
    for (let t = 0; t < this.TRIALS; t++) {
      const data: number[] = [];
      for (let i = 0; i < n; i++) data.push(randNormal(this.trueMu, this.trueSigma));
      out.push(this.computeStat(est, data));
    }
    return out;
  });

  private computeStat(est: EstId, xs: number[]): number {
    if (est === 'mean') return xs.reduce((a, b) => a + b, 0) / xs.length;
    if (est === 'firstObs') return xs[0];
    if (est === 'mid') return (Math.min(...xs) + Math.max(...xs)) / 2;
    const sorted = [...xs].sort((a, b) => a - b);
    const m = sorted.length;
    return m % 2 === 1 ? sorted[(m - 1) / 2] : (sorted[m / 2 - 1] + sorted[m / 2]) / 2;
  }

  readonly empMean = computed(() => {
    const s = this.samples();
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
  readonly empVar = computed(() => {
    const s = this.samples();
    const m = this.empMean();
    return s.reduce((a, b) => a + (b - m) ** 2, 0) / s.length;
  });
  readonly empMSE = computed(() => {
    const s = this.samples();
    return s.reduce((a, b) => a + (b - this.trueMu) ** 2, 0) / s.length;
  });

  readonly hist = computed(() => {
    const s = this.samples();
    const xmin = 0, xmax = 10;
    const bw = 400 / this.BINS;
    const counts = new Array(this.BINS).fill(0);
    for (const x of s) {
      const idx = Math.floor(((x - xmin) / (xmax - xmin)) * this.BINS);
      if (idx >= 0 && idx < this.BINS) counts[idx]++;
    }
    const maxC = Math.max(1, ...counts);
    return counts.map((c, i) => ({ x: i * bw, w: bw - 0.3, h: (c / maxC) * 70 }));
  });

  resample() { this.seed.update(s => s + 1); }
}
