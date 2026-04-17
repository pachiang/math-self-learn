import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { generateTerms, harmonicSum, newtonSqrt2 } from './analysis-ch2-util';

@Component({
  selector: 'app-step-important-limits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="三個重要極限" subtitle="§2.7">
      <p>
        這三個極限不只是「練習題」——它們各自揭示了一個深刻的數學現象，
        而且在之後的分析裡反覆出現。
      </p>
    </app-prose-block>

    <!-- ============================= -->
    <!-- 極限 1：(1 + 1/n)^n → e      -->
    <!-- ============================= -->
    <app-prose-block subtitle="極限 1：Euler 常數 e 的誕生">
      <p class="formula-box">aₙ = (1 + 1/n)ⁿ → e ≈ 2.71828...</p>
      <p>
        想像你把 1 元存進銀行，年利率 100%。
      </p>
      <ul>
        <li><strong>年複利</strong>（n=1）：1 年後 (1+1)¹ = <strong>2</strong> 元</li>
        <li><strong>半年複利</strong>（n=2）：(1+1/2)² = <strong>2.25</strong> 元</li>
        <li><strong>月複利</strong>（n=12）：(1+1/12)¹² ≈ <strong>2.613</strong> 元</li>
        <li><strong>日複利</strong>（n=365）：(1+1/365)³⁶⁵ ≈ <strong>2.7146</strong> 元</li>
        <li><strong>連續複利</strong>（n→∞）：→ <strong>e ≈ 2.71828</strong> 元</li>
      </ul>
      <p>
        複利越頻繁，錢越多——但有一個<strong>天花板</strong>。
        不管你複利多頻繁，永遠超不過 e 元。
        這就是「單調遞增 + 有上界 → 收斂」的完美範例。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 n 看 (1+1/n)ⁿ 如何從 2 慢慢爬到 e">
      <div class="ctrl-row">
        <span class="cl">n = {{ eulerN() }}</span>
        <input type="range" min="1" max="200" step="1" [value]="eulerN()"
               (input)="eulerN.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 220" class="limit-svg">
        <line x1="50" y1="190" x2="480" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- e reference -->
        <line x1="50" [attr.y1]="eY(Math.E)" x2="480" [attr.y2]="eY(Math.E)"
              stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="6 3" />
        <text x="484" [attr.y]="eY(Math.E) + 4" class="lim-label">e ≈ 2.718</text>

        <!-- Y ticks -->
        @for (v of [2.0, 2.2, 2.4, 2.6, 2.8]; track v) {
          <line x1="45" [attr.y1]="eY(v)" x2="480" [attr.y2]="eY(v)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="42" [attr.y]="eY(v) + 3" class="ax-label" text-anchor="end">{{ v.toFixed(1) }}</text>
        }

        <!-- Path -->
        <path [attr.d]="eulerPath()" fill="none" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.4" />

        <!-- Dots -->
        @for (t of eulerTerms(); track t.n) {
          <circle [attr.cx]="eNx(t.n)" [attr.cy]="eY(t.val)"
                  [attr.r]="t.n === eulerN() ? 5 : 2.5"
                  fill="var(--accent)" [attr.fill-opacity]="t.n === eulerN() ? 1 : 0.3"
                  [attr.stroke]="t.n === eulerN() ? 'white' : 'none'" stroke-width="1.5" />
        }

        <text x="265" y="210" class="ax-title" text-anchor="middle">n（複利次數）</text>
      </svg>

      <div class="info-row-3">
        <div class="i3">(1 + 1/{{ eulerN() }})^{{ eulerN() }} = <strong>{{ eulerVal().toFixed(8) }}</strong></div>
        <div class="i3">距離 e 還差 <strong>{{ (Math.E - eulerVal()).toExponential(2) }}</strong></div>
      </div>
    </app-challenge-card>

    <!-- ============================= -->
    <!-- 極限 2：調和級數 → ∞          -->
    <!-- ============================= -->
    <app-prose-block subtitle="極限 2：調和級數的驚奇發散">
      <p class="formula-box">Hₙ = 1 + 1/2 + 1/3 + ⋯ + 1/n → ∞</p>
      <p>
        直覺說：每項 1/n → 0，加起來應該收斂吧？<strong>錯！</strong>
      </p>
      <p>
        Oresme（1350 年！）的分組論證：
      </p>
      <div class="grouping">
        <div class="g-row"><span class="g-terms">1</span><span class="g-bound">≥ 1/2</span></div>
        <div class="g-row"><span class="g-terms">1/2</span><span class="g-bound">= 1/2</span></div>
        <div class="g-row"><span class="g-terms">1/3 + 1/4</span><span class="g-bound">≥ 1/4 + 1/4 = 1/2</span></div>
        <div class="g-row"><span class="g-terms">1/5 + 1/6 + 1/7 + 1/8</span><span class="g-bound">≥ 4 × 1/8 = 1/2</span></div>
        <div class="g-row"><span class="g-terms">⋯</span><span class="g-bound">每組 ≥ 1/2</span></div>
      </div>
      <p>
        無限多個 1/2 加起來 = ∞。所以 Hₙ → ∞。
        但它<strong>極慢</strong>——要 H_n > 10 需要 n ≈ 12367，要 H_n > 100 需要 n ≈ 10⁴³。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調和級數：看它慢慢地、但確定地走向無窮">
      <div class="ctrl-row">
        <span class="cl">n = {{ harmonicN() }}</span>
        <input type="range" min="1" max="500" step="1" [value]="harmonicN()"
               (input)="harmonicN.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 220" class="limit-svg">
        <line x1="50" y1="190" x2="480" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- ln(n) reference (asymptotic) -->
        <path [attr.d]="lnPath()" fill="none" stroke="#c8983b" stroke-width="1.2" stroke-dasharray="5 3" />
        <text x="440" y="50" class="lim-label" fill="#c8983b">ln(n) + γ</text>

        @for (v of [1,2,3,4,5,6,7]; track v) {
          <line x1="45" [attr.y1]="hY(v)" x2="480" [attr.y2]="hY(v)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="42" [attr.y]="hY(v) + 3" class="ax-label" text-anchor="end">{{ v }}</text>
        }

        <path [attr.d]="harmonicPath()" fill="none" stroke="var(--accent)" stroke-width="1.5" />

        <!-- Current point -->
        <circle [attr.cx]="hNx(harmonicN())" [attr.cy]="hY(harmonicVal())"
                r="5" fill="var(--accent)" stroke="white" stroke-width="1.5" />

        <text x="265" y="210" class="ax-title" text-anchor="middle">n</text>
      </svg>

      <div class="info-row-3">
        <div class="i3">H_{{ harmonicN() }} = <strong>{{ harmonicVal().toFixed(4) }}</strong></div>
        <div class="i3">ln({{ harmonicN() }}) + γ ≈ <strong>{{ (Math.log(harmonicN()) + 0.5772).toFixed(4) }}</strong></div>
        <div class="i3 muted">Hₙ ≈ ln n + γ（Euler-Mascheroni 常數 γ ≈ 0.577）</div>
      </div>
    </app-challenge-card>

    <!-- ============================= -->
    <!-- 極限 3：Babylonian √2         -->
    <!-- ============================= -->
    <app-prose-block subtitle="極限 3：巴比倫法的驚人速度">
      <p class="formula-box">aₙ₊₁ = ½(aₙ + 2/aₙ) → √2 ≈ 1.41421356...</p>
      <p>
        巴比倫人 4000 年前就用這個方法算平方根。想法很簡單：
      </p>
      <p>
        如果 aₙ 太大（比 √2 大），那 2/aₙ 就太小。取平均 → 更接近 √2。
        反之亦然。每一步都在「往中間靠」。
      </p>
      <p>
        驚人之處：這不是「慢慢靠近」，而是<strong>二次收斂</strong>——每一步的誤差大約是上一步的<strong>平方</strong>。
        這意味著正確位數每步<strong>翻倍</strong>：
      </p>
      <ul>
        <li>第 1 步：1 位正確</li>
        <li>第 2 步：2 位正確</li>
        <li>第 3 步：4 位正確</li>
        <li>第 4 步：<strong>8 位正確</strong></li>
        <li>第 5 步：<strong>16 位正確</strong>——已超越計算器精度！</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="拖 n 看誤差如何以驚人速度暴跌">
      <div class="ctrl-row">
        <span class="cl">n = {{ newtonN() }}</span>
        <input type="range" min="0" max="12" step="1" [value]="newtonN()"
               (input)="newtonN.set(+($any($event.target)).value)" class="sl" />
      </div>

      <!-- 值的收斂 -->
      <div class="newton-table">
        <div class="nt-header">
          <span class="nth">步驟</span>
          <span class="nth">aₙ</span>
          <span class="nth">|aₙ − √2|</span>
          <span class="nth">正確位數</span>
        </div>
        @for (t of newtonTerms(); track t.n) {
          <div class="nt-row" [class.current]="t.n === newtonN()">
            <span class="ntd">{{ t.n }}</span>
            <span class="ntd val">{{ t.valStr }}</span>
            <span class="ntd err">{{ t.errStr }}</span>
            <span class="ntd digits">≈ {{ t.digits }}</span>
          </div>
        }
      </div>

      <!-- 誤差對數圖 -->
      <div class="err-title">誤差（對數尺度）</div>
      <svg viewBox="0 0 500 160" class="err-svg">
        <line x1="50" y1="140" x2="480" y2="140" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="10" x2="50" y2="140" stroke="var(--border)" stroke-width="0.8" />

        @for (p of [-2, -4, -6, -8, -10, -12, -14]; track p) {
          <line x1="45" [attr.y1]="errY(p)" x2="480" [attr.y2]="errY(p)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="42" [attr.y]="errY(p) + 3" class="ax-label" text-anchor="end">10^{{ p }}</text>
        }

        <!-- Error dots -->
        @for (t of newtonErrPoints(); track t.n) {
          <circle [attr.cx]="errNx(t.n)" [attr.cy]="errY(t.logErr)"
                  [attr.r]="t.n === newtonN() ? 5 : 3"
                  fill="#a05a5a" [attr.fill-opacity]="t.n === newtonN() ? 1 : 0.4"
                  [attr.stroke]="t.n === newtonN() ? 'white' : 'none'" stroke-width="1.5" />
        }

        <!-- Connect dots -->
        @if (newtonErrPath()) {
          <path [attr.d]="newtonErrPath()" fill="none" stroke="#a05a5a" stroke-width="1.5" stroke-opacity="0.4" />
        }

        <text x="265" y="156" class="ax-title" text-anchor="middle">步驟 n</text>
      </svg>

      <div class="quadratic-note">
        <strong>二次收斂</strong>：對數圖上誤差幾乎是直線向下——
        每一步 log(誤差) 大約翻倍。這比「普通」的線性收斂快指數級。
      </div>
    </app-challenge-card>

    <!-- ===== 總結 ===== -->
    <app-prose-block subtitle="三個極限的對比">
      <div class="compare-table">
        <div class="ct-header">
          <span class="cth"></span>
          <span class="cth">(1+1/n)ⁿ</span>
          <span class="cth">Hₙ</span>
          <span class="cth">Newton √2</span>
        </div>
        <div class="ct-row">
          <span class="ctd label">收斂？</span>
          <span class="ctd yes">✓ → e</span>
          <span class="ctd no">✗ → ∞</span>
          <span class="ctd yes">✓ → √2</span>
        </div>
        <div class="ct-row">
          <span class="ctd label">單調？</span>
          <span class="ctd">遞增</span>
          <span class="ctd">遞增</span>
          <span class="ctd">遞減（n≥1）</span>
        </div>
        <div class="ct-row">
          <span class="ctd label">有界？</span>
          <span class="ctd yes">✓ 上界 3</span>
          <span class="ctd no">✗ 無上界</span>
          <span class="ctd yes">✓ 下界 √2</span>
        </div>
        <div class="ct-row">
          <span class="ctd label">速度</span>
          <span class="ctd">O(1/n)</span>
          <span class="ctd">O(ln n)</span>
          <span class="ctd accent">O(2⁻²ⁿ) 爆快</span>
        </div>
      </div>
      <p>
        (1+1/n)ⁿ 和 Hₙ 都單調遞增，差別在<strong>有沒有上界</strong>。
        Newton 法則展示了收斂可以<strong>快到什麼程度</strong>。
        下一節看<strong>上極限與下極限</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula-box { text-align: center; font-size: 16px; font-weight: 700; color: var(--accent);
      padding: 14px; background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 10px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .grouping { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin: 10px 0; }
    .g-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .g-terms { padding: 6px 12px; font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .g-bound { padding: 6px 12px; font-size: 13px; font-family: 'JetBrains Mono', monospace;
      color: var(--accent); background: var(--accent-10); font-weight: 600; }

    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .sl { flex: 1; accent-color: var(--accent); height: 22px; }

    .limit-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 8px; }
    .err-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .ax-title { font-size: 9px; fill: var(--text-muted); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .lim-label { font-size: 8px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .info-row-3 { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .i3 { flex: 1; min-width: 120px; padding: 8px 10px; border-radius: 8px; text-align: center;
      font-size: 12px; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.muted { color: var(--text-muted); font-size: 11px; } }
    .i3 strong { color: var(--accent); }

    .newton-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .nt-header { display: grid; grid-template-columns: 50px 1fr 1fr 80px; background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .nth { padding: 6px 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .nt-row { display: grid; grid-template-columns: 50px 1fr 1fr 80px; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.current { background: var(--accent-10); } }
    .ntd { padding: 5px 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      &.val { font-weight: 600; }
      &.err { color: #a05a5a; }
      &.digits { color: var(--accent); font-weight: 700; } }

    .err-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }

    .quadratic-note { padding: 10px; border-radius: 8px; background: rgba(160,90,90,0.06);
      border: 1px solid rgba(160,90,90,0.2); font-size: 12px; color: var(--text-muted); text-align: center; }
    .quadratic-note strong { color: #a05a5a; }

    .compare-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin: 10px 0; }
    .ct-header { display: grid; grid-template-columns: 70px 1fr 1fr 1fr; background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .cth { padding: 6px 8px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-align: center; }
    .ct-row { display: grid; grid-template-columns: 70px 1fr 1fr 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .ctd { padding: 6px 8px; font-size: 12px; text-align: center; font-family: 'JetBrains Mono', monospace; color: var(--text);
      &.label { font-weight: 700; color: var(--text-muted); text-align: left; background: var(--bg-surface); }
      &.yes { color: #5a8a5a; }
      &.no { color: #a05a5a; }
      &.accent { color: var(--accent); font-weight: 700; } }
  `,
})
export class StepImportantLimitsComponent {
  readonly Math = Math;

  // ===== Euler e =====
  readonly eulerN = signal(10);
  readonly eulerVal = computed(() => Math.pow(1 + 1 / this.eulerN(), this.eulerN()));

  readonly eulerTerms = computed(() => {
    const N = this.eulerN();
    const pts: { n: number; val: number }[] = [];
    for (let n = 1; n <= N; n++) pts.push({ n, val: Math.pow(1 + 1 / n, n) });
    return pts;
  });

  eY(v: number): number { return 190 - ((v - 1.9) / 1.0) * 170; }
  eNx(n: number): number { return 50 + (n / 200) * 430; }

  eulerPath(): string {
    return this.eulerTerms().map((t, i) => `${i === 0 ? 'M' : 'L'}${this.eNx(t.n)},${this.eY(t.val)}`).join('');
  }

  // ===== Harmonic =====
  readonly harmonicN = signal(100);
  readonly harmonicVal = computed(() => harmonicSum(this.harmonicN()));

  hY(v: number): number { return 190 - (v / 7.5) * 170; }
  hNx(n: number): number { return 50 + (n / 500) * 430; }

  harmonicPath(): string {
    const N = this.harmonicN();
    const step = Math.max(1, Math.floor(N / 200));
    let path = '';
    for (let n = 1; n <= N; n += step) {
      path += (n === 1 ? 'M' : 'L') + `${this.hNx(n)},${this.hY(harmonicSum(n))}`;
    }
    return path;
  }

  lnPath(): string {
    let path = '';
    for (let n = 1; n <= 500; n += 3) {
      const v = Math.log(n) + 0.5772;
      path += (n === 1 ? 'M' : 'L') + `${this.hNx(n)},${this.hY(v)}`;
    }
    return path;
  }

  // ===== Newton √2 =====
  readonly newtonN = signal(5);

  readonly newtonTerms = computed(() => {
    const N = Math.min(this.newtonN(), 12);
    const terms: { n: number; val: number; valStr: string; errStr: string; digits: number }[] = [];
    for (let n = 0; n <= N; n++) {
      const val = newtonSqrt2(n);
      const err = Math.abs(val - Math.SQRT2);
      const digits = err > 0 ? Math.max(0, Math.floor(-Math.log10(err))) : 16;
      terms.push({
        n, val,
        valStr: val.toFixed(Math.min(15, digits + 2)),
        errStr: err > 1e-16 ? err.toExponential(2) : '< 10⁻¹⁶',
        digits: Math.min(digits, 16),
      });
    }
    return terms;
  });

  readonly newtonErrPoints = computed(() => {
    return this.newtonTerms()
      .filter(t => Math.abs(t.val - Math.SQRT2) > 1e-16)
      .map(t => ({ n: t.n, logErr: Math.log10(Math.abs(t.val - Math.SQRT2)) }));
  });

  errY(logErr: number): number { return 140 - ((logErr + 16) / 16) * 130; }
  errNx(n: number): number { return 50 + (n / 12) * 430; }

  newtonErrPath(): string {
    const pts = this.newtonErrPoints();
    if (pts.length < 2) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${this.errNx(p.n)},${this.errY(p.logErr)}`).join('');
  }
}
