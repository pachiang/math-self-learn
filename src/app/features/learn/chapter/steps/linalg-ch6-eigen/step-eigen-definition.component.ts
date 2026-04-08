import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Example { name: string; A: number[][]; v: [number, number]; lambda: number; desc: string; }

const EXAMPLES: Example[] = [
  { name: '\u62C9\u9577\uFF1A\u03BB = 3', A: [[2, 1], [1, 2]], v: [1, 1], lambda: 3,
    desc: 'v = (1, 1) \u88AB\u62C9\u9577\u70BA 3 \u500D' },
  { name: '\u4E0D\u8B8A\uFF1A\u03BB = 1', A: [[2, 1], [1, 2]], v: [1, -1], lambda: 1,
    desc: 'v = (1, -1) \u9577\u5EA6\u4E0D\u8B8A' },
  { name: '\u53CD\u5411\uFF1A\u03BB = -1', A: [[0, 1], [1, 0]], v: [1, -1], lambda: -1,
    desc: '\u93E1\u5C04\uFF1Av = (1, -1) \u88AB\u7FFB\u8F49 \u2192 \u03BB = -1' },
  { name: '\u7E2E\u5C0F\uFF1A\u03BB = 0.5', A: [[0.5, 0], [0, 0.5]], v: [2, 1], lambda: 0.5,
    desc: '\u4EFB\u4F55\u5411\u91CF\u90FD\u662F\u7279\u5FB5\u5411\u91CF\uFF08\u3014\u7E2E\u5C0F\u8B8A\u63DB\uFF09' },
];

@Component({
  selector: 'app-step-eigen-definition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7279\u5FB5\u5411\u91CF\u7684\u5B9A\u7FA9" subtitle="\u00A76.2">
      <p>
        \u4E0A\u4E00\u7BC0\u7684\u300C\u4E0D\u88AB\u8F49\u7684\u65B9\u5411\u300D\uFF0C\u6B63\u5F0F\u5BEB\u51FA\u4F86\u662F\uFF1A
      </p>
      <p class="formula">A v = \u03BB v</p>
      <p>
        \u9019\u500B\u516C\u5F0F\u8AAA\uFF1A\u300C\u628A A \u4F5C\u7528\u5728 v \u4E0A\uFF0C\u7B49\u65BC\u5C07 v \u62C9\u9577 \u03BB \u500D\u300D\u3002
      </p>
      <ul>
        <li><strong>v</strong> \u4E0D\u662F\u96F6\u5411\u91CF\uFF0C\u662F<strong>\u7279\u5FB5\u5411\u91CF</strong>\uFF08eigenvector\uFF09</li>
        <li><strong>\u03BB</strong> \u662F\u4E00\u500B\u6578\uFF0C\u662F\u9019\u500B\u7279\u5FB5\u5411\u91CF\u5C0D\u61C9\u7684<strong>\u7279\u5FB5\u503C</strong>\uFF08eigenvalue\uFF09</li>
        <li>\u03BB > 0\uFF1A\u540C\u5411\uFF1B\u03BB < 0\uFF1A\u53CD\u5411\uFF1B|\u03BB| > 1\uFF1A\u62C9\u9577\uFF1B|\u03BB| < 1\uFF1A\u7E2E\u77ED</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u4F8B\u5B50\uFF0C\u770B\u7279\u5FB5\u5411\u91CF\u8DDF\u8457 \u03BB \u88AB\u62C9\u9577\u7684\u6E1B\u753B">
      <div class="ex-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="et" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
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

          <!-- The eigenvector line (extended through origin) -->
          <line [attr.x1]="-current().v[0] * 120" [attr.y1]="current().v[1] * 120"
            [attr.x2]="current().v[0] * 120" [attr.y2]="-current().v[1] * 120"
            stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6" />

          <!-- v -->
          <line x1="0" y1="0" [attr.x2]="current().v[0] * 25" [attr.y2]="-current().v[1] * 25"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-edv)" />
          <text [attr.x]="current().v[0] * 25 + 8" [attr.y]="-current().v[1] * 25 - 4" class="lab" style="fill: var(--v0)">v</text>

          <!-- Av = λv -->
          <line x1="0" y1="0"
            [attr.x2]="current().lambda * current().v[0] * 25"
            [attr.y2]="-current().lambda * current().v[1] * 25"
            stroke="#5a8a5a" stroke-width="3" marker-end="url(#tip-edav)" />
          <text [attr.x]="current().lambda * current().v[0] * 25 + 8"
            [attr.y]="-current().lambda * current().v[1] * 25 - 4"
            class="lab" style="fill: #5a8a5a">Av = \u03BBv</text>

          <defs>
            <marker id="tip-edv" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-edav" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="#5a8a5a" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="formula-display">
        <div class="fd-row">
          <span class="fd-l">A</span>
          <span class="fd-r">[[{{ current().A[0][0] }}, {{ current().A[0][1] }}], [{{ current().A[1][0] }}, {{ current().A[1][1] }}]]</span>
        </div>
        <div class="fd-row">
          <span class="fd-l">v</span>
          <span class="fd-r">({{ current().v[0] }}, {{ current().v[1] }})</span>
        </div>
        <div class="fd-row">
          <span class="fd-l">Av</span>
          <span class="fd-r">({{ current().A[0][0] * current().v[0] + current().A[0][1] * current().v[1] }},
            {{ current().A[1][0] * current().v[0] + current().A[1][1] * current().v[1] }})</span>
        </div>
        <div class="fd-row big">
          <span class="fd-l">\u03BB</span>
          <span class="fd-r"><strong>{{ current().lambda }}</strong></span>
        </div>
      </div>

      <div class="msg">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u6CE8\u610F\uFF1AAv \u8DDF v <strong>\u59CB\u7D42\u5728\u540C\u4E00\u689D\u7DDA\u4E0A</strong>\uFF0C\u53EA\u662F\u9577\u5EA6\u4E0D\u540C\u3002\u9019\u5C31\u662F\u7279\u5FB5\u5411\u91CF\u7684\u672C\u8CEA\u3002
      </p>
      <span class="hint">
        \u4E0B\u4E00\u500B\u554F\u984C\uFF1A<strong>\u600E\u9EBC\u8A08\u7B97</strong>\u7279\u5FB5\u503C\uFF1F\u4E0B\u4E00\u7BC0\u770B\u300C\u7279\u5FB5\u65B9\u7A0B\u300D\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 22px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0; }
    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .et { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .lab { font-size: 12px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .formula-display { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .fd-row { display: grid; grid-template-columns: 60px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .fd-l { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .fd-r { padding: 7px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .fd-r strong { color: var(--accent); font-size: 16px; }

    .msg { padding: 10px 14px; border-radius: 6px; background: var(--bg-surface);
      font-size: 12px; color: var(--text-secondary); text-align: center; }
  `,
})
export class StepEigenDefinitionComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly current = computed(() => this.examples[this.sel()]);
}
