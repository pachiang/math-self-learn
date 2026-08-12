import { Component, computed, signal } from '@angular/core';
import { CONSTRAINT_PRESETS, sylowConstraints } from './sylow-landscape-model';

@Component({
  selector: 'app-algebra-v3-sylow-constraint-solver',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch31-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 31.5</p>
        <h2>兩道 gates 只負責刪除不可能；剩下一個 1，才有資格宣告 normal</h2>
        <p class="lede">
          Sylow constraints 是篩選器，不是 subgroup 生成器。先以 nₚ∣m 保留 divisors，再以 nₚ≡1 mod p
          過濾；若仍有多個 candidates，就必須保留 branches。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>|G|=21、p=7 時，n₇ 能等於 3 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不能；3 不等於 1 mod 7</button>
          <button type="button" (click)="prediction.set(true)">能；3 整除 non-7 part</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? '3 通過 divisibility gate，卻在 congruence gate 被擋下；兩道條件缺一不可。'
                : '對。只剩 n₇=1，所以 Sylow 7-subgroup unique and normal。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Sylow constraint solver</p>
            <h3>選擇 group order 與 prime；親手讓 candidates 通過第二道 gate</h3>
          </div>
          <p>每張 card 都標示 PASS／REMOVED 與被刪原因；結果不以綠色或紅色單獨傳達。</p>
        </div>
        <div class="solver-presets" role="group" aria-label="選擇有限群階數與 prime">
          @for (preset of presets; track preset.order + '-' + preset.prime; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="presetIndex() === i"
              (click)="selectPreset(i)"
            >
              |G|={{ preset.order }} · p={{ preset.prime }}
            </button>
          }
        </div>
        <div class="stage solver-stage">
          <section class="order-factorization">
            <span>INPUT</span>
            <b>|G|={{ result().order }}</b>
            <i>=</i>
            <strong
              >{{ result().prime }}<sup>{{ result().exponent }}</sup></strong
            >
            <i>×</i>
            <strong>{{ result().rest }}</strong>
            <small>p-power {{ result().power }} · non-p part m={{ result().rest }}</small>
          </section>
          <section class="candidate-pipeline">
            <article class="gate-card passed">
              <header><span>GATE 1</span><b>nₚ ∣ m</b></header>
              <p>只保留 m={{ result().rest }} 的 divisors</p>
              <div>
                @for (candidate of result().divisors; track candidate) {
                  <span>{{ candidate }}</span>
                }
              </div>
            </article>
            <i class="pipeline-arrow">→</i>
            <article
              class="gate-card"
              [class.locked]="phase() === 0"
              [class.passed]="phase() === 1"
            >
              <header>
                <span>GATE 2</span><b>nₚ ≡ 1 mod {{ result().prime }}</b>
              </header>
              <p>{{ phase() === 0 ? '尚未套用 residue 條件' : '逐張標記 PASS 或 REMOVED' }}</p>
              <div>
                @for (candidate of result().divisors; track candidate) {
                  <span
                    [class.removed]="phase() === 1 && !survives(candidate)"
                    [class.survives]="phase() === 1 && survives(candidate)"
                  >
                    {{ candidate }}
                    <small>{{
                      phase() === 0 ? 'WAIT' : survives(candidate) ? 'PASS' : 'REMOVED'
                    }}</small>
                  </span>
                }
              </div>
            </article>
          </section>
          <section class="solver-console" aria-live="polite">
            <button type="button" class="primary" [disabled]="phase() === 1" (click)="phase.set(1)">
              套用 congruence gate
            </button>
            <button type="button" (click)="phase.set(0)">重跑</button>
            <div>
              <span>SURVIVING nₚ</span>
              <b>{{ phase() === 0 ? '?' : survivorLabel() }}</b>
            </div>
            <div
              [class.normal-result]="isForcedNormal()"
              [class.open-result]="phase() === 1 && !isForcedNormal()"
            >
              <span>STRUCTURAL CONSEQUENCE</span>
              <b>{{ verdict() }}</b>
              <small>{{ verdictDetail() }}</small>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>divides m</span><i>then</i><span>≡ 1 mod p</span>
        </div>
        <p>
          <strong>Sylow analysis 是負責任的 constraint solver。</strong>
          唯一 survivor 1 才推出 normal；多個 survivors 代表證據仍不足，不能挑一個順眼的答案。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>|G|=12、p=3 時最後留下 n₃∈{{ '{' }}1,4{{ '}' }}。能直接斷言 n₃=1 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不能，兩個 branches 都要保留</button>
          <button type="button" (click)="transfer.set(true)">能，1 比較簡單</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? '數學限制不會因某個 candidate 比較漂亮就自動加強；還需要 element counting 或 action argument。'
                : '對。Sylow conditions 是必要條件，不保證每個 survivor 都一定實現，也不替你任選 branch。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Sylow 第三定理（Sylow’s third theorem）與 normality criterion</summary>
          <div>
            若 |G|=pⁿm 且 p∤m，Sylow p-subgroups 的數量 nₚ 滿足 nₚ∣m 且 nₚ≡1 (mod p)。此外 nₚ=1
            當且僅當該 Sylow p-subgroup normal。這些是必要限制；當 survivors 不只一個時，仍需
            counting、其他 action 或 quotient 資訊繼續排除。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3SylowConstraintSolverComponent {
  readonly presets = CONSTRAINT_PRESETS;
  readonly presetIndex = signal(0);
  readonly phase = signal<0 | 1>(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly result = computed(() => {
    const preset = this.presets[this.presetIndex()];
    return sylowConstraints(preset.order, preset.prime);
  });
  readonly isForcedNormal = computed(
    () =>
      this.phase() === 1 &&
      this.result().survivors.length === 1 &&
      this.result().survivors[0] === 1,
  );

  selectPreset(index: number): void {
    this.presetIndex.set(index);
    this.phase.set(0);
  }

  survives(candidate: number): boolean {
    return this.result().survivors.includes(candidate);
  }

  survivorLabel(): string {
    return `{ ${this.result().survivors.join(', ')} }`;
  }

  verdict(): string {
    if (this.phase() === 0) return 'WAITING FOR GATE 2';
    return this.isForcedNormal() ? 'UNIQUE → NORMAL' : 'MULTIPLE BRANCHES REMAIN';
  }

  verdictDetail(): string {
    if (this.phase() === 0) return '不能只用 divisibility 提早下結論';
    return this.isForcedNormal()
      ? 'nₚ=1；conjugation landscape 只有一點'
      : '需要額外 counting、action 或 quotient 資訊';
  }
}
