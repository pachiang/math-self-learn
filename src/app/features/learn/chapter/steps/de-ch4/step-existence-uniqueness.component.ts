import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Scenario {
  id: string;
  label: string;
  eq: string;
  f: (t: number, y: number) => number;
  // Partial derivative ∂f/∂y (for Lipschitz check)
  fy: (t: number, y: number) => number;
  status: 'lipschitz' | 'non-unique' | 'blowup';
  verdict: string;
  explanation: string;
  trajectories: Array<{ t0: number; y0: number; color: string; label?: string }>;
  // Optional analytic-looking special solutions to overlay
  extraCurves?: Array<{ path: (tMin: number, tMax: number) => string; color: string; dashed?: boolean; label: string }>;
  tRange: [number, number];
  yRange: [number, number];
}

const PX_PER_T = 48;
const PX_PER_Y = 28;

function rk4(
  f: (t: number, y: number) => number,
  t0: number,
  y0: number,
  tEnd: number,
  direction: 1 | -1,
  maxStep = 0.01,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [[t0, y0]];
  let t = t0;
  let y = y0;
  const h = maxStep * direction;
  const numSteps = Math.max(1, Math.ceil(Math.abs(tEnd - t0) / maxStep));
  for (let i = 0; i < numSteps; i++) {
    const k1 = f(t, y);
    const k2 = f(t + h / 2, y + (h / 2) * k1);
    const k3 = f(t + h / 2, y + (h / 2) * k2);
    const k4 = f(t + h, y + h * k3);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + h;
    if (!isFinite(y) || Math.abs(y) > 30) break;
    pts.push([t, y]);
    if (direction > 0 && t >= tEnd) break;
    if (direction < 0 && t <= tEnd) break;
  }
  return pts;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'well-behaved',
    label: 'dy/dt = y',
    eq: 'dy/dt = y',
    f: (_t, y) => y,
    fy: (_t, _y) => 1,
    status: 'lipschitz',
    verdict: '✓ 到處 Lipschitz → 每個初值唯一解',
    explanation:
      '因為 ∂f/∂y = 1 是常數（有界），所以函數 f(t, y) 對 y 是 Lipschitz 連續的。Picard-Lindelöf 定理保證每個初值問題都有唯一解。',
    trajectories: [
      { t0: 0, y0: 0.5, color: '#5ca878', label: 'y(0)=0.5' },
      { t0: 0, y0: -0.5, color: '#c87b5e', label: 'y(0)=-0.5' },
      { t0: 0, y0: 0, color: '#8a9aa8', label: 'y(0)=0（恆為 0）' },
    ],
    tRange: [-1.5, 2.5],
    yRange: [-3, 3],
  },
  {
    id: 'non-unique',
    label: 'dy/dt = 3·y^(2/3)',
    eq: 'dy/dt = 3·y^(2/3)',
    f: (_t, y) => 3 * Math.cbrt(y * y),
    fy: (_t, y) => {
      const absY = Math.abs(y);
      if (absY < 1e-9) return Infinity;
      return 2 * Math.cbrt(1 / absY);
    },
    status: 'non-unique',
    verdict: '✗ 原點附近非 Lipschitz → 解不唯一',
    explanation:
      '在 y = 0 附近，∂f/∂y = 2/∛y → ∞，所以 Lipschitz 條件失效。從 (0, 0) 出發，至少有兩條解：永遠留在 y=0，以及 y(t) = t³。兩者都滿足方程。',
    trajectories: [
      { t0: 0, y0: 0, color: '#c87b5e', label: 'y=0（停留）' },
    ],
    extraCurves: [
      {
        path: (tMin, tMax) => {
          const pts: string[] = [];
          const n = 100;
          for (let i = 0; i <= n; i++) {
            const t = tMin + (i / n) * (tMax - tMin);
            const y = t * t * t;
            if (Math.abs(y) > 30) continue;
            const x = t * PX_PER_T;
            const py = -y * PX_PER_Y;
            pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${py.toFixed(1)}`);
          }
          return pts.join(' ');
        },
        color: '#8b6aa8',
        label: 'y(t) = t³',
      },
      {
        // a "delayed start" solution: stays 0 until t=1, then y = (t-1)³
        path: (tMin, tMax) => {
          const pts: string[] = [];
          const n = 100;
          for (let i = 0; i <= n; i++) {
            const t = tMin + (i / n) * (tMax - tMin);
            const y = t < 1 ? 0 : (t - 1) ** 3;
            if (Math.abs(y) > 30) continue;
            const x = t * PX_PER_T;
            const py = -y * PX_PER_Y;
            pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${py.toFixed(1)}`);
          }
          return pts.join(' ');
        },
        color: '#5ca878',
        dashed: true,
        label: '「延遲起步」解',
      },
    ],
    tRange: [-0.5, 2.5],
    yRange: [-2, 10],
  },
  {
    id: 'blowup',
    label: 'dy/dt = y²',
    eq: 'dy/dt = y²',
    f: (_t, y) => y * y,
    fy: (_t, y) => 2 * y,
    status: 'blowup',
    verdict: '△ 局部 Lipschitz → 解存在但只能活到有限時間',
    explanation:
      '∂f/∂y = 2y，只要 y 有限就局部 Lipschitz，所以短時間內有唯一解。但解 y(t) = 1/(1/y₀ − t) 會在 t = 1/y₀ 時爆炸到無限大。這叫「有限時間爆炸」——Picard 定理只保證「某個時段內」的存在性。',
    trajectories: [
      { t0: 0, y0: 0.5, color: '#5ca878', label: 'y(0)=0.5（爆炸 @ t=2）' },
      { t0: 0, y0: 1, color: '#c87b5e', label: 'y(0)=1（爆炸 @ t=1）' },
      { t0: 0, y0: -0.5, color: '#5a8aa8', label: 'y(0)=-0.5（向上爬）' },
    ],
    tRange: [-0.5, 3],
    yRange: [-3, 10],
  },
];

