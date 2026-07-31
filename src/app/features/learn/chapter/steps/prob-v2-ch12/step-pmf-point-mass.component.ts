import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-pmf-point-mass',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch12">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 12.2</p>
        <h2>PMF 的每根 bar，都替一個 discrete value 保管重量</h2>
        <p class="lede">
          <strong>機率質量函數（probability mass function, PMF）</strong>是一張 lookup map：給它一個
          discrete value，它回答那個點直接承接多少 probability mass。
        </p>
      </header>

      <section class="scene">
        <div class="dist-prediction">
          <div>
            <p class="eyebrow">先預測 · two fair ordered dice</p>
            <h3>點數和 S=2 與 S=7，哪個比較可能？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測兩骰點數和 2 或 7 哪個較可能">
            <button
              type="button"
              [class.selected]="prediction() === 'two'"
              (click)="prediction.set('two')"
            >
              S=2
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'same'"
              (click)="prediction.set('same')"
            >
              一樣可能
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'seven'"
              (click)="prediction.set('seven')"
            >
              S=7
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'seven') {
              <strong>S=7 比較可能：</strong>六條 ordered outcomes 對上一條，所以是 6/36 對 1/36。
            } @else {
              「2」與「7」都只是一個 value，但 7 的 preimage 有六條 paths；2 只有 (1,1)。
            }
          </p>
        }
      </section>

      <section class="pmf-board">
        <div class="pmf-chart-panel">
          <div class="pmf-heading">
            <div>
              <p class="eyebrow">PMF · each block = 1/36 mass</p>
              <h3>Bar height 就是這個 point 的 probability</h3>
            </div>
            <button type="button" (click)="showPaths.set(!showPaths())">
              {{ showPaths() ? '收起 incoming paths' : '展開 incoming paths' }}
            </button>
          </div>
          <div class="pmf-chart" aria-label="兩顆骰子點數和的 PMF">
            @for (value of sums; track value) {
              <button
                type="button"
                [class.active]="selectedSum() === value"
                (click)="selectedSum.set(value)"
              >
                <div class="mass-stack">
                  @for (level of levels; track level) {
                    <i [class.filled]="level <= countFor(value)"></i>
                  }
                </div>
                <strong>{{ countFor(value) }}/36</strong>
                <span>{{ value }}</span>
              </button>
            }
          </div>
          <div class="pmf-axis">
            <span>possible value of S →</span><strong>Σ bars = 36/36 = 1</strong>
          </div>
        </div>

        <div class="pmf-inspector">
          <span class="card-label">POINT MASS AT S={{ selectedSum() }}</span>
          <strong class="pmf-number">{{ countFor(selectedSum()) }}/36</strong>
          <p>
            {{ percent(countFor(selectedSum()) / 36) }} probability 直接放在這個 discrete point。
          </p>
          @if (showPaths()) {
            <div class="incoming-dice">
              @for (outcome of selectedOutcomes(); track outcome) {
                <span>({{ outcome }})</span>
              }
            </div>
          } @else {
            <div class="path-placeholder">
              <i></i><i></i><i></i>
              <span>展開可查看哪些 ordered outcomes 匯入這根 bar</span>
            </div>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="point-mass-card" aria-hidden="true">
          <i [style.height.%]="countFor(selectedSum()) * 14"></i>
          <div>
            <strong>S={{ selectedSum() }}</strong
            ><span>{{ countFor(selectedSum()) }}/36 mass</span>
          </div>
        </div>
        <div>
          <span class="card-label">PMF：discrete point 本身可以有正重量</span>
          <p>
            <strong>Bar width 只是畫圖方便；height 才是 PMF value。</strong>
            每個 point 的 mass 非負，所有 possible values 的 masses 加起來必須等於 1。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>定義層：PMF 的兩條合法性條件</summary>
        <div>
          <div class="math-line">
            <app-math e="p_X(x)=P(X=x)" />
          </div>
          <div class="math-line">
            <app-math e="p_X(x)\\ge 0,\\qquad \\sum_x p_X(x)=1" />
          </div>
          <p>Sum 的 PMF 只在 2,…,12 非零。若 x 不是 possible value，例如 1 或 13，p_S(x)=0。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2PmfPointMassComponent {
  readonly sums = Array.from({ length: 11 }, (_, index) => index + 2);
  readonly levels = [6, 5, 4, 3, 2, 1];
  readonly prediction = signal<string | null>(null);
  readonly selectedSum = signal(7);
  readonly showPaths = signal(true);
  readonly selectedOutcomes = computed(() => {
    const outcomes: string[] = [];
    for (let first = 1; first <= 6; first++) {
      const second = this.selectedSum() - first;
      if (second >= 1 && second <= 6) outcomes.push(`${first}, ${second}`);
    }
    return outcomes;
  });

  countFor(value: number): number {
    return value <= 7 ? value - 1 : 13 - value;
  }

  percent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}
