import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

interface Bucket {
  k: number;
  sequences: string[];
  probability: number;
}

@Component({
  selector: 'app-prob-v2-binomial-compression',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.3</p>
        <h2>Binomial 不是新機器：它只是把相同 count 的 histories 收進同一桶</h2>
        <p class="lede">
          <strong>二項分布（Binomial distribution）</strong>保留「成功幾次」這個 measurement， 放棄
          success 出現在哪幾次。每根 PMF bar 是整桶 paths 的 probability mass。
        </p>
      </header>

      <section class="binary-control">
        <label for="compression-p">每條 path 使用同一個 p</label>
        <input
          id="compression-p"
          type="range"
          min="10"
          max="90"
          step="5"
          [value]="probability()"
          (input)="probability.set(+$any($event).target.value)"
        />
        <output>{{ probability() }}%</output>
      </section>

      <section class="compression-board">
        <div class="history-pool">
          <span class="card-label">16 COMPLETE HISTORIES · n = 4</span>
          <div class="history-cards">
            @for (sequence of sequences(); track sequence) {
              <button
                type="button"
                [class.focus]="successes(sequence) === selectedK()"
                (click)="selectedK.set(successes(sequence))"
              >
                @for (bit of bits(sequence); track $index) {
                  <i [class.success]="bit === '1'">{{ bit }}</i>
                }
              </button>
            }
          </div>
          <p>同樣有 {{ selectedK() }} 個 1 的 cards 會被同一個 measurement 合併。</p>
        </div>

        <div class="compression-arrow" aria-hidden="true"><span>COUNT</span><strong>→</strong></div>

        <div class="bucket-panel">
          <span class="card-label">X = NUMBER OF SUCCESSES</span>
          <div class="bucket-chart">
            @for (bucket of buckets(); track bucket.k) {
              <button
                type="button"
                [class.active]="selectedK() === bucket.k"
                (click)="selectedK.set(bucket.k)"
              >
                <span
                  class="bar"
                  [style.height.%]="(bucket.probability / maxProbability()) * 100"
                ></span>
                <small>{{ percent(bucket.probability) }}%</small>
                <strong>{{ bucket.k }}</strong>
              </button>
            }
          </div>
        </div>
      </section>

      <section class="bucket-explanation">
        <div>
          <span>選中的 bucket</span><strong>X = {{ selectedK() }}</strong>
        </div>
        <div>
          <span>有幾條 paths？</span><strong>{{ selectedBucket().sequences.length }}</strong>
        </div>
        <div>
          <span>每條 path weight</span><strong>{{ percent(pathWeight()) }}%</strong>
        </div>
        <div class="total">
          <span>整桶 mass</span><strong>{{ percent(selectedBucket().probability) }}%</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="bucket-equation" aria-hidden="true">
          <strong>{{ selectedBucket().sequences.length }}</strong
          ><span>paths</span><i>×</i> <strong>{{ percent(pathWeight()) }}%</strong><span>each</span
          ><i>=</i>
          <strong>{{ percent(selectedBucket().probability) }}%</strong>
        </div>
        <div>
          <span class="card-label">Paths per bucket × weight per path</span>
          <p>
            <strong>Combination 數的是「哪些位置放 1」；p 的乘冪才是每條 path 的重量。</strong>
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：Binomial PMF 從哪裡長出來？</summary>
        <div class="binary-formulas">
          <app-math e="X=\\sum_{i=1}^{n}X_i" />
          <app-math e="P(X=k)=\\binom nk p^k(1-p)^{n-k}" />
          <p>最後一式的兩部分分別是 path 數量與每條 path 的 probability。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BinomialCompressionComponent {
  readonly probability = signal(60);
  readonly selectedK = signal(2);
  readonly sequences = computed(() =>
    Array.from({ length: 16 }, (_, index) => index.toString(2).padStart(4, '0')),
  );
  readonly buckets = computed<Bucket[]>(() => {
    const p = this.probability() / 100;
    return Array.from({ length: 5 }, (_, k) => {
      const sequences = this.sequences().filter((sequence) => this.successes(sequence) === k);
      return { k, sequences, probability: sequences.length * p ** k * (1 - p) ** (4 - k) };
    });
  });
  readonly selectedBucket = computed(() => this.buckets()[this.selectedK()]);
  readonly maxProbability = computed(() =>
    Math.max(...this.buckets().map((bucket) => bucket.probability)),
  );
  readonly pathWeight = computed(() => {
    const p = this.probability() / 100;
    const k = this.selectedK();
    return p ** k * (1 - p) ** (4 - k);
  });

  successes(sequence: string): number {
    return [...sequence].filter((bit) => bit === '1').length;
  }
  bits(sequence: string): string[] {
    return [...sequence];
  }
  percent(value: number): string {
    return (value * 100).toFixed(1);
  }
}
