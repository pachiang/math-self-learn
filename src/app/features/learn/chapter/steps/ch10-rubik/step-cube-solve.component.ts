import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({ selector: 'app-step-cube-solve', standalone: true, imports: [ProseBlockComponent], template: `
<app-prose-block title="群論視角的解法策略" subtitle="\u00A710.5">
  <p>所有魔方解法都可以用群論重新理解：</p>
  <div class="strategies">
    <div class="str">
      <div class="str-name">層先法（逐層還原）</div>
      <div class="str-group">利用<strong>商群</strong>的思想：先忽略底層細節（取商），解決頂層（商群裡的問題），再處理下一層。</div>
    </div>
    <div class="str">
      <div class="str-name">CFOP（速解法）</div>
      <div class="str-group"><strong>Cross</strong>：固定一個子群。<strong>F2L</strong>：擴大子群。<strong>OLL/PLL</strong>：在陪集裡搜尋。</div>
    </div>
    <div class="str">
      <div class="str-name">交換子法（盲解）</div>
      <div class="str-group">純群論方法：用 [A, B] = ABA\u207B\u00B9B\u207B\u00B9 精確移動目標方塊，不影響其他。</div>
    </div>
  </div>
</app-prose-block>
<app-prose-block>
  <div class="finale">
    <p>魔術方塊是群論最直觀的實體模型 \u2014 你可以用手「觸摸」置換、交換子、共軛、子群、陪集。</p>
    <p>每一次轉動都是一個群元素，每一個公式都是一個群的表達式。</p>
  </div>
</app-prose-block>
`, styles: `
  .strategies { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
  .str { padding: 14px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); }
  .str-name { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .str-group { font-size: 13px; color: var(--text-secondary); line-height: 1.6; strong { color: var(--text); } }
  .finale { padding: 20px; border: 2px solid var(--accent); border-radius: 14px; background: var(--accent-10);
    text-align: center; p { font-size: 14px; color: var(--text-secondary); margin: 6px 0; line-height: 1.6; } }
` })
export class StepCubeSolveComponent {}
