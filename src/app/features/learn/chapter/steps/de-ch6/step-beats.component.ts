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
 * Undamped forced oscillator with y(0) = 0, y'(0) = 0:
 *   y(t) = F₀/(ω₀² - Ω²) · (cos(Ω t) - cos(ω₀ t))
 *
 * Trigonometric identity:
 *   cos(Ω t) - cos(ω₀ t) = 2 · sin((Ω + ω₀)/2 · t) · sin((ω₀ - Ω)/2 · t)
 *
 * So y(t) = 2F₀/(ω₀² - Ω²) · sin(ω_fast · t) · sin(ω_slow · t)
 *   ω_fast = (Ω + ω₀)/2 (fast oscillation)
 *   ω_slow = (ω₀ - Ω)/2 (slow envelope)
 */
function solveUndamped(Omega: number, t: number): number {
  const diff = OMEGA0 * OMEGA0 - Omega * Omega;
  if (Math.abs(diff) < 0.001) {
    return (F0 / (2 * OMEGA0)) * t * Math.sin(OMEGA0 * t);
  }
  const A = F0 / diff;
  return A * (Math.cos(Omega * t) - Math.cos(OMEGA0 * t));
}

function envelope(Omega: number, t: number): number {
  const diff = OMEGA0 * OMEGA0 - Omega * Omega;
  const omega_slow = Math.abs(OMEGA0 - Omega) / 2;
  return Math.abs((2 * F0) / diff) * Math.abs(Math.sin(omega_slow * t));
}

/**
 * Damped: m·y'' + c·y' + k·y = F₀·cos(Ω·t), starts at y(0)=0, v(0)=0.
 * Transient + steady state decomposition (under-damped, m=1, k=ω0²).
 */
function solveDamped(Omega: number, t: number, c: number): {
  y: number; yh: number; yp: number;
} {
  const m = 1;
  const k = OMEGA0 * OMEGA0;
  const alpha = -c / (2 * m);
  const beta = Math.sqrt(Math.max(0.01, 4 * m * k - c * c)) / (2 * m);
  const D = (k - m * Omega * Omega) * (k - m * Omega * Omega) + (c * Omega) * (c * Omega);
  const Ap = (F0 * (k - m * Omega * Omega)) / D;
  const Bp = (F0 * c * Omega) / D;

  const yp = Ap * Math.cos(Omega * t) + Bp * Math.sin(Omega * t);
  const yp_prime = -Ap * Omega * Math.sin(Omega * t) + Bp * Omega * Math.cos(Omega * t);

  // y(0) = 0 => C1 = -Ap. y'(0) = 0 => αC1 + βC2 + yp'(0) = 0 => C2 = -(αC1 + Bp·Ω)/β
  const C1 = -Ap;
  const C2 = -(alpha * C1 + Bp * Omega) / beta;

  const eAt = Math.exp(alpha * t);
  const yh = eAt * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t));
  return { y: yh + yp, yh, yp };
}

const PX_PER_T = 8;
const PX_PER_Y = 18;
const T_MAX = 40;

