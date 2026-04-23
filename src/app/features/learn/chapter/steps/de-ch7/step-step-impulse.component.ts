import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type ForcingType = 'step' | 'impulse' | 'delayed-step' | 'square';

/**
 * System: m·y'' + c·y' + k·y = F(t), y(0)=0, y'(0)=0
 * with m=1, c=0.5, k=4 (underdamped, ω0=2, ζ≈0.125)
 */
const M = 1;
const C = 0.5;
const K = 4;

/**
 * Solve by numerical integration (RK4) — lets us handle arbitrary forcing.
 */
function solve(
  f: (t: number) => number,
  tMax: number,
  dt = 0.01,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [[0, 0]];
  let y = 0;
  let v = 0;
  let t = 0;
  const n = Math.ceil(tMax / dt);
  for (let i = 0; i < n; i++) {
    // ODE: y'' = (F - c·v - k·y)/m
    const k1y = v;
    const k1v = (f(t) - C * v - K * y) / M;
    const k2y = v + (dt / 2) * k1v;
    const k2v = (f(t + dt / 2) - C * (v + (dt / 2) * k1v) - K * (y + (dt / 2) * k1y)) / M;
    const k3y = v + (dt / 2) * k2v;
    const k3v = (f(t + dt / 2) - C * (v + (dt / 2) * k2v) - K * (y + (dt / 2) * k2y)) / M;
    const k4y = v + dt * k3v;
    const k4v = (f(t + dt) - C * (v + dt * k3v) - K * (y + dt * k3y)) / M;
    y = y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    v = v + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    t = t + dt;
    pts.push([t, y]);
  }
  return pts;
}

const PX_PER_T = 25;
const PX_PER_Y = 60;

