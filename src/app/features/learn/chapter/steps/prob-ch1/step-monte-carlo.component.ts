import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch1-monte-carlo',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Monte Carlo：用隨機算精確" subtitle="§1.4">
      <p>
        有些機率 / 積分難以解析計算——但容易<strong>模擬</strong>：
        大量隨機試驗 → 統計比例 → 逼近真值。
        這就是<strong>Monte Carlo 方法</strong>，名字來自摩納哥賭場。
      </p>
      <p class="key-idea">
        核心靈感：若 P(事件) = p，擲 N 次有 Nₐ 次發生，則 Nₐ/N → p（大數法則）。
        N 越大估計越準，誤差 ~ 1/√N。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="估 π：在單位正方形裡丟點，看多少落在 1/4 圓內">
      <div class="mc-visual">
        <svg viewBox="-10 -10 220 220" class="mc-svg">
          <rect x="0" y="0" width="200" height="200" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1.5" />
          <!-- Quarter circle -->
          <path d="M 0 200 A 200 200 0 0 0 200 0 L 200 200 Z" fill="rgba(92, 168, 120, 0.08)" />
          <path d="M 0 200 A 200 200 0 0 0 200 0" fill="none" stroke="#5ca878" stroke-width="1.5" />

          <!-- Points -->
          @for (p of points(); track $index) {
            <circle [attr.cx]="p.x * 200" [attr.cy]="(1 - p.y) * 200" r="1.5"
              [attr.fill]="p.inside ? '#5ca878' : '#c87b5e'"
              opacity="0.7" />
          }
        </svg>
      </div>

      <div class="mc-stats">
        <div class="mc-stat">
          <div class="ms-lab">總點數</div>
          <div class="ms-val">{{ nTotal() }}</div>
        </div>
        <div class="mc-stat">
          <div class="ms-lab">在 1/4 圓內</div>
          <div class="ms-val" style="color:#5ca878;">{{ nInside() }}</div>
        </div>
        <div class="mc-stat big">
          <div class="ms-lab">π ≈ 4 × 比例</div>
          <div class="ms-val">{{ piEstimate().toFixed(5) }}</div>
        </div>
        <div class="mc-stat">
          <div class="ms-lab">誤差</div>
          <div class="ms-val">{{ Math.abs(piEstimate() - Math.PI).toFixed(5) }}</div>
        </div>
      </div>

      <div class="ctrl">
        <button class="btn" (click)="flipMany(1)">+ 1 點</button>
        <button class="btn" (click)="flipMany(100)">+ 100 點</button>
        <button class="btn" (click)="flipMany(1000)">+ 1000 點</button>
        <button class="btn" (click)="toggleAnim()">{{ playing() ? '⏸ 停' : '▶ 連續加' }}</button>
        <button class="btn reset" (click)="reset()">↻ 重設</button>
      </div>

      <div class="error-plot">
        <div class="ep-title">誤差 vs 點數（對數尺度）</div>
        <svg viewBox="-20 -90 420 140" class="e-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-85" x2="0" y2="15" stroke="var(--border-strong)" stroke-width="1" />
          <!-- Reference 1/sqrt(N) curve -->
          <path [attr.d]="refPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.6" />
          <!-- Actual error -->
          <path [attr.d]="errorPath()" fill="none" stroke="var(--accent)" stroke-width="1.8" />
          <text x="404" y="4" class="tk">N</text>
          <text x="-4" y="-82" class="tk" text-anchor="end">log 誤差</text>
        </svg>
        <div class="legend">
          <span class="leg"><span class="sw acc"></span>實際誤差</span>
          <span class="leg"><span class="sw dashed"></span>1/√N 參考線</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>Monte Carlo 的威力</h4>
      <p>
        這個看似玩具的方法在科學計算中極為強大。
      </p>
      <div class="app-grid">
        <div class="app">
          <div class="a-name">高維積分</div>
          <p>d 維空間的積分，MC 誤差仍是 1/√N，<strong>與維度無關</strong>。規則網格需要 Nᵈ 個點——維度詛咒。</p>
        </div>
        <div class="app">
          <div class="a-name">粒子物理</div>
          <p>LHC 的碰撞模擬、各種 Feynman 圖求和都靠 MC。</p>
        </div>
        <div class="app">
          <div class="a-name">金融</div>
          <p>期權定價、風險估計——Monte Carlo 模擬數百萬條價格路徑。</p>
        </div>
        <div class="app">
          <div class="a-name">機器學習</div>
          <p>Bayesian 推論（MCMC）、強化學習、Dropout、變分方法。</p>
        </div>
        <div class="app">
          <div class="a-name">統計物理</div>
          <p>Ising 模型、相變、分子動力學。</p>
        </div>
        <div class="app">
          <div class="a-name">遊戲 AI</div>
          <p>圍棋 AI 的 Monte Carlo Tree Search——AlphaGo 的核心。</p>
        </div>
      </div>

      <h4>本章收尾</h4>
      <ol class="summary">
        <li>機率的三種詮釋：古典、頻率、主觀——都服從同一套數學。</li>
        <li>Kolmogorov 三公理：非負、歸一、可加。萬法皆從此出。</li>
        <li>等機率問題 → 計數問題 → 排列組合。</li>
        <li>生日悖論展示機率直覺的脆弱——23 人就過半。</li>
        <li>Monte Carlo：當解析式無望時，隨機模擬是你最好的朋友。</li>
      </ol>

      <div class="next-ch">
        <h4>下一章：條件機率與 Bayes</h4>
        <p>
          「已知 A 發生，B 的機率是多少？」這個問題改變了一切——
          醫學診斷、垃圾郵件過濾、刑事鑑識、機器學習都繞著這個核心。
          Bayes 定理把「反向推論」寫成公式，讓機率學從「算擲骰」躍升為「理性思考」的工具。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }

    .mc-visual { text-align: center; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .mc-svg { width: 300px; max-width: 100%; }

    .mc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .mc-stat { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .mc-stat.big { background: var(--accent-10); border-color: var(--accent-30); }
    .ms-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; }
    .ms-val { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .ctrl { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; justify-content: center; }
    .btn { font: inherit; font-size: 12px; padding: 6px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn.reset { background: transparent; color: var(--accent); }

    .error-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-top: 10px; }
    .ep-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .e-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .legend { display: flex; gap: 14px; justify-content: center; margin-top: 4px; font-size: 11px; color: var(--text-muted); }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.acc { background: var(--accent); }
    .sw.dashed { background-image: linear-gradient(to right, var(--text-muted) 50%, transparent 50%); background-size: 4px 3px; }

    .app-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 10px 0; }
    .app { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .a-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
    .app p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .app strong { color: var(--accent); }

    .summary { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }

    .next-ch { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .next-ch p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class ProbCh1MonteCarloComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly nTotal = signal(0);
  readonly nInside = signal(0);
  readonly points = signal<Array<{ x: number; y: number; inside: boolean }>>([]);
  readonly maxPoints = 1000;
  readonly errorHistory = signal<Array<{ n: number; err: number }>>([]);
  readonly playing = signal(false);

  private rafId: number | null = null;

  ngOnInit(): void {
    const loop = () => {
      if (this.playing()) this.flipMany(25);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  ngOnDestroy(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); }

  toggleAnim() { this.playing.set(!this.playing()); }

  readonly piEstimate = computed(() => this.nTotal() === 0 ? 0 : (4 * this.nInside()) / this.nTotal());

  flipMany(n: number) {
    const newPts: Array<{ x: number; y: number; inside: boolean }> = [];
    let nInside = this.nInside();
    let nTotal = this.nTotal();
    for (let i = 0; i < n; i++) {
      const x = Math.random();
      const y = Math.random();
      const inside = x * x + y * y <= 1;
      if (inside) nInside++;
      nTotal++;
      newPts.push({ x, y, inside });
    }
    this.points.update(arr => [...arr, ...newPts].slice(-this.maxPoints));
    this.nInside.set(nInside);
    this.nTotal.set(nTotal);
    const piEst = (4 * nInside) / nTotal;
    const err = Math.abs(piEst - Math.PI);
    this.errorHistory.update(arr => {
      const next = [...arr, { n: nTotal, err }];
      if (next.length > 500) next.shift();
      return next;
    });
  }

  reset() {
    this.nTotal.set(0);
    this.nInside.set(0);
    this.points.set([]);
    this.errorHistory.set([]);
    this.playing.set(false);
  }

  errorPath(): string {
    const hist = this.errorHistory();
    if (hist.length === 0) return '';
    const maxN = Math.max(100, hist[hist.length - 1].n);
    const pts: string[] = [];
    for (let i = 0; i < hist.length; i++) {
      const { n, err } = hist[i];
      const px = (Math.log(Math.max(1, n)) / Math.log(maxN)) * 400;
      const py = -(Math.max(0, 2 + Math.log10(Math.max(1e-4, err))) / 2) * 85;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  refPath(): string {
    const hist = this.errorHistory();
    if (hist.length === 0) return '';
    const maxN = Math.max(100, hist[hist.length - 1].n);
    const pts: string[] = [];
    for (let i = 1; i <= 200; i++) {
      const n = (i / 200) * maxN;
      if (n < 1) continue;
      const ref = 1 / Math.sqrt(n);
      const px = (Math.log(Math.max(1, n)) / Math.log(maxN)) * 400;
      const py = -(Math.max(0, 2 + Math.log10(Math.max(1e-4, ref))) / 2) * 85;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
