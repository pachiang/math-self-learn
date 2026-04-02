import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-correspondence', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="伽羅瓦對應" subtitle="\u00A78.5">
  <p>伽羅瓦理論最核心的定理：<strong>子群 \u2194 中間域，一一對應，且順序反轉。</strong></p>
</app-prose-block>
<app-challenge-card prompt="x\u2074 \u2212 2 的伽羅瓦對應（Gal = D\u2084）">
  <div class="diagram">
    <div class="dia-col">
      <div class="dia-title">子群格（大\u2192小）</div>
      <div class="dia-node top">D\u2084（8 階）</div>
      <div class="dia-level">
        <div class="dia-node">\u27E8r\u27E9（4 階）</div>
        <div class="dia-node">V\u2081（4 階）</div>
        <div class="dia-node">V\u2082（4 階）</div>
      </div>
      <div class="dia-level">
        <div class="dia-node">\u27E8r\u00B2\u27E9（2 階）</div>
        <div class="dia-node">\u27E8s\u27E9（2 階）</div>
        <div class="dia-node">\u27E8sr\u27E9（2 階）</div>
      </div>
      <div class="dia-node bottom">{{ '{' }}e{{ '}' }}（1 階）</div>
    </div>
    <div class="dia-arrows">\u2194</div>
    <div class="dia-col">
      <div class="dia-title">中間域格（小\u2192大）</div>
      <div class="dia-node top">Q</div>
      <div class="dia-level">
        <div class="dia-node">Q(i)</div>
        <div class="dia-node">Q(\u221A2)</div>
        <div class="dia-node">Q(i\u221A2)</div>
      </div>
      <div class="dia-level">
        <div class="dia-node">Q(\u2074\u221A2)</div>
        <div class="dia-node">Q(\u2074\u221A2, i)</div>
        <div class="dia-node">...</div>
      </div>
      <div class="dia-node bottom">Q(\u2074\u221A2, i)（分裂域）</div>
    </div>
  </div>
  <div class="key-insight">
    <strong>子群越大 \u2194 固定的域越小</strong>。整個群固定基域 Q；平凡子群 {{ '{' }}e{{ '}' }} 固定整個分裂域。
    <br/>正規子群 \u2194 正規擴張（伽羅瓦擴張）。
  </div>
</app-challenge-card>
<app-prose-block>
  <p>伽羅瓦對應把<strong>群論</strong>（子群格）翻譯成<strong>域論</strong>（中間域格），而且完美地一一對應。</p>
  <p>這就是為什麼群論能解決方程式的問題：<strong>方程式的可解性取決於伽羅瓦群的結構。</strong></p>
  <span class="hint">最後一節：用伽羅瓦理論回答那個 200 年的問題 — 五次方程為什麼沒有公式解。</span>
</app-prose-block>
`, styles: `
  .diagram { display: flex; align-items: center; gap: 16px; justify-content: center; margin-bottom: 14px; flex-wrap: wrap;
    padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
  .dia-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .dia-title { font-size: 12px; font-weight: 700; color: var(--accent); }
  .dia-node { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
    font-family: 'JetBrains Mono', monospace; color: var(--text); background: var(--bg-surface); border: 1px solid var(--border);
    &.top { background: var(--accent-18); } &.bottom { background: rgba(90,138,90,0.1); } }
  .dia-level { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .dia-arrows { font-size: 24px; color: var(--accent); font-weight: 700; }
  .key-insight { padding: 14px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent-30);
    font-size: 13px; color: var(--text-secondary); text-align: center; line-height: 1.7; strong { color: var(--text); } }
` })
export class StepCorrespondenceComponent {}
