import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type EventPreset = 'even' | 'greater-than-four' | 'empty' | 'all' | 'custom';

@Component({
  selector: 'app-prob-v2-events-as-regions',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 2.3</p>
        <h2>Event 不是新結果，而是替世界畫一個圈</h2>
        <p class="lede">
          樣本空間（sample space）已經收集所有完整 outcomes。
          事件（event）只是從同一個世界裡，圈出我們此刻關心的那一群結果。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">同一張骰子地圖，不同圈法</p>
            <h3>切換 event，看看世界本身有沒有改變</h3>
          </div>
          <p>你也可以直接點擊格子，自行建立 event。 藍色六格永遠是 Ω；紅色外框才是目前的 A。</p>
        </div>

        <div class="preset-row" role="group" aria-label="選擇事件">
          <button type="button" [class.active]="preset() === 'even'" (click)="applyPreset('even')">
            A：骰到偶數
          </button>
          <button
            type="button"
            [class.active]="preset() === 'greater-than-four'"
            (click)="applyPreset('greater-than-four')"
          >
            A：骰到大於 4
          </button>
          <button
            type="button"
            [class.active]="preset() === 'empty'"
            (click)="applyPreset('empty')"
          >
            A：骰到 7
          </button>
          <button type="button" [class.active]="preset() === 'all'" (click)="applyPreset('all')">
            A：骰到 1～6
          </button>
        </div>

        <div class="event-builder">
          <div class="dice-world" aria-label="骰子的樣本空間">
            @for (value of outcomes; track value) {
              <button
                type="button"
                [class.selected]="selectedValues().has(value)"
                [attr.aria-pressed]="selectedValues().has(value)"
                [attr.aria-label]="
                  '結果 ' +
                  value +
                  (selectedValues().has(value) ? '，目前屬於事件 A' : '，目前不屬於事件 A')
                "
                (click)="toggleValue(value)"
              >
                {{ value }}
              </button>
            }
          </div>

          <div class="event-readout">
            <div>
              <span class="card-label">目前圈出的 EVENT</span>
              <div class="event-name">{{ eventName() }}</div>
            </div>
            <div class="set-display">{{ eventNotation() }}</div>
            <div class="event-status">
              <span>A 中有 {{ selectedValues().size }} 個 outcomes</span>
              <strong>{{ specialStatus() }}</strong>
            </div>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="map-metaphor" aria-hidden="true">
          <div class="map-symbol">
            <div class="map"></div>
            <span>sample space<br />整張地圖</span>
          </div>
          <span class="map-arrow">→</span>
          <div class="map-symbol">
            <div class="point"></div>
            <span>outcome<br />一個位置</span>
          </div>
          <span class="map-arrow">→</span>
          <div class="map-symbol">
            <div class="region"></div>
            <span>event<br />圈出的區域</span>
          </div>
        </div>
        <div>
          <span class="card-label">帶走這張地圖</span>
          <p>
            <strong>sample space 是整張地圖，outcome 是一個位置，event 是被圈出的區域。</strong>
            event 裡沒有新的東西；它的每一個元素都必須來自 Ω。
          </p>
        </div>
      </aside>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Event 可以有多大？</p>
            <h3>從一個 outcome，到零個或全部都可以</h3>
          </div>
          <p>
            「event 是一群 outcomes」不代表它至少要有兩個。 subset 可以只含一點，也可以什麼都不含。
          </p>
        </div>

        <div class="classification">
          <button type="button" (click)="setExact([4], 'A：剛好骰到 4')">
            <span>ONE OUTCOME</span>
            <strong>A = {{ '{4}' }}</strong>
          </button>
          <button type="button" (click)="applyPreset('empty')">
            <span>IMPOSSIBLE EVENT</span>
            <strong>A = ∅</strong>
          </button>
          <button type="button" (click)="applyPreset('all')">
            <span>CERTAIN EVENT</span>
            <strong>A = Ω</strong>
          </button>
        </div>
      </section>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">找出不合法的 event</p>
            <h3>在六面骰 experiment 中，哪一個集合不能直接當 event？</h3>
          </div>
          <p>判斷方式只有一個：集合裡是否出現不屬於 Ω 的元素？</p>
        </div>
        <div class="choice-row" role="group" aria-label="選擇不合法的事件">
          @for (choice of invalidChoices; track choice.label) {
            <button
              type="button"
              [class.selected]="invalidAnswer() === choice.label"
              (click)="invalidAnswer.set(choice.label)"
            >
              {{ choice.label }}
            </button>
          }
        </div>
        @if (invalidAnswer()) {
          <p class="feedback" aria-live="polite">
            @if (invalidAnswer() === '{2, 4, 7}') {
              <strong>對。</strong>7 不在 Ω = {{ '{1,2,3,4,5,6}' }} 裡， 所以
              {{ '{2,4,7}' }} 不是這個 experiment 的 event。 若想描述「骰到 7」，符合的 outcomes
              一個也沒有，應寫成 ∅。
            } @else {
              這仍是合法 event。event 可以只有一點、沒有點，或包含全部 outcomes。
            }
          </p>
        }
      </section>

      <details class="deep-dive">
        <summary>符號層：event 是 sample space 的 subset</summary>
        <div>
          <p>正式地說，event A 必須滿足：</p>
          <div class="math-line">
            <app-math e="A subseteq Omega" />
          </div>
          <p>
            impossible event 是空集合 <app-math e="arnothing" />； certain event 則是 Ω
            本身。兩者都是合法 events：
          </p>
          <div class="math-line">
            <app-math e="arnothing subseteq Omega quad	ext{and}quad Omega subseteq Omega" />
          </div>
          <p>
            在有限、離散的 sample space 中，Ω 的每個 subset 都可以當 event。
            更一般的連續情況會限制在一個 σ-algebra 裡；這個技術細節留到測度論路線。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2EventsAsRegionsComponent {
  readonly outcomes = [1, 2, 3, 4, 5, 6] as const;
  readonly invalidChoices = [
    { label: '{4}' },
    { label: '∅' },
    { label: '{2, 4, 7}' },
    { label: '{1, 2, 3, 4, 5, 6}' },
  ];

  readonly preset = signal<EventPreset>('even');
  readonly selectedValues = signal<Set<number>>(new Set([2, 4, 6]));
  readonly customName = signal('A：自行圈選');
  readonly invalidAnswer = signal<string | null>(null);

  readonly eventName = computed(() => {
    switch (this.preset()) {
      case 'even':
        return 'A：骰到偶數';
      case 'greater-than-four':
        return 'A：骰到大於 4';
      case 'empty':
        return 'A：骰到 7';
      case 'all':
        return 'A：骰到 1～6';
      default:
        return this.customName();
    }
  });

  readonly eventNotation = computed(() => {
    const values = [...this.selectedValues()].sort((a, b) => a - b);
    return values.length === 0 ? 'A = ∅' : `A = {${values.join(', ')}}`;
  });

  readonly specialStatus = computed(() => {
    const size = this.selectedValues().size;
    if (size === 0) return 'impossible event';
    if (size === this.outcomes.length) return 'certain event';
    if (size === 1) return 'single-outcome event';
    return 'event';
  });

  applyPreset(preset: Exclude<EventPreset, 'custom'>): void {
    this.preset.set(preset);
    switch (preset) {
      case 'even':
        this.selectedValues.set(new Set([2, 4, 6]));
        break;
      case 'greater-than-four':
        this.selectedValues.set(new Set([5, 6]));
        break;
      case 'empty':
        this.selectedValues.set(new Set());
        break;
      case 'all':
        this.selectedValues.set(new Set(this.outcomes));
        break;
    }
  }

  toggleValue(value: number): void {
    const next = new Set(this.selectedValues());
    next.has(value) ? next.delete(value) : next.add(value);
    this.preset.set('custom');
    this.customName.set('A：自行圈選');
    this.selectedValues.set(next);
  }

  setExact(values: number[], name: string): void {
    this.preset.set('custom');
    this.customName.set(name);
    this.selectedValues.set(new Set(values));
  }
}
