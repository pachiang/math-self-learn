import { Component, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

interface LabeledArrangement {
  labeled: string;
  visible: string;
}

@Component({
  selector: 'app-prob-v2-repeated-elements',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch6">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 6.4</p>
        <h2>交換兩個看不出差別的 objects，不會產生新的可見排列</h2>
        <p class="lede">
          先偷偷替兩個 A 加上編號 A₁、A₂，底層仍有 3! 條 labeled paths。 擦掉標籤後，成對 paths
          會顯示成同一個字串。
        </p>
      </header>

      <section class="scene">
        <div class="label-toggle-board">
          <div>
            <p class="eyebrow">Identity lens</p>
            <h3>
              {{
                showLabels()
                  ? '先保留隱藏身份：A₁、A₂、B 都 distinct'
                  : '擦掉身份標籤：兩個 A 變得 indistinguishable'
              }}
            </h3>
            <p class="lede">切換 lens 並沒有刪除底層 paths；它只改變哪些差異還能被我們觀察到。</p>
          </div>
          <div class="preset-row" role="group" aria-label="切換物件身份標籤">
            <button type="button" [class.active]="showLabels()" (click)="showLabels.set(true)">
              Labeled view
            </button>
            <button type="button" [class.active]="!showLabels()" (click)="showLabels.set(false)">
              Visible view
            </button>
          </div>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Six underlying paths</p>
            <h3>
              {{
                showLabels()
                  ? '每條 labeled permutation 都不同'
                  : '相同 visible arrangement 會成對合併'
              }}
            </h3>
          </div>
          <p>點選下方 bucket，可以追蹤它是由哪兩條底層 paths 壓縮而來。</p>
        </div>
        <div class="labeled-paths" aria-label="A1 A2 B 的六條底層 permutations">
          @for (path of arrangements; track path.labeled) {
            <div
              class="labeled-path"
              [class.merged]="!showLabels() || activeBucket() === path.visible"
            >
              <strong>{{ showLabels() ? path.labeled : path.visible }}</strong>
              <span>
                {{ showLabels() ? 'distinct labeled path' : 'visible as ' + path.visible }}
              </span>
            </div>
          }
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Visible buckets</p>
            <h3>六條 paths 最後只留下三種可見 outcomes</h3>
          </div>
          <p>每個 bucket 都收進交換 A₁、A₂ 所產生的兩種描述。</p>
        </div>
        <div class="repeat-buckets" role="group" aria-label="AAB 的三種可見排列">
          @for (bucket of buckets; track bucket) {
            <button
              type="button"
              class="repeat-bucket"
              [class.active]="activeBucket() === bucket"
              (click)="activeBucket.set(bucket)"
            >
              <strong>{{ bucket }}</strong>
              <span>{{ underlying(bucket) }}</span>
            </button>
          }
        </div>
      </section>

      <section class="cluster-arrow">
        <div>
          <span>Labeled paths</span>
          <strong>3! = 6</strong>
        </div>
        <i>每個 visible string 被描述 2! 次</i>
        <div>
          <span>Visible arrangements</span>
          <strong>6 ÷ 2! = 3</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="cluster-arrow" aria-hidden="true">
          <div>
            <span>A₁A₂B 與 A₂A₁B</span>
            <strong>底層 paths 不同</strong>
          </div>
          <i>erase labels</i>
          <div>
            <span>AAB</span>
            <strong>可見 outcome 相同</strong>
          </div>
        </div>
        <div>
          <span class="card-label">真正被除掉的是 redundant descriptions</span>
          <p>
            <strong
              >重複元素讓交換某些 objects 變得不可觀察；這些 permutations 只是同一 outcome
              的重複描述。</strong
            >
            先暫時加標籤看清 tree，再依不可分辨的交換方式分組。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：multiset permutations</summary>
        <div>
          <p>
            n 個 positions 中，若第 1 類有 <app-math e="n_1" /> 個相同 objects、 第 2 類有
            <app-math e="n_2" /> 個，依此類推，而且 <app-math e="n_1+\\cdots+n_r=n" />，則可見
            arrangements 數為：
          </p>
          <div class="math-line">
            <app-math e="\\frac{n!}{n_1!n_2!\\cdots n_r!}" />
          </div>
          <p>
            分母計算的是在每一類 indistinguishable objects 內交換標籤的方式數。 例如 BANANA 有 6 個
            letters，其中 A 有 3 個、N 有 2 個，因此是
            <app-math e="6!/(3!2!)" />。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2RepeatedElementsComponent {
  readonly showLabels = signal(true);
  readonly activeBucket = signal('AAB');
  readonly arrangements: LabeledArrangement[] = [
    { labeled: 'A₁A₂B', visible: 'AAB' },
    { labeled: 'A₂A₁B', visible: 'AAB' },
    { labeled: 'A₁BA₂', visible: 'ABA' },
    { labeled: 'A₂BA₁', visible: 'ABA' },
    { labeled: 'BA₁A₂', visible: 'BAA' },
    { labeled: 'BA₂A₁', visible: 'BAA' },
  ];
  readonly buckets = ['AAB', 'ABA', 'BAA'];

  underlying(bucket: string): string {
    return this.arrangements
      .filter((arrangement) => arrangement.visible === bucket)
      .map((arrangement) => arrangement.labeled)
      .join(' · ');
  }
}
