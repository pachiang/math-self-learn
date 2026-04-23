import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Scenario {
  id: string;
  label: string;
  emoji: string;
  envTemp: number;
  initialTemp: number;
  color: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'fridge', label: '冰箱', emoji: '\u2744\ufe0f', envTemp: 4, initialTemp: 90, color: '#5a8aa8' },
  { id: 'room', label: '室溫', emoji: '\ud83c\udfe0', envTemp: 22, initialTemp: 90, color: '#a89a5c' },
  { id: 'sauna', label: '桑拿房', emoji: '\ud83d\udd25', envTemp: 55, initialTemp: 90, color: '#c87b5e' },
  { id: 'ice', label: '冰塊回溫', emoji: '\ud83e\uddca', envTemp: 22, initialTemp: -5, color: '#6e9ac4' },
];

interface FamilyMember {
  id: string;
  name: string;
  emoji: string;
  equation: string;
  yStar: string;
  interpretation: string;
}

const FAMILY: FamilyMember[] = [
  {
    id: 'cooling',
    name: '牛頓冷卻',
    emoji: '\u2615',
    equation: 'dT/dt = -k(T - T\u2090)',
    yStar: 'T\u2090（環境溫度）',
    interpretation: '熱的往冷的流，速度跟溫差成正比。',
  },
  {
    id: 'rc',
    name: 'RC 電路充電',
    emoji: '\u26a1',
    equation: 'dV/dt = (V\u209b - V) / (RC)',
    yStar: 'V\u209b（電源電壓）',
    interpretation: '電容「吸飽」到電源電壓，剩餘差越小速度越慢。',
  },
  {
    id: 'decay',
    name: '放射性衰變',
    emoji: '\u2622\ufe0f',
    equation: 'dN/dt = -\u03bb · N',
    yStar: '0',
    interpretation: '衰變速度正比於剩餘原子數（這裡 y\u207e = 0）。',
  },
  {
    id: 'drug',
    name: '藥物消除',
    emoji: '\ud83d\udc8a',
    equation: 'dC/dt = -k\u2091 · C',
    yStar: '0',
    interpretation: '肝臟以一階速率消除，剩越多消得越快。',
  },
  {
    id: 'learning',
    name: '學習曲線',
    emoji: '\ud83d\udcda',
    equation: 'dP/dt = k (P\u2098 - P)',
    yStar: 'P\u2098（最大技能）',
    interpretation: '初期進步快；越接近上限越緩。',
  },
];

