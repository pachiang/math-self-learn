import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-same-center',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch13">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 13.2</p>
        <h2>同一個 balance point，可以藏著完全不同的 distribution</h2>
        <p class="lede">
          Expectation 只保留 center。一個 guaranteed outcome 和一個兩端分裂的 gamble 可以有相同
          expectation，卻帶來完全不同的穩定程度。
        </p>
      </header>

      <section class="scene">
        <div class="moment-prediction">
          <div>
            <p class="eyebrow">先預測 · choose one payout rule</p>
            <h3>A 保證 $50；B 一半 $0、一半 $100。它們的 expectation 相同嗎？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="判斷兩個 payout 的期望值">
            <button
              type="button"
              [class.selected]="prediction() === 'same'"
              (click)="prediction.set('same')"
            >
              相同
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'different'"
              (click)="prediction.set('different')"
            >
              不同
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'same') {
              <strong>相同，都是 $50。</strong>但 A 沒有 spread；B 的 mass 在中心兩側各距離 $50。
            } @else {
              B 的 0 與 100 恰好以相同 weight 平衡在 50，所以 center 與 guaranteed $50 相同。
            }
          </p>
        }
      </section>

      <section class="spread-control">
        <label for="risk-spread">拉開 B 的 risk spread</label>
        <input
          id="risk-spread"
          type="range"
          min="0"
          max="50"
          step="5"
          [value]="spread()"
          (input)="spread.set(+$any($event).target.value)"
        />
        <strong>±&#36;{{ spread() }}</strong>
      </section>

      <section class="same-center-board">
        <div class="distribution-lane">
          <p class="eyebrow">A · guaranteed</p>
          <h3>所有 mass 疊在 center</h3>
          <div class="center-line">
            <i class="center-marker"></i>
            <b class="single-mass" style="left: 50%">100%</b>
            <span class="lane-label left">$0</span><span class="lane-label right">$100</span>
          </div>
          <strong class="lane-expectation">E[A] = $50</strong>
        </div>

        <div class="distribution-lane risky">
          <p class="eyebrow">B · mean-preserving spread</p>
          <h3>Mass 往兩側拉開，center 完全不動</h3>
          <div class="center-line">
            <i class="center-marker"></i>
            <span
              class="spread-ribbon"
              [style.left.%]="50 - spread()"
              [style.width.%]="spread() * 2"
            ></span>
            <b class="split-mass" [style.left.%]="50 - spread()">50%</b>
            <b class="split-mass" [style.left.%]="50 + spread()">50%</b>
            <span class="lane-label left">$0</span><span class="lane-label right">$100</span>
          </div>
          <strong class="lane-expectation">E[B] = $50</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="same-center-core" aria-hidden="true">
          <div><i></i><strong>all at 50</strong></div>
          <span>same center</span>
          <div>
            <i class="wide"></i><strong>{{ 50 - spread() }} / {{ 50 + spread() }}</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Center 相同，不代表 shape 相同</span>
          <p>
            <strong>Expectation 無法單獨描述 uncertainty。</strong>
            下一步需要另一個量，專門記錄 weights 離 center 有多遠。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>延伸層：degenerate distribution 與 mean-preserving spread</summary>
        <div>
          <p>
            A 的全部 probability 集中在單點 50，稱為 degenerate distribution。B 將 mass
            從中心等量推向兩側、保持 mean 不變，可視為 mean-preserving spread。
          </p>
          <div class="math-line">
            <app-math e="E[A]=50,\\qquad E[B]=\\tfrac12(50-d)+\\tfrac12(50+d)=50" />
          </div>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2SameCenterComponent {
  readonly prediction = signal<'same' | 'different' | null>(null);
  readonly spread = signal(50);
}
