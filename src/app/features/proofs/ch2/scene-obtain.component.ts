import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { Q, add, eq, evalExpr, fmtQ, isInt, mul, paren, parseExpr, q, readNumber, sgn } from './ch2-expr';

type Tone = 'good' | 'bad' | 'you';
interface Msg { tone: Tone; text: string }

interface Target {
  id: 'plus6' | 'sq';
  stmt: string;
  /** Left side of the goal equation, in x. */
  goal: string;
  mult: number;
  value: (x: Q) => Q;
  /** What mult × (answer) expands to, ending at the goal. */
  reason: string;
}

const PLUS6: Target = { id: 'plus6', stmt: 'x + 6 是偶數', goal: 'x + 6', mult: 2, value: (x) => add(x, q(6)), reason: '2k + 6 = x + 6' };
const SQ: Target = { id: 'sq', stmt: '4 ∣ x²', goal: 'x²', mult: 4, value: (x) => mul(x, x), reason: '4k² = (2k)² = x²' };

/** Values of k tried in order when checking a formula; the first one breaks a constant answer such as 5. */
const WORLDS = [5, -2, 0, 1, 3, -7, 11, 2];

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶' };
/** Display form of a typed formula: k^2 → k², spaced binary + and −, * → ×. */
const pretty = (s: string) =>
  s
    .trim()
    .replace(/\s*\^\s*([0-6])/g, (_, d: string) => SUP[d])
    .replace(/([^\s(*/+\-−])\s*([+\-−])\s*/g, (_, a: string, op: string) => `${a} ${op === '+' ? '+' : '−'} `)
    .replace(/\s*\*\s*/g, ' × ');

@Component({
  selector: 'app-pf-obtain',
  standalone: true,
  styleUrl: './scene-obtain.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">3 / 5 · 工具</p>
        <h1 class="pf-title">反過來：<br />已知它是偶數。</h1>
        <p class="pf-lede">
          第 1、2 幕，題目問「0 是偶數嗎？」「3 整除 0 嗎？」，k 要你自己找。這一幕反過來：題目一開始就說 <b>x 是偶數</b>，但不說 x 是多少。
        </p>

        <!-- 1 · x is unknown -->
        <form class="pf-col tight" (submit)="submitGuess($event)">
          <label class="pf-q" for="pf-guess">x 可能是多少？</label>
          <div class="pf-row">
            <input id="pf-guess" class="pf-input" inputmode="numeric" autocomplete="off" [value]="guessDraft()" (input)="guessDraft.set($any($event.target).value)" [disabled]="g() !== null" />
            @if (g() === null) {
              <button type="submit" class="pf-btn primary">就這個</button>
            }
          </div>
          @if (guessMsg(); as m) {
            <p class="pf-feedback" [class.bad]="m.tone === 'bad'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
          }
        </form>

        <!-- 2 · what the given hands you -->
        @if (g() !== null) {
          <div class="pf-col tight pf-rise">
            <p class="pf-q">那你知道什麼？</p>
            <div class="pf-def">
              <small>偶數的定義（第 1 幕）</small>
              <p>x 是偶數 ⇔ 有一個整數 <span class="pf-k">k</span>，使 x = 2 × <span class="pf-k">k</span></p>
            </div>
            <p class="pf-p">題目說 x 是偶數，定義就保證<b>這樣的 k 一定有</b>。先用你挑的 x 找找看：</p>
            <form class="pf-col tight" (submit)="checkK($event)">
              <div class="pf-eqn">
                <span>{{ sgn(g()!) }} = 2 ×</span>
                <input class="pf-input" inputmode="numeric" autocomplete="off" aria-label="k" [value]="kDraft()" (input)="kDraft.set($any($event.target).value)" [disabled]="kDone()" />
                @if (!kDone()) {
                  <button type="submit" class="pf-btn primary small">檢查</button>
                }
              </div>
              @if (kMsg(); as m) {
                <p class="pf-feedback" [class.bad]="m.tone === 'bad'" [class.good]="m.tone === 'good'" role="status">{{ m.text }}</p>
              }
            </form>
          </div>
        }

        @if (kDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">真正的 x 是哪一個，你不知道，所以 k 是多少你也不知道。但有兩件事一定對，把它們記在一個框裡：</p>
            <div class="pf-obj got">
              <span class="pf-tag">從「x 是偶數」</span>
              <div>k 是整數</div>
              <div>x = 2k</div>
              <small>k 是多少不是你選的：x 是多少，k 就是它的一半。</small>
            </div>
            <p class="pf-note">
              這種<b>左邊加粗的框</b>裝的是「拿到的」：題目給你的東西，可以直接拿來用。等一下會出現<b>藍色方框</b>，裝的是「你造的」。
            </p>
          </div>

          <!-- 3 · first goal -->
          <div class="pf-col tight pf-rise">
            <div class="pf-stmt goal">
              <span><small>目標</small>x + 6 是偶數</span>
              <span class="pf-seal mini" [class.open]="!ans1()" [class.proved]="!!ans1()" [class.stamp]="!!ans1()">{{ ans1() ? '證明' : '未定' }}</span>
            </div>
            <p class="pf-p">
              怎麼證？回到定義：得找一個<b>整數</b>填進 □，讓 <span class="pf-num">x + 6 = 2 × □</span> 成立。□ 就是一個空格，跟第 1 幕替 0、−6 找 k 一樣，只是這次的整數要<b>你自己造</b>。
            </p>
            <p class="pf-p">先拿三個具體的 x 試：</p>
            <form class="pf-col tight" (submit)="checkRows($event)">
              <table class="pf-table rows">
                <tr><th>x</th><th>k</th><th>x + 6</th><th>＝ 2 × □</th></tr>
                @for (x of xs(); track x; let i = $index) {
                  <tr>
                    <td class="pf-num">{{ sgn(x) }}</td>
                    <td class="pf-num">{{ sgn(x / 2) }}</td>
                    <td class="pf-num">{{ sgn(x + 6) }}</td>
                    <td class="slot">
                      2 ×
                      <input class="pf-input" inputmode="numeric" autocomplete="off" [attr.aria-label]="'x = ' + sgn(x) + ' 時的 □'" [value]="rowDrafts()[i]" (input)="setRow(i, $any($event.target).value)" [disabled]="rowsDone()" />
                    </td>
                  </tr>
                }
              </table>
              @if (!rowsDone()) {
                <div class="pf-row"><button type="submit" class="pf-btn primary small">檢查三列</button></div>
              }
              @if (rowsMsg(); as m) {
                <p class="pf-feedback" [class.bad]="m.tone === 'bad'" role="status">{{ m.text }}</p>
              }
            </form>
          </div>
        }

        @if (rowsDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              三列都對。看 k 和 □：{{ pairs() }}。<b>□ 跟 k 有什麼關係？</b>用 k 寫出 □，讓它不管 x 是哪個偶數都對。
            </p>
            @if (!ans1()) {
              <form class="pf-col tight" (submit)="checkGeneral($event, PLUS6)">
                <div class="pf-eqn">
                  <span>x + 6 = 2 × (</span>
                  <input class="pf-input wide" autocomplete="off" spellcheck="false" aria-label="□，用 k 寫" [value]="draft1()" (input)="draft1.set($any($event.target).value)" />
                  <span>)</span>
                  <button type="submit" class="pf-btn primary small">檢查</button>
                </div>
                <p class="pf-note">可以打式子，例如 <span class="pf-num">2k</span>、<span class="pf-num">k-1</span>。</p>
                @if (msg1(); as m) {
                  <p class="pf-feedback bad" role="status">{{ m.text }}</p>
                }
              </form>
            } @else {
              <div class="pf-obj made">
                <span class="pf-tag">給「x + 6 是偶數」</span>
                <div>□ = {{ pretty(ans1()!) }}</div>
                <small>{{ usedX1() ? '這樣寫也對；寫成 k 的式子，比較一眼看得出它是整數。' : 'k 是整數，所以這個 □ 也是整數。' }}</small>
              </div>
              <p class="reason"><small>理由</small>2 × ({{ pretty(ans1()!) }}) = 2k + 6 = x + 6</p>
              <p class="pf-note">
                上面三列只是<b>線索</b>，幫你猜出 □。真正的<b>理由</b>是這一行：它只用到框裡的 x = 2k，所以 x 是哪個偶數都成立。
              </p>
            }
          </div>
        }

        <!-- 4 · second goal, same given -->
        @if (ans1()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-stmt goal">
              <span><small>再一個目標</small>4 ∣ x²</span>
              <span class="pf-seal mini" [class.open]="!ans2()" [class.proved]="!!ans2()" [class.stamp]="!!ans2()">{{ ans2() ? '證明' : '未定' }}</span>
            </div>
            <p class="pf-p">
              用第 2 幕的定義：4 ∣ x² 的意思是 <span class="pf-num">x² = 4 × □</span>，□ 是整數。手上能用的還是同一個框：k 是整數，x = 2k。
            </p>
            <form class="pf-col tight" (submit)="checkSqRow($event)">
              <p class="pf-note">先用你的 x = {{ sgn(g()!) }}（k = {{ sgn(g()! / 2) }}）：</p>
              <div class="pf-eqn">
                <span>{{ sgn(g()! * g()!) }} = 4 ×</span>
                <input class="pf-input" inputmode="numeric" autocomplete="off" aria-label="□" [value]="sqRowDraft()" (input)="sqRowDraft.set($any($event.target).value)" [disabled]="sqRowDone()" />
                @if (!sqRowDone()) {
                  <button type="submit" class="pf-btn primary small">檢查</button>
                }
              </div>
              @if (sqRowMsg(); as m) {
                <p class="pf-feedback bad" role="status">{{ m.text }}</p>
              }
            </form>

            @if (sqRowDone()) {
              @if (!ans2()) {
                <form class="pf-col tight pf-rise" (submit)="checkGeneral($event, SQ)">
                  <p class="pf-note">現在用 k 寫，讓它對每個偶數 x 都對：</p>
                  <div class="pf-eqn">
                    <span>x² = 4 × (</span>
                    <input class="pf-input wide" autocomplete="off" spellcheck="false" aria-label="□，用 k 寫" [value]="draft2()" (input)="draft2.set($any($event.target).value)" />
                    <span>)</span>
                    <button type="submit" class="pf-btn primary small">檢查</button>
                  </div>
                  <p class="pf-note">次方用 ^，例如 <span class="pf-num">k^3</span>。</p>
                  @if (msg2(); as m) {
                    <p class="pf-feedback bad" role="status">{{ m.text }}</p>
                  }
                  @if (tries2() > 0) {
                    <p class="pf-feedback" role="note">提示：x = 2k，所以 x² = (2k) × (2k)。先把它乘開。</p>
                  }
                </form>
              } @else {
                <div class="pf-obj made pf-rise">
                  <span class="pf-tag">給「4 ∣ x²」</span>
                  <div>□ = {{ pretty(ans2()!) }}</div>
                  <small>{{ usedX2() ? '這樣寫也對；寫成 k 的式子，比較一眼看得出它是整數。' : 'k 是整數，所以這個 □ 也是整數。' }}</small>
                </div>
                <p class="reason"><small>理由</small>4 × ({{ pretty(ans2()!) }}) = 4k² = (2k)² = x²</p>
              }
            }
          </div>
        }

        @if (ans2()) {
          <div class="two-dir pf-rise">
            <div class="pf-obj got">
              <span class="pf-tag">已知「x 是偶數」</span>
              <p>你<b>拿到</b>一個整數 k，使 x = 2k。<br />k 是多少不是你選的。</p>
            </div>
            <div class="pf-obj made">
              <span class="pf-tag">要證「x + 6 是偶數」</span>
              <p>你得<b>造出</b>一個整數填進 □。<br />用拿到的 k 來寫。</p>
            </div>
          </div>
          <div class="pf-takeaway reveal">
            <small>帶走這一句</small>
            <p>要證「是偶數」，你得造出一個整數；<br />已知「是偶數」，你就拿到一個整數。</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneObtainComponent {
  private readonly progress = inject(LearnProgressService);

  readonly PLUS6 = PLUS6;
  readonly SQ = SQ;
  readonly sgn = sgn;
  readonly pretty = pretty;

  readonly guessDraft = signal('');
  readonly g = signal<number | null>(null);
  readonly guessMsg = signal<Msg | null>(null);

  readonly kDraft = signal('');
  readonly kDone = signal(false);
  readonly kMsg = signal<Msg | null>(null);

  readonly rowDrafts = signal<string[]>(['', '', '']);
  readonly rowsDone = signal(false);
  readonly rowsMsg = signal<Msg | null>(null);

  readonly draft1 = signal('');
  readonly msg1 = signal<Msg | null>(null);
  readonly ans1 = signal<string | null>(null);
  readonly usedX1 = signal(false);

  readonly sqRowDraft = signal('');
  readonly sqRowDone = signal(false);
  readonly sqRowMsg = signal<Msg | null>(null);

  readonly draft2 = signal('');
  readonly msg2 = signal<Msg | null>(null);
  readonly ans2 = signal<string | null>(null);
  readonly usedX2 = signal(false);
  readonly tries2 = signal(0);

  /** The learner's x first, then two other even numbers. */
  readonly xs = computed(() => {
    const g = this.g();
    if (g === null) return [];
    return [g, ...[-10, 0, 6].filter((v) => v !== g)].slice(0, 3);
  });

  readonly pairs = computed(() =>
    this.xs()
      .map((x) => `k = ${sgn(x / 2)} 時 □ = ${sgn((x + 6) / 2)}`)
      .join('，'),
  );

  submitGuess(ev: Event): void {
    ev.preventDefault();
    if (this.g() !== null) return;
    const r = readNumber(this.guessDraft());
    if (!r.ok) {
      this.guessMsg.set({ tone: 'bad', text: r.msg });
      return;
    }
    if (!isInt(r.v)) {
      this.guessMsg.set({ tone: 'bad', text: `${fmtQ(r.v)} 不是整數，更不會是偶數。` });
      return;
    }
    if (Math.abs(r.v.n) % 2 === 1) {
      this.guessMsg.set({ tone: 'bad', text: `${sgn(r.v.n)} 不是偶數。題目說 x 是偶數。` });
      return;
    }
    if (Math.abs(r.v.n) > 1000) {
      this.guessMsg.set({ tone: 'bad', text: '可以，但挑小一點的，等一下要拿它來算。' });
      return;
    }
    const v = r.v.n;
    this.g.set(v);
    const others = [-10, 0, 1000].filter((o) => o !== v).slice(0, 2).map(sgn).join('、');
    this.guessMsg.set({
      tone: 'you',
      text: `有可能是 ${sgn(v)}。但也可能是 ${others}，或任何一個偶數。題目沒說是哪一個，所以等一下不能假設 x = ${sgn(v)}。`,
    });
  }

  checkK(ev: Event): void {
    ev.preventDefault();
    const g = this.g()!;
    const r = readNumber(this.kDraft());
    if (!r.ok) {
      this.kMsg.set({ tone: 'bad', text: r.msg });
      return;
    }
    if (!eq(r.v, q(g / 2))) {
      this.kMsg.set({ tone: 'bad', text: `2 × ${paren(r.v)} = ${fmtQ(mul(q(2), r.v))}，不是 ${sgn(g)}。` });
      return;
    }
    this.kDone.set(true);
    const [, a, b] = this.xs();
    this.kMsg.set({
      tone: 'good',
      text: `對，x = ${sgn(g)} 時 k = ${sgn(g / 2)}。x 換了，k 就跟著換：x = ${sgn(a)} 時 k = ${sgn(a / 2)}，x = ${sgn(b)} 時 k = ${sgn(b / 2)}。`,
    });
  }

  setRow(i: number, v: string): void {
    this.rowDrafts.update((d) => d.map((s, j) => (j === i ? v : s)));
  }

  checkRows(ev: Event): void {
    ev.preventDefault();
    const xs = this.xs();
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const r = readNumber(this.rowDrafts()[i]);
      if (!r.ok) {
        this.rowsMsg.set({ tone: 'bad', text: `x = ${sgn(x)} 那一列：${r.msg}` });
        return;
      }
      if (!eq(mul(q(2), r.v), q(x + 6))) {
        this.rowsMsg.set({ tone: 'bad', text: `x = ${sgn(x)} 那一列：2 × ${paren(r.v)} = ${fmtQ(mul(q(2), r.v))}，不是 ${sgn(x + 6)}。` });
        return;
      }
    }
    this.rowsDone.set(true);
    this.rowsMsg.set(null);
  }

  checkSqRow(ev: Event): void {
    ev.preventDefault();
    const g = this.g()!;
    const r = readNumber(this.sqRowDraft());
    if (!r.ok) {
      this.sqRowMsg.set({ tone: 'bad', text: r.msg });
      return;
    }
    if (!eq(mul(q(4), r.v), q(g * g))) {
      this.sqRowMsg.set({ tone: 'bad', text: `4 × ${paren(r.v)} = ${fmtQ(mul(q(4), r.v))}，不是 ${sgn(g * g)}。` });
      return;
    }
    this.sqRowDone.set(true);
    this.sqRowMsg.set(null);
  }

  checkGeneral(ev: Event, t: Target): void {
    ev.preventDefault();
    const first = t.id === 'plus6';
    const draft = first ? this.draft1() : this.draft2();
    const setMsg = (text: string) => {
      (first ? this.msg1 : this.msg2).set({ tone: 'bad', text });
      if (!first) this.tries2.update((n) => n + 1);
    };

    const p = parseExpr(draft, ['k', 'x']);
    if (!p.ok) {
      setMsg(p.msg);
      return;
    }
    for (const kv of WORLDS) {
      const k = q(kv);
      const x = q(2 * kv);
      const v = evalExpr(p.node, { k, x });
      const at = `試 x = ${sgn(2 * kv)}（這時 k = ${sgn(kv)}）`;
      if (!v) {
        setMsg(`${at}：這個式子要除以 0。`);
        return;
      }
      const lhs = t.value(x);
      const rhs = mul(q(t.mult), v);
      if (!eq(lhs, rhs)) {
        const constant = p.vars.length === 0;
        const prefix = constant ? `你填的是固定的數 ${fmtQ(v)}，它最多只對一個 x 成立。` : '';
        const sub = constant ? '' : `${t.mult} × (${pretty(draft)}) = `;
        setMsg(`${prefix}${at}：左邊 ${t.goal} = ${fmtQ(lhs)}；右邊 ${sub}${t.mult} × ${paren(v)} = ${fmtQ(rhs)}。兩邊不一樣，所以這樣填不行。`);
        return;
      }
      if (!isInt(v)) {
        setMsg(`${at}：□ = ${fmtQ(v)}，不是整數。`);
        return;
      }
    }
    const ans = draft.trim();
    const usedX = p.vars.includes('x');
    if (first) {
      this.usedX1.set(usedX);
      this.ans1.set(ans);
      this.msg1.set(null);
    } else {
      this.usedX2.set(usedX);
      this.ans2.set(ans);
      this.msg2.set(null);
      this.progress.markCompleted('proofs-ch2', '3');
    }
  }
}
