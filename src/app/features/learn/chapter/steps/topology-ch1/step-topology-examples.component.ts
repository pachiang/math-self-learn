import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const LABELS = ['a', 'b', 'c'];
function subsetName(mask: number): string {
  if (mask === 0) return '∅';
  if (mask === 7) return '{a,b,c}';
  return '{' + LABELS.filter((_, i) => mask & (1 << i)).join(',') + '}';
}

interface TopoEx {
  name: string; openSets: number[]; // bitmasks of open sets
  desc: string; interesting: string;
}

const EXAMPLES: TopoEx[] = [
  { name: '離散拓撲',
    openSets: [0, 1, 2, 3, 4, 5, 6, 7],
    desc: '所有 8 個子集都是開集。',
    interesting: '「最細」的拓撲。每個單點集都是開集——點之間完全可以區分。太自由了。' },
  { name: '密著拓撲',
    openSets: [0, 7],
    desc: '只有 ∅ 和 X 是開集。2 個開集。',
    interesting: '「最粗」的拓撲。幾乎沒有開集——所有點「黏在一起」，無法區分。' },
  { name: '拓撲 τ₃',
    openSets: [0, 1, 3, 7],
    desc: '∅, {a}, {a,b}, {a,b,c}。4 個開集。',
    interesting: '一個「不對稱」的拓撲：a 可以和其他點分開（{a} 是開的），但 b 和 c 不行。' },
  { name: '拓撲 τ₄',
    openSets: [0, 1, 2, 3, 7],
    desc: '∅, {a}, {b}, {a,b}, {a,b,c}。5 個開集。',
    interesting: 'a 和 b 各自可分開，但 c 沒有自己的開集——c 被「包裹」在 X 裡。' },
  { name: '餘有限拓撲',
    openSets: [0, 3, 5, 6, 7], // complements of singletons + ∅ + X
    desc: '∅ 和「拿掉 ≤ 有限多點」的集合。',
    interesting: '在三點集上 = ∅ 加上所有 ≥ 2 元素的子集。比離散粗，比密著細。' },
];

@Component({
  selector: 'app-step-topology-examples',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="經典例子" subtitle="§1.3">
      <p>
        同一個集合 X 可以配上不同的拓撲 τ，產生完全不同的「空間感覺」。
        在三點集 X = (a, b, c) 上就能看到巨大的差異。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選拓撲——亮起的子集是「開集」，暗的不是">
      <div class="fn-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
        }
      </div>

      <!-- Venn diagram: 3 overlapping circles for a, b, c -->
      <svg viewBox="0 0 340 220" class="venn-svg">
        <!-- All 7 regions of the Venn diagram -->
        <!-- {a} only: mask 1 -->
        <circle cx="120" cy="100" r="60" [attr.fill]="regionFill(1)" [attr.stroke]="regionStroke(1)" stroke-width="2" />
        <!-- {b} only: mask 2 -->
        <circle cx="200" cy="100" r="60" [attr.fill]="regionFill(2)" [attr.stroke]="regionStroke(2)" stroke-width="2" />
        <!-- {c} only: mask 4 -->
        <circle cx="160" cy="165" r="60" [attr.fill]="regionFill(4)" [attr.stroke]="regionStroke(4)" stroke-width="2" />

        <!-- Labels -->
        <text x="85" y="70" class="venn-label">a</text>
        <text x="230" y="70" class="venn-label">b</text>
        <text x="160" y="210" class="venn-label">c</text>
      </svg>

      <!-- Open sets list with visual highlighting -->
      <div class="opensets-label">τ 裡的開集（{{ currentEx().openSets.length }} 個）：</div>
      <div class="openset-grid">
        @for (mask of allMasks; track mask) {
          <div class="os-chip" [class.open]="isOpen(mask)" [class.closed]="!isOpen(mask)">
            <svg viewBox="0 0 36 16" class="mini-venn">
              <circle cx="10" cy="8" r="5.5" [attr.fill]="hasBit(mask, 0) ? '#5a7faa' : 'transparent'"
                      [attr.fill-opacity]="hasBit(mask, 0) ? 0.4 : 0" stroke="var(--border)" stroke-width="0.5" />
              <circle cx="18" cy="8" r="5.5" [attr.fill]="hasBit(mask, 1) ? '#5a8a5a' : 'transparent'"
                      [attr.fill-opacity]="hasBit(mask, 1) ? 0.4 : 0" stroke="var(--border)" stroke-width="0.5" />
              <circle cx="26" cy="8" r="5.5" [attr.fill]="hasBit(mask, 2) ? '#c8983b' : 'transparent'"
                      [attr.fill-opacity]="hasBit(mask, 2) ? 0.4 : 0" stroke="var(--border)" stroke-width="0.5" />
            </svg>
            <span class="os-name">{{ subsetName(mask) }}</span>
          </div>
        }
      </div>

      <div class="ex-note">{{ currentEx().interesting }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        離散 vs 密著是兩個極端——一個「太開放」，一個「太封閉」。
        有趣的拓撲在中間。下一節看<strong>閉集</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ft { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .venn-svg { width: 100%; max-width: 340px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .venn-label { font-size: 16px; font-weight: 700; fill: var(--text); font-family: 'JetBrains Mono', monospace; text-anchor: middle; }

    .opensets-label { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .openset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 12px; }
    @media (max-width: 400px) { .openset-grid { grid-template-columns: repeat(2, 1fr); } }
    .os-chip { display: flex; align-items: center; gap: 4px; padding: 5px 6px;
      border-radius: 6px; border: 1px solid var(--border); transition: all 0.2s;
      &.open { background: var(--accent-10); border-color: var(--accent); }
      &.closed { opacity: 0.25; } }
    .mini-venn { width: 36px; height: 16px; flex-shrink: 0; }
    .os-name { font-size: 11px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .ex-note { padding: 10px; border-radius: 8px; background: var(--accent-10); border: 1px solid var(--accent);
      font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.7; }
  `,
})
export class StepTopologyExamplesComponent {
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly currentEx = computed(() => EXAMPLES[this.sel()]);
  readonly allMasks = [0, 1, 2, 3, 4, 5, 6, 7];
  readonly subsetName = subsetName;

  private readonly openSet = computed(() => new Set(this.currentEx().openSets));
  isOpen(mask: number): boolean { return this.openSet().has(mask); }
  hasBit(mask: number, bit: number): boolean { return (mask & (1 << bit)) !== 0; }

  regionFill(elementMask: number): string {
    // Highlight the circle if the singleton {element} is an open set
    if (this.openSet().has(elementMask)) return 'rgba(var(--accent-rgb), 0.15)';
    return 'rgba(var(--accent-rgb), 0.03)';
  }

  regionStroke(elementMask: number): string {
    if (this.openSet().has(elementMask)) return 'var(--accent)';
    return 'var(--border)';
  }
}
