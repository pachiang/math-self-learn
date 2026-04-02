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
  isNormal: boolean;
}

interface CosetDef {
  idx: number;
  elements: GroupElement[];
  shortLabel: string;
  fullLabel: string;
}

interface ProductRow {
  a: GroupElement;
  b: GroupElement;
  product: GroupElement;
  cosetIdx: number;
}

const SUBGROUPS: SubgroupDef[] = [
  { id: 'rot', label: '\u007Be, r, r\u00B2\u007D', elementIds: ['r0', 'r1', 'r2'], isNormal: true },
  { id: 's0', label: '\u007Be, s\u007D', elementIds: ['r0', 'sr0'], isNormal: false },
];

@Component({
  selector: 'app-step-why-normal',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼正規性重要" subtitle="\u00A73.2">
      <p>
        上一節我們發現了正規子群。但為什麼數學家這麼在乎「正規」這個性質？
      </p>
      <p>
        因為我們想做一件很大膽的事：<strong>把整個陪集當成一個「超級元素」</strong>，
        然後定義陪集之間的乘法。如果這行得通，陪集就能組成一個全新的群！
      </p>
      <p>
        但有一個問題：每個陪集裡有好幾個元素（代表元）。
        如果用不同的代表元算出不同的結果，那這個「乘法」就自相矛盾了。
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="選一個子群，看看陪集乘法是否「良定義」\u2014 換代表元結果會不會變"
      [completed]="triedBoth()"
    >
      <!-- Subgroup selector -->
      <div class="sg-selector">
        <span class="ctrl-label">子群 H =</span>
        @for (sg of subgroups; track sg.id) {
          <button class="sg-btn" [class.active]="selectedSg() === sg.id"
            [class.normal-tag]="sg.isNormal" [class.not-normal-tag]="!sg.isNormal"
            (click)="selectSg(sg.id)">
            {{ sg.label }}
            <span class="sg-tag">{{ sg.isNormal ? '正規' : '非正規' }}</span>
          </button>
        }
      </div>

      <!-- Show cosets with legend -->
      <div class="cosets-legend">
        <div class="legend-title">陪集（每個顏色 = 一個陪集）：</div>
        <div class="legend-items">
          @for (c of cosets(); track c.idx) {
            <div class="legend-item">
              <span class="legend-dot" [style.background]="COLORS[c.idx]"></span>
              <span class="legend-label">{{ c.shortLabel }} = {{ '{' }}{{ c.fullLabel }}{{ '}' }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Coset pair selector -->
      <div class="pair-selector">
        <span class="ctrl-label">選兩個陪集相乘：</span>
        <div class="pair-options">
          @for (pair of cosetPairs(); track pair.key) {
            <button class="pair-btn"
              [class.active]="selectedPair() === pair.key"
              (click)="selectedPair.set(pair.key)">
              <span class="pair-color" [style.background]="COLORS[pair.aIdx]"></span>
              \u00D7
              <span class="pair-color" [style.background]="COLORS[pair.bIdx]"></span>
            </button>
          }
        </div>
      </div>

      <!-- Step-by-step explanation -->
      <div class="step-explain">
        <div class="se-title">
          <span class="se-coset" [style.background]="COLORS[currentA()]">{{ cosets()[currentA()].shortLabel }}</span>
          \u00D7
          <span class="se-coset" [style.background]="COLORS[currentB()]">{{ cosets()[currentB()].shortLabel }}</span>
          = ?
        </div>
        <div class="se-desc">
          從左邊的陪集任選一個代表元 a，從右邊的陪集任選一個代表元 b，
          算 a\u2218b，看結果落在<strong>哪個陪集</strong>裡。
        </div>
      </div>

      <!-- Product table -->
      <div class="product-table-wrap">
        <table class="product-table">
          <thead>
            <tr>
              <th class="corner">a \u2218 b</th>
              @for (b of cosetsB(); track b.id) {
                <th class="col-head">
                  <div class="head-sub">b =</div>
                  {{ b.label }}
                </th>
              }
            </tr>
            <tr class="from-row">
              <th></th>
              @for (b of cosetsB(); track b.id) {
                <th class="from-label">
                  \u2190 {{ cosets()[currentB()].shortLabel }}
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (a of cosetsA(); track a.id; let ri = $index) {
              <tr>
                <th class="row-head">
                  <div class="head-sub">a =</div>
                  {{ a.label }}
                  <div class="from-label">\u2190 {{ cosets()[currentA()].shortLabel }}</div>
                </th>
                @for (b of cosetsB(); track b.id; let ci = $index) {
                  <td class="product-cell"
                    [style.background]="COLORS[productRows()[ri * cosetsB().length + ci].cosetIdx]">
                    <div class="cell-product">{{ productRows()[ri * cosetsB().length + ci].product.label }}</div>
                    <div class="cell-coset">\u2208 {{ cosets()[productRows()[ri * cosetsB().length + ci].cosetIdx].shortLabel }}</div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Verdict -->
      <div class="verdict" [class.ok]="isConsistent()" [class.bad]="!isConsistent()">
        @if (isConsistent()) {
          <div class="verdict-icon">\u2713</div>
          <div class="verdict-text">
            所有格子都是<strong>同一個顏色</strong>（同一個陪集）！
            <br/>不管選哪個代表元，結果都一樣 \u2192 陪集乘法<strong>良定義</strong>。
          </div>
        } @else {
          <div class="verdict-icon">\u2717</div>
          <div class="verdict-text">
            格子出現了<strong>不同顏色</strong>（不同陪集）！
            <br/>選不同代表元會得到不同結果 \u2192 陪集乘法<strong>自相矛盾</strong>。
          </div>
        }
      </div>
    </app-challenge-card>

    @if (triedBoth()) {
      <app-prose-block>
        <p>現在你看到了關鍵差異：</p>
        <div class="compare-cards">
          <div class="cc good">
            <strong>正規子群 {{ '{' }}e, r, r\u00B2{{ '}' }}</strong>
            \u2014 不管挑哪個代表元組合，乘積都落在同一個陪集。
            陪集乘法是<strong>良定義的</strong>（well-defined）。
          </div>
          <div class="cc bad">
            <strong>非正規子群 {{ '{' }}e, s{{ '}' }}</strong>
            \u2014 換不同的代表元，乘積可能跑到不同的陪集。
            陪集「乘法」<strong>自相矛盾</strong>。
          </div>
        </div>
        <span class="hint">
          這就是正規子群的真正意義：它是讓陪集乘法成為合法運算的<strong>必要條件</strong>。
          有了良定義的乘法，陪集就能組成一個新的群 \u2014 這就是下一節的「商群」。
        </span>
      </app-prose-block>
    }
  `,
  styles: `
    /* ── Controls ── */
    .sg-selector { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .ctrl-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); flex-shrink: 0; }
    .sg-btn {
      padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; transition: all 0.12s;
      display: flex; align-items: center; gap: 6px;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 600; }
    }
    .sg-tag {
      font-size: 10px; padding: 1px 5px; border-radius: 3px; font-family: 'Inter', sans-serif;
      .normal-tag & { background: rgba(90,138,90,0.12); color: #5a8a5a; }
      .not-normal-tag & { background: rgba(160,90,90,0.12); color: #a05a5a; }
    }

    /* ── Legend ── */
    .cosets-legend {
      padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg); margin-bottom: 14px;
    }
    .legend-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .legend-items { display: flex; gap: 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-dot { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; }
    .legend-label { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); }

    /* ── Pair selector ── */
    .pair-selector { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .pair-options { display: flex; gap: 6px; flex-wrap: wrap; }
    .pair-btn {
      display: flex; align-items: center; gap: 4px; padding: 5px 10px;
      border: 1px solid var(--border); border-radius: 6px; background: transparent;
      cursor: pointer; font-size: 14px; color: var(--text-muted); transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); }
    }
    .pair-color { width: 18px; height: 18px; border-radius: 4px; }

    /* ── Step explanation ── */
    .step-explain {
      padding: 12px 16px; border-radius: 10px; background: var(--accent-10);
      border: 1px solid var(--accent-30); margin-bottom: 14px;
    }
    .se-title {
      display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700;
      color: var(--text); margin-bottom: 6px; flex-wrap: wrap;
    }
    .se-coset {
      display: inline-block; padding: 3px 12px; border-radius: 5px;
      color: white; font-family: 'JetBrains Mono', monospace; font-size: 14px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .se-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

    /* ── Product table ── */
    .product-table-wrap { overflow-x: auto; margin-bottom: 14px; }
    .product-table { border-collapse: collapse; }
    th, td { padding: 0; text-align: center; border: 2px solid var(--bg-surface); }
    .corner {
      padding: 8px 10px; background: var(--bg-elevated); color: var(--text-muted);
      font-size: 12px; font-weight: 600; vertical-align: bottom;
    }
    .col-head {
      padding: 6px 10px; background: var(--bg-elevated); min-width: 64px;
      font-size: 15px; font-weight: 700; color: var(--text);
      font-family: 'Noto Sans Math', serif;
    }
    .head-sub { font-size: 10px; font-weight: 500; color: var(--text-muted); font-family: 'Inter', sans-serif; }
    .from-row th { padding: 2px 6px; }
    .from-label { font-size: 10px; color: var(--text-muted); font-weight: 400; font-family: 'Inter', sans-serif; }
    .row-head {
      padding: 8px 10px; background: var(--bg-elevated); min-width: 64px;
      font-size: 15px; font-weight: 700; color: var(--text);
      font-family: 'Noto Sans Math', serif; text-align: center;
    }

    .product-cell {
      padding: 8px 10px; min-width: 72px; color: white;
      text-shadow: 0 1px 3px rgba(0,0,0,0.25); transition: background 0.3s;
    }
    .cell-product { font-size: 15px; font-weight: 700; font-family: 'Noto Sans Math', serif; }
    .cell-coset { font-size: 10px; opacity: 0.85; font-family: 'Inter', sans-serif; }

    /* ── Verdict ── */
    .verdict {
      display: flex; gap: 12px; padding: 14px 18px; border-radius: 10px; font-size: 13px; line-height: 1.6;
      &.ok { background: rgba(90,138,90,0.08); border: 1px solid rgba(90,138,90,0.25); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); border: 1px solid rgba(160,90,90,0.25); color: #a05a5a; }
    }
    .verdict-icon { font-size: 22px; font-weight: 700; flex-shrink: 0; }
    .verdict-text { strong { font-weight: 700; } }

    /* ── Bottom cards ── */
    .compare-cards { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
    .cc {
      padding: 10px 14px; border-radius: 8px; font-size: 13px; line-height: 1.6;
      background: var(--bg-surface); border: 1px solid var(--border);
      &.good { border-left: 3px solid #5a8a5a; }
      &.bad { border-left: 3px solid #a05a5a; }
      strong { color: var(--text); }
    }
  `,
})
export class StepWhyNormalComponent {
  private readonly d3 = createDihedralGroup(3);
  readonly subgroups = SUBGROUPS;
  readonly COLORS = COLORS;

  readonly selectedSg = signal('rot');
  private triedNormal = signal(false);
  private triedNonNormal = signal(false);
  readonly triedBoth = computed(() => this.triedNormal() && this.triedNonNormal());

  readonly cosets = computed(() => {
    const sg = this.subgroups.find((s) => s.id === this.selectedSg())!;
    const hEls = this.d3.elements.filter((e) => sg.elementIds.includes(e.id));
    const assigned = new Set<string>();
    const result: CosetDef[] = [];
    for (const g of this.d3.elements) {
      if (assigned.has(g.id)) continue;
      const coset = hEls.map((h) => this.d3.multiply(g, h));
      coset.forEach((e) => assigned.add(e.id));
      const isH = coset.some((e) => e.id === 'r0');
      result.push({
        idx: result.length,
        elements: coset,
        shortLabel: isH ? 'H' : result.length === 1 ? 'C\u2081' : 'C\u2082',
        fullLabel: coset.map((e) => e.label).join(', '),
      });
    }
    return result;
  });

  // Generate all coset pairs as clickable options
  readonly cosetPairs = computed(() => {
    const cs = this.cosets();
    const pairs: { key: string; aIdx: number; bIdx: number }[] = [];
    for (const a of cs) {
      for (const b of cs) {
        pairs.push({ key: `${a.idx}-${b.idx}`, aIdx: a.idx, bIdx: b.idx });
      }
    }
    return pairs;
  });

  readonly selectedPair = signal('0-1');

  readonly currentA = computed(() => {
    const [a] = this.selectedPair().split('-').map(Number);
    return Math.min(a, this.cosets().length - 1);
  });
  readonly currentB = computed(() => {
    const [, b] = this.selectedPair().split('-').map(Number);
    return Math.min(b, this.cosets().length - 1);
  });

  readonly cosetsA = computed(() => this.cosets()[this.currentA()].elements);
  readonly cosetsB = computed(() => this.cosets()[this.currentB()].elements);

  readonly productRows = computed(() => {
    const result: ProductRow[] = [];
    for (const a of this.cosetsA()) {
      for (const b of this.cosetsB()) {
        const product = this.d3.multiply(a, b);
        const cosetIdx = this.cosetIndexOf(product.id);
        result.push({ a, b, product, cosetIdx });
      }
    }
    return result;
  });

  readonly isConsistent = computed(() => {
    const indices = new Set(this.productRows().map((r) => r.cosetIdx));
    return indices.size <= 1;
  });

  selectSg(id: string): void {
    this.selectedSg.set(id);
    this.selectedPair.set('0-1');
    if (id === 'rot') this.triedNormal.set(true);
    else this.triedNonNormal.set(true);
  }

  private cosetIndexOf(elId: string): number {
    for (const c of this.cosets()) {
      if (c.elements.some((e) => e.id === elId)) return c.idx;
    }
    return 0;
  }
}