@Component({
  selector: 'app-de-ch4-existence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="存在唯一性：解到底存不存在？" subtitle="§4.1">
      <p>
        前三章我們一直假設：給個方程跟初值，<strong>就有唯一的解</strong>。解曲線不交叉、不分岔、一路延伸到無窮。
        但這是真的嗎？
      </p>
      <p>
        答案是：<strong>在多數情況下是</strong>，但<strong>不是永遠</strong>。
        這一節要看：什麼條件保證唯一解存在，以及當條件失效時會發生什麼。
      </p>
      <p class="key-idea">
        <strong>Picard-Lindelöf 定理：</strong>
        若 f(t, y) 對 y 是 <strong>Lipschitz 連續</strong>（即 <code>|f(t,y₁) − f(t,y₂)| ≤ L|y₁ − y₂|</code>），
        則初值問題 <code>y′ = f(t, y), y(t₀) = y₀</code> 在 t₀ 附近存在<strong>唯一</strong>的解。
      </p>
      <p>
        實務上的 Lipschitz 判斷常用：如果 <code>∂f/∂y</code> 在某區域有界，f 在那區域就 Lipschitz。
        所以檢查 <strong>∂f/∂y 是否 blow up</strong>，基本上就能斷診。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三個方程 → 看 Lipschitz 條件、解族、有沒有交叉或爆炸">
      <div class="picker">
        @for (s of scenarios; track s.id) {
          <button
            class="pick-btn"
            [class.active]="selected().id === s.id"
            (click)="switchScenario(s)"
          >{{ s.label }}</button>
        }
      </div>

      <!-- Status -->
      <div class="verdict" [attr.data-status]="selected().status">
        <div class="v-big">{{ selected().verdict }}</div>
        <p class="v-body">{{ selected().explanation }}</p>
      </div>

      <!-- Slope field + trajectories -->
      <div class="plot-wrap">
        <svg [attr.viewBox]="viewBox()" class="plot-svg">
          <!-- Grid -->
          @for (g of gridV(); track g) {
            <line [attr.x1]="g.x" [attr.y1]="g.y1"
              [attr.x2]="g.x" [attr.y2]="g.y2"
              stroke="var(--border)" stroke-width="0.4" opacity="0.55" />
          }
          @for (g of gridH(); track g) {
            <line [attr.x1]="g.x1" [attr.y1]="g.y"
              [attr.x2]="g.x2" [attr.y2]="g.y"
              stroke="var(--border)" stroke-width="0.4" opacity="0.55" />
          }

          <!-- Axes -->
          <line [attr.x1]="ab().xMin" y1="0"
            [attr.x2]="ab().xMax" y2="0"
            stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" [attr.y1]="ab().yMin"
            x2="0" [attr.y2]="ab().yMax"
            stroke="var(--border-strong)" stroke-width="1" />

          <!-- Slope field -->
          @for (a of arrows(); track a.k) {
            <line [attr.x1]="a.x1" [attr.y1]="a.y1"
              [attr.x2]="a.x2" [attr.y2]="a.y2"
              [attr.stroke]="a.color" stroke-width="1.2"
              stroke-linecap="round" opacity="0.6" />
          }

          <!-- Lipschitz violation zones (for non-unique case): shade where ∂f/∂y > threshold -->
          @if (selected().status === 'non-unique') {
            <rect [attr.x]="ab().xMin" y="-8" [attr.width]="ab().xMax - ab().xMin" height="16"
              fill="#c87b5e" opacity="0.1" />
            <text x="0" y="4" class="warn-lab" text-anchor="middle">
              ∂f/∂y 在 y=0 發散
            </text>
          }

          <!-- Primary trajectories (numerical RK4 from each IC) -->
          @for (tr of trajectoryRenders(); track tr.label) {
            <path [attr.d]="tr.path" fill="none"
              [attr.stroke]="tr.color" stroke-width="2.2" />
            <circle [attr.cx]="tr.cx" [attr.cy]="tr.cy" r="4.5"
              [attr.fill]="tr.color" stroke="white" stroke-width="1.5" />
          }

          <!-- Extra analytical curves (for non-unique scenario) -->
          @for (ec of extraCurveRenders(); track ec.label) {
            <path [attr.d]="ec.d" fill="none"
              [attr.stroke]="ec.color" stroke-width="2"
              [attr.stroke-dasharray]="ec.dashed ? '5 3' : null" />
          }

          <!-- Blowup asymptote markers (for y^2 case) -->
          @if (selected().status === 'blowup') {
            @for (b of blowupAsymptotes(); track b.t) {
              <line [attr.x1]="b.t * 48" [attr.y1]="ab().yMin"
                [attr.x2]="b.t * 48" [attr.y2]="ab().yMax"
                [attr.stroke]="b.color" stroke-width="1"
                stroke-dasharray="3 2" opacity="0.5" />
              <text [attr.x]="b.t * 48 + 4" [attr.y]="ab().yMin + 14"
                class="warn-lab" [attr.fill]="b.color">
                爆炸於 t={{ b.t }}
              </text>
            }
          }
        </svg>

        <!-- Legend -->
        <div class="legend">
          @for (tr of selected().trajectories; track tr.label) {
            <span class="leg-item">
              <span class="leg-dot" [style.background]="tr.color"></span>{{ tr.label }}
            </span>
          }
          @for (ec of selected().extraCurves || []; track ec.label) {
            <span class="leg-item">
              <span class="leg-dot" [style.background]="ec.color"
                [class.dashed]="ec.dashed"></span>{{ ec.label }}
            </span>
          }
        </div>
      </div>

      <!-- Lipschitz point checker -->
      <div class="checker">
        <div class="checker-head">
          <span class="chk-lab">Lipschitz 檢查器</span>
          <span class="chk-hint">指定一點 (t, y)，看 ∂f/∂y 多大</span>
        </div>
        <div class="sliders">
          <div class="sl">
            <span class="sl-lab">t =</span>
            <input type="range" min="-2" max="3" step="0.05"
              [value]="qt()" (input)="qt.set(+$any($event).target.value)" />
            <span class="sl-val">{{ qt().toFixed(2) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">y =</span>
            <input type="range" min="-2" max="2" step="0.05"
              [value]="qy()" (input)="qy.set(+$any($event).target.value)" />
            <span class="sl-val">{{ qy().toFixed(2) }}</span>
          </div>
        </div>
        <div class="readout">
          <div class="ro">
            <span class="ro-k">f(t, y)</span>
            <strong>{{ fValue().toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">∂f/∂y</span>
            <strong [class.warn]="!isFinite(fyValue()) || Math.abs(fyValue()) > 50">
              @if (!isFinite(fyValue())) { ∞ }
              @else { {{ fyValue().toFixed(2) }} }
            </strong>
          </div>
          <div class="ro">
            <span class="ro-k">Lipschitz？</span>
            <strong [attr.data-ok]="fyLocallyBounded()">
              {{ fyLocallyBounded() ? '是（局部）' : '否（爆炸）' }}
            </strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        三種情形的精神總結：
      </p>
      <ul>
        <li><strong>Lipschitz 處處成立</strong>（Case 1）：最乾淨，解存在又唯一、一路延伸到 ±∞。大部分「正常」的 ODE 屬於這類。</li>
        <li><strong>局部非 Lipschitz</strong>（Case 2）：出現「奇點」的地方，多條解共享同一起點。物理上這常代表<em>模型本身在那裡崩潰</em>。</li>
        <li><strong>Lipschitz 但局部</strong>（Case 3）：短時間有唯一解，長時間可能 blow up 到無限。數值方法需要特別小心接近爆炸時間。</li>
      </ul>
      <p>
        這一節很理論，但有個很實際的用處：<strong>跑數值模擬前，先檢查方程的 ∂f/∂y 是不是到處有界</strong>。
        如果不是，你必須特別注意初值選擇，以及別讓數值積分跨越奇點。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        「唯一解」不是廉價的假設——它來自 Lipschitz 條件。
        接下來四節我們要數值地逼近解，所有方法都默認 Lipschitz 成立；
        違反它會導致積分步伐走到完全錯的方向。
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

    .picker {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .pick-btn {
      font: inherit;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
    }

    .pick-btn:hover { border-color: var(--accent); }
    .pick-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .verdict {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 14px;
    }

    .verdict[data-status='lipschitz'] {
      background: rgba(92, 168, 120, 0.08);
      border: 1px solid rgba(92, 168, 120, 0.35);
    }

    .verdict[data-status='non-unique'] {
      background: rgba(200, 123, 94, 0.08);
      border: 1px solid rgba(200, 123, 94, 0.35);
    }

    .verdict[data-status='blowup'] {
      background: rgba(139, 106, 168, 0.08);
      border: 1px solid rgba(139, 106, 168, 0.35);
    }

    .v-big {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .verdict[data-status='lipschitz'] .v-big { color: #5ca878; }
    .verdict[data-status='non-unique'] .v-big { color: #c87b5e; }
    .verdict[data-status='blowup'] .v-big { color: #8b6aa8; }

    .v-body {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-secondary);
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
      max-width: 500px;
      margin: 0 auto;
    }

    .warn-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      fill: #c87b5e;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
    }

    .leg-item {
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

    .leg-dot.dashed {
      background-image: linear-gradient(to right, currentColor 50%, transparent 50%);
      background-size: 4px 3px;
    }

    .checker {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .checker-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chk-lab {
      font-size: 12px;
      font-weight: 700;
      color: var(--text);
    }

    .chk-hint {
      font-size: 11px;
      color: var(--text-muted);
    }

    .sliders {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      font-family: 'Noto Sans Math', serif;
      min-width: 34px;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
export class DeCh4ExistenceComponent {
  readonly Math = Math;
  readonly scenarios = SCENARIOS;
  readonly selected = signal<Scenario>(SCENARIOS[0]);
  readonly qt = signal(1);
  readonly qy = signal(0.5);

  readonly isFinite = Number.isFinite;

  switchScenario(s: Scenario): void {
    this.selected.set(s);
  }

  readonly ab = computed(() => {
    const [tMin, tMax] = this.selected().tRange;
    const [yMin, yMax] = this.selected().yRange;
    return {
      xMin: tMin * PX_PER_T,
      xMax: tMax * PX_PER_T,
      yMin: -yMax * PX_PER_Y,
      yMax: -yMin * PX_PER_Y,
    };
  });

  readonly viewBox = computed(() => {
    const b = this.ab();
    const pad = 24;
    return `${b.xMin - pad} ${b.yMin - pad} ${b.xMax - b.xMin + 2 * pad} ${b.yMax - b.yMin + 2 * pad}`;
  });

  readonly gridV = computed(() => {
    const [tMin, tMax] = this.selected().tRange;
    const lines: { x: number; y1: number; y2: number }[] = [];
    for (let t = Math.ceil(tMin); t <= Math.floor(tMax); t++) {
      if (t === 0) continue;
      lines.push({ x: t * PX_PER_T, y1: this.ab().yMin, y2: this.ab().yMax });
    }
    return lines;
  });

  readonly gridH = computed(() => {
    const [yMin, yMax] = this.selected().yRange;
    const lines: { y: number; x1: number; x2: number }[] = [];
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      if (y === 0) continue;
      lines.push({ y: -y * PX_PER_Y, x1: this.ab().xMin, x2: this.ab().xMax });
    }
    return lines;
  });

  readonly arrows = computed(() => {
    const ex = this.selected();
    const [tMin, tMax] = ex.tRange;
    const [yMin, yMax] = ex.yRange;
    const out: { k: string; x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    for (let i = 0; i <= 12; i++) {
      for (let j = 0; j <= 10; j++) {
        const t = tMin + (i / 12) * (tMax - tMin);
        const y = yMin + (j / 10) * (yMax - yMin);
        let slope = 0;
        try { slope = ex.f(t, y); } catch { continue; }
        if (!isFinite(slope)) continue;
        const clamped = Math.max(-30, Math.min(30, slope));
        const cx = t * PX_PER_T;
        const cy = -y * PX_PER_Y;
        const dx = PX_PER_T;
        const dy = -PX_PER_Y * clamped;
        const len = Math.sqrt(dx * dx + dy * dy);
        const s = 8 / len;
        let color = 'var(--text-muted)';
        if (slope > 0.2) color = '#c87b5e';
        else if (slope < -0.2) color = '#5a8aa8';
        out.push({
          k: `${i}_${j}`,
          x1: cx - dx * s, y1: cy - dy * s,
          x2: cx + dx * s, y2: cy + dy * s,
          color,
        });
      }
    }
    return out;
  });

  readonly trajectoryRenders = computed(() => {
    const ex = this.selected();
    return ex.trajectories.map((tr) => {
      const fwd = rk4(ex.f, tr.t0, tr.y0, ex.tRange[1], 1);
      const bwd = rk4(ex.f, tr.t0, tr.y0, ex.tRange[0], -1);
      const all = [...bwd.reverse(), ...fwd];
      const path = all
        .map(([t, y], i) => {
          const yc = Math.max(ex.yRange[0] - 5, Math.min(ex.yRange[1] + 5, y));
          return `${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`;
        })
        .join(' ');
      return {
        label: tr.label ?? `${tr.t0},${tr.y0}`,
        color: tr.color,
        path,
        cx: tr.t0 * PX_PER_T,
        cy: -tr.y0 * PX_PER_Y,
      };
    });
  });

  readonly extraCurveRenders = computed(() => {
    const ex = this.selected();
    if (!ex.extraCurves) return [];
    return ex.extraCurves.map((c) => ({
      label: c.label,
      color: c.color,
      dashed: c.dashed,
      d: c.path(ex.tRange[0], ex.tRange[1]),
    }));
  });

  readonly blowupAsymptotes = computed(() => {
    const ex = this.selected();
    if (ex.status !== 'blowup') return [];
    // For y' = y², solution y(t) = 1/(1/y0 - t), blows up at t = 1/y0
    return ex.trajectories
      .filter((tr) => tr.y0 > 0.01)
      .map((tr) => ({ t: 1 / tr.y0, color: tr.color }));
  });

  readonly fValue = computed(() => {
    try {
      return this.selected().f(this.qt(), this.qy());
    } catch {
      return NaN;
    }
  });

  readonly fyValue = computed(() => {
    try {
      return this.selected().fy(this.qt(), this.qy());
    } catch {
      return NaN;
    }
  });

  readonly fyLocallyBounded = computed(() => {
    const v = this.fyValue();
    return Number.isFinite(v) && Math.abs(v) < 50;
  });
}
