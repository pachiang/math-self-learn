import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Candidate { name: string; desc: string; isSubspace: boolean; reason: string; svg: string; }

const CANDIDATES: Candidate[] = [
  {
    name: '\u904E\u539F\u9EDE\u7684\u76F4\u7DDA',
    desc: '\u4F8B\uFF1Ay = 2x',
    isSubspace: true,
    reason: '\u2713 \u542B\u539F\u9EDE\u3002\u2713 \u4E0A\u9762\u5169\u9EDE\u76F8\u52A0\u9084\u662F\u5728\u7DDA\u4E0A\u3002\u2713 \u4E58\u4EE5\u4EFB\u610F\u5E38\u6578\u9084\u662F\u5728\u7DDA\u4E0A\u3002',
    svg: 'line-through',
  },
  {
    name: '\u4E0D\u904E\u539F\u9EDE\u7684\u76F4\u7DDA',
    desc: '\u4F8B\uFF1Ay = 2x + 1',
    isSubspace: false,
    reason: '\u2717 \u4E0D\u542B\u539F\u9EDE \u2014 \u53EA\u9700\u4E00\u500B\u6E2C\u8A66\u5C31\u5931\u6557\u3002\u5176\u4ED6\u6E2C\u8A66\u4E5F\u90FD\u5931\u6557\uFF1A\u5169\u9EDE\u76F8\u52A0\u4E0D\u4E00\u5B9A\u5728\u7DDA\u4E0A\u3002',
    svg: 'line-offset',
  },
  {
    name: '\u539F\u9EDE\u96A8\u7684\u4E00\u500B\u9EDE',
    desc: '{(0, 0)}',
    isSubspace: true,
    reason: '\u2713 \u542B\u539F\u9EDE\u3002\u2713 0 + 0 = 0\u3002\u2713 c \u00D7 0 = 0\u3002\u9019\u662F\u300C\u96F6\u5B50\u7A7A\u9593\u300D\u3002',
    svg: 'origin-only',
  },
  {
    name: '\u4E00\u500B\u5713',
    desc: '\u4F8B\uFF1Ax\u00B2 + y\u00B2 = 1',
    isSubspace: false,
    reason: '\u2717 \u4E0D\u542B\u539F\u9EDE\u3002\u2717 \u4E58\u4EE5 2 \u8DD1\u51FA\u5713\u4E4B\u5916\u3002\u5713\u4E0D\u662F\u5B50\u7A7A\u9593\u3002',
    svg: 'circle',
  },
  {
    name: '\u7B2C\u4E00\u8C61\u9650\uFF08x \u2265 0, y \u2265 0\uFF09',
    desc: '\u53F3\u4E0A\u534A\u5E73\u9762',
    isSubspace: false,
    reason: '\u2713 \u542B\u539F\u9EDE\u3002\u2713 \u5169\u9EDE\u76F8\u52A0\u9084\u5728\u91CC\u9762\u3002\u2717 \u4F46\u4E58\u4EE5 -1 \u8DD1\u51FA\u53BB\u4E86\uFF01\u4E0D\u662F\u5B50\u7A7A\u9593\u3002',
    svg: 'quadrant',
  },
  {
    name: '\u6574\u500B\u5E73\u9762',
    desc: '\u211D\u00B2',
    isSubspace: true,
    reason: '\u2713 \u542B\u539F\u9EDE\u3002\u2713 \u4EFB\u4F55\u5169\u500B\u5411\u91CF\u76F8\u52A0\u9084\u5728\u88E1\u9762\u3002\u2713 \u4EFB\u4F55\u500D\u6578\u9084\u5728\u88E1\u9762\u3002\u9019\u662F\u6700\u5927\u7684\u5B50\u7A7A\u9593\u3002',
    svg: 'whole',
  },
];

