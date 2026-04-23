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

/**
 * Build matrix from (τ, Δ). Use canonical companion form:
 * A = [[0, 1], [−Δ, τ]]. Then trace = τ, det = Δ, and phase portraits look "natural".
 */
function buildA(tau: number, det: number): [[number, number], [number, number]] {
  return [[0, 1], [-det, tau]];
}

function integrate(
  A: [[number, number], [number, number]],
  x0: [number, number],
  tMax: number,
  dir: 1 | -1,
  dt = 0.02,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [x0];
  let x = x0[0], y = x0[1];
  const h = dt * dir;
  const n = Math.ceil(tMax / dt);
  for (let i = 0; i < n; i++) {
    const f = (xx: number, yy: number): [number, number] => [
      A[0][0] * xx + A[0][1] * yy,
      A[1][0] * xx + A[1][1] * yy,
    ];
    const [k1x, k1y] = f(x, y);
    const [k2x, k2y] = f(x + (h / 2) * k1x, y + (h / 2) * k1y);
    const [k3x, k3y] = f(x + (h / 2) * k2x, y + (h / 2) * k2y);
    const [k4x, k4y] = f(x + h * k3x, y + h * k3y);
    x = x + (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    y = y + (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 10 || Math.abs(y) > 10) break;
    pts.push([x, y]);
  }
  return pts;
}

function classify(tau: number, det: number): { name: string; color: string } {
  if (det < -0.02) return { name: '鞍點', color: '#c87b5e' };
  if (det < 0.02) return { name: '退化', color: '#888' };
  const disc = tau * tau - 4 * det;
  if (Math.abs(disc) < 0.05) return { name: '重根（退化）', color: '#888' };
  if (Math.abs(tau) < 0.02 && det > 0) return { name: '中心', color: '#8b6aa8' };
  if (disc > 0) {
    return tau < 0
      ? { name: '穩定節點', color: '#5ca878' }
      : { name: '不穩定節點', color: '#c87b5e' };
  }
  return tau < 0
    ? { name: '穩定焦點', color: '#5ca878' }
    : { name: '不穩定焦點', color: '#c87b5e' };
}

const PLANE_PX = 40; // 1 unit in τ or Δ = 40 px
const PORTRAIT_PX = 36;

@Component({
  selector: 'app-de-ch8-trace-det',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Trace-Det 分類圖" subtitle="§8.5">
      <p>
        2×2 線性系統的所有行為只由兩個數字決定：<strong>trace τ = tr(A)</strong> 跟 <strong>determinant Δ = det(A)</strong>。
        把這兩個數當座標軸，整個「線性 2D 系統宇宙」就在一張平面上。
      </p>
      <p class="key-idea">
        <strong>Trace-Det 平面</strong>：橫軸 τ、縱軸 Δ。
        由一條直線（Δ = 0）和一條拋物線（τ² = 4Δ）切成幾個區域，每區域對應一種相肖像類型。
      </p>
      <p>
        拖動滑鼠到分類圖上任一點，右側就會畫出對應矩陣 A = [[0, 1], [−Δ, τ]] 的相肖像。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：拖滑鼠到分類圖上任一點，看對應的相肖像">
      <div class="layout">
        <!-- Left: τ–Δ plane -->
        <div class="plane-wrap">
          <div class="p-head">Trace-Det 分類圖</div>
          <svg
            #tdSvg
            viewBox="-150 -110 300 220"
            class="plane-svg"
            (mousemove)="onPlaneHover($event)"
            (click)="onPlaneClick($event)"
          >
            <!-- Regions (colored backgrounds) -->
            <!-- Saddle: Δ < 0 -->
            <rect x="-150" y="0" width="300" height="110"
              fill="#c87b5e" opacity="0.08" />
            <text x="0" y="95" class="region-lab" style="fill: #c87b5e">
              鞍點（Δ &lt; 0）
            </text>

            <!-- Stable nodes / spirals: τ < 0, Δ > 0 -->
            <rect x="-150" y="-110" width="150" height="110"
              fill="#5ca878" opacity="0.06" />
            <!-- Unstable: τ > 0, Δ > 0 -->
            <rect x="0" y="-110" width="150" height="110"
              fill="#c87b5e" opacity="0.06" />

            <!-- Parabola τ² = 4Δ separating nodes (below) and spirals (above) -->
            <path [attr.d]="parabolaPath" fill="none"
              stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.7" />
            <text x="0" y="-98" class="region-lab" text-anchor="middle"
              style="fill: var(--text-muted)">
              τ² = 4Δ （分界線）
            </text>

            <!-- Y-axis (τ = 0) for centers -->
            <line x1="0" y1="-110" x2="0" y2="0"
              stroke="#8b6aa8" stroke-width="1.5" opacity="0.7" />

            <!-- Axes -->
            <line x1="-150" y1="0" x2="150" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
            <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="1.2" />

            <text x="146" y="-4" class="ax">τ (trace)</text>
            <text x="4" y="-104" class="ax">Δ (det)</text>

            <!-- Region labels -->
            <text x="-80" y="-70" class="lbl" style="fill: #5ca878">穩定焦點</text>
            <text x="-100" y="-25" class="lbl" style="fill: #5ca878">穩定節點</text>
            <text x="60" y="-70" class="lbl" style="fill: #c87b5e">不穩定焦點</text>
            <text x="50" y="-25" class="lbl" style="fill: #c87b5e">不穩定節點</text>
            <text x="4" y="-55" class="lbl" style="fill: #8b6aa8">中心</text>

            <!-- Grid -->
            @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
              <text [attr.x]="g * PLANE_PX" y="12" class="tick">{{ g }}</text>
              <text x="-6" [attr.y]="-g * PLANE_PX + 3" class="tick right">{{ g }}</text>
            }

            <!-- Selected point -->
            <circle [attr.cx]="tau() * PLANE_PX" [attr.cy]="-det() * PLANE_PX"
              r="7" [attr.fill]="currentClass().color" stroke="white" stroke-width="2" />
            <text [attr.x]="tau() * PLANE_PX + 10" [attr.y]="-det() * PLANE_PX - 4"
              class="sel-lab" [attr.fill]="currentClass().color">
              ({{ tau().toFixed(2) }}, {{ det().toFixed(2) }})
            </text>
          </svg>

          <div class="preset-row">
            @for (p of presets; track p.name) {
              <button class="pre-btn" (click)="setPoint(p.tau, p.det)">
                {{ p.name }}
              </button>
            }
          </div>
        </div>

        <!-- Right: phase portrait -->
        <div class="portrait-wrap">
          <div class="p-head">
            對應相肖像
            <span class="class-name" [style.color]="currentClass().color">
              — {{ currentClass().name }}
            </span>
          </div>
          <svg viewBox="-80 -80 160 160" class="portrait-svg">
            <!-- Grid -->
            <line x1="-70" y1="0" x2="70" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="0.8" />

            <!-- Vector field -->
            @for (a of vectorField(); track a.k) {
              <line [attr.x1]="a.x1" [attr.y1]="a.y1"
                [attr.x2]="a.x2" [attr.y2]="a.y2"
                stroke="var(--text-muted)" stroke-width="0.8"
                stroke-linecap="round" opacity="0.5" />
            }

            <!-- Trajectories -->
            @for (tr of trajectories(); track $index) {
              <path [attr.d]="tr" fill="none"
                [attr.stroke]="currentClass().color" stroke-width="1.4" opacity="0.85" />
            }

            <!-- Origin -->
            <circle cx="0" cy="0" r="3"
              [attr.fill]="currentClass().color"
              stroke="white" stroke-width="1" />
          </svg>

          <div class="eigen-info">
            <div class="ei-row">
              <span class="ei-lab">τ =</span>
              <code>{{ tau().toFixed(3) }}</code>
            </div>
            <div class="ei-row">
              <span class="ei-lab">Δ =</span>
              <code>{{ det().toFixed(3) }}</code>
            </div>
            <div class="ei-row">
              <span class="ei-lab">τ² − 4Δ =</span>
              <code [class.neg]="discriminant() < 0">{{ discriminant().toFixed(3) }}</code>
            </div>
            <div class="ei-row">
              <span class="ei-lab">特徵值</span>
              <code class="eig-val">{{ eigenvaluesText() }}</code>
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這張圖是整個 2D 線性動力學的「地圖」：
      </p>
      <ul>
        <li><strong>鞍點區（Δ &lt; 0）</strong>：一正一負特徵值 → 永遠不穩定。</li>
        <li><strong>中心（τ = 0, Δ &gt; 0）</strong>：純虛特徵值 → 閉合軌跡。注意這是一條<strong>直線</strong>——要完全沒耗散才能保持，實際系統少見。</li>
        <li><strong>拋物線 τ² = 4Δ</strong>：重根邊界。在其下方：實根（節點）；上方：複根（焦點）。</li>
        <li><strong>左半平面（τ &lt; 0）</strong>：穩定區。右半：不穩定區。控制理論的核心目標就是<strong>把系統推入左半平面</strong>。</li>
      </ul>

      <div class="conn-box">
        <h4>連到 Part II 共振</h4>
        <p>
          Ch5 的阻尼分類（過 / 臨界 / 欠阻尼）對應在這張圖上的不同路徑：
          <strong>阻尼從 0 增加</strong> 時，點從「τ = 0」（中心）出發，先進「穩定焦點」（欠阻尼）、
          穿越拋物線（臨界）、最後進「穩定節點」（過阻尼）。
          同一條物理現象，在分類圖上留下一條軌跡。
        </p>
      </div>

      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Trace-Det 平面一圖收納所有 2×2 線性系統的可能行為。
        「系統的命運」只由這兩個數決定——大幅簡化工程設計。
        Ch9 的非線性系統會用這張圖做「局部」分析——每個平衡點對應一個點。
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

    .layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 14px;
    }

    @media (max-width: 680px) {
      .layout { grid-template-columns: 1fr; }
    }

    .plane-wrap, .portrait-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .p-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .class-name {
      font-weight: 700;
      font-size: 13px;
    }

    .plane-svg {
      width: 100%;
      display: block;
      cursor: crosshair;
    }

    .portrait-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .region-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
    }

    .lbl {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .tick.right {
      text-anchor: end;
    }

    .sel-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .preset-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .pre-btn {
      font: inherit;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 4px 10px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .pre-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .eigen-info {
      margin-top: 8px;
      padding: 8px 10px;
      background: var(--bg-surface);
      border-radius: 6px;
    }

    .ei-row {
      display: grid;
      grid-template-columns: 90px 1fr;
      gap: 10px;
      align-items: baseline;
      padding: 3px 0;
      font-size: 12px;
    }

    .ei-lab {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }

    .ei-row code.neg {
      color: #c87b5e;
    }

    .ei-row code.eig-val {
      font-size: 11px;
    }

    .conn-box {
      padding: 12px 14px;
      background: var(--accent-10);
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      margin: 12px 0;
    }

    .conn-box h4 {
      margin: 0 0 6px;
      font-size: 14px;
      color: var(--accent);
    }

    .conn-box p {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh8TraceDetComponent implements OnInit, OnDestroy {
  readonly PLANE_PX = PLANE_PX;
  readonly tau = signal(-0.5);
  readonly det = signal(1.5);
  readonly tdSvgRef = viewChild<ElementRef<SVGSVGElement>>('tdSvg');

  readonly presets = [
    { name: '穩定焦點', tau: -0.5, det: 2 },
    { name: '穩定節點', tau: -3, det: 1 },
    { name: '鞍點', tau: 0, det: -1 },
    { name: '不穩定焦點', tau: 0.5, det: 2 },
    { name: '中心', tau: 0, det: 1 },
  ];

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  onPlaneHover(event: MouseEvent): void {
    if (event.buttons !== 1) return;
    this.onPlaneClick(event);
  }

  onPlaneClick(event: MouseEvent): void {
    const svg = this.tdSvgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const t = inv.x / PLANE_PX;
    const d = -inv.y / PLANE_PX;
    if (Math.abs(t) > 3.5 || d < -2.5 || d > 2.5) return;
    this.tau.set(Math.round(t * 20) / 20);
    this.det.set(Math.round(d * 20) / 20);
  }

  setPoint(tau: number, det: number): void {
    this.tau.set(tau);
    this.det.set(det);
  }

  readonly discriminant = computed(() => this.tau() * this.tau() - 4 * this.det());

  readonly currentClass = computed(() => classify(this.tau(), this.det()));

  readonly eigenvaluesText = computed(() => {
    const d = this.discriminant();
    if (d > 0) {
      const s = Math.sqrt(d);
      return `${((this.tau() - s) / 2).toFixed(2)}, ${((this.tau() + s) / 2).toFixed(2)}`;
    }
    if (d < 0) {
      const s = Math.sqrt(-d);
      return `${(this.tau() / 2).toFixed(2)} ± ${(s / 2).toFixed(2)}i`;
    }
    return `${(this.tau() / 2).toFixed(2)} (重根)`;
  });

  // Parabola τ² = 4Δ → Δ = τ²/4
  readonly parabolaPath = (() => {
    const pts: string[] = [];
    const n = 50;
    for (let i = 0; i <= n; i++) {
      const tau = -3.5 + (i / n) * 7;
      const det = (tau * tau) / 4;
      if (det > 2.5) continue;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${(tau * PLANE_PX).toFixed(1)} ${(-det * PLANE_PX).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly currentA = computed(() => buildA(this.tau(), this.det()));

  readonly vectorField = computed(() => {
    const A = this.currentA();
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let xi = -2; xi <= 2.01; xi += 0.7) {
      for (let yi = -2; yi <= 2.01; yi += 0.7) {
        const dx = A[0][0] * xi + A[0][1] * yi;
        const dy = A[1][0] * xi + A[1][1] * yi;
        const mag = Math.hypot(dx, dy);
        if (mag < 0.01) continue;
        const cx = xi * 28;
        const cy = -yi * 28;
        const scale = 8 / mag;
        out.push({
          k: `${xi.toFixed(1)}_${yi.toFixed(1)}`,
          x1: cx, y1: cy,
          x2: cx + dx * scale, y2: cy - dy * scale,
        });
      }
    }
    return out;
  });

  readonly trajectories = computed(() => {
    const A = this.currentA();
    const initials: Array<[number, number]> = [
      [2, 0], [-2, 0], [0, 2], [0, -2],
      [1.5, 1.5], [-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5],
    ];
    return initials.map((ic) => {
      const fwd = integrate(A, ic, 3.5, 1);
      const bwd = integrate(A, ic, 2, -1);
      const all = [...bwd.reverse(), ...fwd];
      return all
        .map(([x, y], i) => {
          const xc = Math.max(-2.8, Math.min(2.8, x));
          const yc = Math.max(-2.8, Math.min(2.8, y));
          return `${i === 0 ? 'M' : 'L'} ${(xc * 28).toFixed(1)} ${(-yc * 28).toFixed(1)}`;
        })
        .join(' ');
    });
  });
}
