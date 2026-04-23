import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch2-base-rate',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Base Rate 謬誤：醫學檢查的錯覺" subtitle="§2.3">
      <p>
        一個罕見病影響 1% 的人。檢查「準確度 99%」（罹病者 99% 測陽、健康者 99% 測陰）。
        <strong>你剛測陽——你真罹病的機率是多少？</strong>
      </p>
      <p class="key-idea">
        直覺常說：99%。但 Bayes 給的正確答案讓大多數人震驚：<strong>50% 而已</strong>。
        理由：「罕見病」的先驗如此小，即使「高準確度」也會被大量健康者的 1% 偽陽擠掉。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="滑動患病率和檢查準確度：看後驗怎麼變">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">患病率 P(D)</span>
          <input type="range" min="0.001" max="0.5" step="0.001" [value]="prevalence()"
            (input)="prevalence.set(+$any($event).target.value)" />
          <span class="sl-val">{{ (prevalence() * 100).toFixed(2) }}%</span>
        </div>
        <div class="sl">
          <span class="sl-lab">敏感度 P(+|D)</span>
          <input type="range" min="0.5" max="1" step="0.005" [value]="sensitivity()"
            (input)="sensitivity.set(+$any($event).target.value)" />
          <span class="sl-val">{{ (sensitivity() * 100).toFixed(1) }}%</span>
        </div>
        <div class="sl">
          <span class="sl-lab">特異度 P(−|¬D)</span>
          <input type="range" min="0.5" max="1" step="0.005" [value]="specificity()"
            (input)="specificity.set(+$any($event).target.value)" />
          <span class="sl-val">{{ (specificity() * 100).toFixed(1) }}%</span>
        </div>
      </div>

      <div class="people-viz">
        <div class="pv-title">10000 人視覺化</div>
        <svg viewBox="-10 -10 420 220" class="pv-svg">
          <!-- Background grid of 100x100 people -->
          @for (cell of peopleGrid(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.s" [attr.height]="cell.s"
              [attr.fill]="cell.color" opacity="0.9" />
          }
        </svg>
        <div class="pv-legend">
          <span class="leg"><span class="sw tp"></span>真陽 (病 + 正確)</span>
          <span class="leg"><span class="sw fn"></span>偽陰 (病 + 漏報)</span>
          <span class="leg"><span class="sw fp"></span>偽陽 (健 + 誤報)</span>
          <span class="leg"><span class="sw tn"></span>真陰 (健 + 正確)</span>
        </div>
      </div>

      <div class="counts">
        <div class="c-cell tp"><div class="c-l">真陽</div><div class="c-v">{{ tp() }}</div></div>
        <div class="c-cell fn"><div class="c-l">偽陰</div><div class="c-v">{{ fn() }}</div></div>
        <div class="c-cell fp"><div class="c-l">偽陽</div><div class="c-v">{{ fp() }}</div></div>
        <div class="c-cell tn"><div class="c-l">真陰</div><div class="c-v">{{ tn() }}</div></div>
      </div>

      <div class="result-big">
        <div class="rb-lab">
          測陽後真的罹病的機率 P(D | +) = 真陽 / (真陽 + 偽陽)
        </div>
        <div class="rb-val">{{ (posterior() * 100).toFixed(2) }}%</div>
        <div class="rb-eq">
          = {{ tp() }} / ({{ tp() }} + {{ fp() }})
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>經典啟示</h4>
      <div class="insights">
        <div class="insight">
          <div class="i-num">1</div>
          <div class="i-body">
            <strong>準確度不等於可信度。</strong>
            99% 準確 + 1% 先驗 → 後驗只有 50%。
          </div>
        </div>
        <div class="insight">
          <div class="i-num">2</div>
          <div class="i-body">
            <strong>罕見事件需要極精確的檢查。</strong>
            先驗越小，假陽性越容易淹沒真陽性。這就是為什麼 HIV、癌症篩檢後都要做<strong>確診測試</strong>。
          </div>
        </div>
        <div class="insight">
          <div class="i-num">3</div>
          <div class="i-body">
            <strong>兩次獨立的陽性結果大大提升確信度。</strong>
            先驗 1%、測一次後 50%、這個 50% 成為下一次的「新先驗」，再測一次到 ~99%。
          </div>
        </div>
      </div>

      <h4>社會應用</h4>
      <ul class="apps">
        <li><strong>恐怖份子偵測</strong>：人口 1000 萬、恐怖份子 100、演算法 99% 準——誤判上萬無辜。</li>
        <li><strong>刑事 DNA 比對</strong>：只說「巧合率 1/百萬」不夠，要搭配犯人口池大小。</li>
        <li><strong>測謊</strong>：即便 90% 準，只要說謊者不多，大多數「測謊未通過」也是無辜。</li>
        <li><strong>AI 倫理</strong>：臉部辨識誤判率對少數族群較高——base rate 問題。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        Base rate fallacy 是人類機率直覺最大的盲點。
        遇到「測試結果」或「證據」時，永遠問：<strong>先驗是多少？</strong>
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 100px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .people-viz { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pv-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pv-svg { width: 100%; display: block; }
    .pv-legend { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 6px; font-size: 10px; color: var(--text-muted); }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
    .sw.tp { background: #c87b5e; }
    .sw.fn { background: #ba8d2a; }
    .sw.fp { background: #5a8aa8; }
    .sw.tn { background: rgba(200, 210, 220, 0.5); border: 1px solid var(--border); }

    .counts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .c-cell { padding: 8px; text-align: center; border-radius: 8px; font-size: 12px; }
    .c-cell.tp { background: rgba(200, 123, 94, 0.15); color: #c87b5e; }
    .c-cell.fn { background: rgba(244, 200, 102, 0.15); color: #ba8d2a; }
    .c-cell.fp { background: rgba(90, 138, 168, 0.15); color: #5a8aa8; }
    .c-cell.tn { background: var(--bg-surface); color: var(--text-muted); }
    .c-l { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .c-v { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .result-big { margin-top: 10px; padding: 14px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 10px; text-align: center; }
    .rb-lab { font-size: 12px; color: var(--text-muted); }
    .rb-val { font-size: 34px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .rb-eq { font-size: 13px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .insights { display: grid; gap: 8px; margin: 10px 0; }
    .insight { display: grid; grid-template-columns: 30px 1fr; gap: 10px; align-items: start; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .i-num { width: 24px; height: 24px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
    .i-body { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .i-body strong { color: var(--accent); }

    .apps { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .apps strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh2BaseRateComponent {
  readonly prevalence = signal(0.01);
  readonly sensitivity = signal(0.99);
  readonly specificity = signal(0.99);

  // 10000 people total
  readonly TOTAL = 10000;

  readonly tp = computed(() => Math.round(this.TOTAL * this.prevalence() * this.sensitivity()));
  readonly fn = computed(() => Math.round(this.TOTAL * this.prevalence() * (1 - this.sensitivity())));
  readonly fp = computed(() => Math.round(this.TOTAL * (1 - this.prevalence()) * (1 - this.specificity())));
  readonly tn = computed(() => Math.round(this.TOTAL * (1 - this.prevalence()) * this.specificity()));

  readonly posterior = computed(() => {
    const tp = this.tp();
    const fp = this.fp();
    return tp + fp === 0 ? 0 : tp / (tp + fp);
  });

  readonly peopleGrid = computed(() => {
    const cols = 100;
    const rows = 100;
    const sx = 400 / cols;
    const sy = 200 / rows;
    const cells: Array<{ id: string; x: number; y: number; s: number; color: string }> = [];
    // Assign categories deterministically: first TP, then FN, then FP, then TN (by index)
    const tp = this.tp();
    const fn = this.fn();
    const fp = this.fp();
    for (let idx = 0; idx < this.TOTAL; idx++) {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      let color: string;
      if (idx < tp) color = '#c87b5e';
      else if (idx < tp + fn) color = '#ba8d2a';
      else if (idx < tp + fn + fp) color = '#5a8aa8';
      else color = 'rgba(200, 210, 220, 0.5)';
      cells.push({ id: `${idx}`, x: c * sx, y: r * sy, s: Math.max(sx, sy) + 0.3, color });
    }
    return cells;
  });
}
