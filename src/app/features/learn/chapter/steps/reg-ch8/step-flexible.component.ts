import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type Model = 'linear' | 'poly' | 'spline' | 'loess';

@Component({
  selector: 'app-reg-ch8-flexible',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="超越直線：多項式、Spline、LOESS" subtitle="§8.1">
      <p>
        線性模型的「線性」指<strong>對 β 線性</strong>，不是對 x 線性。
        <code>y = β₀ + β₁ x + β₂ x²</code> 仍是線性模型——只要把 x² 當新變數。
      </p>

      <h4>三個擴充曲線的方法</h4>
      <ol class="methods">
        <li>
          <strong>多項式 Polynomial</strong>：<code>y = β₀ + β₁ x + β₂ x² + … + β_p xᵖ</code><br>
          簡單但<em>高階多項式</em>在資料範圍邊界狂震（Runge 現象）。
        </li>
        <li>
          <strong>Spline</strong>：把 x 區間切成幾段（用「結點」knots），每段用低階多項式（通常 3 階），
          在結點處光滑接合。<em>自然 cubic spline</em> 更進一步要求兩端線性。
        </li>
        <li>
          <strong>LOESS / Local Regression</strong>：對每個目標點 x₀，
          用附近的點做<em>加權</em>線性迴歸（距離越近權重越大）。完全無參數。
        </li>
      </ol>
    </app-prose-block>

    <app-challenge-card prompt="切換四種模型，看擬合曲線">
      <div class="mode-tabs">
        <button class="pill" [class.active]="model() === 'linear'" (click)="model.set('linear')">線性</button>
        <button class="pill" [class.active]="model() === 'poly'" (click)="model.set('poly')">多項式</button>
        <button class="pill" [class.active]="model() === 'spline'" (click)="model.set('spline')">Spline</button>
        <button class="pill" [class.active]="model() === 'loess'" (click)="model.set('loess')">LOESS</button>
      </div>

      <div class="ctrl">
        @if (model() === 'poly') {
          <div class="sl">
            <span class="sl-lab">階數 p</span>
            <input type="range" min="1" max="10" step="1" [value]="polyDegree()"
              (input)="polyDegree.set(+$any($event).target.value)" />
            <span class="sl-val">{{ polyDegree() }}</span>
          </div>
        }
        @if (model() === 'spline') {
          <div class="sl">
            <span class="sl-lab">結點數</span>
            <input type="range" min="2" max="10" step="1" [value]="nKnots()"
              (input)="nKnots.set(+$any($event).target.value)" />
            <span class="sl-val">{{ nKnots() }}</span>
          </div>
        }
        @if (model() === 'loess') {
          <div class="sl">
            <span class="sl-lab">帶寬</span>
            <input type="range" min="0.1" max="0.8" step="0.02" [value]="loessBand()"
              (input)="loessBand.set(+$any($event).target.value)" />
            <span class="sl-val">{{ loessBand().toFixed(2) }}</span>
          </div>
        }
        <button class="resample" (click)="resample()">重新抽樣</button>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 240" class="p-svg">
          <line x1="40" y1="210" x2="420" y2="210" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="210" stroke="var(--border-strong)" stroke-width="1" />

          <!-- True function -->
          <path [attr.d]="truePath()" fill="none" stroke="#5ca878" stroke-width="1.5" stroke-dasharray="4 2" />

          <!-- Fitted curve -->
          <path [attr.d]="fitPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />

          <!-- Data -->
          @for (p of data(); track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="2.8" fill="var(--text)" opacity="0.6" />
          }

          <!-- Spline knots -->
          @if (model() === 'spline') {
            @for (k of splineKnots(); track k) {
              <line [attr.x1]="mapX(k)" y1="20" [attr.x2]="mapX(k)" y2="210"
                    stroke="#ba8d2a" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.5" />
            }
          }
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw grn"></span>真函數</span>
        <span class="leg"><span class="sw acc"></span>擬合曲線</span>
        @if (model() === 'spline') {
          <span class="leg"><span class="sw ywa"></span>結點位置</span>
        }
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">方法</div><div class="st-v">{{ currentName() }}</div></div>
        <div class="st"><div class="st-l">訓練 MSE</div><div class="st-v">{{ trainMSE().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">測試 MSE</div><div class="st-v">{{ testMSE().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">有效參數</div><div class="st-v">{{ effectiveDf() }}</div></div>
      </div>

      <div class="method-info">
        @switch (model()) {
          @case ('linear') {
            <p>線性：只能抓到「整體趨勢」，非線性結構被當成噪音吸收到殘差——偏誤大。</p>
          }
          @case ('poly') {
            <p>多項式：階數 p 控制彈性。p 小欠擬合，p 大邊界震盪（Runge 現象）。</p>
          }
          @case ('spline') {
            <p>Spline：分段低階多項式，在結點光滑連接。比全域多項式穩定，是「局部 vs 全域」的最佳折衷。</p>
          }
          @case ('loess') {
            <p>LOESS：完全非參數，帶寬越小越靈活（但變異升）。適合探索性分析和平滑殘差圖。</p>
          }
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>更進一步：GAM（廣義加性模型）</h4>
      <p>
        <strong>GAM</strong> = GLM + spline。模型變成：
      </p>
      <div class="centered-eq">
        g(E[Y]) = β₀ + f₁(x₁) + f₂(x₂) + … + f_p(x_p)
      </div>
      <p>
        每個 fⱼ 是一條 spline（資料自己決定形狀），但係數仍可加——
        既保有解釋性（每個變數的貢獻可獨立畫出），又能抓非線性。
        R 的 <code>mgcv</code>、Python 的 <code>pygam</code> 是主流實作。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        多項式最簡單但邊界不穩；spline 是光滑非線性的標準解；LOESS 做探索。
        GAM 把 spline 帶進 GLM 框架——線性模型的最後一個大擴充，
        也是「結構化、可解釋」和「資料驅動」的最佳平衡點。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .methods { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .methods strong { color: var(--accent); }
    .methods em { color: var(--text); font-style: normal; font-weight: 600; }

    .mode-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; min-height: 48px; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; margin-left: auto; }
    .resample:hover { background: var(--accent); color: white; }

    .plot { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.grn { background: #5ca878; }
    .sw.acc { background: var(--accent); }
    .sw.ywa { background: #ba8d2a; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .method-info { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .method-info p { margin: 0; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh8FlexibleComponent {
  readonly model = signal<Model>('spline');
  readonly polyDegree = signal(3);
  readonly nKnots = signal(4);
  readonly loessBand = signal(0.3);
  private readonly seed = signal(0);

  resample() { this.seed.update(s => s + 1); }

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 120 - y * 18; }

  private trueF(x: number): number { return Math.sin(x * 1.1) * 2 + 0.2 * x; }

  readonly train = computed(() => {
    this.seed();
    const rng = this.mulberry(3 + this.seed());
    const n = 25;
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const x = 0.3 + (i * 9.4) / n;
      out.push({ x, y: this.trueF(x) + (rng() - 0.5) * 1.2 });
    }
    return out;
  });

  readonly test = computed(() => {
    const rng = this.mulberry(9999);
    const n = 50;
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const x = 0.3 + (i * 9.4) / n;
      out.push({ x, y: this.trueF(x) + (rng() - 0.5) * 1.2 });
    }
    return out;
  });

  readonly data = computed(() => this.train());

  readonly splineKnots = computed(() => {
    const k = this.nKnots();
    const out: number[] = [];
    for (let i = 1; i <= k; i++) out.push((i * 10) / (k + 1));
    return out;
  });

  currentName(): string {
    const m = this.model();
    if (m === 'linear') return '線性';
    if (m === 'poly') return `多項式 p=${this.polyDegree()}`;
    if (m === 'spline') return `Cubic spline (${this.nKnots()} knots)`;
    return `LOESS (h=${this.loessBand().toFixed(2)})`;
  }

  effectiveDf(): number {
    const m = this.model();
    if (m === 'linear') return 2;
    if (m === 'poly') return this.polyDegree() + 1;
    if (m === 'spline') return this.nKnots() + 4;
    return Math.round(1 / this.loessBand() * 3);
  }

  private predict(x: number): number {
    const m = this.model();
    const train = this.train();
    if (m === 'linear') {
      const f = this.polyFit(train, 1);
      return this.polyEval(f, x);
    }
    if (m === 'poly') {
      const f = this.polyFit(train, this.polyDegree());
      return this.polyEval(f, x);
    }
    if (m === 'spline') {
      return this.splineEval(train, x, this.splineKnots());
    }
    return this.loessEval(train, x, this.loessBand());
  }

  private polyFit(train: Array<{ x: number; y: number }>, d: number): number[] {
    const p = d + 1;
    const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtY: number[] = new Array(p).fill(0);
    for (const pt of train) {
      const pows = [1];
      for (let k = 1; k < p; k++) pows.push(pows[k - 1] * pt.x);
      for (let i = 0; i < p; i++) {
        XtY[i] += pows[i] * pt.y;
        for (let j = 0; j < p; j++) XtX[i][j] += pows[i] * pows[j];
      }
    }
    return this.solve(XtX, XtY);
  }

  private polyEval(c: number[], x: number): number {
    let y = 0, xp = 1;
    for (let i = 0; i < c.length; i++) { y += c[i] * xp; xp *= x; }
    return y;
  }

  private splineEval(train: Array<{ x: number; y: number }>, x: number, knots: number[]): number {
    // Truncated power basis cubic spline
    const basis = (xv: number) => {
      const b = [1, xv, xv * xv, xv * xv * xv];
      for (const k of knots) {
        const d = xv - k;
        b.push(d > 0 ? d * d * d : 0);
      }
      return b;
    };
    const p = 4 + knots.length;
    const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtY: number[] = new Array(p).fill(0);
    for (const pt of train) {
      const b = basis(pt.x);
      for (let i = 0; i < p; i++) {
        XtY[i] += b[i] * pt.y;
        for (let j = 0; j < p; j++) XtX[i][j] += b[i] * b[j];
      }
    }
    const c = this.solve(XtX, XtY);
    const b = basis(x);
    let y = 0;
    for (let i = 0; i < p; i++) y += c[i] * b[i];
    return y;
  }

  private loessEval(train: Array<{ x: number; y: number }>, x0: number, band: number): number {
    // Tricube weights, local linear
    const h = band * 10;  // scale to data range
    let s00 = 0, s01 = 0, s11 = 0, t0 = 0, t1 = 0;
    for (const p of train) {
      const d = Math.abs(p.x - x0) / h;
      if (d >= 1) continue;
      const w = Math.pow(1 - d * d * d, 3);
      s00 += w;
      s01 += w * p.x;
      s11 += w * p.x * p.x;
      t0 += w * p.y;
      t1 += w * p.x * p.y;
    }
    const det = s00 * s11 - s01 * s01;
    if (Math.abs(det) < 1e-9) return 0;
    const a = (s11 * t0 - s01 * t1) / det;
    const b = (s00 * t1 - s01 * t0) / det;
    return a + b * x0;
  }

  private solve(A: number[][], b: number[]): number[] {
    const n = A.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let i = 0; i < n; i++) {
      let max = i;
      for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[max][i])) max = k;
      [M[i], M[max]] = [M[max], M[i]];
      if (Math.abs(M[i][i]) < 1e-12) continue;
      for (let k = i + 1; k < n; k++) {
        const f = M[k][i] / M[i][i];
        for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j];
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = M[i][n];
      for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = Math.abs(M[i][i]) < 1e-12 ? 0 : s / M[i][i];
    }
    return x;
  }

  truePath(): string {
    const pts: string[] = [];
    const N = 150;
    for (let i = 0; i <= N; i++) {
      const x = (i * 10) / N;
      pts.push(`${i === 0 ? 'M' : 'L'} ${this.mapX(x).toFixed(1)} ${this.mapY(this.trueF(x)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  fitPath(): string {
    const pts: string[] = [];
    const N = 150;
    for (let i = 0; i <= N; i++) {
      const x = 0.1 + (i * 9.8) / N;
      const y = this.predict(x);
      const clamped = Math.max(-8, Math.min(8, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${this.mapX(x).toFixed(1)} ${this.mapY(clamped).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly trainMSE = computed(() => {
    const t = this.train();
    return t.reduce((s, p) => s + (p.y - this.predict(p.x)) ** 2, 0) / t.length;
  });

  readonly testMSE = computed(() => {
    const t = this.test();
    return t.reduce((s, p) => s + (p.y - this.predict(p.x)) ** 2, 0) / t.length;
  });

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
