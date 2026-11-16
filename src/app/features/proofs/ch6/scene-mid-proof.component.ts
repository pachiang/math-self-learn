import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { EVEN_SUM, Move } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

/** The proof in reading order; `upTo` is how many board moves the line has done. */
const LINES: { text: string; upTo: number; note: string }[] = [
  {
    text: '令 a、b 為任意整數，並假設 a 是偶數、b 也是偶數。',
    upTo: 2,
    note: 'a、b 上了板（虛線框：對手給的）。前提放進已知，目標只剩後半句。',
  },
  {
    text: '因為 a 是偶數，有整數 k 使 a = 2k；因為 b 是偶數，有整數 l 使 b = 2l。',
    upTo: 7,
    note: '兩條已知都打開了，拿到 k 和 l（加粗的框，記著是從哪一條拿到的）。',
  },
  {
    text: '要證 a + b 是偶數，就是要找一個整數 m，使 a + b = 2m。',
    upTo: 8,
    note: '目標換成定義說的話：要找一個 m。',
  },
  { text: '取 m = k + l，它是整數。', upTo: 9, note: 'm 是你選的（實線框）。目標變成一條等式。' },
  { text: '這時 2m = 2(k + l) = 2k + 2l = a + b。', upTo: 10, note: '把已知代進去，兩邊化簡後一樣，目標清空了。' },
  { text: '所以 a + b 是偶數。∎', upTo: 10, note: '這一行只是把結論說出來。板子在上一行就已經清空。' },
];

/** Same order as the written proof: givens are unpacked before the goal is unfolded. */
const MOVES: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'split', h: 'H1' },
  { card: 'unfold', h: 'H2' },
  { card: 'obtain', h: 'H4', name: 'k' },
  { card: 'unfold', h: 'H3' },
  { card: 'obtain', h: 'H6', name: 'l' },
  { card: 'unfoldGoal' },
  { card: 'witness', src: 'k + l' },
  { card: 'check' },
];

type Bin = 'given' | 'goal' | 'none';
const BIN_NAME: Record<Bin, string> = { given: '已知', goal: '目標', none: '還沒出現' };

interface Chip {
  text: string;
  want: Bin;
  why: string;
}
const CHIPS: Chip[] = [
  { text: 'a = 2k，k 是整數', want: 'given', why: '第 2 行從「a 是偶數」拿到的，可以直接拿來用。' },
  { text: 'a + b 是偶數', want: 'goal', why: '這是整段證明最後要說的話，第 3 行還在想辦法做到它。' },
  { text: 'b 是偶數', want: 'given', why: '第 1 行假設的，從那之後一直都在手上。' },
  { text: 'm = k + l', want: 'none', why: '第 3 行只說要找一個 m，還沒說 m 是多少；第 4 行才選。' },
];

