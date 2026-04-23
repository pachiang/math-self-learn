import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const OMEGA0 = 2;
const F0 = 1;

/**
 * Undamped forced oscillator: y'' + ω₀²·y = F₀·cos(Ω·t)
 *
 * General solution:
 *   If Ω ≠ ω₀:  y(t) = C1 cos(ω₀ t) + C2 sin(ω₀ t) + F₀/(ω₀² − Ω²) · cos(Ω·t)
 *   If Ω = ω₀:  y(t) = C1 cos(ω₀ t) + C2 sin(ω₀ t) + F₀/(2ω₀) · t · sin(ω₀ t)   ← resonance
 *
 * Starting from y(0)=0, y'(0)=0:
 *   Ω ≠ ω₀:
 *     C1 = -F₀/(ω₀² - Ω²)
 *     C2 = 0
 *     y(t) = F₀/(ω₀² - Ω²) · [cos(Ω t) - cos(ω₀ t)]
 *   Ω = ω₀:
 *     C1 = 0, C2 = 0
 *     y(t) = F₀/(2ω₀) · t · sin(ω₀ t)
 */

function solveUndamped(Omega: number, t: number): number {
  const diff = OMEGA0 * OMEGA0 - Omega * Omega;
  if (Math.abs(diff) < 0.01) {
    // Resonance (or very near)
    return (F0 / (2 * OMEGA0)) * t * Math.sin(OMEGA0 * t);
  }
  const A = F0 / diff;
  return A * (Math.cos(Omega * t) - Math.cos(OMEGA0 * t));
}

const PX_PER_T = 10;
const PX_PER_Y = 7;
const T_MAX = 30;

