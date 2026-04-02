import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { mulTable, zeroDivisors, zMul } from './ring-utils';

const COLORS = ['var(--v1)', 'var(--v0)', 'var(--v2)'];

@Component({
  selector: 'app-step-zero-divisors',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="整環與零因子" subtitle="\u00A76.3">
      <p>
        在普通整數裡，如果 a \u00D7 b = 0，那一定 a = 0 或 b = 0。
        但在某些環裡，這個規則<strong>會被打破</strong>。
      </p>
      <p>
        如果 a \u2260 0 且 b \u2260 0 但 ab = 0，
        那 a 和 b 叫做<strong>零因子</strong>（zero divisor）。
        沒有零因子的環叫<strong>整環</strong>（integral domain）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換不同的 Z\u2099，在乘法表裡找零因子（紅色格子）">
      <div class="n-selector">
        <span class="cl">Z</span>
        @for (n of nOptions; track n) {
          <button class="n-btn" [class.active]="modN() === n"
            (click)="modN.set(n)">{{ n }}</button>
        }
      </div>

      <!-- Multiplication table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="corner">\u00D7</th>
              @for (j of range(); track j) {
                <th>{{ j }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (i of range(); track i) {
              <tr>
                <th>{{ i }}</th>
                @for (j of range(); track j) {
                  <td [class.zero-cell]="table()[i][j] === 0 && i !== 0 && j !== 0"
                      [class.trivial-zero]="table()[i][j] === 0 && (i === 0 || j === 0)">
                    {{ table()[i][j] }}
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Zero divisor report -->
      <div class="report" [class.clean]="zds().length === 0" [class.dirty]="zds().length > 0">
        @if (zds().length === 0) {
          \u2713 Z\u2082{{ modN() }} <strong>沒有零因子</strong> — 是整環！
          <br/><span class="sub">（因為 {{ modN() }} 是質數）</span>
        } @else {
          \u2717 Z\u2082{{ modN() }} 有零因子：<strong>{{ zds().join(', ') }}</strong>
          <br/><span class="sub">（因為 {{ modN() }} 不是質數）</span>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>你發現了規律嗎？</p>
      <div class="discovery">
        <strong>Z\u2099 是整環 \u27FA n 是質數</strong>
      </div>
      <p>
        因為如果 n = ab（a,b &gt; 1），那在 Z\u2099 裡 a \u00D7 b = n \u2261 0。
        零因子的存在讓我們不能放心做「消去」— ab = ac 不能推出 b = c。
      </p>
      <span class="hint">
        零因子是環理論的一個核心障礙。但還有更深層的結構可以挖 —
        就像群有正規子群，環也有類似的東西：<strong>理想</strong>。
      </span>
    </app-prose-block>
  `,
  styles: `
    .n-selector { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
    .cl { font-size: 15px; font-weight: 600; color: var(--text); }
    .n-btn {
      width: 36px; height: 30px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 14px; font-weight: 600; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); }
    }

    .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 12px; }
    table { border-collapse: collapse; width: auto; margin: 0 auto; }
    th, td {
      width: 36px; height: 32px; text-align: center; font-size: 13px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
    }
    th { background: var(--accent-10); color: var(--text-secondary); font-weight: 600; }
    .corner { background: var(--accent-18); }
    td { color: var(--text); }
    .zero-cell { background: rgba(160,90,90,0.15); color: #a05a5a !important; font-weight: 700; }
    .trivial-zero { color: var(--text-muted) !important; }

    .report {
      padding: 12px 16px; border-radius: 8px; font-size: 14px; line-height: 1.6;
      &.clean { background: rgba(90,138,90,0.08); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.2); }
      &.dirty { background: rgba(160,90,90,0.08); color: #a05a5a; border: 1px solid rgba(160,90,90,0.2); }
      strong { font-weight: 700; }
      .sub { font-size: 12px; opacity: 0.8; }
    }

    .discovery {
      padding: 14px; text-align: center; font-size: 16px;
      font-family: 'JetBrains Mono', monospace;
      background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 10px; margin: 10px 0; color: var(--text);
    }
  `,
})
export class StepZeroDivisorsComponent {
  readonly nOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  readonly modN = signal(6);

  readonly range = computed(() => Array.from({ length: this.modN() }, (_, i) => i));
  readonly table = computed(() => mulTable(this.modN()));
  readonly zds = computed(() => zeroDivisors(this.modN()));
}
