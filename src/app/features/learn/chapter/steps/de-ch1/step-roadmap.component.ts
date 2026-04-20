import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-de-ch1-roadmap',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="這門課要帶你去哪" subtitle="§1.8">
      <p>
        你剛剛走完了整門課的第一章。你現在已經會：
      </p>
      <ul>
        <li>從現象翻譯出微分方程</li>
        <li>畫斜率場、看解曲線順著流</li>
        <li>知道初值問題如何從解族中選一條</li>
        <li>分辨哪些方程能寫封閉解、哪些只能靠數值</li>
        <li>對任一個 ODE 貼上四個標籤</li>
      </ul>
      <p>
        這只是入場卷。接下來的章節會把這些初步直覺<strong>升級</strong>成真正好用的工具。
        下面用四個動畫預告四個 Part——每一個都是動態的，不是靜態插圖。
      </p>
    </app-prose-block>

    <div class="roadmap">
      <!-- Part I -->
      <div class="part-card">
        <div class="part-head">
          <span class="part-label">Part I · Ch2-4</span>
          <h3 class="part-title">一階 ODE 的完整工具箱</h3>
        </div>
        <div class="part-body">
          <div class="part-anim">
            <svg viewBox="-10 -60 220 120" class="svg-anim">
              <!-- Axes -->
              <line x1="0" y1="50" x2="210" y2="50" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="0" y1="-50" x2="0" y2="50" stroke="var(--border-strong)" stroke-width="1" />
              <!-- Slope field dots -->
              @for (x of [30, 60, 90, 120, 150, 180]; track x) {
                @for (y of [-30, -10, 10, 30]; track y) {
                  <line [attr.x1]="x - 5" [attr.y1]="y" [attr.x2]="x + 5" [attr.y2]="y - slopeAt(x, y) * 8"
                    stroke="var(--text-muted)" stroke-width="1" opacity="0.5" />
                }
              }
              <!-- Animated curve -->
              <path [attr.d]="part1Curve()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
              <circle [attr.cx]="part1Dot().x" [attr.cy]="part1Dot().y" r="4"
                fill="var(--accent)" stroke="white" stroke-width="1.5" />
            </svg>
          </div>
          <p class="part-desc">
            可分離方程、線性積分因子、精確方程、代換法——系統性地學會解一階 ODE。
            最後用 Euler 跟 RK4 數值方法結尾。
          </p>
          <div class="topic-pills">
            <span class="pill">可分離方程</span>
            <span class="pill">線性積分因子</span>
            <span class="pill">Euler / RK4</span>
            <span class="pill">存在唯一性</span>
          </div>
        </div>
      </div>

      <!-- Part II -->
      <div class="part-card">
        <div class="part-head">
          <span class="part-label">Part II · Ch5-7</span>
          <h3 class="part-title">振動：從彈簧到共振</h3>
        </div>
        <div class="part-body">
          <div class="part-anim">
            <svg viewBox="-10 -60 220 120" class="svg-anim">
              <!-- Wall and spring -->
              <line x1="0" y1="-40" x2="0" y2="40" stroke="var(--text)" stroke-width="2" />
              @for (i of [0, 1, 2, 3, 4, 5]; track i) {
                <line
                  [attr.x1]="i * (part2Mass() / 6)"
                  y1="0"
                  [attr.x2]="(i + 0.5) * (part2Mass() / 6)"
                  [attr.y2]="i % 2 === 0 ? -8 : 8"
                  stroke="var(--text-muted)"
                  stroke-width="1.5"
                />
              }
              <line [attr.x1]="part2Mass() - 3" y1="-18" [attr.x2]="part2Mass() - 3" y2="18"
                stroke="var(--text-muted)" stroke-width="1.5" />
              <!-- Mass block -->
              <rect [attr.x]="part2Mass()" y="-18" width="36" height="36"
                rx="4" fill="var(--accent)" opacity="0.85" />
              <!-- Equilibrium line -->
              <line x1="120" y1="-45" x2="120" y2="-28"
                stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="2 2" />
              <text x="120" y="-48" class="lbl" text-anchor="middle">平衡</text>
              <!-- Time history trace -->
              <path [attr.d]="part2Trace()" fill="none"
                stroke="var(--accent)" stroke-width="1.5" opacity="0.5" />
            </svg>
          </div>
          <p class="part-desc">
            二階線性 ODE——彈簧、擺、RLC 電路。特徵方程、受迫振動、共振現象。
            最後用 Laplace 變換統一各種受迫問題。
          </p>
          <div class="topic-pills">
            <span class="pill">特徵方程</span>
            <span class="pill">阻尼振盪</span>
            <span class="pill">共振</span>
            <span class="pill">Laplace 變換</span>
          </div>
        </div>
      </div>

      <!-- Part III -->
      <div class="part-card">
        <div class="part-head">
          <span class="part-label">Part III · Ch8-10</span>
          <h3 class="part-title">相平面與混沌</h3>
        </div>
        <div class="part-body">
          <div class="part-anim">
            <svg viewBox="-110 -60 220 120" class="svg-anim">
              <!-- Axes -->
              <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="0" y1="-50" x2="0" y2="50" stroke="var(--border-strong)" stroke-width="1" />
              <!-- Spiral (limit cycle) -->
              <path [attr.d]="part3Spiral()" fill="none"
                stroke="var(--text-muted)" stroke-width="1" opacity="0.4" />
              <!-- Moving point tracing spiral -->
              <circle [attr.cx]="part3Dot().x" [attr.cy]="part3Dot().y" r="4"
                fill="var(--accent)" stroke="white" stroke-width="1.5" />
              <!-- Sample trajectory -->
              <path [attr.d]="part3Traj()" fill="none" stroke="var(--accent)" stroke-width="2"
                opacity="0.85" />
            </svg>
          </div>
          <p class="part-desc">
            把 ODE 系統畫在「相平面」上——這是現代動力系統的語言。
            平衡點分類、極限環、分岔、混沌（Lorenz 吸引子等）。
          </p>
          <div class="topic-pills">
            <span class="pill">相平面</span>
            <span class="pill">平衡點分類</span>
            <span class="pill">極限環</span>
            <span class="pill">混沌</span>
          </div>
        </div>
      </div>

      <!-- Part IV -->
      <div class="part-card">
        <div class="part-head">
          <span class="part-label">Part IV · Ch11-13</span>
          <h3 class="part-title">偏微分方程：空間與時間</h3>
        </div>
        <div class="part-body">
          <div class="part-anim">
            <svg viewBox="-10 -60 220 120" class="svg-anim">
              <!-- Heat diffusion bar: a horizontal strip colored by temperature -->
              <defs>
                <linearGradient id="heatGrad" x1="0%" x2="100%">
                  <stop offset="0%" [attr.stop-color]="'hsl(220, 40%, 45%)'" />
                  <stop [attr.offset]="part4Progress() + '%'" [attr.stop-color]="'hsl(10, 70%, 55%)'" />
                  <stop offset="100%" [attr.stop-color]="'hsl(220, 40%, 45%)'" />
                </linearGradient>
              </defs>

              <rect x="5" y="-15" width="200" height="30" fill="url(#heatGrad)" rx="3"
                opacity="0.55" />
              <rect x="5" y="-15" width="200" height="30" fill="none"
                stroke="var(--border-strong)" stroke-width="1" rx="3" />

              <!-- Temperature profile above -->
              <path [attr.d]="part4Profile()" fill="none" stroke="var(--accent)" stroke-width="2" />
              <line x1="5" y1="-40" x2="205" y2="-40"
                stroke="var(--border)" stroke-width="0.5" stroke-dasharray="2 2" />
              <text x="210" y="-37" class="lbl">u=1</text>
              <text x="210" y="-13" class="lbl">初始</text>
              <text x="210" y="34" class="lbl">t</text>
            </svg>
          </div>
          <p class="part-desc">
            從 ODE（只有 t）推廣到 PDE（t 與 x）。熱擴散方程（溫度如何散開）、
            波方程（振動如何傳播）、Laplace 方程（穩態）。分離變數法 + Fourier 級數。
          </p>
          <div class="topic-pills">
            <span class="pill">熱方程</span>
            <span class="pill">波方程</span>
            <span class="pill">分離變數</span>
            <span class="pill">Fourier 級數</span>
          </div>
        </div>
      </div>
    </div>

    <app-prose-block>
      <p class="final-note">
        每一個 Part 都會回到這章的同一個核心：<strong>寫下方程，看它在空間中流動，找出它的解</strong>。
        只是空間會從 1D 升到 n-D，方程從線性升到非線性，工具從幾何升到代數，從符號升到數值。
      </p>
      <p class="final-note">
        準備好了嗎？從下一章開始，我們就要學會怎麼<strong>真正把方程解出來</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .roadmap {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin: 20px 0 28px;
    }

    .part-card {
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--bg-surface);
      overflow: hidden;
    }

    .part-head {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      background: var(--accent-10);
    }

    .part-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent);
      text-transform: uppercase;
    }

    .part-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin: 4px 0 0;
    }

    .part-body {
      padding: 16px 18px;
    }

    .part-anim {
      padding: 10px;
      background: var(--bg);
      border-radius: 10px;
      border: 1px solid var(--border);
      margin-bottom: 12px;
    }

    .svg-anim {
      width: 100%;
      display: block;
      height: auto;
    }

    .lbl {
      font-size: 9px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .part-desc {
      margin: 0 0 10px;
      font-size: 14px;
      line-height: 1.65;
      color: var(--text-secondary);
    }

    .topic-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .pill {
      font-size: 11px;
      padding: 3px 10px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-secondary);
    }

    .final-note {
      font-size: 15px;
      line-height: 1.75;
    }
  `,
})
export class DeCh1RoadmapComponent implements OnInit, OnDestroy {
  private rafId: number | null = null;
  readonly tick = signal(0);

  ngOnInit(): void {
    const start = performance.now();
    const loop = () => {
      const elapsed = (performance.now() - start) / 1000;
      this.tick.set(elapsed);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  // Part I: y(t) = ... some exp-style curve flowing left to right
  slopeAt(x: number, y: number): number {
    return -y * 0.02;
  }

  readonly part1Curve = computed(() => {
    const t = this.tick();
    const n = 60;
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const px = i * 3.5;
      // damped oscillation that slides with time
      const y = 30 * Math.sin(0.04 * px + t) * Math.exp(-0.004 * px);
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${(-y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly part1Dot = computed(() => {
    const t = this.tick();
    const px = ((t * 40) % 210);
    const y = 30 * Math.sin(0.04 * px + t) * Math.exp(-0.004 * px);
    return { x: px, y: -y };
  });

  // Part II: spring oscillation, mass x-position, and history trace
  readonly part2Mass = computed(() => {
    const t = this.tick();
    return 120 + 50 * Math.sin(2 * t) * Math.exp(-0.2 * (t % 6));
  });

  readonly part2Trace = computed(() => {
    // show last 5s of oscillation on a tiny timeline under axis
    const t = this.tick();
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const tau = t - (60 - i) * 0.05;
      if (tau < 0) continue;
      const mass = 50 * Math.sin(2 * tau) * Math.exp(-0.2 * (tau % 6));
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${(10 + i * 3).toFixed(1)} ${(40 + mass * 0.1).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  // Part III: limit cycle spiral
  readonly part3Spiral = computed(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const theta = i * 0.1;
      const r = 8 + 30 * (1 - Math.exp(-theta * 0.08));
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta) * 0.45;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly part3Traj = computed(() => {
    const t = this.tick();
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const theta = (t * 1.5 - i * 0.12);
      if (theta < 0) continue;
      const r = 8 + 30 * (1 - Math.exp(-theta * 0.08));
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta) * 0.45;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly part3Dot = computed(() => {
    const theta = this.tick() * 1.5;
    const r = 8 + 30 * (1 - Math.exp(-theta * 0.08));
    return {
      x: r * Math.cos(theta),
      y: r * Math.sin(theta) * 0.45,
    };
  });

  // Part IV: heat diffusion
  readonly part4Progress = computed(() => {
    const t = this.tick();
    const phase = (t * 0.3) % 3;
    return 30 + 40 * Math.abs(Math.sin(phase * Math.PI / 3));
  });

  readonly part4Profile = computed(() => {
    const t = this.tick();
    // heat equation: initial bump diffuses
    const pts: string[] = [];
    const sigma2 = 0.02 + 0.04 * ((t * 0.3) % 3);
    const amp = 1 / Math.sqrt(sigma2);
    const norm = 1 / Math.sqrt(0.02) * 22; // baseline for scaling
    for (let i = 0; i <= 80; i++) {
      const xn = i / 80;
      const val = amp * Math.exp(-((xn - 0.5) * (xn - 0.5)) / sigma2);
      const x = 5 + xn * 200;
      const y = -15 - (val / norm) * 22;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${Math.max(-44, y).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
