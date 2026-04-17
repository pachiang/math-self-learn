import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAbs, cMul, cDiv, cPow, cAdd, cInv,
  PlaneView, toSvg, axesPath, fmtC,
} from '../complex-ch1/complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 2, svgW: 520, svgH: 420, pad: 30 };

/* ── Preset definitions ── */

interface ZeroPolePreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
  zeros: { pos: C; order: number }[];
  poles: { pos: C; order: number }[];
  orderLabel: string;
  behaviorLabel: string;
}

const PRESETS: ZeroPolePreset[] = [
  {
    label: 'z (一階零點)',
    tex: 'f(z) = z',
    fn: (z: C): C => z,
    zeros: [{ pos: [0, 0], order: 1 }],
    poles: [],
    orderLabel: 'm = 1',
    behaviorLabel: 'f \\approx z',
  },
  {
    label: 'z\u00B3 (三階零點)',
    tex: 'f(z) = z^3',
    fn: (z: C): C => cPow(z, 3),
    zeros: [{ pos: [0, 0], order: 3 }],
    poles: [],
    orderLabel: 'm = 3',
    behaviorLabel: 'f \\approx z^3',
  },
  {
    label: '1/z (一階極點)',
    tex: String.raw`f(z) = \frac{1}{z}`,
    fn: (z: C): C => cInv(z),
    zeros: [],
    poles: [{ pos: [0, 0], order: 1 }],
    orderLabel: 'm = 1',
    behaviorLabel: String.raw`f \approx \frac{1}{z}`,
  },
  {
    label: '1/z\u00B3 (三階極點)',
    tex: String.raw`f(z) = \frac{1}{z^3}`,
    fn: (z: C): C => cInv(cPow(z, 3)),
    zeros: [],
    poles: [{ pos: [0, 0], order: 3 }],
    orderLabel: 'm = 3',
    behaviorLabel: String.raw`f \approx \frac{1}{z^3}`,
  },
  {
    label: '(z\u00B2+1)/z\u00B2 (零點+極點)',
    tex: String.raw`f(z) = \frac{z^2+1}{z^2}`,
    fn: (z: C): C => cDiv(cAdd(cMul(z, z), [1, 0]), cMul(z, z)),
    zeros: [{ pos: [0, 1], order: 1 }, { pos: [0, -1], order: 1 }],
    poles: [{ pos: [0, 0], order: 2 }],
    orderLabel: '零點 m=1, 極點 m=2',
    behaviorLabel: String.raw`f \approx 1 + \frac{1}{z^2}`,
  },
];

const CIRCLE_RADII = [0.3, 0.6, 1.0];
const CIRCLE_COLORS = ['#8888aa', '#9999bb', '#aaaacc'];
const IMAGE_COLORS = ['var(--accent)', '#e0884a', '#60aa60'];

