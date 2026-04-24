import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-bayes-ch2-beta-binomial',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Beta-Binomial：最經典的共軛對" subtitle="§2.1">
      <p>
        若 prior 和 likelihood 相乘後 posterior 屬於<strong>同一家族</strong>——這就叫
        <em>共軛 (conjugate)</em>。Beta-Binomial 是最乾淨的例子。
      </p>

      <div class="setup">
        <div class="centered-eq">
          <strong>Prior</strong>：θ ~ Beta(α, β) &nbsp;∝&nbsp; θ^(α−1) (1−θ)^(β−1)
        </div>
        <div class="centered-eq">
          <strong>Likelihood</strong>：X | θ ~ Binomial(n, θ) &nbsp;∝&nbsp; θ^k (1−θ)^(n−k)
        </div>
        <div class="centered-eq big accent">
          Posterior：θ | X ~ Beta(α + k, β + n − k)
        </div>
      </div>

      <p>
        <strong>神奇的是公式的簡潔度</strong>——把觀察到的 k 加到 α、n−k 加到 β。就這樣。
      </p>

      <div class="key-idea">
        <strong>「pseudocount」直覺：</strong>
        Beta(α, β) 的 prior 等效於「想像看過 α − 1 次正面、β − 1 次反面」。
        所以 Beta(1, 1)（均勻）= 「沒有先驗資訊」；
        Beta(10, 10) = 「像已經看過約 18 次、一半正面」。
        先驗的<em>影響力</em>用「等效樣本數 α + β」量化。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="一次更新一筆：看 posterior 如何一步步演化">
      <div class="prior-ctrl">
        <div class="pc-title">先驗 Beta(α, β)：</div>
        <div class="sl">
          <span class="sl-lab">α</span>
          <input type="range" min="0.5" max="20" step="0.5" [value]="priorA()"
            (input)="priorA.set(+$any($event).target.value)" />
          <span class="sl-val">{{ priorA().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">β</span>
          <input type="range" min="0.5" max="20" step="0.5" [value]="priorB()"
            (input)="priorB.set(+$any($event).target.value)" />
          <span class="sl-val">{{ priorB().toFixed(1) }}</span>
        </div>
      </div>

      <div class="obs-ctrl">
        <div class="obs-row">
          <div class="obs-lab">觀察：{{ heads() }} 正、{{ tails() }} 反（共 {{ heads() + tails() }} 次）</div>
          <div class="obs-btns">
            <button class="btn pos" (click)="addHead()">+ 正面</button>
            <button class="btn neg" (click)="addTail()">+ 反面</button>
            <button class="btn reset" (click)="reset()">重置</button>
          </div>
        </div>
        <div class="auto-btns">
          <button class="auto" (click)="batch(5, 0.3)">+5 次 (偏反)</button>
          <button class="auto" (click)="batch(20, 0.5)">+20 次 (公正)</button>
          <button class="auto" (click)="batch(100, 0.7)">+100 次 (偏正)</button>
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

          <!-- Prior curve -->
          <path [attr.d]="priorPath()" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="4 3" opacity="0.8" />
          <!-- Posterior filled -->
          <path [attr.d]="postPath()" fill="var(--accent)" opacity="0.3" stroke="var(--accent)" stroke-width="2.4" />
          <!-- Observed proportion marker -->
          @if (heads() + tails() > 0) {
            <line [attr.x1]="mapX(10 * observedProp())" y1="20" [attr.x2]="mapX(10 * observedProp())" y2="230"
                  stroke="#5ca878" stroke-width="1.5" stroke-dasharray="3 2" />
            <text [attr.x]="mapX(10 * observedProp())" y="16" class="tk grn" text-anchor="middle">k/n = {{ observedProp().toFixed(2) }}</text>
          }
          <!-- Posterior mean -->
          <line [attr.x1]="mapX(10 * postMean())" y1="20" [attr.x2]="mapX(10 * postMean())" y2="230"
                stroke="var(--accent)" stroke-width="2" />

          <text x="230" y="220" class="tk" text-anchor="middle" opacity="0">θ</text>
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw gr-dash"></span>先驗</span>
        <span class="leg"><span class="sw ac"></span>後驗</span>
        <span class="leg"><span class="sw gr"></span>樣本比例</span>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">Posterior α</div><div class="st-v">{{ postA().toFixed(1) }}</div></div>
        <div class="st"><div class="st-l">Posterior β</div><div class="st-v">{{ postB().toFixed(1) }}</div></div>
        <div class="st"><div class="st-l">後驗均值</div><div class="st-v">{{ postMean().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">後驗 SD</div><div class="st-v">{{ postSd().toFixed(3) }}</div></div>
      </div>

      <div class="decomp">
        <strong>後驗均值分解</strong>：
        <br>E[θ|D] = α'/(α' + β') =
        <span class="w1">w · (prior 均值)</span> +
        <span class="w2">(1 − w) · k/n</span>
        <br>其中 w = (α + β) / (α + β + n) = <strong>{{ priorWeight().toFixed(3) }}</strong>
        <br><em>→ 資料越多，樣本比例權重越高，prior 影響越小</em>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        Beta-Binomial 給出最乾淨的貝氏範例：posterior 參數 = prior 參數 + 計數。
        這是 A/B 測試、點擊率估計、藥效試驗的日常工具。
        下一節看連續資料的共軛：Normal–Normal。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 8px 0; }
    .centered-eq.big { font-size: 17px; padding: 16px; }
    .centered-eq.accent { background: var(--accent); color: white; }
    .centered-eq strong { color: var(--text); }
    .centered-eq.accent strong { color: white; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }

    .setup { margin: 12px 0; }

    .prior-ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .pc-title { font-size: 13px; color: var(--text); font-weight: 600; margin-bottom: 8px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 24px; font-family: 'JetBrains Mono', monospace; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .obs-ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 10px; margin-bottom: 10px; }
    .obs-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .obs-lab { font-size: 13px; color: var(--text); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .obs-btns { display: flex; gap: 6px; }
    .btn { font: inherit; font-size: 12px; padding: 6px 14px; border: 1px solid var(--border); background: var(--bg); border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn.pos { border-color: var(--accent); color: var(--accent); }
    .btn.pos:hover { background: var(--accent); color: white; }
    .btn.neg { border-color: #b06c4a; color: #b06c4a; }
    .btn.neg:hover { background: #b06c4a; color: white; }
    .btn.reset { color: var(--text-muted); }
    .auto-btns { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .auto { font: inherit; font-size: 11px; padding: 4px 10px; border: 1px solid var(--border); background: transparent; border-radius: 8px; cursor: pointer; color: var(--text-muted); }
    .auto:hover { border-color: var(--accent); color: var(--accent); }

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

    .decomp { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .decomp strong { color: var(--accent); }
    .decomp em { color: var(--accent); font-style: normal; font-weight: 600; }
    .w1 { color: var(--text-muted); font-weight: 700; }
    .w2 { color: #5ca878; font-weight: 700; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class BayesCh2BetaBinomialComponent {
  readonly ticks = [0, 2, 4, 6, 8, 10];
  readonly priorA = signal(2.0);
  readonly priorB = signal(2.0);
  readonly heads = signal(0);
  readonly tails = signal(0);

  addHead() { this.heads.update(h => h + 1); }
  addTail() { this.tails.update(t => t + 1); }
  reset() { this.heads.set(0); this.tails.set(0); }

  batch(n: number, pTrue: number) {
    let h = 0;
    for (let i = 0; i < n; i++) if (Math.random() < pTrue) h++;
    this.heads.update(v => v + h);
    this.tails.update(v => v + n - h);
  }

  readonly postA = computed(() => this.priorA() + this.heads());
  readonly postB = computed(() => this.priorB() + this.tails());
  readonly postMean = computed(() => this.postA() / (this.postA() + this.postB()));
  readonly postSd = computed(() => {
    const a = this.postA(), b = this.postB();
    return Math.sqrt((a * b) / ((a + b) ** 2 * (a + b + 1)));
  });
  readonly observedProp = computed(() => {
    const n = this.heads() + this.tails();
    return n > 0 ? this.heads() / n : 0.5;
  });
  readonly priorWeight = computed(() => {
    const n = this.heads() + this.tails();
    return (this.priorA() + this.priorB()) / (this.priorA() + this.priorB() + n);
  });

  mapX(t: number): number { return 40 + (t / 10) * 380; }

  private betaPdf(x: number, a: number, b: number): number {
    if (x <= 0 || x >= 1) return 0;
    return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1);
  }

  priorPath(): string { return this.buildPath(x => this.betaPdf(x, this.priorA(), this.priorB()), false); }
  postPath(): string { return this.buildPath(x => this.betaPdf(x, this.postA(), this.postB()), true); }

  private buildPath(fn: (x: number) => number, fill: boolean): string {
    const N = 300;
    let peak = 1e-12;
    for (let i = 1; i < N; i++) peak = Math.max(peak, fn(i / N));
    const pts: string[] = [];
    if (fill) pts.push(`M 40 230`);
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const y = fn(x);
      const px = 40 + x * 380;
      const py = 230 - (y / peak) * 200;
      pts.push(`${!fill && i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    if (fill) pts.push(`L 420 230 Z`);
    return pts.join(' ');
  }
}
