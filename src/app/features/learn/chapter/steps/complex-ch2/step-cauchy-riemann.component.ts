import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, PlaneView, toSvg, fromSvg, axesPath,
} from '../complex-ch1/complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 3, svgW: 520, svgH: 420, pad: 30 };

interface CRPreset {
  label: string;
  analytic: boolean;
  uTex: string;
  vTex: string;
  u: (x: number, y: number) => number;
  v: (x: number, y: number) => number;
}

const PRESETS: CRPreset[] = [
  {
    label: 'z\u00B2 (\u89E3\u6790)',
    analytic: true,
    uTex: 'u = x^2 - y^2',
    vTex: 'v = 2xy',
    u: (x, y) => x * x - y * y,
    v: (x, y) => 2 * x * y,
  },
  {
    label: '|z|\u00B2 (\u975E\u89E3\u6790)',
    analytic: false,
    uTex: 'u = x^2 + y^2',
    vTex: 'v = 0',
    u: (x, y) => x * x + y * y,
    v: (_x, _y) => 0,
  },
  {
    label: 'e\u1DBB (\u89E3\u6790)',
    analytic: true,
    uTex: 'u = e^x \\cos y',
    vTex: 'v = e^x \\sin y',
    u: (x, y) => Math.exp(x) * Math.cos(y),
    v: (x, y) => Math.exp(x) * Math.sin(y),
  },
  {
    label: 'x + iy\u00B2 (\u975E\u89E3\u6790)',
    analytic: false,
    uTex: 'u = x',
    vTex: 'v = y^2',
    u: (x, _y) => x,
    v: (_x, y) => y * y,
  },
  {
    label: '\u0305z (\u5171\u8EDB, \u975E\u89E3\u6790)',
    analytic: false,
    uTex: 'u = x',
    vTex: 'v = -y',
    u: (x, _y) => x,
    v: (_x, y) => -y,
  },
];

/** Number of sample points for Jacobian shape visualization */
const SHAPE_N = 36;

