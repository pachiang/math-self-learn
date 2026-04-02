import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

const COLORS = [
  'var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)',
  'var(--v4)', 'var(--v5)', 'var(--v6)', 'var(--v7)',
];

interface SubgroupDef {
  id: string;
  label: string;
  elementIds: string[];
}

interface CosetRow {
  g: GroupElement;
  leftIds: string[];
  leftLabels: string;
  rightIds: string[];
  rightLabels: string;
  match: boolean;
}

// ── D₃ subgroups ──
const D3_SUBGROUPS: SubgroupDef[] = [
  { id: 'd3-rot', label: '\u007Be, r, r\u00B2\u007D', elementIds: ['r0', 'r1', 'r2'] },
  { id: 'd3-s0', label: '\u007Be, s\u007D', elementIds: ['r0', 'sr0'] },
  { id: 'd3-s1', label: '\u007Be, sr\u007D', elementIds: ['r0', 'sr1'] },
  { id: 'd3-s2', label: '\u007Be, sr\u00B2\u007D', elementIds: ['r0', 'sr2'] },
];

// ── D₄ subgroups (non-trivial) ──
const D4_SUBGROUPS: SubgroupDef[] = [
  { id: 'd4-r2', label: '\u007Be, r\u00B2\u007D', elementIds: ['r0', 'r2'] },
  { id: 'd4-rot', label: '\u007Be, r, r\u00B2, r\u00B3\u007D', elementIds: ['r0', 'r1', 'r2', 'r3'] },
  { id: 'd4-v1', label: '\u007Be, r\u00B2, s, sr\u00B2\u007D', elementIds: ['r0', 'r2', 'sr0', 'sr2'] },
  { id: 'd4-v2', label: '\u007Be, r\u00B2, sr, sr\u00B3\u007D', elementIds: ['r0', 'r2', 'sr1', 'sr3'] },
  { id: 'd4-s0', label: '\u007Be, s\u007D', elementIds: ['r0', 'sr0'] },
  { id: 'd4-sr', label: '\u007Be, sr\u007D', elementIds: ['r0', 'sr1'] },
  { id: 'd4-s2', label: '\u007Be, sr\u00B2\u007D', elementIds: ['r0', 'sr2'] },
  { id: 'd4-sr3', label: '\u007Be, sr\u00B3\u007D', elementIds: ['r0', 'sr3'] },
];

interface GroupOption {
  id: string;
  label: string;
  group: Group;
  subgroups: SubgroupDef[];
}

