import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CardId, PROD_EVEN } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

type Seg = string | { v: 'a' | 'b' };

interface Swap {
  id: 's1' | 's2';
  segs: Seg[];
  same: boolean;
  yes: string;
  no: string;
}

const A = { v: 'a' as const };
const B = { v: 'b' as const };

const SWAPS: Record<'s1' | 's2', Swap> = {
  s1: {
    id: 's1',
    segs: ['若 ', A, ' 是偶數或 ', B, ' 是偶數，則 ', A, B, ' 是偶數'],
    same: true,
    yes: '對。「或」的兩邊換順序，說的是同一件事；ba 和 ab 是同一個數。題目對調後沒有變，情況 2 就是情況 1 換個名字。',
    no: '再讀一次：「b 是偶數或 a 是偶數」和「a 是偶數或 b 是偶數」說的是同一件事，ba 也等於 ab。題目對調後沒有變。',
  },
  s2: {
    id: 's2',
    segs: ['若 ', A, ' 是偶數或 ', B, ' 是偶數，則 ', A, '(', B, ' + 1) 是偶數'],
    same: false,
    yes: '再算一次：a(b + 1) = ab + a，b(a + 1) = ab + b。多出來的那一項換人了，兩個數一般不相等，所以題目對調後變了。',
    no: '對。a(b + 1) = ab + a，b(a + 1) = ab + b，多出來的那一項換人了。題目對調後變了，「b 是偶數」那一種情況不是「a 是偶數」換名字，同學漏證了它。',
  },
};

/** Parity of an expression in each class of (a, b): e = even, o = odd. */
type Cell = 'ee' | 'eo' | 'oe' | 'oo';
const CELLS: Cell[] = ['ee', 'eo', 'oe', 'oo'];
const par = (x: 'e' | 'o') => (x === 'e' ? 0 : 1);
const EXPRS = [
  { id: 'ab', name: 'ab', val: (a: number, b: number) => (a * b) % 2 },
  { id: 'ab1', name: 'a(b + 1)', val: (a: number, b: number) => (a * (b + 1)) % 2 },
];

