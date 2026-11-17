import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { readNumber } from '../ch2/ch2-expr';

interface Line {
  id: string;
  text: string;
  src: string;
  card?: boolean;
}
interface Option {
  text: string;
  ok: boolean;
  why: string;
}
interface Beat {
  ask: string;
  options: Option[];
  add: Line[];
}

const START: Line[] = [
  { id: 'H1', text: 'p² = 2q²', src: '√2 = p/q 兩邊平方' },
  { id: 'H2', text: 'p、q 不都是偶數', src: '分數先約到最簡' },
];

const BEATS: Beat[] = [
  {
    ask: '從 H1 能直接說出什麼？',
    options: [
      { text: 'p = 2q', ok: false, why: 'p² = 2q² 不代表 p = 2q：(2q)² 是 4q²，不是 2q²。' },
      { text: 'p² 是偶數：p² = 2 × q²，而 q² 是整數', ok: true, why: '' },
      { text: 'q² = p² / 2，所以 q 是偶數', ok: false, why: '除以 2 之後是不是整數、是不是偶數，正是還不知道的事，不能拿來當理由。' },
    ],
    add: [{ id: 'H3', text: 'p² 是偶數', src: 'H1，照偶數的定義' }],
  },
  {
    ask: 'H3 說 p² 是偶數。手上哪張卡用得上？',
    options: [
      { text: 'p² 是 4 的倍數，所以 p = 4r', ok: false, why: '現在只知道 p² 是 2 的倍數，還不知道它是 4 的倍數。' },
      { text: 'p 是奇數', ok: false, why: '第 2 幕剛證過：平方是偶數，本身就是偶數。' },
      { text: 'p 是偶數：用第 2 幕證過的卡', ok: true, why: '' },
    ],
    add: [{ id: 'H4', text: 'p 是偶數', src: '8.2 的卡', card: true }],
  },
  {
    ask: 'p 是偶數。把它展開，拿出一個整數：',
    options: [
      { text: '取出 r：p = 2r', ok: true, why: '' },
      { text: '取出 q：p = 2q', ok: false, why: 'q 已經是板上的字母。用同一個名字，等於偷偷假設 p = 2q（6.4 那位同學的錯）。換一個新名字。' },
    ],
    add: [{ id: 'H5', text: 'p = 2r', src: 'H4 展開，取出 r' }],
  },
  {
    ask: '把 H5 代進 H1，會得到什麼？',
    options: [
      { text: '2r² = 2q²，所以 r = q', ok: false, why: '(2r)² 是 4r²，不是 2r²：括號裡的 2 也要平方。' },
      { text: '(2r)² = 2q²，也就是 4r² = 2q²，兩邊除以 2：q² = 2r²', ok: true, why: '' },
      { text: 'p² = 2r²', ok: false, why: '代入要把 p 換成 2r：左邊變成 (2r)²，右邊的 2q² 不動。' },
    ],
    add: [{ id: 'H6', text: 'q² = 2r²', src: 'H5 代入 H1，兩邊除以 2' }],
  },
  {
    ask: 'H6 和 H1 長得很像。接下來呢？',
    options: [
      { text: 'q² = 2r² 和 H1 一樣，所以 q = p', ok: false, why: '形狀一樣不代表數一樣。看的是它說了 q 什麼。' },
      { text: 'q² 是偶數，再用一次 8.2 的卡：q 是偶數', ok: true, why: '' },
    ],
    add: [{ id: 'H7', text: 'q 是偶數', src: 'H6 照定義，再用 8.2 的卡', card: true }],
  },
  {
    ask: '目標是找出矛盾。哪幾條已知打架？',
    options: [
      { text: 'H1 和 H6：p² = 2q² 和 q² = 2r²', ok: false, why: '這兩條可以同時成立嗎？光看它們看不出衝突。真正被逼到牆角的，是一開始約到最簡的那個假設。' },
      { text: 'H4、H7 說 p、q 都是偶數；H2 說它們不都是偶數', ok: true, why: '' },
    ],
    add: [],
  },
];

const PRESETS: [number, number][] = [
  [3, 2],
  [7, 5],
  [17, 12],
  [41, 29],
  [99, 70],
];
const LO = 1.35;
const HI = 1.55;
const xOf = (v: number) => 40 + ((Math.max(LO, Math.min(HI, v)) - LO) / (HI - LO)) * 860;

