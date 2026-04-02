import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface CharRow { name: string; dim: number; vals: number[]; desc: string; color: string; }

const ROWS: CharRow[] = [
  { name: '\u03C7\u2081', dim: 1, vals: [1, 1, 1], desc: '\u5E73\u51E1\u8868\u793A\uFF1A\u6240\u6709\u5143\u7D20 \u2192 1', color: 'var(--v2)' },
  { name: '\u03C7\u2082', dim: 1, vals: [1, 1, -1], desc: '\u7B26\u865F\u8868\u793A\uFF1A\u65CB\u8F49 \u2192 +1\uFF0C\u7FFB\u8F49 \u2192 \u22121\uFF08= sgn\uFF0CCh4\uFF09', color: 'var(--v1)' },
  { name: '\u03C7\u2083', dim: 2, vals: [2, -1, 0], desc: '\u6A19\u6E96\u8868\u793A\uFF1A2\u00D72 \u65CB\u8F49/\u93E1\u5C04\u77E9\u9663\uFF08\u00A711.1\uFF09', color: 'var(--v0)' },
];

const CLASSES = [
  { label: 'e', size: 1 },
  { label: 'r, r\u00B2', size: 2 },
  { label: 's, sr, sr\u00B2', size: 3 },
];

@Component({
  selector: 'app-step-characters',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7279\u5FB5\u6A19\uFF1A\u8868\u793A\u7684\u6307\u7D0B" subtitle="\u00A711.2">
      <p>\u76F4\u63A5\u6BD4\u8F03\u77E9\u9663\u592A\u8907\u96DC\u3002\u4F46\u77E9\u9663\u6709\u4E00\u500B\u7C21\u55AE\u7684\u4E0D\u8B8A\u91CF\uFF1A<strong>\u8DE1</strong>\uFF08trace\uFF0C\u5C0D\u89D2\u7DDA\u4E4B\u548C\uFF09\u3002</p>
      <p>\u4E00\u500B\u8868\u793A\u7684<strong>\u7279\u5FB5\u6A19</strong> \u03C7(g) = tr(\u03C1(g))\u3002\u7279\u5FB5\u6A19\u662F\u8868\u793A\u7684\u300C\u6307\u7D0B\u300D\u2014 \u4E0D\u540C\u7684\u8868\u793A\u6709\u4E0D\u540C\u7684\u7279\u5FB5\u6A19\u3002</p>
    </app-prose-block>

    <app-challenge-card prompt="D\u2083 \u7684\u5B8C\u6574\u7279\u5FB5\u6A19\u8868 \u2014 \u9EDE\u4E00\u884C\u770B\u8A73\u7D30">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="corner"></th>
              @for (cls of classes; track cls.label) {
                <th><div class="cls-label">{{ cls.label }}</div><div class="cls-size">{{ cls.size }} \u500B</div></th>
              }
              <th class="dim-col">dim</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.name; let i = $index) {
              <tr [class.highlight]="sel() === i" (click)="sel.set(i)" class="clickable">
                <td class="rep-name" [style.border-left-color]="row.color">{{ row.name }}</td>
                @for (v of row.vals; track $index) {
                  <td class="val" [class.pos]="v > 0" [class.neg]="v < 0" [class.zer]="v === 0">{{ v }}</td>
                }
                <td class="dim-val">{{ row.dim }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="detail-card" [style.border-left-color]="rows[sel()].color">
        <div class="detail-name">{{ rows[sel()].name }} ({{ rows[sel()].dim }}\u7DAD)</div>
        <div class="detail-desc">{{ rows[sel()].desc }}</div>
        <div class="detail-vals">
          @for (cls of classes; track cls.label; let j = $index) {
            <div class="dv-item">
              <span class="dv-class">{{ cls.label }}</span>
              <span class="dv-arrow">\u2192</span>
              <span class="dv-val" [class.pos]="rows[sel()].vals[j] > 0"
                [class.neg]="rows[sel()].vals[j] < 0"
                [class.zer]="rows[sel()].vals[j] === 0">{{ rows[sel()].vals[j] }}</span>
            </div>
          }
        </div>
      </div>

      <div class="dim-formula">
        <div class="df-title">\u7DAD\u5EA6\u516C\u5F0F</div>
        <div class="df-eq">1\u00B2 + 1\u00B2 + 2\u00B2 = <strong>6</strong> = |D\u2083|</div>
        <div class="df-note">\u4E0D\u53EF\u7D04\u8868\u793A\u7684\u7DAD\u5EA6\u5E73\u65B9\u548C = \u7FA4\u7684\u968E</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>\u7279\u5FB5\u6A19\u8868\u7684\u6F02\u4EAE\u6027\u8CEA\uFF1A</p>
      <div class="properties">
        <div class="prop">\u2460 \u884C\u6578 = \u5217\u6578 = \u5171\u8EDB\u985E\u6578\uFF08Ch6 \u00A76.1\uFF09</div>
        <div class="prop">\u2461 \u7B2C\u4E00\u5217 = \u7DAD\u5EA6\uFF08tr(\u55AE\u4F4D\u77E9\u9663) = \u7DAD\u5EA6\uFF09</div>
        <div class="prop">\u2462 \u884C\u4E4B\u9593\u300C\u6B63\u4EA4\u300D\uFF08\u52A0\u6B0A\u5167\u7A4D = 0\uFF09</div>
        <div class="prop">\u2463 \u7DAD\u5EA6\u5E73\u65B9\u548C = |G|</div>
      </div>
    </app-prose-block>
  `,
  styles: `
    .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 8px 12px; background: var(--accent-10); color: var(--text-secondary); font-size: 12px; font-weight: 600; text-align: center; border-bottom: 1px solid var(--border); }
    .corner { width: 56px; } .dim-col { background: var(--bg-surface) !important; width: 48px; }
    .cls-label { font-family: 'Noto Sans Math', serif; font-size: 13px; color: var(--text); }
    .cls-size { font-size: 10px; color: var(--text-muted); }
    td { padding: 10px 14px; text-align: center; border-bottom: 1px solid var(--border); font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    tr:last-child td { border-bottom: none; }
    tr.clickable { cursor: pointer; transition: background 0.12s; &:hover { background: var(--accent-10); } }
    tr.highlight { background: var(--accent-18) !important; }
    .rep-name { font-size: 15px; color: var(--accent); text-align: left; border-left: 4px solid; padding-left: 10px; font-family: 'Noto Sans Math', serif; }
    .val { color: var(--text); }
    .pos { color: #5a8a5a; } .neg { color: #a05a5a; } .zer { color: var(--text-muted); }
    .dim-val { font-size: 13px; color: var(--text-muted); background: var(--bg-surface); }

    .detail-card { padding: 12px 16px; border: 1px solid var(--border); border-left: 4px solid; border-radius: 8px; background: var(--bg); margin-bottom: 14px; }
    .detail-name { font-size: 16px; font-weight: 700; color: var(--text); font-family: 'Noto Sans Math', serif; margin-bottom: 4px; }
    .detail-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
    .detail-vals { display: flex; gap: 10px; flex-wrap: wrap; }
    .dv-item { display: flex; align-items: center; gap: 4px; font-size: 13px; }
    .dv-class { color: var(--text-muted); font-family: 'Noto Sans Math', serif; }
    .dv-arrow { color: var(--border-strong); }
    .dv-val { font-weight: 700; font-family: 'JetBrains Mono', monospace; padding: 2px 8px; border-radius: 4px;
      &.pos { background: rgba(90,138,90,0.1); color: #5a8a5a; }
      &.neg { background: rgba(160,90,90,0.1); color: #a05a5a; }
      &.zer { background: var(--bg-surface); color: var(--text-muted); } }

    .dim-formula { padding: 14px; border: 2px solid var(--accent); border-radius: 10px; background: var(--accent-10); text-align: center; }
    .df-title { font-size: 12px; color: var(--accent); font-weight: 600; }
    .df-eq { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin: 4px 0; strong { color: var(--accent); font-size: 24px; } }
    .df-note { font-size: 12px; color: var(--text-muted); }

    .properties { display: flex; flex-direction: column; gap: 5px; margin: 10px 0; }
    .prop { padding: 7px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; color: var(--text-secondary); background: var(--bg-surface); }
  `,
})
export class StepCharactersComponent {
  readonly rows = ROWS;
  readonly classes = CLASSES;
  readonly sel = signal(2);
}
