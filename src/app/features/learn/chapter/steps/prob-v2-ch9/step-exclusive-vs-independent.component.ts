import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

interface IndependenceScenario {
  id: string;
  title: string;
  subtitle: string;
  outcomes: string[];
  eventA: string[];
  eventB: string[];
  before: string;
  after: string;
  overlap: string;
  mutuallyExclusive: boolean;
  independent: boolean;
  explanation: string;
}

@Component({
  selector: 'app-prob-v2-exclusive-vs-independent',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch9">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 9.2</p>
        <h2>沒有 overlap，不是「互不影響」；反而代表資訊影響最大</h2>
        <p class="lede">
          <strong>互斥（mutually exclusive）</strong>只問能否同時發生； independence 問 given B 後 A
          的比例是否改變。兩者看的不是同一個特徵。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Same checker · three structures</p>
            <h3>先選情境，再判斷 A、B 是否 independent</h3>
          </div>
          @if (prediction() !== null) {
            <p class="feedback">
              @if (prediction() === scenario().independent) {
                <strong>判斷正確。</strong> {{ scenario().explanation }}
              } @else {
                {{ scenario().explanation }}
              }
            </p>
          }
        </div>
        <div class="scenario-tabs" role="tablist" aria-label="選擇事件關係情境">
          @for (item of scenarios; track item.id) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="scenario().id === item.id"
              [class.active]="scenario().id === item.id"
              (click)="selectScenario(item)"
            >
              <strong>{{ item.title }}</strong>
              <span>{{ item.subtitle }}</span>
            </button>
          }
        </div>
        <div class="choice-row" role="group" aria-label="判斷事件是否獨立">
          <button
            type="button"
            [class.selected]="prediction() === true"
            (click)="prediction.set(true)"
          >
            Independent
          </button>
          <button
            type="button"
            [class.selected]="prediction() === false"
            (click)="prediction.set(false)"
          >
            Dependent
          </button>
        </div>
      </section>

      <section class="concept-check-board">
        <div class="outcome-checker">
          <p class="eyebrow">Event geometry</p>
          <h3>{{ scenario().subtitle }}</h3>
          <div
            class="checker-row"
            [style.--outcome-count]="scenario().outcomes.length"
            aria-label="事件 A 與 B 在樣本空間中的位置"
          >
            @for (outcome of scenario().outcomes; track outcome) {
              <div
                class="checker-cell"
                [class.in-a]="inA(outcome)"
                [class.in-b]="inB(outcome)"
                [class.in-both]="inA(outcome) && inB(outcome)"
              >
                <strong>{{ outcome }}</strong>
              </div>
            }
          </div>
          <div class="condition-ratios">
            <div>
              <span>BEFORE · P(A)</span>
              <strong>{{ scenario().before }}</strong>
            </div>
            <i>given B →</i>
            <div>
              <span>AFTER · P(A | B)</span>
              <strong>{{ scenario().after }}</strong>
            </div>
          </div>
        </div>

        <div
          class="concept-verdict"
          [class.independent]="scenario().independent"
          [class.dependent]="!scenario().independent"
        >
          <p class="eyebrow">Two separate questions</p>
          <div class="verdict-grid">
            <div>
              <span>OVERLAP?</span>
              <strong>{{ scenario().overlap }}</strong>
            </div>
            <div>
              <span>MUTUALLY EXCLUSIVE?</span>
              <strong>{{ scenario().mutuallyExclusive ? 'Yes' : 'No' }}</strong>
            </div>
            <div>
              <span>RATIO CHANGED?</span>
              <strong>{{ scenario().before === scenario().after ? 'No' : 'Yes' }}</strong>
            </div>
            <div>
              <span>INDEPENDENT?</span>
              <strong>{{ scenario().independent ? 'Yes' : 'No' }}</strong>
            </div>
          </div>
          <p>{{ scenario().explanation }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="marginal-lock" aria-hidden="true">
          <div>
            <span>Mutually exclusive</span>
            <strong>檢查 overlap</strong>
          </div>
          <i>≠</i>
          <div>
            <span>Independent</span>
            <strong>檢查 ratio invariant</strong>
          </div>
        </div>
        <div>
          <span class="card-label">互斥看幾何；獨立看資訊更新</span>
          <p>
            <strong>非零互斥事件 given B 後，A 會從原本正 probability 直接掉到 0。</strong>
            B 的資訊完全決定 A 不可能，怎麼會是「互不影響」？
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>短證明：為什麼非零 mutually exclusive events 不 independent？</summary>
        <div>
          <p>若 A、B mutually exclusive，則 A∩B 為空。當 P(B)>0：</p>
          <div class="math-line">
            <app-math e="P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}=0" />
          </div>
          <p>
            若 P(A)>0，便有 P(A|B)≠P(A)，所以 dependent。只有 A 或 B 本身是 probability-zero event
            時，互斥才可能同時滿足乘積形式。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ExclusiveVsIndependentComponent {
  readonly scenarios: IndependenceScenario[] = [
    {
      id: 'coins',
      title: '可以同時發生，也 independent',
      subtitle: '兩次硬幣：A=first H，B=second H',
      outcomes: ['HH', 'HT', 'TH', 'TT'],
      eventA: ['HH', 'HT'],
      eventB: ['HH', 'TH'],
      before: '2/4 = 50%',
      after: '1/2 = 50%',
      overlap: 'HH',
      mutuallyExclusive: false,
      independent: true,
      explanation: 'A、B 有共同 path HH；但 given B 後 A 仍占 1/2，所以 independent。',
    },
    {
      id: 'odd-even',
      title: '沒有 overlap，卻 dependent',
      subtitle: '一顆骰子：A=odd，B=even',
      outcomes: ['1', '2', '3', '4', '5', '6'],
      eventA: ['1', '3', '5'],
      eventB: ['2', '4', '6'],
      before: '3/6 = 50%',
      after: '0/3 = 0%',
      overlap: 'none',
      mutuallyExclusive: true,
      independent: false,
      explanation: 'given even 後 odd 立刻不可能；B 的資訊把 A 從 50% 改成 0%。',
    },
    {
      id: 'overlap-dependent',
      title: '有 overlap，也可能 dependent',
      subtitle: '一顆骰子：A=even，B=>3',
      outcomes: ['1', '2', '3', '4', '5', '6'],
      eventA: ['2', '4', '6'],
      eventB: ['4', '5', '6'],
      before: '3/6 = 50%',
      after: '2/3 = 66.7%',
      overlap: '4, 6',
      mutuallyExclusive: false,
      independent: false,
      explanation: 'A、B 能同時發生，但 given B 後 A 從 50% 升到 66.7%，仍然 dependent。',
    },
  ];

  readonly scenario = signal(this.scenarios[1]);
  readonly prediction = signal<boolean | null>(null);

  selectScenario(scenario: IndependenceScenario): void {
    this.scenario.set(scenario);
    this.prediction.set(null);
  }

  inA(outcome: string): boolean {
    return this.scenario().eventA.includes(outcome);
  }

  inB(outcome: string): boolean {
    return this.scenario().eventB.includes(outcome);
  }
}
