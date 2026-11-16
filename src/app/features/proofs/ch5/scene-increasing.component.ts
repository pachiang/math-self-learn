import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { NegSpec, NegateMachineComponent } from './negate-machine.component';

type Bet = 'yes' | 'no' | 'unsure';

/** Rises, stays flat on [2, 4], rises again: never goes down, yet not strictly increasing. */
const f = (x: number) => (x <= 2 ? x : x <= 4 ? 2 : x - 2);
const KNOTS: [number, number][] = [
  [0, 0],
  [2, 2],
  [4, 2],
  [6, 4],
];

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

const INC_SPEC: NegSpec = {
  quants: [
    { q: 'forall', v: 'a', dom: 'Z', domText: '0～6 的數', all: '對每個 a', some: '存在 a' },
    { q: 'forall', v: 'b', dom: 'Z', domText: '0～6 的數', all: '對每個 b', some: '存在 b' },
  ],
  body: '若 a < b，則 f(a) < f(b)',
  options: [
    {
      text: 'a < b，而且 f(a) > f(b)',
      ok: false,
      why: '「f(a) < f(b)」的反面要把相等也收下，這是第 3 幕的等號格。f(a) = f(b) 時，原來的結論不成立，這一句也不成立，兩句一起不成立。',
    },
    {
      text: '若 a < b，則 f(a) ≥ f(b)',
      ok: false,
      why: '這又許了一個新的承諾。第 4 幕說過，打破「若…則」不是再許一個承諾，而是違約格裡真的有一個例子。',
    },
    {
      text: 'a < b，而且 f(a) ≥ f(b)',
      ok: true,
      why: '對。前提 a < b 留著，結論 f(a) < f(b) 翻成剛好相反的 f(a) ≥ f(b)，等號那一格也收進來了。',
    },
    {
      text: 'a ≥ b，而且 f(a) ≥ f(b)',
      ok: false,
      why: '違約格是「前提成立、結論不成立」，所以前提 a < b 要原封不動留著，只翻結論。',
    },
  ],
  check: '若 a < b，則 f(a) < f(b)',
  negCheck: 'a < b，而且 f(a) ≥ f(b)',
};

// Plot frame: x ∈ [0, 6], y ∈ [0, 4].
const X0 = 64;
const X1 = 524;
const Y0 = 300;
const Y1 = 44;
const sx = (x: number) => X0 + ((X1 - X0) * x) / 6;
const sy = (y: number) => Y0 - ((Y0 - Y1) * y) / 4;

