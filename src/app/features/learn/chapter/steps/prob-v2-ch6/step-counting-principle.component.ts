import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-counting-principle',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch6">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 6.1</p>
        <h2>乘法原理，是把規則相同的 tree layers 壓成幾個數字</h2>
        <p class="lede">
          <strong>乘法原理（multiplication principle）</strong>不是「題目給三個數就相乘」。
          它成立的理由是：每條 partial path 都會接上下一層的全部 choices。
        </p>
      </header>

      <section class="scene">
        <div class="count-question">
          <div>
            <p class="eyebrow">先想像完整 outfit paths</p>
            <h3>3 件上衣、2 件褲子、2 雙鞋，可以組成幾套 outfits？</h3>
            <p class="lede">每件上衣後面，都能接上全部褲子；每個上衣＋褲子又都能接上全部鞋子。</p>
          </div>
          <div class="choice-row" role="group" aria-label="預測完整 outfits 數量">
            @for (choice of [7, 12, 24]; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                {{ choice }}
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 12) {
              <strong>對，是 3 × 2 × 2 = 12 條完整 paths。</strong>
              每增加一層，前一刻所有 partial paths 都被這一層的 choices 複製。
            } @else {
              不要把 choice counts 相加，也不要重複多乘一層；沿任一完整
              path，恰好各選一件上衣、一件褲子和一雙鞋。
            }
          </p>
        }
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Compressed tree lab</p>
            <h3>改變每一層的 branch count</h3>
          </div>
          <p>右側 paths 是展開後的一小部分；總數再大，也只需要保留每層的選項數。</p>
        </div>
        <div class="layer-controls">
          <div class="layer-control">
            <label for="tops">第一層 · 上衣 {{ tops() }} 件</label>
            <span>每條 path 選一件</span>
            <input
              id="tops"
              type="range"
              min="2"
              max="5"
              [value]="tops()"
              (input)="tops.set(+$any($event).target.value)"
            />
          </div>
          <div class="layer-control">
            <label for="bottoms">第二層 · 褲子 {{ bottoms() }} 件</label>
            <span>接到每個第一層 branch</span>
            <input
              id="bottoms"
              type="range"
              min="2"
              max="5"
              [value]="bottoms()"
              (input)="bottoms.set(+$any($event).target.value)"
            />
          </div>
          <div class="layer-control">
            <label for="shoes">第三層 · 鞋子 {{ shoes() }} 雙</label>
            <span>接到每條 partial path</span>
            <input
              id="shoes"
              type="range"
              min="2"
              max="5"
              [value]="shoes()"
              (input)="shoes.set(+$any($event).target.value)"
            />
          </div>
        </div>
      </section>

      <section class="compressed-tree" aria-label="三層 tree 壓縮成 branch counts">
        <div class="tree-layer a">
          <span>Layer 1</span>
          <strong>× {{ tops() }}</strong>
          <small>上衣 choices</small>
        </div>
        <i class="layer-times">→</i>
        <div class="tree-layer b">
          <span>Layer 2</span>
          <strong>× {{ bottoms() }}</strong>
          <small>每條 path 都複製</small>
        </div>
        <i class="layer-times">→</i>
        <div class="tree-layer c">
          <span>Layer 3</span>
          <strong>× {{ shoes() }}</strong>
          <small>再次等量複製</small>
        </div>
        <i class="layer-times">=</i>
        <div class="leaf-total">
          <span>COMPLETE LEAVES</span>
          <strong>{{ totalPaths() }}</strong>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Expanded leaves · 最多顯示前 31 條</p>
            <h3>每個 tile 都是一套完整 outfit</h3>
          </div>
          <p>
            {{ tops() }} × {{ bottoms() }} × {{ shoes() }} = {{ totalPaths() }}；改一層時，整批
            leaves 會按比例增減。
          </p>
        </div>
        <div class="path-samples" aria-label="部分完整 outfit paths">
          @for (path of visiblePaths(); track path) {
            <div class="sample-path">{{ path }}</div>
          }
          @if (hiddenCount() > 0) {
            <div class="sample-path more">+{{ hiddenCount() }} paths</div>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="cluster-arrow" aria-hidden="true">
          <div>
            <span>完整 tree</span>
            <strong>{{ totalPaths() }} leaves</strong>
          </div>
          <i>compress</i>
          <div>
            <span>只保留 layer counts</span>
            <strong>{{ tops() }} × {{ bottoms() }} × {{ shoes() }}</strong>
          </div>
        </div>
        <div>
          <span class="card-label">乘法是在描述 repeated branching</span>
          <p>
            <strong
              >每條 partial path 若都能接上下一層的全部 choices，paths 數就乘上該層 branch
              count。</strong
            >
            如果某些 choices 不能配某些下一步，就不能直接使用這個壓縮。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>正式層：fundamental counting principle</summary>
        <div>
          <p>
            若一個 procedure 有 k 個 stages，而且不論之前走到哪條合法 partial path， 第 i 個 stage
            都恰有 <app-math e="n_i" /> 個 choices，則完整 outcomes 數為：
          </p>
          <div class="math-line">
            <app-math e="n_1n_2\\cdots n_k" />
          </div>
          <p>
            條件中的「每條合法 partial path 都恰有相同 choice count」不能省略。 若 branch counts 依
            history 改變，應分開計數或回到 tree。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CountingPrincipleComponent {
  readonly prediction = signal<number | null>(null);
  readonly tops = signal(3);
  readonly bottoms = signal(2);
  readonly shoes = signal(2);
  readonly totalPaths = computed(() => this.tops() * this.bottoms() * this.shoes());
  readonly allPaths = computed(() => {
    const paths: string[] = [];
    for (let top = 1; top <= this.tops(); top += 1) {
      for (let bottom = 1; bottom <= this.bottoms(); bottom += 1) {
        for (let shoe = 1; shoe <= this.shoes(); shoe += 1) {
          paths.push(`T${top} · P${bottom} · S${shoe}`);
        }
      }
    }
    return paths;
  });
  readonly visiblePaths = computed(() => this.allPaths().slice(0, 31));
  readonly hiddenCount = computed(() =>
    Math.max(0, this.totalPaths() - this.visiblePaths().length),
  );
}
