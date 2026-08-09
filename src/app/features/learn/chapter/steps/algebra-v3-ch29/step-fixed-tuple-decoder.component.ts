import { Component, computed, signal } from '@angular/core';
import {
  C6_GROUP,
  C8_GROUP,
  D3_GROUP,
  FiniteGroup,
  constrainedTuples,
  displayElement,
  displayTuple,
  elementOrder,
  fixedElements,
  rotationPackets,
} from './cauchy-model';

interface CauchyScenario {
  label: string;
  group: FiniteGroup;
  prime: number;
}

@Component({
  selector: 'app-algebra-v3-fixed-tuple-decoder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch29-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 29.5</p>
        <h2>移走所有 p-packets，identity 不可能孤零零地成為唯一 leftover</h2>
        <p class="lede">
          Room 總數是 p 的倍數，會動的 tuples 又整批以 p 個離場；所以 fixed singletons
          的數量也必須是 p 的倍數。最後只要讀懂 singleton 寫了什麼。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>36 個 triples 移走若干組 3 個後，leftover 可能剛好只有 identity tuple 這 1 個嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">
            不能；leftover 仍須被 3 整除
          </button>
          <button type="button" (click)="prediction.set(true)">
            可以；identity 本來就是固定點
          </button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? '1 不是 3 的倍數；若 identity 已留下，還必須有至少兩個 fixed triples 陪它。'
                : '對。total 與 moving states 都是 3 的倍數，所以 fixed residue 也必須是。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Fixed-tuple decoder</p>
            <h3>切換群與 prime；先做 packet accounting，再解碼 singleton</h3>
          </div>
          <p>會動／固定以 packet size、MOVING／FIXED 文字與實線／雙框共同區分。</p>
        </div>
        <div class="scenario-tabs">
          @for (scenario of scenarios; track scenario.label; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="scenarioIndex() === i"
              (click)="selectScenario(i)"
            >
              {{ scenario.label }}
            </button>
          }
        </div>
        <div class="peel-controls">
          <button type="button" [attr.aria-pressed]="!peeled()" (click)="peeled.set(false)">
            看全部 room states
          </button>
          <button
            type="button"
            class="primary"
            [attr.aria-pressed]="peeled()"
            (click)="peeled.set(true)"
          >
            移走 p-sized packets
          </button>
        </div>
        <div class="stage decoder-stage">
          <section class="residue-board" [class.peeled]="peeled()" aria-live="polite">
            <article class="total-block">
              <span>TOTAL ROOM</span><b>{{ total() }}</b
              ><small
                >{{ active().group.elements.length }}^{{ active().prime - 1 }} · DIVISIBLE BY
                {{ active().prime }}</small
              >
            </article>
            <i class="accounting-sign">−</i>
            <article class="moving-block">
              <span>MOVING STATES</span><b>{{ movingStates() }}</b
              ><small>{{ movingPacketCount() }} PACKETS × {{ active().prime }}</small>
            </article>
            <i class="accounting-sign">=</i>
            <article class="fixed-block">
              <span>FIXED RESIDUE</span><b>{{ fixed().length }}</b
              ><small>{{ fixed().length }} ≡ 0 mod {{ active().prime }}</small>
            </article>
          </section>
          <section class="fixed-decoder">
            <header><span>SHIFT-FIXED TUPLES</span><b>all slots must match</b></header>
            <div>
              @for (element of fixed(); track element) {
                <article [class.identity]="element === active().group.identity">
                  <span>{{ displayFixedTuple(element) }}</span>
                  <i>decodes to</i>
                  <b>{{ display(element) }}^{{ active().prime }} = e</b>
                  <small>
                    {{
                      element === active().group.identity
                        ? 'IDENTITY · ORDER 1'
                        : 'NONIDENTITY WITNESS · ORDER ' + order(element)
                    }}
                  </small>
                </article>
              }
            </div>
          </section>
          <section class="cauchy-console">
            <p class="kicker">CAUCHY OUTPUT</p>
            <div>
              <span>PRIME DIVISOR</span><b>{{ active().prime }} | |{{ active().group.name }}|</b>
            </div>
            <div><span>IDENTITY FIXED POINT</span><b>1 known</b></div>
            <div>
              <span>NONIDENTITY LEFTOVERS</span><b>{{ witnesses().length }}</b>
            </div>
            <div class="theorem-verdict">
              <strong>✓ ORDER-{{ active().prime }} ELEMENT EXISTS</strong
              ><small>{{ witnessList() }}</small>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>total ≡ 0 mod p</span><i>→</i><span>fixed ≡ 0 mod p</span><i>→</i
          ><span>e + witness</span>
        </div>
        <p>
          <strong>Order-p element 是 packet accounting 無法消掉的 residue。</strong>Fixed tuple 必為
          (x,…,x)，所以 x<sup>p</sup>=e；除去 identity 後，prime p 讓它的 first return 只能是 p。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">Prime 條件在哪裡工作？</p>
        <h3>若只知道 nonidentity x 滿足 x⁴=e，能直接推出 ord(x)=4 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不能；order 也可能是 2</button>
          <button type="button" (click)="transfer.set(true)">
            能；四次回 identity 就是 order 4
          </button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? 'x⁴=e 只表示 ord(x) divides 4；nonidentity 仍可能在第 2 步先回來。'
                : '對。p prime 時 ord(x) divides p 且 ord(x)>1，才只剩 ord(x)=p。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Cauchy theorem：把五幕壓成完整 proof</summary>
          <div>
            令 X 為所有滿足 x₁⋯xₚ=e 的 (x₁,…,xₚ)∈Gᵖ。最後一格由前 p−1 格唯一決定，所以
            |X|=|G|^(p−1)，而 p∣|G| 蘊含 p∣|X|。Cₚ 以 cyclic shift 作用在 X；orbit sizes 只有 1 或
            p，因此 |X|≡|Fix| (mod p)，故 p∣|Fix|。Identity tuple 在 Fix 中，所以 Fix
            不可能只有它一個。任取另一個 fixed tuple，它必為 (x,…,x)，且 xᵖ=e、x≠e；ord(x) divides
            prime p 且不等於 1，因此 ord(x)=p。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3FixedTupleDecoderComponent {
  readonly scenarios: CauchyScenario[] = [
    { label: 'D₃ · p=3', group: D3_GROUP, prime: 3 },
    { label: 'D₃ · p=2', group: D3_GROUP, prime: 2 },
    { label: 'C₆ · p=3', group: C6_GROUP, prime: 3 },
    { label: 'C₆ · p=2', group: C6_GROUP, prime: 2 },
    { label: 'C₈ · p=2', group: C8_GROUP, prime: 2 },
  ];
  readonly scenarioIndex = signal(0);
  readonly peeled = signal(true);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly active = computed(() => this.scenarios[this.scenarioIndex()]);
  readonly packets = computed(() => rotationPackets(this.active().group, this.active().prime));
  readonly total = computed(
    () => constrainedTuples(this.active().group, this.active().prime).length,
  );
  readonly fixed = computed(() => fixedElements(this.active().group, this.active().prime));
  readonly witnesses = computed(() =>
    this.fixed().filter((element) => element !== this.active().group.identity),
  );
  readonly movingStates = computed(() => this.total() - this.fixed().length);
  readonly movingPacketCount = computed(
    () => this.packets().filter((packet) => !packet.fixed).length,
  );
  readonly witnessList = computed(() =>
    this.witnesses()
      .map((element) => this.display(element))
      .join(', '),
  );

  selectScenario(index: number): void {
    this.scenarioIndex.set(index);
    this.peeled.set(true);
  }

  display(element: string): string {
    return displayElement(this.active().group, element);
  }

  displayFixedTuple(element: string): string {
    return displayTuple(
      this.active().group,
      Array.from({ length: this.active().prime }, () => element),
    );
  }

  order(element: string): number {
    return elementOrder(this.active().group, element);
  }
}