@Component({
  selector: 'app-step-zeros-poles',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="零點與極點的階" subtitle="&sect;4.4">
      <p>
        若 f(z) 在 z_0 有一個 <strong>m 階零點</strong>，意味著可以把 f 寫成：
      </p>
      <app-math block [e]="defZero" />
      <p>
        其中 <app-math [e]="'g(z_0) \\neq 0'" />。
        類似地，若 f(z) 在 z_0 有一個 <strong>m 階極點</strong>，意味著：
      </p>
      <app-math block [e]="defPole" />
      <p>
        其中 <app-math [e]="'h(z_0) \\neq 0'" />。
        階數決定了函數在該點附近的局部行為：
        靠近 m 階零點時，f 的表現像 <app-math [e]="'z^m'" />；
        靠近 m 階極點時，f 像 <app-math [e]="'1/z^m'" /> 一樣爆炸。
      </p>
      <p class="hint">
        對於非常數的解析函數，零點和極點都是<strong>孤立的</strong>
        -- 每個零點/極點的附近不存在其他零點/極點。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇不同階數的零點和極點，觀察函數在附近的行為">
      <div class="preset-row">
        @for (p of presets; track p.label) {
          <button class="preset-btn"
                  [class.active]="activeIdx() === $index"
                  (click)="activeIdx.set($index)">
            {{ p.label }}
          </button>
        }
      </div>

      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH"
           class="plane-svg">

        <!-- Axes -->
        <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="1" fill="none" />

        <!-- Axis labels -->
        <text [attr.x]="view.svgW - view.pad + 8" [attr.y]="originSvg[1] + 4"
              class="axis-lbl">Re</text>
        <text [attr.x]="originSvg[0] + 8" [attr.y]="view.pad - 8"
              class="axis-lbl">Im</text>

        <!-- Tick labels -->
        @for (t of tickLabels; track t.key) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- Input circles (dashed, gray) around first zero or pole -->
        @for (c of inputCirclePaths(); track c.idx) {
          <circle [attr.cx]="c.cx" [attr.cy]="c.cy" [attr.r]="c.r"
                  fill="none" [attr.stroke]="c.color"
                  stroke-width="1" stroke-dasharray="4 3" stroke-opacity="0.6" />
        }

        <!-- Image curves (solid, colored) -->
        @for (img of imagePaths(); track img.idx) {
          <path [attr.d]="img.d"
                fill="none" [attr.stroke]="img.color"
                stroke-width="1.8" stroke-opacity="0.85" />
        }

        <!-- Mark zeros with open circles -->
        @for (z of activePreset().zeros; track $index) {
          <circle [attr.cx]="zeroSvg(z.pos)[0]" [attr.cy]="zeroSvg(z.pos)[1]"
                  r="6" fill="none" stroke="var(--accent)" stroke-width="2" />
          <text [attr.x]="zeroSvg(z.pos)[0] + 10"
                [attr.y]="zeroSvg(z.pos)[1] - 8"
                class="marker-label zero-color">
            {{ z.order === 1 ? '零點' : z.order + ' 階零點' }}
          </text>
        }

        <!-- Mark poles with x -->
        @for (p of activePreset().poles; track $index) {
          <g [attr.transform]="'translate(' + poleSvg(p.pos)[0] + ',' + poleSvg(p.pos)[1] + ')'">
            <line x1="-5" y1="-5" x2="5" y2="5"
                  stroke="#cc5555" stroke-width="2.5" />
            <line x1="5" y1="-5" x2="-5" y2="5"
                  stroke="#cc5555" stroke-width="2.5" />
          </g>
          <text [attr.x]="poleSvg(p.pos)[0] + 10"
                [attr.y]="poleSvg(p.pos)[1] - 8"
                class="marker-label pole-color">
            {{ p.order === 1 ? '極點' : p.order + ' 階極點' }}
          </text>
        }

        <!-- Legend -->
        <g transform="translate(12, 16)">
          <line x1="0" y1="0" x2="20" y2="0"
                stroke="#9999bb" stroke-width="1" stroke-dasharray="4 3" />
          <text x="24" y="4" class="legend-text">輸入圓</text>
          <line x1="0" y1="16" x2="20" y2="16"
                stroke="var(--accent)" stroke-width="1.8" />
          <text x="24" y="20" class="legend-text">映射像</text>
        </g>
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="info-label">零點/極點位置</div>
          <div class="info-val">{{ positionSummary() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">階數</div>
          <div class="info-val accent">{{ activePreset().orderLabel }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">行為</div>
          <div class="info-val"><app-math [e]="activePreset().behaviorLabel" /></div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        零點和極點的階決定了函數在該點附近的「纏繞」行為。
        階越高，映射時纏繞圈數越多 -- 觀察 z 和 z^3 的映射像便可見一斑。
        下一節用 Riemann 球面統一看待零點、極點和無窮遠。
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .preset-btn {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.2s, border-color 0.2s;

      &:hover {
        background: var(--accent-10);
      }

      &.active {
        background: var(--accent-18);
        border-color: var(--accent);
        color: var(--text);
        font-weight: 600;
      }
    }

    .plane-svg {
      width: 100%;
      display: block;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 12px;
      user-select: none;
    }

    .axis-lbl {
      font-size: 11px;
      fill: var(--text-muted);
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .tick-label {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .marker-label {
      font-size: 11px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .zero-color { fill: var(--accent); }
    .pole-color { fill: #cc5555; }

    .legend-text {
      font-size: 10px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .hint {
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--bg-surface);
      padding: 10px 14px;
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      margin: 12px 0;
    }

    .info-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .info-card {
      flex: 1;
      min-width: 120px;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }

    .info-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .info-val {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);

      &.accent {
        color: var(--accent);
      }
    }
  `,
})
export class StepZerosPolesComponent {
  readonly presets = PRESETS;
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);

  /* ── KaTeX expressions ── */
  readonly defZero = String.raw`f(z) = (z-z_0)^m \cdot g(z), \quad g(z_0) \neq 0 \quad \text{(m 階零點)}`;
  readonly defPole = String.raw`f(z) = \frac{h(z)}{(z-z_0)^m}, \quad h(z_0) \neq 0 \quad \text{(m 階極點)}`;

  /* ── Signals ── */
  readonly activeIdx = signal(0);
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);

  /* ── Tick labels (precomputed) ── */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const v = VIEW;
    const [ox, oy] = toSvg(v, [0, 0]);
    for (let k = -2; k <= 2; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(v, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(v, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  /* ── Position summary ── */
  readonly positionSummary = computed(() => {
    const p = this.activePreset();
    const parts: string[] = [];
    for (const z of p.zeros) {
      parts.push(`零點 ${fmtC(z.pos)}`);
    }
    for (const pl of p.poles) {
      parts.push(`極點 ${fmtC(pl.pos)}`);
    }
    return parts.join(', ') || '--';
  });

  /* ── Input circles around the first zero/pole ── */
  readonly inputCirclePaths = computed(() => {
    const p = this.activePreset();
    const center = p.zeros.length > 0 ? p.zeros[0].pos : (p.poles.length > 0 ? p.poles[0].pos : [0, 0] as C);
    const [cx, cy] = toSvg(VIEW, center);
    const scale = (VIEW.svgW - 2 * VIEW.pad) / (2 * VIEW.radius);

    return CIRCLE_RADII.map((r, idx) => ({
      idx,
      cx,
      cy,
      r: r * scale,
      color: CIRCLE_COLORS[idx],
    }));
  });

  /* ── Image of circles under f ── */
  readonly imagePaths = computed(() => {
    const p = this.activePreset();
    return CIRCLE_RADII.map((r, idx) => ({
      idx,
      d: this.circleImage(p.fn, r),
      color: IMAGE_COLORS[idx],
    }));
  });

  /* ── SVG coordinate helpers for markers ── */
  zeroSvg(pos: C): [number, number] {
    return toSvg(VIEW, pos);
  }

  poleSvg(pos: C): [number, number] {
    return toSvg(VIEW, pos);
  }

  /* ── Draw image of |z|=r under f ── */
  private circleImage(f: (z: C) => C, r: number, nPts = 200): string {
    let d = '';
    for (let i = 0; i <= nPts; i++) {
      const theta = (i / nPts) * 2 * Math.PI;
      const z: C = [r * Math.cos(theta), r * Math.sin(theta)];
      const w = f(z);
      if (cAbs(w) > 8) {
        d += ' ';
        continue;
      }
      const [sx, sy] = toSvg(VIEW, w);
      d += (d === '' || d.endsWith(' ')) ? `M${sx.toFixed(1)},${sy.toFixed(1)}` : `L${sx.toFixed(1)},${sy.toFixed(1)}`;
    }
    return d;
  }
}
