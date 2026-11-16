import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import {
  BoardState,
  CARDS,
  EVEN_SUM,
  GoalCard,
  Obj,
  Stmt,
  eqn,
  even,
  exists,
  firstCard,
  forall,
  imp,
  odd,
  stmtText,
  wrongGoalCard,
} from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

interface Drill {
  objs: Obj[];
  goal: Stmt;
  ok: string;
}

const DRILLS: Drill[] = [
  { objs: [], goal: exists('x', eqn('3x', '-12')), ok: '最外層是「存在」，所以第一步是由你提出 x。這題 x = −4。' },
  { objs: [], goal: odd('-7'), ok: '沒有量詞，也沒有「若…則」，最外層就是定義詞「是奇數」：換成「存在整數 m，使 −7 = 2m + 1」。' },
  {
    objs: [{ name: 'x', kind: 'arb' }],
    goal: imp(even('x'), even('x + 6')),
    ok: '這是第 2 章第 3 幕的題目：把「x 是偶數」放進已知，改證 x + 6 是偶數。',
  },
  {
    objs: [],
    goal: forall(['n'], even('n^2 + n')),
    ok: '對。「是偶數」雖然寫在句子裡，但外面還包著「對每個」。先令 n 為任意整數，才輪到展開。',
  },
  {
    objs: [
      { name: 'k', kind: 'got', from: 'H2' },
      { name: 'l', kind: 'got', from: 'H4' },
    ],
    goal: eqn('2(k + l)', '2k + 2l'),
    ok: '目標已經是一條等式，沒有東西要拆了：代入、化簡，看兩邊是不是一樣。',
  },
];

const GOAL_CARDS: GoalCard[] = ['intro', 'assume', 'unfoldGoal', 'witness', 'check'];

@Component({
  selector: 'app-pf-first-move',
  standalone: true,
  imports: [ProofBoardComponent],
  styleUrl: './ch6.scss',
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">2 / 6 · 目標的形狀</p>
        <h1 class="pf-title">第一步，不用靈感</h1>
        <p class="pf-lede">
          同一個定理，這次由你動手。板子下面有五張卡，每張卡只能用在<b>某一種形狀</b>的目標上，卡片右上角寫著是哪一種。看目標<b>最外面一層</b>，選一張。
        </p>

        <app-pf-board
          [start]="start"
          [deck]="goalCards"
          [frozen]="paused()"
          label="定理：偶數加偶數"
          idBase="pf-c6-first"
          (changed)="onChange($event)"
          (refused)="misses.update((n) => n + 1)"
        />

        @if (paused()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              先停在這裡。到目前為止的三步，紀錄上都標著「形狀決定」：你只是看目標的最外層，照卡片做{{ misses() ? '（中間選錯 ' + misses() + ' 次，每次回饋都在說同一件事：先看最外層）' : '' }}。
            </p>
            <p class="pf-p">
              可是現在目標要你<b>選一個 m</b>。m 是多少，光看形狀看不出來；它得用已知裡的東西來寫，而 H1 還沒打開。這要等下一幕。
            </p>
          </div>

          <div class="pf-col tight pf-rise">
            <p class="pf-q">換幾個目標練一下：第一張卡是哪一張？</p>
            @if (drill(); as d) {
              <div class="c6-drill">
                <small class="pf-num">第 {{ di() + 1 }} / {{ drills.length }} 題</small>
                @if (d.objs.length) {
                  <p class="pf-note">板上已有：{{ objsText(d) }}</p>
                }
                <div class="c6-drill-goal"><small>目標</small>{{ text(d.goal) }}</div>
                <div class="pf-row" role="group" aria-label="選第一張卡">
                  @for (c of goalCards; track c) {
                    <button
                      type="button"
                      class="pf-btn small"
                      [class.picked]="drillPick() === c"
                      [attr.aria-pressed]="drillPick() === c"
                      [disabled]="drillRight()"
                      (click)="pickDrill(c)"
                    >
                      {{ cards[c].name }}
                    </button>
                  }
                </div>
                @if (drillMsg(); as m) {
                  <p class="pf-feedback" [class.good]="drillRight()" [class.bad]="!drillRight()" role="status">{{ m }}</p>
                }
                @if (drillRight()) {
                  <div class="pf-row">
                    <button type="button" class="pf-btn primary small" (click)="nextDrill()">{{ di() + 1 < drills.length ? '下一題 →' : '完成' }}</button>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (drillsDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              五題的第一張卡，全是看最外面一層決定的。第 4 題最容易看錯：句子裡出現「是偶數」，可是外面還包著「對每個」。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>先看目標最外面一層：<br />「對每個」就令任意，「若…則」就假設前提，定義詞就展開。<br />第一步是形狀給的，不是靈感給的。</p>
            </div>
            <details class="pf-why">
              <summary>「令 a、b 為任意整數」之後證出來的，為什麼對每個整數都對？</summary>
              <div>
                <p>因為接下來的每一步，都沒有用到 a、b 是哪兩個數，只用到「它們是整數」和板上寫著的已知。對手換成任何兩個整數，同樣的每一步都照樣能走。</p>
                <p>這就是第 4 章「對手先出」的意思：你寫的不是對某一組 a、b 的答案，而是一套不管對手出什麼都能用的應對。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneFirstMoveComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = EVEN_SUM;
  readonly goalCards = GOAL_CARDS;
  readonly cards = CARDS;
  readonly drills = DRILLS;
  readonly text = stmtText;

  readonly paused = signal(false);
  readonly misses = signal(0);

  readonly di = signal(0);
  readonly drillPick = signal<GoalCard | null>(null);
  readonly drillsDone = signal(false);
  readonly drill = computed(() => (this.drillsDone() ? null : DRILLS[this.di()]));
  readonly drillRight = computed(() => {
    const d = this.drill();
    return !!d && this.drillPick() === firstCard(d.goal);
  });
  readonly drillMsg = computed(() => {
    const d = this.drill();
    const p = this.drillPick();
    if (!d || !p) return null;
    return p === firstCard(d.goal) ? d.ok : wrongGoalCard(d.goal, p);
  });

  onChange(st: BoardState): void {
    if (st.goal?.t === 'exists') this.paused.set(true);
  }

  objsText(d: Drill): string {
    return d.objs.map((o) => `${o.name}（${o.kind === 'arb' ? '對手給的' : `從 ${o.from} 拿到`}）`).join('、');
  }

  pickDrill(c: GoalCard): void {
    this.drillPick.set(c);
  }

  nextDrill(): void {
    this.drillPick.set(null);
    if (this.di() + 1 < DRILLS.length) {
      this.di.update((i) => i + 1);
    } else {
      this.drillsDone.set(true);
      this.progress.markCompleted('proofs-ch6', '2');
    }
  }
}
