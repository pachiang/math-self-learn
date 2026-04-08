import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Step { desc: string; matrix: number[][]; }

@Component({
  selector: 'app-step-elimination',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u9AD8\u65AF\u6D88\u53BB\u6CD5" subtitle="\u00A74.3">
      <p>
        \u89E3\u4EFB\u610F\u65B9\u7A0B\u7D44\u7684\u6A19\u6E96\u6F14\u7B97\u6CD5\u662F<strong>\u9AD8\u65AF\u6D88\u53BB\u6CD5</strong>\uFF08Gaussian elimination\uFF09\u3002
        \u95DC\u9375\u89C0\u5BDF\uFF1A\u4E0B\u9762\u4E09\u7A2E\u300C\u5217\u904B\u7B97\u300D\u4E0D\u6703\u6539\u8B8A\u65B9\u7A0B\u7D44\u7684\u89E3\u3002
      </p>
      <ul>
        <li><strong>\u4EA4\u63DB\u5169\u5217</strong>\uFF1A\u53EA\u662F\u5BEB\u4E0B\u4F86\u7684\u9806\u5E8F\u8B8A\u4E86\uFF0C\u65B9\u7A0B\u672C\u8EAB\u4E0D\u8B8A</li>
        <li><strong>\u4E58\u4EE5\u975E\u96F6\u5E38\u6578</strong>\uFF1A\u4E58 2 \u8DDF\u9664\u4EE5 2 \u53EF\u4EE5\u9006\u8B8A\u56DE\u4F86</li>
        <li><strong>\u4E00\u5217\u52A0\u4E0A\u53E6\u4E00\u5217\u7684\u500D\u6578</strong>\uFF1A\u53EF\u9006</li>
      </ul>
      <p>
        \u76EE\u6A19\uFF1A\u900F\u904E\u9019\u4E9B\u904B\u7B97\u628A\u77E9\u9663\u6574\u7406\u6210<strong>\u9621\u72C0\u5F62\u5F0F</strong>\uFF08\u4E0A\u4E09\u89D2\uFF09\uFF0C\u63A5\u8457\u5C31\u80FD\u4E00\u9805\u4E00\u9805\u56DE\u4EE3\u51FA\u89E3\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9EDE\u300C\u4E0B\u4E00\u6B65\u300D\u770B\u6BCF\u6B65\u600E\u9EBC\u6D88\u53BB\u4E00\u500B\u4F4D\u7F6E\u7684\u5143\u7D20">
      <div class="step-display">
        <div class="step-num">\u6B65\u9A5F {{ stepIdx() + 1 }} / {{ steps.length }}</div>
        <div class="step-desc">{{ steps[stepIdx()].desc }}</div>
      </div>

      <!-- Matrix display -->
      <div class="matrix-wrap">
        <div class="bracket">[</div>
        <div class="mat">
          @for (row of steps[stepIdx()].matrix; track $index) {
            <div class="mr">
              @for (val of row; track $index; let last = $last) {
                <span class="cell" [class.augmented]="last">{{ val.toFixed(2) }}</span>
              }
            </div>
          }
        </div>
        <div class="bracket">]</div>
      </div>

      <div class="btn-row">
        <button class="btn" (click)="prev()" [disabled]="stepIdx() === 0">\u2190 \u4E0A\u4E00\u6B65</button>
        <button class="btn primary" (click)="next()" [disabled]="stepIdx() === steps.length - 1">\u4E0B\u4E00\u6B65 \u2192</button>
        <button class="btn" (click)="reset()">\u91CD\u7F6E</button>
      </div>

      @if (stepIdx() === steps.length - 1) {
        <div class="result">
          \u56DE\u4EE3\u5F97 (x, y, z) = <strong>(1, 2, -1)</strong>
          <div class="sub">\u5F9E\u6700\u5F8C\u4E00\u5217\u958B\u59CB\u5F80\u4E0A\u63A8\uFF1Az = -1 \u2192 y = 2 \u2192 x = 1</div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9AD8\u65AF\u6D88\u53BB\u6CD5\u7684\u6BCF\u4E00\u6B65\u90FD\u662F\u5728\u300C\u88FD\u9020\u96F6\u300D\uFF1A\u6BCF\u6B21\u6D88\u53BB\u4E00\u500B\u4F4D\u7F6E\u7684\u975E\u96F6\u5143\u7D20\u3002
        \u51E0\u6B21\u4E4B\u5F8C\u77E9\u9663\u8B8A\u6210\u4E0A\u4E09\u89D2\uFF0C\u63A5\u8457\u53EA\u8981\u300C\u56DE\u4EE3\u300D\u5C31\u80FD\u4E00\u500B\u4E00\u500B\u51FA\u89E3\u3002
      </p>
      <span class="hint">
        \u96FB\u8166\u5BE6\u969B\u4E0A\u89E3 Ax = b \u6642\u4F7F\u7528\u7684\u5C31\u662F\u9019\u500B\u6F14\u7B97\u6CD5\uFF08\u52A0\u4E0A\u6E2C\u5C0E\u985E\u7684\u6280\u5DE7\uFF09\u3002
        \u4E0D\u662F\u770B\u8D77\u4F86\u4E5F\u5F88\u5C0D\u4E2D\u7684\u300C\u4EE3\u5165\u6D88\u53BB\u300D\uFF1F
      </span>
    </app-prose-block>
  `,
  styles: `
    .step-display { text-align: center; margin-bottom: 14px; padding: 10px;
      background: var(--accent-10); border-radius: 8px; }
    .step-num { font-size: 11px; color: var(--text-muted); font-weight: 600; }
    .step-desc { font-size: 14px; color: var(--text); font-weight: 600; margin-top: 4px; }

    .matrix-wrap { display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 16px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 14px; }
    .bracket { font-size: 60px; font-weight: 200; color: var(--text-muted); line-height: 0.9; }
    .mat { display: flex; flex-direction: column; gap: 6px; padding: 4px 6px; }
    .mr { display: flex; gap: 8px; }
    .cell { min-width: 50px; padding: 6px 10px; text-align: center;
      font-size: 14px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      background: var(--bg-surface); border-radius: 4px; color: var(--text);
      &.augmented { background: var(--accent-10); color: var(--accent); border-left: 2px solid var(--accent); margin-left: 8px; } }

    .btn-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; }
    .btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer; transition: all 0.12s;
      &:hover:not(:disabled) { background: var(--accent-10); border-color: var(--accent-30); }
      &:disabled { opacity: 0.4; cursor: default; }
      &.primary { background: var(--accent-10); border-color: var(--accent-30); color: var(--accent); font-weight: 600; } }

    .result { padding: 14px 18px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); text-align: center; }
    .result strong { font-size: 18px; color: var(--accent); }
    .result .sub { font-size: 12px; color: var(--text-secondary); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepEliminationComponent {
  // Solving (answer: x=1, y=2, z=-1):
  //   x +  y +  z =  2
  //  2x +  y +  z =  3
  //   x + 2y +  z =  4
  readonly steps: Step[] = [
    {
      desc: '\u539F\u59CB\u589E\u5EE3\u77E9\u9663',
      matrix: [
        [1, 1, 1, 2],
        [2, 1, 1, 3],
        [1, 2, 1, 4],
      ],
    },
    {
      desc: 'R\u2082 \u2190 R\u2082 \u2212 2R\u2081\uFF08\u6D88\u53BB R\u2082 \u7B2C\u4E00\u500B\u5143\u7D20\uFF09',
      matrix: [
        [1, 1, 1, 2],
        [0, -1, -1, -1],
        [1, 2, 1, 4],
      ],
    },
    {
      desc: 'R\u2083 \u2190 R\u2083 \u2212 R\u2081\uFF08\u6D88\u53BB R\u2083 \u7B2C\u4E00\u500B\u5143\u7D20\uFF09',
      matrix: [
        [1, 1, 1, 2],
        [0, -1, -1, -1],
        [0, 1, 0, 2],
      ],
    },
    {
      desc: 'R\u2083 \u2190 R\u2083 + R\u2082\uFF08\u6D88\u53BB R\u2083 \u7B2C\u4E8C\u500B\u5143\u7D20\uFF09',
      matrix: [
        [1, 1, 1, 2],
        [0, -1, -1, -1],
        [0, 0, -1, 1],
      ],
    },
    {
      desc: 'R\u2082 \u2190 \u2212R\u2082\u3001R\u2083 \u2190 \u2212R\u2083\uFF08\u4FBF\u65BC\u56DE\u4EE3\uFF09',
      matrix: [
        [1, 1, 1, 2],
        [0, 1, 1, 1],
        [0, 0, 1, -1],
      ],
    },
  ];

  readonly stepIdx = signal(0);

  next(): void { if (this.stepIdx() < this.steps.length - 1) this.stepIdx.update((i) => i + 1); }
  prev(): void { if (this.stepIdx() > 0) this.stepIdx.update((i) => i - 1); }
  reset(): void { this.stepIdx.set(0); }
}
