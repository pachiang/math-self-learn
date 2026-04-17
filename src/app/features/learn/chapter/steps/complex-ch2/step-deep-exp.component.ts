import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cExp, cAbs, cFromPolar,
  PlaneView, toSvg, axesPath,
} from '../complex-ch1/complex-util';

/* ── Views ── */
const LEFT_VIEW: PlaneView = { cx: 0, cy: Math.PI, radius: 4, svgW: 250, svgH: 250, pad: 20 };
const RIGHT_VIEW: PlaneView = { cx: 0, cy: 0, radius: 4, svgW: 250, svgH: 250, pad: 20 };

/* ── Academic color palette (muted) ── */
const WARM = ['#8a5a5a', '#8a6a4a', '#8a7a4a', '#7a5a6a', '#9a6a5a'];
const COOL = ['#4a6a8a', '#5a7a7a', '#4a7a6a', '#5a6a8a', '#6a7a9a'];
const COLORS = [
  '#7a6e8a', // muted purple
  '#6a8a7a', // muted teal
  '#8a7a5a', // muted gold
  '#5a7a8a', // muted steel
  '#8a5a6a', // muted rose
  '#5a8a5a', // muted green
  '#7a5a8a', // muted violet
  '#8a6a5a', // muted sienna
];

/* ── Preset definitions ── */
interface Preset {
  label: string;
  desc: string;
  hasSlider: boolean;
  sliderLabel?: string;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderDefault?: number;
  leftView: PlaneView;
  rightView: PlaneView;
}

const PRESETS: Preset[] = [
  {
    label: '水平線 \u2192 射線',
    desc: '水平線 Im(z)=c（x 變化）映射為從原點出發的射線 arg(w)=c。模 |w|=e\u02E3 隨 x 變化，但角度 c 固定。',
    hasSlider: true, sliderLabel: '線數', sliderMin: 3, sliderMax: 8, sliderStep: 1, sliderDefault: 5,
    leftView: { cx: 0, cy: Math.PI / 2, radius: 3, svgW: 250, svgH: 250, pad: 20 },
    rightView: RIGHT_VIEW,
  },
  {
    label: '垂直線 \u2192 同心圓',
    desc: '垂直線 Re(z)=c（y 變化）映射為半徑 e\u1D9C 的圓。模固定為 e\u1D9C，角度 y 繞一整圈。',
    hasSlider: true, sliderLabel: '線數', sliderMin: 3, sliderMax: 8, sliderStep: 1, sliderDefault: 5,
    leftView: { cx: 0, cy: Math.PI, radius: 3, svgW: 250, svgH: 250, pad: 20 },
    rightView: RIGHT_VIEW,
  },
  {
    label: '基本帶 0\u2264Im<2\u03C0',
    desc: '高度 2\u03C0 的水平帶 [-2,2]\u00D7[0,2\u03C0] 經過 e\u1DBB 映射後覆蓋了整個 w 平面（不含原點）。這就是指數函數的基本域。',
    hasSlider: true, sliderLabel: '網格密度', sliderMin: 3, sliderMax: 10, sliderStep: 1, sliderDefault: 6,
    leftView: LEFT_VIEW,
    rightView: RIGHT_VIEW,
  },
  {
    label: '兩個週期',
    desc: '兩條帶 [0,2\u03C0] 和 [2\u03C0,4\u03C0] 映射到完全相同的輸出。暖色和冷色分別標記兩條帶——它們在 w 平面重疊，說明 e\u1DBB 有週期 2\u03C0i。',
    hasSlider: false,
    leftView: { cx: 0, cy: 2 * Math.PI, radius: 5, svgW: 250, svgH: 250, pad: 20 },
    rightView: { cx: 0, cy: 0, radius: 5, svgW: 250, svgH: 250, pad: 20 },
  },
  {
    label: '左半平面 \u2192 單位圓內',
    desc: 'Re(z)<0 時 |e\u1DBB|=e\u02E3<1，所以左半平面全部映入單位圓內部。Re(z)=0（虛軸）映到單位圓本身。',
    hasSlider: true, sliderLabel: '網格密度', sliderMin: 3, sliderMax: 10, sliderStep: 1, sliderDefault: 5,
    leftView: { cx: -1.5, cy: 0, radius: 3, svgW: 250, svgH: 250, pad: 20 },
    rightView: { cx: 0, cy: 0, radius: 2, svgW: 250, svgH: 250, pad: 20 },
  },
];

