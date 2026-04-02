import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-splitting-field', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="分裂域" subtitle="\u00A78.2">
  <p>給一個多項式 f(x)，能讓 f 完全分解成一次因式的<strong>最小</strong>域擴張，叫做 f 的<strong>分裂域</strong>（splitting field）。</p>
</app-prose-block>
<app-challenge-card prompt="看看不同多項式的分裂域">
  <div class="split-examples">
    <div class="se">
      <div class="se-poly">x\u00B2 \u2212 2 \u2208 Q[x]</div>
      <div class="se-split">分裂域 = Q(\u221A2)</div>
      <div class="se-factor">= (x \u2212 \u221A2)(x + \u221A2)</div>
      <div class="se-dim">[Q(\u221A2) : Q] = 2</div>
    </div>
    <div class="se">
      <div class="se-poly">x\u00B3 \u2212 1 \u2208 Q[x]</div>
      <div class="se-split">分裂域 = Q(\u03C9)，\u03C9 = e^(2\u03C0i/3)</div>
      <div class="se-factor">= (x\u22121)(x\u2212\u03C9)(x\u2212\u03C9\u00B2)</div>
      <div class="se-dim">[Q(\u03C9) : Q] = 2</div>
    </div>
    <div class="se">
      <div class="se-poly">x\u2074 \u2212 2 \u2208 Q[x]</div>
      <div class="se-split">分裂域 = Q(\u2074\u221A2, i)</div>
      <div class="se-factor">= (x\u2212\u2074\u221A2)(x+\u2074\u221A2)(x\u2212i\u2074\u221A2)(x+i\u2074\u221A2)</div>
      <div class="se-dim">[Q(\u2074\u221A2, i) : Q] = 8</div>
    </div>
  </div>
</app-challenge-card>
<app-prose-block>
  <p>分裂域是研究多項式的「自然棲息地」。重要事實：<strong>同一個多項式的分裂域（在同構意義下）是唯一的。</strong></p>
  <span class="hint">分裂域確定了舞台。下一步：這個舞台上有哪些「對稱性」？— 這就是域自同構。</span>
</app-prose-block>
`, styles: `
  .split-examples { display: flex; flex-direction: column; gap: 10px; }
  .se { padding: 14px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
  .se-poly { font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 4px; }
  .se-split { font-size: 13px; color: var(--accent); font-weight: 600; }
  .se-factor { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); margin: 4px 0; }
  .se-dim { font-size: 12px; color: var(--text-muted); }
` })
export class StepSplittingFieldComponent {}
