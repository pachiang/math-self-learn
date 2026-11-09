import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';

const CELL = 30;
const MAX_N = 12;

@Component({
  selector: 'app-pf-every-n',
  standalone: true,
  styleUrl: './scene-every-n.component.scss',
  template: `
    <section class="pf-scene">
      <div class="pf-col">
        <p class="pf-kicker">3 / 4 · 對每個 n 都成立的圖</p>
        <h1 class="pf-title">這一次，<br />不再只看例子。</h1>

        <div class="pf-slip">
          <small>陳述</small>
          <p>前 n 個奇數加起來，等於 n²。</p>
          @if (attackN() !== null) {
            <div class="pf-seal proved stamp">證明<span>對每個 n</span></div>
          } @else {
            <div class="pf-seal open">未定</div>
          }
        </div>

        @if (choice() !== 'why') {
          <table class="sums pf-num" aria-label="前四個例子">
            @for (row of table; track row.n) {
              <tr>
                <td>{{ row.terms }}</td>
                <td>=</td>
                <td>{{ row.n * row.n }}</td>
                <td>= {{ row.n }}²</td>
              </tr>
            }
          </table>
        }

        @if (choice() === null) {
          <p class="pf-q">前兩幕的規律都背叛了你。這一次，你要怎麼確定？</p>
          <div class="pf-row">
            <button type="button" class="pf-btn" (click)="choice.set('more')">多檢查一些例子</button>
            <button type="button" class="pf-btn" (click)="choice.set('why')">找出它為什麼成立</button>
          </div>
        }
        @if (choice() === 'more') {
          <p class="pf-feedback bad">
            檢查到 n = 100，全部成立。但第二幕的規律也撐了 40 個。例子再多，也只能說「<b>到目前為止</b>」都對。
          </p>
          <div class="pf-row">
            <button type="button" class="pf-btn primary" (click)="choice.set('why')">那就找原因</button>
          </div>
        }

        @if (choice() === 'why') {
          <p class="pf-p">把「前 n 個奇數的和」想成一個 n × n 的正方形。要讓這句話從 n 推到 n + 1，必須<b>兩件事對得上</b>：</p>
          <ol class="two">
            <li><b>正方形</b>：從 n × n 長成 (n + 1) × (n + 1)，要補幾格？</li>
            <li><b>奇數</b>：加完前 n 個奇數之後，下一個奇數是多少？</li>
          </ol>

          @if (!matched()) {
            <form class="pf-col tight" (submit)="check($event)">
              <p class="pf-q">現在是 {{ n() }} × {{ n() }}，已經加了 {{ termsFor(n()) }}。</p>
              <div class="answers">
                <label>
                  <span>① 要長成 {{ n() + 1 }} × {{ n() + 1 }}，要補</span>
                  <input class="pf-input small" inputmode="numeric" autocomplete="off" [value]="d1()" (input)="d1.set($any($event.target).value)" [disabled]="ok1()" aria-label="要補幾格" />
                  <span>格</span>
                </label>
                <label>
                  <span>② 下一個奇數是</span>
                  <input class="pf-input small" inputmode="numeric" autocomplete="off" [value]="d2()" (input)="d2.set($any($event.target).value)" [disabled]="ok2()" aria-label="下一個奇數" />
                </label>
              </div>
              <div class="pf-row">
                <button type="submit" class="pf-btn primary">對答案</button>
                <span class="pf-note">右邊的虛線就是要補的那一圈，可以數。</span>
              </div>
              @if (hint1()) {
                <p class="pf-feedback bad">① {{ hint1() }}</p>
              }
              @if (hint2()) {
                <p class="pf-feedback bad">② {{ hint2() }}</p>
              }
            </form>
          } @else {
            <p class="pf-feedback good">兩個答案都是 <b class="pf-num">{{ 2 * matchedAt() + 1 }}</b>。這不是巧合，原因看得出來：</p>
            <ul class="reasons">
              <li><b>正方形每長大一圈</b>，要補的那一圈，上排和右排都比上一圈多 1 格，所以每一圈<b>多 2 格</b>。看右邊對角線上的數字：1、3、5、7……</li>
              <li><b>奇數</b>也是每個比前一個<b>多 2</b>：1、3、5、7……</li>
              <li>兩邊都從 <b>1</b> 開始、每次 <b>+2</b>，所以第幾圈要補的格數，永遠等於第幾個奇數。</li>
            </ul>
            <p class="pf-p">
              寫成式子：要補的是上排 n 格、右排 n 格、角落 1 格，共 <b class="pf-num">n + n + 1 = 2n + 1</b>；而下一個（第 n + 1 個）奇數也是
              <b class="pf-num">2n + 1</b>。
            </p>
            <details class="pf-why">
              <summary>第 n + 1 個奇數為什麼是 2n + 1？</summary>
              <div>
                <p>第 1 個奇數是 1 ＝ 2·1 − 1，第 2 個是 3 ＝ 2·2 − 1，第 3 個是 5 ＝ 2·3 − 1。每往後一個就多 2，所以第 k 個是 2k − 1。</p>
                <p>把 k 換成 n + 1：2(n + 1) − 1 ＝ 2n + 1。</p>
              </div>
            </details>

            <p class="pf-q">這個理由，有沒有用到「n 是多少」？</p>
            <div class="pf-row">
              <button type="button" class="pf-btn" [class.picked]="answer() === 'used'" (click)="answer.set('used')">有用到</button>
              <button type="button" class="pf-btn" [class.picked]="answer() === 'not'" (click)="answer.set('not')">沒用到</button>
            </div>
            @if (answer() === 'used') {
              <p class="pf-feedback bad">
                看右邊的「任何一個 n」：上面完全沒寫 n 等於幾，兩件事照樣對得上。理由只用到「它是一個 n × n 的正方形」和「奇數每次多 2」，沒有用到 n 的值。
              </p>
            }
            @if (answer()) {
              <p class="pf-feedback good">
                不管 n 是多少：要補 n + n + 1 格，下一個奇數也是 2n + 1。兩件事對上，「前 n 個奇數和 ＝ n²」就變成「前 n + 1 個奇數和 ＝ (n + 1)²」。
              </p>
              <form class="pf-col tight" (submit)="attack($event)">
                <label class="pf-q" for="pf-attack">換你當對手：挑一個你覺得最可能出錯的 n。</label>
                <div class="pf-row">
                  <input id="pf-attack" class="pf-input" inputmode="numeric" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
                  <button type="submit" class="pf-btn primary" [disabled]="!validDraft()">試試看</button>
                </div>
              </form>
            }

            @if (attackN(); as a) {
              <p class="pf-feedback good" role="status">
                n = <span class="pf-num">{{ fmt(a) }}</span>：要補 {{ fmt(a) }} + {{ fmt(a) }} + 1 = {{ fmt(2 * a + 1) }} 格，下一個奇數也是
                {{ fmt(2 * a + 1) }}。右邊那張圖一筆都不用改。
              </p>
              <p class="pf-p">
                再加上起點：n = 1 時，1 = 1²。起點成立，每一步又都能把「n 成立」帶到「n + 1 成立」，所以 2、3、4、…
                每一個 n 都會被帶到。這不是又多了一個例子，而是一個<b>對每一步都做同一件事</b>的理由。
              </p>
              <details class="pf-why">
                <summary>跟前兩幕差在哪？</summary>
                <div>
                  <p>圓和 n² + n + 41 都只有「到目前為止都對」。我們從來沒有理由說明為什麼下一個也會對，所以它們可以在任何一步背叛。</p>
                  <p>這一幕給的正是「為什麼下一個也會對」，而且這個理由不依賴你在哪一步。第 11 章會把這種論證正式命名為數學歸納法（mathematical induction）。到時只會補上寫法，不會改變結論。</p>
                </div>
              </details>
              <div class="pf-takeaway reveal">
                <small>帶走這一句</small>
                <p>論證能涵蓋無限多種情況，<br />是因為它對每一種情況做的事都一樣。</p>
              </div>
            }
          }
        }
      </div>

      <div class="stage pf-panel" [class.idle]="choice() !== 'why'">
        <figure class="view">
          <figcaption>這一個 n：<b class="pf-num">{{ n() }} × {{ n() }}</b></figcaption>
          <svg
            [attr.viewBox]="'-6 -34 ' + (box() + 82) + ' ' + (box() + 40)"
            role="img"
            [attr.aria-label]="n() + ' 乘 ' + n() + ' 的正方形；虛線是要補的一圈：上排 ' + n() + ' 格、右排 ' + n() + ' 格、角落 1 格'"
          >
            @for (c of cells(); track $index) {
              <rect [attr.x]="c.x" [attr.y]="c.y" [attr.width]="cell - 3" [attr.height]="cell - 3" rx="3" [class]="c.cls" />
              @if (c.label) {
                <text [attr.x]="c.x + (cell - 3) / 2" [attr.y]="c.y + (cell - 3) / 2" class="diag">{{ c.label }}</text>
              }
            }
            @for (c of pending(); track $index) {
              <rect [attr.x]="c.x" [attr.y]="c.y" [attr.width]="cell - 3" [attr.height]="cell - 3" rx="3" class="c-pending" [class.corner]="c.corner" />
            }
            <text [attr.x]="topLabelX()" [attr.y]="topArmY() - 10" class="arm">上排 {{ n() }} 格</text>
            <text [attr.x]="n() * cell + cell + 6" [attr.y]="box() - (n() * cell) / 2" class="arm start">右排 {{ n() }} 格</text>
            <text [attr.x]="n() * cell + cell + 6" [attr.y]="topArmY() + cell / 2 - 1" class="arm start">角落 1</text>
          </svg>

          <div class="ladder" aria-label="奇數依序">
            @for (o of ladder(); track o.k) {
              <span class="pf-num" [class.used]="o.used" [class.next]="!o.used">{{ o.v }}</span>
            }
          </div>
          <p class="pf-note center">
            實心的奇數已經在正方形裡（{{ n() }} 個，合計 {{ n() * n() }}）；虛線框是下一個。每個比前一個多 2。
          </p>
          <div class="pf-row center">
            <button type="button" class="pf-btn" [disabled]="choice() !== 'why' || n() >= max" (click)="grow()">補上虛線這一圈</button>
            <button type="button" class="pf-btn ghost" [disabled]="choice() !== 'why' || n() === 1" (click)="reset()">回到 1 × 1</button>
          </div>
        </figure>

        <figure class="view">
          <figcaption>任何一個 n：<b class="pf-num">{{ label() }} × {{ label() }}</b></figcaption>
          <svg viewBox="0 0 340 356" role="img" aria-label="抽象的 n 乘 n 正方形，加上上排 n 格、右排 n 格和角落 1 格，成為 n 加 1 的正方形">
            <rect x="30" y="62" width="240" height="240" class="t-square" />
            <rect x="30" y="30" width="240" height="28" class="t-l" />
            <rect x="274" y="62" width="28" height="240" class="t-l" />
            <rect x="274" y="30" width="28" height="28" class="t-l corner" />
            <text x="150" y="186" class="t-big" [style.font-size.px]="bigFs()">{{ label() }} × {{ label() }}</text>
            <text x="150" y="45" class="t-small">{{ label() }} 格</text>
            <text x="288" y="186" class="t-small" transform="rotate(90 288 186)">{{ label() }} 格</text>
            <text x="288" y="45" class="t-small">1</text>
            <line x1="30" y1="318" x2="302" y2="318" class="t-dim" />
            <line x1="30" y1="312" x2="30" y2="324" class="t-dim" />
            <line x1="302" y1="312" x2="302" y2="324" class="t-dim" />
            <text x="166" y="340" class="t-small">邊長 {{ labelPlusOne() }}</text>
          </svg>
          <p class="eq pf-num">要補 {{ label() }} + {{ label() }} + 1 = <b>{{ twoNPlusOne() }}</b> 格</p>
          <p class="eq pf-num">第 {{ labelPlusOne() }} 個奇數 = <b>{{ twoNPlusOne() }}</b></p>
          <p class="pf-note center">沒有寫 n 是多少，兩行照樣相等。</p>
        </figure>
      </div>
    </section>
  `,
})
export class SceneEveryNComponent {
  private readonly progress = inject(LearnProgressService);

