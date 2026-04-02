import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-p-groups',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="p-群與 Cauchy 定理" subtitle="\u00A76.3">
      <p>階為 p\u207F（質數的冪）的群叫 <strong>p-群</strong>。上一節的類方程告訴我們：</p>
      <div class="theorem">p-群的中心非平凡：|Z(G)| \u2265 p</div>
      <p>這意味著 p-群「很交換」— 中心至少有 p 個元素。</p>
    </app-prose-block>
    <app-challenge-card prompt="Cauchy 定理：質因子 \u2192 對應階的元素">
      <div class="cauchy-box">
        <div class="cauchy-thm">
          <strong>Cauchy 定理</strong>：如果質數 p 整除 |G|，那 G 裡一定存在階為 p 的元素。
        </div>
        <div class="cauchy-examples">
          <div class="ce"><span class="ce-g">D\u2083</span> |G|=6=2\u00D73 \u2192 有 2 階元素（s）和 3 階元素（r）</div>
          <div class="ce"><span class="ce-g">D\u2084</span> |G|=8=2\u00B3 \u2192 有 2 階元素（s, r\u00B2）和 4 階元素（r）</div>
          <div class="ce"><span class="ce-g">Z\u2086</span> |G|=6=2\u00D73 \u2192 有 2 階元素和 3 階元素</div>
        </div>
      </div>
      <div class="contrast">
        <strong>對比拉格朗日定理</strong>：拉格朗日說子群的階<strong>整除</strong> |G|，
        但反過來不一定成立（不是每個因子都對應一個子群）。
        Cauchy 定理說：至少<strong>質因子</strong>一定對應一個元素。
        Sylow 定理更進一步：質數冪因子也一定對應一個子群！
      </div>
    </app-challenge-card>
    <app-prose-block>
      <span class="hint">Cauchy 定理保證了「質數階元素」的存在。下一節的 Sylow 定理保證更多：
        不只有元素，還有<strong>整個子群</strong>。</span>
    </app-prose-block>
  `,
  styles: `
    .theorem { padding: 14px; text-align: center; font-size: 16px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--accent-10); border: 2px solid var(--accent); border-radius: 10px; margin: 10px 0; }
    .cauchy-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-bottom: 12px; }
    .cauchy-thm { font-size: 14px; color: var(--text); line-height: 1.6; margin-bottom: 10px; padding: 10px; background: rgba(90,138,90,0.06); border-radius: 6px; }
    .cauchy-examples { display: flex; flex-direction: column; gap: 4px; }
    .ce { font-size: 13px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;
      padding: 4px 10px; border-radius: 4px; background: var(--bg-surface); }
    .ce-g { font-weight: 700; color: var(--text); }
    .contrast { padding: 12px 16px; border-radius: 8px; background: var(--accent-10); border-left: 3px solid var(--accent);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7; strong { color: var(--text); } }
  `,
})
export class StepPGroupsComponent {}