@Component({
  selector: 'app-pf-mid-proof',
  standalone: true,
  imports: [ProofBoardComponent],
  styleUrl: './ch6.scss',
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">1 / 6 · 狀態板</p>
        <h1 class="pf-title">證明寫到一半，<br />你在哪裡？</h1>
        <p class="pf-lede">
          手邊沒有紙筆的時候，最難的往往不是想點子，而是記住「我現在手上有什麼、還差什麼」。先讀一段寫好的證明，只讀到第 3 行。
        </p>

        @if (!sorted()) {
          <ol class="c6-proof" aria-label="一段寫好的證明，前 3 行">
            @for (l of lines.slice(0, 3); track $index; let i = $index) {
              <li>
                <span class="c6-ln pf-num">{{ i + 1 }}</span>
                <span>{{ l.text }}</span>
              </li>
            }
          </ol>
          <div class="pf-col tight">
            <p class="pf-q">讀完第 3 行的時候，下面四件事各在哪裡？</p>
            <p class="pf-note">「已知」是已經在手上、可以拿來用的；「目標」是還欠著、要做到的。</p>
            <div class="c6-sort" role="group" aria-label="把四件事分類">
              @for (c of chips; track c.text; let i = $index) {
                <div class="c6-sort-row">
                  <span class="c6-chip">{{ c.text }}</span>
                  <div class="pf-row" role="radiogroup" [attr.aria-label]="c.text + ' 在哪裡'">
                    @for (b of bins; track b) {
                      <button
                        type="button"
                        class="pf-btn small"
                        role="radio"
                        [attr.aria-checked]="picks()[i] === b"
                        [class.picked]="picks()[i] === b"
                        (click)="pick(i, b)"
                      >
                        {{ binName[b] }}
                      </button>
                    }
                  </div>
                  @if (checked() && picks()[i] !== c.want) {
                    <small class="c6-why bad">不對。{{ c.why }}</small>
                  } @else if (checked()) {
                    <small class="c6-why">✓ {{ c.why }}</small>
                  }
                </div>
              }
            </div>
            <div class="pf-row">
              <button type="button" class="pf-btn primary" [disabled]="picks().includes(null)" (click)="check()">對答案</button>
              @if (checked() && !allRight()) {
                <span class="pf-note">改好再按一次。</span>
              }
              @if (checked() && allRight()) {
                <button type="button" class="pf-btn" (click)="sorted.set(true)">都對了，接著讀完 →</button>
              }
            </div>
          </div>
        } @else {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              四件事都分對了。可是你剛才是在腦中記的。把它們寫在一塊板子上：左邊是<b>已知</b>，右邊是<b>目標</b>。一行一行往下讀，看板子怎麼變。
            </p>
            <div class="c6-sync">
              <div class="pf-col tight">
                <ol class="c6-proof" aria-label="一段寫好的證明">
                  @for (l of lines; track $index; let i = $index) {
                    <li [class.cur]="i + 1 === line()" [class.later]="i + 1 > line()" [attr.aria-current]="i + 1 === line() ? 'step' : null">
                      <span class="c6-ln pf-num">{{ i + 1 }}</span>
                      <span>{{ l.text }}</span>
                    </li>
                  }
                </ol>
                <div class="c6-step" role="group" aria-label="逐行對照" (keydown)="onKey($event)">
                  <button type="button" class="pf-btn small" [disabled]="line() === 0" (click)="go(-1)">← 上一行</button>
                  <span class="pf-num c6-at">{{ line() === 0 ? '還沒開始讀' : '讀完第 ' + line() + ' 行' }}</span>
                  <button type="button" class="pf-btn primary small" [disabled]="line() === lines.length" (click)="go(1)">下一行 →</button>
                </div>
                <p class="pf-note">焦點在按鈕上時，也可以用 ← → 鍵。</p>
                <p class="pf-feedback" role="status">{{ note() }}</p>
              </div>
              <app-pf-board [start]="start" [prefix]="prefix()" [frozen]="true" [showLog]="false" label="逐行對照的狀態板" />
            </div>
          </div>
        }

        @if (line() === lines.length) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              回頭看：目標換了四次形狀，已知一條一條長出來。<b>證明寫完的那一刻，就是右邊清空的那一刻。</b>之後的每一幕，你都會在這塊板上自己動手。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>證明的每一刻都是兩欄：左邊是手上能用的，右邊是還欠的。<br />沒有紙筆時，這塊板就是你的草稿紙；右邊清空，才算證完。</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneMidProofComponent {
  private readonly progress = inject(LearnProgressService);

  readonly lines = LINES;
  readonly chips = CHIPS;
  readonly bins: Bin[] = ['given', 'goal', 'none'];
  readonly binName = BIN_NAME;
  readonly start = EVEN_SUM;

  readonly picks = signal<(Bin | null)[]>(CHIPS.map(() => null));
  readonly checked = signal(false);
  readonly sorted = signal(false);
  readonly line = signal(0);

  readonly allRight = computed(() => this.picks().every((p, i) => p === CHIPS[i].want));
  readonly prefix = computed(() => MOVES.slice(0, this.line() === 0 ? 0 : LINES[this.line() - 1].upTo));
  readonly note = computed(() =>
    this.line() === 0 ? '還沒開始：已知是空的，目標是整句定理。' : `第 ${this.line()} 行：${LINES[this.line() - 1].note}`,
  );

  pick(i: number, b: Bin): void {
    this.picks.update((p) => p.map((x, j) => (j === i ? b : x)));
  }

  check(): void {
    this.checked.set(true);
  }

  go(d: number): void {
    this.line.update((l) => Math.max(0, Math.min(LINES.length, l + d)));
    if (this.line() === LINES.length) this.progress.markCompleted('proofs-ch6', '1');
  }

  onKey(ev: KeyboardEvent): void {
    if (ev.key === 'ArrowRight') this.go(1);
    else if (ev.key === 'ArrowLeft') this.go(-1);
    else return;
    ev.preventDefault();
  }
}