  readonly max = MAX_N;
  readonly cell = CELL;
  readonly table = [1, 2, 3, 4].map((n) => ({ n, terms: this.termsFor(n) }));

  readonly choice = signal<'more' | 'why' | null>(null);
  readonly n = signal(3);
  readonly d1 = signal('');
  readonly d2 = signal('');
  readonly ok1 = signal(false);
  readonly ok2 = signal(false);
  readonly hint1 = signal('');
  readonly hint2 = signal('');
  readonly matchedAt = signal(0);
  readonly matched = computed(() => this.ok1() && this.ok2());
  readonly answer = signal<'used' | 'not' | null>(null);
  readonly draft = signal('');
  readonly attackN = signal<number | null>(null);

  /** Canvas grows with the square (never below 4 cells) and always has room for the pending ring. */
  readonly boxCells = computed(() => Math.max(4, this.n() + 1));
  readonly box = computed(() => this.boxCells() * CELL);
  readonly topArmY = computed(() => this.box() - (this.n() + 1) * CELL);
  /** Centred over the top arm, but never so far left that the label leaves the canvas. */
  readonly topLabelX = computed(() => Math.max((this.n() * CELL) / 2, 32));

  readonly validDraft = computed(() => {
    const v = Number(this.draft().trim().replace(/,/g, ''));
    return this.draft().trim() !== '' && Number.isSafeInteger(v) && v >= 1;
  });

