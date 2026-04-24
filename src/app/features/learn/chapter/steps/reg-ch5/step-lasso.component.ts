import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch5-lasso',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Lasso：L1 懲罰與稀疏解" subtitle="§5.3">
      <p>
        Ridge 用平方懲罰 (L2)；Lasso 改用絕對值 (L1)：
      </p>
      <div class="centered-eq big">
        β̂_lasso = argmin ‖Y − Xβ‖² + λ Σ|βⱼ|
      </div>
      <p>
        看似只改了懲罰形式。效果卻大不相同——
        <strong>Lasso 會把許多 βⱼ 精確地壓為 0</strong>，
        自動完成變數選擇。
      </p>

      <h4>幾何：為什麼是 0，不是小數</h4>
      <p>
        想像二維 (β₁, β₂) 平面：
      </p>
      <ul class="geo">
        <li>OLS 目標函數 ‖Y − Xβ‖² 是一個橢圓</li>
        <li>L2 約束 β₁² + β₂² ≤ t 是一個<strong>圓</strong></li>
        <li>L1 約束 |β₁| + |β₂| ≤ t 是一個<strong>菱形</strong></li>
      </ul>
      <p>
        橢圓與圓相切點幾乎永遠在內部 → β 全都非零。<br>
        橢圓與菱形相切點很常落在「尖角」——那些點<em>至少有一個 βⱼ = 0</em>。
        尖角就是稀疏來源。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換 Ridge vs Lasso。看 λ 升高時係數如何消失">
      <div class="ctrl-row">
        <div class="pat-tabs">
          <button class="pill" [class.active]="method() === 'lasso'" (click)="method.set('lasso')">Lasso (L1)</button>
          <button class="pill" [class.active]="method() === 'ridge'" (click)="method.set('ridge')">Ridge (L2)</button>
        </div>
        <div class="sl">
          <span class="sl-lab">log λ</span>
          <input type="range" min="-3" max="2" step="0.05" [value]="logLambda()"
            (input)="logLambda.set(+$any($event).target.value)" />
          <span class="sl-val">{{ logLambda().toFixed(2) }}</span>
        </div>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">{{ method() === 'lasso' ? 'Lasso path' : 'Ridge trace' }}</div>
          <svg viewBox="0 0 260 200" class="p-svg">
            <line x1="24" y1="100" x2="250" y2="100" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
            <line x1="24" y1="10" x2="24" y2="190" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="190" x2="250" y2="190" stroke="var(--border-strong)" stroke-width="1" />
            @for (trace of traces(); track trace.idx) {
              <path [attr.d]="trace.d" fill="none" [attr.stroke]="trace.color" stroke-width="1.6" />
            }
            <line [attr.x1]="mapLambdaX(logLambda())" y1="10" [attr.x2]="mapLambdaX(logLambda())" y2="190"
                  stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2" />
            <text x="137" y="199" class="tk" text-anchor="middle">log λ →</text>
            <text x="10" y="18" class="tk">β̂</text>
          </svg>
        </div>

        <div class="p">
          <div class="p-title">約束幾何：橢圓 vs 約束區域</div>
          <svg viewBox="-120 -120 240 240" class="p-svg">
            <!-- Axes -->
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
            <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />
            <!-- OLS ellipse (contours of SSE) -->
            @for (c of contours; track c) {
              <ellipse cx="50" cy="-30" [attr.rx]="c * 1.5" [attr.ry]="c"
                       transform="rotate(30 50 -30)"
                       fill="none" stroke="var(--text-muted)" stroke-width="0.8" opacity="0.5" />
            }
            <!-- Constraint region -->
            @if (method() === 'lasso') {
              <!-- Diamond -->
              <polygon [attr.points]="diamondPoints()" fill="var(--accent)" opacity="0.15" stroke="var(--accent)" stroke-width="1.5" />
            } @else {
              <!-- Circle -->
              <circle cx="0" cy="0" [attr.r]="constraintR()" fill="var(--accent)" opacity="0.15" stroke="var(--accent)" stroke-width="1.5" />
            }
            <!-- OLS optimum -->
            <circle cx="50" cy="-30" r="3" fill="#5ca878" />
            <text x="56" y="-34" class="tk grn">OLS</text>
            <!-- Constrained optimum (schematic) -->
            <circle [attr.cx]="constrainedX()" [attr.cy]="constrainedY()" r="4" fill="var(--accent)" />
            <text x="-100" y="105" class="tk">β₁</text>
            <text x="5" y="-100" class="tk">β₂</text>
          </svg>
        </div>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">非零係數數</div><div class="st-v">{{ nonzeroCount() }}</div></div>
        <div class="st"><div class="st-l">‖β̂‖₁</div><div class="st-v">{{ l1Norm().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">訓練 MSE</div><div class="st-v">{{ trainMSE().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">測試 MSE</div><div class="st-v">{{ testMSE().toFixed(3) }}</div></div>
      </div>

      <p class="note">
        Lasso：λ 升高時，<strong>一個一個</strong>變數突然掉到 0——稀疏解。<br>
        Ridge：所有 β 同時連續收縮，<em>永不</em>到 0。<br>
        右圖直接看：菱形尖角 vs 圓的平滑——<strong>幾何形狀決定了稀疏性</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>何時用 Lasso vs Ridge</h4>
      <table class="cmp">
        <thead><tr><th>情況</th><th>建議</th></tr></thead>
        <tbody>
          <tr><td>預期只有少數變數真重要</td><td class="acc-c"><strong>Lasso</strong>（稀疏）</td></tr>
          <tr><td>變數全都有點貢獻</td><td class="acc-c"><strong>Ridge</strong>（平滑收縮）</td></tr>
          <tr><td>有高度相關的變數群組</td><td class="acc-c"><strong>Elastic Net</strong>（下一節）</td></tr>
          <tr><td>p &gt;&gt; n，想做變數選擇</td><td class="acc-c"><strong>Lasso</strong> 或 Elastic Net</td></tr>
        </tbody>
      </table>

      <p class="takeaway">
        <strong>take-away：</strong>
        Lasso 用 L1 懲罰把某些係數壓成 0 → 自動變數選擇。
        幾何根源是菱形尖角。Lasso 在變數很多但真正有用的只幾個時威力巨大——
        基因組分析、文本分類都是它的舞台。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .geo { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .geo strong { color: var(--accent); }
    .geo em { color: var(--accent); font-style: normal; font-weight: 600; }

    .ctrl-row { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
    .pat-tabs { display: flex; gap: 6px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 50px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .cmp { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .cmp th, .cmp td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .cmp th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .acc-c { color: var(--accent); }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
    .note strong { color: var(--accent); }
    .note em { color: var(--accent); font-style: normal; font-weight: 600; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh5LassoComponent {
  readonly method = signal<'lasso' | 'ridge'>('lasso');
  readonly logLambda = signal(-1);
  readonly contours = [12, 24, 36, 48, 60, 72, 84];
  readonly P = 6;
  readonly N = 50;
  readonly colors = ['#5a8aa8', '#b06c4a', '#ba8d2a', '#5ca878', '#9b6a9b', '#c58a6d'];
  readonly trueBeta = [2.5, -1.8, 0, 0.5, 0, 1.2, 0.3];

  readonly lambda = computed(() => Math.exp(this.logLambda() * Math.log(10)));

  readonly trainData = computed(() => this.gen(1));
  readonly testData = computed(() => this.gen(100));

  private gen(seed: number) {
    const rng = this.mulberry(seed);
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
  }

  private lassoFit(lam: number): number[] {
    const { X, Y } = this.trainData();
    const p = X[0].length;
    const b = new Array(p).fill(0);
    // Simple coordinate descent with soft-threshold
    const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtY: number[] = new Array(p).fill(0);
    for (let i = 0; i < X.length; i++) {
      for (let j = 0; j < p; j++) {
        XtY[j] += X[i][j] * Y[i];
        for (let k = 0; k < p; k++) XtX[j][k] += X[i][j] * X[i][k];
      }
    }
    for (let iter = 0; iter < 300; iter++) {
      for (let j = 0; j < p; j++) {
        let r = XtY[j];
        for (let k = 0; k < p; k++) if (k !== j) r -= XtX[j][k] * b[k];
        if (j === 0) {
          b[j] = r / XtX[j][j];  // don't penalize intercept
        } else {
          const denom = XtX[j][j];
          if (denom < 1e-9) { b[j] = 0; continue; }
          if (r > lam) b[j] = (r - lam) / denom;
          else if (r < -lam) b[j] = (r + lam) / denom;
          else b[j] = 0;
        }
      }
    }
    return b;
  }

  private ridgeFit(lam: number): number[] {
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
    for (let j = 1; j < p; j++) XtX[j][j] += lam;
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

  readonly betaHat = computed(() =>
    this.method() === 'lasso' ? this.lassoFit(this.lambda()) : this.ridgeFit(this.lambda())
  );

  readonly nonzeroCount = computed(() => this.betaHat().slice(1).filter(v => Math.abs(v) > 1e-4).length);
  readonly l1Norm = computed(() => this.betaHat().slice(1).reduce((s, v) => s + Math.abs(v), 0));

  private computeMSE(b: number[], data: { X: number[][]; Y: number[] }): number {
    let s = 0;
    for (let i = 0; i < data.X.length; i++) {
      let yh = 0;
      for (let j = 0; j < b.length; j++) yh += b[j] * data.X[i][j];
      s += (data.Y[i] - yh) ** 2;
    }
    return s / data.X.length;
  }

  readonly trainMSE = computed(() => this.computeMSE(this.betaHat(), this.trainData()));
  readonly testMSE = computed(() => this.computeMSE(this.betaHat(), this.testData()));

  mapLambdaX(logL: number): number { return 24 + ((logL + 3) / 5) * 226; }

  readonly traces = computed(() => {
    const logLs = Array.from({ length: 30 }, (_, i) => -3 + (i * 5) / 29);
    const fit = this.method() === 'lasso' ? (l: number) => this.lassoFit(l) : (l: number) => this.ridgeFit(l);
    const allBetas = logLs.map(ll => fit(Math.exp(ll * Math.log(10))));
    const maxAbs = Math.max(1, ...allBetas.flat().map(Math.abs));
    const out = [];
    for (let k = 1; k <= this.P; k++) {
      const pts: string[] = [];
      logLs.forEach((ll, i) => {
        const px = this.mapLambdaX(ll);
        const py = 100 - (allBetas[i][k] / maxAbs) * 85;
        pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
      });
      out.push({ idx: k, d: pts.join(' '), color: this.colors[(k - 1) % this.colors.length] });
    }
    return out;
  });

  // Geometry visualization
  diamondPoints(): string {
    const r = this.constraintR();
    return `0,${-r} ${r},0 0,${r} ${-r},0`;
  }

  constraintR(): number {
    // Make constraint grow / shrink with lambda (schematic, reversed)
    return Math.max(15, 90 - this.logLambda() * 20);
  }

  constrainedX(): number {
    // OLS at (50, -30). Constraint region centered at 0.
    // Approximation of constrained optimum direction
    const r = this.constraintR();
    const norm = Math.sqrt(50 * 50 + 30 * 30);
    if (this.method() === 'lasso') {
      // Snap to corner for small r
      const t = Math.min(1, r / norm);
      if (r < norm * 0.7) {
        // Project to nearest corner heuristic
        return Math.sign(50) * r;
      }
      return 50 * t;
    }
    return (50 / norm) * Math.min(r, norm);
  }

  constrainedY(): number {
    const r = this.constraintR();
    const norm = Math.sqrt(50 * 50 + 30 * 30);
    if (this.method() === 'lasso') {
      if (r < norm * 0.7) return 0;  // snap to β₁ axis corner
      return -30 * Math.min(1, r / norm);
    }
    return (-30 / norm) * Math.min(r, norm);
  }

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