@Component({
  selector: 'app-de-ch6-beats',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="拍頻與瞬態" subtitle="§6.5">
      <p>
        §6.3 看的是「共振」本身（Ω = ω₀）。但最有趣的是「接近」共振的行為——
        Ω 跟 ω₀ 相近但不相等，系統會出現<strong>拍頻</strong>（beats）。
      </p>
      <p>
        無阻尼系統對外力 F₀·cos(Ω·t) 的解（零初值）可以用三角恆等式改寫：
      </p>
      <div class="centered-eq">
        y(t) = 2F₀/(ω₀² − Ω²) · sin(ω_fast · t) · sin(ω_slow · t)
      </div>
      <p>
        其中：
      </p>
      <ul>
        <li><strong>ω_fast = (ω₀ + Ω) / 2</strong>：快速振盪（介於兩頻率之間）</li>
        <li><strong>ω_slow = (ω₀ − Ω) / 2</strong>：慢速「包絡」頻率</li>
      </ul>
      <p class="key-idea">
        當 Ω 接近 ω₀，<strong>ω_slow 變小 → 包絡週期變長 → 看起來像「響了一會兒又停一會兒」</strong>。
        這就是兩個鋼琴音接近但不同調時聽到的「嗡嗡」現象——兩人一起吹奏的號角有時響、有時安靜。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 Ω 越來越接近 ω₀，看拍頻週期如何變長">
      <div class="chart-wrap">
        <div class="chart-title">
          無阻尼拍頻：y(t) = 快速 × 慢速包絡
        </div>
        <svg viewBox="-10 -100 340 190" class="chart-svg">
          <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-90" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="1" />
          <text x="324" y="4" class="ax">t</text>
          <text x="-4" y="-92" class="ax">y</text>

          @for (g of [-4, -2, 2, 4]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="320" [attr.y2]="-g * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }

          <!-- Envelope (±) -->
          <path [attr.d]="envelopeUpPath()" fill="none"
            stroke="#c87b5e" stroke-width="1.6" opacity="0.75" />
          <path [attr.d]="envelopeDownPath()" fill="none"
            stroke="#c87b5e" stroke-width="1.6" opacity="0.75" />

          <!-- Solution -->
          <path [attr.d]="undampedPath()" fill="none"
            stroke="var(--accent)" stroke-width="1.6" />

          <!-- Playhead -->
          <line [attr.x1]="t() * PX_PER_T" y1="-90" [attr.x2]="t() * PX_PER_T" y2="80"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.4" />
          <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-undampedY() * PX_PER_Y" r="4"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />
        </svg>

        <div class="info-line">
          包絡週期 T_env = 2π/ω_slow = <strong>{{ envelopePeriod().toFixed(2) }}</strong>
          <span class="sep">|</span>
          Ω = {{ Omega().toFixed(3) }}，ω₀ = {{ OMEGA0 }}，|差| = {{ Math.abs(OMEGA0 - Omega()).toFixed(3) }}
        </div>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>

        <div class="sl">
          <span class="sl-lab">驅動頻率 Ω</span>
          <input type="range" min="1.5" max="2.5" step="0.005"
            [value]="Omega()" (input)="Omega.set(+$any($event).target.value)" />
          <span class="sl-val">{{ Omega().toFixed(3) }}</span>
        </div>

        <div class="presets">
          <button class="pre" (click)="Omega.set(1.7)">Ω=1.7</button>
          <button class="pre" (click)="Omega.set(1.9)">Ω=1.9</button>
          <button class="pre" (click)="Omega.set(1.95)">Ω=1.95（拍頻慢）</button>
          <button class="pre" (click)="Omega.set(1.98)">Ω=1.98（很慢）</button>
        </div>

        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.05"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(1) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="有阻尼情況：瞬態衰退後，穩態接管">
      <div class="chart-wrap">
        <div class="chart-title">
          y(t) = y_h（瞬態，虛線）+ y_p（穩態，綠）——有阻尼 c = {{ cDamp().toFixed(2) }}
        </div>
        <svg viewBox="-10 -100 340 190" class="chart-svg">
          <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-90" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="1" />
          <text x="324" y="4" class="ax">t</text>
          <text x="-4" y="-92" class="ax">y</text>

          @for (g of [-4, -2, 2, 4]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="320" [attr.y2]="-g * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }

          <!-- Transient (dashed gray) -->
          <path [attr.d]="dampedYhPath()" fill="none"
            stroke="#8a9aa8" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.85" />
          <!-- Steady state (green) -->
          <path [attr.d]="dampedYpPath()" fill="none"
            stroke="#5ca878" stroke-width="1.8" opacity="0.85" />
          <!-- Full solution (accent) -->
          <path [attr.d]="dampedYPath()" fill="none"
            stroke="var(--accent)" stroke-width="2" />
        </svg>

        <div class="legend">
          <span class="leg"><span class="leg-dot dashed" style="color:#8a9aa8"></span>y_h（瞬態，e^(−ζω₀t) 包絡）</span>
          <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>y_p（穩態，正弦）</span>
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>y = y_h + y_p</span>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">阻尼 c</span>
          <input type="range" min="0.05" max="1" step="0.02"
            [value]="cDamp()" (input)="cDamp.set(+$any($event).target.value)" />
          <span class="sl-val">{{ cDamp().toFixed(2) }}</span>
        </div>
        <p class="damp-note">
          阻尼越小，瞬態衰退越慢——系統花更多時間「從初值過渡到穩態」。
          阻尼越大（但仍欠阻尼），瞬態幾個週期就消失。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        兩張圖一起看，揭示線性受迫振動的完整故事：
      </p>
      <ul>
        <li><strong>無阻尼 + 接近共振</strong>：週期性「呼吸」式振幅變化（拍頻）。能量永遠不耗，在兩個頻率間來回傳遞。</li>
        <li><strong>有阻尼 + 接近共振</strong>：拍頻會被阻尼「抹平」——瞬態衰退後只剩穩態，呈現定振幅正弦波。</li>
        <li><strong>快慢分離</strong>：當 Ω 接近 ω₀，解呈現「快振 × 慢包絡」結構。這個「兩時間尺度」現象會在許多地方再出現（量子力學、光學、多尺度分析）。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        拍頻是兩個相近頻率<strong>相互干涉</strong>的結果——快振動被慢包絡調製。
        有阻尼時，這個干涉模式只在瞬態階段出現；穩態就是乾淨的正弦響應。
        理解這個過渡對設計伺服系統、音訊處理、光學干涉儀都至關重要。
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

    .info-line {
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }

    .info-line strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .info-line .sep {
      margin: 0 10px;
      color: var(--text-muted);
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
      min-width: 56px;
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

    .damp-note {
      margin: 8px 0 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  `,
})
export class DeCh6BeatsComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly OMEGA0 = OMEGA0;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;
  readonly T_MAX = T_MAX;

  readonly Omega = signal(1.9);
  readonly cDamp = signal(0.15);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 4;
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

  readonly undampedY = computed(() => solveUndamped(this.Omega(), this.t()));

  readonly envelopePeriod = computed(() => {
    const slow = Math.abs(OMEGA0 - this.Omega()) / 2;
    return slow < 0.001 ? Infinity : (2 * Math.PI) / slow;
  });

  readonly undampedPath = computed(() => {
    const pts: string[] = [];
    const n = 600;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * T_MAX;
      const y = solveUndamped(this.Omega(), tt);
      const yc = Math.max(-5, Math.min(5, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly envelopeUpPath = computed(() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * T_MAX;
      const e = Math.min(5, envelope(this.Omega(), tt));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-e * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly envelopeDownPath = computed(() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * T_MAX;
      const e = Math.min(5, envelope(this.Omega(), tt));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(e * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  // Damped panel: drive at Ω = 1.9 (close to resonance)
  readonly dampedYhPath = computed(() => this.buildDampedPath('yh'));
  readonly dampedYpPath = computed(() => this.buildDampedPath('yp'));
  readonly dampedYPath = computed(() => this.buildDampedPath('y'));

  private buildDampedPath(kind: 'y' | 'yh' | 'yp'): string {
    const pts: string[] = [];
    const n = 500;
    const Omega = 1.9;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * T_MAX;
      const s = solveDamped(Omega, tt, this.cDamp());
      const val = kind === 'y' ? s.y : kind === 'yh' ? s.yh : s.yp;
      const yc = Math.max(-5, Math.min(5, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
