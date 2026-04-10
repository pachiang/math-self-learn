import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch5-util';

interface LHExample { name: string; fStr: string; gStr: string; f: (x: number) => number; g: (x: number) => number;
  fp: (x: number) => number; gp: (x: number) => number; c: number; form: string; answer: string; }

const EXAMPLES: LHExample[] = [
  { name: 'sin x / x', fStr: 'sin x', gStr: 'x', f: Math.sin, g: (x) => x,
    fp: Math.cos, gp: () => 1, c: 0, form: '0/0', answer: 'cos(0)/1 = 1' },
  { name: '(eˣ−1)/x', fStr: 'eˣ−1', gStr: 'x', f: (x) => Math.exp(x) - 1, g: (x) => x,
    fp: Math.exp, gp: () => 1, c: 0, form: '0/0', answer: 'eˣ/1 at 0 = 1' },
  { name: 'x/eˣ', fStr: 'x', gStr: 'eˣ', f: (x) => x, g: Math.exp,
    fp: () => 1, gp: Math.exp, c: Infinity, form: '∞/∞', answer: '1/eˣ → 0' },
];

@Component({
  selector: 'app-step-lhopital',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="L'Hôpital 法則" subtitle="§5.5">
      <p>
        遇到 <strong>0/0</strong> 或 <strong>∞/∞</strong> 的不定式？
      </p>
      <p class="formula">
        lim f(x)/g(x) = lim f'(x)/g'(x)
      </p>
      <p>
        （前提：右邊的極限存在或為 ±∞。）
        這是 MVT 的直接推論——Cauchy 均值定理。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個不定式，看分子分母各自趨向 0（或 ∞），但比值有極限">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <div class="steps-display">
        <div class="step-card">
          <div class="sc-title">原式</div>
          <div class="sc-formula">lim {{ cur().fStr }} / {{ cur().gStr }}</div>
          <div class="sc-type">{{ cur().form }} 型</div>
        </div>
        <div class="arrow">→ L'Hôpital →</div>
        <div class="step-card result">
          <div class="sc-title">微分後</div>
          <div class="sc-formula">lim f'(x) / g'(x)</div>
          <div class="sc-answer">= {{ cur().answer }}</div>
        </div>
      </div>

      <svg viewBox="0 0 500 200" class="lh-svg">
        <line x1="50" y1="150" x2="450" y2="150" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="10" x2="50" y2="150" stroke="var(--border)" stroke-width="0.8" />

        <!-- f/g ratio curve -->
        <path [attr.d]="ratioPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Limit line -->
        @if (limitVal() !== null) {
          <line x1="50" [attr.y1]="ry(limitVal()!)" x2="450" [attr.y2]="ry(limitVal()!)"
                stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />
          <text x="455" [attr.y]="ry(limitVal()!) + 4" class="lv">{{ limitVal() }}</text>
        }
      </svg>
    </app-challenge-card>

    <app-prose-block>
      <p>
        L'Hôpital 本質上說：函數的比值取決於它們<strong>接近 0（或 ∞）的速度</strong>，
        而速度就是導數。
      </p>
      <p>下一節重訪 <strong>Taylor 定理</strong>——用導數做更精確的近似。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .steps-display { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;
      justify-content: center; }
    .step-card { padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); text-align: center;
      &.result { background: rgba(90,138,90,0.06); border-color: #5a8a5a; } }
    .sc-title { font-size: 11px; color: var(--text-muted); font-weight: 600; }
    .sc-formula { font-size: 15px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .sc-type { font-size: 12px; color: #a05a5a; font-weight: 600; }
    .sc-answer { font-size: 14px; color: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .arrow { font-size: 14px; color: var(--text-muted); font-weight: 600; }
    .lh-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .lv { font-size: 9px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepLhopitalComponent {
  readonly examples = EXAMPLES;
  readonly selIdx = signal(0);
  readonly cur = computed(() => EXAMPLES[this.selIdx()]);

  readonly limitVal = computed(() => {
    const ex = this.cur();
    if (ex.c === 0) return ex.fp(0) / ex.gp(0);
    return 0; // x/e^x → 0
  });

  rx(x: number): number { return 50 + ((x + 3) / 6) * 400; }
  ry(y: number): number { return 150 - ((y + 1) / 4) * 140; }

  ratioPath(): string {
    const ex = this.cur();
    const pts: string[] = [];
    const lo = ex.c === Infinity ? 0.1 : ex.c - 3;
    const hi = ex.c === Infinity ? 6 : ex.c + 3;
    for (let x = lo; x <= hi; x += 0.02) {
      if (Math.abs(x - ex.c) < 0.01 && ex.c !== Infinity) continue;
      const gx = ex.g(x);
      if (Math.abs(gx) < 1e-10) continue;
      const y = ex.f(x) / gx;
      if (isFinite(y) && Math.abs(y) < 3) pts.push(`${this.rx(x)},${this.ry(y)}`);
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }
}
