import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const COLORS = ['var(--v0)', 'var(--v1)', 'var(--v2)'];

@Component({
  selector: 'app-step-first-iso',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="第一同構定理" subtitle="\u00A73.7">
      <p>
        到目前為止，我們接觸了三個概念：同態、核、商群。
        它們看起來各自獨立，但其實<strong>三者之間有一個漂亮的等式</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="跟著這三步走一遍，感受定理在說什麼">
      <!-- Step 1: Start with homomorphism -->
      <div class="theorem-step">
        <div class="step-badge">1</div>
        <div class="step-content">
          <div class="step-title">從一個同態開始</div>
          <div class="step-viz">
            <div class="group-box">
              <div class="gb-title">D\u2083</div>
              <div class="gb-els">
                <span class="gb-el" [style.background]="COLORS[0]">e</span>
                <span class="gb-el" [style.background]="COLORS[0]">r</span>
                <span class="gb-el" [style.background]="COLORS[0]">r\u00B2</span>
                <span class="gb-el" [style.background]="COLORS[1]">s</span>
                <span class="gb-el" [style.background]="COLORS[1]">sr</span>
                <span class="gb-el" [style.background]="COLORS[1]">sr\u00B2</span>
              </div>
            </div>
            <div class="step-arrow">
              <div class="arrow-label">\u03C6</div>
              <div class="arrow-line">\u2192</div>
            </div>
            <div class="group-box">
              <div class="gb-title">Z\u2082</div>
              <div class="gb-els">
                <span class="gb-el" [style.background]="COLORS[0]">0</span>
                <span class="gb-el" [style.background]="COLORS[1]">1</span>
              </div>
            </div>
          </div>
          <div class="step-desc">\u03C6 把旋轉映到 0，翻轉映到 1</div>
        </div>
      </div>

      <!-- Step 2: Find kernel -->
      <div class="theorem-step">
        <div class="step-badge">2</div>
        <div class="step-content">
          <div class="step-title">找出核（被壓扁成 0 的）</div>
          <div class="step-viz">
            <div class="kernel-box">
              ker(\u03C6) = {{ '{' }}e, r, r\u00B2{{ '}' }}
            </div>
            <div class="step-note">= 正規子群 H</div>
          </div>
        </div>
      </div>

      <!-- Step 3: Take quotient -->
      <div class="theorem-step">
        <div class="step-badge">3</div>
        <div class="step-content">
          <div class="step-title">取商群</div>
          <div class="step-viz triple">
            <div class="group-box small">
              <div class="gb-title">D\u2083 / ker(\u03C6)</div>
              <div class="gb-els">
                <span class="gb-el" [style.background]="COLORS[0]">H</span>
                <span class="gb-el" [style.background]="COLORS[1]">sH</span>
              </div>
            </div>
            <div class="iso-sign">\u2245</div>
            <div class="group-box small">
              <div class="gb-title">im(\u03C6)</div>
              <div class="gb-els">
                <span class="gb-el" [style.background]="COLORS[0]">0</span>
                <span class="gb-el" [style.background]="COLORS[1]">1</span>
              </div>
            </div>
            <div class="iso-sign">=</div>
            <div class="group-box small">
              <div class="gb-title">Z\u2082</div>
              <div class="gb-els">
                <span class="gb-el" [style.background]="COLORS[0]">0</span>
                <span class="gb-el" [style.background]="COLORS[1]">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <!-- The theorem statement -->
    <app-prose-block title="定理">
      <div class="theorem-box">
        <div class="thm-statement">
          G / ker(\u03C6) \u2245 im(\u03C6)
        </div>
        <div class="thm-words">
          群除以核，同構於像
        </div>
      </div>

      <p>
        用白話說：
      </p>
      <div class="plain-explain">
        <div class="pe-row">
          <span class="pe-icon">\u2460</span>
          <span>一個同態 \u03C6 把群 G 映到群 G'</span>
        </div>
        <div class="pe-row">
          <span class="pe-icon">\u2461</span>
          <span>核 ker(\u03C6) 是被壓扁成單位元的那些元素</span>
        </div>
        <div class="pe-row">
          <span class="pe-icon">\u2462</span>
          <span>把這些壓扁的元素「除掉」（取商群 G/ker），剩下的結構</span>
        </div>
        <div class="pe-row">
          <span class="pe-icon">\u2463</span>
          <span><strong>恰好跟 \u03C6 的像（output 的部分）同構</strong></span>
        </div>
      </div>

      <p>
        另一種記法：
      </p>
      <div class="alt-picture">
        <div class="ap-top">
          <span>G</span>
          <span class="ap-arrow">\u2192 \u03C6</span>
          <span>im(\u03C6) \u2286 G'</span>
        </div>
        <div class="ap-down">\u2193 取商</div>
        <div class="ap-bottom">
          <span>G/ker(\u03C6)</span>
          <span class="ap-iso">\u2245</span>
          <span>im(\u03C6)</span>
        </div>
      </div>

      <p>
        「先壓縮（取商）再看」和「先翻譯（同態）再看」，看到的東西是一樣的。
        <strong>壓縮和翻譯是一體兩面。</strong>
      </p>

      <span class="hint">
        這是抽象代數中最基本、最重要的定理之一。
        整個第三章的概念 — 正規子群、商群、同態、核 — 全部在這一個定理裡匯合了。
      </span>
    </app-prose-block>
  `,
  styles: `
    .theorem-step {
      display: flex; gap: 14px; padding: 14px; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .step-badge {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--accent); color: white; font-size: 14px; font-weight: 700; flex-shrink: 0;
    }
    .step-content { flex: 1; }
    .step-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
    .step-desc { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
    .step-viz { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .step-viz.triple { gap: 8px; }

    .group-box {
      padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
      &.small { padding: 8px 10px; }
    }
    .gb-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 6px; font-family: 'JetBrains Mono', monospace; }
    .gb-els { display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; }
    .gb-el {
      padding: 3px 9px; border-radius: 4px; font-size: 13px; font-weight: 600;
      color: white; font-family: 'JetBrains Mono', monospace;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .step-arrow { text-align: center; flex-shrink: 0; }
    .arrow-label { font-size: 14px; font-weight: 700; color: var(--accent); }
    .arrow-line { font-size: 20px; color: var(--text-muted); }

    .kernel-box {
      padding: 8px 16px; border-radius: 6px;
      background: rgba(90,138,90,0.1); border: 1px solid rgba(90,138,90,0.2);
      font-size: 15px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
    .step-note { font-size: 12px; color: var(--text-muted); }
    .iso-sign { font-size: 22px; font-weight: 700; color: var(--accent); }

    /* Theorem box */
    .theorem-box {
      padding: 20px; border: 2px solid var(--accent); border-radius: 14px;
      background: var(--accent-10); text-align: center; margin: 16px 0;
    }
    .thm-statement {
      font-size: 24px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-bottom: 6px;
    }
    .thm-words { font-size: 14px; color: var(--accent); font-weight: 600; }

    .plain-explain { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; }
    .pe-row { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
    .pe-icon { flex-shrink: 0; }
    .pe-row strong { color: var(--text); }

    .alt-picture {
      text-align: center; padding: 16px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg-surface); margin: 12px 0;
      font-family: 'JetBrains Mono', monospace; font-size: 15px; color: var(--text);
    }
    .ap-top, .ap-bottom { display: flex; justify-content: center; gap: 12px; align-items: center; }
    .ap-arrow { color: var(--accent); }
    .ap-down { font-size: 18px; color: var(--text-muted); margin: 8px 0; }
    .ap-iso { font-size: 20px; font-weight: 700; color: var(--accent); }
  `,
})
export class StepFirstIsoComponent {
  readonly COLORS = COLORS;
}
