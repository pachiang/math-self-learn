import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-orthonormal-basis',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u6B63\u4EA4\u57FA\u5E95" subtitle="\u00A73.5">
      <p>
        \u4E00\u500B<strong>\u6B63\u4EA4\u57FA\u5E95</strong>\uFF08orthonormal basis\uFF09\u662F\u4E00\u7D44\u57FA\u5E95\u5411\u91CF\uFF0C\u6EFF\u8DB3\u5169\u500B\u689D\u4EF6\uFF1A
      </p>
      <ul>
        <li>\u5169\u5169\u6B63\u4EA4\uFF1Aê\u1D62 \u00B7 ê\u2C7C = 0\uFF08i \u2260 j\uFF09</li>
        <li>\u6BCF\u500B\u90FD\u662F\u55AE\u4F4D\u9577\u5EA6\uFF1A|ê\u1D62| = 1</li>
      </ul>
      <p>
        \u6A19\u6E96\u57FA\u5E95 {{ '{' }}ê\u2081, ê\u2082{{ '}' }} = {{ '{' }}(1,0), (0,1){{ '}' }} \u662F\u6700\u660E\u986F\u7684\u4F8B\u5B50\u3002
        \u4F46\u4EFB\u4F55\u300C\u65CB\u8F49\u904E\u7684\u6A19\u6E96\u57FA\u5E95\u300D\u4E5F\u662F\u6B63\u4EA4\u57FA\u5E95\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u8F49\u52D5\u89D2\u5EA6\uFF0C\u770B\u65CB\u8F49\u904E\u7684\u57FA\u5E95\u4ECD\u7136\u4FDD\u6301\u6B63\u4EA4">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Right-angle indicator at origin -->
          <rect x="0" y="-12" width="12" height="12" fill="none" stroke="#5a8a5a" stroke-width="1.5"
            [attr.transform]="'rotate(' + (-theta()) + ')'" />

          <!-- Standard basis (faded) for reference -->
          <line x1="0" y1="0" x2="50" y2="0" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="3 3" opacity="0.5" />
          <line x1="0" y1="0" x2="0" y2="-50" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="3 3" opacity="0.5" />

          <!-- New basis after rotation -->
          <line x1="0" y1="0" [attr.x2]="e1x() * 50" [attr.y2]="-e1y() * 50"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-onb1)" />
          <text [attr.x]="e1x() * 50 + 8" [attr.y]="-e1y() * 50 + 4" class="vec-label" style="fill: var(--v0)">ê'\u2081</text>

          <line x1="0" y1="0" [attr.x2]="e2x() * 50" [attr.y2]="-e2y() * 50"
            stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-onb2)" />
          <text [attr.x]="e2x() * 50 + 8" [attr.y]="-e2y() * 50 + 4" class="vec-label" style="fill: var(--v1)">ê'\u2082</text>

          <defs>
            <marker id="tip-onb1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-onb2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="theta-row">
        <span class="t-lab">\u8F49\u89D2 \u03B8 =</span>
        <input type="range" min="0" max="180" step="5" [value]="theta()" (input)="theta.set(+$any($event).target.value)" class="t-slider" />
        <span class="t-val">{{ theta() }}\u00B0</span>
      </div>

      <div class="check-grid">
        <div class="check-row">
          <span class="cl">\u00EA'\u2081 = ({{ e1x().toFixed(3) }}, {{ e1y().toFixed(3) }})</span>
          <span class="cv">|\u00EA'\u2081| = {{ Math.sqrt(e1x()**2 + e1y()**2).toFixed(3) }}</span>
        </div>
        <div class="check-row">
          <span class="cl">\u00EA'\u2082 = ({{ e2x().toFixed(3) }}, {{ e2y().toFixed(3) }})</span>
          <span class="cv">|\u00EA'\u2082| = {{ Math.sqrt(e2x()**2 + e2y()**2).toFixed(3) }}</span>
        </div>
        <div class="check-row big">
          <span class="cl">\u00EA'\u2081 \u00B7 \u00EA'\u2082</span>
          <span class="cv">= <strong>{{ (e1x() * e2x() + e1y() * e2y()).toFixed(3) }}</strong> \u2713</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4E0D\u7BA1\u8F49\u591A\u5C11\u5EA6\uFF0C\u9019\u5169\u500B\u5411\u91CF<strong>\u59CB\u7D42\u4FDD\u6301\u6B63\u4EA4</strong>\u4E14\u6BCF\u500B\u9577\u5EA6\u70BA 1\u3002
      </p>
      <p>
        \u70BA\u4EC0\u9EBC\u6B63\u4EA4\u57FA\u5E95\u9019\u9EBC\u91CD\u8981\uFF1F\u56E0\u70BA\u5728\u6B63\u4EA4\u57FA\u5E95\u4E0B\uFF0C\u4EFB\u4F55\u5411\u91CF v \u7684\u5750\u6A19\u8D85\u5BB9\u6613\u8A08\uFF1A
      </p>
      <p class="formula">v = (v\u00B7\u00EA'\u2081)\u00EA'\u2081 + (v\u00B7\u00EA'\u2082)\u00EA'\u2082</p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA\uFF0C<strong>v \u8DDF\u6BCF\u500B\u57FA\u5E95\u5411\u91CF\u505A\u9EDE\u7A4D\uFF0C\u5C31\u5F97\u5230\u9019\u500B\u5750\u6A19</strong>\u3002\u9019\u662F\u4E0D\u662F\u6B63\u4EA4\u57FA\u5E95\u7684\u5C0D\u624B\u8B8A\u63DB\uFF0C\u9700\u8981\u89E3\u8054\u7ACB\u65B9\u7A0B\u6216\u53CD\u77E9\u9663\uFF0C\u9EBB\u70E6\u591A\u4E86\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .vec-label { font-size: 13px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .theta-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 13px; font-weight: 700; color: var(--accent); }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 48px; text-align: right; }

    .check-grid { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .check-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.big { background: var(--accent-10); } }
    .cl, .cv { padding: 8px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace;
      color: var(--text); }
    .cl { color: var(--text-secondary); border-right: 1px solid var(--border); }
    .check-row.big strong { color: #5a8a5a; font-size: 14px; }
  `,
})
export class StepOrthonormalBasisComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly Math = Math;
  readonly theta = signal(30);

  readonly e1x = computed(() => Math.cos((this.theta() * Math.PI) / 180));
  readonly e1y = computed(() => Math.sin((this.theta() * Math.PI) / 180));
  readonly e2x = computed(() => -Math.sin((this.theta() * Math.PI) / 180));
  readonly e2y = computed(() => Math.cos((this.theta() * Math.PI) / 180));
}
