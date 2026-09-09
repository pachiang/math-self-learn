import { Component, computed, signal } from '@angular/core';

interface Elem {
  label: string;
  degree: number;
  minPoly: string;
  insider: boolean;
  membershipEvidence: string;
}

const DIM = 4; // [ℚ(√2, √3) : ℚ]

const ELEMS: Elem[] = [
  { label: '有理數 q', degree: 1, minPoly: 'x − q', insider: true, membershipEvidence: 'q∈ℚ，而 ℚ⊂L。' },
  { label: '√2', degree: 2, minPoly: 'x² − 2', insider: true, membershipEvidence: '√2 是 L=ℚ(√2,√3) 的 generator。' },
  { label: '√3', degree: 2, minPoly: 'x² − 3', insider: true, membershipEvidence: '√3 是 L=ℚ(√2,√3) 的 generator。' },
  { label: '√6', degree: 2, minPoly: 'x² − 6', insider: true, membershipEvidence: '√6=√2·√3，由 field closure 得 √6∈L。' },
  { label: '√2 + √3', degree: 4, minPoly: 'x⁴ − 10x² + 1', insider: true, membershipEvidence: '√2+√3 是兩個 L-elements 的和。' },
  { label: 'i', degree: 2, minPoly: 'x² + 1', insider: false, membershipEvidence: 'L=ℚ(√2,√3)⊂ℝ，但 i∉ℝ。' },
  { label: '∛2', degree: 3, minPoly: 'x³ − 2', insider: false, membershipEvidence: '3∤4 已直接否定 membership。' },
];

@Component({
  selector: 'app-fields-ch4-divides-tower',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 4.3</p>
        <h2>整除是排除器，不是 membership certificate</h2>
        <p class="lede">
          如果 <code>α∈L</code>，那麼 <code>ℚ(α)</code> 才是 <code>ℚ⊂L</code> 的中間層，於是 tower law 強迫 <code>deg(α)∣[L:ℚ]</code>。
          不整除可以直接判出局；但整除只代表<strong>尚未被這個 test 排除</strong>，不能反推 <code>α∈L</code>。
        </p>
      </header>

      <span class="map-convention">FIXED AMBIENT L=ℚ(√2,√3) · NECESSARY FILTER ONLY · MEMBERSHIP NEEDS SEPARATE EVIDENCE</span>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>i 的 degree 是 2，而且 2∣4。這足以證明 i∈ℚ(√2,√3) 嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">足以證明</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">仍不足</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'yes'">
            {{ prediction() === 'no'
              ? '對。整除只是必要條件；ℚ(√2,√3) 全由實數組成，所以 i 仍在外面。'
              : '不足。i 與 √2 都是 degree 2、都通過 2∣4，但只有 √2 在這個指定 field 裡。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選元素">
        <span class="kicker">候選元素 · degree test 與 membership evidence 分開</span>
        @for (e of elems; track e.label; let i = $index) {
          <button type="button" [class.active]="index() === i" [class.outsider]="!e.insider" (click)="index.set(i)">{{ e.label }}</button>
        }
      </div>

      <section class="stage divide-stage">
        <div class="divide-board">
          <p class="board-scope" [class.is-field]="current().insider">候選：<strong>{{ current().label }}</strong></p>
          <div class="tower-chain">
            <div class="tc-node">ℚ</div>
            <div class="tc-edge"><span>{{ current().degree }}</span></div>
            <div class="tc-node mid" [class.outside]="!current().insider">ℚ({{ current().label }})</div>
            <div class="tc-edge dashed" [class.broken]="!current().insider"><span>{{ current().insider ? dim / current().degree : '⊄' }}</span></div>
            <div class="tc-node top">ℚ(√2, √3) · 維度 {{ dim }}</div>
          </div>
          <div class="divide-facts">
            <div class="fact"><span class="fk">minimal polynomial</span><span class="fv">{{ current().minPoly }}</span></div>
            <div class="fact"><span class="fk">在 ℚ 上的次數</span><span class="fv">{{ current().degree }}</span></div>
            <div class="fact"><span class="fk">necessary degree test</span><span class="fv" [class.no-fv]="!divides()">{{ divides() ? current().degree + '∣' + dim + ' · PASS（未被排除）' : current().degree + '∤' + dim + ' · BLOCKED' }}</span></div>
            <div class="fact"><span class="fk">separate membership evidence</span><span class="fv" [class.no-fv]="!current().insider">{{ current().membershipEvidence }}</span></div>
          </div>
          <p class="verdict" [class.is-min]="current().insider" [class.caution]="divides() && !current().insider" [class.bad]="!divides()">
            {{ verdict() }}
          </p>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">單向 filter</p>
          <div class="filter-rules">
            <div class="filter-rule blocked"><strong>degree ∤ 4</strong><span>確定不在 L</span></div>
            <div class="filter-rule pending"><strong>degree ∣ 4</strong><span>只通過必要條件</span></div>
          </div>
          <p><strong>√2 與 i 都是 degree 2</strong>，但 membership 不同。Degree 只看 field 大小，沒有指定是哪一個 field。</p>
          <div class="readout">α∈L ⇒ deg(α)∣[L:ℚ]；逆向 implication 不成立。</div>
          <p class="evidence-tag">GENERAL ARGUMENT（正向）＋ WITNESS i（逆向失敗）</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">∣</span>
        <div>
          <strong>不整除可以判出局；整除通過不能發 membership 證書</strong>
          <span>——degree 是必要的 size constraint，不是「住在哪個 field」的完整地址。</span>
        </div>
      </section>

      <section class="teaser">
        <p class="kicker">留給下一章的問題</p>
        <p class="teaser-body">
          因此 <code>∛2</code>（次數 3）進不了任何<strong>維度是 2 的冪</strong>的世界。下一章：尺規作圖每一步最多造出一個<em>二次擴張</em>，
          所以能作圖的數都落在維度 2ⁿ 的塔裡——<strong>倍立方（做出 ∛2）因此不可能</strong>。這正是 constructibility。
        </p>
      </section>

      <details>
        <summary>符號層：deg(α) ∣ [L:F]</summary>
        <p>
          對 <code>α ∈ L</code>，有塔 <code>F ⊆ F(α) ⊆ L</code>，於是 <code>[L:F] = [L:F(α)]·[F(α):F]</code>。因 <code>[F(α):F] = deg(α)</code>，得
          <code>α∈L ⇒ deg(α)∣[L:F]</code>。逆向不成立：<code>i</code> 的 degree 2 整除 <code>[ℚ(√2,√3):ℚ]=4</code>，但後者是 ℝ 的子 field，因此不含 i。
          所以這條 theorem 是 rejection test；Ch5 正是使用它的逆否命題擋掉不合 degree 的目標。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh4DividesTowerComponent {
  readonly dim = DIM;
  readonly elems = ELEMS;
  readonly index = signal(5); // 預設 i：通過整除 test，卻不在指定 ambient field
  readonly prediction = signal<'yes' | 'no' | null>(null);

  readonly current = computed(() => this.elems[this.index()]);
  readonly divides = computed(() => DIM % this.current().degree === 0);
  readonly verdict = computed(() => {
    const e = this.current();
    if (!this.divides()) {
      return `${e.label} 的 degree ${e.degree} 不整除 ${DIM} → necessary test 已足以判定它不在 L。`;
    }
    if (!e.insider) {
      return `${e.label} 的 degree ${e.degree} 通過整除 test，但仍不在 L：${e.membershipEvidence}`;
    }
    return `${e.label} 通過整除 test，而且另有 membership evidence：${e.membershipEvidence}`;
  });
}
