import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Case { name: string; A: number[][]; b: number[]; verdict: 'unique' | 'none' | 'many'; desc: string; }

const CASES: Case[] = [
  {
    name: '\u552F\u4E00\u89E3',
    A: [[2, 1], [1, -1]],
    b: [4, 1],
    verdict: 'unique',
    desc: '\u4E24\u689D\u76F4\u7DDA\u6709\u5168\u4E0D\u540C\u7684\u659C\u7387\uFF0Cdet \u2260 0\uFF0C\u4EA4\u65BC\u4E00\u9EDE\u3002',
  },
  {
    name: '\u7121\u89E3',
    A: [[1, 2], [2, 4]],
    b: [3, 5],
    verdict: 'none',
    desc: '\u5169\u689D\u76F4\u7DDA\u659C\u7387\u76F8\u540C\u4F46 b \u4E0D\u4E00\u81F4 \u2192 \u5E73\u884C\u4F46\u4E0D\u91CD\u5408\u3002',
  },
  {
    name: '\u7121\u7AAE\u591A\u89E3',
    A: [[1, 2], [2, 4]],
    b: [3, 6],
    verdict: 'many',
    desc: '\u7B2C\u4E8C\u689D\u65B9\u7A0B\u662F\u7B2C\u4E00\u689D\u7684 2 \u500D \u2192 \u5169\u689D\u76F4\u7DDA\u91CD\u5408\u3002',
  },
];

