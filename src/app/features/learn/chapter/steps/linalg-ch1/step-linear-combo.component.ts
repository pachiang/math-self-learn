import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-linear-combo',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7DDA\u6027\u7D44\u5408" subtitle="\u00A71.3">
      <p>
        \u5C07\u5169\u500B\u5411\u91CF v\u3001w \u5404\u81EA\u4E58\u4E0A\u4E00\u500B\u7D14\u91CF\u7136\u5F8C\u76F8\u52A0\uFF0C\u5C31\u5F97\u5230\u4E00\u500B<strong>\u7DDA\u6027\u7D44\u5408</strong>\uFF1A
      </p>
      <p class="formula-display">\u03B1v + \u03B2w</p>
      <p>
        \u4E0B\u9762\u8ABF\u6574 \u03B1 \u8207 \u03B2 \u7684\u6ED1\u6876\uFF0C\u770B\u7D44\u5408\u51FA\u4F86\u7684\u5411\u91CF\u8DD1\u5230\u54EA\u88E1\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u8ABF\u6574 \u03B1\u3001\u03B2\uFF0C\u770B\u7D44\u5408\u8DEF\u5F91">
      <div class="grid-wrap">
        <svg viewBox="-110 -110 220 220" class="grid-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.5" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.5" />
          }
          <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.2" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.2" />

          <!-- Trail of past positions -->
          @for (t of trail(); track $index) {
            <circle [attr.cx]="t.x" [attr.cy]="-t.y" r="2" fill="var(--accent)" opacity="0.25" />
          }

          <!-- v scaled by alpha (faint) -->
          <line x1="0" y1="0" [attr.x2]="alpha() * vx" [attr.y2]="-alpha() * vy"
            stroke="var(--v0)" stroke-width="2" opacity="0.5" />
          <!-- w scaled by beta, drawn from tip of αv -->
          <line [attr.x1]="alpha() * vx" [attr.y1]="-alpha() * vy"
            [attr.x2]="alpha() * vx + beta() * wx" [attr.y2]="-(alpha() * vy + beta() * wy)"
            stroke="var(--v1)" stroke-width="2" opacity="0.5" />

          <!-- Reference v and w (full) -->
          <line x1="0" y1="0" [attr.x2]="vx" [attr.y2]="-vy"
            stroke="var(--v0)" stroke-width="2.5" stroke-dasharray="3 3" opacity="0.6" marker-end="url(#tip-v3)" />
          <line x1="0" y1="0" [attr.x2]="wx" [attr.y2]="-wy"
            stroke="var(--v1)" stroke-width="2.5" stroke-dasharray="3 3" opacity="0.6" marker-end="url(#tip-w3)" />

          <!-- Resulting combo -->
          <line x1="0" y1="0"
            [attr.x2]="alpha() * vx + beta() * wx" [attr.y2]="-(alpha() * vy + beta() * wy)"
            stroke="var(--accent)" stroke-width="3.5" marker-end="url(#tip-c3)" />

          <circle [attr.cx]="alpha() * vx + beta() * wx" [attr.cy]="-(alpha() * vy + beta() * wy)"
            r="6" fill="var(--accent)" stroke="white" stroke-width="2" />

          <defs>
            <marker id="tip-v3" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--v0)" />
            </marker>
            <marker id="tip-w3" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--v1)" />
            </marker>
            <marker id="tip-c3" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="sliders">
        <div class="sl">
          <span class="sl-lab" [style.color]="'var(--v0)'">\u03B1</span>
          <input type="range" min="-200" max="200" step="25" [value]="alpha() * 100"
            (input)="setAlpha(+$any($event).target.value / 100)" />
          <span class="sl-val">{{ alpha() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab" [style.color]="'var(--v1)'">\u03B2</span>
          <input type="range" min="-200" max="200" step="25" [value]="beta() * 100"
            (input)="setBeta(+$any($event).target.value / 100)" />
          <span class="sl-val">{{ beta() }}</span>
        </div>
      </div>

      <div class="formula">
        <span class="f-a">{{ alpha() }}</span>
        <span class="f-v">v</span>
        <span class="op">+</span>
        <span class="f-b">{{ beta() }}</span>
        <span class="f-w">w</span>
        <span class="op">=</span>
        <span class="f-r">[{{ (alpha() * vx / 20 + beta() * wx / 20).toFixed(2) }},
          {{ (alpha() * vy / 20 + beta() * wy / 20).toFixed(2) }}]</span>
      </div>

      <button class="clear-btn" (click)="clearTrail()">\u6E05\u9664\u8ECC\u8DE1</button>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8A66\u8A66\u770B\uFF1A\u80FD\u4E0D\u80FD\u8B93\u7DDA\u6027\u7D44\u5408\u8DD1\u5230\u4EFB\u4F55\u4F60\u60F3\u8981\u7684\u5730\u65B9\uFF1F
        \u4E0B\u4E00\u7BC0\u6211\u5011\u7CFB\u7D71\u6027\u5730\u770B\uFF1A\u9019\u4E9B\u7D44\u5408\u300C\u80FD\u5230\u9054\u300D\u7684\u6240\u6709\u9EDE\uFF0C\u53EB\u505A <strong>span</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula-display { text-align: center; font-size: 22px; font-weight: 700; color: var(--accent);
      font-family: 'Noto Sans Math', serif; padding: 6px 0; }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .grid-svg { width: 100%; max-width: 320px; }

    .sliders { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 16px; font-weight: 700; font-family: 'Noto Sans Math', serif; min-width: 20px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .formula { display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace; font-size: 13px; flex-wrap: wrap; margin-bottom: 10px; }
    .f-a { color: var(--v0); font-weight: 700; }
    .f-b { color: var(--v1); font-weight: 700; }
    .f-v { color: var(--v0); font-style: italic; }
    .f-w { color: var(--v1); font-style: italic; }
    .f-r { color: var(--accent); font-weight: 700; }
    .op { color: var(--text-muted); }

    .clear-btn {
      padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
    }
  `,
})
export class StepLinearComboComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  // v = (2, 1) in display = (40, 20) in SVG
  // w = (-1, 2) in display = (-20, 40) in SVG
  readonly vx = 40;
  readonly vy = 20;
  readonly wx = -20;
  readonly wy = 40;

  readonly alpha = signal(1);
  readonly beta = signal(1);
  readonly trail = signal<{ x: number; y: number }[]>([]);

  setAlpha(v: number): void {
    this.alpha.set(v);
    this.addTrail();
  }

  setBeta(v: number): void {
    this.beta.set(v);
    this.addTrail();
  }

  private addTrail(): void {
    const x = this.alpha() * this.vx + this.beta() * this.wx;
    const y = this.alpha() * this.vy + this.beta() * this.wy;
    this.trail.update((t) => {
      const next = [...t, { x, y }];
      return next.length > 60 ? next.slice(-60) : next;
    });
  }

  clearTrail(): void {
    this.trail.set([]);
  }
}
