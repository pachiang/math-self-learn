import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-rubik-group', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="魔術方塊是一個群" subtitle="\u00A710.1">
  <p>3\u00D73\u00D73 魔術方塊的每一次轉動都是一個<strong>置換</strong> \u2014 它重新排列了 54 個色塊。所有可能的狀態，配上「先轉再轉」的組合方式，構成一個群。</p>
  <p>這個群有多大？<strong>43,252,003,274,489,856,000</strong>（約 4.3 \u00D7 10\u00B9\u2079）個元素。</p>
</app-prose-block>
<app-challenge-card prompt="魔方群的基本結構">
  <div class="info-grid">
    <div class="ig"><div class="ig-label">元素</div><div class="ig-value">每一種可達到的方塊狀態</div></div>
    <div class="ig"><div class="ig-label">運算</div><div class="ig-value">連續轉動（組合）</div></div>
    <div class="ig"><div class="ig-label">單位元</div><div class="ig-value">六面還原的狀態</div></div>
    <div class="ig"><div class="ig-label">逆元</div><div class="ig-value">把轉動倒過來做</div></div>
    <div class="ig"><div class="ig-label">生成元</div><div class="ig-value">U, D, L, R, F, B（六面各轉 90\u00B0）</div></div>
    <div class="ig"><div class="ig-label">階</div><div class="ig-value">\u2248 4.3 \u00D7 10\u00B9\u2079</div></div>
  </div>
  <div class="generators">
    <div class="gen-title">六個生成元：</div>
    <div class="gen-row">
      @for (face of ['U','D','L','R','F','B']; track face) {
        <span class="gen-badge">{{ face }}</span>
      }
    </div>
    <div class="gen-note">每個面可以轉 90\u00B0、180\u00B0（= 兩次 90\u00B0）、270\u00B0（= 逆轉 90\u00B0）</div>
  </div>
</app-challenge-card>
<app-prose-block>
  <p>魔方群不是交換群：先轉 U 再轉 R \u2260 先轉 R 再轉 U。這跟 D\u2083 的 rs \u2260 sr 是同一回事。</p>
  <span class="hint">那些魔方公式（如 R U R' U'）其實就是群論裡的<strong>交換子</strong>。下一節見。</span>
</app-prose-block>
`, styles: `
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; }
  .ig { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); }
  .ig-label { font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 2px; }
  .ig-value { font-size: 13px; color: var(--text); }
  .generators { padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); }
  .gen-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
  .gen-row { display: flex; gap: 8px; margin-bottom: 6px; }
  .gen-badge { padding: 8px 16px; border-radius: 6px; background: var(--accent-18); color: var(--text);
    font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .gen-note { font-size: 12px; color: var(--text-muted); }
` })
export class StepRubikGroupComponent {}
