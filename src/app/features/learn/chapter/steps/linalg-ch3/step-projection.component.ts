import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-projection',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u6295\u5F71" subtitle="\u00A73.3">
      <p>
        \u300C<strong>w \u5728 v \u4E0A\u7684\u6295\u5F71</strong>\u300D\u662F w \u88FD\u9020\u51FA\u4E00\u500B\u8DDF v \u540C\u65B9\u5411\u7684\u5F71\u5B50\uFF0C
        \u9577\u5EA6\u662F\u300Cw \u6709\u591A\u5C11\u90E8\u5206\u8DDF v \u540C\u65B9\u5411\u300D\u3002
      </p>
      <p>
        \u516C\u5F0F\uFF1A
      </p>
      <p class="formula">proj\u1D65 w = (v \u00B7 w / v \u00B7 v) \u00B7 v</p>
      <p>
        \u9019\u500B\u516C\u5F0F\u8AAA\uFF1A\u62FF v \u672C\u8EAB\u4F86\u7E2E\u653E\uFF0C\u500D\u6578 = (v\u00B7w) / |v|\u00B2\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u6ED1\u6876\u8B8A\u5316 w\uFF0C\u770B\u5B83\u5728 v \u4E0A\u7684\u6295\u5F71\u600E\u9EBC\u8DDF\u8457\u52D5">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- v (the line we project onto) - extend through origin both ways -->
          <line [attr.x1]="-vx * 40" [attr.y1]="vy * 40" [attr.x2]="vx * 40" [attr.y2]="-vy * 40"
            stroke="var(--v0)" stroke-width="0.8" opacity="0.4" stroke-dasharray="3 3" />

          <!-- w -->
          <line x1="0" y1="0" [attr.x2]="wx() * 25" [attr.y2]="-wy() * 25"
            stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-pw)" />
          <text [attr.x]="wx() * 25 + 8" [attr.y]="-wy() * 25 - 4" class="vec-label" style="fill: var(--v1)">w</text>

          <!-- v vector (drawn after for visibility) -->
          <line x1="0" y1="0" [attr.x2]="vx * 25" [attr.y2]="-vy * 25"
            stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-pv)" />
          <text [attr.x]="vx * 25 + 8" [attr.y]="-vy * 25 - 4" class="vec-label" style="fill: var(--v0)">v</text>

          <!-- Projection vector along v's direction -->
          <line x1="0" y1="0" [attr.x2]="projX() * 25" [attr.y2]="-projY() * 25"
            stroke="var(--accent)" stroke-width="3" marker-end="url(#tip-pp)" />
          <text [attr.x]="projX() * 25 + 6" [attr.y]="-projY() * 25 + 16" class="vec-label" style="fill: var(--accent)">proj</text>

          <!-- Perpendicular drop from w to its projection -->
          <line [attr.x1]="wx() * 25" [attr.y1]="-wy() * 25"
            [attr.x2]="projX() * 25" [attr.y2]="-projY() * 25"
            stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="2 2" />

          <defs>
            <marker id="tip-pv" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-pw" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
            <marker id="tip-pp" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="sliders">
        <div class="sl"><span class="sl-lab">w\u2093</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="wx()" (input)="wx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ wx() }}</span></div>
        <div class="sl"><span class="sl-lab">w\u1D67</span>
          <input type="range" min="-3" max="3" step="0.5" [value]="wy()" (input)="wy.set(+$any($event).target.value)" />
          <span class="sl-val">{{ wy() }}</span></div>
      </div>

      <div class="calc">
        <div>v = ({{ vx }}, {{ vy }})\u3001v\u00B7v = {{ vDotV }}</div>
        <div>v\u00B7w = {{ vx }}\u00D7{{ wx() }} + {{ vy }}\u00D7{{ wy() }} = <strong>{{ vDotW().toFixed(2) }}</strong></div>
        <div>\u500D\u6578 = (v\u00B7w) / (v\u00B7v) = {{ scale().toFixed(3) }}</div>
        <div class="hl">proj\u1D65 w = {{ scale().toFixed(3) }} \u00B7 v = (<strong>{{ projX().toFixed(2) }}, {{ projY().toFixed(2) }}</strong>)</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u6CE8\u610F\u865B\u7DDA\u90E8\u5206\uFF1A\u5F9E w \u5230 proj 7\u662F\u5782\u76F4\u65BC v \u7684\u3002\u9019\u5C31\u662F\u300C\u6700\u8FD1\u9EDE\u300D\u7684\u610F\u601D \u2014
        proj \u662F v \u7684\u500D\u6578\u4E2D\u8DDF w <strong>\u8DDD\u96E2\u6700\u77ED</strong>\u7684\u90A3\u500B\u3002
      </p>
      <span class="hint">
        \u5982\u679C w \u672C\u8EAB\u8DDF v \u5782\u76F4\uFF0C\u90A3\u9EBC v\u00B7w = 0\uFF0C\u6295\u5F71\u4E5F\u662F\u96F6\u5411\u91CF\u3002\u4E0B\u4E00\u7BC0\u6B63\u5F0F\u4ECB\u7D39\u300C\u6B63\u4EA4\u300D\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 0; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .vec-label { font-size: 13px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; min-width: 28px; color: var(--v1); font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .calc { padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.7; }
    .calc > div { color: var(--text-secondary); }
    .calc strong { color: var(--text); font-size: 13px; }
    .calc .hl { color: var(--accent); padding-top: 4px; border-top: 1px solid var(--border); margin-top: 4px; }
    .calc .hl strong { color: var(--accent); font-size: 14px; }
  `,
})
export class StepProjectionComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // v is fixed
  readonly vx = 3;
  readonly vy = 1;
  readonly vDotV = this.vx * this.vx + this.vy * this.vy;

  // w is interactive
  readonly wx = signal(1);
  readonly wy = signal(2);

  readonly vDotW = computed(() => this.vx * this.wx() + this.vy * this.wy());
  readonly scale = computed(() => this.vDotW() / this.vDotV);
  readonly projX = computed(() => this.scale() * this.vx);
  readonly projY = computed(() => this.scale() * this.vy);
}
