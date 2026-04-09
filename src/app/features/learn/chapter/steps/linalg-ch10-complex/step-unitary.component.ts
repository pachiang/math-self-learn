import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-unitary',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Unitary \u77E9\u9663" subtitle="\u00A710.4">
      <p>
        \u5BE6\u6578\u88E1\u6709<strong>\u6B63\u4EA4\u77E9\u9663</strong>\uFF0C\u5B83\u5011\u6EFF\u8DB3 Q\u1D40 Q = I\uFF0C\u4FDD\u6301\u9577\u5EA6\u8DDF\u89D2\u5EA6\u3002
        \u8907\u6578\u7684\u5C0D\u61C9\u662F<strong>Unitary \u77E9\u9663</strong>\uFF1A
      </p>
      <p class="formula big">U\u2020 U = U U\u2020 = I</p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA\uFF0C<strong>U \u7684\u5171\u8EDB\u8F49\u7F6E\u5C31\u662F\u53CD\u77E9\u9663</strong>\u3002
      </p>
      <p>
        \u4E0D\u9700\u8981\u8A08\u7B97\u8907\u96DC\u7684\u53CD\u77E9\u9663\u516C\u5F0F \u2014 \u53EA\u8981\u8F49\u7F6E\u4E26\u5C0D\u6BCF\u500B\u5143\u7D20\u53D6\u5171\u8EDB\u3002\u9019\u662F\u4E00\u500B\u5DE8\u5927\u7684\u8A08\u7B97\u4E0A\u7684\u793C\u7269\u3002
      </p>
      <p>
        Unitary \u77E9\u9663\u7684\u91CD\u8981\u6027\u8CEA\uFF1A
      </p>
      <ul>
        <li><strong>\u4FDD\u6301 Hermitian \u5167\u7A4D</strong>\uFF1A\u27E8Uv|Uw\u27E9 = \u27E8v|w\u27E9</li>
        <li><strong>\u4FDD\u6301\u9577\u5EA6</strong>\uFF1A|Uv| = |v|</li>
        <li><strong>\u7279\u5FB5\u503C\u90FD\u5728\u55AE\u4F4D\u5713\u4E0A</strong>\uFF1A|\u03BB| = 1</li>
        <li><strong>\u7279\u5FB5\u5411\u91CF\u4E92\u70BA\u6B63\u4EA4</strong></li>
      </ul>
      <p>
        \u8907\u7279\u5FB5\u503C\u90FD\u5728\u55AE\u4F4D\u5713\u4E0A \u2014 \u9019\u8DDF \u00A710.1 \u770B\u5230\u7684\u300C\u65CB\u8F49\u77E9\u9663\u7684\u7279\u5FB5\u503C\u662F e^(\u00B1i\u03B8)\u300D\u662F\u540C\u4E00\u4EF6\u4E8B\u3002
        \u9019\u4E5F\u5C0D\u61C9\u4E86 Unitary \u77E9\u9663\u7684\u300C\u5E7E\u4F55\u610F\u7FA9\u300D\uFF1A
      </p>
      <p class="formula big">Unitary = \u8907\u7A7A\u9593\u88E1\u7684\u65CB\u8F49</p>
    </app-prose-block>

    <app-challenge-card prompt="\u5169\u500B\u91CD\u8981\u7684\u4F8B\u5B50">
      <div class="ex-block">
        <div class="ex-title">\u4F8B 1\uFF1A\u8907\u8907\u9818\u57DF\u7684\u300C\u65CB\u8F49\u300D</div>
        <div class="matrix-display">
          <div class="md-bracket">[</div>
          <div class="md-body">
            <div class="md-row">
              <span class="md-cell">cos\u03B8</span>
              <span class="md-cell">\u2212sin\u03B8</span>
            </div>
            <div class="md-row">
              <span class="md-cell">sin\u03B8</span>
              <span class="md-cell">cos\u03B8</span>
            </div>
          </div>
          <div class="md-bracket">]</div>
        </div>
        <div class="ex-cap">2D \u5BE6\u65CB\u8F49\u4E5F\u662F Unitary\uFF08\u96D6\u7136\u53EF\u4EE5\u51FA\u73FE\u5728\u8907\u8907\u4E16\u754C\u88E1\uFF09</div>
      </div>

      <div class="ex-block">
        <div class="ex-title">\u4F8B 2\uFF1A\u91CD\u8981\u7684 Hadamard \u9598</div>
        <div class="matrix-display">
          <span class="md-prefix">H = (1/\u221A2)</span>
          <div class="md-bracket">[</div>
          <div class="md-body">
            <div class="md-row">
              <span class="md-cell">1</span>
              <span class="md-cell">1</span>
            </div>
            <div class="md-row">
              <span class="md-cell">1</span>
              <span class="md-cell">\u22121</span>
            </div>
          </div>
          <div class="md-bracket">]</div>
        </div>
        <div class="ex-cap">
          \u9A57\u8B49 H\u2020 H = I\uFF1A\u7C21\u55AE\u8A08\u7B97\u4E58\u51FA (1/2)[[2, 0], [0, 2]] = I \u2713
          <br/>\u9019\u500B\u9598\u662F\u91CF\u5B50\u8A08\u7B97\u88E1\u6700\u91CD\u8981\u7684\u9598\u4E4B\u4E00\u3002
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u70BA\u4EC0\u9EBC Unitary \u77E9\u9663\u91CD\u8981\uFF1F\u91CF\u5B50\u529B\u5B78\u88E1\u7684\u300C\u6642\u9593\u6F14\u5316\u300D\u5168\u90E8\u662F Unitary\u3002
      </p>
      <p>
        \u6CE8\u610F\u9019\u500B\u300C\u4FDD\u6301\u9577\u5EA6\u300D\u7684\u6027\u8CEA\u8DDF\u91CF\u5B50\u529B\u5B78\u4E4B\u9593\u7684\u9023\u63A5\uFF1A
      </p>
      <ul>
        <li>\u91CF\u5B50\u614B |\u03C8\u27E9 \u7684\u300C\u9577\u5EA6\u300D = \u6240\u6709\u53EF\u80FD\u7D50\u679C\u7684\u6A5F\u7387\u7E3D\u548C = 1</li>
        <li>\u6F14\u5316\u4E4B\u5F8C\u9577\u5EA6\u9084\u662F\u5FC5\u9808 = 1\uFF08\u4E0D\u7136\u6A5F\u7387\u4E0D\u4FDD\u5B88\uFF09</li>
        <li>\u6240\u4EE5\u6F14\u5316\u7B97\u5B50<strong>\u5FC5\u9808</strong>\u662F Unitary</li>
      </ul>
      <p>
        \u4E0B\u4E00\u7Bc0\u770B\u4E09\u500B\u540C\u6642\u662F Hermitian <strong>\u4E26\u4E14</strong> Unitary \u7684\u91CD\u8981\u77E9\u9663\u2014 <strong>Pauli \u77E9\u9663</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 24px; padding: 18px; } }

    .ex-block { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 12px; }
    .ex-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 10px; }
    .ex-cap { font-size: 12px; color: var(--text-secondary); margin-top: 8px; line-height: 1.6; }

    .matrix-display { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px; }
    .md-prefix { font-size: 14px; color: var(--text); font-family: 'Noto Sans Math', serif; margin-right: 4px; }
    .md-bracket { font-size: 44px; font-weight: 200; color: var(--text-muted); line-height: 0.9; }
    .md-body { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
    .md-row { display: flex; gap: 6px; }
    .md-cell { min-width: 50px; padding: 6px 10px; text-align: center;
      font-size: 14px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--bg-surface); border-radius: 4px; }
  `,
})
export class StepUnitaryComponent {}
