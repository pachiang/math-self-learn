import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CardId, EVEN_SQ, EVEN_SQ_BY_CONTRA, EVEN_SQ_CONTRAPOS, replay } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { CH8_SKELETON } from '../board/skeletons';

type Method = 'direct' | 'contrapos' | 'contra';

interface Item {
  claim: string;
  want: Method;
  why: Record<Method, string>;
}

const ITEMS: Item[] = [
  {
    claim: '對每個整數 n，若 3n + 1 是偶數，則 n 是奇數。',
    want: 'contrapos',
    why: {
      direct: '已知 3n + 1 = 2k，要退回 n 得算 (2k − 1) / 3，有除法。和第 1 幕一樣，資訊的方向反了。',
      contrapos: '對。改證「若 n 是偶數，則 3n + 1 是奇數」：n = 2k 代入，3n + 1 = 2(3k) + 1，往下一步就到。',
      contra: '走得通，但矛盾最後會撞上前提「3n + 1 是偶數」：那其實就是逆否繞了一圈。直接出逆否更乾淨。',
    },
  },
  {
    claim: '不存在整數 a、b，使 6a + 10b = 7。',
    want: 'contra',
    why: {
      direct: '目標是「不存在」：沒有證人可以提，也沒有定義可以展開，一組一組排除又排不完。',
      contrapos: '這句沒有「若…則」的形狀，逆否用不上。',
      contra: '對。假設有這樣的 a、b：左邊 6a + 10b = 2(3a + 5b) 是偶數，右邊 7 是奇數，矛盾。和第 3 幕同一個模式。',
    },
  },
  {
    claim: '對每個整數 a、b，若 a、b 都是奇數，則 a + b 是偶數。',
    want: 'direct',
    why: {
      direct: '對。前提展開成 a = 2k + 1、b = 2l + 1，往前一加：a + b = 2(k + l + 1)。已知好用，就不必翻。',
      contrapos: '逆否是「若 a + b 不是偶數，則 a、b 不都是奇數」：結論變成「不都是」，反而更難抓。已知本來就好用時，直接走。',
      contra: '走得通，可是「a + b 不是偶數」這個假設只會在最後一行出場：這就是第 5 幕說的，穿著反證外衣的直接證明。',
    },
  },
  {
    claim: '√3 是無理數。',
    want: 'contra',
    why: {
      direct: '「無理數」的意思是「不是任何分數」：又是一句否定，沒有東西可以展開。',
      contrapos: '這句沒有「若…則」的形狀，逆否用不上。',
      contra: '對。假設 √3 = p/q 而且已約到最簡，骨架和 √2 一樣；只是中間那張卡換成「3 整除 p² ⇒ 3 整除 p」。',
    },
  },
];

const NAMES: Record<Method, string> = { direct: '直接證', contrapos: '逆否', contra: '反證' };

