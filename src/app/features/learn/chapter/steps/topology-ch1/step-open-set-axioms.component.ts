import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// All subsets of {a, b, c} as bitmasks (0..7)
const LABELS = ['a', 'b', 'c'];
function subsetName(mask: number): string {
  if (mask === 0) return '∅';
  if (mask === 7) return '{a,b,c}';
  const parts: string[] = [];
  for (let i = 0; i < 3; i++) if (mask & (1 << i)) parts.push(LABELS[i]);
  return '{' + parts.join(',') + '}';
}

@Component({
  selector: 'app-step-open-set-axioms',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="開集公理" subtitle="§1.2">
      <p>
        <strong>拓撲空間</strong> (X, τ) 由一個集合 X 和一族子集 τ ⊂ P(X) 組成，其中 τ 滿足：
      </p>
      <div class="axiom-stack">
        <div class="axiom-card">
          <div class="ax-num">公理 1</div>
          <div class="ax-body">∅ ∈ τ 且 X ∈ τ</div>
          <div class="ax-note">空集和全集都是開集</div>
        </div>
        <div class="axiom-card">
          <div class="ax-num">公理 2</div>
          <div class="ax-body">任意多個開集的<strong>聯集</strong>仍是開集</div>
          <div class="ax-note">可以無限多個！</div>
        </div>
        <div class="axiom-card">
          <div class="ax-num">公理 3</div>
          <div class="ax-body"><strong>有限</strong>多個開集的<strong>交集</strong>仍是開集</div>
          <div class="ax-note">只能有限個！</div>
        </div>
      </div>
      <div class="why-finite">
        <strong>為什麼交集只能有限？</strong>
        反例：R 上 (−1/n, 1/n) 的無限交集 = 單點集，但單點集在標準拓撲中不是開集。
      </div>
    </app-prose-block>

    <!-- ===== 互動：拓撲建造器 ===== -->
    <app-challenge-card prompt="在三點集 X = (a, b, c) 上親手建一個拓撲——勾選你想當「開集」的子集">
      <p class="builder-intro">
        X 的所有 8 個子集列在下面。<strong>勾選</strong>你認為是「開集」的那些，
        系統會即時告訴你三條公理是否滿足。
      </p>

      <!-- Subset selector grid -->
      <div class="subset-grid">
        @for (s of allSubsets; track s.mask) {
          <label class="subset-chip" [class.selected]="isSelected(s.mask)"
                 [class.required]="s.mask === 0 || s.mask === 7">
            <input type="checkbox" [checked]="isSelected(s.mask)"
                   (change)="toggleSubset(s.mask)"
                   [disabled]="s.mask === 0 || s.mask === 7" />
            <span class="chip-label">{{ s.name }}</span>
            <!-- Venn circles showing which elements are in this subset -->
            <svg viewBox="0 0 48 20" class="chip-venn">
              <circle cx="12" cy="10" r="7" [attr.fill]="hasBit(s.mask, 0) ? '#5a7faa' : 'transparent'"
                      [attr.fill-opacity]="hasBit(s.mask, 0) ? 0.3 : 0" stroke="var(--border)" stroke-width="0.8" />
              <circle cx="24" cy="10" r="7" [attr.fill]="hasBit(s.mask, 1) ? '#5a8a5a' : 'transparent'"
                      [attr.fill-opacity]="hasBit(s.mask, 1) ? 0.3 : 0" stroke="var(--border)" stroke-width="0.8" />
              <circle cx="36" cy="10" r="7" [attr.fill]="hasBit(s.mask, 2) ? '#c8983b' : 'transparent'"
                      [attr.fill-opacity]="hasBit(s.mask, 2) ? 0.3 : 0" stroke="var(--border)" stroke-width="0.8" />
            </svg>
          </label>
        }
      </div>

      <!-- Axiom checker -->
      <div class="check-panel">
        <div class="check-row" [class.pass]="axiom1()" [class.fail]="!axiom1()">
          <span class="check-icon">{{ axiom1() ? '✓' : '✗' }}</span>
          <span class="check-text">公理 1：∅ 和 X 都在 τ 裡</span>
        </div>
        <div class="check-row" [class.pass]="axiom2()" [class.fail]="!axiom2()">
          <span class="check-icon">{{ axiom2() ? '✓' : '✗' }}</span>
          <span class="check-text">公理 2：任意兩個的聯集也在 τ 裡</span>
          @if (!axiom2() && unionViolation()) {
            <span class="violation">{{ unionViolation() }}</span>
          }
        </div>
        <div class="check-row" [class.pass]="axiom3()" [class.fail]="!axiom3()">
          <span class="check-icon">{{ axiom3() ? '✓' : '✗' }}</span>
          <span class="check-text">公理 3：任意兩個的交集也在 τ 裡</span>
          @if (!axiom3() && intersectionViolation()) {
            <span class="violation">{{ intersectionViolation() }}</span>
          }
        </div>
      </div>

      <!-- Verdict -->
      <div class="verdict" [class.ok]="isTopology()" [class.bad]="!isTopology()">
        @if (isTopology()) {
          ✓ 恭喜！你選的 {{ selectedCount() }} 個子集構成一個合法的拓撲。
          @if (selectedCount() === 2) { （這是密著拓撲——最粗的！） }
          @if (selectedCount() === 8) { （這是離散拓撲——最細的！） }
        } @else {
          ✗ 還不是拓撲——看上面哪條公理沒通過。
        }
      </div>

      <!-- Presets -->
      <div class="preset-row">
        <span class="preset-label">快速載入：</span>
        <button class="pre-btn" (click)="loadPreset([0,7])">密著</button>
        <button class="pre-btn" (click)="loadPreset([0,1,2,3,4,5,6,7])">離散</button>
        <button class="pre-btn" (click)="loadPreset([0,1,3,7])">一個拓撲</button>
        <button class="pre-btn" (click)="loadPreset([0,1,2,7])">另一個</button>
        <button class="pre-btn" (click)="loadPreset([0,3,7])">再一個</button>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        就這三條規則。τ 裡的元素叫<strong>開集</strong>，τ 本身叫 X 上的<strong>拓撲</strong>。
        在三點集上你大概能找到 29 個不同的拓撲——試試看能找到幾個！
      </p>
    </app-prose-block>
  `,
  styles: `
    .axiom-stack { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }
    .axiom-card { padding: 12px; border: 2px solid var(--accent); border-radius: 10px; background: var(--accent-10); }
    .ax-num { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }
    .ax-body { font-size: 14px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .ax-note { font-size: 12px; color: var(--text-muted); }
    .why-finite { padding: 10px; border-radius: 8px; background: rgba(160,90,90,0.06); border: 1px solid rgba(160,90,90,0.2);
      font-size: 12px; color: var(--text-secondary); margin-top: 8px; }
    .why-finite strong { color: #a05a5a; }

    .builder-intro { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }

    .subset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 14px; }
    @media (max-width: 500px) { .subset-grid { grid-template-columns: repeat(2, 1fr); } }
    .subset-chip { display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 8px 4px; border: 2px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      cursor: pointer; transition: all 0.15s; text-align: center;
      &:hover { border-color: var(--accent); background: var(--accent-10); }
      &.selected { border-color: var(--accent); background: var(--accent-10); }
      &.required { border-style: dashed; opacity: 0.7; }
      input { display: none; } }
    .chip-label { font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .chip-venn { width: 48px; height: 20px; }

    .check-panel { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .check-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px;
      border-radius: 8px; border: 1px solid var(--border); transition: all 0.2s;
      &.pass { background: rgba(90,138,90,0.06); border-color: rgba(90,138,90,0.3); }
      &.fail { background: rgba(160,90,90,0.06); border-color: rgba(160,90,90,0.3); } }
    .check-icon { font-size: 16px; font-weight: 700; min-width: 20px;
      .pass & { color: #5a8a5a; } .fail & { color: #a05a5a; } }
    .check-text { font-size: 12px; color: var(--text);
      .pass & { color: #5a8a5a; } .fail & { color: #a05a5a; } }
    .violation { font-size: 11px; color: #a05a5a; display: block; margin-top: 2px;
      font-family: 'JetBrains Mono', monospace; }

    .verdict { padding: 12px; border-radius: 10px; text-align: center; font-size: 14px; font-weight: 600;
      margin-bottom: 12px;
      &.ok { background: rgba(90,138,90,0.1); color: #5a8a5a; border: 2px solid rgba(90,138,90,0.3); }
      &.bad { background: rgba(160,90,90,0.06); color: #a05a5a; border: 1px solid rgba(160,90,90,0.2); } }

    .preset-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .preset-label { font-size: 11px; color: var(--text-muted); }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      &:hover { background: var(--accent-10); } }
  `,
})
export class StepOpenSetAxiomsComponent {
  readonly allSubsets = Array.from({ length: 8 }, (_, i) => ({ mask: i, name: subsetName(i) }));
  readonly selected = signal(new Set([0, 7])); // start with ∅ and X (required)

  isSelected(mask: number): boolean { return this.selected().has(mask); }
  hasBit(mask: number, bit: number): boolean { return (mask & (1 << bit)) !== 0; }
  readonly selectedCount = computed(() => this.selected().size);

  toggleSubset(mask: number): void {
    if (mask === 0 || mask === 7) return; // always required
    const s = new Set(this.selected());
    if (s.has(mask)) s.delete(mask); else s.add(mask);
    this.selected.set(s);
  }

  loadPreset(masks: number[]): void {
    this.selected.set(new Set(masks));
  }

  // Axiom 1: ∅ and X are in τ
  readonly axiom1 = computed(() => this.selected().has(0) && this.selected().has(7));

  // Axiom 2: union of any two selected subsets is also selected
  readonly axiom2 = computed(() => {
    const s = this.selected();
    for (const a of s) for (const b of s) {
      if (!s.has(a | b)) return false;
    }
    return true;
  });

  readonly unionViolation = computed(() => {
    const s = this.selected();
    for (const a of s) for (const b of s) {
      if (!s.has(a | b)) {
        return `${subsetName(a)} ∪ ${subsetName(b)} = ${subsetName(a | b)} 不在 τ 裡！`;
      }
    }
    return '';
  });

  // Axiom 3: intersection of any two selected subsets is also selected
  readonly axiom3 = computed(() => {
    const s = this.selected();
    for (const a of s) for (const b of s) {
      if (!s.has(a & b)) return false;
    }
    return true;
  });

  readonly intersectionViolation = computed(() => {
    const s = this.selected();
    for (const a of s) for (const b of s) {
      if (!s.has(a & b)) {
        return `${subsetName(a)} ∩ ${subsetName(b)} = ${subsetName(a & b)} 不在 τ 裡！`;
      }
    }
    return '';
  });

  readonly isTopology = computed(() => this.axiom1() && this.axiom2() && this.axiom3());
}
