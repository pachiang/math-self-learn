import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface OdePreset {
  id: string;
  label: string;
  expr: string;
  desc: string;
  f: (t: number, y: number) => number;
}

const PRESETS: OdePreset[] = [
  {
    id: 'exp-growth',
    label: 'dy/dt = y',
    expr: 'f(t, y) = y',
    desc: '最基本的指數成長。斜率只跟 y 有關：y 越大，斜率越大。',
    f: (_t, y) => y,
  },
  {
    id: 'exp-decay',
    label: 'dy/dt = −y',
    expr: 'f(t, y) = −y',
    desc: '指數衰減。y > 0 時箭頭向下；y < 0 時箭頭向上——所有路線都被拉向 y = 0。',
    f: (_t, y) => -y,
  },
  {
    id: 'linear',
    label: 'dy/dt = t − y',
    expr: 'f(t, y) = t − y',
    desc: '會被「目標 y = t」吸引。箭頭同時依賴 t 跟 y。',
    f: (t, y) => t - y,
  },
  {
    id: 'logistic',
    label: 'dy/dt = y(1 − y)',
    expr: 'f(t, y) = y(1 − y)',
    desc: 'Logistic 方程——有承載量上限的成長。0 與 1 是兩條水平平衡。',
    f: (_t, y) => y * (1 - y),
  },
  {
    id: 'sinty',
    label: 'dy/dt = sin(t·y)',
    expr: 'f(t, y) = sin(t y)',
    desc: '看得出來，但解不出來。這是微分方程的常態，不是特例。',
    f: (t, y) => Math.sin(t * y),
  },
];

const PX_PER_T = 40;
const PX_PER_Y = 25;
const T_MIN = -5;
const T_MAX = 5;
const Y_MIN = -5.5;
const Y_MAX = 5.5;

interface Particle {
  t: number;
  y: number;
  age: number;
  lifetime: number;
  trail: Array<{ t: number; y: number }>;
}

const TRAIL_LEN = 18;
const N_PARTICLES = 45;

