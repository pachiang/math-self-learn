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
 * 2×2 real eigenvalue decomposition.
 * Returns eigenvalues λ₁ ≥ λ₂ and corresponding unit eigenvectors.
 */
interface EigenInfo {
  l1: number; l2: number;
  v1: [number, number]; v2: [number, number];
  isComplex: boolean;
  realPart?: number;
  imagPart?: number;
}

function eigen(A: [[number, number], [number, number]]): EigenInfo {
  const [[a, b], [c, d]] = A;
  const tau = a + d;
  const det = a * d - b * c;
  const disc = tau * tau - 4 * det;

  if (disc < -1e-9) {
    // Complex
    return {
      l1: tau / 2, l2: tau / 2,
      v1: [1, 0], v2: [0, 1],
      isComplex: true,
      realPart: tau / 2,
      imagPart: Math.sqrt(-disc) / 2,
    };
  }
  const s = Math.sqrt(Math.max(0, disc));
  const l1 = (tau + s) / 2;
  const l2 = (tau - s) / 2;

  // Find eigenvector for each eigenvalue
  // (A - λI) v = 0 => v in null space.
  // For 2x2: either (λ-d, c) or (b, λ-a). Pick one with larger magnitude.
  const findV = (l: number): [number, number] => {
    const v1x = b, v1y = l - a;
    const v2x = l - d, v2y = c;
    const m1 = Math.hypot(v1x, v1y);
    const m2 = Math.hypot(v2x, v2y);
    if (m1 > m2 && m1 > 1e-6) return [v1x / m1, v1y / m1];
    if (m2 > 1e-6) return [v2x / m2, v2y / m2];
    return [1, 0];
  };

  return {
    l1, l2,
    v1: findV(l1), v2: findV(l2),
    isComplex: false,
  };
}

interface MatrixPreset {
  id: string;
  label: string;
  A: [[number, number], [number, number]];
}

const PRESETS: MatrixPreset[] = [
  { id: 'saddle', label: '鞍點（λ₁>0, λ₂<0）', A: [[1, 0], [0, -1]] },
  { id: 'skewed-saddle', label: '斜鞍點', A: [[0.5, 1], [1, 0.5]] },
  { id: 'stable-node', label: '穩定節點', A: [[-1, 0], [0, -2]] },
  { id: 'unstable-node', label: '不穩定節點', A: [[2, 0], [0, 1]] },
  { id: 'spiral', label: '螺旋（複特徵值）', A: [[-0.3, -1], [1, -0.3]] },
];

