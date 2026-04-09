import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-1d-ode',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5F9E 1D \u7D14\u91CF ODE \u958B\u59CB" subtitle="\u00A79.1">
      <p>
        \u52D5\u529B\u7CFB\u7D71\u5728\u554F\u7684\u4E8B\uFF1A\u300C\u4E1F\u4E00\u500B\u72C0\u614B\u9032\u53BB\uFF0C\u5B83\u600E\u9EBC<strong>\u96A8\u6642\u9593\u6F14\u5316</strong>\uFF1F\u300D
      </p>
      <p>
        \u6700\u7C21\u55AE\u7684\u5BE6\u4F8B\uFF1A1D \u7DDA\u6027 ODE\u3002
      </p>
      <p class="formula">dx/dt = a x</p>
      <p>
        \u9019\u53E5\u8A71\u8AAA\uFF1A<strong>\u72C0\u614B\u8B8A\u5316\u7684\u901F\u5EA6 \u8DDF \u72C0\u614B\u672C\u8EAB\u6210\u6B63\u6BD4</strong>\u3002\u4F8B\u5982\uFF1A
      </p>
      <ul>
        <li>\u4EBA\u53E3\u589E\u9577\uFF1A\u8D8A\u591A\u4EBA\u751F\u8D8A\u591A\u5C0F\u5B69\uFF08a > 0\uFF09</li>
        <li>\u653E\u5C04\u6027\u8870\u8B8A\uFF1A\u8D8A\u591A\u539F\u5B50\u8870\u8B8A\u8D8A\u5FEB\uFF08a < 0\uFF09</li>
        <li>\u5229\u606F\uFF1A\u672C\u91D1\u8D8A\u591A\u5229\u606F\u8D8A\u591A</li>
      </ul>
      <p>
        \u9019\u500B\u65B9\u7A0B\u7684\u89E3\u662F\u4E00\u500B<strong>\u6307\u6578\u51FD\u6578</strong>\uFF1A
      </p>
      <p class="formula big">x(t) = e<sup>at</sup> \u00B7 x\u2080</p>
      <p>
        a \u7684<strong>\u7B26\u865F</strong>\u6C7A\u5B9A\u4E86\u4E00\u5207\uFF1A
      </p>
      <ul>
        <li>a > 0 \u2192 \u6307\u6578<strong>\u589E\u9577</strong>\uFF08\u8DD1\u5230\u7121\u7A77\uFF09</li>
        <li>a < 0 \u2192 \u6307\u6578<strong>\u8870\u9000</strong>\uFF08\u8DD1\u5230 0\uFF09</li>
        <li>a = 0 \u2192 <strong>\u4E0D\u52D5</strong>\uFF08\u4FDD\u6301 x\u2080\uFF09</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 a \u7684\u6ED1\u6876\uFF0C\u770B\u72C0\u614B\u968F\u6642\u9593\u600E\u9EBC\u8B8A\u5316">
      <!-- Phase line: a horizontal axis with arrows showing direction of motion -->
      <div class="viz-block">
        <div class="viz-title">\u76F8\u7DDA\uFF08x \u8EF8\u4E0A\u6BCF\u500B\u9EDE\u7684\u300C\u901F\u5EA6\u300D\uFF09</div>
        <svg viewBox="-150 -40 300 80" class="phase-svg">
          <line x1="-130" y1="0" x2="130" y2="0" stroke="var(--text)" stroke-width="1.5" />
          <!-- Tick marks -->
          @for (k of ticks; track k) {
            <line [attr.x1]="k * 25" y1="-4" [attr.x2]="k * 25" y2="4" stroke="var(--text-muted)" stroke-width="1" />
            <text [attr.x]="k * 25" y="18" class="tick-lab">{{ k }}</text>
          }
          <!-- Equilibrium dot at x=0 -->
          <circle cx="0" cy="0" r="4" fill="var(--text)" stroke="white" stroke-width="1.5" />
          <text x="0" y="-12" class="eq-lab">x=0</text>

          <!-- Arrows showing dx/dt = ax direction at each point -->
          @for (k of arrowPos; track k) {
            <line [attr.x1]="k * 25" y1="0" [attr.x2]="k * 25 + arrowSign(k) * 18" y2="0"
              [attr.stroke]="arrowColor()" stroke-width="2.5" marker-end="url(#tip-1d)" />
          }

          <defs>
            <marker id="tip-1d" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" [attr.fill]="arrowColor()" />
            </marker>
          </defs>

          <!-- Animated current state -->
          <circle [attr.cx]="currentX() * 25" cy="0" r="6"
            fill="var(--accent)" stroke="white" stroke-width="2" />
        </svg>
        <div class="phase-caption">\u7BAD\u982D = \u901F\u5EA6\u3002\u85CD\u9EDE = \u73FE\u5728\u72C0\u614B\u3002</div>
      </div>

      <!-- Time series -->
      <div class="viz-block">
        <div class="viz-title">\u72C0\u614B\u96A8\u6642\u9593\u8B8A\u5316\uFF1Ax(t) = e<sup>at</sup> x\u2080</div>
        <svg viewBox="-20 -110 360 220" class="ts-svg">
          <!-- Axes -->
          <line x1="0" y1="100" x2="320" y2="100" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1" />
          <text x="324" y="104" class="axis-lab">t</text>
          <text x="-12" y="-100" class="axis-lab">x(t)</text>

          <!-- Grid lines -->
          @for (k of [-3, -2, -1, 1, 2, 3]; track k) {
            <line x1="0" [attr.y1]="-k * 25" x2="320" [attr.y2]="-k * 25"
              stroke="var(--border)" stroke-width="0.5" />
            <text x="-4" [attr.y]="-k * 25 + 4" class="tick-lab right">{{ k }}</text>
          }
          @for (k of [1, 2, 3, 4]; track k) {
            <line [attr.x1]="k * 70" y1="-100" [attr.x2]="k * 70" y2="100"
              stroke="var(--border)" stroke-width="0.5" />
            <text [attr.x]="k * 70" y="115" class="tick-lab">{{ k }}</text>
          }

          <!-- The curve x(t) = e^(at) x_0 -->
          <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

          <!-- Current time indicator -->
          <line [attr.x1]="t() * 70" y1="-100" [attr.x2]="t() * 70" y2="100"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" opacity="0.6" />
          <circle [attr.cx]="t() * 70" [attr.cy]="-currentX() * 25" r="5"
            fill="var(--accent)" stroke="white" stroke-width="2" />
        </svg>
      </div>

      <!-- Sliders -->
      <div class="sliders">
        <div class="sl">
          <span class="sl-lab">a =</span>
          <input type="range" min="-1.5" max="1.5" step="0.1" [value]="a()"
            (input)="a.set(+$any($event).target.value)" />
          <span class="sl-val">{{ a().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">t =</span>
          <input type="range" min="0" max="4" step="0.05" [value]="t()"
            (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">x\u2080 =</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="x0()"
            (input)="x0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ x0().toFixed(1) }}</span>
        </div>
      </div>

      <div class="info" [class.grow]="a() > 0.05" [class.decay]="a() < -0.05" [class.steady]="Math.abs(a()) <= 0.05">
        <div class="info-row">
          <span class="il">x(t)</span>
          <span class="iv">e<sup>{{ a().toFixed(1) }}\u00B7{{ t().toFixed(2) }}</sup> \u00D7 {{ x0().toFixed(1) }} = <strong>{{ currentX().toFixed(3) }}</strong></span>
        </div>
        <div class="info-row">
          <span class="il">\u884C\u70BA</span>
          <span class="iv">
            @if (a() > 0.05) { \u6307\u6578\u589E\u9577 \u2192 \u8DD1\u5411\u7121\u7A77 }
            @else if (a() < -0.05) { \u6307\u6578\u8870\u9000 \u2192 \u8DD1\u5411 0 }
            @else { \u51E0\u4E4E\u4E0D\u52D5\uFF08a \u2248 0\uFF09 }
          </span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u500B 1D \u4F8B\u5B50\u53EA\u6709\u300C\u4E00\u500B\u8B8A\u6578 x\u300D\u3002\u4F46\u73FE\u5BE6\u4E16\u754C\u7684\u52D5\u529B\u7CFB\u7D71\u5F88\u5C11\u9019\u9EBC\u7C21\u55AE\u3002
      </p>
      <ul>
        <li>\u96EB\u8001\u9F20\u7684\u6578\u91CF\uFF1A\u9700\u8981\u8FFD\u8E64<strong>\u5169\u500B</strong>\u8B8A\u6578\uFF08\u96EA\u8005 \u8DDF \u8001\u9F20\u7684\u6578\u91CF\uFF09</li>
        <li>\u91CF\u5B50\u614B\uFF1A\u9700\u8981\u8FFD\u8E64<strong>\u5169\u500B</strong>\u8907\u6578\u578B\u632F\u5E45</li>
        <li>\u8966\u6578\u96FB\u8DEF\uFF1A\u9700\u8981\u8FFD\u8E64\u96FB\u5BB9\u96FB\u58D3\u8DDF\u96FB\u611F\u96FB\u6D41</li>
      </ul>
      <p>
        \u9019\u4E9B\u90FD\u662F<strong>\u5411\u91CF\u72C0\u614B</strong>\u3002\u63DB\u53E5\u8A71\u8AAA\uFF0C\u72C0\u614B\u4E0D\u662F\u4E00\u500B\u6578\u5B57\uFF0C\u662F\u4E00\u500B<strong>\u5411\u91CF</strong>\u3002
        \u900F\u904E\u4E0D\u540C\u7684\u8B8A\u6578\u5F7C\u6B64\u6709\u4EA4\u4E92\u4F5C\u7528\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u6211\u5011\u770B\u9019\u500B\u65B9\u7A0B\u600E\u9EBC\u63A8\u5EE3\u5230\u5411\u91CF\u7248\u672C\uFF1A
      </p>
      <p class="formula big">dx/dt = A x</p>
      <p>
        \u5176\u4E2D x \u662F\u5411\u91CF\u3001A \u662F\u77E9\u9663\u3002\u9019\u5C31\u662F\u300C\u7DDA\u6027\u52D5\u529B\u7CFB\u7D71\u300D\u7684\u898F\u683C\u5F62\u5F0F\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 26px; padding: 18px; } }

    .viz-block { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 12px; }
    .viz-title { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; text-align: center; }

    .phase-svg, .ts-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto; }
    .phase-caption { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 4px; }

    .tick-lab { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
      &.right { text-anchor: end; } }
    .axis-lab { font-size: 11px; fill: var(--text-muted); font-family: 'Noto Sans Math', serif; }
    .eq-lab { font-size: 9px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; font-weight: 700; color: var(--accent); min-width: 32px;
      font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 44px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
      &.grow { border-color: rgba(160, 90, 90, 0.3); }
      &.decay { border-color: rgba(90, 138, 90, 0.3); } }
    .info-row { display: grid; grid-template-columns: 70px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .il { padding: 8px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 8px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 14px; }
  `,
})
export class Step1dOdeComponent {
  readonly Math = Math;
  readonly ticks = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
  readonly arrowPos = [-4, -3, -2, -1, 1, 2, 3, 4];

  readonly a = signal(-0.5);
  readonly t = signal(1.0);
  readonly x0 = signal(1.5);

  readonly currentX = computed(() => this.x0() * Math.exp(this.a() * this.t()));

  arrowSign(k: number): number {
    const v = this.a() * k; // dx/dt at this x
    return Math.sign(v);
  }

  arrowColor(): string {
    if (this.a() > 0.05) return '#a05a5a';
    if (this.a() < -0.05) return '#5a8a5a';
    return 'var(--text-muted)';
  }

  readonly curvePath = computed(() => {
    const a = this.a();
    const x0 = this.x0();
    const points: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i * 0.05; // 0 to 4
      const x = x0 * Math.exp(a * t);
      const sx = t * 70;
      const sy = -Math.max(-100, Math.min(100, x * 25));
      points.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return 'M ' + points.join(' L ');
  });
}
