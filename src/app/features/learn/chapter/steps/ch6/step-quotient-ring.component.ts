import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-quotient-ring',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="商環" subtitle="\u00A76.5">
      <p>
        有了理想 I，就可以做<strong>商環</strong> R/I：把 I 裡的元素全部視為「零」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="兩個商環的例子：一個你很熟，一個會讓你驚訝">
      <!-- Example 1: Z/nZ = Z_n -->
      <div class="example-card">
        <div class="ex-title">例一：Z / 3Z = Z\u2083</div>
        <div class="ex-body">
          <p>把 3 的倍數全部壓成 0。剩下的等價類：</p>
          <div class="coset-row">
            <span class="coset-badge" style="background:var(--v0)">0 + 3Z = {{ '{' }}...,-3,0,3,6,...{{ '}' }}</span>
            <span class="coset-badge" style="background:var(--v1)">1 + 3Z = {{ '{' }}...,-2,1,4,7,...{{ '}' }}</span>
            <span class="coset-badge" style="background:var(--v2)">2 + 3Z = {{ '{' }}...,-1,2,5,8,...{{ '}' }}</span>
          </div>
          <p>這就是 Z\u2083！你在第二章的等價關係和陪集裡已經見過它了。</p>
        </div>
      </div>

      <!-- Example 2: R[x]/(x²+1) = C -->
      <div class="example-card highlight">
        <div class="ex-title">例二：R[x] / (x\u00B2+1) = C （複數！）</div>
        <div class="ex-body">
          <p>
            R[x] 是實數多項式環。(x\u00B2+1) 是 x\u00B2+1 生成的理想。
          </p>
          <p>
            在商環裡，x\u00B2+1 = 0，也就是 <strong>x\u00B2 = \u22121</strong>。
          </p>
          <p>
            這個 x 就是虛數 i！商環的元素是 a + bx 的形式（高次項用 x\u00B2 = \u22121 化簡），
            運算規則跟複數 a + bi 一模一樣。
          </p>
          <div class="complex-demo">
            <div class="cd-row">
              <span class="cd-calc">(2 + 3x)(1 + x)</span>
              <span class="cd-eq">=</span>
              <span class="cd-calc">2 + 2x + 3x + 3x\u00B2</span>
            </div>
            <div class="cd-row">
              <span></span>
              <span class="cd-eq">=</span>
              <span class="cd-calc">2 + 5x + 3(\u22121)</span>
            </div>
            <div class="cd-row">
              <span></span>
              <span class="cd-eq">=</span>
              <span class="cd-calc result">\u22121 + 5x</span>
            </div>
          </div>
          <p class="verify">
            驗證：(2+3i)(1+i) = 2+2i+3i+3i\u00B2 = 2+5i\u22123 = \u22121+5i \u2713
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        商環的威力：通過「令某個東西等於零」，我們可以<strong>創造新的數學對象</strong>。
      </p>
      <div class="insight-box">
        <strong>R[x]/(x\u00B2+1) \u2245 C</strong> 這個等式的意思是：
        複數不需要「憑空發明」i = \u221A(\u22121)，
        而是可以從實數多項式環<strong>嚴格構造</strong>出來。
      </div>
      <span class="hint">
        群有同態和第一同構定理，環也有。下一節我們看環版本的同態和同構定理，
        以及群和環的概念如何完美平行。
      </span>
    </app-prose-block>
  `,
  styles: `
    .example-card {
      padding: 16px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 14px;
      &.highlight { border-color: var(--accent-30); background: var(--accent-10); border-width: 2px; }
    }
    .ex-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }
    .ex-body { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .ex-body p { margin: 6px 0; }
    .ex-body strong { color: var(--text); }

    .coset-row { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; }
    .coset-badge {
      padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;
      color: white; font-family: 'JetBrains Mono', monospace;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .complex-demo {
      margin: 10px 0; padding: 10px 14px; background: var(--bg-surface);
      border-radius: 8px; border: 1px solid var(--border);
    }
    .cd-row { display: flex; align-items: center; gap: 8px; margin: 2px 0; }
    .cd-calc { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text); &.result { font-weight: 700; color: var(--accent); } }
    .cd-eq { color: var(--text-muted); }

    .verify {
      font-family: 'JetBrains Mono', monospace; font-size: 12px;
      color: #5a8a5a; background: rgba(90,138,90,0.08);
      padding: 6px 10px; border-radius: 4px;
    }

    .insight-box {
      padding: 14px 18px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); font-size: 14px; color: var(--text-secondary); line-height: 1.6;
      text-align: center; margin: 12px 0;
      strong { color: var(--text); font-family: 'JetBrains Mono', monospace; }
    }
  `,
})
export class StepQuotientRingComponent {}
