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
const K = 4;

function solve(c: number, t: number, y0 = 1.2, v0 = 0): { y: number; v: number } {
  const disc = c * c - 4 * M * K;
  if (Math.abs(disc) < 1e-6) {
    const r = -c / (2 * M);
    const C1 = y0;
    const C2 = v0 - r * y0;
    const exp = Math.exp(r * t);
    const y = (C1 + C2 * t) * exp;
    const v = C2 * exp + (C1 + C2 * t) * r * exp;
    return { y, v };
  } else if (disc > 0) {
    const s = Math.sqrt(disc);
    const r1 = (-c - s) / (2 * M);
    const r2 = (-c + s) / (2 * M);
    const C1 = (y0 * r2 - v0) / (r2 - r1);
    const C2 = y0 - C1;
    const y = C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
    const v = C1 * r1 * Math.exp(r1 * t) + C2 * r2 * Math.exp(r2 * t);
    return { y, v };
  } else {
    const alpha = -c / (2 * M);
    const beta = Math.sqrt(-disc) / (2 * M);
    const C1 = y0;
    const C2 = (v0 - alpha * y0) / beta;
    const eAlphaT = Math.exp(alpha * t);
    const cosBt = Math.cos(beta * t);
    const sinBt = Math.sin(beta * t);
    const y = eAlphaT * (C1 * cosBt + C2 * sinBt);
    const v = eAlphaT * (alpha * (C1 * cosBt + C2 * sinBt) + (-C1 * beta * sinBt + C2 * beta * cosBt));
    return { y, v };
  }
}

function energy(y: number, v: number): { KE: number; PE: number; total: number } {
  const KE = 0.5 * M * v * v;
  const PE = 0.5 * K * y * y;
  return { KE, PE, total: KE + PE };
}

const PX_PER_T = 45;
const PX_PER_E = 45;

