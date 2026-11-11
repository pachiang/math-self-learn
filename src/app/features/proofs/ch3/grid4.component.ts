import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';

/** A cell of the four-cell grid, named by the truth of P then Q. */
export type Cell = 'TT' | 'TF' | 'FT' | 'FF';
export const CELLS: Cell[] = ['TT', 'TF', 'FT', 'FF'];

export type Mark = 'true' | 'false' | 'kept' | 'breach' | 'idle' | 'impossible' | 'none';

export interface CellView {
  mark?: Mark;
  /** Small chips placed in the cell: numbers, card faces, story letters. */
  tokens?: string[];
  /** The learner's current choice: amber outline. */
  picked?: boolean;
  /** A short second line under the mark, e.g. 「算真」. */
  note?: string;
}

const MARK_TEXT: Record<Mark, string> = {
  true: '成立',
  false: '不成立',
  kept: '守約',
  breach: '違約',
  idle: '沒觸發',
  impossible: '不可能',
  none: '',
};

/** Integers with a true minus sign, for chips and text. */
export const num = (n: number) => (n < 0 ? `−${-n}` : String(n));

export const cellDesc = (c: Cell) => `P ${c[0] === 'T' ? '成立' : '不成立'}、Q ${c[1] === 'T' ? '成立' : '不成立'}`;

/** Sentences built from P and Q, as the set of cells where they hold. */
export const HOLDS = {
  and: (c: Cell) => c === 'TT',
  or: (c: Cell) => c !== 'FF',
  notP: (c: Cell) => c[0] === 'F',
  implies: (c: Cell) => c !== 'TF',
  iff: (c: Cell) => c === 'TT' || c === 'FF',
};

/**
 * The chapter's one picture: top row P holds, left column Q holds.
 * Positions never move across scenes, so "the breach cell" is always top-right for P ⇒ Q.
 */
@Component({
  selector: 'app-pf-grid4',
  standalone: true,
  styleUrl: './grid4.component.scss',
  template: `
    <figure class="g4" [class.mini]="mini()">
      @if (!mini() && !(p() === 'P' && q() === 'Q')) {
        <figcaption class="legend">
          <span><b class="chip">P</b>{{ p() }}</span>
          <span><b class="chip">Q</b>{{ q() }}</span>
        </figcaption>
      }
      <div class="grid" role="group" [attr.aria-label]="label() || '四格圖：P ' + p() + '，Q ' + q()">
        <span class="corner" aria-hidden="true"></span>
        <span class="colh" aria-hidden="true">Q {{ mini() ? '✓' : '成立' }}</span>
        <span class="colh" aria-hidden="true">Q {{ mini() ? '✗' : '不成立' }}</span>
        @for (row of rows; track row) {
          <span class="rowh" aria-hidden="true">P {{ mini() ? (row === 'T' ? '✓' : '✗') : row === 'T' ? '成立' : '不成立' }}</span>
          @for (col of rows; track col) {
            @let c = cellOf(row, col);
            @let v = view()[c] ?? {};
            @if (pickable()) {
              <button
                type="button"
                [class]="'cell m-' + (v.mark ?? 'none')"
                [class.picked]="!!v.picked"
                [attr.aria-pressed]="!!v.picked"
                [attr.aria-label]="desc(c) + (v.mark && v.mark !== 'none' ? '：' + text(v.mark) : '')"
                (click)="pick.emit(c)"
              >
                <ng-container *ngTemplateOutlet="body; context: { v: v }" />
              </button>
            } @else {
              <div [class]="'cell m-' + (v.mark ?? 'none')" [class.picked]="!!v.picked">
                <span class="pf-sr-only">{{ desc(c) }}：</span>
                <ng-container *ngTemplateOutlet="body; context: { v: v }" />
              </div>
            }
          }
        }
      </div>
    </figure>

    <ng-template #body let-v="v">
      @if (v.picked && !mini()) {
        <span class="pick-tag" [attr.aria-hidden]="pickable() ? 'true' : null">✓ 你選的</span>
      }
      @if (v.mark && v.mark !== 'none' && !mini()) {
        <span class="mark">{{ text(v.mark) }}</span>
      }
      @if (mini() && (v.mark === 'true' || v.mark === 'kept' || v.mark === 'idle')) {
        <span class="dot" aria-hidden="true">●</span>
        <span class="pf-sr-only">成立</span>
      }
      @if (mini() && v.mark === 'breach') {
        <span class="dot" aria-hidden="true">✕</span>
        <span class="pf-sr-only">違約</span>
      }
      @if (v.note && !mini()) {
        <small class="note">{{ v.note }}</small>
      }
      @if (v.tokens?.length && !mini()) {
        <span class="toks">
          @for (t of v.tokens; track t) {
            <span class="tok">{{ t }}</span>
          }
        </span>
      }
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
})
export class Grid4Component {
  readonly p = input.required<string>();
  readonly q = input.required<string>();
  readonly view = input<Partial<Record<Cell, CellView>>>({});
  readonly pickable = input(false);
  readonly mini = input(false);
  readonly label = input('');
  readonly pick = output<Cell>();

  readonly rows = ['T', 'F'] as const;

  cellOf(row: 'T' | 'F', col: 'T' | 'F'): Cell {
    return (row + col) as Cell;
  }
  desc(c: Cell): string {
    return cellDesc(c);
  }
  text(m: Mark): string {
    return MARK_TEXT[m];
  }
}

