import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAbs, cPow, cInv, cExp, cAdd,
  PlaneView, toSvg, fromSvg, axesPath, fmtC,
} from '../complex-ch1/complex-util';

/* ── View shared by both panels ── */
const VIEW: PlaneView = { cx: 0, cy: 0, radius: 2.5, svgW: 260, svgH: 260, pad: 22 };

/* ── Function presets ── */
interface FuncPreset {
  label: string;
  tex: string;
  fn: (z: C) => C;
}

const PRESETS: FuncPreset[] = [
  { label: 'z\u00B2', tex: 'f(z) = z^2',              fn: (z: C) => cPow(z, 2) },
  { label: 'z\u00B3', tex: 'f(z) = z^3',              fn: (z: C) => cPow(z, 3) },
  { label: '1/z',     tex: 'f(z) = \\tfrac{1}{z}',    fn: (z: C) => cInv(z)     },
  { label: 'e\u1DBB', tex: 'f(z) = e^z',              fn: (z: C) => cExp(z)     },
];

/* ── Per-function detailed descriptions ── */
interface FuncDetail {
  title: string;
  points: string[];
}

const DESCRIPTIONS: FuncDetail[] = [
  {
    title: 'z\u00B2 \u2014 \u89D2\u5EA6\u52A0\u500D\u3001\u6A21\u9577\u5E73\u65B9',
    points: [
      '\u82E5 z = re^{i\u03B8}\uFF0C\u5247 z\u00B2 = r\u00B2e^{2i\u03B8}',
      '\u89D2\u5EA6\u52A0\u500D\uFF1A\u4E0A\u534A\u5E73\u9762\uFF080 \u5230 \u03C0\uFF09\u6620\u5230\u6574\u500B\u5E73\u9762\uFF080 \u5230 2\u03C0\uFF09',
      '\u6A21\u9577\u5E73\u65B9\uFF1A\u8FD1\u7684\u66F4\u8FD1\uFF0C\u9060\u7684\u66F4\u9060',
      '\u6C34\u5E73\u7DDA\u548C\u5782\u76F4\u7DDA\u90FD\u8B8A\u6210\u62CB\u7269\u7DDA\u5F62\u66F2\u7DDA',
    ],
  },
  {
    title: 'z\u00B3 \u2014 \u89D2\u5EA6\u4E09\u500D\u3001\u6A21\u9577\u7ACB\u65B9',
    points: [
      '\u82E5 z = re^{i\u03B8}\uFF0C\u5247 z\u00B3 = r\u00B3e^{3i\u03B8}',
      '\u89D2\u5EA6\u4E09\u500D\uFF1A120\u00B0 \u7684\u6247\u5F62\u5C31\u80FD\u8986\u84CB\u6574\u500B\u5E73\u9762',
      '\u66F2\u7DDA\u66F4\u5BC6\u96C6\u5730\u7E9E\u7D50\u5728\u539F\u9EDE\u9644\u8FD1',
      '\u539F\u9EDE\u662F\u4E09\u91CD\u96F6\u9EDE\uFF0C\u5C40\u90E8\u7E2E\u653E |f\u2032(0)| = 0',
    ],
  },
  {
    title: '1/z \u2014 \u53CD\u6F14\u8B8A\u63DB',
    points: [
      '\u82E5 z = re^{i\u03B8}\uFF0C\u5247 1/z = (1/r)e^{-i\u03B8}',
      '\u6A21\u53D6\u5012\u6578\uFF1A\u5713\u5167\u548C\u5713\u5916\u4E92\u63DB',
      '\u89D2\u5EA6\u53D6\u8CA0\uFF1A\u5C0D\u5BE6\u8EF8\u93E1\u5C04',
      '\u76F4\u7DDA\u8B8A\u6210\u5713\u3001\u5713\u8B8A\u6210\u76F4\u7DDA\u6216\u5713\uFF08\u8A73\u898B \u00A72.6\uFF09',
    ],
  },
  {
    title: 'e^z \u2014 \u6307\u6578\u6620\u5C04',
    points: [
      'e^{x+iy} = e^x \u00B7 (cos y + i sin y)',
      '\u6C34\u5E73\u7DDA\uFF08\u56FA\u5B9A Im = c\uFF09\u2192 \u5C04\u7DDA\uFF08\u89D2\u5EA6 = c\uFF0C\u6A21 = e^x \u8B8A\u5316\uFF09',
      '\u5782\u76F4\u7DDA\uFF08\u56FA\u5B9A Re = c\uFF09\u2192 \u540C\u5FC3\u5713\uFF08\u534A\u5F91 = e^c\uFF0C\u89D2\u5EA6\u8B8A\u5316\uFF09',
      '\u9031\u671F\u6027\uFF1Ae^{z+2\u03C0i} = e^z\uFF0C\u6BCF\u9694 2\u03C0i \u91CD\u8907',
    ],
  },
];

