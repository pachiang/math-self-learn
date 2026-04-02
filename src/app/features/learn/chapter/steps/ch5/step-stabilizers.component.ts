import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { allColorings, stabilizer, orbit, coloringKey, PALETTE, MINI_TRI } from './coloring-utils';

@Component({
  selector: 'app-step-stabilizers',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="穩定子：誰讓它不動" subtitle="\u00A75.3">
      <p>
        上一節我們看了一個著色能被「搬到」哪些地方（軌道）。
        現在反過來問：<strong>哪些群元素讓這個著色完全不動？</strong>
      </p>
      <p>
        這些「讓它不動」的元素構成一個集合，叫做<strong>穩定子</strong>（stabilizer），
        記作 Stab(x)。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同的著色，觀察穩定子怎麼變化">
      <div class="picker">
        @for (c of sampleColorings; track cKey(c); let i = $index) {
          <div class="pick-card"
            [class.active]="cKey(c) === cKey(selected())"
            (click)="selected.set(c)"
          >
            <svg [attr.viewBox]="tri.viewBox" class="pick-tri">
              <polygon [attr.points]="tri.points" fill="none" stroke="var(--border)" stroke-width="1"/>
              @for (v of tri.vertices; track $index; let vi = $index) {
                <circle [attr.cx]="v.x" [attr.cy]="v.y" r="8"
                  [attr.fill]="PALETTE[c[vi]]" stroke="var(--marker-stroke)" stroke-width="1" />
              }
            </svg>
          </div>
        }
      </div>

      <!-- Stabilizer display -->
      <div class="stab-section">
        <div class="stab-label">Stab(x) = 讓這個著色不動的元素：</div>
        <div class="stab-elements">
          @for (el of currentStab(); track el.id) {
            <span class="stab-el">{{ el.label }}</span>
          }
        </div>
        <div class="stab-info">|Stab(x)| = {{ currentStab().length }}</div>
      </div>

      <!-- Orbit display -->
      <div class="orbit-section">
        <div class="orbit-label">軌道大小 = |Orb(x)| = {{ currentOrbitSize() }}</div>
      </div>

      <!-- Equation -->
      <div class="equation">
        |Orb(x)| \u00D7 |Stab(x)| = {{ currentOrbitSize() }} \u00D7 {{ currentStab().length }}
        = <strong>{{ currentOrbitSize() * currentStab().length }}</strong> = |D\u2083|
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        穩定子有兩個重要性質：
      </p>
      <div class="props">
        <div class="prop">\u2460 <strong>穩定子是子群</strong> — 它對乘法封閉，包含 e，有逆元</div>
        <div class="prop">\u2461 <strong>著色越「對稱」，穩定子越大</strong> — 全同色的穩定子 = 整個群，全不同色的穩定子 = {{ '{' }}e{{ '}' }}</div>
      </div>
      <span class="hint">
        你有沒有注意到上面的等式？|軌道| \u00D7 |穩定子| 永遠等於 |G|。
        這不是巧合 — 下一節會正式證明它。
      </span>
    </app-prose-block>
  `,
  styles: `
    .picker { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .pick-card {
      padding: 4px; border: 2px solid var(--border); border-radius: 6px; cursor: pointer;
      transition: all 0.12s; background: var(--bg);
      &:hover { border-color: var(--border-strong); }
      &.active { border-color: var(--accent); background: var(--accent-18); }
    }
    .pick-tri { width: 48px; height: 44px; }

    .stab-section, .orbit-section {
      padding: 10px 14px; background: var(--bg); border: 1px solid var(--border);
      border-radius: 8px; margin-bottom: 10px;
    }
    .stab-label, .orbit-label { font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
    .stab-elements { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
    .stab-el {
      padding: 4px 12px; border-radius: 5px; background: rgba(90,138,90,0.12);
      font-size: 15px; font-weight: 600; color: #5a8a5a;
      font-family: 'Noto Sans Math', serif;
    }
    .stab-info { font-size: 12px; color: var(--text-muted); }

    .equation {
      padding: 14px 18px; border-radius: 10px; background: var(--accent-10);
      border: 1px solid var(--accent-30); text-align: center;
      font-size: 16px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      strong { color: var(--accent); font-size: 20px; }
    }

    .props { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    .prop {
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
      font-size: 13px; color: var(--text-secondary); background: var(--bg-surface);
      strong { color: var(--text); }
    }
  `,
})
export class StepStabilizersComponent {
  private readonly d3 = createDihedralGroup(3);
  readonly PALETTE = PALETTE;
  readonly tri = MINI_TRI;

  readonly sampleColorings = [
    [0,0,0], [0,0,1], [0,1,0], [1,0,0], [0,1,1], [1,0,1], [1,1,0], [1,1,1],
  ];

  readonly selected = signal([0, 0, 1]);

  readonly currentStab = computed(() => stabilizer(this.d3, this.selected()));
  readonly currentOrbitSize = computed(() => orbit(this.d3, this.selected()).length);

  cKey(c: number[]): string { return coloringKey(c); }
}
