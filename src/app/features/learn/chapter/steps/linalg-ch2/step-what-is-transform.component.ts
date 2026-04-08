import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface TransformDef { name: string; m: [number, number, number, number]; desc: string; }

const TRANSFORMS: TransformDef[] = [
  { name: '\u4E0D\u8B8A',     m: [1, 0, 0, 1],   desc: '\u6052\u7B49\u8B8A\u63DB\uFF1A\u4EC0\u9EBC\u90FD\u4E0D\u52D5' },
  { name: '\u65CB\u8F49 90\u00B0', m: [0, -1, 1, 0], desc: '\u6574\u500B\u5E73\u9762\u9006\u6642\u91DD\u8F49 90\u00B0' },
  { name: '\u6C34\u5E73\u526A\u5207', m: [1, 1, 0, 1],  desc: '\u4E0A\u534A\u90E8\u5411\u53F3\u63A8\u3001\u4E0B\u534A\u90E8\u5411\u5DE6\u63A8' },
  { name: '\u6A2A\u5411\u62C9\u4F38', m: [1.5, 0, 0, 1], desc: 'x \u8EF8\u62C9\u9577 1.5 \u500D\uFF0Cy \u8EF8\u4E0D\u8B8A' },
  { name: '\u7E2E\u5C0F',     m: [0.5, 0, 0, 0.5], desc: '\u6574\u500B\u5E73\u9762\u7E2E\u5C0F\u4E00\u534A' },
  { name: '\u93E1\u5C04',     m: [-1, 0, 0, 1],  desc: '\u6CBF y \u8EF8\u93E1\u5C04\uFF08\u5DE6\u53F3\u7FFB\u8F49\uFF09' },
];

