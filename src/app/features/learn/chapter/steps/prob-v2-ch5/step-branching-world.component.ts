import { Component, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type CoinPath = 'HH' | 'HT' | 'TH' | 'TT';

@Component({
  selector: 'app-prob-v2-branching-world',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch5">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 5.1</p>
        <h2>一次選擇產生 branch；完整歷史才會成為 leaf</h2>
        <p class="lede">
          <strong>樹狀圖（tree diagram）</strong>不是拿來裝飾計算。 它把多階段 experiment
          中每一條仍可能走下去的 history 完整保留下來。
        </p>
      </header>

      <section class="scene">
        <div class="tree-question">
          <div>
            <p class="eyebrow">先預測，再展開</p>
            <h3>硬幣有 H、T 兩個選項。連丟兩次，完整 outcomes 有幾個？</h3>
            <p class="lede">關鍵不是名稱有幾種，而是整次 experiment 有多少條完整 paths。</p>
          </div>
          <div class="choice-row" role="group" aria-label="預測兩次硬幣的 outcomes 數量">
            @for (choice of [2, 4, 8]; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="choosePrediction(choice)"
              >
                {{ choice }} 個
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 4) {
              <strong>對，是四條完整 paths。</strong>
              現在展開第二層，看每個第一擲 history 都還能再次分成 H、T。
            } @else {
              第一擲的 H、T 都還不是完整結果：每一邊都必須再回答「第二擲是什麼」。
            }
          </p>
        }
      </section>

      <section class="tree-canvas">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Root → partial history → complete outcome</p>
            <h3>
              {{ expanded() ? '四個 leaves，就是四個完整 outcomes' : '先看第一擲的兩個 branches' }}
            </h3>
          </div>
          <div class="control-row">
            <button type="button" [class.active]="!expanded()" (click)="expanded.set(false)">
              只看第一擲
            </button>
            <button type="button" [class.active]="expanded()" (click)="expanded.set(true)">
              展開第二擲
            </button>
          </div>
        </div>

        <div class="stage-caption" aria-hidden="true">
          <div>Experiment begins</div>
          <div>第一擲 · partial history</div>
          <div>第二擲 · complete outcome</div>
        </div>

        <svg viewBox="0 0 1000 330" role="img" aria-label="丟兩次硬幣的樹狀圖">
          <path
            d="M120 165 L420 85"
            class="tree-edge r"
            [class.active]="selectedPath()[0] === 'H'"
          />
          <path
            d="M120 165 L420 245"
            class="tree-edge b"
            [class.active]="selectedPath()[0] === 'T'"
          />

          <path
            d="M420 85 L820 35"
            class="tree-edge r"
            [class.hidden]="!expanded()"
            [class.active]="expanded() && selectedPath() === 'HH'"
          />
          <path
            d="M420 85 L820 115"
            class="tree-edge b"
            [class.hidden]="!expanded()"
            [class.active]="expanded() && selectedPath() === 'HT'"
          />
          <path
            d="M420 245 L820 215"
            class="tree-edge r"
            [class.hidden]="!expanded()"
            [class.active]="expanded() && selectedPath() === 'TH'"
          />
          <path
            d="M420 245 L820 295"
            class="tree-edge b"
            [class.hidden]="!expanded()"
            [class.active]="expanded() && selectedPath() === 'TT'"
          />

          <circle cx="120" cy="165" r="31" class="tree-node" />
          <text x="120" y="170" class="tree-text">START</text>

          <circle cx="420" cy="85" r="31" class="tree-node r" />
          <text x="420" y="90" class="tree-text">H</text>
          <text x="420" y="132" class="tree-label">只知道第一擲</text>

          <circle cx="420" cy="245" r="31" class="tree-node b" />
          <text x="420" y="250" class="tree-text">T</text>
          <text x="420" y="292" class="tree-label">只知道第一擲</text>

          @for (leaf of leafPositions; track leaf.path) {
            <circle
              [attr.cx]="leaf.x"
              [attr.cy]="leaf.y"
              r="31"
              class="tree-node leaf"
              [class.r]="leaf.path[1] === 'H'"
              [class.b]="leaf.path[1] === 'T'"
              [class.selected]="selectedPath() === leaf.path"
              [class.hidden]="!expanded()"
            />
            <text
              [attr.x]="leaf.x"
              [attr.y]="leaf.y + 5"
              class="tree-text"
              [class.hidden]="!expanded()"
            >
              {{ leaf.path }}
            </text>
          }
        </svg>

        <div class="leaf-row" [attr.aria-hidden]="!expanded()">
          @for (path of paths; track path) {
            <button
              type="button"
              class="leaf-card"
              [class.selected]="selectedPath() === path"
              [disabled]="!expanded()"
              (click)="selectedPath.set(path)"
            >
              <strong>{{ path }}</strong>
              <span>{{ pathDescription(path) }}</span>
            </button>
          }
        </div>

        <div class="path-readout">
          <div class="path-token">
            <span>目前高亮的完整 path</span>
            <strong
              >{{ selectedPath()[0] }} → {{ selectedPath()[1] }} → {{ selectedPath() }}</strong
            >
          </div>
          <p>
            {{ selectedPath()[0] }} 是第一擲的 partial history；
            <strong>{{ selectedPath() }}</strong> 才回答了整次 experiment 發生什麼。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="operation-map" aria-hidden="true">
          <div>
            <span>Branch</span>
            <strong>下一步選項</strong>
          </div>
          <i>→</i>
          <div>
            <span>Leaf</span>
            <strong>完整 ordered outcome</strong>
          </div>
        </div>
        <div>
          <span class="card-label">不要在半路停止描述 outcome</span>
          <p>
            <strong>一個完整 outcome，是從 root 走到 leaf 的整條 path。</strong>
            多階段世界之所以快速長大，是每一段 partial history 都會再次分岔。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：Cartesian product 為什麼會產生四個 ordered outcomes？</summary>
        <div>
          <p>
            單次硬幣的 outcome set 是 <app-math e="S=\\{H,T\\}" />。 兩次 experiment 的 sample space
            是 Cartesian product：
          </p>
          <div class="math-line">
            <app-math e="\\Omega=S\\times S=\\{(H,H),(H,T),(T,H),(T,T)\\}" />
          </div>
          <p>
            order 是 outcome 的一部分，所以 HT 與 TH 是不同 paths。 這裡只在數完整
            histories，還沒有假設四條 paths 等可能。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BranchingWorldComponent {
  readonly prediction = signal<number | null>(null);
  readonly expanded = signal(false);
  readonly selectedPath = signal<CoinPath>('HT');
  readonly paths: CoinPath[] = ['HH', 'HT', 'TH', 'TT'];
  readonly leafPositions: Array<{ path: CoinPath; x: number; y: number }> = [
    { path: 'HH', x: 820, y: 35 },
    { path: 'HT', x: 820, y: 115 },
    { path: 'TH', x: 820, y: 215 },
    { path: 'TT', x: 820, y: 295 },
  ];

  choosePrediction(choice: number): void {
    this.prediction.set(choice);
    this.expanded.set(true);
  }

  pathDescription(path: CoinPath): string {
    return `${path[0] === 'H' ? '正面' : '反面'} → ${path[1] === 'H' ? '正面' : '反面'}`;
  }
}
