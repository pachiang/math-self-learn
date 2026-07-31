import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type ModelingQuestion = 'sum-seven' | 'first-die-six';
type SumStatus = 'yes' | 'no' | 'mixed';

@Component({
  selector: 'app-prob-v2-modeling-granularity',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 2.4</p>
        <h2>Sample space 是地圖，不是現實本身</h2>
        <p class="lede">
          同一場兩顆骰子的 experiment，可以保留每顆點數，也可以只記錄總和。
          地圖可以壓縮，但一旦丟掉細節，有些問題就再也回答不了。
        </p>
      </header>

      <section class="scene">
        <div class="model-question">
          <div>
            <p class="eyebrow">用同一批 outcomes 問兩個不同問題</p>
            <h3>切換目標，看看「只記總和」何時足夠</h3>
          </div>
          <div class="control-row" role="group" aria-label="選擇要研究的事件">
            <button
              type="button"
              [class.active]="question() === 'sum-seven'"
              (click)="question.set('sum-seven')"
            >
              A：總和是 7
            </button>
            <button
              type="button"
              [class.active]="question() === 'first-die-six'"
              (click)="question.set('first-die-six')"
            >
              A：第一顆是 6
            </button>
          </div>
        </div>
      </section>

      <section class="model-comparison">
        <div class="model-panel">
          <p class="eyebrow">完整地圖 · ordered pairs</p>
          <h3>保留第一顆與第二顆各自的點數</h3>
          <p>每格 (i, j) 是一個完整 outcome。列是第一顆骰子，欄是第二顆骰子。</p>

          <div class="pair-map" aria-label="兩顆骰子的三十六個 ordered outcomes">
            <span class="axis-label">一＼二</span>
            @for (second of diceValues; track second) {
              <span class="axis-label">{{ second }}</span>
            }
            @for (first of diceValues; track first) {
              <span class="axis-label">{{ first }}</span>
              @for (second of diceValues; track second) {
                <div
                  class="pair-cell"
                  [class.in-event]="pairInEvent(first, second)"
                  [attr.aria-label]="
                    '第一顆 ' +
                    first +
                    '，第二顆 ' +
                    second +
                    (pairInEvent(first, second) ? '，屬於事件 A' : '')
                  "
                >
                  ({{ first }},{{ second }})
                </div>
              }
            }
          </div>
        </div>

        <div class="model-panel">
          <p class="eyebrow">壓縮地圖 · 只保留 sum</p>
          <h3>36 格被收進 11 個總和</h3>
          <p>每個小短條代表一個被壓進該總和的 ordered outcome。</p>

          <div class="sum-map" aria-label="只保留兩顆骰子總和的壓縮地圖">
            @for (sum of sums; track sum) {
              <div class="sum-cell" [class]="sumStatus(sum)">
                <strong>{{ sum }}</strong>
                <div class="fiber" aria-hidden="true">
                  @for (pair of pairsForSum(sum); track pair.key) {
                    <i></i>
                  }
                </div>
                <span class="sum-status">{{ sumStatusLabel(sum) }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <p class="model-verdict">
        @if (question() === 'sum-seven') {
          <strong>只記總和就夠。</strong>
          所有 sum = 7 的 ordered outcomes 都屬於 A，其他總和都不屬於 A。 壓縮後仍能完整判斷。
        } @else {
          <strong>只記總和不夠。</strong>
          對 sum = 7 到 11，同一個總和裡同時混有「第一顆是 6」與「第一顆不是 6」的 outcomes。
          條紋格表示資訊已經混在一起，無法只靠 sum 決定。
        }
      </p>

      <aside class="insight-card">
        <div class="compression-visual" aria-hidden="true">
          <div class="grid-icon">
            @for (_ of nineCells; track $index) {
              <i></i>
            }
          </div>
          <b>→</b>
          <div class="sum-icon">
            @for (_ of sevenBars; track $index) {
              <i></i>
            }
          </div>
        </div>
        <div>
          <span class="card-label">好的地圖不是最詳細，而是剛好夠用</span>
          <p>
            <strong>sample space 可以忽略不重要的細節，但必須分得出你關心的差異。</strong>
            先問問題，再決定哪些 outcomes 可以安全地合併。
          </p>
        </div>
      </aside>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">檢查你是否真的掌握建模粒度</p>
            <h3>只記錄「付款成功／失敗」，能研究失敗原因嗎？</h3>
          </div>
          <p>假設真正原因可能是餘額不足、逾時、風控拒絕或系統錯誤。</p>
        </div>
        <div class="choice-row" role="group" aria-label="判斷付款 sample space 是否足夠">
          <button
            type="button"
            [class.selected]="transferAnswer() === 'enough'"
            (click)="transferAnswer.set('enough')"
          >
            足夠
          </button>
          <button
            type="button"
            [class.selected]="transferAnswer() === 'not-enough'"
            (click)="transferAnswer.set('not-enough')"
          >
            不足夠
          </button>
        </div>
        @if (transferAnswer()) {
          <p class="feedback" aria-live="polite">
            @if (transferAnswer() === 'not-enough') {
              <strong>對。</strong>成功／失敗足以研究成功率，卻把所有失敗原因壓成同一格。
              若問題改成「哪種原因最常發生」，就需要更細的 outcomes。
            } @else {
              這張地圖只能回答是否成功。它已經把不同失敗原因合併， 所以無法再分辨是哪一類造成的。
            }
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>正式一點：壓縮地圖其實是一個 function</summary>
        <div>
          <p>從 ordered pair 到總和，可以看成一個 mapping：</p>
          <div class="math-line">
            <app-math e="S(i,j)=i+j" />
          </div>
          <p>
            很多不同 outcomes 會被映到同一個 sum。例如 (1,6)、(2,5)、…、(6,1) 都映到 7。只觀察 S
            之後， 我們只知道 outcome 落在這一整群裡，無法知道是哪一格。
          </p>
          <p>
            Ch11 會把這種從 outcomes 映到數值的 function 正式命名為 random
            variable。現在先記住：每次壓縮都會選擇保留什麼、遺失什麼。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ModelingGranularityComponent {
  readonly diceValues = [1, 2, 3, 4, 5, 6] as const;
  readonly sums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
  readonly nineCells = Array.from({ length: 9 });
  readonly sevenBars = Array.from({ length: 7 });
  readonly question = signal<ModelingQuestion>('sum-seven');
  readonly transferAnswer = signal<'enough' | 'not-enough' | null>(null);

  readonly currentEventLabel = computed(() =>
    this.question() === 'sum-seven' ? '總和是 7' : '第一顆是 6',
  );

  pairInEvent(first: number, second: number): boolean {
    return this.question() === 'sum-seven' ? first + second === 7 : first === 6;
  }

  pairsForSum(sum: number): { first: number; second: number; key: string }[] {
    const pairs: { first: number; second: number; key: string }[] = [];
    for (const first of this.diceValues) {
      const second = sum - first;
      if (second >= 1 && second <= 6) {
        pairs.push({ first, second, key: `${first}-${second}` });
      }
    }
    return pairs;
  }

  sumStatus(sum: number): SumStatus {
    if (this.question() === 'sum-seven') {
      return sum === 7 ? 'yes' : 'no';
    }

    if (sum <= 6) return 'no';
    if (sum === 12) return 'yes';
    return 'mixed';
  }

  sumStatusLabel(sum: number): string {
    switch (this.sumStatus(sum)) {
      case 'yes':
        return '全部屬於 A';
      case 'mixed':
        return '混在一起';
      default:
        return '不屬於 A';
    }
  }
}
