import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type ModelPreset = 'valid' | 'negative' | 'overflow' | 'under';

interface ProbabilityModel {
  label: string;
  weights: number[];
}

@Component({
  selector: 'app-prob-v2-probability-foundations',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch3">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 3.4</p>
        <h2>任何 probability model，都得站在三條地基上</h2>
        <p class="lede">
          這三條規則不是算題技巧，而是判斷一組數字能不能代表不確定性的最低要求。
          先看它們在圖上必須長什麼樣，再把正式符號收進附錄。
        </p>
      </header>

      <section class="foundation-grid" aria-label="機率的三條基礎規則">
        <div class="foundation-card">
          <span class="foundation-number">1</span>
          <strong>每一份重量都不能是負的</strong>
          <p>probability mass 可以是 0，但「負的可能性」沒有可分配的意義。</p>
        </div>
        <div class="foundation-card">
          <span class="foundation-number">2</span>
          <strong>整個世界的總重量是 1</strong>
          <p>最後一定落在 sample space 的某個 outcome；不能少分，也不能多分。</p>
        </div>
        <div class="foundation-card">
          <span class="foundation-number">3</span>
          <strong>不重疊的重量可以直接相加</strong>
          <p>同一次實驗只會落在一格；把幾格圈成 event，就是把那些格子的 mass 合起來。</p>
        </div>
      </section>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Model inspector</p>
            <h3>哪一組數字真的能當 probability distribution？</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇待檢查的模型">
            @for (entry of presetEntries; track entry.key) {
              <button
                type="button"
                [class.active]="preset() === entry.key"
                (click)="preset.set(entry.key)"
              >
                {{ entry.label }}
              </button>
            }
          </div>
        </div>
      </section>

      <section class="model-tester">
        <div class="test-model">
          @for (weight of currentModel().weights; track $index) {
            <div class="test-weight" [class.negative]="weight < 0">
              <span>outcome {{ $index + 1 }}</span>
              <strong>{{ signed(weight) }}</strong>
            </div>
          }
        </div>
        <div class="validity-panel" [class.valid]="isValid()" [class.invalid]="!isValid()">
          <span>MODEL CHECK · TOTAL {{ total().toFixed(1) }}</span>
          <strong>{{ isValid() ? '✓ 可以成立' : '× 不能成立' }}</strong>
          <p>{{ verdict() }}</p>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Additivity · 點選 outcomes 組成 event A</p>
            <h3>Event 的重量，就是被圈選格子的重量總和</h3>
          </div>
          <p>
            這六格是公平骰子的六個互不重疊 outcomes。點選任意幾格； 右側刻度會把每一份 1/6
            疊加起來。
          </p>
        </div>
        <div class="additivity-demo">
          <div class="weight-tiles" role="group" aria-label="選取事件 A 包含的骰子結果">
            @for (outcome of outcomes; track outcome) {
              <button
                type="button"
                [class.selected]="selected().has(outcome)"
                [attr.aria-pressed]="selected().has(outcome)"
                (click)="toggleOutcome(outcome)"
              >
                <strong>{{ outcome }}</strong>
                <span>1 / 6</span>
              </button>
            }
          </div>
          <div class="event-scale">
            <span>EVENT A = {{ selectedLabel() }}</span>
            <strong>P(A) = {{ selected().size }} / 6</strong>
            <div class="scale-track" aria-hidden="true">
              <div class="scale-fill" [style.width.%]="eventProbability() * 100"></div>
            </div>
            <p class="feedback">
              {{ selected().size }} 個互不重疊 outcomes × 每格 1/6 =
              {{ percent(eventProbability()) }}
            </p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="normalization-flow" aria-hidden="true">
          <div>
            <span>outcomes</span>
            <strong>各自承接 mass</strong>
          </div>
          <i>→</i>
          <div>
            <span>events</span>
            <strong>把圈內 mass 加總</strong>
          </div>
        </div>
        <div>
          <span class="card-label">一張圖收束本章</span>
          <p>
            <strong>probability 是在完整可能世界中，替 outcomes 分配總量為 1 的非負重量。</strong>
            event 不會創造新重量；它只把自己包含的 outcomes 重量加起來。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>正式層：Kolmogorov axioms 與 additivity</summary>
        <div>
          <p>機率論通常用三條 <strong>Kolmogorov axioms</strong> 作為起點：</p>
          <div class="math-line">
            <app-math e="P(A)\\ge 0,\\qquad P(\\Omega)=1" />
          </div>
          <p>若事件 <app-math e="A_1,A_2,\\ldots" /> 兩兩互斥（pairwise disjoint），則：</p>
          <div class="math-line">
            <app-math
              e="P\\!\\left(\\bigcup_{i=1}^{\\infty}A_i\\right)=\\sum_{i=1}^{\\infty}P(A_i)"
            />
          </div>
          <p>
            互斥的要求很重要：有重疊時直接相加會把交疊區重複計算。 event
            的交集、聯集與互斥會在下一章用可操作的集合圖正式建立。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ProbabilityFoundationsComponent {
  readonly models: Record<ModelPreset, ProbabilityModel> = {
    valid: { label: 'Valid', weights: [0.1, 0.2, 0.3, 0.4] },
    negative: { label: '含負值', weights: [0.4, 0.4, 0.3, -0.1] },
    overflow: { label: '總量 1.2', weights: [0.3, 0.3, 0.3, 0.3] },
    under: { label: '總量 0.8', weights: [0.2, 0.2, 0.2, 0.2] },
  };
  readonly presetEntries = (Object.keys(this.models) as ModelPreset[]).map((key) => ({
    key,
    label: this.models[key].label,
  }));
  readonly preset = signal<ModelPreset>('valid');
  readonly currentModel = computed(() => this.models[this.preset()]);
  readonly total = computed(() =>
    this.currentModel().weights.reduce((sum, weight) => sum + weight, 0),
  );
  readonly hasNegative = computed(() => this.currentModel().weights.some((weight) => weight < 0));
  readonly isValid = computed(() => !this.hasNegative() && Math.abs(this.total() - 1) < 0.000_001);
  readonly verdict = computed(() => {
    if (this.hasNegative()) {
      return '總和雖然是 1，但 outcome 4 得到負重量，違反 non-negativity。';
    }
    if (this.total() > 1) {
      return '每格都非負，但總量超過 1：同一份可能世界被多分了。';
    }
    if (this.total() < 1) {
      return '每格都非負，但總量不足 1：仍有 probability mass 沒有分到任何 outcome。';
    }
    return '所有 weights 非負，而且合計恰好為 1；這是一個合法的 probability model。';
  });

  readonly outcomes = [1, 2, 3, 4, 5, 6];
  readonly selected = signal(new Set([2, 4, 6]));
  readonly selectedLabel = computed(() => {
    const values = [...this.selected()].sort((a, b) => a - b);
    return values.length ? `{${values.join(', ')}}` : '∅';
  });
  readonly eventProbability = computed(() => this.selected().size / 6);

  toggleOutcome(outcome: number): void {
    const next = new Set(this.selected());
    next.has(outcome) ? next.delete(outcome) : next.add(outcome);
    this.selected.set(next);
  }

  signed(value: number): string {
    return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
  }

  percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }
}
