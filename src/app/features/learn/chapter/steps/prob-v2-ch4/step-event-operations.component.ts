import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type SelectionLens = 'a' | 'b' | 'intersection' | 'union';

@Component({
  selector: 'app-prob-v2-event-operations',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch4">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 4.1</p>
        <h2>同一張可能地圖，可以有不同的選取方式</h2>
        <p class="lede">
          事件的<strong>聯集（union）</strong>選取「至少屬於一邊」；
          <strong>交集（intersection）</strong>只留下「兩邊同時符合」。 outcomes
          沒變，變的是我們觀看世界的 lens。
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">固定 A 與 B，只切換 selection lens</p>
            <h3>A 是偶數；B 是 3 的倍數</h3>
          </div>
          <div class="set-legend" aria-label="事件顏色圖例">
            <span><i></i>A · 偶數</span>
            <span><i class="b"></i>B · 3 的倍數</span>
            <span><i class="both"></i>A 與 B</span>
          </div>
        </div>
        <div class="lens-row" role="group" aria-label="選擇事件操作">
          @for (option of lensOptions; track option.key) {
            <button
              type="button"
              [class.active]="lens() === option.key"
              (click)="lens.set(option.key)"
            >
              <strong>{{ option.symbol }}</strong>
              <span>{{ option.caption }}</span>
            </button>
          }
        </div>
      </section>

      <section class="universe-board">
        <div class="universe-label">
          <span>Sample space Ω</span>
          <span>outcomes 1–12</span>
        </div>
        <div class="outcome-grid" aria-label="1 到 12 的 sample space">
          @for (outcome of outcomes; track outcome) {
            <div
              class="outcome-cell"
              [class.in-a]="inA(outcome)"
              [class.in-b]="inB(outcome)"
              [class.selected]="isSelected(outcome)"
              [class.dimmed]="!isSelected(outcome)"
            >
              <strong>{{ outcome }}</strong>
              <span class="membership" aria-hidden="true">
                @if (inA(outcome)) {
                  <i></i>
                }
                @if (inB(outcome)) {
                  <i class="b"></i>
                }
              </span>
            </div>
          }
        </div>
        <div class="selection-readout">
          <div class="logic-token">
            <span>目前的選取規則</span>
            <strong>{{ currentLens().spoken }}</strong>
          </div>
          <p>
            {{ currentLens().explanation }}
            選中的 event 是 <strong>{{ selectedLabel() }}</strong
            >。
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="logic-translation" aria-hidden="true">
          <div>
            <span>Union · A ∪ B</span>
            <strong>A or B</strong>
          </div>
          <i>vs</i>
          <div>
            <span>Intersection · A ∩ B</span>
            <strong>A and B</strong>
          </div>
        </div>
        <div>
          <span class="card-label">符號是在壓縮選取動作</span>
          <p>
            <strong>union 是把兩個圈合起來；intersection 是只保留兩圈重疊處。</strong>
            它們都只是同一個 sample space 的 subsets，不會創造新的 outcomes。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：如何判斷一個 outcome 是否屬於 union 或 intersection？</summary>
        <div>
          <p>對任意 outcome <app-math e="\\omega\\in\\Omega" />：</p>
          <div class="math-line">
            <app-math e="\\omega\\in A\\cup B\\iff(\\omega\\in A)\\text{ or }(\\omega\\in B)" />
          </div>
          <div class="math-line">
            <app-math e="\\omega\\in A\\cap B\\iff(\\omega\\in A)\\text{ and }(\\omega\\in B)" />
          </div>
          <p>數學中的 or 通常是 inclusive or：同時屬於 A 與 B 的 outcome 仍然屬於 union。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2EventOperationsComponent {
  readonly outcomes = Array.from({ length: 12 }, (_, index) => index + 1);
  readonly lens = signal<SelectionLens>('union');
  readonly lensOptions: Array<{ key: SelectionLens; symbol: string; caption: string }> = [
    { key: 'a', symbol: 'A', caption: '只看偶數' },
    { key: 'b', symbol: 'B', caption: '只看 3 的倍數' },
    { key: 'intersection', symbol: 'A ∩ B', caption: 'A 且 B' },
    { key: 'union', symbol: 'A ∪ B', caption: 'A 或 B' },
  ];
  readonly currentLens = computed(() => {
    const descriptions: Record<SelectionLens, { spoken: string; explanation: string }> = {
      a: { spoken: 'A：偶數', explanation: '只套用 A 的 membership 規則。' },
      b: { spoken: 'B：3 的倍數', explanation: '只套用 B 的 membership 規則。' },
      intersection: {
        spoken: 'A and B：同時符合',
        explanation: '必須同時是偶數和 3 的倍數，因此其實是在找 6 的倍數。',
      },
      union: {
        spoken: 'A or B：至少符合一邊',
        explanation: '符合 A、符合 B、或兩者都符合的 outcomes 全部保留。',
      },
    };
    return descriptions[this.lens()];
  });
  readonly selectedOutcomes = computed(() =>
    this.outcomes.filter((outcome) => this.isSelected(outcome)),
  );
  readonly selectedLabel = computed(() => `{${this.selectedOutcomes().join(', ')}}`);

  inA(outcome: number): boolean {
    return outcome % 2 === 0;
  }

  inB(outcome: number): boolean {
    return outcome % 3 === 0;
  }

  isSelected(outcome: number): boolean {
    const inA = this.inA(outcome);
    const inB = this.inB(outcome);
    if (this.lens() === 'a') return inA;
    if (this.lens() === 'b') return inB;
    if (this.lens() === 'intersection') return inA && inB;
    return inA || inB;
  }
}
