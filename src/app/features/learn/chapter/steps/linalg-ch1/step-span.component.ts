import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface VPair { name: string; vx: number; vy: number; wx: number; wy: number; collinear: boolean; desc: string; }

const PAIRS: VPair[] = [
  { name: '\u4E0D\u5171\u7DDA', vx: 40, vy: 20, wx: -20, wy: 40, collinear: false,
    desc: 'v \u8207 w \u6307\u5411\u4E0D\u540C\u65B9\u5411 \u2192 span \u662F\u6574\u500B\u5E73\u9762' },
  { name: '\u5171\u7DDA', vx: 40, vy: 20, wx: 80, wy: 40, collinear: true,
    desc: 'w = 2v\uFF0C\u540C\u65B9\u5411 \u2192 span \u53EA\u662F\u4E00\u689D\u76F4\u7DDA' },
  { name: '\u53CD\u5411\u5171\u7DDA', vx: 40, vy: 20, wx: -40, wy: -20, collinear: true,
    desc: 'w = -v \u2192 \u9084\u662F\u540C\u4E00\u689D\u76F4\u7DDA' },
  { name: '\u5782\u76F4', vx: 40, vy: 0, wx: 0, wy: 40, collinear: false,
    desc: '\u6A19\u6E96\u57FA\u5E95 e\u2081\u3001e\u2082 \u2192 span \u662F\u6574\u500B\u5E73\u9762' },
];

@Component({
  selector: 'app-step-span',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Span\uFF1A\u751F\u6210\u7A7A\u9593" subtitle="\u00A71.4">
      <p>
        \u5169\u500B\u5411\u91CF v\u3001w \u7684<strong>span</strong>\uFF0C\u662F\u300C\u6240\u6709\u53EF\u80FD\u7684\u7DDA\u6027\u7D44\u5408\u300D\uFF1A
      </p>
      <p class="formula-display">span(v, w) = {{ '{' }} \u03B1v + \u03B2w : \u03B1, \u03B2 \u2208 \u211D {{ '}' }}</p>
      <p>
        \u300C\u80FD\u7528 v \u548C w \u6DF7\u5408\u51FA\u4F86\u7684\u7A7A\u9593\u300D\u3002\u95DC\u9375\u554F\u984C\uFF1A\u9019\u500B\u7A7A\u9593\u9577\u4EC0\u9EBC\u6A23\u5B50\uFF1F
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u7D44 v \u548C w\uFF0C\u770B\u5B83\u5011\u7684 span">
      <div class="pair-tabs">
        @for (p of pairs; track p.name; let i = $index) {
          <button class="pt" [class.active]="sel() === i" (click)="sel.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg viewBox="-110 -110 220 220" class="grid-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.5" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.5" />
          }
          <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.2" />

          <!-- Span visualization -->
          @if (current().collinear) {
            <!-- Show a thick line through origin in direction of v -->
            <line [attr.x1]="-spanLineX()" [attr.y1]="spanLineY()"
              [attr.x2]="spanLineX()" [attr.y2]="-spanLineY()"
              stroke="var(--accent)" stroke-width="6" opacity="0.35" />
          } @else {
            <!-- Fill the entire grid area with accent tint -->
            <rect x="-100" y="-100" width="200" height="200" fill="var(--accent)" opacity="0.12" />
          }

          <!-- Sample combination points (5x5 grid) -->
          @for (pt of samplePts(); track $index) {
            <circle [attr.cx]="pt.x" [attr.cy]="-pt.y" r="2.5" fill="var(--accent)" opacity="0.6" />
          }

          <!-- v and w arrows -->
          <line x1="0" y1="0" [attr.x2]="current().vx" [attr.y2]="-current().vy"
            stroke="var(--v0)" stroke-width="3" marker-end="url(#tip-vs)" />
          <line x1="0" y1="0" [attr.x2]="current().wx" [attr.y2]="-current().wy"
            stroke="var(--v1)" stroke-width="3" marker-end="url(#tip-ws)" />

          <defs>
            <marker id="tip-vs" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--v0)" />
            </marker>
            <marker id="tip-ws" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="verdict" [class.full]="!current().collinear" [class.line]="current().collinear">
        <div class="v-icon">{{ current().collinear ? '\u2014' : '\u25A0' }}</div>
        <div class="v-text">
          <div class="v-title">{{ current().collinear ? 'span = \u4E00\u689D\u76F4\u7DDA' : 'span = \u6574\u500B\u5E73\u9762 \u211D\u00B2' }}</div>
          <div class="v-desc">{{ current().desc }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u95DC\u9375\u89C0\u5BDF\uFF1A<strong>\u5169\u500B\u5411\u91CF\u4E0D\u4E00\u5B9A\u80FD\u751F\u6210\u6574\u500B\u5E73\u9762</strong>\u3002
        \u5982\u679C\u5B83\u5011\u662F\u540C\u4E00\u4EF6\u4E8B\uFF08\u5171\u7DDA\uFF09\uFF0Cspan \u5C31\u53EA\u662F\u4E00\u689D\u76F4\u7DDA\u3002
      </p>
      <span class="hint">
        \u300C\u662F\u5426\u5171\u7DDA\u300D\u9019\u500B\u6027\u8CEA\u6709\u500B\u6B63\u5F0F\u540D\u5B57\uFF1A<strong>\u7DDA\u6027\u76F8\u4F9D / \u7DDA\u6027\u7368\u7ACB</strong>\u3002\u4E0B\u4E00\u7BC0\u898B\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula-display { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 6px 0; }

    .pair-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .pt { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .grid-svg { width: 100%; max-width: 320px; }

    .verdict {
      display: flex; gap: 12px; align-items: center; padding: 14px 18px; border-radius: 10px;
      &.full { background: var(--accent-10); border: 1px solid var(--accent-30); }
      &.line { background: rgba(160,90,90,0.06); border: 1px solid rgba(160,90,90,0.2); }
    }
    .v-icon { font-size: 28px; .full & { color: var(--accent); } .line & { color: #a05a5a; } }
    .v-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
    .v-desc { font-size: 12px; color: var(--text-secondary); }
  `,
})
export class StepSpanComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly pairs = PAIRS;
  readonly sel = signal(0);
  readonly current = computed(() => this.pairs[this.sel()]);

  // For collinear cases: extend the line through origin
  readonly spanLineX = computed(() => {
    const c = this.current();
    if (!c.collinear) return 0;
    const len = Math.hypot(c.vx, c.vy);
    return (c.vx / len) * 140;
  });
  readonly spanLineY = computed(() => {
    const c = this.current();
    if (!c.collinear) return 0;
    const len = Math.hypot(c.vx, c.vy);
    return (c.vy / len) * 140;
  });

  // Sample points: αv + βw for α, β ∈ {-2, -1, 0, 1, 2}
  readonly samplePts = computed(() => {
    const c = this.current();
    const pts: { x: number; y: number }[] = [];
    for (let a = -2; a <= 2; a++) {
      for (let b = -2; b <= 2; b++) {
        const x = a * c.vx + b * c.wx;
        const y = a * c.vy + b * c.wy;
        if (Math.abs(x) < 100 && Math.abs(y) < 100) {
          pts.push({ x, y });
        }
      }
    }
    return pts;
  });
}
