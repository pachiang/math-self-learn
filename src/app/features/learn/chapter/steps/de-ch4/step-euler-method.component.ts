import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface OdePreset {
  id: string;
  label: string;
  f: (t: number, y: number) => number;
  trueSol: (t0: number, y0: number, t: number) => number;
  t0: number;
  y0: number;
  tEnd: number;
  yRange: [number, number];
}

const PRESETS: OdePreset[] = [
  {
    id: 'exp',
    label: 'dy/dt = y',
    f: (_t, y) => y,
    trueSol: (t0, y0, t) => y0 * Math.exp(t - t0),
    t0: 0,
    y0: 1,
    tEnd: 2,
    yRange: [0, 8],
  },
  {
    id: 'logistic',
    label: 'dy/dt = y(1 − y)',
    f: (_t, y) => y * (1 - y),
    trueSol: (t0, y0, t) => {
      const c = (1 - y0) / Math.max(1e-9, y0);
      return 1 / (1 + c * Math.exp(-(t - t0)));
    },
    t0: 0,
    y0: 0.1,
    tEnd: 6,
    yRange: [0, 1.3],
  },
  {
    id: 'oscillation',
    label: 'dy/dt = cos(t)',
    f: (t, _y) => Math.cos(t),
    trueSol: (t0, y0, t) => y0 + Math.sin(t) - Math.sin(t0),
    t0: 0,
    y0: 0,
    tEnd: 6,
    yRange: [-1.5, 1.5],
  },
];

const PX_PER_T = 55;

