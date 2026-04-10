import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { leftSum, getRects, sampleFn } from './analysis-ch6-util';

interface Preset { name: string; fn: (x: number) => number; a: number; b: number; exact: number; }

const PRESETS: Preset[] = [
  { name: 'x²', fn: (x) => x * x, a: 0, b: 1, exact: 1 / 3 },
  { name: 'sin x', fn: Math.sin, a: 0, b: Math.PI, exact: 2 },
  { name: '1/(1+x²)', fn: (x) => 1 / (1 + x * x), a: 0, b: 1, exact: Math.PI / 4 },
];

@Component({
  selector: 'app-step-riemann-idea',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Riemann 積分的想法" subtitle="§6.1">
      <p>
        怎麼算曲線下方的面積？用<strong>長方形逼近</strong>。
      </p>
      <p>
        把 [a, b] 切成 n 等分，每段用一個長方形近似。
        n 越大，近似越好。極限就是積分：
      </p>
      <p class="formula">∫ₐᵇ f(x) dx = lim(n→∞) Σ f(xᵢ) Δx</p>
      <p>
        這是 Riemann 積分的直覺。嚴格的定義用「上和」和「下和」夾擠。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 n 看長方形怎麼越來越貼合曲線">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">n = {{ nParts() }}</span>
          <input type="range" min="1" max="60" step="1" [value]="nParts()"
                 (input)="nParts.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="0 0 520 260" class="ri-svg">
        <line x1="40" y1="220" x2="500" y2="220" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="220" stroke="var(--border)" stroke-width="0.8" />

        <!-- Rectangles -->
        @for (r of rects(); track $index) {
          <rect [attr.x]="fx(r.x)" [attr.y]="fy(r.yHigh)" [attr.width]="Math.max(0.5, fx(r.x + r.width) - fx(r.x))"
                [attr.height]="Math.max(0.5, fy(r.yLow) - fy(r.yHigh))"
                fill="var(--accent)" fill-opacity="0.2" stroke="var(--accent)" stroke-width="0.5" />
        }

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">Σ = {{ approxSum().toFixed(6) }}</div>
        <div class="r-card ok">精確值 = {{ cur().exact.toFixed(6) }}</div>
        <div class="r-card">|誤差| = {{ Math.abs(approxSum() - cur().exact).toExponential(2) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>n = 1 時長方形很粗糙，n = 60 幾乎看不到誤差。下一節看嚴格的定義：<strong>上和與下和</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .n-slider { width: 120px; accent-color: var(--accent); }
    .ri-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 100px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepRiemannIdeaComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly nParts = signal(10);

  readonly cur = computed(() => PRESETS[this.selIdx()]);
  readonly rects = computed(() => getRects(this.cur().fn, this.cur().a, this.cur().b, this.nParts(), 'left'));
  readonly approxSum = computed(() => leftSum(this.cur().fn, this.cur().a, this.cur().b, this.nParts()));

  fx(x: number): number { const c = this.cur(); return 40 + ((x - c.a) / (c.b - c.a)) * 460; }
  fy(y: number): number { return 220 - (y / 1.2) * 200; }

  curvePath(): string {
    const c = this.cur();
    const pts = sampleFn(c.fn, c.a, c.b, 200);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
