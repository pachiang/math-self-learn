import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { createCyclicGroup } from '../../../../../core/math/groups/cyclic';
import { Group } from '../../../../../core/math/group';
import { allColorings, fixedCount, allOrbits, coloringKey } from './coloring-utils';

const BEAD_COLORS = ['var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)'];

@Component({
  selector: 'app-step-necklaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="應用：項鍊計數" subtitle="\u00A75.6">
      <p>
        用 k 種顏色的珠子串成一條 n 顆珠子的項鍊。
        兩條項鍊如果旋轉或翻轉後一模一樣，就算「同一條」。
        問：有幾種<strong>本質不同</strong>的項鍊？
      </p>
      <p>
        這就是 D\u2099 作用在 k-著色上的 Burnside 計數問題！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整珠子數和顏色數，看看有幾種不同的項鍊">
      <div class="controls">
        <div class="ctrl">
          <span class="ctrl-label">珠子數 n =</span>
          @for (n of nOptions; track n) {
            <button class="ctrl-btn" [class.active]="beadCount() === n"
              (click)="beadCount.set(n)">{{ n }}</button>
          }
        </div>
        <div class="ctrl">
          <span class="ctrl-label">顏色數 k =</span>
          @for (k of kOptions; track k) {
            <button class="ctrl-btn" [class.active]="colorCount() === k"
              (click)="colorCount.set(k)">{{ k }}</button>
          }
        </div>
      </div>

      <!-- Burnside computation -->
      <div class="computation">
        <div class="comp-title">Burnside 計算：</div>
        <div class="comp-table-wrap">
          <table class="comp-table">
            <thead>
              <tr><th>g</th><th>|Fix(g)|</th></tr>
            </thead>
            <tbody>
              @for (row of fixRows(); track row.label) {
                <tr>
                  <td class="g-cell">{{ row.label }}</td>
                  <td>{{ row.fix }}</td>
                </tr>
              }
              <tr class="sum-row">
                <td>\u03A3</td><td><strong>{{ totalFix() }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="result-eq">
          {{ totalFix() }} / {{ groupSize() }}
          = <strong>{{ necklaceCount() }}</strong> 種不同的項鍊
        </div>
      </div>

      <!-- Necklace gallery -->
      @if (necklaceCount() <= 30) {
        <div class="gallery-title">全部 {{ necklaceCount() }} 種項鍊：</div>
        <div class="necklace-gallery">
          @for (orb of orbits(); track $index) {
            <div class="necklace-card">
              <svg [attr.viewBox]="necklaceViewBox()" class="necklace-svg">
                @for (bead of beadPositions(); track $index; let i = $index) {
                  <circle [attr.cx]="bead.x" [attr.cy]="bead.y" r="10"
                    [attr.fill]="BEAD_COLORS[orb[0][i]]"
                    stroke="var(--marker-stroke)" stroke-width="1.5" />
                }
                <!-- Connecting lines -->
                @for (seg of segments(); track $index) {
                  <line [attr.x1]="seg.x1" [attr.y1]="seg.y1"
                    [attr.x2]="seg.x2" [attr.y2]="seg.y2"
                    stroke="var(--border)" stroke-width="1" />
                }
              </svg>
            </div>
          }
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        恭喜！你剛剛用<strong>群論</strong>解決了一個組合數學問題。
      </p>
      <p>
        回顧一下整趟旅程：
      </p>
      <div class="journey">
        <div class="j-step"><strong>Ch1</strong> 群的定義 — 從三角形的對稱開始</div>
        <div class="j-step"><strong>Ch2</strong> 子群與陪集 — 群的內部結構</div>
        <div class="j-step"><strong>Ch3</strong> 商群與同態 — 群之間的關係</div>
        <div class="j-step"><strong>Ch4</strong> 置換群 — 所有群都是置換群</div>
        <div class="j-step"><strong>Ch5</strong> 群作用 — 群作用在集合上，解決計數問題</div>
      </div>
      <p>
        從「三角形怎麼轉」到「項鍊有幾種」，
        這就是抽象代數的力量：<strong>用結構思維解決具體問題</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .controls { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
    .ctrl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .ctrl-label { font-size: 14px; font-weight: 500; color: var(--text-secondary); }
    .ctrl-btn {
      width: 36px; height: 32px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 15px; font-weight: 600; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); }
    }

    .computation {
      padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 16px;
    }
    .comp-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
    .comp-table-wrap { overflow-x: auto; margin-bottom: 10px; }
    .comp-table { border-collapse: collapse; width: 100%; max-width: 300px; }
    th { padding: 5px 10px; background: var(--accent-10); color: var(--text-secondary);
      font-size: 11px; font-weight: 600; border-bottom: 1px solid var(--border); text-align: center; }
    td { padding: 5px 10px; text-align: center; border-bottom: 1px solid var(--border);
      font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .g-cell { font-family: 'Noto Sans Math', serif; }
    .sum-row td { background: var(--accent-10); font-weight: 700; }
    tr:last-child td { border-bottom: none; }

    .result-eq {
      text-align: center; font-size: 16px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      strong { color: var(--accent); font-size: 22px; }
    }

    .gallery-title { font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; }
    .necklace-gallery { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .necklace-card {
      padding: 6px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
    }
    .necklace-svg { width: 64px; height: 64px; }

    .journey { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; }
    .j-step {
      padding: 8px 12px; border-left: 3px solid var(--accent-30);
      font-size: 13px; color: var(--text-secondary); background: var(--bg-surface); border-radius: 0 6px 6px 0;
      strong { color: var(--text); }
    }
  `,
})
export class StepNecklacesComponent {
  readonly nOptions = [3, 4, 5, 6];
  readonly kOptions = [2, 3];
  readonly BEAD_COLORS = BEAD_COLORS;

  readonly beadCount = signal(3);
  readonly colorCount = signal(2);

  private readonly group = computed<Group>(() =>
    createDihedralGroup(this.beadCount()),
  );

  readonly groupSize = computed(() => this.group().elements.length);

  private readonly colorings = computed(() =>
    allColorings(this.beadCount(), this.colorCount()),
  );

  readonly fixRows = computed(() =>
    this.group().elements.map((el) => ({
      label: el.label,
      fix: fixedCount(el, this.colorings()),
    })),
  );

  readonly totalFix = computed(() =>
    this.fixRows().reduce((s, r) => s + r.fix, 0),
  );

  readonly necklaceCount = computed(() =>
    this.totalFix() / this.groupSize(),
  );

  readonly orbits = computed(() =>
    allOrbits(this.group(), this.colorings()),
  );

  // Bead positions on a circle
  readonly beadPositions = computed(() => {
    const n = this.beadCount();
    const cx = 32, cy = 32, r = 20;
    return Array.from({ length: n }, (_, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  });

  readonly segments = computed(() => {
    const pos = this.beadPositions();
    return pos.map((p, i) => {
      const next = pos[(i + 1) % pos.length];
      return { x1: p.x, y1: p.y, x2: next.x, y2: next.y };
    });
  });

  necklaceViewBox(): string { return '0 0 64 64'; }
}
