import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-damped-oscillator',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7269\u7406\u61C9\u7528\uFF1A\u963B\u5C3C\u632F\u76EA\u5668" subtitle="\u00A79.6">
      <p>
        \u4E00\u500B\u96BB\u7C27 + \u8CEA\u91CF + \u963B\u5C3C\u7684\u7CFB\u7D71\u662F\u52D5\u529B\u7CFB\u7D71\u7684\u5178\u578B\u7BC4\u4F8B\u3002\u7269\u7406\u4E0A\u662F\uFF1A
      </p>
      <p class="formula">m \u00B7 d\u00B2x/dt\u00B2 + c \u00B7 dx/dt + k \u00B7 x = 0</p>
      <p>\u5176\u4E2D\uFF1A</p>
      <ul>
        <li><strong>m</strong>\uFF1A\u8CEA\u91CF</li>
        <li><strong>k</strong>\uFF1A\u96BB\u7C27\u52C1\u5EA6\uFF08\u62C9\u56DE\u5E73\u8861\u4F4D\u7F6E\u7684\u529B\uFF09</li>
        <li><strong>c</strong>\uFF1A\u963B\u5C3C\u4FC2\u6578\uFF08\u8B93\u632F\u76EA\u8870\u9000\uFF09</li>
      </ul>
      <p>
        \u9019\u662F\u4E00\u500B<strong>\u4E8C\u968E</strong> ODE\u3002\u8B93 v = dx/dt\uFF0C\u6539\u5BEB\u6210\u5169\u500B\u4E00\u968E\uFF1A
      </p>
      <p class="formula">dx/dt = v<br/>dv/dt = \u2212(k/m) x \u2212 (c/m) v</p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA d/dt [x; v] = A \u00B7 [x; v]\uFF0C\u5176\u4E2D\uFF1A
      </p>
      <p class="formula big">A = [[0, 1], [\u2212k/m, \u2212c/m]]</p>
    </app-prose-block>

    <app-challenge-card prompt="\u8ABF\u6574\u963B\u5C3C c\uFF0C\u770B\u632F\u76EA\u600E\u9EBC\u5F9E\u632F\u76EA\u8B8A\u6210\u305A\u8870\u9000">
      <!-- Spring + mass animation -->
      <div class="anim-block">
        <div class="anim-title">\u96BB\u7C27 + \u8CEA\u91CF</div>
        <svg viewBox="0 -50 400 100" class="spring-svg">
          <!-- Wall -->
          <line x1="20" y1="-40" x2="20" y2="40" stroke="var(--text)" stroke-width="3" />
          @for (h of [-40, -30, -20, -10, 0, 10, 20, 30]; track h) {
            <line x1="10" [attr.y1]="h + 5" x2="20" [attr.y2]="h - 5" stroke="var(--text)" stroke-width="1" />
          }

          <!-- Equilibrium line -->
          <line x1="180" y1="-30" x2="180" y2="30" stroke="var(--border-strong)" stroke-width="0.5" stroke-dasharray="2 2" />
          <text x="180" y="44" class="lab">\u5E73\u8861</text>

          <!-- Spring (simple zigzag) -->
          <path [attr.d]="springPath()" fill="none" stroke="var(--accent)" stroke-width="2" />

          <!-- Mass -->
          <rect [attr.x]="massX() - 20" y="-22" width="40" height="44" rx="4"
            fill="var(--v0)" stroke="var(--text)" stroke-width="1.5" />
          <text [attr.x]="massX()" y="6" class="m-lab">m</text>
        </svg>
      </div>

      <!-- Time series x(t) -->
      <div class="ts-block">
        <div class="ts-title">\u4F4D\u7F6E\u96A8\u6642\u9593 x(t)</div>
        <svg viewBox="-20 -80 400 160" class="ts-svg">
          <line x1="0" y1="0" x2="370" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />

          <path [attr.d]="xCurvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

          <!-- Current time indicator -->
          <line [attr.x1]="t() * 30" y1="-70" [attr.x2]="t() * 30" y2="70"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" opacity="0.6" />
          <circle [attr.cx]="t() * 30" [attr.cy]="-state().x * 25" r="4" fill="var(--accent)" />
        </svg>
      </div>

      <!-- Phase portrait (x vs v) -->
      <div class="phase-block">
        <div class="ts-title">\u76F8\u5E73\u9762\uFF08x \u8DDF v\uFF09</div>
        <svg viewBox="-130 -130 260 260" class="phase-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />
          <text x="105" y="-4" class="ax-l">x</text>
          <text x="6" y="-100" class="ax-l">v</text>

          <path [attr.d]="phasePath()" fill="none" stroke="var(--accent)" stroke-width="2" />
          <circle [attr.cx]="state().x * 25" [attr.cy]="-state().v * 25" r="5" fill="var(--accent)" />
        </svg>
      </div>

      <!-- Sliders -->
      <div class="sliders">
        <div class="sl">
          <span class="sl-lab">c (\u963B\u5C3C)</span>
          <input type="range" min="0" max="4" step="0.1" [value]="c()" (input)="setC(+$any($event).target.value)" />
          <span class="sl-val">{{ c().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" max="12" step="0.05" [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>

      <div class="presets">
        <button class="pst-btn" (click)="setC(0)">\u7121\u963B\u5C3C\uFF08c=0\uFF09</button>
        <button class="pst-btn" (click)="setC(0.5)">\u6B20\u963B\u5C3C\uFF08c=0.5\uFF09</button>
        <button class="pst-btn" (click)="setC(2)">\u81E8\u754C\uFF08c=2\uFF09</button>
        <button class="pst-btn" (click)="setC(3)">\u904E\u963B\u5C3C\uFF08c=3\uFF09</button>
      </div>

      <div class="info" [class.under]="regime() === 'under'" [class.crit]="regime() === 'crit'" [class.over]="regime() === 'over'">
        <div class="info-row">
          <span class="il">m, k, c</span>
          <span class="iv">m=1, k=1, c={{ c().toFixed(1) }}</span>
        </div>
        <div class="info-row">
          <span class="il">\u5224\u5225\u5F0F</span>
          <span class="iv">c\u00B2 \u2212 4mk = {{ (c() * c() - 4).toFixed(2) }}</span>
        </div>
        <div class="info-row big">
          <span class="il">\u985E\u578B</span>
          <span class="iv"><strong>{{ regimeName() }}</strong></span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4E09\u7A2E\u985E\u578B\u5C0D\u61C9\u4E0A\u4E00\u7BC0\u7684\u4E09\u7A2E\u5206\u985E\uFF1A
      </p>
      <ul>
        <li><strong>\u6B20\u963B\u5C3C</strong>\uFF08c < 2\u221A(km)\uFF09\uFF1A\u8907\u7279\u5FB5\u503C\uFF0C\u7A69\u5B9A\u87BA\u65CB\u2192 \u632F\u76EA\u8B8A\u5C0F\u6700\u5F8C\u505C\u4F4F</li>
        <li><strong>\u81E8\u754C\u963B\u5C3C</strong>\uFF08c = 2\u221A(km)\uFF09\uFF1A\u91CD\u7279\u5FB5\u503C\u2192 \u4E0D\u632F\u76EA\u4F46\u6700\u5FEB\u5230\u9054\u5E73\u8861</li>
        <li><strong>\u904E\u963B\u5C3C</strong>\uFF08c > 2\u221A(km)\uFF09\uFF1A\u4E8C\u500B\u8CA0\u5BE6\u7279\u5FB5\u503C\u2192 \u7A69\u5B9A\u7BC0\u9EDE\uFF0C\u7DE9\u614B\u5230\u9054\u5E73\u8861</li>
      </ul>
      <p>
        \u6C7D\u8ECA\u907F\u9707\u5668\u8A2D\u8A08\u6210\u300C\u81E8\u754C\u963B\u5C3C\u300D \u2014 \u9019\u662F\u300C\u4E0D\u632F\u76EA\u4F46\u6700\u5FEB\u9759\u4E0B\u4F86\u300D\u7684\u9EC3\u91D1\u9EDE\u3002\u592A\u5C11\u963B\u5C3C\u4F60\u5C31\u8DF3\u500B\u4E0D\u505C\uFF0C\u592A\u591A\u4F60\u5C31\u50CF\u958B\u8ECA\u8DDF\u8DEF\u9762\u88AB\u643B\u8A0E\u5230\uFF0C\u591A\u4E45\u624D\u56DE\u9000\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7Bc0\u898B\u8B49\uFF1A\u53EA\u8981\u8B93\u65B9\u7A0B\u6C2F\u9EDE\u9EDE<strong>\u975E\u7DDA\u6027</strong>\uFF0C\u8336\u4E00\u5207\u90FD\u53EF\u80FD\u53D8\u6210\u300C\u6DF7\u6C8C\u300D\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.7;
      &.big { font-size: 18px; padding: 14px; } }

    .anim-block, .ts-block, .phase-block { padding: 10px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 12px; }
    .anim-title, .ts-title { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; text-align: center; }
    .spring-svg, .ts-svg, .phase-svg { width: 100%; max-width: 460px; display: block; margin: 0 auto; }
    .lab { font-size: 9px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .m-lab { font-size: 14px; fill: var(--text); text-anchor: middle; font-weight: 700; font-family: 'Noto Sans Math', serif; }
    .ax-l { font-size: 11px; fill: var(--text-muted); font-family: 'Noto Sans Math', serif; }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; color: var(--accent); min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 44px; text-align: right; }

    .presets { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pst-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
      &.under { border-color: rgba(141, 163, 181, 0.4); }
      &.crit { border-color: rgba(141, 163, 181, 0.6); }
      &.over { border-color: rgba(154, 171, 130, 0.4); } }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 14px; }
  `,
})
export class StepDampedOscillatorComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // Fixed: m = 1, k = 1
  readonly c = signal(0.5);
  readonly t = signal(0);

  // Initial state: x(0) = 1.5, v(0) = 0
  private readonly x0 = 1.5;
  private readonly v0 = 0;

  /** Compute analytical solution at time t. m=1, k=1. */
  private solve(t: number): { x: number; v: number } {
    const c = this.c();
    const disc = c * c - 4;
    if (disc < -1e-9) {
      // Underdamped: x(t) = e^(-c/2 t)(C1 cos(wd t) + C2 sin(wd t))
      const wd = Math.sqrt(4 - c * c) / 2;
      const alpha = c / 2;
      // x(0) = C1 = x0
      // v(0) = -alpha C1 + wd C2 = 0 → C2 = alpha x0 / wd
      const C1 = this.x0;
      const C2 = alpha * this.x0 / wd;
      const e = Math.exp(-alpha * t);
      const x = e * (C1 * Math.cos(wd * t) + C2 * Math.sin(wd * t));
      const v = e * (-alpha * (C1 * Math.cos(wd * t) + C2 * Math.sin(wd * t))
                + wd * (-C1 * Math.sin(wd * t) + C2 * Math.cos(wd * t)));
      return { x, v };
    } else if (disc > 1e-9) {
      // Overdamped: x(t) = C1 e^(λ1 t) + C2 e^(λ2 t)
      const sq = Math.sqrt(disc);
      const l1 = (-c + sq) / 2;
      const l2 = (-c - sq) / 2;
      // x(0) = C1 + C2 = x0
      // v(0) = l1 C1 + l2 C2 = 0
      // → C1 = -l2 x0 / (l1 - l2), C2 = l1 x0 / (l1 - l2)
      const denom = l1 - l2;
      const C1 = -l2 * this.x0 / denom;
      const C2 = l1 * this.x0 / denom;
      const x = C1 * Math.exp(l1 * t) + C2 * Math.exp(l2 * t);
      const v = l1 * C1 * Math.exp(l1 * t) + l2 * C2 * Math.exp(l2 * t);
      return { x, v };
    } else {
      // Critically damped: x(t) = (C1 + C2 t) e^(-c/2 t)
      const alpha = c / 2;
      // x(0) = C1 = x0
      // v(0) = C2 - alpha C1 = 0 → C2 = alpha x0
      const C1 = this.x0;
      const C2 = alpha * this.x0;
      const e = Math.exp(-alpha * t);
      const x = (C1 + C2 * t) * e;
      const v = C2 * e - alpha * (C1 + C2 * t) * e;
      return { x, v };
    }
  }

  readonly state = computed(() => this.solve(this.t()));

  // Mass position on screen: equilibrium at SVG x=180
  readonly massX = computed(() => 180 + this.state().x * 60);

  // Spring path from x=20 to mass position
  readonly springPath = computed(() => {
    const start = 20;
    const end = this.massX() - 20;
    const segments = 12;
    const segLen = (end - start) / segments;
    const amp = 8;
    let d = `M ${start} 0`;
    for (let i = 1; i < segments; i++) {
      const x = start + i * segLen;
      const y = (i % 2 === 0 ? 1 : -1) * amp;
      d += ` L ${x.toFixed(1)} ${y}`;
    }
    d += ` L ${end} 0`;
    return d;
  });

  readonly xCurvePath = computed(() => {
    const points: string[] = [];
    for (let i = 0; i <= 240; i++) {
      const t = i / 20; // 0 to 12
      const { x } = this.solve(t);
      const sx = t * 30;
      const sy = -Math.max(-70, Math.min(70, x * 25));
      points.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return 'M ' + points.join(' L ');
  });

  readonly phasePath = computed(() => {
    const points: string[] = [];
    for (let i = 0; i <= 240; i++) {
      const t = i / 20;
      const { x, v } = this.solve(t);
      const sx = Math.max(-130, Math.min(130, x * 25));
      const sy = Math.max(-130, Math.min(130, -v * 25));
      points.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return 'M ' + points.join(' L ');
  });

  readonly regime = computed<'under' | 'crit' | 'over'>(() => {
    const c = this.c();
    if (Math.abs(c - 2) < 0.05) return 'crit';
    return c < 2 ? 'under' : 'over';
  });

  readonly regimeName = computed(() => {
    const r = this.regime();
    if (r === 'under') return this.c() < 0.05 ? '\u7121\u963B\u5C3C\uFF08c = 0\uFF09\uFF1A\u632F\u76EA\u6C38\u4E0D\u8870\u9000' : '\u6B20\u963B\u5C3C\uFF1A\u632F\u76EA\u4E26\u8870\u9000';
    if (r === 'crit') return '\u81E8\u754C\u963B\u5C3C\uFF1A\u4E0D\u632F\u76EA\uFF0C\u6700\u5FEB\u5230\u9054\u5E73\u8861';
    return '\u904E\u963B\u5C3C\uFF1A\u4E0D\u632F\u76EA\uFF0C\u614A\u614A\u8077\u9000';
  });

  setC(v: number): void {
    this.c.set(v);
  }
}