@Component({
  selector: 'app-de-ch5-energy',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="能量：守恆與耗散" subtitle="§5.5">
      <p>
        彈簧系統的總能量 = 動能（KE）+ 位能（PE）：
      </p>
      <div class="centered-eq big">E = (1/2)·m·v² + (1/2)·k·y²</div>
      <p>
        對 t 微分（鏈鎖律）：
      </p>
      <div class="centered-eq">dE/dt = m·v·v′ + k·y·y′ = v·(m·y″ + k·y)</div>
      <p>
        <strong>無阻尼情況</strong>（c=0）：m·y″ + k·y = 0，所以 dE/dt = 0 → <strong>能量嚴格守恆</strong>。
      </p>
      <p>
        <strong>有阻尼</strong>（c&gt;0）：把原方程 m·y″ + c·y′ + k·y = 0 代入：
      </p>
      <div class="centered-eq">dE/dt = v · (−c·y′) = −c·v² ≤ 0</div>
      <p class="key-idea">
        能量的流失速率正好等於「<strong>阻尼力乘速度</strong>」。這就是<strong>熱力學第二定律的微觀起源</strong>——
        宏觀能量總是會流失到微觀振動（也就是熱）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖阻尼 c：看動能、位能、總能量三條曲線的變化">
      <!-- Energy vs time chart -->
      <div class="chart-wrap">
        <div class="chart-title">KE、PE、總能 E 隨時間</div>
        <svg viewBox="-10 -140 380 180" class="chart-svg">
          <line x1="0" y1="0" x2="360" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-130" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <text x="364" y="4" class="ax">t</text>
          <text x="-4" y="-132" class="ax">E</text>

          <!-- Grid -->
          @for (g of [1, 2, 3]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_E" x2="360" [attr.y2]="-g * PX_PER_E"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            <text x="-4" [attr.y]="-g * PX_PER_E + 3" class="tick">{{ g }}</text>
          }

          <!-- Initial total energy reference line -->
          <line x1="0" [attr.y1]="-initialEnergy() * PX_PER_E"
            x2="360" [attr.y2]="-initialEnergy() * PX_PER_E"
            stroke="#5ca878" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.5" />
          <text x="362" [attr.y]="-initialEnergy() * PX_PER_E + 3" class="init-e" text-anchor="end">
            E₀ = {{ initialEnergy().toFixed(2) }}
          </text>

          <!-- PE curve -->
          <path [attr.d]="pePath()" fill="none"
            stroke="#c87b5e" stroke-width="1.8" opacity="0.85" />
          <!-- KE curve -->
          <path [attr.d]="kePath()" fill="none"
            stroke="#5a8aa8" stroke-width="1.8" opacity="0.85" />
          <!-- Total energy curve -->
          <path [attr.d]="totalPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.5" />

          <!-- Playhead -->
          <line [attr.x1]="t() * PX_PER_T" y1="-130" [attr.x2]="t() * PX_PER_T" y2="20"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.35" />
        </svg>
        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:#c87b5e"></span>位能 PE = ½ky²</span>
          <span class="leg"><span class="leg-dot" style="background:#5a8aa8"></span>動能 KE = ½mv²</span>
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>總能 E</span>
        </div>
      </div>

      <!-- Instant bar chart: energy split at current t -->
      <div class="bars-wrap">
        <div class="bar-title">目前 t = {{ t().toFixed(2) }} 時的能量分配</div>
        <div class="bars">
          <div class="bar-stack">
            <div class="bar-seg pe"
              [style.height.%]="pePercent()">
              <span>PE {{ currentPE().toFixed(2) }}</span>
            </div>
            <div class="bar-seg ke"
              [style.height.%]="kePercent()">
              <span>KE {{ currentKE().toFixed(2) }}</span>
            </div>
          </div>
          <div class="bar-meta">
            <div>總能 = <strong>{{ currentTotal().toFixed(2) }}</strong></div>
            <div class="meta-sub">
              相對初值：{{ (currentTotal() / initialEnergy() * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
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
          <span class="sl-lab">阻尼 c</span>
          <input type="range" min="0" max="4" step="0.02"
            [value]="c()" (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c().toFixed(2) }}</span>
        </div>

        <div class="presets">
          <button class="pre" (click)="c.set(0)">c = 0（守恆）</button>
          <button class="pre" (click)="c.set(0.3)">c = 0.3（輕阻尼）</button>
          <button class="pre" (click)="c.set(1)">c = 1</button>
          <button class="pre" (click)="c.set(4)">c = 4（臨界）</button>
        </div>

        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" max="8" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }} s</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察 c = 0 的情況：KE 跟 PE 互相鎖相位，<strong>一個最大時另一個是零</strong>，總和嚴格為常數。
        就像蹺蹺板——能量在位能（彈簧繃緊）跟動能（物體高速）間往返。
      </p>
      <p>
        加入阻尼後，總能量單調下降。下降速率 = c·v²——這個量永遠非負，所以 E 只會少不會多。
        最終，系統靜止在平衡點，KE = PE = 0。
      </p>
      <ul>
        <li><strong>能量守恆</strong>是數學對稱性（時間平移對稱）的後果——這叫 Noether 定理。線性齊次 ODE 有太多結構。</li>
        <li><strong>耗散率 = c·v²</strong>：速度越大、阻尼越強 → 耗能越快。這跟「磁阻尼器」、「流體黏滯阻尼」的物理完全吻合。</li>
        <li><strong>這跟第一章的同構</strong>：冷卻、RC 電路、混合槽都可以用「能量流失」的觀點重新詮釋。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        把 ODE 從「位置 y(t)」的視角轉換到「能量 E(t)」的視角，讓系統的本質顯露出來——
        無阻尼系統在能量等位線上繞圈，有阻尼系統不斷下滑。
        下一節的相平面會把這個轉換做得更徹底。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 20px; padding: 16px; }

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

    .chart-wrap, .bars-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .chart-title, .bar-title {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: end;
      font-family: 'JetBrains Mono', monospace;
    }

    .init-e {
      font-size: 10px;
      fill: #5ca878;
      font-family: 'JetBrains Mono', monospace;
    }

    .legend {
      display: flex;
      gap: 12px;
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

    .bars {
      display: flex;
      gap: 20px;
      align-items: stretch;
      padding: 12px 20px;
    }

    .bar-stack {
      width: 70px;
      height: 140px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg-surface);
      display: flex;
      flex-direction: column-reverse;
      overflow: hidden;
    }

    .bar-seg {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      transition: height 0.1s;
    }

    .bar-seg.pe { background: #c87b5e; }
    .bar-seg.ke { background: #5a8aa8; }

    .bar-seg span {
      white-space: nowrap;
    }

    .bar-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      font-size: 14px;
      color: var(--text);
    }

    .bar-meta strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
    }

    .meta-sub {
      font-size: 11px;
      color: var(--text-muted);
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
      min-width: 60px;
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
  `,
})
export class DeCh5EnergyComponent implements OnInit, OnDestroy {
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_E = PX_PER_E;
  readonly c = signal(0.3);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.2;
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

  readonly initialEnergy = computed(() => energy(1.2, 0).total);

  readonly currentState = computed(() => solve(this.c(), this.t()));
  readonly currentPE = computed(() => 0.5 * K * this.currentState().y * this.currentState().y);
  readonly currentKE = computed(() => 0.5 * M * this.currentState().v * this.currentState().v);
  readonly currentTotal = computed(() => this.currentPE() + this.currentKE());

  readonly pePercent = computed(() => {
    const E0 = this.initialEnergy();
    return (this.currentPE() / E0) * 100;
  });

  readonly kePercent = computed(() => {
    const E0 = this.initialEnergy();
    return (this.currentKE() / E0) * 100;
  });

  readonly pePath = computed(() => this.buildEnergyPath('PE'));
  readonly kePath = computed(() => this.buildEnergyPath('KE'));
  readonly totalPath = computed(() => this.buildEnergyPath('total'));

  private buildEnergyPath(kind: 'PE' | 'KE' | 'total'): string {
    const pts: string[] = [];
    const n = 200;
    const tMax = 8;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * tMax;
      const { y, v } = solve(this.c(), tt);
      const e = energy(y, v);
      const value = kind === 'PE' ? e.PE : kind === 'KE' ? e.KE : e.total;
      const clamp = Math.max(0, Math.min(3.5, value));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-clamp * PX_PER_E).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
