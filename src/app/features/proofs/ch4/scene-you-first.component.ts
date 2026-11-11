import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { fmtQ, isInt, readNumber } from '../ch2/ch2-expr';
import { MovesComponent, Move } from './moves.component';
import { SENTENCE_A, SENTENCE_B } from './scene-opponent.component';


const MOVES_A: Move[] = [
  { q: 'forall', v: 'x', dom: 'Z', who: '對手出' },
  { q: 'exists', v: 'y', dom: 'Z', who: '你出' },
];
const MOVES_B: Move[] = [
  { q: 'exists', v: 'y', dom: 'Z', who: '你出' },
  { q: 'forall', v: 'x', dom: 'Z', who: '對手出' },
];

@Component({
  selector: 'app-pf-you-first',
  standalone: true,
  imports: [MovesComponent],
  styleUrl: './scene-you-first.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">2 / 5 · 你先出</p>
        <h1 class="pf-title">如果你得先出呢？</h1>

        <div class="pf-slip">
          <small>句子 B</small>
          <p>{{ sentenceB }}</p>
          @if (decided()) {
            <span class="pf-seal refuted stamp">推翻</span>
          }
        </div>
        <p class="pf-p">
          句子 B 用的字和 A 幾乎一樣，只是順序反過來：「存在 y」寫在前面。所以這次<b>你得先出 y</b>，對手看過你的 y 之後，再挑 x。
        </p>
        <app-pf-moves [moves]="liveMoves()" check="y > x" [result]="lastLost() ? 'lose' : null" label="句子 B 的出招順序" />

        <!-- rounds -->
        <div class="pf-col tight">
          @if (!decided()) {
            <p class="pf-q">{{ losses().length === 0 ? '你先出。y 要是多少？' : '再出一次？' }}</p>
            <form class="pf-row" (submit)="$event.preventDefault(); play()">
              <label class="y-eq" for="pf-y-first">y =</label>
              <input class="pf-input" id="pf-y-first" inputmode="numeric" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
              <button type="submit" class="pf-btn primary small">出這一招</button>
            </form>
          }
          @if (inputMsg(); as m) {
            <p class="pf-feedback bad" role="status">{{ m }}</p>
          }
          @for (y of losses(); track $index) {
            <p class="pf-feedback bad">
              第 {{ $index + 1 }} 回合：你出 y = {{ y }}。對手看到了，就出 x = {{ y }}。{{ y }} &gt; {{ y }} 不成立，你輸了。
            </p>
          }
        </div>

        @if (losses().length >= 2) {
          <div class="pf-col tight pf-rise">
            <p class="pf-q">有沒有哪個 y 能贏？</p>
            <div class="pf-row">
              <button type="button" class="pf-btn" [class.picked]="claim() === 'bigger'" [disabled]="decided()" (click)="claim.set('bigger')">有，只是還沒出到夠大的</button>
              <button type="button" class="pf-btn" [class.picked]="claim() === 'none'" [disabled]="decided()" (click)="decide()">沒有，出什麼都會輸</button>
            </div>
            @if (claim() === 'bigger') {
              <p class="pf-feedback you" role="status">再大的 y，對手都只要照抄一份。他是後出的那一方，看得到你的 y。再選一次。</p>
            }
          </div>
        }

        @if (decided()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-obj warn">
              <span class="pf-tag">對手的規則</span>
              <div>x = y</div>
              <small>理由：y &gt; y 永遠不成立，一個數不會比自己大。這條規則沒有用到 y 是多少，所以你出什麼都一樣輸。</small>
            </div>
            <p class="pf-p">
              {{ betNote() }}對手有一條對每個 y 都贏的規則，所以句子 B 不成立。這次輪到後出的對手，看著你的招來決定。
            </p>

            <p class="pf-q">把兩句的出招順序放在一起：</p>
            <div class="compare">
              <div class="row">
                <span class="tag">A</span>
                <div>
                  <p class="formula">∀x ∈ ℤ, ∃y ∈ ℤ, y &gt; x</p>
                  <app-pf-moves [moves]="movesA" check="y > x" [symbols]="true" result="win" label="句子 A：對手先出 x，你再出 y" />
                  <small>你後出，看著 x 選 y。白話：沒有最大的整數。成立。</small>
                </div>
              </div>
              <div class="row">
                <span class="tag">B</span>
                <div>
                  <p class="formula">∃y ∈ ℤ, ∀x ∈ ℤ, y &gt; x</p>
                  <app-pf-moves [moves]="movesB" check="y > x" [symbols]="true" result="lose" label="句子 B：你先出 y，對手再出 x" />
                  <small>對手後出，看著 y 選 x。白話：有一個整數比所有整數都大，連它自己也比不過。不成立。</small>
                </div>
              </div>
            </div>
            <p class="pf-p">
              數學把「對每個」寫成 <b class="sym">∀</b>，讀作 for all，是倒過來的 A；把「存在」寫成 <b class="sym">∃</b>，讀作 there exists，是反過來的 E。量詞一律寫在句子前面，照出招的順序由左往右排，最後才是要檢查的條件。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>量詞的順序就是出招順序。<br />後出的人看得到前面的招。<br />換了順序，就換了一場遊戲。</p>
            </div>
            <details class="pf-why">
              <summary>句子 A 和 B 的字幾乎一樣，為什麼這麼容易看錯？</summary>
              <div>
                <p>中文和英文都習慣把量詞放在名詞旁邊（「每個整數都有一個比它大的數」），讀的時候不會特別注意誰先誰後。寫成 ∀、∃ 的形式之後，順序就一目了然。</p>
                <p>判斷時可以問自己：後出的那個數，能不能看著前面的數再決定？能，它就可以依賴前面的數；不能，它就得對所有可能都有效。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneYouFirstComponent {
  private readonly progress = inject(LearnProgressService);

  readonly sentenceB = SENTENCE_B;
  readonly sentenceA = SENTENCE_A;
  readonly movesA = MOVES_A;
  readonly movesB = MOVES_B;

  readonly draft = signal('');
  readonly inputMsg = signal<string | null>(null);
  readonly losses = signal<string[]>([]);
  readonly claim = signal<'bigger' | 'none' | null>(null);
  readonly decided = computed(() => this.claim() === 'none');

  readonly lastLost = computed(() => this.losses().length > 0);
  readonly liveMoves = computed<Move[]>(() => {
    const ls = this.losses();
    const y = ls[ls.length - 1];
    return [
      { ...MOVES_B[0], value: y },
      { ...MOVES_B[1], value: y },
    ];
  });

  readonly betNote = computed(() => {
    const b = this.progress.getStepData<string>('proofs-ch4', '1', 'betB');
    if (b === 'yes') return '上一幕你判斷 B 也成立。很多人會這樣想，因為兩句用的字幾乎一樣。';
    if (b === 'no') return '上一幕你就判斷 B 不成立，對。';
    return '';
  });

  play(): void {
    const src = this.draft().trim();
    if (/[a-z]/i.test(src)) {
      this.inputMsg.set('這時 x 還沒出現，你只能先出一個固定的數。');
      return;
    }
    const r = readNumber(src);
    if (!r.ok) {
      this.inputMsg.set(r.msg);
      return;
    }
    if (!isInt(r.v)) {
      this.inputMsg.set(`${fmtQ(r.v)} 不是整數，句子要的 y 是整數。`);
      return;
    }
    this.inputMsg.set(null);
    this.losses.update((l) => [...l, fmtQ(r.v)]);
    this.draft.set('');
  }

  decide(): void {
    this.claim.set('none');
    this.progress.markCompleted('proofs-ch4', '2');
  }
}
