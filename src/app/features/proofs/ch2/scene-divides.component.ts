import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { MultiplesLineComponent } from './multiples-line.component';
import { eq, fmtQ, isInt, mul, paren, q, readNumber } from './ch2-expr';

type Tone = 'good' | 'bad' | 'you';
type Kind = 'sentence' | 'number' | 'undefined';

interface Pair {
  id: string;
  a: number;
  b: number;
}

const PAIRS: Pair[] = [
  { id: '3|12', a: 3, b: 12 },
  { id: '12|3', a: 12, b: 3 },
  { id: '3|0', a: 3, b: 0 },
  { id: '0|3', a: 0, b: 3 },
  { id: '0|0', a: 0, b: 0 },
];
const TRUTH: Record<string, boolean> = { '3|12': true, '12|3': false, '3|0': true, '0|3': false, '0|0': true };

const ON_NOTE: Record<string, string> = {
  '3|12': '',
  '3|0': '0 是任何整數的倍數：k = 0 就行。',
  '0|0': '其實 k 填什麼都行：0 × 1 = 0、0 × (−2) = 0。存在型的句子，找到一個就夠。',
};
const FOUND_HINT: Record<string, string> = {
  '3|12': '12 是 3 的幾倍？',
  '3|0': '3 × ? = 0',
  '0|0': '0 × ? = 0，隨便試一個。',
};

interface SortItem {
  id: string;
  expr: string;
  kind: Kind;
  ok: string;
  wrong: Partial<Record<Kind, string>>;
}

const SORT: SortItem[] = [
  {
    id: 's1',
    expr: '3 ∣ 12',
    kind: 'sentence',
    ok: '一句話，而且成立：12 是 3 的整數倍。',
    wrong: {
      number: '3 ∣ 12 不是 4，也不是 0.25。它是一句話：「12 是 3 的整數倍」，只會成立或不成立。',
      undefined: '它有意義：它是一句話，而且成立。',
    },
  },
  {
    id: 's2',
    expr: '12 / 3',
    kind: 'number',
    ok: '一個數：4。',
    wrong: { sentence: '12 / 3 是一個數：4。它沒有「成立不成立」可言。', undefined: '12 / 3 = 4，有定義。' },
  },
  {
    id: 's3',
    expr: '3 / 12',
    kind: 'number',
    ok: '一個數：0.25。不是整數也沒關係，它還是一個數。',
    wrong: { sentence: '3 / 12 是一個數：0.25。', undefined: '3 / 12 = 0.25，有定義，只是不是整數。' },
  },
  {
    id: 's4',
    expr: '0 ∣ 0',
    kind: 'sentence',
    ok: '一句話，而且成立：0 = 0 × k 有整數解，例如 k = 5。',
    wrong: {
      number: '0 ∣ 0 是一句話，不是一個數。它問「0 能不能寫成 0 × 某個整數」：可以，所以成立。',
      undefined: '這正是用乘法定義整除的好處：0 = 0 × 5，找得到整數 k，所以 0 ∣ 0 成立，就算 0 / 0 沒有定義也一樣。',
    },
  },
  {
    id: 's5',
    expr: '0 / 0',
    kind: 'undefined',
    ok: '沒有定義：0 × k = 0 對每個 k 都成立，選不出唯一的那個數。',
    wrong: {
      sentence: '0 / 0 想表示的是「一個數」，不是一句話；而且這個數根本選不出來。',
      number: '「0 / 0」要找的是唯一一個數 x，使 x × 0 = 0。但每個數乘以 0 都是 0，選不出唯一的那個，所以沒有定義。',
    },
  },
];

