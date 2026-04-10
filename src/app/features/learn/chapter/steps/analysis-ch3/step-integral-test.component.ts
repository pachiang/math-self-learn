import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { partialSums } from './analysis-ch3-util';

@Component({
  selector: 'app-step-integral-test',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="積分判別法" subtitle="§3.4">
      <p>
        如果 f(x) 正值、遞減、連續，那 <strong>Σf(n) 和 ∫f(x)dx 同收斂同發散</strong>。
      </p>
      <p>
        直覺：級數的每一項 f(n) 是一個寬 1 的長方形面積，它夾在曲線 f(x) 的上下方。
      </p>
      <p>
        最重要的應用——<strong>p 級數</strong>：Σ 1/nᵖ 收斂 ⟺ p > 1。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整 p 看 1/xᵖ 的長方形和曲線——p 過 1 的瞬間從發散變收斂">
      <div class="p-ctrl">
        <span class="p-label">p = {{ p().toFixed(2) }}</span>
        <input type="range" min="0.3" max="3" step="0.05" [value]="p()"
               (input)="p.set(+($any($event.target)).value)" class="p-slider" />
      </div>

      <svg viewBox="0 0 520 220" class="int-svg">
        <line x1="40" y1="190" x2="510" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- Rectangles (series terms) -->
        @for (d of terms(); track d.n) {
          <rect [attr.x]="nx(d.n)" [attr.y]="fy(d.term)" width="14"
                [attr.height]="Math.max(0.5, 190 - fy(d.term))"
                fill="var(--accent)" fill-opacity="0.25" stroke="var(--accent)" stroke-width="0.5" />
        }

        <!-- Curve f(x) = 1/x^p -->
        <path [attr.d]="curvePath()" fill="none" stroke="#5a8a5a" stroke-width="2" />
      </svg>

      <div class="result-row">
        <div class="r-card" [class.conv]="p() > 1" [class.div]="p() <= 1">
          p = {{ p().toFixed(2) }} →
          @if (p() > 1) { <strong>收斂</strong>（∫ 1/xᵖ dx 有限） }
          @else if (p() === 1) { <strong>發散</strong>（= 調和級數 = ln ∞）}
          @else { <strong>發散</strong>（比調和級數更大）}
        </div>
        <div class="r-card">
          S₃₀ ≈ {{ partialSum30().toFixed(6) }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        p=1 是分水嶺：調和級數<strong>剛好發散</strong>。p 稍微大於 1 就收斂。
        這個臨界行為是分析裡反覆出現的主題。
      </p>
      <p>下一節看帶正負號的級數——<strong>交替級數</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .p-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .p-label { font-size: 14px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .p-slider { flex: 1; accent-color: var(--accent); }
    .int-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 10px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 13px; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      &.conv { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.div { background: rgba(160,90,90,0.08); color: #a05a5a; }
      strong { font-size: 15px; } }
  `,
})
export class StepIntegralTestComponent {
  readonly Math = Math;
  readonly p = signal(1.0);
  readonly terms = computed(() => partialSums((k) => 1 / Math.pow(k, this.p()), 30));
  readonly partialSum30 = computed(() => {
    const t = this.terms();
    return t.length ? t[t.length - 1].sum : 0;
  });

  fy(v: number): number { return 190 - Math.min(v * 80, 175); }
  nx(n: number): number { return 40 + (n - 1) * 15; }

  curvePath(): string {
    const pp = this.p();
    const pts: string[] = [];
    for (let x = 1; x <= 31; x += 0.5) {
      const y = 1 / Math.pow(x, pp);
      pts.push(`${40 + (x - 1) * 15},${this.fy(y)}`);
    }
    return 'M' + pts.join('L');
  }
}
