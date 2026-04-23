import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function geomPMF(p: number, k: number): number {
  if (k < 1) return 0;
  return Math.pow(1 - p, k - 1) * p;
}

@Component({
  selector: 'app-prob-ch3-geometric',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Geometric：等到第一次成功" subtitle="§3.4">
      <p>
        反覆做獨立 Bernoulli(p) 實驗，直到第一次成功。
        需要的試驗次數 X ~ <strong>Geometric(p)</strong>。
      </p>
      <div class="centered-eq big">
        P(X = k) = (1−p)<sup>k−1</sup> · p, &nbsp;&nbsp; k = 1, 2, 3, ⋯
      </div>
      <ul class="props">
        <li>E[X] = 1/p （成功率 10% → 平均 10 次）</li>
        <li>Var(X) = (1−p)/p²</li>
      </ul>

      <h4>無記憶性 (Memoryless)</h4>
      <div class="centered-eq">
        P(X &gt; m + n | X &gt; m) = P(X &gt; n)
      </div>
      <p class="key-idea">
        「已經失敗了 m 次」<strong>不改變</strong>我還需等多久的分佈——從頭開始算。
        這跟人類直覺（「這次一定會中了吧？」）完全相反，是<strong>賭徒謬誤</strong>的來源。
        Geometric 是唯一有無記憶性的離散分佈。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：成功率改變時等待分佈">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">成功率 p</span>
          <input type="range" min="0.02" max="0.8" step="0.01" [value]="p()"
            (input)="p.set(+$any($event).target.value)" />
          <span class="sl-val">{{ p().toFixed(2) }}</span>
        </div>
      </div>

      <div class="pmf-plot">
        <div class="pmf-title">Geometric({{ p().toFixed(2) }}) PMF — 首次成功發生在第 k 次</div>
        <svg viewBox="-10 -170 420 210" class="pmf-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-165" x2="0" y2="35" stroke="var(--border-strong)" stroke-width="1" />

          @for (b of bars(); track b.k) {
            <rect [attr.x]="b.x - 6" [attr.y]="-b.h"
              width="10" [attr.height]="b.h"
              fill="var(--accent)" opacity="0.8" />
            @if (b.k % (maxK() > 30 ? 5 : 2) === 0 || b.k === 1) {
              <text [attr.x]="b.x" y="14" class="tk" text-anchor="middle">{{ b.k }}</text>
            }
          }
          <!-- Expected value marker -->
          <line [attr.x1]="expectationPx()" y1="-165" [attr.x2]="expectationPx()" y2="30"
            stroke="#5ca878" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.8" />
          <text [attr.x]="expectationPx()" y="28" class="tk mean" text-anchor="middle">E[X] = 1/p = {{ (1/p()).toFixed(2) }}</text>
        </svg>
      </div>

      <div class="stats-row">
        <div class="stat">
          <div class="s-lab">E[X] = 1/p</div>
          <div class="s-val">{{ (1/p()).toFixed(2) }}</div>
        </div>
        <div class="stat">
          <div class="s-lab">Var(X)</div>
          <div class="s-val">{{ ((1-p())/(p()*p())).toFixed(2) }}</div>
        </div>
        <div class="stat">
          <div class="s-lab">P(X &le; 10)</div>
          <div class="s-val">{{ cdf10().toFixed(3) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>模擬經驗：釣魚連續失敗的耐心</h4>
      <div class="demo">
        <div class="demo-desc">成功率 p = {{ p().toFixed(2) }}。點擊重複試驗。</div>
        <div class="sim-controls">
          <button class="btn" (click)="simulate()">▶ 試一輪（到成功為止）</button>
          <button class="btn" (click)="simulate100()">▶ 重複 100 輪</button>
          <button class="btn reset" (click)="reset()">↻ 重設</button>
        </div>
        <div class="sim-stats">
          <div class="ss">
            <div class="ss-lab">輪數</div>
            <div class="ss-val">{{ rounds() }}</div>
          </div>
          <div class="ss">
            <div class="ss-lab">平均嘗試次數</div>
            <div class="ss-val">{{ avgAttempts().toFixed(2) }}</div>
          </div>
          <div class="ss">
            <div class="ss-lab">理論 E[X] = 1/p</div>
            <div class="ss-val">{{ (1/p()).toFixed(2) }}</div>
          </div>
        </div>
        @if (lastRound().length > 0) {
          <div class="last-round">
            <div class="lr-lab">最後一輪過程：</div>
            <div class="lr-body">
              @for (r of lastRound(); track $index) {
                <span class="att" [class.s]="r">{{ r ? '✓' : '✗' }}</span>
              }
            </div>
          </div>
        }
      </div>

      <h4>Negative Binomial：等到第 r 次成功</h4>
      <div class="centered-eq">
        P(X = k) = C(k−1, r−1) · pʳ · (1−p)ᵏ⁻ʳ, &nbsp; k = r, r+1, ⋯
      </div>
      <p>
        Geometric 是 Negative Binomial 的 r=1 特例。
        總等待時間 = r 個獨立 Geometric 的和，E[X] = r/p。
      </p>

      <h4>本章總結</h4>
      <ol class="summary">
        <li>RV 把結果映射到數字；PMF 列出每值的機率。</li>
        <li><strong>Bernoulli</strong>：一次實驗。<strong>Binomial</strong>：n 次 Bernoulli 的和。</li>
        <li><strong>Poisson</strong>：大量小機率事件的極限。E = Var = λ。</li>
        <li><strong>Geometric</strong>：等第一次成功。無記憶性。</li>
        <li>相互關係：Binomial → Poisson（大 n 小 p）、Geometric → Negative Binomial。</li>
      </ol>

      <div class="next-ch">
        <h4>下一章：連續分佈</h4>
        <p>
          離散分佈講完；下一章換連續版本。
          Uniform、Exponential、Normal、Gamma——機率密度函數 (PDF) 代替 PMF，
          積分代替求和。Ch4 是所有機率論最常用工具的集合。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .pmf-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pmf-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pmf-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.mean { fill: #5ca878; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .stat { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .s-lab { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .s-val { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .demo { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .demo-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
    .sim-controls { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .btn { font: inherit; font-size: 12px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn.reset { background: transparent; color: var(--accent); }

    .sim-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
    .ss { padding: 8px; text-align: center; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; }
    .ss-lab { font-size: 10px; color: var(--text-muted); }
    .ss-val { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .last-round { padding: 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; }
    .lr-lab { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .lr-body { display: flex; gap: 3px; flex-wrap: wrap; }
    .att { display: inline-block; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; background: #c87b5e; color: white; }
    .att.s { background: #5ca878; }

    .summary { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .summary strong { color: var(--accent); }

    .next-ch { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .next-ch p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class ProbCh3GeometricComponent {
  readonly p = signal(0.2);
  readonly rounds = signal(0);
  readonly totalAttempts = signal(0);
  readonly lastRound = signal<boolean[]>([]);

  readonly maxK = computed(() => Math.ceil(6 / this.p()));

  readonly bars = computed(() => {
    const p = this.p();
    const maxK = this.maxK();
    const out: Array<{ k: number; x: number; h: number }> = [];
    for (let k = 1; k <= maxK; k++) {
      const prob = geomPMF(p, k);
      out.push({
        k,
        x: (k / maxK) * 380 + 10,
        h: prob * 400,
      });
    }
    return out;
  });

  readonly expectationPx = computed(() => {
    const mean = 1 / this.p();
    return (mean / this.maxK()) * 380 + 10;
  });

  readonly cdf10 = computed(() => {
    let s = 0;
    for (let k = 1; k <= 10; k++) s += geomPMF(this.p(), k);
    return s;
  });

  readonly avgAttempts = computed(() =>
    this.rounds() === 0 ? 0 : this.totalAttempts() / this.rounds()
  );

  simulate() {
    const rec: boolean[] = [];
    while (true) {
      const s = Math.random() < this.p();
      rec.push(s);
      if (s || rec.length > 200) break;
    }
    this.lastRound.set(rec);
    this.rounds.update(r => r + 1);
    this.totalAttempts.update(t => t + rec.length);
  }

  simulate100() {
    let total = 0;
    let last: boolean[] = [];
    for (let r = 0; r < 100; r++) {
      const rec: boolean[] = [];
      while (true) {
        const s = Math.random() < this.p();
        rec.push(s);
        if (s || rec.length > 200) break;
      }
      total += rec.length;
      last = rec;
    }
    this.rounds.update(r => r + 100);
    this.totalAttempts.update(t => t + total);
    this.lastRound.set(last);
  }

  reset() {
    this.rounds.set(0);
    this.totalAttempts.set(0);
    this.lastRound.set([]);
  }
}
