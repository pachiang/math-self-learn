import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-bayes-ch2-normal-normal',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Normal–Normal：連續資料的共軛" subtitle="§2.2">
      <p>
        設資料 X₁, …, Xₙ ~ N(μ, σ²)（<strong>σ² 已知</strong>），先驗 μ ~ N(μ₀, τ₀²)。
        後驗仍是 Normal：
      </p>
      <div class="centered-eq big accent">
        μ | D ~ N(μ_post, τ_post²)
      </div>

      <h4>精確公式</h4>
      <div class="centered-eq">
        τ_post² = 1 / (1/τ₀² + n/σ²)
      </div>
      <div class="centered-eq">
        μ_post = τ_post² · (μ₀/τ₀² + n·x̄/σ²)
      </div>

      <h4>用 precision（= 1/variance）看最乾淨</h4>
      <div class="centered-eq big">
        precision_post = precision_prior + n · precision_data
      </div>
      <div class="centered-eq">
        μ_post = (w₀ · μ₀ + w_data · x̄) / (w₀ + w_data)
      </div>
      <p>
        <strong>Posterior 的 precision 是兩邊 precision 直接相加</strong>——
        這就是「貝氏就是加資訊」的極致表達。
      </p>

      <div class="key-idea">
        <strong>先驗的「等效樣本數」：</strong>
        τ₀² = σ²/n₀ 表示 prior 相當於「n₀ 筆資料」的資訊量。
        n₀ 小 → prior 弱；n₀ 大 → prior 強、需要很多真實資料才能覆蓋。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="拉桿調 prior 與樣本。看兩條常態如何合成第三條">
      <div class="ctrl">
        <div class="grp">
          <div class="grp-head">先驗</div>
          <div class="sl"><span class="sl-lab">μ₀</span>
            <input type="range" min="-5" max="5" step="0.1" [value]="priorMu()"
              (input)="priorMu.set(+$any($event).target.value)" />
            <span class="sl-val">{{ priorMu().toFixed(2) }}</span></div>
          <div class="sl"><span class="sl-lab">τ₀</span>
            <input type="range" min="0.3" max="5" step="0.1" [value]="priorTau()"
              (input)="priorTau.set(+$any($event).target.value)" />
            <span class="sl-val">{{ priorTau().toFixed(2) }}</span></div>
        </div>
        <div class="grp">
          <div class="grp-head">資料</div>
          <div class="sl"><span class="sl-lab">x̄</span>
            <input type="range" min="-5" max="5" step="0.1" [value]="xBar()"
              (input)="xBar.set(+$any($event).target.value)" />
            <span class="sl-val">{{ xBar().toFixed(2) }}</span></div>
          <div class="sl"><span class="sl-lab">n</span>
            <input type="range" min="1" max="200" step="1" [value]="n()"
              (input)="n.set(+$any($event).target.value)" />
            <span class="sl-val">{{ n() }}</span></div>
          <div class="sl"><span class="sl-lab">σ</span>
            <input type="range" min="0.3" max="3" step="0.05" [value]="sigma()"
              (input)="sigma.set(+$any($event).target.value)" />
            <span class="sl-val">{{ sigma().toFixed(2) }}</span></div>
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

          <!-- Prior -->
          <path [attr.d]="priorPath()" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="4 3" />
          <!-- Likelihood (scaled) -->
          <path [attr.d]="likePath()" fill="none" stroke="#b06c4a" stroke-width="2" />
          <!-- Posterior -->
          <path [attr.d]="postPath()" fill="var(--accent)" opacity="0.3" stroke="var(--accent)" stroke-width="2.4" />
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw gr-dash"></span>Prior N(μ₀, τ₀²)</span>
        <span class="leg"><span class="sw or"></span>Likelihood（樣本）</span>
        <span class="leg"><span class="sw ac"></span>Posterior N(μ_post, τ_post²)</span>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">μ_post</div><div class="st-v">{{ postMean().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">τ_post</div><div class="st-v">{{ postSd().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">Prior 權重</div><div class="st-v">{{ (priorWeight() * 100).toFixed(1) }}%</div></div>
        <div class="st"><div class="st-l">Data 權重</div><div class="st-v">{{ ((1 - priorWeight()) * 100).toFixed(1) }}%</div></div>
      </div>

      <p class="note">
        觀察 <em>n 的影響</em>：n 從 1 調到 100，posterior 從「靠近 prior」變成「幾乎等於 likelihood」。<br>
        Posterior 永遠<strong>比 prior 和 likelihood 都更尖</strong>——合併資訊降低不確定性。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>延伸：σ² 也未知怎麼辦？</h4>
      <p>
        上面假設 σ² 已知。若未知，需要同時對 μ 和 σ² 做推論——用
        <strong>Normal–Inverse-Gamma</strong> 先驗（對 (μ, σ²) 的聯合共軛）。
        posterior 仍有 closed-form，但代數稍複雜。
      </p>
      <p>
        在實務中，這就是 Bayesian 版本的 t 檢定/迴歸。R 的 <code>BAS</code>、
        Python 的 <code>PyMC</code> 都有內建。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Normal–Normal 的 posterior precision = prior precision + data precision——
        直接可加是「貝氏就是資訊的疊加」的清晰展現。
        下一節看另一種分佈：Gamma–Poisson 處理計數資料。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .centered-eq.accent { background: var(--accent); color: white; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .ctrl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .grp { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .grp-head { font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 6px; text-align: center; }
    .sl { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .sl-lab { font-size: 11px; color: var(--text-muted); font-weight: 700; min-width: 24px; font-family: 'JetBrains Mono', monospace; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 11px; font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right; }

    .plot { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; flex-wrap: wrap; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 16px; height: 3px; border-radius: 2px; }
    .sw.gr-dash { background: repeating-linear-gradient(to right, var(--text-muted) 0 4px, transparent 4px 7px); }
    .sw.or { background: #b06c4a; }
    .sw.ac { background: var(--accent); }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .note em { color: var(--accent); font-style: normal; font-weight: 600; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class BayesCh2NormalNormalComponent {
  readonly ticks = [-5, -3, -1, 1, 3, 5];
  readonly priorMu = signal(0);
  readonly priorTau = signal(2);
  readonly xBar = signal(2);
  readonly n = signal(10);
  readonly sigma = signal(1);

  readonly postVar = computed(() => 1 / (1 / this.priorTau() ** 2 + this.n() / this.sigma() ** 2));
  readonly postMean = computed(() => this.postVar() * (this.priorMu() / this.priorTau() ** 2 + this.n() * this.xBar() / this.sigma() ** 2));
  readonly postSd = computed(() => Math.sqrt(this.postVar()));
  readonly priorWeight = computed(() => {
    const wPrior = 1 / this.priorTau() ** 2;
    const wData = this.n() / this.sigma() ** 2;
    return wPrior / (wPrior + wData);
  });

  mapX(t: number): number { return 40 + ((t + 5) / 10) * 380; }

  private normPdf(x: number, mu: number, sd: number): number {
    return Math.exp(-0.5 * ((x - mu) / sd) ** 2);
  }

  private buildPath(fn: (x: number) => number, fill: boolean): string {
    const N = 300;
    let peak = 1e-12;
    for (let i = 0; i <= N; i++) peak = Math.max(peak, fn(-5 + (i * 10) / N));
    const pts: string[] = [];
    if (fill) pts.push(`M 40 210`);
    for (let i = 0; i <= N; i++) {
      const x = -5 + (i * 10) / N;
      const y = fn(x);
      const px = this.mapX(x);
      const py = 210 - (y / peak) * 180;
      pts.push(`${!fill && i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    if (fill) pts.push(`L 420 210 Z`);
    return pts.join(' ');
  }

  priorPath(): string { return this.buildPath(x => this.normPdf(x, this.priorMu(), this.priorTau()), false); }

  likePath(): string {
    const sdLike = this.sigma() / Math.sqrt(this.n());
    return this.buildPath(x => this.normPdf(x, this.xBar(), sdLike), false);
  }

  postPath(): string { return this.buildPath(x => this.normPdf(x, this.postMean(), this.postSd()), true); }
}
