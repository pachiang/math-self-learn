import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-sylow1',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Sylow 第一定理" subtitle="\u00A76.4">
      <p>Cauchy 定理說「質因子 p \u2192 存在 p 階元素」。Sylow 更強：</p>
      <div class="theorem">
        <div class="thm-name">Sylow 第一定理</div>
        如果 p\u1D4F 整除 |G|，那 G 有一個階為 p\u1D4F 的子群（<strong>Sylow p-子群</strong>）。
      </div>
    </app-prose-block>
    <app-challenge-card prompt="在 D\u2083 和 S\u2084 裡找 Sylow 子群">
      <div class="examples">
        <div class="ex-card">
          <div class="ex-title">D\u2083，|G| = 6 = 2 \u00D7 3</div>
          <div class="ex-sylow">
            <div class="sy"><span class="sy-p">Sylow 2-子群</span>（階 2）：{{ '{' }}e, s{{ '}' }}、{{ '{' }}e, sr{{ '}' }}、{{ '{' }}e, sr\u00B2{{ '}' }}</div>
            <div class="sy"><span class="sy-p">Sylow 3-子群</span>（階 3）：{{ '{' }}e, r, r\u00B2{{ '}' }}</div>
          </div>
        </div>
        <div class="ex-card">
          <div class="ex-title">S\u2084，|G| = 24 = 2\u00B3 \u00D7 3</div>
          <div class="ex-sylow">
            <div class="sy"><span class="sy-p">Sylow 2-子群</span>（階 8）：D\u2084 的副本（正方形的對稱群嵌入 S\u2084）</div>
            <div class="sy"><span class="sy-p">Sylow 3-子群</span>（階 3）：三階循環群，如 \u27E8(1 2 3)\u27E9</div>
          </div>
        </div>
      </div>
      <div class="proof-idea">
        <div class="pi-title">證明思路（用群作用！）</div>
        <p>讓 G 作用在所有大小為 p\u1D4F 的子集上。用軌道-穩定子定理（Ch5 §5.4）
          和 p 的整除性，找到一個穩定子恰好是 p\u1D4F 階的子群。</p>
      </div>
    </app-challenge-card>
    <app-prose-block>
      <span class="hint">第一定理保證 Sylow 子群<strong>存在</strong>。但有幾個？它們之間有什麼關係？下一節回答。</span>
    </app-prose-block>
  `,
  styles: `
    .theorem { padding: 16px; text-align: center; background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 12px; margin: 10px 0; font-size: 14px; color: var(--text); line-height: 1.6; }
    .thm-name { font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .examples { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .ex-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .ex-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
    .sy { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .sy-p { font-weight: 600; color: var(--accent); }
    .proof-idea { padding: 14px; border-radius: 10px; background: var(--accent-10); border-left: 3px solid var(--accent); }
    .pi-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .proof-idea p { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
  `,
})
export class StepSylow1Component {}