@Component({
  selector: 'app-pf-which',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', './ch8.scss', './ch8-which.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">6 / 6 · 選擇</p>
        <h1 class="pf-title">逆否、反證，<br />該選哪一種？</h1>
        <p class="pf-lede">
          第 2 幕用逆否證了「若 n² 是偶數，則 n 是偶數」。同一句話也能用反證。這次板上有 6.6 證過的卡，從空板開始：
        </p>

        <app-pf-board
          [start]="start"
          [deck]="deck"
          deckNote="這一幕開放第 8 章的四張新卡，以及 6.6 證過的定理。"
          [frozen]="!!mine()"
          label="定理：若 n² 是偶數，則 n 是偶數（反證）"
          idBase="pf-c8-which"
          (solved)="onSolved($event)"
          (changed)="hint.set(null)"
          (refused)="onRefused($event.card, $event.code)"
        />
        @if (hint(); as h) {
          <p class="pf-feedback you pf-rise" role="note">{{ h }}</p>
        }

        @if (mine(); as m) {
          <div class="c6-block pf-rise">
            <div class="c8-logs">
              <div class="c8-log">
                <small>第 2 幕 · 逆否</small>
                <ol>
                  @for (e of contraposLog; track $index) {
                    <li [class.key]="e.card === 'contrapos' || e.card === 'check'">{{ e.text }}</li>
                  }
                </ol>
              </div>
              <div class="c8-log">
                <small>這一幕 · 反證（你的）</small>
                <ol>
                  @for (e of m.log; track $index) {
                    <li [class.key]="e.card === 'contra' || e.card === 'clash'">{{ e.text }}</li>
                  }
                </ol>
              </div>
            </div>
            <p class="pf-p">
              看反證那一欄最後一行：矛盾撞上的，正是前提「n² 是偶數」（H1，或從它展開的式子）。換句話說，你從「n 不是偶數」一路推到了「n² 不是偶數」。這正是逆否在做的事，只是多繞了一圈。
            </p>
            <div class="pf-def">
              <small>兩種翻法的關係</small>
              <p>當反證的矛盾恰好是「前提不成立」，它就是一個逆否。能寫成逆否時，通常寫成逆否比較乾淨：讀者一開始就知道你要走到哪裡。</p>
            </div>
          </div>

          <div class="c6-block pf-rise">
            <p class="pf-p">最後，判斷力練習。每一句先選第一步要走哪條路，看回饋：</p>
            <div class="c8-drill">
              @for (it of items; track it.claim; let i = $index) {
                <div class="c8-drill-item">
                  <p>{{ it.claim }}</p>
                  <div class="pf-row" role="group" [attr.aria-label]="'第 ' + (i + 1) + ' 句的第一步'">
                    @for (k of methods; track k) {
                      <button type="button" class="pf-btn small" [class.picked]="picks()[i] === k" (click)="pick(i, k)">{{ names[k] }}</button>
                    }
                  </div>
                  @if (picks()[i]; as p) {
                    <p class="pf-feedback" [class.good]="p === it.want" [class.bad]="p !== it.want" role="status">{{ it.why[p] }}</p>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (allRight()) {
          <div class="c6-block pf-rise">
            <table class="pf-table c7-compare">
              <caption class="pf-sr-only">三種走法的比較</caption>
              <tr><th>走法</th><th>搬進已知的是</th><th>目標變成</th><th>什麼時候用</th></tr>
              <tr><td>直接證</td><td>前提 P</td><td>結論 Q</td><td>前提好用、往前推得到結論</td></tr>
              <tr><td>逆否</td><td>結論的反面：非 Q</td><td>前提的反面：非 P</td><td>前提難用，結論的反面好用</td></tr>
              <tr><td>反證</td><td>整個目標的反面</td><td>找出矛盾</td><td>目標是「不存在」「不是」，沒東西可展開</td></tr>
            </table>
            <div class="pf-takeaway reveal">
              <small>全章帶走這一句</small>
              <p>
                手上什麼都抓不到時，把一句話翻到已知那邊：<br />逆否拿結論的反面當已知，反證拿整個目標的反面當已知、改找矛盾。<br />翻過來之後，又回到你會的步法。
              </p>
            </div>
            <div class="c6-skeleton">
              <small>骨架卡 · 第 9 章開頭會請你重建</small>
              <p class="c6-sk-title">{{ skeleton.title }}</p>
              <ol>
                @for (b of skeleton.beats; track b) {
                  <li>{{ b }}</li>
                }
              </ol>
            </div>
            <p class="pf-note">
              下一章：已知是「或」的時候，<a routerLink="/learn/proofs/ch9/1">第 9 章「分情況與 WLOG」</a>教你分頭處理，而且情況必須蓋滿整個世界。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneWhichComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = EVEN_SQ_BY_CONTRA;
  readonly deck: CardId[] = ['intro', 'assume', 'unfoldGoal', 'contra', 'unfold', 'obtain', 'lemma', 'clash', 'flip'];
  readonly contraposLog = replay(EVEN_SQ, EVEN_SQ_CONTRAPOS).log;
  readonly items = ITEMS;
  readonly methods: Method[] = ['direct', 'contrapos', 'contra'];
  readonly names = NAMES;
  readonly skeleton = CH8_SKELETON;

  readonly mine = signal<BoardState | null>(null);
  readonly hint = signal<string | null>(null);
  readonly picks = signal<(Method | null)[]>(ITEMS.map(() => null));
  readonly solvedItems = signal(new Set<number>());
  readonly allRight = computed(() => this.solvedItems().size === ITEMS.length);

  onRefused(card: CardId, code: string): void {
    if (card === 'clash' && code === 'none') {
      this.hint.set('還沒有兩條打架的已知。「n 是奇數」可以交給 6.6 的卡，看它會說 n² 是什麼。');
    } else if (card === 'unfold') {
      this.hint.set('「不是偶數」沒有定義可以展開，先用「換正面」。');
    } else if (card === 'lemma') {
      this.hint.set('6.6 的卡要一條「x 是奇數」的已知。板上有沒有關於 n 的「不是偶數」可以先換正面？');
    } else if (code === 'shape' && card !== 'contra') {
      this.hint.set('這一題要用反證：令任意、假設前提之後，對目標「n 是偶數」出「反證」。');
    }
  }

  onSolved(st: BoardState): void {
    if (!st.log.some((e) => e.card === 'contra')) {
      this.hint.set('證完了，不過這次沒有用到反證。按「退一步」回去，對目標出「反證」再走一次。');
      return;
    }
    this.hint.set(null);
    this.mine.set(st);
  }

  pick(i: number, m: Method): void {
    this.picks.update((p) => p.map((x, j) => (j === i ? m : x)));
    if (m === ITEMS[i].want) {
      this.solvedItems.update((s) => new Set(s).add(i));
      if (this.solvedItems().size === ITEMS.length) this.progress.markCompleted('proofs-ch8', '6');
    }
  }
}
