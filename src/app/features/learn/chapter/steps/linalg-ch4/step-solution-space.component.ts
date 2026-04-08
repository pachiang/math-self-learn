import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-solution-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u89E3\u7A7A\u9593\u7684\u7D50\u69CB" subtitle="\u00A74.5">
      <p>
        \u4E0A\u4E00\u7Bc0\u7684\u300C\u7121\u7AAE\u591A\u89E3\u300D\u770B\u8D77\u4F86\u5F88\u968F\u6027\uFF0C\u4F46\u5176\u5BE6\u9019\u4E9B\u89E3\u6709\u5B8C\u7F8E\u7684\u6578\u5B78\u7D50\u69CB\u3002
      </p>
      <p>
        <strong>\u9F4A\u6B21\u65B9\u7A0B</strong> Ax = 0 \u7684\u6240\u6709\u89E3\u69CB\u6210\u4E00\u500B<strong>\u5B50\u7A7A\u9593</strong>\uFF0C
        \u53EB\u505A A \u7684<strong>\u96F6\u7A7A\u9593</strong>\uFF08null space\uFF09\uFF0C\u53C8\u53EB <strong>\u6838</strong>\uFF08kernel\uFF09\u3002
      </p>
      <p>
        \u4E00\u822C Ax = b \u7684\u89E3\u53EF\u4EE5\u5BEB\u6210\uFF1A
      </p>
      <p class="formula">x = x_p + x_h</p>
      <p>
        \u5176\u4E2D x_p \u662F\u4EFB\u4E00\u500B<strong>\u7279\u89E3</strong>\u3001x_h \u662F\u9F4A\u6B21\u65B9\u7A0B\u7684\u4EFB\u4E00\u89E3\u3002
        \u300C\u4E00\u500B\u7279\u89E3 + \u96F6\u7A7A\u9593\u300D\u5C31\u662F\u5168\u90E8\u89E3\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 t \u770B\u9F4A\u6B21\u89E3 + \u7279\u89E3 = \u4EFB\u4F55\u89E3">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Null space line: through origin in direction (1, 1) math = (1, -1) SVG -->
          <line x1="-90" y1="90" x2="90" y2="-90" stroke="var(--v0)" stroke-width="2" stroke-dasharray="4 3" opacity="0.6" />
          <text x="-100" y="-95" class="lab" style="fill: var(--v0)">\u96F6\u7A7A\u9593\uFF1AAx = 0</text>

          <!-- Particular solution line: parallel, offset by x_p -->
          <line [attr.x1]="-90 + xpX * 25" [attr.y1]="90 - xpY * 25"
            [attr.x2]="90 + xpX * 25" [attr.y2]="-90 - xpY * 25"
            stroke="var(--accent)" stroke-width="2.5" />
          <text [attr.x]="80 + xpX * 25" [attr.y]="-85 - xpY * 25 + 14" class="lab" style="fill: var(--accent)">Ax = b</text>

          <!-- x_p (particular) -->
          <line x1="0" y1="0" [attr.x2]="xpX * 25" [attr.y2]="-xpY * 25"
            stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-ssp)" />
          <text [attr.x]="xpX * 25 + 8" [attr.y]="-xpY * 25 - 4" class="lab" style="fill: var(--v1)">x_p</text>

          <!-- x_h (homogeneous, varies with t) -->
          <line [attr.x1]="xpX * 25" [attr.y1]="-xpY * 25"
            [attr.x2]="xpX * 25 + t() * 25" [attr.y2]="-xpY * 25 - t() * 25"
            stroke="var(--v0)" stroke-width="2" marker-end="url(#tip-ssh)" />

          <!-- Final solution point -->
          <circle [attr.cx]="(xpX + t()) * 25" [attr.cy]="-(xpY + t()) * 25" r="6"
            fill="var(--accent)" stroke="white" stroke-width="2" />

          <defs>
            <marker id="tip-ssp" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
            <marker id="tip-ssh" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="t-row">
        <span class="t-lab">t =</span>
        <input type="range" min="-3" max="3" step="0.5" [value]="t()" (input)="t.set(+$any($event).target.value)" />
        <span class="t-val">{{ t() }}</span>
      </div>

      <div class="formula-block">
        x = x_p + t \u00B7 x_h<br/>
        = ({{ xpX }}, {{ xpY }}) + {{ t() }} \u00B7 (1, 1)<br/>
        = (<strong>{{ (xpX + t()).toFixed(1) }}</strong>, <strong>{{ (xpY + t()).toFixed(1) }}</strong>)
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u95DC\u9375\u89C0\u5BDF\uFF1A
      </p>
      <ul>
        <li>\u96F6\u7A7A\u9593\u662F\u4E00\u689D\u300C\u904E\u539F\u9EDE\u300D\u7684\u76F4\u7DDA\uFF08\u8A2A\u662F\u5B50\u7A7A\u9593\uFF09</li>
        <li>Ax = b \u7684\u89E3\u662F\u300C<strong>\u540C\u5169\u689D\u76F4\u7DDA\u4F46\u5E73\u79FB</strong>\u300D</li>
        <li>\u5E73\u79FB\u91CF = \u4EFB\u4E00\u500B\u7279\u89E3 x_p</li>
      </ul>
      <span class="hint">
        \u9019\u500B\u300C\u7279\u89E3 + \u96F6\u7A7A\u9593\u300D\u7684\u7D50\u69CB\u5728\u5FAE\u5206\u65B9\u7A0B\u88E1\u4E5F\u662F\u4E00\u6A23\u7684\uFF1A\u7279\u89E3 + \u9F4A\u6B21\u89E3 = \u4E00\u822C\u89E3\u3002
        \u9019\u662F\u300C\u7DDA\u6027\u300D\u9019\u500B\u6027\u8CEA\u7684\u5168\u9762\u5C55\u73FE\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 8px 0; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .lab { font-size: 11px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .t-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 14px; font-weight: 700; color: var(--v0); font-family: 'Noto Sans Math', serif; }
    .t-row input { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 32px; text-align: right; }

    .formula-block { padding: 12px 16px; border-radius: 8px; background: var(--accent-10);
      text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.8;
      color: var(--text-secondary); strong { color: var(--accent); font-size: 15px; } }
  `,
})
export class StepSolutionSpaceComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // System: x + y = 3, with null space spanned by (1, -1) (so any (3-t, t) for t)
  // Wait — we want the null space of A. Let me use A = [[1, 1], [1, 1]], b = [3, 3]
  // Then null space: x + y = 0, span by (1, -1)
  // Particular solution: (3, 0) or (0, 3) or (1.5, 1.5)
  // Actually, the geometry I drew has null space along (1, 1) direction...
  // Let me match: null space line goes from (-90,-90) to (90,90) which is along (1, -1) in math (since y is flipped)
  // Wait no, in SVG (-90,-90) is upper-left, (90,90) is lower-right, so direction is (1, 1) in SVG = (1, -1) in math
  // So null space direction is (1, -1) which means x_h is along (1, -1) — wait but my x_h drawing uses (t, t) in math
  // Let me re-examine. The x_h line:
  //   from (xpX * 25, -xpY * 25) to (xpX * 25 + t * 25, -xpY * 25 - t * 25)
  //   delta in SVG: (t * 25, -t * 25) → in math: (t, t) (with y flipped, +SVG y becomes -math y, so -t*25 SVG = +t math)
  // So x_h is in direction (1, 1) in math.
  //
  // But the null space LINE I drew goes from SVG (-90,-90) to (90,90), direction (1, 1) in SVG = (1, -1) in math.
  // INCONSISTENT!
  //
  // Let me fix: make the null space line go from SVG (-90, 90) to (90, -90), which is direction (1, -1) in SVG = (1, 1) in math.
  // That matches x_h direction (1, 1).

  readonly xpX = 1;
  readonly xpY = 2;
  readonly t = signal(1);
}
