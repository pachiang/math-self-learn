import { Component, signal, computed, ElementRef, viewChild } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type View = 'point' | 'arrow' | 'list';

@Component({
  selector: 'app-step-what-is-vector',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4EC0\u9EBC\u662F\u5411\u91CF" subtitle="\u00A71.1">
      <p>
        \u5411\u91CF\u662F\u7DDA\u6027\u4EE3\u6578\u6700\u57FA\u672C\u7684\u7269\u4EF6\u3002\u540C\u4E00\u500B\u5411\u91CF\u53EF\u4EE5\u7528<strong>\u4E09\u7A2E\u4E0D\u540C\u7684\u89C0\u9EDE</strong>\u4F86\u770B\uFF1A
      </p>
      <ul>
        <li><strong>\u9EDE</strong>\uFF1A\u5728\u5E73\u9762\uFF08\u6216\u7A7A\u9593\uFF09\u4E2D\u7684\u4E00\u500B\u4F4D\u7F6E</li>
        <li><strong>\u7BAD\u982D</strong>\uFF1A\u5F9E\u539F\u9EDE\u51FA\u767C\u6307\u5411\u90A3\u500B\u4F4D\u7F6E\u7684\u6709\u5411\u7DDA\u6BB5</li>
        <li><strong>\u6578\u5217</strong>\uFF1A\u4E00\u7D44\u6578\u5B57 [a, b]\uFF0C\u8A18\u9304\u300C\u6A6B\u8DDD\u300D\u548C\u300C\u7E31\u8DDD\u300D</li>
      </ul>
      <p>\u9019\u4E09\u7A2E\u89C0\u9EDE\u5B8C\u5168\u7B49\u50F9\u3002\u4E0B\u9762\u62D6\u62FD\u9EDE\u770B\u770B\u4E09\u8005\u600E\u9EBC\u540C\u6B65\u3002</p>
    </app-prose-block>

    <app-challenge-card prompt="\u5728\u7DB2\u683C\u4E0A\u62D6\u62FD\u85CD\u9EDE\uFF0C\u770B\u4E09\u7A2E\u89C0\u9EDE\u540C\u6B65\u66F4\u65B0">
      <div class="view-tabs">
        @for (v of views; track v.key) {
          <button class="vt" [class.active]="view() === v.key" (click)="view.set(v.key)">{{ v.label }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg #svg viewBox="-110 -110 220 220" class="grid-svg"
          (pointerdown)="onDown($event)"
          (pointermove)="onMove($event)"
          (pointerup)="onUp($event)"
          (pointercancel)="onUp($event)">
          <!-- Grid -->
          @for (g of gridLines; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g"
              stroke="var(--border)" stroke-width="0.5" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100"
              stroke="var(--border)" stroke-width="0.5" />
          }
          <!-- Axes -->
          <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.2" />
          <text x="103" y="4" class="axis-lab">x</text>
          <text x="3" y="-103" class="axis-lab">y</text>

          <!-- Origin -->
          <circle cx="0" cy="0" r="2" fill="var(--text-muted)" />

          <!-- Arrow view -->
          @if (view() === 'arrow') {
            <line x1="0" y1="0" [attr.x2]="px()" [attr.y2]="py()"
              stroke="var(--accent)" stroke-width="2.5" marker-end="url(#a-tip)" />
            <defs>
              <marker id="a-tip" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="var(--accent)" />
              </marker>
            </defs>
          }

          <!-- Always show the draggable point -->
          <circle [attr.cx]="px()" [attr.cy]="py()" r="9"
            fill="var(--accent)" stroke="white" stroke-width="2"
            class="drag-pt" />

          <!-- List view: show coordinates next to point -->
          @if (view() === 'list') {
            <text [attr.x]="labelX()" [attr.y]="labelY()" [attr.text-anchor]="labelAnchor()" class="coord-lab">
              [{{ a() }}, {{ -b() }}]
            </text>
          }
        </svg>
      </div>

      <!-- Sync display -->
      <div class="sync">
        <div class="sync-row">
          <span class="sync-l">\u9EDE</span>
          <span class="sync-r">({{ a() }}, {{ -b() }})</span>
        </div>
        <div class="sync-row">
          <span class="sync-l">\u7BAD\u982D</span>
          <span class="sync-r">\u5F9E (0, 0) \u5230 ({{ a() }}, {{ -b() }})</span>
        </div>
        <div class="sync-row">
          <span class="sync-l">\u6578\u5217</span>
          <span class="sync-r">[{{ a() }}, {{ -b() }}]</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4E09\u7A2E\u770B\u6CD5\u90FD\u662F<strong>\u540C\u4E00\u4EF6\u4E8B</strong>\u3002\u63A5\u4E0B\u4F86\u6211\u5011\u6703\u4EA4\u66FF\u4F7F\u7528\u5B83\u5011\uFF1A
      </p>
      <ul>
        <li>\u7BAD\u982D\u89C0\u9EDE\u9069\u5408\u770B<strong>\u52A0\u6CD5\u3001\u4F38\u7E2E</strong>\u9019\u985E\u51E0\u4F55\u64CD\u4F5C</li>
        <li>\u6578\u5217\u89C0\u9EDE\u9069\u5408\u8DDF<strong>\u77E9\u9663\u3001\u96FB\u8166\u8A08\u7B97</strong>\u6253\u4EA4\u9053</li>
        <li>\u9EDE\u89C0\u9EDE\u63D0\u9192\u6211\u5011\uFF1A\u5411\u91CF\u662F<strong>\u7A7A\u9593\u4E2D\u7684\u4F4D\u7F6E</strong></li>
      </ul>
    </app-prose-block>
  `,
  styles: `
    .view-tabs { display: flex; gap: 4px; margin-bottom: 12px; }
    .vt {
      padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; }
    }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
    .grid-svg { width: 100%; max-width: 320px; touch-action: none; cursor: crosshair; }
    .axis-lab { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .coord-lab { font-size: 11px; fill: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .drag-pt { cursor: grab; &:active { cursor: grabbing; } }

    .sync { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .sync-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .sync-l { padding: 7px 12px; font-size: 12px; font-weight: 600; color: var(--accent);
      background: var(--accent-10); border-right: 1px solid var(--border); }
    .sync-r { padding: 7px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepWhatIsVectorComponent {
  readonly views: { key: View; label: string }[] = [
    { key: 'point', label: '\u9EDE' },
    { key: 'arrow', label: '\u7BAD\u982D' },
    { key: 'list', label: '\u6578\u5217' },
  ];

  readonly gridLines = [-100, -75, -50, -25, 25, 50, 75, 100];

  readonly view = signal<View>('arrow');
  // Internal coords in SVG units (y-down). Display flips y.
  readonly px = signal(60);
  readonly py = signal(-40);

  // Display values: round to integers (in 25-unit grid spacing)
  readonly a = computed(() => Math.round(this.px() / 25));
  readonly b = computed(() => Math.round(this.py() / 25));

  // Coordinate label position — flips to keep label inside the viewBox.
  // Right half of grid → label goes left of point (text-anchor "end").
  // Top half of grid → label goes below point.
  readonly labelX = computed(() =>
    this.px() > 50 ? this.px() - 12 : this.px() + 12,
  );
  readonly labelY = computed(() =>
    this.py() < -50 ? this.py() + 22 : this.py() - 12,
  );
  readonly labelAnchor = computed(() =>
    this.px() > 50 ? ('end' as const) : ('start' as const),
  );

  private dragging = false;
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  onDown(e: PointerEvent): void {
    this.dragging = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    this.updateFromEvent(e);
  }

  onMove(e: PointerEvent): void {
    if (!this.dragging) return;
    this.updateFromEvent(e);
  }

  onUp(e: PointerEvent): void {
    this.dragging = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }

  private updateFromEvent(e: PointerEvent): void {
    const svg = this.svgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    // Snap to grid (25 units)
    const snapped = (v: number) => Math.round(Math.max(-100, Math.min(100, v)) / 25) * 25;
    this.px.set(snapped(local.x));
    this.py.set(snapped(local.y));
  }
}
