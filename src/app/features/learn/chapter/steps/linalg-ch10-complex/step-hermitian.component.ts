import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-hermitian',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Hermitian \u77E9\u9663" subtitle="\u00A710.3">
      <p>
        \u5728\u8907\u5411\u91CF\u7684\u4E16\u754C\u88E1\uFF0C\u300C\u5C0D\u7A31\u300D\u9019\u500B\u6982\u5FF5\u9700\u8981\u5347\u7D1A\u3002
      </p>
      <p>
        \u5BE6\u77E9\u9663\u7684<strong>\u8F49\u7F6E</strong>\u662F A\u1D40\u3002\u8907\u77E9\u9663\u7684\u300C\u8F49\u7F6E + \u5C0D\u6BCF\u500B\u5143\u7D20\u53D6\u5171\u8EDB\u300D\u53EB\u505A
        <strong>\u5171\u8EDB\u8F49\u7F6E</strong>\uFF0C\u8A18\u4F5C A\u2020 \uFF08\u4E5F\u5BEB\u4F5C A^*\uFF09\uFF1A
      </p>
      <p class="formula">A\u2020 = (\u8F49\u7F6E A) \u4E26\u5C0D\u6BCF\u500B\u5143\u7D20\u53D6\u5171\u8EDB</p>
      <p>
        \u4E00\u500B\u77E9\u9663\u662F <strong>Hermitian</strong>\u7684\uFF0C\u5982\u679C\uFF1A
      </p>
      <p class="formula big">A = A\u2020</p>
      <p>
        \u9019\u662F\u300C\u8907\u7248\u7684\u5C0D\u7A31\u300D\u3002\u4E00\u500B 2\u00D72 Hermitian \u77E9\u9663\u9577\u9019\u6A23\uFF1A
      </p>
      <p class="formula">[[a, b+ci], [b-ci, d]]\uFF0C\u5176\u4E2D a, b, c, d \u90FD\u662F\u5BE6\u6578</p>
      <p>
        \u91CD\u8981\u89C0\u5BDF\uFF1A
      </p>
      <ul>
        <li><strong>\u5C0D\u89D2\u7DDA\u5FC5\u9808\u662F\u5BE6\u6578</strong>\uFF08\u56E0\u70BA z* = z \u8981\u6C42 z \u5BE6\uFF09</li>
        <li><strong>\u5C0D\u89D2\u7DDA\u5916\u7684\u5143\u7D20\u4E92\u70BA\u5171\u8EDB</strong>\uFF1AA[i][j] = A[j][i]*</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u770B\u4E00\u500B\u5177\u9AD4\u4F8B\u5B50\uFF1AA = [[2, 1+i], [1-i, 3]]">
      <div class="matrix-display">
        <div class="md-bracket">[</div>
        <div class="md-body">
          <div class="md-row">
            <span class="md-cell real">2</span>
            <span class="md-cell complex">1 + i</span>
          </div>
          <div class="md-row">
            <span class="md-cell complex">1 \u2212 i</span>
            <span class="md-cell real">3</span>
          </div>
        </div>
        <div class="md-bracket">]</div>
      </div>
      <div class="check">
        \u9A57\u8B49 A = A\u2020\uFF1A
        <ul>
          <li>\u5C0D\u89D2\u7DDA\uFF1A2 \u8DDF 3 \u90FD\u662F\u5BE6\u6578 \u2713</li>
          <li>A[0][1] = 1 + i\u3001A[1][0] = 1 \u2212 i\uFF1A\u4E92\u70BA\u5171\u8EDB \u2713</li>
        </ul>
        \u6240\u4EE5 A \u662F Hermitian\u3002
      </div>
    </app-challenge-card>

    <app-prose-block title="\u8B5C\u5B9A\u7406\uFF1AHermitian \u77E9\u9663\u7684\u9B54\u6CD5">
      <p>
        Hermitian \u77E9\u9663\u8DDF\u5BE6\u5C0D\u7A31\u77E9\u9663\u4E00\u6A23\uFF0C\u6709\u4E00\u500B\u8B93\u4EBA\u9A5A\u8C54\u7684\u5B9A\u7406\uFF1A
      </p>
      <ul>
        <li><strong>\u7279\u5FB5\u503C\u90FD\u662F\u5BE6\u6578</strong>\uFF01\u96D6\u7136\u77E9\u9663\u88E1\u9762\u6709\u8907\u6578\uFF0C\u7279\u5FB5\u503C\u6C92\u6709\u865B\u90E8</li>
        <li><strong>\u7279\u5FB5\u5411\u91CF\u4E92\u76F8\u300C\u6B63\u4EA4\u300D</strong>\uFF08\u5728 Hermitian \u5167\u7A4D\u610F\u7FA9\u4E0B\uFF09</li>
        <li>\u53EF\u4EE5\u5B8C\u5168\u88AB\u8C50\u9650\u5316\uFF1AA = U D U\u2020</li>
      </ul>
      <p>
        \u5176\u4E2D U \u662F\u4E00\u500B<strong>Unitary</strong>\u77E9\u9663\uFF08\u4E0B\u4E00\u7BC0\u4ECB\u7D39\uFF09\uFF0C\u6B04\u70BA\u4E92\u6B63\u4EA4\u7684\u7279\u5FB5\u5411\u91CF\u3002
      </p>
      <p>
        \u70BA\u4EC0\u9EBC\u9019\u500B\u91CD\u8981\uFF1F\u56E0\u70BA<strong>\u91CF\u5B50\u529B\u5B78\u88E1\u7684\u300C\u53EF\u89C0\u5BDF\u91CF\u300D\uFF08observable\uFF09\u5168\u90FD\u662F Hermitian \u77E9\u9663</strong>\u3002
        \u9019\u4E0D\u662F\u5DE7\u5408\uFF1A
      </p>
      <ul>
        <li>\u53EF\u89C0\u5BDF\u91CF\u7684\u300C\u53EF\u80FD\u503C\u300D = \u7279\u5FB5\u503C \u2192 \u4E00\u5B9A\u8981\u662F\u5BE6\u6578\uFF08\u80FD\u91CF\u3001\u9577\u5EA6\u4E0D\u53EF\u80FD\u662F\u8907\u6578\uFF09</li>
        <li>\u53EF\u80FD\u7684\u300C\u91CF\u5B50\u614B\u300D = \u7279\u5FB5\u5411\u91CF \u2192 \u4ED6\u5011\u4E92\u70BA\u6B63\u4EA4 \u2192 \u4E0D\u540C\u7684\u53EF\u80FD\u614B\u53EF\u4EE5\u88AB\u300C\u5340\u5206\u300D</li>
      </ul>
      <p>
        \u9019\u500B\u9023\u63A5\u662F\u91CF\u5B50\u529B\u5B78\u6578\u5B78\u7D50\u69CB\u7684\u6838\u5FC3\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 26px; padding: 18px; } }

    .matrix-display { display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg);
      margin-bottom: 14px; }
    .md-bracket { font-size: 56px; font-weight: 200; color: var(--text-muted); line-height: 0.9; }
    .md-body { display: flex; flex-direction: column; gap: 6px; padding: 0 6px; }
    .md-row { display: flex; gap: 8px; }
    .md-cell { min-width: 60px; padding: 8px 14px; text-align: center;
      font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; border-radius: 6px;
      &.real { background: rgba(141, 163, 181, 0.18); color: var(--v1); }
      &.complex { background: rgba(191, 158, 147, 0.18); color: var(--v0); } }

    .check { padding: 14px 18px; border-radius: 10px; background: var(--accent-10);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      ul { margin: 6px 0; padding-left: 20px; } }
  `,
})
export class StepHermitianComponent {}
