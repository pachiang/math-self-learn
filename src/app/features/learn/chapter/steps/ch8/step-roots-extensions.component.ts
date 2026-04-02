import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-roots-extensions', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="根與域擴張" subtitle="\u00A78.1">
  <p>伽羅瓦理論的核心問題：<strong>一個多項式的根「住在」哪個域裡？</strong></p>
  <p>x\u00B2 \u2212 2 的根 \u00B1\u221A2 不在 Q 裡，但在 Q(\u221A2) 裡。為了「容納」所有根，我們需要把域擴張。</p>
</app-prose-block>
<app-challenge-card prompt="不同多項式需要不同大小的擴張">
  <div class="examples">
    <div class="ex"><div class="ex-poly">x\u00B2 \u2212 2</div><div class="ex-roots">根：\u00B1\u221A2</div><div class="ex-ext">需要：Q \u2192 Q(\u221A2)，[Q(\u221A2):Q] = 2</div></div>
    <div class="ex"><div class="ex-poly">x\u00B2 + 1</div><div class="ex-roots">根：\u00B1i</div><div class="ex-ext">需要：R \u2192 C = R(i)，[C:R] = 2</div></div>
    <div class="ex"><div class="ex-poly">x\u00B3 \u2212 2</div><div class="ex-roots">根：\u00B3\u221A2, \u00B3\u221A2\u03C9, \u00B3\u221A2\u03C9\u00B2</div><div class="ex-ext">需要：Q \u2192 Q(\u00B3\u221A2, \u03C9)，維度 = 6</div></div>
    <div class="ex"><div class="ex-poly">x\u2074 \u2212 2</div><div class="ex-roots">根：\u00B1\u2074\u221A2, \u00B1i\u2074\u221A2</div><div class="ex-ext">需要：Q \u2192 Q(\u2074\u221A2, i)，維度 = 8</div></div>
  </div>
</app-challenge-card>
<app-prose-block>
  <p>擴張的「維度」（或稱次數 [L:K]）反映了我們需要加入多少「新東西」。維度越大，方程式的根結構越複雜。</p>
  <span class="hint">如果把多項式的<strong>所有</strong>根都加進去，得到的域叫做「分裂域」— 下一節的主角。</span>
</app-prose-block>
`, styles: `
  .examples { display: flex; flex-direction: column; gap: 8px; }
  .ex { padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
  .ex-poly { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 4px; }
  .ex-roots { font-size: 13px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
  .ex-ext { font-size: 13px; color: var(--accent); margin-top: 4px; }
` })
export class StepRootsExtensionsComponent {}
