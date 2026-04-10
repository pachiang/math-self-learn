import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { lpBallBoundary, lpDist } from './analysis-ch8-util';

type MetricType = 'l2' | 'l1' | 'linf' | 'discrete';

@Component({
  selector: 'app-step-metric-space-def',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是度量空間" subtitle="§8.1">
      <p>
        <strong>度量空間</strong> (X, d) = 一個集合 X + 一個「距離函數」d，滿足：
      </p>
      <ol>
        <li><strong>正定</strong>：d(x,y) ≥ 0，且 d(x,y) = 0 ⟺ x = y</li>
        <li><strong>對稱</strong>：d(x,y) = d(y,x)</li>
        <li><strong>三角不等式</strong>：d(x,z) ≤ d(x,y) + d(y,z)</li>
      </ol>
      <p>
        「距離」是<strong>抽象的</strong>——任何滿足這三條的函數都算。
        同一個集合 R² 可以配上不同的距離，得到不同的「幾何」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同度量，看同一個半徑 r 的 ball 長什麼形狀">
      <div class="ctrl-row">
        @for (m of metrics; track m.id) {
          <button class="pre-btn" [class.active]="metric() === m.id" (click)="metric.set(m.id)">{{ m.name }}</button>
        }
      </div>
      <div class="r-ctrl">
        <span class="rl">r = {{ radius().toFixed(2) }}</span>
        <input type="range" min="0.2" max="2" step="0.05" [value]="radius()"
               (input)="radius.set(+($any($event.target)).value)" class="r-slider" />
      </div>

      <svg viewBox="-3 -3 6 6" class="ms-svg"
           (click)="onSvgClick($event)">
        <!-- Grid -->
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-3" [attr.x2]="g" y2="3" stroke="var(--border)" stroke-width="0.015" />
          <line x1="-3" [attr.y1]="g" x2="3" [attr.y2]="g" stroke="var(--border)" stroke-width="0.015" />
        }

        <!-- Ball boundary -->
        @if (metric() !== 'discrete') {
          <path [attr.d]="ballPath()" fill="var(--accent)" fill-opacity="0.1"
                stroke="var(--accent)" stroke-width="0.04" />
        } @else {
          @if (radius() > 0.5) {
            <rect x="-2.8" y="-2.8" width="5.6" height="5.6" fill="var(--accent)" fill-opacity="0.05"
                  stroke="var(--accent)" stroke-width="0.03" stroke-dasharray="0.1 0.08" rx="0.1" />
          }
        }

        <!-- Center point -->
        <circle [attr.cx]="cx()" [attr.cy]="cy()" r="0.08" fill="var(--accent)" stroke="white" stroke-width="0.03" />
      </svg>

      <div class="info-row">
        <div class="i-card">center = ({{ cx().toFixed(1) }}, {{ cy().toFixed(1) }})</div>
        <div class="i-card accent">{{ currentMetricName() }} 球：{{ ballShape() }}</div>
        <div class="i-card">d(center, 原點) = {{ distToOrigin().toFixed(3) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>同一個 R² 配上不同距離，「球」的形狀完全不同。下一節深入 Lᵖ 範數——看球怎麼<strong>連續變形</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .pre-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .r-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rl { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .r-slider { flex: 1; accent-color: var(--accent); }
    .ms-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); cursor: crosshair; }
    .info-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .i-card { flex: 1; min-width: 90px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.accent { color: var(--accent); } }
  `,
})
export class StepMetricSpaceDefComponent {
  readonly metrics = [
    { id: 'l2' as MetricType, name: '歐幾里得 d₂' },
    { id: 'l1' as MetricType, name: '曼哈頓 d₁' },
    { id: 'linf' as MetricType, name: '最大值 d∞' },
    { id: 'discrete' as MetricType, name: '離散' },
  ];
  readonly metric = signal<MetricType>('l2');
  readonly radius = signal(1.0);
  readonly cx = signal(0.5);
  readonly cy = signal(0.3);

  readonly distToOrigin = computed(() => {
    const m = this.metric();
    if (m === 'discrete') return this.cx() === 0 && this.cy() === 0 ? 0 : 1;
    const p = m === 'l1' ? 1 : m === 'l2' ? 2 : 50;
    return lpDist([this.cx(), this.cy()], [0, 0], p);
  });

  readonly currentMetricName = computed(() => this.metrics.find((m) => m.id === this.metric())!.name);

  readonly ballShape = computed(() => {
    switch (this.metric()) {
      case 'l2': return '圓';
      case 'l1': return '菱形';
      case 'linf': return '正方形';
      case 'discrete': return this.radius() > 0.5 ? '整個空間' : '一個點';
    }
  });

  ballPath(): string {
    const m = this.metric();
    const p = m === 'l1' ? 1 : m === 'l2' ? 2 : 50;
    const pts = lpBallBoundary(p, this.radius());
    const shifted = pts.map((pt) => ({ x: pt.x + this.cx(), y: pt.y + this.cy() }));
    return 'M' + shifted.map((pt) => `${pt.x},${pt.y}`).join('L') + 'Z';
  }

  onSvgClick(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 6 - 3;
    const y = ((ev.clientY - rect.top) / rect.height) * 6 - 3;
    this.cx.set(Math.round(x * 10) / 10);
    this.cy.set(Math.round(y * 10) / 10);
  }
}
