import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { createCyclicGroup } from '../../../../../core/math/groups/cyclic';

interface VerifyRow {
  a: GroupElement; b: GroupElement;
  ab: GroupElement; phiAB: string;
  phiA: string; phiB: string; phiAplusB: string;
  ok: boolean;
}

@Component({
  selector: 'app-step-homomorphism',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="同態：群之間的翻譯" subtitle="\u00A73.4">
      <p>
        商群把一個群「壓縮」成更小的群。但「壓縮」這件事本身，
        能不能用一個<strong>映射</strong>（函數）來描述？
      </p>
      <p>
        想像你有一台翻譯機。輸入 D\u2083 的操作，輸出 Z\u2082 的元素。
        但這台翻譯機有一個規則：它必須<strong>保持運算結構</strong>。
      </p>
      <p>
        具體來說：如果 \u03C6 是這台翻譯機，那必須滿足
        <strong>\u03C6(a\u2218b) = \u03C6(a) + \u03C6(b)</strong>
        \u2014 先運算再翻譯，跟先翻譯再運算，結果必須一樣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="驗證這個映射是不是同態：旋轉 \u2192 0，翻轉 \u2192 1">
      <!-- Mapping display -->
      <div class="mapping-display">
        <div class="map-panel">
          <div class="map-title">D\u2083</div>
          <div class="map-items">
            @for (el of d3.elements; track el.id) {
              <div class="map-item" [class.rot]="isRotation(el)" [class.ref]="!isRotation(el)">
                {{ el.label }}
              </div>
            }
          </div>
        </div>
        <div class="map-arrows">
          <div class="arrow-label">\u03C6</div>
          <div class="arrow-lines">
            <div class="arrow-group">
              <span class="a-from">e, r, r\u00B2</span>
              <span class="a-to">\u2192 0</span>
            </div>
            <div class="arrow-group">
              <span class="a-from">s, sr, sr\u00B2</span>
              <span class="a-to">\u2192 1</span>
            </div>
          </div>
        </div>
        <div class="map-panel">
          <div class="map-title">Z\u2082</div>
          <div class="map-items">
            <div class="map-item z2">0</div>
            <div class="map-item z2">1</div>
          </div>
        </div>
      </div>

      <!-- Verification table (show a subset, let user expand) -->
      <div class="section-label">驗證 \u03C6(a\u2218b) = \u03C6(a) + \u03C6(b)：</div>
      <div class="verify-controls">
        <button class="show-btn" [class.active]="showAll()" (click)="showAll.set(!showAll())">
          {{ showAll() ? '只看部分' : '展開全部 36 組' }}
        </button>
      </div>
      <div class="table-wrap">
        <table class="verify-table">
          <thead>
            <tr>
              <th>a</th><th>b</th><th>a\u2218b</th>
              <th>\u03C6(a\u2218b)</th><th>\u03C6(a)+\u03C6(b)</th><th>相同？</th>
            </tr>
          </thead>
          <tbody>
            @for (row of visibleRows(); track row.a.id + row.b.id) {
              <tr>
                <td class="el">{{ row.a.label }}</td>
                <td class="el">{{ row.b.label }}</td>
                <td class="el">{{ row.ab.label }}</td>
                <td class="phi">{{ row.phiAB }}</td>
                <td class="phi">{{ row.phiAplusB }}</td>
                <td><span class="badge yes">\u2713</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="verdict ok">
        \u2713 全部 36 組都滿足 \u03C6(a\u2218b) = \u03C6(a) + \u03C6(b) \u2014
        <strong>\u03C6 是同態！</strong>
      </div>
    </app-challenge-card>

    <app-prose-block title="同態的定義">
      <p>
        一個從群 G 到群 G' 的映射 \u03C6: G \u2192 G'，
        如果對所有 a, b \u2208 G 都滿足
      </p>
      <p style="text-align:center; font-size:18px; font-weight:600; color:var(--text);">
        \u03C6(a \u2218 b) = \u03C6(a) \u2218' \u03C6(b)
      </p>
      <p>
        那 \u03C6 就叫做<strong>同態</strong>（homomorphism）。
      </p>
      <p>
        直覺：同態是一台「保結構的翻譯機」。
        它把一個群的運算關係，忠實地搬到另一個群裡。
        翻譯過程中可以丟失資訊（多對一），但不會扭曲結構。
      </p>
      <span class="hint">
        我們的 \u03C6: D\u2083 \u2192 Z\u2082 把 3 個旋轉壓成 0、3 個翻轉壓成 1。
        資訊丟了很多，但「旋轉\u2218翻轉=翻轉」這種結構被完整保留了。
        下一個問題：如果翻譯是完美的（不丟任何資訊）呢？
      </span>
    </app-prose-block>
  `,
  styles: `
    .mapping-display {
      display: flex; align-items: center; gap: 16px; justify-content: center;
      padding: 16px; background: var(--bg); border-radius: 12px;
      border: 1px solid var(--border); margin-bottom: 16px; flex-wrap: wrap;
    }
    .map-panel { text-align: center; }
    .map-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .map-items { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
    .map-item {
      padding: 4px 10px; border-radius: 5px; font-size: 14px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      &.rot { background: var(--v1); color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
      &.ref { background: var(--v0); color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
      &.z2 { background: var(--accent-18); color: var(--text); min-width: 40px; text-align: center; font-size: 18px; }
    }
    .map-arrows { text-align: center; }
    .arrow-label { font-size: 18px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .arrow-lines { display: flex; flex-direction: column; gap: 4px; }
    .arrow-group { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
    .a-from { margin-right: 4px; }
    .a-to { font-weight: 600; color: var(--text); }

    .section-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .verify-controls { margin-bottom: 8px; }
    .show-btn {
      padding: 4px 12px; border: 1px solid var(--border); border-radius: 4px;
      background: transparent; color: var(--text-secondary); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); color: var(--text); }
    }

    .table-wrap { overflow-x: auto; margin-bottom: 12px; border: 1px solid var(--border); border-radius: 8px; }
    .verify-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { padding: 6px 10px; background: var(--accent-10); color: var(--text-secondary); font-size: 11px; font-weight: 600; border-bottom: 1px solid var(--border); }
    td { padding: 5px 10px; border-bottom: 1px solid var(--border); text-align: center; }
    tr:last-child td { border-bottom: none; }
    .el { font-family: 'Noto Sans Math', 'Cambria Math', serif; color: var(--text); font-size: 14px; }
    .phi { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent); }
    .badge { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; font-size: 12px; font-weight: 700;
      &.yes { background: rgba(90,138,90,0.15); color: #5a8a5a; }
    }

    .verdict {
      padding: 10px 14px; border-radius: 8px; font-size: 14px;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.2); }
      strong { font-weight: 700; }
    }
  `,
})
export class StepHomomorphismComponent {
  readonly d3 = createDihedralGroup(3);
  readonly z2 = createCyclicGroup(2);
  readonly showAll = signal(false);

  isRotation(el: GroupElement): boolean {
    return el.id.startsWith('r');
  }

  private phi(el: GroupElement): string {
    return this.isRotation(el) ? '0' : '1';
  }

  private phiAdd(a: string, b: string): string {
    return a === b ? '0' : '1'; // Z₂ addition
  }

  readonly allRows = computed<VerifyRow[]>(() => {
    const rows: VerifyRow[] = [];
    for (const a of this.d3.elements) {
      for (const b of this.d3.elements) {
        const ab = this.d3.multiply(a, b);
        const phiA = this.phi(a);
        const phiB = this.phi(b);
        const phiAB = this.phi(ab);
        const phiAplusB = this.phiAdd(phiA, phiB);
        rows.push({ a, b, ab, phiAB, phiA, phiB, phiAplusB, ok: phiAB === phiAplusB });
      }
    }
    return rows;
  });

  readonly visibleRows = computed(() => {
    if (this.showAll()) return this.allRows();
    // Show a representative subset: pick interesting pairs
    const interesting = ['r1|sr0', 'sr0|r1', 'sr0|sr0', 'r1|r1', 'sr1|sr2', 'r0|sr0', 'r2|sr1', 'sr0|sr1'];
    return this.allRows().filter((r) =>
      interesting.includes(r.a.id + '|' + r.b.id),
    );
  });
}
