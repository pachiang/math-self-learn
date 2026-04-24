import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type Shape = 'symmetric' | 'right-skew' | 'bimodal' | 'sharp';

@Component({
  selector: 'app-bayes-ch1-point-estimates',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從 Posterior 提煉「一個數字」" subtitle="§1.4">
      <p>
        貝氏給你一整個 posterior 分佈——但實務上常要一個代表值。三個主流選擇：
      </p>

      <table class="estim">
        <thead><tr><th>估計量</th><th>公式</th><th>幾何意義</th><th>對應的損失函數</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>後驗均值 (Mean)</strong></td>
            <td>E[θ|D] = ∫ θ p(θ|D) dθ</td>
            <td>質心</td>
            <td>平方損失 (θ − θ̂)²</td>
          </tr>
          <tr>
            <td><strong>後驗中位數 (Median)</strong></td>
            <td>P(θ ≤ θ̂|D) = 0.5</td>
            <td>切出等面積</td>
            <td>絕對值損失 |θ − θ̂|</td>
          </tr>
          <tr>
            <td><strong>後驗眾數 (MAP)</strong></td>
            <td>argmax p(θ|D)</td>
            <td>最高點</td>
            <td>0–1 損失</td>
          </tr>
        </tbody>
      </table>

      <div class="key-idea">
        <strong>MAP vs MLE：</strong>
        MAP = argmax p(θ|D) = argmax [p(D|θ) · p(θ)] = MLE + 先驗加權。
        均勻先驗下，MAP = MLE。
        Ridge / Lasso 其實是 <em>Normal / Laplace 先驗下的 MAP</em>——L2/L1 懲罰就是 log-prior。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="切換分佈形狀，看三個點估計如何重合或分開">
      <div class="shape-tabs">
        <button class="pill" [class.active]="shape() === 'symmetric'" (click)="shape.set('symmetric')">對稱</button>
        <button class="pill" [class.active]="shape() === 'right-skew'" (click)="shape.set('right-skew')">右偏</button>
        <button class="pill" [class.active]="shape() === 'bimodal'" (click)="shape.set('bimodal')">雙峰</button>
        <button class="pill" [class.active]="shape() === 'sharp'" (click)="shape.set('sharp')">尖峰</button>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 260" class="p-svg">
          <line x1="40" y1="230" x2="420" y2="230" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="230" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Posterior filled -->
          <path [attr.d]="postPath()" fill="var(--accent)" opacity="0.25" stroke="var(--accent)" stroke-width="2" />

          <!-- Mean -->
          <line [attr.x1]="mapX(mean())" y1="20" [attr.x2]="mapX(mean())" y2="230"
                stroke="#5a8aa8" stroke-width="2" />
          <text [attr.x]="mapX(mean())" y="14" class="tk" fill="#5a8aa8" text-anchor="middle" font-weight="700">均值</text>
          <!-- Median -->
          <line [attr.x1]="mapX(median())" y1="20" [attr.x2]="mapX(median())" y2="230"
                stroke="#5ca878" stroke-width="2" stroke-dasharray="4 2" />
          <text [attr.x]="mapX(median())" y="30" class="tk grn" text-anchor="middle" font-weight="700">中位數</text>
          <!-- Mode (MAP) -->
          <line [attr.x1]="mapX(mode())" y1="20" [attr.x2]="mapX(mode())" y2="230"
                stroke="#b06c4a" stroke-width="2" stroke-dasharray="2 3" />
          <text [attr.x]="mapX(mode())" y="46" class="tk" fill="#b06c4a" text-anchor="middle" font-weight="700">MAP</text>

          <text x="230" y="254" class="tk" text-anchor="middle">θ</text>
        </svg>
      </div>

      <div class="stats">
        <div class="st bl"><div class="st-l">Mean</div><div class="st-v">{{ mean().toFixed(3) }}</div></div>
        <div class="st grn"><div class="st-l">Median</div><div class="st-v">{{ median().toFixed(3) }}</div></div>
        <div class="st org"><div class="st-l">MAP (Mode)</div><div class="st-v">{{ mode().toFixed(3) }}</div></div>
      </div>

      <div class="explain">
        @switch (shape()) {
          @case ('symmetric') {
            <p><strong>對稱分佈</strong>：三個估計<em>重合</em>。選哪個都一樣——Normal 世界裡的常態。</p>
          }
          @case ('right-skew') {
            <p><strong>右偏</strong>：Mode &lt; Median &lt; Mean——長尾拉高均值。
            收入分佈就是這樣，中位數通常比平均更能代表「典型」。</p>
          }
          @case ('bimodal') {
            <p><strong>雙峰</strong>：MAP 只抓得到<em>一個</em>峰。
            「單一數字」此時根本是誤導——貝氏派會說：<em>報告整個分佈</em>才對。</p>
          }
          @case ('sharp') {
            <p><strong>尖峰</strong>：三個估計非常接近，因為分佈集中。
            大樣本下 posterior 通常變尖——這是 Bernstein–von Mises 定理的效果。</p>
          }
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>到底該報告哪個？</h4>
      <ul class="advice">
        <li><strong>對稱、單峰</strong>：隨便選——實務上通常用 <em>mean</em>（有 closed-form）</li>
        <li><strong>右偏 / 左偏</strong>：<em>median</em> 更穩健、抗極端尾</li>
        <li><strong>多峰</strong>：不要報告單一點——<em>畫出整個分佈</em>或報告多個候選</li>
        <li><strong>高維</strong>：高維的均值可能是「0 機率點」（維度詛咒）——用 MAP 或模式追蹤</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        貝氏的真正答案是整個 posterior，不是一個數字。
        要被迫給一個數字時，注意 mean / median / MAP 在非對稱分佈可以差很多。
        這一章結束——下一章進入第一個經典：Beta-Binomial 共軛。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .estim { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .estim th, .estim td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .estim th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .estim td:first-child strong { color: var(--accent); }

    .shape-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }

    .plot { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.bl { border-color: #5a8aa8; }
    .st.grn { border-color: #5ca878; }
    .st.org { border-color: #b06c4a; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.bl .st-v { color: #5a8aa8; }
    .st.grn .st-v { color: #5ca878; }
    .st.org .st-v { color: #b06c4a; }

    .explain { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
    .explain strong { color: var(--accent); }
    .explain em { color: var(--text); font-style: normal; font-weight: 600; }

    .advice { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .advice strong { color: var(--accent); }
    .advice em { color: var(--text); font-style: normal; font-weight: 600; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class BayesCh1PointEstimatesComponent {
  readonly shape = signal<Shape>('right-skew');

  mapX(t: number): number { return 40 + (t / 10) * 380; }

  private density(x: number): number {
    if (x < 0 || x > 10) return 0;
    const s = this.shape();
    if (s === 'symmetric') return Math.exp(-((x - 5) ** 2) / 2.5);
    if (s === 'right-skew') {
      if (x <= 0) return 0;
      const a = 2, b = 4;
      return Math.pow(x / 10, a - 1) * Math.pow(1 - x / 10, b - 1);
    }
    if (s === 'sharp') return Math.exp(-((x - 5) ** 2) * 4);
    // bimodal
    return Math.exp(-((x - 3) ** 2) * 0.8) + 0.8 * Math.exp(-((x - 7) ** 2) * 0.6);
  }

  private normFactor(): number {
    const N = 500;
    let s = 0;
    for (let i = 0; i < N; i++) s += this.density((i + 0.5) * 10 / N);
    return s * 10 / N;
  }

  readonly mean = computed(() => {
    const N = 500;
    const norm = this.normFactor();
    let s = 0;
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * 10 / N;
      s += x * this.density(x);
    }
    return s * 10 / N / norm;
  });

  readonly median = computed(() => {
    const N = 500;
    const norm = this.normFactor();
    let cum = 0;
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * 10 / N;
      cum += this.density(x) * 10 / N / norm;
      if (cum >= 0.5) return x;
    }
    return 5;
  });

  readonly mode = computed(() => {
    const N = 500;
    let best = 0, bestX = 0;
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * 10 / N;
      const d = this.density(x);
      if (d > best) { best = d; bestX = x; }
    }
    return bestX;
  });

  postPath(): string {
    const N = 300;
    let peak = 1e-12;
    for (let i = 0; i < N; i++) peak = Math.max(peak, this.density(i * 10 / N));
    const pts: string[] = [`M 40 230`];
    for (let i = 0; i <= N; i++) {
      const x = i * 10 / N;
      const y = this.density(x);
      const px = 40 + (x / 10) * 380;
      const py = 230 - (y / peak) * 200;
      pts.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    pts.push(`L 420 230 Z`);
    return pts.join(' ');
  }
}
