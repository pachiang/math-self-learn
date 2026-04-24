import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-bayes-ch1-three-curves',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Prior × Likelihood = Posterior" subtitle="§1.3">
      <p>
        讓我們把 <code>p(θ|D) ∝ p(D|θ) · p(θ)</code> 畫出來。
        場景：拋硬幣 n 次、k 次正面，想推 θ = 正面機率。
      </p>

      <ul class="pieces">
        <li><strong>Prior</strong>：你對 θ 的先驗信念（這裡用 Beta(α, β)）</li>
        <li><strong>Likelihood</strong>：θ^k (1−θ)^(n−k)，已知結果 k 正、n−k 反</li>
        <li><strong>Posterior</strong>：兩者相乘 + 歸一化 → 新的信念</li>
      </ul>

      <h4>關鍵觀察</h4>
      <p>
        兩件事同時發生：
      </p>
      <ol class="obs">
        <li>資料拉 posterior 朝 MLE（k/n）</li>
        <li>Prior 拉 posterior 朝它的峰</li>
      </ol>
      <p>
        兩股力量<em>按比例</em>對抗。先驗強 + 資料少 → prior 主導；
        資料多 → likelihood 主導。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整先驗與觀察。看三條曲線的互動">
      <div class="prior-pick">
        <div class="pp-title">選擇先驗：</div>
        <button class="pill" [class.active]="priorKind() === 'flat'" (click)="setPrior('flat')">均勻 Beta(1,1)</button>
        <button class="pill" [class.active]="priorKind() === 'weak'" (click)="setPrior('weak')">弱偏向 Beta(2,2)</button>
        <button class="pill" [class.active]="priorKind() === 'fair'" (click)="setPrior('fair')">中立信念 Beta(10,10)</button>
        <button class="pill" [class.active]="priorKind() === 'biased'" (click)="setPrior('biased')">相信偏正 Beta(8,2)</button>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">n 次投擲</span>
          <input type="range" min="0" max="100" step="1" [value]="n()"
            (input)="setN(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">k 次正面</span>
          <input type="range" min="0" [attr.max]="n()" step="1" [value]="k()"
            (input)="k.set(+$any($event).target.value)" />
          <span class="sl-val">{{ k() }}</span>
        </div>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 260" class="p-svg">
          <line x1="40" y1="230" x2="420" y2="230" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="230" stroke="var(--border-strong)" stroke-width="1" />
          @for (t of ticks; track t) {
            <line [attr.x1]="mapX(t)" y1="230" [attr.x2]="mapX(t)" y2="234" stroke="var(--border-strong)" stroke-width="0.8" />
            <text [attr.x]="mapX(t)" y="248" class="tk" text-anchor="middle">{{ (t / 10).toFixed(1) }}</text>
          }

          <!-- Prior (dashed gray) -->
          <path [attr.d]="priorPath()" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="4 3" opacity="0.8" />
          <!-- Likelihood (orange) -->
          <path [attr.d]="likePath()" fill="none" stroke="#b06c4a" stroke-width="2" />
          <!-- Posterior (filled accent) -->
          <path [attr.d]="postPath()" fill="var(--accent)" opacity="0.25" stroke="var(--accent)" stroke-width="2.4" />

          <!-- MLE marker -->
          @if (n() > 0) {
            <line [attr.x1]="mapX(10 * mle())" y1="20" [attr.x2]="mapX(10 * mle())" y2="230"
                  stroke="#5ca878" stroke-width="1" stroke-dasharray="3 2" />
            <text [attr.x]="mapX(10 * mle())" y="16" class="tk grn" text-anchor="middle">MLE {{ mle().toFixed(2) }}</text>
          }
          <!-- Posterior mean marker -->
          <line [attr.x1]="mapX(10 * postMean())" y1="20" [attr.x2]="mapX(10 * postMean())" y2="230"
                stroke="var(--accent)" stroke-width="2" />
          <text [attr.x]="mapX(10 * postMean())" y="260" class="tk acc" text-anchor="middle">E[θ|D]</text>

          <text x="230" y="220" class="tk" text-anchor="middle" opacity="0">θ</text>
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw gr-dash"></span>先驗 p(θ)</span>
        <span class="leg"><span class="sw or"></span>概似 p(D|θ)</span>
        <span class="leg"><span class="sw ac"></span>後驗 p(θ|D)</span>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">Posterior α</div><div class="st-v">{{ postParams().a.toFixed(1) }}</div></div>
        <div class="st"><div class="st-l">Posterior β</div><div class="st-v">{{ postParams().b.toFixed(1) }}</div></div>
        <div class="st"><div class="st-l">後驗均值</div><div class="st-v">{{ postMean().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">後驗 SD</div><div class="st-v">{{ postSd().toFixed(3) }}</div></div>
      </div>

      <p class="note">
        <strong>試試：</strong>
        n = 0 → posterior = prior（沒有資料，信念不變）。<br>
        n = 20 某個偏斜 → 三條曲線明顯不同，posterior 介於 prior 和 likelihood 之間。<br>
        n = 100 → likelihood 超尖，posterior 幾乎貼著它——<em>prior 被壓扁了</em>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        posterior 是 prior 和 likelihood 的「幾何平均」——按 likelihood 的銳利度加權。
        這個視覺化幾乎解釋了所有貝氏推論的<em>直覺</em>——之後的每一章都在變奏這個主題。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .pieces, .obs { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .pieces strong { color: var(--accent); }
    .obs em { color: var(--accent); font-style: normal; font-weight: 600; }

    .prior-pick { display: flex; gap: 6px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
    .pp-title { font-size: 13px; color: var(--text); font-weight: 600; }
    .pill { font: inherit; font-size: 11px; padding: 5px 10px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right; }

    .plot { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }
    .tk.acc { fill: var(--accent); font-weight: 700; }

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
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class BayesCh1ThreeCurvesComponent {
  readonly ticks = [0, 2, 4, 6, 8, 10];
  readonly priorKind = signal<'flat' | 'weak' | 'fair' | 'biased'>('fair');
  readonly n = signal(20);
  readonly k = signal(12);

  setPrior(p: 'flat' | 'weak' | 'fair' | 'biased') { this.priorKind.set(p); }
  setN(v: number) {
    this.n.set(v);
    if (this.k() > v) this.k.set(v);
  }

  private priorParams(): { a: number; b: number } {
    switch (this.priorKind()) {
      case 'flat': return { a: 1, b: 1 };
      case 'weak': return { a: 2, b: 2 };
      case 'fair': return { a: 10, b: 10 };
      case 'biased': return { a: 8, b: 2 };
    }
  }

  readonly postParams = computed(() => {
    const { a, b } = this.priorParams();
    return { a: a + this.k(), b: b + this.n() - this.k() };
  });

  readonly postMean = computed(() => {
    const { a, b } = this.postParams();
    return a / (a + b);
  });

  readonly postSd = computed(() => {
    const { a, b } = this.postParams();
    return Math.sqrt((a * b) / ((a + b) ** 2 * (a + b + 1)));
  });

  readonly mle = computed(() => this.n() > 0 ? this.k() / this.n() : 0.5);

  mapX(t: number): number { return 40 + (t / 10) * 380; }

  private betaPdf(x: number, a: number, b: number): number {
    if (x <= 0 || x >= 1) return 0;
    return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1);
  }

  private likelihood(x: number): number {
    if (x <= 0 || x >= 1) return this.k() === 0 ? (x === 0 ? 1 : 0) : 0;
    return Math.pow(x, this.k()) * Math.pow(1 - x, this.n() - this.k());
  }

  private normalizedPath(fn: (x: number) => number, fill: boolean): string {
    const N = 300;
    let peak = 1e-12;
    for (let i = 1; i < N; i++) peak = Math.max(peak, fn(i / N));
    const baseY = 230;
    const maxH = 200;
    const pts: string[] = [];
    if (fill) pts.push(`M 40 ${baseY}`);
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const y = fn(x);
      const px = 40 + x * 380;
      const py = baseY - (y / peak) * maxH;
      pts.push(`${!fill && i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    if (fill) pts.push(`L 420 ${baseY} Z`);
    return pts.join(' ');
  }

  priorPath(): string {
    const { a, b } = this.priorParams();
    return this.normalizedPath(x => this.betaPdf(x, a, b), false);
  }

  likePath(): string {
    if (this.n() === 0) return '';
    return this.normalizedPath(x => this.likelihood(x), false);
  }

  postPath(): string {
    const { a, b } = this.postParams();
    return this.normalizedPath(x => this.betaPdf(x, a, b), true);
  }
}
