import { Component, OnDestroy, OnInit, signal, computed, effect } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const PX_PER_T = 40;
const PX_PER_Y = 45;
const Y_CLIP = 140;

// Logistic equation: dy/dt = y(1 - y)
// Analytical solution through (0, y0):  y(t) = 1 / (1 + ((1 - y0)/y0) * e^{-t})
// Works for y0 > 0. For y0 <= 0 we integrate numerically.

function logisticAnalytic(y0: number, t: number): number {
  if (y0 > 0.0001) {
    const c = (1 - y0) / y0;
    return 1 / (1 + c * Math.exp(-t));
  }
  if (Math.abs(y0) < 0.0001) return 0;
  // y0 < 0: blows up in finite time going forward; use numerical RK4 fallback
  return rk4Integrate(y0, t);
}

function rk4Integrate(y0: number, targetT: number): number {
  const direction = targetT >= 0 ? 1 : -1;
  const h = 0.01 * direction;
  const steps = Math.ceil(Math.abs(targetT) / Math.abs(h));
  let y = y0;
  let t = 0;
  for (let i = 0; i < steps; i++) {
    const f = (_tt: number, yy: number) => yy * (1 - yy);
    const k1 = f(t, y);
    const k2 = f(t + h / 2, y + (h / 2) * k1);
    const k3 = f(t + h / 2, y + (h / 2) * k2);
    const k4 = f(t + h, y + h * k3);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + h;
    if (!isFinite(y) || Math.abs(y) > 10) break;
  }
  return y;
}

