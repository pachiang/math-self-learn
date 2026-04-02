import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-classification',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="應用：小階群分類與 A\u2085" subtitle="\u00A76.6">
      <p>Sylow 定理的威力在於：光靠 |G| 的質因數分解，就能大幅限制群的可能結構。</p>
    </app-prose-block>
    <app-challenge-card prompt="用 Sylow 定理分析不同階的群">
      <div class="cases">
        <div class="case good">
          <div class="case-title">|G| = 15 = 3 \u00D7 5</div>
          <div class="case-work">
            n\u2083 | 5 且 n\u2083 \u2261 1 (mod 3) \u2192 n\u2083 = 1
            <br/>n\u2085 | 3 且 n\u2085 \u2261 1 (mod 5) \u2192 n\u2085 = 1
            <br/>兩個 Sylow 子群都唯一（正規），且 gcd(3,5)=1
          </div>
          <div class="case-result">\u2192 G \u2245 Z\u2083 \u00D7 Z\u2085 \u2245 Z\u2081\u2085（<strong>只有一種</strong>15 階群！）</div>
        </div>

        <div class="case multi">
          <div class="case-title">|G| = 12 = 2\u00B2 \u00D7 3</div>
          <div class="case-work">
            n\u2083 | 4 且 n\u2083 \u2261 1 (mod 3) \u2192 n\u2083 = 1 或 4
            <br/>n\u2082 | 3 且 n\u2082 \u2261 1 (mod 2) \u2192 n\u2082 = 1 或 3
          </div>
          <div class="case-result">\u2192 有多種可能：Z\u2081\u2082、A\u2084、D\u2086、Dic\u2081\u2082...</div>
        </div>

        <div class="case highlight">
          <div class="case-title">A\u2085 是單群（|A\u2085| = 60 = 2\u00B2 \u00D7 3 \u00D7 5）</div>
          <div class="case-work">
            用 Sylow 定理 + 共軛類計算，可以證明 A\u2085 <strong>沒有任何非平凡正規子群</strong>。
            <br/>n\u2082 \u2208 {{ '{' }}1,3,5,15{{ '}' }}，n\u2083 \u2208 {{ '{' }}1,4,10{{ '}' }}，n\u2085 \u2208 {{ '{' }}1,6{{ '}' }}
            <br/>逐一排除 n\u209A = 1 的可能性 \u2192 沒有正規 Sylow 子群 \u2192 <strong>A\u2085 是單群</strong>
          </div>
          <div class="case-result">這就是五次方程沒有公式解的根本原因！（Ch9 \u00A79.6）</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <div class="finale">
        <div class="fin-title">群論的主線完成了</div>
        <p>從 Ch1 的三角形對稱，到 Sylow 定理和 A\u2085 的單純性，你走完了有限群理論的核心路線。</p>
        <div class="thread">
          <span class="t-item">Ch1 群</span>
          <span class="t-arrow">\u2192</span>
          <span class="t-item">Ch2 子群</span>
          <span class="t-arrow">\u2192</span>
          <span class="t-item">Ch3 商群</span>
          <span class="t-arrow">\u2192</span>
          <span class="t-item">Ch4 S\u2099</span>
          <span class="t-arrow">\u2192</span>
          <span class="t-item">Ch5 群作用</span>
          <span class="t-arrow">\u2192</span>
          <span class="t-item accent">Ch6 Sylow</span>
        </div>
        <p>接下來進入環和域的世界，最終在伽羅瓦理論中，群論和方程式理論完美交匯。</p>
      </div>
    </app-prose-block>
  `,
  styles: `
    .cases { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
    .case { padding: 14px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
      &.good { border-left: 3px solid #5a8a5a; }
      &.multi { border-left: 3px solid var(--accent); }
      &.highlight { border: 2px solid var(--accent); background: var(--accent-10); } }
    .case-title { font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 6px; }
    .case-work { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); line-height: 1.7; margin-bottom: 6px; }
    .case-result { font-size: 13px; color: var(--text-secondary); strong { color: var(--text); } }

    .finale { padding: 20px; border: 2px solid var(--accent); border-radius: 14px; background: var(--accent-10); text-align: center; }
    .fin-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .finale p { font-size: 13px; color: var(--text-secondary); margin: 6px 0; line-height: 1.6; }
    .thread { display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap; margin: 12px 0; }
    .t-item { padding: 4px 10px; border-radius: 5px; font-size: 12px; font-weight: 600;
      background: var(--bg-surface); color: var(--text); border: 1px solid var(--border);
      &.accent { background: rgba(90,138,90,0.12); color: #5a8a5a; border-color: rgba(90,138,90,0.3); } }
    .t-arrow { color: var(--accent); font-size: 12px; }
  `,
})
export class StepClassificationComponent {}
