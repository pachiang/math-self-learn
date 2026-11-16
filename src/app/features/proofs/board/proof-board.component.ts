import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  BoardStart,
  BoardState,
  CARDS,
  CH6_CARDS,
  CardId,
  Def,
  GivenCard,
  GoalCard,
  Move,
  Obj,
  applyMove,
  bridgeOf,
  defsFor,
  givensFor,
  lemmaPairs,
  Stmt,
  replay,
  shapeName,
  stmtText,
} from './board-model';
import { ExprNode } from '../ch2/ch2-expr';
import { exprVars, fmtExpr, substExpr } from './poly';

const ALL_CARDS: CardId[] = ['intro', 'assume', 'unfoldGoal', 'witness', 'check', 'exact', 'split', 'unfold', 'obtain', 'lemma'];

type Pending =
  | { card: 'witness' }
  | { card: 'obtain'; h: string | null }
  | { card: 'pick'; of: GivenCard; hs: string[] }
  | { card: 'pairs'; pairs: { h1: string; h2: string; out: Stmt }[] };

/**
 * The proof state board: givens on the left (letters with identity marks, then H1, H2, …),
 * the single goal on the right, move cards below, and a move log tagged 形狀決定／需要想法.
 * State is `start` folded through `prefix` and then the learner's own moves.
 */
