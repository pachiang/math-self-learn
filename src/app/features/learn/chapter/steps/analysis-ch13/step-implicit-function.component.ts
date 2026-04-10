import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { contourPoints } from './analysis-ch13-util';

@Component({
  selector: 'app-step-implicit-function',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="隱函數定理" subtitle="§13.8">
      <p>
        方程 F(x, y) = 0 什麼時候能「解出 y = g(x)」？
      </p>
      <p class="formula axiom">
        如果 F(a,b) = 0 且 <strong>∂F/∂y(a,b) ≠ 0</strong>，<br />
        那麼在 (a,b) 附近存在唯一的可微函數 y = g(x) 使得 F(x, g(x)) = 0<br />
        而且 g'(x) = −(∂F/∂x) / (∂F/∂y)
      </p>
      <p>
        隱函數定理和反函數定理<strong>等價</strong>——可以互相推導。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="x² + y² = r² 定義了隱函數 y(x)——但只在局部">
      <div class="r-ctrl">
        <span class="rl">r = {{ rVal().toFixed(1) }}</span>
        <input type="range" min="0.5" max="2" step="0.1" [value]="rVal()"
               (input)="rVal.set(+($any($event.target)).value)" class="r-slider" />
      </div>

      <svg viewBox="-3 -3 6 6" class="imp-svg">
        <!-- Grid -->
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-3" [attr.x2]="g" y2="3" stroke="var(--border)" stroke-width="0.015" />
          <line x1="-3" [attr.y1]="g" x2="3" [attr.y2]="g" stroke="var(--border)" stroke-width="0.015" />
        }

        <!-- Circle (implicit curve F = x²+y²−r² = 0) -->
        <circle cx="0" cy="0" [attr.r]="rVal()" fill="none" stroke="var(--accent)" stroke-width="0.04" />

        <!-- Upper branch y = √(r²−x²) -->
        <path [attr.d]="upperPath()" fill="none" stroke="#5a8a5a" stroke-width="0.06" />

        <!-- Lower branch y = −√(r²−x²) -->
        <path [attr.d]="lowerPath()" fill="none" stroke="#5a7faa" stroke-width="0.06" />

        <!-- Failure points (±r, 0) where ∂F/∂y = 0 -->
        <circle [attr.cx]="rVal()" cy="0" r="0.08" fill="#a05a5a" stroke="white" stroke-width="0.03" />
        <circle [attr.cx]="-rVal()" cy="0" r="0.08" fill="#a05a5a" stroke="white" stroke-width="0.03" />
      </svg>

      <div class="legend">
        <span><span class="dot green"></span>y = √(r²−x²)（上半）</span>
        <span><span class="dot blue"></span>y = −√(r²−x²)（下半）</span>
        <span><span class="dot red"></span>∂F/∂y = 0 的點（定理失效）</span>
      </div>

      <div class="explanation">
        在圓的左右兩端（紅點），∂F/∂y = 2y = 0。
        隱函數定理不適用——果然在這裡 y(x) <strong>不能被定義成單值函數</strong>（曲線是垂直的）。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節心智圖總結多變數微分。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 12px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } strong { color: var(--text); } }
    .r-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .r-slider { flex: 1; accent-color: var(--accent); }
    .imp-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 8px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .legend { display: flex; gap: 12px; font-size: 11px; color: var(--text-muted);
      flex-wrap: wrap; margin-bottom: 8px; justify-content: center; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 3px;
      vertical-align: middle;
      &.green { background: #5a8a5a; } &.blue { background: #5a7faa; } &.red { background: #a05a5a; } }
    .explanation { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: #a05a5a; } }
  `,
})
export class StepImplicitFunctionComponent {
  readonly rVal = signal(1.5);

  upperPath(): string {
    const r = this.rVal();
    const pts: string[] = [];
    for (let x = -r + 0.01; x <= r - 0.01; x += 0.02) {
      const y = Math.sqrt(r * r - x * x);
      pts.push(`${x},${y}`);
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }

  lowerPath(): string {
    const r = this.rVal();
    const pts: string[] = [];
    for (let x = -r + 0.01; x <= r - 0.01; x += 0.02) {
      const y = -Math.sqrt(r * r - x * x);
      pts.push(`${x},${y}`);
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }
}
