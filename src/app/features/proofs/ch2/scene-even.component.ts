import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { MultiplesLineComponent } from './multiples-line.component';
import { add, eq, fmtQ, isInt, mul, paren, q, readNumber, sgn } from './ch2-expr';

type Bet = 'yes' | 'no' | 'unsure';
type Tone = 'good' | 'bad' | 'you';

interface Item {
  id: 'zero' | 'neg6' | 'seven' | 'neg7';
  n: number;
  c: 0 | 1;
  kind: '偶數' | '奇數';
}
interface Result {
  on: boolean;
  k?: string;
}

const ITEMS: Item[] = [
  { id: 'zero', n: 0, c: 0, kind: '偶數' },
  { id: 'neg6', n: -6, c: 0, kind: '偶數' },
  { id: 'seven', n: 7, c: 0, kind: '偶數' },
  { id: 'neg7', n: -7, c: 1, kind: '奇數' },
];
const BET_ITEMS = ITEMS.slice(0, 3);

const ON_NOTE: Record<string, string> = {
  zero: '定義沒有說 k 不能是 0。',
  neg6: '定義也沒有說 k 要是正的。',
  neg7: '注意是 −4 而不是 −3：2 × (−3) + 1 = −5。',
};
const FOUND_HINT: Record<string, string> = {
  zero: '提示：k 可以是 0。',
  neg6: '提示：k 可以是負數。',
  neg7: '提示：k 可以是負數，而且別忘了最後的 + 1。',
};

