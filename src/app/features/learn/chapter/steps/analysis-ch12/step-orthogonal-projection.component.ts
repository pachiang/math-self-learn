import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { projectOnto, l2Norm, l2Inner, sampleFn } from './analysis-ch12-util';

@Component({
  selector: 'app-step-orthogonal-projection',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正交與投影" subtitle="§12.2">
      <p>
        f ⊥ g ⟺ ⟨f, g⟩ = 0。跟 Rⁿ 裡的垂直一模一樣。
      </p>
      <p>
        <strong>投影定理</strong>：H 是 Hilbert 空間，M 是閉子空間。
        對任何 f ∈ H，存在<strong>唯一的最佳逼近</strong> m ∈ M 使得 ||f − m|| 最小。
        而且 f − m ⊥ M。
      </p>
      <p class="formula">
        f = proj_M(f) + (f − proj_M(f))，兩部分正交
      </p>
    </app-prose-block>

    <app-challenge-card prompt="把 f(x) = x 投影到 span(1, cos 2πx) 上——看殘差正交">
      <div class="n-ctrl">
        <span class="nl">基底函數數 N = {{ nBasis() }}</span>
        <input type="range" min="1" max="8" step="1" [value]="nBasis()"
               (input)="nBasis.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 220" class="proj-svg">
        <line x1="40" y1="180" x2="500" y2="180" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="180" stroke="var(--border)" stroke-width="0.8" />

        <!-- Residual shading -->
        <path [attr.d]="residualArea()" fill="#aa5a6a" fill-opacity="0.08" />

        <!-- Original f -->
        <path [attr.d]="fPath()" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- Projection -->
        <path [attr.d]="projPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">||f|| = {{ fNorm.toFixed(4) }}</div>
        <div class="r-card accent">||proj|| = {{ projNorm().toFixed(4) }}</div>
        <div class="r-card">||殘差|| = {{ residualNorm().toFixed(4) }}</div>
      </div>

      <div class="parseval-check">
        Parseval：||f||² = ||proj||² + ||殘差||² →
        {{ (fNorm*fNorm).toFixed(4) }} ≈ {{ (projNorm()*projNorm() + residualNorm()*residualNorm()).toFixed(4) }} ✓
      </div>

      <div class="legend">
        <span><span class="dot green"></span>f(x) = x</span>
        <span><span class="dot accent"></span>投影到 N 個 Fourier 基底</span>
        <span><span class="dot red"></span>殘差（正交於子空間）</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>投影定理是<strong>最佳逼近</strong>的保證——在所有子空間元素裡，投影最接近 f。下一節看正交基底。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 130px; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .proj-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .result-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.accent { color: var(--accent); } }
    .parseval-check { padding: 8px 12px; text-align: center; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; color: #5a8a5a;
      background: rgba(90,138,90,0.06); border-radius: 6px; margin-bottom: 8px; }
    .legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.green { background: #5a8a5a; } &.accent { background: var(--accent); } &.red { background: #aa5a6a; } }
  `,
})
export class StepOrthogonalProjectionComponent {
  readonly nBasis = signal(3);
  private readonly f = (x: number) => x;
  readonly fNorm = l2Norm(this.f);

  private readonly basis = computed(() => {
    const N = this.nBasis();
    const fns: ((x: number) => number)[] = [(x) => 1];
    for (let n = 1; n < N; n++) {
      const k = Math.ceil(n / 2);
      if (n % 2 === 1) fns.push((x) => Math.sqrt(2) * Math.cos(2 * Math.PI * k * x));
      else fns.push((x) => Math.sqrt(2) * Math.sin(2 * Math.PI * k * x));
    }
    return fns;
  });

  private readonly projection = computed(() => projectOnto(this.f, this.basis()));
  readonly projNorm = computed(() => l2Norm(this.projection().projected));
  readonly residualNorm = computed(() => {
    const proj = this.projection().projected;
    return l2Norm((x) => this.f(x) - proj(x));
  });

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 180 - (y + 0.2) * 130; }

  fPath(): string {
    return 'M' + sampleFn(this.f, 0, 1, 200).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  projPath(): string {
    const proj = this.projection().projected;
    return 'M' + sampleFn(proj, 0, 1, 200).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  residualArea(): string {
    const proj = this.projection().projected;
    const pts = sampleFn(this.f, 0, 1, 200);
    const upper = pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`);
    const lower = [...pts].reverse().map((p) => `${this.fx(p.x)},${this.fy(proj(p.x))}`);
    return 'M' + upper.join('L') + 'L' + lower.join('L') + 'Z';
  }
}
