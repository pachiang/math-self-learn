import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch5-cv-elastic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Elastic Net 與交叉驗證" subtitle="§5.4">
      <h4>Elastic Net：L1 + L2 的混合</h4>
      <div class="centered-eq big">
        β̂ = argmin ‖Y − Xβ‖² + λ [α ‖β‖₁ + (1 − α) ½ ‖β‖²]
      </div>
      <p>
        α ∈ [0, 1] 調節兩種懲罰的比例：
      </p>
      <ul class="alpha">
        <li>α = 1 → Lasso（純 L1，稀疏）</li>
        <li>α = 0 → Ridge（純 L2，平滑收縮）</li>
        <li>α = 0.5 → 平均混合，常用預設</li>
      </ul>

      <h4>為什麼要 Elastic Net？</h4>
      <p>
        Lasso 有兩個缺點：
      </p>
      <ul class="weak">
        <li><strong>高度相關變數群組</strong>中，Lasso 任意挑一個、其他全 0——不穩定</li>
        <li>p &gt; n 時，Lasso 至多選 n 個變數</li>
      </ul>
      <p>
        Elastic Net 的 L2 部分鼓勵相關變數「<strong>一起留、一起走</strong>」，解決這兩個問題。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="交叉驗證 Cross-Validation">
      <h4>k-fold CV 流程</h4>
      <ol class="cv">
        <li>把資料切成 k 等分（常見 k = 5 或 10）</li>
        <li>輪流拿每一份當<strong>驗證集</strong>，其他 k − 1 份訓練</li>
        <li>對每個 λ 候選，算 k 次驗證誤差、平均</li>
        <li>選<strong>平均 CV 誤差最小</strong>的 λ，或用「1-SE 規則」選較稀疏的安全版</li>
      </ol>

      <div class="key-idea">
        <strong>1-SE 規則：</strong>
        選<em>CV 誤差在最低點的 1 個標準誤範圍內、但模型最簡單（λ 最大）</em>的那個。
        這傾向更稀疏的模型，實務上通常更好。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="看 5-fold CV 挑 λ：每條細線是一折，粗線是平均">
      <div class="ctrl-row">
        <div class="sl">
          <span class="sl-lab">α 混合比</span>
          <input type="range" min="0" max="1" step="0.05" [value]="alpha()"
            (input)="alpha.set(+$any($event).target.value)" />
          <span class="sl-val">{{ alpha().toFixed(2) }}</span>
        </div>
        <button class="resample" (click)="resample()">重新切折</button>
      </div>

      <div class="p">
        <div class="p-title">5-fold CV 誤差曲線</div>
        <svg viewBox="0 0 440 220" class="p-svg">
          <line x1="40" y1="190" x2="420" y2="190" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border-strong)" stroke-width="1" />
          <!-- Individual folds -->
          @for (fold of foldPaths(); track $index) {
            <path [attr.d]="fold" fill="none" stroke="var(--text-muted)" stroke-width="0.8" opacity="0.4" />
          }
          <!-- Mean CV error -->
          <path [attr.d]="meanPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />
          <!-- 1-SE band -->
          <path [attr.d]="seBand()" fill="var(--accent)" opacity="0.12" />

          <!-- Best lambda marker -->
          <line [attr.x1]="mapLambdaX(bestLogLambda())" y1="10" [attr.x2]="mapLambdaX(bestLogLambda())" y2="190"
                stroke="#5ca878" stroke-width="1.5" stroke-dasharray="3 2" />
          <text [attr.x]="mapLambdaX(bestLogLambda())" y="18" class="tk grn" text-anchor="middle">min</text>
          <!-- 1-SE lambda marker -->
          <line [attr.x1]="mapLambdaX(oneSELogLambda())" y1="10" [attr.x2]="mapLambdaX(oneSELogLambda())" y2="190"
                stroke="#ba8d2a" stroke-width="1.5" stroke-dasharray="3 2" />
          <text [attr.x]="mapLambdaX(oneSELogLambda())" y="18" class="tk ywa" text-anchor="middle">1-SE</text>

          <text x="230" y="208" class="tk" text-anchor="middle">log λ →</text>
          <text x="30" y="14" class="tk">CV 誤差</text>
        </svg>
      </div>

      <div class="stats">
        <div class="st hi"><div class="st-l">min CV λ</div><div class="st-v">{{ bestLogLambda().toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">1-SE λ</div><div class="st-v">{{ oneSELogLambda().toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">min CV 誤差</div><div class="st-v">{{ minCVErr().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">1-SE 處誤差</div><div class="st-v">{{ oneSEErr().toFixed(3) }}</div></div>
      </div>

      <p class="note">
        細灰線：5 個折各自的 CV 誤差——注意它們之間的差距（這就是「誤差的 SE」）。<br>
        粗橘線：平均 CV 誤差，在某個 log λ 達到最小。<br>
        <strong>min λ</strong>（綠線）：平均 CV 最小的位置。<br>
        <strong>1-SE λ</strong>（黃線）：往更大 λ 方向走，直到 CV 誤差超過「min + 1 SE」之前——更保守、更稀疏。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>完整的 workflow</h4>
      <pre class="flow">
1. 標準化 X（mean 0, variance 1）——懲罰才公平
2. 選方法：Lasso / Ridge / ElasticNet
3. 用 k-fold CV 挑 λ（和 α）
4. 用「1-SE 規則」選較簡單模型
5. 固定 λ、用全資料重新擬合
6. 檢查殘差（Ch4）、係數穩定性（bootstrap）
7. 在獨立測試集或新資料上驗證
      </pre>

      <p class="takeaway">
        <strong>take-away：</strong>
        Elastic Net 組合 L1 和 L2 的優點，是正則化迴歸的首選。
        交叉驗證讓 λ 的選擇「資料自己決定」而非主觀。
        這套方法就是所有現代機器學習的基礎建設——從線性迴歸到神經網路的 weight decay。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .alpha, .weak, .cv { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .weak strong, .cv strong { color: var(--accent); }

    .ctrl-row { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }
    .tk.ywa { fill: #ba8d2a; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: #5ca878; background: rgba(92, 168, 120, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.hi .st-v { color: #5ca878; }

    .flow { background: var(--bg-surface); padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text); line-height: 1.8; margin: 10px 0; white-space: pre; overflow-x: auto; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh5CvElasticComponent {
  readonly alpha = signal(0.5);
  private readonly seed = signal(0);

  resample() { this.seed.update(s => s + 1); }

  readonly N = 60;
  readonly P = 6;
  readonly K = 5;
  readonly trueBeta = [2.0, -1.5, 0, 0.3, 0, 0.8, 0.2];

  readonly data = computed(() => {
    this.seed();
    const rng = this.mulberry(3 + this.seed());
    const X: number[][] = [];
    const Y: number[] = [];
    for (let i = 0; i < this.N; i++) {
      const row = [1];
      for (let k = 0; k < this.P; k++) row.push((rng() - 0.5) * 4);
      X.push(row);
      let y = 0;
      for (let k = 0; k < this.P + 1; k++) y += this.trueBeta[k] * row[k];
      y += (rng() - 0.5) * 1.5;
      Y.push(y);
    }
    return { X, Y };
  });

  private enetFit(X: number[][], Y: number[], lam: number, alpha: number): number[] {
    const p = X[0].length;
    const b = new Array(p).fill(0);
    const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtY: number[] = new Array(p).fill(0);
    for (let i = 0; i < X.length; i++) {
      for (let j = 0; j < p; j++) {
        XtY[j] += X[i][j] * Y[i];
        for (let k = 0; k < p; k++) XtX[j][k] += X[i][j] * X[i][k];
      }
    }
    const lamL1 = lam * alpha;
    const lamL2 = lam * (1 - alpha);
    for (let iter = 0; iter < 200; iter++) {
      for (let j = 0; j < p; j++) {
        let r = XtY[j];
        for (let k = 0; k < p; k++) if (k !== j) r -= XtX[j][k] * b[k];
        if (j === 0) {
          b[j] = r / XtX[j][j];
          continue;
        }
        const denom = XtX[j][j] + lamL2;
        if (denom < 1e-9) { b[j] = 0; continue; }
        if (r > lamL1) b[j] = (r - lamL1) / denom;
        else if (r < -lamL1) b[j] = (r + lamL1) / denom;
        else b[j] = 0;
      }
    }
    return b;
  }

  private computeMSE(b: number[], X: number[][], Y: number[]): number {
    let s = 0;
    for (let i = 0; i < X.length; i++) {
      let yh = 0;
      for (let j = 0; j < b.length; j++) yh += b[j] * X[i][j];
      s += (Y[i] - yh) ** 2;
    }
    return s / X.length;
  }

  readonly cvResults = computed(() => {
    const d = this.data();
    const rng = this.mulberry(42 + this.seed());
    const indices = Array.from({ length: this.N }, (_, i) => i);
    // Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const folds: number[][] = Array.from({ length: this.K }, () => []);
    indices.forEach((idx, k) => folds[k % this.K].push(idx));

    const logLs = Array.from({ length: 25 }, (_, i) => -3 + (i * 5) / 24);
    const errs: number[][] = folds.map(() => new Array(logLs.length).fill(0));

    folds.forEach((testIdx, fi) => {
      const testSet = new Set(testIdx);
      const trainX = d.X.filter((_, i) => !testSet.has(i));
      const trainY = d.Y.filter((_, i) => !testSet.has(i));
      const testX = testIdx.map(i => d.X[i]);
      const testY = testIdx.map(i => d.Y[i]);
      logLs.forEach((ll, li) => {
        const lam = Math.exp(ll * Math.log(10));
        const b = this.enetFit(trainX, trainY, lam, this.alpha());
        errs[fi][li] = this.computeMSE(b, testX, testY);
      });
    });

    return { logLs, errs };
  });

  mapLambdaX(logL: number): number { return 40 + ((logL + 3) / 5) * 380; }

  private mapErrY(e: number): number {
    const { errs } = this.cvResults();
    const flat = errs.flat();
    const maxE = Math.max(...flat);
    const minE = Math.min(...flat);
    return 190 - ((e - minE) / (maxE - minE + 1e-9)) * 170;
  }

  foldPaths(): string[] {
    const { logLs, errs } = this.cvResults();
    return errs.map(fold => {
      const pts: string[] = [];
      logLs.forEach((ll, i) => {
        pts.push(`${i === 0 ? 'M' : 'L'} ${this.mapLambdaX(ll).toFixed(1)} ${this.mapErrY(fold[i]).toFixed(1)}`);
      });
      return pts.join(' ');
    });
  }

  meanPath(): string {
    const { logLs, errs } = this.cvResults();
    const pts: string[] = [];
    logLs.forEach((ll, i) => {
      const mean = errs.reduce((s, fold) => s + fold[i], 0) / errs.length;
      pts.push(`${i === 0 ? 'M' : 'L'} ${this.mapLambdaX(ll).toFixed(1)} ${this.mapErrY(mean).toFixed(1)}`);
    });
    return pts.join(' ');
  }

  seBand(): string {
    const { logLs, errs } = this.cvResults();
    const up: string[] = [], lo: string[] = [];
    logLs.forEach((ll, i) => {
      const vals = errs.map(fold => fold[i]);
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
      const se = sd / Math.sqrt(vals.length);
      up.push(`${i === 0 ? 'M' : 'L'} ${this.mapLambdaX(ll).toFixed(1)} ${this.mapErrY(mean + se).toFixed(1)}`);
      lo.push(`L ${this.mapLambdaX(ll).toFixed(1)} ${this.mapErrY(mean - se).toFixed(1)}`);
    });
    return up.join(' ') + ' ' + lo.reverse().join(' ') + ' Z';
  }

  readonly bestLogLambda = computed(() => {
    const { logLs, errs } = this.cvResults();
    let best = logLs[0], bestErr = Infinity;
    logLs.forEach((ll, i) => {
      const mean = errs.reduce((s, fold) => s + fold[i], 0) / errs.length;
      if (mean < bestErr) { bestErr = mean; best = ll; }
    });
    return best;
  });

  readonly minCVErr = computed(() => {
    const { logLs, errs } = this.cvResults();
    let bestErr = Infinity;
    logLs.forEach((_, i) => {
      const mean = errs.reduce((s, fold) => s + fold[i], 0) / errs.length;
      if (mean < bestErr) bestErr = mean;
    });
    return bestErr;
  });

  readonly oneSELogLambda = computed(() => {
    const { logLs, errs } = this.cvResults();
    const means = logLs.map((_, i) => errs.reduce((s, fold) => s + fold[i], 0) / errs.length);
    let bestIdx = 0;
    for (let i = 0; i < means.length; i++) if (means[i] < means[bestIdx]) bestIdx = i;
    const vals = errs.map(fold => fold[bestIdx]);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    const se = sd / Math.sqrt(vals.length);
    const threshold = means[bestIdx] + se;
    let chosen = bestIdx;
    for (let i = bestIdx + 1; i < means.length; i++) {
      if (means[i] <= threshold) chosen = i;
      else break;
    }
    return logLs[chosen];
  });

  readonly oneSEErr = computed(() => {
    const { logLs, errs } = this.cvResults();
    const means = logLs.map((_, i) => errs.reduce((s, fold) => s + fold[i], 0) / errs.length);
    const targetLogL = this.oneSELogLambda();
    let idx = 0;
    for (let i = 0; i < logLs.length; i++) if (Math.abs(logLs[i] - targetLogL) < Math.abs(logLs[idx] - targetLogL)) idx = i;
    return means[idx];
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
