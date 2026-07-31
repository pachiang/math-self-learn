import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-negative-binomial',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.8</p>
        <h2>把終點移到第 r 次 success：同一條 tape 自然長出 Negative Binomial</h2>
        <p class="lede">
          <strong>負二項分布（Negative Binomial distribution）</strong>固定 success target r，
          觀察第 r 個 1 出現在第幾次 trial。名稱中的 negative 不是負機率。
        </p>
      </header>

      <section class="binary-dual-control">
        <label
          >Success target r
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            [value]="target()"
            (input)="target.set(+$any($event).target.value)"
          />
          <strong>{{ target() }}</strong>
        </label>
        <label
          >Success chance p
          <input
            type="range"
            min="20"
            max="80"
            step="5"
            [value]="probability()"
            (input)="probability.set(+$any($event).target.value)"
          />
          <strong>{{ probability() }}%</strong>
        </label>
      </section>

      <section class="checkpoint-board">
        <div class="checkpoint-heading">
          <div>
            <span class="card-label">STOP AT SUCCESS #{{ target() }}</span>
            <h3>{{ tape() }}</h3>
          </div>
          <p>最後一格必須是第 {{ target() }} 個 success；它才會關上 STOP gate。</p>
        </div>
        <div class="checkpoint-tape">
          @for (bit of tapeBits(); track $index) {
            <div [class.success]="bit === '1'" [class.stop]="$index === tapeBits().length - 1">
              <small>trial {{ $index + 1 }}</small
              ><strong>{{ bit }}</strong>
              @if (bit === '1') {
                <span>success #{{ successNumber($index) }}</span>
              }
            </div>
          }
        </div>
        <div class="wait-segments">
          @for (segment of segments(); track $index) {
            <div>
              <span>wait {{ $index + 1 }}</span
              ><strong>{{ segment }}</strong
              ><small>trials</small>
            </div>
            @if (!$last) {
              <i>+</i>
            }
          }
          <b
            >= T<sub>{{ target() }}</sub> {{ tapeBits().length }}</b
          >
        </div>
      </section>

      <section class="fixed-question-compare">
        <div>
          <span class="card-label">BINOMIAL LENS</span>
          <strong>固定 n</strong><i>→</i><strong>問成功幾次 X</strong>
          <small>框先畫好，數框裡的 1</small>
        </div>
        <div class="active">
          <span class="card-label">NEGATIVE BINOMIAL LENS</span>
          <strong>固定 r</strong><i>→</i><strong>問何時達標 Tᵣ</strong>
          <small>一路前進，直到第 r 個 1</small>
        </div>
      </section>

      <aside class="insight-card">
        <div class="family-branch" aria-hidden="true">
          <span>Repeated Bernoulli</span>
          <i>↙</i><i>↘</i> <strong>fixed n → Binomial</strong
          ><strong>fixed r → Neg. Binomial</strong>
        </div>
        <div>
          <span class="card-label">同一個世界，不同 stopping question</span>
          <p>
            <strong
              >r=1 時就是 Geometric；r 增加時，可把總等待看成 r 段 Geometric waits 相加。</strong
            >
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：最後一格固定為 success，所以只排列前 t−1 格</summary>
        <div class="binary-formulas">
          <app-math e="P(T_r=t)=\\binom{t-1}{r-1}p^r(1-p)^{t-r},\\qquad t=r,r+1,\\ldots" />
          <app-math e="T_r=G_1+\\cdots+G_r" />
          <p>前 t−1 格放 r−1 個 successes，最後一格才是第 r 個 success。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2NegativeBinomialComponent {
  readonly target = signal(3);
  readonly probability = signal(45);
  private readonly baseTape = ['0', '1', '0', '0', '1', '0', '1', '0', '0', '1'];
  readonly tapeBits = computed(() => {
    let successes = 0;
    const end = this.baseTape.findIndex((bit) => bit === '1' && ++successes === this.target());
    return this.baseTape.slice(0, end + 1);
  });
  readonly tape = computed(() => this.tapeBits().join(''));
  readonly segments = computed(() => {
    const lengths: number[] = [];
    let sinceLastSuccess = 0;
    for (const bit of this.tapeBits()) {
      sinceLastSuccess += 1;
      if (bit === '1') {
        lengths.push(sinceLastSuccess);
        sinceLastSuccess = 0;
      }
    }
    return lengths;
  });

  successNumber(index: number): number {
    return this.tapeBits()
      .slice(0, index + 1)
      .filter((bit) => bit === '1').length;
  }
}
