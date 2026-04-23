import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface NonlinearSystem {
  id: string;
  name: string;
  f_expr: string;
  g_expr: string;
  f: (x: number, y: number) => number;
  g: (x: number, y: number) => number;
  // Jacobian partial derivatives
  fx: (x: number, y: number) => number;
  fy: (x: number, y: number) => number;
  gx: (x: number, y: number) => number;
  gy: (x: number, y: number) => number;
  equilibria: Array<{ x: number; y: number; label: string }>;
  description: string;
  xRange: [number, number];
  yRange: [number, number];
}

const SYSTEMS: NonlinearSystem[] = [
  {
    id: 'pendulum',
    name: '真實鐘擺',
    f_expr: 'f(θ, ω) = ω',
    g_expr: 'g(θ, ω) = −sin θ',
    f: (_x, y) => y,
    g: (x, _y) => -Math.sin(x),
    fx: () => 0,
    fy: () => 1,
    gx: (x, _y) => -Math.cos(x),
    gy: () => 0,
    equilibria: [
      { x: 0, y: 0, label: '(0, 0) — 穩定（下垂）' },
      { x: Math.PI, y: 0, label: '(π, 0) — 不穩定（倒立）' },
    ],
    description: '狀態 (θ, ω)，週期性系統——每 2π 一個平衡點。',
    xRange: [-4, 4],
    yRange: [-3, 3],
  },
  {
    id: 'lotka',
    name: 'Lotka-Volterra 捕食者—獵物',
    f_expr: 'f(x, y) = x(1 − y)',
    g_expr: 'g(x, y) = −y(1 − x)',
    f: (x, y) => x * (1 - y),
    g: (x, y) => -y * (1 - x),
    fx: (_x, y) => 1 - y,
    fy: (x, _y) => -x,
    gx: (_x, y) => y,
    gy: (x, _y) => -(1 - x),
    equilibria: [
      { x: 0, y: 0, label: '(0, 0) — 鞍點' },
      { x: 1, y: 1, label: '(1, 1) — 中心' },
    ],
    description: 'x = 獵物、y = 捕食者。變數相乘讓系統非線性。',
    xRange: [-0.5, 3],
    yRange: [-0.5, 3],
  },
  {
    id: 'saddle-node',
    name: 'x′ = x² − 1, y′ = −y',
    f_expr: 'f(x, y) = x² − 1',
    g_expr: 'g(x, y) = −y',
    f: (x, _y) => x * x - 1,
    g: (_x, y) => -y,
    fx: (x, _y) => 2 * x,
    fy: () => 0,
    gx: () => 0,
    gy: () => -1,
    equilibria: [
      { x: -1, y: 0, label: '(−1, 0) — 穩定節點' },
      { x: 1, y: 0, label: '(1, 0) — 鞍點' },
    ],
    description: '兩個平衡點，一穩一鞍——saddle-node 分岔的前身。',
    xRange: [-2.5, 2.5],
    yRange: [-2, 2],
  },
];

function classifyJacobian(J: [[number, number], [number, number]]): {
  name: string;
  color: string;
  detail: string;
} {
  const tau = J[0][0] + J[1][1];
  const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
  const disc = tau * tau - 4 * det;

  if (det < -0.01) return { name: '鞍點', color: '#c87b5e', detail: 'Δ < 0（不穩定）' };
  if (Math.abs(det) < 0.01) return { name: '退化', color: '#888', detail: 'Δ ≈ 0（要用高階項分析）' };
  if (Math.abs(tau) < 0.01 && det > 0) return { name: '中心（線性化時）', color: '#8b6aa8', detail: 'τ = 0（需小心：非線性可能破壞中心）' };

  if (disc > 0.01) {
    return tau < 0
      ? { name: '穩定節點', color: '#5ca878', detail: '實特徵值，全負' }
      : { name: '不穩定節點', color: '#c87b5e', detail: '實特徵值，全正' };
  }
  return tau < 0
    ? { name: '穩定焦點', color: '#5ca878', detail: '複特徵值，Re < 0' }
    : { name: '不穩定焦點', color: '#c87b5e', detail: '複特徵值，Re > 0' };
}

const PX = 30;

