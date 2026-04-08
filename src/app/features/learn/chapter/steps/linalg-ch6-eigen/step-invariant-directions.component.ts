import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-invariant-directions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4E0D\u8B8A\u7684\u65B9\u5411" subtitle="\u00A76.1">
      <p>
        \u7D66\u4F60\u4E00\u500B\u7DDA\u6027\u8B8A\u63DB A\uFF0C\u5927\u591A\u6578\u5411\u91CF\u88AB\u5957\u7528 A \u4E4B\u5F8C\u90FD\u6703<strong>\u8F49\u5230\u53E6\u4E00\u500B\u65B9\u5411</strong>\u3002
      </p>
      <p>
        \u4F46\u662F\u2014 \u6709\u4E9B\u300C\u7279\u6B8A\u300D\u7684\u65B9\u5411\u8B8A\u63DB\u4E4B\u5F8C\u4ECD\u7136\u662F\u540C\u4E00\u500B\u65B9\u5411\uFF0C\u53EA\u662F\u53EF\u80FD\u88AB\u62C9\u9577\u3001\u7E2E\u77ED\u3001\u6216\u53CD\u5411\u3002
      </p>
      <p>
        \u9019\u4E9B\u300C\u4E0D\u6703\u88AB\u8F49\u300D\u7684\u65B9\u5411\u53EB\u505A<strong>\u7279\u5FB5\u5411\u91CF</strong>\uFF08eigenvector\uFF09\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u8F49\u52D5\u63A2\u91DD v\uFF0C\u770B\u5728\u54EA\u4E9B\u89D2\u5EA6 Av \u4ECD\u7136\u8DDF v \u5E73\u884C">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Probe v (faded) -->
          <line x1="0" y1="0" [attr.x2]="vx() * 50" [attr.y2]="-vy() * 50"
            stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="3 3" opacity="0.7" />
          <text [attr.x]="vx() * 50 + 8" [attr.y]="-vy() * 50 - 4" class="lab" style="fill: var(--text-muted)">v</text>

          <!-- Av (bold), color depends on whether parallel -->
          <line x1="0" y1="0" [attr.x2]="avx() * 50" [attr.y2]="-avy() * 50"
            [attr.stroke]="isEigen() ? '#5a8a5a' : 'var(--accent)'" stroke-width="3" marker-end="url(#tip-eig)" />
          <text [attr.x]="avx() * 50 + 8" [attr.y]="-avy() * 50 - 4" class="lab"
            [attr.fill]="isEigen() ? '#5a8a5a' : 'var(--accent)'">Av</text>

          <defs>
            <marker id="tip-eig" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" [attr.fill]="isEigen() ? '#5a8a5a' : 'var(--accent)'" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="theta-row">
        <span class="t-lab">\u8F49\u52D5 v\uFF1A\u03B8 =</span>
        <input type="range" min="0" max="360" step="1" [value]="theta()" (input)="theta.set(+$any($event).target.value)" class="t-slider" />
        <span class="t-val">{{ theta() }}\u00B0</span>
      </div>

      <div class="info">
        <div class="info-row"><span class="il">A</span><span class="iv">[[2, 1], [1, 2]]</span></div>
        <div class="info-row"><span class="il">v</span><span class="iv">({{ vx().toFixed(2) }}, {{ vy().toFixed(2) }})</span></div>
        <div class="info-row"><span class="il">Av</span><span class="iv">({{ avx().toFixed(2) }}, {{ avy().toFixed(2) }})</span></div>
        <div class="info-row big" [class.eigen]="isEigen()">
          <span class="il">v \u8DDF Av \u7684\u593E\u89D2</span>
          <span class="iv">{{ angleBetween().toFixed(1) }}\u00B0</span>
        </div>
      </div>

      @if (isEigen()) {
        <div class="found">
          \u2713 <strong>\u627E\u5230\u7279\u5FB5\u5411\u91CF\uFF01</strong>
          \u5728 \u03B8 = {{ theta() }}\u00B0 \u9019\u500B\u65B9\u5411\uFF0CAv \u8DDF v \u5E73\u884C\u3002
          Av \u662F v \u7684 <strong>{{ stretchFactor().toFixed(2) }}</strong> \u500D\u3002
        </div>
      } @else {
        <div class="hint-box">
          \u63D0\u793A\uFF1A\u9019\u500B\u77E9\u9663\u6709\u5169\u500B\u7279\u5FB5\u65B9\u5411\u3002\u614A\u614A\u8F49\uFF0C\u770B\u54EA\u4E9B\u89D2\u5EA6\u8B93 Av \u8DDF v \u5728\u540C\u4E00\u689D\u7DDA\u4E0A\u3002
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4F60\u61C9\u8A72\u80FD\u627E\u5230<strong>\u5169\u500B</strong>\u7279\u5FB5\u65B9\u5411\u3002\u9019\u4E0D\u662F\u5DE7\u5408 \u2014 2\u00D72 \u77E9\u9663\u4E00\u822C\u6709 2 \u500B\u7279\u5FB5\u65B9\u5411\u3002
      </p>
      <p>
        \u90A3\u4E9B\u300C\u62C9\u9577\u500D\u6578\u300D\uFF08\u6BD4\u5982\u4F60\u770B\u5230\u7684 3 \u8DDF 1\uFF09\u53EB\u505A<strong>\u7279\u5FB5\u503C</strong>\uFF08eigenvalue\uFF09\u3002
        \u4E0B\u4E00\u7BC0\u6B63\u5F0F\u5B9A\u7FA9\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .lab { font-size: 13px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .theta-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 13px; font-weight: 700; color: var(--accent); }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 48px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 130px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.big { background: var(--accent-10); }
      &.big.eigen { background: rgba(90,138,90,0.1); } }
    .il { padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-muted);
      background: var(--bg-surface); border-right: 1px solid var(--border); }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .info-row.big.eigen .iv { color: #5a8a5a; font-weight: 700; }

    .found { padding: 14px 18px; border: 2px solid #5a8a5a; border-radius: 10px;
      background: rgba(90,138,90,0.06); font-size: 13px; color: var(--text);
      strong { color: #5a8a5a; } }
    .hint-box { padding: 10px 14px; border-radius: 8px; background: var(--accent-10);
      font-size: 12px; color: var(--text-secondary); text-align: center; }
  `,
})
export class StepInvariantDirectionsComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // Fixed transformation: A = [[2, 1], [1, 2]], eigenvalues 3, 1, eigenvectors (1,1), (1,-1)
  readonly A = [[2, 1], [1, 2]];

  readonly theta = signal(20);

  // v as a unit vector
  readonly vx = computed(() => Math.cos((this.theta() * Math.PI) / 180));
  readonly vy = computed(() => Math.sin((this.theta() * Math.PI) / 180));

  // Av
  readonly avx = computed(() => this.A[0][0] * this.vx() + this.A[0][1] * this.vy());
  readonly avy = computed(() => this.A[1][0] * this.vx() + this.A[1][1] * this.vy());

  // Angle between v and Av (in degrees, 0 to 180)
  readonly angleBetween = computed(() => {
    const dot = this.vx() * this.avx() + this.vy() * this.avy();
    const lenV = Math.hypot(this.vx(), this.vy());
    const lenAv = Math.hypot(this.avx(), this.avy());
    if (lenAv < 1e-9) return 0;
    const cos = Math.max(-1, Math.min(1, dot / (lenV * lenAv)));
    return (Math.acos(cos) * 180) / Math.PI;
  });

  readonly isEigen = computed(() => this.angleBetween() < 2 || this.angleBetween() > 178);

  // Stretch factor (positive if same direction, negative if flipped)
  readonly stretchFactor = computed(() => {
    const lenAv = Math.hypot(this.avx(), this.avy());
    return this.angleBetween() < 90 ? lenAv : -lenAv;
  });
}
