import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface VPreset { label: string; x: number; y: number; }

const VECTORS: VPreset[] = [
  { label: '\u00EA\u2081 = (1, 0)', x: 1, y: 0 },
  { label: '\u00EA\u2082 = (0, 1)', x: 0, y: 1 },
  { label: '(1, 1)',  x: 1,  y: 1 },
  { label: '(2, 1)',  x: 2,  y: 1 },
  { label: '(-1, 2)', x: -1, y: 2 },
];

@Component({
  selector: 'app-step-matrix-vector',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u77E9\u9663 \u00D7 \u5411\u91CF" subtitle="\u00A72.3">
      <p>
        \u4E0A\u4E00\u7BC0\u6211\u5011\u770B\u5230\u4E00\u500B\u77E9\u9663\u80FD\u5B8C\u5168\u63CF\u8FF0\u4E00\u500B\u7DDA\u6027\u8B8A\u63DB\uFF1A
        \u5169\u500B\u6B04\u5C31\u662F T(\u00EA\u2081) \u8207 T(\u00EA\u2082)\u3002
        \u9019\u4E00\u7BC0\u6211\u5011\u4F86\u56DE\u7B54\u4E00\u500B\u5177\u9AD4\u7684\u554F\u984C\uFF1A
      </p>
      <p>
        <strong>\u7D66\u4E00\u500B\u5177\u9AD4\u7684 v\uFF0C\u8B8A\u63DB\u628A\u5B83\u642C\u5230\u54EA\u88E1\uFF1F</strong>
      </p>
      <p>
        \u95DC\u9375\u76F4\u89BA\uFF1A\u8B8A\u63DB\u8B93<strong>\u6574\u500B\u7DB2\u683C\u8B8A\u5F62</strong>\uFF0Cv \u53EA\u662F\u300C\u8DDF\u8457\u7DB2\u683C\u8DD1\u300D\u3002
        \u4E0B\u9762\u62D6\u4E00\u4E0B\u77E9\u9663\u6ED1\u6876\uFF0C\u770B v \u8DDF\u8457\u7DB2\u683C\u88AB\u642C\u5230\u54EA\u88E1\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u5148\u9078\u4E00\u500B v\uFF0C\u518D\u62D6\u77E9\u9663\u6ED1\u6876\uFF0C\u770B v \u8DDF\u8457\u7DB2\u683C\u88AB\u8B8A\u63DB\u5230\u54EA\u88E1">
      <!-- Vector picker -->
      <div class="v-picker">
        <span class="picker-label">\u9078 v =</span>
        @for (vp of vectors; track vp.label; let i = $index) {
          <button class="vp-btn" [class.active]="selVec() === i" (click)="selVec.set(i)">{{ vp.label }}</button>
        }
      </div>

      <!-- Grid SVG -->
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          <!-- Static reference grid -->
          @for (g of refGrid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" opacity="0.6" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" opacity="0.6" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Faded reference: v at original position (dashed) -->
          <line x1="0" y1="0" [attr.x2]="vSvgX()" [attr.y2]="vSvgY()"
            stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.55" />
          <text [attr.x]="vSvgX() + 6" [attr.y]="vSvgY() - 6" class="orig-label">v</text>

          <!-- Transformed layer: grid + basis + v all transform together -->
          <g class="grid-layer" [style.transform]="cssTransform()" [style.transition]="cssTransition">
            <!-- Vertical grid lines = parallel to ê₂ → ê₂ colour -->
            @for (g of fineGrid; track g) {
              <line [attr.x1]="g" y1="-100" [attr.x2]="g" y2="100" stroke="var(--v1)" stroke-width="0.9" opacity="0.4" />
            }
            <!-- Horizontal grid lines = parallel to ê₁ → ê₁ colour -->
            @for (g of fineGrid; track g) {
              <line x1="-100" [attr.y1]="g" x2="100" [attr.y2]="g" stroke="var(--v0)" stroke-width="0.9" opacity="0.4" />
            }
            <!-- Basis vectors: thin + translucent (context, not the focus) -->
            <line x1="0" y1="0" x2="40" y2="0" stroke="var(--v0)" stroke-width="1.8" opacity="0.6" marker-end="url(#tip-mv-e1)" />
            <line x1="0" y1="0" x2="0" y2="-40" stroke="var(--v1)" stroke-width="1.8" opacity="0.6" marker-end="url(#tip-mv-e2)" />
            <!-- v inside the layer: bold + opaque (the star). Drawn at original math coords, visually transforms. -->
            <line x1="0" y1="0" [attr.x2]="vSvgX()" [attr.y2]="vSvgY()"
              stroke="var(--accent)" stroke-width="2.5" marker-end="url(#tip-mv-tv)" />
          </g>

          <!-- T(v) label, positioned in screen space at T(v) coords (not inside the layer) -->
          <text [attr.x]="TvSvgX() + 8" [attr.y]="TvSvgY() - 6" class="tv-label">T(v)</text>

          <defs>
            <marker id="tip-mv-e1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" opacity="0.6" />
            </marker>
            <marker id="tip-mv-e2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" opacity="0.6" />
            </marker>
            <marker id="tip-mv-tv" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      <!-- Matrix sliders -->
      <div class="sliders">
        <div class="sl-row">
          <span class="sl-lab e1">a</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="Mxx()" (input)="Mxx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ Mxx() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab e2">b</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="Mxy()" (input)="Mxy.set(+$any($event).target.value)" />
          <span class="sl-val">{{ Mxy() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab e1">c</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="Myx()" (input)="Myx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ Myx() }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab e2">d</span>
          <input type="range" min="-2" max="2" step="0.5" [value]="Myy()" (input)="Myy.set(+$any($event).target.value)" />
          <span class="sl-val">{{ Myy() }}</span>
        </div>
      </div>

      <!-- Live numerical result -->
      <div class="live-result">
        <span>v = ({{ v().x }}, {{ v().y }})</span>
        <span class="arr">\u2192</span>
        <span>T(v) = (<strong>{{ TvxMath().toFixed(2) }}</strong>, <strong>{{ TvyMath().toFixed(2) }}</strong>)</span>
      </div>
    </app-challenge-card>

    <!-- ── Element-by-element walkthrough ── -->
    <app-prose-block title="\u9010\u9805\u89E3\u8B80\uFF1A\u516C\u5F0F\u600E\u9EBC\u4F86\u7684">
      <p>
        \u4E0A\u9762\u7684\u5E7E\u4F55\u8AAA\u660E\u4E86\uFF1A<strong>v \u8DDF\u8457\u7DB2\u683C\u8DD1</strong>\u3002
        \u4F46\u662F\u600E\u9EBC\u7528\u77E9\u9663\u8DDF v \u7B97\u51FA T(v) \u7684\u5750\u6A19\uFF1F
      </p>
      <p>
        \u95DC\u9375\u662F\u4E0A\u4E00\u7BC0\u7684\u8A18\u865F\uFF1A\u77E9\u9663\u7684<strong>\u6BCF\u4E00\u500B\u6B04 = T(\u00EA\u2096)</strong>\u3002
        \u52A0\u4E0A\u300C\u4EFB\u610F v = v\u2081\u00B7\u00EA\u2081 + v\u2082\u00B7\u00EA\u2082\u300D\u8DDF\u7DDA\u6027\u6027\uFF1A
      </p>
      <p class="formula-display">T(v) = v\u2081\u00B7T(\u00EA\u2081) + v\u2082\u00B7T(\u00EA\u2082)</p>
      <p>
        \u8B6F\u6210\u4E2D\u6587\uFF1A<strong>v \u7684\u7B2C k \u500B\u5143\u7D20 = \u62FF\u591A\u5C11\u500B\u300C\u7B2C k \u500B\u6B04\u300D\u52A0\u8D77\u4F86</strong>\u3002
        v\u2081 \u8DDF<strong>\u7B2C\u4E00\u500B\u6B04</strong>\u914D\u5C0D\uFF0Cv\u2082 \u8DDF<strong>\u7B2C\u4E8C\u500B\u6B04</strong>\u914D\u5C0D\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u5169\u908A\u6BD4\u4E00\u6BD4\u2014 \u4E0A\u9762\u7684\u5E7E\u4F55\u8DDF\u4E0B\u9762\u7684\u7B97\u5F0F\u8AAA\u7684\u662F\u540C\u4E00\u4EF6\u4E8B">
      <!-- Element-by-element diagram, driven by the same signals -->
      <div class="calc-diagram">
        <!-- Matrix M -->
        <div class="cd-block">
          <div class="cd-label">M</div>
          <div class="bracket-wrap">
            <div class="bracket">[</div>
            <div class="cd-matrix">
              <div class="cd-row">
                <span class="cell col-a">{{ Mxx() }}</span>
                <span class="cell col-b">{{ Mxy() }}</span>
              </div>
              <div class="cd-row">
                <span class="cell col-a">{{ Myx() }}</span>
                <span class="cell col-b">{{ Myy() }}</span>
              </div>
            </div>
            <div class="bracket">]</div>
          </div>
          <div class="col-tags">
            <span class="ct col-a">T(\u00EA\u2081)</span>
            <span class="ct col-b">T(\u00EA\u2082)</span>
          </div>
        </div>

        <div class="cd-times">\u00B7</div>

        <!-- Vector v -->
        <div class="cd-block">
          <div class="cd-label">v</div>
          <div class="bracket-wrap">
            <div class="bracket">[</div>
            <div class="cd-matrix">
              <div class="cd-row"><span class="cell row-a">{{ v().x }}</span></div>
              <div class="cd-row"><span class="cell row-b">{{ v().y }}</span></div>
            </div>
            <div class="bracket">]</div>
          </div>
          <div class="row-tags">
            <span class="rt row-a">v\u2081</span>
            <span class="rt row-b">v\u2082</span>
          </div>
        </div>

        <div class="cd-eq">=</div>

        <!-- Result -->
        <div class="cd-block">
          <div class="cd-label">T(v)</div>
          <div class="bracket-wrap">
            <div class="bracket">[</div>
            <div class="cd-matrix wide">
              <div class="cd-row result-row">
                <span class="term">{{ Mxx() }}\u00B7{{ v().x }}</span>
                <span class="plus">+</span>
                <span class="term">{{ Mxy() }}\u00B7{{ v().y }}</span>
              </div>
              <div class="cd-row result-row">
                <span class="term">{{ Myx() }}\u00B7{{ v().x }}</span>
                <span class="plus">+</span>
                <span class="term">{{ Myy() }}\u00B7{{ v().y }}</span>
              </div>
            </div>
            <div class="bracket">]</div>
          </div>
        </div>
      </div>

      <!-- Walk-through -->
      <div class="walkthrough">
        <div class="wt-line">
          <span class="wt-label">\u7B2C\u4E00\u5143\u7D20\uFF1A</span>
          <span class="cell-inline col-a">{{ Mxx() }}</span> \u00B7 <span class="cell-inline row-a">{{ v().x }}</span>
          <span class="plus">+</span>
          <span class="cell-inline col-b">{{ Mxy() }}</span> \u00B7 <span class="cell-inline row-b">{{ v().y }}</span>
          =
          <strong>{{ TvxMath().toFixed(2) }}</strong>
        </div>
        <div class="wt-line">
          <span class="wt-label">\u7B2C\u4E8C\u5143\u7D20\uFF1A</span>
          <span class="cell-inline col-a">{{ Myx() }}</span> \u00B7 <span class="cell-inline row-a">{{ v().x }}</span>
          <span class="plus">+</span>
          <span class="cell-inline col-b">{{ Myy() }}</span> \u00B7 <span class="cell-inline row-b">{{ v().y }}</span>
          =
          <strong>{{ TvyMath().toFixed(2) }}</strong>
        </div>
      </div>

      <div class="pairing">
        <div class="pair-item">
          <span class="dot col-a"></span>
          \u7B2C\u4E00\u500B\u6B04 T(\u00EA\u2081) \u8DDF v\u2081 \u914D\u5C0D
        </div>
        <div class="pair-item">
          <span class="dot col-b"></span>
          \u7B2C\u4E8C\u500B\u6B04 T(\u00EA\u2082) \u8DDF v\u2082 \u914D\u5C0D
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8DDF\u8457\u62D6\u6ED1\u6876\u770B\u770B\uFF1A\u8ABF\u6574 a \u53EA\u6703\u5F71\u97FF<strong>\u7B2C\u4E00\u500B\u5143\u7D20</strong>\uFF08\u56E0\u70BA a \u8DDF v\u2081 \u4E58\u5728\u4E00\u8D77\uFF09\uFF0C
        \u8ABF\u6574 c \u4E5F\u53EA\u6703\u5F71\u97FF\u7B2C\u4E8C\u500B\u5143\u7D20\u3002
        \u9019\u5C31\u662F\u300C\u54EA\u500B\u6B04\u8CA0\u8CAC\u54EA\u500B\u8F38\u51FA\u300D\u7684\u4F86\u6E90\u3002
      </p>
      <p class="formula-big">T(v) = v\u2081 \u00B7 T(\u00EA\u2081) + v\u2082 \u00B7 T(\u00EA\u2082)</p>
      <p>
        n \u7DAD\u7684\u60C5\u6CC1\u5B8C\u5168\u4E00\u6A23\uFF1An\u00D7n \u77E9\u9663\u6709 n \u500B\u6B04\uFF0Cv \u6709 n \u500B\u5143\u7D20\uFF0C\u4E00\u4E00\u914D\u5C0D\u52A0\u8D77\u4F86\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    /* ── Vector picker ── */
    .v-picker { display: flex; gap: 4px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .picker-label { font-size: 13px; color: var(--text-muted); margin-right: 4px; }
    .vp-btn {
      padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px;
      font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 600; }
    }

    /* ── Grid SVG ── */
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 340px; }
    .grid-layer { transform-origin: 0 0; will-change: transform; }
    .orig-label { font-size: 11px; fill: var(--text-muted); font-style: italic; font-family: 'Noto Sans Math', serif; }
    .tv-label { font-size: 13px; fill: var(--accent); font-weight: 700; font-family: 'Noto Sans Math', serif; }

    /* ── Sliders ── */
    .sliders { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;
      padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .sl-row { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; font-weight: 700; min-width: 16px; font-family: 'JetBrains Mono', monospace;
      &.e1 { color: var(--v0); } &.e2 { color: var(--v1); } }
    .sl-row input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .live-result { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
      padding: 10px 14px; border-radius: 8px; background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-secondary);
      .arr { color: var(--text-muted); }
      strong { color: var(--accent); font-size: 14px; } }

    /* ── Element-by-element diagram ── */
    .formula-display { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 8px 0; }

    .calc-diagram {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 8px; margin-bottom: 14px; flex-wrap: wrap;
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      overflow-x: auto;
    }
    .cd-block { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .cd-label { font-size: 11px; color: var(--text-muted); font-weight: 600; }
    .bracket-wrap { display: flex; align-items: center; gap: 2px; }
    .bracket { font-size: 44px; font-weight: 200; color: var(--text-muted); line-height: 0.9; }
    .cd-matrix { display: flex; flex-direction: column; gap: 4px; padding: 4px 2px; }
    .cd-matrix.wide { gap: 6px; }
    .cd-row { display: flex; gap: 6px; align-items: center; justify-content: center; }
    .cell {
      min-width: 32px; padding: 4px 8px; text-align: center;
      font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; border-radius: 4px;
    }
    .col-a { background: rgba(191, 158, 147, 0.18); color: var(--v0); }
    .col-b { background: rgba(141, 163, 181, 0.18); color: var(--v1); }
    .row-a { background: rgba(191, 158, 147, 0.18); color: var(--v0); }
    .row-b { background: rgba(141, 163, 181, 0.18); color: var(--v1); }

    .col-tags, .row-tags { display: flex; gap: 6px; margin-top: 2px; }
    .row-tags { flex-direction: column; gap: 4px; }
    .ct, .rt { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; font-family: 'Noto Sans Math', serif;
      &.col-a, &.row-a { background: rgba(191, 158, 147, 0.18); color: var(--v0); }
      &.col-b, &.row-b { background: rgba(141, 163, 181, 0.18); color: var(--v1); } }
    .ct { min-width: 28px; text-align: center; }

    .cd-times, .cd-eq { font-size: 22px; color: var(--text-muted); padding: 0 2px; }

    .term {
      padding: 3px 6px; border-radius: 4px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      background: var(--accent-10); color: var(--text);
    }
    .plus { color: var(--text-muted); padding: 0 2px; }

    .walkthrough {
      display: flex; flex-direction: column; gap: 8px; padding: 12px 16px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      margin-bottom: 14px;
    }
    .wt-line { display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      font-size: 13px; color: var(--text-secondary);
      strong { color: var(--accent); font-size: 14px; } }
    .wt-label { color: var(--text-muted); font-size: 12px; }
    .cell-inline { padding: 2px 7px; border-radius: 4px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      &.col-a { background: rgba(191, 158, 147, 0.2); color: var(--v0); }
      &.col-b { background: rgba(141, 163, 181, 0.2); color: var(--v1); }
      &.row-a { background: rgba(191, 158, 147, 0.2); color: var(--v0); }
      &.row-b { background: rgba(141, 163, 181, 0.2); color: var(--v1); } }

    .pairing { display: flex; flex-direction: column; gap: 6px; padding: 12px 16px;
      border-radius: 8px; background: var(--bg); border: 1px solid var(--border); }
    .pair-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      &.col-a { background: var(--v0); }
      &.col-b { background: var(--v1); } }

    .formula-big { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 10px 0;
      background: var(--accent-10); border-radius: 8px; margin: 12px 0; }
  `,
})
export class StepMatrixVectorComponent {
  readonly refGrid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly fineGrid = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];
  readonly vectors = VECTORS;

  // Selected input vector
  readonly selVec = signal(3); // default to (2, 1)
  readonly v = computed(() => this.vectors[this.selVec()]);

  // Matrix entries (controlled by sliders), default to a noticeable transformation
  readonly Mxx = signal(1.5);
  readonly Mxy = signal(0.5);
  readonly Myx = signal(-0.5);
  readonly Myy = signal(1.5);

  // SVG positions of v in the original (untransformed) space
  readonly vSvgX = computed(() => this.v().x * 25);
  readonly vSvgY = computed(() => -this.v().y * 25);

  // T(v) computed from M and v
  readonly TvxMath = computed(() => this.Mxx() * this.v().x + this.Mxy() * this.v().y);
  readonly TvyMath = computed(() => this.Myx() * this.v().x + this.Myy() * this.v().y);

  // T(v) in SVG coords (for label positioning outside the transformed layer)
  readonly TvSvgX = computed(() => this.TvxMath() * 25);
  readonly TvSvgY = computed(() => -this.TvyMath() * 25);

  readonly cssTransition = 'transform 0.3s ease-out';

  /** Math 2x2 [[a,b],[c,d]] → SVG matrix(a, -c, -b, d, 0, 0) (y-flip). */
  readonly cssTransform = computed(() => {
    const a = this.Mxx(), b = this.Mxy(), c = this.Myx(), d = this.Myy();
    return `matrix(${a}, ${-c}, ${-b}, ${d}, 0, 0)`;
  });
}