@Component({
  selector: 'app-step-cauchy-riemann',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <!-- ====== Section 1 : Motivation ====== -->
    <app-prose-block title="Cauchy-Riemann \u65B9\u7A0B" subtitle="&sect;2.2">
      <p>
        \u5728 &sect;2.1 \u4E2D\uFF0C\u6211\u5011\u770B\u5230\u4E00\u500B\u9A5A\u4EBA\u7684\u73FE\u8C61\uFF1A\u89E3\u6790\u51FD\u6578\u628A\u5C0F\u5713\u6620\u6210\u5C0F\u5713\uFF0C\u800C\u4E0D\u662F\u6A62\u5713\u3002
        \u9019\u610F\u5473\u8457\u5B83\u5011\u5728\u5C40\u90E8\u4FDD\u89D2\u2014\u2014\u4E5F\u5C31\u662F<strong>\u5171\u5F62\u7684</strong>\u3002
        \u4F46\u4EC0\u9EBC\u4EE3\u6578\u689D\u4EF6\u80FD\u4FDD\u8B49\u9019\u4E00\u9EDE\uFF1F
        \u662F\u4EC0\u9EBC\u8B93 z\u00B2 \u300C\u597D\u300D\u800C |z|\u00B2 \u300C\u4E0D\u597D\u300D\uFF1F
      </p>
      <p>
        \u7B54\u6848\u5C31\u662F <strong>Cauchy-Riemann \u65B9\u7A0B</strong>\u2014\u2014\u5169\u500B\u95DC\u65BC u \u548C v \u504F\u5C0E\u6578\u7684\u7C21\u55AE\u689D\u4EF6\uFF0C
        \u78BA\u4FDD\u8907\u6578\u53EF\u5FAE\u5206\u6027\u3002
      </p>
    </app-prose-block>

    <!-- ====== Section 2 : The problem ====== -->
    <app-prose-block title="\u8907\u6578\u53EF\u5FAE\u7684\u554F\u984C">
      <p>
        \u5728\u5BE6\u5206\u6790\u4E2D\uFF0Cf'(x\u2080) = lim[h\u21920] (f(x\u2080+h) \u2212 f(x\u2080))/h\u3002
        \u8B8A\u6578 h \u5F9E\u5DE6\u6216\u53F3\u903C\u8FD1 0\u2014\u2014\u53EA\u6709<strong>\u5169\u500B</strong>\u65B9\u5411\u3002
      </p>
      <p>
        \u5728\u8907\u5206\u6790\u4E2D\uFF0Cf'(z\u2080) \u7684\u5B9A\u7FA9\u662F\uFF1A
      </p>
      <app-math block [e]="derivDef" />
      <p>
        \u4F46 \u0394z \u53EF\u4EE5\u5F9E\u5E73\u9762\u4E0A\u7684<strong>\u4EFB\u610F\u65B9\u5411</strong>\u903C\u8FD1 0\u2014\u2014\u7121\u7AEE\u591A\u500B\u65B9\u5411\uFF01
        \u8981\u8B93\u9019\u500B\u6975\u9650\u5B58\u5728\uFF0C\u5B83\u5FC5\u9808\u5728<strong>\u6BCF\u500B\u65B9\u5411</strong>\u90FD\u7D66\u51FA\u76F8\u540C\u7684\u503C\u3002
      </p>
      <p>\u8B93\u6211\u5011\u770B\u770B\u5F9E\u5169\u500B\u7279\u5B9A\u65B9\u5411\u903C\u8FD1\u6703\u767C\u751F\u4EC0\u9EBC\u2026\u2026</p>
    </app-prose-block>

    <!-- ====== Section 3 : Derivation ====== -->
    <app-prose-block title="\u5F9E\u5169\u500B\u65B9\u5411\u5C0E\u51FA CR \u65B9\u7A0B">
      <p>
        \u8A2D f = u + iv\uFF0Cz\u2080 = (x\u2080, y\u2080)\u3002
      </p>
      <p><strong>\u6C34\u5E73\u65B9\u5411\u903C\u8FD1</strong>\uFF1A\u0394z = h\uFF08\u5BE6\u6578\uFF09\u3002\u5247\uFF1A</p>
      <app-math block [e]="horizApproach" />
      <p><strong>\u5782\u76F4\u65B9\u5411\u903C\u8FD1</strong>\uFF1A\u0394z = ih\uFF08\u7D14\u865B\u6578\uFF09\u3002\u9664\u4EE5 i \u7B49\u65BC\u4E58\u4EE5 \u2212i\uFF1A</p>
      <app-math block [e]="vertApproach" />
      <p>\u5169\u500B\u8868\u9054\u5F0F\u5FC5\u9808\u76F8\u7B49\u3002\u4EE4\u5BE6\u90E8\u548C\u865B\u90E8\u5206\u5225\u76F8\u7B49\uFF1A</p>
      <app-math block [e]="crBoxed" />
    </app-prose-block>

    <!-- ====== Section 4 : Geometric meaning ====== -->
    <app-prose-block title="\u5E7E\u4F55\u610F\u7FA9\u2014\u2014Jacobian \u77E9\u9663">
      <p>
        \u628A f \u770B\u4F5C\u4E00\u500B\u6620\u5C04 \u211D\u00B2 \u2192 \u211D\u00B2\uFF1A(x, y) \u21A6 (u(x,y), v(x,y))\u3002
        \u5B83\u7684 Jacobian \u77E9\u9663\u662F\uFF1A
      </p>
      <app-math block [e]="jacobianGeneral" />
      <p>\u7576 CR \u65B9\u7A0B\u6210\u7ACB\u6642\uFF0C\u9019\u500B\u77E9\u9663\u8B8A\u6210\uFF1A</p>
      <app-math block [e]="jacobianCR" />
      <p>
        \u5176\u4E2D a = \u2202u/\u2202x\uFF0Cb = \u2202v/\u2202x\u3002
        \u9019\u662F\u4E00\u500B<strong>\u65CB\u8F49</strong> \u03B8 = arg(f') \u4E58\u4EE5<strong>\u7E2E\u653E</strong> r = |f'| \u7684\u77E9\u9663\u2014\u2014
        \u6B63\u597D\u5C31\u662F &sect;2.1 \u4E2D\u770B\u5230\u7684\u5171\u5F62\u6620\u5C04\uFF01
        \u9019\u7A2E\u5F62\u5F0F\u7684\u77E9\u9663\u628A\u5713\u6620\u6210\u5713\uFF0C\u4FDD\u6301\u6240\u6709\u89D2\u5EA6\u3002
      </p>
      <p>
        \u7576 CR <strong>\u4E0D\u6210\u7ACB</strong>\u6642\uFF0CJacobian \u662F\u4E00\u822C\u77E9\u9663\uFF0C\u6703\u628A\u5713\u58D3\u6210\u6A62\u5713\u2014\u2014\u89D2\u5EA6\u4E0D\u518D\u4FDD\u6301\u3002
      </p>
    </app-prose-block>

    <!-- ====== Section 5 : Interactive ====== -->
    <app-challenge-card prompt="\u9078\u64C7\u51FD\u6578\uFF0C\u62D6\u52D5\u63A2\u6E2C\u9EDE\u2014\u2014\u89C0\u5BDF CR \u65B9\u7A0B\u662F\u5426\u6210\u7ACB\uFF0C\u4EE5\u53CA Jacobian \u7684\u7D50\u69CB">
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

      <!-- Main SVG plane -->
      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH"
           class="plane-svg"
           (mousedown)="startDrag($event)"
           (mousemove)="onDrag($event)"
           (mouseup)="dragging.set(false)"
           (mouseleave)="dragging.set(false)"
           (touchstart)="startTouch($event)"
           (touchmove)="onTouch($event)"
           (touchend)="dragging.set(false)">
        <!-- Grid lines -->
        @for (g of gridLines; track g.key) {
          <line [attr.x1]="g.x1" [attr.y1]="g.y1" [attr.x2]="g.x2" [attr.y2]="g.y2"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.4" />
        }

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

        <!-- Input circle (dashed gray) at probe -->
        <circle [attr.cx]="probeSvg()[0]" [attr.cy]="probeSvg()[1]"
                [attr.r]="circleRadiusPx"
                fill="none" stroke="var(--text-muted)" stroke-width="1"
                stroke-dasharray="3 2" stroke-opacity="0.6" />

        <!-- Jacobian image shape (circle or ellipse) -->
        <polygon [attr.points]="jacobianShapeSvg()"
                 fill="none"
                 [attr.stroke]="crSatisfied() ? '#3a9a5a' : '#c05050'"
                 stroke-width="2"
                 [attr.fill]="crSatisfied() ? 'rgba(60,160,90,0.08)' : 'rgba(200,70,70,0.08)'" />

        <!-- Probe point -->
        <circle [attr.cx]="probeSvg()[0]" [attr.cy]="probeSvg()[1]" r="7"
                fill="var(--accent)" stroke="white" stroke-width="2" class="drag-pt" />
        <text [attr.x]="probeSvg()[0] + 12" [attr.y]="probeSvg()[1] - 10"
              class="pt-label">z</text>
      </svg>

      <!-- CR badge -->
      <div class="cr-badge" [class.satisfied]="crSatisfied()" [class.violated]="!crSatisfied()">
        {{ crSatisfied()
            ? 'CR \u65B9\u7A0B\u6210\u7ACB \u2014 Jacobian \u70BA\u65CB\u8F49+\u7E2E\u653E \u2192 \u89E3\u6790'
            : 'CR \u65B9\u7A0B\u4E0D\u6210\u7ACB \u2014 Jacobian \u4E0D\u662F\u65CB\u8F49 \u2192 \u4E0D\u89E3\u6790' }}
      </div>

      <!-- Partial derivatives comparison grid -->
      <div class="pd-grid">
        <div class="pd-col">
          <div class="pd-header">\u689D\u4EF6\u4E00</div>
          <div class="pd-row-pair" [class.match]="crMatch1()" [class.mismatch]="!crMatch1()">
            <div class="pd-cell-left">
              <span class="pd-label">&part;u/&part;x =</span>
              <span class="pd-val">{{ partials().dudx.toFixed(3) }}</span>
            </div>
            <div class="pd-eq-sign">=?</div>
            <div class="pd-cell-right">
              <span class="pd-label">&part;v/&part;y =</span>
              <span class="pd-val">{{ partials().dvdy.toFixed(3) }}</span>
            </div>
          </div>
        </div>
        <div class="pd-col">
          <div class="pd-header">\u689D\u4EF6\u4E8C</div>
          <div class="pd-row-pair" [class.match]="crMatch2()" [class.mismatch]="!crMatch2()">
            <div class="pd-cell-left">
              <span class="pd-label">&part;u/&part;y =</span>
              <span class="pd-val">{{ partials().dudy.toFixed(3) }}</span>
            </div>
            <div class="pd-eq-sign">=?</div>
            <div class="pd-cell-right">
              <span class="pd-label">&minus;&part;v/&part;x =</span>
              <span class="pd-val">{{ (-partials().dvdx).toFixed(3) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Jacobian matrix display -->
      <div class="jacobian-section">
        <div class="jacobian-title">Jacobian \u77E9\u9663\u5728\u63A2\u6E2C\u9EDE\uFF1A</div>
        <div class="jacobian-row">
          <app-math block [e]="jacobianTex()" />
          <span class="jacobian-verdict" [class.analytic]="crSatisfied()" [class.non-analytic]="!crSatisfied()">
            {{ crSatisfied() ? '= ' + jacobianPolarLabel() : '\u2260 \u65CB\u8F49\u77E9\u9663' }}
          </span>
        </div>
      </div>

      <!-- u,v formulas for current preset -->
      <div class="formula-bar">
        <app-math [e]="activePreset().uTex" />
        <span class="formula-sep">,</span>
        <app-math [e]="activePreset().vTex" />
      </div>

      <!-- Probe coordinates -->
      <div class="probe-info">
        \u63A2\u6E2C\u9EDE z = {{ probeX().toFixed(2) }} + {{ probeY().toFixed(2) }}i
      </div>
    </app-challenge-card>

    <!-- ====== Section 6 : When does CR fail? ====== -->
    <app-prose-block title="CR \u65B9\u7A0B\u4F55\u6642\u5931\u6548\uFF1F">
      <p>
        <strong>\u5171\u8EDB\u51FD\u6578</strong> f(z) = \u0305z = x \u2212 iy\uFF1A
        \u2202u/\u2202x = 1 \u4F46 \u2202v/\u2202y = \u22121\uFF0C\u5169\u8005\u4E0D\u76F8\u7B49\u3002
        \u5176 Jacobian \u662F\uFF1A
      </p>
      <app-math block [e]="conjJacobian" />
      <p>
        \u9019\u662F\u4E00\u500B<strong>\u53CD\u5C04</strong>\uFF0C\u4E0D\u662F\u65CB\u8F49\u3002\u53CD\u5C04\u6703\u53CD\u8F49\u89D2\u5EA6\u7684\u65B9\u5411\u3002
      </p>
      <p>
        <strong>|z|\u00B2 = x\u00B2 + y\u00B2</strong>\uFF1Av = 0\uFF0C\u6240\u4EE5 \u2202v/\u2202y = 0\uFF0C\u4F46 \u2202u/\u2202x = 2x \u2260 0\uFF08\u539F\u9EDE\u9664\u5916\uFF09\u3002
        \u5728\u539F\u9EDE\uFF0CCR \u300C\u5076\u7136\u300D\u6210\u7ACB\uFF0C\u4F46 f \u4ECD\u7136\u4E0D\u662F\u89E3\u6790\u7684\u2014\u2014\u56E0\u70BA\u89E3\u6790\u6027\u8981\u6C42\u5728\u4E00\u500B\u958B\u5340\u57DF\u4E0A\u8655\u8655\u6210\u7ACB\uFF0C\u800C\u4E0D\u53EA\u662F\u55AE\u9EDE\u3002
      </p>
    </app-prose-block>

    <!-- ====== Section 7 : Consequences ====== -->
    <app-prose-block title="\u91CD\u8981\u63A8\u8AD6">
      <p>
        CR \u65B9\u7A0B\u52A0\u4E0A\u504F\u5C0E\u6578\u7684\u9023\u7E8C\u6027\uFF0C\u5C31\u80FD\u8B49\u660E f \u662F\u89E3\u6790\uFF08\u5168\u7D14\uFF09\u7684\u3002
        \u800C\u89E3\u6790\u51FD\u6578\u64C1\u6709\u4EE4\u4EBA\u9A5A\u5606\u7684\u6027\u8CEA\uFF1A
      </p>
      <ul>
        <li><strong>\u7121\u7AEE\u6B21\u53EF\u5FAE</strong>\uFF1A\u4E00\u6B21\u53EF\u5FAE = \u7121\u7AEE\u6B21\u53EF\u5FAE\uFF01</li>
        <li><strong>Taylor \u5C55\u958B</strong>\uFF1A\u5728\u6BCF\u500B\u9EDE\u90FD\u6709\u6536\u6582\u7684\u5E42\u7D1A\u6578</li>
        <li><strong>Cauchy \u7A4D\u5206\u516C\u5F0F</strong>\uFF1A\u5167\u90E8\u7684\u503C\u5B8C\u5168\u7531\u908A\u754C\u4E0A\u7684\u503C\u6C7A\u5B9A</li>
        <li><strong>\u6700\u5927\u6A21\u539F\u7406</strong>\uFF1A|f| \u4E0D\u80FD\u5728\u5167\u90E8\u53D6\u5C40\u90E8\u6700\u5927\u503C</li>
      </ul>
      <p>\u9019\u4E00\u5207\u90FD\u6E90\u81EA\u5169\u500B\u7C21\u55AE\u7684\u504F\u5C0E\u6578\u7B49\u5F0F\u3002</p>
      <p style="margin-top:12px; color: var(--text-muted)">
        \u4E0B\u4E00\u7BC0\u770B\u6700\u91CD\u8981\u7684\u89E3\u6790\u51FD\u6578\u6709\u54EA\u4E9B\u7279\u6B8A\u884C\u70BA\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .preset-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; transition: background 0.15s, border-color 0.15s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; } }

    .plane-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 12px;
      cursor: crosshair; user-select: none; touch-action: none; }
    .drag-pt { cursor: grab; }
    .axis-lbl { font-size: 11px; fill: var(--text-muted); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }
    .tick-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .pt-label { font-size: 13px; fill: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .cr-badge { display: inline-block; padding: 6px 16px; border-radius: 6px;
      font-size: 13px; font-weight: 700; margin-bottom: 14px;
      font-family: 'JetBrains Mono', monospace;
      &.satisfied { background: rgba(60, 160, 90, 0.10); color: #2a8a4a;
        border: 1px solid rgba(60, 160, 90, 0.3); }
      &.violated { background: rgba(200, 70, 70, 0.08); color: #c05050;
        border: 1px solid rgba(200, 70, 70, 0.25); } }

    /* ── Partial derivatives comparison grid ── */
    .pd-grid { display: flex; flex-direction: column; gap: 0;
      margin-bottom: 14px; border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden; background: var(--bg-surface); }
    .pd-col { }
    .pd-col:first-child .pd-row-pair { border-bottom: 1px solid var(--border); }
    .pd-header { font-size: 11px; font-weight: 700; padding: 6px 12px;
      border-bottom: 1px solid var(--border); color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; text-align: center;
      background: var(--bg); }
    .pd-row-pair { display: flex; align-items: center; padding: 10px 12px;
      transition: background 0.2s;
      &.match { background: rgba(60, 160, 90, 0.06); }
      &.mismatch { background: rgba(200, 70, 70, 0.06); } }
    .pd-cell-left, .pd-cell-right { flex: 1; text-align: center;
      font-family: 'JetBrains Mono', monospace; }
    .pd-eq-sign { width: 40px; text-align: center; font-size: 14px;
      font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
    .pd-label { font-size: 11px; color: var(--text-muted); margin-right: 4px; }
    .pd-val { font-size: 14px; font-weight: 600; color: var(--text); }

    /* ── Jacobian matrix section ── */
    .jacobian-section { margin-bottom: 14px; padding: 10px 14px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .jacobian-title { font-size: 12px; color: var(--text-muted); margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace; }
    .jacobian-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .jacobian-verdict { font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      &.analytic { color: #2a8a4a; }
      &.non-analytic { color: #c05050; } }

    /* ── Formula bar ── */
    .formula-bar { display: flex; align-items: center; gap: 8px;
      justify-content: center; margin-bottom: 10px; flex-wrap: wrap;
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .formula-sep { color: var(--text-muted); font-size: 16px; }

    .probe-info { font-size: 12px; color: var(--text-secondary); text-align: center;
      font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepCauchyRiemannComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;

  /** Radius of the input reference circle in SVG pixels */
  readonly circleRadiusPx = 15;

  /* ── KaTeX formulas ── */

  readonly derivDef = String.raw`f'(z_0) = \lim_{\Delta z \to 0} \frac{f(z_0 + \Delta z) - f(z_0)}{\Delta z}`;

  readonly horizApproach = String.raw`f'(z_0) = \lim_{h \to 0} \frac{f(z_0 + h) - f(z_0)}{h} = \frac{\partial u}{\partial x} + i\frac{\partial v}{\partial x}`;

  readonly vertApproach = String.raw`f'(z_0) = \lim_{h \to 0} \frac{f(z_0 + ih) - f(z_0)}{ih} = \frac{\partial v}{\partial y} - i\frac{\partial u}{\partial y}`;

  readonly crBoxed = String.raw`\boxed{\frac{\partial u}{\partial x} = \frac{\partial v}{\partial y}, \qquad \frac{\partial u}{\partial y} = -\frac{\partial v}{\partial x}}`;

  readonly jacobianGeneral = String.raw`J = \begin{pmatrix} \dfrac{\partial u}{\partial x} & \dfrac{\partial u}{\partial y} \\[6pt] \dfrac{\partial v}{\partial x} & \dfrac{\partial v}{\partial y} \end{pmatrix}`;

  readonly jacobianCR = String.raw`J = \begin{pmatrix} a & -b \\ b & a \end{pmatrix} = r \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}`;

  readonly conjJacobian = String.raw`J_{\bar{z}} = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix} \quad \text{(\u53CD\u5C04\uFF0C\u975E\u65CB\u8F49)}`;

  /* ── Signals ── */

  readonly activeIdx = signal(0);
  readonly probe = signal<C>([1, 1]);
  readonly dragging = signal(false);

  readonly activePreset = computed(() => PRESETS[this.activeIdx()]);
  readonly probeX = computed(() => this.probe()[0]);
  readonly probeY = computed(() => this.probe()[1]);
  readonly probeSvg = computed(() => toSvg(VIEW, this.probe()));

  /* ── Pre-computed grid lines ── */
  readonly gridLines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = (() => {
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let k = -3; k <= 3; k++) {
      const [vx] = toSvg(VIEW, [k, 0]);
      lines.push({ key: `vg${k}`, x1: vx, y1: VIEW.pad, x2: vx, y2: VIEW.svgH - VIEW.pad });
      const [, hy] = toSvg(VIEW, [0, k]);
      lines.push({ key: `hg${k}`, x1: VIEW.pad, y1: hy, x2: VIEW.svgW - VIEW.pad, y2: hy });
    }
    return lines;
  })();

  /* ── Pre-computed tick labels ── */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  /* ── Numerical partial derivatives via central differences ── */
  readonly partials = computed(() => {
    const preset = this.activePreset();
    const [x, y] = this.probe();
    const h = 0.001;
    const dudx = (preset.u(x + h, y) - preset.u(x - h, y)) / (2 * h);
    const dudy = (preset.u(x, y + h) - preset.u(x, y - h)) / (2 * h);
    const dvdx = (preset.v(x + h, y) - preset.v(x - h, y)) / (2 * h);
    const dvdy = (preset.v(x, y + h) - preset.v(x, y - h)) / (2 * h);
    return { dudx, dudy, dvdx, dvdy };
  });

  /** Check if first CR equation holds: du/dx = dv/dy */
  readonly crMatch1 = computed(() => {
    const p = this.partials();
    return Math.abs(p.dudx - p.dvdy) < 0.05;
  });

  /** Check if second CR equation holds: du/dy = -dv/dx */
  readonly crMatch2 = computed(() => {
    const p = this.partials();
    return Math.abs(p.dudy + p.dvdx) < 0.05;
  });

  /** Both CR equations satisfied */
  readonly crSatisfied = computed(() => this.crMatch1() && this.crMatch2());

  /* ── Jacobian shape: apply J to a circle, produce SVG polygon points ── */
  readonly jacobianShapeSvg = computed(() => {
    const p = this.partials();
    const [px, py] = this.probeSvg();
    const rPx = this.circleRadiusPx;

    // Build SVG-space Jacobian (y-axis is flipped in SVG vs math coords).
    // Math Jacobian [[dudx, dudy], [dvdx, dvdy]] becomes
    // SVG Jacobian [[dudx, -dudy], [-dvdx, dvdy]] after accounting for both
    // input and output y-flip.
    const a = p.dudx, b = -p.dudy, c = -p.dvdx, d = p.dvdy;

    // Sample unit circle, apply SVG-space Jacobian, collect raw points
    let maxR = 0;
    const rawPts: [number, number][] = [];
    for (let i = 0; i < SHAPE_N; i++) {
      const theta = (2 * Math.PI * i) / SHAPE_N;
      const ux = Math.cos(theta);
      const uy = Math.sin(theta);
      const ox = a * ux + b * uy;
      const oy = c * ux + d * uy;
      const r = Math.hypot(ox, oy);
      if (r > maxR) maxR = r;
      rawPts.push([ox, oy]);
    }

    // Normalize so the largest radius equals rPx * 1.3
    // (keeps the shape visible regardless of |f'| magnitude)
    const targetR = rPx * 1.3;
    const normScale = maxR > 1e-6 ? targetR / maxR : 1;

    return rawPts
      .map(([ox, oy]) => `${(px + ox * normScale).toFixed(1)},${(py + oy * normScale).toFixed(1)}`)
      .join(' ');
  });

  /* ── Jacobian TeX with actual values ── */
  readonly jacobianTex = computed(() => {
    const p = this.partials();
    const fmt = (v: number) => v.toFixed(2);
    return String.raw`J = \begin{pmatrix} ${fmt(p.dudx)} & ${fmt(p.dudy)} \\ ${fmt(p.dvdx)} & ${fmt(p.dvdy)} \end{pmatrix}`;
  });

  /* ── Polar label for Jacobian when CR holds ── */
  readonly jacobianPolarLabel = computed(() => {
    const p = this.partials();
    const a = p.dudx;
    const b = p.dvdx;
    const r = Math.hypot(a, b);
    const theta = Math.atan2(b, a);
    const deg = (theta * 180 / Math.PI);
    return `${r.toFixed(2)} R(${deg.toFixed(0)}\u00B0)`;
  });

  /* ── Drag handling ── */

  startDrag(ev: MouseEvent): void {
    this.dragging.set(true);
    this.updateProbe(ev);
  }

  onDrag(ev: MouseEvent): void {
    if (!this.dragging()) return;
    this.updateProbe(ev);
  }

  startTouch(ev: TouchEvent): void {
    ev.preventDefault();
    this.dragging.set(true);
    this.updateProbeFromTouch(ev);
  }

  onTouch(ev: TouchEvent): void {
    ev.preventDefault();
    if (!this.dragging()) return;
    this.updateProbeFromTouch(ev);
  }

  private updateProbe(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) / rect.width * VIEW.svgW;
    const sy = (ev.clientY - rect.top) / rect.height * VIEW.svgH;
    this.clampAndSet(sx, sy);
  }

  private updateProbeFromTouch(ev: TouchEvent): void {
    const touch = ev.touches[0];
    if (!touch) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (touch.clientX - rect.left) / rect.width * VIEW.svgW;
    const sy = (touch.clientY - rect.top) / rect.height * VIEW.svgH;
    this.clampAndSet(sx, sy);
  }

  private clampAndSet(sx: number, sy: number): void {
    const pt = fromSvg(VIEW, sx, sy);
    const r = VIEW.radius - 0.1;
    const clamped: C = [
      Math.max(-r, Math.min(r, pt[0])),
      Math.max(-r, Math.min(r, pt[1])),
    ];
    this.probe.set(clamped);
  }
}
