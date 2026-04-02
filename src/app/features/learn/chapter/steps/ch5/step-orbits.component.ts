import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { allColorings, orbit, coloringKey, applyPerm, PALETTE, MINI_TRI, allOrbits } from './coloring-utils';

@Component({
  selector: 'app-step-orbits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="軌道：一個東西能被搬到哪裡" subtitle="\u00A75.2">
      <p>
        如果你拿一種著色，用 D\u2083 的所有元素去「搬」它，
        你能到達的所有著色構成這個著色的<strong>軌道</strong>（orbit）。
      </p>
      <p>
        同一個軌道裡的著色，從對稱的角度看是「本質上一樣的」
        — 只是被旋轉或翻轉了。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點一個著色，看看它的軌道包含哪些">
      <!-- All 8 colorings grid -->
      <div class="all-label">全部 {{ colorings.length }} 種 2-著色（點擊選取）：</div>
      <div class="all-grid">
        @for (c of colorings; track cKey(c); let i = $index) {
          <div class="color-card"
            [class.selected]="cKey(c) === cKey(selectedColoring())"
            [class.in-orbit]="inOrbit(c)"
            (click)="selectedColoring.set(c)"
          >
            <svg [attr.viewBox]="tri.viewBox" class="mini-tri">
              <polygon [attr.points]="tri.points" fill="none" stroke="var(--border)" stroke-width="1"/>
              @for (v of tri.vertices; track $index; let vi = $index) {
                <circle [attr.cx]="v.x" [attr.cy]="v.y" r="8"
                  [attr.fill]="PALETTE[c[vi]]" stroke="var(--marker-stroke)" stroke-width="1" />
              }
            </svg>
          </div>
        }
      </div>

      <!-- Orbit display -->
      <div class="orbit-section">
        <div class="orbit-label">
          軌道（{{ currentOrbit().length }} 個著色「本質上一樣」）：
        </div>
        <div class="orbit-row">
          @for (c of currentOrbit(); track cKey(c)) {
            <div class="orbit-item">
              <svg [attr.viewBox]="tri.viewBox" class="orbit-tri">
                <polygon [attr.points]="tri.points" fill="none" stroke="var(--accent-30)" stroke-width="1.5"/>
                @for (v of tri.vertices; track $index; let vi = $index) {
                  <circle [attr.cx]="v.x" [attr.cy]="v.y" r="9"
                    [attr.fill]="PALETTE[c[vi]]" stroke="var(--marker-stroke)" stroke-width="1.5" />
                }
              </svg>
            </div>
          }
        </div>
      </div>

      <!-- All orbits overview -->
      <div class="overview">
        <div class="overview-title">全部軌道（共 {{ orbits().length }} 個）：</div>
        <div class="orbit-groups">
          @for (orb of orbits(); track $index; let i = $index) {
            <div class="orb-group"
              [class.highlighted]="isCurrentOrbit(orb)"
            >
              <span class="orb-badge">軌道 {{ i + 1 }}</span>
              <span class="orb-size">{{ orb.length }} 個</span>
              <div class="orb-minis">
                @for (c of orb; track cKey(c)) {
                  <svg [attr.viewBox]="tri.viewBox" class="tiny-tri">
                    <polygon [attr.points]="tri.points" fill="none" stroke="var(--border)" stroke-width="0.8"/>
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
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        8 種著色被分成了 <strong>{{ orbits().length }} 個軌道</strong>。
        每個軌道就是一組「旋轉翻轉後看起來一樣的」著色。
      </p>
      <p>
        軌道把集合完美地<strong>劃分</strong>了（不重疊、不遺漏）—
        這又是一個等價關係！「能通過群作用互相到達」就是等價條件。
      </p>
      <span class="hint">
        軌道的大小不一定都相同。什麼決定了軌道的大小？
        答案是：那些讓著色<strong>不動</strong>的群元素有多少。這就是「穩定子」。
      </span>
    </app-prose-block>
  `,
  styles: `
    .all-label, .orbit-label, .overview-title {
      font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px;
    }
    .all-grid {
      display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; margin-bottom: 16px;
      @media (max-width: 500px) { grid-template-columns: repeat(4, 1fr); }
    }
    .color-card {
      display: flex; justify-content: center; padding: 4px; border: 2px solid transparent;
      border-radius: 6px; cursor: pointer; transition: all 0.15s; background: var(--bg);
      &:hover { border-color: var(--border-strong); }
      &.selected { border-color: var(--accent); background: var(--accent-18); }
      &.in-orbit { border-color: var(--accent-30); }
    }
    .mini-tri { width: 42px; height: 40px; }

    .orbit-section {
      padding: 12px; background: var(--accent-10); border-radius: 10px;
      border: 1px solid var(--accent-30); margin-bottom: 16px;
    }
    .orbit-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .orbit-item { padding: 4px; background: var(--bg-surface); border-radius: 6px; }
    .orbit-tri { width: 54px; height: 50px; }

    .overview { margin-top: 4px; }
    .orbit-groups { display: flex; flex-direction: column; gap: 8px; }
    .orb-group {
      display: flex; align-items: center; gap: 8px; padding: 8px 10px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg);
      transition: all 0.2s; flex-wrap: wrap;
      &.highlighted { border-color: var(--accent); background: var(--accent-10); }
    }
    .orb-badge {
      font-size: 11px; font-weight: 700; color: var(--accent);
      background: var(--accent-18); padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
    }
    .orb-size { font-size: 12px; color: var(--text-muted); flex-shrink: 0; }
    .orb-minis { display: flex; gap: 3px; flex-wrap: wrap; }
    .tiny-tri { width: 34px; height: 32px; }
  `,
})
export class StepOrbitsComponent {
  private readonly d3 = createDihedralGroup(3);
  readonly PALETTE = PALETTE;
  readonly tri = MINI_TRI;
  readonly colorings = allColorings(3, 2);

  readonly selectedColoring = signal([0, 0, 1]);

  readonly currentOrbit = computed(() =>
    orbit(this.d3, this.selectedColoring()),
  );

  readonly orbits = computed(() => allOrbits(this.d3, this.colorings));

  cKey(c: number[]): string { return coloringKey(c); }

  inOrbit(c: number[]): boolean {
    return this.currentOrbit().some((o) => coloringKey(o) === coloringKey(c));
  }

  isCurrentOrbit(orb: number[][]): boolean {
    const key = coloringKey(this.selectedColoring());
    return orb.some((c) => coloringKey(c) === key);
  }
}