@Component({
  selector: 'app-pf-root-two',
  standalone: true,
  imports: [RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', './ch8.scss', './ch8-root-two.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">4 / 6 · √2</p>
        <h1 class="pf-title">√2 不是任何一個分數</h1>
        <p class="pf-lede">
          「√2 是無理數」意思是：不存在整數 p、q（q ≠ 0），使 p/q = √2。這是一句「不存在」，上一幕的反證剛好用得上。不過先找找看。
        </p>

        <div class="c8-near">
          <p class="pf-p">挑一個分數 p/q。如果 (p/q)² = 2，也就是 <b class="pf-num">p² = 2q²</b>，它就是 √2：</p>
          <form class="c7-blanks" (submit)="$event.preventDefault(); tryPQ()">
            <label class="c7-blank"><small>p</small><input class="pf-input" inputmode="numeric" autocomplete="off" [value]="pDraft()" (input)="pDraft.set($any($event.target).value)" /></label>
            <label class="c7-blank"><small>q</small><input class="pf-input" inputmode="numeric" autocomplete="off" [value]="qDraft()" (input)="qDraft.set($any($event.target).value)" /></label>
            <button type="submit" class="pf-btn primary small">算算看</button>
            <span class="pf-row" role="group" aria-label="很接近的分數">
              @for (x of presets; track x[0]) {
                <button type="button" class="pf-btn ghost small" (click)="setPQ(x[0], x[1])">{{ x[0] }}/{{ x[1] }}</button>
              }
            </span>
          </form>
          @if (pqMsg(); as m) {
            <p class="pf-feedback bad" role="status">{{ m }}</p>
          }
          <div class="c8-sq" aria-live="polite">
            <span>p² = {{ pq()[0] * pq()[0] }}</span>
            <span>2q² = {{ 2 * pq()[1] * pq()[1] }}</span>
            <span class="diff">差 {{ diff() }}</span>
          </div>
          <svg viewBox="0 0 940 86" role="img" [attr.aria-label]="'數線：' + pq()[0] + '/' + pq()[1] + ' 約 ' + ratio().toFixed(5) + '，√2 約 1.41421'">
            <line class="axis" x1="40" y1="44" x2="900" y2="44" />
            @for (t of ticks; track t) {
              <line class="tk" [attr.x1]="x(t)" [attr.x2]="x(t)" y1="38" y2="50" />
              <text class="tk-txt" [attr.x]="x(t)" y="70">{{ t.toFixed(2) }}</text>
            }
            <line class="root" [attr.x1]="x(root2)" [attr.x2]="x(root2)" y1="16" y2="56" />
            <text class="root-txt" [attr.x]="x(root2)" y="12">√2</text>
            <circle class="pq" [attr.cx]="x(ratio())" cy="44" r="6" />
            <text class="pq-txt" [attr.x]="x(ratio())" y="84">{{ pq()[0] }}/{{ pq()[1] }}</text>
          </svg>
          <p class="pf-note">
            3/2、7/5、17/12、41/29、99/70：一個比一個更貼近 √2，p² 和 2q² 每次都只差 1，可是從來不是 0<span class="c8-tag">例子</span>。再多的例子也只是例子。
          </p>
        </div>

        <div class="c6-block">
          <p class="pf-p">
            照上一幕的做法，假設 √2 真的等於某個分數 p/q。任何分數都可以先約分：只要分子分母都是偶數，就同時除以 2，直到 <b>p、q 不都是偶數</b>為止。兩邊平方，得到 p² = 2q²。板上一開始就有這兩條已知，目標是找出矛盾。
          </p>
          <details class="pf-why">
            <summary>為什麼一定約得到「不都是偶數」？</summary>
            <div>
              <p>每除一次 2，|q| 就變成一半。q 不是 0，|q| 是正整數，正整數不可能一直減半下去；所以除到某一次，p、q 至少有一個不再是偶數。</p>
              <p>「不能一直變小下去」本身也值得證明。第 12 章「最小反例」會正式處理它；這裡先把它當成已知的事實用。</p>
            </div>
          </details>
        </div>

        <div class="c8-mini" role="group" aria-label="√2 的反證">
          <section>
            <h3>已知</h3>
            <ol>
              @for (l of lines(); track l.id) {
                <li [class.fresh]="l.id === lastId()" [class.hot]="done() && hot.includes(l.id)">
                  <b class="id">{{ l.id }}</b>
                  <span class="txt">{{ l.text }}</span>
                  <small class="src" [class.card]="l.card">{{ l.src }}</small>
                </li>
              }
            </ol>
          </section>
          <section>
            <h3>目標</h3>
            <div class="c8-goal-box" [class.done]="done()">
              <span>{{ done() ? '找到矛盾，證明完成。' : '矛盾（找出兩條打架的已知）' }}</span>
              @if (done()) {
                <span class="pf-seal mini proved stamp">證明</span>
              }
            </div>
            <p class="pf-note">原本的目標 · 不存在整數 p、q（q ≠ 0），使 p/q = √2</p>
          </section>
        </div>

        @if (!done()) {
          <div class="c6-block">
            <p class="pf-q small" style="font-size: 20px">{{ step() + 1 }}. {{ beat().ask }}</p>
            @if (!thought()) {
              <div class="pf-row">
                <button type="button" class="pf-btn" (click)="thought.set(true)">我想好了，看選項</button>
                <span class="pf-note">先在腦中說出下一句，再和選項比對。</span>
              </div>
            } @else {
              <div class="c8-choices" role="group" aria-label="下一步">
                @for (o of beat().options; track o.text) {
                  <button type="button" class="pf-btn c8-choice" (click)="choose(o)">{{ o.text }}</button>
                }
              </div>
            }
            @if (msg(); as m) {
              <p class="pf-feedback bad" role="status">{{ m }}</p>
            }
          </div>
        } @else {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              「p、q 不都是偶數」被逼成「p、q 都是偶數」，兩條不能同時成立。所以一開始的假設不可能：沒有任何分數等於 √2。
            </p>
            <p class="pf-p">
              注意 H4 和 H7：第 2 幕那張卡用了兩次，一次給 p、一次給 q。如果沒有那張卡，這裡就得把「平方是偶數 ⇒ 本身是偶數」整段重證兩遍。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>√2 的證明只有三拍：假設它是最簡分數 p/q → 分子、分母都被逼成偶數 → 和「最簡」打架。<br />中間兩拍，用的是同一張證過的卡。</p>
            </div>
            <p class="pf-note">
              另一個古老的反證：質數有無限多個。它常被說錯成「把質數乘起來加 1 就是新質數」。<a routerLink="/learn/proofs/ch8/5">下一幕</a>來檢查。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneRootTwoComponent {
  private readonly progress = inject(LearnProgressService);

  readonly presets = PRESETS;
  readonly ticks = [1.35, 1.4, 1.45, 1.5, 1.55];
  readonly root2 = Math.SQRT2;
  readonly hot = ['H2', 'H4', 'H7'];
  x = xOf;

  readonly pDraft = signal('3');
  readonly qDraft = signal('2');
  readonly pq = signal<[number, number]>([3, 2]);
  readonly pqMsg = signal<string | null>(null);
  readonly ratio = computed(() => this.pq()[0] / this.pq()[1]);
  readonly diff = computed(() => {
    const [p, q] = this.pq();
    return String(p * p - 2 * q * q).replace('-', '−');
  });

  readonly step = signal(0);
  readonly thought = signal(false);
  readonly msg = signal<string | null>(null);
  readonly lines = signal<Line[]>(START);
  readonly done = signal(false);
  readonly beat = computed(() => BEATS[this.step()]);
  readonly lastId = computed(() => {
    const l = this.lines();
    return l.length > START.length ? l[l.length - 1].id : null;
  });

  setPQ(p: number, q: number): void {
    this.pDraft.set(String(p));
    this.qDraft.set(String(q));
    this.pq.set([p, q]);
    this.pqMsg.set(null);
  }

  tryPQ(): void {
    const p = readNumber(this.pDraft());
    const q = readNumber(this.qDraft());
    if (!p.ok || !q.ok) return this.pqMsg.set(!p.ok ? `p：${p.msg}` : `q：${(q as { msg: string }).msg}`);
    if (p.v.d !== 1 || q.v.d !== 1) return this.pqMsg.set('p、q 都要是整數。');
    if (q.v.n === 0) return this.pqMsg.set('q 不能是 0。');
    if (Math.abs(p.v.n) > 100000 || Math.abs(q.v.n) > 100000) return this.pqMsg.set('換小一點的數，十萬以內。');
    this.pq.set([Math.abs(p.v.n), Math.abs(q.v.n)]);
    this.pqMsg.set(null);
  }

  choose(o: Option): void {
    if (!o.ok) {
      this.msg.set(o.why);
      return;
    }
    this.msg.set(null);
    this.lines.update((l) => [...l, ...this.beat().add]);
    if (this.step() === BEATS.length - 1) {
      this.done.set(true);
      this.progress.markCompleted('proofs-ch8', '4');
      return;
    }
    this.step.update((s) => s + 1);
    this.thought.set(false);
  }
}
