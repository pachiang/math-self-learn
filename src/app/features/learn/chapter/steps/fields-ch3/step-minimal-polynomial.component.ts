import { Component, computed, signal } from '@angular/core';

interface Candidate {
  display: string;
  vanishes: boolean;
  degree: number;
  monic: boolean;
  factor: string | null; // 非 null = 可約
  minimal: boolean;
  note: string;
}

interface RootCase {
  id: string;
  rootNote: string;
  minimalDisplay: string;
  dim: number;
  candidates: Candidate[];
}

const CASES: RootCase[] = [
  {
    id: 'sqrt2',
    rootNote: 'α = √2',
    minimalDisplay: 'x² − 2',
    dim: 2,
    candidates: [
      { display: 'x² − 2', vanishes: true, degree: 2, monic: true, factor: null, minimal: true, note: '通過、monic、無法再分解——這就是 minimal polynomial。' },
      { display: '2x² − 4', vanishes: true, degree: 2, monic: false, factor: null, minimal: false, note: '同一個根，但 leading 係數是 2，不是 monic；除以 2 就回到 x² − 2。' },
      { display: 'x³ − 2x', vanishes: true, degree: 3, monic: true, factor: 'x · (x² − 2)', minimal: false, note: '可約：α 落進因式 x² − 2，代表還有更小次數的方程。' },
      { display: 'x⁴ − 4', vanishes: true, degree: 4, monic: true, factor: '(x² − 2)(x² + 2)', minimal: false, note: '更大、可約；根其實由因式 x² − 2 抓住。' },
      { display: 'x² − 3', vanishes: false, degree: 2, monic: true, factor: null, minimal: false, note: '根本不通過 √2（√2² − 3 = −1 ≠ 0）。' },
    ],
  },
  {
    id: 'cbrt2',
    rootNote: 'α = ∛2',
    minimalDisplay: 'x³ − 2',
    dim: 3,
    candidates: [
      { display: 'x³ − 2', vanishes: true, degree: 3, monic: true, factor: null, minimal: true, note: '通過、monic、無法再分解——這就是 minimal polynomial。' },
      { display: 'x⁴ − 2x', vanishes: true, degree: 4, monic: true, factor: 'x · (x³ − 2)', minimal: false, note: '可約：α 落進因式 x³ − 2，還有更小的。' },
      { display: 'x² − 2', vanishes: false, degree: 2, monic: true, factor: null, minimal: false, note: '不通過 ∛2（∛2² = ∛4 ≠ 2 的來源，代入不為零）。' },
      { display: 'x³ − 3', vanishes: false, degree: 3, monic: true, factor: null, minimal: false, note: '不通過 ∛2（∛2³ − 3 = 2 − 3 = −1 ≠ 0）。' },
    ],
  },
];

@Component({
  selector: 'app-fields-ch3-minimal-polynomial',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 3.2</p>
        <h2>那條方程的「身份證」：minimal polynomial</h2>
        <p class="lede">
          α = √2 滿足<strong>好幾條</strong>方程。做還原時用的是哪一條？是那條<strong>最小次數、monic</strong> 的——而且它一定
          <strong>irreducible</strong>（不然 α 會落進更小的因式）。這條就是 α 的身份證 <code>m(x)</code>。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>下面哪一條，才是 α = √2 做還原用的那條方程？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'deg2'" (click)="prediction.set('deg2')">x² − 2</button>
          <button type="button" [class.active]="prediction() === 'deg3'" (click)="prediction.set('deg3')">x³ − 2x</button>
          <button type="button" [class.active]="prediction() === 'any'" (click)="prediction.set('any')">哪條都行</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'deg2'">
            {{ prediction() === 'deg2'
              ? '對。x² − 2 最小、monic、不可分解。點下面每一條，看它們為何落選。'
              : '不是哪條都行：要最小次數、monic、且不可再分解。逐一點下面看看。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選根">
        <span class="kicker">ROOT</span>
        @for (c of cases; track c.id) {
          <button type="button" [class.active]="rootCase().id === c.id" (click)="pickCase(c)">{{ c.rootNote }}</button>
        }
        <span class="kicker">候選方程</span>
        @for (cand of rootCase().candidates; track cand.display; let i = $index) {
          <button type="button" [class.active]="index() === i" (click)="index.set(i)">{{ cand.display }}</button>
        }
      </div>

      <section class="stage minpoly-grid">
        <div class="minpoly-board">
          <p class="board-scope">候選：<strong>{{ current().display }}</strong>（{{ rootCase().rootNote }}）</p>
          <div class="check-row">
            <div class="check" [class.ok]="current().vanishes" [class.no]="!current().vanishes">
              <span class="ck-label">通過 α？</span>
              <span class="ck-val">{{ current().vanishes ? '是，代入為零' : '否，代入不為零' }}</span>
            </div>
            <div class="check" [class.ok]="current().monic" [class.no]="!current().monic">
              <span class="ck-label">monic？</span>
              <span class="ck-val">{{ current().monic ? '是（最高次係數 1）' : '否（最高次係數 ≠ 1）' }}</span>
            </div>
            <div class="check" [class.ok]="current().vanishes && current().factor === null" [class.no]="current().factor !== null">
              <span class="ck-label">不可分解？</span>
              <span class="ck-val">{{ current().factor === null ? '是（irreducible）' : '否：' + current().factor }}</span>
            </div>
          </div>
          <p class="verdict" [class.is-min]="current().minimal">
            {{ current().minimal ? '★ 這就是 minimal polynomial' : '落選：' }} {{ current().note }}
          </p>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">身份證</p>
          <h3>m(x) = {{ rootCase().minimalDisplay }}</h3>
          <p>唯一的最小 monic、irreducible 方程；其它候選要嘛非 monic、要嘛可約、要嘛根本不通過。</p>
          <div class="readout">deg m = {{ rootCase().dim }} —— 正是 Ch2 觀察到的維度 [ℚ({{ rootCase().rootNote.slice(4) }}):ℚ]。</div>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（若可約，α 會滿足更小因式 → 不是最小）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">m(x)</span>
        <div>
          <strong>每個 α 有唯一一張身份證</strong>
          <span>——最小的 monic 方程，而且一定 irreducible；它的次數就是擴張的維度。</span>
        </div>
      </section>

      <details>
        <summary>符號層：minimal polynomial 的存在與唯一</summary>
        <p>
          在 <code>K[x]</code> 裡，讓 α 為零的所有多項式構成一個 ideal；因 <code>K[x]</code> 是 PID，這個 ideal 由單一一條 monic 生成，
          就是 <code>m(x)</code>。若 <code>m = f·g</code> 可約，則 <code>f(α)g(α) = 0</code>，α 會滿足更小次數的 f 或 g，與「最小」矛盾——所以
          <code>m</code> 必 irreducible，且 <code>deg m = [K(α):K]</code>。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh3MinimalPolynomialComponent {
  readonly cases = CASES;
  readonly rootCase = signal<RootCase>(CASES[0]);
  readonly index = signal(0);
  readonly prediction = signal<'deg2' | 'deg3' | 'any' | null>(null);

  readonly current = computed(() => this.rootCase().candidates[this.index()]);

  pickCase(c: RootCase): void {
    this.rootCase.set(c);
    this.index.set(0);
  }
}
