import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({ selector: 'app-step-nullstellensatz', standalone: true, imports: [ProseBlockComponent], template: `
<app-prose-block title="Hilbert 零點定理" subtitle="\u00A712.3">
  <p>代數幾何最基本的定理，精確建立了理想和簇的對應：</p>
  <div class="theorem">
    <div class="thm-name">Hilbert Nullstellensatz（零點定理）</div>
    <div class="thm-text">I(V(J)) = \u221AJ（J 的根式）</div>
  </div>
  <p>白話：一個多項式在簇 V(J) 上<strong>處處為零</strong> \u27FA 它的某個冪次在理想 J 裡。</p>
  <p>這個定理讓「代數 \u2194 幾何」的字典從粗略的對應變成<strong>精確的等價</strong>。它是整個代數幾何的基石。</p>
  <span class="hint">零點定理告訴我們：研究幾何圖形 = 研究多項式環的理想。幾何問題可以完全翻譯成代數問題來解決。</span>
</app-prose-block>
`, styles: `
  .theorem { padding: 16px; text-align: center; border: 2px solid var(--accent); border-radius: 12px; background: var(--accent-10); margin: 14px 0; }
  .thm-name { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
  .thm-text { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
` })
export class StepNullstellensatzComponent {}
