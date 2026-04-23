import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface BoundaryFn {
  id: string;
  name: string;
  f: (theta: number) => number;
}

const BOUNDARIES: BoundaryFn[] = [
  { id: 'half', name: '上半 +1、下半 −1', f: (t) => (Math.sin(t) >= 0 ? 1 : -1) },
  { id: 'cos', name: 'cos(θ)', f: (t) => Math.cos(t) },
  { id: 'cos2', name: 'cos(2θ)', f: (t) => Math.cos(2 * t) },
  { id: 'hot-arc', name: '單一熱弧', f: (t) => (t > Math.PI * 0.3 && t < Math.PI * 0.7 ? 1 : 0) },
];

@Component({
  selector: 'app-de-ch14-disk',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="圓盤上的 Dirichlet 問題 + Poisson 核" subtitle="§14.4">
      <p>
        換成圓盤 <code>r &lt; R</code>：用極座標 <code>(r, θ)</code>。
        Laplace 算子變成：
      </p>
      <div class="centered-eq">
        Δu = uᵣᵣ + (1/r)·uᵣ + (1/r²)·u_θθ = 0
      </div>
      <p>
        分離 <code>u = R(r)·Θ(θ)</code>，週期條件 <code>Θ(θ+2π) = Θ(θ)</code> 給
        Θₙ(θ) = cos(nθ), sin(nθ)，n = 0, 1, 2, ⋯ 。
        徑向方程 <code>r²R″ + rR′ − n²R = 0</code> 是 Euler 方程 → <strong>R(r) = rⁿ 或 r⁻ⁿ</strong>。
        要求 r = 0 有限 → 只留 rⁿ。
      </p>
      <div class="centered-eq big">
        u(r, θ) = a₀ + Σ<sub>n=1</sub><sup>∞</sup> rⁿ [aₙ cos(nθ) + bₙ sin(nθ)]
      </div>
      <p>
        係數 aₙ, bₙ 由邊界值 <code>u(R, θ) = f(θ)</code> 的 Fourier 展開決定。
      </p>

      <h4>Poisson 核：閉式積分公式</h4>
      <p>
        把級數加起來可得到<strong>Poisson 積分公式</strong>：
      </p>
      <div class="centered-eq big">
        u(r, θ) = (1 / 2π) ∫₀<sup>2π</sup> <span class="kern">K(r, θ − φ)</span> · f(φ) dφ
      </div>
      <div class="centered-eq">
        K(r, ψ) = (R² − r²) / [R² − 2Rr cos(ψ) + r²]
      </div>
      <p class="key-idea">
        <strong>Poisson 核</strong> K 在 r &lt; R 對 φ 積分等於 2π，非負，且當 r → R 時集中在 φ = θ。
        它是圓盤的「調和 Green 函數」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選邊界 + 拖動內部點：看 Poisson 公式如何「平均」邊界值">
      <div class="bc-tabs">
        @for (b of boundaries; track b.id) {
          <button class="pill" [class.active]="bc() === b.id" (click)="bc.set(b.id)">{{ b.name }}</button>
        }
      </div>

      <div class="disk-wrap">
        <svg viewBox="-130 -130 260 260" class="disk-svg" (click)="pickPoint($event)">
          <!-- Color-filled disc -->
          @for (cell of diskCells(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.s" [attr.height]="cell.s"
              [attr.fill]="cell.color" opacity="0.92" />
          }
          <!-- Disc boundary -->
          <circle cx="0" cy="0" r="100" fill="none" stroke="var(--border-strong)" stroke-width="1.8" />
          <!-- Boundary color ring -->
          @for (arc of boundaryArcs(); track $index) {
            <circle cx="0" cy="0" r="105" fill="none"
              [attr.stroke]="arc.color"
              stroke-width="8"
              [attr.stroke-dasharray]="arc.dash"
              [attr.stroke-dashoffset]="arc.offset"
              opacity="0.95" />
          }

          <!-- Picked interior point -->
          <circle [attr.cx]="px()" [attr.cy]="py()" r="5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
          <!-- Dashed lines from picked point to boundary sampler -->
          @for (ray of samplingRays(); track $index) {
            <line [attr.x1]="px()" [attr.y1]="py()"
              [attr.x2]="ray.x" [attr.y2]="ray.y"
              stroke="var(--accent)" stroke-width="0.5" opacity="0.35" />
          }
        </svg>
      </div>

      <div class="result">
        <div class="res-item">
          <span class="res-lab">點 (r, θ)：</span>
          <span class="res-val">({{ r().toFixed(2) }}, {{ thetaDeg().toFixed(0) }}°)</span>
        </div>
        <div class="res-item">
          <span class="res-lab">u(r, θ) = </span>
          <span class="res-val main">{{ uAtPoint().toFixed(3) }}</span>
        </div>
      </div>

      <p class="hint">點擊圓盤內部任一點觀察 u 值。黃色環是邊界函數 f(θ) 的顏色編碼。</p>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼圓盤格外漂亮？</h4>
      <p>
        圓盤的對稱性（旋轉）+ Poisson 核的顯式形式讓：
      </p>
      <ul class="features">
        <li>
          <strong>平均值性質的直接證明</strong>：對 r = 0 代入 Poisson，K = 1，給出 u(0) = 邊界平均。
        </li>
        <li>
          <strong>最大值原理的定量版</strong>：u 的最大值不超過邊界最大值，因為 K ≥ 0 是凸平均。
        </li>
        <li>
          <strong>解的光滑性</strong>：核 K 在內部無限可微，所以 u 在內部無限可微——即便 f 不光滑也行。
        </li>
      </ul>

      <h4>和複分析的橋樑</h4>
      <p>
        若 f 是解析函數 φ(z) 的實部（z = re^iθ），則：
      </p>
      <div class="centered-eq">
        u(z) = Re φ(z) 自動滿足 Laplace 方程
      </div>
      <p>
        這給出「複變 → 實調和」的對應。反過來，任何調和 u 在簡單連通區域上都可以寫成某個解析函數的實部（加共軛調和函數為虛部）。
        Ch 的複分析課程展開了這個關係。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        圓盤的 Dirichlet 問題有優雅的 Poisson 積分解。
        調和函數的所有神奇性質在圓盤上都變成「Poisson 核的非負性 + 歸一化」的直接推論。
        下一節為本章 + 整個 PDE 部分收尾。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .kern { color: #ba8d2a; font-weight: 700; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .bc-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .disk-wrap { text-align: center; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .disk-svg { width: 320px; max-width: 100%; cursor: crosshair; }

    .result { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .res-item { display: flex; align-items: baseline; gap: 8px; }
    .res-lab { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .res-val { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .res-val.main { font-size: 18px; }

    .hint { font-size: 11px; color: var(--text-muted); margin: 6px 0 0; text-align: center; }

    .features { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .features strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh14DiskComponent {
  readonly bc = signal('half');
  readonly px = signal(0);
  readonly py = signal(0);
  readonly boundaries = BOUNDARIES;
  readonly R = 100;

  readonly fFn = computed(() => BOUNDARIES.find(b => b.id === this.bc())!.f);

  readonly r = computed(() => Math.hypot(this.px(), this.py()) / this.R);
  readonly theta = computed(() => {
    const t = Math.atan2(-this.py(), this.px());
    return t < 0 ? t + 2 * Math.PI : t;
  });
  readonly thetaDeg = computed(() => (this.theta() * 180 / Math.PI));

  pickPoint(evt: MouseEvent) {
    const target = (evt.target as SVGElement).closest('svg');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const scaleX = 260 / rect.width;
    const scaleY = 260 / rect.height;
    const vx = (evt.clientX - rect.left) * scaleX - 130;
    const vy = (evt.clientY - rect.top) * scaleY - 130;
    const r = Math.hypot(vx, vy);
    if (r < this.R - 3) {
      this.px.set(vx);
      this.py.set(vy);
    }
  }

  /** Poisson integral formula */
  uAt(r: number, theta: number): number {
    const f = this.fFn();
    const R = this.R;
    const N = 120;
    let sum = 0;
    for (let k = 0; k < N; k++) {
      const phi = (2 * Math.PI * k) / N;
      const denom = R * R - 2 * R * r * Math.cos(theta - phi) + r * r;
      const K = (R * R - r * r) / denom;
      sum += K * f(phi);
    }
    return sum / N; // (2π/N) * sum / (2π) = sum / N
  }

  readonly uAtPoint = computed(() => this.uAt(this.r() * this.R, this.theta()));

  readonly diskCells = computed(() => {
    const cellSize = 8;
    const nCells = 32;
    const out: Array<{ id: string; x: number; y: number; s: number; color: string }> = [];
    for (let i = 0; i < nCells; i++) {
      for (let j = 0; j < nCells; j++) {
        const cx = -this.R * 1.05 + (i + 0.5) * (2 * this.R * 1.05) / nCells;
        const cy = -this.R * 1.05 + (j + 0.5) * (2 * this.R * 1.05) / nCells;
        const rr = Math.hypot(cx, cy);
        if (rr > this.R - 0.5) continue;
        const theta = Math.atan2(-cy, cx);
        const thetaN = theta < 0 ? theta + 2 * Math.PI : theta;
        const u = this.uAt(rr, thetaN);
        const color = tempColor(u);
        out.push({
          id: `${i}_${j}`,
          x: -this.R * 1.05 + i * (2 * this.R * 1.05) / nCells,
          y: -this.R * 1.05 + j * (2 * this.R * 1.05) / nCells,
          s: (2 * this.R * 1.05) / nCells + 0.5,
          color,
        });
      }
    }
    return out;
  });

  readonly boundaryArcs = computed(() => {
    const f = this.fFn();
    const N = 64;
    const R = 105;
    const arcs: Array<{ color: string; dash: string; offset: number }> = [];
    const circumference = 2 * Math.PI * R;
    const segLen = circumference / N;
    for (let i = 0; i < N; i++) {
      const theta = (2 * Math.PI * i) / N;
      const v = f(theta);
      const color = tempColor(v);
      const dash = `${segLen} ${circumference - segLen}`;
      const offset = -(circumference * i) / N;
      arcs.push({ color, dash, offset });
    }
    return arcs;
  });

  readonly samplingRays = computed(() => {
    const n = 12;
    const rays: Array<{ x: number; y: number }> = [];
    for (let k = 0; k < n; k++) {
      const phi = (2 * Math.PI * k) / n;
      rays.push({ x: this.R * Math.cos(phi), y: -this.R * Math.sin(phi) });
    }
    return rays;
  });
}

function tempColor(v: number): string {
  const t = Math.max(-1, Math.min(1, v));
  if (t >= 0) {
    const s = t;
    return `rgb(${Math.round(240 - 20 * (1 - s))}, ${Math.round(220 - 150 * s)}, ${Math.round(210 - 150 * s)})`;
  } else {
    const s = -t;
    return `rgb(${Math.round(210 - 100 * s)}, ${Math.round(220 - 30 * s)}, ${Math.round(240 - 10 * s)})`;
  }
}
