import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch2-bayes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Bayes 定理：反向推論" subtitle="§2.2">
      <p>
        條件機率 P(B|A) 和 P(A|B) <strong>通常不同</strong>：
      </p>
      <ul class="examples">
        <li>P(濕 | 下雨) ≈ 1（下雨幾乎一定濕）</li>
        <li>P(下雨 | 濕) &lt; 1（濕可能是澆花、灑水車）</li>
      </ul>
      <p>
        Bayes 定理給出兩者之間的橋樑：
      </p>
      <div class="centered-eq big">
        P(A | B) = P(B | A) · P(A) / P(B)
      </div>
      <p>
        把乘法規則 <code>P(A∩B) = P(A)·P(B|A) = P(B)·P(A|B)</code> 移項就得到。
      </p>

      <h4>詞彙</h4>
      <div class="glossary">
        <div class="gl">
          <div class="gl-term">P(A)</div>
          <div class="gl-def">先驗 (prior)</div>
          <div class="gl-note">看到 B 之前對 A 的信念</div>
        </div>
        <div class="gl">
          <div class="gl-term">P(B|A)</div>
          <div class="gl-def">似然 (likelihood)</div>
          <div class="gl-note">若 A 為真，看到 B 的機率</div>
        </div>
        <div class="gl">
          <div class="gl-term">P(A|B)</div>
          <div class="gl-def">後驗 (posterior)</div>
          <div class="gl-note">看到 B 後對 A 的信念</div>
        </div>
        <div class="gl">
          <div class="gl-term">P(B)</div>
          <div class="gl-def">邊際 (evidence)</div>
          <div class="gl-note">歸一化因子</div>
        </div>
      </div>
      <p class="key-idea">
        <strong>Bayes 的魂：</strong>
        後驗 ∝ 先驗 × 似然。
        先驗代表「背景知識」，似然代表「新證據」，乘起來更新信念。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：垃圾郵件過濾器">
      <div class="spam-scenario">
        <div class="scenario-desc">
          <strong>場景：</strong>
          「免費」這個字出現在 80% 的垃圾郵件、5% 的正常郵件。
          假設進信箱的郵件中 <strong>{{ (prior() * 100).toFixed(0) }}%</strong> 是垃圾郵件。
          如果一封郵件含「免費」，它是垃圾郵件的機率？
        </div>

        <div class="ctrl">
          <div class="sl">
            <span class="sl-lab">先驗 P(垃圾)</span>
            <input type="range" min="0.01" max="0.9" step="0.01" [value]="prior()"
              (input)="prior.set(+$any($event).target.value)" />
            <span class="sl-val">{{ (prior() * 100).toFixed(0) }}%</span>
          </div>
          <div class="sl">
            <span class="sl-lab">P(免費|垃圾)</span>
            <input type="range" min="0.1" max="1" step="0.01" [value]="probWordGivenSpam()"
              (input)="probWordGivenSpam.set(+$any($event).target.value)" />
            <span class="sl-val">{{ (probWordGivenSpam() * 100).toFixed(0) }}%</span>
          </div>
          <div class="sl">
            <span class="sl-lab">P(免費|正常)</span>
            <input type="range" min="0" max="0.3" step="0.005" [value]="probWordGivenHam()"
              (input)="probWordGivenHam.set(+$any($event).target.value)" />
            <span class="sl-val">{{ (probWordGivenHam() * 100).toFixed(1) }}%</span>
          </div>
        </div>

        <div class="bayes-table">
          <div class="b-row header">
            <div></div><div>先驗</div><div>似然</div><div>聯合</div>
          </div>
          <div class="b-row">
            <div class="cat spam">垃圾</div>
            <div class="v">{{ prior().toFixed(3) }}</div>
            <div class="v">×&nbsp;{{ probWordGivenSpam().toFixed(3) }}</div>
            <div class="v strong">= {{ (prior() * probWordGivenSpam()).toFixed(4) }}</div>
          </div>
          <div class="b-row">
            <div class="cat ham">正常</div>
            <div class="v">{{ (1 - prior()).toFixed(3) }}</div>
            <div class="v">×&nbsp;{{ probWordGivenHam().toFixed(3) }}</div>
            <div class="v strong">= {{ ((1 - prior()) * probWordGivenHam()).toFixed(4) }}</div>
          </div>
          <div class="b-row sum">
            <div>P(免費) = 聯合和</div>
            <div class="v total" style="grid-column: 2 / 5;">{{ (prior() * probWordGivenSpam() + (1 - prior()) * probWordGivenHam()).toFixed(4) }}</div>
          </div>
        </div>

        <div class="result-big">
          <div class="rb-lab">P(垃圾 | 含「免費」) = 垃圾聯合 / 總聯合</div>
          <div class="rb-val">{{ (posterior() * 100).toFixed(1) }}%</div>
          <div class="rb-bar">
            <div class="rb-bar-fill" [style.width.%]="posterior() * 100"></div>
          </div>
          <p class="rb-note">
            從先驗 {{ (prior() * 100).toFixed(0) }}% 更新到後驗 {{ (posterior() * 100).toFixed(1) }}%——
            <strong>「免費」這個字提供了多少證據？</strong>
            {{ posterior() > prior() ? '提升了信念強度' : '降低了信念強度' }}
            （比率 = {{ (posterior() / Math.max(0.001, prior())).toFixed(2) }}x）。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>更新是可以<em>連續</em>的</h4>
      <p>
        觀察到多個證據 E₁, E₂, ⋯，後驗可以一步步更新：
      </p>
      <div class="centered-eq">
        P(A | E₁) = 先驗·P(E₁|A) / P(E₁)
      </div>
      <div class="centered-eq">
        P(A | E₁, E₂) = P(A|E₁) · P(E₂|A, E₁) / P(E₂|E₁)
      </div>
      <p>
        「昨天的後驗成為今天的先驗」——這是機器學習、科學實驗、股市調倉的核心循環。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Bayes 告訴我們如何<strong>從證據更新信念</strong>。
        先驗 × 似然 ∝ 後驗。
        下一節看這個簡單公式如何戳破醫學檢查的錯覺——<strong>base rate fallacy</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .examples { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }

    .glossary { display: grid; grid-template-columns: 80px 80px 1fr; gap: 6px 12px; margin: 10px 0; }
    .gl { display: contents; }
    .gl-term { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 700; font-size: 14px; }
    .gl-def { font-weight: 700; color: var(--text); font-size: 13px; }
    .gl-note { font-size: 12px; color: var(--text-secondary); }

    .spam-scenario { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .scenario-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 10px; }
    .scenario-desc strong { color: var(--accent); }

    .ctrl { display: grid; gap: 6px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 100px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .bayes-table { display: grid; gap: 2px; padding: 10px; background: var(--bg); border-radius: 8px; }
    .b-row { display: grid; grid-template-columns: 80px 90px 110px 1fr; gap: 6px; align-items: center; font-size: 13px; padding: 4px; }
    .b-row.header { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
    .b-row.sum { border-top: 1px solid var(--border); margin-top: 4px; padding-top: 8px; }
    .cat { padding: 3px 8px; border-radius: 12px; text-align: center; font-weight: 700; font-size: 11px; }
    .cat.spam { background: rgba(200, 123, 94, 0.18); color: #c87b5e; }
    .cat.ham { background: rgba(92, 168, 120, 0.18); color: #5ca878; }
    .v { font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
    .v.strong { color: var(--accent); font-weight: 700; }
    .v.total { text-align: center; color: var(--accent); font-weight: 700; font-size: 15px; }

    .result-big { margin-top: 10px; padding: 14px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 10px; text-align: center; }
    .rb-lab { font-size: 11px; color: var(--text-muted); }
    .rb-val { font-size: 32px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .rb-bar { height: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 5px; overflow: hidden; margin-bottom: 8px; }
    .rb-bar-fill { height: 100%; background: var(--accent); transition: width 0.12s ease; }
    .rb-note { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; text-align: left; }
    .rb-note strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh2BayesComponent {
  readonly Math = Math;
  readonly prior = signal(0.3);
  readonly probWordGivenSpam = signal(0.8);
  readonly probWordGivenHam = signal(0.05);

  readonly posterior = computed(() => {
    const p = this.prior();
    const lS = this.probWordGivenSpam();
    const lH = this.probWordGivenHam();
    const num = p * lS;
    const denom = num + (1 - p) * lH;
    return denom === 0 ? 0 : num / denom;
  });
}
