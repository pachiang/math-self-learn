import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { generateTerms } from './analysis-ch2-util';

const SEQS = [
  { name: '1/n', fn: (n: number) => 1 / n, limit: 0 },
  { name: '1−1/n', fn: (n: number) => 1 - 1 / n, limit: 1 },
  { name: 'n/(n+1)', fn: (n: number) => n / (n + 1), limit: 1 },
];

const OPS = [
  { name: 'aₙ + bₙ', combine: (a: number, b: number) => a + b, limitCombine: (la: number, lb: number) => la + lb },
  { name: 'aₙ × bₙ', combine: (a: number, b: number) => a * b, limitCombine: (la: number, lb: number) => la * lb },
  { name: 'aₙ − bₙ', combine: (a: number, b: number) => a - b, limitCombine: (la: number, lb: number) => la - lb },
];

@Component({
  selector: 'app-step-limit-laws',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="極限的唯一性與運算" subtitle="§2.3">
      <p>
        極限如果存在，就是<strong>唯一</strong>的。（如果有兩個不同的極限 L₁ ≠ L₂，
        取 ε = |L₁−L₂|/2，帶子不重疊但項要同時在兩個帶子裡——矛盾。）
      </p>
      <p>
        極限的<strong>運算律</strong>：
      </p>
      <ul>
        <li>lim(aₙ + bₙ) = lim aₙ + lim bₙ</li>
        <li>lim(aₙ · bₙ) = lim aₙ · lim bₙ</li>
        <li>lim(c · aₙ) = c · lim aₙ</li>
        <li>如果 lim bₙ ≠ 0，lim(aₙ / bₙ) = lim aₙ / lim bₙ</li>
      </ul>
      <p>
        還有<strong>夾擠定理</strong>：如果 aₙ ≤ bₙ ≤ cₙ 且 lim aₙ = lim cₙ = L，
        那麼 lim bₙ = L。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選兩個數列和一個運算，看「極限的運算 = 運算的極限」">
      <div class="ctrl-row">
        <div class="sel">
          <span class="sel-label">aₙ =</span>
          @for (s of seqs; track s.name; let i = $index) {
            <button class="pre-btn" [class.active]="idxA() === i" (click)="idxA.set(i)">{{ s.name }}</button>
          }
        </div>
        <div class="sel">
          <span class="sel-label">bₙ =</span>
          @for (s of seqs; track s.name; let i = $index) {
            <button class="pre-btn" [class.active]="idxB() === i" (click)="idxB.set(i)">{{ s.name }}</button>
          }
        </div>
        <div class="sel">
          <span class="sel-label">運算</span>
          @for (op of ops; track op.name; let i = $index) {
            <button class="pre-btn" [class.active]="opIdx() === i" (click)="opIdx.set(i)">{{ op.name }}</button>
          }
        </div>
      </div>

      <svg viewBox="0 0 500 180" class="law-svg">
        <line x1="40" y1="150" x2="490" y2="150" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="150" stroke="var(--border)" stroke-width="0.8" />

        <!-- Combined sequence dots -->
        @for (t of combined(); track t.n) {
          <circle [attr.cx]="40 + t.n * 9" [attr.cy]="ty(t.val)" r="3"
                  fill="var(--accent)" fill-opacity="0.7" />
        }

        <!-- Predicted limit line -->
        <line x1="40" [attr.y1]="ty(predictedLimit())" x2="490" [attr.y2]="ty(predictedLimit())"
              stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="4 3" />
        <text x="492" [attr.y]="ty(predictedLimit()) + 4" class="lim-label">{{ predictedLimit().toFixed(3) }}</text>
      </svg>

      <div class="result-box">
        lim aₙ = {{ seqs[idxA()].limit }}，lim bₙ = {{ seqs[idxB()].limit }}<br />
        lim({{ ops[opIdx()].name }}) = <strong>{{ predictedLimit().toFixed(4) }}</strong> ✓
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        運算律讓我們可以「拆開」複雜的極限。但有些數列用運算律不容易處理——
        需要更強的工具。下一節看<strong>單調有界定理</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .sel { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .sel-label { font-size: 12px; font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .pre-btn { padding: 3px 8px; border: 1px solid var(--border); border-radius: 4px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .law-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .lim-label { font-size: 8px; fill: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .result-box { padding: 12px; text-align: center; background: var(--bg-surface);
      border-radius: 8px; border: 1px solid var(--border); font-size: 13px;
      color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;
      strong { color: #5a8a5a; font-size: 16px; } }
  `,
})
export class StepLimitLawsComponent {
  readonly seqs = SEQS;
  readonly ops = OPS;
  readonly idxA = signal(0);
  readonly idxB = signal(1);
  readonly opIdx = signal(0);

  readonly combined = computed(() => {
    const a = SEQS[this.idxA()], b = SEQS[this.idxB()], op = OPS[this.opIdx()];
    return generateTerms((n) => op.combine(a.fn(n), b.fn(n)), 50);
  });

  readonly predictedLimit = computed(() => {
    const la = SEQS[this.idxA()].limit, lb = SEQS[this.idxB()].limit;
    return OPS[this.opIdx()].limitCombine(la, lb);
  });

  ty(v: number): number {
    // Map roughly [-1, 3] to [150, 10]
    return 150 - ((v + 1) / 4) * 140;
  }
}
