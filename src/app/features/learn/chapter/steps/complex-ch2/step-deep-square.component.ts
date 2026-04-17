import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cMul, cAbs, cArg, cFromPolar,
  PlaneView, toSvg, fromSvg, axesPath, fmtC,
} from '../complex-ch1/complex-util';

/* ── Views ── */
const VIEW: PlaneView = { cx: 0, cy: 0, radius: 3, svgW: 250, svgH: 250, pad: 20 };

/* ── Academic color palette (muted) ── */
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
}

const PRESETS: Preset[] = [
  { label: '同心圓', desc: '同心圓 |z|=r 映射為同心圓 |w|=r\u00B2。半徑平方，形狀保持為圓。注意半徑 r<1 的圓變小，r>1 的圓變大。', hasSlider: false },
  { label: '射線束', desc: '八條射線 arg(z)=\u03B8 映射為射線 arg(w)=2\u03B8。角度加倍意味著對徑的射線（\u03B8 和 \u03B8+\u03C0）映到同一條射線。', hasSlider: false },
  { label: '上半平面網格', desc: '上半平面 0<arg<\u03C0 經過 z\u00B2 映射後覆蓋了整個 w 平面（0<arg<2\u03C0）。這表明上半平面是 z\u00B2 的一個基本域。', hasSlider: true, sliderLabel: '網格密度', sliderMin: 3, sliderMax: 12, sliderStep: 1, sliderDefault: 6 },
  { label: '單一射線', desc: '一條射線 arg(z)=\u03B8 映射為射線 arg(w)=2\u03B8。注意 -z\u2080 也在左圖顯示——它們映到同一個像。', hasSlider: true, sliderLabel: '\u03B8', sliderMin: 0, sliderMax: 6.28, sliderStep: 0.01, sliderDefault: 0.8 },
  { label: '兩點對稱', desc: 'z\u2080 和 -z\u2080 映射到相同的 z\u2080\u00B2。這就是 z\u00B2 的「兩到一」性質——除了原點，每個值恰好有兩個原像。', hasSlider: true, sliderLabel: '\u03B8', sliderMin: 0, sliderMax: 6.28, sliderStep: 0.01, sliderDefault: 0.6 },
];

/* ── Helpers ── */
const N_SAMPLES = 240;

