import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { findMVTPoint, sampleFn, numericalDerivative } from './analysis-ch5-util';

interface Preset { name: string; fn: (x: number) => number; a: number; b: number; }

const PRESETS: Preset[] = [
  { name: 'x²', fn: (x) => x * x, a: 0, b: 2 },
  { name: 'sin x', fn: Math.sin, a: 0, b: Math.PI },
  { name: 'x³ − 3x', fn: (x) => x * x * x - 3 * x, a: -1, b: 2 },
];

@Component({
  selector: 'app-step-mean-value',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="均值定理" subtitle="§5.4">
      <p>
        <strong>Rolle 定理</strong>：f(a) = f(b) 且 f 在 [a,b] 可微 → 存在 c 使 f'(c) = 0。
      </p>
      <p>
        <strong>均值定理</strong>（MVT）：把 Rolle 推廣——不要求端值相等：
      </p>
      <p class="formula">
        存在 c ∈ (a,b) 使得 f'(c) = [f(b) − f(a)] / (b − a)
      </p>
      <p>
        幾何意義：<strong>某處的切線平行於端點連線</strong>。
        這是微積分裡最重要的定理之一。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看切線怎麼跟割線平行——MVT 保證的那個 c 點">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <svg viewBox="0 0 520 280" class="mvt-svg">
        <line x1="50" y1="230" x2="490" y2="230" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="10" x2="50" y2="230" stroke="var(--border)" stroke-width="0.8" />

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Secant (a, f(a)) → (b, f(b)) -->
        <line [attr.x1]="fx(cur().a)" [attr.y1]="fy(cur().fn(cur().a))"
              [attr.x2]="fx(cur().b)" [attr.y2]="fy(cur().fn(cur().b))"
              stroke="#5a7faa" stroke-width="2" />
        <text [attr.x]="fx(cur().a) - 5" [attr.y]="fy(cur().fn(cur().a)) + 15" class="pt-label">a</text>
        <text [attr.x]="fx(cur().b) + 5" [attr.y]="fy(cur().fn(cur().b)) + 15" class="pt-label">b</text>

        <!-- Tangent at c (parallel to secant) -->
        <line [attr.x1]="fx(cPoint() - 1.5)" [attr.y1]="fy(tangentAtC(cPoint() - 1.5))"
              [attr.x2]="fx(cPoint() + 1.5)" [attr.y2]="fy(tangentAtC(cPoint() + 1.5))"
              stroke="#5a8a5a" stroke-width="2" stroke-dasharray="6 3" />

        <!-- c point -->
        <circle [attr.cx]="fx(cPoint())" [attr.cy]="fy(cur().fn(cPoint()))" r="6"
                fill="#5a8a5a" stroke="white" stroke-width="2" />
        <text [attr.x]="fx(cPoint()) + 8" [attr.y]="fy(cur().fn(cPoint())) - 8" class="c-label">c</text>

        <!-- Endpoints -->
        <circle [attr.cx]="fx(cur().a)" [attr.cy]="fy(cur().fn(cur().a))" r="4" fill="#5a7faa" />
        <circle [attr.cx]="fx(cur().b)" [attr.cy]="fy(cur().fn(cur().b))" r="4" fill="#5a7faa" />
      </svg>

      <div class="result-row">
        <div class="r-card">割線斜率 = {{ secantSlope().toFixed(4) }}</div>
        <div class="r-card ok">f'(c) = {{ tangentSlope().toFixed(4) }}</div>
        <div class="r-card">c ≈ {{ cPoint().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        MVT 的推論非常多：f' = 0 everywhere → f 是常數；f' > 0 → f 遞增；
        兩個函數同導數 → 差一個常數。
      </p>
      <p>下一節看 MVT 最知名的應用之一——<strong>L'Hôpital 法則</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .mvt-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .pt-label { font-size: 10px; fill: #5a7faa; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .c-label { font-size: 11px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .result-row { display: flex; gap: 8px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px;
      font-weight: 600; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepMeanValueComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly cur = computed(() => PRESETS[this.selIdx()]);

  readonly cPoint = computed(() => findMVTPoint(this.cur().fn, this.cur().a, this.cur().b));
  readonly secantSlope = computed(() => {
    const p = this.cur();
    return (p.fn(p.b) - p.fn(p.a)) / (p.b - p.a);
  });
  readonly tangentSlope = computed(() => numericalDerivative(this.cur().fn, this.cPoint()));

  fx(x: number): number { return 50 + ((x + 2) / 6) * 440; }
  fy(y: number): number { return 230 - ((y + 4) / 12) * 220; }

  tangentAtC(x: number): number {
    const c = this.cPoint();
    return this.cur().fn(c) + this.tangentSlope() * (x - c);
  }

  curvePath(): string {
    const pts = sampleFn(this.cur().fn, -2, 4, 300);
    return 'M' + pts.filter((p) => Math.abs(p.y) < 8).map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
