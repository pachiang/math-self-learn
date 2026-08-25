import { Component, computed, signal } from '@angular/core';

interface Elem {
  label: string;
  degree: number;
  minPoly: string;
  insider: boolean;
}

const DIM = 4; // [ℚ(√2, √3) : ℚ]

const ELEMS: Elem[] = [
  { label: '有理數 q', degree: 1, minPoly: 'x − q', insider: true },
  { label: '√2', degree: 2, minPoly: 'x² − 2', insider: true },
  { label: '√3', degree: 2, minPoly: 'x² − 3', insider: true },
  { label: '√6', degree: 2, minPoly: 'x² − 6', insider: true },
  { label: '√2 + √3', degree: 4, minPoly: 'x⁴ − 10x² + 1', insider: true },
  { label: '∛2', degree: 3, minPoly: 'x³ − 2', insider: false },
];

@Component({
  selector: 'app-fields-ch4-divides-tower',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 4.3</p>
        <h2>推論：子擴張的次數必整除塔高</h2>
        <p class="lede">
          每個元素 α 都住在某個中間 field <code>ℚ(α)</code>，而 <code>ℚ(α)</code> 是塔的一層。由 tower law，一層的高度必<strong>整除</strong>總高：
          <code>deg(α) ∣ [L:ℚ]</code>。在維度 <strong>4</strong> 的世界裡，次數只能是 1、2、4——<strong>不會有次數 3</strong>。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>在維度 4 的 ℚ(√2, √3) 裡，會不會有某個元素在 ℚ 上的次數是 3？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">會有</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">不會</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'yes'">
            {{ prediction() === 'no'
              ? '對。3 不整除 4，所以維度 4 的世界裡沒有次數 3 的元素。點下面每個元素驗證。'
              : '不會：次數必整除塔高 4，而 3 ∤ 4。所以 ∛2 這種次數 3 的東西進不來。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選元素">
        <span class="kicker">元素（前 5 個在世界內，∛2 是外人）</span>
        @for (e of elems; track e.label; let i = $index) {
          <button type="button" [class.active]="index() === i" [class.outsider]="!e.insider" (click)="index.set(i)">{{ e.label }}</button>
        }
      </div>

      <section class="stage divide-stage">
        <div class="divide-board">
          <p class="board-scope" [class.is-field]="divides()">元素：<strong>{{ current().label }}</strong></p>
          <div class="tower-chain">
            <div class="tc-node">ℚ</div>
            <div class="tc-edge"><span>{{ current().degree }}</span></div>
            <div class="tc-node mid">ℚ({{ current().label }})</div>
            <div class="tc-edge dashed"><span>?</span></div>
            <div class="tc-node top">ℚ(√2, √3) · 維度 {{ dim }}</div>
          </div>
          <div class="divide-facts">
            <div class="fact"><span class="fk">minimal polynomial</span><span class="fv">{{ current().minPoly }}</span></div>
            <div class="fact"><span class="fk">在 ℚ 上的次數</span><span class="fv">{{ current().degree }}</span></div>
            <div class="fact"><span class="fk">{{ current().degree }} 整除 {{ dim }}？</span><span class="fv" [class.no-fv]="!divides()">{{ divides() ? '是 ✓' : '否 ✗' }}</span></div>
          </div>
          <p class="verdict" [class.is-min]="current().insider && divides()" [class.bad]="!current().insider">
            {{ verdict() }}
          </p>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">世界內出現過的次數</p>
          <div class="deg-strip">
            <span class="deg-chip in">1</span>
            <span class="deg-chip in">2</span>
            <span class="deg-chip miss">3<small>缺席</small></span>
            <span class="deg-chip in">4</span>
          </div>
          <p>每個次數都整除 4；唯獨 <strong>3 缺席</strong>，因為 3 ∤ 4。</p>
          <div class="readout">deg(α) ∣ [L:ℚ]：子擴張的次數必整除塔高。</div>
          <p class="evidence-tag">證據強度：GENERAL ARGUMENT（tower law 套在 ℚ ⊂ ℚ(α) ⊂ L）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">∣</span>
        <div>
          <strong>塔裡任何元素的次數，都得整除塔高</strong>
          <span>——所以次數 3 的東西進不了維度 4（更一般地，進不了任何「2 的冪」）的世界。</span>
        </div>
      </section>

      <section class="teaser">
        <p class="kicker">留給下一章的問題</p>
        <p class="teaser-body">
          因此 <code>∛2</code>（次數 3）進不了任何<strong>維度是 2 的冪</strong>的世界。下一章：尺規作圖每一步只造出一個<em>二次擴張</em>，
          所以能作圖的數都落在維度 2ⁿ 的塔裡——<strong>倍立方（做出 ∛2）因此不可能</strong>。這正是 constructibility。
        </p>
      </section>

      <details>
        <summary>符號層：deg(α) ∣ [L:F]</summary>
        <p>
          對 <code>α ∈ L</code>，有塔 <code>F ⊆ F(α) ⊆ L</code>，於是 <code>[L:F] = [L:F(α)]·[F(α):F]</code>。因 <code>[F(α):F] = deg(α)</code>，得
          <code>deg(α) ∣ [L:F]</code>。這把「一層必整除塔高」變成擋掉不合次數元素的判準——Ch5 的三大不可能都由它推出。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh4DividesTowerComponent {
  readonly dim = DIM;
  readonly elems = ELEMS;
  readonly index = signal(1); // 預設 √2
  readonly prediction = signal<'yes' | 'no' | null>(null);

  readonly current = computed(() => this.elems[this.index()]);
  readonly divides = computed(() => DIM % this.current().degree === 0);
  readonly verdict = computed(() => {
    const e = this.current();
    if (!e.insider) {
      return `${e.label} 在 ℚ 上次數 ${e.degree}，而 ${e.degree} ∤ ${DIM} → 進不了這個維度 ${DIM} 的世界。`;
    }
    return `${e.label} 次數 ${e.degree}，整除 ${DIM} ✓——可以住在這個世界。`;
  });
}
