import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { eq, evalExpr, fmtQ, isInt, mul, paren, parseExpr, q, readNumber, sgn } from './ch2-expr';

type Tone = 'good' | 'bad' | 'you';
type Naming = 'same' | 'diff';

const ODDS = [-5, -3, -1, 1, 3, 5, 7];
/** Adversary pairs (k, m); the first one has k ≠ m so a one-name answer fails at once. */
const WORLDS: [number, number][] = [
  [1, 3], [2, -1], [0, 0], [5, 2], [-3, 4], [1, 1], [4, -6], [7, 9], [-2, -5], [3, 0], [6, 1], [-4, 2],
];

@Component({
  selector: 'app-pf-two-names',
  standalone: true,
  styleUrl: './scene-two-names.component.scss',
  template: `
    <section class="pf-scene">
      <div class="pf-col">
        <p class="pf-kicker">4 / 5 · 名字</p>
        <h1 class="pf-title">兩個已知，<br />兩個名字。</h1>

        <div class="pf-slip">
          <small>陳述</small>
          <p>兩個奇數相加，一定是偶數。</p>
          @if (built()) {
            <div class="pf-seal proved stamp">證明<span>對所有奇數</span></div>
          } @else {
            <div class="pf-seal open">未定</div>
          }
        </div>

        <form class="pf-col tight" (submit)="submitExample($event)">
          <p class="pf-q">先挑一組例子放在心裡當參考：哪兩個奇數？</p>
          <div class="pf-row ex">
            <input class="pf-input" inputmode="numeric" autocomplete="off" aria-label="第一個奇數 a" [value]="exA()" (input)="exA.set($any($event.target).value)" [disabled]="!!example()" />
            <span class="plus">+</span>
            <input class="pf-input" inputmode="numeric" autocomplete="off" aria-label="第二個奇數 b" [value]="exB()" (input)="exB.set($any($event.target).value)" [disabled]="!!example()" />
            @if (!example()) {
              <button type="submit" class="pf-btn primary">就這組</button>
            }
          </div>
          @if (exMsg(); as m) {
            <p class="pf-feedback" [class.bad]="m.tone === 'bad'" [class.you]="m.tone === 'you'" [class.good]="m.tone === 'good'" role="status">{{ m.text }}</p>
          }
        </form>

        @if (example() && !expandedB()) {
          <p class="pf-p">在右邊依序展開兩個已知。</p>
        }

        @if (expandedB()) {
          <p class="pf-q">從「b 是奇數」拿到的整數，也可以叫 k 嗎？</p>
          <div class="pf-row">
            <button type="button" class="pf-btn" [class.picked]="naming() === 'same'" [disabled]="naming() === 'diff'" (click)="name('same')">可以，也叫 k</button>
            <button type="button" class="pf-btn" [class.picked]="naming() === 'diff'" [disabled]="naming() === 'diff'" (click)="name('diff')">不行，要換一個名字</button>
          </div>
          @if (naming() === 'same') {
            <p class="pf-feedback bad">
              如果也叫 k，那 b = 2k + 1，就跟 a 一模一樣。你等於偷偷假設了 a = b。看右邊的格子：這種寫法只談到對角線上那幾組，你挑的
              {{ example()!.a }} + {{ example()!.b }} 根本不在裡面。
            </p>
            <div class="pf-row">
              <button type="button" class="pf-btn primary" (click)="name('diff')">換一個名字</button>
            </div>
          }
          @if (naming() === 'diff') {
            <p class="pf-feedback good">
              對。用了兩次定義，就各拿到一個整數。它們可能不一樣，所以要用不同的名字：b = 2m + 1。每一組 a、b，都有自己的 k 和 m。
            </p>
          }
        }

        @if (naming() === 'diff' && !built()) {
          <p class="pf-p">現在展開目標「a + b 是偶數」，用 k 和 m 造出 □。</p>
        }

        @if (built()) {
          <p class="pf-feedback good pf-rise">
            你的例子 {{ example()!.a }} + {{ example()!.b }}：k = {{ exK() }}，m = {{ exM() }}，□ = {{ exBox() }}，2 × {{ exBox() }} =
            {{ example()!.a + example()!.b }}，符合定義。不過讓陳述成立的不是這個例子，而是右邊那一行展開。
          </p>
          <details class="pf-why">
            <summary>為什麼挑 1 + 1 不夠好？</summary>
            <div>
              <p>1 + 1 的兩個數一樣，k 和 m 都是 0。在這個例子裡，「兩個名字」和「一個名字」看起來沒差，2k 那一項也直接消失了。</p>
              <p>挑例子時，要讓你想分清楚的東西真的不一樣，例如 3 + 5 的 k = 1、m = 2。例子太特別，會把錯誤的寫法也包庇過去。</p>
            </div>
          </details>
          <div class="pf-takeaway reveal">
            <small>帶走這一句</small>
            <p>每用一次定義，就拿到一個新名字。<br />用同一個名字，等於偷偷假設它們相等。</p>
          </div>
        }
      </div>

      <div class="pf-stage pf-panel" [class.idle]="!example()">
        <div class="pf-board">
          <section aria-label="已知">
            <h3>已知</h3>
            <div class="pf-stmt">
              <span>a 是奇數</span>
              @if (!expandedA()) {
                <button type="button" class="pf-btn small" [disabled]="!example()" (click)="expandedA.set(true)">展開定義</button>
              }
            </div>
            @if (expandedA()) {
              <div class="pf-obj got pf-rise">
                <span class="pf-tag">已知「a 是奇數」</span>
                <div><b>k</b>　整數</div>
                <div>a = 2k + 1</div>
              </div>
            }
            <div class="pf-stmt">
              <span>b 是奇數</span>
              @if (!expandedB()) {
                <button type="button" class="pf-btn small" [disabled]="!expandedA()" (click)="expandedB.set(true)">展開定義</button>
              }
            </div>
            @if (expandedB()) {
              <div class="pf-obj got pf-rise" [class.warn]="naming() === 'same'">
                <span class="pf-tag">已知「b 是奇數」</span>
                @if (naming() === 'diff') {
                  <div><b>m</b>　整數</div>
                  <div>b = 2m + 1</div>
                } @else if (naming() === 'same') {
                  <div><b>k</b>？　又是 k</div>
                  <div>b = 2k + 1 = a ？</div>
                } @else {
                  <div><b>？</b>　整數</div>
                  <div>b = 2 × ？ + 1</div>
                }
              </div>
            }
          </section>

          <section aria-label="目標">
            <h3>目標</h3>
            <div class="pf-stmt">
              <span>a + b 是偶數</span>
              @if (built()) {
                <span class="pf-seal mini proved">證明</span>
              } @else if (!goalOpen()) {
                <button type="button" class="pf-btn small" [disabled]="naming() !== 'diff'" (click)="goalOpen.set(true)">展開定義</button>
              }
            </div>
            @if (goalOpen() && !built()) {
              <form class="pf-col tight pf-rise" (submit)="check($event)">
                <p class="pf-note">要造出整數 □，使</p>
                <div class="pf-eqn">
                  <span>a + b = 2 × (</span>
                  <input class="pf-input wide" autocomplete="off" spellcheck="false" aria-label="□ 的式子，用 k 和 m 寫" [value]="draft()" (input)="draft.set($any($event.target).value)" />
                  <span>)</span>
                </div>
                <div class="pf-row"><button type="submit" class="pf-btn primary small">檢查</button></div>
                @if (msg(); as m) {
                  <p class="pf-feedback bad" role="status">{{ m }}</p>
                }
              </form>
            }
            @if (built(); as ans) {
              <div class="pf-obj made">
                <span class="pf-tag">要證「a + b 是偶數」</span>
                <div>□ = {{ ans }}</div>
              </div>
              <p class="reason">
                <small>理由，對每一組 k、m 都成立</small>
                2 × ({{ ans }}) = 2k + 2m + 2 = (2k + 1) + (2m + 1) = a + b
              </p>
            }
          </section>
        </div>

        @if (naming()) {
          <figure class="grid-fig pf-rise">
            <figcaption>
              <span>這個寫法談到了哪些組合？</span>
              <span class="pf-row">
                <button type="button" class="pf-btn small" [class.picked]="view() === 'same'" (click)="view.set('same')">都叫 k</button>
                <button type="button" class="pf-btn small" [class.picked]="view() === 'diff'" (click)="view.set('diff')">k 和 m</button>
              </span>
            </figcaption>
            <div class="grid" role="img" [attr.aria-label]="gridLabel()">
              <span class="corner">b ＼ a</span>
              @for (a of odds; track a) {
                <span class="head pf-num">{{ s(a) }}</span>
              }
              @for (b of oddsDown; track b) {
                <span class="head pf-num">{{ s(b) }}</span>
                @for (a of odds; track a) {
                  <span class="cell" [class.on]="view() === 'diff' || a === b" [class.mine]="isMine(a, b)" [attr.title]="'a = ' + a + '，b = ' + b"></span>
                }
              }
            </div>
            <p class="pf-note">
              談到 <b class="pf-num">{{ coveredCount() }} / 49</b> 組。
              @if (view() === 'same') {
                只有 a = b 的對角線。
              } @else {
                全部都在。
              }
              畫面只是一小塊，真正的組合有無限多。
              @if (mineOutside()) {
                你的例子在畫面外。
              } @else {
                有框的那一格是你的例子。
              }
            </p>
          </figure>
        }
      </div>
    </section>
  `,
})
export class SceneTwoNamesComponent {
  private readonly progress = inject(LearnProgressService);