/* ── Grid geometry constants ── */
const LO = -2, HI = 2, N_LINES = 10, N_SAMPLES = 80;
const STEP = (HI - LO) / N_LINES;
const DS = (HI - LO) / N_SAMPLES;

/* ── Neighborhood circle ── */
const CIRCLE_R = 0.25;
const CIRCLE_N = 32;

/* ── Helpers ── */
function lerp(a: C, b: C, t: number): C {
  return [a[0] * (1 - t) + b[0] * t, a[1] * (1 - t) + b[1] * t];
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Build SVG polygon points attribute from an array of C. */
function polyPoints(v: PlaneView, pts: C[]): string {
  return pts.map(p => {
    const [sx, sy] = toSvg(v, p);
    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
  }).join(' ');
}

/** Build an SVG path for one grid line, skipping out-of-range points. */
function linePath(v: PlaneView, pts: C[]): string {
  let d = '';
  for (const p of pts) {
    if (cAbs(p) > 8) { d += ' '; continue; }
    const [sx, sy] = toSvg(v, p);
    d += (d.length === 0 || d.endsWith(' '))
      ? `M${sx.toFixed(1)},${sy.toFixed(1)}`
      : `L${sx.toFixed(1)},${sy.toFixed(1)}`;
  }
  return d;
}

@Component({
  selector: 'app-step-complex-functions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- ============================================================ -->
    <!-- Section 1: What IS a complex function?                       -->
    <!-- ============================================================ -->
    <app-prose-block title="\u8907\u8B8A\u51FD\u6578\uFF1A\u5E73\u9762\u5230\u5E73\u9762\u7684\u8B8A\u63DB" subtitle="\u00A72.1">
      <p>
        \u5BE6\u51FD\u6578
        <app-math [e]="'f:\\\\mathbb{R}\\\\to\\\\mathbb{R}'" />
        \u628A\u6578\u7DDA\u4E0A\u7684\u4E00\u9EDE\u5C0D\u61C9\u5230\u6578\u7DDA\u4E0A\u7684\u53E6\u4E00\u9EDE\uFF0C\u6211\u5011\u53EF\u4EE5\u7528\u4E00\u689D\u66F2\u7DDA\u756B\u51FA\u5B83\u7684\u5716\u5F62\u3002
        \u9019\u5F88\u76F4\u89C0\uFF0C\u56E0\u70BA\u8F38\u5165\u4E00\u7DAD\u3001\u8F38\u51FA\u4E5F\u4E00\u7DAD\uFF0C\u52A0\u8D77\u4F86\u525B\u597D\u662F\u4E8C\u7DAD\u7684\u5716\u7D19\u3002
      </p>
      <p>
        \u8907\u8B8A\u51FD\u6578
        <app-math [e]="'f:\\\\mathbb{C}\\\\to\\\\mathbb{C}'" />
        \u5247\u628A<strong>\u5E73\u9762</strong>\u4E0A\u7684\u4E00\u9EDE\u5C0D\u61C9\u5230<strong>\u53E6\u4E00\u500B\u5E73\u9762</strong>\u4E0A\u7684\u4E00\u9EDE\u3002
        \u8981\u756B\u5B83\u7684\u300C\u5716\u5F62\u300D\u9700\u8981\u56DB\u500B\u7DAD\u5EA6\uFF08\u8F38\u5165 2 \u7DAD + \u8F38\u51FA 2 \u7DAD\uFF09\u2014\u2014\u6211\u5011\u7121\u6CD5\u76F4\u63A5\u756B\u51FA\u4F86\u3002
      </p>
      <p>
        \u90A3\u9EBC\u5982\u4F55\u300C\u770B\u898B\u300D\u8907\u8B8A\u51FD\u6578\uFF1F
        \u65B9\u6CD5\u662F\uFF1A\u5728\u8F38\u5165\u5E73\u9762\u756B\u4E00\u7D44\u898F\u5247\u7684\u683C\u7DDA\uFF0C\u7136\u5F8C\u89C0\u5BDF\u9019\u4E9B\u683C\u7DDA\u901A\u904E f \u4E4B\u5F8C\u5982\u4F55\u8B8A\u5F62\u3002
        \u5C31\u50CF\u5728\u5E73\u9762\u4E0A\u92EA\u4E00\u5F35\u6A61\u76AE\u5E03\uFF0C\u7136\u5F8C\u770B\u5B83\u88AB\u62C9\u4F38\u3001\u65CB\u8F49\u3001\u5F4E\u66F2\u7684\u6A23\u5B50\u3002
      </p>
      <app-math block [e]="mainFormula" />
    </app-prose-block>

    <!-- ============================================================ -->
    <!-- Section 2: How to read the visualization                     -->
    <!-- ============================================================ -->
    <app-prose-block>
      <p><strong>\u5982\u4F55\u95B1\u8B80\u4E0B\u65B9\u7684\u8996\u89BA\u5316</strong></p>
      <p>
        \u5DE6\u5074\u662F <strong>z \u5E73\u9762</strong>\uFF08\u8F38\u5165\uFF09\uFF0C\u756B\u6709\u4E00\u7D44\u898F\u5247\u7684\u6C34\u5E73\u7DDA\u548C\u5782\u76F4\u7DDA\u3002
        \u53F3\u5074\u662F <strong>f(z) \u5E73\u9762</strong>\uFF08\u8F38\u51FA\uFF09\uFF0C\u540C\u4E00\u7D44\u683C\u7DDA\u7D93\u904E f \u8B8A\u63DB\u5F8C\u7684\u6A23\u5B50\u3002
        \u984F\u8272\u5E6B\u52A9\u4F60\u8FFD\u8E64\u6BCF\u689D\u7DDA\uFF1A
      </p>
      <div class="guide-legend">
        <span class="legend-item">
          <span class="legend-line" style="background: var(--accent);"></span>
          \u6C34\u5E73\u7DDA\uFF08Im = \u5E38\u6578\uFF09
        </span>
        <span class="legend-item">
          <span class="legend-line" style="background: #5a8a5a;"></span>
          \u5782\u76F4\u7DDA\uFF08Re = \u5E38\u6578\uFF09
        </span>
      </div>
      <p>
        \u300C\u8B8A\u63DB\u9032\u5EA6\u300D\u6ED1\u687F\u5F9E t=0\uFF08\u539F\u59CB\u683C\u7DDA\uFF09\u52D5\u756B\u5230 t=1\uFF08\u5B8C\u6574\u8B8A\u63DB\uFF09\uFF0C
        \u8B93\u4F60\u6162\u52D5\u4F5C\u770B\u6E05\u695A\u6BCF\u689D\u7DDA\u662F\u600E\u9EBC\u5F4E\u66F2\u7684\u3002
      </p>
    </app-prose-block>

    <!-- ============================================================ -->
    <!-- Section 3: Main interactive — grid + probe                   -->
    <!-- ============================================================ -->
    <app-challenge-card prompt="\u9078\u64C7\u51FD\u6578\uFF0C\u64AD\u653E\u52D5\u756B\uFF0C\u62D6\u52D5\u63A2\u6E2C\u9EDE\u2014\u2014\u89C0\u5BDF\u8907\u8B8A\u51FD\u6578\u7684\u5E7E\u4F55">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.label) {
          <button class="preset-btn"
                  [class.active]="activeIdx() === $index"
                  (click)="activeIdx.set($index)">
            {{ p.label }}
          </button>
        }
      </div>

      <!-- Color legend -->
      <div class="legend-row">
        <span class="legend-entry">
          <span class="legend-swatch" style="background: var(--accent);"></span>
          \u6C34\u5E73\u7DDA (Im = const)
        </span>
        <span class="legend-entry">
          <span class="legend-swatch" style="background: #5a8a5a;"></span>
          \u5782\u76F4\u7DDA (Re = const)
        </span>
        <span class="legend-entry">
          <span class="legend-swatch circle-swatch" style="background: var(--accent);"></span>
          \u63A2\u6E2C\u5713
        </span>
        <span class="legend-entry">
          <span class="legend-swatch circle-swatch" style="background: #c06060;"></span>
          \u5713\u7684\u50CF
        </span>
      </div>

      <!-- Animation controls -->
      <div class="anim-row">
        <button class="play-btn"
                [class.playing]="playing()"
                [disabled]="playing()"
                (click)="playAnimation()">
          {{ playing() ? '\u25B6' : '\u25B6 \u64AD\u653E' }}
        </button>
        <label class="slider-label">\u8B8A\u63DB\u9032\u5EA6</label>
        <input type="range" class="t-slider" min="0" max="1" step="0.01"
               [value]="animT()"
               (input)="onSlider($event)" />
        <span class="t-value">{{ animT().toFixed(2) }}</span>
      </div>

      <!-- Dual panel -->
      <div class="dual-panel">
        <!-- Left: z-plane (domain) -->
        <div class="panel">
          <div class="panel-title">z \u5E73\u9762\uFF08\u8F38\u5165\uFF09</div>
          <svg [attr.viewBox]="viewBox" class="panel-svg"
               (mousedown)="onMouseDown($event)"
               (mousemove)="onMouseMove($event)"
               (mouseup)="onMouseUp()"
               (mouseleave)="onMouseUp()"
               (touchstart)="onTouchStart($event)"
               (touchmove)="onTouchMove($event)"
               (touchend)="onMouseUp()">
            <!-- Axes -->
            <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            <!-- Source grid: horizontal lines (accent, faint) -->
            @for (p of srcHPaths; track $index) {
              <path [attr.d]="p" fill="none" stroke="var(--accent)" stroke-width="1.2"
                    stroke-opacity="0.3" />
            }
            <!-- Source grid: vertical lines (green, faint) -->
            @for (p of srcVPaths; track $index) {
              <path [attr.d]="p" fill="none" stroke="#5a8a5a" stroke-width="1.2"
                    stroke-opacity="0.3" />
            }
            <!-- Dashed line from origin to z0 -->
            <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
                  [attr.x2]="probeSvg()[0]" [attr.y2]="probeSvg()[1]"
                  stroke="var(--text-muted)" stroke-width="0.6" stroke-dasharray="3,3" />
            <!-- Neighborhood circle -->
            <polygon [attr.points]="srcNeighborhood()"
                     fill="var(--accent)" fill-opacity="0.08"
                     stroke="var(--accent)" stroke-width="1" />
            <!-- Probe point z0 -->
            <circle [attr.cx]="probeSvg()[0]" [attr.cy]="probeSvg()[1]"
                    r="7" fill="var(--accent)" style="cursor: grab;" />
            <!-- Label z0 -->
            <text [attr.x]="probeSvg()[0] + 10" [attr.y]="probeSvg()[1] - 10"
                  fill="var(--accent)" font-size="11"
                  font-family="'JetBrains Mono', monospace">z\u2080</text>
          </svg>
        </div>

        <!-- Right: f(z)-plane (range) -->
        <div class="panel">
          <div class="panel-title">f(z) \u5E73\u9762\uFF08\u8F38\u51FA\uFF09</div>
          <svg [attr.viewBox]="viewBox" class="panel-svg">
            <!-- Axes -->
            <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="0.7" fill="none" />
            <!-- Transformed grid: horizontal lines (accent) -->
            @for (p of dstHPaths(); track $index) {
              <path [attr.d]="p" fill="none" stroke="var(--accent)" stroke-width="1.2"
                    stroke-opacity="0.55" stroke-linecap="round" />
            }
            <!-- Transformed grid: vertical lines (green) -->
            @for (p of dstVPaths(); track $index) {
              <path [attr.d]="p" fill="none" stroke="#5a8a5a" stroke-width="1.2"
                    stroke-opacity="0.55" stroke-linecap="round" />
            }
            <!-- Dashed line from origin to f(z0) -->
            <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
                  [attr.x2]="mappedSvg()[0]" [attr.y2]="mappedSvg()[1]"
                  stroke="var(--text-muted)" stroke-width="0.6" stroke-dasharray="3,3" />
            <!-- Image of neighborhood circle -->
            <polygon [attr.points]="dstNeighborhood()"
                     fill="#c06060" fill-opacity="0.10"
                     stroke="#c06060" stroke-width="1" />
            <!-- Mapped probe point f(z0) -->
            <circle [attr.cx]="mappedSvg()[0]" [attr.cy]="mappedSvg()[1]"
                    r="7" fill="#c06060" />
            <!-- Label f(z0) -->
            <text [attr.x]="mappedSvg()[0] + 10" [attr.y]="mappedSvg()[1] - 10"
                  fill="#c06060" font-size="11"
                  font-family="'JetBrains Mono', monospace">f(z\u2080)</text>
          </svg>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-cards">
        <div class="info-card">
          <span class="info-lbl">z\u2080</span>
          <span class="info-val">{{ probeLabel() }}</span>
        </div>
        <div class="info-card">
          <span class="info-lbl">f(z\u2080)</span>
          <span class="info-val">{{ mappedLabel() }}</span>
        </div>
        <div class="info-card">
          <span class="info-lbl">\u5C40\u90E8\u7E2E\u653E |f\u2032(z\u2080)|</span>
          <span class="info-val">\u2248 {{ derivMag() }}</span>
        </div>
      </div>
    </app-challenge-card>

    <!-- ============================================================ -->
    <!-- Section 4: Per-function description card                     -->
    <!-- ============================================================ -->
    <app-prose-block>
      <div class="func-detail">
        <div class="func-detail-title">{{ activeDetail().title }}</div>
        <ul>
          @for (pt of activeDetail().points; track $index) {
            <li>{{ pt }}</li>
          }
        </ul>
      </div>
    </app-prose-block>

    <!-- ============================================================ -->
    <!-- Section 5: Probe insight — conformal property                -->
    <!-- ============================================================ -->
    <app-prose-block>
      <p><strong>\u63A2\u6E2C\u9EDE\u8207\u5C40\u90E8\u5E7E\u4F55</strong></p>
      <p>
        \u62D6\u52D5\u5DE6\u5074\u7684\u85CD\u8272\u9EDE
        <app-math [e]="'z_0'" />\uFF0C
        \u53F3\u5074\u6703\u986F\u793A\u5B83\u7684\u50CF
        <app-math [e]="'f(z_0)'" />\u3002
        \u5728
        <app-math [e]="'z_0'" />
        \u5468\u570D\u6211\u5011\u756B\u4E86\u4E00\u500B\u5C0F\u5713\uFF08\u534A\u5F91 0.25\uFF09\uFF0C
        \u5B83\u7684\u50CF\u662F\u53F3\u5074\u7684\u7D05\u8272\u5716\u5F62\u3002
      </p>
      <p>
        \u4ED4\u7D30\u89C0\u5BDF\uFF1A\u5C0D\u65BC\u89E3\u6790\u51FD\u6578\uFF08\u5982
        <app-math [e]="'z^2'" />\u3001
        <app-math [e]="'1/z'" />\u3001
        <app-math [e]="'e^z'" />\uFF09\uFF0C
        \u5C0F\u5713\u7684\u50CF\u8FD1\u4F3C\u4ECD\u7136\u662F\u4E00\u500B\u5713\u2014\u2014\u53EA\u662F\u7E2E\u653E\u548C\u65CB\u8F49\u4E86\uFF0C\u800C<strong>\u4E0D\u662F\u88AB\u58D3\u6210\u6A62\u5713</strong>\u3002
        \u9019\u5C31\u662F<strong>\u4FDD\u89D2\u6027\uFF08conformal\uFF09</strong>\u7684\u5E7E\u4F55\u610F\u7FA9\uFF1A\u89E3\u6790\u51FD\u6578\u5728\u5C40\u90E8\u4FDD\u6301\u89D2\u5EA6\u4E0D\u8B8A\u3002
      </p>
      <p>
        \u6578\u5B57
        <app-math [e]="'|f\\'(z_0)|'" />
        \u5C31\u662F\u5C40\u90E8\u7E2E\u653E\u56E0\u5B50\uFF1A\u5C0F\u5713\u7684\u534A\u5F91\u88AB\u4E58\u4EE5\u9019\u500B\u6578\u3002
        \u82E5
        <app-math [e]="'|f\\'(z_0)| > 1'" />\uFF0C\u5713\u8B8A\u5927\uFF1B\u82E5\u5C0F\u65BC 1\uFF0C\u5713\u7E2E\u5C0F\u3002
      </p>
    </app-prose-block>

    <!-- ============================================================ -->
    <!-- Section 6: Closing summary                                   -->
    <!-- ============================================================ -->
    <app-prose-block>
      <p><strong>\u5C0F\u7D50</strong></p>
      <p>
        <app-math [e]="'z^2'" /> \u52A0\u500D\u89D2\u5EA6\uFF0C
        <app-math [e]="'1/z'" /> \u628A\u76F4\u7DDA\u8B8A\u6210\u5713\uFF0C
        <app-math [e]="'e^z'" /> \u628A\u6C34\u5E73\u5E36\u72C0\u5340\u57DF\u6620\u5230\u6574\u500B\u5E73\u9762\u2014\u2014\u8907\u8B8A\u51FD\u6578\u7684\u5E7E\u4F55\u6BD4\u5BE6\u51FD\u6578\u8C50\u5BCC\u5F97\u591A\u3002
      </p>
      <p>
        \u4F46\u6240\u6709\u9019\u4E9B\u51FD\u6578\u6709\u4E00\u500B\u5171\u540C\u9EDE\uFF1A\u5C0F\u5713\u7684\u50CF\u59CB\u7D42\u8FD1\u4F3C\u5713\u5F62\uFF0C\u800C\u4E0D\u662F\u6A62\u5713\u3002
        \u9019\u4E0D\u662F\u5DE7\u5408\uFF0C\u800C\u662F\u56E0\u70BA\u5B83\u5011\u90FD\u662F\u300C\u89E3\u6790\u51FD\u6578\u300D\u3002
        \u4E0B\u4E00\u7BC0\u6211\u5011\u5C07\u63A2\u8A0E\uFF1A\u4EC0\u9EBC\u689D\u4EF6\u8B93\u4E00\u500B\u51FD\u6578\u6210\u70BA\u89E3\u6790\u51FD\u6578\uFF1F\u7B54\u6848\u662F Cauchy-Riemann \u65B9\u7A0B\u7D44\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    /* ── Preset buttons ── */
    .preset-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .preset-btn {
      padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; transition: all 0.15s ease;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; }
    }

    /* ── Color legend (inside challenge card) ── */
    .legend-row {
      display: flex; gap: 16px; margin-bottom: 10px; align-items: center;
      font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      flex-wrap: wrap;
    }
    .legend-entry { display: flex; align-items: center; gap: 4px; }
    .legend-swatch {
      display: inline-block; width: 24px; height: 2px; border-radius: 1px;
    }
    .legend-swatch.circle-swatch {
      width: 10px; height: 10px; border-radius: 50%; opacity: 0.6;
    }

    /* ── Guide legend (inside prose block) ── */
    .guide-legend {
      display: flex; gap: 20px; margin: 8px 0 12px; align-items: center;
      font-size: 13px; color: var(--text-secondary);
    }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-line {
      display: inline-block; width: 28px; height: 2.5px; border-radius: 1px;
    }

    /* ── Animation controls ── */
    .anim-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .play-btn {
      padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; transition: all 0.15s ease;
      &:hover { background: var(--accent-10); }
      &.playing { background: var(--accent-18); color: var(--accent); }
      &:disabled { cursor: not-allowed; opacity: 0.6; }
    }
    .slider-label {
      font-size: 11px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted); white-space: nowrap;
    }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .t-value {
      font-size: 12px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted); min-width: 36px; text-align: right;
    }

    /* ── Dual panel ── */
    .dual-panel { display: flex; gap: 6px; margin-bottom: 12px; }
    .panel { flex: 1; min-width: 0; }
    .panel-title {
      font-size: 11px; font-weight: 600; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; text-align: center; margin-bottom: 4px;
    }
    .panel-svg {
      width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg); aspect-ratio: 1;
      touch-action: none;
    }

    /* ── Info cards ── */
    .info-cards { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .info-card {
      flex: 1; min-width: 100px; padding: 8px 10px; border: 1px solid var(--border);
      border-radius: 6px; background: var(--bg-surface); text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .info-lbl { display: block; font-size: 10px; color: var(--text-muted); margin-bottom: 2px; }
    .info-val { display: block; font-size: 13px; color: var(--text); }

    /* ── Per-function detail card ── */
    .func-detail {
      padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
    }
    .func-detail-title {
      font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px;
      font-family: 'JetBrains Mono', monospace;
    }
    .func-detail ul { margin: 0; padding-left: 18px; }
    .func-detail li {
      font-size: 12px; color: var(--text-secondary); line-height: 1.7;
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepComplexFunctionsComponent implements OnDestroy {
  /* ── Constants ── */
  readonly view = VIEW;
  readonly viewBox = `0 0 ${VIEW.svgW} ${VIEW.svgH}`;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;
  readonly mainFormula = String.raw`f: \mathbb{C} \to \mathbb{C}, \quad z = x + iy \;\mapsto\; f(z) = u(x,y) + iv(x,y)`;

  /* ── Reactive state ── */
  readonly activeIdx = signal(0);
  readonly animT = signal(1.0);
  readonly probeZ = signal<C>([0.8, 0.6]);
  readonly dragging = signal(false);
  readonly playing = signal(false);

  private animFrameId: number | null = null;

  /* ── Derived values ── */
  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);
  readonly activeDetail = computed(() => DESCRIPTIONS[this.activeIdx()]);

  /* ── Source (left panel) static grid ── */
  readonly srcHPaths: string[] = (() => {
    const paths: string[] = [];
    for (let i = 0; i <= N_LINES; i++) {
      const y = LO + i * STEP;
      const pts: C[] = [];
      for (let j = 0; j <= N_SAMPLES; j++) {
        pts.push([LO + j * DS, y]);
      }
      const d = linePath(VIEW, pts);
      if (d.trim()) paths.push(d);
    }
    return paths;
  })();

  readonly srcVPaths: string[] = (() => {
    const paths: string[] = [];
    for (let i = 0; i <= N_LINES; i++) {
      const x = LO + i * STEP;
      const pts: C[] = [];
      for (let j = 0; j <= N_SAMPLES; j++) {
        pts.push([x, LO + j * DS]);
      }
      const d = linePath(VIEW, pts);
      if (d.trim()) paths.push(d);
    }
    return paths;
  })();

  /* ── Probe point SVG position ── */
  readonly probeSvg = computed((): [number, number] => toSvg(VIEW, this.probeZ()));

  /* ── Source neighborhood circle (left panel) ── */
  readonly srcNeighborhood = computed((): string => {
    const z0 = this.probeZ();
    const pts: C[] = [];
    for (let k = 0; k < CIRCLE_N; k++) {
      const angle = (2 * Math.PI * k) / CIRCLE_N;
      pts.push([
        z0[0] + CIRCLE_R * Math.cos(angle),
        z0[1] + CIRCLE_R * Math.sin(angle),
      ]);
    }
    return polyPoints(VIEW, pts);
  });

  /* ── Destination (right panel) transformed grid ── */
  readonly dstHPaths = computed((): string[] => {
    const f = this.activePreset().fn;
    const t = this.animT();
    const paths: string[] = [];
    for (let i = 0; i <= N_LINES; i++) {
      const y = LO + i * STEP;
      const pts: C[] = [];
      for (let j = 0; j <= N_SAMPLES; j++) {
        const x = LO + j * DS;
        const z: C = [x, y];
        if (cAbs(z) < 0.05) continue;
        const w = f(z);
        if (cAbs(w) > 8) continue;
        pts.push(lerp(z, w, t));
      }
      const d = linePath(VIEW, pts);
      if (d.trim()) paths.push(d);
    }
    return paths;
  });

  readonly dstVPaths = computed((): string[] => {
    const f = this.activePreset().fn;
    const t = this.animT();
    const paths: string[] = [];
    for (let i = 0; i <= N_LINES; i++) {
      const x = LO + i * STEP;
      const pts: C[] = [];
      for (let j = 0; j <= N_SAMPLES; j++) {
        const y = LO + j * DS;
        const z: C = [x, y];
        if (cAbs(z) < 0.05) continue;
        const w = f(z);
        if (cAbs(w) > 8) continue;
        pts.push(lerp(z, w, t));
      }
      const d = linePath(VIEW, pts);
      if (d.trim()) paths.push(d);
    }
    return paths;
  });

  /* ── Mapped probe point (right panel) ── */
  readonly mappedZ = computed((): C => {
    const f = this.activePreset().fn;
    const z0 = this.probeZ();
    return f(z0);
  });

  readonly mappedInterp = computed((): C => lerp(this.probeZ(), this.mappedZ(), this.animT()));

  readonly mappedSvg = computed((): [number, number] => toSvg(VIEW, this.mappedInterp()));

  /* ── Destination neighborhood circle (right panel) ── */
  readonly dstNeighborhood = computed((): string => {
    const z0 = this.probeZ();
    const f = this.activePreset().fn;
    const t = this.animT();
    const pts: C[] = [];
    for (let k = 0; k < CIRCLE_N; k++) {
      const angle = (2 * Math.PI * k) / CIRCLE_N;
      const p: C = [
        z0[0] + CIRCLE_R * Math.cos(angle),
        z0[1] + CIRCLE_R * Math.sin(angle),
      ];
      const fp = f(p);
      pts.push(lerp(p, fp, t));
    }
    return polyPoints(VIEW, pts);
  });

  /* ── Info labels ── */
  readonly probeLabel = computed((): string => fmtC(this.probeZ()));
  readonly mappedLabel = computed((): string => fmtC(this.mappedZ()));
  readonly derivMag = computed((): string => {
    const f = this.activePreset().fn;
    const z0 = this.probeZ();
    const h: C = [0.001, 0];
    const fz = f(z0);
    const fzh = f(cAdd(z0, h));
    const diff: C = [fzh[0] - fz[0], fzh[1] - fz[1]];
    return (cAbs(diff) / cAbs(h)).toFixed(3);
  });

  /* ── Animation ── */
  playAnimation(): void {
    if (this.playing()) return;
    this.playing.set(true);
    this.animT.set(0);

    const totalFrames = 90;
    let frame = 0;

    const tick = () => {
      frame++;
      const rawT = frame / totalFrames;
      if (rawT >= 1) {
        this.animT.set(1);
        this.playing.set(false);
        this.animFrameId = null;
        return;
      }
      this.animT.set(easeInOut(rawT));
      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  onSlider(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.animT.set(val);
  }

  /* ── Drag handling (left panel only) ── */
  onMouseDown(event: MouseEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const pt = this.svgPoint(svg, event.clientX, event.clientY);
    const z = fromSvg(VIEW, pt.x, pt.y);
    const dist = cAbs([z[0] - this.probeZ()[0], z[1] - this.probeZ()[1]]);
    if (dist < 0.4) {
      this.dragging.set(true);
      this.probeZ.set(z);
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.dragging()) return;
    const svg = event.currentTarget as SVGSVGElement;
    const pt = this.svgPoint(svg, event.clientX, event.clientY);
    const z = fromSvg(VIEW, pt.x, pt.y);
    const clamp = (v: number) => Math.max(-VIEW.radius, Math.min(VIEW.radius, v));
    this.probeZ.set([clamp(z[0]), clamp(z[1])]);
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    const svg = event.currentTarget as SVGSVGElement;
    const pt = this.svgPoint(svg, touch.clientX, touch.clientY);
    const z = fromSvg(VIEW, pt.x, pt.y);
    const dist = cAbs([z[0] - this.probeZ()[0], z[1] - this.probeZ()[1]]);
    if (dist < 0.5) {
      event.preventDefault();
      this.dragging.set(true);
      this.probeZ.set(z);
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.dragging() || event.touches.length !== 1) return;
    event.preventDefault();
    const touch = event.touches[0];
    const svg = event.currentTarget as SVGSVGElement;
    const pt = this.svgPoint(svg, touch.clientX, touch.clientY);
    const z = fromSvg(VIEW, pt.x, pt.y);
    const clamp = (v: number) => Math.max(-VIEW.radius, Math.min(VIEW.radius, v));
    this.probeZ.set([clamp(z[0]), clamp(z[1])]);
  }

  onMouseUp(): void {
    this.dragging.set(false);
  }

  /** Convert screen coordinates to SVG coordinates. */
  private svgPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
    const rect = svg.getBoundingClientRect();
    const scaleX = VIEW.svgW / rect.width;
    const scaleY = VIEW.svgH / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  /* ── Cleanup ── */
  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
