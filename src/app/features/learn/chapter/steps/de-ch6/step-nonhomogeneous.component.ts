import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const M = 1;
const C = 0.4;
const K = 4;      // ω₀ = 2
const F0 = 1.5;
const OMEGA0 = Math.sqrt(K / M);
const ZETA = C / (2 * Math.sqrt(M * K));

/**
 * For m·y'' + c·y' + k·y = F0 cos(Ω t), with Ω ≠ ω0, under damping:
 * Particular solution: y_p = A·cos(Ωt) + B·sin(Ωt)
 *   where
 *   A = F0 (k - mΩ²) / D,  B = F0 (cΩ) / D,   D = (k-mΩ²)² + (cΩ)²
 * Homogeneous: underdamped, y_h = e^(αt)(C1 cos β t + C2 sin β t)
 *   α = -c/(2m), β = √(4mk - c²)/(2m)
 */

function solveFull(Omega: number, t: number, y0: number, v0: number): {
  y: number; yh: number; yp: number; v: number;
} {
  const alpha = -C / (2 * M);
  const beta = Math.sqrt(4 * M * K - C * C) / (2 * M);
  const D = (K - M * Omega * Omega) * (K - M * Omega * Omega) + (C * Omega) * (C * Omega);
  const A = (F0 * (K - M * Omega * Omega)) / D;
  const B = (F0 * C * Omega) / D;

  // Particular
  const yp = A * Math.cos(Omega * t) + B * Math.sin(Omega * t);
  const yp_prime = -A * Omega * Math.sin(Omega * t) + B * Omega * Math.cos(Omega * t);

  // Apply initial conditions: y(0) = y0, y'(0) = v0
  // y(0) = C1 + A = y0 → C1 = y0 - A
  // y'(0) = αC1 + βC2 + yp_prime(0) = v0 → C2 = (v0 - α·C1 - B·Omega) / β
  const C1 = y0 - A;
  const C2 = (v0 - alpha * C1 - B * Omega) / beta;

  const eAt = Math.exp(alpha * t);
  const yh = eAt * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t));
  const yh_prime =
    eAt *
    (alpha * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t)) +
      beta * (-C1 * Math.sin(beta * t) + C2 * Math.cos(beta * t)));

  return {
    y: yh + yp,
    yh,
    yp,
    v: yh_prime + yp_prime,
  };
}

const PX_PER_T = 24;
const PX_PER_Y = 35;