@Component({
  selector: 'app-pf-board',
  standalone: true,
  imports: [NgTemplateOutlet],
  styleUrl: './proof-board.component.scss',
  template: `
    <div class="pb" [class.has-side]="hasSide()" (keydown)="onKey($event)">
      <div class="pb-main">
        <div class="pb-board" [attr.aria-label]="label()" role="group">
          <section class="pb-col">
            <h3>已知</h3>
            @if (st().objs.length) {
              <ul class="pb-objs" aria-label="板上的字母">
                @for (o of st().objs; track o.name) {
                  <li class="pb-obj" [class]="'pb-obj ' + o.kind">
                    <b>{{ o.name }}</b>
                    <small>{{ objTag(o) }}</small>
                  </li>
                }
              </ul>
            }
            @if (st().hyps.length) {
              <ol class="pb-hyps">
                @for (h of st().hyps; track h.id) {
                  <li class="pb-hyp" [class.used]="!!h.used" [class.fresh]="freshIds().has(h.id)">
                    <b class="pb-id">{{ h.id }}</b>
                    <span class="pb-text">{{ text(h.s) }}</span>
                    @if (h.used) {
                      <small class="pb-used">{{ h.used }}</small>
                    }
                  </li>
                }
              </ol>
            }
            @if (!st().objs.length && !st().hyps.length) {
              <p class="pb-empty">還是空的。</p>
            }
          </section>

          <section class="pb-col goal">
            <h3>目標</h3>
            @if (st().goal; as g) {
              <div class="pb-goal" [class.fresh]="goalFresh()">
                <span class="pb-text">{{ text(g) }}</span>
                @if (showShape()) {
                  <small class="pb-shape">最外層：{{ shape(g) }}</small>
                }
              </div>
            } @else {
              <div class="pb-goal done">
                <span>
                  <span class="pb-text">目標清空，證明完成。</span>
                  @if (st().checked; as c) {
                    <small class="pb-check">左邊 {{ c.lSrc }} → {{ c.both }}　右邊 {{ c.rSrc }} → {{ c.both }}</small>
                  }
                </span>
                <span class="pf-seal mini proved stamp">證明</span>
              </div>
            }
            @if (st().past.length) {
              <ol class="pb-past" aria-label="原本的目標">
                @for (p of pastRev(); track $index) {
                  <li><span class="pb-text">{{ text(p) }}</span></li>
                }
              </ol>
            }
          </section>
        </div>

        @if (bridge() && bridgeRows(); as b) {
          <div class="pb-bridge" role="group" aria-label="在中間碰頭">
            <div class="pb-brow back" [class.shown]="showBack()">
              <small>往回 · 目標要的形狀</small>
              @if (showBack()) {
                <span class="pf-num">{{ b.left }} = {{ b.back }}</span>
              } @else {
                <button type="button" class="pf-btn small" (click)="showBack.set(true)">往回看目標</button>
              }
            </div>
            @if (manual()) {
              <div class="pb-brow fwd shown">
                <small>往前 · 一次代入一條已知</small>
                <div class="pb-chain">
                  <span class="pf-num">{{ chainText() }}</span>
                  @if (!frozen()) {
                  <div class="pf-row" role="group" aria-label="代入哪一條已知">
                    @for (d of chainDefs(); track d.h + d.v) {
                      <button type="button" class="pf-btn small" (click)="subst(d)">
                        用 {{ d.h }} 換掉 {{ d.v }}（{{ d.v }} = {{ fmt(d.node) }}{{ d.solved ? '，從 ' + d.h + ' 移項' : '' }}）
                      </button>
                    }
                    @if (chain().length > 1) {
                      <button type="button" class="pf-btn ghost small" (click)="chain.update((c) => c.slice(0, -1))">退回一格</button>
                    }
                  </div>
                  }
                  @if (!chainDefs().length && !frozen()) {
                    <small class="pb-chain-end">{{ chain().length > 1 ? '式子裡的字母都沒有已知可以再代入了。' : '式子裡的字母，已知裡都沒有可以代入的等式。' }}</small>
                  }
                </div>
              </div>
            } @else {
              <div class="pb-brow fwd" [class.shown]="showFwd()">
                <small>往前 · 已知能給的</small>
                @if (showFwd()) {
                  <span class="pf-num">{{ b.left }} = {{ b.fwd ?? b.left }}</span>
                } @else {
                  <button type="button" class="pf-btn small" (click)="showFwd.set(true)">往前推已知</button>
                }
              </div>
            }
            @if (showBack() && (manual() ? chain().length > 1 : showFwd())) {
              <div class="pb-brow mid pf-rise">
                <small>中間 · 兩邊碰頭</small>
                <span class="pf-num">{{ manual() ? chainLast() : (b.fwd ?? b.left) }} = {{ b.back }}</span>
              </div>
            }
          </div>
        }

        @if (!hasSide()) {
          <ng-container *ngTemplateOutlet="feedback" />
        }
        @if (showLog() && st().log.length) {
          <div class="pb-logbox">
            <div class="pb-loghead">
              <small>步法紀錄</small>
              @if (!frozen() && moves().length) {
                <button type="button" class="pf-btn ghost small" (click)="undo()">退一步</button>
              }
            </div>
            <ol class="pb-log">
              @for (e of st().log; track $index) {
                <li [class.prefix]="$index < prefixCount()">
                  <span class="pb-n pf-num">{{ $index + 1 }}</span>
                  <span class="pb-text">{{ e.text }}</span>
                  @if (tags()) {
                    <span class="pb-tag" [class.idea]="e.tag === 'idea'">{{ e.tag === 'idea' ? '★ 需要想法' : '形狀決定' }}</span>
                  }
                </li>
              }
            </ol>
          </div>
        }
      </div>

      @if (hasSide()) {
        <div class="pb-side">
          @if (!frozen() && st().goal) {
            <div class="pb-deck">
              @for (side of sides(); track side.key) {
                <div class="pb-row">
                  <small class="pb-sidelabel">{{ side.title }}</small>
                  <div class="pb-cards">
                    @for (c of side.cards; track c) {
                      <button type="button" class="pb-card" [class.on]="activeCard() === c" (click)="play(c)" [attr.aria-keyshortcuts]="keyOf(c)">
                        <span class="pb-card-top"><span><kbd>{{ keyOf(c) }}</kbd>@if (activeCard() === c) {<small class="pb-on">剛出這張</small>}</span><span class="pb-card-shape" [class]="'pb-card-shape ' + c">{{ info(c).chip }}</span></span>
                        <b>{{ info(c).name }}</b>
                        <small>{{ info(c).line }}</small>
                      </button>
                    }
                  </div>
                </div>
              }
              <p class="pf-note">{{ deckNote() }}焦點在板上時，可以按數字鍵出卡。</p>
            </div>

            @if (pending(); as p) {
              <div class="pb-ask pf-rise">
                @if (p.card === 'pairs') {
                  <p class="pf-q small">「引用定理」要用在哪兩條已知？</p>
                  <div class="pf-row">
                    @for (x of p.pairs; track x.h1 + x.h2) {
                      <button type="button" class="pf-btn small" (click)="commitLemma(x.h1, x.h2)">{{ x.h1 }}、{{ x.h2 }} ⇒ {{ text(x.out) }}</button>
                    }
                  </div>
                } @else if (p.card === 'pick') {
                  <p class="pf-q small">「{{ info(p.of).name }}」要用在哪一條已知？</p>
                  <div class="pf-row">
                    @for (h of p.hs; track h) {
                      <button type="button" class="pf-btn small" (click)="pickHyp(p.of, h)">{{ h }}　{{ hypText(h) }}</button>
                    }
                  </div>
                } @else if (p.card === 'obtain' && p.h) {
                  <form class="pf-row" (submit)="$event.preventDefault(); submitName(p.h)">
                    <label class="pf-q small" [attr.for]="id('name')">從 {{ p.h }} 拿出的整數，叫它</label>
                    <input
                      class="pf-input"
                      [id]="id('name')"
                      maxlength="1"
                      autocomplete="off"
                      spellcheck="false"
                      [value]="nameDraft()"
                      (input)="nameDraft.set($any($event.target).value)"
                    />
                    <button type="submit" class="pf-btn primary small">取出</button>
                  </form>
                  <p class="pf-note">名字用一個英文字母。{{ p.h }} 寫的是「{{ hypText(p.h) }}」。</p>
                } @else if (p.card === 'witness') {
                  <form class="pf-row" (submit)="$event.preventDefault(); submitWitness()">
                    <label class="pf-q small" [attr.for]="id('wit')">{{ witnessVar() }} =</label>
                    <input
                      class="pf-input wide"
                      [id]="id('wit')"
                      autocomplete="off"
                      spellcheck="false"
                      [value]="witDraft()"
                      (input)="witDraft.set($any($event.target).value)"
                    />
                    <button type="submit" class="pf-btn primary small">選這個</button>
                  </form>
                  <p class="pf-note">只能用板上已有的字母：{{ letters() }}。可以打式子，例如 <span class="pf-num">2k + 1</span>、<span class="pf-num">k^2</span>。</p>
                }
              </div>
            }
          }

          <ng-container *ngTemplateOutlet="feedback" />
        </div>
      }

      <ng-template #feedback>
        @if (msg(); as m) {
          <p class="pf-feedback" [class.bad]="msgBad()" [class.good]="!msgBad()" role="status">{{ m }}</p>
        }
      </ng-template>
      <p class="pf-sr-only" aria-live="polite">{{ liveText() }}</p>
    </div>
  `,
})
export class ProofBoardComponent {
  readonly start = input.required<BoardStart>();
  /** Moves already made before the learner takes over (shown in the log, not undoable). */
  readonly prefix = input<Move[]>([]);
  readonly deck = input<CardId[]>(CH6_CARDS);
  readonly deckNote = input('第 6 章開放的卡。之後的章節還會加卡（引用定理、逆否、歸納……）。');
  readonly frozen = input(false);
  /** true: the board expands the givens for you (ch6); 'manual': you substitute one given at a time (ch7). */
  readonly bridge = input<boolean | 'manual'>(false);
  readonly showLog = input(true);
  readonly tags = input(true);
  readonly showShape = input(false);
  readonly label = input('證明狀態板');
  readonly idBase = input('pf-board');