function buildCurvePath(y0: number, tMin: number, tMax: number, numPoints = 120): string {
  const pts: string[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = tMin + (i / numPoints) * (tMax - tMin);
    const y = logisticAnalytic(y0, t);
    const x = t * PX_PER_T;
    const py = -Math.max(-Y_CLIP - 10, Math.min(Y_CLIP + 10, y * PX_PER_Y));
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${py.toFixed(1)}`);
  }
  return pts.join(' ');
}

@Component({
  selector: 'app-de-ch1-ivp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="初值問題：從一族解中選一條" subtitle="§1.4">
      <p>
        我們已經知道，微分方程的解<strong>有很多</strong>——每個起點都對應一條不同的解曲線。這組所有解的集合，叫做<strong>解族</strong>（family of solutions）。
      </p>
      <p>
        但在實務上，你通常不是想要「所有」解。你想知道：「我今天手上有某個特定狀況，它會怎麼演變？」
        這時就要多給一個條件——<strong>初始值</strong>。
      </p>
      <p class="key-idea">
        <strong>微分方程 + 初始條件</strong>，稱為<strong>初值問題</strong>（Initial Value Problem, IVP）。
        寫成兩行：
      </p>
      <div class="ivp-box">
        <div class="ivp-line"><span class="ivp-k">方程</span><code>dy/dt = f(t, y)</code></div>
        <div class="ivp-line"><span class="ivp-k">初值</span><code>y(t\u2080) = y\u2080</code></div>
      </div>
      <p>
        方程本身描述「規則」，初值告訴你「從哪裡出發」。兩者合起來，就會<strong>唯一</strong>決定一條解曲線（在合理假設下，這就是存在唯一性定理）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 y(0) 的滑桿，看整族解當中的哪一條被選中">
      <div class="eq-banner">
        <span class="banner-k">這一頁使用的方程：</span>
        <code class="banner-v">dy/dt = y(1 − y)</code>
        <span class="banner-note">（Logistic 方程，描述有承載量的族群成長）</span>
      </div>

      <div class="field-wrap">
        <svg viewBox="-220 -180 440 320" class="field-svg">
          <!-- Grid -->
          @for (gx of [-4, -3, -2, -1, 1, 2, 3, 4]; track gx) {
            <line [attr.x1]="gx * 40" y1="-160" [attr.x2]="gx * 40" y2="140"
              stroke="var(--border)" stroke-width="0.5" />
          }
          @for (gy of [-2, -1, 1, 2, 3]; track gy) {
            <line x1="-200" [attr.y1]="-gy * 45" x2="200" [attr.y2]="-gy * 45"
              stroke="var(--border)" stroke-width="0.5" />
          }

          <!-- Equilibria: y = 0 and y = 1 -->
          <line x1="-200" y1="0" x2="200" y2="0"
            stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 3" opacity="0.6" />
          <line x1="-200" y1="-45" x2="200" y2="-45"
            stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 3" opacity="0.6" />
          <text x="-206" y="3" class="eq-lab">y=0</text>
          <text x="-206" y="-42" class="eq-lab">y=1</text>

          <!-- Axes -->
          <line x1="-200" y1="-160" x2="-200" y2="140" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="-200" y1="0" x2="200" y2="0" stroke="none" />
          <line x1="0" y1="-160" x2="0" y2="140" stroke="var(--border-strong)" stroke-width="1.2" />

          <text x="204" y="4" class="axis-lab">t</text>
          <text x="-6" y="-164" class="axis-lab">y</text>

          <!-- Tick labels -->
          @for (k of [-4, -2, 2, 4]; track k) {
            <text [attr.x]="k * 40" y="14" class="tick">{{ k }}</text>
          }
          <text x="-6" y="-42" class="tick right">1</text>
          <text x="-6" y="-87" class="tick right">2</text>
          <text x="-6" y="48" class="tick right">-1</text>

          <!-- Ghost family -->
          @for (c of familyCurves; track c.y0) {
            <path
              [attr.d]="c.path"
              fill="none"
              stroke="var(--text-muted)"
              stroke-width="1"
              opacity="0.28"
            />
          }

          <!-- Highlighted solution -->
          <path
            [attr.d]="selectedCurve()"
            fill="none"
            stroke="var(--accent)"
            stroke-width="2.8"
            stroke-linejoin="round"
          />

          <!-- Initial point marker -->
          <line
            x1="0"
            [attr.y1]="-y0() * 45"
            x2="-6"
            [attr.y2]="-y0() * 45"
            stroke="var(--accent)"
            stroke-width="1.5"
          />
          <circle
            cx="0"
            [attr.cy]="-y0() * 45"
            r="4.5"
            fill="none"
            stroke="var(--accent)"
            stroke-width="1.5"
            opacity="0.7"
          />
          <text x="10" [attr.y]="-y0() * 45 - 8" class="pt-lab">
            y(0) = {{ y0().toFixed(2) }}
          </text>

          <!-- Vertical playhead -->
          <line
            [attr.x1]="t() * 40"
            y1="-160"
            [attr.x2]="t() * 40"
            y2="140"
            stroke="var(--accent)"
            stroke-width="1"
            stroke-dasharray="3 2"
            opacity="0.35"
          />

          <!-- Rolling ball on the curve -->
          <g [attr.transform]="'translate(' + (t() * 40) + ', ' + (-currentBallY() * 45) + ')'">
            <circle r="8" fill="var(--accent)" opacity="0.25" />
            <circle r="5.5" fill="var(--accent)" stroke="white" stroke-width="2" />
          </g>

          <!-- Current-value readout -->
          <g [attr.transform]="'translate(' + (Math.min(t() * 40 + 10, 160)) + ', ' + (-currentBallY() * 45 - 14) + ')'">
            <rect x="-2" y="-11" width="78" height="22" rx="4"
              fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="0.8" opacity="0.96" />
            <text x="2" y="4" class="live-lab">
              t = {{ t().toFixed(1) }}
            </text>
            <text x="38" y="4" class="live-lab strong">
              y = {{ currentBallY().toFixed(2) }}
            </text>
          </g>
        </svg>
        <div class="field-caption">
          灰色：整個解族。紅色：你現在選的那一條。按 ▶ 讓球從 (0, y₀) 沿著解滾到 y = 1。
        </div>
      </div>

      <div class="slider-panel">
        <div class="sl">
          <span class="sl-lab">y(0) =</span>
          <input type="range" min="-0.3" max="2.5" step="0.05" [value]="y0()"
            (input)="onY0Change($event)" />
          <span class="sl-val">{{ y0().toFixed(2) }}</span>
        </div>

        <div class="time-ctrl">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="resetT()">↻ 從頭</button>
          <div class="t-slider">
            <span class="t-lab">t =</span>
            <input type="range" min="0" max="4" step="0.02" [value]="t()"
              (input)="onTChange($event)" />
            <span class="t-val">{{ t().toFixed(2) }}</span>
          </div>
        </div>

        <div class="behavior-hint" [class.above]="behavior() === 'above'"
          [class.between]="behavior() === 'between'" [class.zero]="behavior() === 'zero'"
          [class.negative]="behavior() === 'negative'">
          <strong>這個初值的結局：</strong>
          @switch (behavior()) {
            @case ('zero') { 停留在 y = 0（不穩定平衡） }
            @case ('above') { 從上方被拉向 y = 1 }
            @case ('between') { 從下方單調爬升到 y = 1 }
            @case ('negative') { 跑向 −∞（不在生物情境中有意義） }
          }
        </div>
      </div>

      <div class="insight-grid">
        <div class="insight">
          <strong>整個解族</strong>
          <p>Logistic 方程無窮多組解，每個 y(0) 值對應一條。把它們全部畫出來，就是一幅 y = 0 與 y = 1 之間的「吸引流」。</p>
        </div>
        <div class="insight">
          <strong>選出一條</strong>
          <p>一旦你給出 y(0)，那一族曲線中就只有一條通過 (0, y(0)) ——它就是這個初值問題的解。</p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意這個事實：
      </p>
      <p class="key-idea">
        <strong>同一個方程 + 不同的初值 = 不同的「未來」。</strong>
        方程是普適的規律，初值則是你這次具體面對的世界。
      </p>
      <p>
        這也解釋了為什麼在物理、工程、生態、金融裡，你一定要量測「現況」——因為有了規律還不夠，
        一定要有初值才能預測未來。
      </p>
      <p>
        你可能會問：<em>「那會不會兩條解在某個點相交？那豈不是一個初值就對應兩條解？」</em>
        這是個好問題。答案是：<strong>在合理的條件下不會</strong>。這條保證叫做
        <strong>存在唯一性定理</strong>（Picard-Lindelöf），它告訴我們只要 f(t, y) 夠「光滑」，
        每個初值就精確對應一條解。這門課 Ch4 會正式證明。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        微分方程是「規則」，初值是「出發點」。兩者合起來 = 唯一一條解曲線。
        這個結構貫穿整門課：我們接下來看到的所有 ODE——彈簧、電路、行星軌道——都是某個 IVP。
      </p>
    </app-prose-block>
  `,
  styles: `
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

    .ivp-box {
      padding: 14px 18px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin: 12px 0;
    }

    .ivp-line {
      display: grid;
      grid-template-columns: 60px 1fr;
      align-items: baseline;
      gap: 12px;
      padding: 4px 0;
    }

    .ivp-k {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .ivp-line code {
      font-size: 15px;
      padding: 3px 10px;
    }

    .eq-banner {
      padding: 10px 14px;
      border: 1px solid var(--accent-30);
      background: var(--accent-10);
      border-radius: 10px;
      margin-bottom: 14px;
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
    }

    .banner-k { font-size: 12px; color: var(--text-muted); }
    .banner-v {
      font-size: 15px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      background: transparent;
    }
    .banner-note { font-size: 11px; color: var(--text-muted); }

    .field-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 12px;
    }

    .field-svg { width: 100%; display: block; }

    .field-caption {
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .axis-lab {
      font-size: 12px;
      fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }
    .tick.right { text-anchor: end; }

    .eq-lab {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: end;
      font-family: 'JetBrains Mono', monospace;
    }

    .pt-lab {
      font-size: 11px;
      fill: var(--accent);
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .live-lab {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
    .live-lab.strong { fill: var(--accent); font-weight: 700; }

    .time-ctrl {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .play-btn, .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn {
      background: transparent;
      color: var(--accent);
    }

    .play-btn:hover, .reset-btn:hover { opacity: 0.85; }

    .t-slider {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 160px;
    }

    .t-lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'Noto Sans Math', serif;
    }

    .t-slider input { flex: 1; accent-color: var(--accent); }

    .t-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 40px;
      text-align: right;
    }

    .slider-panel {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
      margin-bottom: 14px;
    }

    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .sl-lab {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      min-width: 54px;
      font-family: 'Noto Sans Math', serif;
    }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val {
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .behavior-hint {
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--bg);
      border: 1px solid var(--border);
    }

    .behavior-hint strong {
      color: var(--text);
      margin-right: 4px;
    }

    .behavior-hint.between { border-color: rgba(90, 138, 90, 0.4); }
    .behavior-hint.above { border-color: rgba(90, 138, 168, 0.4); }
    .behavior-hint.negative { border-color: rgba(160, 90, 90, 0.4); }

    .insight-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .insight {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .insight strong {
      display: block;
      font-size: 13px;
      color: var(--accent);
      margin-bottom: 6px;
    }

    .insight p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    @media (max-width: 560px) {
      .insight-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class DeCh1IvpComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly y0 = signal(0.2);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;

  readonly familyCurves = [
    0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.6, 2.0, 2.4,
  ].map((y0v) => ({ y0: y0v, path: buildCurvePath(y0v, -4.5, 4.5) }));

  readonly selectedCurve = computed(() => buildCurvePath(this.y0(), -4.5, 4.5));

  readonly currentBallY = computed(() => logisticAnalytic(this.y0(), this.t()));

  readonly behavior = computed<'zero' | 'above' | 'between' | 'negative'>(() => {
    const y = this.y0();
    if (Math.abs(y) < 0.01) return 'zero';
    if (y < 0) return 'negative';
    if (y < 1) return 'between';
    return 'above';
  });

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 0.8;
        if (newT >= 4) {
          this.t.set(4);
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
    if (this.t() >= 3.95) this.t.set(0);
    this.playing.set(!this.playing());
  }

  resetT(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  onTChange(event: Event): void {
    this.t.set(+(event.target as HTMLInputElement).value);
    this.playing.set(false);
  }

  onY0Change(event: Event): void {
    this.y0.set(+(event.target as HTMLInputElement).value);
    // When y(0) changes, reset ball to t=0 of new curve
    this.t.set(0);
  }
}