@Component({
  selector: 'app-step-when-solvable',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4F55\u6642\u6709\u89E3" subtitle="\u00A74.4">
      <p>
        Ax = b \u4E0D\u4E00\u5B9A\u6709\u89E3\u3002\u9019\u4E0D\u662F\u6F14\u7B97\u6CD5\u7684\u932F\uFF0C\u662F\u4E8B\u5BE6\u3002\u4E09\u7A2E\u53EF\u80FD\u7684\u7D50\u679C\uFF1A
      </p>
      <ul>
        <li><strong>\u552F\u4E00\u89E3</strong>\uFF1Adet(A) \u2260 0\uFF0CA \u53EF\u9006</li>
        <li><strong>\u7121\u89E3</strong>\uFF1Ab \u4E0D\u5728 A \u7684\u5217\u7A7A\u9593\u88E1</li>
        <li><strong>\u7121\u7AAE\u591A\u89E3</strong>\uFF1Ab \u5728\u5217\u7A7A\u9593\u88E1\uFF0C\u4F46 A \u7684\u5217\u7DDA\u6027\u76F8\u4F9D</li>
      </ul>
      <p>
        \u300C\u5217\u7A7A\u9593\u300D\u53EF\u4EE5\u60F3\u6210\u300CA \u7684\u6240\u6709\u53EF\u80FD\u8F38\u51FA\u300D\u3002
        \u5982\u679C b \u4E0D\u5728\u9019\u500B\u96C6\u5408\u4E2D\uFF0C\u90A3\u5C31\u6C92\u6709\u4EFB\u4F55 x \u80FD\u8B93 Ax = b\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u4F8B\u5B50\uFF0C\u770B\u5169\u689D\u76F4\u7DDA\u8DDF\u89E3\u7684\u95DC\u4FC2">
      <div class="case-tabs">
        @for (c of cases; track c.name; let i = $index) {
          <button class="ct" [class.active]="sel() === i" (click)="sel.set(i)"
            [class.unique]="c.verdict === 'unique'"
            [class.none]="c.verdict === 'none'"
            [class.many]="c.verdict === 'many'">{{ c.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Line 1 -->
          <line [attr.x1]="line1()[0][0]" [attr.y1]="line1()[0][1]"
            [attr.x2]="line1()[1][0]" [attr.y2]="line1()[1][1]"
            stroke="var(--v0)" stroke-width="2.5" />

          <!-- Line 2 -->
          <line [attr.x1]="line2()[0][0]" [attr.y1]="line2()[0][1]"
            [attr.x2]="line2()[1][0]" [attr.y2]="line2()[1][1]"
            stroke="var(--v1)" stroke-width="2.5" stroke-dasharray="0"
            [attr.opacity]="current().verdict === 'many' ? 0.55 : 1" />

          <!-- Solution point if unique -->
          @if (current().verdict === 'unique') {
            <circle [attr.cx]="solution()![0] * 25" [attr.cy]="-solution()![1] * 25" r="6"
              fill="var(--accent)" stroke="white" stroke-width="2" />
          }
        </svg>
      </div>

      <div class="system-mini">
        <div class="row">{{ current().A[0][0] }}x + {{ current().A[0][1] }}y = {{ current().b[0] }}</div>
        <div class="row">{{ current().A[1][0] }}x + {{ current().A[1][1] }}y = {{ current().b[1] }}</div>
      </div>

      <div class="verdict" [class.unique]="current().verdict === 'unique'"
        [class.none]="current().verdict === 'none'"
        [class.many]="current().verdict === 'many'">
        <strong>{{ current().name }}</strong>
        <div class="v-desc">{{ current().desc }}</div>
        <div class="det-info">det(A) = {{ det() }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u4E09\u7A2E\u60C5\u6CC1\u5728 n \u7DAD\u4E5F\u540C\u6A23\u5B58\u5728\uFF0C\u53EA\u662F\u300C\u76F4\u7DDA\u300D\u8B8A\u6210\u300C\u8D85\u5E73\u9762\u300D\u3002
        \u95DC\u9375\u6307\u6A19\u9084\u662F det(A) \u8DDF rank(A) \u8207 rank([A | b]) \u662F\u5426\u76F8\u7B49\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .case-tabs { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .ct { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active.unique { background: var(--accent-18); border-color: var(--accent); font-weight: 600; }
      &.active.none { background: rgba(160,90,90,0.15); border-color: #a05a5a; font-weight: 600; }
      &.active.many { background: rgba(212,161,75,0.15); border-color: #d4a14b; font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }

    .system-mini { padding: 10px 16px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); margin-bottom: 12px; text-align: center;
      font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text); }
    .system-mini .row { padding: 2px 0; }

    .verdict { padding: 14px 18px; border-radius: 10px; border: 2px solid;
      &.unique { border-color: var(--accent); background: var(--accent-10); }
      &.unique strong { color: var(--accent); }
      &.none { border-color: #a05a5a; background: rgba(160,90,90,0.06); }
      &.none strong { color: #a05a5a; }
      &.many { border-color: #d4a14b; background: rgba(212,161,75,0.06); }
      &.many strong { color: #d4a14b; } }
    .v-desc { font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.5; }
    .det-info { font-size: 12px; color: var(--text-muted); margin-top: 4px;
      font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepWhenSolvableComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly cases = CASES;
  readonly sel = signal(0);
  readonly current = computed(() => this.cases[this.sel()]);

  readonly det = computed(() => {
    const A = this.current().A;
    return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  });

  readonly solution = computed(() => {
    const A = this.current().A, b = this.current().b;
    const D = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (Math.abs(D) < 1e-9) return null;
    return [(A[1][1] * b[0] - A[0][1] * b[1]) / D, (-A[1][0] * b[0] + A[0][0] * b[1]) / D];
  });

  private lineSegment(a: number, b: number, e: number): number[][] {
    if (Math.abs(b) > 1e-9) {
      const x1 = -10, y1 = (e - a * x1) / b;
      const x2 = 10, y2 = (e - a * x2) / b;
      return [[x1 * 25, -y1 * 25], [x2 * 25, -y2 * 25]];
    }
    if (Math.abs(a) > 1e-9) {
      const x = e / a;
      return [[x * 25, -250], [x * 25, 250]];
    }
    return [[0, 0], [0, 0]];
  }

  readonly line1 = computed(() => this.lineSegment(this.current().A[0][0], this.current().A[0][1], this.current().b[0]));
  readonly line2 = computed(() => this.lineSegment(this.current().A[1][0], this.current().A[1][1], this.current().b[1]));
}
