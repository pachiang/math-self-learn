import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-why-complex',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u70BA\u4EC0\u9EBC\u9700\u8981\u8907\u6578" subtitle="\u00A710.1">
      <p>
        \u8003\u616E\u4E00\u500B\u6C38\u9060\u5B58\u5728\u4F46\u96A4\u8EAB\u7684\u7269\u4EF6\uFF1A<strong>\u65CB\u8F49\u77E9\u9663</strong>\u3002
        2D \u4E2D\u9006\u6642\u91DD\u8F49 \u03B8 \u5EA6\u7684\u77E9\u9663\u662F\uFF1A
      </p>
      <p class="formula">R(\u03B8) = [[cos\u03B8, -sin\u03B8], [sin\u03B8, cos\u03B8]]</p>
      <p>
        \u4ED6\u5728\u5BE6\u6578\u7684\u4E16\u754C\u88E1\u7565\u5C0D\u4E0D\u8D77 \u2014 \u9664\u4E86 \u03B8 = 0\u3001\u03C0 \u4EE5\u5916\uFF0C
        \u9019\u500B\u77E9\u9663<strong>\u6C92\u6709\u5BE6\u6578\u7279\u5FB5\u5411\u91CF</strong>\uFF01
      </p>
      <p>
        \u70BA\u4EC0\u9EBC\uFF1F\u56E0\u70BA\u300C\u88AB R(\u03B8) \u4F5C\u7528\u4E0D\u6539\u8B8A\u65B9\u5411\u300D\u7684\u5411\u91CF\u4E0D\u5B58\u5728\u2014\u96A8\u4FBF\u9078\u4E00\u500B\u5411\u91CF\uFF0C\u8F49\u4E86\u03B8 \u5EA6\u4E4B\u5F8C\uFF0C\u80A1\u4F11\u5BB6\u8B8A\u4E86\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 \u03B8 \u770B\u7279\u5FB5\u591A\u9805\u5F0F\u8DDF\u7279\u5FB5\u503C\u600E\u9EBC\u8B8A">
      <!-- Real plane: rotation visualised -->
      <div class="dual">
        <div class="dual-block">
          <div class="dual-title">\u5BE6\u5E73\u9762\uFF1A\u8F49 \u03B8</div>
          <svg viewBox="-130 -130 260 260" class="dual-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
            <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

            <!-- Original v -->
            <line x1="0" y1="0" x2="60" y2="-30"
              stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="3 3" />
            <text x="68" y="-32" class="lab" style="fill: var(--text-muted)">v</text>

            <!-- R(θ) v -->
            <line x1="0" y1="0" [attr.x2]="rvx() * 60 - ryy() * 30" [attr.y2]="-(rxy() * 60 + ryx() * 30)"
              stroke="var(--accent)" stroke-width="2.5" marker-end="url(#tip-rv)" />
            <text [attr.x]="rvx() * 60 - ryy() * 30 + 8" [attr.y]="-(rxy() * 60 + ryx() * 30) - 4"
              class="lab" style="fill: var(--accent)">R(\u03B8)v</text>

            <defs>
              <marker id="tip-rv" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
              </marker>
            </defs>
          </svg>
          <div class="dual-cap">v \u8DDF R(\u03B8)v <strong>\u4E0D\u5728\u540C\u4E00\u689D\u7DDA\u4E0A</strong> \u2014 \u4E0D\u662F\u7279\u5FB5\u5411\u91CF</div>
        </div>

        <!-- Complex plane with eigenvalues -->
        <div class="dual-block">
          <div class="dual-title">\u8907\u5E73\u9762\uFF1A\u7279\u5FB5\u503C</div>
          <svg viewBox="-130 -130 260 260" class="dual-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
            <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />
            <text x="105" y="-4" class="ax-l">Re</text>
            <text x="6" y="-100" class="ax-l">Im</text>

            <!-- Unit circle -->
            <circle cx="0" cy="0" r="80" fill="none" stroke="var(--accent-30)" stroke-width="1" stroke-dasharray="3 3" />

            <!-- λ₁ = e^(iθ) -->
            <circle [attr.cx]="80 * cos()" [attr.cy]="-80 * sin()" r="6"
              fill="var(--v0)" stroke="white" stroke-width="2" />
            <text [attr.x]="80 * cos() + 10" [attr.y]="-80 * sin() - 8" class="lab" style="fill: var(--v0)">\u03BB\u2081 = e^(i\u03B8)</text>

            <!-- λ₂ = e^(-iθ) -->
            <circle [attr.cx]="80 * cos()" [attr.cy]="80 * sin()" r="6"
              fill="var(--v1)" stroke="white" stroke-width="2" />
            <text [attr.x]="80 * cos() + 10" [attr.y]="80 * sin() + 14" class="lab" style="fill: var(--v1)">\u03BB\u2082 = e^(-i\u03B8)</text>
          </svg>
          <div class="dual-cap">\u5169\u500B\u7279\u5FB5\u503C\u662F<strong>\u8907\u6578</strong>\uFF0C\u5728\u55AE\u4F4D\u5713\u4E0A\u4E92\u70BA\u5171\u8EDB</div>
        </div>
      </div>

      <div class="theta-row">
        <span class="t-lab">\u03B8 =</span>
        <input type="range" min="0" max="360" step="5" [value]="thetaDeg()"
          (input)="thetaDeg.set(+$any($event).target.value)" />
        <span class="t-val">{{ thetaDeg() }}\u00B0</span>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">R(\u03B8)</span>
          <span class="iv">[[{{ cos().toFixed(2) }}, {{ (-sin()).toFixed(2) }}], [{{ sin().toFixed(2) }}, {{ cos().toFixed(2) }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">\u7279\u5FB5\u591A\u9805\u5F0F</span>
          <span class="iv">\u03BB\u00B2 \u2212 2cos\u03B8\u00B7\u03BB + 1 = 0</span>
        </div>
        <div class="info-row">
          <span class="il">\u5224\u5225\u5F0F</span>
          <span class="iv">4cos\u00B2\u03B8 \u2212 4 = {{ disc().toFixed(2) }}\uFF08\u4E0D\u5927\u65BC 0\uFF09</span>
        </div>
        <div class="info-row big">
          <span class="il">\u7279\u5FB5\u503C</span>
          <span class="iv">\u03BB = cos\u03B8 \u00B1 i sin\u03B8 = e^(\u00B1i\u03B8)
            = <strong>{{ cos().toFixed(2) }}</strong> \u00B1 <strong>{{ sin().toFixed(2) }}</strong>i</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u95DC\u9375\u89C0\u5BDF\uFF1A
      </p>
      <ul>
        <li>\u5224\u5225\u5F0F\u59CB\u7D42 \u2264 0\uFF0C\u6240\u4EE5\u7279\u5FB5\u503C\u4E00\u5B9A\u662F\u8907\u6578</li>
        <li>\u5169\u500B\u7279\u5FB5\u503C\u662F<strong>\u4E92\u70BA\u5171\u8EDB</strong></li>
        <li>\u5169\u500B\u7279\u5FB5\u503C\u7684\u6A21\u90FD\u662F 1\uFF08\u5728\u55AE\u4F4D\u5713\u4E0A\uFF09</li>
        <li>\u4ED6\u5011\u7684\u504F\u89D2\u662F \u00B1\u03B8</li>
      </ul>
      <p>
        \u9019\u4E0D\u662F\u5DE7\u5408\u3002\u8907\u6578\u7279\u5FB5\u503C\u662F<strong>\u300C\u65CB\u8F49\u300D</strong>\u9019\u500B\u5E7E\u4F55\u52D5\u4F5C\u7684\u4EE3\u6578\u8A18\u865F\uFF1A
        \u5BE6\u90E8\u4EE3\u8868\u300C\u8B8A\u5316\u7684\u500D\u6578\u300D\uFF0C\u865B\u90E8\u4EE3\u8868\u300C\u65CB\u8F49\u7684\u90E8\u5206\u300D\u3002
      </p>
      <p>
        \u8981\u52DD\u4EFB\u9019\u500B\u4EE3\u6578\uFF0C\u6211\u5011\u9700\u8981\u8B93\u5411\u91CF\u3001\u77E9\u9663\u3001\u5167\u7A4D\u90FD<strong>\u5165\u4F4F\u5728\u8907\u6578\u88E1</strong>\u3002\u4E0B\u4E00\u7BC0\u770B\u600E\u9EBC\u505A\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .dual { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;
      @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .dual-block { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .dual-title { font-size: 12px; color: var(--text-muted); font-weight: 600; text-align: center; margin-bottom: 6px; }
    .dual-svg { width: 100%; height: auto; }
    .dual-cap { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 4px;
      strong { color: var(--text); } }

    .lab { font-size: 11px; font-weight: 700; font-family: 'Noto Sans Math', serif; }
    .ax-l { font-size: 11px; fill: var(--text-muted); font-family: 'Noto Sans Math', serif; }

    .theta-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .t-lab { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .theta-row input { flex: 1; accent-color: var(--accent); }
    .t-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 48px; text-align: right; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 100px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 13px; }
  `,
})
export class StepWhyComplexComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly thetaDeg = signal(60);

  readonly cos = computed(() => Math.cos((this.thetaDeg() * Math.PI) / 180));
  readonly sin = computed(() => Math.sin((this.thetaDeg() * Math.PI) / 180));
  readonly disc = computed(() => 4 * this.cos() * this.cos() - 4);

  // Original test vector v = (1, 0.5) (in display units, will scale)
  readonly rvx = computed(() => this.cos());
  readonly rxy = computed(() => this.sin());
  readonly ryy = computed(() => this.cos());
  readonly ryx = computed(() => -this.sin());
}
