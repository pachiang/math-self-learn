import { Component, computed, signal } from '@angular/core';
import { C6_GROUP, D3_GROUP, FiniteGroup, displayElement, elementOrder } from './cauchy-model';

@Component({
  selector: 'app-algebra-v3-prime-guarantee-boundary',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch29-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 29.1</p>
        <h2>同樣有 6 個 states，cycle 6 可以消失；prime cycles 2、3 卻躲不掉</h2>
        <p class="lede">
          Lagrange 告訴我們 element order 只能整除 group
          order，但把箭頭反過來通常會錯。先比較兩個大小相同、內部 wiring 不同的群。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>只知道 |G|=6，能保證群內一定有 order 6 的 element 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">
            不能，divisor 只是一個可能值
          </button>
          <button type="button" (click)="prediction.set(true)">能，因為 6 divides 6</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'D₃ 就會推翻這個反推：它有 6 個 elements，卻沒有 length-6 cycle。'
                : '對。Lagrange 是 necessary condition；存在性還需要額外結構。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Prime-guarantee boundary</p>
            <h3>切換同 order 的群，再指定想找的 cycle length</h3>
          </div>
          <p>
            每張 element card 都直接寫出 FIRST RETURN；FOUND／ABSENT 與邊框型態讓結果不只靠顏色。
          </p>
        </div>
        <div class="boundary-controls">
          <fieldset>
            <legend>GROUP · SAME SIZE 6</legend>
            @for (group of groups; track group.id; let i = $index) {
              <button
                type="button"
                [attr.aria-pressed]="groupIndex() === i"
                (click)="groupIndex.set(i)"
              >
                {{ group.name }}
              </button>
            }
          </fieldset>
          <fieldset>
            <legend>TARGET DIVISOR</legend>
            @for (divisor of divisors; track divisor) {
              <button
                type="button"
                [attr.aria-pressed]="target() === divisor"
                (click)="target.set(divisor)"
              >
                order {{ divisor }}
              </button>
            }
          </fieldset>
        </div>
        <div class="stage guarantee-stage">
          <section class="cycle-inventory" [attr.aria-label]="inventoryLabel()">
            @for (card of cards(); track card.element) {
              <article [class.match]="card.order === target()">
                <span>{{ display(card.element) }}</span>
                <div class="cycle-dots" aria-hidden="true">
                  @for (_ of units(card.order); track $index) {
                    <i>{{ $index + 1 }}</i>
                  }
                </div>
                <b>FIRST RETURN · {{ card.order }}</b>
              </article>
            }
          </section>
          <section class="guarantee-console" aria-live="polite">
            <p class="kicker">EXISTENCE SCAN</p>
            <div>
              <span>GROUP SIZE</span><b>|{{ activeGroup().name }}| = 6</b>
            </div>
            <div>
              <span>TARGET</span><b>{{ target() }} divides 6</b>
            </div>
            <div class="scan-verdict" [class.absent]="matches().length === 0">
              <strong>{{ matches().length ? '✓ FOUND' : '× ABSENT' }}</strong>
              <small>
                {{
                  matches().length
                    ? matches().length + ' element(s) return first at ' + target()
                    : 'divisibility alone did not create a cycle'
                }}
              </small>
            </div>
          </section>
        </div>
        <div class="guarantee-matrix" aria-label="兩群的 cycle 存在矩陣">
          <span>ORDER</span><b>2 · PRIME</b><b>3 · PRIME</b><b>6 · COMPOSITE</b> <strong>C₆</strong
          ><i>✓ FOUND</i><i>✓ FOUND</i><i>✓ FOUND</i> <strong>D₃</strong><i>✓ FOUND</i><i>✓ FOUND</i
          ><i class="fail">× ABSENT</i>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>p | |G|</span><i>prime</i><span>cannot vanish</span><i>→</i
          ><span>order-p cycle</span>
        </div>
        <p>
          <strong>Cauchy theorem 是一條有限但可靠的反向箭頭。</strong>每個 prime divisor
          都逼出同長度的 element cycle；composite divisor 沒有同樣保證。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 |K|=70，不看 multiplication table，哪個存在性結論可直接保證？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('prime')">
            有 orders 2、5、7 的 elements
          </button>
          <button type="button" (click)="transfer.set('all')">
            每個 70 的 divisor 都是 element order
          </button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() === 'all'">
            {{
              transfer() === 'prime'
                ? '對。2、5、7 是 70 的 prime divisors；Cauchy 分別保證三種 cycles。'
                : '10、14、35、70 都是 composite；單靠 group size 不能保證它們出現。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Cauchy theorem 的正式 statement</summary>
          <div>
            若有限群 G 的大小被 prime p 整除，則存在 x∈G 使
            ord(x)=p。注意結論只說至少存在一個；它不說有唯一一個，也不保證 composite divisors 都成為
            element orders。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3PrimeGuaranteeBoundaryComponent {
  readonly groups = [C6_GROUP, D3_GROUP];
  readonly divisors = [2, 3, 6];
  readonly groupIndex = signal(1);
  readonly target = signal(6);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<'prime' | 'all' | null>(null);
  readonly activeGroup = computed(() => this.groups[this.groupIndex()]);
  readonly cards = computed(() =>
    this.activeGroup().elements.map((element) => ({
      element,
      order: elementOrder(this.activeGroup(), element),
    })),
  );
  readonly matches = computed(() => this.cards().filter((card) => card.order === this.target()));
  readonly inventoryLabel = computed(
    () =>
      `${this.activeGroup().name} element cycle inventory；order ${this.target()} ` +
      (this.matches().length ? 'found' : 'absent'),
  );

  display(element: string): string {
    return displayElement(this.activeGroup(), element);
  }

  units(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index);
  }
}
