import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-backprop',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u53CD\u5411\u50B3\u64AD = \u9379\u5F0F\u6CD5\u5247\u7684\u77E9\u9663\u5F62\u5F0F" subtitle="\u00A713.7">
      <p>
        \u8A13\u7DF4\u795E\u7D93\u7DB2\u8DEF = \u300C\u8B93\u640D\u5931\u51FD\u6578\u6700\u5C0F\u5316\u300D\u3002\u9019\u8981\u7528<strong>\u68AF\u5EA6\u4E0B\u964D</strong>\uFF1A
      </p>
      <p class="formula">W \u2190 W \u2212 \u03B1 \u00B7 \u2207L</p>
      <p>
        \u95DC\u9375\u662F\u8A08\u7B97 \u2207L \u2014 \u640D\u5931\u5C0D\u6BCF\u500B\u53C3\u6578\u7684\u504F\u5C0E\u6578\u3002
      </p>
      <p>
        \u4F46\u795E\u7D93\u7DB2\u8DEF\u662F\u4E00\u9023\u4E32\u51FD\u6578\u7684\u5408\u6210\uFF1A
      </p>
      <p class="formula">L = loss(\u03C3(W\u2082 \u00B7 ReLU(W\u2081 \u00B7 x + b\u2081) + b\u2082))</p>
      <p>
        \u8981\u8A08 dL/dW\u2081 \u600E\u9EBC\u8FA6\uFF1F\u7528<strong>\u9379\u5F0F\u6CD5\u5247</strong>\u4E00\u5C64\u4E00\u5C64\u5F80\u56DE\u63A8\u3002\u9019\u500B\u300C\u5F80\u56DE\u63A8\u300D\u5C31\u662F\u53CD\u5411\u50B3\u64AD\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u770B\u53CD\u5411\u50B3\u64AD\u600E\u9EBC\u900F\u904E\u4E00\u500B\u8A08\u7B97\u5716\u300C\u6D41\u300D\u56DE\u53BB">
      <div class="graph-block">
        <svg viewBox="0 0 600 280" class="graph-svg">
          <!-- Forward arrows (orange) -->
          <defs>
            <marker id="fw-tip" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="#c8983b" />
            </marker>
            <marker id="bw-tip" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="#6e8aa8" />
            </marker>
          </defs>

          <!-- Nodes -->
          <g class="node-x">
            <rect x="10" y="120" width="50" height="40" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)" stroke-width="1.5" />
            <text x="35" y="140" class="node-name">x</text>
            <text x="35" y="155" class="node-val">\u8F38\u5165</text>
          </g>

          <g class="node-w1">
            <rect x="100" y="40" width="60" height="40" rx="6" fill="rgba(191, 158, 147, 0.18)" stroke="var(--v0)" stroke-width="1.5" />
            <text x="130" y="60" class="node-name">W\u2081</text>
            <text x="130" y="75" class="node-val">\u53C3\u6578</text>
          </g>

          <g class="node-z1">
            <rect x="190" y="120" width="60" height="40" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)" stroke-width="1.5" />
            <text x="220" y="140" class="node-name">z\u2081</text>
            <text x="220" y="155" class="node-val">= W\u2081 x</text>
          </g>

          <g class="node-h">
            <rect x="280" y="120" width="60" height="40" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)" stroke-width="1.5" />
            <text x="310" y="140" class="node-name">h</text>
            <text x="310" y="155" class="node-val">= ReLU(z\u2081)</text>
          </g>

          <g class="node-w2">
            <rect x="370" y="40" width="60" height="40" rx="6" fill="rgba(141, 163, 181, 0.18)" stroke="var(--v1)" stroke-width="1.5" />
            <text x="400" y="60" class="node-name">W\u2082</text>
            <text x="400" y="75" class="node-val">\u53C3\u6578</text>
          </g>

          <g class="node-z2">
            <rect x="370" y="120" width="60" height="40" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)" stroke-width="1.5" />
            <text x="400" y="140" class="node-name">z\u2082</text>
            <text x="400" y="155" class="node-val">= W\u2082 h</text>
          </g>

          <g class="node-yhat">
            <rect x="460" y="120" width="60" height="40" rx="6" fill="var(--accent-10)" stroke="var(--accent)" stroke-width="1.5" />
            <text x="490" y="140" class="node-name">\u0177</text>
            <text x="490" y="155" class="node-val">= \u03C3(z\u2082)</text>
          </g>

          <g class="node-l">
            <rect x="550" y="120" width="40" height="40" rx="6" fill="var(--accent-18)" stroke="var(--accent)" stroke-width="1.5" />
            <text x="570" y="140" class="node-name">L</text>
            <text x="570" y="155" class="node-val">\u640D\u5931</text>
          </g>

          <!-- Forward arrows -->
          <line x1="60" y1="140" x2="190" y2="140" stroke="#c8983b" stroke-width="2" marker-end="url(#fw-tip)" />
          <line x1="160" y1="80" x2="220" y2="120" stroke="#c8983b" stroke-width="2" marker-end="url(#fw-tip)" />
          <line x1="250" y1="140" x2="280" y2="140" stroke="#c8983b" stroke-width="2" marker-end="url(#fw-tip)" />
          <line x1="340" y1="140" x2="370" y2="140" stroke="#c8983b" stroke-width="2" marker-end="url(#fw-tip)" />
          <line x1="430" y1="80" x2="430" y2="120" stroke="#c8983b" stroke-width="2" marker-end="url(#fw-tip)" />
          <line x1="430" y1="140" x2="460" y2="140" stroke="#c8983b" stroke-width="2" marker-end="url(#fw-tip)" />
          <line x1="520" y1="140" x2="550" y2="140" stroke="#c8983b" stroke-width="2" marker-end="url(#fw-tip)" />

          <!-- Backward arrows (blue) -->
          <line x1="550" y1="180" x2="525" y2="180" stroke="#6e8aa8" stroke-width="2" marker-end="url(#bw-tip)" />
          <line x1="460" y1="180" x2="435" y2="180" stroke="#6e8aa8" stroke-width="2" marker-end="url(#bw-tip)" />
          <line x1="430" y1="180" x2="430" y2="100" stroke="#6e8aa8" stroke-width="2" marker-end="url(#bw-tip)" />
          <line x1="370" y1="180" x2="345" y2="180" stroke="#6e8aa8" stroke-width="2" marker-end="url(#bw-tip)" />
          <line x1="280" y1="180" x2="255" y2="180" stroke="#6e8aa8" stroke-width="2" marker-end="url(#bw-tip)" />
          <line x1="220" y1="180" x2="160" y2="100" stroke="#6e8aa8" stroke-width="2" marker-end="url(#bw-tip)" />

          <!-- Labels -->
          <text x="300" y="20" class="label" style="fill: #c8983b">\u524D\u5411\u50B3\u64AD\uFF1A\u8A08\u7B97 \u0177 \u8DDF L</text>
          <text x="300" y="270" class="label" style="fill: #6e8aa8">\u53CD\u5411\u50B3\u64AD\uFF1A\u8A08\u7B97 dL/dW\u2081 \u8DDF dL/dW\u2082</text>
        </svg>
      </div>
    </app-challenge-card>

    <app-prose-block title="\u9379\u5F0F\u6CD5\u5247\u7684\u77E9\u9663\u5F62\u5F0F">
      <p>\u8B93\u6211\u5011\u5F9E\u53F3\u908A\u958B\u59CB\u5F80\u5DE6\u63A8\u3002\u8A2D\u5C0D\u4E8C\u5143\u5206\u985E\u4F7F\u7528\u4EA4\u53C9\u71B5\u640D\u5931\u3002</p>

      <div class="proof-step">
        <div class="ps-num">1</div>
        <div class="ps-body">
          \u5728 \u0177 \u9019\u88E1\uFF1A
          <div class="ps-formula">dL/d\u0177 = (\u0177 \u2212 y) / (\u0177(1\u2212\u0177))</div>
          \u4F46\u8DDF sigmoid + cross-entropy \u4E00\u8D77\u7C21\u5316\u70BA\uFF1A
          <div class="ps-formula">dL/dz\u2082 = \u0177 \u2212 y</div>
          \u9019\u662F\u4E00\u500B\u6F02\u4EAE\u7684\u7C21\u5316\u3002
        </div>
      </div>

      <div class="proof-step">
        <div class="ps-num">2</div>
        <div class="ps-body">
          z\u2082 = W\u2082 h\uFF0C\u5C0D W\u2082 \u504F\u5C0E\uFF1A
          <div class="ps-formula">dL/dW\u2082 = (dL/dz\u2082) h\u1D40 = (\u0177 \u2212 y) h\u1D40</div>
          \u770B\u8D77\u4F86\u662F<strong>\u5916\u7A4D</strong>\uFF1A\u4E00\u500B\u5217\u5411\u91CF \u00D7 \u4E00\u500B\u884C\u5411\u91CF\u3002
        </div>
      </div>

      <div class="proof-step">
        <div class="ps-num">3</div>
        <div class="ps-body">
          \u63A5\u8457 dL/dh\uFF1A
          <div class="ps-formula">dL/dh = W\u2082\u1D40 (dL/dz\u2082)</div>
          <strong>W\u2082 \u7684\u8F49\u7F6E</strong>\u51FA\u73FE\u4E86\uFF01\u9019\u662F\u53CD\u5411\u50B3\u64AD\u7684\u95DC\u9375 \u2014 \u68AF\u5EA6\u662F\u900F\u904E\u300C\u8F49\u7F6E\u300D\u900F\u904E\u7DB2\u8DEF\u300C\u6D41\u300D\u56DE\u53BB\u7684\u3002
        </div>
      </div>

      <div class="proof-step">
        <div class="ps-num">4</div>
        <div class="ps-body">
          ReLU \u662F\u9010\u9805\u7684\u3002\u53EA\u8981\u539F z\u2081 > 0 \u8A72\u9805\u4E26\u4E0D\u53D6 0\uFF1A
          <div class="ps-formula">dL/dz\u2081 = (dL/dh) \u2299 [z\u2081 > 0]</div>
          \u5176\u4E2D \u2299 \u662F\u9010\u9805\u4E58\u6CD5\u3002
        </div>
      </div>

      <div class="proof-step last">
        <div class="ps-num">5</div>
        <div class="ps-body">
          \u6700\u5F8C\uFF0C\u8DDF\u6B65\u9A5F 2 \u540C\u7406\uFF1A
          <div class="ps-formula">dL/dW\u2081 = (dL/dz\u2081) x\u1D40</div>
        </div>
      </div>
    </app-prose-block>

    <app-prose-block>
      <p>
        \u4F60\u770B\u5230\u4E86\u4EC0\u9EBC\uFF1F<strong>\u53CD\u5411\u50B3\u64AD = \u4E00\u9023\u4E32\u77E9\u9663\u8F49\u7F6E + \u9010\u9805\u4E58\u6CD5</strong>\u3002
      </p>
      <p>
        \u672C\u8CEA\u5C31\u662F\u9379\u5F0F\u6CD5\u5247\uFF1A\u5916\u5C64\u51FD\u6578\u7684\u504F\u5C0E\u4E58\u4E0A\u5167\u5C64\u51FD\u6578\u7684\u504F\u5C0E\u3002\u4F46\u5728\u4E0D\u5728\u8A0A\u5E0C\u660E\u4E0B\uFF0C\u9019\u500B\u75BC\u5BAE\u63DB\u6210\u300C\u4E58\u8F49\u7F6E\u77E9\u9663\u300D\u3002
      </p>
      <p>
        \u9019\u500B\u300C\u53CD\u5411\u50B3\u64AD\u300D\u662F 1986 \u5E74 Rumelhart, Hinton, Williams \u63D0\u51FA\u7684\u3002\u4ED6\u8B93\u300C\u8A13\u7DF4\u591A\u5C64\u795E\u7D93\u7DB2\u8DEF\u300D\u8B8A\u5F97\u5BE6\u969B\u53EF\u884C\uFF0C\u662F\u73FE\u4EE3\u6DF1\u5EA6\u5B78\u7FD2\u7684\u8D77\u9EDE\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u770B\u6700\u5F8C\u4E00\u500B\u4E3B\u984C\uFF1A\u77E9\u9663\u5206\u89E3\u5728\u63A8\u85A6\u7CFB\u7D71\u8DDF\u8A5E\u5D4C\u5165\u88E1\u7684\u61C9\u7528\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.7; }

    .graph-block { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 12px; }
    .graph-svg { width: 100%; max-width: 600px; display: block; margin: 0 auto; }
    .node-name { font-size: 14px; fill: var(--text); text-anchor: middle; font-weight: 700;
      font-family: 'Noto Sans Math', serif; pointer-events: none; }
    .node-val { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; pointer-events: none; }
    .label { font-size: 12px; text-anchor: middle; font-weight: 600; }

    .proof-step { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border);
      &.last { border-bottom: none; } }
    .ps-num { display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: white;
      font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .ps-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
    .ps-formula { padding: 8px 14px; margin: 6px 0; border-radius: 6px;
      background: var(--bg-surface); font-family: 'JetBrains Mono', monospace; font-size: 13px;
      color: var(--accent); text-align: center; }
  `,
})
export class StepBackpropComponent {}
