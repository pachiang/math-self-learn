import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-weight-map',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch12">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 12.1</p>
        <h2>Distribution 是 probability weights 搬家後留下的地圖</h2>
        <p class="lede">
          <strong>分布（distribution）</strong>不是憑空出現的圖。random variable 把每條 outcome path
          搬到一個 value；落在同一處的 weights 合併後，才形成數值世界的重量地圖。
        </p>
      </header>

      <section class="scene">
        <div class="dist-prediction">
          <div>
            <p class="eyebrow">先預測 · X = count H in three tosses</p>
            <h3>把 P(H) 從 50% 調高到 75%，X 的 mass 會往哪邊移？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測分布重量移動方向">
            @for (choice of predictionChoices; track choice.id) {
              <button
                type="button"
                [class.selected]="prediction() === choice.id"
                (click)="prediction.set(choice.id)"
              >
                {{ choice.label }}
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 'right') {
              <strong>對，mass 會往較多 H 的右側移。</strong>mapping 沒變，是原 paths 的 weights
              改變了。
            } @else {
              P(H) 提高會讓包含較多 H 的 paths 變重，所以 X=2、3 承接更多 mass。
            }
          </p>
        }
      </section>

      <section class="dist-control">
        <label for="head-probability">調整每次 toss 的 P(H)</label>
        <input
          id="head-probability"
          type="range"
          min="10"
          max="90"
          step="5"
          [value]="headProbability()"
          (input)="headProbability.set(+$any($event).target.value)"
        />
        <strong>{{ headProbability() }}%</strong>
      </section>

      <section class="weight-map-board">
        <div class="path-weight-panel">
          <p class="eyebrow">Outcome world · path weights</p>
          <h3>同樣八條 paths，重量會隨 coin bias 改變</h3>
          <div class="weighted-paths">
            @for (path of paths; track path) {
              <button
                type="button"
                [class.active]="countHeads(path) === selectedValue()"
                (click)="selectedValue.set(countHeads(path))"
              >
                <span>{{ path }}</span>
                <i><b [style.width.%]="pathWeight(path) * 100"></b></i>
                <strong>{{ percent(pathWeight(path)) }}</strong>
              </button>
            }
          </div>
        </div>

        <div class="weight-transfer" aria-hidden="true">
          <span>fixed mapping</span>
          <strong>X = count H</strong>
          <i>→</i>
          <span>merge equal values</span>
        </div>

        <div class="distribution-panel">
          <p class="eyebrow">Value world · distribution of X</p>
          <h3>同值 paths 的 weights 在 bucket 中相加</h3>
          <div class="distribution-buckets">
            @for (value of [0, 1, 2, 3]; track value) {
              <button
                type="button"
                [class.active]="selectedValue() === value"
                (click)="selectedValue.set(value)"
              >
                <span>X={{ value }}</span>
                <div><i [style.height.%]="bucketMass(value) * 100"></i></div>
                <strong>{{ percent(bucketMass(value)) }}</strong>
                <small>{{ pathCount(value) }} incoming paths</small>
              </button>
            }
          </div>
          <p class="mass-total">四個 buckets 合計 {{ percent(totalMass()) }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="dist-core-map" aria-hidden="true">
          <div><strong>Outcome weights</strong><span>原世界</span></div>
          <i>push through X</i>
          <div><strong>Value weights</strong><span>distribution</span></div>
        </div>
        <div>
          <span class="card-label">Distribution = push probability weights through X</span>
          <p>
            <strong>Value 自己不會產生 probability。</strong>
            它承接的是所有 preimage outcomes 原本帶來的重量；mapping 與原世界 weights 共同決定形狀。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：pushforward 與 biased paths</summary>
        <div>
          <p>若三次 toss independent，含 h 個 H 的特定 path weight 是：</p>
          <div class="math-line">
            <app-math e="p^h(1-p)^{3-h}" />
          </div>
          <p>value x 的 distribution mass 則把整個 preimage 相加：</p>
          <div class="math-line">
            <app-math e="P(X=x)=\\sum_{\\omega:X(\\omega)=x}P(\\{\\omega\\})" />
          </div>
          <p>
            這種由 mapping 將 probability measure 搬到輸出空間的做法，正式名稱是
            <strong>pushforward distribution</strong>。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2WeightMapComponent {
  readonly paths = ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'];
  readonly predictionChoices = [
    { id: 'left', label: '往較少 H 移' },
    { id: 'same', label: '保持不變' },
    { id: 'right', label: '往較多 H 移' },
  ];
  readonly prediction = signal<string | null>(null);
  readonly headProbability = signal(75);
  readonly selectedValue = signal(2);
  readonly totalMass = computed(() =>
    [0, 1, 2, 3].reduce((sum, value) => sum + this.bucketMass(value), 0),
  );

  countHeads(path: string): number {
    return [...path].filter((face) => face === 'H').length;
  }

  pathWeight(path: string): number {
    const p = this.headProbability() / 100;
    const heads = this.countHeads(path);
    return p ** heads * (1 - p) ** (3 - heads);
  }

  bucketMass(value: number): number {
    return this.paths
      .filter((path) => this.countHeads(path) === value)
      .reduce((sum, path) => sum + this.pathWeight(path), 0);
  }

  pathCount(value: number): number {
    return this.paths.filter((path) => this.countHeads(path) === value).length;
  }

  percent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }
}
