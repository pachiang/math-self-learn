import { Component, computed, signal } from '@angular/core';
import { S4_GROWTH_STAGES, conjugateSubgroup, sameSubgroup, subgroupLabel } from './sylow-model';

@Component({
  selector: 'app-algebra-v3-normalizer-decoder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch30-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 30.3</p>
        <h2>Extra fixed coset 的真正訊息：外面的 g 換完座標後，P 仍是同一個 subgroup</h2>
        <p class="lede">
          「gP 被 P 固定」看似是 coset world 的現象；展開 action condition，會變成 g⁻¹Pg=P。這正是
          normalizer 的入口。
        </p>
      </header>
      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>若每個 h∈P 都滿足 h·gP=gP，g⁻¹Pg 會落在哪裡？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('same')">回到 P 本身</button
          ><button type="button" (click)="prediction.set('any')">可能是任意同大小 subgroup</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'any'">
            {{
              prediction() === 'same'
                ? '對。每個 conjugated element 都進 P；同大小使 inclusion 升級成 equality。'
                : 'Fixed condition 對所有 h∈P 成立，會把整個 conjugate subgroup 鎖回 P。'
            }}
          </p>
        }
      </section>
      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Normalizer decoder</p>
            <h3>選 coset，直接比較 P 與 g⁻¹Pg 的 element cards</h3>
          </div>
          <p>SAME／CHANGED、雙框／虛線與具體 subgroup lists 同步顯示，不靠顏色猜結論。</p>
        </div>
        <div class="decoder-tabs">
          @for (stage of stages.slice(0, 2); track stage.name; let i = $index) {
            <button type="button" [attr.aria-pressed]="stageIndex() === i" (click)="selectStage(i)">
              {{ stage.name }}
            </button>
          }
        </div>
        <div class="coset-picker">
          @for (coset of active().cosets; track coset.key; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="cosetIndex() === i"
              (click)="cosetIndex.set(i)"
            >
              g{{ i }}P <small>{{ isFixed(i) ? 'FIXED' : 'MOVING' }}</small>
            </button>
          }
        </div>
        <div class="stage normalizer-stage">
          <section class="conjugation-bench">
            <article>
              <span>BEFORE</span><b>P</b><small>{{ subgroupLabel(active().subgroup) }}</small>
            </article>
            <i>g{{ cosetIndex() }}⁻¹ ( · ) g{{ cosetIndex() }}</i>
            <article [class.same]="preserved()" [class.changed]="!preserved()">
              <span>AFTER</span><b>g⁻¹Pg</b><small>{{ subgroupLabel(conjugated()) }}</small>
            </article>
          </section>
          <section class="normalizer-console">
            <p class="kicker">FIXED-COSET TEST</p>
            <div>
              <span>SELECTED COSET</span><b>g{{ cosetIndex() }}P</b
              ><small>{{ selected().label }}</small>
            </div>
            <div>
              <span>CONJUGATE RESULT</span><b>{{ preserved() ? '= P' : '≠ P' }}</b>
            </div>
            <div class="normalizer-verdict" [class.fail]="!preserved()">
              <strong>{{ preserved() ? '✓ FIXED · g∈N(P)' : '× MOVING · g∉N(P)' }}</strong
              ><small>{{
                preserved() && cosetIndex() !== 0
                  ? 'EXTERNAL NORMALIZER DIRECTION FOUND'
                  : preserved()
                    ? 'IDENTITY COSET · ALREADY KNOWN'
                    : 'P IS SENT TO A DIFFERENT SUBGROUP'
              }}</small>
            </div>
          </section>
        </div>
      </section>
      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>gP fixed by P</span><i>decode</i><span>g⁻¹Pg=P</span><i>→</i><span>g∈N(P)</span>
        </div>
        <p>
          <strong>Fixed cosets are normalizer coordinates。</strong>所以第二個 fixed coset 真的提供
          P 外的一個穩定方向，而不只是 counting 裡多出來的一格。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>Normalizer N(P) 與 P 的關係一定是？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('contains')">N(P) contains P</button
          ><button type="button" (click)="transfer.set('disjoint')">N(P) 與 P disjoint</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() === 'disjoint'">
            {{
              transfer() === 'contains'
                ? '對。P 內每個 element 都以 inner conjugation 把 P 保持為自己。'
                : 'Identity 已同時在兩者中；事實上整個 P 都包含於 N(P)。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Fixed cosets 與 N_G(P)/P 的 bijection</summary>
          <div>
            gP 被所有 h∈P 固定，等價於 hgP=gP 對所有 h 成立，亦即 g⁻¹hg∈P 對所有 h 成立。因此
            g⁻¹Pg⊆P；兩者有限且同大小，故相等。這正是 g∈N_G(P)。同一 P-coset 給相同 normalizer
            coordinate，所以 fixed cosets 正好是 N_G(P)/P。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3NormalizerDecoderComponent {
  readonly stages = S4_GROWTH_STAGES;
  readonly stageIndex = signal(0);
  readonly cosetIndex = signal(1);
  readonly prediction = signal<'same' | 'any' | null>(null);
  readonly transfer = signal<'contains' | 'disjoint' | null>(null);
  readonly active = computed(() => this.stages[this.stageIndex()]);
  readonly selected = computed(() => this.active().cosets[this.cosetIndex()]);
  readonly conjugated = computed(() =>
    conjugateSubgroup(this.active().subgroup, this.selected().representative),
  );
  readonly preserved = computed(() => sameSubgroup(this.active().subgroup, this.conjugated()));
  selectStage(index: number): void {
    this.stageIndex.set(index);
    const extra = this.stages[index].fixedCosets[1];
    this.cosetIndex.set(extra ? this.stages[index].cosets.indexOf(extra) : 0);
  }
  isFixed(index: number): boolean {
    return this.active().fixedCosets.includes(this.active().cosets[index]);
  }
  subgroupLabel = subgroupLabel;
}
