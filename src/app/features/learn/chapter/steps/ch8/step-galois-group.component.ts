import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-galois-group', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="伽羅瓦群" subtitle="\u00A78.4">
  <p>給一個多項式 f 和它的分裂域 L/K，所有固定 K 的 L 的自同構構成一個群 — <strong>伽羅瓦群 Gal(L/K)</strong>。</p>
  <p>伽羅瓦群的元素排列 f 的根，所以 Gal(L/K) 是某個 S\u2099 的子群（第四章的凱萊定理！）。</p>
</app-prose-block>
<app-challenge-card prompt="幾個經典多項式的伽羅瓦群">
  <div class="gal-grid">
    <div class="gal-card">
      <div class="gal-poly">x\u00B2 \u2212 2</div>
      <div class="gal-group">Gal = Z\u2082</div>
      <div class="gal-action">\u221A2 \u2194 \u2212\u221A2</div>
      <div class="gal-note">2 個根，交換它們</div>
    </div>
    <div class="gal-card">
      <div class="gal-poly">x\u00B3 \u2212 2</div>
      <div class="gal-group">Gal = S\u2083</div>
      <div class="gal-action">3 個根的所有排列</div>
      <div class="gal-note">最大可能的伽羅瓦群</div>
    </div>
    <div class="gal-card">
      <div class="gal-poly">x\u2074 \u2212 2</div>
      <div class="gal-group">Gal = D\u2084</div>
      <div class="gal-action">4 個根的 8 種對稱</div>
      <div class="gal-note">我們的老朋友二面體群！</div>
    </div>
    <div class="gal-card highlight">
      <div class="gal-poly">x\u2075 \u2212 2</div>
      <div class="gal-group">Gal = F\u2082\u2080（20 階 Frobenius 群）</div>
      <div class="gal-action">5 個根的特殊排列</div>
      <div class="gal-note">包含 A\u2085 的子群...</div>
    </div>
  </div>
  <div class="d4-callback">
    <strong>x\u2074 \u2212 2 的伽羅瓦群居然是 D\u2084！</strong>
    第一章學的正方形對稱群，竟然出現在四次方程式的根的結構裡。
    群論和方程式理論深刻地聯繫在一起。
  </div>
</app-challenge-card>
<app-prose-block>
  <p>伽羅瓦群編碼了多項式根之間的所有對稱關係。它的子群結構決定了哪些根可以用根式表示。</p>
  <span class="hint">下一節：伽羅瓦群的子群跟中間域之間有一個美妙的一一對應 — 伽羅瓦對應。</span>
</app-prose-block>
`, styles: `
  .gal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 14px; @media(max-width:500px){grid-template-columns:1fr;} }
  .gal-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    &.highlight { border-color: var(--accent); border-width: 2px; background: var(--accent-10); } }
  .gal-poly { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
  .gal-group { font-size: 14px; font-weight: 600; color: var(--accent); margin: 4px 0; }
  .gal-action { font-size: 12px; color: var(--text-secondary); }
  .gal-note { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
  .d4-callback { padding: 14px 18px; border-radius: 10px; background: rgba(90,138,90,0.06); border: 1px solid rgba(90,138,90,0.2);
    font-size: 13px; color: var(--text-secondary); line-height: 1.6; text-align: center; strong { color: var(--text); } }
` })
export class StepGaloisGroupComponent {}
