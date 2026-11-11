import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { CELLS, Cell, CellView, Grid4Component, HOLDS, num } from './grid4.component';

type Tone = 'good' | 'bad' | 'you';

interface Check {
  id: string;
  p: string;
  q: string;
  text: string;
  holds: boolean;
  /** Example integers and the cell each lands in. */
  nums: { n: number; cell: Cell }[];
}

const CHECKS: Check[] = [
  {
    id: 'four',
    p: 'n 是 4 的倍數',
    q: 'n 是偶數',
    text: 'n 是 4 的倍數，若且唯若 n 是偶數。',
    holds: false,
    nums: [
      { n: 8, cell: 'TT' },
      { n: 6, cell: 'FT' },
      { n: 3, cell: 'FF' },
    ],
  },
  {
    id: 'next',
    p: 'n 是偶數',
    q: 'n + 1 是奇數',
    text: 'n 是偶數，若且唯若 n + 1 是奇數。',
    holds: true,
    nums: [
      { n: 4, cell: 'TT' },
      { n: 7, cell: 'FF' },
      { n: 0, cell: 'TT' },
      { n: -3, cell: 'FF' },
    ],
  },
];

const SUMMARY = [
  { name: 'P 且 Q', sym: 'P ∧ Q', holds: HOLDS.and, breach: false },
  { name: 'P 或 Q', sym: 'P ∨ Q', holds: HOLDS.or, breach: false },
  { name: '非 P', sym: '¬P', holds: HOLDS.notP, breach: false },
  { name: '若 P 則 Q', sym: 'P ⇒ Q', holds: HOLDS.implies, breach: true },
  { name: 'P 若且唯若 Q', sym: 'P ⇔ Q', holds: HOLDS.iff, breach: true },
];

