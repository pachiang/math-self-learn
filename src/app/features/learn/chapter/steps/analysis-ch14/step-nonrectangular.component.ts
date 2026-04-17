import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Region {
  name: string;
  desc: string;
  xRange: [number, number];
  yLower: (x: number) => number;
  yUpper: (x: number) => number;
  f: (x: number, y: number) => number;
  formula: string;
}

const REGIONS: Region[] = [
  {
    name: '三角形',
    desc: '0 ≤ x ≤ 1, 0 ≤ y ≤ x',
    xRange: [0, 1],
    yLower: () => 0,
    yUpper: (x) => x,
    f: (x, y) => x + y,
    formula: '∫₀¹ ∫₀ˣ (x+y) dy dx',
  },
  {
    name: '拋物線區域',
    desc: '0 ≤ x ≤ 1, x² ≤ y ≤ √x',
    xRange: [0, 1],
    yLower: (x) => x * x,
    yUpper: (x) => Math.sqrt(x),
    f: (_x, _y) => 1,
    formula: '∫₀¹ ∫_(x²)^(√x) 1 dy dx',
  },
  {
    name: '半圓',
    desc: '-1 ≤ x ≤ 1, 0 ≤ y ≤ √(1−x²)',
    xRange: [-1, 1],
    yLower: () => 0,
    yUpper: (x) => Math.sqrt(Math.max(0, 1 - x * x)),
    f: (x, y) => x * x + y * y,
    formula: '∫₋₁¹ ∫₀^(√(1−x²)) (x²+y²) dy dx',
  },
];

@Component({
  selector: 'app-step-nonrectangular',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="非矩形區域" subtitle="§14.4">
      <p>
        大多數積分區域不是矩形。<strong>Type I</strong>：y 的上下限是 x 的函數。
      </p>
      <p class="formula">∬_D f dA = ∫ₐᵇ ∫_(g₁(x))^(g₂(x)) f(x,y) dy dx</p>
      <p>
        關鍵：畫出區域 → 決定「誰當外層」→ 寫出上下限。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同區域，拖 x₀ 看 y 的積分範圍怎麼隨 x 變化">
      <div class="fn-tabs">
        @for (r of regions; track r.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ r.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">x₀ = {{ xProbe().toFixed(2) }}</span>
        <input type="range" [min]="currentRegion().xRange[0]" [max]="currentRegion().xRange[1]"
               step="0.01" [value]="xProbe()"
               (input)="xProbe.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-1.3 -0.3 2.8 1.8" class="region-svg">
        <!-- Grid -->
        <line x1="-1.3" y1="0" x2="1.5" y2="0" stroke="var(--border)" stroke-width="0.01" />
        <line x1="0" y1="-0.3" x2="0" y2="1.5" stroke="var(--border)" stroke-width="0.01" />

        <!-- Region fill -->
        <path [attr.d]="regionPath()" fill="rgba(var(--accent-rgb), 0.15)"
              stroke="var(--accent)" stroke-width="0.02" />

        <!-- Probe line -->
        <line [attr.x1]="xProbe()" [attr.y1]="probeYLow()" [attr.x2]="xProbe()" [attr.y2]="probeYHigh()"
              stroke="#bf6e6e" stroke-width="0.03" />
        <circle [attr.cx]="xProbe()" [attr.cy]="probeYLow()" r="0.03" fill="#bf6e6e" />
        <circle [attr.cx]="xProbe()" [attr.cy]="probeYHigh()" r="0.03" fill="#bf6e6e" />
      </svg>

      <div class="info-row">
        <div class="i-card">y ∈ [{{ probeYLow().toFixed(3) }}, {{ probeYHigh().toFixed(3) }}]</div>
        <div class="i-card accent">∬ f dA ≈ {{ integral().toFixed(6) }}</div>
      </div>

      <div class="desc">{{ currentRegion().desc }}</div>
      <div class="desc formula-sm">{{ currentRegion().formula }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        選擇積分順序時，哪種方式讓上下限更簡單，就用哪種。
        有時候反轉順序（Type II：x 是 y 的函數）能把困難的積分變簡單。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .region-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .info-row { display: flex; gap: 10px; margin-bottom: 8px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
    .desc { text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .formula-sm { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; }
  `,
})
export class StepNonrectangularComponent {
  readonly regions = REGIONS;
  readonly sel = signal(0);
  readonly xProbe = signal(0.5);
  readonly currentRegion = computed(() => REGIONS[this.sel()]);

  readonly probeYLow = computed(() => this.currentRegion().yLower(this.xProbe()));
  readonly probeYHigh = computed(() => this.currentRegion().yUpper(this.xProbe()));

  readonly integral = computed(() => {
    const r = this.currentRegion();
    const N = 200;
    const dx = (r.xRange[1] - r.xRange[0]) / N;
    let sum = 0;
    for (let i = 0; i < N; i++) {
      const x = r.xRange[0] + (i + 0.5) * dx;
      const yL = r.yLower(x);
      const yU = r.yUpper(x);
      if (yU <= yL) continue;
      const dy = (yU - yL) / N;
      for (let j = 0; j < N; j++) {
        const y = yL + (j + 0.5) * dy;
        sum += r.f(x, y) * dy * dx;
      }
    }
    return sum;
  });

  regionPath(): string {
    const r = this.currentRegion();
    const N = 100;
    const dx = (r.xRange[1] - r.xRange[0]) / N;
    // Upper boundary L→R
    let path = '';
    for (let i = 0; i <= N; i++) {
      const x = r.xRange[0] + i * dx;
      const y = r.yUpper(x);
      path += (i === 0 ? 'M' : 'L') + `${x},${y}`;
    }
    // Lower boundary R→L
    for (let i = N; i >= 0; i--) {
      const x = r.xRange[0] + i * dx;
      const y = r.yLower(x);
      path += `L${x},${y}`;
    }
    return path + 'Z';
  }
}