@Component({
  selector: 'app-pf-wlog',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink, NgTemplateOutlet],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', '../ch8/ch8.scss', './ch9-wlog.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">4 / 5 · WLOG</p>
        <h1 class="pf-title">不失一般性：<br />對調名字，還是同一題</h1>
        <p class="pf-lede">這一次，「或」出現在前提裡：</p>
        <div class="c7-claim">
          <small>要證的句子</small>
          <p>對每個整數 a、b，若 a 是偶數或 b 是偶數，則 ab 是偶數。</p>
        </div>
        <p class="pf-p">
          假設前提之後，已知裡會有一條「a 是偶數，或 b 是偶數」。不知道是哪一邊，就用新卡「分情況」：兩邊各證一次。
        </p>
        <app-pf-board
          [start]="start"
          [deck]="deck"
          deckNote="第 9 章加了一張卡：分情況。"
          [frozen]="!!final()"
          label="定理：若 a 是偶數或 b 是偶數，則 ab 是偶數"
          idBase="pf-c9-wlog"
          (solved)="onSolved($event)"
          (changed)="hint.set(null)"
          (refused)="onRefused($event.card, $event.code)"
        />
        @if (hint(); as h) {
          <p class="pf-feedback you pf-rise" role="note">{{ h }}</p>
        }

        @if (final()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">把兩種情況的步法並排，a 和 b 標出來：</p>
            <div class="c9-logs">
              @for (c of cases(); track c.id) {
                <div class="c9-log">
                  <small>情況 {{ c.id }} · {{ c.label }}</small>
                  <ol>
                    @for (line of c.lines; track $index) {
                      <li>
                        @for (s of marks(line); track $index) {
                          @if (s.v) {<b class="c9-ab">{{ s.t }}</b>} @else {<span>{{ s.t }}</span>}
                        }
                      </li>
                    }
                  </ol>
                </div>
              }
            </div>
            <p class="pf-p">
              逐行對照：把情況 1 裡的 a 和 b 對調，就是情況 2，連 H 的編號都一樣。第二遍其實沒有任何新東西。
            </p>
            <p class="pf-p">
              所以數學家會寫：「<b>不失一般性（without loss of generality，WLOG）</b>，設 a 是偶數。」只證情況 1。可是這句話有條件：把題目裡的 a、b 對調之後，必須還是同一題。按下按鈕對調看看：
            </p>
            <ng-container *ngTemplateOutlet="swapBox; context: { $implicit: swaps.s1 }" />
          </div>
        }

        @if (answer('s1') === true) {
          <div class="c6-block pf-rise">
            <p class="pf-p">另一位同學用同一招證一句很像的話：</p>
            <div class="c7-claim">
              <small>同學的證明</small>
              <p>對每個整數 a、b，若 a 是偶數或 b 是偶數，則 a(b + 1) 是偶數。</p>
            </div>
            <ol class="c6-proof">
              <li><span class="c6-ln">1</span><span>令 a、b 為任意整數，假設 a 是偶數或 b 是偶數。</span></li>
              <li><span class="c6-ln">2</span><span>不失一般性，設 a 是偶數，也就是 a = 2k。</span></li>
              <li><span class="c6-ln">3</span><span>a(b + 1) = 2k(b + 1) = 2 · k(b + 1)，是偶數。證完。</span></li>
            </ol>
            <p class="pf-q small">這段證明對嗎？</p>
            <div class="c7-predict" role="group" aria-label="同學的證明對嗎">
              <button type="button" class="pf-btn" [class.picked]="s2Guess() === 'ok'" (click)="s2Guess.set('ok')">對</button>
              <button type="button" class="pf-btn" [class.picked]="s2Guess() === 'bad'" (click)="s2Guess.set('bad')">不對</button>
            </div>
          </div>
        }

        @if (s2Guess()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">第 3 行的代數沒有錯。問題在第 2 行：做一次對調測試。</p>
            <ng-container *ngTemplateOutlet="swapBox; context: { $implicit: swaps.s2 }" />
          </div>
        }

        @if (answer('s2') === false) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              用奇偶四格圖看清楚漏掉的是哪裡。每一格代表一整類整數（例如「a 奇、b 偶」是所有這樣的 a、b），格子裡寫的是那個式子的奇偶，由定義算出來，不是挑幾個數驗算：
            </p>
            <div class="c9-grids">
              @for (e of exprs; track e.id) {
                <figure class="c9-gfig">
                  <figcaption>結論裡的式子：<b class="pf-num">{{ e.name }}</b></figcaption>
                  <div class="c9-grid" role="table" [attr.aria-label]="e.name + ' 的奇偶四格圖'">
                    <span class="hd" role="columnheader"></span>
                    <span class="hd" role="columnheader">b 是偶數</span>
                    <span class="hd" role="columnheader">b 是奇數</span>
                    @for (r of ['e', 'o']; track r) {
                      <span class="hd" role="rowheader">{{ r === 'e' ? 'a 是偶數' : 'a 是奇數' }}</span>
                      @for (c of ['e', 'o']; track c) {
                        <div class="cell" role="cell" [class]="'cell ' + cellClass(e.id, r + c)">
                          @if (r + c === 'oo') {
                            <span class="v">—</span><small>前提不成立，不必證</small>
                          } @else {
                            <span class="v">{{ cellVal(e.id, r + c) === 0 ? '偶數 ✓' : '奇數 ✗' }}</span>
                            <small>{{ cellNote(e.id, r + c) }}</small>
                          }
                        </div>
                      }
                    }
                  </div>
                </figure>
              }
            </div>
            <p class="pf-p">
              WLOG 只證上面那一排（a 是偶數），下面的「a 奇、b 偶」那一格，靠的是「對調 a、b 就是右上那一格」。左圖兩格的值一樣，這個靠得住；右圖一格是偶數、一格是奇數，靠不住，而且那一格的結論根本不成立。
            </p>
            <p class="pf-p">從那一格挑一組數，打出反例：</p>
            <form class="c7-blanks" (submit)="$event.preventDefault(); tryCx()">
              <label class="c7-blank"><small>a</small><input class="pf-input" autocomplete="off" [value]="aDraft()" (input)="aDraft.set($any($event.target).value)" /></label>
              <label class="c7-blank"><small>b</small><input class="pf-input" autocomplete="off" [value]="bDraft()" (input)="bDraft.set($any($event.target).value)" /></label>
              <button type="submit" class="pf-btn primary small">檢查</button>
            </form>
            @if (cxMsg(); as m) {
              @if (cxFound()) {
                <p class="pf-feedback c7-verdict bad pf-rise" role="status">
                  <span>{{ m }}</span>
                  <span class="pf-seal mini refuted stamp">推翻</span>
                </p>
              } @else {
                <p class="pf-feedback" role="status">{{ m }}</p>
              }
            }
          </div>
        }

        @if (cxFound()) {
          <div class="c6-block pf-rise">
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>不失一般性是一種縮寫：兩種情況對調名字就是同一個證明，所以只寫一次。<br />題目對調名字之後不變，才可以這樣縮寫。</p>
            </div>
            <details class="pf-why">
              <summary>最常見的 WLOG：「設 a ≤ b」</summary>
              <div>
                <p>任兩個整數，不是 a ≤ b 就是 b ≤ a，兩種情況蓋滿（a = b 時兩種都算，重疊沒關係）。把 a、b 對調，「a ≤ b」就變成「b ≤ a」。</p>
                <p>所以只要題目對調 a、b 不變，例如「a + b」「|a − b|」「a、b 的最大公因數」，就可以設 a ≤ b 只證一種。題目若是「a − b ≥ 0」這種對調會變號的句子，就不行。</p>
              </div>
            </details>
            <p class="pf-note">
              到目前為止的切法都很自然：偶數和奇數、前提裡的兩邊。<a routerLink="/learn/proofs/ch9/5">最後一幕</a>要你自己決定怎麼切。
            </p>
          </div>
        }

        <ng-template #swapBox let-sw>
          <div class="c9-swap">
            <p class="c9-sent" [attr.aria-label]="sentence(sw, swapped(sw.id))">
              @for (s of sw.segs; track $index) {
                @if (isVar(s)) {
                  <span class="c9-var" [class.sw]="swapped(sw.id)">{{ letter(s, swapped(sw.id)) }}</span>
                } @else {
                  <span>{{ s }}</span>
                }
              }
            </p>
            <div class="pf-row">
              <button type="button" class="pf-btn small" [attr.aria-pressed]="swapped(sw.id)" (click)="toggleSwap(sw.id)">
                {{ swapped(sw.id) ? '換回原題' : '對調 a、b' }}
              </button>
              @if (swapped(sw.id)) {
                <span class="pf-note">對調後：{{ sentence(sw, true) }}</span>
              }
            </div>
            @if (seenSwap(sw.id)) {
              <p class="pf-q small">對調之後，和原題一樣嗎？</p>
              <div class="pf-row" role="group" aria-label="對調後和原題一樣嗎">
                <button type="button" class="pf-btn small" [class.picked]="answer(sw.id) === true" (click)="judge(sw, true)">一樣</button>
                <button type="button" class="pf-btn small" [class.picked]="answer(sw.id) === false" (click)="judge(sw, false)">不一樣</button>
              </div>
              @if (answer(sw.id) !== null) {
                <p class="pf-feedback" [class.good]="answer(sw.id) === sw.same" [class.bad]="answer(sw.id) !== sw.same" role="status">
                  {{ answer(sw.id) ? sw.yes : sw.no }}
                </p>
              }
            }
          </div>
        </ng-template>
      </div>
    </section>
  `,
})
export class SceneWlogComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = PROD_EVEN;
  readonly deck: CardId[] = ['intro', 'assume', 'unfoldGoal', 'witness', 'check', 'cases', 'unfold', 'obtain'];
  readonly swaps = SWAPS;
  readonly exprs = EXPRS;

  readonly final = signal<BoardState | null>(null);
  readonly hint = signal<string | null>(null);
  private readonly swapState = signal<Record<string, boolean>>({});
  private readonly seen = signal<Record<string, boolean>>({});
  private readonly answers = signal<Record<string, boolean | null>>({});
  readonly s2Guess = signal<'ok' | 'bad' | null>(null);
  readonly aDraft = signal('');
  readonly bDraft = signal('');
  readonly cxMsg = signal<string | null>(null);
  readonly cxFound = signal(false);

  readonly cases = computed(() => {
    const st = this.final();
    if (!st) return [];
    return st.tabs
      .filter((t) => !t.id.includes('.'))
      .map((t) => ({ id: t.id, label: t.label, lines: st.log.filter((e) => e.tab === t.id).map((e) => e.text) }));
  });

  marks(text: string): { t: string; v: boolean }[] {
    return text
      .split(/([ab])/)
      .filter((t) => t)
      .map((t) => ({ t, v: t === 'a' || t === 'b' }));
  }

  isVar(s: Seg): s is { v: 'a' | 'b' } {
    return typeof s !== 'string';
  }
  letter(s: { v: 'a' | 'b' }, sw: boolean): string {
    return sw ? (s.v === 'a' ? 'b' : 'a') : s.v;
  }
  sentence(sw: Swap, swapped: boolean): string {
    return sw.segs.map((s) => (typeof s === 'string' ? s : this.letter(s, swapped))).join('');
  }
  swapped(id: string): boolean {
    return !!this.swapState()[id];
  }
  seenSwap(id: string): boolean {
    return !!this.seen()[id];
  }
  answer(id: string): boolean | null {
    return this.answers()[id] ?? null;
  }
  toggleSwap(id: string): void {
    this.swapState.update((s) => ({ ...s, [id]: !s[id] }));
    this.seen.update((s) => ({ ...s, [id]: true }));
  }
  /** The feedback text is keyed by the pick: yes answers 「一樣」, no answers 「不一樣」. */
  judge(sw: Swap, same: boolean): void {
    this.answers.update((a) => ({ ...a, [sw.id]: same }));
  }

  cellVal(expr: string, cell: string): number {
    const e = EXPRS.find((x) => x.id === expr)!;
    return e.val(par(cell[0] as 'e' | 'o'), par(cell[1] as 'e' | 'o'));
  }
  cellClass(expr: string, cell: string): string {
    if (cell === 'oo') return 'off';
    const top = cell[0] === 'e' ? 'wlog' : '';
    const miss = cell === 'oe' ? 'miss' : '';
    const bad = this.cellVal(expr, cell) === 1 ? 'bad' : '';
    return [top, miss, bad].filter(Boolean).join(' ');
  }
  cellNote(expr: string, cell: string): string {
    if (cell[0] === 'e') return 'WLOG 證了這一排';
    const mirror = this.cellVal(expr, 'eo');
    const here = this.cellVal(expr, 'oe');
    return mirror === here ? '和右上那格對調，值一樣：靠得住' : '和右上那格對調，值不一樣：靠不住';
  }

  tryCx(): void {
    const parse = (s: string) => (/^[−-]?\d{1,4}$/.test(s.trim()) ? Number(s.trim().replace('−', '-')) : null);
    const a = parse(this.aDraft());
    const b = parse(this.bDraft());
    if (a === null || b === null) {
      this.cxMsg.set('a、b 都請打整數。');
      return;
    }
    const f = (n: number) => String(n).replace('-', '−');
    /** A factor in a product: (−3) × 3, not −3 × 3. */
    const p = (n: number) => (n < 0 ? `(${f(n)})` : f(n));
    const v = a * (b + 1);
    const even = (n: number) => n % 2 === 0;
    if (!even(a) && !even(b)) {
      this.cxMsg.set(`a = ${f(a)}、b = ${f(b)} 都是奇數，前提不成立，句子對這一組沒有要求。反例要讓前提成立。`);
      return;
    }
    if (even(v)) {
      this.cxMsg.set(`a(b + 1) = ${p(a)} × ${p(b + 1)} = ${f(v)}，是偶數，這一組沒有推翻結論。看看四格圖裡打 ✗ 的那一格。`);
      return;
    }
    this.cxFound.set(true);
    this.cxMsg.set(`a = ${f(a)}、b = ${f(b)}：b 是偶數，前提成立；a(b + 1) = ${p(a)} × ${p(b + 1)} = ${f(v)}，是奇數。同學的證明漏掉的那一種情況裡，結論不成立。`);
    this.progress.markCompleted('proofs-ch9', '4');
  }

  onRefused(card: CardId, code: string): void {
    if (card === 'witness' && code === 'early') {
      this.hint.set('已知裡的「a 是偶數，或 b 是偶數」還沒處理。用「分情況」把它拆成兩種情況。');
    } else if (card === 'unfold' && code === 'none') {
      this.hint.set('「或」不能直接展開：不知道是哪一邊成立。先用「分情況」，每一種情況裡就有一條可以展開的已知。');
    }
  }

  onSolved(st: BoardState): void {
    this.hint.set(null);
    this.final.set(st);
  }
}