@Component({
  selector: 'app-pf-iff',
  standalone: true,
  imports: [Grid4Component, RouterLink],
  styleUrl: './scene-iff.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">6 / 6 · 若且唯若</p>
        <h1 class="pf-title">兩個承諾疊在一起</h1>
        <p class="pf-lede">
          數學裡常看到「P 若且唯若 Q」（P if and only if Q，簡寫 iff，符號 P ⇔ Q）。它其實是一口氣許了兩個承諾：<b>若 P 則 Q</b>，而且<b>若 Q 則 P</b>。
        </p>

        <!-- 1 · two breach cells -->
        <div class="pf-col tight">
          <p class="pf-q">兩個承諾都要守住。四格裡有哪幾格會違約？</p>
          <p class="pf-note">把會違約的格子都點起來，再按「檢查」。提示：每個承諾各怕一格。</p>
          <app-pf-grid4 p="P" q="Q" [view]="iffView()" [pickable]="!iffDone()" (pick)="toggle($event)" />
          @if (!iffDone()) {
            <div class="pf-row"><button type="button" class="pf-btn primary" (click)="checkIff()">檢查</button></div>
          }
          @if (iffMsg(); as m) {
            <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.bad]="m.tone === 'bad'" role="status">{{ m.text }}</p>
          }
        </div>

        <!-- 2 · check two sentences -->
        @if (iffDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">剩下的兩格在對角線上：P、Q 都成立，或都不成立。所以 P ⇔ Q 說的就是「P 和 Q 同真同假」。拿兩句話來試試看：</p>
            @for (c of checks; track c.id; let i = $index) {
              @if (i <= checkIdx()) {
                <div class="pf-col tight check pf-rise">
                  <div class="pf-slip">
                    <small>第 {{ i + 1 }} 句</small>
                    <p>{{ c.text }}</p>
                    @if (answered()[c.id] !== undefined) {
                      <span class="pf-seal stamp" [class.proved]="c.holds" [class.refuted]="!c.holds">{{ c.holds ? '證明' : '推翻' }}</span>
                    }
                  </div>
                  @if (answered()[c.id] === undefined) {
                    <p class="pf-q">它成立嗎？</p>
                    <div class="pf-row">
                      <button type="button" class="pf-btn" (click)="answer(c, true)">成立</button>
                      <button type="button" class="pf-btn" (click)="answer(c, false)">不成立</button>
                    </div>
                  } @else {
                    <app-pf-grid4 [p]="c.p" [q]="c.q" [view]="checkView(c)" />
                    @if (checkMsg()[c.id]; as m) {
                      <p class="pf-feedback" [class.good]="m.tone === 'good'" [class.you]="m.tone === 'you'" role="status">{{ m.text }}</p>
                    }
                    @if (c.holds) {
                      <p class="pf-p">
                        數字都落在對角線上，但這些只是<b>例子</b>。要證明它對每個 n 都成立，兩個承諾得各證一次，用的是第 2 章的工具：
                      </p>
                      <div class="dirs">
                        <div class="pf-obj made">
                          <span class="pf-tag">若 n 是偶數，則 n + 1 是奇數</span>
                          <div>n = 2k，所以 n + 1 = 2k + 1</div>
                          <small>k 是整數，所以 n + 1 符合奇數的定義。</small>
                        </div>
                        <div class="pf-obj made">
                          <span class="pf-tag">若 n + 1 是奇數，則 n 是偶數</span>
                          <div>n + 1 = 2m + 1，所以 n = 2m</div>
                          <small>m 是整數，所以 n 符合偶數的定義。</small>
                        </div>
                      </div>
                      <p class="pf-p">兩個承諾，兩次證明。證明「若且唯若」時，兩個方向都不能省。</p>
                    } @else {
                      <p class="pf-p">6 掉進了違約格：「若 n 是偶數，則 n 是 4 的倍數」這個承諾被打破了。兩個承諾只要有一個破功，整句若且唯若就不成立。</p>
                      <div class="pf-row"><button type="button" class="pf-btn primary" (click)="checkIdx.set(1)">下一句</button></div>
                    }
                  }
                </div>
              }
            }
          </div>
        }

        <!-- 3 · chapter summary -->
        @if (allDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-q">把整章收起來：五種句子，就是五種圈法。</p>
            <div class="minis">
              @for (s of summary; track s.sym) {
                <div class="mini-card">
                  <app-pf-grid4 [mini]="true" p="P" q="Q" [view]="miniView(s)" [label]="s.name + ' 成立的格'" />
                  <div>
                    <b>{{ s.name }}</b>
                    <span class="sym">{{ s.sym }}</span>
                  </div>
                </div>
              }
            </div>
            <p class="pf-note">● 是句子成立的格，✕ 是違約格。</p>
            <div class="pf-takeaway reveal">
              <small>本章帶走這一句</small>
              <p>「若 P 則 Q」只怕一格：<br />P 成立、Q 不成立。<br />換個說法、檢查、證明，都盯著那一格。</p>
            </div>
            <p class="pf-note">
              下一章：這一章的句子都只談一個 n。那「對每個 n」「存在一個 n」又該怎麼讀？<a routerLink="/learn/proofs/ch4/1">前往第 4 章「量詞是一場對手遊戲」→</a>
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneIffComponent {
  private readonly progress = inject(LearnProgressService);

  readonly checks = CHECKS;
  readonly summary = SUMMARY;

  readonly picks = signal<Set<Cell>>(new Set());
  readonly iffDone = signal(false);
  readonly iffMsg = signal<{ tone: Tone; text: string } | null>(null);
  readonly checkIdx = signal(0);
  readonly answered = signal<Record<string, boolean>>({});
  readonly checkMsg = signal<Record<string, { tone: Tone; text: string }>>({});

  readonly allDone = computed(() => CHECKS.every((c) => this.answered()[c.id] !== undefined));

  readonly iffView = computed(() => {
    const v: Partial<Record<Cell, CellView>> = {};
    const done = this.iffDone();
    for (const c of CELLS) {
      const breach = !HOLDS.iff(c);
      v[c] = done
        ? {
            mark: breach ? 'breach' : 'kept',
            note: c === 'TF' ? '若 P 則 Q 違約' : c === 'FT' ? '若 Q 則 P 違約' : '兩個都守住',
          }
        : { picked: this.picks().has(c) };
    }
    return v;
  });

  toggle(c: Cell): void {
    this.iffMsg.set(null);
    this.picks.update((s) => {
      const next = new Set(s);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  checkIff(): void {
    const p = this.picks();
    const wrong = CELLS.filter((c) => p.has(c) === HOLDS.iff(c));
    if (wrong.length === 0) {
      this.iffDone.set(true);
      this.iffMsg.set({ tone: 'good', text: '對。兩個承諾各怕一格：「若 P 則 Q」怕的是 P 成立、Q 不成立；反過來的「若 Q 則 P」怕的是 Q 成立、P 不成立。' });
      return;
    }
    const c = wrong[0];
    if (p.has(c)) {
      this.iffMsg.set({ tone: 'bad', text: `你點的格子裡有一格不會違約：P、Q ${c === 'TT' ? '都成立' : '都不成立'}，兩個承諾都守住了。` });
    } else {
      this.iffMsg.set({
        tone: 'bad',
        text:
          c === 'TF'
            ? '還漏了一格：P 成立、Q 不成立。第一個承諾「若 P 則 Q」在那裡違約。'
            : '還漏了一格：Q 成立，P 卻不成立。第二個承諾「若 Q 則 P」在那裡違約。',
      });
    }
  }

  answer(c: Check, said: boolean): void {
    this.answered.update((a) => ({ ...a, [c.id]: said }));
    const right = said === c.holds;
    const text = c.holds
      ? right
        ? '對，它成立。不過讓它成立的不是下面這幾個數字，而是兩個方向的證明。'
        : '其實它成立。數字都在對角線上，但真正的理由在下面：兩個方向各證一次。'
      : right
        ? '對，它不成立，6 就是反例。'
        : '它不成立。「若 n 是 4 的倍數，則 n 是偶數」守得住，反過來那個承諾卻被 6 打破了。';
    this.checkMsg.update((m) => ({ ...m, [c.id]: { tone: right ? 'good' : 'you', text } }));
    if (this.allDone()) this.progress.markCompleted('proofs-ch3', '6');
  }

  checkView(c: Check): Partial<Record<Cell, CellView>> {
    const v: Partial<Record<Cell, CellView>> = {};
    for (const cell of CELLS) {
      const breach = !HOLDS.iff(cell);
      const tokens = c.nums.filter((x) => x.cell === cell).map((x) => num(x.n));
      v[cell] = { mark: breach ? 'breach' : 'kept', tokens, note: breach && !tokens.length ? '空的' : undefined };
    }
    return v;
  }

  miniView(s: (typeof SUMMARY)[number]): Partial<Record<Cell, CellView>> {
    const v: Partial<Record<Cell, CellView>> = {};
    for (const c of CELLS) v[c] = { mark: s.holds(c) ? 'true' : s.breach ? 'breach' : 'false' };
    return v;
  }
}
