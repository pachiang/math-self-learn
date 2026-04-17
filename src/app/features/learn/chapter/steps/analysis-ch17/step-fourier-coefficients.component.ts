import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { WAVE_FUNCTIONS, fourierCoeffs } from './analysis-ch17-util';

@Component({
  selector: 'app-step-fourier-coefficients',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fourier 係數" subtitle="§17.2">
      <p>
        如何求出 aₙ 和 bₙ？利用三角函數的<strong>正交性</strong>：
      </p>
      <p class="formula">
        aₙ = (1/π) ∫₋π^π f(x) cos(nx) dx &nbsp;　&nbsp; bₙ = (1/π) ∫₋π^π f(x) sin(nx) dx
      </p>
      <p>
        直覺：cos nx 和 sin nx 是「探測器」——把 f 乘上 cos nx 再積分，
        提取出第 n 個頻率的「含量」。就像收音機鎖頻接收特定電台。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選波形，看各頻率係數的大小">
      <div class="fn-tabs">
        @for (w of waves; track w.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ w.name }}</button>
        }
      </div>

      <div class="coeff-chart">
        <svg viewBox="-0.5 -1.8 16 3.6" class="bar-svg">
          <line x1="0" y1="0" x2="15.5" y2="0" stroke="var(--border)" stroke-width="0.03" />
          @for (bar of bars(); track bar.n) {
            <rect [attr.x]="bar.n * 1.5 - 0.3" [attr.y]="bar.val >= 0 ? -bar.val * 1.2 : 0"
                  width="0.6" [attr.height]="Math.abs(bar.val) * 1.2"
                  [attr.fill]="bar.type === 'a' ? '#6e9abf' : '#bf8a5a'" rx="0.1" />
            <text [attr.x]="bar.n * 1.5" y="0.5" text-anchor="middle"
                  fill="var(--text-muted)" font-size="0.35">{{ bar.label }}</text>
            <text [attr.x]="bar.n * 1.5" [attr.y]="bar.val >= 0 ? -bar.val * 1.2 - 0.15 : Math.abs(bar.val) * 1.2 + 0.4"
                  text-anchor="middle" fill="var(--text)" font-size="0.28" font-weight="600">
              {{ bar.val.toFixed(2) }}
            </text>
          }
        </svg>
      </div>

      <div class="legend">
        <span><span class="dot blue"></span>aₙ (cosine)</span>
        <span><span class="dot orange"></span>bₙ (sine)</span>
      </div>

      <div class="observation">
        @switch (sel()) {
          @case (0) { 方波是奇函數 → aₙ = 0，bₙ = 4/(nπ) 只有奇數項 }
          @case (1) { 鋸齒波是奇函數 → aₙ = 0，bₙ = (−1)ⁿ⁺¹ · 2/(nπ) }
          @case (2) { 三角波是偶函數 → bₙ = 0，aₙ 只有奇數項 }
          @case (3) { 半波整流 → aₙ 和 bₙ 都非零 }
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意規律：<strong>奇函數只有 sin 項</strong>（bₙ），<strong>偶函數只有 cos 項</strong>（aₙ）。
        係數隨 n 增大而衰減——高頻分量越來越少。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .bar-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .legend { display: flex; gap: 14px; justify-content: center; margin-bottom: 10px; font-size: 12px; color: var(--text-muted); }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px;
      &.blue { background: #6e9abf; } &.orange { background: #bf8a5a; } }
    .observation { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 13px; text-align: center; font-family: 'JetBrains Mono', monospace; color: var(--accent); }
  `,
})
export class StepFourierCoefficientsComponent {
  readonly Math = Math;
  readonly waves = WAVE_FUNCTIONS;
  readonly sel = signal(0);

  readonly bars = computed(() => {
    const w = WAVE_FUNCTIONS[this.sel()];
    const c = fourierCoeffs(w.fn, 9);
    const result: { n: number; val: number; type: 'a' | 'b'; label: string }[] = [];
    result.push({ n: 0, val: c.a0, type: 'a', label: 'a₀' });
    for (let n = 1; n <= 9; n++) {
      result.push({ n, val: c.an[n - 1], type: 'a', label: `a${n}` });
    }
    return result.concat(
      c.bn.slice(0, 9).map((v, i) => ({ n: i + 1, val: v, type: 'b' as const, label: `b${i + 1}` })),
    ).filter(b => Math.abs(b.val) > 0.005).slice(0, 10);
  });
}
