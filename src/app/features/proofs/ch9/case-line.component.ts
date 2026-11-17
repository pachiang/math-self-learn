import { Component, computed, input } from '@angular/core';

/** One case of a split: which integers it covers, and (in proof mode) whether it is proved. */
export interface CaseRow {
  label: string;
  test: (n: number) => boolean;
  sealed?: boolean;
  active?: boolean;
}

const LABEL_W = 200;
const STEP = 38;
const ROW_H = 44;
const TOP = 26;

/**
 * The integers lo…hi on a line, one row of dots per case.
 * cover: the bottom row counts how many cases reach each integer (gap / once / overlap).
 * proof: the bottom row marks the integers some proved case covers.
 */
@Component({
  selector: 'app-pf-case-line',
  standalone: true,
  styleUrl: './case-line.component.scss',
  template: `
    <figure class="cl">
      <svg [attr.viewBox]="'0 0 ' + width() + ' ' + height()" role="img" [attr.aria-label]="aria()">
        @if (mark() !== null) {
          <rect class="cl-mark" [attr.x]="x(mark()!) - 17" y="4" width="34" [attr.height]="height() - 8" rx="6" />
        }
        @for (r of rows(); track r.label; let i = $index) {
          <text class="cl-label" [class.active]="r.active" x="0" [attr.y]="rowY(i) + 5">{{ r.label }}</text>
          @if (mode() === 'proof') {
            <text class="cl-ok" [class.wait]="!r.sealed" [attr.x]="endX()" [attr.y]="rowY(i) + 5">{{ r.sealed ? '✓ 證完' : r.active ? '證明中' : '還沒證' }}</text>
          }
          @for (n of ns(); track n) {
            @if (r.test(n)) {
              <circle [attr.class]="'cl-dot t' + (i % 3) + (mode() === 'proof' && !r.sealed ? ' open' : '')" [attr.cx]="x(n)" [attr.cy]="rowY(i)" r="9" />
            } @else {
              <circle class="cl-off" [attr.cx]="x(n)" [attr.cy]="rowY(i)" r="2.5" />
            }
          }
        }
        <line class="cl-rule" x1="0" [attr.x2]="width()" [attr.y1]="sumY() - 24" [attr.y2]="sumY() - 24" />
        <text class="cl-label sum" x="0" [attr.y]="sumY() + 5">{{ mode() === 'cover' ? '蓋到了嗎' : '已經證到的數' }}</text>
        @for (c of cells(); track c.n) {
          @switch (c.state) {
            @case ('gap') {
              <circle class="cl-gap" [attr.cx]="x(c.n)" [attr.cy]="sumY()" r="11" />
              <text class="cl-gapx" [attr.x]="x(c.n)" [attr.y]="sumY() + 5">✕</text>
            }
            @case ('twice') {
              <circle class="cl-twice" [attr.cx]="x(c.n)" [attr.cy]="sumY()" r="11" />
              <circle class="cl-once" [attr.cx]="x(c.n)" [attr.cy]="sumY()" r="5.5" />
            }
            @case ('once') {
              <circle class="cl-once" [attr.cx]="x(c.n)" [attr.cy]="sumY()" r="5.5" />
            }
            @case ('proved') {
              <circle class="cl-proved" [attr.cx]="x(c.n)" [attr.cy]="sumY()" r="10" />
              <text class="cl-tick" [attr.x]="x(c.n)" [attr.y]="sumY() + 5">✓</text>
            }
            @default {
              <circle class="cl-wait" [attr.cx]="x(c.n)" [attr.cy]="sumY()" r="9" />
            }
          }
          <text class="cl-num" [class.zero]="c.n === 0" [attr.x]="x(c.n)" [attr.y]="sumY() + 36">{{ fmt(c.n) }}</text>
        }
      </svg>
      <figcaption class="cl-legend" aria-hidden="true">
        @if (mode() === 'cover') {
          <span><i class="once"></i>蓋到一次</span><span><i class="twice"></i>蓋到兩次以上（重疊）</span><span><i class="gap">✕</i>沒蓋到</span>
        } @else {
          <span><i class="proved">✓</i>屬於證完的情況</span><span><i class="wait"></i>還沒證到</span>
        }
        <span class="far">數線只畫出 {{ fmt(lo()) }} 到 {{ fmt(hi()) }}</span>
      </figcaption>
    </figure>
  `,
})
export class CaseLineComponent {
  readonly rows = input.required<CaseRow[]>();
  readonly lo = input(-10);
  readonly hi = input(10);
  readonly mode = input<'cover' | 'proof'>('cover');
  /** An integer to single out, e.g. the counterexample that fell in a gap. */
  readonly mark = input<number | null>(null);

  readonly ns = computed(() => Array.from({ length: this.hi() - this.lo() + 1 }, (_, i) => this.lo() + i));
  readonly endX = computed(() => LABEL_W + this.ns().length * STEP + 12);
  readonly width = computed(() => this.endX() + (this.mode() === 'proof' ? 74 : 0));
  readonly sumY = computed(() => TOP + this.rows().length * ROW_H + 30);
  readonly height = computed(() => this.sumY() + 48);

  readonly cells = computed(() =>
    this.ns().map((n) => {
      const hits = this.rows().filter((r) => r.test(n));
      if (this.mode() === 'proof') return { n, state: hits.some((r) => r.sealed) ? 'proved' : 'wait' };
      return { n, state: hits.length === 0 ? 'gap' : hits.length === 1 ? 'once' : 'twice' };
    }),
  );

  readonly aria = computed(() => {
    const cs = this.cells();
    const list = (st: string) => cs.filter((c) => c.state === st).map((c) => this.fmt(c.n));
    const range = `數線 ${this.fmt(this.lo())} 到 ${this.fmt(this.hi())}，${this.rows().length} 種情況。`;
    if (this.mode() === 'proof') {
      const p = list('proved');
      return `${range}已經證到的數：${p.length ? p.join('、') : '還沒有'}。`;
    }
    const g = list('gap');
    return `${range}${g.length ? '沒蓋到：' + g.join('、') : '每個數都蓋到了'}。`;
  });

  x(n: number): number {
    return LABEL_W + (n - this.lo()) * STEP + STEP / 2;
  }
  rowY(i: number): number {
    return TOP + i * ROW_H;
  }
  fmt(n: number): string {
    return String(n).replace('-', '−');
  }
}
