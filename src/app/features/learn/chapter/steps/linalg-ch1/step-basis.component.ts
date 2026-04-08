import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Basis { name: string; b1x: number; b1y: number; b2x: number; b2y: number; desc: string; }

const BASES: Basis[] = [
  { name: '\u6A19\u6E96\u57FA\u5E95 {e\u2081, e\u2082}', b1x: 20, b1y: 0, b2x: 0, b2y: 20,
    desc: '\u6700\u81EA\u7136\u7684\u57FA\u5E95\uFF1A\u6C34\u5E73 + \u5782\u76F4' },
  { name: '\u659C\u57FA\u5E95', b1x: 30, b1y: 10, b2x: -10, b2y: 30,
    desc: '\u4EFB\u610F\u4E0D\u5171\u7DDA\u7684\u5169\u500B\u5411\u91CF\u90FD\u53EF\u4EE5\u7576\u57FA\u5E95' },
  { name: '\u53E6\u4E00\u500B\u659C\u57FA\u5E95', b1x: 40, b1y: 0, b2x: 20, b2y: 30,
    desc: '\u4E0D\u9700\u8981\u5782\u76F4\uFF0C\u53EA\u9700\u8981\u7DDA\u6027\u7368\u7ACB' },
];

@Component({
  selector: 'app-step-basis',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u57FA\u5E95\u8207\u5750\u6A19" subtitle="\u00A71.6">
      <p>
        <strong>\u57FA\u5E95</strong>\uFF08basis\uFF09\u662F\u4E00\u7D44\u7DDA\u6027\u7368\u7ACB\u7684\u5411\u91CF\uFF0C\u4ED6\u5011\u7684 span \u662F\u6574\u500B\u7A7A\u9593\u3002
      </p>
      <p>
        \u95DC\u9375\u6027\u8CEA\uFF1A\u6BCF\u500B\u5411\u91CF\u90FD\u53EF\u4EE5\u7528\u57FA\u5E95<strong>\u552F\u4E00\u5730</strong>\u8868\u793A\u3002
        \u9019\u4E9B\u552F\u4E00\u7684\u4FC2\u6578\u5C31\u662F\u9019\u500B\u5411\u91CF\u5728\u8A72\u57FA\u5E95\u4E0B\u7684<strong>\u5750\u6A19</strong>\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E0D\u540C\u57FA\u5E95\uFF0C\u770B\u540C\u4E00\u500B\u9EDE\u600E\u9EBC\u88AB\u8868\u793A">
      <div class="basis-tabs">
        @for (b of bases; track b.name; let i = $index) {
          <button class="bt" [class.active]="sel() === i" (click)="sel.set(i)">{{ b.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg viewBox="-110 -110 220 220" class="grid-svg">
          <!-- Standard grid (gray) -->
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.5" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.5" />
          }
          <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.2" />

          <!-- Basis grid lines (colored, follow b1 and b2 directions) -->
          @for (k of basisLineRange; track k) {
            @if (k !== 0) {
              <!-- Lines parallel to b2, offset by k*b1 -->
              <line
                [attr.x1]="k * current().b1x - 5 * current().b2x"
                [attr.y1]="-(k * current().b1y - 5 * current().b2y)"
                [attr.x2]="k * current().b1x + 5 * current().b2x"
                [attr.y2]="-(k * current().b1y + 5 * current().b2y)"
                stroke="var(--accent)" stroke-width="0.8" opacity="0.3" />
              <!-- Lines parallel to b1, offset by k*b2 -->
              <line
                [attr.x1]="k * current().b2x - 5 * current().b1x"
                [attr.y1]="-(k * current().b2y - 5 * current().b1y)"
                [attr.x2]="k * current().b2x + 5 * current().b1x"
                [attr.y2]="-(k * current().b2y + 5 * current().b1y)"
                stroke="var(--accent)" stroke-width="0.8" opacity="0.3" />
            }
          }

          <!-- Basis vectors -->
          <line x1="0" y1="0" [attr.x2]="current().b1x" [attr.y2]="-current().b1y"
            stroke="var(--v0)" stroke-width="3" marker-end="url(#tip-b1)" />
          <line x1="0" y1="0" [attr.x2]="current().b2x" [attr.y2]="-current().b2y"
            stroke="var(--v1)" stroke-width="3" marker-end="url(#tip-b2)" />

          <!-- Target point P (fixed in space) -->
          <circle [attr.cx]="targetX" [attr.cy]="-targetY" r="7" fill="var(--accent)" stroke="white" stroke-width="2" />
          <text [attr.x]="targetX + 9" [attr.y]="-targetY - 9" class="pt-label">P</text>

          <!-- Decomposition: c1*b1 then c2*b2 path -->
          <line x1="0" y1="0"
            [attr.x2]="coords().c1 * current().b1x" [attr.y2]="-coords().c1 * current().b1y"
            stroke="var(--v0)" stroke-width="2" stroke-dasharray="3 2" opacity="0.6" />
          <line
            [attr.x1]="coords().c1 * current().b1x" [attr.y1]="-coords().c1 * current().b1y"
            [attr.x2]="targetX" [attr.y2]="-targetY"
            stroke="var(--v1)" stroke-width="2" stroke-dasharray="3 2" opacity="0.6" />

          <defs>
            <marker id="tip-b1" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--v0)" />
            </marker>
            <marker id="tip-b2" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="coords-display">
        <div class="cd-row">
          <span class="cd-l">\u9EDE P \u5728\u9019\u500B\u57FA\u5E95\u4E0B\u7684\u5750\u6A19\uFF1A</span>
        </div>
        <div class="cd-formula">
          P = <span class="c1">{{ coords().c1.toFixed(2) }}</span> \u00B7 <span class="b1">b\u2081</span>
          + <span class="c2">{{ coords().c2.toFixed(2) }}</span> \u00B7 <span class="b2">b\u2082</span>
        </div>
        <div class="cd-coord">
          \u5750\u6A19 = ({{ coords().c1.toFixed(2) }}, {{ coords().c2.toFixed(2) }})
        </div>
        <div class="cd-desc">{{ current().desc }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u540C\u4E00\u500B\u9EDE P \u5728\u4E0D\u540C\u57FA\u5E95\u4E0B\u6709\u4E0D\u540C\u7684\u5750\u6A19\uFF0C\u4F46<strong>\u5B83\u5011\u8868\u793A\u540C\u4E00\u500B\u5411\u91CF</strong>\u3002
      </p>
      <p>
        \u9019\u662F\u7DDA\u6027\u4EE3\u6578\u7684\u4E00\u500B\u5927\u4E3B\u984C\uFF1A\u5411\u91CF\u672C\u8EAB\u8DDF\u300C\u9078\u4EC0\u9EBC\u5750\u6A19\u770B\u300D\u7121\u95DC\uFF0C
        \u4F46\u5750\u6A19\u8868\u793A\u8DDF\u57FA\u5E95\u6709\u95DC\u3002\u4E0B\u4E00\u7AE0\u300C\u7DDA\u6027\u8B8A\u63DB\u300D\u6703\u8B93\u9019\u500B\u4E3B\u984C\u8B8A\u5F97\u66F4\u6709\u8DA3\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .basis-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .bt { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .grid-svg { width: 100%; max-width: 320px; }
    .pt-label { font-size: 12px; font-weight: 700; fill: var(--accent); font-family: 'Noto Sans Math', serif; }

    .coords-display { padding: 12px 16px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); }
    .cd-l { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .cd-formula { font-size: 16px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      color: var(--text); margin: 6px 0; text-align: center; }
    .c1, .b1 { color: var(--v0); }
    .c2, .b2 { color: var(--v1); }
    .cd-coord { font-size: 14px; font-weight: 700; color: var(--accent); text-align: center;
      font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; }
    .cd-desc { font-size: 12px; color: var(--text-muted); text-align: center; }
  `,
})
export class StepBasisComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly basisLineRange = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  readonly bases = BASES;
  readonly sel = signal(0);
  readonly current = computed(() => this.bases[this.sel()]);

  // Fixed target point P in absolute coordinates
  readonly targetX = 50;
  readonly targetY = 30;

  // Solve for c1, c2 such that c1*b1 + c2*b2 = P
  readonly coords = computed(() => {
    const b = this.current();
    const det = b.b1x * b.b2y - b.b1y * b.b2x;
    if (Math.abs(det) < 1e-9) return { c1: 0, c2: 0 };
    const c1 = (this.targetX * b.b2y - this.targetY * b.b2x) / det;
    const c2 = (b.b1x * this.targetY - b.b1y * this.targetX) / det;
    return { c1, c2 };
  });
}
