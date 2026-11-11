import { Component, computed, input, output, signal } from '@angular/core';
import { Q, fmtQ, sgn } from '../ch2/ch2-expr';
import { RuleResult, RuleSpec, checkRule } from './ch4-game';

/** Spaces around binary + − ×, typographic minus: 「x+1」 → 「x + 1」, 「-x-3」 → 「−x − 3」. */
const pretty = (src: string) =>
  src
    .replace(/\s+/g, '')
    .replace(/([\w)])([+\-*])/g, '$1 $2 ')
    .replace(/\*/g, '×')
    .replace(/-/g, '−');

export interface RuleSolved {
  src: string;
  reason: string;
  /** The constant value of the key quantity. */
  c: Q;
}

/**
 * Type a rule for the second mover; the first mover replays its fixed list of moves.
 * A clean sweep alone is still an example; a constant key quantity earns a reason.
 */
@Component({
  selector: 'app-pf-rule-game',
  standalone: true,
  styleUrl: './rule-game.component.scss',
  template: `
    <form class="rg-form" (submit)="$event.preventDefault(); submit()">
      <label class="rg-eq" [attr.for]="inputId()">{{ spec().answer }} =</label>
      <input
        class="pf-input wide"
        [id]="inputId()"
        autocomplete="off"
        spellcheck="false"
        [attr.aria-label]="ariaLabel()"
        [value]="draft()"
        (input)="draft.set($any($event.target).value)"
        [disabled]="solved()"
      />
      <button type="submit" class="pf-btn primary small" [disabled]="solved()">{{ submitLabel() }}</button>
    </form>
    @if (!solved()) {
      <p class="pf-note">可以用 {{ spec().given }} 寫，例如 <span class="pf-num">{{ hint() }}</span>。按下去之後，{{ otherName() }}會用他準備好的招一招一招試。</p>
    }

    @if (res(); as r) {
      @if (r.kind === 'parse') {
        <p class="pf-feedback bad" role="status">{{ r.msg }}</p>
      } @else {
        <table class="pf-table rg-rows">
          <caption class="pf-sr-only">{{ otherName() }}的每一招與你的規則給出的回應</caption>
          <tr>
            <th>回合</th>
            <th>{{ otherName() }}出 {{ spec().given }}</th>
            <th>規則給出 {{ spec().answer }}</th>
            <th>檢查</th>
          </tr>
          @for (row of r.rows; track $index) {
            <tr [class.lose]="!row.win">
              <td class="pf-num">{{ $index + 1 }}</td>
              <td class="pf-num">{{ sgn(row.g) }}</td>
              <td class="pf-num">{{ row.a ? fmt(row.a) : '—' }}</td>
              <td>{{ row.win ? '✓ ' + row.note : '✗ ' + row.note }}</td>
            </tr>
          }
        </table>
        @if (r.kind === 'lose') {
          <p class="pf-feedback bad" role="status">{{ r.msg }}這一回合{{ otherName() }}贏了，換一條規則再試。</p>
        } @else if (r.kind === 'example') {
          <p class="pf-feedback you" role="status">
            {{ otherName() }}準備的 {{ r.rows.length }} 招，你都贏了。可是這仍然只是 {{ r.rows.length }} 個例子：沒試到的 {{ spec().given }} 也會贏嗎？
            換一條一眼就看得出「永遠贏」的規則，例如{{ exampleHint() || '讓 ' + spec().answer + ' 和 ' + spec().given + ' 永遠差同一個數' }}。
          </p>
        } @else {
          <div class="pf-obj made rg-reason pf-rise">
            <span class="pf-tag">{{ spec().answer }} = {{ shownSrc() }}</span>
            <div>{{ r.reason }}</div>
            <small>這個理由沒有用到 {{ spec().given }} 是多少，所以{{ otherName() }}出什麼都一樣。上面那幾回合只是例子，真正讓你贏的是這一句。</small>
          </div>
        }
      }
    }
  `,
})
export class RuleGameComponent {
  readonly spec = input.required<RuleSpec>();
  readonly inputId = input('pf-rule');
  /** What to call the side that moves first, e.g. 「對手」 or 「系統」. */
  readonly otherName = input('對手');
  readonly hint = input('2x − 5');
  readonly submitLabel = input('用這條規則');
  /** How to nudge toward a rule with an obvious reason, after a clean sweep without one. */
  readonly exampleHint = input('');
  readonly solvedRule = output<RuleSolved>();

  readonly draft = signal('');
  readonly shownSrc = signal('');
  readonly res = signal<RuleResult | null>(null);
  readonly solved = computed(() => this.res()?.kind === 'proof');
  readonly ariaLabel = computed(() => `${this.spec().answer} 的規則，用 ${this.spec().given} 寫`);

  readonly sgn = sgn;

  fmt = fmtQ;

  submit(): void {
    const src = this.draft().trim();
    const r = checkRule(this.spec(), src);
    this.res.set(r);
    if (r.kind === 'proof') {
      this.shownSrc.set(pretty(src));
      this.solvedRule.emit({ src: this.shownSrc(), reason: r.reason, c: r.c });
    }
  }
}
