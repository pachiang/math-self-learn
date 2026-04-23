import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Test problem with sharp transition: dy/dt = -2(y - sech(10(t-1.5))²)
 * Reference solution closely tracks y_ref = sech²(10(t-1.5)), a pulse.
 * For this demo we'll use a simpler sharp solution:
 *   y(t) such that dy/dt is small away from t=1.5 but large near t=1.5.
 *
 * We'll use:  dy/dt = -20·y·(t-1.5)·exp(-10(t-1.5)²)
 * But easier: let's just use a known pulse y_true(t) and compute f = dy/dt from it.
 * For visualization we'll just show sampled step positions colored by local h.
 */

const T0 = 0;
const T_END = 3;

// True pulse solution: Gaussian-like bump
// y(t) = exp(-10 (t - 1.5)²) + 0.05·t  (slow rise + sharp pulse)
function trueSol(t: number): number {
  return Math.exp(-10 * (t - 1.5) * (t - 1.5)) + 0.05 * t;
}

// Derivative f(t) = dy/dt analytically
function f(t: number): number {
  return -20 * (t - 1.5) * Math.exp(-10 * (t - 1.5) * (t - 1.5)) + 0.05;
}

/**
 * Embedded RK45: take a full step with RK4 and RK5, use their difference as error estimate.
 * Simplified demo: adjust h based on |RK4 step - RK2 step| vs tolerance.
 */
