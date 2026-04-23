import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type BC = 'dirichlet' | 'neumann' | 'mixed';

interface BCDef {
  id: BC;
  name: string;
  brief: string;
  physical: string;
  eigenfunc: string;
  lambdaN: string;
  steady: string;
}

const BCS: Record<BC, BCDef> = {
  dirichlet: {
    id: 'dirichlet',
    name: 'Dirichlet (固定溫度)',
    brief: 'u(0,t) = u(L,t) = 0',
    physical: '兩端接觸到 0°C 冰塊：熱可以從邊界流失。',
    eigenfunc: 'sin(nπx/L)',
    lambdaN: 'λₙ = (nπ/L)²',
    steady: 'u(x, ∞) = 0',
  },
  neumann: {
    id: 'neumann',
    name: 'Neumann (絕熱邊界)',
    brief: 'uₓ(0,t) = uₓ(L,t) = 0',
    physical: '兩端用保溫材包住：沒有熱流出入。',
    eigenfunc: 'cos(nπx/L), n=0, 1, 2, …',
    lambdaN: 'λₙ = (nπ/L)², λ₀ = 0',
    steady: '初始平均值 ū（總熱量守恆）',
  },
  mixed: {
    id: 'mixed',
    name: 'Mixed (一端固定+一端絕熱)',
    brief: 'u(0,t)=0, uₓ(L,t)=0',
    physical: '左端泡冰水、右端絕熱。',
    eigenfunc: 'sin((n+½)πx/L)',
    lambdaN: 'λₙ = ((n+½)π/L)²',
    steady: 'u(x, ∞) = 0',
  },
};

/** Initial condition: simple bump away from boundary */
function initialCond(x: number, L: number): number {
  return Math.exp(-18 * ((x - L * 0.5) / L) ** 2);
}

function bnDirichlet(n: number, L: number, N = 200): number {
  const h = L / N; let s = 0;
  for (let i = 0; i <= N; i++) {
    const x = i * h;
    const v = initialCond(x, L) * Math.sin((n * Math.PI * x) / L);
    const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
    s += w * v;
  }
  return (2 / L) * (h / 3) * s;
}

function anNeumann(n: number, L: number, N = 200): number {
  const h = L / N; let s = 0;
  for (let i = 0; i <= N; i++) {
    const x = i * h;
    const v = initialCond(x, L) * Math.cos((n * Math.PI * x) / L);
    const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
    s += w * v;
  }
  const factor = n === 0 ? 1 / L : 2 / L;
  return factor * (h / 3) * s;
}

function bnMixed(n: number, L: number, N = 200): number {
  const h = L / N; let s = 0;
  for (let i = 0; i <= N; i++) {
    const x = i * h;
    const v = initialCond(x, L) * Math.sin(((n + 0.5) * Math.PI * x) / L);
    const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
    s += w * v;
  }
  return (2 / L) * (h / 3) * s;
}

