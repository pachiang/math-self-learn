import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch7-util';

@Component({
  selector: 'app-step-power-series-properties',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="冪級數的分析性質" subtitle="§7.7">
      <p>
        冪級數 Σaₙxⁿ 在收斂半徑內是<strong>分析界最乖的函數</strong>：
      </p>
      <ul>
        <li><strong>無限可微</strong>：可以逐項微分任意多次</li>
        <li><strong>逐項可積</strong>：可以逐項積分</li>
        <li><strong>等於自己的 Taylor 展開</strong>：f(x) = Σf⁽ⁿ⁾(0)/n! · xⁿ</li>
        <li>收斂半徑不變：微分或積分後的冪級數有<strong>相同的 R</strong></li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="用 eˣ 示範：逐項微分後還是 eˣ">
      <div class="n-ctrl">
        <span class="nl">微分 k = {{ kDiff() }} 次</span>
        <input type="range" min="0" max="5" step="1" [value]="kDiff()"
               (input)="kDiff.set(+($any($event.target)).value)" class="k-slider" />
      </div>

      <svg viewBox="0 0 500 220" class="ps-svg">
        <line x1="250" y1="10" x2="250" y2="190" stroke="var(--border)" stroke-width="0.5" />
        <line x1="20" y1="140" x2="480" y2="140" stroke="var(--border)" stroke-width="0.5" />

        <!-- eˣ (always the same) -->
        <path [attr.d]="expPath()" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="5 3" />

        <!-- k-th derivative of Taylor partial sum -->
        <path [attr.d]="derivPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="info-row">
        <div class="i-card">原始：Σ xⁿ/n!</div>
        <div class="i-card">{{ kDiff() }} 階導數：Σ xⁿ/n!（一樣！）</div>
        <div class="i-card ok">eˣ 的 Taylor 展開微分後還是自己 ✓</div>
      </div>

      <div class="properties-summary">
        <div class="ps-title">冪級數的黃金法則</div>
        <div class="ps-body">
          在 |x| &lt; R 裡面，你可以<strong>像對待多項式一樣</strong>對待冪級數：
          加減乘除、微分、積分、代入——全部合法。
          收斂半徑 R 是唯一的限制。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        冪級數這麼「乖」是因為它在<strong>每個緊子集</strong>上均勻收斂（Weierstrass M-test）。
        這讓逐項操作全部成立。
      </p>
      <p>下一節看一個深刻的近似定理——<strong>Stone-Weierstrass</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 100px; }
    .k-slider { flex: 1; accent-color: var(--accent); }
    .ps-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .info-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .i-card { flex: 1; min-width: 100px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .properties-summary { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .ps-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .ps-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepPowerSeriesPropertiesComponent {
  readonly kDiff = signal(0);

  sx(x: number): number { return 250 + x * 60; }
  sy(y: number): number { return 140 - y * 25; }

  expPath(): string {
    const pts = sampleFn(Math.exp, -3, 3, 200);
    return 'M' + pts.filter((p) => p.y < 5).map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  }

  derivPath(): string {
    // k-th derivative of e^x partial sum (N=10) is the same series shifted
    const N = 10;
    const k = this.kDiff();
    const fn = (x: number) => {
      let s = 0, fact = 1;
      for (let n = 0; n <= N; n++) {
        if (n >= k) {
          // d^k/dx^k (x^n/n!) = x^(n-k)/(n-k)!
          let coeff = 1;
          for (let j = 0; j < k; j++) coeff *= (n - j);
          let denom = 1;
          for (let j = 2; j <= n; j++) denom *= j;
          s += coeff * Math.pow(x, n - k) / denom;
        }
      }
      return s;
    };
    const pts = sampleFn(fn, -3, 3, 200);
    return 'M' + pts.filter((p) => Math.abs(p.y) < 5).map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  }
}
