import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-applications-2d',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="應用：面積、質心、慣性矩" subtitle="§14.9">
      <p>
        重積分的三大經典應用：
      </p>
      <ul>
        <li><strong>面積</strong>：A = ∬_D 1 dA</li>
        <li><strong>質心</strong>：x̄ = (1/A) ∬_D x dA，ȳ = (1/A) ∬_D y dA</li>
        <li><strong>慣性矩</strong>：I = ∬_D (x²+y²)ρ dA</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="選形狀看面積、質心與慣性矩">
      <div class="fn-tabs">
        @for (s of shapes; track s.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ s.name }}</button>
        }
      </div>

      <svg viewBox="-1.6 -1.6 3.2 3.2" class="shape-svg">
        <!-- Grid -->
        <line x1="-1.6" y1="0" x2="1.6" y2="0" stroke="var(--border)" stroke-width="0.01" />
        <line x1="0" y1="-1.6" x2="0" y2="1.6" stroke="var(--border)" stroke-width="0.01" />

        <!-- Shape -->
        <path [attr.d]="shapePath()" fill="rgba(var(--accent-rgb), 0.2)"
              stroke="var(--accent)" stroke-width="0.025" />

        <!-- Centroid -->
        <circle [attr.cx]="centroid()[0]" [attr.cy]="centroid()[1]" r="0.06"
                fill="#bf6e6e" stroke="white" stroke-width="0.02" />
        <text [attr.x]="centroid()[0] + 0.1" [attr.y]="centroid()[1] - 0.1"
              fill="#bf6e6e" font-size="0.12" font-weight="bold">質心</text>
      </svg>

      <div class="results">
        <div class="r-card"><span class="rl">面積</span><span class="rv">{{ area().toFixed(4) }}</span></div>
        <div class="r-card"><span class="rl">質心 x̄</span><span class="rv">{{ centroid()[0].toFixed(4) }}</span></div>
        <div class="r-card"><span class="rl">質心 ȳ</span><span class="rv">{{ centroid()[1].toFixed(4) }}</span></div>
        <div class="r-card accent"><span class="rl">慣性矩 I₀</span><span class="rv">{{ inertia().toFixed(4) }}</span></div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這些量都是積分的特例——只是被積函數不同。
        重積分把「加總」推廣到連續的二維區域，是工程與物理的基本工具。
      </p>
    </app-prose-block>
  `,
  styles: `
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .shape-svg { width: 100%; max-width: 360px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .results { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .r-card { display: flex; justify-content: space-between; padding: 8px 12px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--bg-surface); font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      &.accent { background: var(--accent-10); grid-column: 1 / -1; } }
    .rl { color: var(--text-muted); }
    .rv { color: var(--accent); font-weight: 700; }
  `,
})
export class StepApplications2dComponent {
  readonly shapes = [
    { name: '圓盤 r≤1', inside: (x: number, y: number) => x * x + y * y <= 1 },
    { name: '正方形', inside: (x: number, y: number) => Math.abs(x) <= 1 && Math.abs(y) <= 1 },
    { name: '三角形', inside: (x: number, y: number) => x >= 0 && y >= 0 && x + y <= 1 },
    { name: '橢圓', inside: (x: number, y: number) => x * x / 1 + y * y / 0.25 <= 1 },
  ];
  readonly sel = signal(0);

  private readonly currentShape = computed(() => this.shapes[this.sel()]);
  private readonly N = 300;

  readonly area = computed(() => this.integrate(() => 1));
  readonly centroid = computed((): [number, number] => {
    const a = this.area();
    if (a < 1e-10) return [0, 0];
    const cx = this.integrate((x, _y) => x) / a;
    const cy = this.integrate((_x, y) => y) / a;
    return [cx, cy];
  });
  readonly inertia = computed(() => this.integrate((x, y) => x * x + y * y));

  private integrate(f: (x: number, y: number) => number): number {
    const shape = this.currentShape();
    const N = this.N;
    const dx = 3.2 / N, dy = 3.2 / N;
    let sum = 0;
    for (let j = 0; j < N; j++) {
      const y = -1.6 + (j + 0.5) * dy;
      for (let i = 0; i < N; i++) {
        const x = -1.6 + (i + 0.5) * dx;
        if (shape.inside(x, y)) {
          sum += f(x, y) * dx * dy;
        }
      }
    }
    return sum;
  }

  shapePath(): string {
    const shape = this.currentShape();
    if (shape.name === '圓盤 r≤1') {
      return 'M1,0 A1,1 0 1 1 -1,0 A1,1 0 1 1 1,0 Z';
    }
    if (shape.name === '正方形') {
      return 'M-1,-1 L1,-1 L1,1 L-1,1 Z';
    }
    if (shape.name === '三角形') {
      return 'M0,0 L1,0 L0,1 Z';
    }
    // 橢圓
    const N = 80;
    let path = '';
    for (let i = 0; i <= N; i++) {
      const th = (2 * Math.PI * i) / N;
      const x = Math.cos(th);
      const y = 0.5 * Math.sin(th);
      path += (i === 0 ? 'M' : 'L') + `${x},${y}`;
    }
    return path + 'Z';
  }
}
