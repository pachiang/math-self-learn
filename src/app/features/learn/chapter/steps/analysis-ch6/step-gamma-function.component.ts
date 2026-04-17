import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';

// Lanczos approximation
function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

@Component({
  selector: 'app-step-gamma-function',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- ===== 定義 + 動機 ===== -->
    <app-prose-block title="Gamma 函數" subtitle="§6.8">
      <p>
        n! = 1·2·3·…·n 只對正整數有定義。但如果我們想算 <strong>2.5!</strong> 呢？
        或者 <strong>(−1/3)!</strong>？
      </p>
      <p>
        Euler 在 1729 年發現了一個瑕積分，恰好在正整數上等於階乘——
        而且在中間的點也有定義：
      </p>
      <div class="formula-box">
        <div class="formula-title">Gamma 函數</div>
        <app-math block
          e="\\Gamma(s) \\;=\\; \\int_0^{\\infty} \\,{\\color{#5a7faa} t^{\\,s-1}} \\;\\cdot\\; {\\color{#c8983b} e^{-t}} \\;\\mathrm{d}t \\qquad (s > 0)"></app-math>
      </div>

      <!-- 分區顏色解說 -->
      <div class="formula-explain">
        <div class="fe-row">
          <span class="fe-swatch power-bg"></span>
          <span class="fe-text">
            <strong class="c-power">t<sup>s−1</sup></strong>
            ——「成長力」。t 越大，這項越大。s 越大，成長越猛。<strong>把函數推高。</strong>
          </span>
        </div>
        <div class="fe-row">
          <span class="fe-swatch decay-bg"></span>
          <span class="fe-text">
            <strong class="c-decay">e<sup>−t</sup></strong>
            ——「衰減力」。指數衰減永遠贏，保證積分收斂。<strong>把函數壓下。</strong>
          </span>
        </div>
        <div class="fe-row">
          <span class="fe-swatch balance-bg"></span>
          <span class="fe-text">
            兩者的<strong>拉鋸平衡</strong>形成一個「山丘」，峰在 t ≈ s−1。
            山丘的面積就是 Γ(s)。
          </span>
        </div>
      </div>
    </app-prose-block>

    <!-- ===== 互動 1：被積函數 ===== -->
    <app-challenge-card prompt="拖 s 看被積函數的形狀——曲線下面積就是 Γ(s)">
      <div class="s-ctrl">
        <span class="s-label">s = {{ sVal().toFixed(2) }}</span>
        <input type="range" min="0.2" max="6" step="0.05" [value]="sVal()"
               (input)="sVal.set(+($any($event.target)).value)" class="s-slider" />
      </div>

      <div class="panel-label">
        被積函數
        <strong class="c-power">t<sup>s−1</sup></strong> ·
        <strong class="c-decay">e<sup>−t</sup></strong>
        = 乘積（黑色）
      </div>
      <svg viewBox="0 0 520 220" class="integrand-svg">
        <line x1="50" y1="180" x2="490" y2="180" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="10" x2="50" y2="180" stroke="var(--border)" stroke-width="0.8" />
        @for (xt of [0, 2, 4, 6, 8, 10]; track xt) {
          <text [attr.x]="itx(xt)" y="194" class="ax-label" text-anchor="middle">{{ xt }}</text>
        }
        <text x="270" y="208" class="ax-title" text-anchor="middle">t</text>

        <!-- Component: t^{s-1} (blue dashed, scaled to fit) -->
        <path [attr.d]="powerPath()" fill="none" stroke="#5a7faa" stroke-width="1.5" stroke-dasharray="5 3" stroke-opacity="0.5" />
        <!-- Component: e^{-t} (orange dashed) -->
        <path [attr.d]="decayPath()" fill="none" stroke="#c8983b" stroke-width="1.5" stroke-dasharray="5 3" stroke-opacity="0.5" />

        <!-- Filled area = Γ(s) -->
        <path [attr.d]="integrandArea()" fill="var(--accent)" fill-opacity="0.1" />
        <!-- Product curve (the actual integrand) -->
        <path [attr.d]="integrandPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Peak marker -->
        @if (peakT() > 0.1) {
          <circle [attr.cx]="itx(peakT())" [attr.cy]="ity(peakVal())" r="5"
                  fill="var(--accent)" stroke="white" stroke-width="1.5" />
          <text [attr.x]="itx(peakT()) + 8" [attr.y]="ity(peakVal()) - 6" class="peak-label">
            峰在 t ≈ {{ peakT().toFixed(1) }}
          </text>
        }

        <!-- Legend -->
        <line x1="360" y1="18" x2="380" y2="18" stroke="#5a7faa" stroke-width="1.5" stroke-dasharray="4 3" />
        <text x="385" y="22" class="legend-text power-color">t<tspan baseline-shift="super" font-size="6">s−1</tspan> 成長</text>
        <line x1="360" y1="32" x2="380" y2="32" stroke="#c8983b" stroke-width="1.5" stroke-dasharray="4 3" />
        <text x="385" y="36" class="legend-text decay-color">e<tspan baseline-shift="super" font-size="6">−t</tspan> 衰減</text>
        <line x1="360" y1="46" x2="380" y2="46" stroke="var(--accent)" stroke-width="2" />
        <text x="385" y="50" class="legend-text">乘積</text>
      </svg>

      <div class="result-row">
        <div class="r-card accent">面積 = Γ({{ sVal().toFixed(2) }}) = {{ gammaVal().toFixed(4) }}</div>
        @if (isNearInteger()) {
          <div class="r-card ok">= {{ nearFactorial() }}! = {{ nearFactorialVal() }} ✓</div>
        }
        @if (isNearHalf()) {
          <div class="r-card special">Γ(1/2) = √π ≈ {{ sqrtPi.toFixed(4) }}</div>
        }
      </div>
    </app-challenge-card>

    <!-- ===== 遞推公式 ===== -->
    <app-prose-block subtitle="核心性質：Γ(s+1) = s · Γ(s)">
      <p>
        對 <app-math e="\\Gamma(s+1) = \\int_0^\\infty t^s \\cdot e^{-t}\\,\\mathrm{d}t"></app-math> 做<strong>分部積分</strong>（<app-math e="u = t^s,\\; \\mathrm{d}v = e^{-t}\\,\\mathrm{d}t"></app-math>）：
      </p>
      <app-math block
        e="= \\Big[-t^s e^{-t}\\Big]_0^\\infty + s\\int_0^\\infty t^{\\,s-1} e^{-t}\\,\\mathrm{d}t = 0 + s\\,\\Gamma(s)"></app-math>
      <p>
        加上 <app-math e="\\Gamma(1) = \\int_0^\\infty e^{-t}\\,\\mathrm{d}t = 1"></app-math>，得到：
      </p>
      <div class="recursion-chain">
        <span class="rc-item">Γ(1) = 1</span>
        <span class="rc-arrow">→</span>
        <span class="rc-item">Γ(2) = 1·Γ(1) = 1</span>
        <span class="rc-arrow">→</span>
        <span class="rc-item">Γ(3) = 2·Γ(2) = 2</span>
        <span class="rc-arrow">→</span>
        <span class="rc-item">Γ(4) = 3! = 6</span>
        <span class="rc-arrow">→</span>
        <span class="rc-item">Γ(n) = (n−1)!</span>
      </div>
    </app-prose-block>

    <!-- ===== 互動 2：完整 Γ 圖（含負軸極點）===== -->
    <app-challenge-card prompt="完整的 Γ(s) 圖——包括負軸上的戲劇性極點">
      <svg viewBox="0 0 520 300" class="gamma-svg">
        <line x1="50" y1="150" x2="500" y2="150" stroke="var(--border)" stroke-width="0.8" />
        <line [attr.x1]="gfx(0)" y1="10" [attr.x2]="gfx(0)" y2="290" stroke="var(--border)" stroke-width="0.5" />
        <!-- Y ticks -->
        @for (yt of [-5, -2, 0, 2, 5, 10]; track yt) {
          <line x1="45" [attr.y1]="gfy(yt)" x2="500" [attr.y2]="gfy(yt)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="42" [attr.y]="gfy(yt) + 3" class="ax-label" text-anchor="end">{{ yt }}</text>
        }
        <!-- X ticks -->
        @for (xt of [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]; track xt) {
          <text [attr.x]="gfx(xt)" y="296" class="ax-label" text-anchor="middle">{{ xt }}</text>
        }

        <!-- Pole markers at 0, -1, -2, -3, -4 -->
        @for (p of [0, -1, -2, -3, -4]; track p) {
          <line [attr.x1]="gfx(p)" y1="10" [attr.x2]="gfx(p)" y2="290"
                stroke="#a05a5a" stroke-width="0.8" stroke-dasharray="3 3" stroke-opacity="0.4" />
        }

        <!-- Gamma curve (multiple branches) -->
        @for (branch of gammaBranches(); track $index) {
          <path [attr.d]="branch" fill="none" stroke="var(--accent)" stroke-width="2" />
        }

        <!-- Integer factorial points (positive side) -->
        @for (pt of factorialPoints; track pt.n) {
          <circle [attr.cx]="gfx(pt.n)" [attr.cy]="gfy(pt.val)" r="4"
                  fill="#5a8a5a" stroke="white" stroke-width="1.5" />
          <text [attr.x]="gfx(pt.n) + 6" [attr.y]="gfy(pt.val) - 6" class="fac-label">
            {{ pt.label }}
          </text>
        }

        <!-- Current s probe -->
        @if (gammaVal2() !== null) {
          <circle [attr.cx]="gfx(sVal2())" [attr.cy]="gfy(gammaVal2()!)" r="6"
                  fill="var(--accent)" stroke="white" stroke-width="2" />
        }
        <line [attr.x1]="gfx(sVal2())" y1="10" [attr.x2]="gfx(sVal2())" y2="290"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" stroke-opacity="0.5" />
      </svg>

      <div class="s-ctrl">
        <span class="s-label">s = {{ sVal2().toFixed(2) }}</span>
        <input type="range" min="-3.8" max="5" step="0.02" [value]="sVal2()"
               (input)="sVal2.set(+($any($event.target)).value)" class="s-slider" />
      </div>

      <div class="result-row">
        <div class="r-card">
          Γ({{ sVal2().toFixed(2) }})
          @if (gammaVal2() !== null) {
            = {{ gammaVal2()!.toFixed(4) }}
          } @else {
            = 未定義（極點！）
          }
        </div>
        <div class="r-card muted">
          @if (isNearPole()) {
            🚫 s ≈ {{ nearestPole() }} 是極點——Γ 在負整數和 0 處爆到 ±∞
          } @else {
            Γ 通過遞推 Γ(s+1) = sΓ(s) 延拓到 s &lt; 0（除了極點）
          }
        </div>
      </div>
    </app-challenge-card>

    <!-- ===== Γ(1/2) = √π ===== -->
    <app-prose-block subtitle="驚人的結果：Γ(1/2) = √π">
      <p>
        <app-math e="\\Gamma(\\tfrac{1}{2}) = \\int_0^\\infty t^{-1/2}\\, e^{-t}\\,\\mathrm{d}t"></app-math>。
        令 <app-math e="t = u^2 \\;\\Rightarrow\\; \\mathrm{d}t = 2u\\,\\mathrm{d}u"></app-math>：
      </p>
      <app-math block
        e="= \\int_0^\\infty u^{-1} \\cdot e^{-u^2} \\cdot 2u\\,\\mathrm{d}u = 2\\int_0^\\infty e^{-u^2}\\mathrm{d}u = 2 \\cdot \\frac{\\sqrt{\\pi}}{2} = \\sqrt{\\pi}"></app-math>
      <p>
        這就是 Ch14 的 <strong>Gauss 積分</strong>（<app-math e="\\int_{-\\infty}^{\\infty} e^{-x^2}\\mathrm{d}x = \\sqrt{\\pi}"></app-math>）的又一次出場。
        Γ 函數把階乘和 π 連在一起——一個離散的組合量（n!）和一個幾何常數（π）
        竟然通過積分產生了關聯。
      </p>
    </app-prose-block>

    <!-- ===== 應用 ===== -->
    <app-prose-block subtitle="Γ 函數出現在哪裡">
      <div class="app-grid">
        <div class="app-card">
          <div class="app-icon">📊</div>
          <div class="app-title">統計學</div>
          <div class="app-body">χ² 分佈、t 分佈、F 分佈的 PDF 都用 Γ 表示。Beta 函數 B(a,b) = Γ(a)Γ(b)/Γ(a+b)。</div>
        </div>
        <div class="app-card">
          <div class="app-icon">🔢</div>
          <div class="app-title">數論</div>
          <div class="app-body">Riemann zeta 函數的函數方程裡有 Γ(s/2)。質數分佈和 Γ 深刻連結。</div>
        </div>
        <div class="app-card">
          <div class="app-icon">⚛</div>
          <div class="app-title">物理</div>
          <div class="app-body">量子場論的費曼積分、統計力學的配分函數、弦理論的散射振幅。</div>
        </div>
        <div class="app-card">
          <div class="app-icon">🧮</div>
          <div class="app-title">組合數學</div>
          <div class="app-body">二項式係數 C(n,k) = Γ(n+1) / (Γ(k+1)Γ(n−k+1))，對非整數也成立。</div>
        </div>
      </div>
      <p>下一節心智圖總結。</p>
    </app-prose-block>
  `,
  styles: `
    .c-power { color: #5a7faa; }
    .c-decay { color: #c8983b; }

    .formula-box { padding: 14px; border-radius: 10px; background: var(--accent-10);
      border: 2px solid var(--accent); margin: 10px 0; text-align: center; }
    .formula-title { font-size: 12px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }

    .formula-explain { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
    .fe-row { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .fe-swatch { width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0; margin-top: 2px;
      &.power-bg { background: rgba(90,127,170,0.3); border: 2px solid #5a7faa; }
      &.decay-bg { background: rgba(200,152,59,0.3); border: 2px solid #c8983b; }
      &.balance-bg { background: rgba(var(--accent-rgb),0.2); border: 2px solid var(--accent); } }
    .fe-text { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .fe-text strong { color: var(--text); }

    .recursion-chain { display: flex; align-items: center; justify-content: center; gap: 6px;
      flex-wrap: wrap; padding: 12px; background: var(--accent-10); border-radius: 10px;
      border: 1px solid var(--accent); margin: 10px 0; }
    .rc-item { padding: 5px 10px; border-radius: 6px; background: var(--bg-surface);
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text);
      border: 1px solid var(--border); }
    .rc-arrow { color: var(--accent); font-weight: 700; }

    .s-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .s-label { font-size: 15px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .s-slider { flex: 1; accent-color: var(--accent); height: 22px; }

    .panel-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 3px; }

    .integrand-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .gamma-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 8px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .ax-title { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .peak-label { font-size: 8px; fill: var(--accent); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .legend-text { font-size: 8px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      &.power-color { fill: #5a7faa; } &.decay-color { fill: #c8983b; } }
    .fac-label { font-size: 8px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .result-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .r-card { flex: 1; min-width: 100px; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); border-color: var(--accent); }
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.special { background: rgba(138,106,170,0.08); color: #8a6aaa; }
      &.muted { font-size: 11px; font-weight: 400; color: var(--text-muted); } }

    .app-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    @media (max-width: 500px) { .app-grid { grid-template-columns: 1fr; } }
    .app-card { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); }
    .app-icon { font-size: 20px; margin-bottom: 4px; }
    .app-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .app-body { font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
  `,
})
export class StepGammaFunctionComponent {
  readonly Math = Math;
  readonly sqrtPi = Math.sqrt(Math.PI);

  // --- Integrand interactive ---
  readonly sVal = signal(3.5);
  readonly gammaVal = computed(() => gamma(this.sVal()));
  readonly peakT = computed(() => Math.max(0, this.sVal() - 1)); // peak of t^(s-1)e^(-t) at t=s-1
  readonly peakVal = computed(() => {
    const t = this.peakT();
    return t > 0.01 ? Math.pow(t, this.sVal() - 1) * Math.exp(-t) : 0;
  });

  readonly isNearInteger = computed(() => {
    const s = this.sVal();
    return s > 0.8 && Math.abs(s - Math.round(s)) < 0.06;
  });
  readonly nearFactorial = computed(() => Math.round(this.sVal()) - 1);
  readonly nearFactorialVal = computed(() => {
    let f = 1; for (let i = 2; i <= this.nearFactorial(); i++) f *= i; return f;
  });
  readonly isNearHalf = computed(() => Math.abs(this.sVal() - 0.5) < 0.06);

  private integrand(t: number): number {
    const s = this.sVal();
    if (t <= 0) return 0;
    return Math.pow(t, s - 1) * Math.exp(-t);
  }

  itx(t: number): number { return 50 + (t / 12) * 440; }
  ity(y: number): number {
    const maxY = Math.max(1, this.peakVal() * 1.3);
    return 180 - (y / maxY) * 165;
  }

  // Component curves (scaled to same peak height for visual comparison)
  powerPath(): string {
    const s = this.sVal();
    const peak = this.peakVal();
    const maxY = Math.max(1, peak * 1.3);
    let path = '';
    for (let t = 0.05; t <= 12; t += 0.1) {
      const raw = Math.pow(t, s - 1);
      // Scale so the power curve's value at the peak matches the integrand peak
      const peakT = Math.max(0.1, s - 1);
      const powerAtPeak = Math.pow(peakT, s - 1);
      const scaled = powerAtPeak > 0 ? (raw / powerAtPeak) * peak : 0;
      if (!isFinite(scaled) || scaled > maxY * 2) continue;
      path += (path === '' ? 'M' : 'L') + `${this.itx(t).toFixed(1)},${this.ity(scaled).toFixed(1)}`;
    }
    return path;
  }

  decayPath(): string {
    const peak = this.peakVal();
    const maxY = Math.max(1, peak * 1.3);
    // Scale e^{-t} so its value at t=0 equals the peak height
    let path = '';
    for (let t = 0; t <= 12; t += 0.1) {
      const scaled = peak * Math.exp(-t);
      if (scaled > maxY * 2) continue;
      path += (path === '' ? 'M' : 'L') + `${this.itx(t).toFixed(1)},${this.ity(scaled).toFixed(1)}`;
    }
    return path;
  }

  integrandPath(): string {
    let path = '';
    for (let t = 0.01; t <= 12; t += 0.05) {
      const y = this.integrand(t);
      if (!isFinite(y) || y > 100) continue;
      path += (path === '' ? 'M' : 'L') + `${this.itx(t).toFixed(1)},${this.ity(y).toFixed(1)}`;
    }
    return path;
  }

  integrandArea(): string {
    const base = this.ity(0);
    let path = `M${this.itx(0.01)},${base}`;
    for (let t = 0.01; t <= 12; t += 0.05) {
      const y = this.integrand(t);
      if (!isFinite(y) || y > 100) continue;
      path += `L${this.itx(t).toFixed(1)},${this.ity(y).toFixed(1)}`;
    }
    path += `L${this.itx(12)},${base}Z`;
    return path;
  }

  // --- Full Gamma plot ---
  readonly sVal2 = signal(2.5);
  readonly gammaVal2 = computed((): number | null => {
    const s = this.sVal2();
    if (Math.abs(s - Math.round(s)) < 0.03 && s <= 0.03) return null; // pole
    for (let p = 0; p >= -4; p--) {
      if (Math.abs(s - p) < 0.03) return null;
    }
    const v = gamma(s);
    return isFinite(v) ? v : null;
  });

  readonly isNearPole = computed(() => {
    const s = this.sVal2();
    for (let p = 0; p >= -4; p--) {
      if (Math.abs(s - p) < 0.08) return true;
    }
    return false;
  });
  readonly nearestPole = computed(() => {
    const s = this.sVal2();
    let best = 0;
    for (let p = 0; p >= -4; p--) {
      if (Math.abs(s - p) < Math.abs(s - best)) best = p;
    }
    return best;
  });

  readonly factorialPoints = [
    { n: 1, val: 1, label: 'Γ(1)=1' },
    { n: 2, val: 1, label: 'Γ(2)=1' },
    { n: 3, val: 2, label: 'Γ(3)=2!' },
    { n: 4, val: 6, label: 'Γ(4)=3!' },
    { n: 5, val: 24, label: 'Γ(5)=4!' },
  ];

  gfx(s: number): number { return 50 + ((s + 4.5) / 10) * 450; }
  gfy(y: number): number {
    // Use symmetric log scale for the y-axis
    const cap = 12;
    const clamped = Math.max(-cap, Math.min(cap, y));
    return 150 - (clamped / cap) * 140;
  }

  readonly gammaBranches = computed(() => {
    const branches: string[] = [];
    // Draw Gamma in segments between poles
    const poles = [-4, -3, -2, -1, 0];
    const segments = [[-4.4, -4], [-4, -3], [-3, -2], [-2, -1], [-1, 0], [0, 5.5]];

    for (const [lo, hi] of segments) {
      let path = '';
      const step = 0.02;
      for (let s = lo + 0.05; s < hi - 0.02; s += step) {
        const v = gamma(s);
        if (!isFinite(v) || Math.abs(v) > 12) {
          if (path) { branches.push(path); path = ''; }
          continue;
        }
        path += (path === '' ? 'M' : 'L') + `${this.gfx(s).toFixed(1)},${this.gfy(v).toFixed(1)}`;
      }
      if (path) branches.push(path);
    }
    return branches;
  });
}
