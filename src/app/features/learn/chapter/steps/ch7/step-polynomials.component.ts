import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { evalPoly, zAdd, zMul } from './field-utils';

@Component({
  selector: 'app-step-polynomials',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="多項式環 F[x]" subtitle="\u00A77.3">
      <p>
        給一個域 F，我們可以用 F 的元素作係數來造多項式。
        所有這些多項式配上加法和乘法，構成<strong>多項式環 F[x]</strong>。
      </p>
      <p>
        多項式環是環但不是域 — 因為大部分多項式沒有乘法逆元
        （你不能除以 x）。但它有一個跟整數一樣的好性質：<strong>可以做帶餘除法</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="在 Z\u2082[x] 裡代入值，感受有限域上的多項式">
      <div class="eval-section">
        <div class="eval-title">在 Z\u2082[x] 裡計算 x\u00B2 + x + 1 的值：</div>
        <div class="eval-grid">
          @for (x of [0, 1]; track x) {
            <div class="eval-card">
              <div class="eval-input">f({{ x }}) =</div>
              <div class="eval-calc">{{ x }}\u00B2 + {{ x }} + 1</div>
              <div class="eval-result" [class.zero]="evalF(x) === 0">
                = {{ evalF(x) }} <span>(mod 2)</span>
              </div>
            </div>
          }
        </div>
        <div class="eval-conclusion">
          x\u00B2 + x + 1 在 Z\u2082 裡<strong>沒有根</strong> —
          代入 0 和 1 都不等於 0。
        </div>
      </div>

      <div class="analogy-section">
        <div class="section-label">整數 vs 多項式的類比：</div>
        <div class="analogy-table">
          <div class="at-row header"><span>整數 Z</span><span>多項式 F[x]</span></div>
          <div class="at-row"><span>質數 p</span><span>不可約多項式</span></div>
          <div class="at-row"><span>帶餘除法 a = qb + r</span><span>f = qg + r, deg r &lt; deg g</span></div>
          <div class="at-row"><span>唯一分解（質因數）</span><span>唯一分解（不可約因式）</span></div>
          <div class="at-row"><span>Z/pZ = Z\u209A（域）</span><span>F[x]/(p(x))（可能是域！）</span></div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        多項式環跟整數的結構驚人地相似。
        整數裡有質數，多項式裡有<strong>不可約多項式</strong> — 不能再分解的多項式。
      </p>
      <span class="hint">
        下一節我們正式定義不可約多項式，它是構造新域的鑰匙。
      </span>
    </app-prose-block>
  `,
  styles: `
    .eval-section { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-bottom: 14px; }
    .eval-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
    .eval-grid { display: flex; gap: 12px; margin-bottom: 10px; }
    .eval-card { padding: 10px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); text-align: center; }
    .eval-input { font-size: 14px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .eval-calc { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .eval-result { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-top: 4px;
      &.zero { color: #5a8a5a; } span { font-size: 11px; color: var(--text-muted); } }
    .eval-conclusion { font-size: 13px; color: var(--text-secondary); strong { color: var(--text); } }

    .section-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
    .analogy-table { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .at-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.header span { font-weight: 700; background: var(--accent-10); color: var(--text); }
      span { padding: 8px 12px; font-size: 13px; color: var(--text-secondary); &:first-child { border-right: 1px solid var(--border); } }
    }
  `,
})
export class StepPolynomialsComponent {
  // f(x) = x² + x + 1 over Z₂: coefficients [1, 1, 1]
  evalF(x: number): number { return evalPoly([1, 1, 1], x, 2); }
}
