import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch3-f-test',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="F 檢定、聯合推論、預測區間" subtitle="§3.3">
      <h4>單係數 t 檢定 vs 聯合 F 檢定</h4>
      <p>
        β̂₁ 的 t 檢定只回答「β₁ = 0？」這一個問題。但有時我們要問：
      </p>
      <ul class="joint-qs">
        <li>所有 β₁, …, βₚ 是否<strong>同時</strong>為 0？（整體顯著性）</li>
        <li>x₃, x₄, x₅ 是否可以<strong>一起</strong>刪掉？（巢狀模型比較）</li>
        <li>β₁ + β₂ 是否等於 1？（係數間的線性約束）</li>
      </ul>
      <p>
        全部用 F 檢定。核心是<strong>比較兩個巢狀模型</strong>的殘差：
      </p>
      <div class="centered-eq big">
        F = [(SSE_R − SSE_F) / q] / [SSE_F / (n − p − 1)]
      </div>
      <p>
        SSE_R：Restricted 模型（約束成立下）的殘差平方和<br>
        SSE_F：Full 模型的殘差平方和<br>
        q：被約束掉的係數數量
      </p>
      <p>
        在 H₀ 下 F ~ F(q, n − p − 1)。F 大 → 解除約束後誤差降很多 → 約束不成立 → 拒絕。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="特例">
      <h4>整體顯著性 F 檢定</h4>
      <p>
        所有 βⱼ = 0 (j ≥ 1) 的檢定：SSE_R = SST，SSE_F = SSE。
      </p>
      <div class="centered-eq big">
        F = [R² / p] / [(1 − R²) / (n − p − 1)]
      </div>
      <p>
        這就是軟體輸出的「F-statistic」那一行——檢定「模型到底有沒有用」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="信賴區間 (CI) vs 預測區間 (PI)：同樣的 ŷ，兩種不同的不確定性">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">x* 預測點</span>
          <input type="range" min="0" max="10" step="0.1" [value]="xStar()"
            (input)="xStar.set(+$any($event).target.value)" />
          <span class="sl-val">{{ xStar().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">樣本 n</span>
          <input type="range" min="10" max="200" step="5" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 260" class="p-svg">
          <line x1="40" y1="220" x2="420" y2="220" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--border-strong)" stroke-width="1" />

          <!-- PI band (wider, orange) -->
          <path [attr.d]="piBand()" fill="#b06c4a" opacity="0.12" />
          <path [attr.d]="piUpper()" fill="none" stroke="#b06c4a" stroke-width="1.2" stroke-dasharray="4 2" />
          <path [attr.d]="piLower()" fill="none" stroke="#b06c4a" stroke-width="1.2" stroke-dasharray="4 2" />

          <!-- CI band (narrower, accent) -->
          <path [attr.d]="ciBand()" fill="var(--accent)" opacity="0.2" />
          <path [attr.d]="ciUpper()" fill="none" stroke="var(--accent)" stroke-width="1.2" />
          <path [attr.d]="ciLower()" fill="none" stroke="var(--accent)" stroke-width="1.2" />

          <!-- Regression line -->
          <line [attr.x1]="mapX(0)" [attr.y1]="mapY(predict(0))"
                [attr.x2]="mapX(10)" [attr.y2]="mapY(predict(10))"
                stroke="var(--accent)" stroke-width="2.4" />

          <!-- Data points -->
          @for (p of data(); track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="2.5" fill="var(--text)" opacity="0.5" />
          }

          <!-- Vertical at x* -->
          <line [attr.x1]="mapX(xStar())" y1="20" [attr.x2]="mapX(xStar())" y2="220"
                stroke="#5ca878" stroke-width="1" stroke-dasharray="3 2" />
          <circle [attr.cx]="mapX(xStar())" [attr.cy]="mapY(predict(xStar()))" r="5"
                  fill="#5ca878" stroke="var(--bg)" stroke-width="2" />
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw acc"></span>95% CI（平均 y 的區間）</span>
        <span class="leg"><span class="sw org"></span>95% PI（單次 y 預測區間）</span>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">ŷ(x*)</div><div class="st-v">{{ predict(xStar()).toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">CI 寬度</div><div class="st-v">{{ ciWidth(xStar()).toFixed(3) }}</div></div>
        <div class="st hi"><div class="st-l">PI 寬度</div><div class="st-v">{{ piWidth(xStar()).toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">PI / CI</div><div class="st-v">{{ (piWidth(xStar()) / Math.max(ciWidth(xStar()), 1e-6)).toFixed(2) }}×</div></div>
      </div>

      <div class="explain">
        <p>
          <strong class="acc-c">CI (Confidence Interval for mean)：</strong>
          「給定 x*，<em>平均</em> y 的區間」——隨 n → ∞ 寬度 → 0（因為平均值能被定準）。
          在 x̄ 處最窄，兩端變寬（<em>「蝴蝶結」</em>形狀）。
        </p>
        <p>
          <strong class="org-c">PI (Prediction Interval)：</strong>
          「給定 x*，<em>單一新觀察</em>的區間」——包含 CI 的不確定性 + 新 ε 的變異。
          即使 n → ∞，PI 也不為 0（因為 ε 本身有固有變異）。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>公式對照</h4>
      <div class="centered-eq">
        CI for E[y|x*] = ŷ ± t · σ̂ · √(1/n + (x* − x̄)² / Σ(xᵢ − x̄)²)
      </div>
      <div class="centered-eq">
        PI for y(x*) = ŷ ± t · σ̂ · √(<strong>1</strong> + 1/n + (x* − x̄)² / Σ(xᵢ − x̄)²)
      </div>
      <p>
        唯一差別：PI 多一個 <strong>「+ 1」</strong>——來自新觀察 ε* 的單獨變異。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        F 檢定統一處理任何「係數聯合約束」的問題，含整體顯著性與模型比較。
        CI 是「平均 y」的區間，PI 是「單筆 y」的區間——PI 永遠較寬。
        預測具體個體時用 PI，描述族群趨勢時用 CI。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    .centered-eq strong { font-size: 18px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .joint-qs { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .joint-qs strong { color: var(--accent); }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .plot { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; flex-wrap: wrap; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.acc { background: var(--accent); }
    .sw.org { background: #b06c4a; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: #b06c4a; background: rgba(176, 108, 74, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.hi .st-v { color: #b06c4a; }

    .explain { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .explain p { margin: 0 0 8px; }
    .explain p:last-child { margin: 0; }
    .explain em { color: var(--text); font-style: normal; font-weight: 600; }
    .acc-c { color: var(--accent); }
    .org-c { color: #b06c4a; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh3FTestComponent {
  readonly Math = Math;
  readonly xStar = signal(5);
  readonly n = signal(40);

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 220 - (y / 10) * 200; }

  readonly data = computed(() => {
    const rng = this.mulberry(11);
    const n = this.n();
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const x = 0.5 + (i * 9) / n;
      const y = 1 + 0.7 * x + (rng() - 0.5) * 1.5;
      out.push({ x, y: Math.max(0.2, Math.min(9.8, y)) });
    }
    return out;
  });

  readonly fit = computed(() => {
    const d = this.data();
    const n = d.length;
    const xb = d.reduce((s, v) => s + v.x, 0) / n;
    const yb = d.reduce((s, v) => s + v.y, 0) / n;
    const num = d.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = d.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    const b1 = num / den;
    const b0 = yb - b1 * xb;
    const sse = d.reduce((s, v) => s + (v.y - b0 - b1 * v.x) ** 2, 0);
    const s2 = sse / (n - 2);
    return { b0, b1, xb, sXX: den, s2, n };
  });

  predict(x: number): number {
    const f = this.fit();
    return f.b0 + f.b1 * x;
  }

  ciWidth(x: number): number {
    const f = this.fit();
    const t = 2.0;
    const se = Math.sqrt(f.s2 * (1 / f.n + (x - f.xb) ** 2 / f.sXX));
    return 2 * t * se;
  }

  piWidth(x: number): number {
    const f = this.fit();
    const t = 2.0;
    const se = Math.sqrt(f.s2 * (1 + 1 / f.n + (x - f.xb) ** 2 / f.sXX));
    return 2 * t * se;
  }

  private bandPath(upper: boolean, pi: boolean): string {
    const pts: string[] = [];
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const x = (i * 10) / N;
      const yh = this.predict(x);
      const half = (pi ? this.piWidth(x) : this.ciWidth(x)) / 2;
      const py = this.mapY(upper ? yh + half : yh - half);
      pts.push(`${i === 0 ? 'M' : 'L'} ${this.mapX(x).toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  ciUpper(): string { return this.bandPath(true, false); }
  ciLower(): string { return this.bandPath(false, false); }
  piUpper(): string { return this.bandPath(true, true); }
  piLower(): string { return this.bandPath(false, true); }

  ciBand(): string {
    const up = this.bandPath(true, false).replace(/^M/, 'M');
    const lo = this.bandPath(false, false).split(' ').reverse().join(' ').replace(/M/g, 'L');
    return up + ' ' + lo + ' Z';
  }

  piBand(): string {
    const up = this.bandPath(true, true).replace(/^M/, 'M');
    const lo = this.bandPath(false, true).split(' ').reverse().join(' ').replace(/M/g, 'L');
    return up + ' ' + lo + ' Z';
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