@Component({
  selector: 'app-de-ch3-cooling',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="牛頓冷卻：熱交換" subtitle="§3.2">
      <p>
        最經典的「降一階 ODE」模型。把咖啡擺在桌上，它的溫度 T(t) 會跟環境溫度 T\u2090 拉近——越燙的往下衝越快，快到 T\u2090 時幾乎停下。
      </p>
      <p>
        牛頓的假設很簡單：<strong>降溫速度正比於溫差</strong>。
      </p>
      <div class="centered-eq big">dT/dt = -k (T - T\u2090)</div>
      <p>
        這是一條<strong>線性一階 + 非齊次</strong>方程（§2.3 的形狀）。
        也可以改寫成可分離，兩種解法都行。答案是：
      </p>
      <div class="centered-eq">T(t) = T\u2090 + (T\u2080 - T\u2090) · e^(-kt)</div>
      <p>
        <strong>兩個觀察</strong>：
      </p>
      <ul>
        <li>最終 T → T\u2090（環境溫度是「吸引子」）。</li>
        <li>接近速度由 <code>k</code> 決定。<code>1/k</code> 叫時間常數——大約每 <code>1/k</code> 秒，
          溫差就衰退 63%。</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="調 k 與環境溫度，看同一杯咖啡在三個環境下怎麼冷（或暖）">
      <div class="scenario-pick">
        @for (s of scenarios; track s.id) {
          <button
            class="scenario-btn"
            [class.active]="isActive(s.id)"
            [style.--scene-color]="s.color"
            (click)="toggleScenario(s.id)"
          >
            <span class="s-emoji">{{ s.emoji }}</span>
            <span class="s-lab">{{ s.label }}</span>
            <span class="s-env">T\u2090 = {{ s.envTemp }}°C</span>
          </button>
        }
      </div>

      <!-- Three mugs side by side -->
      <div class="mugs-stage">
        @for (s of activeScenarios(); track s.id) {
          <div class="mug-col" [style.--scene-color]="s.color">
            <svg viewBox="-60 -5 120 170" class="mug-svg">
              <!-- Env background -->
              <rect x="-60" y="-5" width="120" height="175"
                [attr.fill]="envBgColor(s.envTemp)" opacity="0.2" />
              <!-- Temperature label -->
              <text x="-56" y="12" class="env-lab">
                環境 {{ s.envTemp }}°C
              </text>

              <!-- Mug body -->
              <rect x="-30" y="40" width="60" height="55" rx="4"
                fill="#3a3a42" stroke="#2a2a30" stroke-width="1.5" />
              <!-- Liquid -->
              <rect x="-28" y="42" width="56" height="51"
                [attr.fill]="liquidColor(s)" />
              <!-- Liquid surface ellipse -->
              <ellipse cx="0" cy="42" rx="28" ry="3.5"
                [attr.fill]="surfaceColor(s)" />
              <!-- Handle -->
              <path d="M 30,55 C 48,55 48,80 30,80"
                fill="none" stroke="#3a3a42" stroke-width="4" stroke-linecap="round" />

              <!-- Steam (if hot) -->
              @for (i of [0, 1, 2]; track i) {
                <path [attr.d]="steamPath(s, i)"
                  stroke="#aab4c0" stroke-width="1.4" fill="none"
                  stroke-linecap="round"
                  [attr.opacity]="steamOpacity(s)" />
              }

              <!-- Thermometer -->
              <g transform="translate(45, 50)">
                <rect x="-2" y="-8" width="18" height="60" rx="8"
                  fill="var(--bg)" stroke="#3a3a42" stroke-width="1.2" />
                <rect x="1" y="-4"
                  [attr.y]="50 - thermHeight(s)"
                  width="12" [attr.height]="thermHeight(s)"
                  [attr.fill]="liquidColor(s)" rx="2" />
                <circle cx="7" cy="52" r="7"
                  [attr.fill]="liquidColor(s)"
                  stroke="#3a3a42" stroke-width="1.2" />
              </g>
            </svg>

            <div class="mug-readout">
              <span class="r-t">T(t) =</span>
              <strong>{{ tempOf(s).toFixed(1) }}°C</strong>
            </div>
          </div>
        }
      </div>

      <!-- Combined chart -->
      <div class="chart-wrap">
        <div class="chart-title">T(t) 隨時間</div>
        <svg viewBox="-10 -110 380 150" class="chart-svg">
          <!-- Axes -->
          <line x1="0" y1="20" x2="360" y2="20" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-100" x2="0" y2="30" stroke="var(--border-strong)" stroke-width="1" />
          <text x="362" y="24" class="ax">t</text>
          <text x="-4" y="-102" class="ax">T</text>
          <!-- Y ticks -->
          @for (y of [0, 25, 50, 75, 100]; track y) {
            <text x="-4" [attr.y]="20 - y * 1.1 + 3" class="tick">{{ y }}</text>
            <line x1="0" [attr.y1]="20 - y * 1.1" x2="360" [attr.y2]="20 - y * 1.1"
              stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
          }
          <!-- Zero (water freezing) reference -->
          <line x1="0" y1="20" x2="360" y2="20" stroke="var(--text-muted)" stroke-width="0.6"
            stroke-dasharray="3 2" opacity="0.6" />

          <!-- Curves -->
          @for (s of activeScenarios(); track s.id) {
            <!-- Environment temperature line (dashed) -->
            <line x1="0" [attr.y1]="tempY(s.envTemp)"
              x2="360" [attr.y2]="tempY(s.envTemp)"
              [attr.stroke]="s.color" stroke-width="0.8"
              stroke-dasharray="3 2" opacity="0.45" />
            <!-- Solution curve -->
            <path [attr.d]="curvePath(s)" fill="none"
              [attr.stroke]="s.color" stroke-width="2.2" />
            <!-- Current position -->
            <circle
              [attr.cx]="t() * 16"
              [attr.cy]="tempY(tempOf(s))"
              r="4" [attr.fill]="s.color" stroke="white" stroke-width="1.5" />
            <!-- Label -->
            <text [attr.x]="362" [attr.y]="tempY(s.envTemp) + 3"
              class="curve-lab" [attr.fill]="s.color">
              T\u2090={{ s.envTemp }}
            </text>
          }
        </svg>
      </div>

      <!-- Controls -->
      <div class="controls">
        <button class="play-btn" (click)="togglePlay()">
          {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
        </button>
        <button class="reset-btn" (click)="reset()">↻ 重置</button>
        <div class="sl-row">
          <span class="sl-lab">t =</span>
          <input type="range" min="0" max="20" step="0.05"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(1) }} s</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab">k =</span>
          <input type="range" min="0.05" max="0.5" step="0.01"
            [value]="k()" (input)="k.set(+$any($event).target.value)" />
          <span class="sl-val">{{ k().toFixed(2) }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab">τ = 1/k =</span>
          <span class="sl-val-big">{{ (1 / k()).toFixed(1) }} s</span>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="同族家譜——五個看起來無關的現象，其實寫出一模一樣的方程">
      <div class="family-intro">
        牛頓冷卻方程長這樣：<code>dy/dt = -k (y - y\u2096)</code>，其中 y\u2096 是「穩態值」。
        一大堆物理／生物／化學／經濟現象都長這樣——差別只在 y 是什麼、k 是什麼、y\u2096 是什麼。
      </div>

      <div class="family-grid">
        @for (f of family; track f.id) {
          <div class="fam-card">
            <div class="fam-head">
              <span class="fam-emoji">{{ f.emoji }}</span>
              <span class="fam-name">{{ f.name }}</span>
            </div>
            <code class="fam-eq">{{ f.equation }}</code>
            <div class="fam-yk">
              <span class="yk-lab">y\u2096 =</span>
              <span class="yk-val">{{ f.yStar }}</span>
            </div>
            <p class="fam-desc">{{ f.interpretation }}</p>
          </div>
        }
      </div>

      <div class="insight-line">
        <strong>重點：</strong> 一條 ODE 解完一次，就解了這一整族現象。
        學會辨認「線性一階、有穩態吸引子」的結構，你就有一整組通用工具可以丟出去。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        牛頓冷卻是「有吸引子的一階線性」的原型。
        T → T\u2090 的收斂速率由 k 唯一決定；時間常數 τ = 1/k 是唯一的特徵尺度。
        這個結構 — <em>狀態 y 被拉向穩態 y\u2096</em> — 會一再在後面的章節出現（尤其是 Ch5 二階振動有相同的數學結構）。
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

    .scenario-pick {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
      margin-bottom: 14px;
    }

    .scenario-btn {
      font: inherit;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 10px 8px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      cursor: pointer;
      color: var(--text);
    }

    .scenario-btn:hover { border-color: var(--scene-color, var(--accent)); }
    .scenario-btn.active {
      border-color: var(--scene-color);
      background: color-mix(in srgb, var(--scene-color) 12%, var(--bg));
    }

    .s-emoji { font-size: 22px; }
    .s-lab { font-size: 13px; font-weight: 600; }
    .s-env { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .mugs-stage {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
      padding: 10px;
      border-radius: 10px;
      background: var(--bg-surface);
    }

    .mug-col {
      padding: 8px;
      border: 1px solid var(--scene-color);
      border-radius: 8px;
      background: var(--bg);
    }

    .mug-svg { width: 100%; display: block; }

    .env-lab {
      font-size: 9px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .mug-readout {
      margin-top: 6px;
      text-align: center;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .mug-readout strong {
      color: var(--scene-color);
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
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

    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: end;
      font-family: 'JetBrains Mono', monospace; }

    .curve-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      padding: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 8px;
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

    .sl-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 160px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      font-family: 'Noto Sans Math', serif;
      white-space: nowrap;
    }

    .sl-row input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 50px;
      text-align: right;
    }

    .sl-val-big {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .family-intro {
      padding: 12px 14px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 14px;
    }

    .family-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
    }

    .fam-card {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .fam-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .fam-emoji { font-size: 22px; }

    .fam-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
    }

    .fam-eq {
      display: block;
      text-align: center;
      font-size: 13px;
      padding: 6px 8px;
      margin-bottom: 6px;
    }

    .fam-yk {
      font-size: 11px;
      padding: 4px 8px;
      background: var(--bg-surface);
      border-radius: 4px;
      margin-bottom: 6px;
      display: flex;
      gap: 6px;
    }

    .yk-lab { color: var(--text-muted); }
    .yk-val { color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .fam-desc {
      margin: 0;
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .insight-line {
      margin-top: 14px;
      padding: 12px 14px;
      border-left: 3px solid var(--accent);
      background: var(--bg-surface);
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .insight-line strong { color: var(--accent); }
  `,
})
export class DeCh3CoolingComponent implements OnInit, OnDestroy {
  readonly scenarios = SCENARIOS;
  readonly family = FAMILY;
  readonly activeIds = signal<Set<string>>(new Set(['fridge', 'room', 'sauna']));
  readonly t = signal(0);
  readonly k = signal(0.15);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;
  private readonly T_MAX = 22;

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
    if (this.t() >= this.T_MAX - 0.1) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  isActive(id: string): boolean {
    return this.activeIds().has(id);
  }

  toggleScenario(id: string): void {
    const next = new Set(this.activeIds());
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else {
      next.add(id);
    }
    this.activeIds.set(next);
  }

  readonly activeScenarios = computed(() =>
    SCENARIOS.filter((s) => this.activeIds().has(s.id)),
  );

  tempOf(s: Scenario): number {
    return s.envTemp + (s.initialTemp - s.envTemp) * Math.exp(-this.k() * this.t());
  }

  liquidColor(s: Scenario): string {
    // Interpolate between hot (red) and cold (blue) based on current temp (0..100)
    const T = this.tempOf(s);
    const pct = Math.max(0, Math.min(1, T / 100));
    const r = Math.round(120 + (232 - 120) * pct);
    const g = Math.round(150 + (114 - 150) * pct);
    const b = Math.round(200 + (44 - 200) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  }

  surfaceColor(s: Scenario): string {
    const T = this.tempOf(s);
    const pct = Math.max(0, Math.min(1, T / 100));
    const r = Math.round(100 + (180 - 100) * pct);
    const g = Math.round(120 + (80 - 120) * pct);
    const b = Math.round(140 + (40 - 140) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  }

  envBgColor(envTemp: number): string {
    // blue for cold, red for hot
    if (envTemp < 15) return '#5a8aa8';
    if (envTemp > 35) return '#c87b5e';
    return '#8a9a7c';
  }

  thermHeight(s: Scenario): number {
    const T = this.tempOf(s);
    const frac = Math.max(0, Math.min(1, (T + 20) / 120));
    return frac * 50;
  }

  steamOpacity(s: Scenario): number {
    const T = this.tempOf(s);
    return Math.max(0, (T - 50) / 50);
  }

  steamPath(s: Scenario, idx: number): string {
    const phase = this.t() * 1.5 + idx * 1.8;
    const sx = -15 + idx * 15;
    const pts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const y = 30 - i * 7;
      const x = sx + 4 * Math.sin(phase + i * 0.7);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // Chart: x = t * 16, y = 20 - T * 1.1  (T=0 → y=20, T=100 → y=-90)
  tempY(T: number): number { return 20 - T * 1.1; }

  curvePath(s: Scenario): string {
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      const T = s.envTemp + (s.initialTemp - s.envTemp) * Math.exp(-this.k() * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 16).toFixed(1)} ${this.tempY(T).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
