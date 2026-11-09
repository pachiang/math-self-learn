import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { Q, add, div, eq, evalExpr, fmtQ, isInt, parseExpr, q, readNumber, sgn } from './ch2-expr';

type Tone = 'good' | 'bad' | 'you';

interface Known {
  id: string;
  label: string;
  r: Q;
  ok: string;
}
const KNOWN: Known[] = [
  { id: 'r075', label: '0.75', r: q(3, 4), ok: '「存在」只需要一組：6 / 8、−3 / −4 也都可以。' },
  { id: 'rneg2', label: '−2', r: q(-2), ok: '整數也是有理數：分母取 1 就行。' },
];

interface Goal {
  id: string;
  stmt: string;
  goal: string;
  value: (r: Q) => Q;
  reason: string;
}
const GOALS: Goal[] = [
  { id: 'half', stmt: 'r / 2 是有理數', goal: 'r / 2', value: (r) => div(r, q(2))!, reason: 'p / (2q) = (p / q) / 2 = r / 2' },
  { id: 'plus1', stmt: 'r + 1 是有理數', goal: 'r + 1', value: (r) => add(r, q(1)), reason: '(p + q) / q = p / q + 1 = r + 1' },
];

/** Adversary (p, q): includes a negative q and p = 0 on purpose. */
const WORLDS: [number, number][] = [
  [3, 4], [-5, 2], [7, -3], [0, 7], [1, 1], [-4, -6], [9, 5], [2, -9], [-1, 3], [6, 4],
];

const WHY = [
  {
    id: 'nz',
    label: '因為 q ≠ 0，乘上一個不是 0 的整數，還是不會變成 0',
    ok: true,
    text: '對。定義給你的是「q ≠ 0」，你造的新分母也得滿足「不是 0」，這一步就是用那個條件換來的。拿到的條件，造的時候派上用場。',
  },
  { id: 'pos', label: '因為 q 是正數', ok: false, text: '定義只說 q ≠ 0，沒說 q 是正的。2 / −3 也符合定義。' },
  {
    id: 'skip',
    label: '不用檢查，值算對就好',
    ok: false,
    text: '定義要的是「整數 p、q，而且 q ≠ 0」。你造的新分母也得滿足這一條，否則它不是定義要的東西。',
  },
];

