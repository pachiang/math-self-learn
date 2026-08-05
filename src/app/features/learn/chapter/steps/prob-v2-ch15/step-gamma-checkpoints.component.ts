import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { gammaPdf } from './event-stream-math';

@Component({
  selector: 'app-prob-v2-gamma-checkpoints',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.6</p>
        <h2>等待不是只有「下一次」：把終點移到第 k 個 event</h2>
        <p class="lede">
          <strong>Gamma distribution</strong> 描述抵達第 k 個 checkpoint
          的總等待時間。它不是另一台陌生機器， 而是把 k 段 Exponential gaps 接起來。
        </p>
      </header>

      <section class="scene stream-prediction">
        <div>
          <p class="eyebrow">先預測 · checkpoints</p>
          <h3>若終點從第 1 通電話改成第 4 通，等待時間只會「平移」嗎？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="預測等待更多事件時分布如何改變">
          <button
            type="button"
            [class.selected]="prediction() === 'shift'"
            (click)="prediction.set('shift')"
          >
            只是平移
          </button>
          <button
            type="button"
            [class.selected]="prediction() === 'build'"
            (click)="prediction.set('build')"
          >
            多段 gap 累加
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'build') {
              <strong>對。每多一個 checkpoint，就多加一段隨機 gap。</strong>
            } @else {
              終點不是固定向右搬；每一段 gap 都會長短不一，因此中心與形狀會一起改變。
            }
          </p>
        }
      </section>

      <section class="stream-controls">
        <label
          >Target checkpoint k
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            [value]="shape()"
            (input)="shape.set(+$any($event).target.value)"
          />
          <strong>#{{ shape() }}</strong>
        </label>
      </section>

      <section class="gamma-checkpoint-board">
        <div class="gap-timeline" aria-label="等待到指定事件的累加時間線">
          <b>NOW</b>
          @for (gap of visibleGaps(); track $index) {
            <div [style.flex]="gap" [class.target]="$index + 1 === shape()">
              <span>W{{ $index + 1 }}</span
              ><i></i><strong>#{{ $index + 1 }}</strong>
            </div>
          }
        </div>
        <div class="gamma-sum-readout">
          <span class="card-label">ARRIVAL TIME OF EVENT #{{ shape() }}</span>
          <h3>T{{ shape() }} = {{ sumExpression() }}</h3>
          <p>
            這條示範 timeline 的總長是 <strong>{{ observedTotal() }} min</strong>；另一輪的每段 gap
            都會重新抽樣。
          </p>
        </div>
        <div class="gamma-mini-density" aria-label="Gamma 等待時間密度示意">
          @for (bar of density(); track bar.x) {
            <i [style.height.%]="bar.height" [class.mean]="bar.nearMean"></i>
          }
          <span [style.left.%]="meanPosition()">平均等待 k/λ</span>
        </div>
      </section>

      <aside class="insight-card">
        <div class="checkpoint-core" aria-hidden="true">
          <span>W₁</span><i>+</i><span>W₂</span><i>+ ··· +</i><span>Wₖ</span><b>→</b
          ><strong>Tₖ</strong>
        </div>
        <div>
          <span class="card-label">Gamma 是等待片段的總和</span>
          <p>
            <strong>k=1 時它就是 Exponential；k 增加時，終點才需要更多 events 才能抵達。</strong>
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：整數 shape 的 Gamma（Erlang）</summary>
        <div class="stream-formulas">
          <app-math e="T_k=W_1+\\cdots+W_k" /><app-math
            e="f_{T_k}(t)=\\frac{\\lambda^k t^{k-1}e^{-\\lambda t}}{(k-1)!},\\quad t\\ge 0"
          />
          <p>
            當 k 是正整數，這個 waiting-time model 也常稱為 <strong>Erlang distribution</strong>。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2GammaCheckpointsComponent {
  readonly prediction = signal<'shift' | 'build' | null>(null);
  readonly shape = signal(3);
  readonly rate = 0.7;
  readonly gaps = [0.8, 1.4, 0.6, 1.1, 0.9];
  readonly visibleGaps = computed(() => this.gaps.slice(0, this.shape()));
  readonly observedTotal = computed(() =>
    this.visibleGaps()
      .reduce((sum, gap) => sum + gap, 0)
      .toFixed(1),
  );
  readonly sumExpression = computed(() =>
    this.visibleGaps()
      .map((_, index) => `W${index + 1}`)
      .join(' + '),
  );
  readonly mean = computed(() => this.shape() / this.rate);
  readonly density = computed(() => {
    const points = Array.from({ length: 48 }, (_, index) => ((index + 0.5) / 48) * 12);
    const values = points.map((x) => gammaPdf(x, this.shape(), this.rate));
    const max = Math.max(...values);
    return points.map((x, index) => ({
      x,
      height: (values[index] / max) * 100,
      nearMean: Math.abs(x - this.mean()) < 0.15,
    }));
  });
  readonly meanPosition = computed(() => Math.min(96, (this.mean() / 12) * 100));
}
