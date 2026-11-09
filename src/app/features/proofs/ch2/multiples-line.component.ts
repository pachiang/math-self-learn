import { Component, computed, input } from '@angular/core';
import { sgn } from './ch2-expr';

/** The values a·k + c for integer k on a number line, with one target value marked. */
@Component({
  selector: 'app-pf-multiples',
  standalone: true,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: auto; display: block; overflow: visible; }
    .axis { stroke: var(--pf-ink-3); stroke-width: 1.5; }
    .tick { stroke: var(--pf-rule-strong); }
    .dot { fill: var(--pf-graphite); }
    .dot.hit { fill: var(--pf-blue); stroke: var(--pf-card); stroke-width: 2.5; }
    text { text-anchor: middle; font-family: var(--pf-mono); }
    .val { fill: var(--pf-ink-2); font-size: 14px; font-weight: 600; }
    .val.hit { fill: var(--pf-blue); font-weight: 800; }
    .val.tgt { fill: var(--pf-amber); font-weight: 800; }
    .kk { fill: var(--pf-ink-3); font-size: 11px; }
    .kk.hit { fill: var(--pf-blue); font-size: 13px; font-weight: 700; }
    .target path { fill: var(--pf-amber); }
    .target text { fill: var(--pf-amber); font: 700 13px var(--pf-sans); }
    .gap { fill: var(--pf-red-soft); stroke: var(--pf-red); stroke-dasharray: 4 3; }
    .cap { fill: var(--pf-red); font: 600 13px var(--pf-sans); }
    .legend { fill: var(--pf-ink-3); font: 500 12px var(--pf-sans); text-anchor: start; }
  `,
  template: `
    <svg viewBox="0 0 640 132" role="img" [attr.aria-label]="aria()">
      <text x="30" y="14" class="legend">● ＝ {{ formula() }} 能到的值</text>
      @if (gap(); as g) {
        <rect [attr.x]="x(g.lo)" [attr.y]="Y - 16" [attr.width]="x(g.hi) - x(g.lo)" height="32" rx="8" class="gap" />
        <text [attr.x]="(x(g.lo) + x(g.hi)) / 2" y="128" class="cap">
          {{ s(target()) }} 夾在 k = {{ s(g.j) }} 和 k = {{ s(g.j + 1) }} 之間
        </text>
      }
      @if (zeroCap()) {
        <text [attr.x]="x(0)" y="128" class="cap">0 × k 永遠停在 0</text>
      }
      <line x1="30" x2="610" [attr.y1]="Y" [attr.y2]="Y" class="axis" />
      @for (t of ticks(); track t) {
        <line [attr.x1]="x(t)" [attr.x2]="x(t)" [attr.y1]="Y - 4" [attr.y2]="Y + 4" class="tick" />
      }
      @for (d of dots(); track d.v) {
        <circle [attr.cx]="x(d.v)" [attr.cy]="Y" [attr.r]="d.hit ? 9 : 6.5" class="dot" [class.hit]="d.hit" />
        <text [attr.x]="x(d.v)" [attr.y]="Y + 27" class="val" [class.hit]="d.hit">{{ s(d.v) }}</text>
        @if (showK()) {
          <text [attr.x]="x(d.v)" [attr.y]="Y - 17" class="kk" [class.hit]="d.hit">{{ d.k }}</text>
        }
      }
      <g class="target" [attr.transform]="'translate(' + x(target()) + ',0)'">
        <text y="32">目標 {{ s(target()) }}</text>
        <path d="M -7 37 L 7 37 L 0 48 Z" />
      </g>
      @if (!onDot()) {
        <text [attr.x]="x(target())" [attr.y]="Y + 27" class="val tgt">{{ s(target()) }}</text>
      }
    </svg>
  `,
})
export class MultiplesLineComponent {
  /** Step between reachable values (≥ 0). */
  readonly a = input.required<number>();
  /** Offset: values are a·k + c. */
  readonly c = input(0);
  readonly target = input.required<number>();
  /** The target has been reached by an integer k. */
  readonly hit = input(false);
  /** Shade the gap the target falls into (after the learner has argued it is unreachable). */
  readonly showGap = input(false);
  readonly showK = input(false);

  readonly Y = 74;
  readonly s = sgn;

  readonly formula = computed(() => {
    const a = this.a();
    const c = this.c();
    return `${a} × k${c ? ` + ${c}` : ''}`;
  });

  readonly range = computed(() => {
    const a = this.a();
    const c = this.c();
    const t = this.target();
    const pad = a || 3;
    let lo = Math.min(c, t, 0) - pad;
    let hi = Math.max(c, t, 0) + pad;
    if (hi - lo < 8) {
      const m = (hi + lo) / 2;
      lo = Math.floor(m - 4);
      hi = Math.ceil(m + 4);
    }
    return { lo, hi };
  });

  readonly ticks = computed(() => {
    const { lo, hi } = this.range();
    if (hi - lo > 40) return [];
    return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  });

  readonly dots = computed(() => {
    const a = this.a();
    const c = this.c();
    const t = this.target();
    const { lo, hi } = this.range();
    if (a === 0) return [{ v: c, k: '任何 k', hit: this.hit() && t === c }];
    const out: { v: number; k: string; hit: boolean }[] = [];
    for (let j = Math.ceil((lo - c) / a); a * j + c <= hi; j++) {
      const v = a * j + c;
      out.push({ v, k: `k=${sgn(j)}`, hit: this.hit() && v === t });
    }
    return out;
  });

  readonly onDot = computed(() => this.dots().some((d) => d.v === this.target()));

  readonly gap = computed(() => {
    const a = this.a();
    if (!this.showGap() || a === 0 || this.onDot()) return null;
    const j = Math.floor((this.target() - this.c()) / a);
    return { lo: a * j + this.c(), hi: a * (j + 1) + this.c(), j };
  });

  readonly zeroCap = computed(() => this.showGap() && this.a() === 0 && !this.onDot());

  readonly aria = computed(
    () => `數線：圓點是 ${this.formula()} 在整數 k 下能到的值；目標是 ${sgn(this.target())}${this.onDot() ? '，落在圓點上' : '，不在圓點上'}。`,
  );

  x(v: number): number {
    const { lo, hi } = this.range();
    return 30 + ((v - lo) / (hi - lo)) * 580;
  }
}
