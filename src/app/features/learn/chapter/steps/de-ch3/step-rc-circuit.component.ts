import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type Mode = 'charge' | 'discharge';

@Component({
  selector: 'app-de-ch3-rc',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="RC 電路：電容充放電" subtitle="§3.4">
      <p>
        一個電池（電壓 V₀）、一個電阻（R）、一個電容（C），串成一個迴圈。
        打開開關，電容會慢慢被充電。關掉電池、讓電容自己透過電阻放電——它會指數衰退。
      </p>
      <p class="key-idea">
        <strong>這是電學版的牛頓冷卻。</strong>
        電容兩端的電壓 V(t) 被拉向「目標電壓」（V₀ 充電或 0 放電），
        速率由時間常數 <code>τ = RC</code> 決定。
      </p>
      <p>
        用克希荷夫電壓定律（KVL）寫方程：沿迴路電壓總和為 0。充電時：
      </p>
      <div class="centered-eq">V₀ = I·R + V</div>
      <p>
        電容性質 I = C·dV/dt 代入：
      </p>
      <div class="centered-eq big">RC · dV/dt + V = V₀</div>
      <p>
        線性一階（§2.3 攻略），<code>p = 1/RC, g = V₀/RC</code>，積分因子 μ = e^(t/RC)。解為：
      </p>
      <div class="centered-eq">V(t) = V₀ (1 − e^(−t/RC))</div>
      <p>
        放電時（無電池）：V(t) = V₀ · e^(−t/RC)。兩者都受同一個時間常數 <strong>τ = RC</strong> 控制。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換充電/放電，拖滑桿調 R、C，看電荷如何流動">
      <div class="mode-row">
        <button class="mode-btn"
          [class.active]="mode() === 'charge'"
          (click)="switchMode('charge')"
        >⚡ 充電（電池接通）</button>
        <button class="mode-btn"
          [class.active]="mode() === 'discharge'"
          (click)="switchMode('discharge')"
        >\ud83d\udd0c 放電（電池關掉）</button>
      </div>

      <!-- Circuit diagram -->
      <div class="circuit-wrap">
        <svg viewBox="-10 -10 360 220" class="circuit-svg">
          <!-- Wires -->
          <polyline
            points="50,50 50,30 150,30 150,50"
            fill="none" stroke="var(--text)" stroke-width="2" />
          <polyline
            points="200,50 200,30 300,30 300,50"
            fill="none" stroke="var(--text)" stroke-width="2" />
          <polyline
            points="50,130 50,180 300,180 300,130"
            fill="none" stroke="var(--text)" stroke-width="2" />

          <!-- Battery (left) -->
          <g transform="translate(50, 90)">
            <rect x="-20" y="-40" width="40" height="80" rx="3"
              fill="var(--bg-surface)" stroke="var(--text)" stroke-width="1.5" />
            <line x1="-14" y1="-18" x2="14" y2="-18" stroke="var(--text)" stroke-width="2.5" />
            <line x1="-8" y1="-8" x2="8" y2="-8" stroke="var(--text)" stroke-width="1.5" />
            <line x1="-14" y1="8" x2="14" y2="8" stroke="var(--text)" stroke-width="2.5" />
            <line x1="-8" y1="18" x2="8" y2="18" stroke="var(--text)" stroke-width="1.5" />
            <text x="0" y="-28" class="comp-lab" text-anchor="middle">V\u2080 = {{ V0 }}V</text>
            <!-- Switch open/closed -->
            @if (mode() === 'discharge') {
              <circle cx="0" cy="35" r="3" fill="#c87b5e" />
              <text x="0" y="56" class="comp-lab" text-anchor="middle" style="fill: #c87b5e">
                開關斷路
              </text>
            }
          </g>

          <!-- Resistor (top center) -->
          <g transform="translate(175, 30)">
            <path d="M -25,0 L -18,-7 L -12,7 L -6,-7 L 0,7 L 6,-7 L 12,7 L 18,-7 L 25,0"
              fill="none" stroke="var(--text)" stroke-width="2" stroke-linejoin="round" />
            <text x="0" y="-14" class="comp-lab" text-anchor="middle">R = {{ R().toFixed(1) }} Ω</text>
          </g>

          <!-- Capacitor (right) -->
          <g transform="translate(300, 90)">
            <line x1="-12" y1="-20" x2="-12" y2="20" stroke="var(--text)" stroke-width="3" />
            <line x1="12" y1="-20" x2="12" y2="20" stroke="var(--text)" stroke-width="3" />
            <!-- Capacitor charge visualization -->
            <rect x="-14"
              [attr.y]="-20 + 40 * (1 - chargeFraction())"
              width="4"
              [attr.height]="40 * chargeFraction()"
              fill="#5a8aa8" opacity="0.7" />
            <rect x="10"
              [attr.y]="-20 + 40 * (1 - chargeFraction())"
              width="4"
              [attr.height]="40 * chargeFraction()"
              fill="#c87b5e" opacity="0.7" />
            <text x="0" y="-28" class="comp-lab" text-anchor="middle">C = {{ C().toFixed(2) }} F</text>
            <text x="0" y="36" class="v-lab" text-anchor="middle" style="fill: var(--accent)">
              V = {{ voltage().toFixed(2) }}V
            </text>
          </g>

          <!-- Ground symbol -->
          <g transform="translate(175, 180)">
            <line x1="-10" y1="0" x2="10" y2="0" stroke="var(--text-muted)" stroke-width="1" />
            <line x1="-6" y1="3" x2="6" y2="3" stroke="var(--text-muted)" stroke-width="1" />
            <line x1="-3" y1="6" x2="3" y2="6" stroke="var(--text-muted)" stroke-width="1" />
          </g>

          <!-- Current flow particles -->
          @for (p of currentParticles(); track p.k) {
            <circle
              [attr.cx]="p.x"
              [attr.cy]="p.y"
              r="2.5"
              fill="#f4c866"
              opacity="0.85"
            />
          }
        </svg>
      </div>

      <!-- V(t) and I(t) chart -->
      <div class="chart-wrap">
        <div class="chart-title">電壓 V(t) 與 電流 I(t)</div>
        <svg viewBox="-10 -110 380 150" class="chart-svg">
          <line x1="0" y1="20" x2="360" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-100" x2="0" y2="30" stroke="var(--border-strong)" stroke-width="1" />
          <text x="362" y="24" class="ax">t</text>

          <!-- τ marker -->
          <line [attr.x1]="tau() * 40" y1="20"
            [attr.x2]="tau() * 40" y2="-100"
            stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.6" />
          <text [attr.x]="tau() * 40" y="34" class="tau-lab" text-anchor="middle">
            τ = {{ tau().toFixed(2) }}
          </text>

          <!-- Target voltage line -->
          @if (mode() === 'charge') {
            <line x1="0" y1="-80" x2="360" y2="-80"
              stroke="var(--text-muted)" stroke-width="0.7" stroke-dasharray="2 2" opacity="0.6" />
            <text x="340" y="-83" class="target-lab" text-anchor="end">
              V\u2080 = {{ V0 }}
            </text>
          }

          <!-- V(t) -->
          <path [attr.d]="vPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.2" />
          <!-- I(t) (scaled) -->
          <path [attr.d]="iPath()" fill="none"
            stroke="#5ca878" stroke-width="1.8" opacity="0.85" />

          <!-- Current position markers -->
          <circle [attr.cx]="t() * 40" [attr.cy]="-voltage() * 8" r="4"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />
          <circle [attr.cx]="t() * 40" [attr.cy]="-currentScaled() * 40" r="3"
            fill="#5ca878" stroke="white" stroke-width="1" />

          <!-- Legend -->
          <rect x="280" y="-96" width="76" height="28" fill="var(--bg-surface)"
            stroke="var(--border)" rx="3" />
          <line x1="284" y1="-88" x2="294" y2="-88"
            stroke="var(--accent)" stroke-width="2.2" />
          <text x="298" y="-85" class="leg">V(t)</text>
          <line x1="284" y1="-76" x2="294" y2="-76"
            stroke="#5ca878" stroke-width="1.8" />
          <text x="298" y="-73" class="leg">I(t) (×40)</text>
        </svg>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="ctrl-row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>
        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" max="9" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }} s</span>
        </div>
        <div class="sl">
          <span class="sl-lab">R</span>
          <input type="range" min="0.5" max="4" step="0.05"
            [value]="R()" (input)="R.set(+$any($event).target.value)" />
          <span class="sl-val">{{ R().toFixed(1) }} Ω</span>
        </div>
        <div class="sl">
          <span class="sl-lab">C</span>
          <input type="range" min="0.1" max="2" step="0.02"
            [value]="C()" (input)="C.set(+$any($event).target.value)" />
          <span class="sl-val">{{ C().toFixed(2) }} F</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">時間常數 τ = RC</span>
            <strong>{{ tau().toFixed(2) }} s</strong>
          </div>
          <div class="ro">
            <span class="ro-k">目前電壓 V</span>
            <strong>{{ voltage().toFixed(2) }} V</strong>
          </div>
          <div class="ro">
            <span class="ro-k">目前電流 I</span>
            <strong>{{ current().toFixed(3) }} A</strong>
          </div>
          <div class="ro">
            <span class="ro-k">5τ 後狀態</span>
            <strong>≈ 99% 收斂</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        RC 電路是「線性一階 + 吸引子」的另一個化身。它的方程 <code>RC·dV/dt + V = V₀</code>
        跟牛頓冷卻 <code>dT/dt = −k(T − T_a)</code>、藥物消除、混合槽、輻射衰退都是同一個家族。
      </p>
      <ul>
        <li><strong>時間常數 τ = RC 是唯一的時間尺度</strong>。想要充電快？減 R 或減 C。但 C 太小會存不了多少電荷；R 太小會燒掉電源。</li>
        <li><strong>5τ 是經驗法則</strong>：過 5 個時間常數後，系統已經達到穩態的 99%。工程師常用這個判斷「多久可以當成穩態」。</li>
        <li><strong>充電時 I 最大在 t=0</strong>（電容像個短路），然後指數衰退到 0（電容飽和後像個斷路）。這個行為和 §3.2 熱傳導的「初始梯度最大」完全一樣。</li>
      </ul>
      <p>
        （RL 電路 L·dI/dt + RI = V₀ 跟這結構完全相同，只是換成電流當主角，時間常數變 τ = L/R。）
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        電路元件跟物理現象的 ODE 常常有<strong>精確一對一的對應</strong>：
        電容 ↔ 熱容、電阻 ↔ 熱阻、電感 ↔ 質量、電壓 ↔ 溫度／高度。
        這個「同構」在 Ch5 振動、Ch8 系統還會一再出現。
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

    .mode-row {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }

    .mode-btn {
      font: inherit;
      font-size: 13px;
      padding: 8px 14px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
      flex: 1;
      font-weight: 600;
    }

    .mode-btn:hover { border-color: var(--accent); }
    .mode-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
    }

    .circuit-wrap {
      padding: 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 14px;
    }

    .circuit-svg {
      width: 100%;
      display: block;
      max-width: 480px;
      margin: 0 auto;
    }

    .comp-lab {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .v-lab {
      font-size: 13px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
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

    .chart-svg { width: 100%; display: block; }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tau-lab, .target-lab, .leg {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    .tau-lab { fill: #c87b5e; }
    .target-lab { fill: var(--text-muted); }
    .leg { fill: var(--text); }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .ctrl-row {
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
    .play-btn:hover, .reset-btn:hover { opacity: 0.85; }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
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
      min-width: 60px;
      text-align: right;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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
      align-items: baseline;
      font-size: 12px;
    }

    .ro-k { color: var(--text-muted); }

    .ro strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class DeCh3RcCircuitComponent implements OnInit, OnDestroy {
  readonly V0 = 5;
  readonly mode = signal<Mode>('charge');
  readonly t = signal(0);
  readonly playing = signal(false);
  readonly R = signal(1.0);
  readonly C = signal(0.5);

  private rafId: number | null = null;
  private lastFrame = 0;
  private readonly T_MAX = 9;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.0;
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

  readonly tau = computed(() => this.R() * this.C());

  switchMode(m: Mode): void {
    this.mode.set(m);
    this.t.set(0);
    this.playing.set(false);
  }

  togglePlay(): void {
    if (this.t() >= this.T_MAX - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  readonly voltage = computed(() => {
    const t = this.t();
    const tau = this.tau();
    if (this.mode() === 'charge') {
      return this.V0 * (1 - Math.exp(-t / tau));
    }
    // Discharge: starts at V0, decays to 0
    return this.V0 * Math.exp(-t / tau);
  });

  readonly current = computed(() => {
    const t = this.t();
    const tau = this.tau();
    if (this.mode() === 'charge') {
      // I = (V0/R) * e^(-t/tau)
      return (this.V0 / this.R()) * Math.exp(-t / tau);
    }
    // Discharge: I = -(V0/R) e^(-t/tau), take abs for display
    return (this.V0 / this.R()) * Math.exp(-t / tau);
  });

  readonly chargeFraction = computed(() =>
    Math.max(0, Math.min(1, this.voltage() / this.V0)),
  );

  readonly currentScaled = computed(() => this.current());

  readonly vPath = computed(() => {
    const pts: string[] = [];
    const tau = this.tau();
    for (let i = 0; i <= 150; i++) {
      const t = (i / 150) * this.T_MAX;
      const V = this.mode() === 'charge'
        ? this.V0 * (1 - Math.exp(-t / tau))
        : this.V0 * Math.exp(-t / tau);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 40).toFixed(1)} ${(-V * 8).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly iPath = computed(() => {
    const pts: string[] = [];
    const tau = this.tau();
    for (let i = 0; i <= 150; i++) {
      const t = (i / 150) * this.T_MAX;
      const I = (this.V0 / this.R()) * Math.exp(-t / tau);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 40).toFixed(1)} ${(-I * 40).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  // Current flow animation: dots moving around circuit
  // Loop path approximation with total length
  readonly currentParticles = computed(() => {
    const I = this.current();
    const phase = this.t();
    // Number of dots proportional to current magnitude
    const nDots = Math.min(12, Math.max(0, Math.round(I * 3)));
    const out: { k: number; x: number; y: number }[] = [];
    for (let i = 0; i < nDots; i++) {
      // Parameter along the loop (0..1)
      const s = ((phase * 0.4 + i / nDots) % 1);
      const p = this.pointOnLoop(s);
      out.push({ k: i, x: p.x, y: p.y });
    }
    return out;
  });

  private pointOnLoop(s: number): { x: number; y: number } {
    // Rectangular loop: (50,90) → (50,30) → (300,30) → (300,90) → (300,180) → (50,180) → (50,90)
    // Segments:
    // A: (50,90)→(50,30)   len 60
    // B: (50,30)→(300,30)  len 250
    // C: (300,30)→(300,90) len 60  (stops at capacitor)
    // (gap through capacitor: (300,90)→(300,130))
    // D: (300,130)→(300,180) len 50
    // E: (300,180)→(50,180) len 250
    // F: (50,180)→(50,90)   len 90 (back to battery)
    // But skip capacitor gap — go from (300,90) directly to (300,130) in phase
    // Total length for dot animation (skip capacitor visually)
    const segs = [
      { x1: 50, y1: 90, x2: 50, y2: 30, len: 60 },
      { x1: 50, y1: 30, x2: 300, y2: 30, len: 250 },
      { x1: 300, y1: 30, x2: 300, y2: 90, len: 60 },
      { x1: 300, y1: 130, x2: 300, y2: 180, len: 50 },
      { x1: 300, y1: 180, x2: 50, y2: 180, len: 250 },
      { x1: 50, y1: 180, x2: 50, y2: 90, len: 90 },
    ];
    const total = segs.reduce((a, s) => a + s.len, 0);
    let target = s * total;
    for (const seg of segs) {
      if (target <= seg.len) {
        const f = target / seg.len;
        return {
          x: seg.x1 + (seg.x2 - seg.x1) * f,
          y: seg.y1 + (seg.y2 - seg.y1) * f,
        };
      }
      target -= seg.len;
    }
    return { x: 50, y: 90 };
  }
}
