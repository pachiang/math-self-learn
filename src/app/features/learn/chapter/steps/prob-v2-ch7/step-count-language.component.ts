import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type CountMode = 'at-least' | 'at-most' | 'exactly';

@Component({
  selector: 'app-prob-v2-count-language',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch7">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 7.1</p>
        <h2>至少、至多、剛好，其實是在次數軸上選不同區域</h2>
        <p class="lede">
          <strong>至少（at least）</strong>從門檻向右， <strong>至多（at most）</strong>從門檻向左，
          <strong>剛好（exactly）</strong>只留下門檻本身。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Count language lab</p>
            <h3>先選語意，再拖動總次數 n 與門檻 k</h3>
          </div>
          <div class="preset-row" role="group" aria-label="選擇次數條件">
            <button
              type="button"
              [class.active]="mode() === 'at-least'"
              (click)="mode.set('at-least')"
            >
              至少 k 次
            </button>
            <button
              type="button"
              [class.active]="mode() === 'at-most'"
              (click)="mode.set('at-most')"
            >
              至多 k 次
            </button>
            <button
              type="button"
              [class.active]="mode() === 'exactly'"
              (click)="mode.set('exactly')"
            >
              剛好 k 次
            </button>
          </div>
        </div>
      </section>

      <section class="range-lab">
        <div class="threshold-controls">
          <div class="threshold-control">
            <label for="total-trials">總試驗次數 n</label>
            <input
              id="total-trials"
              type="range"
              min="3"
              max="9"
              [value]="trials()"
              (input)="updateTrials(+$any($event).target.value)"
            />
            <strong>{{ trials() }}</strong>
          </div>
          <div class="threshold-control">
            <label for="threshold">門檻次數 k</label>
            <input
              id="threshold"
              type="range"
              min="0"
              [max]="trials()"
              [value]="threshold()"
              (input)="threshold.set(+$any($event).target.value)"
            />
            <strong>{{ threshold() }}</strong>
          </div>
        </div>

        <div class="language-card">
          <span>{{ modeEnglish() }} · COUNT CONDITION</span>
          <strong>{{ inequality() }}</strong>
          <p>{{ naturalSentence() }}，所以 selected counts 是 {{ selectedLabel() }}。</p>
        </div>
      </section>

      <section>
        <div class="split-heading">
          <div>
            <p class="eyebrow">Count axis · X = success 次數</p>
            <h3>哪些 X 值真的符合這句話？</h3>
          </div>
          <p>0 次也是真實可能的 count；「至多一次」因此同時包含 0 與 1。</p>
        </div>
        <div class="count-axis" aria-label="成功次數 0 到 n 的範圍">
          @for (count of counts(); track count) {
            <div
              class="count-tile"
              [class.selected]="isSelected(count)"
              [class.outside]="!isSelected(count)"
            >
              <strong>{{ count }}</strong>
              <span>{{ count === 1 ? 'success' : 'successes' }}</span>
            </div>
          }
        </div>
      </section>

      <section class="direction-map">
        <div class="direction-card">
          <span>At least k</span>
          <strong>k, k+1, …, n →</strong>
        </div>
        <div class="direction-card">
          <span>At most k</span>
          <strong>← 0, 1, …, k</strong>
        </div>
        <div class="direction-card">
          <span>Exactly k</span>
          <strong>只留 k</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="flip-map" aria-hidden="true">
          <div>
            <span>Natural language</span>
            <strong>{{ modeChinese() }} {{ threshold() }} 次</strong>
          </div>
          <i>→ 在 count axis 畫區域 →</i>
          <div>
            <span>Selected values</span>
            <strong>{{ selectedLabel() }}</strong>
          </div>
        </div>
        <div>
          <span class="card-label">先畫次數範圍，再想怎麼算</span>
          <p>
            <strong>at least、at most、exactly 只是在說 event 包含哪些 count values。</strong>
            把範圍畫對後，才有資格討論直接加總或使用 complement。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：用 inequality 表示 count events</summary>
        <div>
          <p>令 X 表示 n 次試驗中的 success count，則：</p>
          <div class="math-line">
            <app-math
              e="\\text{at least }k:\\{X\\ge k\\},\\quad \\text{at most }k:\\{X\\le k\\},\\quad \\text{exactly }k:\\{X=k\\}"
            />
          </div>
          <p>
            這裡的 X 是把每條完整 S/F path 映射成一個整數的 random variable 雛形； random variable
            的正式概念會在第十一章建立。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2CountLanguageComponent {
  readonly trials = signal(5);
  readonly threshold = signal(2);
  readonly mode = signal<CountMode>('at-most');
  readonly counts = computed(() => Array.from({ length: this.trials() + 1 }, (_, index) => index));
  readonly selectedCounts = computed(() => this.counts().filter((count) => this.isSelected(count)));
  readonly selectedLabel = computed(() => `{${this.selectedCounts().join(', ')}}`);
  readonly modeEnglish = computed(() => {
    const labels: Record<CountMode, string> = {
      'at-least': 'AT LEAST',
      'at-most': 'AT MOST',
      exactly: 'EXACTLY',
    };
    return labels[this.mode()];
  });
  readonly modeChinese = computed(() => {
    const labels: Record<CountMode, string> = {
      'at-least': '至少',
      'at-most': '至多',
      exactly: '剛好',
    };
    return labels[this.mode()];
  });
  readonly inequality = computed(() => {
    const operators: Record<CountMode, string> = {
      'at-least': 'X ≥ k',
      'at-most': 'X ≤ k',
      exactly: 'X = k',
    };
    return `${operators[this.mode()]}  ·  k = ${this.threshold()}`;
  });
  readonly naturalSentence = computed(() => {
    if (this.mode() === 'at-least') return `最低門檻是 ${this.threshold()} 次，更多次也接受`;
    if (this.mode() === 'at-most') return `最高上限是 ${this.threshold()} 次，更少次也接受`;
    return `success count 必須正好停在 ${this.threshold()} 次`;
  });

  isSelected(count: number): boolean {
    if (this.mode() === 'at-least') return count >= this.threshold();
    if (this.mode() === 'at-most') return count <= this.threshold();
    return count === this.threshold();
  }

  updateTrials(value: number): void {
    this.trials.set(value);
    if (this.threshold() > value) this.threshold.set(value);
  }
}
