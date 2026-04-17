import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-subspace-topology',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="子空間拓撲" subtitle="§1.8">
      <p>
        A ⊂ X 自然繼承一個拓撲：
      </p>
      <p class="formula">τ_A = ( U ∩ A : U ∈ τ )</p>
      <p>
        A 裡的「開集」= 大空間的開集和 A 的交集。
        把大空間的拓撲「限制」到 A 上。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動開區間 U 的左右端點，看 U ∩ [0,1] 怎麼變——注意端點行為！">
      <div class="ctrl-row">
        <span class="cl">U 左端 = {{ uLeft().toFixed(2) }}</span>
        <input type="range" min="-0.5" max="0.8" step="0.01" [value]="uLeft()"
               (input)="uLeft.set(+($any($event.target)).value)" class="sl" />
      </div>
      <div class="ctrl-row">
        <span class="cl">U 右端 = {{ uRight().toFixed(2) }}</span>
        <input type="range" min="0.2" max="1.5" step="0.01" [value]="uRight()"
               (input)="uRight.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-60 -50 620 110" class="sub-svg">
        <!-- R number line -->
        <line x1="20" y1="0" x2="520" y2="0" stroke="var(--border)" stroke-width="1" />
        <text x="270" y="-35" text-anchor="middle" fill="var(--text-muted)" font-size="10">R</text>

        <!-- Ticks -->
        @for (t of ticks; track t.val) {
          <line [attr.x1]="toX(t.val)" y1="-5" [attr.x2]="toX(t.val)" y2="5" stroke="var(--border)" stroke-width="0.8" />
          <text [attr.x]="toX(t.val)" y="18" class="tick-label">{{ t.label }}</text>
        }

        <!-- [0,1] subspace -->
        <rect [attr.x]="toX(0)" y="-16" [attr.width]="toX(1) - toX(0)" height="32"
              fill="rgba(var(--accent-rgb), 0.06)" stroke="var(--accent)" stroke-width="1.5" rx="4" />
        <text [attr.x]="(toX(0) + toX(1)) / 2" y="32" text-anchor="middle"
              fill="var(--accent)" font-size="10" font-weight="700">A = [0, 1]</text>

        <!-- Open set U in R (green) -->
        <rect [attr.x]="toX(uLeft())" y="-10" [attr.width]="Math.max(0, toX(uRight()) - toX(uLeft()))"
              height="20" fill="rgba(90,138,90,0.12)" stroke="#5a8a5a" stroke-width="1.5" rx="3" />
        <!-- Open endpoints (hollow circles) -->
        <circle [attr.cx]="toX(uLeft())" cy="0" r="4" fill="var(--bg)" stroke="#5a8a5a" stroke-width="2" />
        <circle [attr.cx]="toX(uRight())" cy="0" r="4" fill="var(--bg)" stroke="#5a8a5a" stroke-width="2" />
        <text [attr.x]="(toX(uLeft()) + toX(uRight())) / 2" y="-18"
              text-anchor="middle" fill="#5a8a5a" font-size="9" font-weight="700">
          U = ({{ uLeft().toFixed(2) }}, {{ uRight().toFixed(2) }})
        </text>

        <!-- Intersection U ∩ A (highlighted) -->
        @if (intLeft() < intRight()) {
          <rect [attr.x]="toX(intLeft())" y="40" [attr.width]="toX(intRight()) - toX(intLeft())"
                height="12" fill="var(--accent)" fill-opacity="0.3" stroke="var(--accent)" stroke-width="1.5" rx="3" />
          <text [attr.x]="(toX(intLeft()) + toX(intRight())) / 2" y="66"
                text-anchor="middle" fill="var(--accent)" font-size="9" font-weight="700">
            U ∩ A = {{ intersectionStr() }}
          </text>
        }
      </svg>

      <div class="result-panel">
        <div class="rp-row">
          <span class="rp-label">U = ({{ uLeft().toFixed(2) }}, {{ uRight().toFixed(2) }})</span>
          <span class="rp-tag open-r">R 裡的開集</span>
        </div>
        <div class="rp-row">
          <span class="rp-label">U ∩ A = {{ intersectionStr() }}</span>
          <span class="rp-tag" [class.open-a]="true">A 裡的開集 ✓</span>
        </div>
      </div>

      <!-- Key observations -->
      <div class="observations">
        @if (uLeft() < 0 && uRight() > 0 && uRight() < 1) {
          <div class="obs-card surprise">
            <strong>[0, {{ uRight().toFixed(2) }})</strong> 包含左端點 0 但是<strong>在 A 裡是開集</strong>！
            因為 ({{ uLeft().toFixed(2) }}, {{ uRight().toFixed(2) }}) ∩ [0,1] = [0, {{ uRight().toFixed(2) }})。
            雖然在 R 裡 [0, x) 不是開的，在子空間 [0,1] 裡它是開的。
          </div>
        }
        @if (uLeft() > 0 && uLeft() < 1 && uRight() > 1) {
          <div class="obs-card surprise">
            <strong>({{ uLeft().toFixed(2) }}, 1]</strong> 包含右端點 1 但是<strong>在 A 裡是開集</strong>！
            端點在子空間裡可以是「開的邊界」。
          </div>
        }
        @if (uLeft() < 0 && uRight() > 1) {
          <div class="obs-card">U 完全包住 A → U ∩ A = A = [0,1]。整個 A 是自己的開集（當然！）。</div>
        }
        @if (uRight() <= 0 || uLeft() >= 1) {
          <div class="obs-card">U 和 A 不相交 → U ∩ A = ∅。空集永遠是開集。</div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        <strong>「開」是相對於拓撲的，不是集合本身的絕對性質。</strong>
        [0, 0.5) 在 R 裡不是開集，但在 [0,1] 的子空間拓撲裡是開集。
        這個看似小事的觀察在很多證明裡非常關鍵。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .cl { font-size: 12px; font-weight: 600; color: #5a8a5a; font-family: 'JetBrains Mono', monospace; min-width: 110px; }
    .sl { flex: 1; accent-color: #5a8a5a; height: 20px; }

    .sub-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 12px; }
    .tick-label { font-size: 9px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }

    .result-panel { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .rp-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px;
      border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; } }
    .rp-label { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .rp-tag { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
      &.open-r { background: rgba(90,138,90,0.1); color: #5a8a5a; }
      &.open-a { background: var(--accent-10); color: var(--accent); } }

    .observations { display: flex; flex-direction: column; gap: 6px; }
    .obs-card { padding: 10px 12px; border-radius: 8px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border: 1px solid var(--border); line-height: 1.7;
      &.surprise { background: var(--accent-10); border-color: var(--accent); }
      strong { color: var(--accent); } }
  `,
})
export class StepSubspaceTopologyComponent {
  readonly Math = Math;
  readonly uLeft = signal(-0.2);
  readonly uRight = signal(0.6);

  readonly ticks = [
    { val: -0.5, label: '−0.5' }, { val: 0, label: '0' }, { val: 0.5, label: '0.5' },
    { val: 1, label: '1' }, { val: 1.5, label: '1.5' },
  ];

  toX(v: number): number { return 20 + (v + 0.5) * 250; }

  // Intersection [max(uLeft, 0), min(uRight, 1)]
  readonly intLeft = computed(() => Math.max(this.uLeft(), 0));
  readonly intRight = computed(() => Math.min(this.uRight(), 1));

  readonly intersectionStr = computed(() => {
    const l = this.intLeft(), r = this.intRight();
    if (l >= r) return '∅';
    const leftBr = this.uLeft() <= 0 ? '[' : '(';
    const rightBr = this.uRight() >= 1 ? ']' : ')';
    return `${leftBr}${l.toFixed(2)}, ${r.toFixed(2)}${rightBr}`;
  });
}
