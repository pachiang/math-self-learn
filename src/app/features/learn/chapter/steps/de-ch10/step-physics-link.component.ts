import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// Bessel J_n reuse
function besselJ(n: number, x: number): number {
  if (Math.abs(x) > 20) {
    const phase = x - (n * Math.PI) / 2 - Math.PI / 4;
    return Math.sqrt(2 / (Math.PI * x)) * Math.cos(phase);
  }
  let sum = 0;
  const half = x / 2;
  let term = Math.pow(half, n);
  for (let k = 1; k <= n; k++) term /= k;
  sum = term;
  let sign = -1;
  for (let k = 1; k < 40; k++) {
    term *= (half * half) / (k * (k + n));
    sum += sign * term;
    sign = -sign;
  }
  return sum;
}

// First few roots of J_n, hardcoded
const BESSEL_ROOTS: Record<number, number[]> = {
  0: [2.4048, 5.5201, 8.6537],
  1: [3.8317, 7.0156, 10.1735],
  2: [5.1356, 8.4172, 11.6198],
  3: [6.3802, 9.7610, 13.0152],
};

@Component({
  selector: 'app-de-ch10-physics-link',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="特殊函數的物理角色" subtitle="§10.5">
      <p>
        每個特殊函數都不是抽象數學玩具——它們都是<strong>某個物理問題分離變數後</strong>冒出來的。
      </p>

      <h4>經典例子：圓形鼓面的振動</h4>
      <p>
        一張繃緊的圓形鼓面（半徑 a）滿足<strong>2D 波動方程</strong>：
      </p>
      <div class="centered-eq">∂²u/∂t² = c² ∇²u,&nbsp;&nbsp;u(a, θ, t) = 0</div>
      <p>
        用圓柱座標 (r, θ) 分離變數 u = R(r)·Θ(θ)·T(t) 後，徑向部分變成：
      </p>
      <div class="centered-eq big">
        r²R″ + rR′ + (k²r² − n²)R = 0
      </div>
      <p class="key-idea">
        ← 這就是 Bessel 方程！解是 <code>R(r) = J_n(kr)</code>。
        邊界條件 <code>R(a) = 0</code> 強制 <code>k·a</code> 必須是 Jₙ 的零點，
        <strong>這決定了鼓面振動的允許頻率（模態）</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇模態 (n, m)：看鼓面震動的空間形狀">
      <div class="mode-selector">
        <div class="row">
          <span class="label">角向 n：</span>
          @for (k of [0, 1, 2, 3]; track k) {
            <button class="pre" [class.active]="n() === k" (click)="n.set(k)">{{ k }}</button>
          }
        </div>
        <div class="row">
          <span class="label">徑向 m（第幾個零點）：</span>
          @for (k of [1, 2, 3]; track k) {
            <button class="pre" [class.active]="m() === k" (click)="m.set(k)">{{ k }}</button>
          }
        </div>
      </div>

      <div class="drum-wrap">
        <svg viewBox="-110 -110 220 220" class="drum-svg">
          <!-- Background disc -->
          <circle cx="0" cy="0" r="100" fill="var(--bg-surface)" stroke="var(--border)" />
          <!-- Sample points colored by u(r,θ) -->
          @for (cell of gridCells(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.w" [attr.height]="cell.w"
              [attr.fill]="cell.color" opacity="0.9" />
          }
          <!-- Nodal circles (zeros of J_n) -->
          @for (nc of nodalCircles(); track $index) {
            <circle cx="0" cy="0" [attr.r]="nc"
              fill="none" stroke="var(--text)" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.6" />
          }
          <!-- Nodal diameters for n > 0 -->
          @for (nd of nodalDiameters(); track $index) {
            <line [attr.x1]="-100 * Math.cos(nd)" [attr.y1]="-100 * Math.sin(nd)"
              [attr.x2]="100 * Math.cos(nd)" [attr.y2]="100 * Math.sin(nd)"
              stroke="var(--text)" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.6" />
          }
          <!-- Rim -->
          <circle cx="0" cy="0" r="100" fill="none" stroke="var(--text)" stroke-width="1.5" />
        </svg>
      </div>

      <div class="info-row">
        <div class="info">
          <div class="info-lab">模態</div>
          <div class="info-val">({{ n() }}, {{ m() }})</div>
        </div>
        <div class="info">
          <div class="info-lab">頻率 ∝</div>
          <div class="info-val">{{ currentRoot().toFixed(3) }}</div>
        </div>
        <div class="info">
          <div class="info-lab">節徑</div>
          <div class="info-val">{{ n() }}</div>
        </div>
        <div class="info">
          <div class="info-lab">節圓</div>
          <div class="info-val">{{ m() - 1 }}</div>
        </div>
      </div>

      <p class="note">
        白色虛線是<strong>節點（駐點，u = 0）</strong>——鼓皮不動的地方。
        (0,1) 最基本；(n, m) 越高則越複雜。同一個半徑下，
        頻率比值 <code>ω_(n,m) / ω_(0,1)</code> 等於 Jₙ 零點的比值——<strong>不是整數倍</strong>。
        這就是為什麼圓鼓聲音<strong>不像</strong>弦樂器的和諧泛音。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>其他物理連接</h4>
      <div class="links-grid">
        <div class="link-card">
          <div class="link-name">氫原子</div>
          <p>
            3D Schrödinger + 球座標 → 角向 = <strong>球諧（Legendre）</strong>、
            徑向 = <strong>Laguerre</strong>。主量子數 n = 電子能階。
          </p>
        </div>
        <div class="link-card">
          <div class="link-name">量子諧振子</div>
          <p>
            一維 Schrödinger + 二次位能 → <strong>Hermite Hₙ</strong> × Gauss。
            能階 E_n = (n+½)ℏω，等間距。
          </p>
        </div>
        <div class="link-card">
          <div class="link-name">圓柱波導</div>
          <p>
            3D 電磁波 + 圓柱座標 → 橫向 = <strong>Bessel</strong>。
            截止頻率 = 零點 / 半徑。
          </p>
        </div>
        <div class="link-card">
          <div class="link-name">重力多極</div>
          <p>
            太陽系外行星潮汐、月球形狀 → <strong>Legendre Pₙ(cos θ)</strong> 展開。
            n = 多極矩階數。
          </p>
        </div>
      </div>

      <div class="ch-preview">
        <h4>下一章：Sturm-Liouville 問題</h4>
        <p>
          這整章我們都在「變係數 ODE + 邊界條件 → 本徵值 → 本徵函數」裡打轉。
          Ch11 會把這個結構<strong>抽象化</strong>成一個統一框架：
          Sturm-Liouville 問題。我們會看到：
        </p>
        <ul>
          <li>為什麼本徵函數自動正交（像 Fourier 那樣）？</li>
          <li>如何用它們展開任意函數？</li>
          <li>它們跟 Ch12 要介紹的 <strong>PDE 分離變數法</strong> 是同一件事。</li>
        </ul>
      </div>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 15px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .mode-selector { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 4px 0; }
    .label { font-size: 13px; color: var(--text-muted); min-width: 120px; }
    .pre {
      font: inherit; font-size: 12px; padding: 4px 12px;
      border: 1px solid var(--border); background: var(--bg); border-radius: 14px;
      cursor: pointer; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
    }
    .pre.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pre:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .drum-wrap { text-align: center; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .drum-svg { width: 260px; max-width: 100%; }

    .info-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }
    .info { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .info-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .info-val { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }

    .note { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 10px 0 0; }

    .links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 12px 0; }
    .link-card { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .link-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 14px; }
    .link-card p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

    .ch-preview {
      padding: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      margin-top: 16px;
    }
    .ch-preview ul { margin: 8px 0 0 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
  `,
})
export class DeCh10PhysicsLinkComponent {
  readonly Math = Math;
  readonly n = signal(0);
  readonly m = signal(1);

  readonly currentRoot = computed(() => BESSEL_ROOTS[this.n()]?.[this.m() - 1] ?? 2.4048);

  readonly nodalCircles = computed(() => {
    const roots = BESSEL_ROOTS[this.n()] ?? [];
    const current = this.currentRoot();
    const cs: number[] = [];
    for (let i = 0; i < this.m() - 1; i++) {
      cs.push((roots[i] / current) * 100);
    }
    return cs;
  });

  readonly nodalDiameters = computed(() => {
    const n = this.n();
    if (n === 0) return [];
    const angles: number[] = [];
    for (let k = 0; k < n; k++) {
      angles.push((Math.PI * (2 * k + 1)) / (2 * n));
    }
    return angles;
  });

  readonly gridCells = computed(() => {
    const n = this.n();
    const root = this.currentRoot();
    const cells: Array<{ id: string; x: number; y: number; w: number; color: string }> = [];
    const step = 5;
    for (let ix = -100; ix < 100; ix += step) {
      for (let iy = -100; iy < 100; iy += step) {
        const cx = ix + step / 2;
        const cy = iy + step / 2;
        const r = Math.sqrt(cx * cx + cy * cy);
        if (r > 99) continue;
        const theta = Math.atan2(cy, cx);
        const kr = (r / 100) * root;
        const u = besselJ(n, kr) * Math.cos(n * theta);
        // normalize to [-1, 1]
        const val = Math.max(-1, Math.min(1, u / (n === 0 ? 1 : 0.7)));
        const color = colorForValue(val);
        cells.push({ id: `${ix}_${iy}`, x: ix, y: iy, w: step, color });
      }
    }
    return cells;
  });
}

function colorForValue(v: number): string {
  // Red for positive, blue for negative
  if (v >= 0) {
    const t = v;
    const r = Math.round(255 - 100 * (1 - t));
    const g = Math.round(200 - 160 * t);
    const b = Math.round(180 - 160 * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = -v;
    const r = Math.round(200 - 160 * t);
    const g = Math.round(200 - 120 * t);
    const b = Math.round(220 - 40 * t);
    return `rgb(${r},${g},${b})`;
  }
}
