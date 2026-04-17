import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { type C, cFromPolar, cPow, fmtC, type PlaneView, toSvg, axesPath } from './complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 1.6, svgW: 520, svgH: 420, pad: 40 };

@Component({
  selector: 'app-step-polar-form',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="極座標與 Euler 公式" subtitle="§1.3">
      <p>
        每個複數 z = a + bi 都可以寫成<strong>極座標形式</strong>：
      </p>
      <app-math block [e]="formulaEuler" />
      <p>
        其中 r = |z| 是模長，&theta; = arg(z) 是幅角。Euler 公式把指數函數和三角函數連結起來：
      </p>
      <app-math block [e]="formulaPolar" />
      <p>
        這不只是一個漂亮的恆等式——它是複分析的<strong>基石</strong>。
        乘法在極座標下變得非常直觀：模長相乘、幅角相加。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 theta 滑桿，看 e^(i theta) 如何在單位圓上移動">
      <div class="ctrl-row">
        <div class="slider-group">
          <span class="slider-label">&theta; = {{ theta().toFixed(2) }} rad</span>
          <input type="range" min="-3.14" max="3.14" step="0.01" [value]="theta()"
                 (input)="theta.set(+($any($event.target)).value)" class="ctrl-slider" />
        </div>
        <div class="slider-group">
          <span class="slider-label">n = {{ nVal() }}</span>
          <input type="range" min="1" max="8" step="1" [value]="nVal()"
                 (input)="nVal.set(+($any($event.target)).value)" class="ctrl-slider short" />
          <span class="slider-hint">(De Moivre)</span>
        </div>
      </div>

      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH" class="plane-svg">
        <!-- Axes -->
        <path [attr.d]="axes" stroke="var(--border)" stroke-width="0.8" fill="none" />

        <!-- Axis labels -->
        <text [attr.x]="view.svgW - view.pad + 10" [attr.y]="originSvg[1] + 4"
              class="axis-label">Re</text>
        <text [attr.x]="originSvg[0] + 6" [attr.y]="view.pad - 8"
              class="axis-label">Im</text>

        <!-- Tick labels -->
        @for (t of tickLabels; track t.label) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- Unit circle (dashed) -->
        <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]" [attr.r]="unitR"
                fill="none" stroke="var(--text-muted)" stroke-width="0.8"
                stroke-dasharray="4 3" opacity="0.5" />

        <!-- Cos projection (horizontal) -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="ptSvg()[1]"
              [attr.x2]="ptSvg()[0]" [attr.y2]="ptSvg()[1]"
              stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="3 2" />
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="ptSvg()[0]" [attr.y2]="originSvg[1]"
              stroke="#d08040" stroke-width="2.5" />
        <text [attr.x]="(originSvg[0] + ptSvg()[0]) / 2" [attr.y]="originSvg[1] + 16"
              class="proj-label cos-color">cos &theta; = {{ cosVal().toFixed(3) }}</text>

        <!-- Sin projection (vertical) -->
        <line [attr.x1]="ptSvg()[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="ptSvg()[0]" [attr.y2]="ptSvg()[1]"
              stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="3 2" />
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="originSvg[0]" [attr.y2]="ptSvg()[1]"
              stroke="#4070b0" stroke-width="2.5" />
        <text [attr.x]="originSvg[0] - 14" [attr.y]="(originSvg[1] + ptSvg()[1]) / 2 + 4"
              class="proj-label sin-color" text-anchor="end">sin &theta; = {{ sinVal().toFixed(3) }}</text>

        <!-- Arc for theta -->
        <path [attr.d]="arcPath()" fill="none" stroke="var(--accent)" stroke-width="1.5" />
        <text [attr.x]="arcLabelPos()[0]" [attr.y]="arcLabelPos()[1]"
              class="arc-label">&theta;</text>

        <!-- Line from origin to point -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="ptSvg()[0]" [attr.y2]="ptSvg()[1]"
              stroke="var(--accent)" stroke-width="2" />

        <!-- Point e^(i*theta) -->
        <circle [attr.cx]="ptSvg()[0]" [attr.cy]="ptSvg()[1]" r="8"
                fill="var(--accent)" stroke="var(--bg)" stroke-width="2" />

        <!-- De Moivre: e^(in*theta) when n > 1 -->
        @if (nVal() > 1) {
          <!-- Dashed arc for n*theta -->
          <path [attr.d]="nArcPath()" fill="none" stroke="#7a5ab0" stroke-width="1.2"
                stroke-dasharray="4 3" />
          <text [attr.x]="nArcLabelPos()[0]" [attr.y]="nArcLabelPos()[1]"
                class="arc-label n-color">{{ nVal() }}&theta;</text>

          <!-- Line from origin to n-point -->
          <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
                [attr.x2]="nPtSvg()[0]" [attr.y2]="nPtSvg()[1]"
                stroke="#7a5ab0" stroke-width="1.5" stroke-dasharray="4 3" />

          <!-- De Moivre point -->
          <circle [attr.cx]="nPtSvg()[0]" [attr.cy]="nPtSvg()[1]" r="7"
                  fill="#7a5ab0" stroke="var(--bg)" stroke-width="2" />
        }
      </svg>

      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">&theta;</div>
          <div class="ic-body">{{ theta().toFixed(2) }} rad</div>
        </div>
        <div class="info-card wide">
          <div class="ic-title">e^(i&theta;)</div>
          <div class="ic-body">cos &theta; + i sin &theta; = {{ fmtPoint() }}</div>
        </div>
      </div>

      @if (nVal() > 1) {
        <div class="info-row">
          <div class="info-card n-bg">
            <div class="ic-title">e^(i{{ nVal() }}&theta;)</div>
            <div class="ic-body">{{ fmtNPoint() }}</div>
          </div>
          <div class="info-card n-bg">
            <div class="ic-title">De Moivre</div>
            <div class="ic-body">n = {{ nVal() }}, n&theta; = {{ nTheta().toFixed(2) }} rad</div>
          </div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Euler 公式是複分析的基石。任何複數都可以寫成 re<sup>i&theta;</sup>，
        乘法就是轉角度、縮半徑。下一節看複數平面上的重要集合。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .slider-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; }
    .slider-label { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 110px; }
    .slider-hint { font-size: 10px; color: var(--text-muted); }
    .ctrl-slider { flex: 1; accent-color: var(--accent); }
    .ctrl-slider.short { max-width: 100px; }

    .plane-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }

    .axis-label { font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .tick-label { font-size: 8px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .proj-label { font-size: 9px; font-weight: 600; text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .cos-color { fill: #d08040; }
    .sin-color { fill: #4070b0; }
    .arc-label { font-size: 11px; fill: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace; text-anchor: middle; }
    .n-color { fill: #7a5ab0; }

    .info-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .info-card { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      text-align: center; background: var(--bg-surface);
      &.wide { flex: 2; }
      &.n-bg { background: rgba(122, 90, 176, 0.06); border-color: rgba(122, 90, 176, 0.2); } }
    .ic-title { font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.04em; }
    .ic-body { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
  `,
})
export class StepPolarFormComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);

  readonly theta = signal(0.78);
  readonly nVal = signal(1);

  readonly formulaEuler = String.raw`e^{i\theta} = \cos\theta + i\sin\theta`;
  readonly formulaPolar = String.raw`z = r\,e^{i\theta}`;

  /** Pixel radius of the unit circle on the SVG */
  readonly unitR = (() => {
    const [ox] = toSvg(VIEW, [0, 0]);
    const [ux] = toSvg(VIEW, [1, 0]);
    return ux - ox;
  })();

  /** Tick labels for integer values on both axes */
  readonly tickLabels = (() => {
    const labels: { x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (let k = -1; k <= 1; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ x: tx, y: oy + 14, label: String(k) });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ x: ox - 10, y: ty + 4, label: k + 'i' });
    }
    return labels;
  })();

  readonly cosVal = computed(() => Math.cos(this.theta()));
  readonly sinVal = computed(() => Math.sin(this.theta()));

  readonly pt = computed((): C => cFromPolar(1, this.theta()));
  readonly ptSvg = computed(() => toSvg(VIEW, this.pt()));

  readonly nTheta = computed(() => this.nVal() * this.theta());
  readonly nPt = computed((): C => cFromPolar(1, this.nTheta()));
  readonly nPtSvg = computed(() => toSvg(VIEW, this.nPt()));

  fmtPoint(): string { return fmtC(this.pt()); }
  fmtNPoint(): string { return fmtC(this.nPt()); }

  /** SVG arc path from the positive real axis to angle theta */
  arcPath(): string {
    const r = this.unitR * 0.22;
    const angle = this.theta();
    if (Math.abs(angle) < 0.01) return '';
    return this.buildArc(this.originSvg[0], this.originSvg[1], r, 0, angle);
  }

  arcLabelPos(): [number, number] {
    const r = this.unitR * 0.32;
    const half = this.theta() / 2;
    return [
      this.originSvg[0] + r * Math.cos(-half),
      this.originSvg[1] + r * Math.sin(-half) + 4,
    ];
  }

  /** SVG arc path from positive real axis to angle n*theta */
  nArcPath(): string {
    const r = this.unitR * 0.16;
    const angle = this.nTheta();
    if (Math.abs(angle) < 0.01) return '';
    return this.buildArc(this.originSvg[0], this.originSvg[1], r, 0, angle);
  }

  nArcLabelPos(): [number, number] {
    const r = this.unitR * 0.26;
    const half = this.nTheta() / 2;
    return [
      this.originSvg[0] + r * Math.cos(-half),
      this.originSvg[1] + r * Math.sin(-half) + 4,
    ];
  }

  /**
   * Build an SVG arc from startAngle to endAngle (radians, CCW in math = CW in SVG-y).
   * SVG y-axis is flipped, so we negate angles.
   */
  private buildArc(cx: number, cy: number, r: number, start: number, end: number): string {
    // Break into segments if |end - start| > PI to handle large arcs properly
    const totalAngle = end - start;
    const segments = Math.ceil(Math.abs(totalAngle) / Math.PI);
    let d = '';
    for (let i = 0; i < segments; i++) {
      const a0 = start + (totalAngle * i) / segments;
      const a1 = start + (totalAngle * (i + 1)) / segments;
      const x0 = cx + r * Math.cos(-a0);
      const y0 = cy + r * Math.sin(-a0);
      const x1 = cx + r * Math.cos(-a1);
      const y1 = cy + r * Math.sin(-a1);
      const sweep = totalAngle > 0 ? 0 : 1;
      const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
      if (i === 0) {
        d += `M${x0.toFixed(1)},${y0.toFixed(1)}`;
      }
      d += `A${r.toFixed(1)},${r.toFixed(1)} 0 ${largeArc} ${sweep} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return d;
  }
}
