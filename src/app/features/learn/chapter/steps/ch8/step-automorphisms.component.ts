import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-automorphisms', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="域自同構" subtitle="\u00A78.3">
  <p>域的<strong>自同構</strong>是一個從域到自身的同構映射 — 一種「重新排列」元素但保持所有運算關係的方式。</p>
  <p>聽起來像第一章的對稱？沒錯！<strong>域自同構就是域的「對稱性」。</strong></p>
</app-prose-block>
<app-challenge-card prompt="Q(\u221A2) 有哪些自同構？">
  <div class="auto-demo">
    <div class="auto-card good">
      <div class="auto-name">\u03C3\u2081: \u221A2 \u21A6 \u221A2（恆等）</div>
      <div class="auto-example">
        a + b\u221A2 \u21A6 a + b\u221A2
        <br/>例：3 + 2\u221A2 \u21A6 3 + 2\u221A2
      </div>
      <div class="auto-check">\u2713 保持加法和乘法</div>
    </div>
    <div class="auto-card good">
      <div class="auto-name">\u03C3\u2082: \u221A2 \u21A6 \u2212\u221A2（共軛）</div>
      <div class="auto-example">
        a + b\u221A2 \u21A6 a \u2212 b\u221A2
        <br/>例：3 + 2\u221A2 \u21A6 3 \u2212 2\u221A2
      </div>
      <div class="auto-check">\u2713 保持加法和乘法（因為 (\u2212\u221A2)\u00B2 = 2）</div>
    </div>
  </div>
  <div class="key-point">
    Q(\u221A2) 恰好有 <strong>2 個</strong>自同構（固定 Q 的），跟擴張維度 [Q(\u221A2):Q] = 2 一樣！
    <br/>這些自同構構成一個<strong>群</strong> \u2245 Z\u2082。
  </div>
</app-challenge-card>
<app-prose-block>
  <p>自同構「交換根」：\u221A2 和 \u2212\u221A2 是 x\u00B2\u22122 的兩個根，自同構就是把它們互換。</p>
  <p>一般地：分裂域的自同構<strong>排列</strong>多項式的根。所有這些自同構構成的群，就是<strong>伽羅瓦群</strong>。</p>
  <span class="hint">群論和域論在這裡交匯了。</span>
</app-prose-block>
`, styles: `
  .auto-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; @media(max-width:500px){grid-template-columns:1fr;} }
  .auto-card { padding: 14px; border-radius: 10px; &.good { background: rgba(90,138,90,0.05); border: 1px solid rgba(90,138,90,0.2); } }
  .auto-name { font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 6px; }
  .auto-example { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); line-height: 1.6; margin-bottom: 6px; }
  .auto-check { font-size: 12px; color: #5a8a5a; font-weight: 600; }
  .key-point { padding: 14px 18px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent-30);
    font-size: 14px; color: var(--text-secondary); text-align: center; line-height: 1.6; strong { color: var(--text); } }
` })
export class StepAutomorphismsComponent {}