@Component({
  selector: 'app-de-ch12-boundary-variations',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="邊界條件改變一切" subtitle="§12.5">
      <p>
        同一個 PDE，換不同邊界條件，本徵函數族改變，<strong>長時間穩態也跟著變</strong>。
        這裡並排三種最常見的：
      </p>

      <div class="bc-tabs">
        @for (b of bcList; track b.id) {
          <button class="tab" [class.active]="bc() === b.id" (click)="bc.set(b.id)">
            {{ b.name }}
          </button>
        }
      </div>

      <div class="bc-info">
        <div class="bc-brief">
          <span class="bc-brief-lab">條件：</span>
          <code>{{ current().brief }}</code>
        </div>
        <div class="bc-phys">{{ current().physical }}</div>
        <div class="bc-data">
          <div class="bc-data-cell">
            <div class="bc-data-lab">本徵函數</div>
            <div class="bc-data-val">{{ current().eigenfunc }}</div>
          </div>
          <div class="bc-data-cell">
            <div class="bc-data-lab">本徵值</div>
            <div class="bc-data-val">{{ current().lambdaN }}</div>
          </div>
          <div class="bc-data-cell">
            <div class="bc-data-lab">穩態 (t → ∞)</div>
            <div class="bc-data-val">{{ current().steady }}</div>
          </div>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="播放：比較三種邊界的長時間行為">
      <div class="plot">
        <div class="plot-title">{{ current().name }} — 同一個初始「中間熱塊」</div>
        <svg viewBox="-10 -80 420 150" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-75" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="400" y1="-75" x2="400" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <!-- Steady state reference (if applicable) -->
          @if (bc() === 'neumann') {
            <line x1="0" [attr.y1]="-steadyMean() * H"
              x2="400" [attr.y2]="-steadyMean() * H"
              stroke="#5ca878" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.7" />
            <text x="404" [attr.y]="-steadyMean() * H + 3" class="st-label">ū = {{ steadyMean().toFixed(2) }}</text>
          }
          <!-- Initial -->
          <path [attr.d]="initialPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.4" stroke-dasharray="3 2" opacity="0.7" />
          <!-- Current -->
          <path [attr.d]="currentPath()" fill="none" stroke="var(--accent)" stroke-width="2.4" />
          <text x="-4" y="-72" class="ax-label">u</text>
          <text x="404" y="14" class="tick" text-anchor="middle">L</text>
        </svg>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">{{ playing() ? '⏸ 暫停' : '▶ 播放' }}</button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <span class="t-display">t = {{ t().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">時間 t</span>
          <input type="range" [min]="0" [max]="T_MAX" step="0.01" [value]="t()"
            (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>

      <div class="compare-note" [attr.data-bc]="bc()">
        @if (bc() === 'dirichlet') {
          <strong>Dirichlet 特色：</strong> 熱從兩端流出去，最終整根棒子變成 0°C（完全冷卻）。
        } @else if (bc() === 'neumann') {
          <strong>Neumann 特色：</strong> 完全絕熱。能量無法流失，最終趨向<strong>整體平均溫度 ū</strong>。
          這就是「總熱量守恆」的幾何表現。
        } @else {
          <strong>Mixed 特色：</strong> 只有左端能放熱，但熱需要穿過整根棒子才能逃掉。
          衰減比 Dirichlet 慢（只有一半的本徵值能「排水」）。
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼 Neumann 會有 λ₀ = 0？</h4>
      <p>
        λ₀ = 0 對應的本徵函數是<strong>常數 1</strong>。
        這個「模態」的時間演化 <code>T′ = 0·T → T = 常數</code>——<strong>不衰減</strong>。
        常數模態的係數 = 初始值的平均。
        這就是為什麼 Neumann 的穩態 = 初始平均——<strong>守恆律 = λ=0 本徵函數</strong>。
      </p>
      <div class="key-idea">
        所有能量守恆的系統，其 PDE 的本徵問題裡都必有 λ=0 的常數模態。
        這是「對稱 ↔ 守恆」（Noether 定理）在 PDE 版的縮影。
      </div>

      <h4>給一個源項（非齊次）怎麼辦？</h4>
      <p>
        如果 PDE 變成 <code>uₜ = α·uₓₓ + f(x, t)</code>（例如棒裡有加熱絲）：
      </p>
      <ol class="source-steps">
        <li>把 u 也展開為 Σ bₙ(t)·Xₙ(x)——係數變成時間函數。</li>
        <li>把 f(x, t) 也展開為 Σ fₙ(t)·Xₙ(x)。</li>
        <li>每個模態變成一階非齊次 ODE：<code>bₙ′ + αλₙ·bₙ = fₙ(t)</code>——<strong>Ch2 的老朋友</strong>。</li>
        <li>積分因子法解出，再重新拼回 u。</li>
      </ol>
      <p>
        這整個流程叫做<strong>本徵函數展開法</strong>，Ch11 + Ch2 的直接合體。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }

    .bc-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .tab { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .tab.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .tab:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .bc-info { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .bc-brief { font-size: 14px; margin-bottom: 6px; }
    .bc-brief-lab { color: var(--text-muted); font-size: 12px; margin-right: 4px; }
    .bc-phys { font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-style: italic; }
    .bc-data { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
    .bc-data-cell { padding: 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; text-align: center; }
    .bc-data-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .bc-data-val { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 3px; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .plot-svg { width: 100%; display: block; }
    .tick { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .ax-label { font-size: 10px; fill: var(--text-muted); font-style: italic; }
    .st-label { font-size: 10px; fill: #5ca878; font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .compare-note { padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 10px; line-height: 1.6; color: var(--text-secondary); }
    .compare-note[data-bc='dirichlet'] { background: rgba(200, 123, 94, 0.1); }
    .compare-note[data-bc='neumann'] { background: rgba(92, 168, 120, 0.1); }
    .compare-note[data-bc='mixed'] { background: rgba(244, 200, 102, 0.1); }
    .compare-note strong { color: var(--accent); }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 13px; margin: 12px 0; }

    .source-steps { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .source-steps strong { color: var(--accent); }
  `,
})
export class DeCh12BoundaryVariationsComponent implements OnInit, OnDestroy {
  readonly bc = signal<BC>('dirichlet');
  readonly t = signal(0);
  readonly playing = signal(false);
  readonly T_MAX = 4;
  readonly L = Math.PI;
  readonly alpha = 0.2;
  readonly H = 55;
  readonly bcList = Object.values(BCS);

  readonly current = computed(() => BCS[this.bc()]);

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 0.35;
        if (newT >= this.T_MAX) { this.t.set(this.T_MAX); this.playing.set(false); }
        else this.t.set(newT);
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  ngOnDestroy(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); }

  togglePlay() { if (this.t() >= this.T_MAX - 0.01) this.t.set(0); this.playing.set(!this.playing()); }
  reset() { this.t.set(0); this.playing.set(false); }

  readonly coefs = computed(() => {
    const arr: number[] = [];
    const bc = this.bc();
    for (let n = 0; n < 30; n++) {
      if (bc === 'dirichlet') arr.push(bnDirichlet(n + 1, this.L));
      else if (bc === 'neumann') arr.push(anNeumann(n, this.L));
      else arr.push(bnMixed(n, this.L));
    }
    return arr;
  });

  readonly steadyMean = computed(() => anNeumann(0, this.L));

  solutionAt(x: number, t: number): number {
    const b = this.coefs();
    const bc = this.bc();
    let u = 0;
    for (let n = 0; n < 30; n++) {
      if (bc === 'dirichlet') {
        const nn = n + 1;
        const lam = (nn * Math.PI / this.L) ** 2;
        u += b[n] * Math.sin((nn * Math.PI * x) / this.L) * Math.exp(-this.alpha * lam * t);
      } else if (bc === 'neumann') {
        const lam = (n * Math.PI / this.L) ** 2;
        u += b[n] * Math.cos((n * Math.PI * x) / this.L) * Math.exp(-this.alpha * lam * t);
      } else {
        const k = (n + 0.5) * Math.PI / this.L;
        u += b[n] * Math.sin(k * x) * Math.exp(-this.alpha * k * k * t);
      }
    }
    return u;
  }

  initialPath(): string { return this.buildPath(0); }
  currentPath(): string { return this.buildPath(this.t()); }

  private buildPath(tVal: number): string {
    const pts: string[] = [];
    const W = 400;
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = this.solutionAt(x, tVal);
      const yc = Math.max(-0.5, Math.min(1.5, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * W).toFixed(1)} ${(-yc * this.H).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
