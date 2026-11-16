import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { readNumber, sgn } from '../ch2/ch2-expr';
import { EVEN_SUM, EVEN_SUM_GIVENS, EVEN_SUM_OPENING } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

type Who = 'opp' | 'dep' | 'you';
const WHO_NAME: Record<Who, string> = { opp: '對手', dep: '由別的字母決定', you: '你' };

interface Letter {
  name: string;
  where: string;
  want: Who;
  ok: string;
  bad: Partial<Record<Who, string>>;
}

const LETTERS: Letter[] = [
  {
    name: 'a',
    where: '虛線框',
    want: 'opp',
    ok: '「令任意」放上板的。對手可以給任何整數，你不能指定。',
    bad: {
      you: '如果你自己挑 a = 4，證到的只是 a = 4 這一個例子。a 是「令任意」放上板的，由對手給。',
      dep: 'a 不是從別的字母算出來的。它是「令任意」放上板的，由對手給。',
    },
  },
  {
    name: 'b',
    where: '虛線框',
    want: 'opp',
    ok: '和 a 一樣，是對手給的。而且對手不必讓它和 a 一樣。',
    bad: { you: 'b 也是「令任意」放上板的，由對手給，你不能挑。', dep: 'b 不是算出來的，是對手給的。' },
  },
  {
    name: 'k',
    where: '加粗框',
    want: 'dep',
    ok: 'a 一給定，k 就是 a 的一半，沒有選擇的餘地。',
    bad: { you: 'k 不是你挑的。H5 說 a = 2k：a 是多少，k 就跟著是多少。', opp: '對手直接給的是 a；k 是跟著 a 決定的，a 的一半。' },
  },
  {
    name: 'l',
    where: '加粗框',
    want: 'dep',
    ok: '跟著 b 決定：b 的一半。',
    bad: { you: 'l 不是你挑的。H7 說 b = 2l：b 是多少，l 就是多少的一半。', opp: '對手直接給的是 b；l 是 b 的一半。' },
  },
  {
    name: 'm',
    where: '目標裡',
    want: 'you',
    ok: '目標說「存在整數 m」，這一招是你出的（第 4 章：存在由你出）。下一幕由你寫出來。',
    bad: {
      opp: '目標說「存在整數 m」。第 4 章說過，「存在」那一招是你出的。',
      dep: '它確實會用 k、l 來寫，但寫成什麼是你決定的：目標說「存在整數 m」，這一招由你出。',
    },
  },
];

type Diag = 'same' | 'zero' | 'all';
const DIAGS: { id: Diag; text: string }[] = [
  { id: 'same', text: 'a 和 b 一樣大的情況' },
  { id: 'zero', text: 'a、b 都是 0 的情況' },
  { id: 'all', text: '所有偶數 a、b' },
];

