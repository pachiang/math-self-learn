import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-two-lines',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5169\u689D\u76F4\u7DDA\u7684\u4EA4\u9EDE" subtitle="\u00A74.1">
      <p>
        \u9AD8\u4E2D\u770B\u5230\u9019\u7A2E\u65B9\u7A0B\u7D44\u6642\uFF0C\u4F60\u5DF2\u7D93\u662F\u5728\u89E3\u7DDA\u6027\u4EE3\u6578\u4E86\uFF1A
      </p>
      <p class="formula">
        ax + by = e<br/>
        cx + dy = f
      </p>
      <p>
        \u6BCF\u4E00\u689D\u65B9\u7A0B\u5728\u5E73\u9762\u4E0A\u90FD\u662F\u4E00\u689D<strong>\u76F4\u7DDA</strong>\u3002\u5169\u689D\u76F4\u7DDA\u7684\u300C\u540C\u6642\u6EFF\u8DB3\u300D\u5C31\u662F\u5B83\u5011\u7684<strong>\u4EA4\u9EDE</strong>\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u8ABF\u6574\u4FC2\u6578\uFF0C\u770B\u4E09\u7A2E\u53EF\u80FD\u7684\u60C5\u6CC1\uFF1A\u552F\u4E00\u4EA4\u9EDE\u3001\u4E0D\u76F8\u4EA4\u3001\u91CD\u5408">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Line 1: ax + by = e → endpoints computed at x=±10 grid units -->
          <line [attr.x1]="line1()[0][0]" [attr.y1]="line1()[0][1]"
            [attr.x2]="line1()[1][0]" [attr.y2]="line1()[1][1]"
            stroke="var(--v0)" stroke-width="2.5" />
          <text x="-105" y="-110" class="line-tag" style="fill: var(--v0)">L\u2081</text>

          <!-- Line 2 -->
          <line [attr.x1]="line2()[0][0]" [attr.y1]="line2()[0][1]"
            [attr.x2]="line2()[1][0]" [attr.y2]="line2()[1][1]"
            stroke="var(--v1)" stroke-width="2.5" />
          <text x="-90" y="-110" class="line-tag" style="fill: var(--v1)">L\u2082</text>

          <!-- Intersection point -->
          @if (state() === 'unique') {
            <circle [attr.cx]="solution()![0] * 25" [attr.cy]="-solution()![1] * 25" r="6"
              fill="var(--accent)" stroke="white" stroke-width="2" />
          }
        </svg>
      </div>

      <!-- Show the equations -->
      <div class="equations">
        <div class="eq">
          <span class="eq-l1">{{ a() }}x + {{ b() }}y = {{ e() }}</span>
        </div>
        <div class="eq">
          <span class="eq-l2">{{ c() }}x + {{ d() }}y = {{ f() }}</span>
        </div>
      </div>

      <!-- Sliders -->
      <div class="sliders">
        <div class="row-pair">
          <div class="sl"><span class="sl-lab l1">a</span>
            <input type="range" min="-3" max="3" step="0.5" [value]="a()" (input)="a.set(+$any($event).target.value)" />
            <span class="sl-val">{{ a() }}</span></div>
          <div class="sl"><span class="sl-lab l1">b</span>
            <input type="range" min="-3" max="3" step="0.5" [value]="b()" (input)="b.set(+$any($event).target.value)" />
            <span class="sl-val">{{ b() }}</span></div>
          <div class="sl"><span class="sl-lab l1">e</span>
            <input type="range" min="-5" max="5" step="0.5" [value]="e()" (input)="e.set(+$any($event).target.value)" />
            <span class="sl-val">{{ e() }}</span></div>
        </div>
        <div class="row-pair">
          <div class="sl"><span class="sl-lab l2">c</span>
            <input type="range" min="-3" max="3" step="0.5" [value]="c()" (input)="c.set(+$any($event).target.value)" />
            <span class="sl-val">{{ c() }}</span></div>
          <div class="sl"><span class="sl-lab l2">d</span>
            <input type="range" min="-3" max="3" step="0.5" [value]="d()" (input)="d.set(+$any($event).target.value)" />
            <span class="sl-val">{{ d() }}</span></div>
          <div class="sl"><span class="sl-lab l2">f</span>
            <input type="range" min="-5" max="5" step="0.5" [value]="f()" (input)="f.set(+$any($event).target.value)" />
            <span class="sl-val">{{ f() }}</span></div>
        </div>
      </div>

      <div class="verdict" [class.unique]="state() === 'unique'" [class.none]="state() === 'none'" [class.many]="state() === 'many'">
        @if (state() === 'unique') {
          <strong>\u552F\u4E00\u89E3</strong>\uFF1A(x, y) = ({{ solution()![0].toFixed(2) }}, {{ solution()![1].toFixed(2) }})
        } @else if (state() === 'none') {
          <strong>\u7121\u89E3</strong>\uFF1A\u5169\u689D\u76F4\u7DDA\u5E73\u884C\u4F46\u4E0D\u91CD\u5408
        } @else {
          <strong>\u7121\u7AAE\u591A\u89E3</strong>\uFF1A\u5169\u689D\u76F4\u7DDA\u5B8C\u5168\u91CD\u5408
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u5169\u500B\u672A\u77E5\u6578 + \u5169\u689D\u65B9\u7A0B\u53EA\u6709\u9019\u4E09\u7A2E\u60C5\u6CC1\u3002
        \u63A8\u5EE3\u5230 n \u500B\u672A\u77E5\u6578 + m \u689D\u65B9\u7A0B\u4E5F\u662F\u540C\u6A23\u7684\u4E09\u7A2E\u7D50\u679C\uFF0C\u53EA\u662F\u5E7E\u4F55\u756B\u9762\u8B8A\u6210\u9AD8\u7DAD\u3002
      </p>
      <span class="hint">
        \u4E0B\u4E00\u7BC0\u6211\u5011\u628A\u9019\u500B\u65B9\u7A0B\u7D44\u91CD\u5BEB\u6210<strong>\u77E9\u9663\u5F62\u5F0F</strong>\uFF0C
        \u4F60\u6703\u770B\u5230\u5B83\u8DDF\u300C\u627E\u4E00\u500B x \u8B93 Ax = b\u300D\u662F\u540C\u4E00\u4EF6\u4E8B\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 0; line-height: 1.8; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .line-tag { font-size: 12px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .equations { display: flex; flex-direction: column; gap: 4px; padding: 10px 14px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px;
      font-family: 'JetBrains Mono', monospace; font-size: 14px; text-align: center; }
    .eq-l1 { color: var(--v0); font-weight: 600; }
    .eq-l2 { color: var(--v1); font-weight: 600; }

    .sliders { display: flex; flex-direction: column; gap: 8px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .row-pair { display: flex; gap: 12px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 100px; }
    .sl-lab { font-size: 13px; font-weight: 700; min-width: 16px; font-family: 'JetBrains Mono', monospace;
      &.l1 { color: var(--v0); } &.l2 { color: var(--v1); } }
    .sl input { flex: 1; accent-color: var(--accent); min-width: 0; }
    .sl-val { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 28px; text-align: right; }

    .verdict { padding: 14px 18px; border-radius: 10px; border: 2px solid;
      font-size: 13px; text-align: center; line-height: 1.6;
      strong { font-size: 15px; }
      &.unique { border-color: var(--accent); background: var(--accent-10); }
      &.unique strong { color: var(--accent); }
      &.none { border-color: #a05a5a; background: rgba(160,90,90,0.06); }
      &.none strong { color: #a05a5a; }
      &.many { border-color: #d4a14b; background: rgba(212,161,75,0.06); }
      &.many strong { color: #d4a14b; } }
  `,
})
export class StepTwoLinesComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // System: ax + by = e, cx + dy = f
  readonly a = signal(1);
  readonly b = signal(1);
  readonly e = signal(3);
  readonly c = signal(2);
  readonly d = signal(-1);
  readonly f = signal(0);

  readonly det = computed(() => this.a() * this.d() - this.b() * this.c());

  // Solve via Cramer's rule
  readonly solution = computed(() => {
    const D = this.det();
    if (Math.abs(D) < 1e-9) return null;
    const x = (this.e() * this.d() - this.b() * this.f()) / D;
    const y = (this.a() * this.f() - this.e() * this.c()) / D;
    return [x, y];
  });

  // Determine state: unique / none / many
  readonly state = computed<'unique' | 'none' | 'many'>(() => {
    if (Math.abs(this.det()) > 1e-9) return 'unique';
    // Det = 0 → lines are parallel. Check if they coincide.
    // L₁ and L₂ are scalar multiples of each other on the LHS.
    // Find scaling factor k such that c = k·a, d = k·b
    let k: number | null = null;
    if (Math.abs(this.a()) > 1e-9) k = this.c() / this.a();
    else if (Math.abs(this.b()) > 1e-9) k = this.d() / this.b();
    if (k === null) return 'none';
    // Check RHS: f should equal k·e
    if (Math.abs(this.f() - k * this.e()) < 1e-9) return 'many';
    return 'none';
  });

  // Compute line endpoints inside the visible area
  private lineSegment(A: number, B: number, E: number): number[][] {
    // Line: Ax + By = E. Try x = ±10 grid units, find y, then convert to SVG.
    if (Math.abs(B) > 1e-9) {
      const x1 = -10, y1 = (E - A * x1) / B;
      const x2 = 10, y2 = (E - A * x2) / B;
      return [[x1 * 25, -y1 * 25], [x2 * 25, -y2 * 25]];
    }
    if (Math.abs(A) > 1e-9) {
      // Vertical line: x = E/A
      const x = E / A;
      return [[x * 25, -10 * 25], [x * 25, 10 * 25]];
    }
    // Degenerate: 0=E. Hide line by overlapping points.
    return [[0, 0], [0, 0]];
  }

  readonly line1 = computed(() => this.lineSegment(this.a(), this.b(), this.e()));
  readonly line2 = computed(() => this.lineSegment(this.c(), this.d(), this.f()));
}
