import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-sylow23',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Sylow 第二、三定理" subtitle="\u00A76.5">
      <p>第一定理告訴我們 Sylow p-子群存在。第二和第三定理告訴我們<strong>有幾個</strong>以及它們的<strong>關係</strong>。</p>
    </app-prose-block>
    <app-challenge-card prompt="Sylow 的三條定理一起看">
      <div class="theorems">
        <div class="thm">
          <div class="thm-num">I</div>
          <div class="thm-text"><strong>存在性</strong>：p\u1D4F \u2223 |G| \u2192 存在階為 p\u1D4F 的子群</div>
        </div>
        <div class="thm">
          <div class="thm-num">II</div>
          <div class="thm-text"><strong>共軛性</strong>：所有 Sylow p-子群都是共軛的（= 「同一個東西的不同角度」）</div>
        </div>
        <div class="thm">
          <div class="thm-num">III</div>
          <div class="thm-text"><strong>計數</strong>：Sylow p-子群的個數 n\u209A 滿足 n\u209A \u2261 1 (mod p) 且 n\u209A \u2223 |G|/p\u1D4F</div>
        </div>
      </div>

      <div class="verify-section">
        <div class="vs-title">驗證：D\u2083（|G| = 6 = 2 \u00D7 3）</div>
        <div class="verify-grid">
          <div class="vr">
            <span class="vr-p">p=2</span>
            Sylow 2-子群有 n\u2082 個。n\u2082 \u2261 1 (mod 2) 且 n\u2082 | 3 \u2192 n\u2082 = 1 或 3。
            <br/>實際：<strong>n\u2082 = 3</strong>（{{ '{' }}e,s{{ '}' }}、{{ '{' }}e,sr{{ '}' }}、{{ '{' }}e,sr\u00B2{{ '}' }}）
          </div>
          <div class="vr">
            <span class="vr-p">p=3</span>
            n\u2083 \u2261 1 (mod 3) 且 n\u2083 | 2 \u2192 n\u2083 = 1。
            <br/>實際：<strong>n\u2083 = 1</strong>（{{ '{' }}e,r,r\u00B2{{ '}' }}，唯一 \u2192 正規！）
          </div>
        </div>
      </div>

      <div class="key-consequence">
        <strong>重要推論</strong>：如果 n\u209A = 1，那唯一的 Sylow p-子群一定是<strong>正規子群</strong>（因為共軛只有一個 = 自己）。
      </div>
    </app-challenge-card>
    <app-prose-block>
      <span class="hint">Sylow 定理是分析有限群結構最強大的工具。下一節我們用它來分類小階群，以及證明 A\u2085 是單群。</span>
    </app-prose-block>
  `,
  styles: `
    .theorems { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .thm { display: flex; gap: 12px; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .thm-num { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      border-radius: 50%; background: var(--accent); color: white; font-size: 16px; font-weight: 700; flex-shrink: 0;
      font-family: 'JetBrains Mono', monospace; }
    .thm-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; strong { color: var(--text); } }
    .verify-section { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-bottom: 12px; }
    .vs-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .verify-grid { display: flex; flex-direction: column; gap: 8px; }
    .vr { padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); line-height: 1.6; }
    .vr-p { font-weight: 700; color: var(--accent); margin-right: 6px; }
    .key-consequence { padding: 12px 16px; border-radius: 8px; background: rgba(90,138,90,0.06);
      border: 1px solid rgba(90,138,90,0.2); font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); } }
  `,
})
export class StepSylow23Component {}
