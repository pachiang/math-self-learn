import { Component, computed, input, output, signal } from '@angular/core';
import { Domain } from '../ch4/ch4-game';
import { Move, MovesComponent } from '../ch4/moves.component';

export type Qt = 'forall' | 'exists';

export interface NQuant {
  q: Qt;
  v: string;
  dom: Domain;
  /** Plain-language range for the move strip, e.g. 「學生」. */
  domText?: string;
  /** How this quantifier reads as 「對每個」 and as 「存在」, e.g. 「每個學生 s」「有一個學生 s」. */
  all: string;
  some: string;
}

export interface NBodyOption {
  text: string;
  ok: boolean;
  /** Feedback when picked: why it is or is not the exact opposite. */
  why: string;
}

export interface NegSpec {
  quants: NQuant[];
  /** The innermost condition, e.g. 「s 的 c 不及格」. */
  body: string;
  /** Candidates for 「並非（body）」. Without them the machine stops with 並非 in front of the body. */
  options?: NBodyOption[];
  /** Check text for the original and the negated move strips. */
  check: string;
  negCheck?: string;
}

interface Chip {
  kind: 'neg' | 'forall' | 'exists' | 'body';
  text: string;
  /** This chip just changed in this line. */
  fresh?: boolean;
}

const flip = (q: Qt): Qt => (q === 'forall' ? 'exists' : 'forall');

/**
 * The negation machine: 「並非」 starts at the far left and is pushed right one quantifier at a time.
 * Each line is the same sentence as the line above; the learner chooses every flip.
 */
@Component({
  selector: 'app-pf-negate',
  standalone: true,
  imports: [MovesComponent],
  styleUrl: './negate-machine.component.scss',
  template: `
    <ol class="nm-lines" [attr.aria-label]="label() + '：否定的每一步'">
      @for (row of rows(); track $index; let i = $index) {
        <li class="nm-line" [class.cur]="i === rows().length - 1 && !done()">
          <span class="nm-eq" aria-hidden="true">{{ i === 0 ? '' : '＝' }}</span>
          <span class="nm-chips">
            @for (c of row; track $index) {
              <span [class]="'nm-chip ' + c.kind" [class.fresh]="c.fresh">
                @if (c.kind === 'forall') {
                  <b aria-hidden="true">∀</b>
                } @else if (c.kind === 'exists') {
                  <b aria-hidden="true">∃</b>
                } @else if (c.kind === 'neg') {
                  <b aria-hidden="true">¬</b>
                }
                {{ c.text }}
                @if (c.fresh) {
                  <small class="nm-fresh">剛翻面</small>
                }
              </span>
            }
          </span>
        </li>
      }
    </ol>

    @if (!done()) {
      @if (k() < spec().quants.length) {
        @let qt = spec().quants[k()];
        <p class="pf-q nm-ask">「並非」要往右跨過「{{ word(qt.q, qt) }}」。跨過之後，這一格變成什麼？</p>
        <div class="pf-row" role="group" aria-label="這一格要翻成">
          <button type="button" class="pf-btn" (click)="pickQuant('forall')">{{ qt.all }}</button>
          <button type="button" class="pf-btn" (click)="pickQuant('exists')">{{ qt.some }}</button>
        </div>
      } @else if (spec().options; as opts) {
        <p class="pf-q nm-ask">「並非」走到最裡面了。「{{ spec().body }}」不成立，換成正面的說法是？</p>
        <div class="nm-opts" role="group" aria-label="最裡面翻成">
          @for (o of opts; track o.text; let j = $index) {
            <button type="button" class="pf-btn" [class.picked]="bodyPick() === j" [attr.aria-pressed]="bodyPick() === j" (click)="pickBody(j)">{{ o.text }}</button>
          }
        </div>
      }
    }
    @if (msg(); as m) {
      <p class="pf-feedback" [class.bad]="msgBad()" [class.good]="!msgBad()" role="status">{{ m }}</p>
    }

    @if (done() && showGames()) {
      <div class="nm-games pf-rise">
        <div>
          <small>原句的遊戲</small>
          <app-pf-moves [moves]="origMoves()" [check]="spec().check" [symbols]="true" [label]="label() + '：原句的出招順序'" />
        </div>
        <div>
          <small>否定句的遊戲</small>
          <app-pf-moves [moves]="negMoves()" [check]="spec().negCheck ?? '並非（' + spec().check + '）'" [symbols]="true" [label]="label() + '：否定句的出招順序'" />
        </div>
      </div>
    }
  `,
})
export class NegateMachineComponent {
  readonly spec = input.required<NegSpec>();
  readonly label = input('否定機器');
  /** Show the original and negated move strips once finished. */
  readonly showGames = input(true);
  /** Fires once the negation is complete, with the final sentence as plain text. */
  readonly finished = output<string>();

