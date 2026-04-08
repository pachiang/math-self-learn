import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-null-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u96F6\u7A7A\u9593 N(A)" subtitle="\u00A75.3">
      <p>
        \u77E9\u9663 A \u7684<strong>\u96F6\u7A7A\u9593</strong>\uFF08null space\uFF09\u8A18\u4F5C N(A)\uFF0C
        \u5B9A\u7FA9\u662F\u300C\u6240\u6709\u88AB A \u9001\u5230\u96F6\u7684\u5411\u91CF\u300D\uFF1A
      </p>
      <p class="formula">N(A) = {{ '{' }} x : Ax = 0 {{ '}' }}</p>
      <p>
        \u96F6\u7A7A\u9593\u662F\u4E00\u500B\u5B50\u7A7A\u9593\uFF08\u4E0A\u4E00\u7BC0\u90A3\u4E09\u500B\u689D\u4EF6\u90FD\u7B97\u7684\u51FA\u4F86\uFF09\u3002
      </p>
      <ul>
        <li><strong>A \u53EF\u9006</strong> (det \u2260 0)\uFF1AN(A) = {{ '{' }}0{{ '}' }}\uFF0C\u53EA\u6709\u96F6\u5411\u91CF\u88AB\u9001\u5230\u96F6</li>
        <li><strong>A \u5947\u7570</strong> (det = 0)\uFF1AN(A) \u662F\u4E00\u689D\uFF08\u6216\u4E00\u500B\u5E73\u9762\uFF09\u904E\u539F\u9EDE\u7684\u7DDA</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 c \u6ED1\u6876\u8B8A\u5316\u77E9\u9663\u7B2C\u4E8C\u6B04\uFF0C\u770B\u96F6\u7A7A\u9593\u600E\u9EBC\u8B8A\u5316">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Null space line (only when singular) -->
          @if (isSingular()) {
            <line [attr.x1]="-nullDir().x * 130" [attr.y1]="nullDir().y * 130"
              [attr.x2]="nullDir().x * 130" [attr.y2]="-nullDir().y * 130"
              stroke="#a05a5a" stroke-width="6" opacity="0.35" />
            <text x="0" y="-115" class="ns-label">N(A) = \u9019\u689D\u7DDA</text>
          }

          <!-- Column vectors -->
          <line x1="0" y1="0" x2="50" y2="-25"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-ns1)" />
          <text x="58" y="-29" class="lab" style="fill: var(--v0)">\u6B04\u2081</text>

          <line x1="0" y1="0" [attr.x2]="c() * 25" [attr.y2]="-25"
            stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-ns2)" />
          <text [attr.x]="c() * 25 + 8" [attr.y]="-25 + 14" class="lab" style="fill: var(--v1)">\u6B04\u2082</text>

          <!-- Origin -->
          <circle cx="0" cy="0" r="3" fill="var(--text)" />

          <defs>
            <marker id="tip-ns1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-ns2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="theta-row">
        <span class="t-lab">c =</span>
        <input type="range" min="0.5" max="3" step="0.25" [value]="c()" (input)="c.set(+$any($event).target.value)" class="t-slider" />
        <span class="t-val">{{ c() }}</span>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[2, {{ c() }}], [1, 1]]</span>
        </div>
        <div class="info-row">
          <span class="il">det(A)</span>
          <span class="iv">{{ det().toFixed(3) }}</span>
        </div>
        <div class="info-row big" [class.zero]="isSingular()">
          <span class="il">N(A)</span>
          <span class="iv">
            @if (isSingular()) {
              \u4E00\u689D\u7DDA\uFF1Aspan(({{ nullDir().x.toFixed(2) }}, {{ nullDir().y.toFixed(2) }}))
            } @else {
              \u53EA\u6709 {{ '{' }}0{{ '}' }}
            }
          </span>
        </div>
      </div>

      <div class="explain">
        @if (isSingular()) {
          \u7B2C\u4E8C\u6B04\u662F\u7B2C\u4E00\u6B04\u7684 {{ (c() / 2).toFixed(2) }} \u500D \u2192 \u5169\u500B\u6B04\u5171\u7DDA \u2192 A \u4E0D\u53EF\u9006 \u2192 \u96F6\u7A7A\u9593\u662F\u4E00\u689D\u7DDA\u3002
          \u9019\u689D\u7DDA\u4E0A\u7684\u4EFB\u4F55\u9EDE\u90FD\u88AB A \u5854\u9677\u6210\u96F6\uFF01
        } @else {
          \u7B2C\u4E00\u6B04 \u8DDF \u7B2C\u4E8C\u6B04 \u4E0D\u5171\u7DDA \u2192 A \u53EF\u9006 \u2192 N(A) \u53EA\u6709 0\u3002
          \u62D6\u6ED1\u6876\u8B93 c = 2\uFF0C\u5169\u500B\u6B04\u6703\u91CD\u5408\u3002
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u96F6\u7A7A\u9593\u8A2A\u8AAA A \u300C<strong>\u934A\u6389\u4E86\u54EA\u4E9B\u7DAD\u5EA6</strong>\u300D\u3002
        N(A) \u8D8A\u5927\uFF0CA \u8D8A\u300C\u640D\u5931\u8CC7\u8A0A\u300D\u3002
      </p>
      <p>
        \u9019\u8DDF Ch4 \u00A74.5 \u770B\u904E\u7684\u300C\u89E3\u7A7A\u9593\u300D\u662F\u540C\u4E00\u4EF6\u4E8B \u2014 Ax = b \u7684\u89E3 = \u7279\u89E3 + N(A)\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px; }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .lab { font-size: 11px; font-weight: 700; font-family: 'Noto Sans Math', serif; }
    .ns-label { font-size: 10px; fill: #a05a5a; font-weight: 700; text-anchor: middle; font-family: 'Noto Sans Math', serif; }

    .theta-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.big { background: var(--accent-10); }
      &.big.zero { background: rgba(160,90,90,0.08); } }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 8px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .explain { padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
  `,
})
export class StepNullSpaceComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // Matrix A = [[2, c], [1, 1]]
  // First column = (2, 1), Second column = (c, 1)
  // det = 2 − c. Singular when c = 2.
  // When c = 2: 2x + 2y = 0, x + y = 0 → null space = span((1, -1))

  readonly c = signal(1);

  readonly det = computed(() => 2 - this.c());
  readonly isSingular = computed(() => Math.abs(this.det()) < 0.05);

  readonly nullDir = computed(() => {
    // For A = [[2, c], [1, 1]], when singular (c = 2): Ax = 0 → x + y = 0 → (1, -1)
    // General null direction (when det ≈ 0): (c, -2)/length, since 2*c + c*(-2) = 0 and 1*c + 1*(-2) = c-2 ≈ 0
    const len = Math.hypot(this.c(), 2);
    return { x: this.c() / len, y: -2 / len };
  });
}
