import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/** 2D heat on square [0,L]^2, Dirichlet: eigenfunctions sin(mπx/L)sin(nπy/L), λ = (m²+n²)π²/L² */
function hotspot(x: number, y: number): number {
  return Math.exp(-10 * ((x - 0.4) ** 2 + (y - 0.6) ** 2)) * 1.5;
}

function bmn(m: number, n: number, L: number, N = 40): number {
  const h = L / N;
  let sum = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const x = i * h;
      const y = j * h;
      const v = hotspot(x, y) * Math.sin((m * Math.PI * x) / L) * Math.sin((n * Math.PI * y) / L);
      const wx = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
      const wy = j === 0 || j === N ? 1 : j % 2 === 0 ? 2 : 4;
      sum += wx * wy * v;
    }
  }
  return (4 / (L * L)) * (h / 3) ** 2 * sum;
}

@Component({
  selector: 'app-de-ch12-heat-gallery',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="2D 熱方程與展望" subtitle="§12.6">
      <p>
        一維熱方程的一切都能推廣。2D 熱方程：
      </p>
      <div class="centered-eq big">
        ∂u/∂t = α (∂²u/∂x² + ∂²u/∂y²) = α · Δu
      </div>
      <p>
        Δ（Laplace 算子）出場了——它會成為接下來 Ch13, Ch14 的主角。
        對方形區域，分離變數法給出兩個方向各自的本徵函數，
        <strong>乘起來</strong>變成 2D 本徵函數。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察 2D 擴散：中間的熱點如何散到整個方塊">
      <div class="heat-plot">
        <svg viewBox="-5 -5 210 210" class="plate-svg">
          <rect x="0" y="0" width="200" height="200" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1.5" />
          @for (cell of cells(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.s" [attr.height]="cell.s"
              [attr.fill]="cell.color" opacity="0.95" />
          }
          <!-- Axes labels -->
          <text x="-3" y="205" class="ax-lab" text-anchor="end">(0,0)</text>
          <text x="203" y="205" class="ax-lab" text-anchor="start">L</text>
          <text x="-3" y="-2" class="ax-lab" text-anchor="end">L</text>
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
          <input type="range" min="0" [max]="T_MAX" step="0.005" [value]="t()"
            (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>

      <div class="viz-note">
        紅 = 熱，藍 = 冷。初始是偏左上的熱點。
        隨時間推移，熱朝四周擴散並從邊界流失，最終整片金屬變成 0°C。
        <strong>衰減最慢的模態是 (m,n) = (1,1)</strong>，
        它呈現「中間最熱、四邊漸冷」的對稱分佈。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>熱方程 = 高斯平滑 = CNN 的祖先</h4>
      <p>
        熱方程的解可以寫成<strong>卷積</strong>：
      </p>
      <div class="centered-eq">
        u(x, t) = ∫ G(x − y, t) · u(y, 0) dy, &nbsp;&nbsp; G(x, t) = (1/√(4παt)) e^(−x²/(4αt))
      </div>
      <p>
        G 就是<strong>高斯核</strong>。隨 t 增加，核越寬、平均得越徹底。
        這正是電腦視覺「高斯模糊」的數學本質——模糊半徑 = √(4αt)，時間越久越模糊。
      </p>
      <div class="app-grid">
        <div class="app">
          <div class="app-name">影像處理</div>
          <p>Gaussian blur、邊緣偵測（Laplacian of Gaussian）、尺度空間理論。</p>
        </div>
        <div class="app">
          <div class="app-name">機器學習</div>
          <p>Diffusion models（DDPM、Stable Diffusion）——「逆轉」熱方程來生成圖片。</p>
        </div>
        <div class="app">
          <div class="app-name">金融</div>
          <p>Black-Scholes：股票價格的對數滿足帶飄移的熱方程。</p>
        </div>
        <div class="app">
          <div class="app-name">地質</div>
          <p>地熱分佈、冰川融化、溫泉熱傳。</p>
        </div>
      </div>

      <h4>總結：這章你學到了什麼</h4>
      <ol class="summary">
        <li>PDE 出現在每個「連續介質」問題——需要<strong>空間邊界條件</strong>。</li>
        <li>熱方程 <code>uₜ = α·uₓₓ</code> = Fourier 定律 + 能量守恆，uₓₓ 是「跟鄰居比」。</li>
        <li><strong>分離變數法</strong> u = X(x)T(t) 把 PDE 拆成 Ch11 BVP + 一階時間 ODE。</li>
        <li>解 = 本徵模態的<strong>疊加 × 指數衰減</strong>：<code>u = Σ bₙ Xₙ(x) e^(−αλₙt)</code></li>
        <li>不同邊界給不同的 Xₙ 族；Neumann 有 λ=0（守恆）；Mixed 有半整數模態。</li>
        <li>高頻衰減最快 → 熱方程是<strong>平滑化算子</strong>，是高斯卷積。</li>
      </ol>

      <div class="next-ch">
        <h4>下一章：波動方程</h4>
        <p>
          熱方程是<strong>抹平</strong>（一階時間、耗散），波動方程是<strong>傳播</strong>
          （二階時間、守恆）。雖然長相相似、分離變數法同樣適用，但
          「T(t) 變成兩個振盪」產生了完全不同的世界：駐波、行波、d'Alembert 公式、
          光錐、有限傳播速度。它是接下來最有戲劇性的 PDE。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }

    .heat-plot { text-align: center; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plate-svg { width: 260px; max-width: 100%; }
    .ax-lab { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .viz-note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .viz-note strong { color: var(--accent); }

    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .app-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .app { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .app-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .app p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .summary { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .summary strong { color: var(--accent); }

    .next-ch { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .next-ch p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .next-ch strong { color: var(--accent); }
  `,
})
export class DeCh12HeatGalleryComponent implements OnInit, OnDestroy {
  readonly t = signal(0);
  readonly playing = signal(false);
  readonly T_MAX = 1.5;
  readonly alpha = 0.25;
  readonly L = 1;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 0.15;
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

  /** Precompute coefficients once */
  private readonly precomputed = (() => {
    const M = 8;
    const arr: number[][] = [];
    for (let m = 1; m <= M; m++) {
      const row: number[] = [];
      for (let n = 1; n <= M; n++) row.push(bmn(m, n, 1));
      arr.push(row);
    }
    return arr;
  })();

  readonly cells = computed(() => {
    const t = this.t();
    const alpha = this.alpha;
    const L = this.L;
    const M = 8;
    const grid = 40;
    const cellSize = 200 / grid;
    const out: Array<{ id: string; x: number; y: number; s: number; color: string }> = [];
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const x = (i + 0.5) / grid;
        const y = (j + 0.5) / grid;
        let u = 0;
        for (let m = 1; m <= M; m++) {
          for (let n = 1; n <= M; n++) {
            const lam = ((m * m) + (n * n)) * Math.PI * Math.PI / (L * L);
            u += this.precomputed[m - 1][n - 1]
              * Math.sin(m * Math.PI * x) * Math.sin(n * Math.PI * y)
              * Math.exp(-alpha * lam * t);
          }
        }
        const color = heatColor(u);
        out.push({ id: `${i}_${j}`, x: i * cellSize, y: (grid - 1 - j) * cellSize, s: cellSize + 0.5, color });
      }
    }
    return out;
  });
}

function heatColor(v: number): string {
  const t = Math.max(-0.3, Math.min(1.5, v));
  if (t > 0) {
    const s = Math.min(1, t / 1.2);
    const r = Math.round(245 - 20 * (1 - s));
    const g = Math.round(230 - 160 * s);
    const b = Math.round(220 - 180 * s);
    return `rgb(${r},${g},${b})`;
  } else {
    const s = Math.min(1, -t / 0.3);
    const r = Math.round(200 - 80 * s);
    const g = Math.round(220 - 40 * s);
    const b = Math.round(240 - 10 * s);
    return `rgb(${r},${g},${b})`;
  }
}
