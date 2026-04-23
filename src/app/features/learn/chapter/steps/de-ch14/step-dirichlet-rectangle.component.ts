import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface BCProfile {
  id: string;
  name: string;
  f: (x: number) => number;
}

const PROFILES: BCProfile[] = [
  { id: 'sin', name: 'sin(πx)', f: (x) => Math.sin(Math.PI * x) },
  { id: 'constant', name: '常數 1', f: () => 1 },
  { id: 'step', name: '階梯 (左0右1)', f: (x) => (x > 0.5 ? 1 : 0) },
  { id: 'triangle', name: '三角', f: (x) => (x < 0.5 ? 2 * x : 2 - 2 * x) },
];

@Component({
  selector: 'app-de-ch14-dirichlet',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="方形上的 Dirichlet 問題" subtitle="§14.3">
      <p>
        最經典的 Laplace 問題：給定方形 [0, L] × [0, H] 的邊界值 g(x, y)，
        找內部的調和函數 u。
      </p>
      <div class="centered-eq big">
        Δu = 0 於 Ω,&nbsp;&nbsp; u = g 於 ∂Ω
      </div>

      <h4>解法：分離變數 + 疊加</h4>
      <p>
        用四次分離變數，分別處理四個邊只有一邊非零的情況，再把四個解相加。
        以「上邊 = f(x)，其餘 = 0」為例：
      </p>
      <ol class="steps">
        <li>試 <code>u(x, y) = X(x)·Y(y)</code>，代入 Δu = 0 → X″/X = −Y″/Y = −λ。</li>
        <li>BC <code>u(0, y) = u(L, y) = 0</code> → X″ + λX = 0, X(0)=X(L)=0 → λₙ, Xₙ = sin(nπx/L)。</li>
        <li>Y 方程：Y″ − λₙ Y = 0 → Y(y) = A·sinh(nπy/L) + B·cosh(nπy/L)。</li>
        <li>BC <code>u(x, 0) = 0</code> → B = 0，所以 Yₙ(y) = sinh(nπy/L)。</li>
        <li>疊加：u = Σ bₙ sin(nπx/L) sinh(nπy/L)。</li>
        <li>最上邊 y = H：<code>f(x) = Σ bₙ sin(nπx/L) sinh(nπH/L)</code> → 用 Fourier 正弦係數求 bₙ。</li>
      </ol>

      <div class="centered-eq">
        bₙ = [(2/L) ∫₀<sup>L</sup> f(x) sin(nπx/L) dx] / sinh(nπH/L)
      </div>
    </app-prose-block>

    <app-challenge-card prompt="選邊界形狀 + 選哪一邊：看內部 Laplace 解">
      <div class="tabs">
        @for (p of profiles; track p.id) {
          <button class="pill" [class.active]="profile() === p.id" (click)="profile.set(p.id)">{{ p.name }}</button>
        }
      </div>

      <div class="side-picker">
        <span class="sp-lab">邊界生效的邊：</span>
        @for (s of sides; track s.id) {
          <button class="side-pill" [class.active]="side() === s.id" (click)="side.set(s.id)">
            {{ s.label }}
          </button>
        }
      </div>

      <div class="plate">
        <svg viewBox="-10 -10 420 220" class="pl-svg">
          <rect x="0" y="0" width="400" height="200" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1.5" />
          @for (cell of cells(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.s" [attr.height]="cell.s"
              [attr.fill]="cell.color" opacity="0.95" />
          }

          <!-- Profile on the active side -->
          <path [attr.d]="profilePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        </svg>
      </div>

      <div class="legend-row">
        <span class="leg"><span class="color-box pos"></span>高</span>
        <span class="leg"><span class="color-box zero"></span>0</span>
        <span class="leg"><span class="color-box neg"></span>低</span>
      </div>

      <p class="note">
        觀察：解在邊界完全貼合給定形狀，在內部<strong>平滑延拓</strong>。
        當邊界有不連續（如階梯），解在內部仍然連續、沒有跳躍——
        這是<strong>調和函數解析性</strong>的直接後果。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>線性疊加：對付任意邊界</h4>
      <p>
        任意邊界值 g(x, y)（四個邊都可能非零）：
      </p>
      <div class="centered-eq">
        u = u<sub>top</sub> + u<sub>bottom</sub> + u<sub>left</sub> + u<sub>right</sub>
      </div>
      <p>
        每個 u<sub>side</sub> 只解「該邊=指定值，其餘=0」。線性 + 疊加 → 真正的解。
        上面的互動已經用這個手法。
      </p>

      <h4>為什麼需要 sinh 而不是 sin 在 y 方向？</h4>
      <p>
        y 方向的 ODE 是 Y″ = λY（注意沒有負號）——屬於<strong>雙曲函數</strong>家族。
        sinh 在 y = 0 時為 0，隨 y 增加單調成長——這正是我們要的「下邊為零、上邊為 f」的結構。
        cosh 在 y = 0 時為 1（會破壞下邊零條件）。
      </p>
      <p class="key-idea">
        <strong>大方向記法：</strong>
        空間 BVP（像弦）→ 振盪 sin, cos；
        「單向延拓」的方向 → 雙曲 sinh, cosh。
        Laplace 方程混合了兩者——空間結構不變，但「離開邊界」是雙曲的。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        方形 Dirichlet = 分離變數 + 邊界展開 + sin × sinh 結構。
        下一節看<strong>圓盤</strong>上的 Dirichlet——那裡 Poisson 核登場，給出超漂亮的積分公式。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 6px; }
    .steps { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }

    .tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .side-picker { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .sp-lab { font-size: 12px; color: var(--text-muted); }
    .side-pill { font: inherit; font-size: 12px; padding: 4px 10px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg); cursor: pointer; color: var(--text-muted); }
    .side-pill.active { background: #ba8d2a; border-color: #ba8d2a; color: white; }

    .plate { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pl-svg { width: 100%; display: block; }

    .legend-row { display: flex; gap: 14px; justify-content: center; margin-top: 6px; font-size: 11px; color: var(--text-muted); }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .color-box { width: 14px; height: 10px; border-radius: 2px; border: 1px solid var(--border); }
    .color-box.pos { background: rgb(235, 100, 80); }
    .color-box.zero { background: rgb(220, 210, 200); }
    .color-box.neg { background: rgb(110, 180, 230); }

    .note { padding: 12px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh14DirichletComponent {
  readonly profile = signal('sin');
  readonly side = signal<'top' | 'bottom' | 'left' | 'right'>('top');
  readonly profiles = PROFILES;
  readonly sides: Array<{ id: 'top' | 'bottom' | 'left' | 'right'; label: string }> = [
    { id: 'top', label: '上' },
    { id: 'bottom', label: '下' },
    { id: 'left', label: '左' },
    { id: 'right', label: '右' },
  ];

  readonly fFn = computed(() => PROFILES.find(p => p.id === this.profile())!.f);

  readonly cells = computed(() => {
    const f = this.fFn();
    const side = this.side();
    const grid = 50;
    const gridY = 25;
    const cellSize = 400 / grid;
    const cellSizeY = 200 / gridY;
    const out: Array<{ id: string; x: number; y: number; s: number; color: string }> = [];
    const M = 12;
    // Pre-compute Fourier coefficients cₙ of f(s) on [0,1] with sine basis
    const cn: number[] = [];
    for (let n = 1; n <= M; n++) {
      let sum = 0;
      const N = 100;
      const h = 1 / N;
      for (let i = 0; i <= N; i++) {
        const s = i * h;
        const v = f(s) * Math.sin(n * Math.PI * s);
        const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
        sum += w * v;
      }
      cn.push(2 * (h / 3) * sum);
    }
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < gridY; j++) {
        const xs = (i + 0.5) / grid;
        const ys = 1 - (j + 0.5) / gridY;
        let u = 0;
        for (let n = 1; n <= M; n++) {
          const k = n * Math.PI;
          if (side === 'top') {
            u += cn[n - 1] * Math.sin(k * xs) * Math.sinh(k * ys) / Math.sinh(k);
          } else if (side === 'bottom') {
            u += cn[n - 1] * Math.sin(k * xs) * Math.sinh(k * (1 - ys)) / Math.sinh(k);
          } else if (side === 'left') {
            u += cn[n - 1] * Math.sin(k * ys) * Math.sinh(k * (1 - xs)) / Math.sinh(k);
          } else {
            u += cn[n - 1] * Math.sin(k * ys) * Math.sinh(k * xs) / Math.sinh(k);
          }
        }
        out.push({ id: `${i}_${j}`, x: i * cellSize, y: j * cellSizeY, s: Math.max(cellSize, cellSizeY) + 0.5, color: tempColor(u) });
      }
    }
    return out;
  });

  profilePath(): string {
    const f = this.fFn();
    const side = this.side();
    const pts: string[] = [];
    const N = 100;
    const SCALE = 25;
    if (side === 'top' || side === 'bottom') {
      const yBase = side === 'top' ? 0 : 200;
      const dir = side === 'top' ? -1 : 1;
      for (let i = 0; i <= N; i++) {
        const s = i / N;
        const v = f(s);
        const px = s * 400;
        const py = yBase + dir * v * SCALE;
        pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
      }
    } else {
      const xBase = side === 'left' ? 0 : 400;
      const dir = side === 'left' ? -1 : 1;
      for (let i = 0; i <= N; i++) {
        const s = i / N;
        const v = f(s);
        const py = 200 - s * 200;
        const px = xBase + dir * v * SCALE;
        pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }
}

function tempColor(v: number): string {
  const t = Math.max(-1, Math.min(1, v));
  if (t >= 0) {
    const s = t;
    return `rgb(${Math.round(240 - 10 * (1 - s))}, ${Math.round(220 - 150 * s)}, ${Math.round(210 - 150 * s)})`;
  } else {
    const s = -t;
    return `rgb(${Math.round(210 - 100 * s)}, ${Math.round(220 - 30 * s)}, ${Math.round(240 - 10 * s)})`;
  }
}