@Component({
  selector: 'app-pf-divides',
  standalone: true,
  imports: [MultiplesLineComponent],
  styleUrl: './scene-divides.component.scss',
  template: `
    <section class="pf-scene">
      <div class="pf-col">
        <p class="pf-kicker">2 / 5 · 整除</p>
        <h1 class="pf-title">3 整除 0 嗎？</h1>

        <div class="pf-def">
          <small>定義 · 本課約定 a 可以是 0</small>
          <p>a ∣ b ⇔ 存在整數 <span class="pf-k">k</span>，使 b = a × <span class="pf-k">k</span>。</p>
        </div>
        <p class="pf-p">讀作「a 整除 b」，意思是「b 是 a 的整數倍」。這又是一個開關：找得到整數 k 就成立。先憑感覺判斷這五句：</p>

        <div class="bets" role="group" aria-label="憑感覺下注">
          @for (p of pairs; track p.id) {
            <div class="bet-row">
              <span class="bet-n pf-num">{{ p.a }} ∣ {{ p.b }}</span>
              <div class="pf-row">
                <button type="button" class="pf-btn small" [class.picked]="bets()[p.id] === true" [attr.aria-pressed]="bets()[p.id] === true" [disabled]="committed()" (click)="bet(p.id, true)">成立</button>
                <button type="button" class="pf-btn small" [class.picked]="bets()[p.id] === false" [attr.aria-pressed]="bets()[p.id] === false" [disabled]="committed()" (click)="bet(p.id, false)">不成立</button>
              </div>
              @if (results()[p.id] !== undefined) {
                <span class="verdict" [class.miss]="bets()[p.id] !== results()[p.id]">
                  {{ bets()[p.id] === results()[p.id] ? '跟定義一致' : '跟定義不同' }}
                </span>
              }
            </div>
          }
        </div>

        @if (!committed()) {
          <div class="pf-row">
            <button type="button" class="pf-btn primary" [disabled]="!allBet()" (click)="committed.set(true)">我答好了</button>
          </div>
        } @else if (!allDone()) {
          <p class="pf-note">在右邊逐句找 k。順序隨你。</p>
        } @else {
          <p class="pf-p pf-rise">
            五句都判完了。最常讓人意外的是 <b>3 ∣ 0 成立</b>、<b>0 ∣ 0 也成立</b>，只有 <b>0 ∣ 3</b> 不成立。這些都不是記出來的特例，是定義直接推出來的。
          </p>

          <h2 class="pf-q">∣ 和 / 不是同一種東西</h2>
          <p class="pf-p">下面每一個，是一句話（會成立或不成立）、一個數，還是沒有定義？</p>
          <div class="sort">
            @for (it of sortItems; track it.id) {
              <div class="sort-row">
                <span class="sort-expr pf-num">{{ it.expr }}</span>
                <div class="pf-row">
                  @for (k of kinds; track k.v) {
                    <button
                      type="button"
                      class="pf-btn small"
                      [class.picked]="sorted()[it.id] === k.v"
                      [attr.aria-pressed]="sorted()[it.id] === k.v"
                      [disabled]="sorted()[it.id] === it.kind"
                      (click)="sort(it, k.v)"
                    >
                      {{ k.label }}
                    </button>
                  }
                </div>
                @if (sorted()[it.id]; as pick) {
                  <p class="pf-feedback" [class.good]="pick === it.kind" [class.bad]="pick !== it.kind">
                    {{ pick === it.kind ? it.ok : it.wrong[pick] }}
                  </p>
                }
              </div>
            }
          </div>

          @if (sortDone()) {
            <p class="pf-feedback good pf-rise">
              所以 a ∣ b 和 b / a 是兩種東西：一個回答「是不是」，一個給你「一個數」。a ≠ 0 時，a ∣ b 成立，剛好等於說 b / a
              是整數；a = 0 時，只有乘法的版本還講得通。
            </p>
            <details class="pf-why">
              <summary>有些教材要求 a ≠ 0</summary>
              <div>
                <p>部分教材定義整除時規定 a ≠ 0，於是「0 ∣ 0」在那些書裡不是一句合法的話。本課採用不排除 0 的版本，因為它只用乘法，不需要另外處理例外。</p>
                <p>讀別的書時，先看它怎麼約定。定義寫在哪裡，答案就跟著那裡走。</p>
              </div>
            </details>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>a ∣ b 是一句話：b 是不是 a 的整數倍。<br />它用乘法定義，所以連 0 都講得清楚。</p>
            </div>
          }
        }
      </div>

      <div class="pf-stage pf-panel" [class.idle]="!committed()">
        <div class="pf-items">
          @for (p of pairs; track p.id; let i = $index) {
            <button
              type="button"
              class="pf-item pf-num"
              [class.active]="i === active()"
              [attr.aria-current]="i === active() ? 'true' : null"
              [disabled]="!committed()"
              (click)="go(i)"
            >
              <span>{{ p.a }} ∣ {{ p.b }}</span>
              <span class="pf-seal mini" [class.open]="results()[p.id] === undefined" [class.proved]="results()[p.id] === true" [class.refuted]="results()[p.id] === false">
                {{ results()[p.id] === undefined ? '未定' : results()[p.id] ? '證明' : '推翻' }}
              </span>
            </button>
          }
        </div>

        @if (cur(); as p) {
          <form class="pf-col tight" (submit)="check($event)">
            <p class="pf-q">要讓 {{ p.a }} ∣ {{ p.b }} 成立，k 是多少？</p>
            <div class="pf-eqn">
              <span>{{ p.b }} = {{ p.a }} ×</span>
              <input
                class="pf-input"
                inputmode="decimal"
                autocomplete="off"
                aria-label="k 的值"
                [value]="draft()"
                (input)="draft.set($any($event.target).value)"
                [disabled]="!committed() || results()[p.id] !== undefined"
              />
            </div>
            @if (results()[p.id] === undefined) {
              <div class="pf-row">
                <button type="submit" class="pf-btn primary" [disabled]="!committed()">代入</button>
                <button type="button" class="pf-btn ghost" [disabled]="!committed()" (click)="notFound()">找不到整數 k</button>
              </div>
            }
          </form>

          <app-pf-multiples
            [a]="p.a"
            [target]="p.b"
            [hit]="results()[p.id] === true"
            [showGap]="results()[p.id] === false"
            [showK]="results()[p.id] !== undefined"
          />

          @if (msg(); as m) {
            <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" [class.you]="m.tone === 'you'" role="status">
              {{ m.text }}
            </p>
          }
          @if (results()[p.id] !== undefined && nextOpen() !== null) {
            <div class="pf-row">
              <button type="button" class="pf-btn" (click)="go(nextOpen()!)">下一句 →</button>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class SceneDividesComponent {
  private readonly progress = inject(LearnProgressService);

  readonly pairs = PAIRS;
  readonly sortItems = SORT;
  readonly kinds: { v: Kind; label: string }[] = [
    { v: 'sentence', label: '一句話' },
    { v: 'number', label: '一個數' },
    { v: 'undefined', label: '沒有定義' },
  ];

  readonly bets = signal<Record<string, boolean>>({});
  readonly committed = signal(false);
  readonly results = signal<Record<string, boolean>>({});
  readonly active = signal(0);
  readonly draft = signal('');
  readonly msg = signal<{ tone: Tone; text: string } | null>(null);
  readonly sorted = signal<Record<string, Kind>>({});

  readonly allBet = computed(() => PAIRS.every((p) => this.bets()[p.id] !== undefined));
  readonly allDone = computed(() => PAIRS.every((p) => this.results()[p.id] !== undefined));
  readonly cur = computed(() => PAIRS[this.active()]);
  /** Index of the next unresolved pair after the current one, wrapping around. */
  readonly nextOpen = computed<number | null>(() => {
    for (let s = 1; s < PAIRS.length; s++) {
      const i = (this.active() + s) % PAIRS.length;
      if (this.results()[PAIRS[i].id] === undefined) return i;
    }
    return null;
  });
  readonly sortDone = computed(() => SORT.every((it) => this.sorted()[it.id] === it.kind));

  bet(id: string, v: boolean): void {
    this.bets.update((b) => ({ ...b, [id]: v }));
  }

  go(i: number): void {
    this.active.set(i);
    this.draft.set('');
    this.msg.set(null);
  }

  check(ev: Event): void {
    ev.preventDefault();
    const p = this.cur();
    if (this.results()[p.id] !== undefined || !this.committed()) return;
    const r = readNumber(this.draft());
    if (!r.ok) {
      this.msg.set({ tone: 'bad', text: r.msg });
      return;
    }
    const k = r.v;
    const lhs = mul(q(p.a), k);
    const shown = `${p.a} × ${paren(k)}`;
    if (!eq(lhs, q(p.b))) {
      this.msg.set({ tone: 'bad', text: `${shown} = ${fmtQ(lhs)}，不是 ${p.b}。${p.a === 0 ? '0 乘任何數都是 0。' : ''}` });
      return;
    }
    if (isInt(k)) {
      this.finish(p, true);
      this.msg.set({ tone: 'good', text: `${shown} = ${p.b}，而且 ${fmtQ(k)} 是整數。所以 ${p.a} ∣ ${p.b} 成立。${ON_NOTE[p.id] ?? ''}` });
    } else {
      this.finish(p, false);
      this.msg.set({
        tone: 'good',
        text: `${shown} = ${p.b} 沒錯，但 ${fmtQ(k)} 不是整數。而且能讓 ${p.a} × k = ${p.b} 的 k 只有 ${fmtQ(k)} 這一個，所以沒有整數 k 做得到，${p.a} ∣ ${p.b} 不成立。`,
      });
    }
  }

  notFound(): void {
    const p = this.cur();
    if (this.results()[p.id] !== undefined || !this.committed()) return;
    if (TRUTH[p.id]) {
      this.msg.set({ tone: 'bad', text: `其實找得到。${FOUND_HINT[p.id]}` });
    } else if (p.a === 0) {
      this.finish(p, false);
      this.msg.set({
        tone: 'good',
        text: `對。0 乘任何數都是 0，永遠到不了 ${p.b}。這個理由對每一個 k 都成立，不是試出來的。所以 0 ∣ ${p.b} 不成立。`,
      });
    } else {
      this.msg.set({
        tone: 'you',
        text: `整數試不完。換個問法：先不管是不是整數，k 要是多少，${p.a} × k 才會剛好等於 ${p.b}？把它填進去。`,
      });
    }
  }

  sort(it: SortItem, k: Kind): void {
    this.sorted.update((m) => ({ ...m, [it.id]: k }));
    if (this.sortDone()) this.progress.markCompleted('proofs-ch2', '2');
  }

  private finish(p: Pair, on: boolean): void {
    this.results.update((m) => ({ ...m, [p.id]: on }));
  }
}
