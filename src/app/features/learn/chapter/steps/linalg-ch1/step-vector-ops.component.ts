import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-vector-ops',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5411\u91CF\u7684\u52A0\u6CD5\u8207\u7D14\u91CF\u4E58\u6CD5" subtitle="\u00A71.2">
      <p>\u5411\u91CF\u6709\u5169\u500B\u57FA\u672C\u904B\u7B97\uFF0C\u9019\u5169\u500B\u904B\u7B97\u662F\u300C\u7DDA\u6027\u300D\u7684\u6838\u5FC3\uFF1A</p>
      <ul>
        <li><strong>\u52A0\u6CD5</strong>\uFF1Av + w = \u628A\u4E00\u500B\u5411\u91CF\u63A5\u5728\u53E6\u4E00\u500B\u7684\u5C3E\u5DF4\uFF0C\u770B\u8D77\u9EDE\u5230\u7D42\u9EDE</li>
        <li><strong>\u7D14\u91CF\u4E58\u6CD5</strong>\uFF1Acv = \u628A\u5411\u91CF\u4F38\u9577 c \u500D\uFF08c &lt; 0 \u6642\u53CD\u5411\uFF09</li>
      </ul>
    </app-prose-block>

    <!-- Addition -->
    <app-challenge-card prompt="\u62D6\u62FD\u4E0B\u9762\u7684\u6ED1\u6876\u8B8A\u52D5 v \u8207 w\uFF0C\u770B v + w \u600E\u9EBC\u51FA\u4F86">
      <div class="op-section">
        <div class="op-title">\u5411\u91CF\u52A0\u6CD5</div>
        <div class="grid-wrap">
          <svg viewBox="-110 -110 220 220" class="grid-svg">
            <!-- Grid -->
            @for (g of grid; track g) {
              <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.5" />
              <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.5" />
            }
            <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
            <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.2" />

            <!-- Parallelogram (faint guide) -->
            <polygon
              [attr.points]="'0,0 ' + vx() + ',' + (-vy()) + ' ' + (vx()+wx()) + ',' + (-(vy()+wy())) + ' ' + wx() + ',' + (-wy())"
              fill="var(--accent-10)" stroke="var(--accent-30)" stroke-width="0.5" stroke-dasharray="2 2" />

            <!-- v from origin -->
            <line x1="0" y1="0" [attr.x2]="vx()" [attr.y2]="-vy()"
              stroke="var(--v0)" stroke-width="3" marker-end="url(#tip-v)" />

            <!-- w from origin -->
            <line x1="0" y1="0" [attr.x2]="wx()" [attr.y2]="-wy()"
              stroke="var(--v1)" stroke-width="3" marker-end="url(#tip-w)" />

            <!-- w shifted to tip of v (showing tip-to-tail) -->
            <line [attr.x1]="vx()" [attr.y1]="-vy()"
              [attr.x2]="vx()+wx()" [attr.y2]="-(vy()+wy())"
              stroke="var(--v1)" stroke-width="2" stroke-dasharray="3 2" opacity="0.5" />

            <!-- v + w sum -->
            <line x1="0" y1="0" [attr.x2]="vx()+wx()" [attr.y2]="-(vy()+wy())"
              stroke="var(--accent)" stroke-width="3.5" marker-end="url(#tip-sum)" />

            <defs>
              <marker id="tip-v" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="var(--v0)" />
              </marker>
              <marker id="tip-w" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="var(--v1)" />
              </marker>
              <marker id="tip-sum" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="var(--accent)" />
              </marker>
            </defs>
          </svg>
        </div>

        <div class="sliders">
          <div class="sl">
            <span class="sl-lab" [style.color]="'var(--v0)'">v\u2093</span>
            <input type="range" min="-80" max="80" step="20" [value]="vx()" (input)="vx.set(+$any($event).target.value)" />
            <span class="sl-val">{{ vx()/20 }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab" [style.color]="'var(--v0)'">v\u1D67</span>
            <input type="range" min="-80" max="80" step="20" [value]="vy()" (input)="vy.set(+$any($event).target.value)" />
            <span class="sl-val">{{ vy()/20 }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab" [style.color]="'var(--v1)'">w\u2093</span>
            <input type="range" min="-80" max="80" step="20" [value]="wx()" (input)="wx.set(+$any($event).target.value)" />
            <span class="sl-val">{{ wx()/20 }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab" [style.color]="'var(--v1)'">w\u1D67</span>
            <input type="range" min="-80" max="80" step="20" [value]="wy()" (input)="wy.set(+$any($event).target.value)" />
            <span class="sl-val">{{ wy()/20 }}</span>
          </div>
        </div>

        <div class="formula">
          <span class="f-v">v = [{{ vx()/20 }}, {{ vy()/20 }}]</span>
          <span class="plus">+</span>
          <span class="f-w">w = [{{ wx()/20 }}, {{ wy()/20 }}]</span>
          <span class="eq">=</span>
          <span class="f-sum">[{{ (vx()+wx())/20 }}, {{ (vy()+wy())/20 }}]</span>
        </div>

        <div class="hint-box">
          \u52A0\u6CD5\u898F\u5247\uFF1A<strong>\u9010\u5750\u6A19\u76F8\u52A0</strong>\u3002\u5E7E\u4F55\u4E0A\u662F\u300C\u63A5\u5C3E\u5DF4\u300D\u6216\u300C\u5E73\u884C\u56DB\u908A\u5F62\u5C0D\u89D2\u7DDA\u300D\u3002
        </div>
      </div>
    </app-challenge-card>

    <!-- Scalar mult -->
    <app-challenge-card prompt="\u8ABF\u6574 c\uFF0C\u770B cv \u600E\u9EBC\u4F38\u7E2E">
      <div class="op-section">
        <div class="op-title">\u7D14\u91CF\u4E58\u6CD5</div>
        <div class="grid-wrap">
          <svg viewBox="-110 -110 220 220" class="grid-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.5" />
              <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.5" />
            }
            <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
            <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.2" />

            <!-- Original v (faint) -->
            <line x1="0" y1="0" x2="40" y2="-30"
              stroke="var(--v0)" stroke-width="2" opacity="0.4" stroke-dasharray="3 2" />

            <!-- cv -->
            <line x1="0" y1="0" [attr.x2]="cvx()" [attr.y2]="-cvy()"
              stroke="var(--accent)" stroke-width="3.5" marker-end="url(#tip-cv)" />

            <defs>
              <marker id="tip-cv" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0,8 3,0 6" fill="var(--accent)" />
              </marker>
            </defs>
          </svg>
        </div>

        <div class="sliders">
          <div class="sl">
            <span class="sl-lab">c</span>
            <input type="range" min="-200" max="200" step="25" [value]="c() * 100" (input)="c.set(+$any($event).target.value / 100)" />
            <span class="sl-val">{{ c() }}</span>
          </div>
        </div>

        <div class="formula">
          <span>c = {{ c() }}</span>
          <span>\u00B7</span>
          <span class="f-v">v = [2, 1.5]</span>
          <span class="eq">=</span>
          <span class="f-sum">[{{ (2*c()).toFixed(2) }}, {{ (1.5*c()).toFixed(2) }}]</span>
        </div>

        <div class="hint-box">
          \u7D14\u91CF\u4E58\u6CD5\uFF1A<strong>\u6BCF\u500B\u5750\u6A19\u90FD\u4E58 c</strong>\u3002\u5E7E\u4F55\u4E0A\u662F\u4F38\u9577\u3001\u7E2E\u77ED\uFF0C\u6216\u53CD\u5411\u3002
        </div>
      </div>
    </app-challenge-card>
  `,
  styles: `
    .op-section { padding: 4px 0; }
    .op-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .grid-svg { width: 100%; max-width: 320px; }

    .sliders { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; font-weight: 700; font-family: 'Noto Sans Math', serif; min-width: 24px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 32px; text-align: right; }

    .formula {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text); flex-wrap: wrap; margin-bottom: 10px;
    }
    .f-v { color: var(--v0); font-weight: 600; }
    .f-w { color: var(--v1); font-weight: 600; }
    .f-sum { color: var(--accent); font-weight: 700; }
    .plus, .eq { color: var(--text-muted); }

    .hint-box { padding: 8px 12px; border-radius: 6px; background: var(--accent-10);
      font-size: 12px; color: var(--text-secondary); strong { color: var(--text); } }
  `,
})
export class StepVectorOpsComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // v and w in SVG units (20 = 1 grid)
  readonly vx = signal(60);
  readonly vy = signal(40);
  readonly wx = signal(-40);
  readonly wy = signal(60);

  // scalar c (default 1.5)
  readonly c = signal(1.5);

  // cv computed (base v = (2, 1.5) in display, = (40, 30) in SVG)
  readonly cvx = computed(() => 40 * this.c());
  readonly cvy = computed(() => 30 * this.c());
}
