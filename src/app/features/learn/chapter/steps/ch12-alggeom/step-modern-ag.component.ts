import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({ selector: 'app-step-modern-ag', standalone: true, imports: [ProseBlockComponent], template: `
<app-prose-block title="代數幾何的現代面貌" subtitle="\u00A712.5">
  <p>現代代數幾何（Grothendieck 學派）把「簇」推廣成<strong>概形</strong>（scheme），用範疇論的語言重新建構整個理論。</p>
  <div class="timeline">
    <div class="tl-item"><span class="tl-year">1637</span> Descartes：坐標幾何（方程 \u2194 曲線）</div>
    <div class="tl-item"><span class="tl-year">1893</span> Hilbert：零點定理（理想 \u2194 簇）</div>
    <div class="tl-item"><span class="tl-year">1960s</span> Grothendieck：概形理論（用交換環的素譜 Spec(R) 取代簇）</div>
    <div class="tl-item"><span class="tl-year">1995</span> Wiles：用代數幾何（橢圓曲線的模形式）證明費馬大定理</div>
    <div class="tl-item"><span class="tl-year">Today</span> 代數幾何是數學最活躍的領域之一，連接數論、拓撲、物理</div>
  </div>
  <div class="finale">
    <p>你在這門課學到的環、理想、商環、域擴張 \u2014 全部是代數幾何的基礎語言。抽象代數不是孤立的理論，它是理解現代數學的<strong>通用語言</strong>。</p>
  </div>
</app-prose-block>
`, styles: `
  .timeline { display: flex; flex-direction: column; gap: 6px; margin: 14px 0; }
  .tl-item { display: flex; gap: 10px; padding: 8px 12px; border-left: 3px solid var(--accent-30); font-size: 13px; color: var(--text-secondary); background: var(--bg-surface); border-radius: 0 6px 6px 0; }
  .tl-year { font-weight: 700; color: var(--accent); flex-shrink: 0; min-width: 48px; }
  .finale { padding: 20px; border: 2px solid var(--accent); border-radius: 14px; background: var(--accent-10); text-align: center;
    p { font-size: 14px; color: var(--text-secondary); margin: 0; line-height: 1.6; strong { color: var(--text); } } }
` })
export class StepModernAgComponent {}
