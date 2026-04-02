import { Component, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { allColorings, orbit, stabilizer, coloringKey, PALETTE, MINI_TRI, allOrbits } from './coloring-utils';

@Component({
  selector: 'app-step-orbit-stabilizer',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="軌道-穩定子定理" subtitle="\u00A75.4">
      <p>
        上一節的觀察可以寫成一個定理：
      </p>
      <div class="theorem-box">
        |G| = |Orb(x)| \u00D7 |Stab(x)|
      </div>
      <p>
        群的大小 = 軌道大小 \u00D7 穩定子大小。這對<strong>任何</strong> x 都成立。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="對全部 8 種著色驗證這個等式">
      <div class="verify-table-wrap">
        <table class="verify-table">
          <thead>
            <tr>
              <th>著色</th><th>|Orb|</th><th>|Stab|</th><th>|Orb|\u00D7|Stab|</th><th>=6?</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.key) {
              <tr>
                <td>
                  <svg [attr.viewBox]="tri.viewBox" class="table-tri">
                    <polygon [attr.points]="tri.points" fill="none" stroke="var(--border)" stroke-width="0.8"/>
                    @for (v of tri.vertices; track $index; let i = $index) {
                      <circle [attr.cx]="v.x" [attr.cy]="v.y" r="7"
                        [attr.fill]="PALETTE[row.coloring[i]]" />
                    }
                  </svg>
                </td>
                <td>{{ row.orbSize }}</td>
                <td>{{ row.stabSize }}</td>
                <td class="product">{{ row.orbSize * row.stabSize }}</td>
                <td><span class="check">\u2713</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="insight">
        <strong>規律：</strong>軌道越大（著色「越不對稱」），穩定子就越小。
        反之，全同色（最對稱）的軌道最小（只有 1），穩定子最大（整個群）。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        直覺：群有 6 單位的「搬運力」。
        如果有 3 個元素在搬（|Stab|=3 不動），那搬出去的只有 6/3=2 種結果。
      </p>
      <span class="hint">
        軌道-穩定子定理讓我們可以<strong>計算軌道的個數</strong>
        — 也就是「本質不同」的東西有幾個。
        下一節的 Burnside 引理就是建立在這個基礎上。
      </span>
    </app-prose-block>
  `,
  styles: `
    .theorem-box {
      padding: 16px; text-align: center; font-size: 20px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 12px; margin: 12px 0;
    }

    .verify-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 6px 10px; background: var(--accent-10); color: var(--text-secondary);
      font-size: 12px; font-weight: 600; border-bottom: 1px solid var(--border); text-align: center; }
    td { padding: 6px 10px; text-align: center; border-bottom: 1px solid var(--border);
      font-size: 14px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    tr:last-child td { border-bottom: none; }
    .table-tri { width: 36px; height: 34px; vertical-align: middle; }
    .product { font-weight: 700; }
    .check { color: #5a8a5a; font-weight: 700; }

    .insight {
      padding: 12px 16px; border-radius: 8px; background: var(--accent-10);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); }
    }
  `,
})
export class StepOrbitStabilizerComponent {
  private readonly d3 = createDihedralGroup(3);
  readonly PALETTE = PALETTE;
  readonly tri = MINI_TRI;

  readonly rows = computed(() =>
    allColorings(3, 2).map((c) => ({
      coloring: c,
      key: coloringKey(c),
      orbSize: orbit(this.d3, c).length,
      stabSize: stabilizer(this.d3, c).length,
    })),
  );
}
