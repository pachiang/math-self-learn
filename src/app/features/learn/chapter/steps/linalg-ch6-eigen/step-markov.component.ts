import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-markov',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u61C9\u7528\uFF1A\u99AC\u53EF\u592B\u93C8\u7A69\u614B" subtitle="\u00A76.6">
      <p>
        \u8003\u616E\u4E00\u500B\u300C\u72C0\u614B\u9593\u96A8\u6A5F\u8F49\u63DB\u300D\u7684\u7CFB\u7D71\uFF1A\u4E09\u500B\u72C0\u614B A\u3001B\u3001C\uFF0C
        \u6BCF\u500B\u6642\u9593\u6B65\u4F60\u53EF\u80FD\u5F9E\u4E00\u500B\u72C0\u614B\u8DF3\u5230\u53E6\u4E00\u500B\u3002
      </p>
      <p>
        \u300C\u9577\u671F\u4E0B\u4F60\u5728\u54EA\u500B\u72C0\u614B\u300D\u7684\u6A5F\u7387\u5206\u4F48\uFF0C\u5C31\u662F\u8F49\u63DB\u77E9\u9663\u7684
        <strong>\u7279\u5FB5\u503C 1 \u7684\u7279\u5FB5\u5411\u91CF</strong>\u3002
      </p>
      <p>
        \u70BA\u4EC0\u9EBC\uFF1F\u56E0\u70BA\u300C\u7A69\u614B\u300D\u610F\u601D\u662F\u300C\u518D\u4E58\u4E00\u6B21 M \u9084\u662F\u4E00\u6A23\u300D\u2014\u4E5F\u5C31\u662F Mp = p\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u6309\u300C\u4E0B\u4E00\u6B65\u300D\u770B\u5206\u4F48\u600E\u9EBC\u6F38\u6F38\u8B8A\u6210\u7A69\u614B">
      <div class="bars">
        @for (s of states; track s.name; let i = $index) {
          <div class="bar-row">
            <span class="bar-name">{{ s.name }}</span>
            <div class="bar-track">
              <div class="bar-fill"
                [style.width.%]="dist()[i] * 100"
                [style.background]="s.color"></div>
            </div>
            <span class="bar-val">{{ (dist()[i] * 100).toFixed(1) }}%</span>
          </div>
        }
      </div>

      <div class="step-info">
        \u6B65\u9A5F {{ step() }}
      </div>

      <div class="btn-row">
        <button class="btn primary" (click)="next()">\u4E0B\u4E00\u6B65 \u2192</button>
        <button class="btn" (click)="run10()">\u8DF3 10 \u6B65</button>
        <button class="btn" (click)="reset()">\u91CD\u7F6E</button>
      </div>

      <div class="trans-display">
        <div class="td-title">\u8F49\u63DB\u77E9\u9663 M\uFF1A</div>
        <div class="td-mat">
          <table>
            <tr><td></td><td class="head">\u2190 A</td><td class="head">\u2190 B</td><td class="head">\u2190 C</td></tr>
            <tr><td class="head">\u5230 A</td><td>0.7</td><td>0.2</td><td>0.1</td></tr>
            <tr><td class="head">\u5230 B</td><td>0.2</td><td>0.6</td><td>0.3</td></tr>
            <tr><td class="head">\u5230 C</td><td>0.1</td><td>0.2</td><td>0.6</td></tr>
          </table>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4E0D\u7BA1\u4E00\u958B\u59CB\u5728\u54EA\u88E1\uFF0C\u8DF3\u591A\u6B65\u4E4B\u5F8C\u90FD\u6703\u6536\u6582\u5230\u540C\u4E00\u500B<strong>\u7A69\u614B\u5206\u4F48</strong>\u3002
      </p>
      <p>
        \u9019\u500B\u7A69\u614B\u5206\u4F48\u662F M \u7684\u7279\u5FB5\u503C 1 \u7684\u7279\u5FB5\u5411\u91CF\uFF08\u4E26\u6B78\u4E00\u5316\u70BA\u6A5F\u7387\u5206\u4F48\uFF09\u3002
      </p>
      <span class="hint">
        \u6709\u540D\u7684 PageRank \u6F14\u7B97\u6CD5\u5C31\u662F\u9019\u500B\u539F\u7406\uFF1A\u628A\u7DB2\u8DEF\u770B\u6210\u4E00\u500B\u99AC\u53EF\u592B\u93C8\uFF0C
        \u6BCF\u500B\u7DB2\u9801\u7684 PageRank = \u8F49\u63DB\u77E9\u9663\u7684 \u03BB=1 \u7279\u5FB5\u5411\u91CF\u7684\u5206\u91CF\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .bars { display: flex; flex-direction: column; gap: 10px; padding: 14px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); margin-bottom: 12px; }
    .bar-row { display: flex; align-items: center; gap: 10px; }
    .bar-name { font-size: 14px; font-weight: 700; min-width: 24px;
      font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .bar-track { flex: 1; height: 24px; border-radius: 4px; background: var(--bg); overflow: hidden; }
    .bar-fill { height: 100%; transition: width 0.5s ease, background 0.3s; border-radius: 4px; }
    .bar-val { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 50px; text-align: right; }

    .step-info { text-align: center; font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }

    .btn-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap; }
    .btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.primary { background: var(--accent-10); border-color: var(--accent-30); color: var(--accent); font-weight: 600; } }

    .trans-display { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .td-title { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
    .td-mat { display: flex; justify-content: center; }
    .td-mat table { border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .td-mat td { padding: 5px 12px; text-align: center; color: var(--text); }
    .td-mat td.head { color: var(--text-muted); font-weight: 600; font-size: 11px; }
  `,
})
export class StepMarkovComponent {
  // Transition matrix M[to][from]
  private readonly M = [
    [0.7, 0.2, 0.1],
    [0.2, 0.6, 0.3],
    [0.1, 0.2, 0.6],
  ];

  readonly states = [
    { name: 'A', color: 'var(--v0)' },
    { name: 'B', color: 'var(--v1)' },
    { name: 'C', color: 'var(--v2)' },
  ];

  readonly dist = signal([1, 0, 0]);
  readonly step = signal(0);

  next(): void {
    const d = this.dist();
    const next = [
      this.M[0][0] * d[0] + this.M[0][1] * d[1] + this.M[0][2] * d[2],
      this.M[1][0] * d[0] + this.M[1][1] * d[1] + this.M[1][2] * d[2],
      this.M[2][0] * d[0] + this.M[2][1] * d[1] + this.M[2][2] * d[2],
    ];
    this.dist.set(next);
    this.step.update((s) => s + 1);
  }

  run10(): void {
    for (let i = 0; i < 10; i++) this.next();
  }

  reset(): void {
    this.dist.set([1, 0, 0]);
    this.step.set(0);
  }
}
