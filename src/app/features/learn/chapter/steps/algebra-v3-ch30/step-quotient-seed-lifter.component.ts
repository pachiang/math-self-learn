import { Component, computed, signal } from '@angular/core';
import { S4_GROWTH_STAGES, leftCosets, permutationLabel, subgroupLabel } from './sylow-model';

@Component({
  selector: 'app-algebra-v3-quotient-seed-lifter',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch30-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 30.4</p>
        <h2>在 N(P)/P 裡找到一個 order-2 direction；lift 回去就多出整整一層 P-cosets</h2>
        <p class="lede">
          Extra fixed cosets 已組成 normalizer quotient。Ch29 的 Cauchy theorem
          可以在這個較小世界再啟動一次，然後用 quotient preimage 把 seed 放大。
        </p>
      </header>
      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>|P|=4，而 quotient 裡的 order-2 cycle 使用 2 個 P-cosets；lift 後 Q 有多大？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(8)">2×4 = 8</button
          ><button type="button" (click)="prediction.set(6)">4+2 = 6</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 8">
            {{
              prediction() === 8
                ? '對。Quotient points 是整個 P-sized fibers，不是單一 elements。'
                : '新 direction 帶來另一整塊 P-coset，所以大小相乘。'
            }}
          </p>
        }
      </section>
      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Quotient-seed lifter</p>
            <h3>先壓成 quotient cycle，再展開每個 coordinate 背後的 P-fiber</h3>
          </div>
          <p>三階段按鈕控制 reveal；每個 quotient point 都保留其完整 member list。</p>
        </div>
        <div class="lifter-tabs">
          @for (stage of stages.slice(0, 2); track stage.name; let i = $index) {
            <button type="button" [attr.aria-pressed]="stageIndex() === i" (click)="selectStage(i)">
              {{ stage.name }} → next rung
            </button>
          }
        </div>
        <div class="phase-controls">
          <button type="button" [attr.aria-pressed]="phase() === 0" (click)="phase.set(0)">
            1 · 看 N(P)/P</button
          ><button type="button" [attr.aria-pressed]="phase() === 1" (click)="phase.set(1)">
            2 · 啟動 Cauchy seed</button
          ><button
            type="button"
            class="primary"
            [attr.aria-pressed]="phase() === 2"
            (click)="phase.set(2)"
          >
            3 · lift 成 Q
          </button>
        </div>
        <div class="stage lifter-stage">
          <section class="quotient-cycle">
            <header>
              <span>N(P)/P</span><b>{{ quotientCosets().length }} quotient points</b>
            </header>
            <div>
              @for (coset of quotientCosets(); track coset.key; let i = $index) {
                <article [class.active]="phase() >= 1">
                  <span>{{ i === 0 ? 'P' : 'gP' }}</span
                  ><b>{{ i }}</b
                  ><small>{{ coset.members.map(label).join(', ') }}</small>
                </article>
                @if (!$last) {
                  <i [class.active]="phase() >= 1">→ order-2 →</i>
                }
              }
            </div>
          </section>
          <section class="lifted-fibers" [class.revealed]="phase() === 2">
            <header>
              <span>PREIMAGE Q</span
              ><b>{{ phase() === 2 ? active().normalizer.length : '?' }} elements</b>
            </header>
            <div>
              @for (coset of quotientCosets(); track coset.key) {
                <article>
                  <span>P-FIBER · SIZE {{ active().subgroup.length }}</span>
                  <div>
                    @for (member of coset.members; track label(member)) {
                      <b>{{ label(member) }}</b>
                    }
                  </div>
                </article>
              }
            </div>
          </section>
          <section class="lifter-console">
            <p class="kicker">GROWTH EQUATION</p>
            <div>
              <span>CURRENT |P|</span><b>{{ active().subgroup.length }}</b>
            </div>
            <div>
              <span>QUOTIENT SEED ORDER</span><b>{{ phase() >= 1 ? '2' : '?' }}</b>
            </div>
            <div>
              <span>LIFTED |Q|</span><b>{{ phase() === 2 ? active().normalizer.length : '?' }}</b
              ><small>{{
                phase() === 2
                  ? active().subgroup.length + ' × 2 = ' + active().normalizer.length
                  : 'REVEAL THE PREIMAGE'
              }}</small>
            </div>
          </section>
        </div>
      </section>
      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>order-p in N/P</span><i>lift fibers</i><span>|Q|=p|P|</span>
        </div>
        <p>
          <strong>Quotient seed adds one p-coordinate layer。</strong>它不是隨便加一個
          element；subgroup correspondence 把整個 quotient cycle 的 preimage 變成更大的 p-subgroup。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 |P|=pᵏ，N(P)/P 中找到 order-p subgroup，lift 後 exponent 變成？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('k+1')">k+1</button
          ><button type="button" (click)="transfer.set('kp')">kp</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() === 'kp'">
            {{
              transfer() === 'k+1'
                ? '對。pᵏ×p=pᵏ⁺¹，多吃一個 p-factor。'
                : 'Exponent 相加：pᵏ·p¹=pᵏ⁺¹。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>為什麼 quotient seed 一定能 lift 成 subgroup？</summary>
          <div>
            P normal in N_G(P)，所以 quotient N_G(P)/P 合法。當 p 整除其大小時，Cauchy theorem
            給一個 order-p subgroup R/P。Canonical projection 的 preimage Q=π⁻¹(R/P) 是 N_G(P) 的
            subgroup，包含 P，且 |Q:P|=p；因此 |Q|=p|P|。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3QuotientSeedLifterComponent {
  readonly stages = S4_GROWTH_STAGES;
  readonly stageIndex = signal(1);
  readonly phase = signal(2);
  readonly prediction = signal<number | null>(null);
  readonly transfer = signal<'k+1' | 'kp' | null>(null);
  readonly active = computed(() => this.stages[this.stageIndex()]);
  readonly quotientCosets = computed(() =>
    leftCosets(this.active().normalizer, this.active().subgroup),
  );
  selectStage(index: number): void {
    this.stageIndex.set(index);
    this.phase.set(0);
  }
  label = permutationLabel;
  subgroupLabel = subgroupLabel;
}
