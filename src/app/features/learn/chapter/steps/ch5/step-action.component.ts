import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { applyPerm, PALETTE, MINI_TRI, allColorings, coloringKey } from './coloring-utils';

@Component({
  selector: 'app-step-action',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是群作用" subtitle="\u00A75.1">
      <p>
        到目前為止，群一直是「自己跟自己玩」。但群真正強大的地方在於：
        它可以<strong>作用在其他東西上</strong>。
      </p>
      <p>
        比如 D\u2083 不只是 6 個抽象元素 — 它可以作用在三角形的<strong>頂點著色</strong>上。
        每個群元素把一種著色「搬」成另一種著色。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一種著色，看看 D\u2083 的每個元素會把它變成什麼">
      <!-- Coloring picker -->
      <div class="picker-label">選一種著色（點擊頂點切換顏色）：</div>
      <div class="coloring-picker">
        <svg [attr.viewBox]="tri.viewBox" class="pick-tri">
          <polygon [attr.points]="tri.points" fill="none" stroke="var(--border-strong)" stroke-width="1.5"/>
          @for (v of tri.vertices; track $index; let i = $index) {
            <circle [attr.cx]="v.x" [attr.cy]="v.y" r="12"
              [attr.fill]="PALETTE[selected()[i]]"
              stroke="var(--marker-stroke)" stroke-width="2"
              class="pick-vertex" (click)="toggleVertex(i)" />
          }
        </svg>
        <span class="pick-label-text">{{ selectedLabel() }}</span>
      </div>

      <!-- Action gallery: what each g does to this coloring -->
      <div class="gallery-label">D\u2083 的 6 個元素分別把它變成：</div>
      <div class="gallery">
        @for (item of gallery(); track item.label) {
          <div class="gallery-item" [class.same]="item.same">
            <svg [attr.viewBox]="tri.viewBox" class="mini-tri">
              <polygon [attr.points]="tri.points" fill="none" stroke="var(--border)" stroke-width="1"/>
              @for (v of tri.vertices; track $index; let i = $index) {
                <circle [attr.cx]="v.x" [attr.cy]="v.y" r="9"
                  [attr.fill]="PALETTE[item.result[i]]"
                  stroke="var(--marker-stroke)" stroke-width="1.5" />
              }
            </svg>
            <div class="item-label">{{ item.label }}</div>
            @if (item.same) {
              <div class="same-badge">不動</div>
            }
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這就是<strong>群作用</strong>：群的每個元素 g 定義了一個變換，
        把集合中的每個元素搬到另一個（或留在原地）。
      </p>
      <p>
        正式定義：群 G <strong>作用</strong>在集合 X 上，
        意味著每個 g \u2208 G 對應一個 X 的置換，且滿足：
      </p>
      <div class="axioms">
        <div class="ax">\u2460 e \u00B7 x = x（單位元不動任何東西）</div>
        <div class="ax">\u2461 (gh) \u00B7 x = g \u00B7 (h \u00B7 x)（先作用 h 再作用 g = 直接作用 gh）</div>
      </div>
      <span class="hint">
        看看上面的 gallery：有些著色被某些元素<strong>固定</strong>（不動），
        有些被搬到了別處。這兩個觀察引出了下兩節的核心概念：軌道和穩定子。
      </span>
    </app-prose-block>
  `,
  styles: `
    .picker-label, .gallery-label {
      font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px;
    }
    .coloring-picker {
      display: flex; align-items: center; gap: 16px; margin-bottom: 18px;
    }
    .pick-tri { width: 90px; height: 84px; cursor: pointer; }
    .pick-vertex { cursor: pointer; transition: all 0.15s; &:hover { transform-origin: center; r: 14; } }
    .pick-label-text { font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }

    .gallery {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-bottom: 12px;
      @media (max-width: 500px) { grid-template-columns: repeat(3, 1fr); }
    }
    .gallery-item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 8px 4px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg); transition: all 0.2s;
      &.same { border-color: rgba(90,138,90,0.3); background: rgba(90,138,90,0.05); }
    }
    .mini-tri { width: 50px; height: 47px; }
    .item-label { font-size: 12px; font-family: 'Noto Sans Math', serif; color: var(--text); font-weight: 600; }
    .same-badge { font-size: 10px; color: #5a8a5a; font-weight: 600; }

    .axioms { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    .ax {
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
      font-size: 13px; color: var(--text-secondary); background: var(--bg-surface);
    }
  `,
})
export class StepActionComponent {
  private readonly d3 = createDihedralGroup(3);
  readonly PALETTE = PALETTE;
  readonly tri = MINI_TRI;

  readonly selected = signal([0, 1, 0]); // initial coloring

  readonly selectedLabel = computed(() =>
    this.selected().map((c) => (c === 0 ? '\u25CF' : '\u25CB')).join(' '),
  );

  readonly gallery = computed(() => {
    const c = this.selected();
    const key = coloringKey(c);
    return this.d3.elements.map((el) => {
      const result = applyPerm(el.permutation, c);
      return {
        label: el.label,
        result,
        same: coloringKey(result) === key,
      };
    });
  });

  toggleVertex(i: number): void {
    this.selected.update((c) => {
      const next = [...c];
      next[i] = (next[i] + 1) % 2;
      return next;
    });
  }
}
