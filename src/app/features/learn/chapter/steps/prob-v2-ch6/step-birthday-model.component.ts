import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-birthday-model',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch6">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 6.5</p>
        <h2>Birthday collision 變快，不是因為 23 很接近 365</h2>
        <p class="lede">
          問題不是「誰和某個指定生日相同」，而是群體中<strong>任意一對</strong>是否相同。 people
          增加時，pair opportunities 以更快的速度累積。
        </p>
      </header>

      <section class="scene">
        <div class="birthday-prediction">
          <div>
            <p class="eyebrow">Birthday problem · 先預測</p>
            <h3>23 人中，至少兩人同生日的 probability 大約是多少？</h3>
            <p class="lede">模型暫時假設 365 天等可能、忽略閏日，且每人的生日生成互不影響。</p>
          </div>
          <div class="choice-row" role="group" aria-label="預測 23 人生日碰撞機率">
            @for (choice of [6, 50, 97]; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                約 {{ choice }}%
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 50) {
              <strong>對，精確模型約是 50.7%。</strong>
              23 人產生 253 個 pairs；event 允許任何一對碰撞，不只和你碰撞。
            } @else if (prediction() === 6) {
              6% 左右比較接近「其餘 22 人中，有人和某個指定者同生日」；birthday problem 接受任意
              pair。
            } @else {
              97% 需要更多人；但你的方向抓到 pairs 會讓機率上升得比 23/365 快很多。
            }
          </p>
        }
      </section>

      <section class="people-control">
        <label for="people">調整群體大小</label>
        <input
          id="people"
          type="range"
          min="2"
          max="60"
          [value]="people()"
          (input)="people.set(+$any($event).target.value)"
        />
        <strong>{{ people() }} 人</strong>
      </section>

      <section class="birthday-board">
        <div class="birthday-chart">
          <p class="eyebrow">Exact collision curve · 2–60 people</p>
          <h3>人數增加時，任意 pair collision 的 probability</h3>
          <svg viewBox="0 0 930 300" role="img" aria-label="生日碰撞機率隨人數上升的曲線">
            <line x1="50" y1="260" x2="900" y2="260" class="chart-axis" />
            <line x1="50" y1="40" x2="50" y2="260" class="chart-axis" />
            <line x1="50" y1="150" x2="900" y2="150" class="chart-guide" />
            <text x="8" y="44" class="chart-text">100%</text>
            <text x="17" y="154" class="chart-text">50%</text>
            <text x="26" y="264" class="chart-text">0%</text>
            <text x="50" y="283" class="chart-text">2</text>
            <text x="880" y="283" class="chart-text">60 people</text>

            <path [attr.d]="areaPath()" class="chart-area" />
            <path [attr.d]="curvePath()" class="chart-curve" />
            <circle [attr.cx]="markerX()" [attr.cy]="markerY()" r="8" class="chart-marker" />
            <text
              [attr.x]="markerLabelX()"
              [attr.y]="Math.max(28, markerY() - 16)"
              class="chart-text"
            >
              {{ people() }} people · {{ percent(collisionProbability()) }}
            </text>
          </svg>
        </div>

        <div class="birthday-stats">
          <div class="birthday-stat">
            <span>PAIR OPPORTUNITIES</span>
            <strong>{{ pairCount() }}</strong>
            <p>{{ people() }} 人中，每一對都可能成為第一組相同生日。</p>
          </div>
          <div class="birthday-stat">
            <span>SHARE A FIXED PERSON’S BIRTHDAY</span>
            <strong>{{ percent(fixedPersonProbability()) }}</strong>
            <p>只允許其他人撞上某個指定者；這不是 birthday collision event。</p>
          </div>
          <div class="birthday-stat highlight">
            <span>ANY MATCHING PAIR</span>
            <strong>{{ percent(collisionProbability()) }}</strong>
            <p>event 接受群體中任何一對，因此累積得快得多。</p>
          </div>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">No-collision tree · 比 collision patterns 更規則</p>
            <h3>要求每個新生日都避開前面已占用的 days</h3>
          </div>
          <p>第一人有 365 個 choices，第二人為避免 collision 只剩 364 個，之後依序減少。</p>
        </div>
        <div class="available-days" aria-label="沒有生日碰撞時每一層可選的日期數">
          @for (count of availableDayCounts(); track $index) {
            <span
              >person {{ $index + 1 }}<br /><strong>{{ count }}</strong> days</span
            >
          }
          @if (people() > availableDayCounts().length) {
            <span
              >…<br /><strong>{{ 366 - people() }}</strong> at person {{ people() }}</span
            >
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="cluster-arrow" aria-hidden="true">
          <div>
            <span>Direct collision world</span>
            <strong>許多重疊 patterns</strong>
          </div>
          <i>look at the opposite</i>
          <div>
            <span>No collision world</span>
            <strong>365 · 364 · 363 · …</strong>
          </div>
        </div>
        <div>
          <span class="card-label">好的 counting 先選容易描述的世界</span>
          <p>
            <strong>Birthday problem 的驚訝來自「任意 pair」與快速增加的 pair count。</strong>
            直接分類所有 collision 會重疊；反面的 no-collision tree 卻每層只少一個 choice。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：exact birthday probability、假設與 complement bridge</summary>
        <div>
          <p>
            在 birthdays independently and uniformly distributed over 365 days 的簡化模型下，n
            人完全沒有 collision 的 probability 是：
          </p>
          <div class="math-line">
            <app-math
              e="P(\\text{no collision})=1\\cdot\\frac{364}{365}\\cdot\\frac{363}{365}\\cdots\\frac{365-n+1}{365}"
            />
          </div>
          <p>「至少一組 collision」是其 complement：</p>
          <div class="math-line">
            <app-math e="P(\\text{collision})=1-P(\\text{no collision})" />
          </div>
          <p>
            現實生日並非完全 uniform，也有 twins、季節性與閏日等效應。
            這裡的目的不是精準人口模型，而是看清 counting structure。 下一章會把「至少一次」與
            complement strategy 正式建立。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BirthdayModelComponent {
  readonly Math = Math;
  readonly prediction = signal<number | null>(null);
  readonly people = signal(23);
  readonly pairCount = computed(() => (this.people() * (this.people() - 1)) / 2);
  readonly collisionProbability = computed(() => this.collisionFor(this.people()));
  readonly fixedPersonProbability = computed(() => 1 - (364 / 365) ** (this.people() - 1));
  readonly curvePoints = Array.from({ length: 59 }, (_, index) => {
    const people = index + 2;
    return {
      x: this.xFor(people),
      y: this.yFor(this.collisionFor(people)),
    };
  });
  readonly curvePath = computed(() =>
    this.curvePoints
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(' '),
  );
  readonly areaPath = computed(() => `${this.curvePath()} L 900 260 L 50 260 Z`);
  readonly markerX = computed(() => this.xFor(this.people()));
  readonly markerY = computed(() => this.yFor(this.collisionProbability()));
  readonly markerLabelX = computed(() =>
    this.people() > 49 ? this.markerX() - 150 : this.markerX() + 12,
  );
  readonly availableDayCounts = computed(() =>
    Array.from({ length: Math.min(this.people(), 8) }, (_, index) => 365 - index),
  );

  percent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  private collisionFor(people: number): number {
    let noCollision = 1;
    for (let index = 0; index < people; index += 1) {
      noCollision *= (365 - index) / 365;
    }
    return 1 - noCollision;
  }

  private xFor(people: number): number {
    return 50 + ((people - 2) / 58) * 850;
  }

  private yFor(probability: number): number {
    return 260 - probability * 220;
  }
}