  readonly changed = output<BoardState>();
  readonly solved = output<BoardState>();
  /** Fires whenever a move is refused (wrong shape, name clash, failed check…), so a scene can react. */
  readonly refused = output<{ card: CardId; code: string }>();

  readonly moves = signal<Move[]>([]);
  readonly pending = signal<Pending | null>(null);
  readonly activeCard = signal<CardId | null>(null);
  readonly nameDraft = signal('');
  readonly witDraft = signal('');
  readonly msg = signal<string | null>(null);
  readonly msgBad = signal(false);
  readonly showBack = signal(false);
  readonly showFwd = signal(false);

  readonly st = computed(() => replay(this.start(), [...this.prefix(), ...this.moves()]));
  readonly hasSide = computed(() => !this.frozen() && !!this.st().goal);
  readonly prefixCount = computed(() => replay(this.start(), this.prefix()).log.length);
  readonly pastRev = computed(() => [...this.st().past].reverse());
  readonly bridgeRows = computed(() => bridgeOf(this.st()));
  readonly manual = computed(() => this.bridge() === 'manual');
  /** The manual forward chain, starting from the goal's left side. Scratch work, not moves. */
  readonly chain = signal<{ e: ExprNode; h?: string }[]>([]);
  private readonly chainStart = computed(() => {
    const g = this.st().goal;
    return g && g.t === 'exists' && g.body.t === 'eq' ? g.body.l : null;
  });
  readonly chainText = computed(() => this.chain().map((x) => fmtExpr(x.e)).join(' = '));
  readonly chainLast = computed(() => {
    const c = this.chain();
    return c.length ? fmtExpr(c[c.length - 1].e) : '';
  });
  /** Substitutions still on offer: a given used once in the chain is not offered again. */
  readonly chainDefs = computed<Def[]>(() => {
    const c = this.chain();
    if (!c.length) return [];
    const used = new Set(c.map((x) => x.h));
    return exprVars(c[c.length - 1].e).flatMap((v) =>
      defsFor(this.st(), v).filter((d) => !used.has(d.h) && !exprVars(d.node).includes(v)),
    );
  });
  fmt = fmtExpr;
  readonly letters = computed(() => this.st().objs.map((o) => o.name).join('、') || '（還沒有）');
  readonly witnessVar = computed(() => {
    const g = this.st().goal;
    return g && g.t === 'exists' ? g.v : 'm';
  });
  readonly liveText = computed(() => {
    const l = this.st().log;
    return l.length ? `第 ${l.length} 步：${l[l.length - 1].text}` : '';
  });

