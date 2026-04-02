import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-gods-number', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="上帝之數" subtitle="\u00A710.4">
  <p>從任何打亂狀態，最少需要幾步才能還原？這個最大值叫做<strong>上帝之數</strong>。</p>
</app-prose-block>
<app-challenge-card prompt="上帝之數 = 20">
  <div class="god-card">
    <div class="god-number">20</div>
    <div class="god-desc">
      2010 年，用電腦窮舉所有 4.3 \u00D7 10\u00B9\u2079 個狀態後證明：
      <br/><strong>任何狀態都能在 20 步（半轉計量）內還原。</strong>
    </div>
  </div>
  <div class="context">
    <div class="ctx-row"><span class="ctx-l">群論語言</span><span class="ctx-r">上帝之數 = 群的 Cayley 圖的<strong>直徑</strong></span></div>
    <div class="ctx-row"><span class="ctx-l">生成元</span><span class="ctx-r">{{ '{' }}U, D, L, R, F, B{{ '}' }} 及其逆（18 個）</span></div>
    <div class="ctx-row"><span class="ctx-l">意義</span><span class="ctx-r">從單位元到最遠元素的最短路徑長度</span></div>
  </div>
</app-challenge-card>
<app-prose-block>
  <p>有趣的是：大部分狀態只需要 15-18 步。需要整整 20 步的「超級困難」狀態非常稀少。</p>
</app-prose-block>
`, styles: `
  .god-card { padding: 24px; text-align: center; border: 2px solid var(--accent); border-radius: 16px; background: var(--accent-10); margin-bottom: 14px; }
  .god-number { font-size: 64px; font-weight: 800; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
  .god-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; strong { color: var(--text); } }
  .context { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
  .ctx-row { display: grid; grid-template-columns: 100px 1fr; border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; } }
  .ctx-l { padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--accent); background: var(--accent-10); }
  .ctx-r { padding: 8px 12px; font-size: 13px; color: var(--text-secondary); strong { color: var(--text); } }
` })
export class StepGodsNumberComponent {}
