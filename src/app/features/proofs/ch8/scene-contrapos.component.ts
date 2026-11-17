import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CardId, EVEN_SQ } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { FlipDemoComponent } from './flip-demo.component';
import { fmtExpr } from '../board/poly';

type Cell = 'ee' | 'eo' | 'oe' | 'oo'; // n parity, then n² parity

interface Cand {
  id: 'orig' | 'contra' | 'conv';
  text: string;
  name: string;
  bad: Cell;
  why: string;
}

const CANDS: Cand[] = [
  {
    id: 'orig',
    text: '若 n² 是偶數，則 n 是偶數',
    name: '原句',
    bad: 'oe',
    why: '前提成立（n² 是偶數）、結論不成立（n 是奇數）時才算違約。',
  },
  {
    id: 'conv',
    text: '若 n 是偶數，則 n² 是偶數',
    name: '逆命題',
    bad: 'eo',
    why: 'n 是偶數、n² 卻是奇數時才違約，這是另一格。它也許也對，但說的是另一件事。',
  },
  {
    id: 'contra',
    text: '若 n 是奇數，則 n² 是奇數',
    name: '逆否命題',
    bad: 'oe',
    why: 'n 是奇數、n² 卻是偶數時才違約。和原句是同一格。',
  },
];

const NUMS = Array.from({ length: 19 }, (_, i) => i - 9);
const cellOf = (n: number): Cell => `${n % 2 === 0 ? 'e' : 'o'}${(n * n) % 2 === 0 ? 'e' : 'o'}` as Cell;

