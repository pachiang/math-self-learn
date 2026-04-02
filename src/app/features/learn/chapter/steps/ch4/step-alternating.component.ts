import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-alternating',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="交替群 A\u2099" subtitle="\u00A74.5">
      <p>
        sgn: S\u2099 \u2192 {{ '{' }}\u00B11{{ '}' }} 是同態。
        它的<strong>核</strong>是什麼？就是所有被映射到 +1 的元素 — 也就是全部的<strong>偶置換</strong>。
      </p>
      <p>
        這個核叫做<strong>交替群</strong>（alternating group），記作 A\u2099。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看看 A\u2083 長什麼樣，以及它跟第三章的聯繫">
      <div class="an-card">
        <div class="an-title">A\u2083 = ker(sgn) = S\u2083 中的偶置換</div>
        <div class="an-elements">
          <span class="an-el even">( ) = e</span>
          <span class="an-el even">(1 2 3) = r</span>
          <span class="an-el even">(1 3 2) = r\u00B2</span>
        </div>
        <div class="an-note">3 個元素，循環群 — A\u2083 \u2245 Z\u2083</div>
      </div>

      <div class="chain">
        <div class="chain-title">第一同構定理在這裡：</div>
        <div class="chain-eq">
          S\u2083 / A\u2083 \u2245 im(sgn) = {{ '{' }}\u00B11{{ '}' }} \u2245 Z\u2082
        </div>
        <div class="chain-note">
          6 個元素的群除以 3 個元素的核 = 2 個元素的商群
        </div>
      </div>

      <div class="connections">
        <div class="conn-title">所有概念匯合了：</div>
        <div class="conn-grid">
          <div class="conn-item">
            <div class="ci-label">第三章</div>
            <div class="ci-content">\u03C6: D\u2083 \u2192 Z\u2082</div>
          </div>
          <div class="conn-item">
            <div class="ci-label">第四章</div>
            <div class="ci-content">sgn: S\u2083 \u2192 {{ '{' }}\u00B11{{ '}' }}</div>
          </div>
          <div class="conn-item">
            <div class="ci-label">核</div>
            <div class="ci-content">{{ '{' }}e, r, r\u00B2{{ '}' }} = A\u2083</div>
          </div>
          <div class="conn-item">
            <div class="ci-label">商群</div>
            <div class="ci-content">S\u2083/A\u2083 \u2245 Z\u2082</div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        A\u2099 是 S\u2099 的正規子群（因為它是同態的核），而且<strong>指數為 2</strong>
        （S\u2099 恰好是 A\u2099 的兩倍大）。
      </p>
      <p>
        有趣的事實：A\u2085 是最小的<strong>非交換單群</strong>
        （沒有非平凡正規子群的群）。這在伽羅瓦理論中扮演關鍵角色，
        解釋了為什麼五次以上的方程式沒有公式解。
      </p>
      <span class="hint">
        從 S\u2099 出發，我們認識了置換的結構。但凱萊告訴我們一件更驚人的事：
        <strong>所有的群</strong>都可以看成置換群 — 這就是下一節的凱萊定理。
      </span>
    </app-prose-block>
  `,
  styles: `
    .an-card {
      padding: 16px 20px; background: rgba(90,138,90,0.06); border: 1px solid rgba(90,138,90,0.2);
      border-radius: 10px; text-align: center; margin-bottom: 14px;
    }
    .an-title { font-size: 14px; font-weight: 600; color: #5a8a5a; margin-bottom: 10px; }
    .an-elements { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 8px; }
    .an-el {
      padding: 6px 14px; border-radius: 6px; font-family: 'JetBrains Mono', monospace;
      font-size: 14px; font-weight: 600;
      &.even { background: rgba(90,138,90,0.12); color: #5a8a5a; }
    }
    .an-note { font-size: 13px; color: var(--text-secondary); }

    .chain {
      padding: 14px 18px; border: 2px solid var(--accent-30); border-radius: 12px;
      background: var(--accent-10); text-align: center; margin-bottom: 14px;
    }
    .chain-title { font-size: 12px; font-weight: 600; color: var(--accent); margin-bottom: 6px; }
    .chain-eq { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 4px; }
    .chain-note { font-size: 12px; color: var(--text-muted); }

    .connections {
      padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface);
    }
    .conn-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; }
    .conn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .conn-item { padding: 8px 12px; border-radius: 6px; background: var(--bg); border: 1px solid var(--border); }
    .ci-label { font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 2px; }
    .ci-content { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); }
  `,
})
export class StepAlternatingComponent {}