@Component({
  selector: 'app-de-ch6-resonance',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="共振：無阻尼的警鐘" subtitle="§6.3">
      <p>
        上一節的未定係數法對大多數外力都行得通——但有一個特殊情況會失效：
      </p>
      <p class="key-idea">
        <strong>當外力頻率 Ω 恰好等於系統自然頻率 ω₀</strong>，
        原本猜的 <code>A·cos(Ωt) + B·sin(Ωt)</code> 本身就是齊次解，代入會得到 0 = F₀（矛盾）。
      </p>
      <p>
        解決辦法：把猜的形式<strong>乘一個 t</strong>：
      </p>
      <div class="centered-eq big">y_p = t · (A·cos(ω₀t) + B·sin(ω₀t))</div>
      <p>
        這個額外的 <strong>t 因子</strong>讓振幅<strong>隨時間線性增長</strong>——系統越推越晃，
        理論上<strong>趨於無限大</strong>。這就是「共振」。
      </p>
      <p>
        直覺：想像推盪鞦韆。如果你在<strong>最佳時刻</strong>（盪到最高點時）給個推力，
        每次都會加一點能量，幅度越來越大——這正是 Ω = ω₀ 的情況。
        時間錯的話，有時你推的方向跟鞦韆相反，反而把它慢下來。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖驅動頻率 Ω：看接近 ω₀ 時的「爆炸性」行為">
      <!-- Main chart: y(t) comparison -->
      <div class="chart-wrap">
        <div class="chart-title">
          y(t) 對比：無阻尼系統 y″ + 4·y = F₀·cos(Ω·t)，ω₀ = 2
        </div>
        <svg viewBox="-10 -130 340 270" class="chart-svg">
          <!-- Axes -->
          <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-120" x2="0" y2="130" stroke="var(--border-strong)" stroke-width="1" />
          <text x="324" y="4" class="ax">t</text>
          <text x="-4" y="-122" class="ax">y</text>

          <!-- Y ticks -->
          @for (g of [-10, -5, 5, 10]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="320" [attr.y2]="-g * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            <text x="-4" [attr.y]="-g * PX_PER_Y + 3" class="tick">{{ g }}</text>
          }

          <!-- Envelope (only shown near resonance) -->
          @if (Math.abs(Omega() - OMEGA0) < 0.05) {
            <path [attr.d]="envelopeUp()" fill="none"
              stroke="#c87b5e" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6" />
            <path [attr.d]="envelopeDown()" fill="none"
              stroke="#c87b5e" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6" />
          }

          <!-- Solution curve -->
          <path [attr.d]="solutionPath()" fill="none"
            stroke="var(--accent)" stroke-width="1.8" />

          <!-- Current time marker -->
          <line [attr.x1]="t() * PX_PER_T" y1="-120" [attr.x2]="t() * PX_PER_T" y2="130"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
          <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-currentY() * PX_PER_Y" r="4"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />
        </svg>

        <div class="max-amp-display" [attr.data-resonance]="isResonance()">
          @if (isResonance()) {
            <strong>Ω = ω₀ = 2.00 → 共振！</strong>
            振幅在 t = {{ T_MAX }} 時已達 <strong>{{ maxAmplitude().toFixed(2) }}</strong>（理論：線性 ∝ t）
          } @else {
            穩態振幅 = <strong>F₀/|ω₀² − Ω²| = {{ steadyAmpDisplay() }}</strong>
          }
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
          <span class="sl-lab">驅動頻率 Ω</span>
          <input type="range" min="0.5" max="4" step="0.01"
            [value]="Omega()" (input)="Omega.set(+$any($event).target.value)" />
          <span class="sl-val">{{ Omega().toFixed(2) }}</span>
        </div>

        <div class="presets">
          <button class="pre" (click)="Omega.set(1.0)">Ω=1.0</button>
          <button class="pre" (click)="Omega.set(1.5)">Ω=1.5</button>
          <button class="pre" (click)="Omega.set(1.9)">Ω=1.9（接近）</button>
          <button class="pre resonance" (click)="Omega.set(OMEGA0)">Ω=ω₀=2.0 共振</button>
          <button class="pre" (click)="Omega.set(2.5)">Ω=2.5</button>
        </div>

        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.05"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">頻率差 |Ω − ω₀|</span>
            <strong>{{ Math.abs(Omega() - OMEGA0).toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">目前 y(t)</span>
            <strong>{{ currentY().toFixed(3) }}</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾個重點：
      </p>
      <ul>
        <li><strong>共振（Ω = ω₀）下沒有穩態</strong>——振幅一路爬升。
          但現實中彈簧會斷、材料會彎折、系統會非線性化——數學預言的「爆炸」會在物理極限前停下。</li>
        <li><strong>接近共振（Ω ≈ ω₀ 但不相等）</strong>：振幅仍是<strong>有限</strong>，但非常大。
          穩態振幅公式 F₀/|ω₀² − Ω²| 在 Ω → ω₀ 時發散。</li>
        <li><strong>這就是為什麼沒有阻尼的系統是「理想化」</strong>。真實系統至少有微量阻尼，
          讓共振峰變成有限——但可能還是大到足以摧毀結構。</li>
      </ul>
      <p>
        下一節我們加入阻尼，看共振峰如何從「無限」變成「有限但很大」，
        並引入<strong>頻率響應</strong>這個工程上最重要的概念。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        當外力頻率等於自然頻率，特解需要多乘一個 t——
        振幅隨時間<strong>線性爆炸</strong>。這數學結果完美對應物理直覺：
        對的頻率 + 無損耗 = 能量無限累積。
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

    .chart-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .chart-title {
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

    .max-amp-display {
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      color: var(--text-secondary);
      background: var(--bg-surface);
    }

    .max-amp-display strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .max-amp-display[data-resonance='true'] {
      background: rgba(200, 123, 94, 0.08);
      border: 1px solid rgba(200, 123, 94, 0.3);
    }

    .max-amp-display[data-resonance='true'] strong {
      color: #c87b5e;
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
      min-width: 50px;
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

    .pre.resonance {
      border-color: #c87b5e;
      color: #c87b5e;
      font-weight: 700;
    }

    .pre.resonance:hover {
      background: rgba(200, 123, 94, 0.1);
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 6px;
      margin-top: 8px;
      padding-top: 8px;
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
export class DeCh6ResonanceComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly OMEGA0 = OMEGA0;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;
  readonly T_MAX = T_MAX;

  readonly Omega = signal(1.5);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 2.5;
        if (newT >= T_MAX) {
          this.t.set(T_MAX);
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
    if (this.t() >= T_MAX - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  readonly currentY = computed(() => solveUndamped(this.Omega(), this.t()));

  readonly isResonance = computed(() => Math.abs(this.Omega() - OMEGA0) < 0.01);

  readonly maxAmplitude = computed(() => {
    // Scan for max over plot range
    if (this.isResonance()) {
      return F0 / (2 * OMEGA0) * T_MAX;
    }
    const diff = OMEGA0 * OMEGA0 - this.Omega() * this.Omega();
    return (2 * F0) / Math.abs(diff);
  });

  readonly steadyAmpDisplay = computed(() => {
    const diff = OMEGA0 * OMEGA0 - this.Omega() * this.Omega();
    if (Math.abs(diff) < 0.01) return '∞（共振）';
    return (F0 / Math.abs(diff)).toFixed(3);
  });

  readonly solutionPath = computed(() => {
    const pts: string[] = [];
    const n = 400;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * T_MAX;
      const y = solveUndamped(this.Omega(), tt);
      const yc = Math.max(-18, Math.min(18, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  /**
   * Envelope for resonance: ± F₀/(2ω₀) · t
   */
  readonly envelopeUp = computed(() => {
    const pts: string[] = [];
    const n = 20;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * T_MAX;
      const env = (F0 / (2 * OMEGA0)) * tt;
      const clamp = Math.min(18, env);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-clamp * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly envelopeDown = computed(() => {
    const pts: string[] = [];
    const n = 20;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * T_MAX;
      const env = -(F0 / (2 * OMEGA0)) * tt;
      const clamp = Math.max(-18, env);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-clamp * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