  /** What the learner's most recent move changed, for a brief highlight. */
  private readonly before = computed(() =>
    this.moves().length ? replay(this.start(), [...this.prefix(), ...this.moves().slice(0, -1)]) : null,
  );
  readonly freshIds = computed(() => {
    const b = this.before();
    return b ? new Set(this.st().hyps.slice(b.hyps.length).map((h) => h.id)) : new Set<string>();
  });
  readonly goalFresh = computed(() => {
    const b = this.before();
    return !!b && b.goal !== this.st().goal;
  });

  readonly sides = computed(() => {
    const d = this.deck();
    const goal = ALL_CARDS.filter((c) => CARDS[c].side === 'goal' && d.includes(c));
    const given = ALL_CARDS.filter((c) => CARDS[c].side === 'given' && d.includes(c));
    return [
      { key: 'goal', title: '對目標用', cards: goal },
      { key: 'given', title: '對已知用', cards: given },
    ].filter((s) => s.cards.length);
  });
  private readonly order = computed(() => this.sides().flatMap((s) => s.cards));

  constructor() {
    // A new start or prefix (e.g. 6.1 stepping) resets the learner's own moves.
    // The scratch chain survives a refused witness (the goal is briefly an equation, then reverts)
    // but restarts when the goal's left side or the givens it may use change.
    let chainKey = '';
    effect(() => {
      const l = this.chainStart();
      const hyps = this.st().hyps.map((h) => h.id + stmtText(h.s)).join('|');
      untracked(() => {
        if (!l) return;
        const key = fmtExpr(l) + '#' + hyps;
        if (key === chainKey) return;
        chainKey = key;
        this.chain.set([{ e: l }]);
      });
    });
    effect(() => {
      this.start();
      this.prefix();
      untracked(() => {
        this.moves.set([]);
        this.pending.set(null);
        this.msg.set(null);
      });
    });
  }

  info(c: CardId) {
    return CARDS[c];
  }
  keyOf(c: CardId): string {
    return String((this.order().indexOf(c) + 1) % 10);
  }

  subst(d: Def): void {
    this.chain.update((c) => [...c, { e: substExpr(c[c.length - 1].e, d.v, d.node), h: d.h }]);
  }
  text = stmtText;
  shape = shapeName;
  hypText(id: string): string {
    const h = this.st().hyps.find((x) => x.id === id);
    return h ? stmtText(h.s) : '';
  }
  id(s: string): string {
    return `${this.idBase()}-${s}`;
  }

  objTag(o: Obj): string {
    if (o.kind === 'arb') return '對手給的';
    if (o.kind === 'got') return `↳ 從 ${o.from} 拿到`;
    return `✎ 你選的 = ${o.def ? fmtExpr(o.def) : ''}`;
  }