  readonly label = computed(() => {
    const a = this.attackN();
    return a === null ? 'n' : this.fmt(a);
  });
  readonly labelPlusOne = computed(() => {
    const a = this.attackN();
    return a === null ? 'n + 1' : this.fmt(a + 1);
  });
  readonly twoNPlusOne = computed(() => {
    const a = this.attackN();
    return a === null ? '2n + 1' : this.fmt(2 * a + 1);
  });
  readonly bigFs = computed(() => {
    const len = this.label().length * 2 + 3;
    return Math.max(11, Math.min(26, 220 / (len * 0.62)));
  });

  /** Square anchored bottom-left; ring k = max(row, col) + 1. Each ring's corner shows its size 2k − 1. */
  readonly cells = computed(() => {
    const n = this.n();
    const box = this.box();
    const out: { x: number; y: number; cls: string; label: string }[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const ring = Math.max(r, c) + 1;
        out.push({
          x: c * CELL,
          y: box - (r + 1) * CELL,
          cls: ring % 2 ? 'c-odd' : 'c-even',
          label: r === c ? String(2 * ring - 1) : '',
        });
      }
    }
    return out;
  });

  readonly pending = computed(() => {
    const n = this.n();
    const box = this.box();
    const out: { x: number; y: number; corner: boolean }[] = [];
    for (let c = 0; c <= n; c++) out.push({ x: c * CELL, y: box - (n + 1) * CELL, corner: c === n });
    for (let r = 0; r < n; r++) out.push({ x: n * CELL, y: box - (r + 1) * CELL, corner: false });
    return out;
  });

  readonly ladder = computed(() =>
    Array.from({ length: this.n() + 1 }, (_, i) => ({ k: i + 1, v: 2 * i + 1, used: i < this.n() })),
  );

  termsFor(n: number): string {
    const odds = Array.from({ length: n }, (_, i) => 2 * i + 1);
    return n <= 5 ? odds.join(' + ') : `1 + 3 + 5 + … + ${2 * n - 1}`;
  }

  grow(): void {
    if (this.n() < MAX_N) this.n.update((v) => v + 1);
    this.clearAnswers();
  }

  reset(): void {
    this.n.set(1);
    this.clearAnswers();
  }

  /** The two questions are about the current n; once n changes, unconfirmed answers no longer apply. */
  private clearAnswers(): void {
    if (this.matched()) return;
    this.d1.set('');
    this.d2.set('');
    this.ok1.set(false);
    this.ok2.set(false);
    this.hint1.set('');
    this.hint2.set('');
  }

  check(ev: Event): void {
    ev.preventDefault();
    const n = this.n();
    const want = 2 * n + 1;
    const a1 = Number(this.d1().trim());
    const a2 = Number(this.d2().trim());
    if (!this.ok1()) {
      if (a1 === want) {
        this.ok1.set(true);
        this.hint1.set('');
      } else {
        this.hint1.set(`數數右邊的虛線：上排有 ${n} 格、右排有 ${n} 格，還有角落 1 格。`);
      }
    }
    if (!this.ok2()) {
      if (a2 === want) {
        this.ok2.set(true);
        this.hint2.set('');
      } else {
        this.hint2.set(`奇數是 1、3、5、7……每個比前一個多 2。最後加進去的是 ${2 * n - 1}，下一個呢？`);
      }
    }
    if (this.ok1() && this.ok2()) this.matchedAt.set(n);
  }

  attack(ev: Event): void {
    ev.preventDefault();
    if (!this.validDraft()) return;
    this.attackN.set(Number(this.draft().trim().replace(/,/g, '')));
    this.progress.markCompleted('proofs-ch1', '3');
  }

  fmt(v: number): string {
    return v.toLocaleString('en-US');
  }
}