@Component({
  selector: 'app-step-left-right-cosets',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="左陪集 vs 右陪集" subtitle="\u00A73.1">
      <p>
        上一章我們學了<strong>左陪集</strong> gH：把子群 H 的每個元素都乘上 g（左邊乘）。
        但如果改成<strong>右邊乘</strong>呢？Hg 會跟 gH 一樣嗎？
      </p>
      <p>
        聽起來好像應該一樣，但<strong>群的乘法不一定滿足交換律</strong>，
        所以左邊乘和右邊乘可能給出完全不同的結果。讓我們來看看。
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="選一個群和子群，比較每個元素的左陪集和右陪集"
      [completed]="foundBoth()"
    >
      <!-- Group selector -->
      <div class="group-selector">
        <span class="ctrl-label">群：</span>
        @for (opt of groupOptions; track opt.id) {
          <button
            class="group-btn"
            [class.active]="selectedGroupId() === opt.id"
            (click)="selectGroup(opt.id)"
          >{{ opt.label }}</button>
        }
      </div>

      <!-- Subgroup selector -->
      <div class="subgroup-selector">
        <span class="ctrl-label">子群 H =</span>
        <div class="sg-row">
          @for (sg of currentSubgroups(); track sg.id) {
            <button
              class="sg-btn"
              [class.active]="selectedSgId() === sg.id"
              (click)="selectSubgroup(sg.id)"
            >{{ sg.label }}</button>
          }
        </div>
      </div>

      <!-- Comparison table -->
      <div class="table-wrap">
        <table class="coset-table">
          <thead>
            <tr>
              <th class="col-g">g</th>
              <th class="col-coset">左陪集 gH</th>
              <th class="col-coset">右陪集 Hg</th>
              <th class="col-match">相同？</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.g.id) {
              <tr [class.match]="row.match" [class.mismatch]="!row.match">
                <td class="col-g cell-g">{{ row.g.label }}</td>
                <td class="col-coset">{{ row.leftLabels }}</td>
                <td class="col-coset">{{ row.rightLabels }}</td>
                <td class="col-match">
                  <span class="badge" [class.yes]="row.match" [class.no]="!row.match">
                    {{ row.match ? '\u2713' : '\u2717' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Verdict -->
      <div class="verdict" [class.normal]="isNormal()" [class.not-normal]="!isNormal()">
        @if (isNormal()) {
          <strong>H 是正規子群</strong>（H \u25C1 G）— 每個元素的左右陪集都相同
        } @else {
          <strong>H 不是正規子群</strong> — 有些元素的左右陪集不同（紅色行）
        }
      </div>

      <!-- Score -->
      <div class="score">
        已找到：正規 {{ normalCount() }} 個，非正規 {{ nonNormalCount() }} 個
      </div>
    </app-challenge-card>

    @if (foundBoth()) {
      <app-prose-block title="正規子群">
        <p>
          如果一個子群 H 滿足<strong>對所有 g，gH = Hg</strong>，
          我們就說 H 是 G 的<strong>正規子群</strong>，記作 H \u25C1 G。
        </p>
        <p>直覺上：</p>
        <div class="intuition-cards">
          <div class="int-card">
            <div class="int-icon">\u25C1</div>
            <div class="int-label">正規子群</div>
            <div class="int-desc">
              「跟所有元素都合得來」— 不管從左邊乘還是右邊乘，
              得到的分組方式完全一樣。
            </div>
          </div>
          <div class="int-card bad">
            <div class="int-icon">\u2718</div>
            <div class="int-label">非正規子群</div>
            <div class="int-desc">
              左邊乘和右邊乘給出不同的分組 —
              這個子群「偏心」，跟某些元素合不來。
            </div>
          </div>
        </div>
        <span class="hint">
          為什麼正規子群這麼重要？因為只有正規子群才能讓我們把陪集本身當成
          「新群的元素」來做運算。這就是下一節的主題：商群。
        </span>
      </app-prose-block>
    }
  `,
  styles: `
    .group-selector, .subgroup-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .ctrl-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .sg-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .group-btn, .sg-btn {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.12s;
      font-family: 'JetBrains Mono', monospace;

      &:hover { background: var(--accent-10); }
      &.active {
        background: var(--accent-18);
        border-color: var(--accent);
        font-weight: 600;
      }
    }

    .group-btn { font-family: inherit; font-size: 14px; }

    /* ── Table ── */
    .table-wrap {
      overflow-x: auto;
      margin-bottom: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .coset-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }

    th, td {
      padding: 8px 12px;
      text-align: center;
      border-bottom: 1px solid var(--border);
    }

    th {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--accent-10);
    }

    .col-g { width: 48px; }
    .col-match { width: 56px; }

    .cell-g {
      font-weight: 700;
      color: var(--text);
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      font-size: 15px;
    }

    tr.match td { background: rgba(90, 138, 90, 0.04); }
    tr.mismatch td { background: rgba(160, 90, 90, 0.05); }
    tr:last-child td { border-bottom: none; }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 13px;
      font-weight: 700;

      &.yes { background: rgba(90, 138, 90, 0.15); color: #5a8a5a; }
      &.no  { background: rgba(160, 90, 90, 0.15); color: #a05a5a; }
    }

    /* ── Verdict ── */
    .verdict {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 8px;

      &.normal {
        background: rgba(90, 138, 90, 0.08);
        color: #5a8a5a;
        border: 1px solid rgba(90, 138, 90, 0.2);
      }

      &.not-normal {
        background: rgba(160, 90, 90, 0.08);
        color: #a05a5a;
        border: 1px solid rgba(160, 90, 90, 0.2);
      }
    }

    .score {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* ── Intuition cards ── */
    .intuition-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 14px 0;

      @media (max-width: 500px) { grid-template-columns: 1fr; }
    }

    .int-card {
      padding: 14px;
      border: 1px solid rgba(90, 138, 90, 0.2);
      border-radius: 10px;
      background: rgba(90, 138, 90, 0.04);
      text-align: center;

      &.bad {
        border-color: rgba(160, 90, 90, 0.2);
        background: rgba(160, 90, 90, 0.04);
      }
    }

    .int-icon { font-size: 22px; margin-bottom: 4px; }

    .int-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
    }

    .int-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `,
})
export class StepLeftRightCosetsComponent {
  private readonly d3 = createDihedralGroup(3);
  private readonly d4 = createDihedralGroup(4);

  readonly groupOptions: GroupOption[] = [
    { id: 'd3', label: 'D\u2083 (三角形)', group: this.d3, subgroups: D3_SUBGROUPS },
    { id: 'd4', label: 'D\u2084 (正方形)', group: this.d4, subgroups: D4_SUBGROUPS },
  ];

  readonly selectedGroupId = signal('d3');
  readonly selectedSgId = signal('d3-rot');

  private readonly foundNormal = signal(false);
  private readonly foundNonNormal = signal(false);
  readonly foundBoth = computed(() => this.foundNormal() && this.foundNonNormal());
  readonly normalCount = signal(0);
  readonly nonNormalCount = signal(0);

  readonly currentGroupOption = computed(
    () => this.groupOptions.find((o) => o.id === this.selectedGroupId())!,
  );

  readonly currentSubgroups = computed(() => this.currentGroupOption().subgroups);

  readonly rows = computed(() => {
    const opt = this.currentGroupOption();
    const sg = opt.subgroups.find((s) => s.id === this.selectedSgId());
    if (!sg) return [];

    const group = opt.group;
    const hElements = group.elements.filter((e) => sg.elementIds.includes(e.id));

    // Deduplicate rows: only show one representative per unique left coset
    const seen = new Set<string>();
    const result: CosetRow[] = [];

    for (const g of group.elements) {
      const left = hElements.map((h) => group.multiply(g, h));
      const leftKey = left.map((e) => e.id).sort().join(',');

      if (seen.has(leftKey)) continue;
      seen.add(leftKey);

      const right = hElements.map((h) => group.multiply(h, g));
      const leftSorted = [...left.map((e) => e.id)].sort();
      const rightSorted = [...right.map((e) => e.id)].sort();
      const match = leftSorted.join(',') === rightSorted.join(',');

      result.push({
        g,
        leftIds: left.map((e) => e.id),
        leftLabels: left.map((e) => e.label).join(', '),
        rightIds: right.map((e) => e.id),
        rightLabels: right.map((e) => e.label).join(', '),
        match,
      });
    }

    return result;
  });

  readonly isNormal = computed(() => this.rows().every((r) => r.match));

  selectGroup(id: string): void {
    this.selectedGroupId.set(id);
    const opt = this.groupOptions.find((o) => o.id === id)!;
    this.selectedSgId.set(opt.subgroups[0].id);
  }

  selectSubgroup(id: string): void {
    this.selectedSgId.set(id);
    // Track discovery
    if (this.isNormal()) {
      this.foundNormal.set(true);
      this.normalCount.update((n) => n + 1);
    } else {
      this.foundNonNormal.set(true);
      this.nonNormalCount.update((n) => n + 1);
    }
  }
}
