import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, CardId, Move, TRIPLE } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { CH9_SKELETON } from '../board/skeletons';
import { CaseLineComponent, CaseRow } from './case-line.component';
import { caseRows } from './ch9-cases';

interface FactorRow {
  label: string;
  cells: { e: string; three?: string }[];
}

/** n, n + 1, n + 2 written in k for each case; three marks the cell that is 3 times something. */
const FACTORS: Record<2 | 3, FactorRow[]> = {
  3: [
    { label: 'n 除以 3 餘 0：n = 3k', cells: [{ e: '3k', three: '3 · k' }, { e: '3k + 1' }, { e: '3k + 2' }] },
    { label: 'n 除以 3 餘 1：n = 3k + 1', cells: [{ e: '3k + 1' }, { e: '3k + 2' }, { e: '3k + 3', three: '3(k + 1)' }] },
    { label: 'n 除以 3 餘 2：n = 3k + 2', cells: [{ e: '3k + 2' }, { e: '3k + 3', three: '3(k + 1)' }, { e: '3k + 4' }] },
  ],
  2: [
    { label: 'n 是偶數：n = 2k', cells: [{ e: '2k' }, { e: '2k + 1' }, { e: '2k + 2' }] },
    { label: 'n 是奇數：n = 2k + 1', cells: [{ e: '2k + 1' }, { e: '2k + 2' }, { e: '2k + 3' }] },
  ],
};

interface Item {
  id: 'overlap' | 'gap' | 'wlog';
  text: string;
  ask: string;
  opts: [string, string];
  want: string;
  why: Record<string, string>;
}

const ITEMS: Item[] = [
  {
    id: 'overlap',
    text: '情況一：n ≥ 0。情況二：n ≤ 0。',
    ask: '這兩種情況蓋滿所有整數嗎？',
    opts: ['蓋滿', '有空隙'],
    want: '蓋滿',
    why: {
      蓋滿: '對。正數在情況一，負數在情況二，0 兩種都在。重疊沒關係，0 只是被證了兩次。',
      有空隙: '找找看空隙在哪：正數在情況一，負數在情況二，0 兩種都在。重疊不是空隙。',
    },
  },
  {
    id: 'gap',
    text: '情況一：n 是 3 的倍數。情況二：n 是奇數。',
    ask: '這兩種情況蓋滿所有整數嗎？',
    opts: ['蓋滿', '有空隙'],
    want: '有空隙',
    why: {
      蓋滿: '找找看：有沒有一個整數，既不是 3 的倍數，也不是奇數？',
      有空隙: '對。打一個沒蓋到的整數：',
    },
  },
  {
    id: 'wlog',
    text: '要證：對每個整數 a、b，若 a 是奇數或 b 是奇數，則 a² + ab + b² 是奇數。同學寫：「不失一般性，設 a 是奇數。」',
    ask: '這一步可以嗎？',
    opts: ['可以', '不可以'],
    want: '可以',
    why: {
      可以: '對。a、b 對調後是 b² + ba + a²，加法、乘法換順序都不變，題目沒有變；「b 是奇數」那一種情況就是「a 是奇數」換名字。',
      不可以: '做一次對調測試：a² + ab + b² 對調後是 b² + ba + a²，和原本一樣。題目沒有變，所以可以。',
    },
  },
];

const fmt = (n: number): string => String(n).replace('-', '−');