@Component({
  selector: 'app-de-ch1-slope-field',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="斜率場：方程的地圖" subtitle="§1.2">
      <p>
        上一節我們寫出了 <code>dy/dt = f(t, y)</code> 這樣的方程。但這個抽象式子到底在<strong>講什麼</strong>？
      </p>
      <p>
        想像你站在 (t, y) 平面的任一點。方程告訴你一件事：<strong>此刻你該往哪個方向走</strong>。
        既然 dy/dt 是斜率，那 f(t, y) 就是在這點上「下一步該走的方向」。
      </p>
      <p class="key-idea">
        把平面上每一個點 (t, y) 都畫一個小短箭頭，箭頭斜率 = f(t, y)。這張圖就叫<strong>斜率場</strong>（slope field）。
      </p>
      <p>
        這張圖的神奇之處：<strong>它把方程變成一張地圖</strong>。方程本身是符號，但斜率場是你的眼睛看得到的「風向」。
        解這個方程，就是找一條順著風走的曲線。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="滑鼠移到圖上任一點 → 看那個點的切線方向；或看粒子隨風流動">
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
        <button class="toggle-btn" (click)="toggleParticles()">
          {{ particlesOn() ? '⏸ 停止粒子' : '▶ 播放粒子' }}
        </button>
      </div>

      <div class="field-wrap">
        <svg
          #svg
          viewBox="-220 -160 440 320"
          class="field-svg"
          (mousemove)="onMouseMove($event)"
          (mouseleave)="onMouseLeave()"
          (touchmove)="onTouchMove($event)"
          (touchend)="onMouseLeave()"
        >
          <!-- Grid -->
          @for (gx of gridLines; track gx) {
            <line [attr.x1]="gx * 40" y1="-140" [attr.x2]="gx * 40" y2="140"
              stroke="var(--border)" stroke-width="0.5" />
          }
          @for (gy of gridLines; track gy) {
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

          <!-- Slope field arrows -->
          @for (arrow of arrows(); track arrow.key) {
            <line
              [attr.x1]="arrow.x1"
              [attr.y1]="arrow.y1"
              [attr.x2]="arrow.x2"
              [attr.y2]="arrow.y2"
              [attr.stroke]="arrow.color"
              stroke-width="1.4"
              stroke-linecap="round"
              opacity="0.75"
            />
          }

          <!-- Particle trails -->
          @for (p of particleRender(); track p.key) {
            <path
              [attr.d]="p.path"
              fill="none"
              [attr.stroke]="p.color"
              stroke-width="1.8"
              stroke-linecap="round"
              [attr.opacity]="p.opacity"
            />
            <circle
              [attr.cx]="p.headX"
              [attr.cy]="p.headY"
              r="2.2"
              [attr.fill]="p.color"
              [attr.opacity]="p.opacity"
            />
          }

          <!-- Hover tangent indicator -->
          @if (hover(); as h) {
            <g>
              <!-- Tangent line passing through hover point -->
              <line
                [attr.x1]="h.tangentX1"
                [attr.y1]="h.tangentY1"
                [attr.x2]="h.tangentX2"
                [attr.y2]="h.tangentY2"
                stroke="var(--accent)"
                stroke-width="2.8"
                stroke-linecap="round"
              />
              <!-- Hover point -->
              <circle
                [attr.cx]="h.px"
                [attr.cy]="h.py"
                r="5.5"
                fill="var(--accent)"
                stroke="white"
                stroke-width="2"
              />
              <!-- Tooltip -->
              <g [attr.transform]="'translate(' + (h.px + 12) + ', ' + (h.py - 16) + ')'">
                <rect x="0" y="-18" width="102" height="36" rx="5"
                  fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="1" opacity="0.97" />
                <text x="6" y="-4" class="tt">(t, y) = ({{ h.t.toFixed(1) }}, {{ h.y.toFixed(1) }})</text>
                <text x="6" y="11" class="tt strong">斜率 = {{ h.slope.toFixed(2) }}</text>
              </g>
            </g>
          }
        </svg>
        <div class="field-caption">
          粒子像羽毛，會被斜率場的「風」吹。滑鼠停在任何位置 → 出現藍色切線 = 該點要走的方向。
        </div>
      </div>

      <div class="info-panel">
        <div class="eq-display">
          <span class="eq-lead">目前的方程：</span>
          <code class="eq-code">dy/dt = {{ presetExpr() }}</code>
        </div>
        <p class="desc">{{ preset().desc }}</p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        試著切換不同的方程，眼睛去追<strong>粒子的流向</strong>：
      </p>
      <ul>
        <li><code>dy/dt = y</code>：粒子遠離 y = 0——正半邊拱上去，負半邊拱下去。</li>
        <li><code>dy/dt = −y</code>：粒子全部朝 y = 0 彙集。</li>
        <li><code>dy/dt = t − y</code>：粒子全都被斜對角線 y = t 吸引。</li>
        <li><code>dy/dt = y(1 − y)</code>：粒子夾在 y = 0 與 y = 1 之間擺動。</li>
        <li><code>dy/dt = sin(t y)</code>：粒子在波浪條紋中穿梭，肉眼就看出對稱。</li>
      </ul>
      <p>
        這些「花紋」完全是從方程<strong>機械地</strong>計算出來的：給我任意一個 (t, y)，我就能告訴你該點的斜率。
        你不需要「解」方程也能看到它的全貌。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        斜率場是微分方程的「視覺形式」。每個點的箭頭 = 方程在那個點上的當地命令。
        粒子的流動 = 解曲線的流動。下一節我們就讓你親自點擊一個起點，看整條解完整長出來。
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
      margin-bottom: 14px;
      align-items: center;
    }

    .preset-btn, .toggle-btn {
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

    .preset-btn:hover, .toggle-btn:hover { border-color: var(--accent); }
    .preset-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .toggle-btn {
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
      touch-action: none;
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

    .tt {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .tt.strong {
      fill: var(--accent);
      font-weight: 700;
    }

    .info-panel {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
    }

    .eq-display {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }

    .eq-lead { font-size: 12px; color: var(--text-muted); }

    .eq-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      color: var(--accent);
      background: var(--accent-10);
      padding: 3px 10px;
      border-radius: 6px;
    }

    .desc {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  `,
})
export class DeCh1SlopeFieldComponent implements OnInit, OnDestroy {
  readonly presets = PRESETS;
  readonly preset = signal<OdePreset>(PRESETS[3]);
  readonly presetExpr = computed(() => this.preset().expr.replace('f(t, y) = ', ''));

  readonly gridLines = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  readonly particlesOn = signal(true);
  readonly particles = signal<Particle[]>([]);
  readonly hover = signal<{
    t: number;
    y: number;
    px: number;
    py: number;
    slope: number;
    tangentX1: number;
    tangentY1: number;
    tangentX2: number;
    tangentY2: number;
  } | null>(null);

  private rafId: number | null = null;
  private lastFrame = 0;

  // Deterministic RNG for stable particle seeds
  private seed = 1;
  private rand(): number {
    this.seed = (this.seed * 16807 + 13) % 2147483647;
    return this.seed / 2147483647;
  }

  constructor() {
    this.seed = 42;
    this.initParticles();
  }

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.particlesOn()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.06, (now - this.lastFrame) / 1000);
        this.stepParticles(dt);
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
    this.initParticles();
  }

  toggleParticles(): void {
    this.particlesOn.set(!this.particlesOn());
  }

  private initParticles(): void {
    this.seed = 42;
    const list: Particle[] = [];
    for (let i = 0; i < N_PARTICLES; i++) {
      list.push(this.newParticle());
    }
    this.particles.set(list);
  }

  private newParticle(): Particle {
    const t = T_MIN + this.rand() * (T_MAX - T_MIN);
    const y = Y_MIN + this.rand() * (Y_MAX - Y_MIN);
    return {
      t,
      y,
      age: 0,
      lifetime: 2 + this.rand() * 3,
      trail: [{ t, y }],
    };
  }

  private stepParticles(dt: number): void {
    const f = this.preset().f;
    const list = this.particles();

    // Advection speed in "data-space": move at a pace that feels natural.
    const speed = 1.2;

    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const slope = f(p.t, p.y);

      // Unit vector in data space along the field direction (positive t direction)
      const norm = Math.sqrt(1 + slope * slope);
      const dTdt = 1 / norm;
      const dYdt = slope / norm;

      p.t += dTdt * speed * dt;
      p.y += dYdt * speed * dt;
      p.age += dt;

      p.trail.push({ t: p.t, y: p.y });
      if (p.trail.length > TRAIL_LEN) p.trail.shift();

      const out = p.t < T_MIN - 0.3 || p.t > T_MAX + 0.3
                || p.y < Y_MIN - 0.5 || p.y > Y_MAX + 0.5
                || p.age > p.lifetime
                || !isFinite(p.y);

      if (out) {
        list[i] = this.newParticle();
      }
    }

    this.particles.set([...list]);
  }

  readonly particleRender = computed(() => {
    const list = this.particles();
    return list.map((p, idx) => {
      const trail = p.trail;
      if (trail.length < 2) {
        return {
          key: idx,
          path: '',
          color: 'var(--text-muted)',
          opacity: 0,
          headX: 0,
          headY: 0,
        };
      }
      const pts = trail.map((pt, i) => {
        const x = pt.t * PX_PER_T;
        const y = -pt.y * PX_PER_Y;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ');

      const head = trail[trail.length - 1];
      const headX = head.t * PX_PER_T;
      const headY = -head.y * PX_PER_Y;

      // fade by age
      const ageFrac = p.age / p.lifetime;
      const opacity = Math.max(0, Math.min(1, 1 - ageFrac)) * 0.85;

      return {
        key: idx,
        path: pts,
        color: 'var(--accent)',
        opacity,
        headX,
        headY,
      };
    });
  });

  readonly arrows = computed(() => {
    const f = this.preset().f;
    const out: {
      key: string;
      x1: number; y1: number; x2: number; y2: number;
      color: string;
    }[] = [];

    for (let ti = -5; ti <= 5; ti += 1) {
      for (let yi = -5; yi <= 5; yi += 1) {
        const slope = f(ti, yi);
        const cx = ti * PX_PER_T;
        const cy = -yi * PX_PER_Y;

        const vsSlope = (PX_PER_Y / PX_PER_T) * slope;
        const norm = Math.sqrt(1 + vsSlope * vsSlope);
        let dxSvg = PX_PER_T / norm;
        let dySvg = -PX_PER_Y * slope / norm;
        const len = Math.sqrt(dxSvg * dxSvg + dySvg * dySvg);
        const scale = 10 / len;
        dxSvg *= scale;
        dySvg *= scale;

        let color = 'var(--text-muted)';
        if (slope > 0.15) color = '#c87b5e';
        else if (slope < -0.15) color = '#5a8aa8';

        out.push({
          key: `${ti}_${yi}`,
          x1: cx - dxSvg,
          y1: cy - dySvg,
          x2: cx + dxSvg,
          y2: cy + dySvg,
          color,
        });
      }
    }
    return out;
  });

  onMouseMove(event: MouseEvent): void {
    this.updateHover(event.clientX, event.clientY);
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 0) return;
    event.preventDefault();
    const touch = event.touches[0];
    this.updateHover(touch.clientX, touch.clientY);
  }

  onMouseLeave(): void {
    this.hover.set(null);
  }

  private updateHover(clientX: number, clientY: number): void {
    const svg = this.svgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const t = inv.x / PX_PER_T;
    const y = -inv.y / PX_PER_Y;

    if (t < T_MIN || t > T_MAX || y < Y_MIN || y > Y_MAX) {
      this.hover.set(null);
      return;
    }

    const slope = this.preset().f(t, y);
    const px = t * PX_PER_T;
    const py = -y * PX_PER_Y;

    // Unit SVG vector along the field direction at (t, y)
    const lenPx = 36;
    const dtSvg = PX_PER_T;
    const dySvg = -PX_PER_Y * slope;
    const mag = Math.sqrt(dtSvg * dtSvg + dySvg * dySvg);
    const ux = dtSvg / mag;
    const uy = dySvg / mag;

    this.hover.set({
      t, y, px, py, slope,
      tangentX1: px - ux * lenPx,
      tangentY1: py - uy * lenPx,
      tangentX2: px + ux * lenPx,
      tangentY2: py + uy * lenPx,
    });
  }
}
