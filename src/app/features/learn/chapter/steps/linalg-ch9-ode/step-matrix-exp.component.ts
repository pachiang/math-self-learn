import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-matrix-exp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u77E9\u9663\u6307\u6578 e^(At)" subtitle="\u00A79.4">
      <p>
        1D \u7684\u89E3\u662F x(t) = e^(at) x\u2080\u3002\u80FD\u4E0D\u80FD\u628A\u300C\u6307\u6578\u300D\u63A8\u5EE3\u5230<strong>\u77E9\u9663</strong>\uFF0C\u8B93\u89E3\u76F4\u63A5\u5BEB\u6210\uFF1A
      </p>
      <p class="formula big">x(t) = e<sup>At</sup> x\u2080\uFF1F</p>
      <p>
        \u53EF\u4EE5\uFF01\u770B\u5230\u77E9\u9663 e^(At) \u600E\u9EBC\u5B9A\u7FA9\u3002\u56DE\u60F3 1D \u7684\u6CF0\u52D2\u5C55\u958B\uFF1A
      </p>
      <p class="formula">e^x = 1 + x + x\u00B2/2! + x\u00B3/3! + ...</p>
      <p>
        \u4ECB\u6298\u63DB\u6210\u77E9\u9663\u3002I \u53D6\u4EE3 1\uFF0C\u77E9\u9663\u4E58\u6CD5\u53D6\u4EE3\u6BCD\u6578\u4E58\u6CD5\uFF1A
      </p>
      <p class="formula">e^(At) = I + At + (At)\u00B2/2! + (At)\u00B3/3! + ...</p>
      <p>
        \u9019\u500B\u7DDA\u6027\u7684\u7121\u7AAE\u548C\u6536\u6582\u5230\u4E00\u500B\u300C\u77E9\u9663\u300D\uFF0C\u53EB\u505A\u77E9\u9663\u6307\u6578\u3002
      </p>
      <p>
        \u4ED6\u6700\u91CD\u8981\u7684\u6027\u8CEA\uFF1A
      </p>
      <p class="formula">d/dt [e^(At)] = A e^(At)</p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA\uFF0Cx(t) = e^(At) x\u2080 \u78BA\u5BE6\u6EFF\u8DB3 dx/dt = Ax\u3002\u9032\u4E00\u6B65\uFF1A
      </p>
      <ul>
        <li>e^(A\u00B70) = I\uFF0C\u6240\u4EE5 x(0) = x\u2080 \u2713</li>
        <li>e^(A(s+t)) = e^(As) e^(At)\u3002\u9019\u662F\u300C\u6F14\u5316\u5177\u7FA4\u6027\u8CEA\u300D</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 t \u770B e^(At) \u4F5C\u70BA\u500B\u300C\u8B8A\u63DB\u300D\u600E\u9EBC\u968F\u6642\u9593\u8B8A\u5316">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Original unit circle -->
          <circle cx="0" cy="0" r="50" fill="none" stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="3 3" />

          <!-- e^(At) applied to unit circle -->
          <path [attr.d]="ellipsePath()" fill="var(--accent)" opacity="0.15" stroke="var(--accent)" stroke-width="2" />

          <!-- Reference points: 8 dots on the original circle and their images -->
          @for (k of [0, 1, 2, 3, 4, 5, 6, 7]; track k) {
            <line
              [attr.x1]="50 * Math.cos(k * Math.PI / 4)" [attr.y1]="-50 * Math.sin(k * Math.PI / 4)"
              [attr.x2]="transformedPoint(k)[0]" [attr.y2]="transformedPoint(k)[1]"
              stroke="var(--border-strong)" stroke-width="0.6" opacity="0.5" />
            <circle [attr.cx]="50 * Math.cos(k * Math.PI / 4)" [attr.cy]="-50 * Math.sin(k * Math.PI / 4)"
              r="2" fill="var(--text-muted)" />
            <circle [attr.cx]="transformedPoint(k)[0]" [attr.cy]="transformedPoint(k)[1]"
              r="3" fill="var(--accent)" />
          }
        </svg>
      </div>

      <div class="t-row">
        <span class="t-lab">t =</span>
        <input type="range" min="0" max="2" step="0.02" [value]="t()" (input)="t.set(+$any($event).target.value)" />
        <span class="t-val">{{ t().toFixed(2) }}</span>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ A[0][0] }}, {{ A[0][1] }}], [{{ A[1][0] }}, {{ A[1][1] }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">e<sup>At</sup></span>
          <span class="iv">[[{{ expAt()[0][0].toFixed(2) }}, {{ expAt()[0][1].toFixed(2) }}],
            [{{ expAt()[1][0].toFixed(2) }}, {{ expAt()[1][1].toFixed(2) }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">\u7279\u5FB5\u503C</span>
          <span class="iv">\u03BB\u2081 = -0.5, \u03BB\u2082 = -1.5</span>
        </div>
      </div>

      <div class="series-display">
        <div class="sd-title">\u5C55\u958B e<sup>At</sup> \u70BA\u7D1A\u6578\uFF08\u524D\u5E7E\u9805\uFF09\uFF1A</div>
        <div class="sd-formula">
          e<sup>At</sup> \u2248 I + ({{ t().toFixed(2) }})A + ({{ (t() * t() / 2).toFixed(3) }})A\u00B2 + ({{ (t() ** 3 / 6).toFixed(4) }})A\u00B3 + ...
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u500B\u300C<strong>\u968F\u6642\u9593\u6F38\u6F38\u8B8A\u5F62\u300D\u7684\u8B8A\u63DB\u662F\u52D5\u529B\u7CFB\u7D71\u7684\u6838\u5FC3\u300D</strong>\u3002\u5C0D\u4EFB\u4F55\u521D\u59CB\u72C0\u614B x\u2080\uFF0C\u72C0\u614B\u968F\u6642\u9593\u7684\u6F14\u5316\u90FD\u662F\uFF1A
      </p>
      <p class="formula">x(t) = e^(At) x\u2080</p>
      <p>
        e^(At) \u662F\u4E00\u500B\u300C\u6F14\u5316\u7B97\u5B50\u300D\uFF0C\u5B83\u628A\u521D\u59CB\u72C0\u614B\u300C\u643F\u300D\u5230\u6642\u9593 t \u7684\u72C0\u614B\u3002
      </p>
      <p>
        \u5BE6\u969B\u8A08\u7B97 e^(At) \u7684\u6700\u5BB9\u6613\u65B9\u6CD5\u662F\u900F\u904E\u5C0D\u89D2\u5316\uFF1A
      </p>
      <p class="formula">A = P D P\u207B\u00B9 \u2192 e^(At) = P e^(Dt) P\u207B\u00B9</p>
      <p>
        \u5176\u4E2D e^(Dt) \u662F\u5C0D\u89D2\u77E9\u9663\uFF0C\u5C0D\u89D2\u7DDA\u662F e^(\u03BB\u1D62 t)\u3002\u9019\u662F\u70BA\u4EC0\u9EBC\u7279\u5FB5\u5206\u89E3\u8DDF\u52D5\u529B\u7CFB\u7D71\u9019\u9EBC\u6709\u95DC\u4FC2\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u770B\u9019\u4E9B\u7406\u8AD6\u8AAA\u660E\u4E86\u4EC0\u9EBC\uFF1A2D \u7DDA\u6027 ODE \u7684<strong>\u56DB\u7A2E\u985E\u578B\u5206\u985E</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 24px; padding: 18px; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 360px; }

    .t-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .t-row input { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 44px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 70px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .series-display { padding: 12px 16px; border-radius: 8px; background: var(--bg-surface);
      border: 1px solid var(--border); }
    .sd-title { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .sd-formula { font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      text-align: center; line-height: 1.7; }
  `,
})
export class StepMatrixExpComponent {
  readonly Math = Math;
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // A = [[-0.7, 0.5], [0.5, -1.3]] (symmetric, so easy to diagonalise)
  // Trace = -2, det = 0.91 - 0.25 = 0.66
  // λ² + 2λ + 0.66 = 0 → λ = -1 ± √(1 - 0.66) = -1 ± √0.34 ≈ -1 ± 0.583
  // λ₁ ≈ -0.417, λ₂ ≈ -1.583
  // Hmm let me pick simpler: A = [[-0.5, 0], [0, -1.5]] — already diagonal
  readonly A = [[-0.5, 0], [0, -1.5]];

  readonly t = signal(0.5);

  // For diagonal A, e^(At) is also diagonal with e^(λ_i t)
  readonly expAt = computed<number[][]>(() => {
    return [
      [Math.exp(this.A[0][0] * this.t()), 0],
      [0, Math.exp(this.A[1][1] * this.t())],
    ];
  });

  // The unit circle becomes an ellipse after applying e^(At)
  // For diagonal: each x-coord scales by e^(λ₁ t), each y-coord by e^(λ₂ t)
  readonly ellipsePath = computed(() => {
    const s1 = this.expAt()[0][0];
    const s2 = this.expAt()[1][1];
    const points: string[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * 2 * Math.PI;
      const x = 50 * s1 * Math.cos(theta);
      const y = -50 * s2 * Math.sin(theta);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return 'M ' + points.join(' L ') + ' Z';
  });

  transformedPoint(k: number): [number, number] {
    const theta = k * Math.PI / 4;
    const s1 = this.expAt()[0][0];
    const s2 = this.expAt()[1][1];
    return [50 * s1 * Math.cos(theta), -50 * s2 * Math.sin(theta)];
  }
}
