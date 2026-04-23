import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// Test problem: dy/dt = y, y(0) = 1, true solution y(t) = e^t
const f = (_t: number, y: number) => y;
const trueSol = (t: number) => Math.exp(t);
const T0 = 0;
const Y0 = 1;
const T_END = 2;

type MethodId = 'euler' | 'rk2' | 'rk4';

function runMethod(method: MethodId, h: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [[T0, Y0]];
  let t = T0, y = Y0;
  const n = Math.round((T_END - T0) / h);
  for (let i = 0; i < n; i++) {
    if (method === 'euler') {
      y = y + h * f(t, y);
    } else if (method === 'rk2') {
      const k1 = f(t, y);
      const k2 = f(t + h / 2, y + (h / 2) * k1);
      y = y + h * k2;
    } else {
      const k1 = f(t, y);
      const k2 = f(t + h / 2, y + (h / 2) * k1);
      const k3 = f(t + h / 2, y + (h / 2) * k2);
      const k4 = f(t + h, y + h * k3);
      y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    }
    t = t + h;
    pts.push([t, y]);
  }
  return pts;
}

const PX_PER_T = 120;
const PX_PER_Y = 20;

interface MethodInfo {
  id: MethodId;
  name: string;
  order: number;
  color: string;
  formula: string;
  idea: string;
}

const METHODS: MethodInfo[] = [
  {
    id: 'euler',
    name: 'Euler',
    order: 1,
    color: '#c87b5e',
    formula: 'y_{n+1} = y_n + h · f(t_n, y_n)',
    idea: '只用起點斜率。最便宜、最粗糙。',
  },
  {
    id: 'rk2',
    name: 'RK2 (中點法)',
    order: 2,
    color: '#8b6aa8',
    formula: 'k₁ = f(t, y),  k₂ = f(t + h/2, y + h·k₁/2),  y_{n+1} = y_n + h · k₂',
    idea: '用中點的斜率。比起點斜率準得多——因為中點平均了起終點的變化。',
  },
  {
    id: 'rk4',
    name: 'RK4 (四階)',
    order: 4,
    color: 'var(--accent)',
    formula: 'k₁, k₂, k₃, k₄ 分別在 t, t+h/2, t+h/2, t+h 取樣，加權平均',
    idea: '四個樣本加權平均：端點各佔 1/6，兩中點各佔 2/6。誤差像 h⁴ 那麼快衰退。',
  },
];

