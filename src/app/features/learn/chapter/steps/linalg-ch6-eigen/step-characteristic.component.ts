import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-characteristic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7279\u5FB5\u65B9\u7A0B" subtitle="\u00A76.3">
      <p>
        \u600E\u9EBC\u627E\u7279\u5FB5\u503C\uFF1F\u5F9E\u5B9A\u7FA9\u51FA\u767C\uFF1A
      </p>
      <p class="formula">Av = \u03BBv  \u27FA  Av \u2212 \u03BBv = 0  \u27FA  (A \u2212 \u03BBI)v = 0</p>
      <p>
        \u8981\u8B93\u9019\u500B\u65B9\u7A0B\u6709<strong>\u975E\u96F6\u89E3</strong> v\uFF0C\u5C31\u5FC5\u9808 (A \u2212 \u03BBI) <strong>\u4E0D\u53EF\u9006</strong>\u3002
        \u4E0D\u53EF\u9006\u7684\u689D\u4EF6\u662F\uFF1A
      </p>
      <p class="formula">det(A \u2212 \u03BBI) = 0</p>
      <p>
        \u9019\u53EB\u505A<strong>\u7279\u5FB5\u65B9\u7A0B</strong>\u3002\u5B83\u662F\u4E00\u500B\u95DC\u65BC \u03BB \u7684\u591A\u9805\u5F0F\u3002
        \u591A\u9805\u5F0F\u7684\u6839\u5C31\u662F\u7279\u5FB5\u503C\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 \u03BB \u6ED1\u6876\uFF0C\u770B det(A \u2212 \u03BBI) \u4F55\u6642\u7B49\u65BC\u96F6">
      <!-- Plot of p(λ) = det(A - λI) -->
      <div class="plot-wrap">
        <svg viewBox="-160 -110 320 200" class="plot-svg">
          <!-- Axes -->
          <line x1="-150" y1="0" x2="150" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-90" x2="0" y2="90" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Tick marks -->
          @for (k of ticks; track k) {
            <line [attr.x1]="k * 30" y1="-3" [attr.x2]="k * 30" y2="3" stroke="var(--border-strong)" stroke-width="0.8" />
            <text [attr.x]="k * 30" y="14" class="tick-lab">{{ k }}</text>
          }

          <text x="155" y="4" class="axis-name">\u03BB</text>
          <text x="6" y="-95" class="axis-name">p(\u03BB)</text>

          <!-- Curve -->
          <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2" />

          <!-- Eigenvalue dots -->
          @for (root of roots; track $index) {
            <circle [attr.cx]="root * 30" cy="0" r="5" fill="#5a8a5a" stroke="white" stroke-width="2" />
            <text [attr.x]="root * 30" y="-12" class="root-lab">\u03BB={{ root }}</text>
          }

          <!-- Slider indicator -->
          <line [attr.x1]="lambdaSlider() * 30" y1="-90" [attr.x2]="lambdaSlider() * 30" y2="90"
            stroke="var(--text)" stroke-width="1" stroke-dasharray="3 3" opacity="0.5" />
          <circle [attr.cx]="lambdaSlider() * 30" [attr.cy]="-pAt(lambdaSlider()) * 15" r="4"
            fill="var(--text)" stroke="white" stroke-width="1.5" />
        </svg>
      </div>

      <div class="theta-row">
        <span class="t-lab">\u03BB =</span>
        <input type="range" min="-1" max="4" step="0.1" [value]="lambdaSlider()"
          (input)="lambdaSlider.set(+$any($event).target.value)" class="t-slider" />
        <span class="t-val">{{ lambdaSlider().toFixed(1) }}</span>
      </div>

      <div class="info">
        <div class="info-row"><span class="il">A</span><span class="iv">[[2, 1], [1, 2]]</span></div>
        <div class="info-row"><span class="il">A \u2212 \u03BBI</span><span class="iv">[[{{ (2 - lambdaSlider()).toFixed(1) }}, 1], [1, {{ (2 - lambdaSlider()).toFixed(1) }}]]</span></div>
        <div class="info-row big" [class.zero]="Math.abs(pAt(lambdaSlider())) < 0.05">
          <span class="il">det(A \u2212 \u03BBI)</span>
          <span class="iv"><strong>{{ pAt(lambdaSlider()).toFixed(2) }}</strong></span>
        </div>
      </div>

      <div class="conclusion">
        \u7279\u5FB5\u65B9\u7A0B\u662F p(\u03BB) = (2\u2212\u03BB)\u00B2 \u2212 1 = \u03BB\u00B2 \u2212 4\u03BB + 3 = (\u03BB \u2212 1)(\u03BB \u2212 3)
        <br/>\u6839\uFF1A<strong>\u03BB = 1</strong>\u3001<strong>\u03BB = 3</strong> \u2014 \u8DDF\u4E0A\u4E00\u7BC0\u627E\u5230\u7684\u4E00\u6A23\uFF01
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        n\u00D7n \u77E9\u9663\u7684\u7279\u5FB5\u591A\u9805\u5F0F\u662F n \u6B21\u591A\u9805\u5F0F\uFF0C\u6700\u591A\u6709 n \u500B\u6839\uFF0C\u4E5F\u5C31\u662F\u6700\u591A n \u500B\u7279\u5FB5\u503C\u3002
      </p>
      <span class="hint">
        \u6709\u4E9B\u591A\u9805\u5F0F\u7684\u6839\u662F\u8907\u6578 \u2014 \u9019\u4EE3\u8868\u8B8A\u63DB\u6709\u300C\u65CB\u8F49\u300D\u7684\u6210\u5206\u3002\u672C\u7AE0\u6211\u5011\u96C6\u4E2D\u5728\u5BE6\u6578\u7279\u5FB5\u503C\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 0; }

    .plot-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .plot-svg { width: 100%; max-width: 360px; }
    .tick-lab { font-size: 9px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .axis-name { font-size: 10px; fill: var(--text-muted); font-family: 'Noto Sans Math', serif; }
    .root-lab { font-size: 10px; fill: #5a8a5a; font-weight: 700; text-anchor: middle; font-family: 'JetBrains Mono', monospace; }

    .theta-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 110px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.big { background: var(--accent-10); }
      &.big.zero { background: rgba(90,138,90,0.1); } }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 16px; }
    .info-row.zero .iv strong { color: #5a8a5a; }

    .conclusion { padding: 12px 16px; border-radius: 8px; background: var(--accent-10);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: #5a8a5a; font-size: 15px; } }
  `,
})
export class StepCharacteristicComponent {
  readonly Math = Math;
  readonly ticks = [-1, 0, 1, 2, 3, 4];
  readonly roots = [1, 3];

  readonly lambdaSlider = signal(2);

  // p(λ) = (2 − λ)² − 1
  pAt(lambda: number): number {
    return (2 - lambda) ** 2 - 1;
  }

  readonly curvePath = (() => {
    const pts: string[] = [];
    for (let lambda = -1; lambda <= 4; lambda += 0.1) {
      const x = lambda * 30;
      // Scale y by 15 (so p(2)=-1 → y=15) and clamp to viewBox
      const y = -Math.max(-90, Math.min(90, this.pAt(lambda) * 15));
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  })();
}