function adaptiveRun(tol: number): Array<{ t: number; y: number; h: number }> {
  const pts: Array<{ t: number; y: number; h: number }> = [{ t: T0, y: trueSol(T0), h: 0.2 }];
  let t = T0;
  let h = 0.2;
  const h_min = 0.005;
  const h_max = 0.5;
  let guard = 0;
  while (t < T_END && guard < 500) {
    // Attempt step with RK2 and RK4 (using f(t) only since autonomous in t here)
    const rk2Step = (t: number, _y: number, h: number) => h * f(t + h / 2);
    const rk4Step = (t: number, _y: number, h: number) => {
      const k1 = f(t);
      const k2 = f(t + h / 2);
      const k3 = f(t + h / 2);
      const k4 = f(t + h);
      return (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    };

    const y = pts[pts.length - 1].y;
    const dy2 = rk2Step(t, y, h);
    const dy4 = rk4Step(t, y, h);
    const err = Math.abs(dy4 - dy2);

    if (err > tol && h > h_min) {
      // Reject step, shrink h
      h = Math.max(h_min, h * Math.max(0.3, Math.pow(tol / err, 0.25)));
      guard++;
      continue;
    }

    // Accept step
    t = t + h;
    const yNew = y + dy4;
    pts.push({ t, y: yNew, h });

    // Grow h if error is comfortable
    if (err < tol * 0.1) {
      h = Math.min(h_max, h * 1.4);
    }

    guard++;
  }
  return pts;
}

function fixedRun(h: number): Array<{ t: number; y: number }> {
  const pts: Array<{ t: number; y: number }> = [{ t: T0, y: trueSol(T0) }];
  let t = T0;
  let y = trueSol(T0);
  const n = Math.ceil((T_END - T0) / h);
  for (let i = 0; i < n; i++) {
    // RK4 step
    const k1 = f(t);
    const k2 = f(t + h / 2);
    const k3 = f(t + h / 2);
    const k4 = f(t + h);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + h;
    pts.push({ t, y });
    if (t >= T_END) break;
  }
  return pts;
}

const PX_PER_T = 95;
const PX_PER_Y = 95;

@Component({
  selector: 'app-de-ch4-adaptive',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="自適應步長" subtitle="§4.5">
      <p>
        前面我們都用<strong>固定步長</strong>——全程 h 不變。但真實問題中，解曲線常有這種特徵：
      </p>
      <ul>
        <li><strong>大部分時間</strong>行為平緩——小步長只是浪費</li>
        <li><strong>少數時刻</strong>行為劇變——大步長會漏掉細節甚至失準</li>
      </ul>
      <p>
        解決辦法：<strong>讓步長自己決定</strong>——平滑區自動變大、劇變區自動變小。
        這就是「<strong>自適應步長</strong>」（adaptive step size）。
      </p>
      <p class="key-idea">
        <strong>機制：</strong>每一步都用「兩個不同階數的方法」同時算一次，取差值當作誤差估計。
        誤差太大 → 拒絕該步、把 h 縮小重來；誤差很小 → 接受並把 h 加大一點。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察：脈衝附近步長自動變密，平穩區自動變疏">
      <!-- Top: true solution + both step visualizations -->
      <div class="plot-wrap">
        <div class="plot-title">
          解：y(t) = e^(-10(t-1.5)²) + 0.05t（中央有脈衝、兩邊平緩）
        </div>
        <svg viewBox="-15 -30 330 240" class="plot-svg">
          <!-- Axes -->
          <line x1="0" y1="180" x2="310" y2="180" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="0" x2="0" y2="180" stroke="var(--border-strong)" stroke-width="1" />
          <text x="314" y="184" class="ax">t</text>
          <text x="-4" y="-4" class="ax">y</text>

          <!-- Grid -->
          @for (g of [0.5, 1, 1.5, 2, 2.5, 3]; track g) {
            <line [attr.x1]="g * PX_PER_T" y1="0" [attr.x2]="g * PX_PER_T" y2="180"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            <text [attr.x]="g * PX_PER_T" y="194" class="tick">{{ g }}</text>
          }

          <!-- True pulse -->
          <path [attr.d]="truePath" fill="none"
            stroke="#5ca878" stroke-width="2" opacity="0.85" />

          <!-- Adaptive steps (colored by h) -->
          @if (mode() === 'adaptive') {
            @for (p of adaptivePoints(); track $index; let i = $index) {
              <circle [attr.cx]="p.t * PX_PER_T"
                [attr.cy]="180 - p.y * PX_PER_Y"
                r="3.5"
                [attr.fill]="hColor(p.h)" stroke="white" stroke-width="1" />
            }
            <!-- Connecting path -->
            <path [attr.d]="adaptivePath()" fill="none"
              stroke="var(--accent)" stroke-width="1.8" opacity="0.6" />
          }

          <!-- Fixed steps -->
          @if (mode() === 'fixed') {
            @for (p of fixedPoints(); track $index) {
              <circle [attr.cx]="p.t * PX_PER_T"
                [attr.cy]="180 - p.y * PX_PER_Y"
                r="3.5"
                fill="var(--accent)" stroke="white" stroke-width="1" />
            }
            <path [attr.d]="fixedPath()" fill="none"
              stroke="var(--accent)" stroke-width="1.8" opacity="0.6" />
          }
        </svg>
      </div>

      <!-- Mode toggle -->
      <div class="mode-row">
        <button class="mode-btn" [class.active]="mode() === 'fixed'"
          (click)="mode.set('fixed')">固定步長 (RK4, h = {{ fixedH().toFixed(2) }})</button>
        <button class="mode-btn" [class.active]="mode() === 'adaptive'"
          (click)="mode.set('adaptive')">自適應步長 (tol = {{ tol().toExponential(0) }})</button>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        @if (mode() === 'fixed') {
          <div class="sl">
            <span class="sl-lab">固定 h</span>
            <input type="range" min="0.01" max="0.3" step="0.005"
              [value]="fixedH()" (input)="fixedH.set(+$any($event).target.value)" />
            <span class="sl-val">{{ fixedH().toFixed(3) }}</span>
          </div>
        } @else {
          <div class="sl">
            <span class="sl-lab">容錯 tol</span>
            <input type="range" min="-6" max="-1" step="0.1"
              [value]="tolExp()" (input)="tolExp.set(+$any($event).target.value)" />
            <span class="sl-val">10^{{ tolExp().toFixed(1) }}</span>
          </div>
        }

        <div class="readout">
          @if (mode() === 'fixed') {
            <div class="ro">
              <span class="ro-k">總步數</span>
              <strong>{{ fixedPoints().length - 1 }}</strong>
            </div>
            <div class="ro">
              <span class="ro-k">最大誤差</span>
              <strong [class.warn]="fixedMaxError() > 0.01">
                {{ fixedMaxError().toExponential(2) }}
              </strong>
            </div>
          } @else {
            <div class="ro">
              <span class="ro-k">總步數</span>
              <strong>{{ adaptivePoints().length - 1 }}</strong>
            </div>
            <div class="ro">
              <span class="ro-k">最小 h</span>
              <strong>{{ adaptiveMinH().toFixed(3) }}</strong>
            </div>
            <div class="ro">
              <span class="ro-k">最大 h</span>
              <strong>{{ adaptiveMaxH().toFixed(3) }}</strong>
            </div>
            <div class="ro">
              <span class="ro-k">最大誤差</span>
              <strong>{{ adaptiveMaxError().toExponential(2) }}</strong>
            </div>
          }
        </div>

        @if (mode() === 'adaptive') {
          <div class="legend-h">
            步長 h 對應顏色：
            <span class="h-chip" style="background:#5a8aa8">小 h（脈衝區）</span>
            <span class="h-chip" style="background:#a89a5c">中 h</span>
            <span class="h-chip" style="background:#c87b5e">大 h（平穩區）</span>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察這個脈衝問題：
      </p>
      <ul>
        <li><strong>固定 h = 0.05</strong>：60 步全跑。大部分沒必要那麼密——但放寬 h 會漏掉脈衝尖端。</li>
        <li><strong>自適應</strong>：只在 t ≈ 1.5 附近密集取樣，兩端平緩區快速跳過。總步數可能不到一半。</li>
      </ul>
      <p>
        自適應法的代價是：每一步要做「兩次估算」來比較誤差——但這只比 RK4 慢一點點，在長時間模擬裡完全值回票價。
      </p>
      <p>
        常見的實作是<strong>嵌入式方法</strong>（embedded RK），像是 Dormand-Prince（RK45）：一次計算就能同時得到 4 階跟 5 階估計，差距當作誤差。
        MATLAB 的 <code>ode45</code>、Python 的 <code>scipy.integrate.solve_ivp</code> 預設都用這個。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        現代 ODE 求解器極少用固定步長。它們會<strong>用誤差估計自動決定步長</strong>——在關鍵處精細、在平穩處偷懶。
        這就是為什麼你叫 MATLAB 解一條 ODE 不用指定 h，它自己決定。
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

    .mode-row {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }

    .mode-btn {
      font: inherit;
      font-size: 13px;
      padding: 8px 14px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
      flex: 1;
      font-weight: 600;
    }

    .mode-btn:hover { border-color: var(--accent); }
    .mode-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
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
      min-width: 60px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 64px;
      text-align: right;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 6px;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
      margin-bottom: 8px;
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

    .legend-h {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .h-chip {
      padding: 2px 8px;
      border-radius: 10px;
      color: white;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class DeCh4AdaptiveComponent {
  readonly mode = signal<'fixed' | 'adaptive'>('adaptive');
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;
  readonly fixedH = signal(0.05);
  readonly tolExp = signal(-3);

  readonly tol = computed(() => Math.pow(10, this.tolExp()));

  readonly truePath = (() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const t = T0 + (i / n) * (T_END - T0);
      const y = trueSol(t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(180 - y * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly adaptivePoints = computed(() => adaptiveRun(this.tol()));
  readonly fixedPoints = computed(() => fixedRun(this.fixedH()));

  readonly adaptivePath = computed(() => {
    const pts = this.adaptivePoints();
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t * PX_PER_T).toFixed(1)} ${(180 - p.y * PX_PER_Y).toFixed(1)}`)
      .join(' ');
  });

  readonly fixedPath = computed(() => {
    const pts = this.fixedPoints();
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t * PX_PER_T).toFixed(1)} ${(180 - p.y * PX_PER_Y).toFixed(1)}`)
      .join(' ');
  });

  readonly adaptiveMinH = computed(() => {
    const pts = this.adaptivePoints();
    return pts.slice(1).reduce((m, p) => Math.min(m, p.h), Infinity);
  });

  readonly adaptiveMaxH = computed(() => {
    const pts = this.adaptivePoints();
    return pts.slice(1).reduce((m, p) => Math.max(m, p.h), 0);
  });

  readonly adaptiveMaxError = computed(() => {
    const pts = this.adaptivePoints();
    let maxErr = 0;
    for (const p of pts) {
      const err = Math.abs(p.y - trueSol(p.t));
      if (err > maxErr) maxErr = err;
    }
    return maxErr;
  });

  readonly fixedMaxError = computed(() => {
    const pts = this.fixedPoints();
    let maxErr = 0;
    for (const p of pts) {
      const err = Math.abs(p.y - trueSol(p.t));
      if (err > maxErr) maxErr = err;
    }
    return maxErr;
  });

  hColor(h: number): string {
    // 0.005 blue → 0.1 yellow → 0.5 orange
    const t = Math.max(0, Math.min(1, (h - 0.005) / 0.3));
    if (t < 0.5) {
      // blue → yellow
      const f = t * 2;
      const r = Math.round(90 + (168 - 90) * f);
      const g = Math.round(138 + (154 - 138) * f);
      const b = Math.round(168 + (92 - 168) * f);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // yellow → orange
      const f = (t - 0.5) * 2;
      const r = Math.round(168 + (200 - 168) * f);
      const g = Math.round(154 + (123 - 154) * f);
      const b = Math.round(92 + (94 - 92) * f);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
}
