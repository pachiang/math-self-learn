import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k > n - k) k = n - k;
  let c = 1;
  for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1);
  return c;
}
function binomialPMF(n: number, p: number, k: number): number {
  return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

@Component({
  selector: 'app-prob-ch3-binomial',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Bernoulli & Binomial" subtitle="§3.2">
      <h4>Bernoulli(p)</h4>
      <p>
        最簡單的隨機變數：只有兩個可能值 0 或 1。
        <code>P(X=1) = p</code>, <code>P(X=0) = 1−p</code>。
      </p>
      <ul class="props">
        <li>E[X] = p</li>
        <li>Var(X) = p(1−p)</li>
      </ul>
      <p>
        所有「是/否」實驗的原型：拋硬幣、點擊/不點擊、成功/失敗、治癒/未治癒。
      </p>

      <h4>Binomial(n, p) = n 個 Bernoulli 的和</h4>
      <p>
        n 次<strong>獨立</strong>、<strong>同分佈</strong>的 Bernoulli 加起來，
        數出有幾次成功。這是 Binomial 分佈：
      </p>
      <div class="centered-eq big">
        P(X = k) = C(n, k) · pᵏ · (1−p)ⁿ⁻ᵏ
      </div>
      <p>
        解讀：「挑 k 個成功位置」(C(n,k)) × 「這 k 個都成功」(pᵏ) × 「其餘 n−k 個都失敗」((1−p)ⁿ⁻ᵏ)。
      </p>
      <ul class="props">
        <li>E[X] = n·p</li>
        <li>Var(X) = n·p(1−p)</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="互動：調整 n 和 p，觀察 Binomial 分佈形狀">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">試驗次數 n</span>
          <input type="range" min="1" max="50" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">成功率 p</span>
          <input type="range" min="0" max="1" step="0.01" [value]="p()"
            (input)="p.set(+$any($event).target.value)" />
          <span class="sl-val">{{ p().toFixed(2) }}</span>
        </div>
        <div class="presets">
          <button class="pre" (click)="setCase(10, 0.5)">公平硬幣 n=10</button>
          <button class="pre" (click)="setCase(20, 0.3)">n=20 p=0.3</button>
          <button class="pre" (click)="setCase(50, 0.1)">稀有事件 n=50 p=0.1</button>
        </div>
      </div>

      <div class="pmf-plot">
        <div class="pmf-title">Binomial({{ n() }}, {{ p().toFixed(2) }}) 的 PMF</div>
        <svg viewBox="-10 -170 420 210" class="pmf-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-165" x2="0" y2="35" stroke="var(--border-strong)" stroke-width="1" />

          @for (b of bars(); track b.k) {
            <rect [attr.x]="b.x - b.w/2" [attr.y]="-b.h"
              [attr.width]="b.w" [attr.height]="b.h"
              fill="var(--accent)" opacity="0.8" />
          }
          <!-- Mean marker -->
          <line [attr.x1]="meanX()" y1="-165" [attr.x2]="meanX()" y2="30"
            stroke="#5ca878" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.8" />
          <text [attr.x]="meanX()" y="28" class="tk mean" text-anchor="middle">μ = np = {{ (n() * p()).toFixed(2) }}</text>
        </svg>
      </div>

      <div class="stats-row">
        <div class="stat">
          <div class="s-lab">E[X] = np</div>
          <div class="s-val">{{ (n() * p()).toFixed(3) }}</div>
        </div>
        <div class="stat">
          <div class="s-lab">Var(X) = np(1−p)</div>
          <div class="s-val">{{ (n() * p() * (1 - p())).toFixed(3) }}</div>
        </div>
        <div class="stat">
          <div class="s-lab">標準差 σ</div>
          <div class="s-val">{{ Math.sqrt(n() * p() * (1 - p())).toFixed(3) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>Binomial 的實用場景</h4>
      <div class="app-grid">
        <div class="app">
          <div class="a-name">民調</div>
          <p>1000 人中支持者數量 ~ Binomial(1000, p)，其中 p 是真正支持率。</p>
        </div>
        <div class="app">
          <div class="a-name">品管 / A/B 測試</div>
          <p>100 件中不良品數 ~ Binomial(100, 缺陷率)。</p>
        </div>
        <div class="app">
          <div class="a-name">醫療試驗</div>
          <p>50 位病患中康復數 ~ Binomial(50, 治癒率)。</p>
        </div>
        <div class="app">
          <div class="a-name">體育</div>
          <p>投籃 20 次的進球數 ~ Binomial(20, 命中率)。</p>
        </div>
      </div>

      <h4>對稱 vs 不對稱</h4>
      <ul class="obs">
        <li><strong>p = 0.5</strong>：對稱鐘形，以 n/2 為中心。</li>
        <li><strong>p → 0 或 1</strong>：歪斜（skewed），重心靠邊。</li>
        <li><strong>n 大 + p 中等</strong>：形狀趨近常態分佈——CLT 的前奏（Ch6）。</li>
        <li><strong>n 大 + p 小</strong>：趨近 Poisson 分佈（下一節）。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        Bernoulli 是原子、Binomial 是它的和。
        np 越大分佈越「胖」，p(1−p) 越大變異越大。
        下一節：當 n 大 p 小到「np 固定」時，Binomial 收斂成 Poisson。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .presets { display: flex; gap: 6px; flex-wrap: wrap; }
    .pre { font: inherit; font-size: 11px; padding: 4px 10px; border: 1px solid var(--border); background: var(--bg); border-radius: 12px; cursor: pointer; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .pre:hover { border-color: var(--accent); color: var(--accent); }

    .pmf-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pmf-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pmf-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.mean { fill: #5ca878; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .stat { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .s-lab { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .s-val { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .app-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .app { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .a-name { font-weight: 700; color: var(--accent); font-size: 13px; }
    .app p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .obs { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .obs strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh3BinomialComponent {
  readonly Math = Math;
  readonly n = signal(10);
  readonly p = signal(0.5);

  readonly bars = computed(() => {
    const n = this.n();
    const p = this.p();
    const out: Array<{ k: number; x: number; w: number; h: number }> = [];
    const bar_w = Math.min(30, 360 / (n + 1));
    for (let k = 0; k <= n; k++) {
      const prob = binomialPMF(n, p, k);
      out.push({
        k,
        x: (k / n) * 380 + 10,
        w: bar_w,
        h: prob * 500,
      });
    }
    return out;
  });

  readonly meanX = computed(() => (this.p() * 380) + 10);

  setCase(n: number, p: number) {
    this.n.set(n);
    this.p.set(p);
  }
}
