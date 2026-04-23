import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch5-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從 F=ma 到二階 ODE" subtitle="§5.1">
      <p>
        Part I 處理的一階 ODE，變化率只跟「現在」有關。但<strong>物理的基本定律 Newton 第二定律</strong>說：
      </p>
      <div class="centered-eq big">F = m · a = m · d²y/dt²</div>
      <p>
        一旦力是關於位置或速度的函數，方程就<strong>自然出現二階導數</strong>。
      </p>
      <p class="key-idea">
        <strong>彈簧的標準例子：</strong>
        質量 m 連著彈簧，彈簧力 = −ky（Hooke 定律），彈簧力 + 可能的阻尼力 −cy′ = m·y″。整理：
      </p>
      <div class="centered-eq big">m·y″ + c·y′ + k·y = 0</div>
      <p>
        這就是接下來整個 Part II 的主角。它看起來比 Part I 一階 ODE 只多了個 y″，但<strong>行為豐富得多</strong>——
        振盪、共振、節拍、穩定／不穩定都從這條方程冒出來。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="二階 ODE 需要兩個初值——為什麼？拉滑桿看兩個 IC 如何塑造完全不同的解">
      <div class="two-ic-wrap">
        <div class="scene-col">
          <div class="col-head">物理情境</div>
          <svg viewBox="-150 -100 300 200" class="scene-svg">
            <!-- Wall (left) -->
            <line x1="-140" y1="-60" x2="-140" y2="60" stroke="var(--text)" stroke-width="2.5" />
            @for (i of [0, 1, 2, 3, 4]; track i) {
              <line [attr.x1]="-140" [attr.y1]="-55 + i * 25"
                [attr.x2]="-150" [attr.y2]="-45 + i * 25"
                stroke="var(--text)" stroke-width="1" />
            }

            <!-- Rest position marker -->
            <line x1="30" y1="-25" x2="30" y2="25"
              stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
            <text x="30" y="-32" class="lbl" text-anchor="middle">平衡</text>

            <!-- Spring (drawn as zigzag) -->
            <polyline [attr.points]="springPoints()"
              fill="none" stroke="var(--text-muted)" stroke-width="1.5" />

            <!-- Mass -->
            <rect [attr.x]="massX() - 18" y="-18" width="36" height="36" rx="4"
              fill="var(--accent)" opacity="0.88" />
            <!-- Velocity indicator -->
            @if (Math.abs(v0()) > 0.1) {
              <line [attr.x1]="massX()" y1="0"
                [attr.x2]="massX() + v0() * 20" y2="0"
                stroke="#5ca878" stroke-width="2.2"
                marker-end="url(#vel-tip)" />
              <text [attr.x]="massX() + v0() * 20 + 4" y="-4" class="vlab">
                v = {{ v0().toFixed(1) }}
              </text>
            }

            <!-- Force arrow on mass (equilibrium restoration) -->
            @if (Math.abs(y0()) > 0.05) {
              <line [attr.x1]="massX()" y1="30"
                [attr.x2]="massX() + -y0() * 12" y2="30"
                stroke="#c87b5e" stroke-width="2"
                marker-end="url(#f-tip)" />
              <text [attr.x]="massX() + -y0() * 12 / 2" y="44" class="flab" text-anchor="middle">
                F = -ky
              </text>
            }

            <defs>
              <marker id="vel-tip" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <polygon points="0 0, 5 2.5, 0 5" fill="#5ca878" />
              </marker>
              <marker id="f-tip" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <polygon points="0 0, 5 2.5, 0 5" fill="#c87b5e" />
              </marker>
            </defs>

            <!-- Position readout -->
            <text x="-140" y="-74" class="readout">
              y(t) = {{ position().toFixed(2) }},  v(t) = {{ velocity().toFixed(2) }}
            </text>
          </svg>
        </div>

        <div class="chart-col">
          <div class="col-head">y(t) 解曲線</div>
          <svg viewBox="-10 -80 300 160" class="chart-svg">
            <line x1="0" y1="0" x2="280" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            <text x="284" y="4" class="ax">t</text>
            <text x="-4" y="-72" class="ax">y</text>

            @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
              <line x1="0" [attr.y1]="-g * 20" x2="280" [attr.y2]="-g * 20"
                stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            }

            <!-- Solution curve -->
            <path [attr.d]="solutionPath()" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />

            <!-- Current time marker -->
            <line [attr.x1]="t() * 35" y1="-70" [attr.x2]="t() * 35" y2="70"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
            <circle [attr.cx]="t() * 35" [attr.cy]="-position() * 20" r="4"
              fill="var(--accent)" stroke="white" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">初始位置 y(0)</span>
          <input type="range" min="-2.5" max="2.5" step="0.05"
            [value]="y0()" (input)="y0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ y0().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">初始速度 v(0)</span>
          <input type="range" min="-3" max="3" step="0.05"
            [value]="v0()" (input)="v0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ v0().toFixed(2) }}</span>
        </div>

        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <div class="sl-inline">
            <span class="sl-lab">t</span>
            <input type="range" min="0" max="8" step="0.02"
              [value]="t()" (input)="t.set(+$any($event).target.value)" />
            <span class="sl-val">{{ t().toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <div class="ic-note">
        <strong>注意這個關鍵現象：</strong>
        同一個方程 <code>y″ + ω²y = 0</code>（沒阻尼），
        只要 <code>y(0)</code> 跟 <code>v(0)</code> 不同，得到的解就完全不同。
        <strong>兩個初值才能唯一決定解</strong>——這是二階 ODE 的根本特徵。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        為什麼二階需要<strong>兩個</strong>初值？直覺：把 y″ = f 對 t 積分一次得到 y′（加上常數 C₁），再積一次得到 y（加上常數 C₂）。
        兩個常數、兩個資訊才能鎖住。
      </p>
      <p>
        從幾何看：一階 ODE 的狀態是 <code>(t, y)</code>——相空間 1 維。
        二階 ODE 狀態是 <code>(t, y, v)</code>——相空間 2 維。
        多出那一維就是「速度」，它跟位置<em>不獨立</em>（因為 v = y′），但初始時你得知道它是多少。
      </p>
      <ul>
        <li><strong>所有牛頓第二定律的問題都是二階</strong>：抽開、丟球、行星、彈簧、鐘擺、電荷振盪——全部。</li>
        <li><strong>兩個初值</strong>：位置 y(0) + 速度 y′(0)。工程上常寫成「初位置 + 初速度」。</li>
        <li><strong>狀態的幾何</strong>：(y, v) 平面就是<strong>相空間</strong>，§5.6 會細看。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        一旦考慮力跟慣性，ODE 就變成二階。
        二階方程需要兩個初值才能鎖定唯一解——
        接下來六節是逐步解析這類方程的行為、結構、物理意義。
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

    .two-ic-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    @media (max-width: 640px) {
      .two-ic-wrap { grid-template-columns: 1fr; }
    }

    .scene-col, .chart-col {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .col-head {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 8px;
      text-align: center;
    }

    .scene-svg, .chart-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .lbl, .vlab, .flab, .readout {
      font-size: 10px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .vlab { fill: #5ca878; font-weight: 700; }
    .flab { fill: #c87b5e; font-weight: 700; }

    .readout { font-size: 11px; fill: var(--text); }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .sl, .sl-inline {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sl { margin-bottom: 8px; }

    .sl-inline { flex: 1; min-width: 160px; }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 90px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl-inline .sl-lab { min-width: 20px; }

    .sl input, .sl-inline input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .row {
      display: flex;
      gap: 8px;
      margin-top: 6px;
      align-items: center;
      flex-wrap: wrap;
    }

    .play-btn, .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn { background: transparent; color: var(--accent); }
    .play-btn:hover, .reset-btn:hover { opacity: 0.85; }

    .ic-note {
      padding: 12px 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .ic-note strong { color: var(--accent); }
  `,
})
export class DeCh5IntroComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly y0 = signal(1.5);
  readonly v0 = signal(0);
  readonly t = signal(0);
  readonly playing = signal(false);

  private readonly OMEGA = 1.5;
  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.0;
        if (newT >= 8) {
          this.t.set(8);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  togglePlay(): void {
    if (this.t() >= 7.95) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  /**
   * Undamped SHM solution: y(t) = y0·cos(ωt) + (v0/ω)·sin(ωt)
   */
  readonly position = computed(() => {
    const omega = this.OMEGA;
    return this.y0() * Math.cos(omega * this.t()) +
      (this.v0() / omega) * Math.sin(omega * this.t());
  });

  readonly velocity = computed(() => {
    const omega = this.OMEGA;
    return -this.y0() * omega * Math.sin(omega * this.t()) +
      this.v0() * Math.cos(omega * this.t());
  });

  /**
   * Mass x-position in SVG coords. Equilibrium at x=30. 1 y-unit = 20 px horizontal displacement.
   */
  readonly massX = computed(() => 30 + this.position() * 20);

  readonly springPoints = computed(() => {
    // Zigzag between (-140, 0) and (massX, 0)
    const xStart = -140;
    const xEnd = this.massX() - 18;
    const segments = 14;
    const amplitude = 5;
    const parts: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = xStart + (i / segments) * (xEnd - xStart);
      const y = (i > 0 && i < segments) ? (i % 2 === 0 ? -amplitude : amplitude) : 0;
      parts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return parts.join(' ');
  });

  readonly solutionPath = computed(() => {
    const omega = this.OMEGA;
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * 8;
      const y = this.y0() * Math.cos(omega * tt) +
        (this.v0() / omega) * Math.sin(omega * tt);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * 35).toFixed(1)} ${(-y * 20).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
