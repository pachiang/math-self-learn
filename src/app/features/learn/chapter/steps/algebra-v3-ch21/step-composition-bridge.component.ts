import { Component, computed, signal } from '@angular/core';
import {
  D3_ELEMENTS,
  type D3Element,
  label,
  multiply,
} from '../algebra-v3-ch16/d3-model';

type OrderGuess = 'gh' | 'hg';

@Component({
  selector: 'app-algebra-v3-composition-bridge',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch21-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 21.2</p>
        <h2>先做 h 再做 g，整條 action pipeline 會壓成左乘 gh</h2>
        <p class="lede">
          只把元素各自變成 permutation 還不夠。真正關鍵是：原本的乘法順序，會不會在
          permutation composition 裡被保存？
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>x 先走 Lh、再走 Lg；合起來是 Lgh 還是 Lhg？</h3>
        <div class="choice-row">
          <button type="button" (click)="guess.set('gh')">L<sub>gh</sub></button>
          <button type="button" (click)="guess.set('hg')">L<sub>hg</sub></button>
        </div>
        @if (guess(); as answer) {
          <p class="feedback" [class.warning]="answer !== 'gh'">
            {{ answer === 'gh'
              ? '對。g(hx) = (gh)x；function composition 從右邊的 Lh 開始讀。'
              : '注意 action 的時間順序：先 hx，再由 g 左乘，得到 g(hx)=(gh)x。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Multiplication → composition</p>
            <h3>逐步跑一個 state，再一次核對全部六個 states</h3>
          </div>
          <p>D₃ 不可交換；預設的 s、r 讓 gh 與 hg 真的不同，順序錯了會立刻露餡。</p>
        </div>

        <div class="bridge-controls">
          <fieldset>
            <legend>第二個 action：g</legend>
            @for (element of elements; track element) {
              <button type="button" [attr.aria-pressed]="g() === element" (click)="setG(element)">{{ name(element) }}</button>
            }
          </fieldset>
          <fieldset>
            <legend>第一個 action：h</legend>
            @for (element of elements; track element) {
              <button type="button" [attr.aria-pressed]="h() === element" (click)="setH(element)">{{ name(element) }}</button>
            }
          </fieldset>
          <fieldset>
            <legend>追蹤的 input：x</legend>
            @for (element of elements; track element) {
              <button type="button" [attr.aria-pressed]="probe() === element" (click)="setProbe(element)">{{ name(element) }}</button>
            }
          </fieldset>
        </div>

        <div class="stage bridge-stage">
          <section class="action-pipeline" aria-live="polite">
            <div class="pipeline-row">
              <article class="pipeline-node active"><small>START</small><strong>{{ name(probe()) }}</strong></article>
              <span class="pipeline-arrow" [class.active]="phase() >= 1">L<sub>{{ name(h()) }}</sub> →</span>
              <article class="pipeline-node" [class.active]="phase() >= 1"><small>AFTER h</small><strong>{{ phase() >= 1 ? name(afterH()) : '?' }}</strong></article>
              <span class="pipeline-arrow" [class.active]="phase() >= 2">L<sub>{{ name(g()) }}</sub> →</span>
              <article class="pipeline-node" [class.active]="phase() >= 2"><small>AFTER g</small><strong>{{ phase() >= 2 ? name(afterBoth()) : '?' }}</strong></article>
            </div>

            <div class="compression-row" [class.revealed]="phase() >= 2">
              <span>{{ name(probe()) }}</span>
              <i>one compressed action</i>
              <span>L<sub>{{ name(product()) }}</sub> → {{ phase() >= 2 ? name(direct()) : '?' }}</span>
            </div>

            <div class="scan-board" [class.revealed]="phase() >= 2" aria-label="六個輸入的完整比對">
              @for (row of scan(); track row.input) {
                <article>
                  <span>{{ name(row.input) }}</span>
                  <small>L{{ name(h()) }} then L{{ name(g()) }}</small>
                  <b>{{ name(row.via) }}</b>
                  <em>=</em>
                  <b>{{ name(row.direct) }}</b>
                  <small>L{{ name(product()) }}</small>
                </article>
              }
            </div>
          </section>

          <section class="bridge-console">
            <p class="kicker">ACTION CLOCK</p>
            <strong>{{ phaseLabel() }}</strong>
            <button type="button" class="primary" [disabled]="phase() >= 2" (click)="advance()">執行下一個 action</button>
            <button type="button" (click)="phase.set(0)">重設 pipeline</button>
            <div class="order-check">
              <span>CORRECT PRODUCT</span><b>gh = {{ name(product()) }}</b>
              <span>REVERSED PRODUCT</span><b>hg = {{ name(reverseProduct()) }}</b>
              <small>{{ product() === reverseProduct() ? '這一組剛好 commute；換 s 與 r 看出差異。' : 'ORDER VISIBLE · TWO PRODUCTS DIFFER' }}</small>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>multiply gh</span><i>same structure</i><span>compose Lg ∘ Lh</span>
        </div>
        <p>
          <strong>Left translation 會保存群的運算。</strong>
          把 g 換成 L<sub>g</sub> 不是丟掉乘法表；每次 multiplication 都精確變成 permutation composition。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 D₃ 中 sr ≠ rs，Lₛ ∘ Lᵣ 與 Lᵣ ∘ Lₛ 會相同嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不會，product 不同</button>
          <button type="button" (click)="transfer.set(true)">會，permutations 會 commute</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{ transfer()
              ? '若兩個 composed permutations 相同，它們作用在 e 上也應相同，但會分別得到 sr 與 rs。'
              : '對。原群的 noncommutativity 會原封不動出現在 left translations 裡。' }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Homomorphism 的正式核對</summary>
          <div>
            定義 Φ:G→Sym(G)，Φ(g)=L<sub>g</sub>。對所有 x∈G，
            (L<sub>g</sub>∘L<sub>h</sub>)(x)=g(hx)=(gh)x=L<sub>gh</sub>(x)，所以
            Φ(gh)=Φ(g)Φ(h)。這裡只使用 associativity。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CompositionBridgeComponent {
  readonly elements = D3_ELEMENTS;
  readonly g = signal<D3Element>(3);
  readonly h = signal<D3Element>(1);
  readonly probe = signal<D3Element>(0);
  readonly phase = signal(0);
  readonly guess = signal<OrderGuess | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly afterH = computed(() => multiply(this.h(), this.probe()));
  readonly afterBoth = computed(() => multiply(this.g(), this.afterH()));
  readonly product = computed(() => multiply(this.g(), this.h()));
  readonly reverseProduct = computed(() => multiply(this.h(), this.g()));
  readonly direct = computed(() => multiply(this.product(), this.probe()));
  readonly scan = computed(() => this.elements.map(input => ({
    input,
    via: multiply(this.g(), multiply(this.h(), input)),
    direct: multiply(this.product(), input),
  })));

  name = label;

  setG(element: D3Element): void { this.g.set(element); this.phase.set(0); }
  setH(element: D3Element): void { this.h.set(element); this.phase.set(0); }
  setProbe(element: D3Element): void { this.probe.set(element); this.phase.set(0); }
  advance(): void { this.phase.update(value => Math.min(2, value + 1)); }

  phaseLabel(): string {
    return ['READY · x 尚未移動', `STEP 1 · h${label(this.probe())}`, 'STEP 2 · g(hx) = (gh)x'][this.phase()];
  }
}
