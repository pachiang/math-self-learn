import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-varieties', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="多項式方程與幾何圖形" subtitle="\u00A712.1">
  <p>代數幾何的核心思想驚人地簡單：<strong>多項式方程定義幾何圖形</strong>。</p>
</app-prose-block>
<app-challenge-card prompt="方程式 \u2194 圖形">
  <div class="examples">
    <div class="ex"><div class="ex-eq">x\u00B2 + y\u00B2 = 1</div><div class="ex-shape">\u2192 圓</div></div>
    <div class="ex"><div class="ex-eq">y = x\u00B2</div><div class="ex-shape">\u2192 拋物線</div></div>
    <div class="ex"><div class="ex-eq">x\u00B2 \u2212 y\u00B2 = 1</div><div class="ex-shape">\u2192 雙曲線</div></div>
    <div class="ex"><div class="ex-eq">y\u00B2 = x\u00B3 \u2212 x</div><div class="ex-shape">\u2192 橢圓曲線</div></div>
    <div class="ex"><div class="ex-eq">x\u00B2 + y\u00B2 + z\u00B2 = 1</div><div class="ex-shape">\u2192 球面</div></div>
  </div>
  <div class="key">
    這些圖形叫做<strong>代數簇</strong>（algebraic variety）：多項式方程的零點集合。
  </div>
</app-challenge-card>
<app-prose-block>
  <p>代數幾何的革命性想法：用<strong>環論</strong>（Ch7）來研究<strong>幾何</strong>。多項式環的理想 \u2194 幾何圖形的子集。</p>
</app-prose-block>
`, styles: `
  .examples { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px; @media(max-width:400px){grid-template-columns:1fr;} }
  .ex { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
  .ex-eq { font-size: 14px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text); }
  .ex-shape { font-size: 13px; color: var(--accent); }
  .key { padding: 12px 16px; border-radius: 8px; background: var(--accent-10); font-size: 14px; color: var(--text-secondary); text-align: center; strong { color: var(--text); } }
` })
export class StepVarietiesComponent {}
