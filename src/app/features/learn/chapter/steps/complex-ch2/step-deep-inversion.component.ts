import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAbs,
  PlaneView, toSvg, axesPath,
} from '../complex-ch1/complex-util';

/* ── PlaneView for both panels ── */
const VIEW: PlaneView = { cx: 0, cy: 0, radius: 3.5, svgW: 250, svgH: 250, pad: 20 };

/* ── Inversion helper ── */
function inv(z: C): C {
  const d = z[0] * z[0] + z[1] * z[1];
  if (d < 1e-8) return [100, 100];
  return [z[0] / d, -z[1] / d];
}

/* ── Preset definitions ── */
type PresetKey = 'line_origin' | 'line_off' | 'circle_origin' | 'circle_off' | 'unit' | 'grid';

interface Preset {
  key: PresetKey;
  label: string;
  desc: string;
  disableSlider: boolean;
}

const PRESETS: Preset[] = [
  { key: 'line_origin',   label: '\u904E\u539F\u9EDE\u76F4\u7DDA \u2192 \u76F4\u7DDA',   desc: '\u904E\u539F\u9EDE\u7684\u76F4\u7DDA\uFF1AA=0, C=0 \u2192 A\u2019=0, C\u2019=0\u3002\u5169\u908A\u90FD\u662F\u76F4\u7DDA\uFF0C\u89D2\u5EA6\u5F9E \u03B8 \u8B8A\u6210 -\u03B8\u3002', disableSlider: false },
  { key: 'line_off',      label: '\u76F4\u7DDA\u4E0D\u904E\u539F\u9EDE \u2192 \u5713',     desc: '\u4E0D\u904E\u539F\u9EDE\u7684\u76F4\u7DDA\uFF1AA=0, C\u22600 \u2192 A\u2019=C\u22600\uFF08\u5713\uFF01\uFF09\uFF0CC\u2019=A=0\uFF08\u904E\u539F\u9EDE\uFF01\uFF09\u3002\u76F4\u7DDA\u5EF6\u4F38\u5230\u7121\u7AAE\u7684\u5169\u7AEF\u88AB\u62C9\u56DE\u539F\u9EDE\u3002', disableSlider: false },
  { key: 'circle_origin', label: '\u5713\u904E\u539F\u9EDE \u2192 \u76F4\u7DDA',           desc: '\u904E\u539F\u9EDE\u7684\u5713\uFF1AA\u22600, C=0 \u2192 A\u2019=C=0\uFF08\u76F4\u7DDA\uFF09\u3002\u5713\u5728\u539F\u9EDE\u8655\u88AB\u6495\u958B\u3001\u62C9\u5230\u7121\u7AAE\u3002', disableSlider: false },
  { key: 'circle_off',    label: '\u5713\u4E0D\u904E\u539F\u9EDE \u2192 \u5713',           desc: '\u4E0D\u904E\u539F\u9EDE\u7684\u5713\uFF1AA\u22600, C\u22600 \u2192 A\u2019\u22600, C\u2019\u22600\u3002\u5713\u9084\u662F\u5713\uFF0C\u4F4D\u7F6E\u548C\u5927\u5C0F\u6539\u8B8A\u3002', disableSlider: false },
  { key: 'unit',          label: '\u55AE\u4F4D\u5713 \u2192 \u55AE\u4F4D\u5713',           desc: '\u55AE\u4F4D\u5713\uFF1A|z|=1 \u4E0A\u53D6\u5012\u6578\u6A21\u4E0D\u8B8A\uFF0C\u53EA\u662F\u65B9\u5411\u53CD\u8F49\uFF08\u03B8 \u2192 -\u03B8\uFF09\u3002', disableSlider: true },
  { key: 'grid',          label: '\u6C34\u5E73+\u5782\u76F4\u7DB2\u683C',                  desc: '\u6C34\u5E73+\u5782\u76F4\u7DDA\uFF08\u90FD\u4E0D\u904E\u539F\u9EDE\uFF09\u2192 \u5168\u90E8\u8B8A\u6210\u901A\u904E\u539F\u9EDE\u7684\u5713\u3002', disableSlider: false },
];

