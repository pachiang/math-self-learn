import { Component, computed, signal } from '@angular/core';
import { S4_GROWTH_STAGES, subgroupLabel } from './sylow-model';

@Component({
  selector: 'app-algebra-v3-sylow-growth-ladder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch30-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 30.5</p>
        <h2>每次 forced growth 都多吃一個 factor 2；有限的 p-budget 最後一定被吃滿</h2>
        <p class="lede">
          把前四幕接成一個可重複 procedure。S₄ 的 2-part 是 8；從 Cauchy seed size 2 出發，只需兩次
          lift。
        </p>
      </header>
      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>到 |P|=8 時，|S₄:P|=3 不再被 2 整除。這代表什麼？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('done')">2-budget 已滿，這是 Sylow</button
          ><button type="button" (click)="prediction.set('stuck')">
            方法卡住，但可能還有 order 16 subgroup
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'stuck'">
            {{
              prediction() === 'done'
                ? '對。16 不整除 24；Lagrange 同時封住任何更大的 2-subgroup。'
                : 'Order 16 不整除 24，所以不是暫時卡住，而是已達絕對上限。'
            }}
          </p>
        }
      </section>
      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Sylow growth ladder</p>
            <h3>逐層執行 coset residue → normalizer quotient → Cauchy → lift</h3>
          </div>
          <p>目前 rung 用粗雙框與 CURRENT；完成 rung 寫 COMPLETE，未到達 rung 寫 LOCKED。</p>
        </div>
        <div class="stage ladder-stage">
          <section class="growth-rungs">
            @for (stage of stages; track stage.name; let i = $index) {
              <article
                [class.current]="progress() === i"
                [class.complete]="progress() > i"
                [class.locked]="progress() < i"
              >
                <header>
                  <span>RUNG {{ i + 1 }}</span
                  ><b>{{
                    progress() === i ? 'CURRENT' : progress() > i ? 'COMPLETE' : 'LOCKED'
                  }}</b>
                </header>
                <strong>|P| = {{ stage.subgroup.length }}</strong
                ><small>{{ stage.name }}</small>
                <div>
                  <span>COSETS</span><b>{{ stage.cosets.length }}</b>
                </div>
                <div>
                  <span>FIXED</span><b>{{ stage.fixedCosets.length }}</b>
                </div>
                <div>
                  <span>|N(P)/P|</span><b>{{ stage.normalizer.length / stage.subgroup.length }}</b>
                </div>
              </article>
              @if (!$last) {
                <i [class.open]="progress() > i">×2 ↗</i>
              }
            }
          </section>
          <section class="ladder-console">
            <p class="kicker">CURRENT DIAGNOSTIC</p>
            <div>
              <span>SUBGROUP CARDS</span><b>{{ subgroupLabel(active().subgroup) }}</b>
            </div>
            <div>
              <span>INDEX |G:P|</span><b>{{ active().cosets.length }}</b
              ><small>{{ canGrow() ? 'DIVISIBLE BY 2' : 'NOT DIVISIBLE BY 2' }}</small>
            </div>
            <div>
              <span>NORMALIZER QUOTIENT</span
              ><b>{{ active().normalizer.length / active().subgroup.length }}</b
              ><small>{{ canGrow() ? 'ORDER-2 SEED AVAILABLE' : 'NO FORCED EXTRA COSET' }}</small>
            </div>
            <button type="button" class="primary" [disabled]="!canGrow()" (click)="grow()">
              {{ canGrow() ? 'Lift 下一個 2-layer' : '✓ SYLOW TARGET REACHED' }}</button
            ><button type="button" (click)="progress.set(0)">從 Cauchy seed 重播</button>
          </section>
        </div>
      </section>
      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>p</span><i>×p</i><span>p²</span><i>×p</i><span>pⁿ</span>
        </div>
        <p>
          <strong>First Sylow theorem 是一個不會提早停下的 growth loop。</strong>Below target 時
          fixed-coset residue 強迫下一層；到 pⁿ 時 Lagrange 證明沒有更高一層。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 |G|=3⁴·10，從 order-3 seed 到 Sylow 3-subgroup還需幾次 ×3 growth？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(3)">3 次：3→9→27→81</button
          ><button type="button" (click)="transfer.set(4)">4 次</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 3">
            {{
              transfer() === 3
                ? '對。Seed 已經吃掉第一個 factor 3，只剩三層。'
                : '3⁴ target 的 exponent 是 4；從 exponent 1 出發只需增加 3 次。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>First Sylow theorem 的正式 induction</summary>
          <div>
            寫 |G|=pⁿm。Cauchy 先給 order-p subgroup P。若 |P|=pᵏ 且 k&lt;n，則 p∣|G:P|。P 作用在
            G/P 上，fixed coset 數被 p 整除且至少含 P，因此 |N_G(P):P| 被 p 整除。Cauchy 套在
            N_G(P)/P，配合 subgroup correspondence，得到包含 P、order 為 pᵏ⁺¹ 的 Q。重複至 k=n，即得
            Sylow p-subgroup。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3SylowGrowthLadderComponent {
  readonly stages = S4_GROWTH_STAGES;
  readonly progress = signal(0);
  readonly prediction = signal<'done' | 'stuck' | null>(null);
  readonly transfer = signal<number | null>(null);
  readonly active = computed(() => this.stages[this.progress()]);
  readonly canGrow = computed(() => this.progress() < this.stages.length - 1);
  grow(): void {
    if (this.canGrow()) this.progress.update((value) => value + 1);
  }
  subgroupLabel = subgroupLabel;
}
