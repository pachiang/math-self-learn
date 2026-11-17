import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CardId, NO_SOLUTION_MOVES, applyMove, findClash, noSolution, replay } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { FlipDemoComponent } from './flip-demo.component';

const R = Array.from({ length: 11 }, (_, i) => i - 5);
const num = (x: number): string => String(x).replace('-', '−');

@Component({
  selector: 'app-pf-contra',
  standalone: true,
  imports: [ProofBoardComponent, FlipDemoComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', './ch8.scss', './ch8-lattice.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">3 / 6 · 反證</p>
        <h1 class="pf-title">反證：<br />目標變成「找出矛盾」</h1>
        <p class="pf-lede">這次的目標本身就是一句否定：</p>
        <div class="c7-claim">
          <small>要證的句子</small>
          <p>不存在整數 a、b，使 4a + 6b = 1。</p>
        </div>

        <p class="pf-p">
          先找找看。下面每一格是一組 (a, b) 算出來的 4a + 6b；等於 {{ fmt(c()) }} 的格子會框起來。用方向鍵在格子裡移動，或直接看：
        </p>
        <div class="c8-lat-wrap">
          <div
            class="c8-lattice pf-focus"
            role="grid"
            tabindex="0"
            [attr.aria-label]="'4a + 6b 的值，a 和 b 從 −5 到 5。目前 a = ' + fmt(cur()[0]) + '、b = ' + fmt(cur()[1]) + '，4a + 6b = ' + fmt(val(cur()[0], cur()[1]))"
            (keydown)="move($event)"
          >
            <span class="ax">b＼a</span>
            @for (a of range; track a) {
              <span class="ax">{{ fmt(a) }}</span>
            }
            @for (b of rangeDesc; track b) {
              <span class="ax">{{ fmt(b) }}</span>
              @for (a of range; track a) {
                <span
                  class="v"
                  [class.hit]="val(a, b) === c()"
                  [class.cur]="a === cur()[0] && b === cur()[1]"
                  >{{ fmt(val(a, b)) }}</span
                >
              }
            }
          </div>
          <div class="c8-lat-side">
            <p class="c8-count" role="status">
              這 121 組裡，有 <span class="pf-num">{{ hits() }}</span> 組讓 4a + 6b = {{ fmt(c()) }}。<span class="c8-tag finite">有限檢查</span>
            </p>
            @if (!unlocked()) {
              <p class="pf-p">
                121 組都不行。可是整數對有無限多組，再大的表格也查不完。「不存在」不能一組一組排除，也沒有證人可以提、沒有定義可以展開。
              </p>
            } @else {
              <div class="c6-block">
                <p class="pf-p">把右邊的數換掉，同一套反證還走得通嗎？</p>
                <div class="c8-stepper" role="group" aria-label="右邊的數">
                  <button type="button" class="pf-btn small" (click)="setC(c() - 1)" [disabled]="c() <= -6" aria-label="減一">−</button>
                  <span class="pf-num" aria-live="polite">{{ fmt(c()) }}</span>
                  <button type="button" class="pf-btn small" (click)="setC(c() + 1)" [disabled]="c() >= 6" aria-label="加一">＋</button>
                </div>
                <p class="pf-feedback" [class.good]="!!transfer().clash" [class.bad]="!transfer().clash" role="status">{{ transfer().text }}</p>
              </div>
            }
            <p class="pf-note">每一格的數都是偶數，這不是巧合；不過「看起來都是偶數」本身也只是 121 個例子。</p>
          </div>
        </div>

        <div class="c6-block">
          <p class="pf-p">
            這時候換一個方向。與其證明「沒有」，不如假設「有」：假設真的有這樣的 a、b，你手上就多了兩個整數和一條等式，可以展開、可以代入。如果這條等式逼出兩件不能同時成立的事，「有」就不可能。這叫<b>反證法（proof by contradiction）</b>。
          </p>
          <app-pf-flip-demo mode="contra" g="不存在 a、b，使 4a + 6b = 1" notG="存在 a、b，使 4a + 6b = 1" />
        </div>

        <div class="c6-block">
          <p class="pf-p">
            在板上走一遍。新卡「反證」把目標的反面放進已知，目標換成「找出矛盾」；找到兩條打架的已知後，用「指出矛盾」收尾。
          </p>
          <app-pf-board
            [start]="start"
            [deck]="deck"
            deckNote="第 8 章加了兩張卡：反證、指出矛盾。"
            [frozen]="!!final()"
            label="定理：不存在整數 a、b，使 4a + 6b = 1"
            idBase="pf-c8-contra"
            (solved)="onSolved($event)"
            (changed)="hint.set(null)"
            (refused)="onRefused($event.card, $event.code)"
          />
          @if (hint(); as h) {
            <p class="pf-feedback you pf-rise" role="note">{{ h }}</p>
          }
        </div>

        @if (final()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              矛盾的理由是一句對每組 a、b 都成立的話：4a + 6b = 2(2a + 3b) 一定是偶數，1 是奇數。這段論證沒有檢查任何一格，所以它管得到表格外面那無限多組。
            </p>
            <p class="pf-p">
              反證不是魔法，它要靠一個真正的理由。上面的表格現在可以改右邊的數了：換成偶數試試，看「指出矛盾」還找不找得到理由。
            </p>
            @if (triedEven()) {
              <div class="pf-takeaway reveal">
                <small>帶走這一句</small>
                <p>目標是「不存在」或「不是」時，沒有東西可以展開，也沒有證人可以提。<br />反證把它翻過來：假設存在，你就拿到物件和等式；接著只要找出兩條打架的已知。</p>
              </div>
              <p class="pf-note">
                那如果目標是「√2 不是有理數」呢？<a routerLink="/learn/proofs/ch8/4">下一幕</a>用同一張反證卡，加上第 2 幕證過的那張卡。
              </p>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneContraComponent {
  private readonly progress = inject(LearnProgressService);

  readonly range = R;
  readonly rangeDesc = [...R].reverse();
  readonly start = noSolution(1);
  readonly deck: CardId[] = ['intro', 'assume', 'unfoldGoal', 'witness', 'check', 'contra', 'split', 'unfold', 'obtain', 'clash'];

  readonly c = signal(1);
  readonly cur = signal<[number, number]>([0, 0]);
  readonly final = signal<BoardState | null>(null);
  readonly hint = signal<string | null>(null);
  readonly triedEven = signal(false);
  readonly unlocked = computed(() => !!this.final());

  readonly hits = computed(() => {
    let n = 0;
    for (const a of R) for (const b of R) if (this.val(a, b) === this.c()) n++;
    return n;
  });

  /** Run the same contradiction on 4a + 6b = c, up to the clash, and say what happens. */
  readonly transfer = computed(() => {
    const c = this.c();
    const st = replay(noSolution(c), NO_SOLUTION_MOVES.slice(0, 3));
    const clash = findClash(st);
    const r = applyMove(st, { card: 'clash' });
    if (r.ok && clash) {
      return { clash: true, text: `右邊是 ${num(c)}，奇數。反證照樣走得通：左邊 2(2a + 3b) 是偶數，右邊是奇數，矛盾。表格裡一組也沒有。` };
    }
    const sol = this.firstHit();
    const ex = sol ? `例如 a = ${num(sol[0])}、b = ${num(sol[1])}：4 × ${paren(sol[0])} + 6 × ${paren(sol[1])} = ${num(c)}。` : '';
    return {
      clash: false,
      text: `右邊是 ${num(c)}，偶數。「指出矛盾」找不到理由：兩邊都是偶數，沒有衝突。這不是反證不夠聰明，而是真的有解。${ex}`,
    };
  });

  val(a: number, b: number): number {
    return 4 * a + 6 * b;
  }
  fmt(x: number): string {
    return num(x);
  }

  /** The solution closest to (0, 0), so the example is easy to check by hand. */
  private firstHit(): [number, number] | null {
    let best: [number, number] | null = null;
    for (const a of R)
      for (const b of R)
        if (this.val(a, b) === this.c() && (!best || Math.abs(a) + Math.abs(b) < Math.abs(best[0]) + Math.abs(best[1]))) best = [a, b];
    return best;
  }

  setC(v: number): void {
    this.c.set(Math.max(-6, Math.min(6, v)));
    if (v % 2 === 0) this.triedEven.set(true);
  }

  move(ev: KeyboardEvent): void {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    const m = d[ev.key];
    if (!m) return;
    ev.preventDefault();
    const [a, b] = this.cur();
    this.cur.set([Math.max(-5, Math.min(5, a + m[0])), Math.max(-5, Math.min(5, b + m[1]))]);
  }

  onRefused(card: CardId, code: string): void {
    if (code === 'shape' && card !== 'clash') {
      this.hint.set('目標最外層是「不存在」：前面幾章的卡都用不上。這一幕新加的卡裡，哪一張可以用在任何目標上？');
    } else if (card === 'clash') {
      this.hint.set(code === 'shape' ? '先出「反證」，目標才會變成「找出矛盾」。' : '「存在」要先取出命名：a、b 拿到手，那條等式才會出現在已知裡。');
    }
  }

  onSolved(st: BoardState): void {
    this.hint.set(null);
    this.final.set(st);
    this.progress.markCompleted('proofs-ch8', '3');
  }
}

function paren(x: number): string {
  return x < 0 ? `(${num(x)})` : String(x);
}