/* ── Curve colors for grid mode ── */
const WARM_COLORS = ['#c06060', '#cc7744', '#b89030', '#c05858', '#bb6633'];
const COOL_COLORS = ['#4488aa', '#5577bb', '#3399aa', '#4466bb', '#3388cc'];

/* ── SVG path builder with discontinuity handling ── */
function buildPath(v: PlaneView, pts: C[], maxJump: number): string {
  let d = '';
  let prevSvg: [number, number] | null = null;
  for (const p of pts) {
    if (cAbs(p) > 8) { prevSvg = null; continue; }
    const sv = toSvg(v, p);
    if (prevSvg === null) {
      d += `M${sv[0].toFixed(1)},${sv[1].toFixed(1)}`;
    } else {
      const dx = sv[0] - prevSvg[0];
      const dy = sv[1] - prevSvg[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxJump) {
        d += `M${sv[0].toFixed(1)},${sv[1].toFixed(1)}`;
      } else {
        d += `L${sv[0].toFixed(1)},${sv[1].toFixed(1)}`;
      }
    }
    prevSvg = sv;
  }
  return d;
}

/* ── Curve data ── */
interface CurveData {
  srcPaths: { d: string; color: string }[];
  dstPaths: { d: string; color: string }[];
  markers: { src: C; dst: C }[];
}

function generateCurves(key: PresetKey, t: number): CurveData {
  const srcColor = 'var(--accent)';
  const dstColor = '#5a8a5a';
  const maxJump = (VIEW.svgW - 2 * VIEW.pad) * 0.4; // break threshold in SVG px

  switch (key) {
    case 'line_origin': {
      const angle = t * Math.PI;
      const srcPts: C[] = [];
      for (let i = 0; i <= 300; i++) {
        const s = -4 + (8 * i) / 300;
        srcPts.push([s * Math.cos(angle), s * Math.sin(angle)]);
      }
      const dstPts = srcPts.map(inv);
      const markers = pickMarkers(srcPts, 4);
      return {
        srcPaths: [{ d: buildPath(VIEW, srcPts, maxJump), color: srcColor }],
        dstPaths: [{ d: buildPath(VIEW, dstPts, maxJump), color: dstColor }],
        markers,
      };
    }

    case 'line_off': {
      const d = 0.3 + t * 2.5;
      const srcPts: C[] = [];
      for (let i = 0; i <= 300; i++) {
        const s = -5 + (10 * i) / 300;
        srcPts.push([d, s]);
      }
      const dstPts = srcPts.map(inv);
      const markers = pickMarkers(srcPts, 4);
      return {
        srcPaths: [{ d: buildPath(VIEW, srcPts, maxJump), color: srcColor }],
        dstPaths: [{ d: buildPath(VIEW, dstPts, maxJump), color: dstColor }],
        markers,
      };
    }

    case 'circle_origin': {
      const r = 0.5 + t * 2;
      const srcPts: C[] = [];
      for (let i = 0; i <= 300; i++) {
        const theta = (2 * Math.PI * i) / 300;
        srcPts.push([r + r * Math.cos(theta), r * Math.sin(theta)]);
      }
      const dstPts = srcPts.map(inv);
      const markers = pickMarkers(srcPts, 4);
      return {
        srcPaths: [{ d: buildPath(VIEW, srcPts, maxJump), color: srcColor }],
        dstPaths: [{ d: buildPath(VIEW, dstPts, maxJump), color: dstColor }],
        markers,
      };
    }

    case 'circle_off': {
      const cx = 1.5 + t;
      const r = 0.5 + t * 1.5;
      const srcPts: C[] = [];
      for (let i = 0; i <= 300; i++) {
        const theta = (2 * Math.PI * i) / 300;
        srcPts.push([cx + r * Math.cos(theta), r * Math.sin(theta)]);
      }
      const dstPts = srcPts.map(inv);
      const markers = pickMarkers(srcPts, 4);
      return {
        srcPaths: [{ d: buildPath(VIEW, srcPts, maxJump), color: srcColor }],
        dstPaths: [{ d: buildPath(VIEW, dstPts, maxJump), color: dstColor }],
        markers,
      };
    }

    case 'unit': {
      const srcPts: C[] = [];
      for (let i = 0; i <= 300; i++) {
        const theta = (2 * Math.PI * i) / 300;
        srcPts.push([Math.cos(theta), Math.sin(theta)]);
      }
      const dstPts = srcPts.map(inv);
      const markers = pickMarkers(srcPts, 4);
      return {
        srcPaths: [{ d: buildPath(VIEW, srcPts, maxJump), color: srcColor }],
        dstPaths: [{ d: buildPath(VIEW, dstPts, maxJump), color: dstColor }],
        markers,
      };
    }

    case 'grid': {
      const offset = (t - 0.5) * 2;
      const srcPaths: { d: string; color: string }[] = [];
      const dstPaths: { d: string; color: string }[] = [];

      // Horizontal lines
      const hLines = [-2, -1, 0, 1, 2].map(y => y + offset);
      hLines.forEach((y, idx) => {
        const pts: C[] = [];
        for (let i = 0; i <= 300; i++) {
          const x = -4 + (8 * i) / 300;
          pts.push([x, y]);
        }
        const color = WARM_COLORS[idx % WARM_COLORS.length];
        srcPaths.push({ d: buildPath(VIEW, pts, maxJump), color });
        dstPaths.push({ d: buildPath(VIEW, pts.map(inv), maxJump), color });
      });

      // Vertical lines
      const vLines = [-2, -1, 0, 1, 2].map(x => x + offset);
      vLines.forEach((x, idx) => {
        const pts: C[] = [];
        for (let i = 0; i <= 300; i++) {
          const y = -4 + (8 * i) / 300;
          pts.push([x, y]);
        }
        const color = COOL_COLORS[idx % COOL_COLORS.length];
        srcPaths.push({ d: buildPath(VIEW, pts, maxJump), color });
        dstPaths.push({ d: buildPath(VIEW, pts.map(inv), maxJump), color });
      });

      return { srcPaths, dstPaths, markers: [] };
    }
  }
}

