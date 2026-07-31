import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-world-shrinks',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch8">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 8.1</p>
        <h2>得到新資訊，不是替世界加註解；是把不可能的部分裁掉</h2>
        <p class="lede">
          <strong>條件機率（conditional probability）</strong>問的是：已知 B
          發生後，在剩下的新世界裡，A 占多少？剩餘重量會重新縮放，使新世界再次合計為 100%。
        </p>
      </header>

      <section class="scene">
        <div class="condition-prediction">
          <div>
            <p class="eyebrow">先預測 · 公平六面骰</p>
            <h3>已知點數大於 3，得到偶數的 probability 是多少？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測已知點數大於三時得到偶數的機率">
            @for (choice of predictionChoices; track choice.label) {
              <button
                type="button"
                [class.selected]="prediction() === choice.label"
                (click)="prediction.set(choice.label)"
              >
                {{ choice.label }}
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === '2/3') {
              <strong>對，新世界只剩 4、5、6。</strong>其中 4、6 是偶數，所以比例是 2/3。
            } @else if (prediction() === '1/2') {
              1/2 是還站在原本六格世界時的偶數比例；given 資訊已讓 1、2、3 不再可能。
            } @else {
              1/3 只數到一個符合結果；但新世界裡 4 與 6 都屬於偶數 event。
            }
          </p>
        }
      </section>

      <section class="condition-controls">
        <div class="condition-slider">
          <label for="condition-threshold">已知骰到至少幾點？</label>
          <input
            id="condition-threshold"
            type="range"
            min="2"
            max="6"
            [value]="threshold()"
            (input)="threshold.set(+$any($event).target.value)"
          />
          <strong>B = X ≥ {{ threshold() }}</strong>
        </div>
        <div class="preset-row" role="group" aria-label="切換是否使用條件資訊">
          <button type="button" [class.active]="!conditioned()" (click)="conditioned.set(false)">
            資訊揭曉前
          </button>
          <button type="button" [class.active]="conditioned()" (click)="conditioned.set(true)">
            已知 B
          </button>
        </div>
      </section>

      <section class="world-comparison">
        <div class="world-panel">
          <p class="eyebrow">Original sample space Ω</p>
          <h3>六個 outcomes 都還可能</h3>
          <div class="dice-world" aria-label="原本六個骰子結果">
            @for (outcome of outcomes; track outcome) {
              <div
                class="dice-outcome"
                [class.target]="isEven(outcome)"
                [class.discarded]="conditioned() && !inCondition(outcome)"
              >
                <strong>{{ outcome }}</strong>
                <span>{{ isEven(outcome) ? 'A · even' : 'not A' }}</span>
              </div>
            }
          </div>
          <div class="world-stat">
            <span>A = 偶數，在原世界中</span>
            <strong>3 / 6 = 50%</strong>
          </div>
        </div>

        <div class="world-arrow" aria-hidden="true">
          @if (conditioned()) {
            裁掉<br />B 外面 →
          } @else {
            等待<br />condition
          }
        </div>

        <div class="world-panel conditioned">
          <p class="eyebrow">Conditioned world B</p>
          <h3>
            @if (conditioned()) {
              只讓 {{ remainingLabel() }} 重新填滿 100%
            } @else {
              B 尚未成為目前的世界
            }
          </h3>
          @if (conditioned()) {
            <div
              class="dice-world conditioned-world"
              [style.--remaining-count]="remaining().length"
              aria-label="條件成立後剩餘的骰子結果"
            >
              @for (outcome of remaining(); track outcome) {
                <div class="dice-outcome" [class.target]="isEven(outcome)">
                  <strong>{{ outcome }}</strong>
                  <span>{{ isEven(outcome) ? 'A ∩ B' : 'B only' }}</span>
                </div>
              }
            </div>
            <div class="world-stat">
              <span>A 在新世界 B 中</span>
              <strong
                >{{ evenRemaining().length }} / {{ remaining().length }} = {{ percent() }}</strong
              >
            </div>
          } @else {
            <div class="renormalize-map">
              <div>
                <span>Condition</span>
                <strong>B = X ≥ {{ threshold() }}</strong>
              </div>
              <i>尚未套用</i>
              <div>
                <span>Current denominator</span>
                <strong>仍是 Ω</strong>
              </div>
            </div>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="renormalize-map" aria-hidden="true">
          <div>
            <span>Step 1 · filter</span>
            <strong>裁掉 B 外面</strong>
          </div>
          <i>→</i>
          <div>
            <span>Step 2 · renormalize</span>
            <strong>讓 B 重新成為 100%</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Conditional probability = filter, then renormalize</span>
          <p>
            <strong>outcome 是否屬於 A 沒有改變；改變的是目前仍可能的世界與 denominator。</strong>
            先刪掉不符合資訊的 outcomes，再看 A∩B 占剩餘 B 的比例。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：P(A given B) 的正式定義</summary>
        <div>
          <p>
            <app-math e="P(A\\mid B)" /> 讀作「A given B」，也就是已知 B 時 A 的 probability。只要
            <app-math e="P(B)>0" />：
          </p>
          <div class="math-line">
            <app-math e="P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}" />
          </div>
          <p>
            denominator 是條件世界 B 的原始重量；除以 P(B) 正是在做
            renormalization。公平骰子的例子中，A 包含 2、4、6；B 包含 4、5、6；兩者交集包含 4、6。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2WorldShrinksComponent {
  readonly outcomes = [1, 2, 3, 4, 5, 6];
  readonly predictionChoices = [{ label: '1/2' }, { label: '2/3' }, { label: '1/3' }];
  readonly prediction = signal<string | null>(null);
  readonly threshold = signal(4);
  readonly conditioned = signal(true);
  readonly remaining = computed(() => this.outcomes.filter((value) => this.inCondition(value)));
  readonly evenRemaining = computed(() => this.remaining().filter((value) => this.isEven(value)));
  readonly remainingLabel = computed(() => this.remaining().join('、'));
  readonly percent = computed(
    () => `${((this.evenRemaining().length / this.remaining().length) * 100).toFixed(1)}%`,
  );

  isEven(outcome: number): boolean {
    return outcome % 2 === 0;
  }

  inCondition(outcome: number): boolean {
    return outcome >= this.threshold();
  }
}