@Component({
  selector: 'app-de-ch4-rk',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Runge-Kutta：更聰明的斜率估計" subtitle="§4.4">
      <p>
        Euler 的根本問題：<strong>它只看起點的斜率</strong>。一步之內斜率若劇烈變化，Euler 就錯得很遠。
      </p>
      <p class="key-idea">
        <strong>RK 方法的思想：用多個斜率樣本，加權平均成一個更準的「代表斜率」</strong>。
      </p>
      <p>
        RK2（中點法）最簡單：先用起點斜率<em>試走半步</em>，讀那邊的斜率，再用那個斜率從起點走整步。
        RK4 用四個樣本加權組合——就是教科書最常用的「通用」求解器。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三種方法同時跑：調 h，看誤差差幾個數量級">
      <!-- Plot: three curves + true -->
      <div class="plot-wrap">
        <svg viewBox="-20 -80 300 180" class="plot-svg">
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
            stroke="#5ca878" stroke-width="2.5" />

          <!-- Method paths -->
          @for (m of methods; track m.id) {
            <path [attr.d]="pathOf(m.id)" fill="none"
              [attr.stroke]="m.color" stroke-width="2" />
            <!-- Step points -->
            @for (p of pointsOf(m.id); track $index) {
              <circle [attr.cx]="p.x" [attr.cy]="p.y" r="2.8"
                [attr.fill]="m.color" stroke="white" stroke-width="1" />
            }
          }
        </svg>

        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>真解 y = e^t</span>
          @for (m of methods; track m.id) {
            <span class="leg"><span class="leg-dot" [style.background]="m.color"></span>{{ m.name }}</span>
          }
        </div>
      </div>

      <!-- Error table -->
      <div class="error-table">
        <div class="tbl-head">
          <span>方法</span>
          <span>階數</span>
          <span>@ t = 2 的誤差</span>
          <span>比 Euler</span>
        </div>
        @for (m of methods; track m.id) {
          <div class="tbl-row">
            <span class="m-name" [style.color]="m.color">{{ m.name }}</span>
            <span class="m-order">{{ m.order }}</span>
            <strong class="m-err">{{ errorOf(m.id).toExponential(2) }}</strong>
            <span class="m-ratio">
              @if (m.id === 'euler') { — }
              @else { {{ (errorOf('euler') / errorOf(m.id)).toFixed(0) }}× 更準 }
            </span>
          </div>
        }
      </div>

      <!-- Step size control -->
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">步長 h</span>
          <input type="range" min="0.05" max="0.8" step="0.02"
            [value]="h()" (input)="h.set(+$any($event).target.value)" />
          <span class="sl-val">{{ h().toFixed(2) }}</span>
        </div>
        <div class="step-info">
          n = {{ stepCount() }} 步（三法計算量相同：Euler 1 次求值／步，RK2 2 次，RK4 4 次）
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="log-log 圖：三條線斜率分別是 1, 2, 4">
      <p class="log-intro">
        階數 p 的方法在 log-log 圖上呈現斜率 p 的直線：h 縮一半，Euler 誤差縮一半（2×），
        RK2 縮 4 倍，RK4 縮 <strong>16 倍</strong>。
      </p>

      <div class="log-wrap">
        <svg viewBox="-40 -20 320 240" class="log-svg">
          <line x1="0" y1="200" x2="280" y2="200" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="0" x2="0" y2="200" stroke="var(--border-strong)" stroke-width="1" />
          <text x="284" y="204" class="ax">log(h)</text>
          <text x="-12" y="-4" class="ax">log(err)</text>

          @for (dec of [0, 1, 2, 3]; track dec) {
            <line [attr.x1]="dec * 70" y1="0" [attr.x2]="dec * 70" y2="200"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text [attr.x]="dec * 70" y="214" class="tick">10^(-{{ dec }})</text>
          }
          @for (dec of [0, 2, 4, 6, 8, 10]; track dec) {
            <line x1="0" [attr.y1]="dec * 20" x2="280" [attr.y2]="dec * 20"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text x="-6" [attr.y]="dec * 20 + 3" class="tick right">10^(-{{ dec }})</text>
          }

          <!-- Three error lines -->
          @for (m of methods; track m.id) {
            <polyline [attr.points]="logPolyline(m.id)" fill="none"
              [attr.stroke]="m.color" stroke-width="1.5" opacity="0.8" />
            @for (d of logData(m.id); track $index) {
              <circle [attr.cx]="d.x" [attr.cy]="d.y" r="3.5"
                [attr.fill]="m.color" stroke="white" stroke-width="1" />
            }
            <!-- Slope label -->
            <text [attr.x]="labelXOf(m.id).x"
              [attr.y]="labelXOf(m.id).y"
              class="slope-lab" [attr.fill]="m.color">
              斜率 ≈ {{ m.order }}
            </text>
          }

          <!-- Current h vertical -->
          <line [attr.x1]="currentHX()" y1="0" [attr.x2]="currentHX()" y2="200"
            stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
        </svg>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        重點：RK 家族並不是「更小的步長」——而是<strong>同樣步長下</strong>做更多的工作來換更準確的結果。
      </p>
      <div class="method-cards">
        @for (m of methods; track m.id) {
          <div class="m-card" [style.--col]="m.color">
            <div class="m-card-head">
              <span class="m-nm">{{ m.name }}</span>
              <span class="m-ord">階數 {{ m.order }}</span>
            </div>
            <code class="m-formula">{{ m.formula }}</code>
            <p class="m-idea">{{ m.idea }}</p>
          </div>
        }
      </div>

      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        RK4 是事實上「教科書等級 ODE」的首選。
        同一個 h 下，誤差比 Euler 小幾千倍。
        代價：每步要做 4 次 f 評估。但對大多數問題這很值得。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

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

    .plot-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .plot-svg { width: 100%; display: block; }

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

    .error-table {
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .tbl-head, .tbl-row {
      display: grid;
      grid-template-columns: 1.3fr 0.5fr 1.5fr 1.2fr;
      gap: 10px;
      padding: 10px 14px;
      align-items: center;
      font-size: 13px;
    }

    .tbl-head {
      background: var(--bg-surface);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }

    .tbl-row {
      border-bottom: 1px solid var(--border);
    }

    .tbl-row:last-child { border-bottom: none; }

    .m-name { font-weight: 700; font-size: 14px; }
    .m-order { text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .m-err { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-size: 13px; }
    .m-ratio { color: var(--text-secondary); font-size: 12px; }

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
      margin-bottom: 8px;
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

    .step-info {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
    }

    .log-intro {
      font-size: 13px;
      line-height: 1.7;
      padding: 10px 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      margin-bottom: 14px;
    }

    .log-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .log-svg { width: 100%; display: block; }

    .slope-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .method-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .m-card {
      padding: 12px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 6%, var(--bg));
    }

    .m-card-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .m-nm {
      font-size: 14px;
      font-weight: 700;
      color: var(--col);
    }

    .m-ord {
      font-size: 10px;
      padding: 2px 8px;
      background: var(--col);
      color: white;
      border-radius: 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    .m-formula {
      display: block;
      font-size: 11px;
      padding: 6px 8px;
      margin-bottom: 6px;
      color: var(--text);
      background: var(--bg-surface);
      border-radius: 4px;
      overflow-x: auto;
      white-space: nowrap;
    }

    .m-idea {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `,
})
export class DeCh4RungeKuttaComponent {
  readonly methods = METHODS;
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

  pathOf(m: MethodId): string {
    const pts = runMethod(m, this.h());
    return pts.map(([t, y], i) => `${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-y * PX_PER_Y).toFixed(1)}`).join(' ');
  }

  pointsOf(m: MethodId): { x: number; y: number }[] {
    const pts = runMethod(m, this.h());
    return pts.map(([t, y]) => ({ x: t * PX_PER_T, y: -y * PX_PER_Y }));
  }

  errorOf(m: MethodId): number {
    const pts = runMethod(m, this.h());
    const [t, y] = pts[pts.length - 1];
    return Math.abs(trueSol(t) - y);
  }

  readonly logData = (m: MethodId) => {
    const hs = [0.8, 0.5, 0.3, 0.2, 0.1, 0.05, 0.025, 0.012, 0.006];
    const out: { x: number; y: number }[] = [];
    for (const h of hs) {
      const pts = runMethod(m, h);
      const [t, y] = pts[pts.length - 1];
      const err = Math.abs(trueSol(t) - y);
      if (err <= 1e-14 || err >= 10) continue;
      const lh = -Math.log10(h);
      const le = -Math.log10(err);
      out.push({ x: lh * 70, y: le * 20 });
    }
    return out;
  };

  logPolyline(m: MethodId): string {
    return this.logData(m).map((d) => `${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(' ');
  }

  labelXOf(m: MethodId): { x: number; y: number } {
    const data = this.logData(m);
    if (data.length === 0) return { x: 0, y: 0 };
    const last = data[data.length - 1];
    return { x: last.x + 6, y: last.y };
  }

  readonly currentHX = computed(() => {
    const lh = -Math.log10(this.h());
    return lh * 70;
  });
}
