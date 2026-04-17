import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Example {
  name: string;
  formula: string;
  f: (x: number, y: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  exact: string;
}

const EXAMPLES: Example[] = [
  { name: 'xy', formula: 'f = xy', f: (x, y) => x * y, xRange: [0, 1], yRange: [0, 1], exact: '1/4' },
  { name: 'x²+y²', formula: 'f = x²+y²', f: (x, y) => x * x + y * y, xRange: [0, 1], yRange: [0, 1], exact: '2/3' },
  { name: 'eˣ sin y', formula: 'f = eˣ sin(y)', f: (x, y) => Math.exp(x) * Math.sin(y), xRange: [0, 1], yRange: [0, Math.PI], exact: '2(e−1)' },
];

@Component({
  selector: 'app-step-iterated-integrals',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="累次積分" subtitle="§14.3">
      <p>
        Fubini 定理的實際操作：把雙重積分寫成<strong>累次積分</strong>（iterated integral）。
      </p>
      <p class="formula">∬_D f dA = ∫ₐᵇ (∫_c^d f(x,y) dy) dx</p>
      <p>
        內層：固定 x，對 y 積分（得到 x 的函數 g(x)）。<br>
        外層：再對 g(x) 積分。
        就像吃一大塊蛋糕——先切一片（內層），再把所有片加起來（外層）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選函數，看兩種積分順序得到一樣的結果">
      <div class="fn-tabs">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ ex.formula }}</button>
        }
      </div>

      <div class="compare">
        <div class="col">
          <div class="col-title">先積 dy 再積 dx</div>
          <div class="formula-box">∫₀¹ [ ∫₀¹ {{ currentEx().formula.split('= ')[1] }} dy ] dx</div>
          <div class="val">= {{ dxDy().toFixed(6) }}</div>
        </div>
        <div class="eq">=</div>
        <div class="col">
          <div class="col-title">先積 dx 再積 dy</div>
          <div class="formula-box">∫₀¹ [ ∫₀¹ {{ currentEx().formula.split('= ')[1] }} dx ] dy</div>
          <div class="val">= {{ dyDx().toFixed(6) }}</div>
        </div>
      </div>

      <div class="exact-row">
        <span>精確值：{{ currentEx().exact }}</span>
        <span>|差距| = {{ Math.abs(dxDy() - dyDx()).toExponential(2) }}</span>
      </div>

      <div class="slice-viz">
        <svg viewBox="-0.1 -0.1 1.5 1.2" class="int-svg">
          <rect x="0" y="0" width="1" height="1" fill="none" stroke="var(--border)" stroke-width="0.01" />
          @for (i of sliceIndices(); track i) {
            <line [attr.x1]="mode() === 'dx-dy' ? sliceX(i) : 0"
                  [attr.y1]="mode() === 'dx-dy' ? 0 : sliceX(i)"
                  [attr.x2]="mode() === 'dx-dy' ? sliceX(i) : 1"
                  [attr.y2]="mode() === 'dx-dy' ? 1 : sliceX(i)"
                  stroke="var(--accent)" stroke-width="0.01" stroke-opacity="0.4" />
          }
          <text x="0.5" y="-0.03" text-anchor="middle" fill="var(--text-muted)" font-size="0.06">
            {{ mode() === 'dx-dy' ? '固定 x 切片' : '固定 y 切片' }}
          </text>
        </svg>
        <div class="mode-switch">
          <button class="ft" [class.active]="mode() === 'dx-dy'" (click)="mode.set('dx-dy')">dy→dx</button>
          <button class="ft" [class.active]="mode() === 'dy-dx'" (click)="mode.set('dy-dx')">dx→dy</button>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        兩種順序的數值吻合——因為函數在矩形區域上連續。
        下一節看<strong>非矩形區域</strong>的積分，那時內層積分的上下限會變成 x（或 y）的函數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 14px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .compare { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
    .col { flex: 1; padding: 12px; border: 1px solid var(--border); border-radius: 8px; text-align: center;
      background: var(--bg-surface); }
    .col-title { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .formula-box { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text); margin-bottom: 6px; }
    .val { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .eq { font-size: 24px; font-weight: 700; color: var(--accent); }
    .exact-row { display: flex; justify-content: space-between; padding: 8px 12px; border-radius: 8px;
      background: var(--accent-10); font-size: 13px; font-family: 'JetBrains Mono', monospace;
      color: var(--accent); margin-bottom: 12px; }
    .slice-viz { display: flex; align-items: center; gap: 12px; }
    .int-svg { width: 200px; height: 170px; }
    .mode-switch { display: flex; flex-direction: column; gap: 4px; }
  `,
})
export class StepIteratedIntegralsComponent {
  readonly examples = EXAMPLES;
  readonly Math = Math;
  readonly sel = signal(0);
  readonly mode = signal<'dx-dy' | 'dy-dx'>('dx-dy');
  readonly currentEx = computed(() => EXAMPLES[this.sel()]);
  readonly sliceIndices = computed(() => Array.from({ length: 8 }, (_, i) => i));

  sliceX(i: number): number { return (i + 1) / 9; }

  readonly dxDy = computed(() => {
    const ex = this.currentEx();
    return this.integrate(ex.f, ex.xRange, ex.yRange);
  });

  readonly dyDx = computed(() => {
    const ex = this.currentEx();
    return this.integrate((x, y) => ex.f(x, y), ex.yRange, ex.xRange, true);
  });

  private integrate(
    f: (x: number, y: number) => number,
    outerRange: [number, number],
    innerRange: [number, number],
    swapped = false,
    n = 200,
  ): number {
    const dOuter = (outerRange[1] - outerRange[0]) / n;
    const dInner = (innerRange[1] - innerRange[0]) / n;
    let total = 0;
    for (let i = 0; i < n; i++) {
      const outer = outerRange[0] + (i + 0.5) * dOuter;
      let inner = 0;
      for (let j = 0; j < n; j++) {
        const t = innerRange[0] + (j + 0.5) * dInner;
        inner += (swapped ? f(t, outer) : f(outer, t)) * dInner;
      }
      total += inner * dOuter;
    }
    return total;
  }
}
