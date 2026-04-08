import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-gram-schmidt',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Gram\u2013Schmidt \u6B63\u4EA4\u5316" subtitle="\u00A73.6">
      <p>
        \u7D66\u4F60\u4EFB\u610F\u4E00\u7D44\u7DDA\u6027\u7368\u7ACB\u7684\u5411\u91CF v\u2081, v\u2082, ...\uFF0C
        <strong>Gram\u2013Schmidt</strong> \u662F\u4E00\u500B\u6B65\u9A5F\uFF0C\u80FD\u628A\u5B83\u5011\u8B8A\u6210\u4E00\u7D44\u6B63\u4EA4\u57FA\u5E95\u3002
      </p>
      <p>\u4E8C\u7DAD\u7684\u624B\u7E8C\uFF1A</p>
      <ul>
        <li><strong>\u6B65\u9A5F 1</strong>\uFF1A\u7559\u4E0B v\u2081\u3002\u4EE4 u\u2081 = v\u2081\u3002</li>
        <li><strong>\u6B65\u9A5F 2</strong>\uFF1A\u628A v\u2082 \u600E\u9EBC\u8B8A\u6210\u8DDF u\u2081 \u6B63\u4EA4\uFF1F<br/>
          \u300C\u6276\u6389\u300D v\u2082 \u88E1\u8DDF u\u2081 \u540C\u65B9\u5411\u7684\u90E8\u5206\uFF08\u5C31\u662F\u6295\u5F71\uFF09\u3002</li>
        <li><strong>\u516C\u5F0F</strong>\uFF1Au\u2082 = v\u2082 \u2212 proj\u1D64\u2081 v\u2082</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 v\u2082\uFF0C\u770B Gram\u2013Schmidt \u600E\u9EBC\u628A\u5B83\u8B8A\u6210\u8DDF u\u2081 \u6B63\u4EA4\u7684 u\u2082">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- u₁ = v₁ (kept as-is) -->
          <line x1="0" y1="0" [attr.x2]="v1x * 25" [attr.y2]="-v1y * 25"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-gs1)" />
          <text [attr.x]="v1x * 25 + 8" [attr.y]="-v1y * 25 - 4" class="vec-label" style="fill: var(--v0)">u\u2081 = v\u2081</text>

          <!-- v₂ original -->
          <line x1="0" y1="0" [attr.x2]="v2x() * 25" [attr.y2]="-v2y() * 25"
            stroke="var(--v1)" stroke-width="2" stroke-dasharray="3 3" opacity="0.7" marker-end="url(#tip-gs2)" />
          <text [attr.x]="v2x() * 25 + 8" [attr.y]="-v2y() * 25 - 4" class="vec-label" style="fill: var(--v1); opacity: 0.7">v\u2082</text>

          <!-- proj_u1 v2 -->
          <line x1="0" y1="0" [attr.x2]="projX() * 25" [attr.y2]="-projY() * 25"
            stroke="var(--v0)" stroke-width="2" opacity="0.5" />
          <text [attr.x]="projX() * 25" [attr.y]="-projY() * 25 + 18" class="vec-label small" style="fill: var(--v0); opacity: 0.7">proj</text>

          <!-- u₂ = v₂ − proj (drawn from origin) -->
          <line x1="0" y1="0" [attr.x2]="u2x() * 25" [attr.y2]="-u2y() * 25"
            stroke="#5a8a5a" stroke-width="3" marker-end="url(#tip-gs3)" />
          <text [attr.x]="u2x() * 25 + 8" [attr.y]="-u2y() * 25 - 4" class="vec-label" style="fill: #5a8a5a">u\u2082</text>

          <!-- Connection from proj tip to v2 tip (showing the subtraction) -->
          <line [attr.x1]="projX() * 25" [attr.y1]="-projY() * 25"
            [attr.x2]="v2x() * 25" [attr.y2]="-v2y() * 25"
            stroke="#5a8a5a" stroke-width="2" stroke-dasharray="3 3" opacity="0.5" />

          <defs>
            <marker id="tip-gs1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-gs2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
            <marker id="tip-gs3" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="#5a8a5a" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="sliders">
        <div class="sl"><span class="sl-lab">v\u2082\u2093</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="v2x()" (input)="v2x.set(+$any($event).target.value)" />
          <span class="sl-val">{{ v2x() }}</span></div>
        <div class="sl"><span class="sl-lab">v\u2082\u1D67</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="v2y()" (input)="v2y.set(+$any($event).target.value)" />
          <span class="sl-val">{{ v2y() }}</span></div>
      </div>

      <div class="steps">
        <div class="st">
          <span class="st-num">1</span>
          <span>u\u2081 = v\u2081 = ({{ v1x }}, {{ v1y }})</span>
        </div>
        <div class="st">
          <span class="st-num">2</span>
          <span>proj = (v\u2081\u00B7v\u2082 / v\u2081\u00B7v\u2081) v\u2081 = ({{ projX().toFixed(2) }}, {{ projY().toFixed(2) }})</span>
        </div>
        <div class="st">
          <span class="st-num">3</span>
          <span>u\u2082 = v\u2082 \u2212 proj = (<strong>{{ u2x().toFixed(2) }}</strong>, <strong>{{ u2y().toFixed(2) }}</strong>)</span>
        </div>
        <div class="check">\u9A57\u8B49\uFF1Au\u2081 \u00B7 u\u2082 = {{ uDot().toFixed(3) }} \u2713</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4E0D\u7BA1 v\u2082 \u4E00\u958B\u59CB\u591A\u6B6A\uFF0CGram\u2013Schmidt \u90FD\u80FD\u8B93 u\u2082 \u8DDF u\u2081 \u6B63\u4EA4\u3002
        \u9019\u5C31\u662F\u300C\u6276\u6389\u91CD\u8907\u90E8\u5206\u300D\u7684\u9748\u9B42\u3002
      </p>
      <p>
        n \u7DAD\u7684\u624B\u7E8C\u4E5F\u4E00\u6A23\uFF1A\u6BCF\u6B21\u52A0\u4E00\u500B\u65B0\u5411\u91CF\uFF0C\u5C31\u6276\u6389\u5B83\u88E1\u8DDF\u4E4B\u524D\u6240\u6709 u\u1D62 \u540C\u65B9\u5411\u7684\u90E8\u5206\u3002
        \u6700\u5F8C\u5728\u628A\u6BCF\u500B u\u1D62 \u9664\u4EE5\u81EA\u5DF1\u7684\u9577\u5EA6\uFF0C\u5C31\u5F97\u5230\u6B63\u4EA4\u57FA\u5E95\u3002
      </p>
      <span class="hint">
        Gram\u2013Schmidt \u662F\u8B93\u4EFB\u4F55\u300C\u4E81\u96DC\u300D\u7684\u57FA\u5E95\u8B8A\u6210\u300C\u6F02\u4EAE\u300D\u7684\u6B63\u4EA4\u57FA\u5E95\u7684\u6F14\u7B97\u6CD5\u3002
        \u4E0B\u4E00\u7AE0\u770B\u5230\u300C\u89E3\u65B9\u7A0B\u300D\u6642\u6703\u518D\u9AD4\u6703\u5230\u70BA\u4EC0\u9EBC\u300C\u6F02\u4EAE\u7684\u57FA\u5E95\u300D\u9019\u9EBC\u91CD\u8981\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .vec-label { font-size: 12px; font-weight: 700; font-family: 'Noto Sans Math', serif;
      &.small { font-size: 9px; } }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; min-width: 32px; color: var(--v1); font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .steps { padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .st { display: flex; gap: 10px; align-items: flex-start; padding: 4px 0;
      font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text); line-height: 1.6; }
    .st-num { display: flex; align-items: center; justify-content: center;
      width: 18px; height: 18px; border-radius: 50%; background: var(--accent); color: white;
      font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
    .st strong { color: #5a8a5a; font-size: 13px; }
    .check { margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border);
      font-size: 12px; color: #5a8a5a; font-family: 'JetBrains Mono', monospace; text-align: center; }
  `,
})
export class StepGramSchmidtComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // v₁ is fixed
  readonly v1x = 3;
  readonly v1y = 1;
  private readonly v1DotV1 = this.v1x * this.v1x + this.v1y * this.v1y;

  // v₂ is interactive
  readonly v2x = signal(1);
  readonly v2y = signal(2);

  // proj_u1 v₂
  private readonly v1DotV2 = computed(() => this.v1x * this.v2x() + this.v1y * this.v2y());
  readonly projX = computed(() => (this.v1DotV2() / this.v1DotV1) * this.v1x);
  readonly projY = computed(() => (this.v1DotV2() / this.v1DotV1) * this.v1y);

  // u₂ = v₂ − proj
  readonly u2x = computed(() => this.v2x() - this.projX());
  readonly u2y = computed(() => this.v2y() - this.projY());

  // Verification
  readonly uDot = computed(() => this.v1x * this.u2x() + this.v1y * this.u2y());
}
