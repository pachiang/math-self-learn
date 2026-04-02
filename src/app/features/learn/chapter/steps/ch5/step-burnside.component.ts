import { Component, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { allColorings, fixedCount, allOrbits, PALETTE, MINI_TRI } from './coloring-utils';

@Component({
  selector: 'app-step-burnside',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Burnside 引理" subtitle="\u00A75.5">
      <p>
        我們想回答一個實際的問題：
        <strong>「本質不同的著色有幾種？」</strong>
        也就是軌道有幾個。
      </p>
      <p>
        Burnside 引理給出了一個驚人簡潔的公式：
      </p>
      <div class="formula-box">
        軌道數 = (1/|G|) \u00D7 \u03A3 |Fix(g)|
      </div>
      <p>
        對群的<strong>每個元素 g</strong>，數一下有多少著色被 g 固定，
        全部加起來，再除以群的大小。就這樣！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="用 D\u2083 和 2-著色來驗證 Burnside 引理">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>群元素 g</th>
              <th>g 固定了幾個著色 |Fix(g)|</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.label) {
              <tr>
                <td class="g-cell">{{ row.label }}</td>
                <td>{{ row.fixCount }}</td>
              </tr>
            }
            <tr class="sum-row">
              <td><strong>總和</strong></td>
              <td><strong>{{ totalFix() }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="calculation">
        <div class="calc-line">軌道數 = {{ totalFix() }} / {{ groupSize }} = <strong>{{ orbitCount() }}</strong></div>
      </div>

      <div class="verify">
        \u2713 確實是 {{ orbitCount() }} 個軌道 — 跟我們在 \u00A75.2 數出來的一樣！
      </div>

      <!-- Show the 4 orbits -->
      <div class="orbits-display">
        @for (orb of orbits(); track $index; let i = $index) {
          <div class="orb-card">
            <div class="orb-label">軌道 {{ i + 1 }}</div>
            <div class="orb-tris">
              @for (c of orb; track cKey(c)) {
                <svg [attr.viewBox]="tri.viewBox" class="orb-tri">
                  <polygon [attr.points]="tri.points" fill="none" stroke="var(--border)" stroke-width="1"/>
                  @for (v of tri.vertices; track $index; let vi = $index) {
                    <circle [attr.cx]="v.x" [attr.cy]="v.y" r="7"
                      [attr.fill]="PALETTE[c[vi]]" />
                  }
                </svg>
              }
            </div>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Burnside 引理的美在於：你不需要真的把所有著色分組，
        只需要對<strong>每個群元素</strong>數一個數（它固定了幾個），
        然後做一次除法。
      </p>
      <span class="hint">
        下一節我們用這個公式來解決一個經典的組合問題：
        用 k 種顏色的珠子串一條 n 顆珠子的項鍊，有幾種<strong>本質不同</strong>的項鍊？
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula-box {
      padding: 16px; text-align: center; font-size: 18px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 12px; margin: 12px 0;
    }

    .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 8px 14px; background: var(--accent-10); color: var(--text-secondary);
      font-size: 12px; font-weight: 600; border-bottom: 1px solid var(--border); text-align: center; }
    td { padding: 8px 14px; text-align: center; border-bottom: 1px solid var(--border);
      font-size: 15px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .g-cell { font-family: 'Noto Sans Math', serif; font-weight: 600; }
    .sum-row td { background: var(--accent-10); border-top: 2px solid var(--accent-30); }
    tr:last-child td { border-bottom: none; }

    .calculation {
      padding: 14px 18px; border-radius: 10px; background: var(--bg);
      border: 1px solid var(--border); text-align: center; margin-bottom: 10px;
    }
    .calc-line {
      font-size: 18px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      strong { color: var(--accent); font-size: 24px; }
    }

    .verify {
      padding: 10px 14px; border-radius: 8px; background: rgba(90,138,90,0.08);
      color: #5a8a5a; font-size: 14px; font-weight: 600; margin-bottom: 14px;
    }

    .orbits-display { display: flex; gap: 8px; flex-wrap: wrap; }
    .orb-card {
      padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg); text-align: center;
    }
    .orb-label { font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
    .orb-tris { display: flex; gap: 3px; }
    .orb-tri { width: 36px; height: 34px; }
  `,
})
export class StepBurnsideComponent {
  private readonly d3 = createDihedralGroup(3);
  readonly PALETTE = PALETTE;
  readonly tri = MINI_TRI;
  readonly groupSize = 6;

  private readonly colorings = allColorings(3, 2);

  readonly rows = computed(() =>
    this.d3.elements.map((el) => ({
      label: el.label,
      fixCount: fixedCount(el, this.colorings),
    })),
  );

  readonly totalFix = computed(() =>
    this.rows().reduce((sum, r) => sum + r.fixCount, 0),
  );

  readonly orbitCount = computed(() => this.totalFix() / this.groupSize);

  readonly orbits = computed(() => allOrbits(this.d3, this.colorings));

  cKey(c: number[]): string { return c.join(','); }
}
