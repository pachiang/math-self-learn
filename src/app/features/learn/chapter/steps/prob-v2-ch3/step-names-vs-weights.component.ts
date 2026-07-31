import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-names-vs-weights',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch3">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 3.1</p>
        <h2>兩種結果名稱，不代表各占一半</h2>
        <p class="lede">
          sample space 告訴我們結果如何分類，卻沒有自動附上 probability。 要知道哪個 outcome
          更可能，還必須知道每一類在生成過程中承接了多少重量。
        </p>
      </header>

      <section class="scene">
        <div class="weight-question">
          <div>
            <p class="eyebrow">先抓住最常見的錯誤</p>
            <h3>袋中有 9 顆紅球、1 顆藍球。抽到藍球的 probability 是多少？</h3>
            <p class="lede">
              如果只看壓縮後的 sample space，它確實只有兩個名稱：
              {{ '{紅色, 藍色}' }}。
            </p>
          </div>
          <div class="choice-row" role="group" aria-label="選擇抽到藍球的機率">
            <button
              type="button"
              [class.selected]="prediction() === 'half'"
              (click)="prediction.set('half')"
            >
              1 / 2
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'tenth'"
              (click)="prediction.set('tenth')"
            >
              1 / 10
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'unknown'"
              (click)="prediction.set('unknown')"
            >
              無法知道
            </button>
          </div>
        </div>
        @if (prediction()) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'tenth') {
              <strong>對，是 1/10。</strong>
              十顆實體球是十個等可能的抽取位置，其中只有一個位置是藍球。
            } @else if (prediction() === 'half') {
              「紅、藍」只有兩個名稱，但紅色名稱背後壓著九顆球，藍色只有一顆。 名稱數不能替代重量。
            } @else {
              這裡已經知道每顆實體球被抽中的機會相同，也知道各色球數， 所以可以算出藍球承接 1/10
              的重量。
            }
          </p>
        }
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">名稱維持兩種，重量可以一直改</p>
            <h3>拖動球數，觀察什麼不變</h3>
          </div>
          <p>
            紅球與藍球至少各保留一顆，因此 sample space 的 outcome
            名稱始終是同樣兩個；改變的只有它們各自承接的 probability mass。
          </p>
        </div>

        <div class="bag-visual">
          <div class="bag" aria-label="裝有紅球與藍球的袋子">
            @for (_ of redBalls(); track $index) {
              <span class="ball" aria-label="紅球">R</span>
            }
            @for (_ of blueBalls(); track $index) {
              <span class="ball blue" aria-label="藍球">B</span>
            }
          </div>

          <div class="bag-controls">
            <div class="count-control">
              <label for="red-count">紅球</label>
              <input
                id="red-count"
                type="range"
                min="1"
                max="9"
                [value]="redCount()"
                (input)="redCount.set(+$any($event).target.value)"
              />
              <strong>{{ redCount() }}</strong>
            </div>
            <div class="count-control">
              <label for="blue-count">藍球</label>
              <input
                id="blue-count"
                type="range"
                min="1"
                max="9"
                [value]="blueCount()"
                (input)="blueCount.set(+$any($event).target.value)"
              />
              <strong>{{ blueCount() }}</strong>
            </div>
            <div class="mass-bar" aria-label="紅色與藍色的 probability mass">
              <div class="mass-segment" [style.width.%]="redProbability() * 100">
                {{ percent(redProbability()) }}
              </div>
              <div class="mass-segment blue" [style.width.%]="blueProbability() * 100">
                {{ percent(blueProbability()) }}
              </div>
            </div>
            <p class="feedback">
              outcomes 仍是 <strong>{{ '{紅色, 藍色}' }}</strong
              >； 現在 P(藍色) = {{ blueCount() }}/{{ totalBalls() }}。
            </p>
          </div>
        </div>
      </section>

      <section class="category-compression">
        <div class="category-card">
          <span>完整抽取位置</span>
          <strong>{{ totalBalls() }} 顆球</strong>
          <p>若每顆球等可能，這一層可以直接數球。相同顏色的球之後會被合併成同一個 outcome 名稱。</p>
        </div>
        <span class="compression-arrow" aria-hidden="true">→</span>
        <div class="category-card">
          <span>按顏色壓縮後</span>
          <strong>2 種 outcomes</strong>
          <p>
            壓縮只保留顏色，沒有把兩類重量變平均。紅、藍兩格可以承接完全不同的 probability mass。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="three-levels" aria-hidden="true">
          <div>
            <span>分類名稱</span>
            <strong>{{ '{紅, 藍}' }}</strong>
          </div>
          <i>≠</i>
          <div>
            <span>結果重量</span>
            <strong>{{ percent(redProbability()) }} / {{ percent(blueProbability()) }}</strong>
          </div>
        </div>
        <div>
          <span class="card-label">不要把分類數量當成 probability</span>
          <p>
            <strong>「有幾種名稱」回答世界如何分類；「每種有多重」才回答 probability。</strong>
            只有知道更底層的生成方式，才能把重量正確地加到分類後的 outcomes。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：把底層等可能位置的重量合併</summary>
        <div>
          <p>
            若袋中共有 r 顆紅球、b 顆藍球，而且每一顆實體球等可能被抽中， 那麼同色球的 probability
            mass 可以加在一起：
          </p>
          <div class="math-line">
            <app-math e="P(	ext{red})=rac{r}{r+b},qquad P(	ext{blue})=rac{b}{r+b}" />
          </div>
          <p>這裡能「數球」的真正原因，是每顆實體球等可能，而不是因為顏色 outcome 有兩種。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NamesVsWeightsComponent {
  readonly prediction = signal<'half' | 'tenth' | 'unknown' | null>(null);
  readonly redCount = signal(9);
  readonly blueCount = signal(1);
  readonly totalBalls = computed(() => this.redCount() + this.blueCount());
  readonly redBalls = computed(() => Array.from({ length: this.redCount() }));
  readonly blueBalls = computed(() => Array.from({ length: this.blueCount() }));
  readonly redProbability = computed(() => this.redCount() / this.totalBalls());
  readonly blueProbability = computed(() => this.blueCount() / this.totalBalls());

  percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }
}
