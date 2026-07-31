import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type GivenDirection = 'a-given-b' | 'b-given-a';

@Component({
  selector: 'app-prob-v2-given-direction',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch8">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 8.2</p>
        <h2>Given 後面的事件，決定你現在站在哪個世界裡</h2>
        <p class="lede">
          <strong>P(A|B)</strong> 是「在 B 裡看 A」；<strong>P(B|A)</strong>
          是「在 A 裡看 B」。兩者看見同一塊 intersection，卻用不同的新世界當 denominator。
        </p>
      </header>

      <section class="scene">
        <div class="direction-prediction">
          <div>
            <p class="eyebrow">先預測 · 40-person group</p>
            <h3>20 人學日文、15 人看動畫、10 人兩者皆是；兩個 given 方向會相等嗎？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測兩個條件機率是否相等">
            <button
              type="button"
              [class.selected]="prediction() === 'same'"
              (click)="prediction.set('same')"
            >
              會相等
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'different'"
              (click)="prediction.set('different')"
            >
              不一定相等
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'different') {
              <strong>對。intersection 都是同一批 10 人，</strong>但它在 15 人中占 2/3，在 20
              人中只占 1/2。
            } @else {
              交集沒有方向，但 conditional probability 有：given 後面的事件會換掉 denominator。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Direction switch</p>
            <h3>只切換 given 方向，觀察哪些人保持不動</h3>
          </div>
          <div class="preset-row" role="group" aria-label="切換條件機率方向">
            <button
              type="button"
              [class.active]="direction() === 'a-given-b'"
              (click)="direction.set('a-given-b')"
            >
              P(A | B)
            </button>
            <button
              type="button"
              [class.active]="direction() === 'b-given-a'"
              (click)="direction.set('b-given-a')"
            >
              P(B | A)
            </button>
          </div>
        </div>
      </section>

      <section class="direction-board">
        <div class="population-panel">
          <p class="eyebrow">Original population · 40 people</p>
          <h3>{{ conditionDescription() }}</h3>
          <div class="population-grid" aria-label="四十人中事件 A、B 與交集的分布">
            @for (person of people; track person) {
              <div
                class="person-tile"
                [class.in-condition]="inCondition(person)"
                [class.in-intersection]="inIntersection(person)"
                [class.outside-condition]="!inCondition(person)"
              >
                {{ person + 1 }}
              </div>
            }
          </div>
          <div class="population-legend">
            <span><i></i>given world</span>
            <span><i class="overlap"></i>A ∩ B · 固定 10 人</span>
          </div>
        </div>

        <div class="zoom-panel">
          <p class="eyebrow">Zoom into the given world</p>
          <h3>{{ questionSentence() }}</h3>
          <div class="given-expression">
            <div>
              <span>目標且條件都符合</span>
              <strong>10 人</strong>
            </div>
            <i>÷</i>
            <div>
              <span>given world 全部</span>
              <strong>{{ denominator() }} 人</strong>
            </div>
          </div>
          <div class="direction-result">{{ fraction() }} = {{ percentage() }}</div>
          <p class="feedback">{{ resultExplanation() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="renormalize-map" aria-hidden="true">
          <div>
            <span>P(A | B)</span>
            <strong>intersection / B</strong>
          </div>
          <i>denominator changes</i>
          <div>
            <span>P(B | A)</span>
            <strong>intersection / A</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Given 後面是新世界，前面是要量的區域</span>
          <p>
            <strong>直線左右不能交換。</strong>
            分子雖然都是 A∩B，given B 與 given A 卻分別把 15 人與 20 人重新視為 100%。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：同一 intersection，兩個 denominator</summary>
        <div>
          <div class="math-line">
            <app-math
              e="P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)},\\qquad P(B\\mid A)=\\frac{P(A\\cap B)}{P(A)}"
            />
          </div>
          <p>
            因此兩者一般不相等。把第一式與第二式重新排列，會得到 P(A|B)P(B)=P(B|A)P(A)；第十章的
            Bayes’ theorem 會利用這座橋反轉資訊方向。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2GivenDirectionComponent {
  readonly people = Array.from({ length: 40 }, (_, index) => index);
  readonly prediction = signal<'same' | 'different' | null>(null);
  readonly direction = signal<GivenDirection>('a-given-b');
  readonly denominator = computed(() => (this.direction() === 'a-given-b' ? 15 : 20));
  readonly fraction = computed(() => (this.direction() === 'a-given-b' ? '10/15' : '10/20'));
  readonly percentage = computed(() => (this.direction() === 'a-given-b' ? '66.7%' : '50.0%'));
  readonly conditionDescription = computed(() =>
    this.direction() === 'a-given-b'
      ? '已知 B：只保留 15 位「看動畫」的人'
      : '已知 A：只保留 20 位「學日文」的人',
  );
  readonly questionSentence = computed(() =>
    this.direction() === 'a-given-b'
      ? '在看動畫的人裡，有多少也學日文？'
      : '在學日文的人裡，有多少也看動畫？',
  );
  readonly resultExplanation = computed(() =>
    this.direction() === 'a-given-b'
      ? 'B 的 15 人成為新分母；其中 10 人也在 A。'
      : 'A 的 20 人成為新分母；其中仍是同樣的 10 人也在 B。',
  );

  inA(person: number): boolean {
    return person < 20;
  }

  inB(person: number): boolean {
    return person < 10 || (person >= 20 && person < 25);
  }

  inIntersection(person: number): boolean {
    return this.inA(person) && this.inB(person);
  }

  inCondition(person: number): boolean {
    return this.direction() === 'a-given-b' ? this.inB(person) : this.inA(person);
  }
}
