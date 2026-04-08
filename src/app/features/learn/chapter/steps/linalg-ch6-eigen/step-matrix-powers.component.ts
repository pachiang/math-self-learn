import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-matrix-powers',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u77E9\u9663\u51AA\u6B21" subtitle="\u00A76.5">
      <p>
        \u8981\u8A08\u7B97 A^n\uFF08\u4E58 n \u6B21\u81EA\u5DF1\uFF09\u8FA6\u4F86\u8FA6\u53BB\u6703\u8B8A\u5F97\u5F88\u8907\u96DC\u3002\u4F46\u662F\u2014
      </p>
      <p>
        \u5982\u679C A = PDP\u207B\u00B9\uFF0C\u90A3 A^n = (PDP\u207B\u00B9)(PDP\u207B\u00B9)\u00B7\u00B7\u00B7(PDP\u207B\u00B9)\u3002
        \u4E2D\u9593\u7684 P\u207B\u00B9P \u90FD\u62B5\u92B7\u3002\u5269\u4E0B\uFF1A
      </p>
      <p class="formula">A\u207F = P D\u207F P\u207B\u00B9</p>
      <p>
        D\u207F \u8D85\u7C21\u55AE\uFF1A\u53EA\u8981\u628A\u5C0D\u89D2\u7DDA\u4E0A\u7684\u6BCF\u500B\u7279\u5FB5\u503C\u5404\u81EA\u53D6 n \u6B21\u65B9\uFF01
      </p>
      <p>
        \u9019\u4EE3\u8868\uFF1A<strong>\u7279\u5FB5\u503C\u8B93\u51AA\u6B21\u8B8A\u5F97\u8D85\u7C21\u55AE</strong>\uFF0C\u4E26\u4E14\u51AA\u6B21\u7684\u9577\u671F\u884C\u70BA\u53D6\u6C7A\u65BC\u300C\u6700\u5927\u7684 |\u03BB|\u300D\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 n \u770B A\u207F \u88AB\u5957\u7528\u5728\u5411\u91CF\u4E0A\u7684\u6548\u679C">
      <div class="grid-wrap">
        <svg viewBox="-160 -130 320 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-130" [attr.y1]="g" [attr.x2]="130" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-140" y1="0" x2="140" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Eigenvector lines -->
          <line x1="-110" y1="-110" x2="110" y2="110" stroke="#5a8a5a" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.4" />
          <line x1="-110" y1="110" x2="110" y2="-110" stroke="#5a8a5a" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.4" />

          <!-- Initial vector (faded) -->
          <line x1="0" y1="0" x2="40" y2="-20" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="3 3" opacity="0.6" />
          <text x="48" y="-22" class="lab" style="fill: var(--text-muted)">v\u2080</text>

          <!-- A^n v -->
          <line x1="0" y1="0" [attr.x2]="anvX()" [attr.y2]="anvY()"
            stroke="var(--accent)" stroke-width="3" marker-end="url(#tip-mp)" />
          <text [attr.x]="anvX() + 8" [attr.y]="anvY() - 4" class="lab" style="fill: var(--accent)">A\u207F v\u2080</text>

          <defs>
            <marker id="tip-mp" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="theta-row">
        <span class="t-lab">n =</span>
        <input type="range" min="0" max="6" step="1" [value]="n()" (input)="n.set(+$any($event).target.value)" class="t-slider" />
        <span class="t-val">{{ n() }}</span>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">D\u207F</span>
          <span class="iv">[[3\u207F, 0], [0, 1\u207F]] = [[{{ powLambda1() }}, 0], [0, 1]]</span>
        </div>
        <div class="info-row">
          <span class="il">A\u207F v\u2080</span>
          <span class="iv">(<strong>{{ (anvX() / 25).toFixed(2) }}</strong>, <strong>{{ (-anvY() / 25).toFixed(2) }}</strong>)</span>
        </div>
        <div class="info-row big">
          <span class="il">\u9577\u5EA6</span>
          <span class="iv"><strong>{{ Math.hypot(anvX() / 25, anvY() / 25).toFixed(2) }}</strong></span>
        </div>
      </div>

      <div class="explain">
        \u6CE8\u610F A\u207F v\u2080 \u6F38\u6F38\u6307\u5411 \u03BB\u2081 = 3 \u90A3\u500B\u7279\u5FB5\u5411\u91CF\u7684\u65B9\u5411 \u2014 \u56E0\u70BA 3\u207F \u9060\u9060\u8D85\u904E 1\u207F\u3002
        \u9577\u671F\u884C\u70BA\u88AB\u300C\u6700\u5927\u7684\u7279\u5FB5\u503C\u300D\u4E3B\u5C0E\u3002
      </div>
    </app-challenge-card>

    <app-prose-block title="\u8CBB\u6CE2\u90A3\u5951\u6578\u5217\u7684\u5FEB\u901F\u5BEB\u6CD5">
      <p>\u8CBB\u6CE2\u90A3\u5951\u6578\u5217\u7684\u905E\u8FF4\u5F0F F_{{ '{' }}n+1{{ '}' }} = F_n + F_{{ '{' }}n-1{{ '}' }} \u53EF\u4EE5\u5BEB\u6210\u77E9\u9663\u5F62\u5F0F\uFF1A</p>
      <p class="formula">[F_{{ '{' }}n+1{{ '}' }}, F_n] = M\u207F [1, 0]\uFF0C\u5176\u4E2D M = [[1, 1], [1, 0]]</p>
      <p>
        \u8981\u8A08\u7B97\u7B2C n \u9805\uFF0C\u4E0D\u9700\u8981\u9020\u4E00\u8DEF\u52A0\u4E0A\u4F86 \u2014 \u5C0D\u89D2\u5316 M \u4E4B\u5F8C\u53EF\u4EE5\u76F4\u63A5\u7528 M \u7684\u7279\u5FB5\u503C\u7B97\u51FA\u3002
        M \u7684\u7279\u5FB5\u503C\u662F\u9EC3\u91D1\u6BD4\uFF01\u9019\u5C31\u662F\u70BA\u4EC0\u9EBC\u8CBB\u6CE2\u90A3\u5951\u6578\u5217\u7684\u589E\u9577\u901F\u7387\u662F\u9EC3\u91D1\u6BD4\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px; background: var(--accent-10); border-radius: 8px; margin: 10px 0; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 360px; }
    .lab { font-size: 12px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .theta-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .t-slider { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 28px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 8px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); }

    .explain { padding: 12px 16px; border-radius: 8px; background: var(--bg-surface);
      font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class StepMatrixPowersComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly Math = Math;

  // A = [[2, 1], [1, 2]] with eigenvalues 3, 1; eigenvectors (1,1)/√2, (1,-1)/√2
  // v₀ = (2, -1) — has projections onto both eigenvectors

  readonly n = signal(2);

  readonly powLambda1 = computed(() => Math.pow(3, this.n()));

  // Decompose v₀ = (2, -1) in eigenbasis
  // Let v₀ = c₁·(1,1) + c₂·(1,-1)
  // Solving: c₁+c₂ = 2, c₁-c₂ = -1 → c₁ = 0.5, c₂ = 1.5
  // A^n v₀ = c₁·3^n·(1,1) + c₂·1^n·(1,-1)
  readonly anvMath = computed(() => {
    const c1 = 0.5;
    const c2 = 1.5;
    const lambda1n = Math.pow(3, this.n());
    const lambda2n = 1; // 1^n = 1
    return [c1 * lambda1n + c2 * lambda2n, c1 * lambda1n - c2 * lambda2n];
  });

  // Convert to SVG, with auto-scaling so it stays in view
  readonly anvX = computed(() => {
    const v = this.anvMath();
    const len = Math.max(Math.abs(v[0]), Math.abs(v[1]));
    const scale = len > 5 ? (5 * 25) / len : 25;
    return v[0] * scale;
  });
  readonly anvY = computed(() => {
    const v = this.anvMath();
    const len = Math.max(Math.abs(v[0]), Math.abs(v[1]));
    const scale = len > 5 ? (5 * 25) / len : 25;
    return -v[1] * scale;
  });
}
