import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { readNumber } from '../ch2/ch2-expr';
import { DIV_SUM_FALSE, Move } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';

const OPENING: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'unfold', h: 'H1' },
  { card: 'obtain', h: 'H2', name: 'k' },
  { card: 'unfoldGoal' },
];

/** a ∣ n under the course convention: 0 ∣ n only when n = 0. */
const divides = (a: number, n: number): boolean => (a === 0 ? n === 0 : n % a === 0);
const num = (x: number): string => String(x).replace('-', '−');

@Component({
  selector: 'app-pf-gap',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', './ch7.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">3 / 5 · 缺口</p>
        <h1 class="pf-title">橋接不上的時候</h1>
        <p class="pf-lede">這一句和上一幕很像，一樣是整除，一樣兩端換成定義。先猜，再上板子。</p>

        <div class="c7-claim">
          <small>要判斷的句子</small>
          <p>對每個整數 a、b、c，若 a ∣ b + c，則 a ∣ b。</p>
        </div>

        @if (!guess()) {
          <div class="c7-predict" role="group" aria-label="先猜這句對不對">
            <button type="button" class="pf-btn" (click)="guess.set('true')">我猜對</button>
            <button type="button" class="pf-btn" (click)="guess.set('false')">我猜不對</button>
          </div>
        } @else {
          <p class="pf-feedback you" role="status">
            你猜{{ guess() === 'true' ? '它對' : '它不對' }}。先別急著確認，走一遍就知道了：證得出來就是對，證不出來的地方會告訴你為什麼。
          </p>

          <div class="c6-block pf-rise">
            <p class="pf-p">開頭照形狀走，板子已經走好了。剩下的是中段：在橋上從 b 出發，代入已知，試著把它寫成 a × □。</p>
            <app-pf-board
              [start]="start"
              [prefix]="opening"
              bridge="manual"
              [frozen]="stuck()"
              label="句子：若 a ∣ b + c，則 a ∣ b"
              idBase="pf-c7-gap"
              (refused)="onRefused($event.code)"
            />
            @if (!stuck()) {
              <button type="button" class="pf-btn small c7-giveup" (click)="giveUp()">我填不出 □</button>
            }
          </div>
        }

        @if (stuck()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              橋往前只走得到 <b class="pf-num">b = ak − c</b>。要寫成 a × □，ak 那一項沒問題，可是 c 那一項得是 a 的倍數，□ 才填得出整數。
            </p>
            <p class="pf-p">板上的已知只說 <b>b + c</b> 是 a 的倍數，沒有任何一條說 <b>c</b> 是 a 的倍數。缺的就是這一塊。</p>
            <div class="c7-missing" aria-label="缺的那一塊">
              <small>缺的那一塊</small>
              <p>c 是 a 的倍數（a ∣ c）</p>
            </div>
            <p class="pf-p">
              缺口本身就是反例的設計圖：故意讓 c <b>不是</b> a 的倍數，同時讓 b + c 是。試著找一組 a、b、c，讓前提成立、結論不成立。
            </p>
            <form class="c7-blanks" (submit)="$event.preventDefault(); checkCounter()">
              @for (n of ['a', 'b', 'c']; track n; let i = $index) {
                <label class="c7-blank">
                  <small>{{ n }}</small>
                  <input class="pf-input" inputmode="numeric" autocomplete="off" [value]="abc()[i]" (input)="setAbc(i, $any($event.target).value)" [disabled]="refuted()" />
                </label>
              }
              @if (!refuted()) {
                <button type="submit" class="pf-btn primary small">檢查這組</button>
              }
            </form>
            @if (counterMsg(); as m) {
              <p class="pf-feedback c7-verdict" [class.bad]="!refuted()" [class.good]="refuted()" role="status">
                <span>{{ m }}</span>
                @if (refuted()) {
                  <span class="pf-seal mini refuted stamp">推翻</span>
                }
              </p>
            }
          </div>
        }

        @if (refuted()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              你{{ guess() === 'false' ? '猜對了' : '一開始猜它對' }}。重點不在猜，而在證不出來的那一步：它正好指出反例要怎麼設計。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>橋接不上，不一定是你不夠聰明；<br />缺的那一塊，常常就是反例的設計圖。</p>
            </div>
            <p class="pf-note">那如果把缺的那一塊加進前提呢？<a routerLink="/learn/proofs/ch7/4">下一幕</a>就這麼做。</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneGapComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = DIV_SUM_FALSE;
  readonly opening = OPENING;
  readonly guess = signal<'true' | 'false' | null>(null);
  readonly stuck = signal(false);
  readonly abc = signal(['', '', '']);
  readonly counterMsg = signal<string | null>(null);
  readonly refuted = signal(false);

  onRefused(code: string): void {
    if (code === 'neq') this.stuck.set(true);
  }

  giveUp(): void {
    this.stuck.set(true);
  }

  setAbc(i: number, v: string): void {
    this.abc.update((d) => d.map((x, j) => (j === i ? v : x)));
  }

  checkCounter(): void {
    const vals: number[] = [];
    for (const [i, n] of ['a', 'b', 'c'].entries()) {
      const r = readNumber(this.abc()[i]);
      if (!r.ok) return this.counterMsg.set(`${n}：${r.msg}`);
      if (r.v.d !== 1) return this.counterMsg.set(`${n} 要是整數。`);
      if (Math.abs(r.v.n) > 1e6) return this.counterMsg.set(`${n} 太大了，換小一點的數。`);
      vals.push(r.v.n);
    }
    const [a, b, c] = vals;
    const s = b + c;
    const [A, B, S] = [a, b, s].map(num);
    if (!divides(a, s)) {
      this.counterMsg.set(
        a === 0
          ? `前提不成立：b + c = ${S}，而 0 只整除 0。反例要讓前提成立。`
          : `前提不成立：b + c = ${S}，不是 ${A} 的倍數。反例要讓前提成立。`,
      );
      return;
    }
    if (divides(a, b)) {
      this.counterMsg.set(
        `前提成立，可是結論也成立：${B} 是 ${A} 的倍數。照缺口的提示，讓 c 不是 ${A} 的倍數。`,
      );
      return;
    }
    this.refuted.set(true);
    this.counterMsg.set(`前提成立：${A} ∣ ${S}。結論不成立：${A} 不整除 ${B}。這一組就是反例。`);
    this.progress.saveStepData('proofs-ch7', '3', 'counter', { a, b, c });
    this.progress.markCompleted('proofs-ch7', '3');
  }
}
