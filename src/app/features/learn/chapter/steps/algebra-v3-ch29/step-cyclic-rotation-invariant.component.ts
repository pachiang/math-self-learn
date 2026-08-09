import { Component, computed, signal } from '@angular/core';
import { D3_GROUP, completeTuple, displayTuple, rotateTuple, tupleProduct } from './cauchy-model';

interface TuplePreset {
  label: string;
  note: string;
  tuple: string[];
}

@Component({
  selector: 'app-algebra-v3-cyclic-rotation-invariant',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch29-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 29.3</p>
        <h2>把第一格搬到最後，tuple 仍留在 room；這是 cyclic shift，不是任意洗牌</h2>
        <p class="lede">
          下一步要把 36 個 triples 按 rotation 分包。先確認這個 rotation 真的不會破壞
          product=e，尤其在 multiplication 不交換的 D₃ 裡。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>若 x₁x₂x₃=e，把第一格循環搬到最後後，x₂x₃x₁ 仍一定等於 e 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(true)">一定，cyclic shift 保留條件</button>
          <button type="button" (click)="prediction.set(false)">不一定，D₃ 不交換</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="!prediction()">
            {{
              prediction()
                ? '對。它不是交換兩格；被搬走的 x₁ 會在等式兩側形成可逆的 frame change。'
                : 'Noncommutative 會阻止任意 swap，但 cyclic shift 有特殊的 cancellation 結構。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Cyclic-rotation invariant</p>
            <h3>選一個 triple，逐次把最左 slot 搬到最右</h3>
          </div>
          <p>每格保留原 slot 編號；彎箭頭與 SHIFT 文字直接標出移動方向。</p>
        </div>
        <div class="tuple-presets">
          @for (preset of presets; track preset.label; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="presetIndex() === i"
              (click)="selectPreset(i)"
            >
              {{ preset.label }}
            </button>
          }
        </div>
        <div class="stage rotation-stage">
          <section class="rotation-ring" [attr.aria-label]="rotationLabel()">
            <div class="rotation-arrow" aria-hidden="true">↶ CYCLIC SHIFT</div>
            @for (slot of currentSlots(); track slot.origin) {
              <article>
                <span>ORIGINAL SLOT {{ slot.origin + 1 }}</span>
                <b>{{ slot.element }}</b>
                <small>CURRENT POSITION {{ $index + 1 }}</small>
              </article>
            }
          </section>
          <section class="rotation-console" aria-live="polite">
            <p class="kicker">INVARIANT CHECK</p>
            <div>
              <span>ROTATION</span><b>{{ rotation() }} / 3</b>
            </div>
            <div>
              <span>CURRENT TUPLE</span><b>{{ displayCurrent() }}</b>
            </div>
            <div>
              <span>ORDERED PRODUCT</span><b>= {{ currentProduct() }}</b
              ><small>✓ STILL INSIDE X</small>
            </div>
            <button type="button" class="primary" (click)="rotateOnce()">把第一格搬到最後</button>
            <button type="button" (click)="rotation.set(0)">回到原排列</button>
          </section>
        </div>
        <section class="rotation-history">
          @for (tuple of history(); track $index; let i = $index) {
            <article [class.active]="i === rotation()">
              <span>SHIFT {{ i }}</span
              ><b>{{ display(tuple) }}</b
              ><small>product = {{ product(tuple) }}</small>
            </article>
          }
        </section>
        <p class="lab-note">
          <strong>{{ active().label }}：</strong>{{ active().note }}
        </p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>x₁ · x₂ · x₃ = e</span><i>rotate</i><span>x₂ · x₃ · x₁ = e</span>
        </div>
        <p>
          <strong>Cyclic shift 是 constrained room 上的一個合法 action。</strong>重複三次回到原
          tuple，而且每一步都保持 product=e；因此我們可以用它安全地替所有 triples 分包。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>同樣已知 x₁x₂x₃=e，能否保證交換前兩格後 x₂x₁x₃=e？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">
            不能；arbitrary swap 沒有這個保證
          </button>
          <button type="button" (click)="transfer.set(true)">
            能；任何 reorder 都保留 product
          </button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? '這會偷用 commutativity。D₃ 裡換相鄰 slots 可能改變 product。'
                : '對。這裡選 cyclic action，正因它在 nonabelian group 中仍保持 room boundary。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>為什麼 nonabelian 情況仍然成立？</summary>
          <div>
            由 x₁x₂⋯xₚ=e 可得 x₂⋯xₚ=x₁⁻¹。於是 cyclic shift 的 product 是
            x₂⋯xₚx₁=x₁⁻¹x₁=e。這裡沒有交換任何 factors，只使用原順序與 inverse cancellation；因此
            shift 定義了 Cₚ 在 X 上的 action。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CyclicRotationInvariantComponent {
  readonly group = D3_GROUP;
  readonly presets: TuplePreset[] = [
    {
      label: 'noncommuting',
      note: 's 與 r 不交換，仍然三次 shift 都通過。',
      tuple: completeTuple(D3_GROUP, ['s', 'r']),
    },
    {
      label: 'mixed',
      note: '不同 labels 在三個 positions 間循環，形成一個 3-packet。',
      tuple: completeTuple(D3_GROUP, ['r', 's']),
    },
    {
      label: 'fixed',
      note: '(r,r,r) shift 後看起來完全相同，之後會成為 singleton packet。',
      tuple: ['r', 'r', 'r'],
    },
  ];
  readonly presetIndex = signal(0);
  readonly rotation = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly active = computed(() => this.presets[this.presetIndex()]);
  readonly history = computed(() =>
    [0, 1, 2].map((amount) => rotateTuple(this.active().tuple, amount)),
  );
  readonly current = computed(() => this.history()[this.rotation()]);
  readonly currentProduct = computed(() => tupleProduct(this.group, this.current()));
  readonly currentSlots = computed(() => {
    const amount = this.rotation();
    return this.current().map((element, index) => ({ element, origin: (index + amount) % 3 }));
  });
  readonly rotationLabel = computed(
    () =>
      `cyclic shift ${this.rotation()}：${this.displayCurrent()}，product ${this.currentProduct()}`,
  );

  selectPreset(index: number): void {
    this.presetIndex.set(index);
    this.rotation.set(0);
  }

  rotateOnce(): void {
    this.rotation.update((value) => (value + 1) % 3);
  }

  display(tuple: string[]): string {
    return displayTuple(this.group, tuple);
  }

  displayCurrent(): string {
    return this.display(this.current());
  }

  product(tuple: string[]): string {
    return tupleProduct(this.group, tuple);
  }
}
