import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-ring-homomorphism',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="環同態與第一同構定理" subtitle="\u00A76.6">
      <p>
        群有同態，環也有。環同態是一個映射 \u03C6: R \u2192 S，
        同時保持<strong>加法和乘法</strong>：
      </p>
      <div class="def-box">
        \u03C6(a + b) = \u03C6(a) + \u03C6(b)
        <br/>
        \u03C6(a \u00D7 b) = \u03C6(a) \u00D7 \u03C6(b)
      </div>
    </app-prose-block>

    <app-challenge-card prompt="群和環的概念完美平行 — 看看大統一對照表">
      <div class="example-section">
        <div class="ex-title">例：\u03C6: Z \u2192 Z\u2086，定義 \u03C6(n) = n mod 6</div>
        <div class="verify-grid">
          <div class="vr"><span>保持加法</span> \u03C6(3+5) = \u03C6(8) = 2 = 3+5 mod 6 = \u03C6(3)+\u03C6(5) \u2713</div>
          <div class="vr"><span>保持乘法</span> \u03C6(3\u00D75) = \u03C6(15) = 3 = 3\u00D75 mod 6 = \u03C6(3)\u00D7\u03C6(5) \u2713</div>
          <div class="vr"><span>核</span> ker(\u03C6) = 6Z = {{ '{' }}..., \u221212, \u22126, 0, 6, 12, ...{{ '}' }}</div>
          <div class="vr"><span>第一同構</span> Z / 6Z \u2245 Z\u2086 \u2713</div>
        </div>
      </div>

      <!-- Grand parallel table -->
      <div class="grand-table">
        <div class="gt-title">大統一對照表</div>
        <table>
          <thead>
            <tr><th>概念</th><th>群</th><th>環</th></tr>
          </thead>
          <tbody>
            <tr><td class="concept">結構</td><td>(G, \u2218)</td><td>(R, +, \u00D7)</td></tr>
            <tr><td class="concept">子結構</td><td>子群</td><td>子環</td></tr>
            <tr><td class="concept">做商用的</td><td>正規子群 N \u25C1 G</td><td>理想 I \u25C1 R</td></tr>
            <tr><td class="concept">商</td><td>G/N</td><td>R/I</td></tr>
            <tr><td class="concept">映射</td><td>群同態 \u03C6(ab)=\u03C6(a)\u03C6(b)</td><td>環同態 \u03C6(a+b), \u03C6(ab)</td></tr>
            <tr><td class="concept">核</td><td>ker(\u03C6) = 正規子群</td><td>ker(\u03C6) = 理想</td></tr>
            <tr><td class="concept">第一同構</td><td>G/ker \u2245 im</td><td>R/ker \u2245 im</td></tr>
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        群和環的理論結構<strong>完美平行</strong>：正規子群 \u2194 理想，
        商群 \u2194 商環，第一同構定理的形式完全一樣。
      </p>
      <p>
        這不是巧合 — 這種平行性暗示著一個更深層的統一框架（範疇論），
        但那是更高級的故事了。
      </p>
      <div class="finale-box">
        <div class="fin-title">第六章完成！</div>
        <p>
          你已經跨出了群論的領地，進入了環的世界。
          加法群 + 乘法結構 + 分配律，三者交織成一個更豐富的代數結構。
        </p>
        <p>
          下一步：如果環的乘法也有逆元（可以做除法），我們就得到了<strong>域</strong>。
          域是多項式、方程式、和伽羅瓦理論的舞台。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    .def-box {
      padding: 14px; text-align: center; font-size: 16px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 10px; margin: 10px 0; line-height: 1.8;
    }

    .example-section {
      padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 16px;
    }
    .ex-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }
    .verify-grid { display: flex; flex-direction: column; gap: 6px; }
    .vr {
      padding: 6px 10px; border-radius: 6px; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; color: var(--text-secondary);
      background: var(--bg-surface); border: 1px solid var(--border);
      span { font-weight: 600; color: var(--accent); margin-right: 8px; }
    }

    .grand-table {
      border: 2px solid var(--accent-30); border-radius: 12px; overflow: hidden; margin-bottom: 8px;
    }
    .gt-title { padding: 10px 16px; background: var(--accent-18); font-size: 14px; font-weight: 700; color: var(--text); text-align: center; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 8px 12px; background: var(--accent-10); color: var(--text-secondary);
      font-size: 12px; font-weight: 600; text-align: center; border-bottom: 1px solid var(--border); }
    td { padding: 8px 12px; text-align: center; border-bottom: 1px solid var(--border);
      font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    tr:last-child td { border-bottom: none; }
    .concept { font-weight: 600; color: var(--accent); font-family: inherit; text-align: left; }

    .finale-box {
      padding: 20px; border: 2px solid var(--accent); border-radius: 14px;
      background: var(--accent-10); text-align: center; margin-top: 16px;
    }
    .fin-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .finale-box p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 6px 0; }
    .finale-box strong { color: var(--text); }
  `,
})
export class StepRingHomomorphismComponent {}
