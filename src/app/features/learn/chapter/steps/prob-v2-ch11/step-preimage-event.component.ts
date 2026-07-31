import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-preimage-event',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch11">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 11.3</p>
        <h2>一個數值的背後，通常站著一整群 outcomes</h2>
        <p class="lede">
          「X=2」不是原世界裡的一個新 outcome。它指向所有會被 X 映到 2 的完整 paths；這群 outcomes
          稱為數值 2 的 <strong>preimage</strong>，而它本身就是一個 event。
        </p>
      </header>

      <section class="scene">
        <div class="rv-prediction">
          <div>
            <p class="eyebrow">先預測 · X = count H in three tosses</p>
            <h3>事件 X=2 在原 sample space 裡包含幾條完整 paths？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測 X 等於 2 包含幾條路徑">
            @for (choice of [1, 2, 3]; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                {{ choice }} 條
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 3) {
              <strong>對：HHT、HTH、THH。</strong>「兩個 H」可出現在三種不同位置。
            } @else {
              數值只有一個 2，但能產生它的完整 paths 有 HHT、HTH、THH 三條。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Pull a value back to outcome world</p>
            <h3>選擇右邊的 value，看它在左邊喚醒哪個 event</h3>
          </div>
          <div class="value-selector" role="group" aria-label="選擇正面個數">
            @for (value of [0, 1, 2, 3]; track value) {
              <button
                type="button"
                [class.active]="selectedValue() === value"
                (click)="selectedValue.set(value)"
              >
                X={{ value }}
              </button>
            }
          </div>
        </div>
      </section>

      <section class="preimage-board">
        <div class="preimage-world">
          <p class="eyebrow">Outcome world · Ω</p>
          <h3>被框起來的 paths 合在一起才是 event</h3>
          <div class="preimage-paths">
            @for (path of paths; track path) {
              <div [class.selected]="countHeads(path) === selectedValue()">
                <span class="coin-sequence">
                  @for (face of path; track $index) {
                    <i [class.tail]="face === 'T'">{{ face }}</i>
                  }
                </span>
                <small>X={{ countHeads(path) }}</small>
              </div>
            }
          </div>
          <div class="event-brace">
            <span>EVENT IN Ω</span>
            <strong>{{ selectedPaths().join(', ') }}</strong>
          </div>
        </div>

        <div class="flow-funnel" aria-hidden="true">
          <span>{{ selectedCount() }} incoming paths</span>
          <i>→</i>
          <span>merge weights</span>
        </div>

        <div class="bucket-world">
          <p class="eyebrow">Value world</p>
          <h3>不同 paths 匯進同一個 value bucket</h3>
          <div class="bucket-stack">
            @for (value of [3, 2, 1, 0]; track value) {
              <button
                type="button"
                [class.active]="selectedValue() === value"
                (click)="selectedValue.set(value)"
              >
                <strong>{{ value }}</strong>
                <span class="bucket-fill" [style.width.%]="pathCount(value) * 25"></span>
                <small>{{ pathCount(value) }}/8</small>
              </button>
            }
          </div>
          <div class="probability-readout">
            <span>P(X={{ selectedValue() }})</span>
            <strong>{{ selectedCount() }}/8 = {{ selectedPercent() }}</strong>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="rv-core-map compact" aria-hidden="true">
          <div>
            <strong>X={{ selectedValue() }}</strong
            ><span>a value</span>
          </div>
          <i>look backward</i>
          <div>
            <strong>{{ selectedCount() }} paths</strong><span>an event in Ω</span>
          </div>
        </div>
        <div>
          <span class="card-label">Value 在數值世界；event 活在 outcome world</span>
          <p>
            <strong>算 P(X=x) 時，不是替數字 x 憑空配重量。</strong>
            我們把所有通往 x 的原始 outcomes 找回來，再合併它們原本的 probability mass。
          </p>
        </div>
      </aside>

      <section class="transfer-check">
        <p class="eyebrow">遷移一下 · two ordered dice</p>
        <h3>若 S = 兩骰點數和，S=7 的 preimage 有幾個 outcomes？</h3>
        <button type="button" (click)="transferOpen.set(!transferOpen())">
          {{ transferOpen() ? '收起答案' : '顯示 outcomes' }}
        </button>
        @if (transferOpen()) {
          <p class="feedback">
            六個：(1,6)、(2,5)、(3,4)、(4,3)、(5,2)、(6,1)。數字 7 是一個 value，背後有六個 ordered
            outcomes。
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>符號層：preimage 如何變成 P(X=x)？</summary>
        <div>
          <p>數值 x 的 preimage 寫成：</p>
          <div class="math-line">
            <app-math e="\\{\\omega\\in\\Omega:X(\\omega)=x\\}" />
          </div>
          <p>因此 P(X=x) 是這個 event 的 probability：</p>
          <div class="math-line">
            <app-math e="P(X=x)=P\\!\\left(\\{\\omega\\in\\Omega:X(\\omega)=x\\}\\right)" />
          </div>
          <p>
            本例八條 paths 等重，所以可以數 paths。若 outcomes 不等重，就必須加總各自的 probability
            weights，不能只數數量。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2PreimageEventComponent {
  readonly paths = ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'];
  readonly prediction = signal<number | null>(null);
  readonly selectedValue = signal(2);
  readonly transferOpen = signal(false);
  readonly selectedPaths = computed(() =>
    this.paths.filter((path) => this.countHeads(path) === this.selectedValue()),
  );
  readonly selectedCount = computed(() => this.selectedPaths().length);
  readonly selectedPercent = computed(() => `${this.selectedCount() * 12.5}%`);

  countHeads(path: string): number {
    return [...path].filter((face) => face === 'H').length;
  }

  pathCount(value: number): number {
    return this.paths.filter((path) => this.countHeads(path) === value).length;
  }
}
