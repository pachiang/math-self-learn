import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
const MYTH = [
  { list: [2], n: 3 },
  { list: [2, 3], n: 7 },
  { list: [2, 3, 5], n: 31 },
  { list: [2, 3, 5, 7], n: 211 },
  { list: [2, 3, 5, 7, 11], n: 2311 },
];

/** Prime factors with multiplicity; N stays below 2.1e11 here, so trial division is quick. */
function factor(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let d = 2; d * d <= m; d += d === 2 ? 1 : 2) {
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

const BEATS = [
  { id: 1, text: '假設 p₁, p₂, …, pₙ 就是全部的質數。' },
  { id: 2, text: '令 N = p₁p₂⋯pₙ + 1。N ≥ 3，所以 N 至少有一個質因數 q。' },
  { id: 3, text: 'N 除以清單裡任何一個質數都餘 1，所以 q 不在清單裡。' },
  { id: 4, text: '可是第 1 拍說清單就是全部的質數，q 應該在清單裡。矛盾。' },
];

@Component({
  selector: 'app-pf-primes',
  standalone: true,
  imports: [RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', './ch8.scss', './ch8-primes.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">5 / 6 · 質數</p>
        <h1 class="pf-title">質數的清單，<br />永遠列不完</h1>
        <p class="pf-lede">質數有無限多個。這個證明很有名，也很常被講錯。先看一個流傳很廣的說法：</p>
        <div class="c7-claim">
          <small>流傳的說法</small>
          <p>把前幾個質數乘起來再加 1，得到的一定是質數。</p>
        </div>
        <ol class="c8-myth" aria-label="前五個例子">
          @for (m of myth; track m.n) {
            <li><span>{{ m.list.join(' · ') }} + 1 = {{ m.n }}</span><span class="ok">是質數</span></li>
          }
        </ol>
        <p class="pf-p">五個例子都對<span class="c8-tag">例子</span>。下一個是 2 · 3 · 5 · 7 · 11 · 13 + 1 = 30031。先猜：</p>
        @if (!mythGuess()) {
          <div class="c7-predict" role="group" aria-label="30031 是質數嗎">
            <button type="button" class="pf-btn" (click)="mythGuess.set('prime')">我猜是質數</button>
            <button type="button" class="pf-btn" (click)="mythGuess.set('not')">我猜不是</button>
          </div>
        } @else {
          <p class="pf-feedback c7-verdict pf-rise" [class.bad]="mythGuess() === 'prime'" [class.good]="mythGuess() === 'not'" role="status">
            <span>
              你猜{{ mythGuess() === 'prime' ? '是質數' : '不是' }}。30031 = 59 × 509，不是質數。這一個例子就推翻了「一定是質數」。這是第 1 章的老教訓：規律撐了五步，第六步背叛。
            </span>
            <span class="pf-seal mini refuted stamp">推翻</span>
          </p>
        }

        @if (mythGuess()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              可是 59 和 509 有一件事很特別：它們都不在 2、3、5、7、11、13 這張清單裡。這是巧合嗎？自己挑一張清單試試，任何質數都可以，不必從 2 開始：
            </p>
            <div class="c8-machine">
              <div class="c8-primes" role="group" aria-label="挑選清單裡的質數">
                @for (p of primes; track p) {
                  <button type="button" class="c8-prime" [class.on]="list().includes(p)" [attr.aria-pressed]="list().includes(p)" (click)="toggle(p)">{{ p }}</button>
                }
              </div>
              @if (list().length) {
                <p class="c8-N" aria-live="polite">N = {{ list().join(' · ') }} + 1 = {{ N() }}</p>
                <div class="c8-factors">
                  <span>N 的質因數：</span>
                  @for (f of factors(); track f.p) {
                    <span class="c8-factor">{{ f.p }}@if (f.e > 1) {<sup>{{ f.e }}</sup>}<small>不在清單裡</small></span>
                  }
                  <span class="pf-note">{{ factorNote() }}</span>
                </div>
                <div class="c8-rems" aria-label="N 除以清單裡每個質數的餘數">
                  @for (p of list(); track p) {
                    <span class="c8-rem">N ÷ {{ p }} 餘 1</span>
                  }
                </div>
              } @else {
                <p class="pf-note">點選上面的質數，放進清單。</p>
              }
            </div>
            <p class="pf-note">試過 {{ tried().size }} 張清單。目標：找一張清單，讓 N 的某個質因數出現在清單裡。</p>
          </div>
        }

        @if (tried().size >= 4) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              找不到，也永遠找不到。看那排「餘 1」：N − 1 是清單裡每個質數的倍數，所以 N 除以它們都剩 1，沒有一個整除 N。N 的質因數只能在清單外面。
            </p>
            <p class="pf-p">
              所以正確的說法不是「N 是質數」，而是「N 的質因數都不在清單裡」。N 可能是質數，也可能不是，但它一定帶來一個清單外的質數。把它寫成反證：
            </p>
            <ol class="c6-proof">
              @for (b of beats; track b.id) {
                <li [class.cur]="pickedBeat() === b.id">
                  <span class="c6-ln">{{ b.id }}</span><span>{{ b.text }}</span>
                </li>
              }
            </ol>
            <details class="pf-why">
              <summary>為什麼 N 一定有質因數？</summary>
              <div>
                <p>每個 ≥ 2 的整數都至少有一個質因數：它若不是質數，就能拆成兩個更小的因數，再看其中一個……這樣拆下去不會沒完沒了。</p>
                <p>「不會沒完沒了」正是第 12 章「最小反例」要證的事，第 11 章的強歸納也會再證一次。這裡先當成已知的事實用。</p>
              </div>
            </details>
            <p class="pf-q small" style="font-size: 20px">「清單就是全部的質數」這個假設，在哪一拍才第一次用到？</p>
            <div class="pf-row" role="group" aria-label="選一拍">
              @for (b of [2, 3, 4]; track b) {
                <button type="button" class="pf-btn" [class.picked]="pickedBeat() === b" (click)="pickBeat(b)">第 {{ b }} 拍</button>
              }
            </div>
            @if (beatMsg(); as m) {
              <p class="pf-feedback" [class.good]="pickedBeat() === 4" [class.bad]="pickedBeat() !== 4" role="status">{{ m }}</p>
            }
          </div>
        }

        @if (pickedBeat() === 4) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              第 2、3 拍對任何一張清單都成立，根本不需要「清單是全部」。把第 1、4 拍拿掉，剩下的就是一個直接的證明：
            </p>
            <div class="pf-def">
              <small>不用反證的版本</small>
              <p>給我任何一張有限的質數清單，我都造得出一個不在清單裡的質數：N = 清單乘起來 + 1 的任何一個質因數。所以沒有一張有限清單裝得下全部質數。</p>
            </div>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>反證的假設要真的被用到。<br />如果它只在最後一行出場，拿掉它，往往就剩下一個更直接、更有用的證明。</p>
            </div>
            <p class="pf-note">那到底什麼時候該用哪一種？<a routerLink="/learn/proofs/ch8/6">最後一幕</a>把三種走法放在一起比。</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class ScenePrimesComponent {
  private readonly progress = inject(LearnProgressService);

  readonly primes = PRIMES;
  readonly myth = MYTH;
  readonly beats = BEATS;

  readonly mythGuess = signal<'prime' | 'not' | null>(null);
  readonly list = signal<number[]>([2, 3, 5, 7, 11, 13]);
  readonly tried = signal(new Set<string>(['2,3,5,7,11,13']));
  readonly pickedBeat = signal<number | null>(null);
  readonly beatMsg = signal<string | null>(null);

  readonly N = computed(() => this.list().reduce((a, b) => a * b, 1) + 1);
  /** Distinct prime factors with exponents: 16 → 2⁴. */
  readonly factors = computed(() => {
    const out: { p: number; e: number }[] = [];
    for (const f of factor(this.N())) {
      const last = out[out.length - 1];
      if (last && last.p === f) last.e++;
      else out.push({ p: f, e: 1 });
    }
    return out;
  });
  readonly factorNote = computed(() => {
    const f = this.factors();
    if (f.length === 1 && f[0].e === 1) return '（N 本身就是質數）';
    return `（N = ${f.map((x) => x.p + (x.e > 1 ? String(x.e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]) : '')).join(' × ')}，不是質數）`;
  });

  toggle(p: number): void {
    this.list.update((l) => (l.includes(p) ? l.filter((x) => x !== p) : [...l, p].sort((a, b) => a - b)));
    if (this.list().length) this.tried.update((t) => new Set(t).add(this.list().join()));
  }

  pickBeat(b: number): void {
    this.pickedBeat.set(b);
    if (b === 4) {
      this.beatMsg.set('對，只有第 4 拍用到它。第 2 拍的 N 對任何清單都能做，第 3 拍的「餘 1」也是。');
      this.progress.markCompleted('proofs-ch8', '5');
    } else if (b === 2) {
      this.beatMsg.set('第 2 拍只是把清單乘起來再加 1，任何清單都能這樣做，不管它是不是全部的質數。');
    } else {
      this.beatMsg.set('「除以清單裡的質數都餘 1」對任何清單都成立；這一拍只用到 N 是怎麼造出來的。');
    }
  }
}
