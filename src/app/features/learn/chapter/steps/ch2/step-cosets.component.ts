import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

const COSET_COLORS = [
  'var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)',
  'var(--v4)', 'var(--v5)', 'var(--v6)', 'var(--v7)',
];

interface Subgroup {
  id: string;
  label: string;
  elementIds: string[];
}

interface CosetInfo {
  representative: string;
  elements: GroupElement[];
  colorIdx: number;
}

const D3_SUBGROUPS: Subgroup[] = [
  { id: 'rot', label: '{e, r, r²}', elementIds: ['r0', 'r1', 'r2'] },
  { id: 's0', label: '{e, s}', elementIds: ['r0', 'sr0'] },
  { id: 's1', label: '{e, sr}', elementIds: ['r0', 'sr1'] },
  { id: 's2', label: '{e, sr²}', elementIds: ['r0', 'sr2'] },
];

@Component({
  selector: 'app-step-cosets',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="陪集：用子群來分類" subtitle="§2.5">
      <p>
        上一節我們用「mod」把數字分類。現在來看一個驚人的類比：
        <strong>子群在群裡扮演的角色，就像模數在整數裡扮演的角色</strong>。
      </p>
      <p>
        取 D₃ 的一個子群 H，我們說兩個元素 a 和 b「模 H 等價」，
        如果 a⁻¹b ∈ H — 也就是說，a 和 b 之間的「差距」落在 H 裡面。
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="選一個子群，看它怎樣把 D₃ 的 6 個元素分成幾組"
      [completed]="triedMultiple()"
    >
      <!-- Subgroup selector -->
      <div class="subgroup-selector">
        <span class="control-label">子群 H =</span>
        @for (sg of subgroups; track sg.id) {
          <button
            class="sg-btn"
            [class.active]="selectedSg() === sg.id"
            (click)="selectSubgroup(sg.id)"
          >
            {{ sg.label }}
          </button>
        }
      </div>

      <!-- Side-by-side comparison -->
      <div class="comparison">
        <!-- Left: mod 整數 -->
        <div class="compare-panel">
          <div class="panel-title">整數 mod {{ modulus() }}</div>
          <div class="panel-subtitle">
            模數 = {{ modulus() }}，分成 {{ modulus() }} 組
          </div>
          <div class="mod-grid">
            @for (num of modNumbers; track num) {
              <div class="cell" [style.background]="COLORS[num % modulus()]">
                {{ num }}
              </div>
            }
          </div>
          <div class="partition-summary">
            @for (cls of modClasses(); track cls.label) {
              <div class="partition-row">
                <span class="p-badge" [style.background]="cls.color">{{ cls.label }}</span>
                <span class="p-members">{{ cls.members }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Right: D₃ 陪集 -->
        <div class="compare-panel">
          <div class="panel-title">D₃ mod {{ selectedSubgroup().label }}</div>
          <div class="panel-subtitle">
            |H| = {{ selectedSubgroup().elementIds.length }}，分成
            {{ cosets().length }} 組
          </div>
          <div class="element-grid">
            @for (el of d3.elements; track el.id) {
              <div class="cell" [style.background]="elementColor(el.id)">
                {{ el.label }}
              </div>
            }
          </div>
          <div class="partition-summary">
            @for (coset of cosets(); track coset.representative) {
              <div class="partition-row">
                <span class="p-badge" [style.background]="COLORS[coset.colorIdx]">
                  {{ coset.representative }}H
                </span>
                <span class="p-members">
                  {{ coset.elements.map(e => e.label).join(', ') }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        看到了嗎？兩邊的結構是<strong>完全一樣</strong>的：
      </p>
      <div class="analogy-table">
        <div class="analogy-row header">
          <span>整數 mod n</span>
          <span>群 mod H</span>
        </div>
        <div class="analogy-row">
          <span>模數 n</span>
          <span>子群 H</span>
        </div>
        <div class="analogy-row">
          <span>a ≡ b (mod n) ↔ n | (a−b)</span>
          <span>a ≡ b (mod H) ↔ a⁻¹b ∈ H</span>
        </div>
        <div class="analogy-row">
          <span>餘數相同的數成一組</span>
          <span>陪集 = 一組等價的元素</span>
        </div>
        <div class="analogy-row">
          <span>分成 n 組，每組無限多</span>
          <span>分成 |G|/|H| 組，每組 |H| 個</span>
        </div>
      </div>
      <span class="hint">
        陪集就是「群版本的同餘」。下一節我們會看到，
        <strong>只有子群</strong>才能給出這種完美的分割，普通子集不行。
      </span>
    </app-prose-block>
  `,
  styles: `
    .subgroup-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .control-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .sg-btn {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      font-size: 14px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover { background: var(--accent-10); }
      &.active {
        background: var(--accent-18);
        border-color: var(--accent);
        font-weight: 600;
      }
    }

    /* Comparison layout */
    .comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 8px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .compare-panel {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .panel-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 2px;
      font-family: 'JetBrains Mono', monospace;
    }

    .panel-subtitle {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .mod-grid, .element-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      margin-bottom: 12px;
    }

    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 38px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      color: white;
      font-family: 'JetBrains Mono', monospace;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: background 0.3s ease;
    }

    .partition-summary {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .partition-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .p-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      min-width: 36px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }

    .p-members {
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary);
    }

    /* Analogy table */
    .analogy-table {
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      margin: 14px 0;
    }

    .analogy-row {
      display: grid;
      grid-template-columns: 1fr 1fr;

      &.header span {
        font-weight: 700;
        background: var(--accent-10);
        color: var(--text);
      }

      span {
        padding: 8px 12px;
        font-size: 13px;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border);
        font-family: 'JetBrains Mono', monospace;

        &:first-child {
          border-right: 1px solid var(--border);
        }
      }

      &:last-child span {
        border-bottom: none;
      }
    }
  `,
})
export class StepCosetsComponent {
  readonly d3: Group = createDihedralGroup(3);
  readonly subgroups = D3_SUBGROUPS;
  readonly modNumbers = [0, 1, 2, 3, 4, 5];
  readonly COLORS = COSET_COLORS;

  readonly selectedSg = signal('rot');
  private readonly triedSgs = signal(new Set(['rot']));
  readonly triedMultiple = computed(() => this.triedSgs().size >= 2);

  readonly selectedSubgroup = computed(
    () => this.subgroups.find((sg) => sg.id === this.selectedSg()) ?? this.subgroups[0],
  );

  // Modulus mirrors the subgroup size for the analogy
  readonly modulus = computed(() => this.selectedSubgroup().elementIds.length);

  readonly modClasses = computed(() => {
    const m = this.modulus();
    return Array.from({ length: m }, (_, r) => ({
      label: `餘${r}`,
      color: COSET_COLORS[r],
      members: this.modNumbers.filter((n) => n % m === r).join(', '),
    }));
  });

  readonly cosets = computed(() => {
    const sg = this.selectedSubgroup();
    const subElements = this.d3.elements.filter((e) =>
      sg.elementIds.includes(e.id),
    );
    return this.computeCosets(subElements);
  });

  private elementCosetMap = computed(() => {
    const map = new Map<string, number>();
    for (const coset of this.cosets()) {
      for (const el of coset.elements) {
        map.set(el.id, coset.colorIdx);
      }
    }
    return map;
  });

  selectSubgroup(id: string): void {
    this.selectedSg.set(id);
    this.triedSgs.update((s) => new Set(s).add(id));
  }

  elementColor(id: string): string {
    const idx = this.elementCosetMap().get(id) ?? 0;
    return COSET_COLORS[idx];
  }

  private computeCosets(subElements: GroupElement[]): CosetInfo[] {
    const cosets: CosetInfo[] = [];
    const assigned = new Set<string>();

    for (const g of this.d3.elements) {
      if (assigned.has(g.id)) continue;
      const coset = subElements.map((h) => this.d3.multiply(g, h));
      for (const e of coset) assigned.add(e.id);
      cosets.push({
        representative: g.label,
        elements: coset,
        colorIdx: cosets.length,
      });
    }

    return cosets;
  }
}
