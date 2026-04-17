import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  type C, cAdd, cMul, cAbs, cArg, PlaneView, toSvg, fromSvg, axesPath, fmtC,
} from './complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 4, svgW: 520, svgH: 400, pad: 30 };

type OpMode = 'add' | 'mul';

@Component({
  selector: 'app-step-complex-arithmetic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="複數運算的幾何意義" subtitle="&sect;1.2">
      <p>
        複數的加法和乘法都有鮮明的幾何意義。
      </p>
      <p>
        <strong>加法</strong>就是向量加法（平行四邊形法則）：
        把 z&#8322; 的箭頭接在 z&#8321; 的終點，得到 z&#8321; + z&#8322;。
      </p>
      <p>
        <strong>乘法</strong>更深刻——它是<strong>旋轉加縮放</strong>：
      </p>
      <app-math block [e]="mulFormula"></app-math>
      <p>
        長度相乘、角度相加。這是複數最強大的幾何直覺。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換加法/乘法模式，拖動 z&#8321; 和 z&#8322; 觀察結果">
      <div class="mode-row">
        <button class="mode-btn" [class.active]="mode() === 'add'" (click)="mode.set('add')">
          加法 z&#8321;+z&#8322;
        </button>
        <button class="mode-btn" [class.active]="mode() === 'mul'" (click)="mode.set('mul')">
          乘法 z&#8321;&middot;z&#8322;
        </button>
      </div>

      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH"
           class="plane-svg"
           (mousedown)="startDrag($event)"
           (mousemove)="onDrag($event)"
           (mouseup)="stopDrag()"
           (mouseleave)="stopDrag()">
        <!-- Grid lines -->
        @for (g of gridLines; track g.key) {
          <line [attr.x1]="g.x1" [attr.y1]="g.y1" [attr.x2]="g.x2" [attr.y2]="g.y2"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.4" />
        }

        <!-- Axes -->
        <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="1" fill="none" />

        <!-- Tick labels -->
        @for (t of tickLabels; track t.key) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- Addition mode: parallelogram -->
        @if (mode() === 'add') {
          <!-- z1 to result -->
          <line [attr.x1]="z1Svg()[0]" [attr.y1]="z1Svg()[1]"
                [attr.x2]="resSvg()[0]" [attr.y2]="resSvg()[1]"
                stroke="#5a8a5a" stroke-width="1" stroke-dasharray="4 3" stroke-opacity="0.6" />
          <!-- z2 to result -->
          <line [attr.x1]="z2Svg()[0]" [attr.y1]="z2Svg()[1]"
                [attr.x2]="resSvg()[0]" [attr.y2]="resSvg()[1]"
                stroke="var(--accent)" stroke-width="1" stroke-dasharray="4 3" stroke-opacity="0.6" />
        }

        <!-- Multiplication mode: arcs for angles -->
        @if (mode() === 'mul') {
          <!-- Arc for theta1 -->
          <path [attr.d]="arc1()" fill="none" stroke="var(--accent)" stroke-width="1.2"
                stroke-opacity="0.6" />
          <!-- Arc for theta2 -->
          <path [attr.d]="arc2()" fill="none" stroke="#5a8a5a" stroke-width="1.2"
                stroke-opacity="0.6" />
          <!-- Arc for theta_result -->
          <path [attr.d]="arcRes()" fill="none" stroke="#c06060" stroke-width="1.5"
                stroke-dasharray="3 2" stroke-opacity="0.5" />
        }

        <!-- Line origin -> z1 -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="z1Svg()[0]" [attr.y2]="z1Svg()[1]"
              stroke="var(--accent)" stroke-width="1.8" />
        <!-- Line origin -> z2 -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="z2Svg()[0]" [attr.y2]="z2Svg()[1]"
              stroke="#5a8a5a" stroke-width="1.8" />
        <!-- Line origin -> result -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="resSvg()[0]" [attr.y2]="resSvg()[1]"
              stroke="#c06060" stroke-width="2" />

        <!-- z1 point -->
        <circle [attr.cx]="z1Svg()[0]" [attr.cy]="z1Svg()[1]" r="7"
                fill="var(--accent)" stroke="white" stroke-width="2" class="drag-pt" />
        <text [attr.x]="z1Svg()[0] + 10" [attr.y]="z1Svg()[1] - 10" class="pt-label z1-color">z&#8321;</text>

        <!-- z2 point -->
        <circle [attr.cx]="z2Svg()[0]" [attr.cy]="z2Svg()[1]" r="7"
                fill="#5a8a5a" stroke="white" stroke-width="2" class="drag-pt" />
        <text [attr.x]="z2Svg()[0] + 10" [attr.y]="z2Svg()[1] - 10" class="pt-label z2-color">z&#8322;</text>

        <!-- result point -->
        <circle [attr.cx]="resSvg()[0]" [attr.cy]="resSvg()[1]" r="6"
                fill="#c06060" stroke="white" stroke-width="1.5" />
        <text [attr.x]="resSvg()[0] + 10" [attr.y]="resSvg()[1] - 10" class="pt-label res-color">
          {{ mode() === 'add' ? 'z\u2081+z\u2082' : 'z\u2081\u00b7z\u2082' }}
        </text>
      </svg>

      <div class="info-row">
        <div class="info-card z1-bg">
          <div class="ic-title">z&#8321;</div>
          <div class="ic-body">{{ fmtZ1() }}</div>
          <div class="ic-sub">|z&#8321;| = {{ absZ1().toFixed(2) }}</div>
        </div>
        <div class="info-card z2-bg">
          <div class="ic-title">z&#8322;</div>
          <div class="ic-body">{{ fmtZ2() }}</div>
          <div class="ic-sub">|z&#8322;| = {{ absZ2().toFixed(2) }}</div>
        </div>
        <div class="info-card res-bg">
          <div class="ic-title">{{ mode() === 'add' ? 'z\u2081 + z\u2082' : 'z\u2081 \u00b7 z\u2082' }}</div>
          <div class="ic-body">{{ fmtRes() }}</div>
          <div class="ic-sub">|result| = {{ absRes().toFixed(2) }}</div>
        </div>
      </div>

      @if (mode() === 'mul') {
        <div class="mul-detail">
          <div class="md-card">
            <span class="md-lbl">|z&#8321;| &middot; |z&#8322;|</span>
            <span class="md-val">{{ absZ1().toFixed(2) }} &times; {{ absZ2().toFixed(2) }} = {{ mulAbs().toFixed(2) }}</span>
          </div>
          <div class="md-card">
            <span class="md-lbl">arg(z&#8321;) + arg(z&#8322;)</span>
            <span class="md-val">{{ argZ1Deg().toFixed(1) }}&deg; + {{ argZ2Deg().toFixed(1) }}&deg; = {{ argResDeg().toFixed(1) }}&deg;</span>
          </div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        加法是向量的平移，乘法是旋轉加縮放——這是複數最深刻的幾何直覺。
      </p>
    </app-prose-block>
  `,
  styles: `
    .mode-row { display: flex; gap: 6px; margin-bottom: 10px; }
    .mode-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; } }

    .plane-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 12px;
      cursor: crosshair; user-select: none; }
    .drag-pt { cursor: grab; }
    .tick-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .pt-label { font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .z1-color { fill: var(--accent); }
    .z2-color { fill: #5a8a5a; }
    .res-color { fill: #c06060; }

    .info-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .info-card { flex: 1; min-width: 100px; padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface);
      &.z1-bg { background: var(--accent-10); }
      &.z2-bg { background: rgba(90, 138, 90, 0.08); }
      &.res-bg { background: rgba(192, 96, 96, 0.08); } }
    .ic-title { font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .ic-body { font-size: 14px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .ic-sub { font-size: 11px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .mul-detail { display: flex; gap: 8px; flex-wrap: wrap; }
    .md-card { flex: 1; min-width: 140px; padding: 8px 12px; border-radius: 6px;
      border: 1px solid var(--border); background: var(--bg-surface); text-align: center; }
    .md-lbl { font-size: 11px; color: var(--text-muted); display: block;
      font-family: 'JetBrains Mono', monospace; }
    .md-val { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; display: block; }
  `,
})
export class StepComplexArithmeticComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);

  readonly mulFormula = 'z_1 \\cdot z_2 = r_1 r_2 \\, e^{i(\\theta_1 + \\theta_2)}';

  readonly mode = signal<OpMode>('add');
  readonly z1 = signal<C>([1, 0.5]);
  readonly z2 = signal<C>([0.5, 1.5]);
  readonly activeDrag = signal<null | 'z1' | 'z2'>(null);

  readonly result = computed<C>(() => {
    const a = this.z1(), b = this.z2();
    return this.mode() === 'add' ? cAdd(a, b) : cMul(a, b);
  });

  readonly z1Svg = computed(() => toSvg(VIEW, this.z1()));
  readonly z2Svg = computed(() => toSvg(VIEW, this.z2()));
  readonly resSvg = computed(() => toSvg(VIEW, this.result()));

  readonly fmtZ1 = computed(() => fmtC(this.z1()));
  readonly fmtZ2 = computed(() => fmtC(this.z2()));
  readonly fmtRes = computed(() => fmtC(this.result()));

  readonly absZ1 = computed(() => cAbs(this.z1()));
  readonly absZ2 = computed(() => cAbs(this.z2()));
  readonly absRes = computed(() => cAbs(this.result()));

  readonly argZ1Deg = computed(() => cArg(this.z1()) * 180 / Math.PI);
  readonly argZ2Deg = computed(() => cArg(this.z2()) * 180 / Math.PI);
  readonly argResDeg = computed(() => cArg(this.result()) * 180 / Math.PI);
  readonly mulAbs = computed(() => this.absZ1() * this.absZ2());

  /* Pre-compute grid lines */
  readonly gridLines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = (() => {
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const v = VIEW;
    for (let k = -4; k <= 4; k++) {
      const [vx] = toSvg(v, [k, 0]);
      lines.push({ key: `vg${k}`, x1: vx, y1: v.pad, x2: vx, y2: v.svgH - v.pad });
      const [, hy] = toSvg(v, [0, k]);
      lines.push({ key: `hg${k}`, x1: v.pad, y1: hy, x2: v.svgW - v.pad, y2: hy });
    }
    return lines;
  })();

  /* Pre-compute tick labels */
  readonly tickLabels: { key: string; x: number; y: number; label: string }[] = (() => {
    const labels: { key: string; x: number; y: number; label: string }[] = [];
    const v = VIEW;
    const [ox, oy] = toSvg(v, [0, 0]);
    for (let k = -4; k <= 4; k += 2) {
      if (k === 0) continue;
      const [tx] = toSvg(v, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(v, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  /* SVG arc path helper for angles */
  private arcPath(angle: number, arcRadius: number, color?: string): string {
    if (Math.abs(angle) < 0.01) return '';
    const o = this.originSvg;
    const startAngle = 0;
    const endAngle = -angle; // SVG y is flipped
    const sx = o[0] + arcRadius * Math.cos(startAngle);
    const sy = o[1] + arcRadius * Math.sin(startAngle);
    const ex = o[0] + arcRadius * Math.cos(endAngle);
    const ey = o[1] + arcRadius * Math.sin(endAngle);
    const largeArc = Math.abs(angle) > Math.PI ? 1 : 0;
    const sweep = angle > 0 ? 0 : 1;
    return `M${sx},${sy}A${arcRadius},${arcRadius} 0 ${largeArc},${sweep} ${ex},${ey}`;
  }

  arc1(): string {
    return this.arcPath(cArg(this.z1()), 30);
  }

  arc2(): string {
    return this.arcPath(cArg(this.z2()), 40);
  }

  arcRes(): string {
    return this.arcPath(cArg(this.result()), 50);
  }

  /* Drag handling */
  startDrag(ev: MouseEvent): void {
    const pt = this.svgCoord(ev);
    const z1s = this.z1Svg();
    const z2s = this.z2Svg();
    const d1 = Math.hypot(pt[0] - z1s[0], pt[1] - z1s[1]);
    const d2 = Math.hypot(pt[0] - z2s[0], pt[1] - z2s[1]);
    if (d1 < 25 || d2 < 25) {
      this.activeDrag.set(d1 <= d2 ? 'z1' : 'z2');
    } else {
      // If clicking far from both, pick the nearest one
      this.activeDrag.set(d1 <= d2 ? 'z1' : 'z2');
    }
    this.updateDrag(ev);
  }

  onDrag(ev: MouseEvent): void {
    if (!this.activeDrag()) return;
    this.updateDrag(ev);
  }

  stopDrag(): void {
    this.activeDrag.set(null);
  }

  private updateDrag(ev: MouseEvent): void {
    const [sx, sy] = this.svgCoord(ev);
    const pt = fromSvg(VIEW, sx, sy);
    const r = VIEW.radius - 0.1;
    const clamped: C = [
      Math.max(-r, Math.min(r, pt[0])),
      Math.max(-r, Math.min(r, pt[1])),
    ];
    if (this.activeDrag() === 'z1') {
      this.z1.set(clamped);
    } else if (this.activeDrag() === 'z2') {
      this.z2.set(clamped);
    }
  }

  private svgCoord(ev: MouseEvent): [number, number] {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    return [
      (ev.clientX - rect.left) / rect.width * VIEW.svgW,
      (ev.clientY - rect.top) / rect.height * VIEW.svgH,
    ];
  }
}