  readonly s = sgn;
  readonly odds = ODDS;
  readonly oddsDown = [...ODDS].reverse();

  readonly exA = signal('');
  readonly exB = signal('');
  readonly example = signal<{ a: number; b: number } | null>(null);
  readonly exMsg = signal<{ tone: Tone; text: string } | null>(null);
  readonly expandedA = signal(false);
  readonly expandedB = signal(false);
  readonly naming = signal<Naming | null>(null);
  readonly view = signal<Naming>('diff');
  readonly goalOpen = signal(false);
  readonly draft = signal('');
  readonly msg = signal<string | null>(null);
  readonly built = signal<string | null>(null);
  private readonly builtNode = signal<ReturnType<typeof parseExpr> | null>(null);

  readonly coveredCount = computed(() => (this.view() === 'diff' ? 49 : 7));
  readonly gridLabel = computed(() =>
    this.view() === 'diff' ? '7 乘 7 的組合格子，全部 49 格都被談到' : '7 乘 7 的組合格子，只有對角線 7 格被談到',
  );
  readonly mineOutside = computed(() => {
    const e = this.example();
    return !!e && !(ODDS.includes(e.a) && ODDS.includes(e.b));
  });
  readonly exK = computed(() => sgn(((this.example()?.a ?? 1) - 1) / 2));
  readonly exM = computed(() => sgn(((this.example()?.b ?? 1) - 1) / 2));
  readonly exBox = computed(() => {
    const e = this.example();
    const p = this.builtNode();
    if (!e || !p?.ok) return '';
    const v = evalExpr(p.node, { k: q((e.a - 1) / 2), m: q((e.b - 1) / 2), a: q(e.a), b: q(e.b) });
    return v ? fmtQ(v) : '';
  });

