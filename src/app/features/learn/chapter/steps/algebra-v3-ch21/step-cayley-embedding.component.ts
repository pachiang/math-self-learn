import { Component, computed, signal } from '@angular/core';
import {
  D3_ELEMENTS,
  type D3Element,
  label,
  multiply,
} from '../algebra-v3-ch16/d3-model';

@Component({
  selector: 'app-algebra-v3-cayley-embedding',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch21-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 21.3</p>
        <h2>要分辨兩張 left translations，只要問它們把 identity 送去哪裡</h2>
        <p class="lede">
          Homomorphism 可能壓掉資訊；但 left translation 有一個不會說謊的 witness：
          <code>L<sub>g</sub>(e)=g</code>。每張 permutation 都在 identity 上簽了自己的名字。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>r 與 r² 不同，但它們有可能製造完全相同的 left translation 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不可能，檢查 e 就分得出來</button>
          <button type="button" (click)="prediction.set(true)">可能，其他 wiring 也許相同</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{ prediction()
              ? '若整張 wiring 相同，它們在 e 的輸出也須相同；但 Lᵣ(e)=r、Lᵣ²(e)=r²。'
              : '對。只要 identity 的輸出不同，兩個 functions 就不可能相同。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Identity witness</p>
            <h3>任選兩個群元素，讓 e 同時進入兩台 permutation</h3>
          </div>
          <p>你不必比較全部六條線；一個精心選的 input 已足以證明兩張 functions 不同。</p>
        </div>

        <div class="witness-controls">
          <fieldset>
            <legend>第一張 card：L<sub>g</sub></legend>
            @for (element of elements; track element) {
              <button type="button" [attr.aria-pressed]="first() === element" (click)="first.set(element)">{{ name(element) }}</button>
            }
          </fieldset>
          <fieldset>
            <legend>第二張 card：L<sub>h</sub></legend>
            @for (element of elements; track element) {
              <button type="button" [attr.aria-pressed]="second() === element" (click)="second.set(element)">{{ name(element) }}</button>
            }
          </fieldset>
        </div>

        <div class="stage witness-stage">
          <section class="translation-deck" aria-label="D3 的六張 left translation cards">
            @for (card of deck(); track card.actor) {
              <article [class.first-card]="card.actor === first()" [class.second-card]="card.actor === second()">
                <header><span>L<sub>{{ name(card.actor) }}</sub></span><small>PERMUTATION</small></header>
                <div class="identity-signature"><i>e</i><b>→</b><strong>{{ name(card.identityImage) }}</strong></div>
                <p>{{ card.signature }}</p>
              </article>
            }
          </section>

          <section class="witness-console" aria-live="polite">
            <p class="kicker">ONE-INPUT TEST</p>
            <div class="witness-lanes">
              <article><span>e enters L<sub>{{ name(first()) }}</sub></span><strong>{{ name(firstImage()) }}</strong></article>
              <article><span>e enters L<sub>{{ name(second()) }}</sub></span><strong>{{ name(secondImage()) }}</strong></article>
            </div>
            <div class="faithful-verdict" [class.same]="first() === second()">
              {{ first() === second()
                ? 'SAME ELEMENT · SAME CARD'
                : 'DISTINCT OUTPUTS · DISTINCT CARDS' }}
            </div>
            <div class="deck-meter"><span>DISTINCT CARDS BUILT</span><b>{{ distinctCards() }} / 6</b><small>NOTHING LOST</small></div>
          </section>
        </div>
      </section>

      <aside class="insight-card cayley-card">
        <div class="insight-visual" aria-hidden="true">
          <span>abstract G</span><i>≅</i><span>{{ '{' }}L<sub>g</sub> : g∈G{{ '}' }}</span><i>≤</i><span>Sym(G)</span>
        </div>
        <p>
          <strong>這就是 Cayley theorem 的核心。</strong>
          每個群都能被完整重建成一群 permutations；「抽象」不代表沒有具體 action model。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>對任意群 G，若 Lₐ = Lᵦ，代入哪個 input 最快得到 a = b？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">identity e</button>
          <button type="button" (click)="transfer.set(false)">必須代入所有 x∈G</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{ transfer()
              ? '對。Lₐ(e)=a、Lᵦ(e)=b；function equality 立刻給出 a=b。'
              : '不需要掃描全部 inputs。identity 會直接把 actor 本身顯露出來。' }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Cayley theorem 的正式版本與 proof</summary>
          <div>
            Cayley theorem：每個群 G 都同構於某個 symmetric group 的 subgroup。令
            Φ(g)=L<sub>g</sub>。上一節已證 Φ 是 homomorphism。若 Φ(a)=Φ(b)，則在 e 上取值可得
            a=L<sub>a</sub>(e)=L<sub>b</sub>(e)=b，故 Φ injective。於是
            G≅Φ(G)=L(G)≤Sym(G)。若 G 有 n 個元素，也可寫成 G 同構於 S<sub>n</sub> 的某個 subgroup。
          </div>
        </details>
        <details>
          <summary>這章刻意還沒談什麼？</summary>
          <div>
            這裡只用 G 作用在自己的底層集合上。讓 G 作用在其他集合 X、action kernel，以及一個 action
            是否 faithful，會在下一章用不同觀察世界單獨處理。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CayleyEmbeddingComponent {
  readonly elements = D3_ELEMENTS;
  readonly first = signal<D3Element>(1);
  readonly second = signal<D3Element>(2);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly deck = computed(() => this.elements.map(actor => ({
    actor,
    identityImage: multiply(actor, 0),
    signature: this.elements.map(input => label(multiply(actor, input))).join(' · '),
  })));
  readonly firstImage = computed(() => multiply(this.first(), 0));
  readonly secondImage = computed(() => multiply(this.second(), 0));
  readonly distinctCards = computed(() => new Set(this.deck().map(card => card.signature)).size);

  name = label;
}
