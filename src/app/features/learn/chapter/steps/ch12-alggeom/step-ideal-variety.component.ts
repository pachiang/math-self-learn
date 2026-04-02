import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({ selector: 'app-step-ideal-variety', standalone: true, imports: [ProseBlockComponent], template: `
<app-prose-block title="理想與代數簇的對應" subtitle="\u00A712.2">
  <p>代數幾何的核心字典：</p>
  <div class="dictionary">
    <div class="dict-row header"><span>代數（環論）</span><span>幾何</span></div>
    <div class="dict-row"><span>多項式環 k[x,y]</span><span>平面 k\u00B2</span></div>
    <div class="dict-row"><span>理想 I \u25C1 k[x,y]</span><span>代數簇 V(I) \u2286 k\u00B2</span></div>
    <div class="dict-row"><span>理想的包含 I \u2286 J</span><span>簇的反包含 V(J) \u2286 V(I)</span></div>
    <div class="dict-row"><span>理想的和 I + J</span><span>簇的交 V(I) \u2229 V(J)</span></div>
    <div class="dict-row"><span>理想的積 IJ</span><span>簇的聯集（大致上）</span></div>
    <div class="dict-row"><span>商環 k[x,y]/I</span><span>簇上的「函數環」</span></div>
  </div>
  <p>方向是<strong>反的</strong>：理想越大，對應的簇越小。這個「反轉」是代數幾何最優美的結構之一。</p>
</app-prose-block>
`, styles: `
  .dictionary { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: 14px 0; }
  .dict-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; }
    &.header span { font-weight: 700; background: var(--accent-10); color: var(--text); }
    span { padding: 8px 12px; font-size: 13px; color: var(--text-secondary); &:first-child { border-right: 1px solid var(--border); } } }
` })
export class StepIdealVarietyComponent {}
