import { Component, computed, signal } from '@angular/core';
import { S4_GROWTH_STAGES } from './sylow-model';

@Component({
  selector: 'app-algebra-v3-coset-orbit-packer',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch30-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 30.2</p>
        <h2>讓 P 搬動自己的 coset world；所有會動的 cosets 都以 2 的倍數離場</h2>
        <p class="lede">
          若 P 還沒吃滿 2-budget，|S₄:P| 仍是偶數。P-action 把 cosets 分包後，moving packets
          不能改變 mod 2 residue。
        </p>
      </header>
      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>
          12 個 cosets 被分成 even-sized moving packets；fixed cosets 可以剛好只有 P 自己這 1 個嗎？
        </h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">
            不能；fixed count 也必須是 even</button
          ><button type="button" (click)="prediction.set(true)">可以；P 當然固定自己</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? '1 會留下 odd residue，和 total 12、moving even 衝突。'
                : '對。既然 P 是一個 fixed point，至少還要再有一個。'
            }}
          </p>
        }
      </section>
      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Coset-orbit packer</p>
            <h3>切換 growth rung，直接看 P ↷ G/P 的完整 orbit partition</h3>
          </div>
          <p>每包標出 SIZE；fixed singleton 用雙框與 FIXED，moving packet 用連線與 MOVING。</p>
        </div>
        <div class="stage-tabs">
          @for (stage of stages; track stage.name; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="stageIndex() === i"
              (click)="stageIndex.set(i)"
            >
              {{ stage.name }}
            </button>
          }
        </div>
        <div class="stage coset-pack-stage">
          <section class="orbit-deck">
            @for (orbit of active().orbits; track $index; let packet = $index) {
              <article [class.fixed]="orbit.fixed">
                <header>
                  <span>ORBIT {{ packet + 1 }}</span
                  ><b>{{
                    orbit.fixed ? 'FIXED · SIZE 1' : 'MOVING · SIZE ' + orbit.indices.length
                  }}</b>
                </header>
                <div>
                  @for (index of orbit.indices; track index) {
                    <span
                      >g{{ index }}P<small>{{ active().cosets[index].label }}</small></span
                    >
                    @if (!$last) {
                      <i>↔</i>
                    }
                  }
                </div>
              </article>
            }
          </section>
          <section class="orbit-console">
            <p class="kicker">MOD-2 ACCOUNTING</p>
            <div>
              <span>|G/P|</span><b>{{ active().cosets.length }}</b
              ><small>{{
                indexDivisible() ? 'EVEN · GROWTH FORCED' : 'ODD · NO EXTRA FIXED POINT FORCED'
              }}</small>
            </div>
            <div>
              <span>MOVING COSETS</span><b>{{ movingCount() }}</b
              ><small>SUM OF EVEN ORBIT SIZES</small>
            </div>
            <div>
              <span>FIXED COSETS</span><b>{{ active().fixedCosets.length }}</b
              ><small
                >{{ active().fixedCosets.length }} ≡ {{ active().cosets.length % 2 }} mod 2</small
              >
            </div>
          </section>
        </div>
      </section>
      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>even total</span><i>− even moving</i><span>even fixed</span>
        </div>
        <p>
          <strong>Below the Sylow target，P 自己不可能是唯一 fixed coset。</strong>這是 p-group
          action 的 residue law；下一幕再解碼 extra fixed coset 代表什麼。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 p=3、|G/P| 被 3 整除，且 P 本身是一個 fixed coset，fixed count 最少是多少？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(3)">至少 3</button
          ><button type="button" (click)="transfer.set(2)">至少 2</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 3">
            {{
              transfer() === 3
                ? '對。fixed count 必須是 3 的正倍數。'
                : '有兩個仍留下 residue 2；最小正倍數是 3。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>p-group action 的 fixed-point congruence</summary>
          <div>
            P 的每個 orbit size 都整除 |P|=pᵏ，因此 non-singleton orbit size 被 p 整除。把 X 分成
            fixed singletons 與 nonfixed orbits，便有 |X|≡|Xᴾ| (mod p)。此處 X=G/P；當 P 尚未達 pⁿ
            時，p∣|G:P|，所以 p∣|Xᴾ|。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CosetOrbitPackerComponent {
  readonly stages = S4_GROWTH_STAGES;
  readonly stageIndex = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<number | null>(null);
  readonly active = computed(() => this.stages[this.stageIndex()]);
  readonly movingCount = computed(() =>
    this.active()
      .orbits.filter((orbit) => !orbit.fixed)
      .reduce((sum, orbit) => sum + orbit.indices.length, 0),
  );
  readonly indexDivisible = computed(() => this.active().cosets.length % 2 === 0);
}
