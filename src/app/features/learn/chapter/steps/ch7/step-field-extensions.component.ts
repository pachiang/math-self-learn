import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-field-extensions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="域擴張" subtitle="\u00A77.5">
      <p>
        有時候一個域「不夠大」— 某些方程式在裡面沒有解。
        解決辦法：<strong>把域變大</strong>，加入需要的元素。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看看「加入一個根」怎樣創造新的域">
      <div class="ext-card">
        <div class="ext-title">Q \u2192 Q(\u221A2)</div>
        <div class="ext-body">
          <p>x\u00B2 \u2212 2 在 Q 裡沒有根（\u221A2 不是有理數）。</p>
          <p>把 \u221A2 「強制加入」Q，得到 Q(\u221A2) = {{ '{' }}a + b\u221A2 | a,b \u2208 Q{{ '}' }}。</p>
          <div class="calc-demo">
            <div class="cd-line">(1 + \u221A2)(3 \u2212 2\u221A2)</div>
            <div class="cd-line">= 3 \u2212 2\u221A2 + 3\u221A2 \u2212 2(\u221A2)\u00B2</div>
            <div class="cd-line">= 3 + \u221A2 \u2212 4 = <strong>\u22121 + \u221A2</strong></div>
          </div>
          <p>Q(\u221A2) 是一個域！加減乘除都能做。維度 = 2（基底是 {{ '{' }}1, \u221A2{{ '}' }}）。</p>
        </div>
      </div>

      <div class="ext-card">
        <div class="ext-title">R \u2192 C = R[x]/(x\u00B2+1)</div>
        <div class="ext-body">
          <p>x\u00B2 + 1 在 R 裡沒有根。加入根 i，得到 C = {{ '{' }}a + bi{{ '}' }}。</p>
          <p>這跟第六章的商環 R[x]/(x\u00B2+1) 是一模一樣的！</p>
          <p>維度 = 2（基底是 {{ '{' }}1, i{{ '}' }}）。</p>
        </div>
      </div>

      <div class="ext-card">
        <div class="ext-title">Z\u2082 \u2192 GF(4) = Z\u2082[x]/(x\u00B2+x+1)</div>
        <div class="ext-body">
          <p>x\u00B2+x+1 在 Z\u2082 裡不可約（f(0)=1, f(1)=1，都不是 0）。</p>
          <p>加入根 \u03B1，得到 GF(4) = {{ '{' }}0, 1, \u03B1, 1+\u03B1{{ '}' }} — 一個 4 元素的域！</p>
          <p>這不是 Z\u2084！GF(4) 的加法是 Z\u2082 \u00D7 Z\u2082，不是 Z\u2084。</p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        域擴張的核心模式：
      </p>
      <div class="pattern-box">
        \u2460 找到一個在 F 上不可約的多項式 p(x)
        <br/>
        \u2461 做商環 F[x]/(p(x))
        <br/>
        \u2462 得到一個更大的域，維度 = deg(p)
      </div>
      <span class="hint">
        域擴張是伽羅瓦理論的舞台。下一節我們看看有限域的完整圖景。
      </span>
    </app-prose-block>
  `,
  styles: `
    .ext-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .ext-title { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 8px; }
    .ext-body { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .ext-body p { margin: 4px 0; }
    .ext-body strong { color: var(--text); }
    .calc-demo { padding: 8px 12px; background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); margin: 8px 0; }
    .cd-line { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text); strong { color: var(--accent); } }
    .pattern-box { padding: 14px; text-align: center; background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 10px; font-size: 14px; color: var(--text); line-height: 2; margin: 12px 0; }
  `,
})
export class StepFieldExtensionsComponent {}
