import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CONSEC_EVEN, CardId } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

type Side = 'n' | 'n1';

/** The opponent's answer to each early commitment: the n that breaks the chosen side. */
const BREAK: Record<Side, number> = { n: 3, n1: 2 };
const COLS = Array.from({ length: 8 }, (_, i) => i - 3);
const fmt = (n: number): string => String(n).replace('-', '−');
const isEven = (n: number): boolean => n % 2 === 0;

@Component({
  selector: 'app-pf-pick-side',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', '../ch8/ch8.scss', './ch9-side.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">3 / 5 · 目標是「或」</p>
        <h1 class="pf-title">目標是「或」：<br />先別選邊</h1>
        <p class="pf-lede">上一幕的一行證法借了一句話：n 和 n + 1 一定有一個是偶數。把它寫成要證的句子：</p>
        <div class="c7-claim">
          <small>要證的句子</small>
          <p>對每個整數 n，n 是偶數，或 n + 1 是偶數。</p>
        </div>
        <p class="pf-p">
          這是和對手的遊戲：對手出 n，你要讓這句話成立。在對手出招之前，先說好你要證哪一邊：
        </p>
        <div class="c7-predict" role="group" aria-label="先證哪一邊">
          <button type="button" class="pf-btn" [class.picked]="last() === 'n'" (click)="pick('n')">我證「n 是偶數」</button>
          <button type="button" class="pf-btn" [class.picked]="last() === 'n1'" (click)="pick('n1')">我證「n + 1 是偶數」</button>
        </div>

        @if (last(); as s) {
          <div class="c9-duel pf-rise" role="status">
            <div class="c9-opp">
              <small>對手出</small>
              <b class="pf-num">n = {{ breakN(s) }}</b>
            </div>
            <ul class="c9-sides">
              <li [class.mine]="s === 'n'" [class.no]="!isEven(breakN(s))">
                <span>n 是偶數？</span><b>{{ breakN(s) }} {{ isEven(breakN(s)) ? '是偶數 ✓' : '不是偶數 ✗' }}</b>
                @if (s === 'n') {<small>你選的這一邊</small>}
              </li>
              <li [class.mine]="s === 'n1'" [class.no]="!isEven(breakN(s) + 1)">
                <span>n + 1 是偶數？</span><b>{{ breakN(s) + 1 }} {{ isEven(breakN(s) + 1) ? '是偶數 ✓' : '不是偶數 ✗' }}</b>
                @if (s === 'n1') {<small>你選的這一邊</small>}
              </li>
            </ul>
            <p class="pf-feedback bad">
              你選的那一邊，對手一招就讓它不成立。可是整句話對 n = {{ breakN(s) }} 還是成立：另一邊是對的。{{ tried().size < 2 ? '換另一邊試試。' : '' }}
            </p>
          </div>
        }

        @if (tried().size === 2) {
          <div class="c6-block pf-rise">
            <p class="pf-p">兩邊都被對手打掉了。把很多個 n 排在一起看：</p>
            <table class="pf-table c9-or" aria-describedby="pf-c9-or-note">
              <caption class="pf-sr-only">n 從 −3 到 4，兩邊哪一邊成立</caption>
              <tr>
                <th scope="col">n</th>
                @for (n of cols; track n) {
                  <th scope="col" class="pf-num">{{ fmt(n) }}</th>
                }
                <th scope="col">這一列滿嗎</th>
              </tr>
              <tr>
                <th scope="row">n 是偶數</th>
                @for (n of cols; track n) {
                  <td [class.yes]="isEven(n)">{{ isEven(n) ? '✓' : '' }}</td>
                }
                <td class="verdict">不滿</td>
              </tr>
              <tr>
                <th scope="row">n + 1 是偶數</th>
                @for (n of cols; track n) {
                  <td [class.yes]="isEven(n + 1)">{{ isEven(n + 1) ? '✓' : '' }}</td>
                }
                <td class="verdict">不滿</td>
              </tr>
              <tr class="sum">
                <th scope="row">兩邊至少一個</th>
                @for (n of cols; track n) {
                  <td class="yes">✓</td>
                }
                <td class="verdict">滿</td>
              </tr>
            </table>
            <p class="pf-note" id="pf-c9-or-note">表格只排了 8 個 n<span class="c8-tag finite">有限檢查</span>，用來看出每一欄和每一列的差別。</p>
            <p class="pf-p">
              每一欄都有 ✓：不管對手出哪個 n，「或」都成立。可是沒有一列是滿的：沒有哪一邊對每個 n 都成立。在對手出招之前選邊，等於宣稱某一列是滿的，所以一定會輸。
            </p>
            <div class="pf-def">
              <small>兩句不一樣的話</small>
              <p>「對每個 n，n 是偶數或 n + 1 是偶數」是一欄一欄看；「n 是偶數對每個 n 成立，或 n + 1 是偶數對每個 n 成立」是一列一列看。第 4 章看過，「對每個」和其他詞換順序，意思就變了。</p>
            </div>
          </div>

          <div class="c6-block pf-rise">
            <p class="pf-p">
              所以不能先選邊。新卡「排除一邊」換個方式做：假設其中一邊不成立，改證另一邊。這樣你選哪一邊，就等於先看過對手的 n 才決定。
            </p>
            <details class="pf-why">
              <summary>為什麼可以只證另一邊？</summary>
              <div>
                <p>被排除的那一邊 A，要嘛成立、要嘛不成立（本課採用的經典邏輯）。A 成立時，「A 或 B」已經成立了，什麼都不用做；A 不成立時，才需要證 B。</p>
                <p>所以「排除一邊」其實也是分兩種情況，只是其中一種一步就證完。這兩種情況蓋滿了所有可能。</p>
              </div>
            </details>
            <app-pf-board
              [start]="start"
              [deck]="deck"
              deckNote="第 9 章加了一張卡：排除一邊。"
              [frozen]="!!final()"
              label="定理：對每個整數 n，n 是偶數，或 n + 1 是偶數"
              idBase="pf-c9-side"
              (solved)="onSolved($event)"
              (changed)="onChanged($event)"
              (refused)="onRefused($event.card, $event.code)"
            />
            @if (hint(); as h) {
              <p class="pf-feedback you pf-rise" role="note">{{ h }}</p>
            }
          </div>
        }

        @if (final()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              板上沒有任何一步事先選邊。H1 說「{{ dropped() }}」不成立，那是假設出來的，接下來每一步都只對這種 n 成立；對手出的 n 如果讓「{{ dropped() }}」成立，「或」本來就成立了。
            </p>
            <p class="pf-p">{{ otherWay() }}</p>
            <div class="pf-def">
              <small>新卡 · 9.3 證過</small>
              <p>連續兩個整數，有一個是偶數：對每個整數 x，x 是偶數，或 x + 1 是偶數。上一幕一行證法借用的那句話，現在補上了。</p>
            </div>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>目標是「A 或 B」時，哪一邊成立要看對手給的數，不能先選邊。<br />假設 A 不成立，改證 B；A 成立的那一半本來就完成了。</p>
            </div>
            <p class="pf-note">
              「或」也常出現在前提裡，而且兩種情況長得幾乎一樣。<a routerLink="/learn/proofs/ch9/4">下一幕</a>看什麼時候可以只寫一種。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class ScenePickSideComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = CONSEC_EVEN;
  readonly deck: CardId[] = ['intro', 'assume', 'unfoldGoal', 'witness', 'check', 'exclude', 'unfold', 'obtain', 'flip'];
  readonly cols = COLS;
  readonly fmt = fmt;
  readonly isEven = isEven;

  readonly last = signal<Side | null>(null);
  readonly tried = signal(new Set<Side>());
  readonly st = signal<BoardState | null>(null);
  readonly final = signal<BoardState | null>(null);
  readonly hint = signal<string | null>(null);

  /** Which side the learner's proof excluded, read from the log. */
  private readonly droppedLeft = computed(() => !!this.final()?.log.some((e) => e.card === 'exclude' && e.text.includes('「n 是偶數」不成立')));
  readonly dropped = computed(() => (this.droppedLeft() ? 'n 是偶數' : 'n + 1 是偶數'));
  readonly otherWay = computed(() =>
    this.droppedLeft()
      ? '排除另一邊也走得通：假設 n + 1 不是偶數，換正面得到 n + 1 = 2k + 1，也就是 n = 2k，證人選 k。'
      : '排除另一邊也走得通：假設 n 不是偶數，換正面得到 n = 2k + 1，於是 n + 1 = 2k + 2，證人選 k + 1。',
  );

  breakN(s: Side): number {
    return BREAK[s];
  }

  pick(s: Side): void {
    this.last.set(s);
    this.tried.update((t) => new Set(t).add(s));
  }

  onChanged(st: BoardState): void {
    this.hint.set(null);
    this.st.set(st);
  }

  onRefused(card: CardId, code: string): void {
    if (card === 'unfold') {
      this.hint.set('「不是偶數」沒有定義可以展開。先用「換正面」把它換成「是奇數」，奇數就有定義可以展開了。');
    } else if (code === 'shape' && card !== 'exclude' && this.st()?.goal?.t === 'or') {
      this.hint.set('目標最外層是「或」。這一幕新加的卡裡，哪一張是對「或」用的？');
    } else if (code === 'neq') {
      this.hint.set('提示：從 n + 1 出發，把已知裡 n 的等式代進去，再和 2 × □ 對齊。');
    }
  }

  onSolved(st: BoardState): void {
    if (!st.log.some((e) => e.card === 'exclude')) {
      this.hint.set('證完了，不過這次沒有用到「排除一邊」。按「退一步」回去再走一次。');
      return;
    }
    this.hint.set(null);
    this.final.set(st);
    this.progress.markCompleted('proofs-ch9', '3');
  }
}
