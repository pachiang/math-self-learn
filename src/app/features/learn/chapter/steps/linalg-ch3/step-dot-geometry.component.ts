import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-dot-geometry',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u9EDE\u7A4D\u7684\u5E7E\u4F55\u610F\u7FA9" subtitle="\u00A73.2">
      <p>
        \u9EDE\u7A4D\u9664\u4E86\u4EE3\u6578\u5B9A\u7FA9\u5916\uFF0C\u9084\u6709\u4E00\u500B\u5E7E\u4F55\u516C\u5F0F\uFF1A
      </p>
      <p class="formula">v \u00B7 w = |v| |w| cos \u03B8</p>
      <p>
        \u5176\u4E2D \u03B8 \u662F\u5169\u500B\u5411\u91CF\u7684\u593E\u89D2\u3002\u9019\u500B\u516C\u5F0F\u8AAA\u660E\u4E86\u9EDE\u7A4D\u7684<strong>\u4E09\u500B\u95DC\u9375\u6027\u8CEA</strong>\uFF1A
      </p>
      <ul>
        <li><strong>\u540C\u5411</strong>\uFF08\u03B8 = 0\uFF09\uFF1Acos\u03B8 = 1\uFF0Cv\u00B7w = |v||w|\uFF08\u6700\u5927\u6B63\u503C\uFF09</li>
        <li><strong>\u5782\u76F4</strong>\uFF08\u03B8 = 90\u00B0\uFF09\uFF1Acos\u03B8 = 0\uFF0Cv\u00B7w = 0</li>
        <li><strong>\u53CD\u5411</strong>\uFF08\u03B8 = 180\u00B0\uFF09\uFF1Acos\u03B8 = -1\uFF0Cv\u00B7w = -|v||w|\uFF08\u6700\u5C0F\u8CA0\u503C\uFF09</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 \u03B8 \u6ED1\u6876\uFF0C\u770B w \u8F49\u52D5\u6642\u9EDE\u7A4D\u600E\u9EBC\u8B8A\u5316">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Angle arc -->
          <path [attr.d]="arcPath()" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.6" />

          <!-- v fixed along positive x -->
          <line x1="0" y1="0" [attr.x2]="vLen * 25" y2="0"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-gv)" />
          <text [attr.x]="vLen * 25 + 8" y="-4" class="vec-label" style="fill: var(--v0)">v</text>

          <!-- w rotates -->
          <line x1="0" y1="0" [attr.x2]="wEndX()" [attr.y2]="wEndY()"
            stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-gw)" />
          <text [attr.x]="wEndX() + 8" [attr.y]="wEndY() - 4" class="vec-label" style="fill: var(--v1)">w</text>

          <defs>
            <marker id="tip-gv" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-gw" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="theta-row">
        <span class="t-lab">\u03B8 =</span>
        <input type="range" min="0" max="180" step="10" [value]="theta()" (input)="theta.set(+$any($event).target.value)" class="t-slider" />
        <span class="t-val">{{ theta() }}\u00B0</span>
      </div>

      <div class="calc-grid">
        <div class="cg-row"><span class="cg-l">|v|</span><span class="cg-r">{{ vLen }}</span></div>
        <div class="cg-row"><span class="cg-l">|w|</span><span class="cg-r">{{ wLen }}</span></div>
        <div class="cg-row"><span class="cg-l">cos \u03B8</span><span class="cg-r">{{ cosTheta().toFixed(3) }}</span></div>
        <div class="cg-row big" [class.pos]="dot() > 0.01" [class.neg]="dot() < -0.01" [class.zer]="dot() >= -0.01 && dot() <= 0.01">
          <span class="cg-l">v \u00B7 w</span>
          <span class="cg-r">= {{ vLen }} \u00D7 {{ wLen }} \u00D7 {{ cosTheta().toFixed(3) }} = <strong>{{ dot().toFixed(2) }}</strong></span>
        </div>
      </div>

      <div class="quick-msg">
        @if (theta() === 0) { \u540C\u5411\uFF1A\u9EDE\u7A4D\u9054\u5230\u6700\u5927\u503C |v||w| = {{ vLen * wLen }} }
        @else if (theta() === 90) { \u5782\u76F4\uFF1A\u9EDE\u7A4D\u521A\u597D = 0 }
        @else if (theta() === 180) { \u53CD\u5411\uFF1A\u9EDE\u7A4D\u9054\u5230\u6700\u5C0F\u503C \u2212|v||w| }
        @else if (theta() < 90) { \u9504\u89D2\uFF08\u5C0F\u65BC 90\u00B0\uFF09\uFF1A\u9EDE\u7A4D\u70BA\u6B63 }
        @else { \u9215\u89D2\uFF08\u5927\u65BC 90\u00B0\uFF09\uFF1A\u9EDE\u7A4D\u70BA\u8CA0 }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9EDE\u7A4D\u53EF\u4EE5\u770B\u6210\u300C<strong>w \u6709\u591A\u5C11\u90E8\u5206\u8DDF v \u540C\u65B9\u5411</strong>\u300D\u4E58\u4E0A v \u7684\u9577\u5EA6\u3002
        \u4E0B\u4E00\u7BC0\u6211\u5011\u5C07\u9019\u500B\u300C\u540C\u65B9\u5411\u90E8\u5206\u300D\u6B63\u5F0F\u53EB\u505A\u300C<strong>\u6295\u5F71</strong>\u300D\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 0; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .vec-label { font-size: 14px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .theta-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 48px; text-align: right; }

    .calc-grid { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .cg-row { display: grid; grid-template-columns: 70px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.big { background: var(--accent-10); }
      &.pos.big strong { color: #5a8a5a; }
      &.neg.big strong { color: #a05a5a; }
      &.zer.big strong { color: #d4a14b; } }
    .cg-l { padding: 8px 12px; font-size: 13px; font-weight: 600; color: var(--text-muted);
      background: var(--bg-surface); border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .cg-r { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .cg-r strong { font-size: 16px; }

    .quick-msg { padding: 10px 14px; border-radius: 8px; background: var(--accent-10);
      font-size: 13px; color: var(--text-secondary); text-align: center; }
  `,
})
export class StepDotGeometryComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly vLen = 3;
  readonly wLen = 2;
  readonly theta = signal(45);

  // w end position based on theta (w fixed length wLen, rotates from positive x)
  readonly wEndX = computed(() => this.wLen * 25 * Math.cos((this.theta() * Math.PI) / 180));
  readonly wEndY = computed(() => -this.wLen * 25 * Math.sin((this.theta() * Math.PI) / 180));

  readonly cosTheta = computed(() => Math.cos((this.theta() * Math.PI) / 180));
  readonly dot = computed(() => this.vLen * this.wLen * this.cosTheta());

  // Arc showing the angle, radius = 28
  readonly arcPath = computed(() => {
    const r = 28;
    const t = (this.theta() * Math.PI) / 180;
    const x2 = r * Math.cos(t);
    const y2 = -r * Math.sin(t);
    const largeArc = this.theta() > 180 ? 1 : 0;
    return `M ${r} 0 A ${r} ${r} 0 ${largeArc} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  });
}
