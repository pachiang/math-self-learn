import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// Fixed test problem: dy/dt = y, y(0) = 1, true solution y(t) = e^t
const f = (_t: number, y: number) => y;
const trueSol = (t: number) => Math.exp(t);
const T0 = 0;
const Y0 = 1;
const T_END = 2;

function eulerRun(h: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [[T0, Y0]];
  let t = T0;
  let y = Y0;
  const n = Math.round((T_END - T0) / h);
  for (let i = 0; i < n; i++) {
    y = y + h * f(t, y);
    t = t + h;
    pts.push([t, y]);
  }
  return pts;
}

const PX_PER_T = 120;
const PX_PER_Y = 20;

@Component({
  selector: 'app-de-ch4-error',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="誤差分析：local 與 global" subtitle="§4.3">
      <p>
        前一節觀察到 Euler 的軌跡會<strong>略低於真解</strong>。這個「低多少」值得量化——因為它決定了我們能不能相信數值結果。
      </p>
      <p>
        兩種誤差要分清楚：
      </p>
      <div class="concept-grid">
        <div class="concept">
          <div class="c-tag">Local Truncation Error</div>
          <div class="c-title">「這一步」的誤差</div>
          <p>假設從真解上出發，走一步 Euler 會偏多少。Taylor 展開告訴我們：</p>
          <code class="c-eq">LTE ≈ ½·h² · y″(t)</code>
          <p>跟 <strong>h²</strong> 成正比。</p>
        </div>
        <div class="concept">
          <div class="c-tag">Global Error</div>
          <div class="c-title">「最終點」的累積誤差</div>
          <p>走了 n = T/h 步之後，累積總偏差大約：</p>
          <code class="c-eq">Global ≈ (T/h) · LTE ≈ C · h</code>
          <p>跟 <strong>h¹</strong> 成正比。所以 Euler 稱為「<strong>一階方法</strong>」。</p>
        </div>
      </div>
      <p>
        「一階方法」的意義：<strong>h 縮一半，誤差大約也縮一半</strong>。這很慢——要把誤差縮 10 倍，
        得把計算量乘以 10 倍。下一節看 RK 方法能不能做得更好。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察：每一步的 local 誤差（綠三角）和累積的 global 誤差（最右邊的灰色線段）">
      <!-- Step-by-step with error triangles -->
      <div class="plot-wrap">
        <svg viewBox="-20 -80 300 180" class="plot-svg">
          <!-- Grid -->
          @for (g of [0.5, 1, 1.5, 2]; track g) {
            <line [attr.x1]="g * PX_PER_T" y1="-75" [attr.x2]="g * PX_PER_T" y2="80"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text [attr.x]="g * PX_PER_T" y="92" class="tick">{{ g }}</text>
          }
          @for (y of [2, 4, 6]; track y) {
            <line x1="-10" [attr.y1]="-y * PX_PER_Y" x2="270" [attr.y2]="-y * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text x="-14" [attr.y]="-y * PX_PER_Y + 3" class="tick right">{{ y }}</text>
          }

          <line x1="-10" y1="0" x2="270" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="1" />
          <text x="266" y="12" class="ax">t</text>

          <!-- True solution -->
          <path [attr.d]="truePath" fill="none"
            stroke="#5ca878" stroke-width="2" />

          <!-- Euler path -->
          <path [attr.d]="eulerPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.2" />

          <!-- Error triangles at each step -->
          @for (t of errorTriangles(); track $index) {
            <line [attr.x1]="t.x" [attr.y1]="t.yEuler"
              [attr.x2]="t.x" [attr.y2]="t.yTrue"
              stroke="#c87b5e" stroke-width="1.2" opacity="0.7" />
            <circle [attr.cx]="t.x" [attr.cy]="t.yEuler" r="2.5"
              fill="var(--accent)" stroke="white" stroke-width="0.8" />
            <circle [attr.cx]="t.x" [attr.cy]="t.yTrue" r="2.5"
              fill="#5ca878" stroke="white" stroke-width="0.8" />
          }

          <!-- Final global error bracket -->
          @if (finalError(); as fe) {
            <line [attr.x1]="fe.x + 8" [attr.y1]="fe.yEuler"
              [attr.x2]="fe.x + 8" [attr.y2]="fe.yTrue"
              stroke="#c87b5e" stroke-width="2.5" />
            <line [attr.x1]="fe.x + 4" [attr.y1]="fe.yEuler"
              [attr.x2]="fe.x + 12" [attr.y2]="fe.yEuler"
              stroke="#c87b5e" stroke-width="2" />
            <line [attr.x1]="fe.x + 4" [attr.y1]="fe.yTrue"
              [attr.x2]="fe.x + 12" [attr.y2]="fe.yTrue"
              stroke="#c87b5e" stroke-width="2" />
            <text [attr.x]="fe.x + 16" [attr.y]="(fe.yEuler + fe.yTrue) / 2 + 3"
              class="gerr-lab">
              累積誤差 = {{ fe.err.toFixed(3) }}
            </text>
          }
        </svg>
        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>真解 y = e^t</span>
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>Euler</span>
          <span class="leg"><span class="leg-dot" style="background:#c87b5e"></span>每步 local 誤差</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">步長 h</span>
          <input type="range" min="0.05" max="0.8" step="0.01"
            [value]="h()" (input)="h.set(+$any($event).target.value)" />
          <span class="sl-val">{{ h().toFixed(2) }}</span>
        </div>
        <div class="status">
          n = {{ stepCount() }} 步，
          累積誤差 ≈ <strong>{{ currentGlobalError().toFixed(3) }}</strong>，
          理論估計 C·h ≈ <strong>{{ theoreticalEstimate().toFixed(3) }}</strong>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="log-log 圖：誤差跟 h 的關係">
      <p class="log-intro">
        把誤差跟 h 同時取對數，畫成 log(誤差) vs log(h)。
        如果 誤差 ∝ h^p，則在 log-log 圖上是直線，<strong>斜率恰好是 p</strong>。
      </p>

      <div class="log-plot-wrap">
        <svg viewBox="-40 -20 320 240" class="log-svg">
          <!-- Axes -->
          <line x1="0" y1="200" x2="280" y2="200" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="0" x2="0" y2="200" stroke="var(--border-strong)" stroke-width="1" />
          <text x="284" y="204" class="ax">log(h)</text>
          <text x="-12" y="-4" class="ax">log(err)</text>

          <!-- Grid (log scale) -->
          @for (dec of [0, 1, 2, 3]; track dec) {
            <line [attr.x1]="dec * 70" y1="0" [attr.x2]="dec * 70" y2="200"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text [attr.x]="dec * 70" y="214" class="tick">10^(-{{ dec }})</text>
          }
          @for (dec of [0, 1, 2, 3, 4, 5]; track dec) {
            <line x1="0" [attr.y1]="dec * 35" x2="280" [attr.y2]="dec * 35"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text x="-6" [attr.y]="dec * 35 + 3" class="tick right">10^(-{{ dec }})</text>
          }

          <!-- Reference slope=1 line -->
          <line x1="30" y1="50" x2="250" y2="240"
            stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 2" opacity="0.6" />
          <text x="250" y="244" class="slope-lab">slope = 1</text>

          <!-- Euler error data points -->
          @for (d of errorData(); track $index) {
            <circle [attr.cx]="d.x" [attr.cy]="d.y" r="4"
              fill="var(--accent)" stroke="white" stroke-width="1" />
          }

          <!-- Current h marker -->
          <line [attr.x1]="currentHX()" y1="0" [attr.x2]="currentHX()" y2="200"
            stroke="#c87b5e" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.7" />
          <text [attr.x]="currentHX() + 4" y="14" class="cur-lab">h = {{ h().toFixed(2) }}</text>
        </svg>
        <p class="log-caption">
          圓點：不同 h 下 Euler 在 t=2 的誤差。斜率 ≈ 1 完全符合理論預測
          （Euler 是一階方法）。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Euler 法在 log-log 圖上呈現漂亮的 1 階斜率——<strong>誤差 ≈ C·h</strong>。
        要把誤差縮 100 倍，得把步數變 100 倍——計算代價陡增。
        下一節看怎麼用更聰明的方法做出<em>同樣步數但更精準</em>的結果。
      </p>
    </app-prose-block>
  `,
  styles: `
    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .concept-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 12px 0;
    }

    @media (max-width: 560px) {
      .concept-grid { grid-template-columns: 1fr; }
    }

    .concept {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .c-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .c-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--accent);
      margin: 4px 0 6px;
    }

    .concept p {
      margin: 0 0 6px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .c-eq {
      display: block;
      text-align: center;
      font-size: 13px;
      padding: 6px;
      margin: 6px 0;
      font-weight: 600;
    }

    .plot-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .plot-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .tick.right { text-anchor: end; }

    .gerr-lab {
      font-size: 10px;
      fill: #c87b5e;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .legend {
      display: flex;
      gap: 14px;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
      justify-content: center;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .leg-dot {
      display: inline-block;
      width: 12px;
      height: 3px;
      border-radius: 2px;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 50px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .status {
      font-size: 13px;
      color: var(--text-secondary);
      padding: 8px;
      background: var(--bg);
      border-radius: 6px;
      text-align: center;
    }

    .status strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .log-intro {
      font-size: 14px;
      line-height: 1.7;
      padding: 10px 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      margin-bottom: 14px;
    }

    .log-plot-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .log-svg { width: 100%; display: block; }

    .slope-lab, .cur-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    .slope-lab { fill: var(--text-muted); }
    .cur-lab { fill: #c87b5e; font-weight: 700; }

    .log-caption {
      margin: 6px 0 0;
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
    }
  `,
})
export class DeCh4ErrorComponent {
  readonly h = signal(0.3);
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;

  readonly truePath = (() => {
    const pts: string[] = [];
    const n = 100;
    for (let i = 0; i <= n; i++) {
      const t = T0 + (i / n) * (T_END - T0);
      const y = trueSol(t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-y * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly stepCount = computed(() => Math.round((T_END - T0) / this.h()));

  readonly eulerPath = computed(() => {
    const pts = eulerRun(this.h());
    return pts
      .map(([t, y], i) => `${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-y * PX_PER_Y).toFixed(1)}`)
      .join(' ');
  });

  readonly errorTriangles = computed(() => {
    const pts = eulerRun(this.h());
    return pts.map(([t, yEuler]) => ({
      x: t * PX_PER_T,
      yEuler: -yEuler * PX_PER_Y,
      yTrue: -trueSol(t) * PX_PER_Y,
    }));
  });

  readonly finalError = computed(() => {
    const pts = eulerRun(this.h());
    if (pts.length === 0) return null;
    const [t, yEuler] = pts[pts.length - 1];
    const yTrue = trueSol(t);
    return {
      x: t * PX_PER_T,
      yEuler: -yEuler * PX_PER_Y,
      yTrue: -yTrue * PX_PER_Y,
      err: yTrue - yEuler,
    };
  });

  readonly currentGlobalError = computed(() => {
    const pts = eulerRun(this.h());
    const [t, y] = pts[pts.length - 1];
    return trueSol(t) - y;
  });

  readonly theoreticalEstimate = computed(() => {
    // For y' = y, true solution is e^t, y''(t) = e^t. Global error ~ C·h where C ≈ (e^T - 1)/2.
    // At T=2: e^2 ~ 7.4, so C ≈ 3.2. So err ≈ 3.2 · h
    return 3.2 * this.h();
  });

  // Log-log plot data points
  readonly errorData = computed(() => {
    const hs = [0.8, 0.5, 0.3, 0.2, 0.1, 0.05, 0.025, 0.012, 0.006];
    const out: { x: number; y: number }[] = [];
    for (const h of hs) {
      const pts = eulerRun(h);
      const [t, y] = pts[pts.length - 1];
      const err = Math.abs(trueSol(t) - y);
      if (err <= 0) continue;
      // log10(h) maps to 0 = 10^0 = 1, 1 = 10^(-1) = 0.1, etc.
      const lh = -Math.log10(h);
      const le = -Math.log10(err);
      out.push({ x: lh * 70, y: le * 35 });
    }
    return out;
  });

  readonly currentHX = computed(() => {
    const lh = -Math.log10(this.h());
    return lh * 70;
  });
}
