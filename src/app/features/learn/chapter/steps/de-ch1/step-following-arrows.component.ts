import { Component, OnInit, OnDestroy, signal, computed, ElementRef, viewChild } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface OdePreset {
  id: string;
  label: string;
  f: (t: number, y: number) => number;
}

const PRESETS: OdePreset[] = [
  { id: 'exp-growth', label: 'dy/dt = y', f: (_t, y) => y },
  { id: 'exp-decay', label: 'dy/dt = −y', f: (_t, y) => -y },
  { id: 'linear', label: 'dy/dt = t − y', f: (t, y) => t - y },
  { id: 'logistic', label: 'dy/dt = y(1 − y)', f: (_t, y) => y * (1 - y) },
  { id: 'sinty', label: 'dy/dt = sin(ty)', f: (t, y) => Math.sin(t * y) },
];

interface TrajectoryColor {
  stroke: string;
  dot: string;
}

const TRAJ_COLORS: TrajectoryColor[] = [
  { stroke: '#c87b5e', dot: '#c87b5e' },
  { stroke: '#5a8aa8', dot: '#5a8aa8' },
  { stroke: '#8b6aa8', dot: '#8b6aa8' },
  { stroke: '#5ca878', dot: '#5ca878' },
  { stroke: '#a8895c', dot: '#a8895c' },
  { stroke: '#a85c7b', dot: '#a85c7b' },
];

interface Trajectory {
  pointsFwd: [number, number][];
  pointsBwd: [number, number][]; // already reversed: nearest-to-origin first
  color: TrajectoryColor;
  x0: number;
  y0: number;
  addedAt: number; // performance.now() when trajectory was created
  instant: boolean; // if true, draw fully without animation (for defaults)
}

// Pixel coords: 40 px per unit t, 25 px per unit y. Origin at svg (0,0).
const PX_PER_T = 40;
const PX_PER_Y = 25;
const T_MIN = -5;
const T_MAX = 5;
const Y_MIN = -5.6;
const Y_MAX = 5.6;

