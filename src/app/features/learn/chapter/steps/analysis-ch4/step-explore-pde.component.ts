import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-explore-pde',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="深入探索 C：PDE 數值解的誤差" subtitle="§4.8 附錄">
      <p>
        §4.8 問：「PDE 的數值解和真正的解差多遠？」
        這裡用最簡單的例子——<strong>一維熱方程</strong>——看數值解怎麼逼近真正的解。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="熱方程：溫度的擴散">
      <p>
        一根金屬棒，初始溫度分佈是 sin(πx)。兩端固定在 0°C。溫度隨時間擴散：
      </p>
      <p class="formula">∂u/∂t = ∂²u/∂x² &nbsp;&nbsp; u(x,0) = sin(πx)</p>
      <p>
        真正的解（精確解）：<strong>u(x,t) = e^(−π²t) sin(πx)</strong>——
        形狀不變，振幅指數衰減。
      </p>
      <p>
        數值解：把空間切成 M 格、時間切成小步 Δt，用<strong>有限差分法</strong>逼近。
        格子越密，逼近越好——但「好」到什麼程度？用 <strong>sup 範數</strong>衡量！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖「空間格數 M」看數值解怎麼逼近精確解——格子越密 sup 誤差越小">
      <div class="ctrl-row">
        <span class="cl">空間格數 M = {{ M() }}</span>
        <input type="range" min="4" max="40" step="1" [value]="M()"
               (input)="M.set(+($any($event.target)).value)" class="sl" />
      </div>
      <div class="ctrl-row">
        <span class="cl">時間 t = {{ time().toFixed(3) }}</span>
        <input type="range" min="0.001" max="0.2" step="0.001" [value]="time()"
               (input)="time.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 520 250" class="pde-svg">
        <line x1="60" y1="210" x2="490" y2="210" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="20" x2="60" y2="210" stroke="var(--border)" stroke-width="0.8" />

        @for (yt of [0, 0.2, 0.4, 0.6, 0.8, 1.0]; track yt) {
          <line x1="55" [attr.y1]="py(yt)" x2="490" [attr.y2]="py(yt)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="py(yt) + 3" class="ax-label" text-anchor="end">{{ yt }}</text>
        }

        <!-- Initial condition (very faded) -->
        <path [attr.d]="initialPath()" fill="none" stroke="var(--text-muted)" stroke-width="0.8" stroke-opacity="0.2" />

        <!-- Exact solution (green dashed) -->
        <path [attr.d]="exactPath()" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- Numerical solution (blue dots + line) -->
        @for (pt of numericalPts(); track $index) {
          <circle [attr.cx]="px(pt.x)" [attr.cy]="py(pt.u)" r="3.5" fill="#5a7faa" fill-opacity="0.7" />
        }
        <path [attr.d]="numericalPath()" fill="none" stroke="#5a7faa" stroke-width="2" />
      </svg>

      <div class="legend">
        <span><span class="dot green"></span>精確解 u(x,t)</span>
        <span><span class="dot blue"></span>數值解（M={{ M() }} 格）</span>
        <span><span class="dot muted"></span>初始 sin(πx)</span>
      </div>

      <div class="result-row">
        <div class="r-card">
          <span class="r-label">||精確 − 數值||∞</span>
          <span class="r-val">{{ supError().toExponential(2) }}</span>
        </div>
        <div class="r-card">
          <span class="r-label">格距 h = 1/M</span>
          <span class="r-val">{{ (1/M()).toFixed(4) }}</span>
        </div>
        <div class="r-card">
          <span class="r-label">誤差 ∝</span>
          <span class="r-val">O(h²)</span>
        </div>
      </div>

      <div class="insight">
        格數 M 翻倍 → 格距 h 減半 → <strong>sup 誤差大約縮小 4 倍</strong>（二階精度）。
        這就是數值分析裡「收斂階數」的意思——用 §4.8 的 sup 範數來衡量。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        PDE 數值解的收斂分析，核心工具就是<strong>函數空間裡的範數</strong>。
        你剛才體驗的 sup 範數收斂，在工程計算裡叫「最大誤差收斂」——
        保證<strong>每個點</strong>都不會偏離太多。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .cl { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 130px; }
    .sl { flex: 1; accent-color: var(--accent); height: 20px; }
    .pde-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 8px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .legend { display: flex; gap: 14px; justify-content: center; margin-bottom: 10px; font-size: 11px; color: var(--text-muted); }
    .dot { display: inline-block; width: 10px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.green { background: #5a8a5a; } &.blue { background: #5a7faa; } &.muted { background: var(--text-muted); opacity: 0.3; } }
    .result-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface); }
    .r-label { font-size: 10px; color: var(--text-muted); display: block; font-family: 'JetBrains Mono', monospace; }
    .r-val { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .insight { padding: 12px; border-radius: 8px; background: var(--accent-10); border: 1px solid var(--accent);
      font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.8; }
    .insight strong { color: var(--accent); }
  `,
})
export class StepExplorePdeComponent {
  readonly M = signal(10);
  readonly time = signal(0.02);

  // Exact solution: u(x,t) = exp(-π²t) sin(πx)
  private exact(x: number, t: number): number {
    return Math.exp(-Math.PI * Math.PI * t) * Math.sin(Math.PI * x);
  }

  // Numerical solution: finite difference (explicit Euler)
  readonly numericalPts = computed(() => {
    const m = this.M();
    const t = this.time();
    const h = 1 / m;
    const dt = 0.4 * h * h; // stability condition: dt/h² < 0.5
    const steps = Math.ceil(t / dt);
    const actualDt = t / steps;
    const r = actualDt / (h * h);

    // Initialize
    let u = Array.from({ length: m + 1 }, (_, i) => Math.sin(Math.PI * i * h));

    // Time-step
    for (let s = 0; s < steps; s++) {
      const newU = [...u];
      for (let i = 1; i < m; i++) {
        newU[i] = u[i] + r * (u[i - 1] - 2 * u[i] + u[i + 1]);
      }
      newU[0] = 0; newU[m] = 0;
      u = newU;
    }

    return u.map((val, i) => ({ x: i * h, u: val }));
  });

  px(x: number): number { return 60 + x * 430; }
  py(y: number): number { return 210 - y * 190; }

  initialPath(): string {
    let path = '';
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      path += (i === 0 ? 'M' : 'L') + `${this.px(x).toFixed(1)},${this.py(Math.sin(Math.PI * x)).toFixed(1)}`;
    }
    return path;
  }

  exactPath(): string {
    const t = this.time();
    let path = '';
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      path += (i === 0 ? 'M' : 'L') + `${this.px(x).toFixed(1)},${this.py(this.exact(x, t)).toFixed(1)}`;
    }
    return path;
  }

  numericalPath(): string {
    const pts = this.numericalPts();
    return 'M' + pts.map(p => `${this.px(p.x).toFixed(1)},${this.py(p.u).toFixed(1)}`).join('L');
  }

  readonly supError = computed(() => {
    const t = this.time();
    const pts = this.numericalPts();
    let mx = 0;
    for (const p of pts) {
      mx = Math.max(mx, Math.abs(p.u - this.exact(p.x, t)));
    }
    return mx;
  });
}
