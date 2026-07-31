import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

interface Sequence {
  bits: string;
  successes: number;
  probability: number;
}

@Component({
  selector: 'app-prob-v2-repeated-trials',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.2</p>
        <h2>先生成完整 sequence，再決定你想量什麼</h2>
        <p class="lede">
          重複 n 次後，一個 outcome 是整段有順序的 history。像 110、101、011
          都有兩次成功，但它們仍是三條不同路徑。
        </p>
      </header>

      <section class="scene binary-prediction">
        <div>
          <p class="eyebrow">先預測 · n = 3</p>
          <h3>三次 Yes／No trials 共有幾個完整 outcomes？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="預測三次試驗的完整結果數">
          @for (choice of [4, 6, 8]; track choice) {
            <button
              type="button"
              [class.selected]="prediction() === choice"
              (click)="prediction.set(choice)"
            >
              {{ choice }}
            </button>
          }
        </div>
        @if (prediction() !== null) {
          <p class="feedback">
            @if (prediction() === 8) {
              <strong>對。每一層都有兩個出口，因此 leaves 數是 2³ = 8。</strong>
            } @else {
              0、1、2、3 只是 success count 的四種值；完整 histories 還保留順序，共有 2³ = 8。
            }
          </p>
        }
      </section>

      <section class="binary-dual-control">
        <label
          >Trials n
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            [value]="trials()"
            (input)="trials.set(+$any($event).target.value)"
          />
          <strong>{{ trials() }}</strong>
        </label>
        <label
          >Success chance p
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            [value]="probability()"
            (input)="probability.set(+$any($event).target.value)"
          />
          <strong>{{ probability() }}%</strong>
        </label>
      </section>

      <section class="sequence-world">
        <div class="sequence-header">
          <div>
            <span>SEQUENCE SPACE</span><strong>Ω = {{ sequenceCount() }} ordered histories</strong>
          </div>
          <p>每張 card 都是一個完整 outcome；點選後查看它如何逐步生成。</p>
        </div>
        <div class="sequence-grid">
          @for (sequence of sequences(); track sequence.bits) {
            <button
              type="button"
              [class.active]="selected() === sequence.bits"
              (click)="selected.set(sequence.bits)"
            >
              <span>
                @for (bit of bitArray(sequence.bits); track $index) {
                  <i [class.success]="bit === '1'">{{ bit }}</i>
                }
              </span>
              <small>{{ sequence.successes }} successes</small>
            </button>
          }
        </div>
        @if (selectedSequence(); as sequence) {
          <div class="path-inspector">
            <span class="card-label">SELECTED PATH · {{ sequence.bits }}</span>
            <div class="path-steps">
              @for (bit of bitArray(sequence.bits); track $index) {
                <div [class.success]="bit === '1'">
                  <small>trial {{ $index + 1 }}</small>
                  <strong>{{ bit }}</strong>
                  <span>× {{ bit === '1' ? probability() : 100 - probability() }}%</span>
                </div>
              }
            </div>
            <p>
              這一條完整 path 的 weight 是 <strong>{{ percent(sequence.probability) }}%</strong>。
            </p>
          </div>
        }
      </section>

      <aside class="insight-card">
        <div class="sequence-compression-preview" aria-hidden="true">
          <span>110</span><span>101</span><span>011</span><i>→</i><strong>count = 2</strong>
        </div>
        <div>
          <span class="card-label">History 與 measurement 是兩個層級</span>
          <p><strong>Sequence 是世界真正走過的路；count 只是稍後對這條路做的摘要。</strong></p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：sequence space 與 path probability</summary>
        <div class="binary-formulas">
          <app-math e="\\Omega=\\{0,1\\}^n,\\qquad |\\Omega|=2^n" />
          <app-math e="P(x_1\\ldots x_n)=\\prod_{i=1}^{n}p^{x_i}(1-p)^{1-x_i}" />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2RepeatedTrialsComponent {
  readonly prediction = signal<number | null>(null);
  readonly trials = signal(3);
  readonly probability = signal(60);
  readonly selected = signal('110');
  readonly sequenceCount = computed(() => 2 ** this.trials());
  readonly sequences = computed<Sequence[]>(() => {
    const n = this.trials();
    const p = this.probability() / 100;
    return Array.from({ length: 2 ** n }, (_, index) => {
      const bits = index.toString(2).padStart(n, '0');
      const successes = [...bits].filter((bit) => bit === '1').length;
      return { bits, successes, probability: p ** successes * (1 - p) ** (n - successes) };
    });
  });
  readonly selectedSequence = computed(
    () =>
      this.sequences().find((sequence) => sequence.bits === this.selected()) ?? this.sequences()[0],
  );

  bitArray(bits: string): string[] {
    return [...bits];
  }

  percent(value: number): string {
    return (value * 100).toFixed(value < 0.01 ? 2 : 1);
  }
}
