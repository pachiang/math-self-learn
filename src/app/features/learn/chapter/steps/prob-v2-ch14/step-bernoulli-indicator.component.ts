import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type Context = 'payment' | 'defect';

@Component({
  selector: 'app-prob-v2-bernoulli-indicator',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.1</p>
        <h2>Bernoulli 不是一枚硬幣，而是一個只能回答 Yes／No 的問題</h2>
        <p class="lede">
          一次<strong>伯努利試驗（Bernoulli trial）</strong>只有「target 發生」與「target
          沒發生」。把它們記成 1 與 0，稍後才能直接把許多次的 1 加成 success count。
        </p>
      </header>

      <section class="binary-context-bar">
        <div>
          <p class="eyebrow">先指定 target，success 才有意義</p>
          <h3>{{ prompt() }}</h3>
        </div>
        <div class="binary-segmented" role="group" aria-label="切換二元試驗情境">
          <button
            type="button"
            [class.active]="context() === 'payment'"
            (click)="context.set('payment')"
          >
            Payment
          </button>
          <button
            type="button"
            [class.active]="context() === 'defect'"
            (click)="context.set('defect')"
          >
            Defect
          </button>
        </div>
      </section>

      <section class="binary-control">
        <label for="bernoulli-p">Target chance <strong>p</strong></label>
        <input
          id="bernoulli-p"
          type="range"
          min="5"
          max="95"
          step="1"
          [value]="probability()"
          (input)="probability.set(+$any($event).target.value)"
        />
        <output>{{ probability() }}%</output>
      </section>

      <section class="binary-generator">
        <div class="generator-question">
          <span>ONE TRIAL</span>
          <strong>{{ question() }}</strong>
          <button type="button" (click)="run()">RUN {{ runCount() + 1 }}</button>
        </div>
        <div class="generator-gates">
          <div class="gate success" [style.flex]="probability()">
            <span>YES · target</span><strong>1</strong><small>{{ probability() }}%</small>
          </div>
          <div class="gate failure" [style.flex]="100 - probability()">
            <span>NO · complement</span><strong>0</strong><small>{{ 100 - probability() }}%</small>
          </div>
        </div>
        @if (outcome() !== null) {
          <p class="generator-result" aria-live="polite">
            這次 marker 落到 <strong>{{ outcome() }}</strong
            >。這是一次 outcome，不是「長期一定會有 {{ probability() }}% 成功」的保證。
          </p>
        }
      </section>

      <aside class="insight-card">
        <div class="binary-equation-visual" aria-hidden="true">
          <span class="one">target → 1</span><i>+</i><span class="zero">not target → 0</span>
        </div>
        <div>
          <span class="card-label">One binary question, not necessarily 50/50</span>
          <p>
            <strong>Success 只是你指定的 target event，不代表好事，也不必比較可能。</strong>
            檢查瑕疵時，defect 完全可以被編成 1。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：Bernoulli random variable 的完整描述</summary>
        <div class="binary-formulas">
          <app-math e="X\\in\\{0,1\\},\\quad P(X=1)=p,\\quad P(X=0)=1-p" />
          <app-math e="E[X]=p,\\qquad \\operatorname{Var}(X)=p(1-p)" />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BernoulliIndicatorComponent {
  readonly context = signal<Context>('payment');
  readonly probability = signal(72);
  readonly outcome = signal<number | null>(null);
  readonly runCount = signal(0);
  readonly prompt = computed(() =>
    this.context() === 'payment'
      ? '一筆付款成功的 chance 是 72%；success 要如何變成可相加的數字？'
      : '我們正在找瑕疵品；這裡的「success」其實是發現 defect。',
  );
  readonly question = computed(() =>
    this.context() === 'payment' ? '付款成功了嗎？' : '這個零件有瑕疵嗎？',
  );

  run(): void {
    this.outcome.set(Math.random() < this.probability() / 100 ? 1 : 0);
    this.runCount.update((count) => count + 1);
  }
}
