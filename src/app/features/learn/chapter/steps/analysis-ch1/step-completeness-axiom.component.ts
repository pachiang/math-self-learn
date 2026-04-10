import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Example { name: string; target: number; label: string; desc: string; }

const EXAMPLES: Example[] = [
  { name: '√2', target: Math.SQRT2, label: '√2 ≈ 1.41421', desc: 'S = {{ \'{\'  }}q ∈ Q : q² < 2{{ \'}\'  }}' },
  { name: '√3', target: Math.sqrt(3), label: '√3 ≈ 1.73205', desc: 'S = {{ \'{\'  }}q ∈ Q : q² < 3{{ \'}\'  }}' },
  { name: 'e', target: Math.E, label: 'e ≈ 2.71828', desc: 'S = {{ \'{\'  }}(1+1/n)ⁿ : n ∈ N{{ \'}\'  }}' },
  { name: 'π', target: Math.PI, label: 'π ≈ 3.14159', desc: 'S = {{ \'{\'  }}有理數近似{{ \'}\'  }}' },
];

@Component({
  selector: 'app-step-completeness-axiom',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="完備性公理" subtitle="§1.4">
      <p>
        這是實數系統<strong>最核心</strong>的一條公理：
      </p>
      <p class="formula axiom">
        完備性公理（Least Upper Bound Property）：<br />
        R 的每一個非空、有上界的子集都有上確界，<br />
        而且這個上確界<strong>在 R 裡面</strong>。
      </p>
      <p>
        這就是 R 跟 Q 的<strong>唯一根本差別</strong>。
        Q 滿足所有其他性質（加減乘除、有序），但不滿足完備性。
        R 就是「補完了所有洞的 Q」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="同一個集合，在 Q 裡 sup 不存在，在 R 裡 sup 存在">
      <div class="preset-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <div class="dual-line">
        <!-- Q number line -->
        <div class="line-block q-block">
          <div class="lb-title">在 Q 裡</div>
          <svg viewBox="-10 -30 420 60" class="nl-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border)" stroke-width="1" />
            @for (t of scaleTicks(); track t.val) {
              <line [attr.x1]="toX(t.val)" y1="-3" [attr.x2]="toX(t.val)" y2="3"
                    stroke="var(--border)" stroke-width="0.5" />
              <text [attr.x]="toX(t.val)" y="15" class="tick">{{ t.label }}</text>
            }
            <!-- Bounded set (dots approaching target) -->
            @for (p of setPoints(); track p) {
              <circle [attr.cx]="toX(p)" cy="0" r="3" fill="#5a7faa" fill-opacity="0.6" />
            }
            <!-- Missing sup -->
            <circle [attr.cx]="toX(target())" cy="0" r="6"
                    fill="none" stroke="#a05a5a" stroke-width="2" stroke-dasharray="3 2" />
            <text [attr.x]="toX(target())" y="-18" class="gap-label">sup 不在 Q 裡！</text>
          </svg>
        </div>

        <div class="arrow-between">↓ 填洞 ↓</div>

        <!-- R number line -->
        <div class="line-block r-block" [class.filled]="showR()">
          <div class="lb-title">在 R 裡</div>
          <svg viewBox="-10 -30 420 60" class="nl-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border)" stroke-width="1" />
            @for (t of scaleTicks(); track t.val) {
              <line [attr.x1]="toX(t.val)" y1="-3" [attr.x2]="toX(t.val)" y2="3"
                    stroke="var(--border)" stroke-width="0.5" />
            }
            @for (p of setPoints(); track p) {
              <circle [attr.cx]="toX(p)" cy="0" r="3" fill="#5a7faa" fill-opacity="0.6" />
            }
            <!-- Sup exists! -->
            @if (showR()) {
              <circle [attr.cx]="toX(target())" cy="0" r="6"
                      fill="#5a8a5a" stroke="white" stroke-width="1.5" />
              <text [attr.x]="toX(target())" y="-18" class="found-label">sup = {{ currentEx().label }}</text>
            }
          </svg>
        </div>
      </div>

      <button class="fill-btn" (click)="showR.set(!showR())">
        {{ showR() ? '隱藏 R' : '切換到 R — 填洞！' }}
      </button>
    </app-challenge-card>

    <app-prose-block>
      <p>
        完備性公理是<strong>一切分析的起點</strong>。後面的每一個定理——
        極限、連續、微分、積分——都直接或間接地依賴它。
      </p>
      <p>
        下一節看完備性的第一個推論：<strong>Archimedean 性質</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .dual-line { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .line-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      &.q-block { background: rgba(160, 90, 90, 0.04); }
      &.r-block { background: var(--bg-surface); transition: background 0.3s;
        &.filled { background: rgba(90, 138, 90, 0.06); } } }
    .lb-title { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; }
    .nl-svg { width: 100%; display: block; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .gap-label { font-size: 9px; fill: #a05a5a; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .found-label { font-size: 9px; fill: #5a8a5a; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .arrow-between { text-align: center; font-size: 14px; color: var(--accent); font-weight: 700;
      padding: 4px; }

    .fill-btn { display: block; margin: 0 auto; padding: 8px 20px; border: 1px solid var(--accent);
      border-radius: 8px; background: var(--accent); color: white;
      font-size: 13px; font-weight: 600; cursor: pointer;
      &:hover { opacity: 0.9; } }
  `,
})
export class StepCompletenessAxiomComponent {
  readonly examples = EXAMPLES;
  readonly selIdx = signal(0);
  readonly showR = signal(false);

  readonly currentEx = computed(() => EXAMPLES[this.selIdx()]);
  readonly target = computed(() => this.currentEx().target);

  readonly scaleTicks = computed(() => {
    const t = this.target();
    const lo = Math.floor(t) - 1;
    return Array.from({ length: 5 }, (_, i) => ({
      val: lo + i,
      label: String(lo + i),
    }));
  });

  readonly setPoints = computed(() => {
    const t = this.target();
    const pts: number[] = [];
    // Generate approaching points
    for (let i = 1; i <= 15; i++) {
      pts.push(t - 1 / (i * i));
    }
    return pts.filter((p) => p > t - 2 && p < t);
  });

  toX(v: number): number {
    const t = this.target();
    const lo = Math.floor(t) - 1;
    return ((v - lo) / 4) * 400;
  }
}