@Component({
  selector: 'app-pf-contrapos',
  standalone: true,
  imports: [ProofBoardComponent, FlipDemoComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', './ch8.scss', './ch8-grid.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">2 / 6 · 逆否</p>
        <h1 class="pf-title">逆否：<br />把方向翻過來</h1>
        <p class="pf-lede">
          上一幕卡住，是因為已知講 n²、目標問 n。如果能換一句「已知講 n」的話，而且意思完全一樣，就可以順著往下的箭頭走。
        </p>

        <p class="pf-q">下面哪一句，和原句是同一個承諾？</p>
        <div class="c8-grid-wrap">
          <div>
            <div class="c8-grid" role="table" aria-label="n 和 n² 的奇偶四格">
              <span class="hd" role="columnheader"></span>
              <span class="hd" role="columnheader">n² 是偶數</span>
              <span class="hd" role="columnheader">n² 是奇數</span>
              @for (row of rows; track row.key) {
                <span class="hd" role="rowheader">{{ row.label }}</span>
                @for (col of cols; track col.key) {
                  <div class="cell" role="cell" [class.bad]="badCell() === row.key + col.key">
                    @for (n of numsIn(row.key + col.key); track n) {
                      <span class="c8-n">{{ fmt(n) }}</span>
                    }
                    @if (!numsIn(row.key + col.key).length) {
                      <span class="empty">−9 到 9 裡一個也沒有</span>
                    }
                    @if (badCell() === row.key + col.key) {
                      <span class="tag">違約格</span>
                    }
                  </div>
                }
              }
            </div>
            <p class="pf-note" style="margin-top: 8px">格子裡是 −9 到 9 的每個整數<span class="c8-tag finite">有限檢查</span>，只用來看格子長什麼樣子。</p>
          </div>
          <div class="c8-stmts" role="group" aria-label="三句話">
            @for (c of cands; track c.id) {
              <button type="button" class="pf-btn c8-stmt" [class.picked]="shown() === c.id" (click)="pick(c)">
                {{ c.text }}
                @if (revealed()) {
                  <small>{{ c.name }}</small>
                }
              </button>
            }
            @if (msg(); as m) {
              <p class="pf-feedback" [class.good]="revealed()" [class.bad]="!revealed()" role="status">{{ m }}</p>
            }
          </div>
        </div>

        @if (revealed()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              原句和「若 n 是奇數，則 n² 是奇數」違約的是同一格：n 是奇數、n² 是偶數。兩句話禁止的是同一件事，所以是同一個承諾。第 3 章叫它<b>逆否命題（contrapositive）</b>：「若 P，則 Q」和「若非 Q，則非 P」。
            </p>
            <p class="pf-p">在板上，逆否換的是「誰搬到已知」。按下按鈕比較兩種走法：</p>
            <div class="c6-block">
              <small class="c8-demo-label">直接證</small>
              <app-pf-flip-demo mode="direct" p="n² 是偶數" q="n 是偶數" />
            </div>
            <div class="c6-block">
              <small class="c8-demo-label">逆否</small>
              <app-pf-flip-demo mode="contrapos" p="n² 是偶數" q="n 是偶數" notP="n² 不是偶數" notQ="n 不是偶數" />
            </div>
            <p class="pf-p">
              直接證，搬進已知的是 n² 那句，往上走不通。逆否搬進已知的是「n 不是偶數」：一句關於 n 的話，往下走就到 n²。
            </p>
          </div>

          <div class="c6-block pf-rise">
            <p class="pf-p">
              現在在板上走一次。新卡「逆否」用在「若…則」的目標上。走著走著，你會碰到「不是偶數」：它沒有定義可以展開，另一張新卡「換正面」會用得上。
            </p>
            <div class="pf-def">
              <small>換正面（本課在 ℤ 上使用的事實）</small>
              <p>每個整數恰好是偶數或奇數其中一種：不是偶數，就是奇數；不是奇數，就是偶數。</p>
            </div>
            <app-pf-board
              [start]="start"
              [deck]="deck"
              bridge="manual"
              deckNote="第 8 章加了兩張卡：逆否、換正面。"
              [frozen]="!!done()"
              label="定理：若 n² 是偶數，則 n 是偶數（逆否）"
              idBase="pf-c8-contrapos"
              (solved)="onSolved($event)"
              (changed)="hint.set(null)"
              (refused)="onRefused($event.card, $event.code)"
            />
            @if (hint(); as h) {
              <p class="pf-feedback you pf-rise" role="note">{{ h }}</p>
            }
            <details class="pf-why">
              <summary>為什麼每個整數不是偶數就是奇數？</summary>
              <div>
                <p>把 n 除以 2，餘數只能是 0 或 1（除法原理：n = 2q + r，0 ≤ r &lt; 2）。餘 0 就是 n = 2q，偶數；餘 1 就是 n = 2q + 1，奇數。</p>
                <p>也不會兩者都是：如果 2k = 2l + 1，就有 2(k − l) = 1，可是 2 乘任何整數不會得到 1。這兩點合起來，就是「換正面」可以放心用的理由。</p>
              </div>
            </details>
          </div>
        }

        @if (done(); as d) {
          <div class="c6-block pf-rise">
            <table class="pf-table c7-compare">
              <caption class="pf-sr-only">直接證和逆否的比較</caption>
              <tr><th></th><th>1. 直接證</th><th>2. 逆否</th></tr>
              <tr><td>搬進已知的句子</td><td>n² 是偶數</td><td>n 不是偶數 → n 是奇數</td></tr>
              <tr><td>橋的起點能代入嗎</td><td>n：沒有等式</td><td class="pf-num">n² = (2k + 1)²</td></tr>
              <tr><td>結果</td><td>□ 填不出來</td><td><span class="pf-seal mini proved">證明</span> {{ d.steps }} 步，證人 {{ d.wit }}</td></tr>
            </table>
            <p class="pf-p">
              翻過來之後，剩下的就是 6.6 證過的「奇數的平方是奇數」。逆否沒有發明新的數學，它只是把題目轉到你已經會走的方向。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>逆否把「若 P，則 Q」換成「若非 Q，則非 P」：同一個承諾，同一格違約。<br />結論的反面比前提好用時，就改走這個方向。</p>
            </div>
            <div class="pf-def">
              <small>新卡 · 8.2 證過</small>
              <p>平方是偶數，本身就是偶數：已知 x² 是偶數，就得到 x 是偶數。</p>
            </div>
            <p class="pf-note">
              這張卡第 4 幕會連用兩次。在那之前，<a routerLink="/learn/proofs/ch8/3">下一幕</a>先看另一種翻法：連目標整句都翻過來。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneContraposComponent {
  private readonly progress = inject(LearnProgressService);

  readonly cands = CANDS;
  readonly start = EVEN_SQ;
  readonly deck: CardId[] = ['intro', 'assume', 'unfoldGoal', 'witness', 'check', 'contrapos', 'unfold', 'obtain', 'flip'];
  readonly rows = [
    { key: 'e', label: 'n 是偶數' },
    { key: 'o', label: 'n 是奇數' },
  ];
  readonly cols = [
    { key: 'e', label: 'n² 是偶數' },
    { key: 'o', label: 'n² 是奇數' },
  ];

  readonly shown = signal<Cand['id'] | null>(null);
  readonly revealed = signal(false);
  readonly msg = signal<string | null>(null);
  readonly hint = signal<string | null>(null);
  readonly final = signal<BoardState | null>(null);

  readonly badCell = computed(() => CANDS.find((c) => c.id === this.shown())?.bad ?? null);
  readonly done = computed(() => {
    const st = this.final();
    if (!st) return null;
    const w = st.objs.find((o) => o.kind === 'chosen');
    return { steps: st.log.length, wit: w?.def ? `m = ${fmtExpr(w.def)}` : '' };
  });

  numsIn(cell: string): number[] {
    return NUMS.filter((n) => cellOf(n) === cell);
  }
  fmt(n: number): string {
    return String(n).replace('-', '−');
  }
  pick(c: Cand): void {
    this.shown.set(c.id);
    if (this.revealed()) {
      this.msg.set(`${c.name}：${c.why}`);
      return;
    }
    if (c.id === 'orig') {
      this.msg.set(`這是原句本身，紅框就是它的違約格。${c.why}現在按另外兩句，看它們的違約格各在哪裡。`);
      return;
    }
    if (c.id === 'conv') {
      this.msg.set(`違約格換了位置。${c.why}所以它和原句不是同一個承諾。`);
      return;
    }
    this.revealed.set(true);
    this.msg.set(`對。${c.why}兩句話禁止同一件事。`);
  }

  onRefused(card: CardId, code: string): void {
    if (card === 'contrapos' && code === 'shape') {
      this.hint.set('「逆否」要用在「若…則」的目標上。如果已經假設了前提，按「退一步」回到「若 n² 是偶數，則 n 是偶數」再出逆否。');
    } else if (card === 'unfold' || card === 'unfoldGoal') {
      this.hint.set('「不是偶數」沒有定義可以展開。先用「換正面」把它換成「是奇數」，奇數就有定義可以展開了。');
    } else if (code === 'neq') {
      this.hint.set('提示：從 n² 出發，用 n = 2k + 1 代入，把 (2k + 1)² 乘開，再和 2 × □ + 1 對齊。');
    }
  }

  onSolved(st: BoardState): void {
    if (!st.log.some((e) => e.card === 'contrapos')) {
      this.hint.set('證完了，可是這次沒有用到逆否。按「退一步」回到開頭，換一條路試試。');
      return;
    }
    this.hint.set(null);
    this.final.set(st);
    this.progress.markCompleted('proofs-ch8', '2');
  }
}
