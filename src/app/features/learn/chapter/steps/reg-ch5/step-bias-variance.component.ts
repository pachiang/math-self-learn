import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch5-bias-variance',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="偏誤-變異數取捨與模型選擇準則" subtitle="§5.1">
      <p>
        迴歸的預測誤差可以分解成三部分：
      </p>
      <div class="centered-eq big">
        E[(y − ŷ)²] = Bias(ŷ)² + Var(ŷ) + σ² (不可避免的噪音)
      </div>

      <h4>三條曲線的圖景</h4>
      <ul class="curves">
        <li><strong>偏誤²</strong>：模型太簡單抓不到真相 → 複雜度升 → 偏誤降</li>
        <li><strong>變異</strong>：模型太靈活被資料拉著走 → 複雜度升 → 變異升</li>
        <li><strong>總 MSE</strong>：兩者之和在某個中等複雜度<strong>有極小值</strong>——甜蜜點</li>
      </ul>

      <div class="key-idea">
        <strong>核心權衡：</strong>
        越複雜的模型，<em>訓練</em>誤差越低，但<em>測試</em>誤差先降後升。
        這個 U 形曲線是整個機器學習的基石。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整多項式階數 p。訓練集、測試集誤差走勢一目了然">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">多項式階數 p</span>
          <input type="range" min="1" max="12" step="1" [value]="degree()"
            (input)="degree.set(+$any($event).target.value)" />
          <span class="sl-val">{{ degree() }}</span>
        </div>
        <button class="resample" (click)="resample()">重抽訓練集</button>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">資料 + 擬合曲線（藍：訓練、綠：真函數）</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="160" x2="210" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="10" x2="24" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            <!-- True function -->
            <path [attr.d]="truePath()" fill="none" stroke="#5ca878" stroke-width="1.6" stroke-dasharray="4 2" />
            <!-- Fitted curve -->
            <path [attr.d]="fitPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
            <!-- Training points -->
            @for (p of train(); track $index) {
              <circle [attr.cx]="mapSx(p.x)" [attr.cy]="mapSy(p.y)" r="2.4" fill="#5a8aa8" opacity="0.8" />
            }
          </svg>
        </div>
        <div class="p">
          <div class="p-title">誤差 vs 複雜度</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="160" x2="210" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="10" x2="24" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            <path [attr.d]="trainErrPath()" fill="none" stroke="#5a8aa8" stroke-width="2" />
            <path [attr.d]="testErrPath()" fill="none" stroke="#b06c4a" stroke-width="2" />
            <!-- Current degree marker -->
            <line [attr.x1]="mapDegX(degree())" y1="10" [attr.x2]="mapDegX(degree())" y2="160"
                  stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2" />
            <text x="117" y="175" class="tk" text-anchor="middle">階數 p →</text>
            <text x="30" y="18" class="tk">誤差</text>
          </svg>
        </div>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw bl"></span>訓練誤差</span>
        <span class="leg"><span class="sw org"></span>測試誤差</span>
        <span class="leg"><span class="sw grn"></span>真函數</span>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">訓練 MSE</div><div class="st-v">{{ trainErr().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">測試 MSE</div><div class="st-v">{{ testErr().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">AIC</div><div class="st-v">{{ aic().toFixed(1) }}</div></div>
        <div class="st hi"><div class="st-l">最佳 p（測試）</div><div class="st-v">{{ bestDegree() }}</div></div>
      </div>

      <p class="note">
        p = 1：直線擬合彎曲的真函數 → 偏誤高、欠擬合。<br>
        p = 3~4：甜蜜點附近。<br>
        p ≥ 8：完美穿過每個訓練點但劇烈擺動 → 變異爆炸、過擬合。<br>
        點擊「重抽」——過擬合的模型在新資料集上差異很大（變異高的直接證據）。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>三個模型選擇準則</h4>
      <ul class="criteria">
        <li><strong>AIC = −2 log L + 2k</strong>：加入參數要 log L 提升超過 1 才值得</li>
        <li><strong>BIC = −2 log L + k log n</strong>：懲罰更重（n 大時），傾向更稀疏</li>
        <li><strong>Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p − 1)</strong>：加無用變數會<em>降</em></li>
      </ul>
      <p>
        這些都是「別被訓練誤差騙了」的代用品。更乾脆的做法是<strong>交叉驗證</strong>——
        直接估測試誤差（§5.4 詳述）。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Bias-Variance 是模型選擇的根本。測試誤差呈 U 形——太簡單欠擬合、太複雜過擬合。
        AIC/BIC 懲罰複雜度，CV 直接估測試誤差。下一節起用 Ridge / Lasso 「連續地」調節這個取捨。
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
    .curves, .criteria { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .curves strong, .criteria strong { color: var(--accent); }
    .criteria em { color: var(--text); font-style: normal; font-weight: 600; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 100px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; flex-wrap: wrap; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.bl { background: #5a8aa8; }
    .sw.org { background: #b06c4a; }
    .sw.grn { background: #5ca878; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: var(--accent-30); background: var(--accent-10); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh5BiasVarianceComponent {
  readonly degree = signal(3);
  private readonly seed = signal(0);

  resample() { this.seed.update(s => s + 1); }

  // True function: f(x) = sin(x * 1.2) * 2 + x * 0.3
  private trueF(x: number): number {
    return Math.sin(x * 1.2) * 2 + x * 0.3;
  }

  mapSx(x: number): number { return 24 + (x / 10) * 186; }
  mapSy(y: number): number { return 85 - y * 14; }   // y roughly in [-3, 5]
  mapDegX(d: number): number { return 24 + ((d - 1) / 11) * 186; }

  readonly train = computed(() => {
    this.seed();
    const rng = this.mulberry(7 + this.seed());
    const n = 15;
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const x = 0.5 + (i * 9) / n;
      out.push({ x, y: this.trueF(x) + (rng() - 0.5) * 1.5 });
    }
    return out;
  });

  readonly test = computed(() => {
    const rng = this.mulberry(1000);
    const n = 40;
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const x = 0.2 + (i * 9.6) / n;
      out.push({ x, y: this.trueF(x) + (rng() - 0.5) * 1.5 });
    }
    return out;
  });

  // Fit polynomial of degree d via normal equations
  private fitPoly(train: Array<{ x: number; y: number }>, d: number): number[] {
    const n = train.length;
    const p = d + 1;
    // XtX (p x p), XtY (p)
    const XtX = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtY = new Array(p).fill(0);
    for (const pt of train) {
      const powers = new Array(p);
      powers[0] = 1;
      for (let k = 1; k < p; k++) powers[k] = powers[k - 1] * pt.x;
      for (let i = 0; i < p; i++) {
        XtY[i] += powers[i] * pt.y;
        for (let j = 0; j < p; j++) {
          XtX[i][j] += powers[i] * powers[j];
        }
      }
    }
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

  private evalPoly(c: number[], x: number): number {
    let y = 0;
    let xp = 1;
    for (let i = 0; i < c.length; i++) { y += c[i] * xp; xp *= x; }
    return y;
  }

  readonly coefs = computed(() => this.fitPoly(this.train(), this.degree()));

  readonly trainErr = computed(() => {
    const c = this.coefs();
    const t = this.train();
    return t.reduce((s, p) => s + (p.y - this.evalPoly(c, p.x)) ** 2, 0) / t.length;
  });

  readonly testErr = computed(() => {
    const c = this.coefs();
    const t = this.test();
    return t.reduce((s, p) => s + (p.y - this.evalPoly(c, p.x)) ** 2, 0) / t.length;
  });

  readonly aic = computed(() => {
    const n = this.train().length;
    const mse = this.trainErr();
    return n * Math.log(Math.max(mse, 1e-9)) + 2 * (this.degree() + 1);
  });

  readonly bestDegree = computed(() => {
    let best = 1, bestErr = Infinity;
    for (let d = 1; d <= 12; d++) {
      const c = this.fitPoly(this.train(), d);
      const err = this.test().reduce((s, p) => s + (p.y - this.evalPoly(c, p.x)) ** 2, 0) / this.test().length;
      if (err < bestErr) { bestErr = err; best = d; }
    }
    return best;
  });

  truePath(): string {
    const pts: string[] = [];
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const x = (i * 10) / N;
      pts.push(`${i === 0 ? 'M' : 'L'} ${this.mapSx(x).toFixed(1)} ${this.mapSy(this.trueF(x)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  fitPath(): string {
    const c = this.coefs();
    const pts: string[] = [];
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const x = (i * 10) / N;
      pts.push(`${i === 0 ? 'M' : 'L'} ${this.mapSx(x).toFixed(1)} ${this.mapSy(this.evalPoly(c, x)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  private errPath(errFn: (d: number) => number): string {
    const errs: number[] = [];
    for (let d = 1; d <= 12; d++) errs.push(errFn(d));
    const maxE = Math.max(...errs);
    const pts: string[] = [];
    for (let d = 1; d <= 12; d++) {
      const px = this.mapDegX(d);
      const py = 160 - (errs[d - 1] / Math.max(maxE, 1e-9)) * 140;
      pts.push(`${d === 1 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  trainErrPath(): string {
    return this.errPath(d => {
      const c = this.fitPoly(this.train(), d);
      return this.train().reduce((s, p) => s + (p.y - this.evalPoly(c, p.x)) ** 2, 0) / this.train().length;
    });
  }

  testErrPath(): string {
    return this.errPath(d => {
      const c = this.fitPoly(this.train(), d);
      return this.test().reduce((s, p) => s + (p.y - this.evalPoly(c, p.x)) ** 2, 0) / this.test().length;
    });
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
