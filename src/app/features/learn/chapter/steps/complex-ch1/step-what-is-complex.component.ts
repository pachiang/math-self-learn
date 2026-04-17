import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { type C, cAbs, cArg, PlaneView, toSvg, fromSvg, axesPath, fmtC } from './complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 3, svgW: 520, svgH: 400, pad: 30 };

@Component({
  selector: 'app-step-what-is-complex',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="什麼是複數" subtitle="&sect;1.1">
      <p>
        當我們嘗試解方程 x&sup2; + 1 = 0 時，實數不夠用了——沒有任何實數的平方等於 &minus;1。
        數學家的解法很大膽：<strong>直接發明一個新的數</strong>，叫做 i，
        規定它滿足 i&sup2; = &minus;1。
      </p>
      <app-math block [e]="defFormula"></app-math>
      <p>
        一個<strong>複數</strong> z = a + bi 由兩部分組成：
        實部 a（Real Part）和虛部 b（Imaginary Part）。
        每個複數都可以唯一地表示為一對實數 (a, b)。
      </p>
      <p>
        既然複數是一對實數，我們自然可以把它畫在平面上——
        橫軸是實部，縱軸是虛部。
        這就是<strong>複數平面</strong>（Argand diagram）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="在複數平面上拖動點，觀察實部與虛部如何變化">
      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH"
           class="plane-svg"
           (mousedown)="startDrag($event)"
           (mousemove)="onDrag($event)"
           (mouseup)="dragging.set(false)"
           (mouseleave)="dragging.set(false)">
        <!-- Grid lines -->
        @for (g of gridLines; track g.key) {
          <line [attr.x1]="g.x1" [attr.y1]="g.y1" [attr.x2]="g.x2" [attr.y2]="g.y2"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.5" />
        }

        <!-- Axes -->
        <path [attr.d]="axes" stroke="var(--text-muted)" stroke-width="1" fill="none" />

        <!-- Axis labels -->
        <text [attr.x]="view.svgW - view.pad + 10" [attr.y]="originSvg[1] + 4"
              class="axis-lbl">Re</text>
        <text [attr.x]="originSvg[0] + 8" [attr.y]="view.pad - 8"
              class="axis-lbl">Im</text>

        <!-- Tick labels -->
        @for (t of tickLabels; track t.key) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- Dashed projection: horizontal to imaginary axis -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="ptSvg()[1]"
              [attr.x2]="ptSvg()[0]" [attr.y2]="ptSvg()[1]"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="4 3" stroke-opacity="0.5" />
        <!-- Dashed projection: vertical to real axis -->
        <line [attr.x1]="ptSvg()[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="ptSvg()[0]" [attr.y2]="ptSvg()[1]"
              stroke="var(--accent)" stroke-width="1" stroke-dasharray="4 3" stroke-opacity="0.5" />

        <!-- Line from origin to point -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1]"
              [attr.x2]="ptSvg()[0]" [attr.y2]="ptSvg()[1]"
              stroke="var(--accent)" stroke-width="1.8" />

        <!-- Real part brace on x-axis -->
        <line [attr.x1]="originSvg[0]" [attr.y1]="originSvg[1] + 8"
              [attr.x2]="ptSvg()[0]" [attr.y2]="originSvg[1] + 8"
              stroke="#5a7faa" stroke-width="2" />
        <text [attr.x]="(originSvg[0] + ptSvg()[0]) / 2" [attr.y]="originSvg[1] + 22"
              class="brace-label re-color">a</text>

        <!-- Imaginary part brace on y-axis -->
        <line [attr.x1]="originSvg[0] - 8" [attr.y1]="originSvg[1]"
              [attr.x2]="originSvg[0] - 8" [attr.y2]="ptSvg()[1]"
              stroke="#5a8a5a" stroke-width="2" />
        <text [attr.x]="originSvg[0] - 20" [attr.y]="(originSvg[1] + ptSvg()[1]) / 2 + 4"
              class="brace-label im-color">b</text>

        <!-- Draggable point -->
        <circle [attr.cx]="ptSvg()[0]" [attr.cy]="ptSvg()[1]" r="7"
                fill="var(--accent)" stroke="white" stroke-width="2" class="drag-pt" />
        <!-- Label near point -->
        <text [attr.x]="ptSvg()[0] + 12" [attr.y]="ptSvg()[1] - 10"
              class="pt-label">z</text>
      </svg>

      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">z = a + bi</div>
          <div class="ic-body">{{ fmtZ() }}</div>
        </div>
        <div class="info-card re-bg">
          <div class="ic-title">Re(z) = a</div>
          <div class="ic-body">{{ re().toFixed(2) }}</div>
        </div>
        <div class="info-card im-bg">
          <div class="ic-title">Im(z) = b</div>
          <div class="ic-body">{{ im().toFixed(2) }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">|z|</div>
          <div class="ic-body">{{ absZ().toFixed(3) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        每個複數對應平面上唯一的點——這就是複數平面。
        下一節看複數的運算如何在平面上「動」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .plane-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 12px;
      cursor: crosshair; user-select: none; }
    .drag-pt { cursor: grab; }
    .axis-lbl { font-size: 11px; fill: var(--text-muted); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }
    .tick-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .pt-label { font-size: 13px; fill: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .brace-label { font-size: 11px; font-weight: 700; text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .re-color { fill: #5a7faa; }
    .im-color { fill: #5a8a5a; }

    .info-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .info-card { flex: 1; min-width: 80px; padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface);
      &.re-bg { background: rgba(90, 127, 170, 0.08); }
      &.im-bg { background: rgba(90, 138, 90, 0.08); } }
    .ic-title { font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .ic-body { font-size: 14px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
  `,
})
export class StepWhatIsComplexComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);

  readonly defFormula = 'z = a + bi, \\quad i^2 = -1';

  readonly z = signal<C>([1.5, 1]);
  readonly dragging = signal(false);

  readonly re = computed(() => this.z()[0]);
  readonly im = computed(() => this.z()[1]);
  readonly absZ = computed(() => cAbs(this.z()));
  readonly fmtZ = computed(() => fmtC(this.z()));
  readonly ptSvg = computed(() => toSvg(VIEW, this.z()));

  /* Pre-compute grid lines */
  readonly gridLines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = (() => {
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const v = VIEW;
    for (let k = -3; k <= 3; k++) {
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
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(v, [k, 0]);
      labels.push({ key: `tx${k}`, x: tx, y: oy + 16, label: `${k}` });
      const [, ty] = toSvg(v, [0, k]);
      labels.push({ key: `ty${k}`, x: ox - 14, y: ty + 4, label: `${k}i` });
    }
    return labels;
  })();

  startDrag(ev: MouseEvent): void {
    this.dragging.set(true);
    this.updatePoint(ev);
  }

  onDrag(ev: MouseEvent): void {
    if (!this.dragging()) return;
    this.updatePoint(ev);
  }

  private updatePoint(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) / rect.width * VIEW.svgW;
    const sy = (ev.clientY - rect.top) / rect.height * VIEW.svgH;
    const pt = fromSvg(VIEW, sx, sy);
    // Clamp within the view
    const r = VIEW.radius - 0.1;
    const clamped: C = [
      Math.max(-r, Math.min(r, pt[0])),
      Math.max(-r, Math.min(r, pt[1])),
    ];
    this.z.set(clamped);
  }
}
