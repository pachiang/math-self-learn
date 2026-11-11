import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { fmtQ, isInt, readNumber } from '../ch2/ch2-expr';
import { MovesComponent, Move } from './moves.component';
import { RuleGameComponent, RuleSolved } from './rule-game.component';
import { gapSpec } from './ch4-game';

@Component({
  selector: 'app-pf-world',
  standalone: true,
  imports: [MovesComponent, RuleGameComponent],
  styleUrl: './scene-world.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">3 / 5 · 換一個世界</p>
        <h1 class="pf-title">在自然數裡，<br />還成立嗎？</h1>

        <div class="pf-slip">
          <small>句子 C · 世界：整數 ℤ</small>
          <p>對每個 x，都存在 y，使 y &lt; x。</p>
          @if (zRule()) {
            <span class="pf-seal proved stamp">證明<span>在 ℤ 裡</span></span>
          }
        </div>

        <p class="pf-p">
          這次的條件是 y &lt; x：你要出一個<b>比對手小</b>的數。先在整數裡玩，x 和 y 都從 ℤ 挑。出招順序和句子 A 一樣，對手先出：
        </p>
        <app-pf-moves [moves]="movesZ" check="y < x" label="句子 C 在 ℤ 裡的出招順序" />

        <div class="pf-col tight">
          <p class="pf-q">寫一條規則，讓你在 ℤ 裡永遠贏。</p>
          <app-pf-rule-game [spec]="zSpec" inputId="pf-rule-c" (solvedRule)="zRule.set($event)" />
        </div>

        @if (zRule(); as r) {
          <div class="pf-col tight pf-rise world-n">
            <p class="pf-p">
              在整數裡，句子 C 成立。現在把世界換成<b>自然數</b> ℕ = {{ '{' }}0, 1, 2, …{{ '}' }}（本課約定從 0 開始）：x 和 y 都只能從這裡挑。句子一個字都沒改。
            </p>
            <p class="pf-q">你的規則 y = {{ r.src }}，換到 ℕ 裡還能贏嗎？</p>
            <div class="pf-row">
              @for (o of opts; track o.v) {
                <button
                  type="button"
                  class="pf-btn"
                  [class.picked]="predicted() === o.v"
                  [attr.aria-pressed]="predicted() === o.v"
                  [disabled]="predicted() !== null"
                  (click)="predicted.set(o.v)"
                >
                  {{ o.label }}
                </button>
              }
            </div>
          </div>
        }

        @if (predicted() !== null) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>句子 C · 世界：自然數 ℕ</small>
              <p>對每個 x，都存在 y，使 y &lt; x。</p>
              @if (refuted()) {
                <span class="pf-seal refuted stamp">推翻<span>反例 x = 0</span></span>
              }
            </div>
            <app-pf-moves [moves]="movesN" check="y < x" [result]="refuted() ? 'lose' : null" label="句子 C 在 ℕ 裡的出招順序" />
            <p class="pf-feedback bad" role="status">
              對手第一招就出 x = 0。你的規則給出 y = {{ zAtZero() }}，可是 {{ zAtZero() }} 不在 ℕ 裡，這一招不合法。{{ predictNote() }}
            </p>
            @if (!refuted()) {
              <p class="pf-q">不用規則，自己出：x = 0 時，y 要是多少？</p>
              <form class="pf-row" (submit)="$event.preventDefault(); tryZero()">
                <label class="y-eq" for="pf-y-zero">y =</label>
                <input class="pf-input" id="pf-y-zero" inputmode="numeric" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
                <button type="submit" class="pf-btn primary small">出這一招</button>
              </form>
              @if (zeroMsg(); as m) {
                <p class="pf-feedback bad" role="status">{{ m }}</p>
              }
              @if (zeroTries() > 0) {
                <p class="pf-q">x = 0 時，有沒有哪個自然數 y 能贏？</p>
                <div class="pf-row">
                  <button type="button" class="pf-btn" [class.picked]="claim() === 'maybe'" (click)="claim.set('maybe')">有，只是我還沒找到</button>
                  <button type="button" class="pf-btn" (click)="refute()">沒有，ℕ 裡沒有比 0 小的數</button>
                </div>
                @if (claim() === 'maybe') {
                  <p class="pf-feedback you" role="status">y 得是自然數，最小就是 0；可是 y 又得比 0 小。兩個要求同時做不到。再選一次。</p>
                }
              }
            }
          </div>
        }

        @if (refuted()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              對手只用了<b>一招</b> x = 0 就贏了。「對每個 x」只要有一個 x 失敗，整句就不成立，這個 x = 0 就是反例，和第 1 章一樣。
              同一句話在 ℤ 裡成立、在 ℕ 裡不成立，差別只在對手和你能從哪裡挑。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>量詞一定要說清楚從哪裡挑。<br />世界一換，對手能出的招就不同，<br />同一句話的真假也可能跟著變。</p>
            </div>
            <details class="pf-why">
              <summary>為什麼對手第一招就出 0？</summary>
              <div>
                <p>對手不是亂出的。他知道你要出比 x 小的數，所以挑 ℕ 裡底下最沒有空間的 0。好的對手總是先試最難的情況。</p>
                <p>你檢查自己的論證時也該這樣做：先問「最刁鑽的情況是什麼」，而不是挑順手的例子。</p>
              </div>
            </details>
            <details class="pf-why">
              <summary>ℕ 一定從 0 開始嗎？</summary>
              <div>
                <p>不一定。有些教材的 ℕ 從 1 開始。本課一律採 ℕ = {{ '{' }}0, 1, 2, …{{ '}' }}；如果從 1 開始，對手就改出 x = 1，結論一樣。讀別的書時，先看它的約定。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneWorldComponent {
  private readonly progress = inject(LearnProgressService);

  readonly zSpec = gapSpec({ given: 'x', answer: 'y', domain: 'Z', tests: [0, -8, 7, 1000, -1001], dir: 'lt' });
  readonly opts = [
    { v: 'yes', label: '能' },
    { v: 'no', label: '不能' },
    { v: 'unsure', label: '說不準' },
  ];

  readonly zRule = signal<RuleSolved | null>(null);
  readonly predicted = signal<string | null>(null);
  readonly draft = signal('');
  readonly zeroMsg = signal<string | null>(null);
  readonly zeroTries = signal(0);
  readonly claim = signal<'maybe' | null>(null);
  readonly refuted = signal(false);

  readonly movesZ: Move[] = [
    { q: 'forall', v: 'x', dom: 'Z', who: '對手出' },
    { q: 'exists', v: 'y', dom: 'Z', who: '你出' },
  ];
  readonly movesN: Move[] = [
    { q: 'forall', v: 'x', dom: 'N', who: '對手出', value: '0' },
    { q: 'exists', v: 'y', dom: 'N', who: '你出' },
  ];

  /** The learner's rule is y = x + c with c < 0, so at x = 0 it gives c. */
  readonly zAtZero = computed(() => {
    const r = this.zRule();
    return r ? fmtQ(r.c) : '';
  });

  readonly predictNote = computed(() => {
    const p = this.predicted();
    if (p === 'no') return '你預測不能，對。';
    if (p === 'yes') return '你預測還能贏，可是 ℕ 裡沒有負數。';
    return '你選了說不準；對手第一招就分出勝負了。';
  });

  tryZero(): void {
    const r = readNumber(this.draft());
    if (!r.ok) {
      this.zeroMsg.set(r.msg);
      return;
    }
    const v = r.v;
    this.zeroTries.update((n) => n + 1);
    this.draft.set('');
    if (!isInt(v) || v.n < 0) {
      this.zeroMsg.set(`${fmtQ(v)} 不在 ℕ 裡，這一招不合法。`);
    } else {
      this.zeroMsg.set(`${fmtQ(v)} < 0 不成立：${fmtQ(v)} 沒有比 0 小。`);
    }
  }

  refute(): void {
    this.refuted.set(true);
    this.zeroMsg.set(null);
    this.progress.markCompleted('proofs-ch4', '3');
  }
}
