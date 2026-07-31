import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type Strategy = 'direct' | 'complement';

interface Scenario {
  id: string;
  short: string;
  title: string;
  direct: number[];
  complement: number[];
  recommended: Strategy;
  explanation: string;
}

@Component({
  selector: 'app-prob-v2-strategy-choice',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch7">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 7.4</p>
        <h2>Complement 不是關鍵字反射，而是一個成本選擇</h2>
        <p class="lede">
          同一個 event 永遠可以從正面或反面描述。好的策略不是「一定用
          complement」，而是先比較：<strong>哪一邊需要追蹤的 cases 更少、更規則？</strong>
        </p>
      </header>

      <section class="scene">
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Strategy lab · n = 6</p>
            <h3>選一題，再決定從哪一面進去</h3>
          </div>
          <p>
            下方先用 success count categories 當作描述成本；它是有用的 heuristic，不是萬用定理。
          </p>
        </div>
        <div class="scenario-tabs" role="tablist" aria-label="選擇機率情境">
          @for (item of scenarios; track item.id) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="scenario().id === item.id"
              [class.active]="scenario().id === item.id"
              (click)="selectScenario(item)"
            >
              <strong>{{ item.title }}</strong>
              <span>{{ item.short }}</span>
            </button>
          }
        </div>
      </section>

      <section class="strategy-board">
        <button
          type="button"
          class="strategy-option"
          [class.selected]="choice() === 'direct'"
          [class.recommended]="choice() !== null && scenario().recommended === 'direct'"
          (click)="choice.set('direct')"
        >
          <span>DIRECT DESCRIPTION</span>
          <h3>直接列 event 內的 count categories</h3>
          <div class="category-row" aria-label="直接描述包含的成功次數">
            @for (count of scenario().direct; track count) {
              <i>X={{ count }}</i>
            }
          </div>
          <div class="cost-meter" aria-hidden="true">
            <div [style.width.%]="costPercent(scenario().direct.length)"></div>
          </div>
          <p>描述成本：{{ scenario().direct.length }} 個 categories</p>
        </button>

        <button
          type="button"
          class="strategy-option"
          [class.selected]="choice() === 'complement'"
          [class.recommended]="choice() !== null && scenario().recommended === 'complement'"
          (click)="choice.set('complement')"
        >
          <span>COMPLEMENT DESCRIPTION</span>
          <h3>先列 event 沒發生時的 count categories</h3>
          <div class="category-row" aria-label="補事件包含的成功次數">
            @for (count of scenario().complement; track count) {
              <i>X={{ count }}</i>
            }
          </div>
          <div class="cost-meter" aria-hidden="true">
            <div [style.width.%]="costPercent(scenario().complement.length)"></div>
          </div>
          <p>描述成本：{{ scenario().complement.length }} 個 categories，再從 1 扣除</p>
        </button>
      </section>

      @if (choice() !== null) {
        <section class="strategy-feedback" aria-live="polite">
          @if (choice() === scenario().recommended) {
            <strong>這次入口選得好。</strong>
          } @else {
            <strong>這條路仍然算得出來，但要管理更多 cases。</strong>
          }
          {{ scenario().explanation }}
        </section>
      }

      <section class="direction-map">
        <div class="direction-card">
          <span>At least one</span>
          <strong>反面只剩 X=0</strong>
        </div>
        <div class="direction-card">
          <span>Exactly two</span>
          <strong>正面只剩 X=2</strong>
        </div>
        <div class="direction-card">
          <span>Ask before calculating</span>
          <strong>哪一面更有結構？</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="flip-map" aria-hidden="true">
          <div>
            <span>Event side</span>
            <strong>{{ scenario().direct.length }} categories</strong>
          </div>
          <i>compare structure</i>
          <div>
            <span>Complement side</span>
            <strong>{{ scenario().complement.length }} categories</strong>
          </div>
        </div>
        <div>
          <span class="card-label">先比較描述成本，再選計算入口</span>
          <p>
            <strong>「至少一次」常適合 complement，但不是因為那四個字有魔法。</strong>
            真正原因是「零次」經常比「一次、兩次、……」更容易描述；若正面本來就只有一類，直接算更清楚。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：exactly two 為何通常直接算？</summary>
        <div>
          <p>
            在 6 次固定成功率 p 的 independent trials 中，exactly two 只需選出兩個 success
            positions；其 probability 是：
          </p>
          <div class="math-line">
            <app-math e="P(X=2)=\\binom{6}{2}p^2(1-p)^4" />
          </div>
          <p>
            反面卻包含 X=0,1,3,4,5,6 六類。這個公式是 binomial model 的預告；本節只要求會先選清楚
            event side，不要求背公式。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2StrategyChoiceComponent {
  readonly scenarios: Scenario[] = [
    {
      id: 'at-least-one',
      short: 'at least one success',
      title: '至少一次成功',
      direct: [1, 2, 3, 4, 5, 6],
      complement: [0],
      recommended: 'complement',
      explanation: '反面「零次成功」只有一類；先算 all-failure，再從 1 扣除最省。',
    },
    {
      id: 'exactly-two',
      short: 'exactly two successes',
      title: '剛好兩次成功',
      direct: [2],
      complement: [0, 1, 3, 4, 5, 6],
      recommended: 'direct',
      explanation: '正面只有 X=2 一類，反面反而碎成六類；這次直接描述 event 比較乾淨。',
    },
    {
      id: 'at-most-four',
      short: 'at most four successes',
      title: '至多四次成功',
      direct: [0, 1, 2, 3, 4],
      complement: [5, 6],
      recommended: 'complement',
      explanation: '反面「五次或六次成功」只有兩類，比直接管理 X=0 到 4 更短。',
    },
  ];

  readonly scenario = signal(this.scenarios[0]);
  readonly choice = signal<Strategy | null>(null);

  selectScenario(scenario: Scenario): void {
    this.scenario.set(scenario);
    this.choice.set(null);
  }

  costPercent(cost: number): number {
    return (cost / 6) * 100;
  }
}