@Component({
  selector: 'app-de-ch7-step-impulse',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="階梯、衝擊、延遲" subtitle="§7.4">
      <p>
        Laplace 最強大的用途之一是處理<strong>非平滑</strong>的外力——
        在某一瞬間「打開」、「敲一下」、或「延遲一段時間才動作」。
        這些在 Ch6 的未定係數法下幾乎無法處理，但在 Laplace 只是幾個額外符號。
      </p>
      <div class="tools-grid">
        <div class="tool-card">
          <div class="tool-name">Heaviside 階梯 u(t − a)</div>
          <div class="tool-formula">
            <code>u(t−a) = 0 when t &lt; a；= 1 when t ≥ a</code>
          </div>
          <div class="tool-laplace">ℒ[u(t−a)] = e^(−as) / s</div>
          <p>「a 時刻瞬間打開外力」——開關、點火、起動。</p>
        </div>
        <div class="tool-card">
          <div class="tool-name">Dirac 衝擊 δ(t − a)</div>
          <div class="tool-formula">
            <code>「寬度 0 但總積分 = 1」的極限脈衝</code>
          </div>
          <div class="tool-laplace">ℒ[δ(t−a)] = e^(−as)</div>
          <p>「a 時刻給一個瞬間衝擊」——敲擊、雷擊、碰撞。</p>
        </div>
        <div class="tool-card">
          <div class="tool-name">t-shift 定理</div>
          <div class="tool-formula">
            <code>如果 ℒ[f(t)] = F(s)，則 ℒ[u(t−a)·f(t−a)] = e^(−as)·F(s)</code>
          </div>
          <div class="tool-laplace">乘 e^(−as) = 延遲 a 秒</div>
          <p>只要乘上 e^(−as)，就等於「整個訊號延後 a 秒出現」。</p>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="挑一種外力：看系統怎麼響應">
      <div class="picker">
        <button class="pick-btn" [class.active]="forcing() === 'step'" (click)="forcing.set('step')">
          階梯 u(t)
        </button>
        <button class="pick-btn" [class.active]="forcing() === 'impulse'" (click)="forcing.set('impulse')">
          衝擊 δ(t)
        </button>
        <button class="pick-btn" [class.active]="forcing() === 'delayed-step'" (click)="forcing.set('delayed-step')">
          延遲階梯 u(t−2)
        </button>
        <button class="pick-btn" [class.active]="forcing() === 'square'" (click)="forcing.set('square')">
          方波
        </button>
      </div>

      <div class="current-eq">
        <span class="ce-lab">系統：</span>
        <code class="ce-v">y″ + 0.5·y′ + 4·y = F(t),  y(0)=0, y′(0)=0</code>
      </div>

      <!-- Dual chart: F(t) and y(t) -->
      <div class="dual-chart">
        <div class="chart-half">
          <div class="ch-head">外力 F(t)</div>
          <svg viewBox="-10 -80 340 130" class="ch-svg">
            <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="50" stroke="var(--border-strong)" stroke-width="1" />
            <text x="324" y="4" class="ax">t</text>
            <text x="-4" y="-72" class="ax">F</text>

            @for (g of [0.5, 1]; track g) {
              <line x1="0" [attr.y1]="-g * 50" x2="320" [attr.y2]="-g * 50"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            }

            <!-- Forcing function visualization -->
            <path [attr.d]="forcingPath()" fill="none"
              stroke="#c87b5e" stroke-width="2.2" />

            <!-- For impulse: a vertical arrow -->
            @if (forcing() === 'impulse' || forcing() === 'delayed-step') {
              @for (spike of impulseSpikes(); track spike.t) {
                <line [attr.x1]="spike.t * PX_PER_T" y1="0"
                  [attr.x2]="spike.t * PX_PER_T" y2="-60"
                  stroke="#c87b5e" stroke-width="2.5"
                  marker-end="url(#spike-tip)" />
              }
              <defs>
                <marker id="spike-tip" markerWidth="6" markerHeight="5" refX="3" refY="2.5" orient="auto">
                  <polygon points="0 0, 6 2.5, 0 5" fill="#c87b5e" />
                </marker>
              </defs>
            }

            <!-- Playhead -->
            <line [attr.x1]="t() * PX_PER_T" y1="-70" [attr.x2]="t() * PX_PER_T" y2="50"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.4" />
          </svg>
        </div>

        <div class="chart-half">
          <div class="ch-head">系統響應 y(t)</div>
          <svg viewBox="-10 -80 340 130" class="ch-svg">
            <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="50" stroke="var(--border-strong)" stroke-width="1" />
            <text x="324" y="4" class="ax">t</text>
            <text x="-4" y="-72" class="ax">y</text>

            @for (g of [-0.3, 0.3, 0.5]; track g) {
              <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="320" [attr.y2]="-g * PX_PER_Y"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            }

            <!-- Steady state reference (for step) -->
            @if (forcing() === 'step' || forcing() === 'delayed-step') {
              <line x1="0" [attr.y1]="-0.25 * PX_PER_Y" x2="320" [attr.y2]="-0.25 * PX_PER_Y"
                stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.6" />
              <text x="320" [attr.y]="-0.25 * PX_PER_Y - 3" class="note" text-anchor="end">
                穩態 = 1/k = 0.25
              </text>
            }

            <!-- Response curve -->
            <path [attr.d]="responsePath()" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />

            <!-- Playhead -->
            <line [attr.x1]="t() * PX_PER_T" y1="-70" [attr.x2]="t() * PX_PER_T" y2="50"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.4" />
            <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-currentY() * PX_PER_Y" r="4"
              fill="var(--accent)" stroke="white" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <div class="explanation" [attr.data-forcing]="forcing()">
        @switch (forcing()) {
          @case ('step') {
            <strong>階梯響應（step response）：</strong>
            t=0 時外力從 0 跳到 1 並維持。系統會<strong>欠阻尼振盪</strong>爬升、超越、振盪，最終穩定在 1/k = 0.25。
            Y(s) = 1/(s·(s² + 0.5s + 4))，反變換後得到這條「階梯響應」——工程上用來檢驗系統的<strong>穩定性與跟隨能力</strong>。
          }
          @case ('impulse') {
            <strong>衝擊響應（impulse response）：</strong>
            t=0 瞬間給一個「寬度 0 但總積分 = 1」的衝擊 δ(t)。系統從平衡起跳入振盪，然後指數衰退。
            Y(s) = 1/(s² + 0.5s + 4)。這個 h(t) 叫「衝擊響應」，是系統的「指紋」——下一節的卷積理論告訴我們，<em>任何</em>輸入的響應都可以從 h(t) 算出來。
          }
          @case ('delayed-step') {
            <strong>延遲階梯：</strong>
            t &lt; 2 時 F=0，系統動都不動；t = 2 瞬間 F 跳到 1，系統才開始響應。
            Laplace 裡這只是乘上 e^(−2s)——<strong>延遲變成乘法</strong>。
          }
          @case ('square') {
            <strong>方波：</strong>
            F = u(t) − u(t−3) + u(t−6) − ...，由多個階梯相加組成。每個階梯都觸發一次「振盪 + 衰退」，疊加起來就是方波響應。
            用 Laplace 很直接：F(s) = (1 − e^(−3s) + e^(−6s) − ...) / s。
          }
        }
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
          <span class="sl-lab">t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Laplace 對這類非平滑輸入特別強：
      </p>
      <ul>
        <li><strong>不用分段求解</strong>。傳統方法（t &lt; a 一段、t ≥ a 另一段，再接邊界）複雜；Laplace 把整個故事寫在一條代數式裡。</li>
        <li><strong>衝擊響應 h(t) 是系統的「身分證」</strong>。知道 h(t) 就知道系統對任何輸入的響應——§7.5 卷積會揭露。</li>
        <li><strong>e^(−as) 直接表示延遲</strong>。對控制理論、訊號處理都是基礎操作。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Laplace 處理不連續輸入（階梯、衝擊、延遲）特別有威力——都只是乘一個 e^(−as) 而已。
        階躍響應與衝擊響應是<strong>系統特性的兩種標準探針</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .tool-card {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .tool-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
    }

    .tool-formula {
      padding: 6px 8px;
      background: var(--bg-surface);
      border-radius: 4px;
      margin-bottom: 6px;
    }

    .tool-formula code {
      font-size: 11px;
      background: transparent;
    }

    .tool-laplace {
      padding: 6px 10px;
      background: var(--accent-10);
      color: var(--accent);
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 6px;
    }

    .tool-card p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
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

    .picker {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .pick-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
    }

    .pick-btn:hover { border-color: var(--accent); }
    .pick-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .current-eq {
      padding: 10px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 12px;
      text-align: center;
    }

    .ce-lab {
      font-size: 11px;
      color: var(--text-muted);
      margin-right: 8px;
    }

    .ce-v {
      font-size: 13px;
      padding: 4px 10px;
    }

    .dual-chart {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    @media (max-width: 640px) {
      .dual-chart { grid-template-columns: 1fr; }
    }

    .chart-half {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .ch-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .ch-svg { width: 100%; display: block; }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .note {
      font-size: 9px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .explanation {
      padding: 12px 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .explanation strong {
      color: var(--accent);
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
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 30px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 50px;
      text-align: right;
    }
  `,
})
export class DeCh7StepImpulseComponent implements OnInit, OnDestroy {
  readonly forcing = signal<ForcingType>('step');
  readonly t = signal(0);
  readonly playing = signal(false);
  readonly T_MAX = 12;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;

  private rafId: number | null = null;
  private lastFrame = 0;

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

  forcingFunction(t: number): number {
    const f = this.forcing();
    if (f === 'step') return t >= 0 ? 1 : 0;
    if (f === 'impulse') {
      // Gaussian approximation of δ: height 1, width small
      const sigma = 0.05;
      return Math.exp(-((t - 0.1) * (t - 0.1)) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
    }
    if (f === 'delayed-step') return t >= 2 ? 1 : 0;
    if (f === 'square') {
      const period = 6;
      const phase = t % period;
      return phase < period / 2 ? 1 : 0;
    }
    return 0;
  }

  // Precomputed full response
  readonly fullResponse = computed(() => {
    const ff = (t: number) => this.forcingFunction(t);
    return solve(ff, this.T_MAX, 0.01);
  });

  readonly currentY = computed(() => {
    const pts = this.fullResponse();
    const idx = Math.min(pts.length - 1, Math.floor(this.t() / 0.01));
    return pts[idx][1];
  });

  readonly responsePath = computed(() => {
    const pts = this.fullResponse();
    return pts
      .filter((_, i) => i % 3 === 0) // sample every 3rd point for SVG efficiency
      .map(([t, y], i) => `${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-y * PX_PER_Y).toFixed(1)}`)
      .join(' ');
  });

  readonly forcingPath = computed(() => {
    const pts: string[] = [];
    const n = 400;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      let val: number;
      const f = this.forcing();
      if (f === 'impulse') {
        // For plot, show as thin spike at t=0 (use 0 everywhere, spike handled separately)
        val = 0;
      } else if (f === 'delayed-step') {
        // Show as 0 until t=2 then 1
        val = t >= 2 ? 1 : 0;
      } else if (f === 'step') {
        val = t >= 0.01 ? 1 : 0;
      } else {
        val = this.forcingFunction(t);
      }
      const scaled = val * 50; // force 0..1 mapped to 0..50 px
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-scaled).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly impulseSpikes = computed(() => {
    const f = this.forcing();
    if (f === 'impulse') {
      return [{ t: 0.05 }];
    }
    return [];
  });
}
