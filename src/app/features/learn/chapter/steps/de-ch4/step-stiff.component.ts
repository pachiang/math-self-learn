import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Stiff test problem: dy/dt = -λ·y + sin(t)  with λ = 50
 * True solution (for y(0) = 1): transient + steady-state.
 * Explicit Euler is stable only when h ≤ 2/λ = 0.04.
 */
const LAMBDA = 50;
const T0 = 0;
const Y0 = 1;
const T_END = 2;

const f = (t: number, y: number) => -LAMBDA * y + Math.sin(t);

// Analytical (approximately — steady state + transient) for visualization
// Actually we'll just use a fine RK4 reference
function referenceSolution(): Array<[number, number]> {
  const pts: Array<[number, number]> = [[T0, Y0]];
  let t = T0, y = Y0;
  const h = 0.001;
  while (t < T_END) {
    const k1 = f(t, y);
    const k2 = f(t + h / 2, y + (h / 2) * k1);
    const k3 = f(t + h / 2, y + (h / 2) * k2);
    const k4 = f(t + h, y + h * k3);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + h;
    pts.push([t, y]);
  }
  return pts;
}

const REF = referenceSolution();

function explicitEuler(h: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [[T0, Y0]];
  let t = T0, y = Y0;
  const n = Math.ceil((T_END - T0) / h);
  for (let i = 0; i < n; i++) {
    y = y + h * f(t, y);
    t = t + h;
    if (!isFinite(y) || Math.abs(y) > 1e10) {
      pts.push([t, Math.sign(y) * 1e10]);
      break;
    }
    pts.push([t, y]);
  }
  return pts;
}

/**
 * Implicit (backward) Euler:  y_{n+1} = y_n + h · f(t_{n+1}, y_{n+1})
 * For dy/dt = -λy + sin(t):
 *   y_{n+1} = y_n + h · (-λ y_{n+1} + sin(t_{n+1}))
 *   y_{n+1} (1 + h λ) = y_n + h · sin(t_{n+1})
 *   y_{n+1} = (y_n + h · sin(t_{n+1})) / (1 + h λ)
 */
function implicitEuler(h: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [[T0, Y0]];
  let t = T0, y = Y0;
  const n = Math.ceil((T_END - T0) / h);
  for (let i = 0; i < n; i++) {
    const tNext = t + h;
    y = (y + h * Math.sin(tNext)) / (1 + h * LAMBDA);
    t = tNext;
    pts.push([t, y]);
  }
  return pts;
}

const PX_PER_T = 140;
const PX_PER_Y = 120;