@Component({
  selector: 'app-pf-increasing',
  standalone: true,
  imports: [NegateMachineComponent, RouterLink],
  styleUrl: './scene-increasing.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">5 / 5 · 遷移</p>
        <h1 class="pf-title">f 是遞增函數嗎？</h1>
        <p class="pf-lede">最後一題換一種材料：一個函數的定義。這次沒有提示，整台機器由你自己跑完。</p>

        <div class="pf-def">
          <small>定義 · 本課的「遞增」指嚴格遞增（strictly increasing）</small>
          <p>f 是遞增函數：對每個 a、對每個 b，若 a &lt; b，則 f(a) &lt; f(b)。</p>
        </div>
        <p class="pf-note">下面的 f 定義在 0 到 6 之間，a、b 都從 0 到 6 之間挑。</p>

        <div class="plot-wrap">
          <svg class="plot" viewBox="0 0 560 360" role="img" [attr.aria-label]="plotLabel()">
            @for (g of gridX; track g) {
              <line [attr.x1]="sx(g)" [attr.x2]="sx(g)" [attr.y1]="sy(0)" [attr.y2]="sy(4)" class="grid" />
              <text [attr.x]="sx(g)" [attr.y]="sy(0) + 22" class="tick" text-anchor="middle">{{ g }}</text>
            }
            @for (g of gridY; track g) {
              <line [attr.x1]="sx(0)" [attr.x2]="sx(6)" [attr.y1]="sy(g)" [attr.y2]="sy(g)" class="grid" />
              <text [attr.x]="sx(0) - 12" [attr.y]="sy(g) + 5" class="tick" text-anchor="end">{{ g }}</text>
            }
            <line [attr.x1]="sx(0)" [attr.x2]="sx(6)" [attr.y1]="sy(0)" [attr.y2]="sy(0)" class="axis" />
            <line [attr.x1]="sx(0)" [attr.x2]="sx(0)" [attr.y1]="sy(0)" [attr.y2]="sy(4)" class="axis" />
            <polyline [attr.points]="curve" class="curve" />
            <text [attr.x]="sx(6) + 8" [attr.y]="sy(4) + 5" class="fname">f</text>

            @if (negDone()) {
              <g class="pt a">
                <line [attr.x1]="sx(a())" [attr.x2]="sx(a())" [attr.y1]="sy(0)" [attr.y2]="sy(fa())" class="drop" />
                <line [attr.x1]="sx(0)" [attr.x2]="sx(a())" [attr.y1]="sy(fa())" [attr.y2]="sy(fa())" class="drop" />
                <circle [attr.cx]="sx(a())" [attr.cy]="sy(fa())" r="8" />
                <text [attr.x]="sx(a())" [attr.y]="sy(0) + 42" text-anchor="middle" class="lab">a</text>
              </g>
              <g class="pt b">
                <line [attr.x1]="sx(b())" [attr.x2]="sx(b())" [attr.y1]="sy(0)" [attr.y2]="sy(fb())" class="drop" />
                <line [attr.x1]="sx(0)" [attr.x2]="sx(b())" [attr.y1]="sy(fb())" [attr.y2]="sy(fb())" class="drop" />
                <rect [attr.x]="sx(b()) - 7" [attr.y]="sy(fb()) - 7" width="14" height="14" />
                <text [attr.x]="sx(b())" [attr.y]="sy(0) + 42" text-anchor="middle" class="lab">b</text>
              </g>
            }
          </svg>

          @if (negDone()) {
            <div class="ctrl pf-rise">
              <label class="sl">
                <span>● a = <b class="pf-num">{{ fmt(a()) }}</b></span>
                <input type="range" min="0" max="6" step="0.5" [value]="a()" (input)="setA($any($event.target).value)" [disabled]="found()" aria-label="a，0 到 6，每格 0.5" />
              </label>
              <label class="sl">
                <span>■ b = <b class="pf-num">{{ fmt(b()) }}</b></span>
                <input type="range" min="0" max="6" step="0.5" [value]="b()" (input)="setB($any($event.target).value)" [disabled]="found()" aria-label="b，0 到 6，每格 0.5" />
              </label>
              <table class="pf-table vals">
                <caption class="pf-sr-only">目前挑的 a、b 與函數值</caption>
                <tr><th></th><th>值</th><th>f 的值</th></tr>
                <tr><td>● a</td><td class="pf-num">{{ fmt(a()) }}</td><td class="pf-num">f(a) = {{ fmt(fa()) }}</td></tr>
                <tr><td>■ b</td><td class="pf-num">{{ fmt(b()) }}</td><td class="pf-num">f(b) = {{ fmt(fb()) }}</td></tr>
              </table>
              @if (!found()) {
                <button type="button" class="pf-btn primary small" (click)="check()">用這一對 a、b</button>
              }
            </div>
          }
        </div>

        @if (!betDone()) {
          <p class="pf-q">照上面的定義，f 是遞增函數嗎？</p>
          <div class="pf-row" role="group" aria-label="f 是遞增函數嗎？">
            @for (o of betOpts; track o.v) {
              <button type="button" class="pf-btn" [class.picked]="bet() === o.v" [attr.aria-pressed]="bet() === o.v" (click)="bet.set(o.v)">{{ o.label }}</button>
            }
          </div>
          <div class="pf-row"><button type="button" class="pf-btn primary" [disabled]="!bet()" (click)="betDone.set(true)">我判斷好了</button></div>
        } @else {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>原句</small>
              <p>f 是遞增函數。</p>
              @if (found()) {
                <span class="pf-seal refuted stamp">推翻</span>
              }
            </div>
            <p class="pf-p">先別看圖下結論。要說「f 不是遞增函數」，得先知道這句話的否定長什麼樣子。把「並非」放在定義最前面，推到底。</p>
            <app-pf-negate [spec]="spec" label="遞增的定義" (finished)="negDone.set(true)" />
          </div>
        }

        @if (negDone()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>否定句</small>
              <p>存在 a、存在 b，a &lt; b，而且 f(a) ≥ f(b)。</p>
              @if (found()) {
                <span class="pf-seal proved stamp">證明</span>
              }
            </div>
            <p class="pf-p">原定義的兩招都是對手出；否定句裡兩招都換你出。要說 f 不是遞增，你只要親手挑出一對 a、b。拖動圖旁的兩個滑桿試試。</p>
            @if (msg(); as m) {
              <p class="pf-feedback" [class.good]="found()" [class.bad]="!found()" role="status">{{ m }}</p>
            }
          </div>
        }

        @if (found()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">{{ betNote() }}</p>
            <div class="pf-takeaway reveal">
              <small>本章帶走這一句</small>
              <p>否定一句話：每跨過一個量詞就翻面，<br />「並非」推到最裡面，再把條件翻得剛好。<br />翻完之後，原本的對手就變成了你。</p>
            </div>
            <details class="pf-why">
              <summary>別的書說這個 f 是「遞增」的？</summary>
              <div>
                <p>有些教材的「遞增」允許相等：a &lt; b 時 f(a) ≤ f(b)，英文常叫 non-decreasing。照那個定義，這個 f 是遞增的，因為它從來沒有往下走。</p>
                <p>定義一換，否定句也跟著換：那時的否定是「存在 a &lt; b，使 f(a) &gt; f(b)」，平的那一段就不算反例了。所以讀到「遞增」，先看清楚是哪一個定義。</p>
              </div>
            </details>
            <details class="pf-why">
              <summary>如果怎麼拖都找不到 a、b 呢？</summary>
              <div>
                <p>那還不能說 f 是遞增的。滑桿只有十三個位置，你試的永遠是有限多對；而原定義要求<b>每一對</b> a &lt; b 都過關，那是對手出招的遊戲。要贏下它，得寫出一段對任何 a、b 都成立的論證，這是第 6 章要做的事。</p>
              </div>
            </details>
            <p class="pf-note">
              第 25 章的 ε–N 定義有三層量詞，否定它用的是同一台機器。下一章正式引入證明狀態板：<a routerLink="/learn/proofs/ch6/1">前往第 6 章「目標的形狀決定第一步」→</a>
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneIncreasingComponent {
  private readonly progress = inject(LearnProgressService);

  readonly spec = INC_SPEC;
  readonly betOpts: { v: Bet; label: string }[] = [
    { v: 'yes', label: '是' },
    { v: 'no', label: '不是' },
    { v: 'unsure', label: '說不準' },
  ];
  readonly gridX = [0, 1, 2, 3, 4, 5, 6];
  readonly gridY = [0, 1, 2, 3, 4];
  readonly curve = KNOTS.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ');
  readonly sx = sx;
  readonly sy = sy;
  readonly fmt = fmt;

  readonly bet = signal<Bet | null>(null);
  readonly betDone = signal(false);
  readonly negDone = signal(false);
  readonly a = signal(1);
  readonly b = signal(5);
  readonly found = signal(false);
  readonly msg = signal<string | null>(null);

  readonly fa = computed(() => f(this.a()));
  readonly fb = computed(() => f(this.b()));

  readonly plotLabel = computed(() => {
    const base = 'f 的圖：從 (0, 0) 往上到 (2, 2)，在 2 到 4 之間保持 2，再往上到 (6, 4)。';
    return this.negDone() ? `${base} 目前 a = ${fmt(this.a())}，f(a) = ${fmt(this.fa())}；b = ${fmt(this.b())}，f(b) = ${fmt(this.fb())}。` : base;
  });

  readonly betNote = computed(() => {
    const b = this.bet();
    const pair = `a = ${fmt(this.a())}、b = ${fmt(this.b())}`;
    if (b === 'yes') return `你一開始判斷它是遞增的。它確實從來沒往下走，可是本課的「遞增」要求每次都嚴格變大，平的那一段做不到：${pair} 就是證據。`;
    if (b === 'no') return `你一開始就判斷它不是遞增的，對。現在你不只是看出來，還拿得出證據：${pair}。`;
    return `你一開始說不準。現在有答案了，而且有證據：${pair}。`;
  });

  setA(v: string): void {
    this.a.set(Number(v));
    this.msg.set(null);
  }

  setB(v: string): void {
    this.b.set(Number(v));
    this.msg.set(null);
  }

  check(): void {
    const a = this.a();
    const b = this.b();
    if (a >= b) {
      this.msg.set(`a = ${fmt(a)}、b = ${fmt(b)}，a 沒有比 b 小。否定句的第一個條件是 a < b，先讓 a 在 b 的左邊。`);
      return;
    }
    if (f(a) < f(b)) {
      this.msg.set(`f(${fmt(a)}) = ${fmt(f(a))}，f(${fmt(b)}) = ${fmt(f(b))}，f(a) < f(b)，原定義在這一對上守住了。找一對讓 f(a) ≥ f(b) 的。`);
      return;
    }
    this.found.set(true);
    this.msg.set(`a = ${fmt(a)} < b = ${fmt(b)}，而 f(a) = f(b) = ${fmt(f(a))}。f(a) ≥ f(b) 成立，否定句被你證明了。`);
    this.progress.markCompleted('proofs-ch5', '5');
  }
}
