import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { fmtQ, q, readNumber, sgn } from '../ch2/ch2-expr';
import { MovesComponent, Move } from './moves.component';
import { RuleGameComponent, RuleSolved } from './rule-game.component';
import { cmp, gapSpec, inDomain } from './ch4-game';

type Bet = 'yes' | 'no' | 'unsure';

/** The opponent's opening moves, answered one number at a time. */
const NUMBER_ROUNDS = [7, 1000000];

export const SENTENCE_A = '對每個整數 x，都存在一個整數 y，使 y > x。';
export const SENTENCE_B = '存在一個整數 y，使得對每個整數 x，都有 y > x。';

@Component({
  selector: 'app-pf-opponent',
  standalone: true,
  imports: [MovesComponent, RuleGameComponent],
  styleUrl: './scene-opponent.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">1 / 5 · 對手先出</p>
        <h1 class="pf-title">比 x 大的整數，<br />永遠找得到嗎？</h1>
        <p class="pf-lede">這一章的句子都帶著「對每個」或「存在」。先看兩句長得很像的話：</p>

        <div class="pair">
          @for (s of sentences; track s.id) {
            <div class="pf-slip">
              <small>句子 {{ s.id }}</small>
              <p>{{ s.text }}</p>
              <div class="pf-row bet" role="group" [attr.aria-label]="'句子 ' + s.id + ' 成立嗎？'">
                @for (o of betOpts; track o.v) {
                  <button
                    type="button"
                    class="pf-btn small"
                    [class.picked]="bets()[s.id] === o.v"
                    [attr.aria-pressed]="bets()[s.id] === o.v"
                    [disabled]="betDone()"
                    (click)="bet(s.id, o.v)"
                  >
                    {{ o.label }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
        @if (!betDone()) {
          <p class="pf-note">兩句都在講整數有多大。先憑感覺判斷，各選一個。</p>
          <div class="pf-row"><button type="button" class="pf-btn primary" [disabled]="!bets()['A'] || !bets()['B']" (click)="commitBets()">我判斷好了</button></div>
        } @else {
          <p class="pf-feedback you" role="status">先記住你的判斷。接下來不靠感覺，改用一場遊戲來判斷。這一幕先玩句子 A。</p>
        }

        <!-- why an opponent -->
        @if (betDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              句子 A 說「<b>對每個</b>整數 x」，意思是：就算挑最刁鑽的 x，句子也得成立。所以我們請一位專門找碴的<b>對手</b>來挑 x，他會盡量讓你輸。
              「<b>存在</b>一個整數 y」只要求找得到一個，所以 y 由<b>你</b>來挑。句子先寫 x、再寫 y，所以對手先出，你看到他的 x 之後再回應。
            </p>
            <app-pf-moves [moves]="movesA()" check="y > x" [result]="roundResult()" label="句子 A 的出招順序" />
            <p class="pf-note">虛線框是對手出的招，實線框是你出的招。最後檢查 y &gt; x：成立就是你贏。</p>
          </div>
        }

        <!-- number rounds -->
        @if (betDone()) {
          <div class="pf-col tight pf-rise">
            @for (r of numberRounds; track r; let i = $index) {
              @if (i <= roundIdx()) {
                <div class="round">
                  <p class="pf-q">對手出 x = <span class="pf-num">{{ sgn(r) }}</span>。你出哪個 y？</p>
                  @if (answers()[i] === undefined) {
                    <form class="pf-row" (submit)="$event.preventDefault(); answerRound(i)">
                      <label class="y-eq" [attr.for]="'pf-y-' + i">y =</label>
                      <input class="pf-input" [id]="'pf-y-' + i" inputmode="numeric" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
                      <button type="submit" class="pf-btn primary small">出這一招</button>
                    </form>
                  } @else {
                    <p class="pf-feedback good">y = {{ answers()[i] }}，{{ answers()[i] }} &gt; {{ sgn(r) }}。這一回合你贏了。<span class="ex-tag">例子</span></p>
                  }
                </div>
              }
            }
            @if (roundMsg(); as m) {
              <p class="pf-feedback bad" role="status">{{ m }}</p>
            }
          </div>
        }

        <!-- the rule -->
        @if (numbersDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              對手說：「我還可以一直出下去。」整數有無限多個，你不可能一個一個回答完。好在你是<b>後出</b>的那一方：你看得到 x，所以可以先說好一條<b>規則</b>，看到 x 就照規則算出 y。
            </p>
            <p class="pf-q">寫一條規則，讓你不管對手出什麼 x 都贏。</p>
            <app-pf-rule-game [spec]="spec" inputId="pf-rule-a" (solvedRule)="onSolved($event)" />
          </div>
        }

        @if (solved(); as s) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>句子 A</small>
              <p>{{ sentenceA }}</p>
              <span class="pf-seal proved stamp">證明</span>
            </div>
            <p class="pf-p">{{ betNote() }}句子 A 成立：你有一條對每個 x 都贏的規則 y = {{ s.src }}。白話說，就是「沒有最大的整數」。</p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>「對每個 x」由對手出招，「存在 y」由你出招。<br />你後出，所以 y 可以看著 x 決定：<br />寫成一條規則，就能一次回答所有的 x。</p>
            </div>
            <details class="pf-why">
              <summary>對手只要贏一回合就夠了嗎？</summary>
              <div>
                <p>對。「對每個 x」要求每一個 x 都過關，只要有一個 x 不過，整句就失敗。這和第 1 章一樣：一個反例就能推翻「所有」。</p>
                <p>所以兩邊的任務很不對稱：對手只要找到一招贏你，你卻得每一招都贏。這也是為什麼你需要規則，而不是一招一招地應付。</p>
              </div>
            </details>
            <p class="pf-note">句子 B 呢？下一幕換個順序來玩。</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneOpponentComponent {
  private readonly progress = inject(LearnProgressService);

  readonly sentenceA = SENTENCE_A;
  readonly sentences = [
    { id: 'A', text: SENTENCE_A },
    { id: 'B', text: SENTENCE_B },
  ];
  readonly betOpts: { v: Bet; label: string }[] = [
    { v: 'yes', label: '成立' },
    { v: 'no', label: '不成立' },
    { v: 'unsure', label: '說不準' },
  ];
  readonly numberRounds = NUMBER_ROUNDS;
  readonly spec = gapSpec({ given: 'x', answer: 'y', domain: 'Z', tests: [0, -8, 7, 1000, -1001], dir: 'gt' });

  readonly bets = signal<Record<string, Bet>>({});
  readonly betDone = signal(false);
  readonly roundIdx = signal(0);
  readonly answers = signal<Record<number, string>>({});
  readonly draft = signal('');
  readonly roundMsg = signal<string | null>(null);
  readonly solved = signal<RuleSolved | null>(null);

  readonly numbersDone = computed(() => Object.keys(this.answers()).length === NUMBER_ROUNDS.length);

  readonly movesA = computed<Move[]>(() => {
    const i = Math.min(this.roundIdx(), NUMBER_ROUNDS.length - 1);
    const answered = this.answers()[i];
    const live = !this.numbersDone();
    return [
      { q: 'forall', v: 'x', dom: 'Z', who: '對手出', value: live ? sgn(NUMBER_ROUNDS[i]) : undefined },
      { q: 'exists', v: 'y', dom: 'Z', who: '你出', value: live ? answered : undefined },
    ];
  });
  readonly roundResult = computed<'win' | null>(() => {
    if (this.numbersDone()) return null;
    return this.answers()[this.roundIdx()] !== undefined ? 'win' : null;
  });

  readonly betNote = computed(() => {
    const b = this.bets()['A'];
    if (b === 'yes') return '你一開始就判斷它成立，對。';
    if (b === 'no') return '你一開始判斷它不成立，現在看來不是這樣。';
    return '你一開始說不準，現在有答案了。';
  });

  readonly sgn = sgn;

  bet(id: string, v: Bet): void {
    this.bets.update((b) => ({ ...b, [id]: v }));
  }

  commitBets(): void {
    this.betDone.set(true);
    this.progress.saveStepData('proofs-ch4', '1', 'betB', this.bets()['B']);
  }

  answerRound(i: number): void {
    const x = NUMBER_ROUNDS[i];
    const r = readNumber(this.draft());
    if (!r.ok) {
      this.roundMsg.set(r.msg);
      return;
    }
    if (!inDomain(r.v, 'Z')) {
      this.roundMsg.set(`${fmtQ(r.v)} 不是整數，句子要的 y 是整數。`);
      return;
    }
    if (cmp(r.v, q(x)) <= 0) {
      this.roundMsg.set(`${fmtQ(r.v)} 沒有比 ${sgn(x)} 大，這一招會輸。再出一次。`);
      return;
    }
    this.roundMsg.set(null);
    this.answers.update((a) => ({ ...a, [i]: fmtQ(r.v) }));
    this.draft.set('');
    if (i + 1 < NUMBER_ROUNDS.length) this.roundIdx.set(i + 1);
  }

  onSolved(s: RuleSolved): void {
    this.solved.set(s);
    this.progress.markCompleted('proofs-ch4', '1');
  }
}
