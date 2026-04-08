import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { StepColumnSpace3DComponent } from './step-column-space-3d.component';

interface MatExample { name: string; A: number[][]; rank: number; desc: string; }

const EXAMPLES: MatExample[] = [
  {
    name: '\u4E0D\u5171\u7DDA\u7684\u5169\u6B04',
    A: [[2, 1], [1, 2]],
    rank: 2,
    desc: '\u5169\u500B\u6B04\u5411\u91CF\u7DDA\u6027\u7368\u7ACB\u2192 C(A) = \u6574\u500B \u211D\u00B2',
  },
  {
    name: '\u5171\u7DDA\u7684\u5169\u6B04',
    A: [[2, 4], [1, 2]],
    rank: 1,
    desc: '\u7B2C\u4E8C\u500B\u6B04 = 2\u00D7\u7B2C\u4E00\u500B\u2192 C(A) \u53EA\u662F\u4E00\u689D\u76F4\u7DDA',
  },
  {
    name: '\u96F6\u77E9\u9663',
    A: [[0, 0], [0, 0]],
    rank: 0,
    desc: '\u5169\u500B\u6B04\u90FD\u662F\u96F6\u2192 C(A) = {0}',
  },
];

@Component({
  selector: 'app-step-column-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, StepColumnSpace3DComponent],
  template: `
    <app-prose-block title="\u5217\u7A7A\u9593 C(A)" subtitle="\u00A75.2">
      <p>
        \u77E9\u9663 A \u7684<strong>\u5217\u7A7A\u9593</strong>\uFF08column space\uFF09\u8A18\u4F5C C(A)\uFF0C
        \u5B9A\u7FA9\u5C31\u662F\u300C<strong>A \u7684\u6240\u6709\u6B04\u5411\u91CF\u7684 span</strong>\u300D\u3002
      </p>
      <p>
        \u70BA\u4EC0\u9EBC\u9019\u500B\u96C6\u5408\u91CD\u8981\uFF1F\u56E0\u70BA\u5B83\u6B63\u597D\u662F\u300C<strong>A \u80FD\u8DD1\u5230\u54EA\u88E1</strong>\u300D\uFF1A
      </p>
      <p class="formula">C(A) = {{ '{' }} Ax : x \u662F\u4EFB\u610F\u5411\u91CF {{ '}' }}</p>
      <p>
        \u8B49\u660E\u5F88\u7C21\u55AE\uFF1AAx = \u6B04\u4E58\u4EE5 x \u7684\u5404\u5143\u7D20\u52A0\u8D77\u4F86\uFF08\u7B2C\u4E8C\u7AE0\uFF09\uFF0C\u9019\u5C31\u662F\u300C\u6B04\u7684\u7DDA\u6027\u7D44\u5408\u300D\uFF0C
        \u4E5F\u5C31\u662F span\u3002\u6240\u4EE5\uFF1A
      </p>
      <p class="formula highlight">Ax = b \u6709\u89E3 \u27FA b \u2208 C(A)</p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u77E9\u9663\uFF0C\u770B\u5B83\u7684\u5217\u7A7A\u9593">
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

          <!-- Column space visualisation -->
          @if (current().rank === 2) {
            <rect x="-100" y="-100" width="200" height="200" fill="var(--accent)" opacity="0.12" />
          }
          @if (current().rank === 1) {
            <line [attr.x1]="-current().A[0][0] * 50" [attr.y1]="current().A[1][0] * 50"
              [attr.x2]="current().A[0][0] * 50" [attr.y2]="-current().A[1][0] * 50"
              stroke="var(--accent)" stroke-width="6" opacity="0.35" />
          }
          @if (current().rank === 0) {
            <circle cx="0" cy="0" r="6" fill="var(--accent)" stroke="white" stroke-width="2" />
          }

          <!-- Column vectors -->
          <line x1="0" y1="0" [attr.x2]="current().A[0][0] * 25" [attr.y2]="-current().A[1][0] * 25"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-cs1)" />
          <text [attr.x]="current().A[0][0] * 25 + 8" [attr.y]="-current().A[1][0] * 25 - 4" class="lab" style="fill: var(--v0)">\u6B04\u2081</text>

          <line x1="0" y1="0" [attr.x2]="current().A[0][1] * 25" [attr.y2]="-current().A[1][1] * 25"
            stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-cs2)" />
          <text [attr.x]="current().A[0][1] * 25 + 8" [attr.y]="-current().A[1][1] * 25 - 4" class="lab" style="fill: var(--v1)">\u6B04\u2082</text>

          <defs>
            <marker id="tip-cs1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-cs2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ current().A[0][0] }}, {{ current().A[0][1] }}], [{{ current().A[1][0] }}, {{ current().A[1][1] }}]]</span>
        </div>
        <div class="info-row big">
          <span class="il">C(A)</span>
          <span class="iv">
            @if (current().rank === 2) { \u6574\u500B \u211D\u00B2\uFF08\u7DAD\u5EA6 2\uFF09 }
            @else if (current().rank === 1) { \u4E00\u689D\u904E\u539F\u9EDE\u7684\u76F4\u7DDA\uFF08\u7DAD\u5EA6 1\uFF09 }
            @else { \u53EA\u6709\u539F\u9EDE\uFF08\u7DAD\u5EA6 0\uFF09 }
          </span>
        </div>
      </div>

      <div class="explain">{{ current().desc }}</div>
    </app-challenge-card>

    <!-- 3D extension: rank 3 vs 2 vs 1 vs 0 visualised in ℝ³ -->
    <app-prose-block>
      <p>
        \u4E0A\u9762\u662F 2\u00D72 \u7684\u4F8B\u5B50\uFF0C\u53EA\u80FD\u770B\u5230 rank 0/1/2\u3002\u4F46\u5728 3D \u88E1\uFF0Crank 1\u30012\u30013 \u7684\u5DEE\u5225\u66F4\u52A0\u9BAE\u660E\uFF1A
      </p>
      <ul>
        <li><strong>rank 3</strong>\uFF1A\u5217\u7A7A\u9593\u586B\u6EFF\u6574\u500B \u211D\u00B3</li>
        <li><strong>rank 2</strong>\uFF1A\u5217\u7A7A\u9593\u662F\u4E00\u500B\u5E73\u9762</li>
        <li><strong>rank 1</strong>\uFF1A\u5217\u7A7A\u9593\u53EA\u662F\u4E00\u689D\u7DDA</li>
        <li><strong>rank 0</strong>\uFF1A\u53EA\u6709\u539F\u9EDE</li>
      </ul>
      <p>\u62D6\u62FD\u4E0B\u9762\u7684 3D \u5716\u4F86\u770B\uFF1A</p>
    </app-prose-block>

    <app-step-column-space-3d />

    <app-prose-block>
      <p>
        \u5217\u7A7A\u9593\u8DDF\u300CAx = b \u80FD\u4E0D\u80FD\u89E3\u300D\u662F<strong>\u540C\u4E00\u4EF6\u4E8B</strong>\u3002
        \u770B\u5230\u7B2C\u4E8C\u500B\u4F8B\u5B50 \u2014 C(A) \u53EA\u662F\u4E00\u689D\u7DDA\uFF0C\u6240\u4EE5\u53EA\u6709\u90A3\u689D\u7DDA\u4E0A\u7684 b \u624D\u6709\u89E3\uFF01
      </p>
      <span class="hint">
        \u4E0B\u4E00\u7BC0\u770B\u53E6\u4E00\u500B\u91CD\u8981\u7684\u5B50\u7A7A\u9593\uFF1A<strong>\u96F6\u7A7A\u9593</strong> N(A) \u2014 \u88AB A \u300C\u5854\u9677\u300D\u7684\u90A3\u4E9B\u5411\u91CF\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px; }
    .formula.highlight { background: var(--accent-10); border-radius: 8px; }

    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .et { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .lab { font-size: 11px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .explain { padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-size: 12px; color: var(--text-secondary); }
  `,
})
export class StepColumnSpaceComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly current = computed(() => this.examples[this.sel()]);
}
