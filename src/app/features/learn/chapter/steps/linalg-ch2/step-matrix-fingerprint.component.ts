import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-matrix-fingerprint',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u77E9\u9663\uFF1A\u8B8A\u63DB\u7684\u6307\u7D0B" subtitle="\u00A72.2">
      <p>
        \u95DC\u9375\u89C0\u5BDF\uFF1A\u4E00\u500B\u7DDA\u6027\u8B8A\u63DB\u53EA\u8981\u77E5\u9053\u300C\u57FA\u5E95\u5411\u91CF\u8DD1\u5230\u54EA\u88E1\u300D\uFF0C\u5C31\u80FD\u5B8C\u5168\u6C7A\u5B9A\u3002
      </p>
      <p>
        \u5728 \u211D\u00B2 \u88E1\uFF0C\u53EA\u8981\u8A18\u9304\u5169\u500B\u5411\u91CF\uFF1AT(\u00EA\u2081) \u8207 T(\u00EA\u2082)\uFF0C\u5C31\u80FD\u91CD\u5EFA\u6574\u500B T\u3002
        \u9019\u5169\u500B\u5411\u91CF\u4E26\u5217\u6210\u4E00\u500B 2\u00D72 \u77E9\u9663\uFF0C\u5C31\u662F\u8B8A\u63DB\u7684<strong>\u77E9\u9663\u8868\u793A</strong>\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u52D5\u6ED1\u6876\uFF0C\u770B\u57FA\u5E95\u5411\u91CF\u600E\u9EBC\u8DDF\u8457\u77E9\u9663\u6B04\u4F4D\u8DD1">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of refGrid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Transformed grid wrapper -->
          <g class="grid-layer" [style.transform]="cssTransform()" [style.transition]="trans">
            <!-- Vertical lines (parallel to ê₂) → ê₂ colour -->
            @for (g of fineGrid; track g) {
              <line [attr.x1]="g" y1="-100" [attr.x2]="g" y2="100" stroke="var(--v1)" stroke-width="0.9" opacity="0.4" />
            }
            <!-- Horizontal lines (parallel to ê₁) → ê₁ colour -->
            @for (g of fineGrid; track g) {
              <line x1="-100" [attr.y1]="g" x2="100" [attr.y2]="g" stroke="var(--v0)" stroke-width="0.9" opacity="0.4" />
            }
            <line x1="0" y1="0" x2="40" y2="0" stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-e1b)" />
            <line x1="0" y1="0" x2="0" y2="-40" stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-e2b)" />
          </g>

          <defs>
            <marker id="tip-e1b" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-e2b" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <!-- Sliders -->
      <div class="sliders">
        <div class="sl-row">
          <span class="sl-lab e1">T(\u00EA\u2081)\u2093</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="a()" (input)="a.set(+$any($event).target.value)" />
          <span class="sl-val">{{ a() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab e2">T(\u00EA\u2082)\u2093</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="b()" (input)="b.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab e1">T(\u00EA\u2081)\u1D67</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="c()" (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab e2">T(\u00EA\u2082)\u1D67</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="d()" (input)="d.set(+$any($event).target.value)" />
          <span class="sl-val">{{ d() }}</span>
        </div>
      </div>

      <!-- Matrix display with column highlighting -->
      <div class="matrix-explain">
        <div class="me-bracket">[</div>
        <div class="me-body">
          <div class="me-col col-e1">
            <div class="me-cell">{{ a() }}</div>
            <div class="me-cell">{{ c() }}</div>
            <div class="me-col-label">T(\u00EA\u2081)</div>
          </div>
          <div class="me-col col-e2">
            <div class="me-cell">{{ b() }}</div>
            <div class="me-cell">{{ d() }}</div>
            <div class="me-col-label">T(\u00EA\u2082)</div>
          </div>
        </div>
        <div class="me-bracket">]</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8A18\u4F4F\u9019\u500B\u95DC\u9375\u4E8B\u5BE6\uFF1A<strong>\u77E9\u9663\u7684\u7B2C k \u500B\u6B04\u5C31\u662F T(\u00EA\u2096)</strong>\u3002
      </p>
      <p>
        \u9019\u4E0D\u662F\u5DE7\u5408\uFF0C\u662F\u5B9A\u7FA9\u3002\u4E0B\u4E00\u7BC0\u6211\u5011\u770B\u4EE5\u9019\u500B\u89C0\u9EDE\u770B\u300C\u77E9\u9663\u4E58\u4EE5\u5411\u91CF\u300D\u8B8A\u5F97\u591A\u9EBC\u81EA\u7136\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 340px; }
    .grid-layer { transform-origin: 0 0; }

    .sliders { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;
      padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .sl-row { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 12px; font-weight: 700; min-width: 60px; font-family: 'Noto Sans Math', serif;
      &.e1 { color: var(--v0); } &.e2 { color: var(--v1); } }
    .sl-row input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 32px; text-align: right; }

    .matrix-explain {
      display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 14px; border-radius: 10px; background: var(--bg-surface);
    }
    .me-bracket { font-size: 50px; font-weight: 200; color: var(--text-muted); line-height: 1; }
    .me-body { display: flex; gap: 8px; }
    .me-col { display: flex; flex-direction: column; gap: 4px; align-items: center; padding: 4px 6px; border-radius: 6px;
      &.col-e1 { background: rgba(191, 158, 147, 0.18); }
      &.col-e2 { background: rgba(141, 163, 181, 0.18); } }
    .me-cell { min-width: 40px; text-align: center; font-size: 15px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; color: var(--text); padding: 4px 8px; }
    .me-col-label { font-size: 10px; font-weight: 700; font-family: 'Noto Sans Math', serif; margin-top: 2px;
      .col-e1 & { color: var(--v0); } .col-e2 & { color: var(--v1); } }
  `,
})
export class StepMatrixFingerprintComponent {
  readonly refGrid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly fineGrid = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];

  // Matrix [[a, b], [c, d]] in math (y-up)
  readonly a = signal(1);
  readonly b = signal(0);
  readonly c = signal(0);
  readonly d = signal(1);

  readonly trans = 'transform 0.25s ease-out';

  readonly cssTransform = computed(() => {
    const a = this.a(), b = this.b(), c = this.c(), d = this.d();
    return `matrix(${a}, ${-c}, ${-b}, ${d}, 0, 0)`;
  });
}