  /** Position of 並非: 0 = far left, quants.length = in front of the body. */
  readonly k = signal(0);
  readonly bodyPick = signal<number | null>(null);
  readonly done = signal(false);
  readonly msg = signal<string | null>(null);
  readonly msgBad = signal(false);

  readonly rows = computed<Chip[][]>(() => {
    const out: Chip[][] = [];
    for (let k = 0; k <= this.k(); k++) out.push(this.line(k, false));
    if (this.done() && this.spec().options) out.push(this.line(this.spec().quants.length, true));
    return out;
  });

  readonly origMoves = computed<Move[]>(() => this.spec().quants.map((qt) => this.move(qt, qt.q)));
  readonly negMoves = computed<Move[]>(() => this.spec().quants.map((qt) => this.move(qt, flip(qt.q))));

  word(q: Qt, qt: NQuant): string {
    return q === 'forall' ? qt.all : qt.some;
  }

  pickQuant(q: Qt): void {
    const qt = this.spec().quants[this.k()];
    if (q !== flip(qt.q)) {
      this.msgBad.set(true);
      this.msg.set(
        qt.q === 'forall'
          ? `「並非${qt.all} 都…」不是說${qt.all} 都不…，只要有一個出問題，它就成立了。所以「並非」跨過「對每個」，會變成「存在」。`
          : `「並非${qt.some} …」是說連一個都找不到，也就是每一個都不…。所以「並非」跨過「存在」，會變成「對每個」。`,
      );
      return;
    }
    this.msgBad.set(false);
    this.msg.set(
      qt.q === 'forall'
        ? `對。「並非${qt.all} 都…」，就是${qt.some} 不…。`
        : `對。「並非${qt.some} …」，就是${qt.all} 都不…。`,
    );
    this.k.update((k) => k + 1);
    if (this.k() === this.spec().quants.length && !this.spec().options) this.finish();
  }

  pickBody(j: number): void {
    const o = this.spec().options![j];
    this.bodyPick.set(j);
    this.msgBad.set(!o.ok);
    this.msg.set(o.why);
    if (o.ok) this.finish();
  }

  private finish(): void {
    this.done.set(true);
    const last = this.rows()[this.rows().length - 1];
    this.finished.emit(last.map((c) => (c.kind === 'neg' ? '並非' : c.text)).join('，'));
  }

  private move(qt: NQuant, q: Qt): Move {
    return { q, v: qt.v, dom: qt.dom, domText: qt.domText, who: q === 'forall' ? '對手出' : '你出' };
  }

  /** The sentence with 並非 at position k; `final` replaces 並非 + body with the chosen opposite. */
  private line(k: number, final: boolean): Chip[] {
    const s = this.spec();
    const chips: Chip[] = s.quants.map((qt, i) => {
      const q = i < k ? flip(qt.q) : qt.q;
      return { kind: q, text: this.word(q, qt), fresh: !final && i === k - 1 };
    });
    if (final) {
      chips.push({ kind: 'body', text: s.options![this.bodyPick()!].text, fresh: true });
    } else {
      chips.splice(k, 0, { kind: 'neg', text: '並非' });
      chips.push({ kind: 'body', text: s.body });
    }
    return chips;
  }
}