@Component({
  selector: 'app-pf-even',
  standalone: true,
  imports: [MultiplesLineComponent],
  styleUrl: './scene-even.component.scss',
  template: `
    <section class="pf-scene">
      <div class="pf-col">
        <p class="pf-kicker">1 / 5 · 開關</p>
        <h1 class="pf-title">0 是偶數嗎？</h1>
        <p class="pf-lede">先別查，憑你現在的感覺回答。等一下我們不靠感覺，改用定義來判斷。</p>

        <div class="bets" role="group" aria-label="憑感覺下注">
          @for (it of betItems; track it.id) {
            <div class="bet-row">
              <span class="bet-n pf-num">{{ s(it.n) }}</span>
              <span class="bet-q">是偶數嗎？</span>
              <div class="pf-row">
                @for (o of betOptions; track o.v) {
                  <button
                    type="button"
                    class="pf-btn small"
                    [class.picked]="bets()[it.id] === o.v"
                    [attr.aria-pressed]="bets()[it.id] === o.v"
                    [disabled]="committed()"
                    (click)="bet(it.id, o.v)"
                  >
                    {{ o.label }}
                  </button>
                }
              </div>
            </div>
          }
        </div>

        @if (!committed()) {
          <div class="pf-row">
            <button type="button" class="pf-btn primary" [disabled]="!allBet()" (click)="committed.set(true)">我答好了</button>
          </div>
        } @else {
          <div class="pf-def pf-rise">
            <small>定義</small>
            <p>n 是偶數 ⇔ 存在<b>整數</b> <span class="pf-k">k</span>，使 n = 2 × <span class="pf-k">k</span>。</p>
          </div>
          <p class="pf-p">
            這句話是一個<b>開關</b>：找得到這樣的整數 k，「n 是偶數」就成立；一個都找不到，就不成立。它不問 n
            看起來像不像偶數，只問一件事：<b>k 找不找得到</b>。
          </p>
          <p class="pf-note">在右邊替每個數找 k。數線上的圓點，標出 k 是整數時 2 × k 會落在哪裡。</p>

          @if (oddOpen()) {
            <div class="pf-def pf-rise">
              <small>定義</small>
              <p>n 是奇數 ⇔ 存在整數 <span class="pf-k">k</span>，使 n = 2 × <span class="pf-k">k</span> + 1。</p>
            </div>
            <p class="pf-p">奇數有自己的開關，形狀一樣，只多了 + 1。在右邊試試 −7。</p>
          }

          @if (allDone()) {
            <table class="pf-table pf-rise">
              <tr><th>數</th><th>你的感覺</th><th>定義的判斷</th></tr>
              @for (it of betItems; track it.id) {
                <tr>
                  <td class="pf-num">{{ s(it.n) }}</td>
                  <td>{{ betLabel(it.id) }}</td>
                  <td>{{ results()[it.id]?.on ? '是偶數（k = ' + results()[it.id]?.k + '）' : '不是偶數（沒有整數 k）' }}</td>
                </tr>
              }
            </table>
            @if (bets()['zero'] !== 'yes') {
              <p class="pf-feedback you">
                你原本對 0 沒把握。很多人覺得 0「什麼都不是」，但定義只問一件事：找不找得到整數 k。k = 0 就行，所以 0 是偶數，沒有例外。
              </p>
            }
            <details class="pf-why">
              <summary>為什麼 k 一定要是整數？</summary>
              <div>
                <p>如果 k 可以是任何數，每個數都能寫成 2 × (它的一半)，例如 7 = 2 × 3.5。那「偶數」就什麼都沒說了。限制 k 是整數，這個開關才分得出東西。</p>
              </div>
            </details>
            <details class="pf-why">
              <summary>「說找不到，要給理由」跟第 1 章有什麼關係？</summary>
              <div>
                <p>「7 是偶數」說的是「存在一個整數 k……」。存在型的句子，一個例子就能證明。</p>
                <p>要推翻它，你得說明「每一個整數 k 都不行」。這是一句「所有」，只能靠理由，不能靠多試幾個。第 1 章的證據規則，在這裡原封不動地出現。</p>
              </div>
            </details>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>是不是偶數，問定義：找得到整數 k 嗎？<br />找得到，一個就夠；說找不到，要給理由。</p>
            </div>
          }
        }
      </div>

      <div class="pf-stage pf-panel" [class.idle]="!committed()">
        <div class="pf-items">
          @for (it of visibleItems(); track it.id; let i = $index) {
            <button
              type="button"
              class="pf-item"
              [class.active]="i === active()"
              [attr.aria-current]="i === active() ? 'true' : null"
              [disabled]="!committed() || i > doneCount()"
              (click)="go(i)"
            >
              <span>{{ s(it.n) }} 是{{ it.kind }}</span>
              <span class="pf-seal mini" [class.open]="!results()[it.id]" [class.proved]="results()[it.id]?.on" [class.refuted]="results()[it.id]?.on === false">
                {{ sealText(it) }}
              </span>
            </button>
          }
        </div>

        @if (cur(); as it) {
          <form class="pf-col tight" (submit)="check($event)">
            <p class="pf-q">要讓「{{ s(it.n) }} 是{{ it.kind }}」成立，k 是多少？</p>
            <div class="pf-eqn">
              <span>{{ s(it.n) }} = 2 ×</span>
              <input
                class="pf-input"
                inputmode="decimal"
                autocomplete="off"
                aria-label="k 的值"
                [value]="draft()"
                (input)="draft.set($any($event.target).value)"
                [disabled]="!committed() || !!results()[it.id]"
              />
              @if (it.c) {
                <span>+ 1</span>
              }
            </div>
            @if (!results()[it.id]) {
              <div class="pf-row">
                <button type="submit" class="pf-btn primary" [disabled]="!committed()">代入</button>
                <button type="button" class="pf-btn ghost" [disabled]="!committed()" (click)="notFound()">找不到整數 k</button>
              </div>
            }
          </form>

          <app-pf-multiples
            [a]="2"
            [c]="it.c"
            [target]="it.n"
            [hit]="!!results()[it.id]?.on"
            [showGap]="results()[it.id]?.on === false"
            [showK]="!!results()[it.id]"
          />

          @if (msg(); as m) {
            <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" [class.you]="m.tone === 'you'" role="status">
              {{ m.text }}
            </p>
          }
          @if (results()[it.id] && nextItem(); as nx) {
            <div class="pf-row">
              <button type="button" class="pf-btn" (click)="go(active() + 1)">下一個：{{ s(nx.n) }} →</button>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class SceneEvenComponent {
  private readonly progress = inject(LearnProgressService);

  readonly s = sgn;
  readonly betItems = BET_ITEMS;
  readonly betOptions: { v: Bet; label: string }[] = [
    { v: 'yes', label: '是' },
    { v: 'no', label: '不是' },
    { v: 'unsure', label: '說不準' },
  ];

  readonly bets = signal<Record<string, Bet>>({});
  readonly committed = signal(false);
  readonly results = signal<Record<string, Result>>({});
  readonly active = signal(0);
  readonly draft = signal('');
  readonly msg = signal<{ tone: Tone; text: string } | null>(null);

  readonly allBet = computed(() => BET_ITEMS.every((it) => this.bets()[it.id]));
  readonly oddOpen = computed(() => BET_ITEMS.every((it) => this.results()[it.id]));
  readonly visibleItems = computed(() => (this.oddOpen() ? ITEMS : BET_ITEMS));
  readonly doneCount = computed(() => this.visibleItems().filter((it) => this.results()[it.id]).length);
  readonly allDone = computed(() => ITEMS.every((it) => this.results()[it.id]));
  readonly cur = computed(() => this.visibleItems()[this.active()] ?? null);
  readonly nextItem = computed(() => this.visibleItems()[this.active() + 1] ?? null);

  bet(id: string, v: Bet): void {
    this.bets.update((b) => ({ ...b, [id]: v }));
  }

  betLabel(id: string): string {
    return this.betOptions.find((o) => o.v === this.bets()[id])?.label ?? '';
  }

  sealText(it: Item): string {
    const r = this.results()[it.id];
    return !r ? '未定' : r.on ? '證明' : '推翻';
  }

  go(i: number): void {
    this.active.set(i);
    this.draft.set('');
    this.msg.set(null);
  }

  check(ev: Event): void {
    ev.preventDefault();
    const it = this.cur();
    if (!it || this.results()[it.id] || !this.committed()) return;
    const r = readNumber(this.draft());
    if (!r.ok) {
      this.msg.set({ tone: 'bad', text: r.msg });
      return;
    }
    const k = r.v;
    const lhs = add(mul(q(2), k), q(it.c));
    const shown = `2 × ${paren(k)}${it.c ? ' + 1' : ''}`;
    if (!eq(lhs, q(it.n))) {
      let text = `${shown} = ${fmtQ(lhs)}，不是 ${sgn(it.n)}。`;
      if (it.n < 0 && k.n > 0) text += '提示：k 可以是負數。';
      this.msg.set({ tone: 'bad', text });
      return;
    }
    if (isInt(k)) {
      this.finish(it, { on: true, k: fmtQ(k) });
      this.msg.set({
        tone: 'good',
        text: `${shown} = ${sgn(it.n)}，而且 ${fmtQ(k)} 是整數。找到了，所以「${sgn(it.n)} 是${it.kind}」成立。${ON_NOTE[it.id] ?? ''}`,
      });
    } else {
      this.finish(it, { on: false });
      this.msg.set({
        tone: 'good',
        text: `${shown} = ${it.n} 沒錯，但 ${fmtQ(k)} 不是整數。而且能讓 2 × k = ${it.n} 的 k 只有 ${fmtQ(k)} 這一個，所以沒有任何整數 k 做得到，「${it.n} 是偶數」不成立。這個理由涵蓋了每一個 k，不是試出來的。`,
      });
    }
  }

  notFound(): void {
    const it = this.cur();
    if (!it || this.results()[it.id]) return;
    if (it.id === 'seven') {
      this.msg.set({
        tone: 'you',
        text: '你怎麼確定「每一個整數 k 都不行」？整數有無限多個，試不完。換個問法：先不管是不是整數，k 要是多少，2 × k 才會剛好等於 7？把它填進去。',
      });
    } else {
      this.msg.set({ tone: 'bad', text: `其實找得到：有一個圓點正好落在 ${sgn(it.n)} 上。${FOUND_HINT[it.id]}` });
    }
  }

  private finish(it: Item, r: Result): void {
    this.results.update((m) => ({ ...m, [it.id]: r }));
    if (this.allDone()) this.progress.markCompleted('proofs-ch2', '1');
  }
}
