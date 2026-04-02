import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { isIrreducible, evalPoly } from './field-utils';

interface PolyCheck { label: string; coeffs: number[]; p: number; }

const EXAMPLES: PolyCheck[] = [
  { label: 'x\u00B2 + 1',         coeffs: [1, 0, 1],    p: 2 },
  { label: 'x\u00B2 + x + 1',     coeffs: [1, 1, 1],    p: 2 },
  { label: 'x\u00B2 + 1',         coeffs: [1, 0, 1],    p: 3 },
  { label: 'x\u00B2 + 1',         coeffs: [1, 0, 1],    p: 5 },
  { label: 'x\u00B3 + x + 1',     coeffs: [1, 1, 0, 1], p: 2 },
  { label: 'x\u00B2 + 2',         coeffs: [2, 0, 1],    p: 3 },
];

@Component({
  selector: 'app-step-irreducible',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="不可約多項式" subtitle="\u00A77.4">
      <p>
        整數裡有質數（不能分解的），多項式裡也有：
        <strong>不可約多項式</strong> — 在某個域 F 上不能分解成更低次多項式的乘積。
      </p>
      <p>
        關鍵：同一個多項式在不同的域上可能可約也可能不可約！
        x\u00B2 + 1 在 R 上不可約，但在 C 上 = (x+i)(x\u2212i) 可約。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="對每個多項式，代入 Z\u209A 的所有值，看它有沒有根">
      <div class="check-grid">
        @for (ex of examples; track ex.label + ex.p) {
          <div class="check-card" [class.irred]="checkIrred(ex)" [class.red]="!checkIrred(ex)">
            <div class="poly-name">{{ ex.label }} \u2208 Z{{ ex.p }}[x]</div>
            <div class="root-check">
              @for (x of range(ex.p); track x) {
                <span class="root-val" [class.is-root]="evalAt(ex, x) === 0">
                  f({{ x }})={{ evalAt(ex, x) }}
                </span>
              }
            </div>
            <div class="verdict">
              {{ checkIrred(ex) ? '\u2713 不可約' : '\u2717 可約（有根 \u2192 有因式）' }}
            </div>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        不可約多項式的地位跟質數一樣：它是多項式環的「基本構件」。
        而且跟整數的 Z/pZ 得到域一樣，<strong>F[x]/(不可約多項式) 也是域</strong>！
      </p>
      <span class="hint">
        這是構造新域的鑰匙：選一個不可約多項式，用它做商環，就得到一個更大的域。
        下一節我們正式做這件事 — 域擴張。
      </span>
    </app-prose-block>
  `,
  styles: `
    .check-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; @media(max-width:500px){grid-template-columns:1fr;} }
    .check-card { padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg);
      &.irred { border-color: rgba(90,138,90,0.3); }
      &.red { border-color: rgba(160,90,90,0.3); }
    }
    .poly-name { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 6px; }
    .root-check { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
    .root-val { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary);
      padding: 2px 6px; border-radius: 3px; background: var(--bg-surface);
      &.is-root { background: rgba(160,90,90,0.15); color: #a05a5a; font-weight: 700; }
    }
    .verdict { font-size: 12px; font-weight: 600;
      .irred & { color: #5a8a5a; }
      .red & { color: #a05a5a; }
    }
  `,
})
export class StepIrreducibleComponent {
  readonly examples = EXAMPLES;
  range(n: number): number[] { return Array.from({ length: n }, (_, i) => i); }
  evalAt(ex: PolyCheck, x: number): number { return evalPoly(ex.coeffs, x, ex.p); }
  checkIrred(ex: PolyCheck): boolean { return isIrreducible(ex.coeffs, ex.p); }
}