@Component({
  selector: 'app-de-ch4-euler',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Euler 法的幾何" subtitle="§4.2">
      <p>
        大多數 ODE 無法用公式寫出解（Ch1 §1.5 的觀察）。我們只能<strong>用電腦一步步算</strong>。
        最原始、最直觀的數值積分法叫<strong>Euler 法</strong>——它就是「把斜率場當地圖，照著走」。
      </p>
      <p class="key-idea">
        <strong>Euler 法的精神：</strong>
        在任一點 (t, y)，下一步就用<strong>當下的斜率</strong> f(t, y) 直直走一步。走完一小步，再讀當地的斜率，再走。
      </p>
      <p>
        公式寫出來就是：
      </p>
      <div class="centered-eq big">
        y(n+1) = y(n) + h · f(t(n), y(n))
      </div>
      <div class="centered-eq">
        t(n+1) = t(n) + h
      </div>
      <p>
        <strong>h</strong> 是步長（step size）。步長越小，走得越細；但要走的次數越多。
        這個 trade-off 是所有數值方法的核心。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="按「走一步」觀察 Euler 怎麼沿著斜率場前進；或直接按播放看整條軌跡">
      <div class="preset-row">
        @for (p of presets; track p.id) {
          <button class="pre-btn" [class.active]="preset().id === p.id"
            (click)="switchPreset(p)">{{ p.label }}</button>
        }
      </div>

      <!-- Main plot -->
      <div class="plot-wrap">
        <svg [attr.viewBox]="viewBox()" class="plot-svg">
          <!-- Grid -->
          @for (g of gridV(); track g) {
            <line [attr.x1]="g.x" [attr.y1]="ab().yMin"
              [attr.x2]="g.x" [attr.y2]="ab().yMax"
              stroke="var(--border)" stroke-width="0.4" opacity="0.55" />
          }
          @for (g of gridH(); track g) {
            <line [attr.x1]="ab().xMin" [attr.y1]="g.y"
              [attr.x2]="ab().xMax" [attr.y2]="g.y"
              stroke="var(--border)" stroke-width="0.4" opacity="0.55" />
          }
          <line [attr.x1]="ab().xMin" y1="0"
            [attr.x2]="ab().xMax" y2="0"
            stroke="var(--border-strong)" stroke-width="1" />
          <line [attr.x1]="preset().t0 * 55"
            [attr.y1]="ab().yMin"
            [attr.x2]="preset().t0 * 55"
            [attr.y2]="ab().yMax"
            stroke="var(--border-strong)" stroke-width="1" />

          <!-- Slope field -->
          @for (a of arrows(); track a.k) {
            <line [attr.x1]="a.x1" [attr.y1]="a.y1"
              [attr.x2]="a.x2" [attr.y2]="a.y2"
              stroke="var(--text-muted)" stroke-width="1"
              stroke-linecap="round" opacity="0.5" />
          }

          <!-- True solution (reference, green) -->
          <path [attr.d]="truePath()" fill="none"
            stroke="#5ca878" stroke-width="2" opacity="0.85" />

          <!-- Euler polyline (current steps so far) -->
          @if (eulerRenderedSegments().length > 0) {
            <path [attr.d]="eulerPathSoFar()" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />
          }

          <!-- Euler step markers (visible done steps) -->
          @for (pt of eulerPointsSoFar(); track $index) {
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3"
              fill="var(--accent)" stroke="white" stroke-width="1" />
          }

          <!-- Next step preview (arrow showing what Euler will do next) -->
          @if (nextStepPreview(); as p) {
            <g>
              <line [attr.x1]="p.fromX" [attr.y1]="p.fromY"
                [attr.x2]="p.toX" [attr.y2]="p.toY"
                stroke="#c87b5e" stroke-width="2.2"
                marker-end="url(#euler-arrow)"
                stroke-dasharray="4 2" />
              <circle [attr.cx]="p.toX" [attr.cy]="p.toY" r="3.5"
                fill="none" stroke="#c87b5e" stroke-width="1.5" />
              <text [attr.x]="p.fromX + 8" [attr.y]="p.fromY - 8"
                class="preview-lab">
                斜率 f = {{ p.slope.toFixed(2) }}
              </text>
            </g>
          }

          <defs>
            <marker id="euler-arrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <polygon points="0 0, 6 2.5, 0 5" fill="#c87b5e" />
            </marker>
          </defs>

          <!-- Axes labels -->
          <text [attr.x]="ab().xMax - 4" y="12" class="ax">t</text>
          <text [attr.x]="preset().t0 * 55 - 6" [attr.y]="ab().yMin + 12" class="ax">y</text>
        </svg>

        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>真實解</span>
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>Euler 軌跡</span>
          <span class="leg"><span class="leg-dot dashed" style="background:#c87b5e"></span>下一步預覽</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="row">
          <button class="step-btn" (click)="takeStep()" [disabled]="isDone()">
            → 走一步
          </button>
          <button class="play-btn" (click)="togglePlay()" [disabled]="isDone()">
            {{ playing() ? '⏸ 暫停' : '▶ 自動走' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重新開始</button>
        </div>

        <div class="sl">
          <span class="sl-lab">步長 h</span>
          <input type="range" min="0.02" max="1" step="0.01"
            [value]="h()" (input)="onHChange($event)" />
          <span class="sl-val">{{ h().toFixed(2) }}</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">當前步數</span>
            <strong>{{ stepsTaken() }} / {{ totalSteps() }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">Euler 目前值</span>
            <strong>{{ currentY().toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">真實值</span>
            <strong style="color:#5ca878">{{ trueCurrentY().toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">累積誤差 |Δ|</span>
            <strong [class.warn]="Math.abs(currentY() - trueCurrentY()) > 0.15">
              {{ Math.abs(currentY() - trueCurrentY()).toFixed(3) }}
            </strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察：
      </p>
      <ul>
        <li><strong>步長越小，Euler 越貼合真解</strong>。把 h 從 0.5 拉到 0.1，差異肉眼看得出來。</li>
        <li><strong>但 Euler 天生傾向「切線的延長」，永遠會略過曲率彎的地方</strong>——
          看指數成長案例，Euler 永遠<em>低估</em>實際值（因為曲線是凹上的）。</li>
        <li><strong>誤差會累積</strong>。每一步都多一點偏差，後面的步會從錯的位置開始再算——誤差像滾雪球。</li>
      </ul>
      <p>
        這就是 Euler 的本質問題：它只看「當下的斜率」，沒有考慮下一步<em>斜率也會變</em>。
        下一節我們會量化這個誤差；再下一節看 RK 方法怎麼聰明地修正。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Euler 法 = 讀斜率、直直走一步、重複。它的美在於極度簡單；它的問題是太笨——
        永遠順著當下切線前進，碰到彎曲就落後。
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

    .preset-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .pre-btn {
      font: inherit;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 11px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
    }

    .pre-btn:hover { border-color: var(--accent); }
    .pre-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .plot-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .plot-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .preview-lab {
      font-size: 10px;
      fill: #c87b5e;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .legend {
      display: flex;
      gap: 16px;
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
      border-top: 2px dashed;
      height: 0;
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
      flex-wrap: wrap;
    }

    .step-btn, .play-btn, .reset-btn {
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
    .step-btn:disabled, .play-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
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
      min-width: 44px;
      text-align: right;
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 6px;
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

    .ro strong.warn { color: #c87b5e; }
  `,
})
export class DeCh4EulerComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly preset = signal<OdePreset>(PRESETS[0]);
  readonly h = signal(0.3);
  readonly stepsTaken = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;
  private readonly STEP_INTERVAL = 500; // ms per auto step
  private nextStepTime = 0;

  // Compute pixels per y unit based on yRange
  pxPerY(): number {
    const [yMin, yMax] = this.preset().yRange;
    return Math.min(60, 160 / (yMax - yMin));
  }

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        if (now >= this.nextStepTime) {
          if (this.stepsTaken() >= this.totalSteps()) {
            this.playing.set(false);
          } else {
            this.stepsTaken.set(this.stepsTaken() + 1);
            this.nextStepTime = now + this.STEP_INTERVAL;
          }
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

  switchPreset(p: OdePreset): void {
    this.preset.set(p);
    this.stepsTaken.set(0);
    this.playing.set(false);
  }

  onHChange(ev: Event): void {
    this.h.set(+(ev.target as HTMLInputElement).value);
    this.stepsTaken.set(0);
    this.playing.set(false);
  }

  takeStep(): void {
    if (this.stepsTaken() >= this.totalSteps()) return;
    this.stepsTaken.set(this.stepsTaken() + 1);
  }

  togglePlay(): void {
    if (this.stepsTaken() >= this.totalSteps()) {
      this.stepsTaken.set(0);
    }
    this.playing.set(!this.playing());
    this.nextStepTime = performance.now() + 100;
  }

  reset(): void {
    this.stepsTaken.set(0);
    this.playing.set(false);
  }

  readonly totalSteps = computed(() => {
    const p = this.preset();
    return Math.ceil((p.tEnd - p.t0) / this.h());
  });

  readonly isDone = computed(() => this.stepsTaken() >= this.totalSteps());

  /**
   * Full precomputed Euler points for current h.
   */
  readonly allEulerPoints = computed(() => {
    const p = this.preset();
    const h = this.h();
    const pts: Array<[number, number]> = [[p.t0, p.y0]];
    let t = p.t0, y = p.y0;
    const n = this.totalSteps();
    for (let i = 0; i < n; i++) {
      y = y + h * p.f(t, y);
      t = t + h;
      pts.push([t, y]);
    }
    return pts;
  });

  readonly eulerPointsSoFar = computed(() => {
    const all = this.allEulerPoints();
    const n = this.stepsTaken() + 1;
    const pxY = this.pxPerY();
    return all.slice(0, n).map(([t, y]) => ({
      x: t * PX_PER_T,
      y: -y * pxY,
    }));
  });

  readonly eulerRenderedSegments = computed(() => {
    return this.eulerPointsSoFar();
  });

  readonly eulerPathSoFar = computed(() => {
    const pts = this.eulerPointsSoFar();
    if (pts.length < 2) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  });

  readonly currentY = computed(() => {
    const all = this.allEulerPoints();
    return all[Math.min(this.stepsTaken(), all.length - 1)][1];
  });

  readonly currentT = computed(() => {
    const all = this.allEulerPoints();
    return all[Math.min(this.stepsTaken(), all.length - 1)][0];
  });

  readonly trueCurrentY = computed(() => {
    const p = this.preset();
    return p.trueSol(p.t0, p.y0, this.currentT());
  });

  readonly nextStepPreview = computed(() => {
    if (this.isDone()) return null;
    const p = this.preset();
    const h = this.h();
    const [t, y] = this.allEulerPoints()[this.stepsTaken()];
    const slope = p.f(t, y);
    const pxY = this.pxPerY();
    return {
      fromX: t * PX_PER_T,
      fromY: -y * pxY,
      toX: (t + h) * PX_PER_T,
      toY: -(y + h * slope) * pxY,
      slope,
    };
  });

  readonly truePath = computed(() => {
    const p = this.preset();
    const pxY = this.pxPerY();
    const pts: string[] = [];
    const n = 100;
    for (let i = 0; i <= n; i++) {
      const t = p.t0 + (i / n) * (p.tEnd - p.t0);
      const y = p.trueSol(p.t0, p.y0, t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-y * pxY).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly ab = computed(() => {
    const p = this.preset();
    const pxY = this.pxPerY();
    return {
      xMin: p.t0 * PX_PER_T - 6,
      xMax: p.tEnd * PX_PER_T + 6,
      yMin: -p.yRange[1] * pxY - 6,
      yMax: -p.yRange[0] * pxY + 6,
    };
  });

  readonly viewBox = computed(() => {
    const b = this.ab();
    const pad = 16;
    return `${b.xMin - pad} ${b.yMin - pad} ${b.xMax - b.xMin + 2 * pad} ${b.yMax - b.yMin + 2 * pad}`;
  });

  readonly gridV = computed(() => {
    const p = this.preset();
    const lines: { x: number }[] = [];
    for (let t = Math.ceil(p.t0); t <= Math.floor(p.tEnd); t++) {
      lines.push({ x: t * PX_PER_T });
    }
    return lines;
  });

  readonly gridH = computed(() => {
    const p = this.preset();
    const pxY = this.pxPerY();
    const lines: { y: number }[] = [];
    for (let y = Math.ceil(p.yRange[0]); y <= Math.floor(p.yRange[1]); y++) {
      lines.push({ y: -y * pxY });
    }
    return lines;
  });

  readonly arrows = computed(() => {
    const p = this.preset();
    const pxY = this.pxPerY();
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i <= 10; i++) {
      for (let j = 0; j <= 8; j++) {
        const t = p.t0 + (i / 10) * (p.tEnd - p.t0);
        const y = p.yRange[0] + (j / 8) * (p.yRange[1] - p.yRange[0]);
        const slope = p.f(t, y);
        if (!isFinite(slope)) continue;
        const cx = t * PX_PER_T;
        const cy = -y * pxY;
        const dx = PX_PER_T;
        const dy = -pxY * slope;
        const len = Math.sqrt(dx * dx + dy * dy);
        const s = 9 / len;
        out.push({
          k: `${i}_${j}`,
          x1: cx - dx * s, y1: cy - dy * s,
          x2: cx + dx * s, y2: cy + dy * s,
        });
      }
    }
    return out;
  });
}