@Component({
  selector: 'app-step-what-is-transform',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4EC0\u9EBC\u662F\u7DDA\u6027\u8B8A\u63DB" subtitle="\u00A72.1">
      <p>
        <strong>\u7DDA\u6027\u8B8A\u63DB</strong>\u662F\u4E00\u500B\u628A\u5411\u91CF\u6620\u5230\u5411\u91CF\u7684\u51FD\u6578 T\uFF0C\u6EFF\u8DB3\u5169\u689D\u6027\u8CEA\uFF1A
      </p>
      <ul>
        <li>T(v + w) = T(v) + T(w)</li>
        <li>T(cv) = c\u00B7T(v)</li>
      </ul>
      <p>
        \u9019\u5169\u689D\u898F\u5247\u53EF\u4EE5\u5408\u4F75\u6210\u4E00\u53E5\u8A71\uFF1A<strong>T \u4FDD\u6301\u7DDA\u6027\u7D44\u5408</strong>\u3002\u5E7E\u4F55\u4E0A\u610F\u7FA9\u5F88\u9C9C\u660E\uFF1A
      </p>
      <ul>
        <li>\u539F\u9EDE\u4E0D\u52D5</li>
        <li>\u76F4\u7DDA\u8B8A\u63DB\u5F8C\u9084\u662F\u76F4\u7DDA</li>
        <li>\u5E73\u884C\u7DDA\u4FDD\u6301\u5E73\u884C\u3001\u9593\u8DDD\u5747\u52FB</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u9EDE\u4E00\u500B\u8B8A\u63DB\uFF0C\u7DB2\u683C\u6703\u5F9E identity \u52D5\u756B\u8B8A\u5F62\u3002\u91CD\u9EDE\u540C\u4E00\u500B\u53EF\u91CD\u64AD">
      <div class="t-tabs">
        @for (t of transforms; track t.name; let i = $index) {
          <button class="tt" [class.active]="sel() === i" (click)="pick(i)">{{ t.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          <!-- Reference grid (faint) -->
          @for (g of refGrid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" opacity="0.6" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" opacity="0.6" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Transformed grid (CSS-animated wrapper) -->
          <g class="grid-layer" [style.transform]="cssTransform()" [style.transition]="cssTransition()">
            <!-- Vertical lines: parallel to ê₂ direction → ê₂ colour -->
            @for (g of fineGrid; track g) {
              <line [attr.x1]="g" y1="-100" [attr.x2]="g" y2="100"
                stroke="var(--v1)" stroke-width="0.9" opacity="0.45" />
            }
            <!-- Horizontal lines: parallel to ê₁ direction → ê₁ colour -->
            @for (g of fineGrid; track g) {
              <line x1="-100" [attr.y1]="g" x2="100" [attr.y2]="g"
                stroke="var(--v0)" stroke-width="0.9" opacity="0.45" />
            }

            <!-- Basis vectors (drawn last so they sit on top) -->
            <line x1="0" y1="0" x2="40" y2="0"
              stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-e1)" />
            <line x1="0" y1="0" x2="0" y2="-40"
              stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-e2)" />
          </g>

          <defs>
            <marker id="tip-e1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-e2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="info-row">
        <div class="t-name">{{ current().name }}</div>
        <div class="t-desc">{{ current().desc }}</div>
      </div>

      <div class="matrix-display">
        <div class="md-label">\u77E9\u9663</div>
        <div class="md-bracket">[</div>
        <div class="md-body">
          <div class="md-row">
            <span>{{ current().m[0] }}</span><span>{{ current().m[1] }}</span>
          </div>
          <div class="md-row">
            <span>{{ current().m[2] }}</span><span>{{ current().m[3] }}</span>
          </div>
        </div>
        <div class="md-bracket">]</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u6CE8\u610F\u770B\uFF1A\u4E0D\u7BA1\u9078\u54EA\u500B\u8B8A\u63DB\uFF0C<strong>\u539F\u672C\u7B46\u76F4\u7684\u7DB2\u683C\u7DDA\u8B8A\u63DB\u5F8C\u9084\u662F\u7B46\u76F4\u7684</strong>\uFF0C
        \u5E73\u884C\u7684\u9084\u662F\u5E73\u884C\u7684\u3002\u9019\u5C31\u662F\u300C\u7DDA\u6027\u300D\u9019\u500B\u540D\u5B57\u7684\u4F86\u6E90\u3002
      </p>
      <span class="hint">
        \u4E0B\u4E00\u7BC0\u6211\u5011\u6703\u770B\u5230\uFF1A\u9019\u4E9B\u8B8A\u63DB\u5168\u90E8\u53EF\u4EE5\u7528\u4E00\u500B 2\u00D72 \u77E9\u9663\u7DE8\u78BC\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .t-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .tt { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 340px; }
    .grid-layer { transform-origin: 0 0; will-change: transform; }

    .info-row { text-align: center; margin-bottom: 12px; }
    .t-name { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 2px; }
    .t-desc { font-size: 12px; color: var(--text-secondary); }

    .matrix-display {
      display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 12px; border-radius: 8px; background: var(--bg-surface);
    }
    .md-label { font-size: 12px; color: var(--text-muted); margin-right: 8px; }
    .md-bracket { font-size: 36px; font-weight: 200; color: var(--text-muted); line-height: 1; }
    .md-body { display: flex; flex-direction: column; gap: 2px; }
    .md-row { display: flex; gap: 8px; }
    .md-row span {
      min-width: 36px; text-align: center; font-size: 14px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      padding: 3px 6px; background: var(--bg); border-radius: 4px;
    }
  `,
})
export class StepWhatIsTransformComponent {
  readonly transforms = TRANSFORMS;
  readonly refGrid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly fineGrid = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];

  // sel = the currently *selected* transformation tab (for label/matrix display)
  readonly sel = signal(0);
  readonly current = computed(() => this.transforms[this.sel()]);

  // cssTransform / cssTransition are independent signals so we can drive
  // a "snap to identity, then animate to target" sequence.
  readonly cssTransform = signal('matrix(1, 0, 0, 1, 0, 0)');
  readonly cssTransition = signal('none');

  /** Convert math matrix [a,b,c,d] (y-up) to SVG transform matrix(p,q,r,s,0,0). */
  private toCss(m: [number, number, number, number]): string {
    const [a, b, c, d] = m;
    return `matrix(${a}, ${-c}, ${-b}, ${d}, 0, 0)`;
  }

  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  pick(i: number): void {
    this.sel.set(i);

    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }

    // Identity tab: just animate (smoothly) back to identity.
    if (i === 0) {
      this.cssTransition.set('transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)');
      this.cssTransform.set('matrix(1, 0, 0, 1, 0, 0)');
      return;
    }

    // Other transforms: snap instantly to identity, hold ~600ms so the user
    // can read "this is the starting state", then animate to the target.
    this.cssTransition.set('none');
    this.cssTransform.set('matrix(1, 0, 0, 1, 0, 0)');

    this.pendingTimer = setTimeout(() => {
      this.cssTransition.set('transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)');
      this.cssTransform.set(this.toCss(this.transforms[i].m));
      this.pendingTimer = null;
    }, 600);
  }
}
