import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-commutators', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="交換子與共軛：魔方公式的秘密" subtitle="\u00A710.2">
  <p>魔方玩家常用的公式，背後都是群論操作：</p>
</app-prose-block>
<app-challenge-card prompt="群論觀點看魔方公式">
  <div class="formula-cards">
    <div class="fc">
      <div class="fc-name">交換子 [A, B] = ABA\u207B\u00B9B\u207B\u00B9</div>
      <div class="fc-example">R U R' U' — 最常見的魔方「觸發」</div>
      <div class="fc-why">
        如果 A 和 B 交換（AB = BA），交換子 = e（什麼都不做）。
        <br/>交換子「測量」兩個操作有多不交換。
        <br/>在魔方裡：交換子只影響少量方塊，是精準控制的利器。
      </div>
    </div>
    <div class="fc">
      <div class="fc-name">共軛 gAg\u207B\u00B9</div>
      <div class="fc-example">例：(R U) A (U' R') — 用 setup moves 把目標移到位置</div>
      <div class="fc-why">
        共軛 = 「先搬到方便的位置（g），做想做的事（A），再搬回來（g\u207B\u00B9）」。
        <br/>這就是第六章學的共軛！在魔方裡是 setup-execute-undo 模式。
      </div>
    </div>
  </div>
</app-challenge-card>
<app-prose-block>
  <p>所有的魔方進階解法（CFOP、Roux 等）的公式，都可以用交換子和共軛來理解和推導。群論不只是抽象理論 \u2014 它是魔方高手的實戰工具。</p>
</app-prose-block>
`, styles: `
  .formula-cards { display: flex; flex-direction: column; gap: 10px; }
  .fc { padding: 14px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
  .fc-name { font-size: 15px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
  .fc-example { font-size: 14px; color: var(--accent); font-weight: 600; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
  .fc-why { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
` })
export class StepCommutatorsComponent {}