@Component({
  selector: 'app-pf-who-decides',
  standalone: true,
  imports: [ProofBoardComponent],
  styleUrl: './ch6.scss',
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">4 / 6 · 三種身份</p>
        <h1 class="pf-title">誰決定這個字母？</h1>
        <p class="pf-lede">
          這是上一幕結束時的板子。左邊有四個字母 a、b、k、l，目標裡還有一個 m。它們都代表整數，可是<b>值是怎麼來的</b>，並不一樣。
        </p>

        <app-pf-board class="c6-narrow" [start]="start" [prefix]="prefix" [frozen]="true" [showLog]="false" label="上一幕結束時的板子" />

        <div class="pf-col tight">
          <p class="pf-q">每個字母的值，由誰決定？</p>
          <table class="pf-table c6-who">
            <caption class="pf-sr-only">替每個字母選出由誰決定它的值</caption>
            <tr><th>字母</th><th>在板上</th><th>由誰決定</th></tr>
            @for (l of letters; track l.name; let i = $index) {
              <tr>
                <td class="pf-num c6-letter">{{ l.name }}</td>
                <td>{{ l.where }}</td>
                <td>
                  <div class="pf-row" role="radiogroup" [attr.aria-label]="l.name + ' 由誰決定'">
                    @for (w of whos; track w) {
                      <button type="button" class="pf-btn small" role="radio" [attr.aria-checked]="who()[i] === w" [class.picked]="who()[i] === w" (click)="pickWho(i, w)">
                        {{ whoName[w] }}
                      </button>
                    }
                  </div>
                  @if (whoChecked() && who()[i]; as w) {
                    <small class="c6-why" [class.bad]="w !== l.want">{{ w === l.want ? '✓ ' + l.ok : l.bad[w] }}</small>
                  }
                </td>
              </tr>
            }
          </table>
          <div class="pf-row">
            <button type="button" class="pf-btn primary" [disabled]="who().includes(null)" (click)="whoChecked.set(true)">對答案</button>
            @if (whoChecked() && !whoRight()) {
              <span class="pf-note">改好就會自動更新。</span>
            }
          </div>
        </div>

        @if (whoRight()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              三種身份，三種框：<b>虛線</b>是對手給的，你不能挑；<b>加粗</b>是拿到的，由它的出處決定；<b>實線</b>是你選的，下一幕的 m 會是第一個。它們長得不一樣，是因為你能對它們做的事不一樣。
            </p>
            <p class="pf-p">下面是一位同學寫的證明。它看起來更短：</p>
            <div class="pf-slip c6-classmate">
              <small>同學的證明</small>
              <ol>
                <li>設 a、b 是偶數。</li>
                <li>所以 a = 2k，b = 2k。</li>
                <li>a + b = 2k + 2k = 4k = 2(2k)。</li>
                <li>2k 是整數，所以 a + b 是偶數。</li>
              </ol>
              @if (refuted()) {
                <span class="pf-seal refuted stamp">推翻</span>
              }
            </div>
            <p class="pf-q">這段證明對嗎？</p>
            <div class="pf-row" role="group" aria-label="同學的證明對嗎">
              <button type="button" class="pf-btn" [class.picked]="verdict() === 'ok'" [disabled]="verdict() !== null" (click)="verdict.set('ok')">看起來沒問題</button>
              <button type="button" class="pf-btn" [class.picked]="verdict() === 'bad'" [disabled]="verdict() !== null" (click)="verdict.set('bad')">有地方不對</button>
            </div>
          </div>
        }

        @if (verdict()) {
          <form class="pf-col tight pf-rise" (submit)="$event.preventDefault(); test()">
            <p class="pf-p">
              {{ verdict() === 'ok' ? '每一行的代數都沒算錯。' : '先別急著說哪裡錯。' }}用具體的數檢查第 2 行：挑兩個<b>不一樣</b>的偶數。
            </p>
            <div class="pf-eqn">
              <label for="pf-c6-a">a =</label>
              <input id="pf-c6-a" class="pf-input" inputmode="numeric" autocomplete="off" [value]="aDraft()" (input)="aDraft.set($any($event.target).value)" [disabled]="refuted()" />
              <label for="pf-c6-b">b =</label>
              <input id="pf-c6-b" class="pf-input" inputmode="numeric" autocomplete="off" [value]="bDraft()" (input)="bDraft.set($any($event.target).value)" [disabled]="refuted()" />
              @if (!refuted()) {
                <button type="submit" class="pf-btn primary small">代進第 2 行</button>
              }
            </div>
            @if (testMsg(); as m) {
              <p class="pf-feedback bad" role="status">{{ m }}</p>
            }
          </form>
        }

        @if (refuted(); as r) {
          <div class="pf-col tight pf-rise">
            <table class="pf-table c6-clash">
              <caption class="pf-sr-only">第 2 行在 a = {{ r.a }}、b = {{ r.b }} 時算出的 k</caption>
              <tr><th>第 2 行說</th><th>代入</th><th>所以 k =</th></tr>
              <tr><td class="pf-num">a = 2k</td><td class="pf-num">{{ sgn(r.a) }} = 2k</td><td class="pf-num">{{ sgn(r.a / 2) }}</td></tr>
              <tr><td class="pf-num">b = 2k</td><td class="pf-num">{{ sgn(r.b) }} = 2k</td><td class="pf-num">{{ sgn(r.b / 2) }}</td></tr>
            </table>
            <p class="pf-p">同一個 k 不可能同時是 {{ sgn(r.a / 2) }} 和 {{ sgn(r.b / 2) }}。a = {{ sgn(r.a) }}、b = {{ sgn(r.b) }} 明明是兩個偶數，第 2 行卻寫不出來。</p>
            <p class="pf-q">那這段證明，其實只證了哪些情況？</p>
            <div class="pf-row" role="group" aria-label="同學的證明只證了">
              @for (d of diags; track d.id) {
                <button type="button" class="pf-btn" [class.picked]="diag() === d.id" [attr.aria-pressed]="diag() === d.id" [disabled]="diag() === 'same'" (click)="pickDiag(d.id)">{{ d.text }}</button>
              }
            </div>
            @if (diag(); as d) {
              <p class="pf-feedback" [class.good]="d === 'same'" [class.bad]="d !== 'same'" role="status">{{ diagMsg() }}</p>
            }
          </div>
        }

        @if (diag() === 'same') {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              板子不會讓這件事發生：上一幕第二次取出時如果打 k，它會擋下來。在板子上，a = {{ sgn(refuted()!.a) }} 時 k = {{ sgn(refuted()!.a / 2) }}，b = {{ sgn(refuted()!.b) }} 時 l = {{ sgn(refuted()!.b / 2) }}，兩個名字各自對得上。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>板上每個字母都有身份：<br />對手給的，你不能挑；拿到的，由出處決定，兩次拿到就要兩個名字；<br />你選的，只能用板上已有的字母來寫。</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneWhoDecidesComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = EVEN_SUM;
  readonly prefix = [...EVEN_SUM_OPENING, ...EVEN_SUM_GIVENS];
  readonly letters = LETTERS;
  readonly whos: Who[] = ['opp', 'dep', 'you'];
  readonly whoName = WHO_NAME;
  readonly diags = DIAGS;
  readonly sgn = sgn;

  readonly who = signal<(Who | null)[]>(LETTERS.map(() => null));
  readonly whoChecked = signal(false);
  readonly whoRight = computed(() => this.whoChecked() && this.who().every((w, i) => w === LETTERS[i].want));

  readonly verdict = signal<'ok' | 'bad' | null>(null);
  readonly aDraft = signal('');
  readonly bDraft = signal('');
  readonly testMsg = signal<string | null>(null);
  readonly refuted = signal<{ a: number; b: number } | null>(null);
  readonly diag = signal<Diag | null>(null);

  readonly diagMsg = computed(() => {
    switch (this.diag()) {
      case 'same':
        return '對。第 2 行用同一個 k，就是偷偷假設 a = 2k = b。它證的其實是「一個偶數加上它自己是偶數」。';
      case 'zero':
        return 'a = b = 0 時第 2 行確實沒問題，但 a = b = 6 也沒問題。只要 a 和 b 一樣，同一個 k 就寫得出來。';
      case 'all':
        return '你剛剛才找到兩個偶數，讓第 2 行寫不出來。它涵蓋不了所有偶數。';
      default:
        return '';
    }
  });

  pickWho(i: number, w: Who): void {
    this.who.update((a) => a.map((x, j) => (j === i ? w : x)));
  }

  test(): void {
    const a = readNumber(this.aDraft());
    const b = readNumber(this.bDraft());
    if (!a.ok || !b.ok) {
      this.testMsg.set(!a.ok ? `a：${a.msg}` : `b：${(b as { msg: string }).msg}`);
      return;
    }
    const av = a.v.d === 1 ? a.v.n : NaN;
    const bv = b.v.d === 1 ? b.v.n : NaN;
    if (!Number.isInteger(av) || !Number.isInteger(bv) || av % 2 !== 0 || bv % 2 !== 0) {
      this.testMsg.set('要兩個偶數，同學的證明是從「a、b 是偶數」開始的。');
      return;
    }
    if (Math.abs(av) > 1000 || Math.abs(bv) > 1000) {
      this.testMsg.set('挑小一點的，比較好算。');
      return;
    }
    if (av === bv) {
      this.testMsg.set(`a = b = ${sgn(av)} 時，第 2 行的 k = ${sgn(av / 2)} 剛好對得上。兩個一樣的數檢查不出問題，挑兩個不一樣的，例如 a = 4、b = 6。`);
      return;
    }
    this.testMsg.set(null);
    this.refuted.set({ a: av, b: bv });
  }

  pickDiag(d: Diag): void {
    this.diag.set(d);
    if (d === 'same') this.progress.markCompleted('proofs-ch6', '4');
  }
}
