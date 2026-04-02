import { Component, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Permutation } from '../../../../../core/math/permutation';

interface SignRow { label: string; perm: number[]; transCount: number; sign: string; type: string; }

const S3_ROWS: SignRow[] = [
  { label: '( )',      perm: [0,1,2], transCount: 0, sign: '+1', type: '\u5076' },
  { label: '(1 2 3)',  perm: [1,2,0], transCount: 2, sign: '+1', type: '\u5076' },
  { label: '(1 3 2)',  perm: [2,0,1], transCount: 2, sign: '+1', type: '\u5076' },
  { label: '(2 3)',    perm: [0,2,1], transCount: 1, sign: '\u22121', type: '\u5947' },
  { label: '(1 3)',    perm: [2,1,0], transCount: 1, sign: '\u22121', type: '\u5947' },
  { label: '(1 2)',    perm: [1,0,2], transCount: 1, sign: '\u22121', type: '\u5947' },
];

@Component({
  selector: 'app-step-sign',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="奇偶性與符號映射" subtitle="\u00A74.4">
      <p>
        上一節我們知道：每個置換拆成對換時，對換的個數<strong>永遠是同奇同偶</strong>。
        這讓我們可以給每個置換貼一個標籤：<strong>偶置換</strong>或<strong>奇置換</strong>。
      </p>
      <p>
        數學上，我們定義<strong>符號映射</strong>：
      </p>
      <p style="text-align:center; font-size:18px; font-weight:600; color:var(--text);">
        sgn(\u03C3) = (\u22121)^(對換數)
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看看 S\u2083 的每個元素是偶還是奇">
      <div class="table-wrap">
        <table class="sign-table">
          <thead>
            <tr>
              <th>置換</th><th>對換數</th><th>sgn</th><th>奇偶</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.label) {
              <tr [class.even]="row.type === '\u5076'" [class.odd]="row.type === '\u5947'">
                <td class="perm-cell">{{ row.label }}</td>
                <td>{{ row.transCount }}</td>
                <td class="sign-cell">{{ row.sign }}</td>
                <td>
                  <span class="type-badge" [class.even-b]="row.type === '\u5076'" [class.odd-b]="row.type === '\u5947'">
                    {{ row.type }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="homo-check">
        <strong>sgn 是同態！</strong>
        <p>sgn(\u03C3\u2218\u03C4) = sgn(\u03C3) \u00D7 sgn(\u03C4)</p>
        <p class="example">
          例：sgn((1 2 3)) \u00D7 sgn((2 3)) = (+1)(\u22121) = \u22121 = sgn((1 2 3)\u2218(2 3))
        </p>
      </div>

      <div class="connection">
        <strong>還記得嗎？</strong> 第三章的 \u03C6: D\u2083 \u2192 Z\u2082（旋轉\u21920, 翻轉\u21921）
        其實就是 sgn: S\u2083 \u2192 {{ '{' }}\u00B11{{ '}' }}！
        旋轉 = 偶置換，翻轉 = 奇置換。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        符號映射 sgn: S\u2099 \u2192 {{ '{' }}+1, \u22121{{ '}' }} 是一個<strong>滿射同態</strong>。
        它的核是什麼？就是所有偶置換的集合 — 下一節的主角。
      </p>
    </app-prose-block>
  `,
  styles: `
    .table-wrap { overflow-x: auto; margin-bottom: 14px; border: 1px solid var(--border); border-radius: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 8px 12px; background: var(--accent-10); color: var(--text-secondary);
      font-size: 12px; font-weight: 600; text-align: center; border-bottom: 1px solid var(--border); }
    td { padding: 8px 12px; text-align: center; border-bottom: 1px solid var(--border); font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    tr.even { background: rgba(90,138,90,0.04); }
    tr.odd { background: rgba(160,90,90,0.04); }
    .perm-cell { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--text); }
    .sign-cell { font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .type-badge {
      padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;
      &.even-b { background: rgba(90,138,90,0.12); color: #5a8a5a; }
      &.odd-b { background: rgba(160,90,90,0.12); color: #a05a5a; }
    }

    .homo-check {
      padding: 14px 18px; background: rgba(90,138,90,0.06); border: 1px solid rgba(90,138,90,0.2);
      border-radius: 10px; margin-bottom: 12px; text-align: center;
      strong { color: #5a8a5a; font-size: 14px; }
      p { margin: 6px 0 0; font-family: 'JetBrains Mono', monospace; font-size: 15px; color: var(--text); }
      .example { font-size: 12px; color: var(--text-muted); }
    }

    .connection {
      padding: 12px 16px; border-radius: 8px; background: var(--accent-10);
      border-left: 3px solid var(--accent); font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); }
    }
  `,
})
export class StepSignComponent {
  readonly rows = S3_ROWS;
}
