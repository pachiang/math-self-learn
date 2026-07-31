import { Component, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type CoinSequence = 'HH' | 'HT' | 'TH' | 'TT';

@Component({
  selector: 'app-prob-v2-complete-outcomes',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 2.2</p>
        <h2>丟兩次硬幣，H 還不是完整結果</h2>
        <p class="lede">
          outcome 必須回答「整次 experiment 發生了什麼」。
          當實驗有兩個階段，只記住其中一次，就像只走到路的中途。
        </p>
      </header>

      <section class="scene">
        <div class="count-prediction">
          <div>
            <p class="eyebrow">先預測，再展開世界</p>
            <h3>一枚硬幣連續丟兩次，共有幾個完整 outcomes？</h3>
            <p class="lede">
              注意：問題不是結果用了幾種字母，而是整場兩次投擲可以走出幾條完整路徑。
            </p>
          </div>
          <div class="choice-row" role="group" aria-label="選擇完整 outcomes 數量">
            @for (choice of [2, 3, 4]; track choice) {
              <button
                type="button"
                [class.selected]="countPrediction() === choice"
                (click)="countPrediction.set(choice)"
              >
                {{ choice }} 個
              </button>
            }
          </div>
        </div>

        @if (countPrediction()) {
          <p class="feedback" aria-live="polite">
            @if (countPrediction() === 4) {
              <strong>對，是四條完整路徑。</strong>
              第一次的每個分支，都還要再接上第二次的 H 或 T。
            } @else {
              先別只數 H、T 兩個名稱。第一次選完後，第二次仍有兩條分支； 把樹展開到底再數葉節點。
            }
          </p>
        }
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Tree diagram</p>
            <h3>完整 outcomes 藏在樹的葉節點</h3>
          </div>
          <p>點一個葉節點。紅色路徑會顯示這個 outcome 如何先經過第一次投擲，再完成第二次投擲。</p>
        </div>

        <div class="tree-wrap">
          <svg
            class="tree-lines"
            viewBox="0 0 1000 330"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="90"
              y1="165"
              x2="420"
              y2="92"
              [class.active]="selectedSequence()?.startsWith('H')"
            />
            <line
              x1="90"
              y1="165"
              x2="420"
              y2="238"
              [class.active]="selectedSequence()?.startsWith('T')"
            />
            <line x1="420" y1="92" x2="840" y2="43" [class.active]="selectedSequence() === 'HH'" />
            <line x1="420" y1="92" x2="840" y2="129" [class.active]="selectedSequence() === 'HT'" />
            <line
              x1="420"
              y1="238"
              x2="840"
              y2="201"
              [class.active]="selectedSequence() === 'TH'"
            />
            <line
              x1="420"
              y1="238"
              x2="840"
              y2="287"
              [class.active]="selectedSequence() === 'TT'"
            />
          </svg>

          <div class="tree-node root">開始</div>
          <div class="tree-node first-h">H</div>
          <div class="tree-node first-t">T</div>

          @for (sequence of sequences; track sequence) {
            <button
              type="button"
              class="tree-leaf"
              [class.hh]="sequence === 'HH'"
              [class.ht]="sequence === 'HT'"
              [class.th]="sequence === 'TH'"
              [class.tt]="sequence === 'TT'"
              [class.active]="selectedSequence() === sequence"
              (click)="selectedSequence.set(sequence)"
            >
              {{ sequence }}
            </button>
          }

          <span class="tree-stage-label s1">experiment 開始</span>
          <span class="tree-stage-label s2">只知道第一擲</span>
          <span class="tree-stage-label s3">兩擲都知道：完整 outcome</span>
        </div>

        @if (selectedSequence()) {
          <p class="feedback" aria-live="polite">
            你選的是 <strong>{{ selectedSequence() }}</strong
            >： 第一次是 {{ selectedSequence()?.[0] }}，第二次是
            {{ selectedSequence()?.[1] }}。兩個位置都有資訊，所以它能完整描述這次 experiment。
          </p>
        }
      </section>

      <section class="partial-vs-complete">
        <div class="info-card">
          <span>PARTIAL INFORMATION · 只走到中途</span>
          <strong>H</strong>
          <p>我們只知道第一次是正面，第二次可能是 H，也可能是 T。 H 對這場兩次投擲來說還不完整。</p>
        </div>
        <div class="not-complete" aria-hidden="true">≠</div>
        <div class="info-card">
          <span>COMPLETE OUTCOME · 抵達葉節點</span>
          <strong>HH 或 HT</strong>
          <p>兩個位置分別記錄第一次與第二次。順序也被保留下來， 所以 HT 和 TH 是不同 outcomes。</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="three-levels" aria-hidden="true">
          <div>
            <span>只知道一半</span>
            <strong>H → ?</strong>
          </div>
          <i>→</i>
          <div>
            <span>繼續分岔</span>
            <strong>H → H / T</strong>
          </div>
          <i>→</i>
          <div>
            <span>完整結果</span>
            <strong>HH / HT</strong>
          </div>
        </div>
        <div>
          <span class="card-label">判斷 outcome 是否完整</span>
          <p>
            問它能不能回答：<strong>「整次 experiment 發生了什麼？」</strong>
            若仍有未記錄的階段，它就只是 partial information。
          </p>
        </div>
      </aside>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">遷移到兩顆骰子</p>
            <h3>「骰到 5」足以描述兩顆有顏色的骰子嗎？</h3>
          </div>
          <p>假設同時擲一顆紅骰與一顆藍骰，而且要記錄各自點數。</p>
        </div>
        <div class="choice-row" role="group" aria-label="選擇完整的兩顆骰子 outcome">
          <button
            type="button"
            [class.selected]="diceChoice() === '5'"
            (click)="diceChoice.set('5')"
          >
            5
          </button>
          <button
            type="button"
            [class.selected]="diceChoice() === '(5,2)'"
            (click)="diceChoice.set('(5,2)')"
          >
            (5, 2)
          </button>
          <button
            type="button"
            [class.selected]="diceChoice() === '12'"
            (click)="diceChoice.set('12')"
          >
            12
          </button>
        </div>
        @if (diceChoice()) {
          <p class="feedback" aria-live="polite">
            @if (diceChoice() === '(5,2)') {
              <strong>對。</strong>ordered pair (5, 2) 同時記錄紅骰是 5、藍骰是 2。
            } @else {
              單獨一個數沒有分別記錄兩顆骰子的點數，因此不足以回答整次 experiment 發生了什麼。
            }
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>符號層：兩次投擲的 sample space</summary>
        <div>
          <p>兩次投擲的完整 sample space 是：</p>
          <div class="math-line">
            <app-math e="Omega = {HH, HT, TH, TT}" />
          </div>
          <p>
            這裡的字串位置有意義，所以 HT 與 TH 不相同。 下一章談多階段世界時，會把這種結構正式連到
            Cartesian product。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CompleteOutcomesComponent {
  readonly sequences: CoinSequence[] = ['HH', 'HT', 'TH', 'TT'];
  readonly countPrediction = signal<number | null>(null);
  readonly selectedSequence = signal<CoinSequence | null>(null);
  readonly diceChoice = signal<string | null>(null);
}