@Component({
  selector: 'app-step-subspace',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4EC0\u9EBC\u662F\u5B50\u7A7A\u9593" subtitle="\u00A75.1">
      <p>
        \u300C<strong>\u5B50\u7A7A\u9593</strong>\u300D\uFF08subspace\uFF09\u662F\u4E00\u500B\u300C\u85CF\u5728\u5411\u91CF\u7A7A\u9593\u88E1\u7684\u5C0F\u578B\u5411\u91CF\u7A7A\u9593\u300D\u3002
        \u4E00\u500B\u96C6\u5408\u8981\u662F\u5B50\u7A7A\u9593\uFF0C\u5FC5\u9808\u6EFF\u8DB3\u4E09\u500B\u689D\u4EF6\uFF1A
      </p>
      <ol>
        <li><strong>\u542B\u539F\u9EDE</strong>\uFF1A0 \u5411\u91CF\u5728\u88E1\u9762</li>
        <li><strong>\u52A0\u6CD5\u5C01\u9589</strong>\uFF1A\u5169\u500B\u88E1\u9762\u7684\u5411\u91CF\u76F8\u52A0\u4ECD\u7136\u5728\u88E1\u9762</li>
        <li><strong>\u4E58\u6CD5\u5C01\u9589</strong>\uFF1A\u88E1\u9762\u7684\u5411\u91CF\u4E58\u4EFB\u610F\u5E38\u6578\u4ECD\u7136\u5728\u88E1\u9762</li>
      </ol>
      <p>
        \u53EA\u8981\u6709\u4E00\u500B\u689D\u4EF6\u5931\u6557\u5C31\u4E0D\u662F\u5B50\u7A7A\u9593\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u5019\u9078\u96C6\u5408\uFF0C\u770B\u662F\u4E0D\u662F\u5B50\u7A7A\u9593">
      <div class="cand-tabs">
        @for (c of candidates; track c.name; let i = $index) {
          <button class="ct" [class.active]="sel() === i" (click)="sel.set(i)"
            [class.yes]="c.isSubspace"
            [class.no]="!c.isSubspace">{{ c.name }}</button>
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

          @switch (current().svg) {
            @case ('line-through') {
              <line x1="-100" y1="50" x2="100" y2="-50"
                stroke="var(--accent)" stroke-width="3" />
            }
            @case ('line-offset') {
              <line x1="-100" y1="20" x2="100" y2="-80"
                stroke="#a05a5a" stroke-width="3" />
            }
            @case ('origin-only') {
              <circle cx="0" cy="0" r="6" fill="var(--accent)" stroke="white" stroke-width="2" />
            }
            @case ('circle') {
              <circle cx="0" cy="0" r="50" fill="none" stroke="#a05a5a" stroke-width="3" />
            }
            @case ('quadrant') {
              <rect x="0" y="-100" width="100" height="100" fill="#a05a5a" opacity="0.18" />
            }
            @case ('whole') {
              <rect x="-100" y="-100" width="200" height="200" fill="var(--accent)" opacity="0.15" />
            }
          }

          <!-- Origin marker -->
          <circle cx="0" cy="0" r="3" fill="var(--text)" />
        </svg>
      </div>

      <div class="verdict" [class.yes]="current().isSubspace" [class.no]="!current().isSubspace">
        <div class="v-name">
          @if (current().isSubspace) { \u2713 } @else { \u2717 }
          {{ current().name }}\uFF1A{{ current().desc }}
        </div>
        <div class="v-text">{{ current().isSubspace ? '\u662F\u5B50\u7A7A\u9593' : '\u4E0D\u662F\u5B50\u7A7A\u9593' }}</div>
        <div class="v-reason">{{ current().reason }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u95DC\u9375\u89C0\u5BDF\uFF1A\u5728 \u211D\u00B2 \u88E1\u53EA\u6709\u56DB\u7A2E\u5B50\u7A7A\u9593\uFF1A
      </p>
      <ul>
        <li><strong>{{ '{' }}0{{ '}' }}</strong>\uFF1A\u96F6\u5B50\u7A7A\u9593\u3002\u7DAD\u5EA6 = 0</li>
        <li><strong>\u904E\u539F\u9EDE\u7684\u76F4\u7DDA</strong>\uFF1A\u7DAD\u5EA6 = 1</li>
        <li><strong>\u6574\u500B \u211D\u00B2</strong>\uFF1A\u7DAD\u5EA6 = 2</li>
      </ul>
      <p>
        \u5728 \u211D\u00B3 \u88E1\u591A\u4E86\u300C\u904E\u539F\u9EDE\u7684\u5E73\u9762\u300D\uFF08\u7DAD\u5EA6 = 2\uFF09\u3002
        \u4E00\u822C\u5728 \u211D\u207F \u88E1\uFF0C\u5B50\u7A7A\u9593\u7684\u7DAD\u5EA6\u53EF\u4EE5\u662F 0, 1, 2, ..., n\u3002
      </p>
      <span class="hint">
        \u4E0B\u4E00\u7BC0\u770B\u4E00\u500B\u91CD\u8981\u7684\u5B50\u7A7A\u9593\uFF1A\u4E00\u500B\u77E9\u9663 A \u7684<strong>\u5217\u7A7A\u9593</strong>\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .cand-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ct { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active.yes { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; }
      &.active.no { background: rgba(160,90,90,0.15); border-color: #a05a5a; color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }

    .verdict { padding: 14px 18px; border-radius: 10px; border: 2px solid;
      &.yes { border-color: var(--accent); background: var(--accent-10); }
      &.no { border-color: #a05a5a; background: rgba(160,90,90,0.06); } }
    .v-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px;
      .yes & { color: var(--accent); }
      .no & { color: #a05a5a; } }
    .v-text { font-size: 13px; color: var(--text); font-weight: 600; margin-bottom: 4px; }
    .v-reason { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
  `,
})
export class StepSubspaceComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly candidates = CANDIDATES;
  readonly sel = signal(0);
  readonly current = computed(() => this.candidates[this.sel()]);
}