/** Pick N evenly-spaced sample points from a curve. */
function pickMarkers(pts: C[], n: number): { src: C; dst: C }[] {
  const result: { src: C; dst: C }[] = [];
  const step = Math.floor(pts.length / (n + 1));
  for (let i = 1; i <= n; i++) {
    const src = pts[i * step];
    if (cAbs(src) < 1e-4) continue;
    const dst = inv(src);
    if (cAbs(dst) > 8) continue;
    result.push({ src, dst });
  }
  return result;
}

@Component({
  selector: 'app-step-deep-inversion',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- ===== Prose block 1: polar interpretation ===== -->
    <app-prose-block title="\u6DF1\u5165 1/z\uFF1A\u53CD\u6F14\u8207\u5EE3\u7FA9\u5713" subtitle="&sect;2.6">
      <p>
        \u5728\u6975\u5EA7\u6A19\u4E0B\uFF0C\u82E5 <app-math [e]="'z = r\\\\cdot e^{i\\\\theta}'" />\uFF0C\u5247
      </p>
      <app-math block [e]="polarFormula" />
      <p>
        \u5169\u4EF6\u4E8B\u60C5\u540C\u6642\u767C\u751F\uFF1A\u6A21\u9577\u53D6\u5012\u6578\uFF08\u8FD1\u2194\u9060\uFF09\uFF0C\u5E45\u89D2\u53D6\u8CA0\uFF08\u95DC\u65BC\u5BE6\u8EF8\u53CD\u5C04\uFF09\u3002
        \u4F46\u55AE\u7D14\u7684\u6975\u5EA7\u6A19\u89C0\u9EDE\u4E0D\u80FD\u89E3\u91CB\u70BA\u4EC0\u9EBC\u76F4\u7DDA\u6703\u8B8A\u6210\u5713\u3002\u95DC\u9375\u5728\u65BC\u4EE3\u6578\u3002
      </p>
    </app-prose-block>

    <!-- ===== Prose block 2: generalized circles ===== -->
    <app-prose-block title="\u5EE3\u7FA9\u5713\uFF08\u5713\u6216\u76F4\u7DDA\uFF09" subtitle="\u4EE3\u6578\u89C0\u9EDE">
      <p>
        <app-math [e]="'\\\\mathbb{C}'" /> \u4E2D\u7684\u300C\u5EE3\u7FA9\u5713\u300D\u6EFF\u8DB3\uFF1A
      </p>
      <app-math block [e]="genCircleEq" />
      <p>
        \u5176\u4E2D A, C \u70BA\u5BE6\u6578\uFF0CB \u70BA\u8907\u6578\u3002
        \u7576 A=0 \u6642\u5B83\u662F\u76F4\u7DDA\uFF0CA\u22600 \u6642\u662F\u5713\u3002
      </p>
      <p>
        \u4EE3\u5165 <app-math [e]="'z = 1/w'" /> \u4E26\u4E58\u4EE5 <app-math [e]="'|w|^2'" />\uFF1A
      </p>
      <app-math block [e]="substitutedEq" />
      <p>
        \u540C\u6A23\u7684\u5F62\u5F0F\uFF0C\u4F46 A \u548C C \u4E92\u63DB\uFF01
        \u9019\u5C31\u662F\u70BA\u4EC0\u9EBC 1/z \u628A\u5EE3\u7FA9\u5713\u6620\u5230\u5EE3\u7FA9\u5713\uFF0C
        \u800C\u76F4\u7DDA\uFF08A=0\uFF09\u53EF\u4EE5\u8B8A\u6210\u5713\uFF08A\u2019=C\u22600\uFF09\uFF0C\u53CD\u4E4B\u4EA6\u7136\u3002
      </p>
    </app-prose-block>

    <!-- ===== Four cases ===== -->
    <app-prose-block title="\u56DB\u7A2E\u60C5\u6CC1">
      <div class="case-grid">
        <div class="case-card">
          <div class="case-header">\u60C5\u6CC1 1</div>
          <div class="case-title">\u904E\u539F\u9EDE\u7684\u76F4\u7DDA \u2192 \u76F4\u7DDA</div>
          <div class="case-body">A=0, C=0 \u2192 A\u2019=0\u3002\u7DDA\u904E\u539F\u9EDE\u4ECD\u662F\u7DDA\uFF0C\u89D2\u5EA6\u53D6\u8CA0\u3002</div>
        </div>
        <div class="case-card">
          <div class="case-header">\u60C5\u6CC1 2</div>
          <div class="case-title">\u4E0D\u904E\u539F\u9EDE\u7684\u76F4\u7DDA \u2192 \u904E\u539F\u9EDE\u7684\u5713</div>
          <div class="case-body">A=0, C\u22600 \u2192 A\u2019=C\u22600\uFF08\u5713\uFF09\uFF0CC\u2019=A=0\uFF08\u904E\u539F\u9EDE\uFF09\u3002\u6700\u8B93\u4EBA\u9A5A\u8A1D\u7684\u60C5\u6CC1\uFF01</div>
        </div>
        <div class="case-card">
          <div class="case-header">\u60C5\u6CC1 3</div>
          <div class="case-title">\u904E\u539F\u9EDE\u7684\u5713 \u2192 \u76F4\u7DDA</div>
          <div class="case-body">A\u22600, C=0 \u2192 A\u2019=0\uFF08\u76F4\u7DDA\uFF09\u3002\u60C5\u6CC1 2 \u7684\u53CD\u904E\u7A0B\u3002</div>
        </div>
        <div class="case-card">
          <div class="case-header">\u60C5\u6CC1 4</div>
          <div class="case-title">\u4E0D\u904E\u539F\u9EDE\u7684\u5713 \u2192 \u5713</div>
          <div class="case-body">A\u22600, C\u22600 \u2192 \u5169\u500B\u90FD\u4E0D\u70BA\u96F6\u3002\u5713\u9084\u662F\u5713\uFF0C\u4F4D\u7F6E\u548C\u5927\u5C0F\u6539\u8B8A\u3002</div>
        </div>
      </div>
    </app-prose-block>

    <!-- ===== Interactive dual-panel ===== -->
    <app-challenge-card prompt="\u9078\u64C7\u7BC4\u4F8B\uFF0C\u62D6\u52D5\u53C3\u6578\uFF0C\u89C0\u5BDF 1/z \u5982\u4F55\u628A\u76F4\u7DDA\u8B8A\u6210\u5713">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key) {
          <button class="preset-btn"
                  [class.active]="presetIdx() === $index"
                  (click)="presetIdx.set($index)">
            {{ p.label }}
          </button>
        }
      </div>

      <!-- Parameter slider -->
      <div class="slider-row">
        <span class="slider-label">\u53C3\u6578</span>
        <input type="range" class="t-slider" min="0" max="100" step="1"
               [value]="param()"
               [disabled]="activePreset().disableSlider"
               (input)="onParam($event)" />
        <span class="slider-val">{{ param() }}</span>
      </div>

      <!-- Dual panel -->
      <div class="dual-panel">
        <!-- Left: z-plane -->
        <div class="panel">
          <div class="panel-title">z \u5E73\u9762</div>
          <svg [attr.viewBox]="viewBox" class="panel-svg">
            <!-- Axes -->
            <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            <!-- Tick labels -->
            @for (tk of ticks; track tk.label) {
              <text [attr.x]="tk.x" [attr.y]="tk.y" class="tick-text">{{ tk.label }}</text>
            }
            <!-- Origin label -->
            <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]"
                    r="2.5" fill="var(--text-muted)" />
            <!-- Source curves -->
            @for (c of curves().srcPaths; track $index) {
              <path [attr.d]="c.d" [attr.stroke]="c.color"
                    stroke-width="2" fill="none" stroke-linecap="round" />
            }
            <!-- Sample markers on source -->
            @for (m of curves().markers; track $index) {
              <circle [attr.cx]="markerSvg(m.src)[0]" [attr.cy]="markerSvg(m.src)[1]"
                      r="4" fill="var(--accent)" stroke="var(--bg)" stroke-width="1" />
            }
          </svg>
        </div>

        <!-- Right: w = 1/z plane -->
        <div class="panel">
          <div class="panel-title">w = 1/z \u5E73\u9762</div>
          <svg [attr.viewBox]="viewBox" class="panel-svg">
            <!-- Axes -->
            <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            <!-- Tick labels -->
            @for (tk of ticks; track tk.label) {
              <text [attr.x]="tk.x" [attr.y]="tk.y" class="tick-text">{{ tk.label }}</text>
            }
            <!-- Origin label -->
            <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]"
                    r="2.5" fill="var(--text-muted)" />
            <!-- Transformed curves -->
            @for (c of curves().dstPaths; track $index) {
              <path [attr.d]="c.d" [attr.stroke]="c.color"
                    stroke-width="2" fill="none" stroke-linecap="round" />
            }
            <!-- Sample markers on destination -->
            @for (m of curves().markers; track $index) {
              <circle [attr.cx]="markerSvg(m.dst)[0]" [attr.cy]="markerSvg(m.dst)[1]"
                      r="4" fill="#5a8a5a" stroke="var(--bg)" stroke-width="1" />
            }
          </svg>
        </div>
      </div>

      <!-- Description card -->
      <div class="desc-card">
        {{ activePreset().desc }}
      </div>
    </app-challenge-card>

    <!-- ===== Closing prose ===== -->
    <app-prose-block>
      <p>
        1/z \u662F\u6700\u7C21\u55AE\u7684 M\u00F6bius \u8B8A\u63DB\u3002\u5B83\u63ED\u793A\u4E86\u4E00\u500B\u6DF1\u523B\u7684\u5E7E\u4F55\u4E8B\u5BE6\uFF1A\u5728\u8907\u6578\u5E73\u9762\u4E2D\uFF0C\u76F4\u7DDA\u548C\u5713\u662F\u540C\u4E00\u7A2E\u6771\u897F\u2014\u2014\u300C\u5EE3\u7FA9\u5713\u300D\u3002
        1/z \u5728\u9019\u4E9B\u5EE3\u7FA9\u5713\u4E4B\u9593\u81EA\u7531\u8F49\u63DB\uFF0C\u4FDD\u89D2\u5730\u91CD\u5851\u7A7A\u9593\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    /* ── Case grid ── */
    .case-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 12px 0;
    }
    @media (max-width: 500px) {
      .case-grid { grid-template-columns: 1fr; }
    }
    .case-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 14px;
      background: var(--bg-surface);
    }
    .case-header {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 4px;
    }
    .case-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 6px;
    }
    .case-body {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.55;
    }

    /* ── Preset buttons ── */
    .preset-row {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .preset-btn {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active {
        background: var(--accent-18);
        border-color: var(--accent);
        color: var(--text);
        font-weight: 600;
      }
    }

    /* ── Slider ── */
    .slider-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .slider-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .t-slider {
      flex: 1;
      accent-color: var(--accent);
    }
    .slider-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      min-width: 28px;
      text-align: right;
    }

    /* ── Dual panel ── */
    .dual-panel {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
    }
    .panel {
      flex: 1;
      min-width: 0;
    }
    .panel-title {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      text-align: center;
      margin-bottom: 4px;
    }
    .panel-svg {
      width: 100%;
      display: block;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      aspect-ratio: 1;
    }

    /* ── Tick text in SVG ── */
    .tick-text {
      font-size: 7px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
      dominant-baseline: hanging;
    }

    /* ── Description card ── */
    .desc-card {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepDeepInversionComponent {
  /* ── Constants ── */
  readonly view = VIEW;
  readonly viewBox = `0 0 ${VIEW.svgW} ${VIEW.svgH}`;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;

  /* ── KaTeX expressions ── */
  readonly polarFormula = String.raw`\frac{1}{z} = \frac{1}{r} \cdot e^{-i\theta}`;
  readonly genCircleEq = String.raw`A|z|^2 + Bz + \bar{B}\bar{z} + C = 0`;
  readonly substitutedEq = String.raw`C|w|^2 + \bar{B}w + B\bar{w} + A = 0`;

  /* ── Reactive state ── */
  readonly presetIdx = signal(1); // default: line_off
  readonly param = signal(50);

  /* ── Derived ── */
  readonly activePreset = computed(() => PRESETS[this.presetIdx()]);

  readonly curves = computed((): CurveData => {
    const preset = this.activePreset();
    const t = this.param() / 100;
    return generateCurves(preset.key, t);
  });

  /* ── Tick marks ── */
  readonly ticks: { x: number; y: number; label: string }[] = (() => {
    const result: { x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (const val of [-3, -2, -1, 1, 2, 3]) {
      // x-axis ticks
      const [tx] = toSvg(VIEW, [val, 0]);
      result.push({ x: tx, y: oy + 10, label: String(val) });
      // y-axis ticks
      const [, ty] = toSvg(VIEW, [0, val]);
      result.push({ x: ox - 10, y: ty + 3, label: String(val) });
    }
    return result;
  })();

  /* ── Methods ── */
  markerSvg(z: C): [number, number] {
    return toSvg(VIEW, z);
  }

  onParam(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.param.set(val);
  }
}