/* ── Helpers ── */
const N_SAMPLES = 240;

function buildPath(v: PlaneView, pts: C[], maxJump = 1.5): string {
  let d = '';
  let drawing = false;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!isFinite(p[0]) || !isFinite(p[1]) || cAbs(p) > 50) {
      drawing = false;
      continue;
    }
    const [sx, sy] = toSvg(v, p);
    if (!drawing) {
      d += `M${sx.toFixed(1)},${sy.toFixed(1)}`;
      drawing = true;
    } else {
      const prev = pts[i - 1];
      const dist = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      if (dist > maxJump) {
        d += `M${sx.toFixed(1)},${sy.toFixed(1)}`;
      } else {
        d += `L${sx.toFixed(1)},${sy.toFixed(1)}`;
      }
    }
  }
  return d;
}

function circlePoints(cx: number, cy: number, r: number, n: number): C[] {
  const pts: C[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return pts;
}

function rayPoints(angle: number, rMin: number, rMax: number, n: number): C[] {
  const pts: C[] = [];
  for (let i = 0; i <= n; i++) {
    const r = rMin + (rMax - rMin) * (i / n);
    pts.push(cFromPolar(r, angle));
  }
  return pts;
}

@Component({
  selector: 'app-step-deep-exp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="深入 e\u1DBB：指數映射的週期性" subtitle="&sect;2.8">
      <p>
        把 z 寫成
        <app-math [e]="'z = x + iy'" />，
        則
        <app-math [e]="'e^z = e^x \\\\cdot (\\\\cos y + i\\\\sin y)'" />
        ——實部控制模，虛部控制角度。
      </p>
      <app-math block [e]="mainFormula" />
      <p>關鍵結果：</p>
      <ul>
        <li>水平線 Im(z)=c（x 變化）：模 = e\u02E3 變化，角 = c 固定 \u2192 從原點出發的射線</li>
        <li>垂直線 Re(z)=c（y 變化）：模 = e\u1D9C 固定，角 = y 變化 \u2192 半徑為 e\u1D9C 的圓</li>
        <li>週期性：e\u1DBB\u207A\u00B2\u1D56\u1DA6 = e\u1DBB，所以高度 2\u03C0 的水平帶映到相同的像</li>
        <li>基本帶：0 \u2264 Im &lt; 2\u03C0（或 -\u03C0 &lt; Im \u2264 \u03C0）映射到整個平面減去 &#123;0&#125;</li>
        <li>左半平面 Re &lt; 0 映到單位圓內部（|e\u1DBB| = e\u02E3 &lt; 1）</li>
        <li>右半平面 Re &gt; 0 映到單位圓外部</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="觀察 e\u1DBB 的週期性——一條水平帶就能覆蓋整個值域">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.label) {
          <button class="preset-btn"
                  [class.active]="activeIdx() === $index"
                  (click)="selectPreset($index)">
            {{ p.label }}
          </button>
        }
      </div>

      <!-- Slider -->
      @if (currentPreset().hasSlider) {
        <div class="slider-row">
          <span class="slider-label">{{ currentPreset().sliderLabel }}</span>
          <input type="range" class="param-slider"
                 [min]="currentPreset().sliderMin"
                 [max]="currentPreset().sliderMax"
                 [step]="currentPreset().sliderStep"
                 [value]="param()"
                 (input)="onParamChange($event)" />
          <span class="slider-val">{{ param().toFixed(2) }}</span>
        </div>
      }

      <!-- Dual panel -->
      <div class="dual-panel">
        <!-- Left: z-plane -->
        <div class="panel">
          <div class="panel-title">z 平面（定義域）</div>
          <svg [attr.viewBox]="viewBox" class="panel-svg">
            <path [attr.d]="leftAxes()" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            @for (c of leftPaths(); track $index) {
              <path [attr.d]="c.d" fill="none" [attr.stroke]="c.color"
                    [attr.stroke-width]="c.width" stroke-linecap="round"
                    [attr.stroke-dasharray]="c.dash" />
            }
          </svg>
        </div>

        <!-- Right: w = e^z plane -->
        <div class="panel">
          <div class="panel-title">w = e\u1DBB 平面（值域）</div>
          <svg [attr.viewBox]="viewBox" class="panel-svg">
            <path [attr.d]="rightAxes()" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            @for (c of rightPaths(); track $index) {
              <path [attr.d]="c.d" fill="none" [attr.stroke]="c.color"
                    [attr.stroke-width]="c.width" stroke-linecap="round"
                    [attr.stroke-dasharray]="c.dash" />
            }
            <!-- Unit circle reference for 左半平面 preset -->
            @if (activeIdx() === 4) {
              <path [attr.d]="unitCirclePath()" fill="none" stroke="var(--text-muted)"
                    stroke-width="1" stroke-dasharray="4,3" />
            }
          </svg>
        </div>
      </div>

      <!-- Info card -->
      <div class="info-box">
        <div class="info-desc">{{ currentPreset().desc }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        e\u1DBB 的週期性意味著它不是單射——無窮多條水平帶映到同一個目標。
        這就是為什麼 log z 是多值的：e\u1DBB 的「逆函數」必須選擇一個分支（branch），也就是選定一條帶。
      </p>
    </app-prose-block>
  `,
  styles: `
    ul { margin: 6px 0 0 18px; padding: 0; line-height: 1.7; font-size: 14px; color: var(--text-secondary); }
    li { margin-bottom: 2px; }

    .preset-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .preset-btn {
      padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.2s, border-color 0.2s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; }
    }

    .slider-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    }
    .slider-label {
      font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      min-width: 60px;
    }
    .param-slider { flex: 1; accent-color: var(--accent); }
    .slider-val {
      font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      min-width: 48px; text-align: right;
    }

    .dual-panel { display: flex; gap: 4px; margin-bottom: 10px; }
    .panel { flex: 1; min-width: 0; }
    .panel-title {
      font-size: 10px; font-weight: 600; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; text-align: center; margin-bottom: 4px;
    }
    .panel-svg {
      width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg); aspect-ratio: 1;
    }

    .info-box {
      padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
    }
    .info-desc {
      font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; line-height: 1.6;
    }
  `,
})
export class StepDeepExpComponent {
  /* ── Constants ── */
  readonly viewBox = `0 0 250 250`;
  readonly presets = PRESETS;
  readonly mainFormula = String.raw`e^z = e^x \cdot (\cos y + i\sin y)`;

  /* ── State ── */
  readonly activeIdx = signal(0);
  readonly param = signal(5);

  /* ── Derived ── */
  readonly currentPreset = computed(() => PRESETS[this.activeIdx()]);

  selectPreset(idx: number): void {
    this.activeIdx.set(idx);
    const p = PRESETS[idx];
    if (p.sliderDefault !== undefined) {
      this.param.set(p.sliderDefault);
    }
  }

  onParamChange(ev: Event): void {
    this.param.set(parseFloat((ev.target as HTMLInputElement).value));
  }

  /* ── Axes (depend on preset's view) ── */
  readonly leftAxes = computed(() => axesPath(this.currentPreset().leftView));
  readonly rightAxes = computed(() => axesPath(this.currentPreset().rightView));

  /* ── Unit circle path for 左半平面 preset ── */
  readonly unitCirclePath = computed((): string => {
    const rv = PRESETS[4].rightView;
    const pts = circlePoints(0, 0, 1, N_SAMPLES);
    return buildPath(rv, pts);
  });

  /* ── LEFT PANEL PATHS ── */
  readonly leftPaths = computed((): { d: string; color: string; width: number; dash: string }[] => {
    const idx = this.activeIdx();
    const lv = this.currentPreset().leftView;
    const paths: { d: string; color: string; width: number; dash: string }[] = [];

    if (idx === 0) {
      // 水平線 → 射線: horizontal lines at y = 0, π/4, π/2, 3π/4, π
      const count = Math.round(this.param());
      for (let i = 0; i < count; i++) {
        const y = (i * Math.PI) / (count - 1);
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -2 + (4 * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: COLORS[i % COLORS.length], width: 1.4, dash: '' });
      }
    } else if (idx === 1) {
      // 垂直線 → 同心圓: vertical lines at x = -1, -0.5, 0, 0.5, 1
      const count = Math.round(this.param());
      for (let i = 0; i < count; i++) {
        const x = -1 + (2 * i) / (count - 1);
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = (2 * Math.PI * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: COLORS[i % COLORS.length], width: 1.4, dash: '' });
      }
    } else if (idx === 2) {
      // 基本帶: grid in [-2,2]×[0,2π]
      const density = Math.round(this.param());
      // horizontal lines
      for (let i = 0; i <= density; i++) {
        const y = (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -2 + (4 * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: COLORS[i % COLORS.length], width: 1, dash: '' });
      }
      // vertical lines
      for (let i = 0; i <= density; i++) {
        const x = -2 + (4 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = (2 * Math.PI * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: '#6a7a8a', width: 0.8, dash: '' });
      }
      // strip boundaries
      const bnd0: C[] = [], bnd1: C[] = [];
      for (let j = 0; j <= N_SAMPLES; j++) {
        const x = -2 + (4 * j) / N_SAMPLES;
        bnd0.push([x, 0]);
        bnd1.push([x, 2 * Math.PI]);
      }
      paths.push({ d: buildPath(lv, bnd0), color: 'var(--text-muted)', width: 1.2, dash: '4,3' });
      paths.push({ d: buildPath(lv, bnd1), color: 'var(--text-muted)', width: 1.2, dash: '4,3' });
    } else if (idx === 3) {
      // 兩個週期: grid in [-2,2]×[0,4π]
      const density = 5;
      // First strip [0, 2π] — warm colors
      for (let i = 0; i <= density; i++) {
        const y = (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -2 + (4 * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: WARM[i % WARM.length], width: 1, dash: '' });
      }
      for (let i = 0; i <= density; i++) {
        const x = -2 + (4 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = (2 * Math.PI * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: WARM[i % WARM.length], width: 0.8, dash: '' });
      }
      // Second strip [2π, 4π] — cool colors
      for (let i = 0; i <= density; i++) {
        const y = 2 * Math.PI + (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -2 + (4 * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: COOL[i % COOL.length], width: 1, dash: '' });
      }
      for (let i = 0; i <= density; i++) {
        const x = -2 + (4 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = 2 * Math.PI + (2 * Math.PI * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: COOL[i % COOL.length], width: 0.8, dash: '' });
      }
      // Boundaries y=0, y=2π, y=4π as dashed
      for (const yb of [0, 2 * Math.PI, 4 * Math.PI]) {
        const bpts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          bpts.push([-2 + (4 * j) / N_SAMPLES, yb]);
        }
        paths.push({ d: buildPath(lv, bpts), color: 'var(--text-muted)', width: 1.2, dash: '4,3' });
      }
    } else if (idx === 4) {
      // 左半平面: grid in [-3,0]×[-π,π]
      const density = Math.round(this.param());
      // horizontal lines
      for (let i = 0; i <= density; i++) {
        const y = -Math.PI + (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -3 + (3 * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: COLORS[i % COLORS.length], width: 1, dash: '' });
      }
      // vertical lines
      for (let i = 0; i <= density; i++) {
        const x = -3 + (3 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = -Math.PI + (2 * Math.PI * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(lv, pts), color: '#6a7a8a', width: 0.8, dash: '' });
      }
      // boundary: imaginary axis
      const bpts: C[] = [];
      for (let j = 0; j <= N_SAMPLES; j++) {
        bpts.push([0, -Math.PI + (2 * Math.PI * j) / N_SAMPLES]);
      }
      paths.push({ d: buildPath(lv, bpts), color: 'var(--text-muted)', width: 1.2, dash: '4,3' });
    }

    return paths;
  });

  /* ── RIGHT PANEL PATHS ── */
  readonly rightPaths = computed((): { d: string; color: string; width: number; dash: string }[] => {
    const idx = this.activeIdx();
    const rv = this.currentPreset().rightView;
    const paths: { d: string; color: string; width: number; dash: string }[] = [];

    if (idx === 0) {
      // 水平線 → 射線
      const count = Math.round(this.param());
      for (let i = 0; i < count; i++) {
        const y = (i * Math.PI) / (count - 1);
        // Ray at angle y, from e^(-2) to e^2
        const rMin = Math.exp(-2);
        const rMax = Math.exp(2);
        const pts = rayPoints(y, rMin, Math.min(rMax, rv.radius), N_SAMPLES);
        paths.push({ d: buildPath(rv, pts), color: COLORS[i % COLORS.length], width: 1.4, dash: '' });
      }
    } else if (idx === 1) {
      // 垂直線 → 同心圓
      const count = Math.round(this.param());
      for (let i = 0; i < count; i++) {
        const x = -1 + (2 * i) / (count - 1);
        const r = Math.exp(x);
        const pts = circlePoints(0, 0, r, N_SAMPLES);
        paths.push({ d: buildPath(rv, pts), color: COLORS[i % COLORS.length], width: 1.4, dash: '' });
      }
    } else if (idx === 2) {
      // 基本帶: transform grid → rays + circles
      const density = Math.round(this.param());
      // Transform horizontal lines → rays
      for (let i = 0; i <= density; i++) {
        const y = (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -2 + (4 * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 3), color: COLORS[i % COLORS.length], width: 1, dash: '' });
      }
      // Transform vertical lines → circles
      for (let i = 0; i <= density; i++) {
        const x = -2 + (4 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = (2 * Math.PI * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 3), color: '#6a7a8a', width: 0.8, dash: '' });
      }
    } else if (idx === 3) {
      // 兩個週期: both strips map to the same output
      const density = 5;
      // First strip — warm
      for (let i = 0; i <= density; i++) {
        const y = (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -2 + (4 * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 3), color: WARM[i % WARM.length], width: 1.2, dash: '' });
      }
      for (let i = 0; i <= density; i++) {
        const x = -2 + (4 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = (2 * Math.PI * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 3), color: WARM[i % WARM.length], width: 0.8, dash: '' });
      }
      // Second strip — cool (maps to exact same output, shifted by 2π in y = no change)
      for (let i = 0; i <= density; i++) {
        const y = 2 * Math.PI + (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -2 + (4 * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 3), color: COOL[i % COOL.length], width: 1.2, dash: '' });
      }
      for (let i = 0; i <= density; i++) {
        const x = -2 + (4 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = 2 * Math.PI + (2 * Math.PI * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 3), color: COOL[i % COOL.length], width: 0.8, dash: '' });
      }
    } else if (idx === 4) {
      // 左半平面 → inside unit circle
      const density = Math.round(this.param());
      // Transform horizontal lines
      for (let i = 0; i <= density; i++) {
        const y = -Math.PI + (2 * Math.PI * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -3 + (3 * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 2), color: COLORS[i % COLORS.length], width: 1, dash: '' });
      }
      // Transform vertical lines
      for (let i = 0; i <= density; i++) {
        const x = -3 + (3 * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = -Math.PI + (2 * Math.PI * j) / N_SAMPLES;
          const w = cExp([x, y]);
          pts.push(w);
        }
        paths.push({ d: buildPath(rv, pts, 2), color: '#6a7a8a', width: 0.8, dash: '' });
      }
    }

    return paths;
  });
}