@Component({
  selector: 'app-de-ch4-stiff',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="剛性方程 + 隱式方法" subtitle="§4.6">
      <p>
        上一節的自適應步長解決了「某些區域需要小 h」的問題。但還有一類方程更棘手——<strong>剛性方程</strong>（stiff equations）：
      </p>
      <p class="key-idea">
        <strong>剛性 ODE：</strong>解本身很平滑，但方程藏著一個非常「<strong>急</strong>」的時間尺度，
        迫使顯式方法必須用極小的 h 才不會爆掉。
      </p>
      <p>
        典型範例：
      </p>
      <div class="centered-eq big">dy/dt = −λ y + sin(t)  (λ = 50)</div>
      <p>
        解的長期行為由 sin(t) 的緩變驅動（週期 ≈ 6.28），但方程裡的 <code>−50y</code> 代表一個<strong>時間常數 1/50 = 0.02</strong> 的快速衰減。
        任何顯式方法要穩定，h 必須 ≤ 2/λ = 0.04——<strong>即使解本身根本看不到這個細節</strong>。
      </p>
      <p>
        <strong>隱式方法</strong>（backward Euler 等）可以用任意大的 h 而保持穩定。代價是每一步要解一個方程，而不是直接計算。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="顯式 Euler 在 h > 0.04 時會爆炸；隱式 Euler 再大的 h 都穩定">
      <div class="plot-wrap">
        <div class="plot-title">三法對比：h = {{ h().toFixed(3) }}</div>
        <svg viewBox="-15 -30 340 220" class="plot-svg">
          <line x1="0" y1="130" x2="300" y2="130" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="0" x2="0" y2="170" stroke="var(--border-strong)" stroke-width="1" />
          <text x="304" y="134" class="ax">t</text>
          <text x="-4" y="-4" class="ax">y</text>

          @for (g of [0.5, 1, 1.5, 2]; track g) {
            <line [attr.x1]="g * PX_PER_T" y1="0" [attr.x2]="g * PX_PER_T" y2="170"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text [attr.x]="g * PX_PER_T" y="184" class="tick">{{ g }}</text>
          }

          <!-- Zero line -->
          <line x1="0" y1="130" x2="300" y2="130"
            stroke="var(--border-strong)" stroke-width="0.6" opacity="0.6" />

          <!-- Reference (reference RK4 with tiny h) -->
          <path [attr.d]="refPath" fill="none"
            stroke="#5ca878" stroke-width="2" opacity="0.85" />

          <!-- Explicit Euler -->
          <path [attr.d]="explicitPath()" fill="none"
            stroke="#c87b5e" stroke-width="2" opacity="0.9" />
          @for (p of explicitPoints(); track $index) {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" r="2.8"
              fill="#c87b5e" stroke="white" stroke-width="0.8" />
          }

          <!-- Implicit Euler -->
          <path [attr.d]="implicitPath()" fill="none"
            stroke="var(--accent)" stroke-width="2" />
          @for (p of implicitPoints(); track $index) {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" r="2.8"
              fill="var(--accent)" stroke="white" stroke-width="0.8" />
          }
        </svg>

        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>真解（細 RK4 參考）</span>
          <span class="leg"><span class="leg-dot" style="background:#c87b5e"></span>顯式 Euler</span>
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>隱式 Euler</span>
        </div>
      </div>

      <!-- Stability zones -->
      <div class="zones">
        <div class="zone safe" [class.active]="h() < 0.04">
          <span class="z-range">h &lt; 0.04</span>
          <span class="z-label">顯式穩定區</span>
          <p>兩法都接近真解。</p>
        </div>
        <div class="zone edge" [class.active]="h() >= 0.04 && h() < 0.05">
          <span class="z-range">h ≈ 0.04</span>
          <span class="z-label">臨界</span>
          <p>顯式剛好在穩定邊緣，略振盪。</p>
        </div>
        <div class="zone danger" [class.active]="h() >= 0.05">
          <span class="z-range">h &gt; 0.04</span>
          <span class="z-label">顯式爆炸區</span>
          <p>顯式失控，隱式依然穩。</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">步長 h</span>
          <input type="range" min="0.01" max="0.2" step="0.005"
            [value]="h()" (input)="h.set(+$any($event).target.value)" />
          <span class="sl-val">{{ h().toFixed(3) }}</span>
        </div>
        <div class="presets">
          @for (p of hPresets; track p) {
            <button class="pre-h" (click)="h.set(p)"
              [class.active]="Math.abs(h() - p) < 0.001">
              h = {{ p }}
            </button>
          }
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">|λh| =</span>
            <strong [class.warn]="h() * 50 > 2">{{ (h() * LAMBDA).toFixed(2) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">顯式穩定？</span>
            <strong [attr.data-ok]="h() * LAMBDA < 2">
              {{ h() * LAMBDA < 2 ? '✓ 是' : '✗ 爆炸' }}
            </strong>
          </div>
          <div class="ro">
            <span class="ro-k">步數</span>
            <strong>{{ stepCount() }}</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        隱式 Euler 的公式：
      </p>
      <div class="centered-eq">y(n+1) = y(n) + h · f(t(n+1), y(n+1))</div>
      <p>
        注意右邊的 y 是<strong>未來值</strong> y(n+1)，不是當前的 y(n)。這是個<em>代數方程</em>要解——對線性系統容易（就一個除法），對非線性就要 Newton 迭代。
        代價：每步計算複雜得多。回報：對剛性問題有無敵穩定性。
      </p>
      <ul>
        <li><strong>什麼時候會遇到剛性？</strong>化學反應（多個反應速率差異大）、電路（多個時間常數）、偏微分方程離散化後……太常見了。</li>
        <li><strong>現代 ODE 求解器</strong>如 MATLAB 的 <code>ode15s</code>、Python 的 <code>BDF</code> 方法都是隱式的，專門處理剛性問題。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        顯式方法（Euler、RK4）是「直接算」，簡單但對剛性方程無能為力。
        隱式方法「解個方程」，複雜但換來的是可以用<strong>大 h 依然穩定</strong>。
        選方法時要先問自己：「我的問題剛性嗎？」
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 18px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 20px; padding: 16px; }

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
      margin-bottom: 12px;
    }

    .plot-title {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
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

    .zones {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }

    @media (max-width: 560px) {
      .zones { grid-template-columns: 1fr; }
    }

    .zone {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      opacity: 0.5;
      transition: all 0.2s;
    }

    .zone.active { opacity: 1; }

    .zone.safe.active {
      border-color: rgba(92, 168, 120, 0.5);
      background: rgba(92, 168, 120, 0.08);
    }

    .zone.edge.active {
      border-color: rgba(244, 200, 102, 0.5);
      background: rgba(244, 200, 102, 0.08);
    }

    .zone.danger.active {
      border-color: rgba(200, 123, 94, 0.5);
      background: rgba(200, 123, 94, 0.08);
    }

    .z-range {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }

    .z-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin: 2px 0 4px;
    }

    .zone.safe.active .z-label { color: #5ca878; }
    .zone.edge.active .z-label { color: #ba8d2a; }
    .zone.danger.active .z-label { color: #c87b5e; }

    .zone p {
      margin: 0;
      font-size: 11px;
      color: var(--text-secondary);
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
      min-width: 52px;
      text-align: right;
    }

    .presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .pre-h {
      font: inherit;
      font-size: 11px;
      padding: 4px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .pre-h:hover { border-color: var(--accent); }
    .pre-h.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 6px;
    }

    .ro {
      padding: 6px 10px;
      background: var(--bg);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .ro-k { color: var(--text-muted); }

    .ro strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .ro strong.warn { color: #c87b5e; }
    .ro strong[data-ok='true'] { color: #5ca878; }
    .ro strong[data-ok='false'] { color: #c87b5e; }
  `,
})
export class DeCh4StiffComponent {
  readonly Math = Math;
  readonly LAMBDA = LAMBDA;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;
  readonly h = signal(0.08);
  readonly hPresets = [0.02, 0.04, 0.05, 0.08, 0.12];

  readonly refPath = (() => {
    // Reference: sample every 5th point to keep path small
    const sampled: string[] = [];
    for (let i = 0; i < REF.length; i += 5) {
      const [t, y] = REF[i];
      // Scale y: reference is roughly in [0, 1] (sin and -λy balance)
      const clamp = Math.max(-1.5, Math.min(1.5, y));
      sampled.push(`${sampled.length === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(130 - clamp * PX_PER_Y).toFixed(1)}`);
    }
    return sampled.join(' ');
  })();

  readonly explicitResult = computed(() => explicitEuler(this.h()));
  readonly implicitResult = computed(() => implicitEuler(this.h()));

  readonly explicitPath = computed(() => {
    const pts = this.explicitResult();
    return pts
      .map(([t, y], i) => {
        const clamp = Math.max(-2, Math.min(2, y));
        return `${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(130 - clamp * PX_PER_Y).toFixed(1)}`;
      })
      .join(' ');
  });

  readonly implicitPath = computed(() => {
    const pts = this.implicitResult();
    return pts
      .map(([t, y], i) => `${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(130 - Math.max(-2, Math.min(2, y)) * PX_PER_Y).toFixed(1)}`)
      .join(' ');
  });

  readonly explicitPoints = computed(() => {
    const pts = this.explicitResult();
    return pts.map(([t, y]) => ({
      x: t * PX_PER_T,
      y: 130 - Math.max(-2, Math.min(2, y)) * PX_PER_Y,
    }));
  });

  readonly implicitPoints = computed(() => {
    const pts = this.implicitResult();
    return pts.map(([t, y]) => ({
      x: t * PX_PER_T,
      y: 130 - Math.max(-2, Math.min(2, y)) * PX_PER_Y,
    }));
  });

  readonly stepCount = computed(() => Math.ceil((T_END - T0) / this.h()));
}