@Component({
  selector: 'app-de-ch6-nonhom',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="非齊次方程：加入外力" subtitle="§6.1">
      <p>
        上一章的彈簧系統 <code>m·y″ + c·y′ + k·y = 0</code> 是<strong>孤立的</strong>——
        沒有外在干擾，系統只會慢慢衰退到靜止。但真實世界裡，彈簧常常被推、被拉、被震動。
      </p>
      <p>
        加入外力 F(t) 後變成<strong>非齊次方程</strong>：
      </p>
      <div class="centered-eq big">m·y″ + c·y′ + k·y = F(t)</div>
      <p class="key-idea">
        <strong>解的結構定理</strong>：非齊次線性 ODE 的通解 = <em>齊次方程的通解</em> + <em>非齊次方程的任一特解</em>。
      </p>
      <div class="centered-eq">y(t) = y_h(t) + y_p(t)</div>
      <ul>
        <li><strong>齊次解 y_h</strong>：包含兩個任意常數（由初值鎖定）。對有阻尼系統，這部分<strong>會隨時間衰退</strong>——叫「瞬態（transient）」。</li>
        <li><strong>特解 y_p</strong>：配合外力的模式。長期看，系統會<strong>被 y_p「帶」過去</strong>——叫「穩態（steady state）」。</li>
      </ul>
      <p>
        這個分解很深刻：<strong>系統的「性格」（y_h）會淡化，剩下的是外力「命令」出來的行為（y_p）</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖驅動頻率 Ω 與時間 t：看 y = y_h + y_p 的分解">
      <div class="chart-wrap">
        <div class="chart-title">
          解的分解：y(t) = y_h(t)（瞬態）+ y_p(t)（穩態）
        </div>
        <svg viewBox="-10 -90 400 210" class="chart-svg">
          <!-- Axes -->
          <line x1="0" y1="0" x2="380" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-80" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="1" />
          <text x="384" y="4" class="ax">t</text>
          <text x="-4" y="-82" class="ax">y</text>

          <!-- Y ticks -->
          @for (g of [-2, -1, 1, 2]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="380" [attr.y2]="-g * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }

          <!-- y_h (transient, dashed gray) -->
          <path [attr.d]="yhPath()" fill="none"
            stroke="#8a9aa8" stroke-width="1.6" stroke-dasharray="4 3" opacity="0.85" />
          <!-- y_p (steady state, blue) -->
          <path [attr.d]="ypPath()" fill="none"
            stroke="#5ca878" stroke-width="1.8" opacity="0.85" />
          <!-- Full y (thick accent) -->
          <path [attr.d]="yPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.4" />

          <!-- Playhead -->
          <line [attr.x1]="t() * PX_PER_T" y1="-80" [attr.x2]="t() * PX_PER_T" y2="110"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
          <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-currentState().y * PX_PER_Y" r="5"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />

          <!-- Transient "fade" zone indicator -->
          @if (transientBoundary() > 0) {
            <rect x="0" y="-80"
              [attr.width]="transientBoundary() * PX_PER_T"
              height="190" fill="#8a9aa8" opacity="0.06" />
            <text [attr.x]="transientBoundary() * PX_PER_T / 2" y="-68"
              class="zone-lab" text-anchor="middle" style="fill: #8a9aa8">
              瞬態區（y_h 還顯著）
            </text>
            <text [attr.x]="transientBoundary() * PX_PER_T + 10" y="-68"
              class="zone-lab" style="fill: #5ca878">
              → 穩態區（~ y_p）
            </text>
          }
        </svg>

        <div class="legend">
          <span class="leg"><span class="leg-dot dashed" style="color:#8a9aa8"></span>y_h (瞬態，衰退)</span>
          <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>y_p (穩態，隨 F)</span>
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>y = y_h + y_p</span>
        </div>
      </div>

      <!-- Spring scene -->
      <div class="scene-wrap">
        <div class="scene-title">彈簧—質量 + 週期性外力（紅箭頭）</div>
        <svg viewBox="-160 -55 320 110" class="scene-svg">
          <!-- Wall -->
          <line x1="-150" y1="-35" x2="-150" y2="35" stroke="var(--text)" stroke-width="2.5" />

          <!-- Equilibrium -->
          <line x1="0" y1="-22" x2="0" y2="22"
            stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />

          <!-- Spring -->
          <polyline [attr.points]="springPoints()"
            fill="none" stroke="var(--text-muted)" stroke-width="1.5" />

          <!-- Mass -->
          <rect [attr.x]="currentState().y * 60 - 18" y="-18" width="36" height="36" rx="4"
            fill="var(--accent)" opacity="0.88" />

          <!-- Driving force arrow (alternates with cos(Ωt)) -->
          @if (Math.abs(forceDisplay()) > 0.05) {
            <line [attr.x1]="currentState().y * 60 + 18 * forceDir()"
              y1="0"
              [attr.x2]="currentState().y * 60 + 18 * forceDir() + forceDisplay() * 22"
              y2="0"
              stroke="#c87b5e" stroke-width="2.5"
              marker-end="url(#f-tip)" />
          }
          <defs>
            <marker id="f-tip" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill="#c87b5e" />
            </marker>
          </defs>
          <text x="0" y="-40" class="force-lab" text-anchor="middle">
            F(t) = F₀ · cos(Ω·t) = {{ currentForce().toFixed(2) }}
          </text>
        </svg>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>

        <div class="sl">
          <span class="sl-lab">驅動頻率 Ω</span>
          <input type="range" min="0.3" max="4.5" step="0.02"
            [value]="Omega()" (input)="Omega.set(+$any($event).target.value)" />
          <span class="sl-val">{{ Omega().toFixed(2) }}</span>
        </div>

        <div class="presets">
          <button class="pre" (click)="Omega.set(1.0)">Ω = 1.0（低於 ω₀）</button>
          <button class="pre" (click)="Omega.set(OMEGA0)">Ω = ω₀ = 2.0（共振附近）</button>
          <button class="pre" (click)="Omega.set(3.5)">Ω = 3.5（高於 ω₀）</button>
        </div>

        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" max="16" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }} s</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">自然頻率 ω₀</span>
            <strong>{{ OMEGA0.toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">阻尼比 ζ</span>
            <strong>{{ ZETA.toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">y_h 已衰退到</span>
            <strong>{{ (transientFraction() * 100).toFixed(1) }}%</strong>
          </div>
          <div class="ro">
            <span class="ro-k">|y_p| 振幅</span>
            <strong>{{ ypAmplitude().toFixed(3) }}</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        重要觀察：
      </p>
      <ul>
        <li><strong>瞬態區（約 0 到 5/ζω₀）</strong>：y_h 尚未衰退完，解裡仍有「初值記憶」。</li>
        <li><strong>穩態區</strong>：y_h ≈ 0，y ≈ y_p。系統「忘記」初值，只剩下對外力的響應。</li>
        <li><strong>穩態 y_p 的頻率就是 Ω</strong>（驅動頻率），而不是 ω₀（自然頻率）。</li>
        <li><strong>Ω 接近 ω₀ 時，y_p 的振幅特別大</strong>——這就是共振，§6.3 和 §6.4 會深入。</li>
      </ul>
      <p>
        這個「瞬態 + 穩態」的分離是設計工程系統時的核心概念：
        <strong>設計師通常只關心穩態，因為瞬態很快消失</strong>。
        這個概念你在 Ch2 §2.3 的線性一階 + 積分因子時就已經遇過（「特解 + Ce^(-∫p dt)」），只是這裡升級到二階。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        非齊次方程 = 齊次方程 + 外力。
        解 = 瞬態（y_h，會衰退）+ 穩態（y_p，跟隨外力）。
        下一節看怎麼<strong>找出 y_p</strong>——經典技巧叫「未定係數法」。
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

    .chart-wrap, .scene-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .chart-title, .scene-title {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-svg, .scene-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .zone-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    .force-lab {
      font-size: 11px;
      fill: #c87b5e;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }

    .legend {
      display: flex;
      gap: 14px;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
      justify-content: center;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .leg-dot {
      display: inline-block;
      width: 12px;
      height: 3px;
      border-radius: 2px;
    }

    .leg-dot.dashed {
      background-image: linear-gradient(to right, currentColor 50%, transparent 50%);
      background-size: 4px 3px;
      background-color: transparent !important;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
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

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 90px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 60px;
      text-align: right;
    }

    .presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .pre {
      font: inherit;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 5px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .pre:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 6px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed var(--border);
    }

    .ro {
      padding: 6px 10px;
      background: var(--bg);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .ro-k { color: var(--text-muted); }

    .ro strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class DeCh6NonhomComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly OMEGA0 = OMEGA0;
  readonly ZETA = ZETA;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;

  readonly Omega = signal(2.0);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;
  private readonly T_MAX = 16;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.2;
        if (newT >= this.T_MAX) {
          this.t.set(this.T_MAX);
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
    if (this.t() >= this.T_MAX - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  readonly currentState = computed(() =>
    solveFull(this.Omega(), this.t(), 1.5, 0)
  );

  readonly currentForce = computed(() => F0 * Math.cos(this.Omega() * this.t()));

  forceDir(): number {
    // Spring direction of push
    return this.currentForce() >= 0 ? 1 : -1;
  }

  forceDisplay(): number {
    return this.currentForce();
  }

  /**
   * 5/(ζω₀) is roughly when transient decays to ~e^(-5) ≈ 1% of initial.
   */
  readonly transientBoundary = computed(() => {
    return Math.min(this.T_MAX, 5 / (ZETA * OMEGA0));
  });

  readonly transientFraction = computed(() => {
    // fraction remaining: e^(αt) where α = -c/(2m)
    const alpha = -C / (2 * M);
    return Math.exp(alpha * this.t());
  });

  readonly ypAmplitude = computed(() => {
    const Omega = this.Omega();
    const D = (K - M * Omega * Omega) * (K - M * Omega * Omega) + (C * Omega) * (C * Omega);
    return F0 / Math.sqrt(D);
  });

  buildPath(kind: 'y' | 'yh' | 'yp'): string {
    const pts: string[] = [];
    const n = 400;
    const Omega = this.Omega();
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * this.T_MAX;
      const s = solveFull(Omega, tt, 1.5, 0);
      const val = kind === 'y' ? s.y : kind === 'yh' ? s.yh : s.yp;
      const yc = Math.max(-2.5, Math.min(2.5, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly yPath = computed(() => this.buildPath('y'));
  readonly yhPath = computed(() => this.buildPath('yh'));
  readonly ypPath = computed(() => this.buildPath('yp'));

  readonly springPoints = computed(() => {
    const xStart = -150;
    const xEnd = this.currentState().y * 60 - 18;
    const segments = 14;
    const amp = 5;
    const parts: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = xStart + (i / segments) * (xEnd - xStart);
      const yy = (i > 0 && i < segments) ? (i % 2 === 0 ? -amp : amp) : 0;
      parts.push(`${x.toFixed(1)},${yy.toFixed(1)}`);
    }
    return parts.join(' ');
  });
}
