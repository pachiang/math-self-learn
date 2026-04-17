import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { heaviside, gaussianDelta, samplePath } from './analysis-ch18-util';

@Component({
  selector: 'app-step-distributional-derivative',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="分佈導數" subtitle="§18.5">
      <p>每個分佈都可以微分！定義：</p>
      <p class="formula">⟨T', φ⟩ = −⟨T, φ'⟩</p>
      <p>
        把導數「轉嫁」給測試函數（分部積分的推廣）。
        因為 φ ∈ D 是 C∞ 的，所以 φ' 永遠存在。
      </p>
      <p>
        結果：<strong>每個分佈都無限次可微</strong>——包括 Heaviside 階梯函數！
        H' = δ 現在是嚴格的等式。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三個經典例子：分佈導數讓不可微的函數也能微分">
      <div class="fn-tabs">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ ex.name }}</button>
        }
      </div>

      <svg viewBox="0 0 500 300" class="deriv-svg">
        <!-- Top panel: function -->
        <text x="30" y="15" fill="var(--text-muted)" font-size="8">f(x)</text>
        <line x1="40" y1="100" x2="460" y2="100" stroke="var(--border)" stroke-width="0.5" />
        <line x1="250" y1="20" x2="250" y2="100" stroke="var(--border)" stroke-width="0.3" />
        <path [attr.d]="fnPath()" fill="none" stroke="#5a8a5a" stroke-width="2" />

        <!-- Divider -->
        <line x1="40" y1="130" x2="460" y2="130" stroke="var(--border)" stroke-width="0.3" stroke-dasharray="4 3" />
        <text x="240" y="125" fill="var(--text-muted)" font-size="7" text-anchor="middle">↓ 分佈導數</text>

        <!-- Bottom panel: derivative -->
        <text x="30" y="145" fill="var(--text-muted)" font-size="8">f'(x)</text>
        <line x1="40" y1="230" x2="460" y2="230" stroke="var(--border)" stroke-width="0.5" />
        <line x1="250" y1="140" x2="250" y2="230" stroke="var(--border)" stroke-width="0.3" />
        <path [attr.d]="derivPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="desc">{{ examples[sel()].desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        分佈導數是「弱導數」——不要求逐點可微，只要求對所有 φ 的配對值一致。
        這和 Sobolev 空間（PDE 的基礎）直接相關。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .deriv-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .desc { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepDistributionalDerivativeComponent {
  readonly examples = [
    {
      name: 'H(x) → δ',
      fn: heaviside,
      deriv: (x: number) => gaussianDelta(x, 0.05),
      desc: "Heaviside 的導數 = δ。跳躍處產生 delta。",
      fnScale: 60, derivScale: 3,
    },
    {
      name: '|x| → sgn(x)',
      fn: Math.abs,
      deriv: (x: number) => x > 0.02 ? 1 : x < -0.02 ? -1 : x / 0.02,
      desc: "|x| 在 0 處不可微（古典意義），但分佈導數 = sgn(x)。",
      fnScale: 25, derivScale: 60,
    },
    {
      name: 'sgn(x) → 2δ',
      fn: (x: number) => x > 0 ? 1 : -1,
      deriv: (x: number) => 2 * gaussianDelta(x, 0.05),
      desc: "sgn(x) 的導數 = 2δ(x)。跳躍高度 2 → 係數 2。",
      fnScale: 60, derivScale: 1.5,
    },
  ];
  readonly sel = signal(0);

  fnPath(): string {
    const ex = this.examples[this.sel()];
    return samplePath(ex.fn, -3, 3, ex.fnScale, 100, 70, 250);
  }

  derivPath(): string {
    const ex = this.examples[this.sel()];
    return samplePath(ex.deriv, -3, 3, ex.derivScale, 230, 70, 250);
  }
}
