import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-dot-product',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u9EDE\u7A4D\uFF1A\u4E58\u6CD5\u89C0\u9EDE" subtitle="\u00A73.1">
      <p>
        \u5169\u500B\u5411\u91CF\u7684<strong>\u9EDE\u7A4D</strong>\uFF08dot product / inner product\uFF09\u662F\u4E00\u500B\u8DDF\u5169\u500B\u5411\u91CF\u90FD\u6709\u95DC\u7684<strong>\u6578\u5B57</strong>\uFF08\u4E0D\u662F\u5411\u91CF\uFF09\u3002
      </p>
      <p>
        \u4EE3\u6578\u5B9A\u7FA9\u5F88\u7C21\u55AE\uFF1A\u9010\u9805\u76F8\u4E58\u518D\u52A0\u8D77\u4F86\u3002
      </p>
      <p class="formula">v \u00B7 w = v\u2081w\u2081 + v\u2082w\u2082 + ... + v\u2099w\u2099</p>
      <p>
        \u5728 \u211D\u00B2 \u88E1\u5C31\u662F\u5169\u9805\uFF1Av\u00B7w = v\u2081w\u2081 + v\u2082w\u2082\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u6ED1\u6876\u8B8A\u5316 v \u8207 w\uFF0C\u770B\u9EDE\u7A4D\u600E\u9EBC\u8A08\u7B97">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <line x1="0" y1="0" [attr.x2]="vx() * 25" [attr.y2]="-vy() * 25"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-dv)" />
          <text [attr.x]="vx() * 25 + 8" [attr.y]="-vy() * 25 - 4" class="vec-label" style="fill: var(--v0)">v</text>

          <line x1="0" y1="0" [attr.x2]="wx() * 25" [attr.y2]="-wy() * 25"
            stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-dw)" />
          <text [attr.x]="wx() * 25 + 8" [attr.y]="-wy() * 25 - 4" class="vec-label" style="fill: var(--v1)">w</text>

          <defs>
            <marker id="tip-dv" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-dw" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="sliders">
        <div class="sl"><span class="sl-lab vc">v\u2093</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="vx()" (input)="vx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ vx() }}</span></div>
        <div class="sl"><span class="sl-lab vc">v\u1D67</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="vy()" (input)="vy.set(+$any($event).target.value)" />
          <span class="sl-val">{{ vy() }}</span></div>
        <div class="sl"><span class="sl-lab wc">w\u2093</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="wx()" (input)="wx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ wx() }}</span></div>
        <div class="sl"><span class="sl-lab wc">w\u1D67</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="wy()" (input)="wy.set(+$any($event).target.value)" />
          <span class="sl-val">{{ wy() }}</span></div>
      </div>

      <div class="calc">
        <div class="calc-line">
          v \u00B7 w =
          <span class="t1">{{ vx() }}</span> \u00D7 <span class="t1">{{ wx() }}</span>
          <span class="op">+</span>
          <span class="t2">{{ vy() }}</span> \u00D7 <span class="t2">{{ wy() }}</span>
        </div>
        <div class="calc-line">
          =
          <span class="t1">{{ (vx() * wx()).toFixed(2) }}</span>
          <span class="op">+</span>
          <span class="t2">{{ (vy() * wy()).toFixed(2) }}</span>
        </div>
        <div class="calc-result" [class.pos]="dot() > 0" [class.neg]="dot() < 0" [class.zer]="dot() === 0">
          = <strong>{{ dot().toFixed(2) }}</strong>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9EDE\u7A4D\u770B\u8D77\u4F86\u53EA\u662F\u4E00\u500B\u516C\u5F0F\uFF0C\u4F46\u5B83\u7684\u7D50\u679C\u85CF\u8457<strong>\u8C50\u5BCC\u7684\u5E7E\u4F55\u8CC7\u8A0A</strong>\uFF1A
        \u9577\u5EA6\u3001\u89D2\u5EA6\u3001\u662F\u5426\u5782\u76F4\u3002\u4E0B\u4E00\u7BC0\u770B\u9019\u500B\u806F\u7E6B\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 17px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 0; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .vec-label { font-size: 14px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; min-width: 28px; font-family: 'Noto Sans Math', serif;
      &.vc { color: var(--v0); } &.wc { color: var(--v1); } }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .calc { padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace; }
    .calc-line { font-size: 14px; color: var(--text); margin-bottom: 4px; text-align: center; }
    .t1, .t2 { padding: 1px 6px; border-radius: 3px; font-weight: 700; }
    .t1 { background: rgba(191, 158, 147, 0.18); color: var(--v0); }
    .t2 { background: rgba(141, 163, 181, 0.18); color: var(--v1); }
    .op { color: var(--text-muted); padding: 0 4px; }
    .calc-result { font-size: 18px; text-align: center; margin-top: 6px;
      strong { font-size: 22px; }
      &.pos strong { color: #5a8a5a; }
      &.neg strong { color: #a05a5a; }
      &.zer strong { color: #d4a14b; } }
  `,
})
export class StepDotProductComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly vx = signal(2);
  readonly vy = signal(1);
  readonly wx = signal(1);
  readonly wy = signal(2);
  readonly dot = computed(() => this.vx() * this.wx() + this.vy() * this.wy());
}
