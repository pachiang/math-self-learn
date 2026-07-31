import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type PatternId = 'positive' | 'negative' | 'zero';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-prob-v2-covariance',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch13">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 13.5</p>
        <h2>Covariance 看兩個 deviations 是否傾向朝同一方向</h2>
        <p class="lede">
          <strong>共變異數（covariance）</strong>先把 X、Y 各自減去 center。兩個 centered deviations
          同號產生正貢獻，異號產生負貢獻，再把所有 signed areas 平均。
        </p>
      </header>

      <section class="scene">
        <div class="moment-prediction">
          <div>
            <p class="eyebrow">先預測 · relative to both means</p>
            <h3>右上與左下 points，對 covariance 的 contribution 是正還是負？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測同方向偏差的 covariance 符號">
            <button
              type="button"
              [class.selected]="prediction() === 'positive'"
              (click)="prediction.set('positive')"
            >
              正
            </button>
            <button
              type="button"
              [class.selected]="prediction() === 'negative'"
              (click)="prediction.set('negative')"
            >
              負
            </button>
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'positive') {
              <strong>正。</strong>右上是 positive×positive；左下是 negative×negative，乘積都為正。
            } @else {
              同方向 deviations 同號：右上 +×+，左下 −×−，兩者都替 positive covariance 加分。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Signed-area patterns</p>
            <h3>切換 point cloud，再點一個 point 拆解它的 contribution</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇 covariance pattern">
            <button
              type="button"
              [class.active]="pattern() === 'positive'"
              (click)="setPattern('positive')"
            >
              Positive
            </button>
            <button
              type="button"
              [class.active]="pattern() === 'negative'"
              (click)="setPattern('negative')"
            >
              Negative
            </button>
            <button
              type="button"
              [class.active]="pattern() === 'zero'"
              (click)="setPattern('zero')"
            >
              Zero, but dependent
            </button>
          </div>
        </div>
      </section>

      <section class="covariance-board">
        <div class="covariance-plot-panel">
          <p class="eyebrow">Crosshair = E[X], E[Y]</p>
          <h3>每個 rectangle 的 signed area = horizontal deviation × vertical deviation</h3>
          <svg viewBox="0 0 600 470" role="img" aria-label="顯示 covariance signed areas 的散點圖">
            <line x1="55" y1="415" x2="555" y2="415" class="cov-axis" />
            <line x1="55" y1="35" x2="55" y2="415" class="cov-axis" />
            <line x1="305" y1="35" x2="305" y2="415" class="cov-crosshair" />
            <line x1="55" y1="225" x2="555" y2="225" class="cov-crosshair" />
            @for (point of points(); track $index) {
              <rect
                [attr.x]="rectangleX(point)"
                [attr.y]="rectangleY(point)"
                [attr.width]="rectangleWidth(point)"
                [attr.height]="rectangleHeight(point)"
                [class.positive]="contribution(point) > 0"
                [class.negative]="contribution(point) < 0"
                [class.selected]="selectedIndex() === $index"
                class="cov-rectangle"
              />
              <circle
                [attr.cx]="pointX(point)"
                [attr.cy]="pointY(point)"
                r="10"
                [class.selected]="selectedIndex() === $index"
                class="cov-point"
                tabindex="0"
                role="button"
                [attr.aria-label]="'選擇 point ' + point.x + ',' + point.y"
                (click)="selectedIndex.set($index)"
                (keydown.enter)="selectedIndex.set($index)"
                (keydown.space)="selectedIndex.set($index); $event.preventDefault()"
              />
            }
            <text x="292" y="448">E[X]=3</text>
            <text x="8" y="230">E[Y]=3</text>
            <text x="542" y="438">X</text>
            <text x="35" y="42">Y</text>
          </svg>
        </div>

        <div class="covariance-inspector">
          <span class="card-label">SELECTED CONTRIBUTION</span>
          <strong class="selected-point">({{ selectedPoint().x }}, {{ selectedPoint().y }})</strong>
          <div class="deviation-product">
            <div>
              <span>x−μx</span><strong>{{ signed(selectedPoint().x - 3) }}</strong>
            </div>
            <i>×</i>
            <div>
              <span>y−μy</span><strong>{{ signed(selectedPoint().y - 3) }}</strong>
            </div>
            <i>=</i>
            <div
              [class.positive]="selectedContribution() > 0"
              [class.negative]="selectedContribution() < 0"
            >
              <span>signed area</span><strong>{{ signed(selectedContribution()) }}</strong>
            </div>
          </div>
          <div class="covariance-total">
            <span>Average all signed areas</span>
            <strong>Cov(X,Y) = {{ covariance().toFixed(2) }}</strong>
          </div>
          <p class="feedback">{{ patternExplanation() }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="covariance-core" aria-hidden="true">
          <div><span>same direction</span><strong>+ × + or − × −</strong><i>positive</i></div>
          <div><span>opposite direction</span><strong>+ × −</strong><i>negative</i></div>
        </div>
        <div>
          <span class="card-label">Covariance = average signed rectangle around the means</span>
          <p>
            <strong>符號描述 co-movement direction，不等於因果。</strong>
            而 covariance=0 只表示 signed contributions 抵消，不保證 independent。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：covariance shortcut、units 與 zero covariance</summary>
        <div>
          <div class="math-line">
            <app-math e="\\operatorname{Cov}(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]" />
          </div>
          <div class="math-line">
            <app-math e="\\operatorname{Cov}(X,Y)=E[XY]-E[X]E[Y]" />
          </div>
          <p>
            Covariance units 是 X units × Y units，因此大小會受尺度影響。Zero covariance 不推出
            independence；本頁的 zero pattern 中，points 明顯被限制在十字四端，X、Y 仍不是自由組合。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CovarianceComponent {
  readonly datasets: Record<PatternId, Point[]> = {
    positive: [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 5 },
    ],
    negative: [
      { x: 1, y: 5 },
      { x: 2, y: 4 },
      { x: 3, y: 3 },
      { x: 4, y: 2 },
      { x: 5, y: 1 },
    ],
    zero: [
      { x: 1, y: 3 },
      { x: 3, y: 5 },
      { x: 5, y: 3 },
      { x: 3, y: 1 },
    ],
  };
  readonly prediction = signal<'positive' | 'negative' | null>(null);
  readonly pattern = signal<PatternId>('positive');
  readonly selectedIndex = signal(4);
  readonly points = computed(() => this.datasets[this.pattern()]);
  readonly selectedPoint = computed(() => this.points()[this.selectedIndex()] ?? this.points()[0]);
  readonly selectedContribution = computed(() => this.contribution(this.selectedPoint()));
  readonly covariance = computed(
    () =>
      this.points().reduce((sum, point) => sum + this.contribution(point), 0) /
      this.points().length,
  );
  readonly patternExplanation = computed(() => {
    const messages: Record<PatternId, string> = {
      positive: 'Points 多在右上與左下；same-direction deviations 讓 positive areas 主導。',
      negative: 'Points 多在左上與右下；opposite-direction deviations 讓 negative areas 主導。',
      zero: '所有 rectangles 都有一邊長度為 0，所以 covariance=0；但 points 仍受十字形規則限制。',
    };
    return messages[this.pattern()];
  });

  setPattern(pattern: PatternId): void {
    this.pattern.set(pattern);
    this.selectedIndex.set(pattern === 'zero' ? 0 : 4);
  }

  contribution(point: Point): number {
    return (point.x - 3) * (point.y - 3);
  }

  pointX(point: Point): number {
    return 55 + ((point.x - 1) / 4) * 500;
  }

  pointY(point: Point): number {
    return 415 - ((point.y - 1) / 4) * 380;
  }

  rectangleX(point: Point): number {
    return Math.min(305, this.pointX(point));
  }

  rectangleY(point: Point): number {
    return Math.min(225, this.pointY(point));
  }

  rectangleWidth(point: Point): number {
    return Math.abs(this.pointX(point) - 305);
  }

  rectangleHeight(point: Point): number {
    return Math.abs(this.pointY(point) - 225);
  }

  signed(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