function buildPath(v: PlaneView, pts: C[], maxJump = 1.5): string {
  let d = '';
  let drawing = false;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!isFinite(p[0]) || !isFinite(p[1]) || cAbs(p) > 20) {
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

const sqr = (z: C): C => cMul(z, z);

@Component({
  selector: 'app-step-deep-square',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="深入 z\u00B2：角度加倍與兩到一" subtitle="&sect;2.7">
      <p>
        把 z 寫成極座標
        <app-math [e]="'z = r \\\\cdot e^{i\\\\theta}'" />，
        則
        <app-math [e]="'z^2 = r^2 \\\\cdot e^{2i\\\\theta}'" />
        ——模變成平方，角度加倍。
      </p>
      <app-math block [e]="mainFormula" />
      <p>這帶來幾個關鍵結果：</p>
      <ul>
        <li>除了 0 以外，每個點 w 都有兩個原像：z 和 -z（因為 z\u00B2 = (-z)\u00B2）</li>
        <li>上半平面（0 &lt; \u03B8 &lt; \u03C0）映射到整個平面（0 &lt; 2\u03B8 &lt; 2\u03C0）</li>
        <li>圓 |z| = r 映射為圓 |w| = r\u00B2</li>
        <li>射線 arg(z) = \u03B8 映射為射線 arg(w) = 2\u03B8</li>
        <li>正實軸（\u03B8=0）和負實軸（\u03B8=\u03C0）都映到正實軸（2\u03B8=0 和 2\u03B8=2\u03C0）</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="觀察 z\u00B2 如何把角度加倍——上半平面就夠覆蓋整個值域">
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
          <svg [attr.viewBox]="viewBox" class="panel-svg"
               (mousedown)="onMouseDown($event)"
               (mousemove)="onMouseMove($event)"
               (mouseup)="onMouseUp()"
               (mouseleave)="onMouseUp()">
            <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            @for (c of leftPaths(); track $index) {
              <path [attr.d]="c.d" fill="none" [attr.stroke]="c.color"
                    [attr.stroke-width]="c.width" stroke-linecap="round"
                    [attr.stroke-dasharray]="c.dash" />
            }
            @for (pt of leftPoints(); track $index) {
              <circle [attr.cx]="pt.sx" [attr.cy]="pt.sy" [attr.r]="pt.r"
                      [attr.fill]="pt.color" [style.cursor]="pt.draggable ? 'grab' : 'default'" />
            }
          </svg>
        </div>

        <!-- Right: w = z² plane -->
        <div class="panel">
          <div class="panel-title">w = z\u00B2 平面（值域）</div>
          <svg [attr.viewBox]="viewBox" class="panel-svg">
            <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            @for (c of rightPaths(); track $index) {
              <path [attr.d]="c.d" fill="none" [attr.stroke]="c.color"
                    [attr.stroke-width]="c.width" stroke-linecap="round"
                    [attr.stroke-dasharray]="c.dash" />
            }
            @for (pt of rightPoints(); track $index) {
              <circle [attr.cx]="pt.sx" [attr.cy]="pt.sy" [attr.r]="pt.r"
                      [attr.fill]="pt.color" />
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
        z\u00B2 是最簡單的多項式映射。它的「兩到一」性質意味著上半平面就是一個完整的「基本域」。
        這個觀察引出了 Riemann 面的概念——用多張平面來消除多值性。
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
export class StepDeepSquareComponent {
  /* ── Constants ── */
  readonly view = VIEW;
  readonly viewBox = `0 0 ${VIEW.svgW} ${VIEW.svgH}`;
  readonly axes = axesPath(VIEW);
  readonly presets = PRESETS;
  readonly mainFormula = String.raw`z^2 = r^2 \cdot e^{2i\theta}`;

  /* ── State ── */
  readonly activeIdx = signal(0);
  readonly param = signal(0.8);
  readonly dragging = signal(false);

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

  /* ── Drag handling for "兩點對稱" preset ── */
  onMouseDown(ev: MouseEvent): void {
    if (this.activeIdx() !== 4) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) * (VIEW.svgW / rect.width);
    const sy = (ev.clientY - rect.top) * (VIEW.svgH / rect.height);
    const z = fromSvg(VIEW, sx, sy);
    const r = cAbs(z);
    if (r > 0.1 && r < VIEW.radius) {
      this.dragging.set(true);
      this.param.set(cArg(z) < 0 ? cArg(z) + 2 * Math.PI : cArg(z));
    }
  }

  onMouseMove(ev: MouseEvent): void {
    if (!this.dragging()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) * (VIEW.svgW / rect.width);
    const sy = (ev.clientY - rect.top) * (VIEW.svgH / rect.height);
    const z = fromSvg(VIEW, sx, sy);
    let a = cArg(z);
    if (a < 0) a += 2 * Math.PI;
    this.param.set(a);
  }

  onMouseUp(): void {
    this.dragging.set(false);
  }

  /* ── LEFT PANEL PATHS ── */
  readonly leftPaths = computed((): { d: string; color: string; width: number; dash: string }[] => {
    const idx = this.activeIdx();
    const paths: { d: string; color: string; width: number; dash: string }[] = [];

    if (idx === 0) {
      // 同心圓: 4 circles at r = 0.5, 1, 1.5, 2
      const radii = [0.5, 1, 1.5, 2];
      radii.forEach((r, i) => {
        const pts = circlePoints(0, 0, r, N_SAMPLES);
        paths.push({ d: buildPath(VIEW, pts), color: COLORS[i], width: 1.4, dash: '' });
      });
    } else if (idx === 1) {
      // 射線束: 8 rays
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const pts = rayPoints(angle, 0, VIEW.radius, N_SAMPLES);
        paths.push({ d: buildPath(VIEW, pts), color: COLORS[i], width: 1.4, dash: '' });
      }
    } else if (idx === 2) {
      // 上半平面網格
      const density = Math.round(this.param());
      // horizontal lines (constant y > 0)
      for (let i = 1; i <= density; i++) {
        const y = (i / density) * (VIEW.radius - 0.2);
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -VIEW.radius + (2 * VIEW.radius * j) / N_SAMPLES;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(VIEW, pts), color: COLORS[i % COLORS.length], width: 1, dash: '' });
      }
      // vertical lines in upper half
      for (let i = 0; i <= density; i++) {
        const x = -VIEW.radius + (2 * VIEW.radius * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = (VIEW.radius * j) / N_SAMPLES;
          if (y <= 0.01) continue;
          pts.push([x, y]);
        }
        paths.push({ d: buildPath(VIEW, pts), color: '#6a7a8a', width: 0.8, dash: '' });
      }
      // boundary: real axis
      const bpts: C[] = [];
      for (let j = 0; j <= N_SAMPLES; j++) {
        bpts.push([-VIEW.radius + (2 * VIEW.radius * j) / N_SAMPLES, 0]);
      }
      paths.push({ d: buildPath(VIEW, bpts), color: 'var(--text-muted)', width: 1, dash: '4,3' });
    } else if (idx === 3) {
      // 單一射線
      const theta = this.param();
      const pts = rayPoints(theta, 0, VIEW.radius, N_SAMPLES);
      paths.push({ d: buildPath(VIEW, pts), color: COLORS[0], width: 2, dash: '' });
      // Also show the opposite ray (-z direction)
      const oppPts = rayPoints(theta + Math.PI, 0, VIEW.radius, N_SAMPLES);
      paths.push({ d: buildPath(VIEW, oppPts), color: COLORS[4], width: 1.4, dash: '4,3' });
    } else if (idx === 4) {
      // 兩點對稱 — just reference lines
      const theta = this.param();
      const r0 = 1.5;
      // line from origin through z0
      const lpts = rayPoints(theta, 0, VIEW.radius, 60);
      paths.push({ d: buildPath(VIEW, lpts), color: 'var(--text-muted)', width: 0.6, dash: '3,3' });
      // line from origin through -z0
      const lpts2 = rayPoints(theta + Math.PI, 0, VIEW.radius, 60);
      paths.push({ d: buildPath(VIEW, lpts2), color: 'var(--text-muted)', width: 0.6, dash: '3,3' });
    }

    return paths;
  });

  /* ── LEFT PANEL POINTS ── */
  readonly leftPoints = computed((): { sx: number; sy: number; r: number; color: string; draggable: boolean }[] => {
    const idx = this.activeIdx();
    const points: { sx: number; sy: number; r: number; color: string; draggable: boolean }[] = [];

    if (idx === 4) {
      const theta = this.param();
      const r0 = 1.5;
      const z0: C = cFromPolar(r0, theta);
      const mz0: C = [-z0[0], -z0[1]];
      const [sx1, sy1] = toSvg(VIEW, z0);
      const [sx2, sy2] = toSvg(VIEW, mz0);
      points.push({ sx: sx1, sy: sy1, r: 6, color: COLORS[0], draggable: true });
      points.push({ sx: sx2, sy: sy2, r: 6, color: COLORS[4], draggable: false });
    } else if (idx === 3) {
      // Show a sample point on the ray and its opposite
      const theta = this.param();
      const z0: C = cFromPolar(1.5, theta);
      const mz0: C = [-z0[0], -z0[1]];
      const [sx1, sy1] = toSvg(VIEW, z0);
      const [sx2, sy2] = toSvg(VIEW, mz0);
      points.push({ sx: sx1, sy: sy1, r: 4, color: COLORS[0], draggable: false });
      points.push({ sx: sx2, sy: sy2, r: 4, color: COLORS[4], draggable: false });
    }

    return points;
  });

  /* ── RIGHT PANEL PATHS ── */
  readonly rightPaths = computed((): { d: string; color: string; width: number; dash: string }[] => {
    const idx = this.activeIdx();
    const paths: { d: string; color: string; width: number; dash: string }[] = [];

    // Use a wider view for the right panel (r² can go up to 9)
    const rightView: PlaneView = { cx: 0, cy: 0, radius: 5, svgW: 250, svgH: 250, pad: 20 };

    if (idx === 0) {
      // 同心圓: circles r² = 0.25, 1, 2.25, 4
      const radii = [0.5, 1, 1.5, 2];
      radii.forEach((r, i) => {
        const pts = circlePoints(0, 0, r * r, N_SAMPLES);
        paths.push({ d: buildPath(rightView, pts), color: COLORS[i], width: 1.4, dash: '' });
      });
    } else if (idx === 1) {
      // 射線束: 8 input rays → doubled angles
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const outAngle = 2 * angle;
        const pts = rayPoints(outAngle, 0, rightView.radius, N_SAMPLES);
        paths.push({ d: buildPath(rightView, pts), color: COLORS[i], width: 1.4, dash: '' });
      }
    } else if (idx === 2) {
      // 上半平面網格 → full plane
      const density = Math.round(this.param());
      // Transform horizontal lines
      for (let i = 1; i <= density; i++) {
        const y = (i / density) * (VIEW.radius - 0.2);
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const x = -VIEW.radius + (2 * VIEW.radius * j) / N_SAMPLES;
          const z: C = [x, y];
          const w = sqr(z);
          pts.push(w);
        }
        paths.push({ d: buildPath(rightView, pts, 3), color: COLORS[i % COLORS.length], width: 1, dash: '' });
      }
      // Transform vertical lines
      for (let i = 0; i <= density; i++) {
        const x = -VIEW.radius + (2 * VIEW.radius * i) / density;
        const pts: C[] = [];
        for (let j = 0; j <= N_SAMPLES; j++) {
          const y = (VIEW.radius * j) / N_SAMPLES;
          if (y <= 0.01) continue;
          const z: C = [x, y];
          const w = sqr(z);
          pts.push(w);
        }
        paths.push({ d: buildPath(rightView, pts, 3), color: '#6a7a8a', width: 0.8, dash: '' });
      }
    } else if (idx === 3) {
      // 單一射線 → ray at 2θ
      const theta = this.param();
      const outAngle = 2 * theta;
      const pts = rayPoints(outAngle, 0, rightView.radius, N_SAMPLES);
      paths.push({ d: buildPath(rightView, pts), color: COLORS[0], width: 2, dash: '' });
      // The opposite ray also maps to angle 2(θ+π) = 2θ+2π = 2θ (same ray)
      // Show it with dashed to indicate overlap
      paths.push({ d: buildPath(rightView, pts), color: COLORS[4], width: 1.4, dash: '4,3' });
    } else if (idx === 4) {
      // 兩點對稱 — dashed ref line from origin
      const theta = this.param();
      const r0 = 1.5;
      const z0: C = cFromPolar(r0, theta);
      const w = sqr(z0);
      const wAngle = cArg(w);
      const refPts = rayPoints(wAngle, 0, rightView.radius, 60);
      paths.push({ d: buildPath(rightView, refPts), color: 'var(--text-muted)', width: 0.6, dash: '3,3' });
    }

    return paths;
  });

  /* ── RIGHT PANEL POINTS ── */
  readonly rightPoints = computed((): { sx: number; sy: number; r: number; color: string; draggable: boolean }[] => {
    const idx = this.activeIdx();
    const rightView: PlaneView = { cx: 0, cy: 0, radius: 5, svgW: 250, svgH: 250, pad: 20 };
    const points: { sx: number; sy: number; r: number; color: string; draggable: boolean }[] = [];

    if (idx === 4) {
      const theta = this.param();
      const r0 = 1.5;
      const z0: C = cFromPolar(r0, theta);
      const w = sqr(z0);
      const [sx, sy] = toSvg(rightView, w);
      points.push({ sx, sy, r: 6, color: '#8a6a5a', draggable: false });
    } else if (idx === 3) {
      const theta = this.param();
      const z0: C = cFromPolar(1.5, theta);
      const w = sqr(z0);
      const [sx, sy] = toSvg(rightView, w);
      points.push({ sx, sy, r: 4, color: COLORS[0], draggable: false });
    }

    return points;
  });
}