@Component({
  selector: 'app-pf-rational',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './scene-rational.component.scss',
  template: `
    <section class="pf-scene">
      <div class="pf-col">
        <p class="pf-kicker">5 / 5 · 遷移</p>
        <h1 class="pf-title">新定義，<br />同一套動作。</h1>

        <div class="pf-def">
          <small>定義</small>
          <p>r 是有理數 ⇔ 存在整數 <span class="pf-k">p</span>、<span class="pf-k">q</span>，<b>q ≠ 0</b>，使 r = p / q。</p>
        </div>
        <p class="pf-p">這次要找的不是一個 k，而是兩個整數，外加一個條件。動作還是一樣：要證它，就造出來；已知它，就拿到。</p>

        @if (!knownDone()) {
          <p class="pf-q">先證明：替右邊的數造出 p 和 q。</p>
        } @else if (!goalsDone()) {
          <p class="pf-p">
            現在反過來：已知 r 是有理數。你拿到整數 p、q，而且 <b>q ≠ 0</b>。這個條件也是你拿到的東西之一，等一下會用到。
          </p>
          @if (curGoal(); as g) {
            <p class="pf-q">目標：{{ g.stmt }}</p>
            <p class="pf-p">在右邊用 p、q 寫出新的分子和分母。它們都得是整數，分母還不能是 0。</p>
          }
        }

        @if (askWhy()) {
          <p class="pf-q">你造的分母 {{ doneGoals()['half']?.den }}，為什麼一定不是 0？</p>
          <div class="why">
            @for (w of why; track w.id) {
              <button type="button" class="pf-btn" [class.picked]="whyPick() === w.id" [disabled]="whyOk()" (click)="whyPick.set(w.id)">{{ w.label }}</button>
            }
          </div>
          @if (whyChoice(); as w) {
            <p class="pf-feedback" [class.good]="w.ok" [class.bad]="!w.ok" role="status">{{ w.text }}</p>
          }
        }

        @if (allDone()) {
          <table class="pf-table summary pf-rise">
            <tr><th>定義</th><th>要證它：你得造出</th><th>已知它：你就拿到</th></tr>
            @for (row of summary; track row.def) {
              <tr>
                <td><b>{{ row.def }}</b></td>
                <td>{{ row.what }}</td>
                <td>{{ row.what }}</td>
              </tr>
            }
          </table>
          <p class="pf-p">兩欄的內容一字不差，差別只在<b>誰提供</b>：證明時由你造，已知時由定義交給你。</p>
          <div class="pf-takeaway reveal">
            <small>本章帶走這一句</small>
            <p>定義有兩個方向：<br />要證它，你得造出定義要的東西；<br />已知它，你就拿到那些東西。</p>
          </div>
          <p class="pf-note">
            下一章：定義讀懂了，接著讀句子之間的連接。「若…則」到底承諾了什麼？<a routerLink="/learn/proofs">第 3 章「若…則」是一個承諾</a>規畫中。
          </p>
        }
      </div>

      <div class="pf-stage pf-panel">
        @if (!knownDone()) {
          <div class="pf-items">
            @for (k of known; track k.id; let i = $index) {
              <button type="button" class="pf-item pf-num" [class.active]="i === activeKnown()" [disabled]="i > knownCount()" (click)="goKnown(i)">
                <span>{{ k.label }} 是有理數</span>
                <span class="pf-seal mini" [class.open]="!knownOk()[k.id]" [class.proved]="knownOk()[k.id]">{{ knownOk()[k.id] ? '證明' : '未定' }}</span>
              </button>
            }
          </div>
          @if (curKnown(); as k) {
            <form class="pf-col tight" (submit)="checkKnown($event)">
              <div class="pf-eqn frac-eqn">
                <span>{{ k.label }} =</span>
                <span class="frac">
                  <input class="pf-input" inputmode="numeric" autocomplete="off" placeholder="p" aria-label="分子 p" [value]="pDraft()" (input)="pDraft.set($any($event.target).value)" />
                  <input class="pf-input" inputmode="numeric" autocomplete="off" placeholder="q" aria-label="分母 q" [value]="qDraft()" (input)="qDraft.set($any($event.target).value)" />
                </span>
              </div>
              <div class="pf-row"><button type="submit" class="pf-btn primary">檢查</button></div>
              @if (msg(); as m) {
                <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" role="status">{{ m.text }}</p>
              }
            </form>
          }
        } @else {
          <div class="pf-board">
            <section aria-label="已知">
              <h3>已知</h3>
              <div class="pf-stmt"><span>r 是有理數</span></div>
              <div class="pf-obj got pf-rise">
                <span class="pf-tag">從「r 是有理數」</span>
                <div><b>p</b>、<b>q</b>　整數</div>
                <div><b>q ≠ 0</b></div>
                <div>r = p / q</div>
                <small>p、q 是多少不是你選的；q 也可能是負的。</small>
              </div>
            </section>
            <section aria-label="目標">
              <h3>目標</h3>
              @for (g of shownGoals(); track g.id) {
                <div class="tcard">
                  <div class="pf-stmt">
                    <span>{{ g.stmt }}</span>
                    @if (doneGoals()[g.id]) {
                      <span class="pf-seal mini proved">證明</span>
                    }
                  </div>
                  @if (!doneGoals()[g.id]) {
                    <form class="pf-col tight" (submit)="checkGoal($event, g)">
                      <p class="pf-note">要造出整數 □₁、□₂，□₂ ≠ 0，使</p>
                      <div class="pf-eqn frac-eqn">
                        <span>{{ g.goal }} =</span>
                        <span class="frac">
                          <input class="pf-input wide" autocomplete="off" spellcheck="false" aria-label="分子 □₁，用 p、q 寫" [value]="numDraft()" (input)="numDraft.set($any($event.target).value)" />
                          <input class="pf-input wide" autocomplete="off" spellcheck="false" aria-label="分母 □₂，用 p、q 寫" [value]="denDraft()" (input)="denDraft.set($any($event.target).value)" />
                        </span>
                      </div>
                      <div class="pf-row"><button type="submit" class="pf-btn primary small">檢查</button></div>
                      @if (msg(); as m) {
                        <p class="pf-feedback bad" role="status">{{ m.text }}</p>
                      }
                    </form>
                  } @else {
                    <div class="pf-obj made">
                      <span class="pf-tag">給「{{ g.stmt }}」</span>
                      <div>□₁ = {{ doneGoals()[g.id]!.num }}，□₂ = {{ doneGoals()[g.id]!.den }}</div>
                    </div>
                    <p class="reason">
                      <small>理由，對每一組 p、q 都成立</small>
                      □₁ / □₂ = {{ g.reason }}
                    </p>
                  }
                </div>
              }
            </section>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneRationalComponent {
  private readonly progress = inject(LearnProgressService);

  readonly known = KNOWN;
  readonly why = WHY;
  readonly summary = [
    { def: 'n 是偶數', what: '整數 k，使 n = 2k' },
    { def: 'a ∣ b', what: '整數 k，使 b = a × k' },
    { def: 'r 是有理數', what: '整數 p、q，q ≠ 0，使 r = p / q' },
  ];

  readonly activeKnown = signal(0);
  readonly knownOk = signal<Record<string, boolean>>({});
  readonly pDraft = signal('');
  readonly qDraft = signal('');
  readonly numDraft = signal('');
  readonly denDraft = signal('');
  readonly msg = signal<{ tone: Tone; text: string } | null>(null);
  readonly doneGoals = signal<Record<string, { num: string; den: string }>>({});
  readonly whyPick = signal<string | null>(null);

  readonly knownCount = computed(() => KNOWN.filter((k) => this.knownOk()[k.id]).length);
  readonly knownDone = computed(() => this.knownCount() === KNOWN.length);
  readonly curKnown = computed(() => KNOWN[this.activeKnown()] ?? null);
  readonly whyChoice = computed(() => WHY.find((w) => w.id === this.whyPick()) ?? null);
  readonly whyOk = computed(() => !!this.whyChoice()?.ok);
  /** The q ≠ 0 question sits between the two goals. */
  readonly askWhy = computed(() => !!this.doneGoals()['half']);
  readonly goalsUnlocked = computed(() => (this.doneGoals()['half'] ? (this.whyOk() ? 2 : 1) : 1));
  readonly shownGoals = computed(() => GOALS.slice(0, this.goalsUnlocked()));
  readonly curGoal = computed(() => this.shownGoals().find((g) => !this.doneGoals()[g.id]) ?? null);
  readonly goalsDone = computed(() => GOALS.every((g) => this.doneGoals()[g.id]));
  readonly allDone = computed(() => this.goalsDone() && this.whyOk());

  goKnown(i: number): void {
    this.activeKnown.set(i);
    this.pDraft.set('');
    this.qDraft.set('');
    this.msg.set(null);
  }

  checkKnown(ev: Event): void {
    ev.preventDefault();
    const k = this.curKnown();
    if (!k || this.knownOk()[k.id]) return;
    const rp = readNumber(this.pDraft());
    const rq = readNumber(this.qDraft());
    if (!rp.ok || !rq.ok) {
      this.msg.set({ tone: 'bad', text: 'p 和 q 兩格都要填。' });
      return;
    }
    if (!isInt(rp.v) || !isInt(rq.v)) {
      const bad = !isInt(rp.v) ? `p = ${fmtQ(rp.v)}` : `q = ${fmtQ(rq.v)}`;
      this.msg.set({ tone: 'bad', text: `${bad} 不是整數。定義要的是兩個整數。` });
      return;
    }
    if (rq.v.n === 0) {
      this.msg.set({ tone: 'bad', text: 'q ≠ 0 是定義的一部分：除以 0 根本不是一個數。' });
      return;
    }
    const v = div(rp.v, rq.v)!;
    if (!eq(v, k.r)) {
      this.msg.set({ tone: 'bad', text: `${fmtQ(rp.v)} / ${fmtQ(rq.v)} = ${fmtQ(v)}，不是 ${k.label}。` });
      return;
    }
    this.knownOk.update((m) => ({ ...m, [k.id]: true }));
    const next = KNOWN.findIndex((x) => !this.knownOk()[x.id]);
    if (next >= 0) {
      this.goKnown(next);
      this.msg.set({ tone: 'good', text: `${fmtQ(rp.v)} / ${fmtQ(rq.v)} = ${k.label}，兩個都是整數，分母不是 0。${k.ok} 下一個：${KNOWN[next].label}。` });
    } else {
      this.msg.set(null);
    }
  }

  checkGoal(ev: Event, g: Goal): void {
    ev.preventDefault();
    const pn = parseExpr(this.numDraft(), ['p', 'q', 'r']);
    const pd = parseExpr(this.denDraft(), ['p', 'q', 'r']);
    if (!pn.ok || !pd.ok) {
      this.msg.set({ tone: 'bad', text: !pn.ok ? `分子：${pn.msg}` : `分母：${(pd as { msg: string }).msg}` });
      return;
    }
    const usesR = pn.vars.includes('r') || pd.vars.includes('r');
    for (const [pv, qv] of WORLDS) {
      const r = q(pv, qv);
      const env = { p: q(pv), q: q(qv), r };
      const N = evalExpr(pn.node, env);
      const D = evalExpr(pd.node, env);
      const at = `p = ${sgn(pv)}、q = ${sgn(qv)} 時`;
      if (!N || !D) {
        this.msg.set({ tone: 'bad', text: `${at}，式子要除以 0。` });
        return;
      }
      if (!isInt(N) || !isInt(D)) {
        const part = !isInt(N) ? `分子 = ${fmtQ(N)}` : `分母 = ${fmtQ(D)}`;
        this.msg.set({ tone: 'bad', text: `${at}，${part}，不是整數。${usesR ? 'r = p / q 不一定是整數。' : ''}` });
        return;
      }
      if (D.n === 0) {
        this.msg.set({ tone: 'bad', text: `${at}，分母 = 0。定義要求分母不是 0。` });
        return;
      }
      const want = g.value(r);
      const got = div(N, D)!;
      if (!eq(got, want)) {
        this.msg.set({
          tone: 'bad',
          text: `${at}（r = ${fmtQ(r)}）：${g.goal} = ${fmtQ(want)}，但 ${fmtQ(N)} / ${fmtQ(D)} = ${fmtQ(got)}。`,
        });
        return;
      }
    }
    this.doneGoals.update((m) => ({ ...m, [g.id]: { num: this.numDraft().trim(), den: this.denDraft().trim() } }));
    this.numDraft.set('');
    this.denDraft.set('');
    this.msg.set(null);
    // The second goal only unlocks after the q ≠ 0 question, so finishing it finishes the scene.
    if (this.allDone()) this.progress.markCompleted('proofs-ch2', '5');
  }
}
