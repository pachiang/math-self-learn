import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface ExactExample {
  id: string;
  label: string;
  // M(t, y) dt + N(t, y) dy = 0
  M: (t: number, y: number) => number;
  N: (t: number, y: number) => number;
  Mstr: string;
  Nstr: string;
  // Partial derivatives for the exactness test
  M_y: (t: number, y: number) => number;
  N_t: (t: number, y: number) => number;
  M_y_str: string;
  N_t_str: string;
  exactStatus: 'exact' | 'not-exact';
  // The conserved quantity F(t, y) such that F_t = M, F_y = N
  F?: (t: number, y: number) => number;
  Fstr?: string;
  tRange: [number, number];
  yRange: [number, number];
  // Levels to show as solution contours
  levels: number[];
}

const EXAMPLES: ExactExample[] = [
  {
    id: 'first',
    label: '(2ty + 3) dt + (t² − 1) dy = 0',
    M: (t, y) => 2 * t * y + 3,
    N: (t, _y) => t * t - 1,
    Mstr: '2ty + 3',
    Nstr: 't² − 1',
    M_y: (t, _y) => 2 * t,
    N_t: (t, _y) => 2 * t,
    M_y_str: '2t',
    N_t_str: '2t',
    exactStatus: 'exact',
    F: (t, y) => t * t * y + 3 * t - y,
    Fstr: 'F(t, y) = t²y + 3t − y',
    tRange: [-3, 3],
    yRange: [-3, 3],
    levels: [-6, -4, -2, 0, 2, 4, 6],
  },
  {
    id: 'hamiltonian',
    label: '(簡諧) y dt + t dy = 0  →  F = ty',
    M: (_t, y) => y,
    N: (t, _y) => t,
    Mstr: 'y',
    Nstr: 't',
    M_y: (_t, _y) => 1,
    N_t: (_t, _y) => 1,
    M_y_str: '1',
    N_t_str: '1',
    exactStatus: 'exact',
    F: (t, y) => t * y,
    Fstr: 'F(t, y) = t · y',
    tRange: [-3, 3],
    yRange: [-3, 3],
    levels: [-4, -2, -1, 1, 2, 4],
  },
  {
    id: 'energy',
    label: '(物理) 2t dt + 2y dy = 0  →  F = t² + y²',
    M: (t, _y) => 2 * t,
    N: (_t, y) => 2 * y,
    Mstr: '2t',
    Nstr: '2y',
    M_y: (_t, _y) => 0,
    N_t: (_t, _y) => 0,
    M_y_str: '0',
    N_t_str: '0',
    exactStatus: 'exact',
    F: (t, y) => t * t + y * y,
    Fstr: 'F(t, y) = t² + y²',
    tRange: [-3, 3],
    yRange: [-3, 3],
    levels: [0.5, 1, 2, 4, 6],
  },
  {
    id: 'not-exact',
    label: '(反例) y dt + 2t dy = 0',
    M: (_t, y) => y,
    N: (t, _y) => 2 * t,
    Mstr: 'y',
    Nstr: '2t',
    M_y: (_t, _y) => 1,
    N_t: (_t, _y) => 2,
    M_y_str: '1',
    N_t_str: '2',
    exactStatus: 'not-exact',
    tRange: [-3, 3],
    yRange: [-3, 3],
    levels: [],
  },
];

