import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; }

@Component({
  selector: 'app-step-applications',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u61C9\u7528\uFF1A\u63D2\u503C\u8207\u6700\u5C0F\u5E73\u65B9\u6CD5" subtitle="\u00A74.6">
      <p>
        \u89E3\u7DDA\u6027\u65B9\u7A0B\u7D44\u662F\u5167\u5728\u65BC\u8A31\u591A\u5BE6\u969B\u554F\u984C\u7684\u6F14\u7B97\u6CD5\u3002\u9019\u88E1\u770B\u5169\u500B\u6700\u5178\u578B\u7684\u4F8B\u5B50\u3002
      </p>
      <p>
        <strong>\u63D2\u503C</strong>\uFF1A\u7D66 n + 1 \u500B\u9EDE\uFF0C\u627E\u4E00\u6761\u904E\u90A3\u4E9B\u9EDE\u7684 n \u6B21\u591A\u9805\u5F0F\u3002
        \u9019\u662F\u4E00\u500B\u300C\u4FC2\u6578\u6709\u591A\u5C11\u500B\u672A\u77E5\u6578 = \u9EDE\u6709\u591A\u5C11\u500B\u300D\u7684\u65B9\u7A0B\u7D44\u3002
      </p>
      <p>
        <strong>\u6700\u5C0F\u5E73\u65B9\u6CD5</strong>\uFF1A\u9EDE\u592A\u591A\uFF08\u8D85\u51FA\u9700\u8981\uFF09\u4E14\u4E0D\u5B8C\u5168\u5728\u540C\u4E00\u689D\u7DDA\u4E0A\u6642\uFF0C\u627E\u4E00\u689D\u300C\u6700\u63A5\u8FD1\u300D\u7684\u7DDA\u3002
        \u9019\u662F\u300C\u7121\u89E3\uFF0C\u4F46\u8981\u627E\u6700\u63A5\u8FD1\u7684\u89E3\u300D\u7684\u554F\u984C\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u9EDE\uFF0C\u770B\u6700\u5C0F\u5E73\u65B9\u76F4\u7DDA\u8DDF\u8457\u7570\u52D5">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Best fit line: y = mx + c -->
          <line x1="-100" [attr.y1]="-(slope() * -4 + intercept()) * 25"
            x2="100" [attr.y2]="-(slope() * 4 + intercept()) * 25"
            stroke="var(--accent)" stroke-width="2.5" />

          <!-- Vertical residuals -->
          @for (p of points(); track $index) {
            <line [attr.x1]="p.x * 25" [attr.y1]="-p.y * 25"
              [attr.x2]="p.x * 25" [attr.y2]="-(slope() * p.x + intercept()) * 25"
              stroke="#a05a5a" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.6" />
          }

          <!-- Data points -->
          @for (p of points(); track $index; let i = $index) {
            <circle [attr.cx]="p.x * 25" [attr.cy]="-p.y * 25" r="6"
              fill="var(--v1)" stroke="white" stroke-width="2"
              class="point" (pointerdown)="startDrag(i, $event)" />
          }
        </svg>
      </div>

      <div class="hint-row">
        \u9EDE\u53EF\u4EE5\u62D6\u52D5\u3002\u865B\u7DDA\u662F\u300C\u8AA4\u5DEE\u300D\uFF0C\u6700\u5C0F\u5E73\u65B9\u6CD5\u8B93\u8AA4\u5DEE\u5E73\u65B9\u548C\u6700\u5C0F\u3002
      </div>

      <div class="result-grid">
        <div class="r-row"><span class="r-l">\u659C\u7387 m</span><span class="r-r">{{ slope().toFixed(3) }}</span></div>
        <div class="r-row"><span class="r-l">\u622A\u8DDD c</span><span class="r-r">{{ intercept().toFixed(3) }}</span></div>
        <div class="r-row"><span class="r-l">\u8AA4\u5DEE\u5E73\u65B9\u548C</span><span class="r-r">{{ sse().toFixed(3) }}</span></div>
      </div>

      <button class="reset-btn" (click)="resetPoints()">\u91CD\u7F6E\u8CC7\u6599\u9EDE</button>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u6700\u5C0F\u5E73\u65B9\u6CD5\u80CC\u5F8C\u7684\u65B9\u7A0B\u7D44\u662F <strong>A^T A x = A^T b</strong>\uFF08\u53EB\u300C\u6B63\u898F\u65B9\u7A0B\u300D\uFF09\uFF0C
        \u9019\u662F\u80FD\u4FDD\u8B49\u6709\u89E3\u7684\u5BEB\u6CD5\u3002\u4E0B\u4E00\u7AE0\u6211\u5011\u4E0D\u8B1B\u7D30\u7BC0\uFF0C\u4F46\u9019\u500B\u516C\u5F0F\u662F\u7B2C\u516D\u7AE0 SVD \u7684\u4F0F\u7B46\u3002
      </p>
      <span class="hint">
        \u4ECE\u8CC7\u6599\u4E2D\u300C\u64ECF\u5408\u300D\u51FA\u4E00\u500B\u6A21\u578B \u2014 \u9019\u5C31\u662F\u73FE\u4EE3\u6A5F\u5668\u5B78\u7FD2\u7684\u6839\u6E90\u3002
        \u7DDA\u6027\u56DE\u6B78\u3001\u591A\u9805\u5F0F\u63D2\u503C\u3001\u6A23\u689D\u63D2\u503C\u90FD\u662F\u9019\u500B\u672C\u8CEA\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; touch-action: none; }
    .point { cursor: grab; &:active { cursor: grabbing; } }

    .hint-row { padding: 8px 12px; border-radius: 6px; background: var(--accent-10);
      font-size: 12px; color: var(--text-secondary); text-align: center; margin-bottom: 12px; }

    .result-grid { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .r-row { display: grid; grid-template-columns: 110px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .r-l { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .r-r { padding: 7px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .reset-btn { display: block; margin: 0 auto; padding: 5px 14px; border: 1px solid var(--border);
      border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); } }
  `,
})
export class StepApplicationsComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  private readonly defaultPoints: Pt[] = [
    { x: -3, y: -2 },
    { x: -1, y: -1 },
    { x: 1, y: 1.5 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
  ];

  readonly points = signal<Pt[]>([...this.defaultPoints]);

  // Least-squares regression: m and c minimising sum((y - mx - c)²)
  // m = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)
  // c = (Σy − m·Σx) / n
  readonly slope = computed(() => {
    const pts = this.points();
    const n = pts.length;
    const sx = pts.reduce((s, p) => s + p.x, 0);
    const sy = pts.reduce((s, p) => s + p.y, 0);
    const sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
    const sxx = pts.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sxx - sx * sx;
    if (Math.abs(denom) < 1e-9) return 0;
    return (n * sxy - sx * sy) / denom;
  });
  readonly intercept = computed(() => {
    const pts = this.points();
    const n = pts.length;
    const sx = pts.reduce((s, p) => s + p.x, 0);
    const sy = pts.reduce((s, p) => s + p.y, 0);
    return (sy - this.slope() * sx) / n;
  });
  readonly sse = computed(() => {
    const m = this.slope(), c = this.intercept();
    return this.points().reduce((s, p) => s + (p.y - m * p.x - c) ** 2, 0);
  });

  // Drag handling
  private dragIdx: number | null = null;

  startDrag(i: number, e: PointerEvent): void {
    this.dragIdx = i;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const svg = (e.target as Element).closest('svg') as SVGSVGElement | null;
    if (!svg) return;
    const move = (ev: PointerEvent) => this.onMove(ev, svg);
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.dragIdx = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private onMove(e: PointerEvent, svg: SVGSVGElement): void {
    if (this.dragIdx === null) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const x = Math.round((local.x / 25) * 2) / 2;
    const y = Math.round((-local.y / 25) * 2) / 2;
    this.points.update((pts) => {
      const next = [...pts];
      next[this.dragIdx!] = { x: Math.max(-4, Math.min(4, x)), y: Math.max(-4, Math.min(4, y)) };
      return next;
    });
  }

  resetPoints(): void {
    this.points.set([...this.defaultPoints]);
  }
}
