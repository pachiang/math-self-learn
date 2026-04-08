import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-determinant',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u884C\u5217\u5F0F = \u9762\u7A4D\u7E2E\u653E\u56E0\u5B50" subtitle="\u00A72.5">
      <p>
        \u8B8A\u63DB\u4E4B\u524D\uFF0C\u55AE\u4F4D\u6B63\u65B9\u5F62\uFF08\u00EA\u2081 \u8207 \u00EA\u2082 \u5F35\u51FA\u4F86\u7684\uFF09\u9762\u7A4D = 1\u3002
        \u8B8A\u63DB\u4E4B\u5F8C\uFF0C\u5B83\u8B8A\u6210\u4E00\u500B\u5E73\u884C\u56DB\u908A\u5F62\u3002
      </p>
      <p>
        \u9019\u500B\u5E73\u884C\u56DB\u908A\u5F62\u7684\u6709\u865F\u9762\u7A4D\uFF0C\u5C31\u662F\u77E9\u9663\u7684<strong>\u884C\u5217\u5F0F</strong> det(M)\u3002
      </p>
      <p class="formula">det \u00B7 [a, b; c, d] = ad \u2212 bc</p>
      <ul>
        <li>det &gt; 0\uFF1A\u4FDD\u6301\u65B9\u5411</li>
        <li>det &lt; 0\uFF1A\u53CD\u8F49\u65B9\u5411\uFF08\u7E54\u8B8A\uFF09</li>
        <li>det = 0\uFF1A\u5854\u9677 \u2014 \u5E73\u9762\u88AB\u58D3\u6210\u4E00\u689D\u7DDA</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u52D5\u6ED1\u6876\uFF0C\u770B\u5E73\u884C\u56DB\u908A\u5F62\u9762\u7A4D\u8DDF det \u540C\u6B65">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of refGrid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Original unit square (faint) -->
          <rect x="0" y="-40" width="40" height="40" fill="var(--text-muted)" opacity="0.1"
            stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="2 2" />

          <!-- Transformed parallelogram -->
          <polygon
            [attr.points]="parallelogramPoints()"
            [attr.fill]="det() >= 0 ? 'var(--accent)' : '#a05a5a'"
            opacity="0.25"
            [attr.stroke]="det() >= 0 ? 'var(--accent)' : '#a05a5a'"
            stroke-width="2" />

          <!-- Basis vectors -->
          <line x1="0" y1="0" [attr.x2]="40 * a()" [attr.y2]="-40 * c()"
            stroke="var(--v0)" stroke-width="2.2" marker-end="url(#tip-d1)" />
          <line x1="0" y1="0" [attr.x2]="40 * b()" [attr.y2]="-40 * d()"
            stroke="var(--v1)" stroke-width="2.2" marker-end="url(#tip-d2)" />

          <defs>
            <marker id="tip-d1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-d2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <!-- Matrix legend: shows where each slider goes in M -->
      <div class="matrix-legend">
        <span class="ml-lab">M =</span>
        <div class="ml-bracket">[</div>
        <div class="ml-body">
          <div class="ml-row">
            <span class="ml-cell col-1">a = {{ a() }}</span>
            <span class="ml-cell col-2">b = {{ b() }}</span>
          </div>
          <div class="ml-row">
            <span class="ml-cell col-1">c = {{ c() }}</span>
            <span class="ml-cell col-2">d = {{ d() }}</span>
          </div>
        </div>
        <div class="ml-bracket">]</div>
        <div class="ml-tags">
          <span class="ml-tag col-1">T(\u00EA\u2081)</span>
          <span class="ml-tag col-2">T(\u00EA\u2082)</span>
        </div>
      </div>

      <div class="sliders">
        <div class="sl-row">
          <span class="sl-lab col-1">a</span>
          <input type="range" min="-2" max="2" step="0.25" [value]="a()" (input)="a.set(+$any($event).target.value)" />
          <span class="sl-val">{{ a() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab col-2">b</span>
          <input type="range" min="-2" max="2" step="0.25" [value]="b()" (input)="b.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab col-1">c</span>
          <input type="range" min="-2" max="2" step="0.25" [value]="c()" (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab col-2">d</span>
          <input type="range" min="-2" max="2" step="0.25" [value]="d()" (input)="d.set(+$any($event).target.value)" />
          <span class="sl-val">{{ d() }}</span>
        </div>
      </div>

      <div class="det-display" [class.positive]="det() > 0" [class.negative]="det() < 0" [class.zero]="det() === 0">
        <div class="det-line">
          <span class="det-formula">
            det =
            <span class="cell-inline col-1">a</span>\u00B7<span class="cell-inline col-2">d</span>
            \u2212
            <span class="cell-inline col-2">b</span>\u00B7<span class="cell-inline col-1">c</span>
            =
            <span class="cell-inline col-1">{{ a() }}</span>\u00B7<span class="cell-inline col-2">{{ d() }}</span>
            \u2212
            <span class="cell-inline col-2">{{ b() }}</span>\u00B7<span class="cell-inline col-1">{{ c() }}</span>
          </span>
          <span class="det-eq">=</span>
          <span class="det-value">{{ det().toFixed(2) }}</span>
        </div>
        <div class="det-meaning">
          @if (det() > 0) {
            \u9762\u7A4D\u7E2E\u653E\u4E86 {{ Math.abs(det()).toFixed(2) }} \u500D\uFF0C\u4FDD\u6301\u65B9\u5411
          } @else if (det() < 0) {
            \u9762\u7A4D\u7E2E\u653E\u4E86 {{ Math.abs(det()).toFixed(2) }} \u500D\uFF0C\u4F46\u65B9\u5411\u88AB\u7FFB\u8F49\u4E86
          } @else {
            \u5854\u9677\uFF1A\u5169\u500B\u5411\u91CF\u5171\u7DDA\uFF0C\u5E73\u9762\u88AB\u58D3\u6210\u4E00\u689D\u7DDA
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u884C\u5217\u5F0F\u4E0D\u662F\u96A8\u4FBF\u7684\u516C\u5F0F ad \u2212 bc \u2014 \u5B83\u662F\u4E00\u500B<strong>\u5E7E\u4F55\u91CF</strong>\uFF1A
        \u8B8A\u63DB\u628A\u9762\u7A4D\u653E\u5927\u6216\u7E2E\u5C0F\u4E86\u591A\u5C11\u500D\u3002
      </p>
      <span class="hint">
        \u884C\u5217\u5F0F\u70BA\u96F6\u662F\u4E00\u500B\u5316\u8EAB\u8B66\u5831\u2014 \u8B8A\u63DB\u628A\u4E00\u4E9B\u8CC7\u8A0A\u300C\u58D3\u6389\u300D\u4E86\uFF0C\u4E0D\u53EF\u9006\u8F49\u3002\u4E0B\u4E00\u7BC0\u898B\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 8px 0; }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 340px; }

    /* ── Matrix legend ── */
    .matrix-legend {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 12px 14px; margin-bottom: 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface);
      flex-wrap: wrap;
    }
    .ml-lab { font-size: 14px; font-weight: 600; color: var(--text-muted); margin-right: 4px; }
    .ml-bracket { font-size: 40px; font-weight: 200; color: var(--text-muted); line-height: 0.9; }
    .ml-body { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
    .ml-row { display: flex; gap: 6px; }
    .ml-cell {
      min-width: 56px; padding: 4px 10px; text-align: center;
      font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      border-radius: 4px;
    }
    .ml-tags { display: flex; flex-direction: column; gap: 4px; margin-left: 4px; }
    .ml-tag { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px;
      font-family: 'Noto Sans Math', serif; text-align: center; }

    /* Column colours (consistent with §2.3) */
    .col-1 { background: rgba(191, 158, 147, 0.18); color: var(--v0); }
    .col-2 { background: rgba(141, 163, 181, 0.18); color: var(--v1); }

    .sliders { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;
      padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .sl-row { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      min-width: 24px; padding: 2px 6px; border-radius: 4px; text-align: center; }
    .sl-row input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    /* Inline cells in the det formula */
    .cell-inline { padding: 1px 6px; border-radius: 3px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; }

    .det-display { padding: 14px 18px; border-radius: 10px; border: 2px solid;
      &.positive { border-color: var(--accent); background: var(--accent-10); }
      &.negative { border-color: #a05a5a; background: rgba(160,90,90,0.08); }
      &.zero { border-color: #d4a14b; background: rgba(212,161,75,0.08); }
    }
    .det-line { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text); margin-bottom: 6px; }
    .det-formula { color: var(--text-secondary); }
    .det-eq { color: var(--text-muted); }
    .det-value { font-size: 22px; font-weight: 800;
      .positive & { color: var(--accent); } .negative & { color: #a05a5a; } .zero & { color: #d4a14b; } }
    .det-meaning { font-size: 12px; text-align: center; color: var(--text-secondary); }
  `,
})
export class StepDeterminantComponent {
  readonly refGrid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly Math = Math;

  readonly a = signal(1.5);
  readonly b = signal(0.5);
  readonly c = signal(-0.5);
  readonly d = signal(1);

  readonly det = computed(() => this.a() * this.d() - this.b() * this.c());

  /** Parallelogram corners in SVG coords */
  readonly parallelogramPoints = computed(() => {
    const a = this.a(), b = this.b(), c = this.c(), d = this.d();
    // Corners in math: (0,0), (a,c), (a+b, c+d), (b, d)
    // In SVG (y flipped, ×40 for unit scale)
    const pts = [
      [0, 0],
      [40 * a, -40 * c],
      [40 * (a + b), -40 * (c + d)],
      [40 * b, -40 * d],
    ];
    return pts.map((p) => `${p[0]},${p[1]}`).join(' ');
  });
}
