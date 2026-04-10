import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn, supNorm } from './analysis-ch7-util';

@Component({
  selector: 'app-step-uniform-convergence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="均勻收斂" subtitle="§7.2">
      <p>
        <strong>均勻收斂</strong>把 ε 的要求從「每個 x 一個 N」提升到「一個 N 管所有 x」：
      </p>
      <p class="formula axiom">
        fₙ → f 均勻收斂 ⟺<br />
        ∀ε > 0, ∃N, ∀n > N, <strong>∀x</strong>: |fₙ(x) − f(x)| &lt; ε
      </p>
      <p>
        等價於：<strong>sup|fₙ(x) − f(x)| → 0</strong>（sup 範數趨向 0）。
      </p>
      <p>
        幾何意義：fₙ 最終完全落在 f 的 <strong>ε-管子</strong> 裡面。
        不是每個點各自落入，而是<strong>整條曲線</strong>都在管子裡。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="ε-管子視覺化：均勻收斂 = 整條曲線鑽進管子">
      <div class="ctrl-row">
        <button class="pre-btn" [class.active]="mode() === 'uniform'" (click)="mode.set('uniform')">
          均勻收斂：x/n
        </button>
        <button class="pre-btn" [class.active]="mode() === 'pointwise'" (click)="mode.set('pointwise')">
          僅逐點：xⁿ
        </button>
        <div class="n-ctrl">
          <span class="nl">n = {{ nVal() }}</span>
          <input type="range" min="1" max="30" step="1" [value]="nVal()"
                 (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 240" class="uc-svg">
        <line x1="40" y1="200" x2="500" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="200" stroke="var(--border)" stroke-width="0.8" />

        <!-- ε-tube around limit -->
        <path [attr.d]="tubeUpperPath()" fill="none" stroke="var(--accent)" stroke-width="0.8" stroke-opacity="0.3" />
        <path [attr.d]="tubeLowerPath()" fill="none" stroke="var(--accent)" stroke-width="0.8" stroke-opacity="0.3" />
        <!-- Shaded tube -->
        <path [attr.d]="tubeAreaPath()" fill="var(--accent)" fill-opacity="0.06" />

        <!-- Limit function -->
        <path [attr.d]="limitPath()" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- Current fₙ -->
        <path [attr.d]="fnPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">‖fₙ − f‖_sup = {{ currentSupNorm().toFixed(4) }}</div>
        <div class="r-card" [class.ok]="isInTube()" [class.bad]="!isInTube()">
          {{ isInTube() ? '在 ε-管子裡 ✓' : '超出管子 ✗' }}
        </div>
        <div class="r-card">ε = 0.15</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        x/n 的 sup 範數 = 1/n → 0 → 均勻收斂。
        xⁿ 的 sup 範數 = 1（永遠不趨向 0）→ 只是逐點收斂。
      </p>
      <p>下一節看怎麼<strong>判定</strong>均勻收斂——<strong>Weierstrass M-test</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 120px; accent-color: var(--accent); }
    .uc-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepUniformConvergenceComponent {
  readonly mode = signal<'uniform' | 'pointwise'>('uniform');
  readonly nVal = signal(5);
  private readonly eps = 0.15;

  private fn(x: number): number {
    return this.mode() === 'uniform'
      ? x / this.nVal()
      : Math.pow(x, this.nVal());
  }

  private lim(x: number): number {
    return this.mode() === 'uniform' ? 0 : (x < 1 ? 0 : 1);
  }

  readonly currentSupNorm = computed(() => {
    return supNorm((x) => this.fn(x), (x) => this.lim(x), 0, 1);
  });

  readonly isInTube = computed(() => this.currentSupNorm() < this.eps);

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 200 - y * 180; }

  fnPath(): string {
    const pts = sampleFn((x) => this.fn(x), 0, 1, 300);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  limitPath(): string {
    if (this.mode() === 'uniform') {
      return `M${this.fx(0)},${this.fy(0)}L${this.fx(1)},${this.fy(0)}`;
    }
    // xⁿ limit: 0 on [0,1), 1 at x=1
    return `M${this.fx(0)},${this.fy(0)}L${this.fx(0.99)},${this.fy(0)}M${this.fx(1)},${this.fy(1)}`;
  }

  tubeUpperPath(): string {
    const pts = sampleFn((x) => this.lim(x) + this.eps, 0, 0.99, 100);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  tubeLowerPath(): string {
    const pts = sampleFn((x) => Math.max(this.lim(x) - this.eps, -0.2), 0, 0.99, 100);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  tubeAreaPath(): string {
    const upper = sampleFn((x) => this.lim(x) + this.eps, 0, 0.99, 100);
    const lower = sampleFn((x) => Math.max(this.lim(x) - this.eps, -0.2), 0, 0.99, 100);
    const u = upper.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`);
    const l = [...lower].reverse().map((p) => `${this.fx(p.x)},${this.fy(p.y)}`);
    return 'M' + u.join('L') + 'L' + l.join('L') + 'Z';
  }
}
