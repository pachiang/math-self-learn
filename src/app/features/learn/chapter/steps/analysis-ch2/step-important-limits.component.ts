import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { generateTerms, harmonicSum, newtonSqrt2 } from './analysis-ch2-util';

interface LimitExample { name: string; fn: (n: number) => number; limit: number | null; desc: string; }

const EXAMPLES: LimitExample[] = [
  { name: '(1+1/n)ⁿ → e', fn: (n) => Math.pow(1 + 1 / n, n), limit: Math.E,
    desc: '單調遞增、有上界 → 收斂到 e = 2.71828…' },
  { name: 'H_n（調和級數）', fn: harmonicSum, limit: null,
    desc: '單調遞增但沒有上界 → 發散（非常慢）' },
  { name: 'Newton √2', fn: newtonSqrt2, limit: Math.SQRT2,
    desc: '每步誤差平方 → 收斂極快（二次收斂）' },
];

@Component({
  selector: 'app-step-important-limits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="重要極限" subtitle="§2.7">
      <p>
        三個你需要認識的極限：
      </p>
      <ul>
        <li><strong>(1 + 1/n)ⁿ → e</strong>：Euler 常數的定義之一。單調遞增且有界 → 收斂。</li>
        <li><strong>調和級數 Hₙ = 1 + 1/2 + … + 1/n → ∞</strong>：雖然每項趨近 0，部分和卻發散！</li>
        <li><strong>Babylonian 法 → √2</strong>：aₙ₊₁ = (aₙ + 2/aₙ)/2，二次收斂。</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="選一個數列看它的收斂（或發散）行為">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <svg viewBox="0 0 500 200" class="il-svg">
        <line x1="40" y1="170" x2="490" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" stroke-width="0.8" />

        <!-- Limit line (if convergent) -->
        @if (current().limit !== null) {
          <line x1="40" [attr.y1]="ty(current().limit!)" x2="490" [attr.y2]="ty(current().limit!)"
                stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />
          <text x="492" [attr.y]="ty(current().limit!) + 4" class="lim-label">{{ current().limit!.toFixed(4) }}</text>
        }

        <!-- Dots + path -->
        <path [attr.d]="pathD()" fill="none" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.4" />
        @for (t of terms(); track t.n) {
          <circle [attr.cx]="toNx(t.n)" [attr.cy]="ty(t.val)" r="3"
                  fill="var(--accent)" fill-opacity="0.7" />
        }
      </svg>

      <div class="info-row">
        <div class="desc">{{ current().desc }}</div>
      </div>

      <!-- Value table -->
      <div class="val-table-wrap">
        <table class="val-table">
          <thead><tr><th>n</th><th>aₙ</th>@if (current().limit !== null) { <th>|aₙ − L|</th> }</tr></thead>
          <tbody>
            @for (t of tableTerms(); track t.n) {
              <tr>
                <td>{{ t.n }}</td>
                <td>{{ t.val.toFixed(8) }}</td>
                @if (current().limit !== null) {
                  <td class="err">{{ Math.abs(t.val - current().limit!).toExponential(2) }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        (1+1/n)ⁿ 跟調和級數形成有趣的對比：
        一個收斂一個發散，但兩者都<strong>單調遞增</strong>。
        差別在於有沒有<strong>上界</strong>。
      </p>
      <p>
        下一節看當數列不收斂但有界時，我們還能說什麼——<strong>上極限和下極限</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .il-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .lim-label { font-size: 8px; fill: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .info-row { margin-bottom: 10px; }
    .desc { padding: 8px 12px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }

    .val-table-wrap { overflow-x: auto; }
    .val-table { width: 100%; border-collapse: collapse; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; }
    .val-table th { padding: 5px 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; }
    .val-table td { padding: 4px 8px; border-bottom: 1px solid var(--border); color: var(--text); }
    .val-table .err { color: var(--accent); }
  `,
})
export class StepImportantLimitsComponent {
  readonly Math = Math;
  readonly examples = EXAMPLES;
  readonly selIdx = signal(0);

  readonly current = computed(() => EXAMPLES[this.selIdx()]);
  readonly terms = computed(() => generateTerms(this.current().fn, 40));
  readonly tableTerms = computed(() => {
    const fn = this.current().fn;
    return [1, 2, 5, 10, 20, 50, 100].map((n) => ({ n, val: fn(n) }));
  });

  private readonly yRange = computed(() => {
    const vals = this.terms().map((t) => t.val);
    const L = this.current().limit;
    const mn = Math.min(...vals, L ?? 0);
    const mx = Math.max(...vals, L ?? 0);
    return { min: mn - 0.2, max: mx + 0.2 };
  });

  ty(v: number): number {
    const { min, max } = this.yRange();
    return 170 - ((v - min) / (max - min || 1)) * 155;
  }

  toNx(n: number): number { return 40 + (n / 42) * 450; }

  pathD(): string {
    const t = this.terms();
    if (t.length < 2) return '';
    return 'M' + t.map((p) => `${this.toNx(p.n)},${this.ty(p.val)}`).join('L');
  }
}
