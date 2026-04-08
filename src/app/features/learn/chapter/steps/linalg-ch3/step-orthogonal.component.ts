import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-orthogonal',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u6B63\u4EA4\u5411\u91CF" subtitle="\u00A73.4">
      <p>
        \u5169\u500B\u5411\u91CF<strong>\u6B63\u4EA4</strong>\uFF08orthogonal\uFF09\u5C31\u662F\u8AAA\u5B83\u5011\u5782\u76F4\u3002
        \u5728\u9EDE\u7A4D\u8A9E\u8A00\u88E1\uFF0C\u9019\u500B\u689D\u4EF6\u8B8A\u5F97\u5F88\u7C21\u55AE\uFF1A
      </p>
      <p class="formula">v \u00B7 w = 0  \u27FA  v \u22A5 w</p>
      <p>
        \u9019\u662F\u9EDE\u7A4D\u6700\u91CD\u8981\u7684\u61C9\u7528\u3002\u300C\u662F\u5426\u5782\u76F4\u300D\u9019\u500B\u5E7E\u4F55\u95DC\u4FC2\uFF0C\u88AB\u7C21\u5316\u6210\u300C\u4E58\u4E00\u4E58\u52A0\u4E00\u52A0\u662F\u4E0D\u662F\u96F6\u300D\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u8ABF\u6574 w \u7684\u5750\u6A19\uFF0C\u8A66\u8457\u8B93\u5B83\u8DDF v \u6B63\u4EA4\uFF08v\u00B7w = 0\uFF09">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Right-angle indicator if orthogonal -->
          @if (isOrth()) {
            <rect x="-2" y="-12" width="12" height="12" fill="none" stroke="#5a8a5a" stroke-width="1.5"
              [attr.transform]="'rotate(' + vAngle() + ')'" />
          }

          <line x1="0" y1="0" [attr.x2]="vx * 25" [attr.y2]="-vy * 25"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-ov)" />
          <text [attr.x]="vx * 25 + 8" [attr.y]="-vy * 25 - 4" class="vec-label" style="fill: var(--v0)">v</text>

          <line x1="0" y1="0" [attr.x2]="wx() * 25" [attr.y2]="-wy() * 25"
            [attr.stroke]="isOrth() ? '#5a8a5a' : 'var(--v1)'" stroke-width="2.5" marker-end="url(#tip-ow)" />
          <text [attr.x]="wx() * 25 + 8" [attr.y]="-wy() * 25 - 4" class="vec-label"
            [attr.fill]="isOrth() ? '#5a8a5a' : 'var(--v1)'">w</text>

          <defs>
            <marker id="tip-ov" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-ow" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" [attr.fill]="isOrth() ? '#5a8a5a' : 'var(--v1)'" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="sliders">
        <div class="sl"><span class="sl-lab">w\u2093</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="wx()" (input)="wx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ wx() }}</span></div>
        <div class="sl"><span class="sl-lab">w\u1D67</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="wy()" (input)="wy.set(+$any($event).target.value)" />
          <span class="sl-val">{{ wy() }}</span></div>
      </div>

      <div class="dot-display" [class.orth]="isOrth()">
        <div>v = ({{ vx }}, {{ vy }}), w = ({{ wx() }}, {{ wy() }})</div>
        <div class="big">v \u00B7 w = {{ vx }}\u00D7{{ wx() }} + {{ vy }}\u00D7{{ wy() }} = <strong>{{ dot() }}</strong></div>
        @if (isOrth()) {
          <div class="ok">\u2713 v \u22A5 w \uFF08\u6B63\u4EA4\uFF01\uFF09</div>
        } @else {
          <div class="not">\u4E0D\u6B63\u4EA4 \u2014 \u8A66\u8457\u8B93\u9EDE\u7A4D = 0</div>
        }
      </div>

      <!-- Hint -->
      <div class="hint-box">
        \u63D0\u793A\uFF1Av = ({{ vx }}, {{ vy }})\u3002\u8981\u8B93 v\u00B7w = 0\uFF0C\u53EF\u4EE5\u9078 w = ({{ -vy }}, {{ vx }}) \u6216 ({{ vy }}, {{ -vx }})\u3002
        \uFF08\u4E00\u822C\u7684\u898F\u5247\uFF1A\u628A v \u7684\u5169\u500B\u5750\u6A19\u4EA4\u63DB\u4E26\u628A\u5176\u4E2D\u4E00\u500B\u8B8A\u865F\u3002\uFF09
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u6B63\u4EA4\u662F\u7DDA\u6027\u4EE3\u6578\u88E1\u6700\u53D7\u6B61\u8FCE\u7684\u5C0D\u79F0\u6027\u4E4B\u4E00\u3002\u70BA\u4EC0\u9EBC\uFF1F
      </p>
      <ul>
        <li>\u6B63\u4EA4\u7684\u5411\u91CF\u300C\u4E0D\u4E92\u76F8\u5F71\u97FF\u300D\u2014\u4E00\u500B\u662F\u53E6\u4E00\u500B\u7684\u300C\u96F6\u90E8\u5206\u300D</li>
        <li>\u8A08\u7B97\u53D8\u5F97\u7C21\u55AE\uFF1A\u6295\u5F71\u3001\u9577\u5EA6\u3001\u5750\u6A19\u90FD\u53EF\u4EE5\u72E8\u7ACB\u8655\u7406</li>
        <li>\u4E0B\u4E00\u7BC0\u6703\u770B\u5230\uFF1A\u7531\u6B63\u4EA4\u5411\u91CF\u7D44\u6210\u7684\u300C\u6B63\u4EA4\u57FA\u5E95\u300D\u662F\u8B93\u8A08\u7B97\u8B8A\u7C21\u55AE\u7684\u53E6\u4E00\u500B\u95DC\u9375</li>
      </ul>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 0; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .vec-label { font-size: 13px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; min-width: 28px; color: var(--v1); font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .dot-display { padding: 14px 18px; border-radius: 10px; border: 2px solid var(--border);
      background: var(--bg-surface); font-family: 'JetBrains Mono', monospace; font-size: 13px; margin-bottom: 10px;
      &.orth { border-color: #5a8a5a; background: rgba(90, 138, 90, 0.06); } }
    .dot-display > div { color: var(--text-secondary); }
    .dot-display .big { font-size: 15px; color: var(--text); margin: 4px 0; }
    .dot-display .big strong { font-size: 18px; color: var(--accent); .orth & { color: #5a8a5a; } }
    .ok { color: #5a8a5a; font-size: 14px; font-weight: 700; }
    .not { color: var(--text-muted); font-size: 12px; }

    .hint-box { padding: 10px 14px; border-radius: 8px; background: var(--accent-10);
      font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
  `,
})
export class StepOrthogonalComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly vx = 3;
  readonly vy = 1;
  readonly wx = signal(0);
  readonly wy = signal(2);

  readonly dot = computed(() => this.vx * this.wx() + this.vy * this.wy());
  readonly isOrth = computed(() => Math.abs(this.dot()) < 0.001);
  readonly vAngle = computed(() => -Math.atan2(this.vy, this.vx) * (180 / Math.PI));
}
