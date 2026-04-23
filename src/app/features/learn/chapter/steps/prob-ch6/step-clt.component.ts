import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type DistId = 'uniform' | 'exp' | 'bernoulli' | 'bimodal';

function sampleFrom(d: DistId): number {
  if (d === 'uniform') return Math.random();
  if (d === 'exp') return -Math.log(1 - Math.random());
  if (d === 'bernoulli') return Math.random() < 0.3 ? 1 : 0;
  // bimodal: 50/50 of two points
  return Math.random() < 0.5 ? 0 : 1;
}

function meanVar(d: DistId): { mu: number; sigma: number } {
  if (d === 'uniform') return { mu: 0.5, sigma: Math.sqrt(1 / 12) };
  if (d === 'exp') return { mu: 1, sigma: 1 };
  if (d === 'bernoulli') return { mu: 0.3, sigma: Math.sqrt(0.3 * 0.7) };
  return { mu: 0.5, sigma: 0.5 };
}

function sampleMeanOfN(d: DistId, n: number): number {
  let s = 0;
  for (let i = 0; i < n; i++) s += sampleFrom(d);
  return s / n;
}

@Component({
  selector: 'app-prob-ch6-clt',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="中央極限定理 (CLT)：王冠寶石" subtitle="§6.2">
      <p>
        給定任何分佈（只要有有限均值 μ 和變異數 σ²）：
      </p>
      <div class="centered-eq big">
        √n · (X̄ₙ − μ) / σ  →ᵈ  N(0, 1)
      </div>
      <p>或者等價地：</p>
      <div class="centered-eq">
        X̄ₙ ≈ N(μ, σ²/n) &nbsp;&nbsp; (n 大時)
      </div>
      <p class="key-idea">
        <strong>CLT 的不可思議之處：</strong>
        不管原分佈什麼形狀（偏斜、多峰、只有 0 和 1），
        多個獨立樣本的<strong>平均</strong>一定會逼近 Normal——
        這解釋了為何鐘形在自然界無處不在。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選分佈 + 樣本大小 n：觀察樣本均值的分佈怎麼變 Normal">
      <div class="dist-tabs">
        @for (d of dists; track d.id) {
          <button class="pill" [class.active]="dist() === d.id" (click)="setDist(d.id)">{{ d.name }}</button>
        }
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">樣本大小 n</span>
          <input type="range" min="1" max="50" step="1" [value]="n()"
            (input)="setN(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="presets">
          @for (k of [1, 2, 5, 10, 30]; track k) {
            <button class="pre" (click)="setN(k)">n={{ k }}</button>
          }
        </div>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">原分佈（一個 X 的樣本直方圖）</div>
          <svg viewBox="-10 -80 420 120" class="p-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            @for (b of origHist(); track b.x) {
              <rect [attr.x]="b.x" [attr.y]="-b.h" [attr.width]="b.w" [attr.height]="b.h"
                fill="var(--text-muted)" opacity="0.6" />
            }
          </svg>
        </div>
        <div class="p">
          <div class="p-title">X̄ₙ 的分佈 (繪 {{ TRIALS }} 次試驗，每次取 n={{ n() }} 個)</div>
          <svg viewBox="-10 -80 420 120" class="p-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />

            <!-- Normal curve overlay -->
            <path [attr.d]="normalOverlay()" fill="none" stroke="#5ca878" stroke-width="2" stroke-dasharray="4 3" opacity="0.85" />

            @for (b of meanHist(); track b.x) {
              <rect [attr.x]="b.x" [attr.y]="-b.h" [attr.width]="b.w" [attr.height]="b.h"
                fill="var(--accent)" opacity="0.7" />
            }
          </svg>
        </div>
      </div>

      <div class="legend-note">
        <span class="leg"><span class="sw acc"></span>樣本均值直方圖</span>
        <span class="leg"><span class="sw grn"></span>N(μ, σ²/n) 理論曲線</span>
      </div>

      <div class="stats">
        <div class="st">
          <div class="st-l">理論 μ</div>
          <div class="st-v">{{ info().mu.toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">理論 σ/√n</div>
          <div class="st-v">{{ (info().sigma / Math.sqrt(n())).toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">實測均值</div>
          <div class="st-v">{{ empMean().toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">實測 std</div>
          <div class="st-v">{{ empStd().toFixed(3) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>觀察：收斂的「速度」</h4>
      <ul class="conv">
        <li><strong>對稱分佈</strong>（Uniform、Bimodal）：n = 2 就接近 Normal 形狀。</li>
        <li><strong>中度偏斜</strong>（Bernoulli）：n ~ 10 開始像。</li>
        <li><strong>重尾偏斜</strong>（Exp）：n ~ 30 才明顯 Normal。</li>
      </ul>
      <p>
        常見經驗法則：<strong>n ≥ 30</strong> 時 CLT 通常夠用。
        但這依分佈而變——重尾或嚴重偏斜時可能需要 n ≥ 100+。
      </p>

      <h4>CLT 的廣義版本</h4>
      <ul class="var">
        <li><strong>Lindeberg-Lévy</strong>：同分佈、獨立、有限變異數——標準版。</li>
        <li><strong>Lyapunov</strong>：放寬同分佈，只要變異數大致均衡。</li>
        <li><strong>多變數 CLT</strong>：多維版本，和變 Multivariate Normal。</li>
        <li><strong>Berry-Esseen</strong>：給出 CLT 的<strong>收斂速度</strong>——|F_n(x) − Φ(x)| ≤ C·ρ/(σ³√n)。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        CLT 把「無數獨立小因素的累積」圈進 Normal。
        這是為什麼 Normal 支配自然界、為什麼我們能用標準差算置信區間、
        為什麼 Gauss、Laplace、Poincaré 都深深著迷於這個定理。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .dist-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .presets { display: flex; gap: 4px; flex-wrap: wrap; }
    .pre { font: inherit; font-size: 10px; padding: 4px 10px; border: 1px solid var(--border); background: var(--bg); border-radius: 12px; cursor: pointer; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .pre:hover { border-color: var(--accent); color: var(--accent); }

    .plots { display: grid; gap: 8px; }
    .p { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }

    .legend-note { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.acc { background: var(--accent); }
    .sw.grn { background: #5ca878; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .conv, .var { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .conv strong, .var strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh6CltComponent {
  readonly Math = Math;
  readonly TRIALS = 3000;
  readonly BINS = 40;
  readonly dists: Array<{ id: DistId; name: string }> = [
    { id: 'uniform', name: 'Uniform(0,1)' },
    { id: 'exp', name: 'Exp(1)（重尾）' },
    { id: 'bernoulli', name: 'Bernoulli(0.3)（偏斜）' },
    { id: 'bimodal', name: 'Bimodal 0/1' },
  ];
  readonly dist = signal<DistId>('uniform');
  readonly n = signal(1);

  setDist(d: DistId) { this.dist.set(d); }
  setN(v: number) { this.n.set(v); }

  readonly info = computed(() => meanVar(this.dist()));

  /** Histogram of single X */
  readonly origHist = computed(() => {
    const d = this.dist();
    const xs: number[] = [];
    for (let i = 0; i < 1000; i++) xs.push(sampleFrom(d));
    const xmin = Math.min(...xs);
    const xmax = Math.max(...xs);
    const range = Math.max(0.01, xmax - xmin);
    const bw = 400 / this.BINS;
    const counts = new Array(this.BINS).fill(0);
    for (const x of xs) {
      const idx = Math.min(this.BINS - 1, Math.floor(((x - xmin) / range) * this.BINS));
      counts[idx]++;
    }
    const maxC = Math.max(...counts);
    return counts.map((c, i) => ({ x: i * bw, w: bw - 0.5, h: (c / maxC) * 70 }));
  });

  private readonly meanSamples = computed(() => {
    const d = this.dist();
    const n = this.n();
    const out: number[] = [];
    for (let i = 0; i < this.TRIALS; i++) out.push(sampleMeanOfN(d, n));
    return out;
  });

  readonly empMean = computed(() => {
    const s = this.meanSamples();
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
  readonly empStd = computed(() => {
    const s = this.meanSamples();
    const m = this.empMean();
    const v = s.reduce((a, b) => a + (b - m) ** 2, 0) / s.length;
    return Math.sqrt(v);
  });

  readonly meanHist = computed(() => {
    const s = this.meanSamples();
    const info = this.info();
    const expStd = info.sigma / Math.sqrt(this.n());
    const xmin = info.mu - 4 * expStd;
    const xmax = info.mu + 4 * expStd;
    const range = xmax - xmin;
    const bw = 400 / this.BINS;
    const counts = new Array(this.BINS).fill(0);
    for (const x of s) {
      const idx = Math.floor(((x - xmin) / range) * this.BINS);
      if (idx >= 0 && idx < this.BINS) counts[idx]++;
    }
    const maxC = Math.max(1, ...counts);
    return counts.map((c, i) => ({ x: i * bw, w: bw - 0.5, h: (c / maxC) * 70 }));
  });

  normalOverlay(): string {
    const info = this.info();
    const expStd = info.sigma / Math.sqrt(this.n());
    const xmin = info.mu - 4 * expStd;
    const xmax = info.mu + 4 * expStd;
    const range = xmax - xmin;
    const pts: string[] = [];
    const N = 200;
    // Amplitude normalization: peak at same height as max histogram bar (~70)
    // N(μ, σ²) peak density = 1/(σ√2π) ≈ 0.399/σ
    // We want it to appear as a full-height curve
    const peakDensity = 1 / (expStd * Math.sqrt(2 * Math.PI));
    for (let i = 0; i <= N; i++) {
      const x = xmin + (range * i) / N;
      const y = (1 / (expStd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - info.mu) / expStd) ** 2);
      const py = -(y / peakDensity) * 55;
      const px = ((x - xmin) / range) * 400;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
