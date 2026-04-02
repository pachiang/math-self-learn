import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-what-is-field',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是域" subtitle="\u00A77.1">
      <p>
        環有加法和乘法，但不能保證「除法」。
        如果乘法也有逆元（每個非零元素都可以除），那這個環就升級成<strong>域</strong>（field）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="哪些是域？哪些只是環？">
      <div class="compare-grid">
        <div class="cg-item field">
          <div class="cg-name">Q（有理數）</div>
          <div class="cg-verdict">\u2713 域</div>
          <div class="cg-reason">每個非零有理數 a/b 有倒數 b/a</div>
        </div>
        <div class="cg-item field">
          <div class="cg-name">R（實數）</div>
          <div class="cg-verdict">\u2713 域</div>
          <div class="cg-reason">每個非零實數有倒數</div>
        </div>
        <div class="cg-item not-field">
          <div class="cg-name">Z（整數）</div>
          <div class="cg-verdict">\u2717 只是環</div>
          <div class="cg-reason">2 的倒數 1/2 不是整數</div>
        </div>
        <div class="cg-item field">
          <div class="cg-name">Z\u2085</div>
          <div class="cg-verdict">\u2713 域</div>
          <div class="cg-reason">5 是質數 \u2192 沒有零因子 \u2192 每個非零元素可逆</div>
        </div>
        <div class="cg-item not-field">
          <div class="cg-name">Z\u2086</div>
          <div class="cg-verdict">\u2717 只是環</div>
          <div class="cg-reason">有零因子（2\u00D73=0）\u2192 不可能是域</div>
        </div>
        <div class="cg-item field">
          <div class="cg-name">Z\u2087</div>
          <div class="cg-verdict">\u2713 域</div>
          <div class="cg-reason">7 是質數</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <div class="key-fact">
        Z\u2099 是域 \u27FA n 是質數
      </div>
      <p>
        域的定義：一個交換環，其中每個非零元素都有乘法逆元。
        等價地說：(R \u2216 {{ '{' }}0{{ '}' }}, \u00D7) 構成一個交換群。
      </p>
      <span class="hint">
        Z\u2085、Z\u2087 這些質數域是最簡單的有限域。
        下一節我們深入探索它們的結構。
      </span>
    </app-prose-block>
  `,
  styles: `
    .compare-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; @media(max-width:500px){grid-template-columns:repeat(2,1fr);} }
    .cg-item { padding: 12px; border-radius: 8px; text-align: center; border: 1px solid var(--border);
      &.field { background: rgba(90,138,90,0.05); border-color: rgba(90,138,90,0.2); }
      &.not-field { background: rgba(160,90,90,0.05); border-color: rgba(160,90,90,0.2); }
    }
    .cg-name { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 4px; }
    .cg-verdict { font-size: 12px; font-weight: 700; margin-bottom: 4px;
      .field & { color: #5a8a5a; }
      .not-field & { color: #a05a5a; }
    }
    .cg-reason { font-size: 11px; color: var(--text-muted); line-height: 1.4; }

    .key-fact { padding: 14px; text-align: center; font-size: 17px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--accent-10); border: 2px solid var(--accent); border-radius: 10px; margin: 12px 0; }
  `,
})
export class StepWhatIsFieldComponent {}
