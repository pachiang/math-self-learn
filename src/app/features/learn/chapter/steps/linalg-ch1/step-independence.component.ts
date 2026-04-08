import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Example {
  name: string;
  vectors: { x: number; y: number; color: string; label: string }[];
  independent: boolean;
  desc: string;
  relation?: string;
}

const EXAMPLES: Example[] = [
  {
    name: '\u4F8B\u4E00',
    vectors: [
      { x: 40, y: 20, color: 'var(--v0)', label: 'v\u2081' },
      { x: -20, y: 40, color: 'var(--v1)', label: 'v\u2082' },
    ],
    independent: true,
    desc: '\u5169\u500B\u5411\u91CF\u6307\u5411\u4E0D\u540C\u65B9\u5411\uFF0C\u8AB0\u90FD\u4E0D\u80FD\u7531\u53E6\u4E00\u500B\u8868\u793A\u3002',
  },
  {
    name: '\u4F8B\u4E8C',
    vectors: [
      { x: 40, y: 20, color: 'var(--v0)', label: 'v\u2081' },
      { x: 80, y: 40, color: 'var(--v1)', label: 'v\u2082' },
    ],
    independent: false,
    desc: 'v\u2082 = 2v\u2081\uFF0C\u4E00\u500B\u662F\u53E6\u4E00\u500B\u7684\u500D\u6578\u3002',
    relation: '2v\u2081 \u2212 v\u2082 = 0',
  },
  {
    name: '\u4F8B\u4E09',
    vectors: [
      { x: 40, y: 20, color: 'var(--v0)', label: 'v\u2081' },
      { x: -20, y: 40, color: 'var(--v1)', label: 'v\u2082' },
      { x: 60, y: -20, color: 'var(--v2)', label: 'v\u2083' },
    ],
    independent: false,
    desc: '\u5728 \u211D\u00B2 \u88E1\u53EA\u80FD\u6709 2 \u500B\u7DDA\u6027\u7368\u7ACB\u5411\u91CF\u3002\u7B2C\u4E09\u500B\u4E00\u5B9A\u662F\u524D\u5169\u500B\u7684\u7D44\u5408\u3002',
    relation: 'v\u2083 = 2v\u2081 + v\u2082\uFF08\u8FD1\u4F3C\uFF09',
  },
  {
    name: '\u4F8B\u56DB',
    vectors: [
      { x: 40, y: 0, color: 'var(--v0)', label: 'e\u2081' },
      { x: 0, y: 40, color: 'var(--v1)', label: 'e\u2082' },
    ],
    independent: true,
    desc: '\u6A19\u6E96\u57FA\u5E95 \u2014 \u4E92\u76F8\u5782\u76F4\uFF0C\u7DDA\u6027\u7368\u7ACB\u3002',
  },
];

@Component({
  selector: 'app-step-independence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7DDA\u6027\u76F8\u4F9D\u8207\u7368\u7ACB" subtitle="\u00A71.5">
      <p>
        \u4E00\u7D44\u5411\u91CF\u662F<strong>\u7DDA\u6027\u76F8\u4F9D</strong>\u7684\uFF0C\u5982\u679C\u5176\u4E2D\u67D0\u500B\u5411\u91CF\u53EF\u4EE5\u7531\u5176\u4ED6\u5411\u91CF\u7684\u7DDA\u6027\u7D44\u5408\u8868\u793A\u3002
        \u53CD\u4E4B\u5247\u662F<strong>\u7DDA\u6027\u7368\u7ACB</strong>\u3002
      </p>
      <p>
        \u6B63\u5F0F\u5B9A\u7FA9\uFF1A\u5411\u91CF v\u2081, ..., v\u2096 \u7DDA\u6027\u7368\u7ACB \u27FA \u552F\u4E00\u80FD\u8B93 c\u2081v\u2081 + ... + c\u2096v\u2096 = 0 \u7684\u662F c\u2081 = ... = c\u2096 = 0\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u4F8B\u5B50\uFF0C\u770B\u9019\u7D44\u5411\u91CF\u662F\u5426\u7DDA\u6027\u7368\u7ACB">
      <div class="ex-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="et" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg viewBox="-110 -110 220 220" class="grid-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.5" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.5" />
          }
          <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.2" />

          @for (v of current().vectors; track v.label; let i = $index) {
            <line x1="0" y1="0" [attr.x2]="v.x" [attr.y2]="-v.y"
              [attr.stroke]="v.color" stroke-width="3" [attr.marker-end]="'url(#tip-i' + i + ')'" />
            <text [attr.x]="v.x * 1.15" [attr.y]="-v.y * 1.15" [attr.fill]="v.color"
              class="v-name">{{ v.label }}</text>
            <defs>
              <marker [attr.id]="'tip-i' + i" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" [attr.fill]="v.color" />
              </marker>
            </defs>
          }
        </svg>
      </div>

      <div class="verdict" [class.indep]="current().independent" [class.dep]="!current().independent">
        <div class="v-icon">{{ current().independent ? '\u2713' : '\u2717' }}</div>
        <div class="v-text">
          <div class="v-title">{{ current().independent ? '\u7DDA\u6027\u7368\u7ACB' : '\u7DDA\u6027\u76F8\u4F9D' }}</div>
          <div class="v-desc">{{ current().desc }}</div>
          @if (current().relation) {
            <div class="v-rel">\u95DC\u4FC2\uFF1A{{ current().relation }}</div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u95DC\u9375\u4E8B\u5BE6\uFF1A<strong>\u5728 \u211D\u207F \u88E1\uFF0C\u7DDA\u6027\u7368\u7ACB\u5411\u91CF\u7684\u6700\u5927\u500B\u6578 = n</strong>\u3002
        \u5728 \u211D\u00B2 \u88E1\u6700\u591A 2 \u500B\u7368\u7ACB\u5411\u91CF\uFF0C\u5728 \u211D\u00B3 \u88E1\u6700\u591A 3 \u500B\u3002
      </p>
      <span class="hint">\u9019\u500B\u300C\u6700\u5927\u500B\u6578\u300D\u5C31\u662F\u4E0B\u4E00\u7BC0\u8981\u5B9A\u7FA9\u7684<strong>\u7DAD\u5EA6</strong>\u8207<strong>\u57FA\u5E95</strong>\u3002</span>
    </app-prose-block>
  `,
  styles: `
    .ex-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .et { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .grid-svg { width: 100%; max-width: 320px; }
    .v-name { font-size: 11px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .verdict { display: flex; gap: 12px; align-items: flex-start; padding: 14px 18px; border-radius: 10px;
      &.indep { background: rgba(90,138,90,0.08); border: 1px solid rgba(90,138,90,0.25); }
      &.dep { background: rgba(160,90,90,0.08); border: 1px solid rgba(160,90,90,0.25); } }
    .v-icon { font-size: 26px; font-weight: 700;
      .indep & { color: #5a8a5a; }
      .dep & { color: #a05a5a; } }
    .v-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
    .v-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
    .v-rel { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepIndependenceComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly current = computed(() => this.examples[this.sel()]);
}