@Component({
  selector: 'app-de-ch9-equilibria',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="平衡點與 Jacobian" subtitle="§9.2">
      <p>
        非線性系統的分析從兩件事開始：
      </p>
      <ol>
        <li><strong>找平衡點（fixed points）</strong>：解 <code>f = g = 0</code> 的點。那裡 dx/dt = dy/dt = 0，系統不動。</li>
        <li><strong>算 Jacobian 矩陣</strong>：每個平衡點附近的「線性近似」。</li>
      </ol>
      <p class="key-idea">
        <strong>Jacobian</strong>：<code>J = [[∂f/∂x, ∂f/∂y], [∂g/∂x, ∂g/∂y]]</code>。
        在任一點，J 描述「小擾動如何被放大」——本質上就是線性化的係數矩陣。
      </p>
      <p>
        為什麼有用？因為 Ch8 我們已經完全掌握 2×2 線性系統——知道怎麼用 τ 跟 Δ 分類。
        現在只要把 J 當作 A，就能套 Ch8 的整套工具——<strong>平衡點的局部行為就讀出來了</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="挑一個非線性系統 → 看平衡點與每個平衡點的 Jacobian 分類">
      <div class="picker">
        @for (s of systems; track s.id) {
          <button class="pick-btn"
            [class.active]="selected().id === s.id"
            (click)="switchSystem(s)"
          >{{ s.name }}</button>
        }
      </div>

      <div class="system-desc">
        <code class="sys-eq">{{ selected().f_expr }}</code><br>
        <code class="sys-eq">{{ selected().g_expr }}</code>
        <p>{{ selected().description }}</p>
      </div>

      <!-- Phase plane with vector field and equilibria -->
      <div class="plot-wrap">
        <svg viewBox="-130 -130 260 260" class="plot-svg">
          <!-- Grid -->
          @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
            <line [attr.x1]="g * PX" y1="-120" [attr.x2]="g * PX" y2="120"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            <line x1="-120" [attr.y1]="-g * PX" x2="120" [attr.y2]="-g * PX"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }
          <line x1="-120" y1="0" x2="120" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-120" x2="0" y2="120" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Vector field -->
          @for (a of vectorField(); track a.k) {
            <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"
              stroke="var(--text-muted)" stroke-width="0.9"
              stroke-linecap="round" opacity="0.5"
              [attr.marker-end]="a.showHead ? 'url(#vf-tip)' : null" />
          }
          <defs>
            <marker id="vf-tip" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0, 5 2, 0 4" fill="var(--text-muted)" opacity="0.6" />
            </marker>
          </defs>

          <!-- Equilibria markers -->
          @for (eq of eqWithClass(); track $index) {
            <circle [attr.cx]="eq.x * PX" [attr.cy]="-eq.y * PX"
              r="7" [attr.fill]="eq.color" stroke="white" stroke-width="2" />
            <text [attr.x]="eq.x * PX + 10" [attr.y]="-eq.y * PX - 8" class="eq-lab"
              [attr.fill]="eq.color">
              {{ eq.className }}
            </text>
          }

          <text x="124" y="4" class="ax">x</text>
          <text x="4" y="-124" class="ax">y</text>
        </svg>
      </div>

      <!-- Equilibria table with Jacobian analysis -->
      <div class="eq-table">
        <div class="et-head">平衡點分析</div>
        @for (eq of eqWithClass(); track $index) {
          <div class="et-row" [style.--col]="eq.color">
            <div class="et-top">
              <span class="et-pos">({{ eq.x.toFixed(2) }}, {{ eq.y.toFixed(2) }})</span>
              <span class="et-class" [style.color]="eq.color">{{ eq.className }}</span>
            </div>

            <div class="jacobian-box">
              <span class="j-lab">Jacobian =</span>
              <div class="j-matrix">
                <div class="j-row">
                  <span>{{ eq.J[0][0].toFixed(2) }}</span>
                  <span>{{ eq.J[0][1].toFixed(2) }}</span>
                </div>
                <div class="j-row">
                  <span>{{ eq.J[1][0].toFixed(2) }}</span>
                  <span>{{ eq.J[1][1].toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="j-props">
              <span class="j-p">τ = {{ eq.tau.toFixed(2) }}</span>
              <span class="j-p">Δ = {{ eq.det.toFixed(2) }}</span>
              <span class="j-detail">{{ eq.detail }}</span>
            </div>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察這三個範例：
      </p>
      <ul>
        <li><strong>鐘擺</strong>在 (0, 0) 線性化得到 θ″ + θ = 0（SHM），中心——跟 Ch5 熟悉的結果一致；
          在 (π, 0) 倒立位置線性化得到 θ″ − θ = 0，<strong>鞍點</strong>——一觸即倒。</li>
        <li><strong>Lotka-Volterra</strong> 有原點（鞍點，因為兩物種都消失不穩）跟 (1, 1)（中心，捕食—獵物周期循環）。</li>
        <li><strong>第三個系統</strong>的兩個平衡點：一穩定一鞍點——這是 Ch10 會細看的「saddle-node」分岔<strong>當前形態</strong>。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        非線性系統的分析從「找平衡點 + 算 Jacobian」兩步開始。
        有了 Jacobian，你就能用 Ch8 的 trace-det 工具判斷每個平衡點的<strong>局部行為</strong>。
        下一節正式介紹背後的定理——Hartman-Grobman。
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

    .system-desc {
      padding: 12px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 12px;
      text-align: center;
    }

    .sys-eq {
      display: inline-block;
      font-size: 14px;
      padding: 3px 10px;
      margin: 2px;
    }

    .system-desc p {
      margin: 8px 0 0;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .plot-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 12px;
    }

    .plot-svg {
      width: 100%;
      display: block;
      max-width: 440px;
      margin: 0 auto;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .eq-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .eq-table {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .et-head {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 10px;
      text-align: center;
    }

    .et-row {
      padding: 12px;
      border-left: 3px solid var(--col);
      background: color-mix(in srgb, var(--col) 5%, var(--bg));
      border-radius: 0 8px 8px 0;
      margin-bottom: 8px;
    }

    .et-row:last-child { margin-bottom: 0; }

    .et-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
    }

    .et-pos {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
    }

    .et-class {
      font-size: 13px;
      font-weight: 700;
    }

    .jacobian-box {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .j-lab {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .j-matrix {
      display: inline-block;
      padding: 4px 10px;
      border-left: 2px solid var(--col);
      border-right: 2px solid var(--col);
    }

    .j-row {
      display: grid;
      grid-template-columns: 50px 50px;
      gap: 10px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--col);
    }

    .j-props {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      font-size: 12px;
      margin-top: 4px;
    }

    .j-p {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      padding: 2px 8px;
      background: var(--bg-surface);
      border-radius: 4px;
    }

    .j-detail {
      color: var(--text-muted);
      font-size: 11px;
    }
  `,
})
export class DeCh9EquilibriaComponent {
  readonly PX = PX;
  readonly systems = SYSTEMS;
  readonly selected = signal<NonlinearSystem>(SYSTEMS[0]);

  switchSystem(s: NonlinearSystem): void {
    this.selected.set(s);
  }

  readonly eqWithClass = computed(() => {
    const sys = this.selected();
    return sys.equilibria.map((eq) => {
      const J: [[number, number], [number, number]] = [
        [sys.fx(eq.x, eq.y), sys.fy(eq.x, eq.y)],
        [sys.gx(eq.x, eq.y), sys.gy(eq.x, eq.y)],
      ];
      const c = classifyJacobian(J);
      return {
        ...eq,
        J,
        tau: J[0][0] + J[1][1],
        det: J[0][0] * J[1][1] - J[0][1] * J[1][0],
        className: c.name,
        color: c.color,
        detail: c.detail,
      };
    });
  });

  readonly vectorField = computed(() => {
    const sys = this.selected();
    const [xMin, xMax] = sys.xRange;
    const [yMin, yMax] = sys.yRange;
    const out: { k: string; x1: number; y1: number; x2: number; y2: number; showHead: boolean }[] = [];

    const xStep = (xMax - xMin) / 12;
    const yStep = (yMax - yMin) / 12;

    for (let xi = xMin; xi <= xMax + 0.01; xi += xStep) {
      for (let yi = yMin; yi <= yMax + 0.01; yi += yStep) {
        const fx = sys.f(xi, yi);
        const fy = sys.g(xi, yi);
        const mag = Math.hypot(fx, fy);
        if (mag < 0.01) continue;
        const cx = xi * PX;
        const cy = -yi * PX;
        const scale = 10 / mag;
        out.push({
          k: `${xi.toFixed(1)}_${yi.toFixed(1)}`,
          x1: cx, y1: cy,
          x2: cx + fx * scale, y2: cy - fy * scale,
          showHead: mag > 0.5,
        });
      }
    }
    return out;
  });
}
