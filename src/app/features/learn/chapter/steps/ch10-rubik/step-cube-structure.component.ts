import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-cube-structure', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="魔方群的子群結構" subtitle="\u00A710.3">
  <p>魔方群雖然巨大，但可以拆解成更小的部分來理解。</p>
</app-prose-block>
<app-challenge-card prompt="魔方群的分解">
  <div class="decomp">
    <div class="dc">
      <div class="dc-name">角塊子群</div>
      <div class="dc-desc">8 個角塊的位置排列（\u2264 S\u2088）和方向旋轉（Z\u2083\u2077）</div>
    </div>
    <div class="dc">
      <div class="dc-name">邊塊子群</div>
      <div class="dc-desc">12 個邊塊的位置排列（\u2264 S\u2081\u2082）和方向翻轉（Z\u2082\u00B9\u00B9）</div>
    </div>
    <div class="dc">
      <div class="dc-name">約束條件</div>
      <div class="dc-desc">不是所有排列\u00D7方向都可達到 \u2014 有三條約束把狀態數除以 12</div>
    </div>
  </div>
  <div class="size-calc">
    <div class="sc-title">群的階 =</div>
    <div class="sc-formula">8! \u00D7 3\u2077 \u00D7 12! \u00D7 2\u00B9\u00B9 / 12 = 43,252,003,274,489,856,000</div>
  </div>
</app-challenge-card>
<app-prose-block>
  <p>三條約束正好對應三個群論性質：</p>
  <div class="constraints">
    <div class="con">\u2460 角塊和邊塊的排列奇偶性必須相同（\u2194 A\u2099 的概念，Ch4）</div>
    <div class="con">\u2461 角塊方向之和 \u2261 0 (mod 3)</div>
    <div class="con">\u2462 邊塊方向之和 \u2261 0 (mod 2)</div>
  </div>
</app-prose-block>
`, styles: `
  .decomp { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .dc { padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
  .dc-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .dc-desc { font-size: 13px; color: var(--text-secondary); }
  .size-calc { padding: 16px; border: 2px solid var(--accent); border-radius: 10px; background: var(--accent-10); text-align: center; }
  .sc-title { font-size: 13px; font-weight: 600; color: var(--accent); }
  .sc-formula { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-top: 4px; word-break: break-all; }
  .constraints { display: flex; flex-direction: column; gap: 6px; }
  .con { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; color: var(--text-secondary); background: var(--bg-surface); }
` })
export class StepCubeStructureComponent {}
