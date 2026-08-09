import { Component, computed, signal } from '@angular/core';
import {
  D3_GROUP,
  completeTuple,
  constrainedTuples,
  displayElement,
  displayTuple,
  tupleProduct,
} from './cauchy-model';

@Component({
  selector: 'app-algebra-v3-constrained-tuple-room',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch29-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 29.2</p>
        <h2>前 p−1 格可以自由選；最後一格只負責把 product 關回 identity</h2>
        <p class="lede">
          我們不直接在 G 裡搜尋 order-3 element，而是先建一個更大的 triple
          room。進房資格只有一條：三格依序相乘必須等於 e。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>D₃ 有 6 個 elements。若前兩格自由選、第三格由條件決定，room 裡有幾個 triples？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(36)">6×6 = 36</button>
          <button type="button" (click)="prediction.set(216)">6×6×6 = 216</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 36">
            {{
              prediction() === 36
                ? '對。最後一格沒有自由度；每個 prefix 恰好只有一種完成法。'
                : '第三格不是再抽一次；它必須精確 undo 前兩格的累積效果。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Constrained-tuple room</p>
            <h3>選前兩格，觀察 completion slot 如何自動改寫</h3>
          </div>
          <p>箭頭與 FREE／FORCED 標籤區分控制權；每次選擇都立即重新檢查 ordered product。</p>
        </div>
        <div class="tuple-controls">
          <fieldset>
            <legend>SLOT 1 · FREE</legend>
            @for (element of group.elements; track element) {
              <button
                type="button"
                [attr.aria-pressed]="first() === element"
                (click)="first.set(element)"
              >
                {{ element }}
              </button>
            }
          </fieldset>
          <fieldset>
            <legend>SLOT 2 · FREE</legend>
            @for (element of group.elements; track element) {
              <button
                type="button"
                [attr.aria-pressed]="second() === element"
                (click)="second.set(element)"
              >
                {{ element }}
              </button>
            }
          </fieldset>
        </div>
        <div class="stage tuple-room-stage">
          <section class="tuple-machine" [attr.aria-label]="tupleLabel()">
            @for (element of tuple(); track $index; let i = $index) {
              <article [class.forced]="i === 2">
                <span>SLOT {{ i + 1 }}</span>
                <b>{{ element }}</b>
                <small>{{ i === 2 ? 'FORCED COMPLETION' : 'FREE CHOICE' }}</small>
              </article>
              @if (i < 2) {
                <i class="multiply-mark">×</i>
              }
            }
            <i class="equals-mark">=</i>
            <article class="identity-output">
              <span>ORDERED PRODUCT</span><b>{{ product() }}</b
              ><small>ROOM ENTRY PASSED</small>
            </article>
          </section>
          <section class="room-console" aria-live="polite">
            <p class="kicker">ROOM ACCOUNTING</p>
            <div>
              <span>FREE PREFIXES</span><b>6² = {{ room().length }}</b>
            </div>
            <div><span>COMPLETIONS PER PREFIX</span><b>exactly 1</b></div>
            <div>
              <span>TOTAL ROOM SIZE</span><b>{{ room().length }} = 3 × 12</b
              ><small>A MULTIPLE OF p=3</small>
            </div>
          </section>
        </div>
        <section class="completion-strip" aria-label="同一第一格的六種唯一完成">
          <header>
            <span>FIX SLOT 1 = {{ first() }}</span
            ><b>6 PREFIXES → 6 UNIQUE COMPLETIONS</b>
          </header>
          <div>
            @for (row of completionRows(); track row.key) {
              <article>
                <span>{{ row.prefix }}</span
                ><i>forces</i><b>{{ row.last }}</b
                ><small>{{ row.full }}</small>
              </article>
            }
          </div>
        </section>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>|G| choices</span><i>×</i><span>|G| choices</span><i>×</i><span>1 completion</span>
        </div>
        <p>
          <strong>Product constraint 拿走最後一格的自由度。</strong>所以 p 格 room 的大小是
          |G|<sup>p−1</sup>；若 p divides |G|，整個 room 自動能被 p 整除。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 |K|=10、p=5，product-identity 5-tuples 有多少個？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(10000)">10⁴ = 10,000</button>
          <button type="button" (click)="transfer.set(100000)">10⁵ = 100,000</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 10000">
            {{
              transfer() === 10000
                ? '對。前四格自由，最後一格唯一 undo prefix product。'
                : '第五格被 product=e 的條件鎖定，所以只有四格能自由選。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>為什麼每個 prefix 恰有一個 completion？</summary>
          <div>
            給定 x₁,…,xₚ₋₁，令 a=x₁⋯xₚ₋₁。條件 a·xₚ=e 的唯一解是 xₚ=a⁻¹；存在性來自
            inverse，唯一性來自 cancellation。因此 prefix 與 constrained tuple 之間是
            bijection，room size 正是 |G|^(p−1)。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3ConstrainedTupleRoomComponent {
  readonly group = D3_GROUP;
  readonly first = signal('s');
  readonly second = signal('r');
  readonly prediction = signal<number | null>(null);
  readonly transfer = signal<number | null>(null);
  readonly tuple = computed(() => completeTuple(this.group, [this.first(), this.second()]));
  readonly product = computed(() => tupleProduct(this.group, this.tuple()));
  readonly room = computed(() => constrainedTuples(this.group, 3));
  readonly tupleLabel = computed(
    () => `${displayTuple(this.group, this.tuple())} 的 ordered product 是 ${this.product()}`,
  );
  readonly completionRows = computed(() =>
    this.group.elements.map((second) => {
      const tuple = completeTuple(this.group, [this.first(), second]);
      return {
        key: `${this.first()}-${second}`,
        prefix: `(${this.first()}, ${second}, ?)`,
        last: displayElement(this.group, tuple[2]),
        full: displayTuple(this.group, tuple),
      };
    }),
  );
}
