import { Component, computed, signal } from '@angular/core';
import { S4, normalizer, permutationLabel } from '../algebra-v3-ch30/sylow-model';
import { S4_SYLOW_2_POINTS, frameBuckets } from './sylow-landscape-model';

@Component({
  selector: 'app-algebra-v3-normalizer-orbit-meter',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch31-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 31.3</p>
        <h2>能把 P 搬到同一 destination 的 frames 自動等大；其中留在原點的一包就是 normalizer</h2>
        <p class="lede">
          點選任一 Sylow point 當起點。24 張 frames 依 destination 分成三包；每包都和
          N<sub>G</sub>(P) 一樣大，所以 point 數就是 normalizer 的 index。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>若每個 destination 都收到 8 張 frames，24 張 frames 最後能產生幾個 points？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(3)">3 個</button>
          <button type="button" (click)="prediction.set(8)">8 個</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 3">
            {{
              prediction() === 3
                ? '對。Frames 被完整分成 24÷8=3 包。'
                : '8 是每包的 stabilizer size；destination 數要用 24÷8。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Normalizer orbit meter</p>
            <h3>改變起點；分包名稱會換，但 3 packets × 8 frames 不變</h3>
          </div>
          <p>
            留在起點的 packet 標記 STABILIZER／NORMALIZER；三包都有 frame labels，不靠顏色辨識。
          </p>
        </div>
        <div class="point-tabs" role="group" aria-label="選擇 Sylow landscape 起點">
          @for (point of points; track point.id; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="sourceIndex() === i"
              (click)="sourceIndex.set(i)"
            >
              起點 {{ point.id }}
            </button>
          }
        </div>
        <div class="stage meter-stage">
          <section class="orbit-mini-map">
            @for (point of points; track point.id; let i = $index) {
              <article [class.source]="sourceIndex() === i">
                <span>{{ point.id }}</span
                ><b>{{ sourceIndex() === i ? 'SOURCE P' : 'CONJUGATE' }}</b>
              </article>
              @if (!$last) {
                <i>↔</i>
              }
            }
          </section>
          <section class="frame-buckets" aria-live="polite">
            @for (bucket of buckets(); track $index; let i = $index) {
              <article [class.normalizer]="i === sourceIndex()">
                <header>
                  <span>DESTINATION {{ points[i].id }}</span>
                  <b>{{ i === sourceIndex() ? 'NORMALIZER' : 'SAME-SIZE FIBER' }}</b>
                </header>
                <div>
                  @for (frame of bucket; track key(frame)) {
                    <span>{{ name(frame) }}</span>
                  }
                </div>
                <footer>{{ bucket.length }} FRAMES</footer>
              </article>
            }
          </section>
          <section class="meter-equation">
            <article><span>|G|</span><b>24</b><small>all frames</small></article>
            <i>=</i>
            <article>
              <span>n₂</span><b>{{ points.length }}</b
              ><small>Sylow points</small>
            </article>
            <i>×</i>
            <article>
              <span>|N(P)|</span><b>{{ normalizerSize() }}</b
              ><small>frames per point</small>
            </article>
          </section>
          <section class="divisibility-strip">
            <span>|P|=8</span><i>≤</i><span>|N(P)|=8</span><i>≤</i><span>|G|=24</span>
            <strong>因此 n₂=[G:N(P)]=3，且 3 ∣ [G:P]=3</strong>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>orbit points</span><i>×</i><span>normalizer frames</span>
        </div>
        <p>
          <strong>nₚ∣m 是 orbit–stabilizer 留下的整除關係。</strong>
          P 已把全部 p-power 放進 N<sub>G</sub>(P)，因此剩下的 orbit index 只能取自 non-p part m。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 |G|=12=3·4，Sylow 3-subgroup 的數量 n₃ 必須從哪些數中挑？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('divisors')">4 的 divisors：1、2、4</button>
          <button type="button" (click)="transfer.set('all')">1 到 12 的任何數</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 'divisors'">
            {{
              transfer() === 'divisors'
                ? '對。這一幕先留下 1、2、4；下一幕的 mod-3 residue 會再篩一次。'
                : 'n₃ 必須整除 non-3 part 4，範圍遠比 1…12 小。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>為什麼 nₚ=[G:N<sub>G</sub>(P)] 且整除 m？</summary>
          <div>
            G 以 conjugation 作用在 Sylow set。P 的 stabilizer 正是 N<sub>G</sub>(P) 是所有滿足
            gPg⁻¹=P 的 g∈G，所以 orbit–stabilizer 給 nₚ=[G:N<sub>G</sub>(P)]。若 |G|=pⁿm，因
            P≤N<sub>G</sub>(P) 且 |P|=pⁿ，index [G:N<sub>G</sub>(P)] 必整除 m。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3NormalizerOrbitMeterComponent {
  readonly points = S4_SYLOW_2_POINTS;
  readonly sourceIndex = signal(0);
  readonly prediction = signal<number | null>(null);
  readonly transfer = signal<'divisors' | 'all' | null>(null);
  readonly source = computed(() => this.points[this.sourceIndex()].subgroup);
  readonly buckets = computed(() => frameBuckets(this.source(), this.points));
  readonly normalizerSize = computed(() => normalizer(S4, this.source()).length);

  name = permutationLabel;
  key = (frame: readonly number[]) => frame.join('');
}
