import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { taylorCoeff, taylorEval } from './analysis-ch3-util';

interface TaylorPreset { name: string; coeffName: string; trueFn: (x: number) => number; formula: string; }

const PRESETS: TaylorPreset[] = [
  { name: 'sin x', coeffName: 'sin', trueFn: Math.sin, formula: 'x − x³/3! + x⁵/5! − …' },
  { name: 'cos x', coeffName: 'cos', trueFn: Math.cos, formula: '1 − x²/2! + x⁴/4! − …' },
  { name: 'eˣ', coeffName: 'exp', trueFn: Math.exp, formula: '1 + x + x²/2! + x³/3! + …' },
  { name: 'ln(1+x)', coeffName: 'ln1px', trueFn: (x) => Math.log(1 + x), formula: 'x − x²/2 + x³/3 − …' },
];

@Component({
  selector: 'app-step-taylor-series',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Taylor 級數" subtitle="§3.8">
      <p>
        <strong>Taylor 公式</strong>：如果 f 在 a 附近無限可微，它的冪級數展開是：
      </p>
      <p class="formula">f(x) = Σ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ</p>
      <p>
        在 a = 0 時叫 <strong>Maclaurin 級數</strong>。經典的四個：
      </p>
      <ul>
        <li>sin x = x − x³/3! + x⁵/5! − …</li>
        <li>cos x = 1 − x²/2! + x⁴/4! − …</li>
        <li>eˣ = 1 + x + x²/2! + …</li>
        <li>ln(1+x) = x − x²/2 + x³/3 − …</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="逐項加上去——看 Taylor 多項式怎麼一步步逼近真正的函數">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">N = {{ degree() }}</span>
          <input type="range" min="0" max="15" step="1" [value]="degree()"
                 (input)="degree.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="-20 -20 540 260" class="taylor-svg">
        <line x1="250" y1="0" x2="250" y2="240" stroke="var(--border)" stroke-width="0.5" />
        <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" stroke-width="0.5" />

        <!-- True function (green) -->
        <path [attr.d]="truePath()" fill="none" stroke="#5a8a5a" stroke-width="2.5" />

        <!-- Previous degree polynomial (faded) -->
        @if (degree() > 0) {
          <path [attr.d]="polyPathN(degree() - 1)" fill="none" stroke="var(--text-muted)"
                stroke-width="1" stroke-opacity="0.3" />
        }

        <!-- Current degree polynomial (accent) -->
        <path [attr.d]="polyPathN(degree())" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Remainder shading between true and poly -->
        <path [attr.d]="remainderArea()" fill="var(--accent)" fill-opacity="0.06" />
      </svg>

      <div class="info-row">
        <div class="info-card">
          <div class="ic-label">展開式</div>
          <div class="ic-val">{{ currentPreset().formula }}</div>
        </div>
        <div class="info-card">
          <div class="ic-label">N = {{ degree() }} 時在 x = 1 的值</div>
          <div class="ic-val">T(1) = {{ approxAt1().toFixed(8) }}</div>
        </div>
        <div class="info-card">
          <div class="ic-label">真值</div>
          <div class="ic-val">f(1) = {{ trueAt1().toFixed(8) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        隨著 N 增加，Taylor 多項式越來越貼近真正的函數。
        每加一項就「修正」前一步的誤差。
      </p>
      <p>
        但要注意：Taylor 級數不一定總是收斂到原函數——
        例如 e^(-1/x²) 在 x=0 的 Taylor 展開全是 0，但函數本身不是 0。
        這是分析裡的一個經典反例。
      </p>
      <p>下一節用心智圖把整章串起來。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 100px; accent-color: var(--accent); }
    .taylor-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .info-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .info-card { flex: 1; min-width: 120px; padding: 8px 10px; border: 1px solid var(--border);
      border-radius: 6px; background: var(--bg-surface); }
    .ic-label { font-size: 10px; color: var(--text-muted); }
    .ic-val { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
  `,
})
export class StepTaylorSeriesComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly degree = signal(3);

  readonly currentPreset = computed(() => PRESETS[this.selIdx()]);
  private readonly coeffFn = computed(() => taylorCoeff(this.currentPreset().coeffName));

  readonly approxAt1 = computed(() => taylorEval(this.coeffFn(), 1, 0, this.degree()));
  readonly trueAt1 = computed(() => this.currentPreset().trueFn(1));

  sx(x: number): number { return 250 + x * 60; }
  sy(y: number): number { return 120 - y * 50; }

  truePath(): string {
    const fn = this.currentPreset().trueFn;
    const pts: string[] = [];
    for (let x = -4; x <= 4; x += 0.08) {
      const y = fn(x);
      if (isFinite(y) && Math.abs(y) < 4.5) pts.push(`${this.sx(x)},${this.sy(y)}`);
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }

  polyPathN(N: number): string {
    const cf = this.coeffFn();
    const pts: string[] = [];
    for (let x = -4; x <= 4; x += 0.08) {
      const y = taylorEval(cf, x, 0, N);
      if (isFinite(y) && Math.abs(y) < 4.5) pts.push(`${this.sx(x)},${this.sy(y)}`);
      else if (pts.length > 0) break;
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }

  remainderArea(): string {
    // Simplified: just return the poly path (actual area fill needs closed path — skip for simplicity)
    return '';
  }
}
