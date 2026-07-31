import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-random-variable-machine',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch11">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 11.1</p>
        <h2>Random variable 不是亂動的數，而是一台固定的測量機器</h2>
        <p class="lede">
          <strong>隨機變數（random variable）</strong>把每個完整 outcome 翻譯成一個數值。哪條 path
          發生仍不確定；但一旦選定測量規則，同一個 outcome 永遠得到同一個輸出。
        </p>
      </header>

      <section class="scene">
        <div class="rv-prediction">
          <div>
            <p class="eyebrow">先預測 · three coin tosses</p>
            <h3>規則 X =「H 的個數」。若 outcome 是 HHT，machine 會輸出什麼？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測 HHT 會映射到哪個數值">
            @for (choice of [1, 2, 3]; track choice) {
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
            @if (prediction() === 2) {
              <strong>對，X(HHT)=2。</strong>machine 不在乎 H 出現在哪個位置，只執行「計數 H」。
            } @else {
              HHT 是完整 outcome；逐格數 H 有兩個，所以固定輸出 2。
            }
          </p>
        }
      </section>

      <section class="mapping-board">
        <div class="rv-input-world">
          <p class="eyebrow">Input · sample space Ω</p>
          <h3>隨機選到哪條完整 path</h3>
          <div class="coin-path-grid" role="group" aria-label="選擇三次硬幣的完整結果">
            @for (path of paths; track path) {
              <button
                type="button"
                [class.active]="selectedPath() === path"
                (click)="selectedPath.set(path)"
              >
                <span class="coin-sequence">
                  @for (face of path; track $index) {
                    <i [class.tail]="face === 'T'">{{ face }}</i>
                  }
                </span>
                <small>outcome</small>
              </button>
            }
          </div>
        </div>

        <div class="measurement-machine" aria-label="計算正面個數的固定測量規則">
          <span>FIXED RULE</span>
          <strong>X = count H</strong>
          <div class="machine-input">{{ selectedPath() }}</div>
          <i aria-hidden="true">↓</i>
          <div class="machine-output">{{ selectedValue() }}</div>
          <small>rule 沒有改變</small>
        </div>

        <div class="value-world">
          <p class="eyebrow">Output · number line</p>
          <h3>數值只剩 0、1、2、3</h3>
          <div class="value-slots" aria-label="random variable 的四個可能輸出">
            @for (value of [0, 1, 2, 3]; track value) {
              <div [class.active]="selectedValue() === value">
                <strong>{{ value }}</strong>
                <span>{{ pathsFor(value).length }} paths map here</span>
              </div>
            }
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="rv-core-map" aria-hidden="true">
          <div>
            <span>Random input</span>
            <strong>ω = {{ selectedPath() }}</strong>
          </div>
          <i>X · fixed mapping</i>
          <div>
            <span>Numeric output</span>
            <strong>X(ω) = {{ selectedValue() }}</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Outcome 隨機；measurement rule 固定</span>
          <p>
            <strong>Random variable 是連接兩個世界的翻譯器。</strong>
            左邊是可能發生的完整結果，右邊是我們想拿來計算與比較的數值。
          </p>
        </div>
      </aside>

      <section class="transfer-check">
        <p class="eyebrow">遷移一下</p>
        <h3>從一副牌抽一張，X =「牌面點數」。X 是 random variable 嗎？</h3>
        <button type="button" (click)="transferOpen.set(!transferOpen())">
          {{ transferOpen() ? '收起判斷' : '揭曉判斷' }}
        </button>
        @if (transferOpen()) {
          <p class="feedback">
            是。每張完整 card outcome 都被固定規則映成數值；J、Q、K
            要如何編碼必須先說清楚，但這不影響 mapping 的角色。
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>符號層：為什麼 random variable 其實是一個 function？</summary>
        <div>
          <p>正式地說，random variable X 是從 sample space 到實數的 function：</p>
          <div class="math-line"><app-math e="X:\\Omega\\to\\mathbb{R}" /></div>
          <p>
            若 ω 代表某個 outcome，X(ω) 就是 machine 對它的輸出。例如 X(HHT)=2。名稱中的 random
            描述輸入 ω 尚未確定，不表示 function X 會臨時改規則。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2RandomVariableMachineComponent {
  readonly paths = ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'];
  readonly prediction = signal<number | null>(null);
  readonly selectedPath = signal('HHT');
  readonly transferOpen = signal(false);
  readonly selectedValue = computed(() => this.countHeads(this.selectedPath()));

  countHeads(path: string): number {
    return [...path].filter((face) => face === 'H').length;
  }

  pathsFor(value: number): string[] {
    return this.paths.filter((path) => this.countHeads(path) === value);
  }
}