@Component({
  selector: 'app-pf-useful-cut',
  standalone: true,
  imports: [ProofBoardComponent, CaseLineComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', '../ch8/ch8.scss', './ch9-cut.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">5 / 5 · 切法</p>
        <h1 class="pf-title">怎麼切，<br />才切得有用</h1>
        <p class="pf-lede">情況蓋滿，只是第一個要求。看這一句：</p>
        <div class="c7-claim">
          <small>要證的句子</small>
          <p>對每個整數 n，3 ∣ n(n + 1)(n + 2)。</p>
        </div>
        <p class="pf-p">
          0 · 1 · 2 = 0、1 · 2 · 3 = 6、2 · 3 · 4 = 24、3 · 4 · 5 = 60，都是 3 的倍數<span class="c8-tag">例子</span>。這一次「按餘數分」可以選除以 2 或除以 3。先想好怎麼切，再上板：
        </p>
        <app-pf-board
          [start]="start"
          [prefix]="prefix()"
          [deck]="deck"
          [remDivisors]="[2, 3]"
          deckNote="「按餘數分」這一幕可以選除以 2 或除以 3。"
          [frozen]="!!final()"
          label="定理：對每個整數 n，3 ∣ n(n + 1)(n + 2)"
          idBase="pf-c9-cut"
          (changed)="onChanged($event)"
          (solved)="onSolved($event)"
          (refused)="onRefused($event.card, $event.code)"
        />
        @if (hint(); as h) {
          <p class="pf-feedback you pf-rise" role="note">{{ h }}</p>
        }

        @if (d(); as dd) {
          <div class="c6-block pf-rise">
            <p class="pf-p">把每一種情況裡的 n、n + 1、n + 2 都寫成 k 的式子，看 3 在哪裡：</p>
            <table class="pf-table c9-factors">
              <caption class="pf-sr-only">每一種情況裡的三個連續整數</caption>
              <tr><th scope="col">情況</th><th scope="col">n</th><th scope="col">n + 1</th><th scope="col">n + 2</th><th scope="col">3 在哪裡</th></tr>
              @for (r of factors(); track r.label; let i = $index) {
                <tr [class.cur]="activeRow() === i">
                  <th scope="row">{{ r.label }}</th>
                  @for (c of r.cells; track $index) {
                    <td [class.three]="!!c.three">
                      <span class="pf-num">{{ c.e }}</span>
                      @if (c.three) {<small>＝ {{ c.three }}</small>}
                    </td>
                  }
                  <td class="where">{{ whereText(r) }}</td>
                </tr>
              }
            </table>
            @if (dd === 2 && !final()) {
              <p class="pf-p">兩種情況蓋滿了所有整數，可是每一列都沒有一格寫得成「3 乘一個式子」。</p>
              <button type="button" class="pf-btn small c9-useless" (click)="useless()">這樣切用不上，重來</button>
            }
            <app-pf-case-line [rows]="rows()" [lo]="-8" [hi]="8" mode="proof" />
          </div>
        }

        @if (final()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">{{ compareText() }}</p>
            <div class="pf-def">
              <small>切法的第二個要求</small>
              <p>蓋滿只保證沒有漏掉的數。好的切法，還要讓每一種情況都多一條用得上的已知；這一題用得上的，是「n、n + 1、n + 2 裡哪一個是 3 的倍數」。</p>
            </div>
          </div>

          <div class="c6-block pf-rise">
            <p class="pf-p">最後，判斷力練習：</p>
            <div class="c9-drill">
              @for (it of items; track it.id) {
                <div class="c9-item">
                  <p>{{ it.text }}</p>
                  <p class="c9-ask">{{ it.ask }}</p>
                  <div class="pf-row" role="group" [attr.aria-label]="it.ask">
                    @for (o of it.opts; track o) {
                      <button type="button" class="pf-btn small" [class.picked]="picks()[it.id] === o" (click)="pick(it, o)">{{ o }}</button>
                    }
                  </div>
                  @if (picks()[it.id]; as p) {
                    <p class="pf-feedback" [class.good]="p === it.want" [class.bad]="p !== it.want" role="status">{{ it.why[p] }}</p>
                  }
                  @if (it.id === 'gap' && picks()['gap'] === '有空隙') {
                    <form class="pf-row" (submit)="$event.preventDefault(); tryGap()">
                      <label for="pf-c9-gap">n =</label>
                      <input id="pf-c9-gap" class="pf-input" autocomplete="off" [value]="gapDraft()" (input)="gapDraft.set($any($event.target).value)" />
                      <button type="submit" class="pf-btn primary small">檢查</button>
                    </form>
                    @if (gapMsg(); as m) {
                      <p class="pf-feedback" [class.good]="solved().has('gap')" [class.bad]="!solved().has('gap')" role="status">{{ m }}</p>
                    }
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (solved().size === items.length) {
          <div class="c6-block pf-rise">
            <table class="pf-table c7-compare">
              <caption class="pf-sr-only">三種處理「或」的走法</caption>
              <tr><th>走法</th><th>什麼時候用</th><th>搬進已知的是</th><th>要證幾次</th></tr>
              <tr><td>分情況</td><td>已知裡有「或」，或者可以按餘數分</td><td>每一種情況各自的條件</td><td>每一種情況各一次</td></tr>
              <tr><td>排除一邊</td><td>目標是「A 或 B」</td><td>A 不成立</td><td>一次：證 B</td></tr>
              <tr><td>不失一般性</td><td>兩種情況對調名字就互換，而且題目對調後不變</td><td>其中一種情況的條件</td><td>一次</td></tr>
            </table>
            <div class="pf-takeaway reveal">
              <small>全章帶走這一句</small>
              <p>
                分情況要蓋滿，每一種情況都要證完；切法要讓每一種情況多一條好用的已知。<br />目標是「或」時排除一邊；只有對調名字後題目不變，才可以不失一般性。
              </p>
            </div>
            <div class="c6-skeleton">
              <small>骨架卡 · 第 10 章開頭會請你重建</small>
              <p class="c6-sk-title">{{ skeleton.title }}</p>
              <ol>
                @for (b of skeleton.beats; track b) {
                  <li>{{ b }}</li>
                }
              </ol>
            </div>
            <p class="pf-note">
              下一章：要證「存在」，最好的方式是把它造出來；要證「唯一」，就假設有兩個。<a routerLink="/learn/proofs">第 10 章「存在、構造與唯一」</a>還在規畫中。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneUsefulCutComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = TRIPLE;
  readonly deck: CardId[] = ['intro', 'unfoldGoal', 'witness', 'check', 'rem', 'unfold', 'obtain'];
  readonly items = ITEMS;
  readonly skeleton = CH9_SKELETON;

  readonly prefix = signal<Move[]>([]);
  readonly st = signal<BoardState | null>(null);
  readonly final = signal<BoardState | null>(null);
  readonly hint = signal<string | null>(null);
  readonly triedTwo = signal(false);
  readonly picks = signal<Record<string, string>>({});
  readonly solved = signal(new Set<string>());
  readonly gapDraft = signal('');
  readonly gapMsg = signal<string | null>(null);

  readonly rows = computed<CaseRow[]>(() => caseRows(this.final() ?? this.st()));
  /** The divisor of the board's current split, if any. */
  readonly d = computed<2 | 3 | null>(() => {
    const tabs = (this.final() ?? this.st())?.tabs ?? [];
    if (!tabs.length) return null;
    return tabs.some((t) => t.label.includes('除以 3')) ? 3 : 2;
  });
  readonly factors = computed(() => (this.d() ? FACTORS[this.d()!] : []));
  readonly activeRow = computed(() => {
    const t = (this.final() ?? this.st())?.tabs.find((x) => x.status === 'active');
    return t && !t.id.includes('.') ? Number(t.id) - 1 : -1;
  });
  readonly compareText = computed(() =>
    this.triedTwo()
      ? '你試過除以 2：兩種情況也蓋滿了所有整數，可是「n = 2k」對「3 在哪裡」一點幫助都沒有。除以 3 的切法讓每一種情況都多了一條有用的已知，三個證人才寫得出來。'
      : '如果按除以 2 來分，兩種情況也會蓋滿所有整數，可是「n = 2k」對「3 在哪裡」一點幫助都沒有。除以 3 的切法讓每一種情況都多了一條有用的已知，三個證人才寫得出來。',
  );

  whereText(r: FactorRow): string {
    const i = r.cells.findIndex((c) => c.three);
    return i < 0 ? '看不出來，要看 k' : ['n', 'n + 1', 'n + 2'][i];
  }

  onChanged(st: BoardState): void {
    this.hint.set(null);
    this.st.set(st);
    if (st.tabs.some((t) => t.label === 'n 是偶數')) this.triedTwo.set(true);
  }

  useless(): void {
    this.hint.set(
      '對。n = 2k 時，n、n + 1、n + 2 哪一個是 3 的倍數，要看 k 除以 3 餘多少，所以寫不出一個固定的證人。切法蓋滿了，卻沒給你用得上的已知。板子已經回到令任意之後，換一個除數。',
    );
    this.prefix.set([{ card: 'intro' }]);
    this.st.set(null);
  }

  onRefused(card: CardId, code: string): void {
    if ((card !== 'witness' && card !== 'check') || (code !== 'neq' && code !== 'div' && code !== 'parse')) return;
    if (this.d() === 2) {
      this.hint.set('在這種情況裡，n、n + 1、n + 2 哪一個是 3 的倍數，要看 k，所以寫不出固定的證人。看看下面的表，再想想要不要換一種切法。');
    } else if (this.d() === 3) {
      this.hint.set('看表裡這一種情況打框的那一格：把它寫成 3 乘一個式子，m 就是那個式子乘上另外兩格。式子可以直接打括號，例如 (k + 1)(2k + 5)。');
    } else {
      this.hint.set('m 只能用板上的字母寫，可是已知裡沒有任何關於 n 的等式。先分情況，每一種情況都會給你一條 n 的等式。');
    }
  }

  onSolved(st: BoardState): void {
    this.hint.set(null);
    this.st.set(st);
    this.final.set(st);
  }

  pick(it: Item, o: string): void {
    this.picks.update((p) => ({ ...p, [it.id]: o }));
    if (it.id !== 'gap' && o === it.want) this.solve(it.id);
  }

  tryGap(): void {
    const v = this.gapDraft().trim().replace('−', '-');
    if (!/^-?\d{1,6}$/.test(v)) {
      this.gapMsg.set('請打一個整數。');
      return;
    }
    const n = Number(v);
    if (n % 3 === 0) {
      this.gapMsg.set(`${fmt(n)} 是 3 的倍數，在情況一裡。`);
    } else if (n % 2 !== 0) {
      this.gapMsg.set(`${fmt(n)} 是奇數，在情況二裡。`);
    } else {
      this.gapMsg.set(`對，${fmt(n)} 既不是 3 的倍數，也不是奇數。這段證明對 ${fmt(n)} 什麼也沒說；不是 3 的倍數的偶數，全部落在空隙裡。`);
      this.solve('gap');
    }
  }

  private solve(id: string): void {
    this.solved.update((s) => new Set(s).add(id));
    if (this.solved().size === ITEMS.length) this.progress.markCompleted('proofs-ch9', '5');
  }
}
