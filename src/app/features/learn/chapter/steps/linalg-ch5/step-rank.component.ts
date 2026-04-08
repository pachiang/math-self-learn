import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface RankExample { name: string; A: number[][]; rank: number; nullDim: number; colDesc: string; nullDesc: string; }

const EXAMPLES: RankExample[] = [
  {
    name: 'rank 2',
    A: [[2, 1], [1, 2]],
    rank: 2,
    nullDim: 0,
    colDesc: '\u6574\u500B \u211D\u00B2',
    nullDesc: '\u53EA\u6709 {{ 0 }}',
  },
  {
    name: 'rank 1',
    A: [[2, 1], [4, 2]],
    rank: 1,
    nullDim: 1,
    colDesc: '\u4E00\u689D\u7DDA\uFF1Aspan((2, 4))',
    nullDesc: '\u4E00\u689D\u7DDA\uFF1Aspan((1, -2))',
  },
  {
    name: 'rank 0',
    A: [[0, 0], [0, 0]],
    rank: 0,
    nullDim: 2,
    colDesc: '\u53EA\u6709 {{ 0 }}',
    nullDesc: '\u6574\u500B \u211D\u00B2',
  },
];

@Component({
  selector: 'app-step-rank',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u79E9 Rank" subtitle="\u00A75.4">
      <p>
        \u77E9\u9663 A \u7684<strong>\u79E9</strong>\uFF08rank\uFF09\u662F\u5217\u7A7A\u9593\u7684\u7DAD\u5EA6\uFF0C\u4E5F\u5C31\u662F
        \u300C<strong>\u72E8\u7ACB\u6B04\u5411\u91CF\u7684\u500B\u6578</strong>\u300D\u3002
      </p>
      <p>
        \u4E00\u500B\u4EE4\u4EBA\u8A1D\u7570\u7684\u4E8B\u5BE6\u662F\uFF1A
      </p>
      <p class="formula">\u5217\u79E9 = \u884C\u79E9</p>
      <p>
        \u4E5F\u5C31\u662F\u300C\u72E8\u7ACB\u6B04\u7684\u500B\u6578 = \u72E8\u7ACB\u884C\u7684\u500B\u6578\u300D\u3002\u9019\u4E0D\u662F\u986F\u800C\u6613\u898B\u7684 \u2014 \u96A8\u4FBF\u5BEB\u4E0B\u4E00\u500B m\u00D7n \u77E9\u9663\uFF0C
        \u70BA\u4EC0\u9EBC\u300C\u5F9E\u6B04\u770B\u300D\u8DDF\u300C\u5F9E\u884C\u770B\u300D\u6703\u5F97\u5230\u540C\u4E00\u500B\u6578\u5B57\uFF1F
      </p>
      <p>
        \u9019\u500B\u5171\u540C\u7684\u6578\u5B57\u5C31\u662F<strong>\u79E9</strong>\uFF0C\u5B83\u662F\u77E9\u9663\u300C\u771F\u6B63\u7684\u7DAD\u5EA6\u300D\u3002
      </p>
      <p>
        \u53E6\u4E00\u500B\u91CD\u8981\u7684\u516C\u5F0F\uFF08<strong>\u79E9-\u96F6\u5EA6\u5B9A\u7406</strong>\uFF09\uFF1A
      </p>
      <p class="formula">rank(A) + dim(N(A)) = n</p>
      <p>
        \u5176\u4E2D n \u662F\u8F38\u5165\u7DAD\u5EA6\u3002\u300C\u88AB\u4FDD\u7559\u7684\u7DAD\u5EA6\u300D + \u300C\u88AB\u934A\u6389\u7684\u7DAD\u5EA6\u300D = \u300C\u539F\u672C\u7684\u7DAD\u5EA6\u300D\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u4E09\u500B\u5C0D\u6BD4\uFF1A\u79E9\u8DDF\u96F6\u7A7A\u9593\u7684\u7DAD\u5EA6\u52A0\u8D77\u4F86\u90FD\u662F 2">
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

          <!-- Column space -->
          @if (current().rank === 2) {
            <rect x="-100" y="-100" width="200" height="200" fill="var(--accent)" opacity="0.1" />
          }
          @if (current().rank === 1) {
            <line x1="-110" y1="-55" x2="110" y2="55" stroke="var(--accent)" stroke-width="6" opacity="0.3" />
          }
          @if (current().rank === 0) {
            <circle cx="0" cy="0" r="6" fill="var(--accent)" stroke="white" stroke-width="2" />
          }

          <!-- Null space -->
          @if (current().nullDim === 1) {
            <line x1="-110" y1="-220" x2="110" y2="220" stroke="#a05a5a" stroke-width="6" opacity="0.3" />
          }
          @if (current().nullDim === 2) {
            <rect x="-100" y="-100" width="200" height="200" fill="#a05a5a" opacity="0.1" />
          }

          <!-- Column vectors -->
          @if (current().rank > 0) {
            <line x1="0" y1="0" [attr.x2]="current().A[0][0] * 22" [attr.y2]="-current().A[1][0] * 22"
              stroke="var(--v0)" stroke-width="2" />
            <line x1="0" y1="0" [attr.x2]="current().A[0][1] * 22" [attr.y2]="-current().A[1][1] * 22"
              stroke="var(--v1)" stroke-width="2" />
          }
        </svg>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ current().A[0][0] }}, {{ current().A[0][1] }}], [{{ current().A[1][0] }}, {{ current().A[1][1] }}]]</span>
        </div>
        <div class="info-row col">
          <span class="il">C(A)</span>
          <span class="iv">{{ current().colDesc }}\uFF08\u7DAD\u5EA6 = <strong>{{ current().rank }}</strong>\uFF09</span>
        </div>
        <div class="info-row null">
          <span class="il">N(A)</span>
          <span class="iv">{{ current().nullDesc }}\uFF08\u7DAD\u5EA6 = <strong>{{ current().nullDim }}</strong>\uFF09</span>
        </div>
        <div class="info-row big">
          <span class="il">\u9A57\u8B49</span>
          <span class="iv">rank + null = <strong>{{ current().rank }} + {{ current().nullDim }} = {{ current().rank + current().nullDim }}</strong> = n \u2713</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u79E9 \u662F\u770B\u4E00\u500B\u77E9\u9663\u6700\u91CD\u8981\u7684\u300C\u4E00\u500B\u6578\u5B57\u300D\u3002\u5B83\u544A\u8A34\u4F60\uFF1A
      </p>
      <ul>
        <li>A \u80FD\u8B93\u591A\u5C11\u7DAD\u5EA6\u300C\u300C\u5B58\u6D3B\u300D\u300D\uFF1Arank \u500B</li>
        <li>A \u934A\u6389\u591A\u5C11\u7DAD\u5EA6\uFF1An \u2212 rank \u500B</li>
        <li>A \u53EF\u9006 \u27FA rank = n</li>
        <li>Ax = b \u70BA\u4EFB\u4F55 b \u90FD\u6709\u89E3 \u27FA rank = m\uFF08\u8F38\u51FA\u7DAD\u5EA6\uFF09</li>
      </ul>
      <span class="hint">
        \u6211\u5011\u5DF2\u7D93\u770B\u5230\u4E86\u5169\u500B\u91CD\u8981\u7684\u5B50\u7A7A\u9593\u3002\u4E0B\u4E00\u7BC0\u770B<strong>\u5168\u90E8\u56DB\u500B</strong>\uFF0C
        \u4E26\u5C55\u793A Strang \u8457\u540D\u7684\u300C\u5927\u5716\u300D\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px; background: var(--accent-10); border-radius: 8px; margin: 8px 0; }
    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .et { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 70px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.col { background: var(--accent-10); }
      &.null { background: rgba(160,90,90,0.06); }
      &.big { background: rgba(90,138,90,0.08); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--text); font-size: 13px; }
    .info-row.big strong { color: #5a8a5a; }
  `,
})
export class StepRankComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly current = computed(() => this.examples[this.sel()]);
}
