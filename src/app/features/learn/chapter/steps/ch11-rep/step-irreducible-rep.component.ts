import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({ selector: 'app-step-irreducible-rep', standalone: true, imports: [ProseBlockComponent], template: `
<app-prose-block title="不可約表示與 Maschke 定理" subtitle="\u00A711.3">
  <p>有些表示可以「拆開」成更小的表示（用分塊對角矩陣），有些不行。不能再拆的叫<strong>不可約表示</strong>。</p>
  <p><strong>Maschke 定理</strong>：有限群的每一個表示都可以完全分解成不可約表示的直和。</p>
  <p>就像整數可以分解成質因數一樣，表示可以分解成不可約表示。D\u2083 有 3 個不可約表示（\u03C7\u2081, \u03C7\u2082, \u03C7\u2083），它們的維度滿足 1\u00B2 + 1\u00B2 + 2\u00B2 = 6 = |D\u2083|。</p>
  <span class="hint">不可約表示的維度的平方和 = 群的階。這是表示論最漂亮的等式之一。</span>
</app-prose-block>
` })
export class StepIrreducibleRepComponent {}
