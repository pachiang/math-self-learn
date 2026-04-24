import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-bayes-ch2-gamma-poisson',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Gamma–Poisson：計數資料的共軛" subtitle="§2.3">
      <p>
        Poisson 分佈適合計數：每小時電話量、每週地震次數、網頁點擊。
        推論參數 λ（率）用 <strong>Gamma 先驗</strong>：
      </p>

      <div class="setup">
        <div class="centered-eq"><strong>Prior</strong>：λ ~ Gamma(α, β)</div>
        <div class="centered-eq"><strong>Likelihood</strong>：X₁, …, Xₙ ~ Poisson(λ)</div>
        <div class="centered-eq big accent">
          Posterior：λ | D ~ Gamma(α + Σxᵢ, β + n)
        </div>
      </div>

      <h4>參數解讀</h4>
      <p>
        Gamma(α, β) 在這個參數化下：
      </p>
      <ul class="gamma-interp">
        <li>α = 「pseudo 事件數」</li>
        <li>β = 「pseudo 時間數」</li>
        <li>Gamma 均值 = α / β = 「事件數 / 時間」 = 估計率 λ</li>
      </ul>
      <p>
        更新時：Σxᵢ（觀察到的事件數）加到 α、n（觀察時間數）加到 β。
        和 Beta-Binomial 同一個「pseudo-count 模板」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="模擬：每小時顧客數。調先驗、累加觀察">
      <div class="prior-ctrl">
        <div class="pc-title">先驗 Gamma(α, β)：</div>
        <div class="sl"><span class="sl-lab">α</span>
          <input type="range" min="0.5" max="20" step="0.5" [value]="priorA()"
            (input)="priorA.set(+$any($event).target.value)" />
          <span class="sl-val">{{ priorA().toFixed(1) }}</span></div>
        <div class="sl"><span class="sl-lab">β</span>
          <input type="range" min="0.5" max="10" step="0.5" [value]="priorB()"
            (input)="priorB.set(+$any($event).target.value)" />
          <span class="sl-val">{{ priorB().toFixed(1) }}</span></div>
        <div class="prior-mean">先驗均值 = {{ (priorA() / priorB()).toFixed(2) }}</div>
      </div>

      <div class="obs-ctrl">
        <div class="obs-lab">
          累積觀察：{{ totalCount() }} 位顧客 / {{ totalHours() }} 小時 &nbsp;
          <span class="rate-tag">率 = {{ totalHours() > 0 ? (totalCount() / totalHours()).toFixed(2) : '—' }}</span>
        </div>
        <div class="auto-btns">
          <button class="auto" (click)="addBatch(1, 3)">+1hr (λ≈3)</button>
          <button class="auto" (click)="addBatch(1, 5)">+1hr (λ≈5)</button>
          <button class="auto" (click)="addBatch(5, 4)">+5hr (λ≈4)</button>
          <button class="auto" (click)="addBatch(20, 4)">+20hr</button>
          <button class="reset" (click)="reset()">重置</button>
        </div>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 240" class="p-svg">
          <line x1="40" y1="210" x2="420" y2="210" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="210" stroke="var(--border-strong)" stroke-width="1" />
          @for (t of ticks; track t) {
            <line [attr.x1]="mapX(t)" y1="210" [attr.x2]="mapX(t)" y2="214" stroke="var(--border-strong)" stroke-width="0.8" />
            <text [attr.x]="mapX(t)" y="228" class="tk" text-anchor="middle">{{ t }}</text>
          }

          <path [attr.d]="priorPath()" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="4 3" />
          <path [attr.d]="postPath()" fill="var(--accent)" opacity="0.3" stroke="var(--accent)" stroke-width="2.4" />

          @if (totalHours() > 0) {
            <line [attr.x1]="mapX(totalCount() / totalHours())" y1="20"
                  [attr.x2]="mapX(totalCount() / totalHours())" y2="210"
                  stroke="#5ca878" stroke-width="1.5" stroke-dasharray="3 2" />
            <text [attr.x]="mapX(totalCount() / totalHours())" y="16" class="tk grn" text-anchor="middle">MLE</text>
          }
          <text x="230" y="200" class="tk" text-anchor="middle" opacity="0">λ</text>
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw gr-dash"></span>Prior Gamma(α, β)</span>
        <span class="leg"><span class="sw ac"></span>Posterior</span>
        <span class="leg"><span class="sw gr"></span>MLE</span>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">α'</div><div class="st-v">{{ postA().toFixed(1) }}</div></div>
        <div class="st"><div class="st-l">β'</div><div class="st-v">{{ postB().toFixed(1) }}</div></div>
        <div class="st"><div class="st-l">後驗均值 λ̂</div><div class="st-v">{{ postMean().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">後驗 SD</div><div class="st-v">{{ postSd().toFixed(3) }}</div></div>
      </div>

      <p class="note">
        累積觀察到 Σx 事件、n 小時 → α' = α + Σx, β' = β + n。
        資料越多 posterior 越尖。觀察公式：後驗均值 = <strong>(α + Σx) / (β + n)</strong>——
        清楚的「先驗偽計數 + 實際計數」混合。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        Gamma-Poisson 處理計數資料，和 Beta-Binomial 同一個配方：<em>先驗參數 + 觀察計數 = 後驗參數</em>。
        下一節收尾：為什麼指數族和共軛性有深刻的結構聯繫。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 8px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .centered-eq.accent { background: var(--accent); color: white; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .gamma-interp { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .prior-ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .pc-title { font-size: 13px; color: var(--text); font-weight: 600; margin-bottom: 8px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 24px; font-family: 'JetBrains Mono', monospace; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .prior-mean { font-size: 12px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; text-align: center; margin-top: 6px; }

    .obs-ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 10px; margin-bottom: 10px; }
    .obs-lab { font-size: 13px; color: var(--text); font-weight: 600; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
    .rate-tag { color: var(--accent); margin-left: 8px; }
    .auto-btns { display: flex; gap: 6px; flex-wrap: wrap; }
    .auto { font: inherit; font-size: 11px; padding: 5px 10px; border: 1px solid var(--border); background: var(--bg); border-radius: 8px; cursor: pointer; color: var(--text-muted); font-weight: 600; }
    .auto:hover { border-color: var(--accent); color: var(--accent); }
    .reset { font: inherit; font-size: 11px; padding: 5px 10px; border: 1px solid var(--border); background: transparent; border-radius: 8px; cursor: pointer; color: var(--text-muted); margin-left: auto; }

    .plot { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 16px; height: 3px; border-radius: 2px; }
    .sw.gr-dash { background: repeating-linear-gradient(to right, var(--text-muted) 0 4px, transparent 4px 7px); }
    .sw.ac { background: var(--accent); }
    .sw.gr { background: #5ca878; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .note em { color: var(--accent); font-style: normal; font-weight: 600; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class BayesCh2GammaPoissonComponent {
  readonly ticks = [0, 2, 4, 6, 8, 10];
  readonly priorA = signal(3.0);
  readonly priorB = signal(1.0);
  readonly totalCount = signal(0);
  readonly totalHours = signal(0);

  readonly postA = computed(() => this.priorA() + this.totalCount());
  readonly postB = computed(() => this.priorB() + this.totalHours());
  readonly postMean = computed(() => this.postA() / this.postB());
  readonly postSd = computed(() => Math.sqrt(this.postA() / this.postB() ** 2));

  addBatch(hours: number, trueLambda: number) {
    let count = 0;
    for (let h = 0; h < hours; h++) {
      // Sample Poisson
      let k = 0, p = 1;
      const L = Math.exp(-trueLambda);
      do { k++; p *= Math.random(); } while (p > L);
      count += k - 1;
    }
    this.totalCount.update(v => v + count);
    this.totalHours.update(v => v + hours);
  }

  reset() {
    this.totalCount.set(0);
    this.totalHours.set(0);
  }

  mapX(t: number): number { return 40 + (t / 10) * 380; }

  private logGamma(x: number): number {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
               -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, t = x + 5.5;
    t -= (x + 0.5) * Math.log(t);
    let s = 1.000000000190015;
    for (let j = 0; j < 6; j++) { y++; s += c[j] / y; }
    return -t + Math.log(2.5066282746310005 * s / x);
  }

  private gammaPdf(x: number, a: number, b: number): number {
    if (x <= 0) return 0;
    const log = a * Math.log(b) - this.logGamma(a) + (a - 1) * Math.log(x) - b * x;
    return Math.exp(log);
  }

  priorPath(): string { return this.buildPath(x => this.gammaPdf(x, this.priorA(), this.priorB()), false); }
  postPath(): string { return this.buildPath(x => this.gammaPdf(x, this.postA(), this.postB()), true); }

  private buildPath(fn: (x: number) => number, fill: boolean): string {
    const N = 300;
    let peak = 1e-12;
    for (let i = 1; i < N; i++) peak = Math.max(peak, fn((i * 10) / N));
    const pts: string[] = [];
    if (fill) pts.push(`M 40 210`);
    for (let i = 0; i <= N; i++) {
      const x = (i * 10) / N;
      const y = fn(x);
      const px = this.mapX(x);
      const py = 210 - (y / peak) * 180;
      pts.push(`${!fill && i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    if (fill) pts.push(`L 420 210 Z`);
    return pts.join(' ');
  }
}
