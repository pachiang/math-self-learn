import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-simple-integral',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="簡單函數的積分" subtitle="§10.1">
      <p>
        Lebesgue 積分的第一步：先定義<strong>簡單函數</strong>的積分。
      </p>
      <p>
        簡單函數 = 有限個可測集上的常數的加權和：
        φ(x) = Σ aₖ · 1(Eₖ)。
      </p>
      <p class="formula">
        ∫ φ dm = Σ aₖ · m(Eₖ)
      </p>
      <p>
        就是「高度 × 寬度（測度）」的有限和。跟 Riemann 的長方形很像，
        但這裡的「寬度」是<strong>測度</strong>而不是區間長度。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="一個簡單函數的積分 = 彩色長方形面積之和">
      <div class="n-ctrl">
        <span class="nl">層數 n = {{ nLevels() }}</span>
        <input type="range" min="2" max="10" step="1" [value]="nLevels()"
               (input)="nLevels.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 220" class="si-svg">
        <line x1="40" y1="190" x2="500" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- Simple function rectangles (horizontal slicing) -->
        @for (rect of rects(); track $index; let k = $index) {
          <rect [attr.x]="40" [attr.y]="fy(rect.top)" width="460"
                [attr.height]="Math.max(0.5, fy(rect.bottom) - fy(rect.top))"
                [attr.fill]="colors[k % colors.length]" fill-opacity="0.15"
                [attr.stroke]="colors[k % colors.length]" stroke-width="0.5" />
        }

        <!-- Target function (sin(πx) on [0,1]) -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">簡單函數積分 = {{ simpleVal().toFixed(4) }}</div>
        <div class="r-card ok">精確值 ∫sin(πx) = 2/π ≈ {{ (2/Math.PI).toFixed(4) }}</div>
        <div class="r-card">誤差 {{ Math.abs(simpleVal() - 2/Math.PI).toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>層數越多，簡單函數逼近越好。下一節看怎麼用這個<strong>取極限</strong>定義一般函數的積分。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .si-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepSimpleIntegralComponent {
  readonly Math = Math;
  readonly nLevels = signal(4);
  readonly colors = ['#5a7faa', '#c8983b', '#5a8a5a', '#aa5a6a', '#8a6aaa',
    '#6aaa8a', '#aa8a5a', '#7a5aaa', '#5aaa7a', '#aa5a8a'];

  readonly rects = computed(() => {
    const n = this.nLevels();
    const h = 1 / n;
    return Array.from({ length: n }, (_, k) => ({
      bottom: k * h,
      top: (k + 1) * h,
    }));
  });

  readonly simpleVal = computed(() => {
    // Approximate ∫₀¹ sin(πx) dx using n horizontal slices
    const n = this.nLevels();
    const h = 1 / n;
    let s = 0;
    for (let k = 0; k < n; k++) {
      const threshold = k * h;
      // Measure of {x ∈ [0,1] : sin(πx) > threshold}
      // sin(πx) > t ⟹ x ∈ (arcsin(t)/π, 1 - arcsin(t)/π)
      if (threshold >= 1) continue;
      const a = Math.asin(threshold) / Math.PI;
      const measure = 1 - 2 * a;
      s += h * measure;
    }
    return s;
  });

  fy(y: number): number { return 190 - y * 175; }

  curvePath(): string {
    const pts: string[] = [];
    for (let x = 0; x <= 1; x += 0.005) {
      pts.push(`${40 + x * 460},${this.fy(Math.sin(Math.PI * x))}`);
    }
    return 'M' + pts.join('L');
  }
}
