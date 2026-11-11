import { Component, input } from '@angular/core';
import { DOMAIN_SYM, Domain } from './ch4-game';

/** One quantifier read as a move. "forall" moves are the opponent's; "exists" moves are the prover's. */
export interface Move {
  q: 'forall' | 'exists';
  v: string;
  dom: Domain;
  /** Who makes the move, e.g. 「對手出」「你出」. */
  who: string;
  /** The value played this round, if any. */
  value?: string;
  /** Plain-language range instead of ℤ/ℕ, e.g. 「偶數」 shown as 「偶數 a」. */
  domText?: string;
}

/**
 * The move-order strip: quantifiers left to right, as turns.
 * Opponent's moves sit in dashed boxes, the prover's in solid ones, matching
 * the identity marks of the later proof board (arbitrary = dashed, chosen = solid).
 */
@Component({
  selector: 'app-pf-moves',
  standalone: true,
  styleUrl: './moves.component.scss',
  template: `
    <ol class="moves" [attr.aria-label]="label() || '出招順序'">
      @for (m of moves(); track m.v; let i = $index) {
        <li class="mv" [class.opp]="m.q === 'forall'" [class.you]="m.q === 'exists'">
          <small class="who">{{ i + 1 }} · {{ m.who }}</small>
          <span class="what">
            @if (symbols()) {
              <b class="sym">{{ m.q === 'forall' ? '∀' : '∃' }}</b>
            }
            @if (m.domText) {
              {{ m.domText }} {{ m.v }}
            } @else {
              {{ m.v }} ∈ {{ sym(m.dom) }}
            }
          </span>
          @if (m.value !== undefined) {
            <span class="val pf-num">{{ m.v }} = {{ m.value }}</span>
          }
        </li>
        <li class="arrow" aria-hidden="true">→</li>
      }
      <li class="mv check" [class.win]="result() === 'win'" [class.lose]="result() === 'lose'">
        <small class="who">最後檢查</small>
        <span class="what">{{ check() }}</span>
        @if (result()) {
          <span class="val">{{ result() === 'win' ? '✓ 成立' : '✗ 不成立' }}</span>
        }
      </li>
    </ol>
  `,
})
export class MovesComponent {
  readonly moves = input.required<Move[]>();
  readonly check = input.required<string>();
  readonly symbols = input(false);
  readonly result = input<'win' | 'lose' | null>(null);
  readonly label = input('');

  sym(d: Domain): string {
    return DOMAIN_SYM[d];
  }
}
