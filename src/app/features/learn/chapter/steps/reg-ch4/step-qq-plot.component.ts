import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type DistId = 'normal' | 't3' | 'skewed' | 'bimodal';

function randNormal(): number {
  const u1 = Math.random() || 1e-9;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
}

function sample(d: DistId): number {
  if (d === 'normal') return randNormal();
  if (d === 't3') {
    // Student-t df=3 via: X/sqrt(Chi²(3)/3)
    const z = randNormal();
    const chi = randNormal() ** 2 + randNormal() ** 2 + randNormal() ** 2;
    return z / Math.sqrt(chi / 3);
  }
  if (d === 'skewed') return Math.log(-Math.log(1 - (Math.random() || 1e-9)));  // right-skewed
  // bimodal
  return randNormal() * 0.5 + (Math.random() < 0.5 ? -1.5 : 1.5);
}

// Inverse normal CDF (Beasley-Springer-Moro approximation)
function normInv(p: number): number {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969,
             138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887,
             66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184,
             -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143,
             3.75440866190742];
  const pLow = 0.02425;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p < 1 - pLow) {
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
         ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

@Component({
  selector: 'app-reg-ch4-qq-plot',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Q–Q Plot：診斷常態性" subtitle="§4.2">
      <p>
        Q–Q plot（quantile-quantile）把你的資料分位數畫在 y 軸，理論分佈（通常 Normal）分位數畫在 x 軸。
        若兩者<strong>吻合，點落在 45° 直線上</strong>；否則形狀會透露出差異。
      </p>

      <h4>三種常見圖形</h4>
      <table class="shapes">
        <thead><tr><th>Q–Q plot 形狀</th><th>代表</th><th>對推論影響</th></tr></thead>
        <tbody>
          <tr><td>直線</td><td>常態 ✓</td><td>無影響</td></tr>
          <tr><td>S 形 / 兩端翹</td><td>重尾 (t, Cauchy)</td><td>CI 過窄、多假顯著</td></tr>
          <tr><td>反 S / 兩端下彎</td><td>輕尾</td><td>CI 過寬、檢定力損失</td></tr>
          <tr><td>右端上翹</td><td>右偏</td><td>偏誤的 SE 估計</td></tr>
        </tbody>
      </table>

      <div class="key-idea">
        <strong>何時煩惱常態性？</strong>
        <ul>
          <li>小樣本（n &lt; 30）：煩惱——CI 與 p-value 都靠常態</li>
          <li>大樣本（n ≥ 100）：CLT 救你——即使殘差不常態，β̂ 仍近似常態</li>
          <li>嚴重偏斜 / 重尾：考慮 log 轉換或 robust 方法</li>
        </ul>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="切換四種分佈。看 Q–Q plot 如何反應">
      <div class="dist-tabs">
        @for (d of dists; track d.id) {
          <button class="pill" [class.active]="dist() === d.id" (click)="setDist(d.id)">{{ d.name }}</button>
        }
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">n 樣本數</span>
          <input type="range" min="15" max="300" step="5" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <button class="resample" (click)="resample()">重新抽樣</button>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">樣本直方圖</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="160" x2="210" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            @for (b of hist(); track b.x) {
              <rect [attr.x]="b.x" [attr.y]="160 - b.h" [attr.width]="b.w" [attr.height]="b.h"
                    fill="var(--accent)" opacity="0.65" />
            }
          </svg>
        </div>
        <div class="p">
          <div class="p-title">Q–Q plot</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <!-- Reference line -->
            <line [attr.x1]="mapQX(-3)" [attr.y1]="mapQY(-3)" [attr.x2]="mapQX(3)" [attr.y2]="mapQY(3)"
                  stroke="#5ca878" stroke-width="1.5" stroke-dasharray="4 2" />
            <line x1="24" y1="170" x2="210" y2="170" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="10" x2="24" y2="170" stroke="var(--border-strong)" stroke-width="1" />
            @for (p of qq(); track $index) {
              <circle [attr.cx]="mapQX(p.theo)" [attr.cy]="mapQY(p.emp)" r="2.5"
                      fill="var(--text)" opacity="0.7" />
            }
            <text x="117" y="178" class="tk" text-anchor="middle">理論分位數</text>
            <text x="6" y="14" class="tk">樣本分位數</text>
          </svg>
        </div>
      </div>

      <div class="diag-tag" [class.ok]="dist() === 'normal'">
        {{ diagnosis() }}
      </div>

      <p class="note">
        <strong>Normal：</strong>點貼緊對角線 ✓<br>
        <strong>t(3) 重尾：</strong>兩端翹出對角線（樣本分位比理論更極端）<br>
        <strong>右偏：</strong>右上方往上飄、左下方卡住<br>
        <strong>雙峰：</strong>中段偏離、S 形明顯
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>Q–Q 之外：檢定常態性的正式方法</h4>
      <ul class="tests">
        <li><strong>Shapiro–Wilk</strong>：小樣本最強常態性檢定</li>
        <li><strong>Kolmogorov–Smirnov</strong>：通用分佈檢定</li>
        <li><strong>Anderson–Darling</strong>：強調尾巴的版本</li>
      </ul>
      <p>
        但實務上：<strong>n 大時這些檢定太靈敏</strong>——會因為幾乎不影響推論的微偏離就拒絕常態。
        比起檢定，<em>看 Q–Q plot 自己判斷偏離的嚴重程度</em>通常更務實。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Q–Q plot = 把「形狀是否像 Normal」變成「線是否直」。
        小樣本時重要；大樣本有 CLT 兜底。
        嚴重偏斜或重尾時，轉換（log, Box-Cox）或 robust 方法比繼續套線性迴歸有效。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea ul { margin: 6px 0 0 20px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .shapes { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .shapes th, .shapes td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .shapes th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .shapes td:first-child { font-family: 'JetBrains Mono', monospace; color: var(--text); font-weight: 600; }

    .dist-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 70px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .diag-tag { font-size: 13px; padding: 8px; text-align: center; margin-top: 8px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border); color: #b06c4a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .diag-tag.ok { color: #5ca878; border-color: rgba(92, 168, 120, 0.3); }

    .tests { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .tests strong { color: var(--accent); }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh4QqPlotComponent {
  readonly dists: Array<{ id: DistId; name: string }> = [
    { id: 'normal', name: 'Normal（常態）' },
    { id: 't3', name: 't(3)（重尾）' },
    { id: 'skewed', name: '右偏' },
    { id: 'bimodal', name: '雙峰' },
  ];
  readonly dist = signal<DistId>('normal');
  readonly n = signal(60);
  private readonly seed = signal(0);

  setDist(d: DistId) { this.dist.set(d); this.resample(); }
  resample() { this.seed.update(s => s + 1); }

  readonly samples = computed(() => {
    this.seed();
    const d = this.dist();
    const n = this.n();
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push(sample(d));
    return out;
  });

  readonly qq = computed(() => {
    const sorted = [...this.samples()].sort((a, b) => a - b);
    const n = sorted.length;
    // Standardize empirical
    const mean = sorted.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    return sorted.map((v, i) => ({
      emp: (v - mean) / Math.max(sd, 1e-9),
      theo: normInv((i + 0.5) / n),
    }));
  });

  readonly hist = computed(() => {
    const data = this.samples();
    const mean = data.reduce((s, v) => s + v, 0) / data.length;
    const sd = Math.sqrt(data.reduce((s, v) => s + (v - mean) ** 2, 0) / data.length);
    const BINS = 25;
    const lo = -4, hi = 4;
    const bw = 186 / BINS;
    const counts = new Array(BINS).fill(0);
    for (const v of data) {
      const z = (v - mean) / Math.max(sd, 1e-9);
      const idx = Math.floor(((z - lo) / (hi - lo)) * BINS);
      if (idx >= 0 && idx < BINS) counts[idx]++;
    }
    const maxC = Math.max(1, ...counts);
    return counts.map((c, i) => ({ x: 24 + i * bw, w: bw - 0.5, h: (c / maxC) * 145 }));
  });

  readonly diagnosis = computed(() => {
    switch (this.dist()) {
      case 'normal': return '✓ 點貼緊對角線——常態假設合理';
      case 't3': return '✗ 兩端翹 → 重尾，推論 CI 可能過窄';
      case 'skewed': return '✗ 右端上翹 / 左端下壓 → 右偏';
      case 'bimodal': return '✗ S 形、中段偏離 → 雙峰';
    }
  });

  mapQX(x: number): number { return 24 + ((x + 3.5) / 7) * 186; }
  mapQY(y: number): number { return 170 - ((y + 3.5) / 7) * 160; }
}
