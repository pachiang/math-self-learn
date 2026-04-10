import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { riemannRearrange } from './analysis-ch3-util';

const LN2 = Math.LN2;

@Component({
  selector: 'app-step-absolute-conditional',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="絕對收斂與條件收斂" subtitle="§3.6">
      <p>
        <strong>絕對收斂</strong>：Σ|aₙ| 收斂。<strong>條件收斂</strong>：Σaₙ 收斂但 Σ|aₙ| 發散。
      </p>
      <p>絕對收斂 → 收斂（三角不等式），但反過來不成立。</p>
      <p>
        <strong>Riemann 重排定理</strong>（驚人！）：條件收斂的級數可以<strong>重新排列</strong>，
        使它收斂到<strong>任意指定的實數</strong>——甚至可以讓它發散！
      </p>
      <p>
        換句話說：條件收斂的級數，它的「和」<strong>取決於加法順序</strong>。
        加法交換律在無限求和時失效了。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Riemann 重排：設定目標值，看交替調和級數被重排後收斂到你指定的數">
      <div class="target-ctrl">
        <span class="tl">目標值</span>
        <input type="range" min="-1" max="3" step="0.1" [value]="target()"
               (input)="target.set(+($any($event.target)).value)" class="t-slider" />
        <span class="tv">{{ target().toFixed(1) }}</span>
      </div>

      <svg viewBox="0 0 520 220" class="re-svg">
        <line x1="40" y1="190" x2="510" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- Original limit (ln 2) -->
        <line x1="40" [attr.y1]="ty(LN2)" x2="510" [attr.y2]="ty(LN2)"
              stroke="#5a7faa" stroke-width="1" stroke-dasharray="3 3" />
        <text x="512" [attr.y]="ty(LN2) + 4" class="old-label">ln 2</text>

        <!-- Target line -->
        <line x1="40" [attr.y1]="ty(target())" x2="510" [attr.y2]="ty(target())"
              stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="5 3" />
        <text x="512" [attr.y]="ty(target()) + 4" class="target-label">目標</text>

        <!-- Rearranged partial sums -->
        @if (rearranged().length > 1) {
          <path [attr.d]="rePath()" fill="none" stroke="var(--accent)" stroke-width="1.5" />
        }
        @for (d of rearranged(); track d.n) {
          <circle [attr.cx]="nx(d.n)" [attr.cy]="ty(d.sum)" r="2.5"
                  fill="var(--accent)" fill-opacity="0.7" />
        }
      </svg>

      <div class="explain">
        原始和 = ln 2 ≈ {{ LN2.toFixed(4) }}。
        重排後收斂到 <strong>{{ target().toFixed(1) }}</strong>。
        同樣的項、不同的順序、不同的極限。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        重排定理的教訓：<strong>絕對收斂的級數</strong>可以任意重排而和不變，
        但<strong>條件收斂</strong>的不行。絕對收斂是「安全」的；條件收斂要小心順序。
      </p>
      <p>下一節看一類特別重要的級數——<strong>冪級數</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .target-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .tl { font-size: 13px; color: var(--text-muted); font-weight: 600; }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .tv { font-size: 14px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 36px; }
    .re-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .old-label { font-size: 8px; fill: #5a7faa; font-family: 'JetBrains Mono', monospace; }
    .target-label { font-size: 8px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .explain { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--accent); font-size: 15px; } }
  `,
})
export class StepAbsoluteConditionalComponent {
  readonly LN2 = LN2;
  readonly target = signal(2.0);
  readonly rearranged = computed(() => riemannRearrange(this.target(), 80));

  ty(v: number): number { return 190 - ((v + 1.5) / 5) * 175; }
  nx(n: number): number { return 40 + (n / 82) * 470; }

  rePath(): string {
    const d = this.rearranged();
    return 'M' + d.map((p) => `${this.nx(p.n)},${this.ty(p.sum)}`).join('L');
  }
}
