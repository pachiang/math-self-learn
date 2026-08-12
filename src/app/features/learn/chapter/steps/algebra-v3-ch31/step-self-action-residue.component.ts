import { Component, computed, signal } from '@angular/core';
import { SYLOW_ACTION_EXAMPLES, subgroupActionOrbits } from './sylow-landscape-model';

@Component({
  selector: 'app-algebra-v3-self-action-residue',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch31-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 31.4</p>
        <h2>讓 P 搬動整個 Sylow set；自己留下 1，其餘只能整包帶走 p 個</h2>
        <p class="lede">
          這次 actors 不再是整個 G，而是 P 自己。P 一定固定自己；其他 Sylow points 若會動，就會落入
          帶 p-factor 的 orbit packets。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>Sylow p-subgroups 的數量 nₚ 可以剛好等於 p 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不能；它必須留下 residue 1</button>
          <button type="button" (click)="prediction.set(true)">
            可以；p 本來就是合法 orbit size
          </button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'Nonfixed orbit 可以有 p-factor，但 P 自己是額外的一個 fixed point；總數因此不是 0 mod p。'
                : '對。總數長成 1 加上若干 p-multiples，所以不可能剛好是 p。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Self-action residue</p>
            <h3>切換 p；看 1+2 與 1+3 如何共享同一個 packet pattern</h3>
          </div>
          <p>FIXED 使用雙框；MOVING packet 使用環形箭頭、SIZE 標籤與虛線，避免只靠顏色。</p>
        </div>
        <div class="residue-tabs" role="group" aria-label="選擇 Sylow self-action 範例">
          @for (example of examples; track example.label; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="exampleIndex() === i"
              (click)="exampleIndex.set(i)"
            >
              {{ example.label }}
            </button>
          }
        </div>
        <div class="stage residue-stage">
          <section class="actor-badge">
            <span>ACTORS</span><b>P · order {{ active().actors.length }}</b>
            <small>P conjugates every Sylow point</small>
          </section>
          <section class="residue-packets" aria-live="polite">
            @for (orbit of orbits(); track orbit.indices[0]; let packet = $index) {
              <article [class.fixed]="orbit.fixed">
                <header>
                  <span>ORBIT {{ packet + 1 }}</span>
                  <b>{{
                    orbit.fixed ? 'FIXED · SIZE 1' : 'MOVING · SIZE ' + orbit.indices.length
                  }}</b>
                </header>
                <div>
                  @for (index of orbit.indices; track index) {
                    <span>P{{ index + 1 }}</span>
                    @if (!$last) {
                      <i>↝</i>
                    }
                  }
                </div>
                <footer>{{ orbit.fixed ? 'P fixes itself' : 'one p-divisible packet' }}</footer>
              </article>
            }
          </section>
          <section class="residue-equation">
            <span>n{{ subscript() }}</span
            ><b>= {{ active().points.length }}</b
            ><i>=</i> <strong>1 fixed</strong><i>+</i><strong>{{ movingCount() }} moving</strong>
            <em>{{ active().points.length }} ≡ 1 (mod {{ active().prime }})</em>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>1 fixed P</span><i>+</i><span>p-sized packets</span>
        </div>
        <p>
          <strong>nₚ≡1 mod p 是一個 fixed-point residue。</strong>
          它不是神祕的數論附加條件；它記錄 P 在自己的 Sylow landscape 中必須留下自己這一點。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>
          若 divisibility constraint 只留下 nₚ∈{{ '{' }}1, p{{ '}' }}，哪個 candidate 會被本節排除？
        </h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('p')">排除 p</button>
          <button type="button" (click)="transfer.set('one')">排除 1</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 'p'">
            {{
              transfer() === 'p'
                ? '對。p≡0 mod p；只剩 nₚ=1，因此 Sylow subgroup unique and normal。'
                : '1 正是必要的 residue；它永遠通過 congruence gate。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>為什麼唯一的 fixed Sylow point 是 P 自己？</summary>
          <div>
            P 以 conjugation 作用在所有 Sylow p-subgroups 上。P 當然固定自己。若另一個 Q 也被整個 P
            固定，則 P≤N<sub>G</sub>(Q)，而 PQ 在 N<sub>G</sub>(Q) 中形成 p-subgroup。Q 已是 maximal
            p-subgroup，只能迫使 P≤Q；兩者同階，因此 P=Q。其餘 orbits 大小都被 p 整除，故 nₚ≡1 (mod
            p)。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3SelfActionResidueComponent {
  readonly examples = SYLOW_ACTION_EXAMPLES;
  readonly exampleIndex = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<'p' | 'one' | null>(null);
  readonly active = computed(() => this.examples[this.exampleIndex()]);
  readonly orbits = computed(() =>
    subgroupActionOrbits(this.active().actors, [...this.active().points]),
  );
  readonly movingCount = computed(() =>
    this.orbits()
      .filter((orbit) => !orbit.fixed)
      .reduce((sum, orbit) => sum + orbit.indices.length, 0),
  );

  subscript(): string {
    return this.active().prime === 2 ? '₂' : '₃';
  }
}
