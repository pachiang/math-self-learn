import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch2-simpson',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Simpson 悖論 & 本章收尾" subtitle="§2.4">
      <p>
        某大學招生被告歧視女性：
        <strong>總錄取率</strong> 男 45%、女 30%。
        但分系看：
      </p>
      <div class="dept-table">
        <div class="row header">
          <div>系</div>
          <div>男生申請</div>
          <div>男生錄取</div>
          <div>女生申請</div>
          <div>女生錄取</div>
        </div>
        <div class="row">
          <div>A（簡單）</div>
          <div>800</div>
          <div>500 (62.5%)</div>
          <div>100</div>
          <div>70 (70%) ✓</div>
        </div>
        <div class="row">
          <div>B（難）</div>
          <div>200</div>
          <div>10 (5%)</div>
          <div>900</div>
          <div>90 (10%) ✓</div>
        </div>
        <div class="row total">
          <div>合計</div>
          <div>1000</div>
          <div>510 (51%)</div>
          <div>1000</div>
          <div>160 (16%)</div>
        </div>
      </div>
      <p class="key-idea">
        <strong>每個系女性錄取率都較高，但整體男性錄取率較高。</strong>
        這就是 Simpson 悖論——<strong>聚合會翻轉結論</strong>。
      </p>
      <p>
        理由：女性大量選擇「難系」，男性大量選擇「簡單系」。
        當聚合時，系的難度混入了性別差異，產生假象歧視。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：調整兩個系的申請分佈">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">男生選系 A 比例</span>
          <input type="range" min="0" max="1" step="0.01" [value]="maleInA()"
            (input)="maleInA.set(+$any($event).target.value)" />
          <span class="sl-val">{{ (maleInA() * 100).toFixed(0) }}%</span>
        </div>
        <div class="sl">
          <span class="sl-lab">女生選系 A 比例</span>
          <input type="range" min="0" max="1" step="0.01" [value]="femaleInA()"
            (input)="femaleInA.set(+$any($event).target.value)" />
          <span class="sl-val">{{ (femaleInA() * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <div class="result-row">
        <div class="side">
          <div class="side-title">系 A 錄取率 70%</div>
          <div class="rates">
            男: {{ (maleInA() * 100).toFixed(0) }}% 申請 × 65% 錄取
          </div>
          <div class="rates">
            女: {{ (femaleInA() * 100).toFixed(0) }}% 申請 × 70% 錄取
          </div>
        </div>
        <div class="side">
          <div class="side-title">系 B 錄取率 10%</div>
          <div class="rates">
            男: {{ ((1 - maleInA()) * 100).toFixed(0) }}% 申請 × 5% 錄取
          </div>
          <div class="rates">
            女: {{ ((1 - femaleInA()) * 100).toFixed(0) }}% 申請 × 10% 錄取
          </div>
        </div>
      </div>

      <div class="summary-rates">
        <div class="sr-row">
          <div class="sr-lab">男生總錄取率</div>
          <div class="sr-val">{{ (maleTotal() * 100).toFixed(1) }}%</div>
        </div>
        <div class="sr-row">
          <div class="sr-lab">女生總錄取率</div>
          <div class="sr-val">{{ (femaleTotal() * 100).toFixed(1) }}%</div>
        </div>
        <div class="sr-row verdict" [attr.data-who]="bigger()">
          <div class="sr-lab">誰「看起來」較高？</div>
          <div class="sr-val">{{ bigger() === 'male' ? '男' : bigger() === 'female' ? '女' : '相等' }}</div>
        </div>
      </div>

      <p class="note">
        每個系女性錄取率都較高。但當男女選系分佈差異大，
        整體錄取率可能翻轉——因為「系的難度」混入了性別變數。
        Simpson 悖論告訴我們：<strong>小心未控制的混淆變數</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>本章總結</h4>
      <ol class="summary">
        <li><strong>條件機率</strong> P(B|A) = P(A∩B)/P(A)——把世界縮到 A 內。</li>
        <li><strong>獨立</strong>：P(A∩B) = P(A)P(B)。要公式成立，不是「感覺無關」。</li>
        <li><strong>Bayes 定理</strong>：後驗 ∝ 先驗 × 似然。連續更新信念的機制。</li>
        <li><strong>Base rate fallacy</strong>：罕見事件下高準確度檢查仍可能大量誤判。</li>
        <li><strong>Simpson 悖論</strong>：聚合能翻轉結論。永遠小心混淆變數。</li>
      </ol>

      <div class="next-ch">
        <h4>下一章：隨機變數</h4>
        <p>
          到目前為止我們只處理「事件」。但實際問題更常出現「<strong>隨機數量</strong>」——
          擲骰和、當天銷售量、迴聲延遲。這叫做<strong>隨機變數</strong>。
          Ch3 引入離散隨機變數和它們的 PMF、PGF、期望值。
          Bernoulli、Binomial、Poisson、Geometric——四大金剛登場。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .dept-table { display: grid; gap: 2px; padding: 10px; background: var(--bg-surface); border-radius: 10px; border: 1px solid var(--border); margin: 10px 0; }
    .row { display: grid; grid-template-columns: 1fr 1fr 1.2fr 1fr 1.2fr; gap: 6px; padding: 6px; font-size: 12px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .row.header { background: var(--accent-10); color: var(--accent); font-weight: 700; font-family: inherit; }
    .row.total { border-top: 2px solid var(--border); margin-top: 4px; padding-top: 8px; font-weight: 700; color: var(--accent); }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 130px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .result-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    @media (max-width: 640px) { .result-row { grid-template-columns: 1fr; } }
    .side { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .side-title { font-weight: 700; color: var(--accent); margin-bottom: 6px; font-size: 13px; text-align: center; }
    .rates { font-size: 12px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; padding: 3px 0; }

    .summary-rates { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; display: grid; gap: 6px; }
    .sr-row { display: grid; grid-template-columns: 1fr auto; gap: 6px; align-items: center; font-size: 13px; }
    .sr-lab { color: var(--text-secondary); }
    .sr-val { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 700; font-size: 15px; }
    .sr-row.verdict { border-top: 1px solid var(--border); margin-top: 4px; padding-top: 8px; }
    .sr-row.verdict[data-who='male'] .sr-val { color: #5a8aa8; }
    .sr-row.verdict[data-who='female'] .sr-val { color: #c87b5e; }

    .note { padding: 12px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .note strong { color: var(--accent); }

    .summary { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .summary strong { color: var(--accent); }

    .next-ch { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .next-ch p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .next-ch strong { color: var(--accent); }
  `,
})
export class ProbCh2SimpsonComponent {
  readonly maleInA = signal(0.8);
  readonly femaleInA = signal(0.1);
  // Dept A: 70% accept, Dept B: 10% accept (men slightly lower than women at each)
  readonly deptA_male = 0.65;
  readonly deptA_female = 0.7;
  readonly deptB_male = 0.05;
  readonly deptB_female = 0.10;

  readonly maleTotal = computed(() =>
    this.maleInA() * this.deptA_male + (1 - this.maleInA()) * this.deptB_male
  );
  readonly femaleTotal = computed(() =>
    this.femaleInA() * this.deptA_female + (1 - this.femaleInA()) * this.deptB_female
  );

  readonly bigger = computed(() => {
    const d = this.maleTotal() - this.femaleTotal();
    if (Math.abs(d) < 0.005) return 'equal';
    return d > 0 ? 'male' : 'female';
  });
}
