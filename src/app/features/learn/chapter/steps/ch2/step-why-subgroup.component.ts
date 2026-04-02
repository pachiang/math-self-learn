import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

const COSET_COLORS = [
  'var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)',
  'var(--v4)', 'var(--v5)', 'var(--v6)', 'var(--v7)',
];

interface RawCoset {
  representative: string;
  elementIds: string[];
  labels: string[];
}

interface PartitionResult {
  cosets: RawCoset[];
  overlapping: Set<string>;
  missing: string[];
  equalSized: boolean;
  isClean: boolean;
}

@Component({
  selector: 'app-step-why-subgroup',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼必須是子群？" subtitle="§2.6">
      <p>
        上一節我們看到，子群可以把群完美地分成大小相等的陪集。
        但你可能會想：<strong>隨便拿一個子集</strong>，是不是也能這樣切？
      </p>
      <p>
        讓我們親手試試。
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="在 D₃ 裡隨意勾選幾個元素組成子集 T，看看「左陪集 gT」會變什麼樣"
      [completed]="triedBadSubset()"
    >
      <!-- Element picker -->
      <div class="picker-section">
        <span class="picker-label">選一個子集 T：</span>
        <div class="picker-row">
          @for (el of d3.elements; track el.id) {
            <button
              class="el-toggle"
              [class.selected]="subset().has(el.id)"
              (click)="toggle(el.id)"
            >
              {{ el.label }}
            </button>
          }
        </div>
        <div class="subset-info">
          T = {{ subsetDisplay() }}
          @if (subset().size > 0) {
            <span class="sg-check" [class.yes]="isSubgroup()" [class.no]="!isSubgroup()">
              {{ isSubgroup() ? '✓ 是子群' : '✗ 不是子群' }}
            </span>
          }
        </div>
      </div>

      <!-- Subgroup check details -->
      @if (subset().size > 0 && !isSubgroup()) {
        <div class="check-details">
          @if (!checks().hasIdentity) {
            <span class="check-fail">✗ 不含單位元 e</span>
          }
          @if (!checks().closed) {
            <span class="check-fail">✗ 不封閉 — {{ checks().closureCounter }}</span>
          }
          @if (!checks().hasInverses) {
            <span class="check-fail">✗ 缺少逆元 — {{ checks().inverseCounter }}</span>
          }
        </div>
      }

      <!-- Quick presets -->
      <div class="presets">
        <span class="picker-label">快速範例：</span>
        <button class="preset-btn bad" (click)="loadPreset(['r0', 'r1'])">
          {{ '{' }}e, r{{ '}' }} — 非子群
        </button>
        <button class="preset-btn bad" (click)="loadPreset(['r1', 'sr0', 'sr1'])">
          {{ '{' }}r, s, sr{{ '}' }} — 非子群
        </button>
        <button class="preset-btn surprise" (click)="loadPreset(['r1', 'sr0'])">
          {{ '{' }}r, s{{ '}' }} — 非子群 🤔
        </button>
        <button class="preset-btn good" (click)="loadPreset(['r0', 'r1', 'r2'])">
          {{ '{' }}e, r, r²{{ '}' }} — 子群
        </button>
      </div>

      <!-- Partition result -->
      @if (result(); as r) {
        <div class="partition-result">
          <div class="result-header"
            [class.clean]="r!.isClean"
            [class.broken]="!r!.isClean"
            [class.surprise]="r!.isClean && !isSubgroup()"
          >
            @if (r!.isClean && isSubgroup()) {
              ✓ 完美分割 — 子群就是有這個能力
            } @else if (r!.isClean && !isSubgroup()) {
              ✓ 居然完美分割了！但 T 不是子群…為什麼？
            } @else {
              ✗ 分割失敗
            }
          </div>

          <!-- Coset list -->
          <div class="coset-list">
            @for (coset of r.cosets; track coset.representative; let i = $index) {
              <div class="coset-row">
                <span class="coset-label" [style.background]="COLORS[i]">
                  {{ coset.representative }}T
                </span>
                <div class="coset-members">
                  @for (id of coset.elementIds; track id; let j = $index) {
                    <span
                      class="member"
                      [class.overlap]="r.overlapping.has(id)"
                    >
                      {{ coset.labels[j] }}
                    </span>
                  }
                </div>
                <span class="coset-size">|{{ coset.elementIds.length }}|</span>
              </div>
            }
          </div>

          <!-- Problems -->
          @if (!r.isClean) {
            <div class="problems">
              @if (r.overlapping.size > 0) {
                <div class="problem">
                  <span class="problem-icon">⚠</span>
                  <span>重疊：{{ overlapLabels(r) }} 出現在多個「陪集」裡</span>
                </div>
              }
              @if (r.missing.length > 0) {
                <div class="problem">
                  <span class="problem-icon">⚠</span>
                  <span>遺漏：{{ missingLabels(r) }} 不在任何「陪集」裡</span>
                </div>
              }
              @if (!r.equalSized) {
                <div class="problem">
                  <span class="problem-icon">⚠</span>
                  <span>大小不等：陪集的大小不一致</span>
                </div>
              }
            </div>
          }

          <!-- Surprise explanation for non-subgroup clean partitions -->
          @if (r!.isClean && !isSubgroup() && cosetOfSubgroup()) {
            <div class="surprise-box">
              <strong>為什麼？</strong>
              T 不是子群，但它其實是子群
              {{ cosetOfSubgroup()!.subgroupLabel }} 的一個<strong>陪集</strong>：
              T = {{ cosetOfSubgroup()!.expression }}。
              陪集的「陪集」= 原子群的陪集，所以分割當然是完美的。
            </div>
          }

          <!-- Visual map -->
          <div class="visual-map">
            @for (el of d3.elements; track el.id) {
              <div
                class="map-cell"
                [style.background]="cellColor(el.id, r)"
                [class.overlap]="r.overlapping.has(el.id)"
                [class.missing]="isMissing(el.id, r)"
              >
                {{ el.label }}
              </div>
            }
          </div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        總結一下：
      </p>
      <div class="reason-cards">
        <div class="reason fail">
          <strong>非子群的子集（如 {{ '{' }}e, r{{ '}' }}）</strong>
          — 「陪集」通常會<strong>重疊</strong>或<strong>遺漏</strong>，不能完美分割。
        </div>
        <div class="reason special">
          <strong>不是子群、但恰好是某個子群的陪集（如 {{ '{' }}r, s{{ '}' }}）</strong>
          — 碰巧能完美分割，因為本質上還是在用子群分。
        </div>
        <div class="reason good">
          <strong>子群</strong>
          — <strong>保證</strong>完美分割。因為：
        </div>
      </div>
      <div class="reason-details">
        <div class="detail">
          <strong>e ∈ H</strong> → g = ge ∈ gH → 每個元素都在自己的陪集裡 → <strong>不遺漏</strong>
        </div>
        <div class="detail">
          <strong>封閉 + 逆元</strong> → 兩個陪集要嘛完全相同，要嘛完全不交 → <strong>不重疊</strong>
        </div>
        <div class="detail">
          <strong>乘法可逆</strong> → 每個陪集大小都 = |H| → <strong>大小一致</strong>
        </div>
      </div>
      <span class="hint">
        這就是為什麼陪集理論需要子群。
        下一節我們會看到，這個「完美分割」直接導出一個漂亮的定理：拉格朗日定理。
      </span>
    </app-prose-block>
  `,
  styles: `
    .picker-section { margin-bottom: 14px; }

    .picker-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .picker-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
    }

    .el-toggle {
      padding: 6px 14px;
      border: 2px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      font-size: 16px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      cursor: pointer;
      transition: all 0.12s ease;
      min-width: 44px;

      &:hover { border-color: var(--border-strong); }

      &.selected {
        border-color: var(--accent);
        background: var(--accent-18);
        font-weight: 700;
      }
    }

    .subset-info {
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sg-check {
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;

      &.yes { color: #5a8a5a; background: rgba(90, 138, 90, 0.12); }
      &.no  { color: #a05a5a; background: rgba(160, 90, 90, 0.12); }
    }

    .check-details {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .check-fail {
      font-size: 12px;
      color: #a05a5a;
      background: rgba(160, 90, 90, 0.08);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .presets {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-bottom: 16px;
    }

    .preset-btn {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.12s;

      &:hover { background: var(--accent-10); }
      &.bad { border-left: 3px solid #a05a5a; }
      &.good { border-left: 3px solid #5a8a5a; }
      &.surprise { border-left: 3px solid var(--accent); }
    }

    /* Partition results */
    .partition-result {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      background: var(--bg);
    }

    .result-header {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;

      &.clean { color: #5a8a5a; }
      &.broken { color: #a05a5a; }
      &.surprise { color: var(--accent); }
    }

    .coset-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .coset-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .coset-label {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      min-width: 40px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }

    .coset-members { display: flex; gap: 4px; }

    .member {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      background: var(--bg-surface);
      color: var(--text);

      &.overlap {
        background: rgba(160, 90, 90, 0.15);
        outline: 2px solid rgba(160, 90, 90, 0.4);
      }
    }

    .coset-size {
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .problems {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .problem {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 13px;
      color: #a05a5a;
    }

    .problem-icon { flex-shrink: 0; }

    .surprise-box {
      padding: 10px 14px;
      border-radius: 8px;
      background: rgba(140, 126, 115, 0.08);
      border-left: 3px solid var(--accent);
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 12px;

      strong { color: var(--text); }
    }

    .visual-map {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    }

    .map-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      color: white;
      font-family: 'JetBrains Mono', monospace;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: background 0.3s ease;

      &.overlap { animation: pulse-warn 1s ease infinite; }

      &.missing {
        background: var(--bg-elevated) !important;
        color: var(--text-muted) !important;
        text-shadow: none;
        border: 2px dashed var(--border-strong);
      }
    }

    @keyframes pulse-warn {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    /* Bottom explanation */
    .reason-cards {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 12px 0;
    }

    .reason {
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      background: var(--bg-surface);

      strong { color: var(--text); }

      &.fail { border-left: 3px solid #a05a5a; }
      &.special { border-left: 3px solid var(--accent); }
      &.good { border-left: 3px solid #5a8a5a; }
    }

    .reason-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 8px 0 16px;
      padding-left: 16px;
    }

    .detail {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      strong { color: var(--text); }
    }
  `,
})
export class StepWhySubgroupComponent {
  readonly d3: Group = createDihedralGroup(3);
  readonly COLORS = COSET_COLORS;

  readonly subset = signal<Set<string>>(new Set());
  readonly triedBadSubset = signal(false);

  readonly selectedLabels = computed(() =>
    this.d3.elements
      .filter((e) => this.subset().has(e.id))
      .map((e) => e.label),
  );

  readonly subsetDisplay = computed(
    () => '\u007B' + this.selectedLabels().join(', ') + '\u007D',
  );

  readonly checks = computed(() => {
    const ids = this.subset();
    const elements = this.d3.elements.filter((e) => ids.has(e.id));

    const hasIdentity = ids.has('r0');

    let closed = true;
    let closureCounter = '';
    outer: for (const a of elements) {
      for (const b of elements) {
        const prod = this.d3.multiply(a, b);
        if (!ids.has(prod.id)) {
          closed = false;
          closureCounter = `${a.label}\u2218${b.label} = ${prod.label} \u2209 T`;
          break outer;
        }
      }
    }

    let hasInverses = true;
    let inverseCounter = '';
    for (const a of elements) {
      const inv = this.d3.inverse(a);
      if (!ids.has(inv.id)) {
        hasInverses = false;
        inverseCounter = `${a.label}\u207B\u00B9 = ${inv.label} \u2209 T`;
        break;
      }
    }

    return { hasIdentity, closed, closureCounter, hasInverses, inverseCounter };
  });

  readonly isSubgroup = computed(() => {
    const c = this.checks();
    return (
      this.subset().size > 0 && c.hasIdentity && c.closed && c.hasInverses
    );
  });

  /** Check if T = gH for some subgroup H (explains non-subgroup clean partitions). */
  readonly cosetOfSubgroup = computed<{
    subgroupLabel: string;
    expression: string;
  } | null>(() => {
    if (this.isSubgroup() || this.subset().size === 0) return null;

    const tIds = this.subset();
    const tElements = this.d3.elements.filter((e) => tIds.has(e.id));

    // For each element g in T, compute g⁻¹T and check if it's a subgroup
    for (const g of tElements) {
      const gInv = this.d3.inverse(g);
      const candidate = tElements.map((t) => this.d3.multiply(gInv, t));
      const candidateIds = new Set(candidate.map((e) => e.id));

      // Check if candidate is a subgroup
      if (!candidateIds.has('r0')) continue;

      let isSub = true;
      for (const a of candidate) {
        for (const b of candidate) {
          if (!candidateIds.has(this.d3.multiply(a, b).id)) {
            isSub = false;
            break;
          }
        }
        if (!isSub) break;
      }

      if (isSub) {
        const hLabel =
          '\u007B' + candidate.map((e) => e.label).join(', ') + '\u007D';
        return {
          subgroupLabel: hLabel,
          expression: `${g.label}\u00B7${hLabel}`,
        };
      }
    }

    return null;
  });

  readonly result = computed<PartitionResult | null>(() => {
    if (this.subset().size === 0) return null;

    const subIds = this.subset();
    const subElements = this.d3.elements.filter((e) => subIds.has(e.id));

    const seenKeys = new Set<string>();
    const cosets: RawCoset[] = [];
    const coverage = new Map<string, number[]>();

    for (const g of this.d3.elements) {
      const cosetEls = subElements.map((t) => this.d3.multiply(g, t));
      const ids = cosetEls.map((e) => e.id);
      const key = [...ids].sort().join(',');

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        const idx = cosets.length;
        cosets.push({
          representative: g.label,
          elementIds: ids,
          labels: cosetEls.map((e) => e.label),
        });
        for (const id of ids) {
          if (!coverage.has(id)) coverage.set(id, []);
          coverage.get(id)!.push(idx);
        }
      }
    }

    const overlapping = new Set<string>();
    const missing: string[] = [];

    for (const el of this.d3.elements) {
      const c = coverage.get(el.id);
      if (!c || c.length === 0) missing.push(el.id);
      else if (c.length > 1) overlapping.add(el.id);
    }

    const sizes = cosets.map((c) => c.elementIds.length);
    const equalSized = sizes.every((s) => s === sizes[0]);
    const isClean =
      overlapping.size === 0 && missing.length === 0 && equalSized;

    return { cosets, overlapping, missing, equalSized, isClean };
  });

  toggle(id: string): void {
    this.subset.update((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    this.checkBadAttempt();
  }

  loadPreset(ids: string[]): void {
    this.subset.set(new Set(ids));
    this.checkBadAttempt();
  }

  cellColor(id: string, r: PartitionResult): string {
    if (r.missing.includes(id)) return 'transparent';
    for (let i = 0; i < r.cosets.length; i++) {
      if (r.cosets[i].elementIds.includes(id)) return COSET_COLORS[i];
    }
    return 'transparent';
  }

  isMissing(id: string, r: PartitionResult): boolean {
    return r.missing.includes(id);
  }

  overlapLabels(r: PartitionResult): string {
    return this.d3.elements
      .filter((e) => r.overlapping.has(e.id))
      .map((e) => e.label)
      .join(', ');
  }

  missingLabels(r: PartitionResult): string {
    return r.missing
      .map((id) => this.d3.elements.find((e) => e.id === id)?.label ?? id)
      .join(', ');
  }

  private checkBadAttempt(): void {
    if (this.subset().size > 0 && !this.isSubgroup()) {
      this.triedBadSubset.set(true);
    }
  }
}
