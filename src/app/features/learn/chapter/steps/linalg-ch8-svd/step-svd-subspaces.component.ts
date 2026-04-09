import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-svd-subspaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="SVD \u7D71\u4E00\u4E86\u56DB\u500B\u5B50\u7A7A\u9593" subtitle="\u00A78.3">
      <p>
        \u7B2C\u4E94\u7AE0\u6211\u5011\u8B49\u660E\u4E86 m\u00D7n \u77E9\u9663 A \u6709\u56DB\u500B\u91CD\u8981\u7684\u5B50\u7A7A\u9593\uFF1A
      </p>
      <ul>
        <li>\u884C\u7A7A\u9593 C(A\u1D40)\u3001\u96F6\u7A7A\u9593 N(A) \u5728 \u211D\u207F</li>
        <li>\u5217\u7A7A\u9593 C(A)\u3001\u5DE6\u96F6\u7A7A\u9593 N(A\u1D40) \u5728 \u211D\u1D50</li>
        <li>\u5169\u908A\u90FD\u662F\u300C\u4E92\u70BA\u6B63\u4EA4\u88DC\u300D\u3002</li>
      </ul>
      <p>
        SVD \u7684\u9B54\u6CD5\u5728\u65BC\u2014 \u5B83\u540C\u6642\u7D66\u4F60<strong>\u9019\u56DB\u500B\u5B50\u7A7A\u9593\u7684\u6B63\u4EA4\u57FA\u5E95</strong>\u3002
        \u4E0D\u662F\u300C\u96A8\u4FBF\u7684\u57FA\u5E95\u300D\uFF0C\u662F<strong>\u6B63\u4EA4</strong>\u7684\u3002
      </p>
    </app-prose-block>

    <app-prose-block title="SVD \u7D50\u69CB\u8207\u56DB\u500B\u5B50\u7A7A\u9593\u7684\u5C0D\u61C9">
      <p>\u8A2D A \u7684\u79E9\u70BA r\u3002SVD A = U\u03A3V\u1D40 \u7684\u7D71\u4E00\u8C61\u5982\u4E0B\uFF1A</p>

      <div class="big-table">
        <div class="bt-section">
          <div class="bt-title">V \u7684 n \u500B\u6B04\u662F \u211D\u207F \u7684\u6B63\u4EA4\u57FA\u5E95\uFF1A</div>
          <div class="bt-rows">
            <div class="bt-row row-color">
              <span class="bt-l">v\u2081, ..., v\u1D63</span>
              <span class="bt-r">\u884C\u7A7A\u9593 C(A\u1D40) \u7684\u6B63\u4EA4\u57FA\u5E95</span>
            </div>
            <div class="bt-row null-color">
              <span class="bt-l">v\u1D63\u208A\u2081, ..., v\u2099</span>
              <span class="bt-r">\u96F6\u7A7A\u9593 N(A) \u7684\u6B63\u4EA4\u57FA\u5E95</span>
            </div>
          </div>
        </div>

        <div class="bt-section">
          <div class="bt-title">U \u7684 m \u500B\u6B04\u662F \u211D\u1D50 \u7684\u6B63\u4EA4\u57FA\u5E95\uFF1A</div>
          <div class="bt-rows">
            <div class="bt-row col-color">
              <span class="bt-l">u\u2081, ..., u\u1D63</span>
              <span class="bt-r">\u5217\u7A7A\u9593 C(A) \u7684\u6B63\u4EA4\u57FA\u5E95</span>
            </div>
            <div class="bt-row leftnull-color">
              <span class="bt-l">u\u1D63\u208A\u2081, ..., u\u2098</span>
              <span class="bt-r">\u5DE6\u96F6\u7A7A\u9593 N(A\u1D40) \u7684\u6B63\u4EA4\u57FA\u5E95</span>
            </div>
          </div>
        </div>

        <div class="bt-section">
          <div class="bt-title">\u03A3 \u7684\u524D r \u500B\u5C0D\u89D2\u5143\u7D20\u662F\u975E\u96F6\u5947\u7570\u503C\uFF1A</div>
          <div class="sigma-display">
            \u03C3\u2081 \u2265 \u03C3\u2082 \u2265 ... \u2265 \u03C3\u1D63 > 0\uFF0C\u4E14 \u03C3\u1D63\u208A\u2081 = ... = 0
          </div>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="\u95DC\u9375\u95DC\u4FC2\uFF1AAv\u1D62 = \u03C3\u1D62 u\u1D62">
      <p class="big-formula">A v\u1D62 = \u03C3\u1D62 u\u1D62</p>
      <p>
        \u9019\u500B\u6700\u91CD\u8981\u7684\u95DC\u4FC2\u544A\u8A34\u6211\u5011\uFF1A
      </p>
      <ul>
        <li>\u5C0D\u65BC i \u2264 r\uFF1AA \u628A v\u1D62 \u62C9\u6210 \u03C3\u1D62 \u500D\u9577\u5EA6\uFF0C\u4E26\u8F49\u5230 u\u1D62 \u65B9\u5411\u3002\u9019\u662F<strong>\u884C\u7A7A\u9593\u5230\u5217\u7A7A\u9593\u7684\u96D9\u5C04</strong>\u3002</li>
        <li>\u5C0D\u65BC i > r\uFF1A\u03C3\u1D62 = 0\uFF0C\u6240\u4EE5 Av\u1D62 = 0\u3002\u9019\u4E9B v\u1D62 \u662F<strong>\u96F6\u7A7A\u9593\u7684\u57FA\u5E95</strong>\u3002</li>
      </ul>
      <p>\u63DB\u53E5\u8A71\u8AAA\uFF1A</p>
      <ul>
        <li>SVD \u7684 V \u628A \u211D\u207F \u62C6\u6210\u300C\u884C\u7A7A\u9593 + \u96F6\u7A7A\u9593\u300D\u7684\u6B63\u4EA4\u88DC\u5206\u89E3</li>
        <li>SVD \u7684 U \u628A \u211D\u1D50 \u62C6\u6210\u300C\u5217\u7A7A\u9593 + \u5DE6\u96F6\u7A7A\u9593\u300D\u7684\u6B63\u4EA4\u88DC\u5206\u89E3</li>
        <li>\u9019\u4E09\u500B\u4E8B\u5BE6\u6574\u5408\u8D77\u4F86 = <strong>\u7DDA\u6027\u4EE3\u6578\u57FA\u672C\u5B9A\u7406</strong></li>
      </ul>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u662F SVD \u70BA\u4EC0\u9EBC\u88AB\u53EB\u505A\u300C\u7DDA\u6027\u4EE3\u6578\u7684\u9802\u9EDE\u300D\u7684\u539F\u56E0\uFF1A
      </p>
      <ul>
        <li><strong>\u7B2C\u4E94\u7AE0</strong>\u8AAA\u300C\u9019\u56DB\u500B\u5B50\u7A7A\u9593\u5B58\u5728\u4E26\u4E92\u76F8\u6B63\u4EA4\u300D</li>
        <li><strong>\u8B5C\u5B9A\u7406</strong>\u8AAA\u300C\u5C0D\u7A31\u77E9\u9663\u6709\u6B63\u4EA4\u7684\u7279\u5FB5\u5411\u91CF\u300D</li>
        <li><strong>SVD</strong>\u8AAA\u300C\u4EFB\u4F55\u77E9\u9663\u90FD\u540C\u6642\u6709\u9019\u56DB\u500B\u5B50\u7A7A\u9593\u7684\u6B63\u4EA4\u57FA\u5E95\uFF0C\u4E26\u4E14\u4E92\u76F8\u96D9\u5C04\u300D</li>
      </ul>
      <p>
        \u4E0B\u4E00\u7Bc0\u770B\u7B2C\u4E00\u500B\u91CD\u8981\u7684\u61C9\u7528\uFF1A<strong>\u4F4E\u79E9\u8FD1\u4F3C</strong>\u3002SVD \u544A\u8A34\u6211\u5011\u300C\u8B93\u4E00\u500B\u77E9\u9663\u6700\u4F73\u5730\u8FD1\u4F3C\u300D\u600E\u9EBC\u505A\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .big-formula { text-align: center; font-size: 28px; font-weight: 700; color: var(--accent);
      padding: 20px; background: var(--accent-10); border-radius: 10px; margin: 14px 0;
      font-family: 'JetBrains Mono', monospace; }

    .big-table { display: flex; flex-direction: column; gap: 14px; padding: 14px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .bt-section { display: flex; flex-direction: column; gap: 8px; }
    .bt-title { font-size: 13px; font-weight: 700; color: var(--text); }
    .bt-rows { display: flex; flex-direction: column; gap: 4px; }
    .bt-row { display: grid; grid-template-columns: 130px 1fr; padding: 6px 12px;
      border-radius: 6px; font-size: 12px; }
    .bt-l { font-family: 'Noto Sans Math', serif; font-weight: 700; }
    .bt-r { color: var(--text); }
    .bt-row.row-color { background: rgba(191, 158, 147, 0.15); }
    .bt-row.row-color .bt-l { color: var(--v0); }
    .bt-row.null-color { background: rgba(160, 90, 90, 0.1); }
    .bt-row.null-color .bt-l { color: #a05a5a; }
    .bt-row.col-color { background: rgba(110, 138, 168, 0.15); }
    .bt-row.col-color .bt-l { color: #6e8aa8; }
    .bt-row.leftnull-color { background: rgba(196, 160, 80, 0.1); }
    .bt-row.leftnull-color .bt-l { color: #c4a050; }

    .sigma-display { padding: 10px 14px; border-radius: 6px; background: var(--accent-10);
      font-size: 14px; color: var(--accent); text-align: center; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepSvdSubspacesComponent {}
