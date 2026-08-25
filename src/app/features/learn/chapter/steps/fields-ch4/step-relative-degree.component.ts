import { Component, computed, signal } from '@angular/core';
import { productLabel } from './fields-ch4-model';

interface TopChoice {
  id: string;
  label: string; // 要 adjoin 的東西
  inField: boolean; // 是否已在 ℚ(√2) 內
  relBasis: string[]; // 相對 basis
  note: string;
}

const BOT_BASIS = ['1', '√2'];

const CHOICES: TopChoice[] = [
  { id: 's8', label: '√8', inField: true, relBasis: ['1'], note: '√8 = 2√2，早就在 ℚ(√2) 裡——沒帶進新方向。' },
  { id: 's18', label: '√18', inField: true, relBasis: ['1'], note: '√18 = 3√2，也已在 ℚ(√2) 裡。' },
  { id: 's3', label: '√3', inField: false, relBasis: ['1', '√3'], note: '√3 ∉ ℚ(√2)，是真的新方向。' },
  { id: 's6', label: '√6', inField: false, relBasis: ['1', '√6'], note: '√6 = √2·√3 ∉ ℚ(√2)，也是新方向。' },
];

@Component({
  selector: 'app-fields-ch4-relative-degree',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 4.2</p>
        <h2>每層乘的是「相對於下一層」的次數</h2>
        <p class="lede">
          塔的每一層，乘的是它<strong>相對於正下方那層</strong>的次數——不是相對於最底層 ℚ。如果你 adjoin 的東西<strong>早就在裡面</strong>，
          那一層只乘 <strong>1</strong>，塔沒有長高。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>在 ℚ(√2) 上再 adjoin √8，總維度會變成 2 × 2 = 4 嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'four'" (click)="prediction.set('four')">會，變 4</button>
          <button type="button" [class.active]="prediction() === 'two'" (click)="prediction.set('two')">不會，還是 2</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'four'">
            {{ prediction() === 'two'
              ? '對。√8 = 2√2 已在 ℚ(√2) 裡，這層只乘 1。切下面看 grid 塌成一行。'
              : '陷阱：√8 = 2√2 早就在 ℚ(√2) 裡，沒帶進新方向，維度還是 2。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選要 adjoin 的東西">
        <span class="kicker">在 ℚ(√2) 上再 adjoin</span>
        @for (ch of choices; track ch.id) {
          <button type="button" [class.active]="choice().id === ch.id" (click)="choice.set(ch)">{{ ch.label }}</button>
        }
      </div>

      <section class="stage grid-stage">
        <div class="grid-board">
          <p class="board-scope" [class.is-field]="!choice().inField">
            grid：列 = 基底 1、√2，行 = 相對 basis{{ choice().inField ? '（塌成一行 ×1）' : '（×2）' }}
          </p>
          <div class="basis-grid" [style.grid-template-columns]="'auto repeat(' + cols() + ', 1fr)'" role="table">
            <div class="bg-corner" role="columnheader"></div>
            @for (c of choice().relBasis; track $index) {
              <div class="bg-head col" role="columnheader">{{ c }}</div>
            }
            @for (r of botBasis; track $index) {
              <div class="bg-head row" role="rowheader">{{ r }}</div>
              @for (c of choice().relBasis; track $index) {
                <div class="bg-cell" [class.collapsed]="choice().inField">{{ product(r, c) }}</div>
              }
            }
          </div>
          <p class="collapse-note" [class.blocked]="choice().inField">{{ choice().note }}</p>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">相對次數（over ℚ(√2)）</p>
          <h3>[ ℚ(√2, {{ choice().label }}) : ℚ(√2) ] = {{ relDeg() }}</h3>
          <p>這一層乘的是相對於<strong>正下方 ℚ(√2)</strong> 的次數，{{ relDeg() === 1 ? '＝1，塔沒長高。' : '＝2，塔長高一倍。' }}</p>
          <div class="readout">總維度 [ … : ℚ] = 2 × {{ relDeg() }} = {{ total() }}。</div>
          <p class="evidence-tag">{{ choice().inField ? 'WITNESS：該 adjoin 物已在中間 field 內 → 該層 collapse（×1）' : 'EXAMPLE：帶進新方向 → 該層 ×2' }}</p>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">×1?</span>
        <div>
          <strong>每層乘它相對於正下方那層的次數</strong>
          <span>——加一個已經在裡面的東西，只乘 1，塔不會長高。</span>
        </div>
      </section>

      <details>
        <summary>符號層：相對次數 over 中間 field</summary>
        <p>
          <code>[L:K]</code> 是 <code>L</code> 當作 <strong>中間 field K</strong>（不是最底層 F）上的 vector space 維度。<code>√8 = 2√2</code> 在 ℚ 上次數是 2，
          但在 <strong>ℚ(√2)</strong> 上次數是 1——所以它讓那一層只乘 1。tower law 每一層都用「相對於正下方」的次數相乘。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh4RelativeDegreeComponent {
  readonly botBasis = BOT_BASIS;
  readonly choices = CHOICES;
  readonly choice = signal<TopChoice>(CHOICES[0]);
  readonly prediction = signal<'four' | 'two' | null>(null);

  readonly cols = computed(() => this.choice().relBasis.length);
  readonly relDeg = computed(() => this.choice().relBasis.length);
  readonly total = computed(() => BOT_BASIS.length * this.relDeg());

  product(r: string, c: string): string {
    return productLabel(r, c);
  }
}
