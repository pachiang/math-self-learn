import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch14-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Laplace 方程：時間消失之後" subtitle="§14.1">
      <p>
        把熱方程 <code>uₜ = α·Δu</code> 的時間設為穩態（∂u/∂t = 0）：
      </p>
      <div class="centered-eq big">
        Δu = ∂²u/∂x² + ∂²u/∂y² = 0
      </div>
      <p class="key-idea">
        這就是 <strong>Laplace 方程</strong>。滿足這個方程的函數叫做<strong>調和函數 (harmonic)</strong>，
        是數學物理最重要的函數家族之一。
      </p>

      <h4>它出現在哪裡？</h4>
      <div class="appear-grid">
        <div class="app">
          <div class="app-name">靜電</div>
          <code>Δφ = −ρ/ε₀</code>
          <p>無電荷區域的電位滿足 Δφ = 0（Poisson → Laplace）。</p>
        </div>
        <div class="app">
          <div class="app-name">熱穩態</div>
          <code>Δu = 0</code>
          <p>散熱棒子兩端保持固定溫度，長時間後的分佈。</p>
        </div>
        <div class="app">
          <div class="app-name">無旋流體</div>
          <code>Δφ = 0</code>
          <p>理想流體的速度位能，u = ∇φ。繞翼、水面波。</p>
        </div>
        <div class="app">
          <div class="app-name">肥皂膜</div>
          <code>最小化 ∫|∇u|²</code>
          <p>固定邊緣的肥皂膜選面積最小 → Euler-Lagrange 給 Δu = 0。</p>
        </div>
        <div class="app">
          <div class="app-name">複分析</div>
          <code>(解析函數的實/虛部)</code>
          <p>Cauchy-Riemann 方程蘊含實部、虛部都滿足 Δu = 0。</p>
        </div>
        <div class="app">
          <div class="app-name">機率論</div>
          <code>P(命中 ∂Ω 某點)</code>
          <p>布朗運動從 x 出發擊中邊界的機率，是調和函數。</p>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="滑動邊界溫度：看穩態溫度分佈如何改變">
      <div class="domain-wrap">
        <svg viewBox="-10 -10 220 220" class="dom-svg">
          <rect x="0" y="0" width="200" height="200" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="2" />
          <!-- Temperature cells -->
          @for (cell of cells(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.s" [attr.height]="cell.s"
              [attr.fill]="cell.color" opacity="0.95" />
          }
          <!-- Boundary labels -->
          <text x="100" y="-2" class="bc-label" text-anchor="middle">上 = {{ topT().toFixed(1) }}°C</text>
          <text x="100" y="216" class="bc-label" text-anchor="middle">下 = {{ bottomT().toFixed(1) }}°C</text>
          <text x="-6" y="105" class="bc-label" text-anchor="end" transform="rotate(-90, -6, 105)">左 = {{ leftT().toFixed(1) }}°C</text>
          <text x="214" y="105" class="bc-label" text-anchor="start" transform="rotate(90, 214, 105)">右 = {{ rightT().toFixed(1) }}°C</text>
          <!-- A couple of level curves -->
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">上邊界</span>
          <input type="range" min="-1" max="1" step="0.05" [value]="topT()"
            (input)="topT.set(+$any($event).target.value)" />
          <span class="sl-val">{{ topT().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">下邊界</span>
          <input type="range" min="-1" max="1" step="0.05" [value]="bottomT()"
            (input)="bottomT.set(+$any($event).target.value)" />
          <span class="sl-val">{{ bottomT().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">左邊界</span>
          <input type="range" min="-1" max="1" step="0.05" [value]="leftT()"
            (input)="leftT.set(+$any($event).target.value)" />
          <span class="sl-val">{{ leftT().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">右邊界</span>
          <input type="range" min="-1" max="1" step="0.05" [value]="rightT()"
            (input)="rightT.set(+$any($event).target.value)" />
          <span class="sl-val">{{ rightT().toFixed(2) }}</span>
        </div>
      </div>

      <p class="note">
        <strong>直覺：</strong>
        整片金屬達到穩態時，每個內部點的溫度 =
        <strong>周圍鄰居溫度的平均</strong>（稍後正式寫成「平均值性質」）。
        這讓內部溫度被邊界<strong>完全決定</strong>——沒有源項、沒有時間記憶。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>Laplace 方程的幾何意義：「最平滑的形狀」</h4>
      <p>
        Δu = 0 等價於說：<strong>u 在任何點都等於局部平均</strong>。
        這逼 u 不能有局部的凸起或凹陷——
        否則平均值不等於中心值。
      </p>
      <p>
        肥皂膜、連續拉緊的橡膠薄膜——任何「彈性最小」的薄膜穩態，都滿足 Laplace。
        也就是說 Laplace 方程的解<strong>把所有「不必要的能量」都擺平</strong>。
      </p>

      <h4>Ch12-Ch14 三兄弟的分類</h4>
      <table class="types">
        <thead>
          <tr><th>類型</th><th>方程</th><th>性質</th><th>條件</th></tr>
        </thead>
        <tbody>
          <tr><td class="hyp">雙曲</td><td>uₜₜ = c²·Δu</td><td>訊號有限速度傳播、時間可逆</td><td>初值 + 邊界</td></tr>
          <tr><td class="par">拋物</td><td>uₜ = α·Δu</td><td>瞬時影響全體、時間不可逆</td><td>初值 + 邊界</td></tr>
          <tr><td class="ell">橢圓</td><td>Δu = 0</td><td>最平滑、邊界完全決定</td><td>只要邊界</td></tr>
        </tbody>
      </table>

      <p class="takeaway">
        <strong>take-away：</strong>
        Laplace 方程描述穩態與平衡。調和函數有一系列神奇的性質：
        平均值性質、最大值原理、解析性、唯一性⋯⋯
        下一節逐一解鎖。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 18px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 15px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .appear-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 12px 0; }
    .app { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .app-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .app code { display: inline-block; margin-bottom: 4px; font-size: 11px; }
    .app p { margin: 3px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .domain-wrap { text-align: center; padding: 16px 10px 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .dom-svg { width: 300px; max-width: 100%; }
    .bc-label { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 44px; text-align: right; }

    .note { padding: 12px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .note strong { color: var(--accent); }

    .types { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
    .types th, .types td { padding: 8px; border: 1px solid var(--border); text-align: left; }
    .types th { background: var(--accent-10); color: var(--accent); font-weight: 700; }
    .types td.hyp { background: rgba(90, 138, 168, 0.1); color: #5a8aa8; font-weight: 700; }
    .types td.par { background: rgba(200, 123, 94, 0.1); color: #c87b5e; font-weight: 700; }
    .types td.ell { background: rgba(92, 168, 120, 0.1); color: #5ca878; font-weight: 700; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh14IntroComponent {
  readonly topT = signal(1);
  readonly bottomT = signal(-0.5);
  readonly leftT = signal(0.3);
  readonly rightT = signal(-0.2);

  readonly cells = computed(() => {
    const grid = 40;
    const cellSize = 200 / grid;
    const out: Array<{ id: string; x: number; y: number; s: number; color: string }> = [];
    const top = this.topT();
    const bottom = this.bottomT();
    const left = this.leftT();
    const right = this.rightT();

    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const xs = (i + 0.5) / grid;
        const ys = 1 - (j + 0.5) / grid; // vertical: 0 at bottom, 1 at top

        // Approximate Laplace solution with 4 boundary conditions via Fourier series expansion
        // We'll use a truncated series: u(x,y) = sum contributions from each side.
        const u = solveLaplace(xs, ys, top, bottom, left, right);
        const color = tempColor(u);
        out.push({ id: `${i}_${j}`, x: i * cellSize, y: j * cellSize, s: cellSize + 0.5, color });
      }
    }
    return out;
  });
}

/** Approximate solution: u = u_top + u_bottom + u_left + u_right, each handling one nonzero side. */
function solveLaplace(x: number, y: number, top: number, bottom: number, left: number, right: number): number {
  const M = 10;
  let u = 0;
  // Top boundary: u(x, 1) = top (over sinh)
  for (let n = 1; n <= M; n += 2) {
    u += (4 * top / (n * Math.PI)) * Math.sin(n * Math.PI * x) * Math.sinh(n * Math.PI * y) / Math.sinh(n * Math.PI);
  }
  // Bottom: u(x, 0) = bottom
  for (let n = 1; n <= M; n += 2) {
    u += (4 * bottom / (n * Math.PI)) * Math.sin(n * Math.PI * x) * Math.sinh(n * Math.PI * (1 - y)) / Math.sinh(n * Math.PI);
  }
  // Left: u(0, y) = left
  for (let n = 1; n <= M; n += 2) {
    u += (4 * left / (n * Math.PI)) * Math.sin(n * Math.PI * y) * Math.sinh(n * Math.PI * (1 - x)) / Math.sinh(n * Math.PI);
  }
  // Right: u(1, y) = right
  for (let n = 1; n <= M; n += 2) {
    u += (4 * right / (n * Math.PI)) * Math.sin(n * Math.PI * y) * Math.sinh(n * Math.PI * x) / Math.sinh(n * Math.PI);
  }
  return u;
}

function tempColor(v: number): string {
  const t = Math.max(-1, Math.min(1, v));
  if (t >= 0) {
    const s = t;
    return `rgb(${Math.round(240 - 20 * (1 - s))}, ${Math.round(220 - 150 * s)}, ${Math.round(210 - 150 * s)})`;
  } else {
    const s = -t;
    return `rgb(${Math.round(210 - 100 * s)}, ${Math.round(220 - 30 * s)}, ${Math.round(240 - 10 * s)})`;
  }
}
