import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch5-ridge',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Ridge 迴歸：L2 正則化" subtitle="§5.2">
      <p>
        OLS 最小化 <code>‖Y − Xβ‖²</code>。Ridge 多加一項懲罰：
      </p>
      <div class="centered-eq big">
        β̂_ridge = argmin ‖Y − Xβ‖² + λ ‖β‖²
      </div>
      <p>
        λ ≥ 0 控制懲罰強度。λ = 0 → 就是 OLS；λ → ∞ → 所有 β̂ → 0。
      </p>

      <h4>封閉解</h4>
      <div class="centered-eq big">
        β̂_ridge = (XᵀX + λI)⁻¹ XᵀY
      </div>
      <p>
        比 OLS 多了 <strong>λI</strong>。這讓矩陣變得<em>必可逆</em>——即使 X 有嚴重共線、甚至 X 的欄數 &gt; 樣本數（p &gt; n），ridge 都能解。
      </p>

      <div class="key-idea">
        <strong>Ridge 的關鍵性質：</strong>
        接受一點偏誤，換取<em>大幅</em>降低變異 → 總 MSE 更低。
        Gauss–Markov 說 OLS 在「線性無偏」裡變異最小——
        Ridge 放棄無偏的條件，獲得了更小的 MSE。
      </div>

      <h4>貝氏詮釋</h4>
      <p>
        若對 β 放 <code>N(0, τ²I)</code> 先驗，MAP 估計剛好就是 Ridge，<code>λ = σ²/τ²</code>。
        <em>L2 懲罰 = Normal 先驗</em>——這是連接頻率派與貝氏派的漂亮橋樑。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="滑動 λ。看每個係數如何「收縮」到 0 的方向（ridge trace）">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">log λ</span>
          <input type="range" min="-4" max="4" step="0.05" [value]="logLambda()"
            (input)="logLambda.set(+$any($event).target.value)" />
          <span class="sl-val">{{ logLambda().toFixed(2) }}</span>
        </div>
        <div class="lam-val">λ = {{ lambda().toFixed(4) }}</div>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">Ridge trace：每個 βⱼ 隨 λ 變化</div>
          <svg viewBox="0 0 260 200" class="p-svg">
            <line x1="24" y1="100" x2="250" y2="100" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
            <line x1="24" y1="10" x2="24" y2="190" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="190" x2="250" y2="190" stroke="var(--border-strong)" stroke-width="1" />
            <!-- Traces -->
            @for (trace of ridgeTraces(); track trace.idx) {
              <path [attr.d]="trace.d" fill="none" [attr.stroke]="trace.color" stroke-width="1.6" />
            }
            <!-- Current lambda marker -->
            <line [attr.x1]="mapLambdaX(logLambda())" y1="10" [attr.x2]="mapLambdaX(logLambda())" y2="190"
                  stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2" />
            <text x="137" y="199" class="tk" text-anchor="middle">log λ →</text>
            <text x="10" y="18" class="tk">β̂</text>
          </svg>
        </div>

        <div class="p">
          <div class="p-title">目前 λ 下的係數</div>
          <svg viewBox="0 0 260 200" class="p-svg">
            <line x1="10" y1="100" x2="250" y2="100" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
            @for (bar of currentBars(); track bar.idx) {
              <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.w" [attr.height]="bar.h"
                    [attr.fill]="bar.color" />
              <text [attr.x]="bar.x + bar.w / 2" y="195" class="tk" text-anchor="middle">β{{ bar.idx + 1 }}</text>
            }
          </svg>
        </div>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">‖β̂‖²</div><div class="st-v">{{ normSq().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">訓練 MSE</div><div class="st-v">{{ trainMSE().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">測試 MSE</div><div class="st-v">{{ testMSE().toFixed(3) }}</div></div>
        <div class="st hi"><div class="st-l">最佳 log λ</div><div class="st-v">{{ bestLogLambda().toFixed(2) }}</div></div>
      </div>

      <p class="note">
        λ = 0：和 OLS 完全一樣，係數可能很大（尤其共線時）。<br>
        λ 升：所有係數<strong>連續地</strong>往 0 收縮，但<em>永不</em>剛好等於 0（這是 L2 的特徵）。<br>
        λ 太大：所有 β̂ → 0，模型退化成常數預測。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>Ridge 為什麼特別救共線性</h4>
      <p>
        XᵀX 共線時接近奇異，其最小特徵值 ≈ 0——對應的方向上 β̂ 的變異巨大。
        加 λI 後最小特徵值變成 λ——<strong>直接把不穩定的方向「撐起來」</strong>。
        幾何上等於把目標函數從「窄谷」變「碗」，優化穩定。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Ridge = OLS + L2 懲罰。封閉解多加 λI，解決共線、降低變異、達到比 OLS 更低的 MSE。
        但它<em>不</em>把任何 β 變成 0——要做變數選擇得用下一節的 Lasso。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; align-items: center; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 50px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .lam-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 700; min-width: 140px; text-align: right; }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: var(--accent-30); background: var(--accent-10); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .note em { color: var(--accent); font-style: normal; font-weight: 600; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh5RidgeComponent {
  readonly logLambda = signal(0);
  readonly P = 6;  // 6 predictors
  readonly N = 50;
  readonly colors = ['#5a8aa8', '#b06c4a', '#ba8d2a', '#5ca878', '#9b6a9b', '#c58a6d'];

  readonly lambda = computed(() => Math.exp(this.logLambda() * Math.log(10)));

  // True coefficients: some big, some small, some zero
  readonly trueBeta = [2.5, -1.8, 0, 0.5, 0, 1.2, 0.3];  // intercept + 6

  readonly trainData = computed(() => this.generate(0));
  readonly testData = computed(() => this.generate(99));

  private generate(seedBase: number) {
    const rng = this.mulberry(seedBase + 5);
    const n = this.N;
    const X: number[][] = [];
    const Y: number[] = [];
    for (let i = 0; i < n; i++) {
      const row = [1];
      for (let k = 0; k < this.P; k++) {
        row.push((rng() - 0.5) * 4);
      }
      X.push(row);
      let y = 0;
      for (let k = 0; k < this.P + 1; k++) y += this.trueBeta[k] * row[k];
      y += (rng() - 0.5) * 1.5;
      Y.push(y);
    }
    return { X, Y };
  }

  private ridgeFit(lambda: number): number[] {
    const { X, Y } = this.trainData();
    const p = X[0].length;
    const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtY: number[] = new Array(p).fill(0);
    for (let i = 0; i < X.length; i++) {
      for (let j = 0; j < p; j++) {
        XtY[j] += X[i][j] * Y[i];
        for (let k = 0; k < p; k++) XtX[j][k] += X[i][j] * X[i][k];
      }
    }
    // Add λI (skip intercept at [0][0])
    for (let j = 1; j < p; j++) XtX[j][j] += lambda;
    return this.solve(XtX, XtY);
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

  readonly betaHat = computed(() => this.ridgeFit(this.lambda()));

  readonly normSq = computed(() => {
    const b = this.betaHat();
    return b.slice(1).reduce((s, v) => s + v * v, 0);
  });

  readonly trainMSE = computed(() => this.computeMSE(this.betaHat(), this.trainData()));
  readonly testMSE = computed(() => this.computeMSE(this.betaHat(), this.testData()));

  private computeMSE(b: number[], data: { X: number[][]; Y: number[] }): number {
    let s = 0;
    for (let i = 0; i < data.X.length; i++) {
      let yh = 0;
      for (let j = 0; j < b.length; j++) yh += b[j] * data.X[i][j];
      s += (data.Y[i] - yh) ** 2;
    }
    return s / data.X.length;
  }

  mapLambdaX(logL: number): number {
    return 24 + ((logL + 4) / 8) * 226;
  }

  readonly ridgeTraces = computed(() => {
    const logLs = Array.from({ length: 40 }, (_, i) => -4 + (i * 8) / 39);
    const allBetas = logLs.map(ll => this.ridgeFit(Math.exp(ll * Math.log(10))));
    const maxAbs = Math.max(1, ...allBetas.flat().map(Math.abs));
    const traces = [];
    for (let k = 1; k <= this.P; k++) {
      const pts: string[] = [];
      logLs.forEach((ll, i) => {
        const px = this.mapLambdaX(ll);
        const py = 100 - (allBetas[i][k] / maxAbs) * 85;
        pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
      });
      traces.push({ idx: k, d: pts.join(' '), color: this.colors[(k - 1) % this.colors.length] });
    }
    return traces;
  });

  readonly currentBars = computed(() => {
    const b = this.betaHat();
    const maxAbs = Math.max(0.1, ...b.slice(1).map(Math.abs));
    const barW = 220 / this.P;
    return Array.from({ length: this.P }, (_, k) => {
      const v = b[k + 1];
      const h = (Math.abs(v) / maxAbs) * 80;
      const x = 20 + k * barW;
      const y = v >= 0 ? 100 - h : 100;
      return { idx: k, x, y, w: barW - 8, h, color: this.colors[k % this.colors.length] };
    });
  });

  readonly bestLogLambda = computed(() => {
    let best = 0, bestErr = Infinity;
    for (let i = 0; i < 40; i++) {
      const ll = -4 + (i * 8) / 39;
      const b = this.ridgeFit(Math.exp(ll * Math.log(10)));
      const err = this.computeMSE(b, this.testData());
      if (err < bestErr) { bestErr = err; best = ll; }
    }
    return best;
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
