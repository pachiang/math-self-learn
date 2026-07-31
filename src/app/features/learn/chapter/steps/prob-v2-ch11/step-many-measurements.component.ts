import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type MeasureId = 'sum' | 'max' | 'double';

interface DiceOutcome {
  first: number;
  second: number;
}

@Component({
  selector: 'app-prob-v2-many-measurements',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch11">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 11.2</p>
        <h2>世界沒有變；換一個問題，數值地圖就會重畫</h2>
        <p class="lede">
          同一個 sample space 可以同時承載許多 random variables。outcome 告訴我們「發生了什麼」；
          variable 則選擇「要從中讀出什麼」。
        </p>
      </header>

      <section class="scene">
        <div class="rv-prediction">
          <div>
            <p class="eyebrow">先預測 · outcome = (2, 5)</p>
            <h3>Sum、Maximum、Doubles indicator 三台 machine 會輸出哪一組？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測三個測量規則的輸出">
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
            @if (prediction() === '7 · 5 · 0') {
              <strong>對。</strong>同一個 (2,5) 依序被讀成總和 7、最大值 5、不是 doubles 所以是 0。
            } @else {
              對 (2,5)：2+5=7、max(2,5)=5，兩顆不同所以 indicator=0。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Same 36 outcomes · different questions</p>
            <h3>切換 measurement rule，觀察等值區域如何重組</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇骰子測量規則">
            @for (measure of measures; track measure.id) {
              <button
                type="button"
                [class.active]="activeMeasure() === measure.id"
                (click)="activeMeasure.set(measure.id)"
              >
                {{ measure.label }}
              </button>
            }
          </div>
        </div>
      </section>

      <section class="dice-measure-board">
        <div class="rv-dice-world">
          <div class="axis-caption">
            <span>second die →</span>
            <span>first die ↓</span>
          </div>
          <div class="dice-outcome-grid" role="grid" aria-label="兩顆有順序骰子的三十六個結果">
            @for (outcome of outcomes; track outcome.first + '-' + outcome.second) {
              <button
                type="button"
                role="gridcell"
                [class.active]="isSelected(outcome)"
                [class.binary-on]="
                  activeMeasure() === 'double' && measureValue(outcome, activeMeasure()) === 1
                "
                [style.--value-tone]="tone(outcome)"
                (click)="select(outcome)"
                [attr.aria-label]="
                  '骰子結果 ' +
                  outcome.first +
                  ',' +
                  outcome.second +
                  '，輸出 ' +
                  measureValue(outcome, activeMeasure())
                "
              >
                <small>{{ outcome.first }},{{ outcome.second }}</small>
                <strong>{{ measureValue(outcome, activeMeasure()) }}</strong>
              </button>
            }
          </div>
        </div>

        <div class="measure-readout">
          <span class="card-label">SELECTED OUTCOME</span>
          <div class="selected-dice">
            <i>{{ selected().first }}</i>
            <i>{{ selected().second }}</i>
          </div>
          <p>完整 outcome 始終是 ({{ selected().first }}, {{ selected().second }})</p>
          <div class="rule-output">
            <span>{{ activeDefinition() }}</span>
            <strong>{{ activeSymbol() }} = {{ activeValue() }}</strong>
          </div>
          <p class="feedback">{{ activeExplanation() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="rv-core-map compact" aria-hidden="true">
          <div><strong>(2, 5)</strong><span>same outcome</span></div>
          <i>ask differently</i>
          <div><strong>7 · 5 · 0</strong><span>different values</span></div>
        </div>
        <div>
          <span class="card-label">Sample space 是世界；random variable 是問題</span>
          <p>
            <strong>36 個 cells 從頭到尾沒有增減。</strong>
            改變的是如何替它們貼數值標籤，以及哪些 outcomes 因同值而被視為一組。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：三個 functions 與 indicator</summary>
        <div>
          <div class="math-line">
            <app-math e="X(i,j)=i+j,\\qquad Y(i,j)=\\max(i,j)" />
          </div>
          <div class="math-line">
            <app-math
              e="Z(i,j)=\\mathbf{1}_{\\{i=j\\}}=\\begin{cases}1&i=j\\\\0&i\\ne j\\end{cases}"
            />
          </div>
          <p>
            Z 是<strong>指示隨機變數（indicator random variable）</strong>：用 1 表示事件發生、0
            表示沒發生。這讓事件也能進入數值計算。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ManyMeasurementsComponent {
  readonly predictionChoices = [
    { label: '7 · 5 · 0' },
    { label: '7 · 2 · 1' },
    { label: '5 · 7 · 0' },
  ];
  readonly measures: { id: MeasureId; label: string }[] = [
    { id: 'sum', label: 'Sum X' },
    { id: 'max', label: 'Maximum Y' },
    { id: 'double', label: 'Doubles Z' },
  ];
  readonly outcomes: DiceOutcome[] = Array.from({ length: 36 }, (_, index) => ({
    first: Math.floor(index / 6) + 1,
    second: (index % 6) + 1,
  }));
  readonly prediction = signal<string | null>(null);
  readonly activeMeasure = signal<MeasureId>('sum');
  readonly selected = signal<DiceOutcome>({ first: 2, second: 5 });
  readonly activeValue = computed(() => this.measureValue(this.selected(), this.activeMeasure()));
  readonly activeSymbol = computed(() => {
    const symbols: Record<MeasureId, string> = { sum: 'X(2,5)', max: 'Y(2,5)', double: 'Z(2,5)' };
    const outcome = this.selected();
    return symbols[this.activeMeasure()].replace('2,5', `${outcome.first},${outcome.second}`);
  });
  readonly activeDefinition = computed(() => {
    const labels: Record<MeasureId, string> = {
      sum: '把兩顆點數相加',
      max: '只讀較大的點數',
      double: '同點輸出 1，否則輸出 0',
    };
    return labels[this.activeMeasure()];
  });
  readonly activeExplanation = computed(() => {
    const messages: Record<MeasureId, string> = {
      sum: '斜向帶狀區域有相同的 sum；例如 (2,5)、(3,4) 都映到 7。',
      max: '右下方的方框邊界共享 maximum；值 5 的 outcomes 沿第 5 列與第 5 欄排列。',
      double: '只有對角線上的 doubles 映到 1，其餘 30 個 outcomes 全部映到 0。',
    };
    return messages[this.activeMeasure()];
  });

  measureValue(outcome: DiceOutcome, measure: MeasureId): number {
    if (measure === 'sum') return outcome.first + outcome.second;
    if (measure === 'max') return Math.max(outcome.first, outcome.second);
    return outcome.first === outcome.second ? 1 : 0;
  }

  tone(outcome: DiceOutcome): number {
    const value = this.measureValue(outcome, this.activeMeasure());
    if (this.activeMeasure() === 'sum') return 190 + value * 8;
    if (this.activeMeasure() === 'max') return 205 + value * 13;
    return value === 1 ? 28 : 210;
  }

  select(outcome: DiceOutcome): void {
    this.selected.set(outcome);
  }

  isSelected(outcome: DiceOutcome): boolean {
    return outcome.first === this.selected().first && outcome.second === this.selected().second;
  }
}
