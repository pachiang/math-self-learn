import { Component, computed, input, signal } from '@angular/core';

export type FlipMode = 'direct' | 'contrapos' | 'contra';

interface Chip {
  key: string;
  front: string;
  back: string;
  /** Where it sits before and after: column and slot. */
  from: { col: 'given' | 'goal'; slot: number };
  to: { col: 'given' | 'goal'; slot: number };
  flips: boolean;
}

/**
 * A two-column mini board that shows what one move does to a sentence: which part goes
 * over to the givens, and whether it turns over (gets a 「不是」) on the way.
 * Direct: P goes left as it is. Contrapositive: Q goes left turned over, P stays turned over.
 * Contradiction: the whole goal goes left turned over, and 「矛盾」 takes its place.
 * Motion is a transition; under reduced motion the end state simply appears.
 */
@Component({
  selector: 'app-pf-flip-demo',
  standalone: true,
  template: `
    <figure class="fd" [class.after]="after()" [class.wide]="mode() === 'contra'" [attr.aria-label]="label()">
      <div class="fd-board">
        <div class="fd-col"><small>已知</small></div>
        <div class="fd-col goal"><small>目標</small></div>
        @if (mode() !== 'contra') {
          <span class="fd-word if" aria-hidden="true">若</span>
          <span class="fd-word then" aria-hidden="true">，則</span>
        }
        @for (c of chips(); track c.key) {
          <span
            class="fd-chip"
            [class.flipped]="after() && c.flips"
            [style.left.px]="x(after() ? c.to : c.from)"
            [style.top.px]="y(after() ? c.to : c.from)"
            [attr.aria-hidden]="true"
          >
            <span class="fd-face front">{{ c.front }}</span>
            <span class="fd-face back">{{ c.back }}</span>
          </span>
        }
        @if (mode() === 'contra') {
          <span class="fd-chip bot" [style.left.px]="x({ col: 'goal', slot: 0 })" [style.top.px]="y({ col: 'goal', slot: 0 })" aria-hidden="true">
            <span class="fd-face front">矛盾：找兩條打架的已知</span>
          </span>
        }
      </div>
      <figcaption class="fd-cap">
        <span class="pf-sr-only">{{ srText() }}</span>
        <span aria-hidden="true">{{ caption() }}</span>
        <span class="fd-ctl">
          <button type="button" class="pf-btn small" [class.primary]="!after()" (click)="after.set(!after())">
            {{ after() ? '回到出這張卡之前' : buttonText() }}
          </button>
        </span>
      </figcaption>
    </figure>
  `,
  styles: `
    :host { display: block; }
    .fd { margin: 0; display: grid; gap: 12px; --w: 150px; --colw: 400px; }
    .fd.wide { --w: 340px; }
    .fd-board {
      position: relative;
      width: calc(var(--colw) * 2);
      height: 150px;
      display: grid;
      grid-template-columns: var(--colw) var(--colw);
      border: 1.5px solid var(--pf-ink);
      border-radius: 12px;
      background: var(--pf-card);
      perspective: 900px;
    }
    .fd-col { padding: 10px 16px; }
    .fd-col.goal { border-left: 1.5px solid var(--pf-ink); }
    .fd-col small { font: 600 12px var(--pf-sans); letter-spacing: 0.2em; color: var(--pf-ink-3); }
    .fd-word {
      position: absolute;
      top: 66px;
      font: 700 18px var(--pf-serif);
      color: var(--pf-ink-2);
      transition: opacity 0.4s;
    }
    .fd-word.if { left: calc(var(--colw) + 14px); }
    .fd-word.then { left: calc(var(--colw) + 38px + var(--w)); }
    .after .fd-word { opacity: 0; }
    .fd-chip {
      position: absolute;
      width: var(--w);
      height: 46px;
      transform-style: preserve-3d;
      transition: left 0.7s cubic-bezier(0.5, 0, 0.3, 1), top 0.7s cubic-bezier(0.5, 0, 0.3, 1), transform 0.7s ease;
      &.flipped { transform: rotateY(180deg); }
    }
    .fd-face {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 0 10px;
      border-radius: 8px;
      backface-visibility: hidden;
      font: 700 17px var(--pf-serif);
      white-space: nowrap;
      &.front { border: 1.5px solid var(--pf-rule-strong); background: var(--pf-card); }
      // The turned-over side carries a 「不是」: dashed red frame, so the flip is visible without colour too.
      &.back { transform: rotateY(180deg); border: 2px dashed var(--pf-red); background: var(--pf-red-soft); }
    }
    .fd-chip.bot {
      opacity: 0;
      transition: opacity 0.4s 0.5s;
      .fd-face.front { border: 2px solid var(--pf-red); color: var(--pf-red); font-size: 15px; }
    }
    .after .fd-chip.bot { opacity: 1; }
    .fd-cap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: calc(var(--colw) * 2);
      font-size: 15px;
      line-height: 1.6;
      color: var(--pf-ink-2);
    }
    .fd-ctl { flex: none; }
  `,
})
export class FlipDemoComponent {
  readonly mode = input<FlipMode>('contrapos');
  readonly p = input('P');
  readonly q = input('Q');
  readonly notP = input('非 P');
  readonly notQ = input('非 Q');
  /** For contra: the whole goal and its negation. */
  readonly g = input('G');
  readonly notG = input('非 G');

