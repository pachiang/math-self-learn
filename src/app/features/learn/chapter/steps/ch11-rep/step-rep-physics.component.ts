import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-rep-physics',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u8868\u793A\u8AD6\u5728\u7269\u7406\u5316\u5B78\u4E2D\u7684\u61C9\u7528" subtitle="\u00A711.4">
      <p>\u8868\u793A\u8AD6\u4E0D\u662F\u7D14\u6578\u5B78\u7684\u904A\u6232 \u2014 \u5B83\u662F\u73FE\u4EE3\u7269\u7406\u548C\u5316\u5B78\u7684<strong>\u6838\u5FC3\u5DE5\u5177</strong>\u3002</p>
    </app-prose-block>

    <app-challenge-card prompt="\u56DB\u500B\u9818\u57DF\uFF0C\u540C\u4E00\u5957\u6578\u5B78">
      <div class="app-cards">
        <!-- Quantum mechanics -->
        <div class="app-card">
          <div class="app-header">
            <svg viewBox="0 0 48 48" class="app-icon">
              <circle cx="24" cy="24" r="3" fill="var(--accent)" />
              <ellipse cx="24" cy="24" rx="20" ry="8" fill="none" stroke="var(--v1)" stroke-width="1.5" />
              <ellipse cx="24" cy="24" rx="20" ry="8" fill="none" stroke="var(--v0)" stroke-width="1.5" transform="rotate(60 24 24)" />
              <ellipse cx="24" cy="24" rx="20" ry="8" fill="none" stroke="var(--v2)" stroke-width="1.5" transform="rotate(120 24 24)" />
            </svg>
            <div class="app-title">\u91CF\u5B50\u529B\u5B78</div>
          </div>
          <div class="app-body">
            <p>\u5C0D\u7A31\u7FA4\u7684\u4E0D\u53EF\u7D04\u8868\u793A = \u7C92\u5B50\u7684\u91CF\u5B50\u6578</p>
            <div class="app-example">
              <div class="ae-row"><span class="ae-l">SO(3) \u8868\u793A</span><span class="ae-r">\u89D2\u52D5\u91CF l = 0, 1, 2, ...</span></div>
              <div class="ae-row"><span class="ae-l">\u7DAD\u5EA6 2l+1</span><span class="ae-r">s \u8ECC\u57DF(1), p(3), d(5), f(7)</span></div>
            </div>
          </div>
        </div>

        <!-- Chemistry -->
        <div class="app-card">
          <div class="app-header">
            <svg viewBox="0 0 48 48" class="app-icon">
              <circle cx="24" cy="14" r="5" fill="var(--v0)" opacity="0.7" />
              <circle cx="14" cy="34" r="5" fill="var(--v1)" opacity="0.7" />
              <circle cx="34" cy="34" r="5" fill="var(--v1)" opacity="0.7" />
              <line x1="24" y1="19" x2="14" y2="29" stroke="var(--text-muted)" stroke-width="1.5" />
              <line x1="24" y1="19" x2="34" y2="29" stroke="var(--text-muted)" stroke-width="1.5" />
            </svg>
            <div class="app-title">\u5316\u5B78\uFF08\u5206\u5B50\u5C0D\u7A31\uFF09</div>
          </div>
          <div class="app-body">
            <p>\u5206\u5B50\u7684\u9EDE\u7FA4\u6C7A\u5B9A\u4E86\u5206\u5B50\u8ECC\u57DF\u7684\u5C0D\u7A31\u6027</p>
            <div class="app-example">
              <div class="ae-row"><span class="ae-l">H\u2082O</span><span class="ae-r">\u9EDE\u7FA4 C\u2082v\uFF084 \u500B\u5143\u7D20\uFF09</span></div>
              <div class="ae-row"><span class="ae-l">NH\u2083</span><span class="ae-r">\u9EDE\u7FA4 C\u2083v = D\u2083\uFF086 \u500B\u5143\u7D20\uFF09</span></div>
              <div class="ae-row"><span class="ae-l">\u7279\u5FB5\u6A19\u8868</span><span class="ae-r">\u9810\u6E2C\u54EA\u4E9B\u5149\u8B5C\u8E8D\u9077\u300C\u5141\u8A31\u300D</span></div>
            </div>
          </div>
        </div>

        <!-- Particle physics -->
        <div class="app-card">
          <div class="app-header">
            <svg viewBox="0 0 48 48" class="app-icon">
              <polygon points="24,6 42,16 42,36 24,46 6,36 6,16" fill="none" stroke="var(--v4)" stroke-width="1.5" />
              <circle cx="24" cy="6" r="3" fill="var(--v0)" />
              <circle cx="42" cy="16" r="3" fill="var(--v1)" />
              <circle cx="42" cy="36" r="3" fill="var(--v2)" />
              <circle cx="24" cy="46" r="3" fill="var(--v3)" />
              <circle cx="6" cy="36" r="3" fill="var(--v4)" />
              <circle cx="6" cy="16" r="3" fill="var(--v6)" />
            </svg>
            <div class="app-title">\u7C92\u5B50\u7269\u7406\uFF08\u516B\u91CD\u9053\uFF09</div>
          </div>
          <div class="app-body">
            <p>SU(3) \u7684\u8868\u793A\u5206\u985E\u4E86\u57FA\u672C\u7C92\u5B50</p>
            <div class="app-example">
              <div class="ae-row"><span class="ae-l">3 \u7DAD\u8868\u793A</span><span class="ae-r">\u4E09\u7A2E\u5938\u514B\uFF08u, d, s\uFF09</span></div>
              <div class="ae-row"><span class="ae-l">8 \u7DAD\u8868\u793A</span><span class="ae-r">\u516B\u91CD\u9053\uFF08\u4ECB\u5B50\u5206\u985E\uFF09</span></div>
              <div class="ae-row"><span class="ae-l">\u9810\u6E2C</span><span class="ae-r">\u03A9\u207B \u7C92\u5B50\u7684\u5B58\u5728\uFF081964\u5E74\u8B49\u5BE6\uFF09</span></div>
            </div>
          </div>
        </div>

        <!-- Signal processing -->
        <div class="app-card">
          <div class="app-header">
            <svg viewBox="0 0 48 48" class="app-icon">
              <path d="M 4 24 Q 10 8, 16 24 Q 22 40, 28 24 Q 34 8, 40 24 Q 43 32, 46 24"
                fill="none" stroke="var(--v3)" stroke-width="2" />
              <line x1="4" y1="24" x2="46" y2="24" stroke="var(--border)" stroke-width="0.5" />
            </svg>
            <div class="app-title">\u8A0A\u865F\u8655\u7406</div>
          </div>
          <div class="app-body">
            <p>\u5085\u7ACB\u8449\u8B8A\u63DB = Z\u2099 \u7684\u8868\u793A\u8AD6</p>
            <div class="app-example">
              <div class="ae-row"><span class="ae-l">DFT \u77E9\u9663</span><span class="ae-r">= Z\u2099 \u7684\u7279\u5FB5\u6A19\u8868</span></div>
              <div class="ae-row"><span class="ae-l">\u983B\u8B5C\u5206\u6790</span><span class="ae-r">= \u8868\u793A\u7684\u5206\u89E3</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="unifying">
        <strong>\u540C\u4E00\u5957\u6578\u5B78</strong>\uFF1A\u4E0D\u7BA1\u662F\u539F\u5B50\u8ECC\u57DF\u3001\u5938\u514B\u5206\u985E\u3001\u5206\u5B50\u632F\u52D5\u3001\u9084\u662F\u97F3\u8A0A\u8655\u7406\uFF0C\u80CC\u5F8C\u90FD\u662F\u300C\u7FA4\u7684\u8868\u793A\u300D\u3002
      </div>
    </app-challenge-card>
  `,
  styles: `
    .app-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; @media(max-width:600px){grid-template-columns:1fr;} }
    .app-card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg); overflow: hidden; }
    .app-header { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .app-icon { width: 42px; height: 42px; flex-shrink: 0; }
    .app-title { font-size: 14px; font-weight: 700; color: var(--text); }
    .app-body { padding: 12px 14px; }
    .app-body p { margin: 0 0 8px; font-size: 13px; color: var(--text-secondary); }
    .app-example { display: flex; flex-direction: column; gap: 3px; }
    .ae-row { display: flex; gap: 8px; font-size: 12px; padding: 3px 0; }
    .ae-l { font-weight: 600; color: var(--accent); min-width: 72px; font-family: 'JetBrains Mono', monospace; }
    .ae-r { color: var(--text-secondary); }

    .unifying { padding: 14px 18px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent-30);
      font-size: 14px; color: var(--text-secondary); text-align: center; line-height: 1.6; strong { color: var(--text); } }
  `,
})
export class StepRepPhysicsComponent {}
