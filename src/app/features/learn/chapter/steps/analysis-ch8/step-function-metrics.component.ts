import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { supNormDist, l2NormDist, l1NormDist, sampleFn } from './analysis-ch8-util';

interface FnPair { name: string; f: (x: number) => number; g: (x: number) => number; desc: string; }

const PAIRS: FnPair[] = [
  { name: '小擾動', f: (x) => x, g: (x) => x + 0.1 * Math.sin(10 * x),
    desc: '在所有度量下都很近' },
  { name: '尖峰', f: () => 0, g: (x) => Math.max(0, 1 - 20 * Math.abs(x - 0.5)),
    desc: 'L¹ 和 L² 很小，但 sup 很大' },
  { name: '窄方波', f: () => 0, g: (x) => x > 0.45 && x < 0.55 ? 1 : 0,
    desc: 'sup = 1 但 L¹ = 0.1（面積小）' },
];

@Component({
  selector: 'app-step-function-metrics',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="函數空間的度量" subtitle="§8.3">
      <p>
        C[0,1]（[0,1] 上的連續函數）可以配上不同的度量：
      </p>
      <ul>
        <li><strong>d_sup</strong> = sup|f(x)−g(x)|：最大間距</li>
        <li><strong>d_L²</strong> = √∫|f−g|² dx：均方根距離</li>
        <li><strong>d_L¹</strong> = ∫|f−g| dx：平均距離</li>
      </ul>
      <p>同樣兩個函數，在不同度量下的「遠近」可以截然不同。</p>
    </app-prose-block>

    <app-challenge-card prompt="選函數對，切換度量看「距離」怎麼變">
      <div class="ctrl-row">
        @for (p of pairs; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <svg viewBox="0 0 520 200" class="fm-svg">
        <line x1="40" y1="160" x2="500" y2="160" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="160" stroke="var(--border)" stroke-width="0.8" />

        <!-- Shaded area between f and g -->
        <path [attr.d]="areaPath()" fill="var(--accent)" fill-opacity="0.1" />

        <!-- f curve -->
        <path [attr.d]="fPath()" fill="none" stroke="#5a8a5a" stroke-width="2" />
        <!-- g curve -->
        <path [attr.d]="gPath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Sup marker -->
        @if (supInfo().dist > 0.01) {
          <line [attr.x1]="fx(supInfo().maxX)" [attr.y1]="fy(cur().f(supInfo().maxX))"
                [attr.x2]="fx(supInfo().maxX)" [attr.y2]="fy(cur().g(supInfo().maxX))"
                stroke="#a05a5a" stroke-width="2" />
        }
      </svg>

      <div class="metrics-row">
        <div class="m-card">
          <div class="mc-label">d_sup</div>
          <div class="mc-val">{{ supInfo().dist.toFixed(4) }}</div>
        </div>
        <div class="m-card">
          <div class="mc-label">d_L²</div>
          <div class="mc-val">{{ l2Val().toFixed(4) }}</div>
        </div>
        <div class="m-card">
          <div class="mc-label">d_L¹</div>
          <div class="mc-val">{{ l1Val().toFixed(4) }}</div>
        </div>
      </div>
      <div class="desc">{{ cur().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>「在什麼意義下接近」取決於你選的度量。Ch7 的均勻收斂 = d_sup 收斂。下一節看度量空間的<strong>拓撲結構</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .fm-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .metrics-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .m-card { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .mc-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .mc-val { font-size: 16px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepFunctionMetricsComponent {
  readonly pairs = PAIRS;
  readonly selIdx = signal(0);
  readonly cur = computed(() => PAIRS[this.selIdx()]);
  readonly supInfo = computed(() => supNormDist(this.cur().f, this.cur().g, 0, 1));
  readonly l2Val = computed(() => l2NormDist(this.cur().f, this.cur().g, 0, 1));
  readonly l1Val = computed(() => l1NormDist(this.cur().f, this.cur().g, 0, 1));

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 160 - y * 140; }

  fPath(): string { return 'M' + sampleFn(this.cur().f, 0, 1, 200).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L'); }
  gPath(): string { return 'M' + sampleFn(this.cur().g, 0, 1, 200).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L'); }

  areaPath(): string {
    const f = this.cur().f, g = this.cur().g;
    const pts = sampleFn(f, 0, 1, 200);
    const upper = pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`);
    const lower = [...pts].reverse().map((p) => `${this.fx(p.x)},${this.fy(g(p.x))}`);
    return 'M' + upper.join('L') + 'L' + lower.join('L') + 'Z';
  }
}