  isMine(a: number, b: number): boolean {
    const e = this.example();
    return !!e && e.a === a && e.b === b;
  }

  submitExample(ev: Event): void {
    ev.preventDefault();
    if (this.example()) return;
    const ra = readNumber(this.exA());
    const rb = readNumber(this.exB());
    if (!ra.ok || !rb.ok) {
      this.exMsg.set({ tone: 'bad', text: '兩格都要填一個整數。' });
      return;
    }
    for (const r of [ra.v, rb.v]) {
      if (!isInt(r) || Math.abs(r.n) % 2 !== 1) {
        this.exMsg.set({ tone: 'bad', text: `${fmtQ(r)} 不是奇數。` });
        return;
      }
    }
    const a = ra.v.n;
    const b = rb.v.n;
    if (a === b) {
      this.exMsg.set({
        tone: 'bad',
        text: `這組的兩個數一樣。等一下拿到的兩個整數也會一樣，例子就藏住了「兩個奇數可以不同」這件事。換一組不一樣的。`,
      });
      return;
    }
    this.example.set({ a, b });
    this.exMsg.set({
      tone: 'you',
      text: `${sgn(a)} = 2 × ${paren(q((a - 1) / 2))} + 1，${sgn(b)} = 2 × ${paren(q((b - 1) / 2))} + 1。兩個數不同，乘在 2 後面的整數也不同。記住這一點。`,
    });
  }

  name(n: Naming): void {
    this.naming.set(n);
    this.view.set(n);
  }

  check(ev: Event): void {
    ev.preventDefault();
    const p = parseExpr(this.draft(), ['k', 'm', 'a', 'b']);
    if (!p.ok) {
      this.msg.set(p.msg);
      return;
    }
    for (const [kv, mv] of WORLDS) {
      const a = 2 * kv + 1;
      const b = 2 * mv + 1;
      const v = evalExpr(p.node, { k: q(kv), m: q(mv), a: q(a), b: q(b) });
      if (!v) {
        this.msg.set(`k = ${sgn(kv)}、m = ${sgn(mv)} 時，這個式子要除以 0。`);
        return;
      }
      const sum = q(a + b);
      const rhs = mul(q(2), v);
      if (!eq(sum, rhs)) {
        const usesSecond = p.vars.includes('m') || p.vars.includes('b');
        const prefix = usesSecond ? '' : '你的 □ 沒有用到 m。但 b 不一定等於 a。';
        this.msg.set(
          `${prefix}試 a = ${sgn(a)}（k = ${sgn(kv)}）、b = ${sgn(b)}（m = ${sgn(mv)}）：左邊 a + b = ${sgn(a + b)}；右邊 2 × ${paren(v)} = ${fmtQ(rhs)}。兩邊不一樣。`,
        );
        return;
      }
      if (!isInt(v)) {
        this.msg.set(`k = ${sgn(kv)}、m = ${sgn(mv)} 時，□ = ${fmtQ(v)} 不是整數。`);
        return;
      }
    }
    this.builtNode.set(p);
    this.built.set(this.draft().trim());
    this.msg.set(null);
    this.progress.markCompleted('proofs-ch2', '4');
  }
}
