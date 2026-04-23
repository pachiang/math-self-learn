import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch12-what-is-pde',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是 PDE？" subtitle="§12.1">
      <p>
        前 11 章的 ODE 把時間當成唯一的自變數：<strong>u = u(t)</strong>，
        回答的問題是「狀態如何隨時間演化」。
      </p>
      <p class="key-idea">
        但現實是<strong>連續介質</strong>——熱在棒子裡傳、波在弦上跑、電位在空間散開。
        這時函數有<strong>多個自變數</strong>：<code>u(x, t)</code>、<code>u(x, y, t)</code>、甚至 <code>u(r, θ, φ, t)</code>。
        描述它們的方程含有對<strong>不同變數</strong>的偏導數 → <strong>偏微分方程（PDE）</strong>。
      </p>

      <h4>三個經典 PDE</h4>
      <div class="pde-grid">
        <div class="pde-card heat">
          <div class="pde-name">熱方程</div>
          <code class="pde-eq">∂u/∂t = α·∂²u/∂x²</code>
          <p>溫度、濃度、擴散。<strong>抹平</strong>初始凹凸的算子。</p>
        </div>
        <div class="pde-card wave">
          <div class="pde-name">波動方程</div>
          <code class="pde-eq">∂²u/∂t² = c²·∂²u/∂x²</code>
          <p>聲波、弦振動、電磁波。<strong>傳遞</strong>擾動而不衰減。</p>
        </div>
        <div class="pde-card laplace">
          <div class="pde-name">Laplace 方程</div>
          <code class="pde-eq">∂²u/∂x² + ∂²u/∂y² = 0</code>
          <p>穩態（沒有時間）。靜電位、肥皂膜、熱穩態。</p>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="滑動時間 t：比較熱 vs 波對同一初始狀態的反應">
      <div class="two-plot">
        <div class="sp">
          <div class="sp-title">熱方程：∂u/∂t = α·uₓₓ</div>
          <svg viewBox="-10 -80 320 150" class="sp-svg">
            <line x1="0" y1="0" x2="300" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-75" x2="0" y2="65" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="300" y1="-75" x2="300" y2="65" stroke="var(--border-strong)" stroke-width="1" />
            <!-- Initial -->
            <path [attr.d]="initialHeat()" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="3 2" />
            <!-- Current -->
            <path [attr.d]="heatPath()" fill="none" stroke="#c87b5e" stroke-width="2.4" />
          </svg>
          <p class="sp-cap">高峰會<strong>下沉、變寬</strong>。能量往兩側散。</p>
        </div>

        <div class="sp">
          <div class="sp-title">波動方程：u_tt = c²·uₓₓ</div>
          <svg viewBox="-10 -80 320 150" class="sp-svg">
            <line x1="0" y1="0" x2="300" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-75" x2="0" y2="65" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="300" y1="-75" x2="300" y2="65" stroke="var(--border-strong)" stroke-width="1" />
            <!-- Initial -->
            <path [attr.d]="initialWave()" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="3 2" />
            <!-- Current -->
            <path [attr.d]="wavePath()" fill="none" stroke="#5a8aa8" stroke-width="2.4" />
          </svg>
          <p class="sp-cap">波分裂成兩個，朝兩邊<strong>以速度 c 傳遞</strong>。</p>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">時間 t</span>
          <input type="range" min="0" max="2" step="0.01" [value]="t()"
            (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
        <div class="presets">
          <button class="pre" (click)="t.set(0)">t=0</button>
          <button class="pre" (click)="t.set(0.5)">t=0.5</button>
          <button class="pre" (click)="t.set(1)">t=1</button>
          <button class="pre" (click)="t.set(2)">t=2</button>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>PDE 的新挑戰</h4>
      <ul class="challenges">
        <li>
          <strong>要條件更多：</strong> 不只初值，還要<strong>邊界條件</strong>（棒子兩端溫度？弦兩端固定？）。
        </li>
        <li>
          <strong>解在函數空間裡運動：</strong> 時刻 t 的狀態是整個函數 u(·, t)，不再是一個 (t, y) 的數對。
        </li>
        <li>
          <strong>沒有一招通吃：</strong> 不同類型的 PDE 性格迥異（擴散 vs 傳播 vs 穩態）。
        </li>
        <li>
          <strong>但線性 PDE 可以疊加：</strong> 跟 ODE 一樣，解可以合成。這是「分離變數 + 本徵函數展開」的前提。
        </li>
      </ul>

      <h4>這章的路線</h4>
      <ol class="route">
        <li>§12.2 — 熱方程怎麼寫出來（物理推導）。</li>
        <li>§12.3 — <strong>分離變數法</strong>：把 PDE 變成兩個 ODE。</li>
        <li>§12.4 — 兩端固定溫度的完整解（Fourier 正弦級數出場）。</li>
        <li>§12.5 — 絕熱端點：Neumann 邊界、餘弦級數。</li>
        <li>§12.6 — 非齊次、源項、展望 Ch13-14。</li>
      </ol>

      <p class="takeaway">
        <strong>take-away：</strong>
        PDE 描述連續介質——需要邊界條件、無法「順著時間積」。
        但 Ch11 的本徵函數框架正是為 PDE 量身打造的：
        下一節推出熱方程，之後我們用分離變數法把它拆成 Ch11 的問題。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 15px; margin: 12px 0; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }

    .pde-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 12px 0; }
    .pde-card { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pde-card.heat { border-left: 4px solid #c87b5e; }
    .pde-card.wave { border-left: 4px solid #5a8aa8; }
    .pde-card.laplace { border-left: 4px solid #5ca878; }
    .pde-name { font-weight: 700; color: var(--accent); margin-bottom: 6px; font-size: 14px; }
    .pde-eq { display: block; font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 5px 8px; margin-bottom: 6px; background: var(--bg-surface); }
    .pde-card p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .two-plot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    @media (max-width: 640px) { .two-plot { grid-template-columns: 1fr; } }
    .sp { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .sp-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .sp-svg { width: 100%; display: block; }
    .sp-cap { font-size: 11px; color: var(--text-secondary); margin: 4px 0 0; text-align: center; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }
    .presets { display: flex; gap: 6px; }
    .pre { font: inherit; font-size: 11px; padding: 4px 10px; border: 1px solid var(--border); background: var(--bg); border-radius: 12px; cursor: pointer; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .pre:hover { border-color: var(--accent); color: var(--accent); }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .challenges { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .challenges strong { color: var(--accent); }
    .route { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .route strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh12WhatIsPdeComponent {
  readonly t = signal(0);
  readonly L = 1;
  readonly alpha = 0.5;
  readonly c = 1.5;
  readonly width = 300;
  readonly height = 55;

  /** Gaussian bump initial condition */
  private initial(x: number): number {
    const x0 = 0.5;
    return Math.exp(-200 * (x - x0) * (x - x0));
  }

  /** Heat: evolve gaussian bump via convolution with heat kernel */
  private heat(x: number, t: number): number {
    if (t < 0.001) return this.initial(x);
    // (1/sqrt(4 pi alpha t)) exp(-(x-0.5)^2 / 4 alpha t) * (sqrt(pi/200))
    const sigma0 = 1 / Math.sqrt(400);
    const sigma = Math.sqrt(sigma0 * sigma0 + 2 * this.alpha * t);
    const amp = sigma0 / sigma;
    return amp * Math.exp(-((x - 0.5) * (x - 0.5)) / (2 * sigma * sigma));
  }

  /** Wave: d'Alembert — f(x-ct)/2 + f(x+ct)/2 */
  private wave(x: number, t: number): number {
    return 0.5 * this.initial(x - this.c * t) + 0.5 * this.initial(x + this.c * t);
  }

  initialHeat(): string { return this.buildPath(x => this.initial(x)); }
  initialWave(): string { return this.buildPath(x => this.initial(x)); }
  heatPath(): string { return this.buildPath(x => this.heat(x, this.t())); }
  wavePath(): string { return this.buildPath(x => this.wave(x, this.t())); }

  private buildPath(f: (x: number) => number): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = f(x);
      const px = (x / this.L) * this.width;
      const py = -y * this.height;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
