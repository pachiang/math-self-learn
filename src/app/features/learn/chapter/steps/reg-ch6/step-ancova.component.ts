import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch6-ancova',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="ANCOVA：類別 + 連續變數混用" subtitle="§6.3">
      <p>
        ANOVA 只處理類別 x；迴歸處理連續 x；<strong>ANCOVA</strong>（Analysis of Covariance）是兩者的混合：
      </p>
      <div class="centered-eq big">
        Y = β₀ + β_group · d_group + β_x · x + ε
      </div>
      <p>
        一個類別因子 (group) + 一個連續共變量 (covariate, x)。
        幾何上是<strong>一組平行直線</strong>——每個群體各自一條截距不同但斜率相同的線。
      </p>

      <h4>ANCOVA 的三個用途</h4>
      <ol class="uses">
        <li>
          <strong>控制干擾變數後比較群體</strong>：比 A 藥 vs B 藥前，先控制年齡、基線症狀。
          避免「藥效」被「年齡差異」污染。
        </li>
        <li>
          <strong>增加統計檢定力</strong>：共變量吸收掉一部分殘差變異 → SE 降、t 值升。
        </li>
        <li>
          <strong>預測</strong>：給定新個體的 group + x，預測 Y。
        </li>
      </ol>
    </app-prose-block>

    <app-challenge-card prompt="兩組資料 + 共變量 x。切換三種模型看效果">
      <div class="mode-tabs">
        <button class="pill" [class.active]="mode() === 'anova'" (click)="mode.set('anova')">① 只看 group（ANOVA）</button>
        <button class="pill" [class.active]="mode() === 'reg'" (click)="mode.set('reg')">② 只看 x（迴歸）</button>
        <button class="pill" [class.active]="mode() === 'ancova'" (click)="mode.set('ancova')">③ 兩者都用（ANCOVA）</button>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 260" class="p-svg">
          <line x1="40" y1="220" x2="420" y2="220" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--border-strong)" stroke-width="1" />
          <text x="230" y="248" class="tk" text-anchor="middle">x (共變量)</text>
          <text x="28" y="125" class="tk">y</text>

          <!-- Points -->
          @for (p of data(); track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="3"
                    [attr.fill]="p.group === 'A' ? '#5a8aa8' : '#b06c4a'" opacity="0.75" />
          }

          @if (mode() === 'anova') {
            <!-- Horizontal lines at group means -->
            <line x1="40" [attr.y1]="mapY(groupMeans().A)" x2="420" [attr.y2]="mapY(groupMeans().A)"
                  stroke="#5a8aa8" stroke-width="2" stroke-dasharray="4 2" />
            <line x1="40" [attr.y1]="mapY(groupMeans().B)" x2="420" [attr.y2]="mapY(groupMeans().B)"
                  stroke="#b06c4a" stroke-width="2" stroke-dasharray="4 2" />
          } @else if (mode() === 'reg') {
            <!-- Single line ignoring group -->
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(poolFit().b0)"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(poolFit().b0 + poolFit().b1 * 10)"
                  stroke="var(--accent)" stroke-width="2" />
          } @else {
            <!-- Two parallel lines (ANCOVA) -->
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(ancovaFit().b0A)"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(ancovaFit().b0A + ancovaFit().bx * 10)"
                  stroke="#5a8aa8" stroke-width="2" />
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(ancovaFit().b0B)"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(ancovaFit().b0B + ancovaFit().bx * 10)"
                  stroke="#b06c4a" stroke-width="2" />
          }
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="dot bl"></span>群體 A</span>
        <span class="leg"><span class="dot org"></span>群體 B</span>
      </div>

      <div class="stats">
        @switch (mode()) {
          @case ('anova') {
            <div class="st"><div class="st-l">μ̂_A</div><div class="st-v">{{ groupMeans().A.toFixed(2) }}</div></div>
            <div class="st"><div class="st-l">μ̂_B</div><div class="st-v">{{ groupMeans().B.toFixed(2) }}</div></div>
            <div class="st"><div class="st-l">μ̂_B − μ̂_A</div><div class="st-v">{{ (groupMeans().B - groupMeans().A).toFixed(2) }}</div></div>
            <div class="st"><div class="st-l">R²</div><div class="st-v">{{ r2Anova().toFixed(3) }}</div></div>
          }
          @case ('reg') {
            <div class="st"><div class="st-l">β̂₀</div><div class="st-v">{{ poolFit().b0.toFixed(2) }}</div></div>
            <div class="st"><div class="st-l">β̂₁</div><div class="st-v">{{ poolFit().b1.toFixed(2) }}</div></div>
            <div class="st"><div class="st-l">R²</div><div class="st-v">{{ r2Reg().toFixed(3) }}</div></div>
            <div class="st"><div class="st-l">忽略 group</div><div class="st-v">⚠</div></div>
          }
          @case ('ancova') {
            <div class="st"><div class="st-l">β̂_x（共斜率）</div><div class="st-v">{{ ancovaFit().bx.toFixed(2) }}</div></div>
            <div class="st hi"><div class="st-l">β̂_group（截距差）</div><div class="st-v">{{ (ancovaFit().b0B - ancovaFit().b0A).toFixed(2) }}</div></div>
            <div class="st"><div class="st-l">R²</div><div class="st-v">{{ r2Ancova().toFixed(3) }}</div></div>
            <div class="st"><div class="st-l">殘差 SD</div><div class="st-v">{{ ancovaFit().sd.toFixed(2) }}</div></div>
          }
        }
      </div>

      <p class="note">
        <strong>ANOVA</strong>：兩條水平線——沒考慮 x → 殘差大、R² 低。<br>
        <strong>迴歸</strong>：一條斜線——忽略 group → 可能把「組 B 較高」算成 x 的斜率效果（遺漏變數偏誤）。<br>
        <strong>ANCOVA</strong>：兩條平行線——同時尊重 x 的關係和 group 的差異，R² 最高、殘差最小。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>ANCOVA 的隱含假設</h4>
      <ul class="assum">
        <li><strong>斜率相同</strong>：所有群體的 x 斜率一致——否則該用「帶交互的模型」（§6.2 雙因子 + 交互）</li>
        <li><strong>共變量 x 與 group 無關</strong>：若有關，ANCOVA 會<em>調整掉</em>真正的群體差異——這是有爭議的做法</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        ANCOVA = 同時用類別 + 連續變數的線性模型。
        幾何上是平行線族——每組各有截距、共享斜率。
        這是臨床試驗最常用的分析工具：「把基線差異控制住，再看治療效果」。
        至此 ANOVA/ANCOVA/迴歸正式統一在同一個矩陣公式 β̂ = (XᵀX)⁻¹XᵀY 之下。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .uses, .assum { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .uses strong, .assum strong { color: var(--accent); }
    .assum em { color: #b06c4a; font-style: normal; font-weight: 600; }

    .mode-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }

    .plot { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
    .dot.bl { background: #5a8aa8; }
    .dot.org { background: #b06c4a; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: var(--accent-30); background: var(--accent-10); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh6AncovaComponent {
  readonly mode = signal<'anova' | 'reg' | 'ancova'>('ancova');

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 220 - (y / 10) * 200; }

  readonly data = computed(() => {
    const rng = this.mulberry(13);
    const out: Array<{ x: number; y: number; group: 'A' | 'B' }> = [];
    // Group A: lower intercept, slope 0.5
    for (let i = 0; i < 15; i++) {
      const x = 1 + rng() * 8;
      out.push({ x, y: 2 + 0.5 * x + (rng() - 0.5) * 1.0, group: 'A' });
    }
    // Group B: higher intercept (+1.8), same slope
    for (let i = 0; i < 15; i++) {
      const x = 1 + rng() * 8;
      out.push({ x, y: 3.8 + 0.5 * x + (rng() - 0.5) * 1.0, group: 'B' });
    }
    return out;
  });

  readonly groupMeans = computed(() => {
    const d = this.data();
    const A = d.filter(p => p.group === 'A');
    const B = d.filter(p => p.group === 'B');
    return {
      A: A.reduce((s, p) => s + p.y, 0) / A.length,
      B: B.reduce((s, p) => s + p.y, 0) / B.length,
    };
  });

  readonly poolFit = computed(() => {
    const d = this.data();
    const n = d.length;
    const xb = d.reduce((s, v) => s + v.x, 0) / n;
    const yb = d.reduce((s, v) => s + v.y, 0) / n;
    const num = d.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = d.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    const b1 = num / den;
    return { b0: yb - b1 * xb, b1 };
  });

  readonly ancovaFit = computed(() => {
    const d = this.data();
    // Regression: y = b0 + b_group * d_group + b_x * x
    const X = d.map(p => [1, p.group === 'B' ? 1 : 0, p.x]);
    const Y = d.map(p => p.y);
    const p = 3;
    const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
    const XtY: number[] = new Array(p).fill(0);
    for (let i = 0; i < X.length; i++) {
      for (let j = 0; j < p; j++) {
        XtY[j] += X[i][j] * Y[i];
        for (let k = 0; k < p; k++) XtX[j][k] += X[i][j] * X[i][k];
      }
    }
    const beta = this.solve(XtX, XtY);
    const residuals = Y.map((y, i) => y - beta[0] - beta[1] * X[i][1] - beta[2] * X[i][2]);
    const sd = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / residuals.length);
    return { b0A: beta[0], b0B: beta[0] + beta[1], bx: beta[2], sd };
  });

  readonly r2Anova = computed(() => {
    const d = this.data();
    const gm = this.groupMeans();
    const overall = d.reduce((s, p) => s + p.y, 0) / d.length;
    const sst = d.reduce((s, p) => s + (p.y - overall) ** 2, 0);
    const sse = d.reduce((s, p) => s + (p.y - (p.group === 'A' ? gm.A : gm.B)) ** 2, 0);
    return 1 - sse / sst;
  });

  readonly r2Reg = computed(() => {
    const d = this.data();
    const overall = d.reduce((s, p) => s + p.y, 0) / d.length;
    const sst = d.reduce((s, p) => s + (p.y - overall) ** 2, 0);
    const f = this.poolFit();
    const sse = d.reduce((s, p) => s + (p.y - f.b0 - f.b1 * p.x) ** 2, 0);
    return 1 - sse / sst;
  });

  readonly r2Ancova = computed(() => {
    const d = this.data();
    const overall = d.reduce((s, p) => s + p.y, 0) / d.length;
    const sst = d.reduce((s, p) => s + (p.y - overall) ** 2, 0);
    const f = this.ancovaFit();
    const sse = d.reduce((s, p) => s + (p.y - (p.group === 'A' ? f.b0A : f.b0B) - f.bx * p.x) ** 2, 0);
    return 1 - sse / sst;
  });

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

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