interface ContourPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-de-ch2-exact',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="精確方程：能量守恆的視角" subtitle="§2.4">
      <p>
        到目前為止，我們都把 ODE 寫成 <code>dy/dt = f(t, y)</code>。但還有另一種寫法——<strong>微分形式</strong>：
      </p>
      <div class="centered-eq big">M(t, y) dt + N(t, y) dy = 0</div>
      <p>
        這其實等價於 <code>dy/dt = −M/N</code>。為什麼要換寫法？因為有時候這樣寫會暴露一個美麗的結構：
      </p>
      <p class="key-idea">
        <strong>如果存在一個函數 F(t, y)</strong>，使得
        <code>∂F/∂t = M</code> 且 <code>∂F/∂y = N</code>——
        那麼整條方程就是 <code>dF = 0</code>，也就是
        <strong>F(t, y) = 常數</strong>。
      </p>
      <p>
        這情況叫「<strong>精確方程</strong>」（exact equation），F 就是一個<strong>守恆量</strong>。
        物理上這對應到「能量守恆」、「動量守恆」——沿著任何一條解曲線，F 值不會變。
      </p>
      <p>
        怎麼檢查精確性？微積分告訴我們 <code>∂²F/∂t∂y = ∂²F/∂y∂t</code>，所以必須：
      </p>
      <div class="centered-eq">∂M/∂y = ∂N/∂t</div>
      <p>
        這就是<strong>精確性測試</strong>。通過就有 F，沒通過就不精確。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="挑一個範例 → 看精確性測試 → 點等高線，看它就是一條解">
      <div class="ex-picker">
        @for (ex of examples; track ex.id) {
          <button
            class="ex-btn"
            [class.active]="selected().id === ex.id"
            (click)="switchExample(ex)"
          >{{ ex.label }}</button>
        }
      </div>

      <!-- Exactness test panel -->
      <div class="test-panel">
        <div class="test-row">
          <div class="test-cell">
            <span class="test-k">M(t, y)</span>
            <code class="test-v">{{ selected().Mstr }}</code>
          </div>
          <div class="test-cell">
            <span class="test-k">N(t, y)</span>
            <code class="test-v">{{ selected().Nstr }}</code>
          </div>
        </div>
        <div class="test-row">
          <div class="test-cell">
            <span class="test-k">∂M/∂y</span>
            <code class="test-v">{{ selected().M_y_str }}</code>
          </div>
          <div class="test-cell">
            <span class="test-k">∂N/∂t</span>
            <code class="test-v">{{ selected().N_t_str }}</code>
          </div>
        </div>
        <div class="test-verdict" [attr.data-exact]="selected().exactStatus">
          @if (selected().exactStatus === 'exact') {
            ✓ 相等 → 精確方程。存在 F，且解為 F(t, y) = C。
          } @else {
            ✗ 不相等 → 不精確。不能直接用這招（下一節會看怎麼補救）。
          }
        </div>

        @if (selected().Fstr) {
          <div class="f-display">
            <span class="f-lead">守恆量：</span>
            <code class="f-big">{{ selected().Fstr }}</code>
          </div>
        }
      </div>

      <!-- Contour plot -->
      <div class="contour-wrap">
        <div class="contour-title">
          F 的等高線就是解曲線
          @if (hoverLevel() !== null) {
            —— 目前 F = <strong>{{ hoverLevel()!.toFixed(2) }}</strong>
          }
        </div>
        <svg
          #svg
          viewBox="-130 -130 260 260"
          class="contour-svg"
          (mousemove)="onMouseMove($event)"
          (mouseleave)="hoverPoint.set(null)"
        >
          <!-- Background -->
          <rect x="-130" y="-130" width="260" height="260" fill="var(--bg-surface)" opacity="0.3" />

          <!-- Axes -->
          <line x1="-120" y1="0" x2="120" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-120" x2="0" y2="120" stroke="var(--border-strong)" stroke-width="1" />
          <text x="124" y="3" class="axis-lab">t</text>
          <text x="-4" y="-124" class="axis-lab">y</text>
          @for (k of [-3, -2, -1, 1, 2, 3]; track k) {
            <text [attr.x]="k * 36" y="12" class="tick">{{ k }}</text>
            <text [attr.x]="-6" [attr.y]="-k * 36 + 3" class="tick right">{{ k }}</text>
          }

          <!-- Contours -->
          @if (selected().F) {
            @for (c of contours(); track $index) {
              <path
                [attr.d]="c.path"
                fill="none"
                [attr.stroke]="c.color"
                stroke-width="1.8"
                stroke-linecap="round"
                [attr.opacity]="hoverLevel() !== null && Math.abs(c.level - hoverLevel()!) < 0.01 ? 1 : 0.55"
              />
            }
          }

          <!-- Hover indicator -->
          @if (hoverPoint(); as h) {
            <circle [attr.cx]="h.px" [attr.cy]="h.py" r="5"
              fill="var(--accent)" stroke="white" stroke-width="1.5" />
            <g [attr.transform]="'translate(' + (h.px + 8) + ',' + (h.py - 10) + ')'">
              <rect x="0" y="-10" width="92" height="28" rx="4"
                fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="0.8" opacity="0.95" />
              <text x="4" y="3" class="hov">(t, y) = ({{ h.t.toFixed(1) }}, {{ h.y.toFixed(1) }})</text>
              <text x="4" y="14" class="hov strong">F = {{ h.F.toFixed(2) }}</text>
            </g>
          }
        </svg>

        <p class="contour-caption">
          滑鼠移到圖上 → 顯示該點的 F 值。每條等高線 F = C 就是這條方程的一條解。
        </p>
      </div>

      @if (selected().exactStatus === 'not-exact') {
        <div class="warning-box">
          <strong>⚠ 這個方程不精確</strong>——沒有 F 可以畫。但有辦法補救：
          乘一個適當的 μ(t, y) 讓它變精確。這個 μ 叫「積分因子」（跟 §2.3 同名但用法略不同）。
          現行微分方程教科書會深入這塊，這裡我們只提一下概念。
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察：
      </p>
      <ul>
        <li><strong>同心圓範例</strong> <code>2t dt + 2y dy = 0</code>：F = t² + y²。每條同心圓都是一條解！
        這跟能量守恆一模一樣——物理上若 t 是位置、y 是動量，那 F 就是總能量。</li>
        <li><strong>雙曲線範例</strong> <code>y dt + t dy = 0</code>：F = ty。解是雙曲線 ty = C，每條雙曲線都是解。</li>
        <li><strong>不精確例子</strong>：∂M/∂y = 1 而 ∂N/∂t = 2。兩者不相等，沒有 F 可畫。</li>
      </ul>
      <p>
        微積分告訴你「混合偏導相等」；這裡反過來用——<strong>要求</strong>它們相等，並從這個要求推出「F 存在」。
        這是多變數微積分（Stokes 定理那類）跟 ODE 相遇的第一個地方。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        精確方程 = 存在守恆量 F 的 ODE。檢查 ∂M/∂y = ∂N/∂t；
        通過就找 F；解就是 F = C 的等高線。
        這一招的美麗之處在於連結到物理——能量守恆的 ODE 全都是精確方程。
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
    .centered-eq.big { font-size: 22px; padding: 16px; }

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

    .ex-picker { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .ex-btn {
      font: inherit; font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 10px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      background: var(--bg); cursor: pointer; color: var(--text);
    }
    .ex-btn:hover { border-color: var(--accent); }
    .ex-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .test-panel {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .test-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .test-cell {
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .test-k {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .test-v {
      font-size: 14px;
      font-weight: 600;
      padding: 2px 8px;
    }

    .test-verdict {
      margin-top: 8px;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    .test-verdict[data-exact='exact'] {
      background: rgba(92, 168, 120, 0.12);
      color: #5ca878;
      border: 1px solid rgba(92, 168, 120, 0.3);
    }

    .test-verdict[data-exact='not-exact'] {
      background: rgba(200, 123, 94, 0.12);
      color: #c87b5e;
      border: 1px solid rgba(200, 123, 94, 0.3);
    }

    .f-display {
      margin-top: 12px;
      padding: 10px 14px;
      background: var(--accent-10);
      border-radius: 8px;
      border: 1px dashed var(--accent);
      text-align: center;
    }

    .f-lead { font-size: 11px; color: var(--text-muted); margin-right: 8px; }

    .f-big {
      font-size: 16px;
      font-weight: 700;
      padding: 4px 12px;
    }

    .contour-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .contour-title {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .contour-title strong {
      color: var(--accent);
    }

    .contour-svg {
      width: 100%;
      max-width: 420px;
      display: block;
      margin: 0 auto;
      cursor: crosshair;
    }

    .axis-lab {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }
    .tick.right { text-anchor: end; }

    .hov {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
    .hov.strong { fill: var(--accent); font-weight: 700; }

    .contour-caption {
      margin: 6px 0 0;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
    }

    .warning-box {
      margin-top: 14px;
      padding: 12px 16px;
      border: 1px solid rgba(200, 123, 94, 0.3);
      background: rgba(200, 123, 94, 0.06);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .warning-box strong {
      color: #c87b5e;
      display: block;
      margin-bottom: 4px;
    }
  `,
})
export class DeCh2ExactComponent {
  readonly Math = Math;
  readonly examples = EXAMPLES;
  readonly selected = signal<ExactExample>(EXAMPLES[0]);
  readonly hoverPoint = signal<{
    t: number; y: number; px: number; py: number; F: number;
  } | null>(null);

  readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  // 36 px per unit (both t and y)
  private readonly PX = 36;

  switchExample(ex: ExactExample): void {
    this.selected.set(ex);
    this.hoverPoint.set(null);
  }

  readonly hoverLevel = computed<number | null>(() => {
    const h = this.hoverPoint();
    return h ? h.F : null;
  });

  /**
   * Build contour path for F(t, y) = level via marching squares over the plot grid.
   */
  readonly contours = computed(() => {
    const ex = this.selected();
    if (!ex.F) return [];

    const levels = ex.levels;
    const n = 50;
    const tMin = -3, tMax = 3, yMin = -3, yMax = 3;
    const dt = (tMax - tMin) / n;
    const dy = (yMax - yMin) / n;

    // Precompute F values on the grid
    const grid: number[][] = [];
    for (let j = 0; j <= n; j++) {
      const row: number[] = [];
      for (let i = 0; i <= n; i++) {
        const t = tMin + i * dt;
        const y = yMin + j * dy;
        row.push(ex.F(t, y));
      }
      grid.push(row);
    }

    const results: { level: number; path: string; color: string }[] = [];

    levels.forEach((level, levelIdx) => {
      const segments: [number, number, number, number][] = []; // pixel coords

      for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
          // Four corners
          const f00 = grid[j][i];
          const f10 = grid[j][i + 1];
          const f01 = grid[j + 1][i];
          const f11 = grid[j + 1][i + 1];
          const v0 = f00 - level;
          const v1 = f10 - level;
          const v2 = f11 - level;
          const v3 = f01 - level;

          // Classify corners (> 0 or <= 0)
          let idx = 0;
          if (v0 > 0) idx |= 1;
          if (v1 > 0) idx |= 2;
          if (v2 > 0) idx |= 4;
          if (v3 > 0) idx |= 8;

          if (idx === 0 || idx === 15) continue;

          // Pixel corners
          const x0 = (tMin + i * dt) * this.PX;
          const x1 = (tMin + (i + 1) * dt) * this.PX;
          const y0 = -(yMin + j * dy) * this.PX;
          const y1 = -(yMin + (j + 1) * dy) * this.PX;

          const interp = (a: number, b: number, ax: number, bx: number) => {
            if (Math.abs(a - b) < 1e-9) return ax;
            return ax + (bx - ax) * (a / (a - b));
          };

          // Edge midpoints (interpolated where iso-contour crosses)
          const eTop = (): [number, number] => [interp(v0, v1, x0, x1), y0];
          const eRight = (): [number, number] => [x1, interp(v1, v2, y0, y1)];
          const eBottom = (): [number, number] => [interp(v3, v2, x0, x1), y1];
          const eLeft = (): [number, number] => [x0, interp(v0, v3, y0, y1)];

          // Marching squares cases (simplified — handles ambiguous as two separate)
          const cases: [[number, number], [number, number]][][] = [
            [], // 0
            [[eLeft(), eTop()]], // 1
            [[eTop(), eRight()]], // 2
            [[eLeft(), eRight()]], // 3
            [[eRight(), eBottom()]], // 4
            [[eLeft(), eTop()], [eRight(), eBottom()]], // 5 (ambiguous)
            [[eTop(), eBottom()]], // 6
            [[eLeft(), eBottom()]], // 7
            [[eLeft(), eBottom()]], // 8
            [[eTop(), eBottom()]], // 9
            [[eLeft(), eBottom()], [eTop(), eRight()]], // 10 (ambiguous)
            [[eRight(), eBottom()]], // 11
            [[eLeft(), eRight()]], // 12
            [[eTop(), eRight()]], // 13
            [[eLeft(), eTop()]], // 14
            [], // 15
          ];

          for (const seg of cases[idx]) {
            segments.push([seg[0][0], seg[0][1], seg[1][0], seg[1][1]]);
          }
        }
      }

      // Convert segments into a single path (just concatenate independent M/L pairs)
      const path = segments
        .map(
          (s) =>
            `M ${s[0].toFixed(1)} ${s[1].toFixed(1)} L ${s[2].toFixed(1)} ${s[3].toFixed(1)}`,
        )
        .join(' ');

      // Color by level (gradient)
      const palette = ['#5ca878', '#6c9c7c', '#7d9581', '#8b6aa8', '#a85c7b', '#c87b5e', '#c89a5e'];
      const color = palette[levelIdx % palette.length];

      results.push({ level, path, color });
    });

    return results;
  });

  onMouseMove(event: MouseEvent): void {
    const svg = this.svgRef()?.nativeElement;
    const ex = this.selected();
    if (!svg || !ex.F) return;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const t = inv.x / this.PX;
    const y = -inv.y / this.PX;
    if (Math.abs(t) > 3 || Math.abs(y) > 3) {
      this.hoverPoint.set(null);
      return;
    }
    const F = ex.F(t, y);
    this.hoverPoint.set({
      t, y,
      px: t * this.PX,
      py: -y * this.PX,
      F,
    });
  }
}
