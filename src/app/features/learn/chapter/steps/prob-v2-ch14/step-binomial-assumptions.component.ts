import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type ScenarioKey = 'valid' | 'changing' | 'shared' | 'early' | 'multiple';

interface Scenario {
  key: ScenarioKey;
  label: string;
  title: string;
  description: string;
  broken: string[];
  consequence: string;
}

@Component({
  selector: 'app-prob-v2-binomial-assumptions',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch14">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 14.5</p>
        <h2>同樣輸出一個 count，不代表背後就是 Binomial</h2>
        <p class="lede">
          Distribution 是生成世界的模型，不是資料欄位的名稱。先檢查四條電路，再決定能不能使用
          Binomial。
        </p>
      </header>

      <section class="assumption-tabs" role="tablist" aria-label="切換生成情境">
        @for (item of scenarios; track item.key) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="scenario() === item.key"
            [class.active]="scenario() === item.key"
            (click)="scenario.set(item.key)"
          >
            {{ item.label }}
          </button>
        }
      </section>

      <section class="assumption-console">
        <div class="assumption-story">
          <span class="card-label">GENERATING STORY</span>
          <h3>{{ current().title }}</h3>
          <p>{{ current().description }}</p>
          <div class="mini-trials" [class.correlated]="scenario() === 'shared'">
            @for (trial of trialLabels(); track $index) {
              <div
                [class.changed]="scenario() === 'changing'"
                [class.stopped]="scenario() === 'early' && $index > 2"
              >
                <small>trial {{ $index + 1 }}</small
                ><strong>{{ trial }}</strong>
              </div>
            }
          </div>
          <p class="consequence"><strong>後果：</strong>{{ current().consequence }}</p>
        </div>

        <div class="assumption-circuit">
          <span class="card-label">BINOMIAL CHECK</span>
          @for (condition of conditions; track condition.id) {
            <div [class.off]="isBroken(condition.id)">
              <i>{{ isBroken(condition.id) ? '×' : '✓' }}</i>
              <span
                ><strong>{{ condition.title }}</strong
                ><small>{{ condition.caption }}</small></span
              >
            </div>
          }
          <p [class.valid]="current().broken.length === 0">
            {{
              current().broken.length === 0
                ? 'Circuit complete：Binomial model fits.'
                : 'Circuit broken：do not auto-fit Binomial.'
            }}
          </p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="assumption-core" aria-hidden="true">
          <span>count data</span><i>≠</i><strong>Binomial mechanism</strong>
        </div>
        <div>
          <span class="card-label">先問世界如何生成，再挑 distribution</span>
          <p>
            <strong>固定 n、binary、same p、independent，四者缺一都要重新建模。</strong>
            不是看到「成功幾次」就尋找公式。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>旁支地圖：條件失效後可能走向哪裡？</summary>
        <div class="binary-formulas">
          <p>
            Unequal p 會走向 Poisson-binomial；不放回抽樣常走向 hypergeometric；提早停止則改變
            random quantity，下一節就會看到 Geometric。
          </p>
          <app-math
            e="X_i\\overset{\\text{iid}}{\\sim}\\operatorname{Bernoulli}(p)\\quad\\Longrightarrow\\quad \\sum_iX_i\\sim\\operatorname{Binomial}(n,p)"
          />
        </div>
      </details>
    </article>
  `,
})
export class ProbV2BinomialAssumptionsComponent {
  readonly scenario = signal<ScenarioKey>('valid');
  readonly conditions = [
    { id: 'fixed', title: 'Fixed n', caption: 'trial 數事前固定' },
    { id: 'binary', title: 'Binary outcome', caption: '每次只問 target／not target' },
    { id: 'same', title: 'Same p', caption: '每次 success chance 相同' },
    { id: 'independent', title: 'Independent', caption: '一次結果不改變另一次機會' },
  ];
  readonly scenarios: Scenario[] = [
    {
      key: 'valid',
      label: 'Stable trials',
      title: '固定做 5 筆、每筆條件相同且互不影響',
      description: '每一筆都只記成功／失敗，success chance 固定為 60%。',
      broken: [],
      consequence: '完整符合 Binomial 的生成條件。',
    },
    {
      key: 'changing',
      label: 'Changing p',
      title: '尖峰逐漸塞車，付款成功率一路下降',
      description: '五筆仍是 binary，但每一筆面對的 success chance 不同。',
      broken: ['same'],
      consequence: '相同 count buckets 內的 paths 不再等重。',
    },
    {
      key: 'shared',
      label: 'Shared outage',
      title: '同一場 outage 同時影響所有付款',
      description: '一筆失敗提供了其他筆也可能失敗的新資訊。',
      broken: ['independent'],
      consequence: '結果會成群出現，不能把 path weight 拆成相同乘積。',
    },
    {
      key: 'early',
      label: 'Stop early',
      title: '一成功就停止 retry',
      description: '最多顯示五格，但真正做幾次由 outcome 決定。',
      broken: ['fixed'],
      consequence: 'random quantity 已從 success count 改成等待時間。',
    },
    {
      key: 'multiple',
      label: '3 outcomes',
      title: '每筆可能成功、失敗或仍在處理',
      description: '單次 trial 不再只有 target 與其 complement 兩種狀態。',
      broken: ['binary'],
      consequence: '需要保留第三類結果，不能直接用 Bernoulli encoding。',
    },
  ];
  readonly current = computed(() => this.scenarios.find((item) => item.key === this.scenario())!);
  readonly trialLabels = computed(() => {
    if (this.scenario() === 'changing') return ['80%', '70%', '60%', '50%', '40%'];
    if (this.scenario() === 'early') return ['0', '0', '1 STOP', '—', '—'];
    if (this.scenario() === 'multiple') return ['1', '0', '…', '1', '…'];
    return ['60%', '60%', '60%', '60%', '60%'];
  });

  isBroken(id: string): boolean {
    return this.current().broken.includes(id);
  }
}