  onKey(ev: KeyboardEvent): void {
    const t = ev.target as HTMLElement;
    if (t.tagName === 'INPUT' || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (!/^[0-9]$/.test(ev.key)) return;
    const n = ev.key === '0' ? 10 : Number(ev.key);
    if (n > this.order().length || this.frozen() || !this.st().goal) return;
    ev.preventDefault();
    this.play(this.order()[n - 1]);
  }

  play(c: CardId): void {
    const st = this.st();
    this.activeCard.set(c);
    this.pending.set(null);
    if (CARDS[c].side === 'goal') {
      if (c === 'witness') {
        const probe = applyMove(st, { card: 'witness', src: '' });
        if (!probe.ok && (probe.code === 'shape' || probe.code === 'early')) {
          this.fail(probe.msg);
          this.refused.emit({ card: c, code: probe.code });
          return;
        }
        this.msg.set(null);
        this.pending.set({ card: 'witness' });
        this.focusSoon('wit');
        return;
      }
      this.commit({ card: c as Exclude<GoalCard, 'witness'> });
      return;
    }
    if (c === 'lemma') {
      const pairs = lemmaPairs(st);
      if (!pairs.length) {
        this.fail('已知裡找不到一對「x ∣ y、y ∣ z」：第一條的右邊要和第二條的左邊一樣，而且結論還不在板上。');
        this.refused.emit({ card: c, code: 'none' });
        return;
      }
      if (pairs.length === 1) {
        this.commitLemma(pairs[0].h1, pairs[0].h2);
        return;
      }
      this.msg.set(null);
      this.pending.set({ card: 'pairs', pairs });
      return;
    }
    const hs = givensFor(st, c as GivenCard);
    if (!hs.length) {
      this.fail(`已知裡沒有還沒用過、形狀是「${CARDS[c].shape}」的句子。${this.givenHint(c as GivenCard)}`);
      this.refused.emit({ card: c, code: 'none' });
      return;
    }
    if (hs.length > 1) {
      this.msg.set(null);
      this.pending.set({ card: 'pick', of: c as GivenCard, hs });
      return;
    }
    this.pickHyp(c as GivenCard, hs[0]);
  }

  pickHyp(c: GivenCard, h: string): void {
    if (c === 'obtain') {
      this.msg.set(null);
      this.nameDraft.set('');
      this.pending.set({ card: 'obtain', h });
      this.focusSoon('name');
      return;
    }
    this.commit(c === 'split' ? { card: 'split', h } : { card: 'unfold', h });
  }

  commitLemma(h1: string, h2: string): void {
    this.commit({ card: 'lemma', h1, h2 });
  }

  submitName(h: string): void {
    this.commit({ card: 'obtain', h, name: this.nameDraft() });
  }

  submitWitness(): void {
    this.commit({ card: 'witness', src: this.witDraft() });
  }

  undo(): void {
    this.moves.update((m) => m.slice(0, -1));
    this.pending.set(null);
    this.msg.set(null);
    this.changed.emit(this.st());
  }

  private commit(mv: Move): void {
    const st = this.st();
    const r = applyMove(st, mv);
    if (!r.ok) {
      if (r.code === 'neq') {
        // The check is where a wrong witness shows itself: take the witness back.
        const last = this.moves()[this.moves().length - 1];
        if (last?.card === 'witness') this.moves.update((m) => m.slice(0, -1));
        this.fail(`${r.msg}已經撤回這個證人，再選一次。`);
        this.changed.emit(this.st());
        this.refused.emit({ card: mv.card, code: r.code });
        return;
      }
      this.fail(r.msg);
      this.refused.emit({ card: mv.card, code: r.code });
      return;
    }
    this.moves.update((m) => [...m, mv]);
    this.pending.set(null);
    this.activeCard.set(null);
    this.msgBad.set(false);
    this.msg.set(this.okNote(mv));
    if (mv.card === 'witness') this.witDraft.set('');
    this.changed.emit(this.st());
    if (!this.st().goal) this.solved.emit(this.st());
  }

  private okNote(mv: Move): string | null {
    const s = this.st();
    const last = s.log[s.log.length - 1];
    switch (mv.card) {
      case 'intro':
        return '目標以「對每個」開頭，所以第一步就是讓對手先出：這些字母是他給的，你不能指定它們是多少。';
      case 'assume':
        return '「若…則」只在前提成立時才要求你做事，所以把前提放進已知，改證後半句。';
      case 'witness':
        return `${last.text}。目標換成一條等式，下一步把已知代進去，看兩邊是不是一樣。`;
      case 'check':
        return '兩邊展開後一模一樣，目標清空。';
      default:
        return null;
    }
  }

  private givenHint(c: GivenCard): string {
    return c === 'obtain' ? '「存在」形狀的已知，通常要先展開定義才會出現。' : '';
  }

  private fail(m: string): void {
    this.msgBad.set(true);
    this.msg.set(m);
  }

  private focusSoon(which: string): void {
    setTimeout(() => (document.getElementById(this.id(which)) as HTMLInputElement | null)?.focus(), 0);
  }
}