/** RK4 integration for dx/dt = Ax */
function integrate(A: [[number, number], [number, number]], x0: [number, number], tMax: number, dir: 1 | -1, dt = 0.02): Array<[number, number]> {
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

const PX = 32;

@Component({
  selector: 'app-de-ch8-eigen',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="特徵向量：系統的不變方向" subtitle="§8.3">
      <p>
        上一節提到 dx/dt = A·x 的解可以用 A 的特徵值／特徵向量展開。這一節給特徵向量一個<strong>直觀的幾何意義</strong>。
      </p>
      <p class="key-idea">
        <strong>關鍵事實</strong>：如果 v 是 A 的特徵向量（對應特徵值 λ），從 v 方向的初值出發——<strong>軌跡會永遠保持在 v 方向上</strong>！
        只是<em>沿著</em>那條直線做 e^(λt) 的指數縮放。
      </p>
      <p>
        證明：假設 x(0) = C·v，則 x(t) = e^(At)·C·v = C·e^(λt)·v
        （因為 A·v = λv 所以 e^(At)·v = e^(λt)·v）。整條軌跡在 v 的直線上。
      </p>
      <p>
        這給我們一個強大的視覺直覺：
      </p>
      <ul>
        <li><strong>特徵向量 = 軌跡的「高速公路」</strong>。上了公路就不會下來，只是速度變化。</li>
        <li><strong>λ &gt; 0</strong> 時，軌跡在特徵向量方向上<strong>指數向外爆炸</strong>。</li>
        <li><strong>λ &lt; 0</strong> 時，軌跡在那方向上<strong>指數朝原點收縮</strong>。</li>
        <li><strong>其他方向的初值</strong>會被分解成兩個特徵向量方向的組合，各自獨立演化。</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="點相平面任一點 → 看軌跡沿著特徵向量的方向演化">
      <div class="picker">
        @for (p of presets; track p.id) {
          <button class="pick-btn"
            [class.active]="preset().id === p.id"
            (click)="switchPreset(p)"
          >{{ p.label }}</button>
        }
      </div>

      <div class="plot-wrap">
        <svg
          #svg
          viewBox="-140 -140 280 280"
          class="plot-svg"
          (click)="handleClick($event)"
        >
          <!-- Grid -->
          @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
            <line [attr.x1]="g * PX" y1="-130" [attr.x2]="g * PX" y2="130"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            <line x1="-130" [attr.y1]="-g * PX" x2="130" [attr.y2]="-g * PX"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }

          <!-- Axes -->
          <line x1="-130" y1="0" x2="130" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-130" x2="0" y2="130" stroke="var(--border-strong)" stroke-width="1" />
          <text x="134" y="4" class="ax">x₁</text>
          <text x="4" y="-132" class="ax">x₂</text>

          <!-- Vector field arrows -->
          @for (a of vectorField(); track a.k) {
            <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"
              stroke="var(--text-muted)" stroke-width="0.9"
              stroke-linecap="round" opacity="0.45" />
          }

          <!-- Eigenvector "highways" (if real) -->
          @if (!eigenInfo().isComplex) {
            <!-- Eigvec 1 line through origin -->
            <line
              [attr.x1]="eigenInfo().v1[0] * -140"
              [attr.y1]="-eigenInfo().v1[1] * -140"
              [attr.x2]="eigenInfo().v1[0] * 140"
              [attr.y2]="-eigenInfo().v1[1] * 140"
              [attr.stroke]="eigenInfo().l1 > 0 ? '#c87b5e' : '#5ca878'"
              stroke-width="1.8"
              opacity="0.85" />
            <!-- Eigvec 2 line -->
            <line
              [attr.x1]="eigenInfo().v2[0] * -140"
              [attr.y1]="-eigenInfo().v2[1] * -140"
              [attr.x2]="eigenInfo().v2[0] * 140"
              [attr.y2]="-eigenInfo().v2[1] * 140"
              [attr.stroke]="eigenInfo().l2 > 0 ? '#c87b5e' : '#5ca878'"
              stroke-width="1.8"
              opacity="0.85" />

            <!-- Eigenvector arrows (unit) -->
            <line x1="0" y1="0"
              [attr.x2]="eigenInfo().v1[0] * PX * 1.3"
              [attr.y2]="-eigenInfo().v1[1] * PX * 1.3"
              [attr.stroke]="eigenInfo().l1 > 0 ? '#c87b5e' : '#5ca878'"
              stroke-width="2.5"
              marker-end="url(#ev1-tip)" />
            <line x1="0" y1="0"
              [attr.x2]="eigenInfo().v2[0] * PX * 1.3"
              [attr.y2]="-eigenInfo().v2[1] * PX * 1.3"
              [attr.stroke]="eigenInfo().l2 > 0 ? '#c87b5e' : '#5ca878'"
              stroke-width="2.5"
              marker-end="url(#ev2-tip)" />

            <defs>
              <marker id="ev1-tip" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" [attr.fill]="eigenInfo().l1 > 0 ? '#c87b5e' : '#5ca878'" />
              </marker>
              <marker id="ev2-tip" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" [attr.fill]="eigenInfo().l2 > 0 ? '#c87b5e' : '#5ca878'" />
              </marker>
            </defs>
          }

          <!-- User-dropped trajectories -->
          @for (tr of trajectories(); track $index) {
            <path [attr.d]="tr.path" fill="none"
              stroke="var(--accent)" stroke-width="2" opacity="0.85" />
            <circle [attr.cx]="tr.x0 * PX" [attr.cy]="-tr.y0 * PX" r="4"
              fill="var(--accent)" stroke="white" stroke-width="1.5" />
          }
        </svg>

        <div class="hint">
          點圖上任一點 → 自動從那裡積分出軌跡。綠色特徵向量代表<strong>穩定方向</strong>，
          紅色代表<strong>不穩定方向</strong>。
        </div>
      </div>

      <!-- Eigenvalue display -->
      <div class="eigen-display">
        <div class="ed-row">
          <span class="ed-lab">特徵值</span>
          <code class="ed-val">{{ eigenDisplay() }}</code>
        </div>
        @if (!eigenInfo().isComplex) {
          <div class="ed-row">
            <span class="ed-lab">特徵向量 v₁</span>
            <code class="ed-val">({{ eigenInfo().v1[0].toFixed(2) }}, {{ eigenInfo().v1[1].toFixed(2) }})</code>
            <span class="ed-fate" [style.color]="eigenInfo().l1 > 0 ? '#c87b5e' : '#5ca878'">
              {{ eigenInfo().l1 > 0 ? '爆炸 →' : '收斂 →' }}
            </span>
          </div>
          <div class="ed-row">
            <span class="ed-lab">特徵向量 v₂</span>
            <code class="ed-val">({{ eigenInfo().v2[0].toFixed(2) }}, {{ eigenInfo().v2[1].toFixed(2) }})</code>
            <span class="ed-fate" [style.color]="eigenInfo().l2 > 0 ? '#c87b5e' : '#5ca878'">
              {{ eigenInfo().l2 > 0 ? '爆炸 →' : '收斂 →' }}
            </span>
          </div>
        } @else {
          <div class="ed-row">
            <span class="ed-lab">複特徵值</span>
            <span class="ed-complex">
              沒有實特徵向量 → 軌跡不在直線上，而是繞著原點螺旋／迴轉。
            </span>
          </div>
        }
      </div>

      <div class="clear-btn-wrap">
        <button class="clear-btn" (click)="clearTrajectories()">清除軌跡</button>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        三個關鍵觀察：
      </p>
      <ul>
        <li><strong>沿著特徵向量的軌跡是直線</strong>。這些直線是相平面上的「不變子空間」。</li>
        <li><strong>λ 的符號決定方向</strong>：正 λ 離心、負 λ 向心。鞍點的經典造型（一進一出）就從這裡來。</li>
        <li><strong>特徵向量不正交</strong>（除非 A 對稱）。線代課的「特徵向量正交」只對對稱矩陣成立，一般矩陣沒有這保證。</li>
      </ul>

      <div class="connection-box">
        <h4>為什麼特徵向量叫「不變方向」？</h4>
        <p>
          矩陣 A 作為映射：x ↦ Ax。<strong>大多數向量</strong>在這個映射下會轉向；
          <strong>特徵向量</strong>唯一不轉向——只伸縮（被 λ 倍放大）。
          這個「不轉向」的幾何性質，正是讓它們成為「軌跡的公路」的原因。
        </p>
      </div>

      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        特徵向量是系統的不變方向——軌跡若從那出發，就永遠在那直線上。
        特徵值的符號告訴你是往原點去還是離開原點。
        其他初值會被分解成兩個特徵向量成分的組合，各自指數演化——這就是下一節「相肖像」分類的基礎。
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
      max-width: 460px;
      margin: 0 auto;
      cursor: crosshair;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .hint {
      margin-top: 6px;
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
      line-height: 1.5;
    }

    .eigen-display {
      padding: 12px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .ed-row {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 10px;
      align-items: baseline;
      padding: 6px 0;
      font-size: 13px;
    }

    .ed-lab {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .ed-val {
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      padding: 3px 8px;
    }

    .ed-fate {
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .ed-complex {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .clear-btn-wrap {
      text-align: center;
    }

    .clear-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 14px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text-muted);
      border-radius: 6px;
      cursor: pointer;
    }

    .clear-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .connection-box {
      padding: 14px;
      background: var(--accent-10);
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      margin: 12px 0;
    }

    .connection-box h4 {
      margin: 0 0 6px;
      font-size: 14px;
      color: var(--accent);
    }

    .connection-box p {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh8EigenComponent implements OnInit, OnDestroy {
  readonly PX = PX;
  readonly presets = PRESETS;
  readonly preset = signal<MatrixPreset>(PRESETS[0]);
  readonly trajectories = signal<Array<{ x0: number; y0: number; path: string }>>([]);

  readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  switchPreset(p: MatrixPreset): void {
    this.preset.set(p);
    this.trajectories.set([]);
  }

  clearTrajectories(): void {
    this.trajectories.set([]);
  }

  readonly eigenInfo = computed(() => eigen(this.preset().A));

  readonly eigenDisplay = computed(() => {
    const e = this.eigenInfo();
    if (e.isComplex) {
      return `${e.realPart!.toFixed(2)} ± ${e.imagPart!.toFixed(2)}i (複)`;
    }
    return `λ₁ = ${e.l1.toFixed(2)}, λ₂ = ${e.l2.toFixed(2)}`;
  });

  readonly vectorField = computed(() => {
    const A = this.preset().A;
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const range = 3.5;
    const step = 0.7;
    for (let xi = -range; xi <= range + 0.01; xi += step) {
      for (let yi = -range; yi <= range + 0.01; yi += step) {
        const dx = A[0][0] * xi + A[0][1] * yi;
        const dy = A[1][0] * xi + A[1][1] * yi;
        const mag = Math.hypot(dx, dy);
        if (mag < 0.01) continue;
        const cx = xi * PX;
        const cy = -yi * PX;
        const scale = 12 / mag;
        const ex = cx + dx * scale;
        const ey = cy - dy * scale;
        out.push({
          k: `${xi}_${yi}`,
          x1: cx, y1: cy,
          x2: ex, y2: ey,
        });
      }
    }
    return out;
  });

  handleClick(event: MouseEvent): void {
    const svg = this.svgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const x0 = inv.x / PX;
    const y0 = -inv.y / PX;

    if (Math.abs(x0) > 4 || Math.abs(y0) > 4) return;

    const pts = integrate(this.preset().A, [x0, y0], 6, 1, 0.02);
    const pathStr = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${(x * PX).toFixed(1)} ${(-y * PX).toFixed(1)}`).join(' ');

    const next = [...this.trajectories()];
    next.push({ x0, y0, path: pathStr });
    this.trajectories.set(next);
  }
}