@Component({
  selector: 'app-de-ch1-following-arrows',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="解是順著箭頭走的曲線" subtitle="§1.3">
      <p>
        上一節的斜率場是「方程的地圖」。這一節我們終於要把它使用起來：
      </p>
      <p class="key-idea">
        挑一個起點 (t\u2080, y\u2080)，從那裡開始<strong>順著箭頭走</strong>。走出來的那條曲線，就是微分方程的<strong>解</strong>。
      </p>
      <p>
        這個「順著走」不是比喻——它就是幾何上真的那樣做。具體怎麼走？每走一小步，就讀一次目前所在點的斜率，
        讓下一小步沿著那個斜率方向前進。只要步長夠小，就能畫出很準的解曲線。這就是<strong>數值積分</strong>的精神。
      </p>
      <p>
        （我們這裡用的是 RK4，它是一個比簡單「歐拉法」更精準的版本。下面可視化幾乎看不到誤差。
        Part I 最後一章會專門講這件事。）
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點一下圖上任一個位置，看解曲線從那裡長出來">
      <div class="preset-picker">
        @for (p of presets; track p.id) {
          <button
            class="preset-btn"
            [class.active]="preset().id === p.id"
            (click)="switchPreset(p)"
          >
            {{ p.label }}
          </button>
        }
        <button class="clear-btn" (click)="clearTrajectories()">清除曲線</button>
      </div>

      <div class="field-wrap">
        <svg
          #svg
          viewBox="-220 -160 440 320"
          class="field-svg"
          (click)="handleClick($event)"
        >
          <!-- Grid -->
          @for (gx of gridTicks; track gx) {
            <line [attr.x1]="gx * 40" y1="-140" [attr.x2]="gx * 40" y2="140"
              stroke="var(--border)" stroke-width="0.5" />
          }
          @for (gy of gridTicks; track gy) {
            <line x1="-200" [attr.y1]="gy * 25" x2="200" [attr.y2]="gy * 25"
              stroke="var(--border)" stroke-width="0.5" />
          }

          <!-- Axes -->
          <line x1="-200" y1="0" x2="200" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
          <line x1="0" y1="-140" x2="0" y2="140" stroke="var(--border-strong)" stroke-width="1.2" />

          <text x="204" y="4" class="axis-lab">t</text>
          <text x="-6" y="-144" class="axis-lab">y</text>

          @for (k of [-4, -2, 2, 4]; track k) {
            <text [attr.x]="k * 40" y="14" class="tick">{{ k }}</text>
          }
          @for (k of [-4, -2, 2, 4]; track k) {
            <text [attr.x]="-6" [attr.y]="-k * 25 + 3" class="tick right">{{ k }}</text>
          }

          <!-- Slope field arrows (simpler: just short tangent lines) -->
          @for (a of arrows(); track a.key) {
            <line
              [attr.x1]="a.x1"
              [attr.y1]="a.y1"
              [attr.x2]="a.x2"
              [attr.y2]="a.y2"
              stroke="var(--border-strong)"
              stroke-width="1.2"
              stroke-linecap="round"
              opacity="0.55"
            />
          }

          <!-- Trajectories (animated draw) -->
          @for (tr of renderedTrajectories(); track $index) {
            <path
              [attr.d]="tr.path"
              fill="none"
              [attr.stroke]="tr.color.stroke"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- Origin point -->
            <circle
              [attr.cx]="tr.x0 * 40"
              [attr.cy]="-tr.y0 * 25"
              r="4.5"
              [attr.fill]="tr.color.dot"
              stroke="white"
              stroke-width="2"
            />
            <!-- Live drawing head (two points: forward & backward tips) -->
            @if (tr.drawing && tr.headFwd) {
              <circle
                [attr.cx]="tr.headFwd.x"
                [attr.cy]="tr.headFwd.y"
                r="4"
                [attr.fill]="tr.color.dot"
                opacity="0.85"
              />
            }
            @if (tr.drawing && tr.headBwd) {
              <circle
                [attr.cx]="tr.headBwd.x"
                [attr.cy]="tr.headBwd.y"
                r="3.5"
                [attr.fill]="tr.color.dot"
                opacity="0.55"
              />
            }
          }

          <!-- Hover indicator -->
          @if (hoverPoint()) {
            <circle
              [attr.cx]="hoverPoint()!.t * 40"
              [attr.cy]="-hoverPoint()!.y * 25"
              r="5"
              fill="none"
              stroke="var(--accent)"
              stroke-width="1.5"
              stroke-dasharray="3 2"
              opacity="0.7"
            />
          }
        </svg>
        <div class="field-caption">
          點一下圖上任一點 → RK4 從該點往前後各積分幾步，畫出整條解曲線。可以點很多次比較不同起點。
        </div>
      </div>

      <div class="status-row">
        <div class="status-cell">
          <span class="cell-k">方程</span>
          <code class="cell-v">dy/dt = {{ presetExprShort() }}</code>
        </div>
        <div class="status-cell">
          <span class="cell-k">解的數量</span>
          <span class="cell-v">{{ trajectories().length }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        多點幾個起點，你會發現幾件事：
      </p>
      <ul>
        <li><strong>曲線永遠不會交叉。</strong>若兩條解在某一點交叉，那個點就會同時有兩個不同的斜率——矛盾。</li>
        <li><strong>起點不同，解就不同。</strong>方程本身有無窮多組解，每個起點選出其中的一條。</li>
        <li><strong>曲線總是跟箭頭相切。</strong>這正是「解」的定義。</li>
      </ul>
      <p>
        這三件事合起來，就是我們接下來幾節要展開的三個主題：解族、初值問題、存在與唯一性。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        斜率場 + 一個起點 = 一條解曲線。解微分方程的幾何版本其實很直白——
        順著風走即可。後面章節要做的，是把這件事從「畫得出來」變成「用符號寫得出來」。
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

    .preset-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      align-items: center;
    }

    .preset-btn, .clear-btn {
      font: inherit;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 11px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      cursor: pointer;
      color: var(--text);
      transition: all 0.12s;
    }

    .preset-btn:hover, .clear-btn:hover { border-color: var(--accent); }
    .preset-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .clear-btn {
      margin-left: auto;
      font-family: inherit;
      color: var(--text-muted);
    }

    .field-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 12px;
    }

    .field-svg {
      width: 100%;
      display: block;
      cursor: crosshair;
      touch-action: manipulation;
    }

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

    .status-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 8px;
    }

    .status-cell {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cell-k {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .cell-v {
      font-size: 14px;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class DeCh1FollowingArrowsComponent implements OnInit, OnDestroy {
  readonly presets = PRESETS;
  readonly preset = signal<OdePreset>(PRESETS[3]);
  readonly trajectories = signal<Trajectory[]>([]);
  readonly hoverPoint = signal<{ t: number; y: number } | null>(null);

  readonly gridTicks = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  readonly presetExprShort = computed(() =>
    this.preset().label.replace('dy/dt = ', '')
  );

  readonly arrows = computed(() => {
    const f = this.preset().f;
    const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    for (let ti = -5; ti <= 5; ti += 1) {
      for (let yi = -5; yi <= 5; yi += 1) {
        const slope = f(ti, yi);
        const cx = ti * PX_PER_T;
        const cy = -yi * PX_PER_Y;

        // Visual slope handled for aspect ratio
        const vsSlope = (PX_PER_Y / PX_PER_T) * slope;
        const norm = Math.sqrt(1 + vsSlope * vsSlope);
        let dxSvg = PX_PER_T / norm;
        let dySvg = -PX_PER_Y * slope / norm;
        const len = Math.sqrt(dxSvg * dxSvg + dySvg * dySvg);
        const scale = 12 / len;
        dxSvg *= scale;
        dySvg *= scale;

        out.push({
          key: `${ti}_${yi}`,
          x1: cx - dxSvg,
          y1: cy - dySvg,
          x2: cx + dxSvg,
          y2: cy + dySvg,
        });
      }
    }
    return out;
  });

  readonly tick = signal(0);
  private rafId: number | null = null;
  private readonly DRAW_DURATION_MS = 900;

  // Default sample trajectories so the page looks alive on load
  constructor() {
    this.trajectories.set([
      this.buildTrajectory(-4, 0.1, 0, true),
      this.buildTrajectory(-4, 0.9, 1, true),
      this.buildTrajectory(-4, -0.5, 2, true),
    ]);
  }

  ngOnInit(): void {
    const loop = () => {
      // Only tick when we have an animating trajectory
      const list = this.trajectories();
      const now = performance.now();
      const stillDrawing = list.some(
        (tr) => !tr.instant && now - tr.addedAt < this.DRAW_DURATION_MS,
      );
      if (stillDrawing) {
        this.tick.set(now);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  switchPreset(p: OdePreset): void {
    this.preset.set(p);
    this.trajectories.set([]);
  }

  clearTrajectories(): void {
    this.trajectories.set([]);
  }

  handleClick(event: MouseEvent): void {
    const svg = this.svgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const t0 = inv.x / PX_PER_T;
    const y0 = -inv.y / PX_PER_Y;

    if (t0 < T_MIN || t0 > T_MAX || y0 < Y_MIN || y0 > Y_MAX) return;

    const next = [...this.trajectories()];
    const colorIdx = next.length % TRAJ_COLORS.length;
    next.push(this.buildTrajectory(t0, y0, colorIdx, false));
    this.trajectories.set(next);
    // Kick the tick so the RAF renders right away
    this.tick.set(performance.now());
  }

  readonly renderedTrajectories = computed(() => {
    // Read tick so this re-runs every animation frame
    this.tick();
    const now = performance.now();

    return this.trajectories().map((tr) => {
      const progress = tr.instant
        ? 1
        : Math.min(1, (now - tr.addedAt) / this.DRAW_DURATION_MS);

      // Ease-out: visually satisfying curve
      const eased = 1 - Math.pow(1 - progress, 2);

      const nFwd = Math.max(1, Math.floor(tr.pointsFwd.length * eased));
      const nBwd = Math.max(1, Math.floor(tr.pointsBwd.length * eased));

      const visibleFwd = tr.pointsFwd.slice(0, nFwd);
      const visibleBwd = tr.pointsBwd.slice(0, nBwd);

      // Combined path: reverse the backward portion so it flows into origin
      const combined: [number, number][] = [
        ...[...visibleBwd].reverse(),
        ...visibleFwd,
      ];

      const path = combined
        .map(([tt, yy], i) => {
          const x = tt * PX_PER_T;
          const py = -Math.max(
            -Y_MAX * PX_PER_Y - 20,
            Math.min(Y_MAX * PX_PER_Y + 20, yy * PX_PER_Y),
          );
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${py.toFixed(1)}`;
        })
        .join(' ');

      const drawing = !tr.instant && progress < 1;

      let headFwd: { x: number; y: number } | null = null;
      let headBwd: { x: number; y: number } | null = null;
      if (drawing) {
        const fwdTip = tr.pointsFwd[Math.min(nFwd - 1, tr.pointsFwd.length - 1)];
        const bwdTip = tr.pointsBwd[Math.min(nBwd - 1, tr.pointsBwd.length - 1)];
        if (fwdTip) headFwd = { x: fwdTip[0] * PX_PER_T, y: -fwdTip[1] * PX_PER_Y };
        if (bwdTip) headBwd = { x: bwdTip[0] * PX_PER_T, y: -bwdTip[1] * PX_PER_Y };
      }

      return {
        path,
        color: tr.color,
        x0: tr.x0,
        y0: tr.y0,
        drawing,
        headFwd,
        headBwd,
      };
    });
  });

  private buildTrajectory(
    t0: number,
    y0: number,
    colorIdx: number,
    instant: boolean,
  ): Trajectory {
    const f = this.preset().f;

    const pointsFwd: [number, number][] = [];
    const pointsBwd: [number, number][] = [];

    // Forward integration
    let t = t0, y = y0;
    const h = 0.02;
    pointsFwd.push([t, y]);
    while (t < T_MAX && Math.abs(y) < Y_MAX + 2) {
      const k1 = f(t, y);
      const k2 = f(t + h / 2, y + (h / 2) * k1);
      const k3 = f(t + h / 2, y + (h / 2) * k2);
      const k4 = f(t + h, y + h * k3);
      y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      t = t + h;
      if (!isFinite(y)) break;
      pointsFwd.push([t, y]);
    }

    // Backward integration (store nearest-to-origin first)
    t = t0; y = y0;
    while (t > T_MIN && Math.abs(y) < Y_MAX + 2) {
      const hb = -0.02;
      const k1 = f(t, y);
      const k2 = f(t + hb / 2, y + (hb / 2) * k1);
      const k3 = f(t + hb / 2, y + (hb / 2) * k2);
      const k4 = f(t + hb, y + hb * k3);
      y = y + (hb / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      t = t + hb;
      if (!isFinite(y)) break;
      pointsBwd.push([t, y]);
    }

    return {
      pointsFwd,
      pointsBwd,
      color: TRAJ_COLORS[colorIdx],
      x0: t0,
      y0,
      addedAt: performance.now(),
      instant,
    };
  }
}