  readonly after = signal(false);

  readonly chips = computed<Chip[]>(() => {
    const m = this.mode();
    if (m === 'contra') {
      return [{ key: 'g', front: this.g(), back: this.notG(), from: { col: 'goal', slot: 0 }, to: { col: 'given', slot: 0 }, flips: true }];
    }
    const pTo = m === 'direct' ? { col: 'given' as const, slot: 0 } : { col: 'goal' as const, slot: 0 };
    const qTo = m === 'direct' ? { col: 'goal' as const, slot: 0 } : { col: 'given' as const, slot: 0 };
    return [
      { key: 'p', front: this.p(), back: this.notP(), from: { col: 'goal', slot: 0 }, to: pTo, flips: m === 'contrapos' },
      { key: 'q', front: this.q(), back: this.notQ(), from: { col: 'goal', slot: 1 }, to: qTo, flips: m === 'contrapos' },
    ];
  });

  readonly buttonText = computed(() =>
    this.mode() === 'contra' ? '出「反證」' : this.mode() === 'contrapos' ? '出「逆否」，再假設前提' : '假設前提',
  );

  readonly caption = computed(() => {
    const m = this.mode();
    if (!this.after()) {
      return m === 'contra' ? '目標整句都在右邊，左邊什麼也沒有。' : `目標是「若 ${this.p()}，則 ${this.q()}」。`;
    }
    if (m === 'direct') return `${this.p()} 原樣搬到已知，${this.q()} 留下來當目標。`;
    if (m === 'contrapos') return `${this.q()} 翻成「${this.notQ()}」搬到已知；${this.p()} 翻成「${this.notP()}」留下來當目標。`;
    return `整句翻成「${this.notG()}」搬到已知；目標只剩「找出矛盾」。`;
  });

  readonly srText = computed(() => this.caption());
  readonly label = computed(() =>
    this.mode() === 'contra' ? '反證把目標翻面搬到已知' : this.mode() === 'contrapos' ? '逆否把結論翻面搬到已知' : '直接證明把前提搬到已知',
  );

  x(at: { col: 'given' | 'goal'; slot: number }): number {
    const colw = 400;
    const w = this.mode() === 'contra' ? 340 : 150;
    if (at.col === 'given') return 20;
    // Goal column: slot 0 after 「若」, slot 1 after 「，則」; alone, slot 0 sits right at the start.
    if (this.mode() === 'contra') return colw + 20;
    if (at.slot === 0) return this.after() ? colw + 20 : colw + 36;
    return colw + 82 + w;
  }

  y(_at: { col: 'given' | 'goal'; slot: number }): number {
    return 54;
  }
}
