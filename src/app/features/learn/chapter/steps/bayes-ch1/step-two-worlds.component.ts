import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-bayes-ch1-two-worlds',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="頻率派 vs 貝氏派：θ 是什麼？" subtitle="§1.1">
      <p>
        統計學有兩種哲學。它們的<strong>數學</strong>幾乎一樣，
        但對「θ（未知參數）的本質」看法完全相反——這導致實務上的推論與詮釋差很多。
      </p>

      <div class="compare">
        <div class="col f">
          <div class="col-head">頻率派 (Frequentist)</div>
          <ul>
            <li>θ 是<strong>固定常數</strong>（雖然我們不知道）</li>
            <li>資料是隨機的（重複抽樣就會變）</li>
            <li>「θ 的機率分佈」<em>無意義</em></li>
            <li>95% CI = 「長期看，95% 的區間會包含 θ」（程序可靠度）</li>
            <li>p-value = 「若 H₀ 真，這麼極端資料的機率」</li>
            <li>不能使用先驗資訊</li>
          </ul>
        </div>
        <div class="col b">
          <div class="col-head">貝氏派 (Bayesian)</div>
          <ul>
            <li>θ 是<strong>隨機變數</strong>，有自己的機率分佈</li>
            <li>我們的<em>不確定性</em>就是機率</li>
            <li>「θ 在 [a, b] 的機率」<strong>有直接意義</strong></li>
            <li>95% 可信區間 = 「θ 有 95% 機率落在這裡」</li>
            <li>推論靠 posterior 分佈，不是 p-value</li>
            <li>必須使用先驗 (prior) 資訊</li>
          </ul>
        </div>
      </div>

      <h4>哪個才對？</h4>
      <p>
        都對——看你怎麼定義「機率」：
      </p>
      <ul class="def">
        <li><strong>頻率定義</strong>：長期相對頻率。拋無限次硬幣正面比例。</li>
        <li><strong>主觀定義</strong>：信念強度。「明天下雨機率」——明天不會「無限次重播」。</li>
      </ul>
      <p>
        現代實務多是「<em>混合</em>」：對 θ 用貝氏模型化不確定性，但也關心重複抽樣行為（calibration）。
        這門課專注貝氏思維——<strong>它是勾通機器學習、決策論、A/B 測試、科學推理的通用語言</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拉桿選擇「對 θ 的信念強度」，感受貝氏派的 θ 作為隨機變數">
      <div class="scenario">
        <div class="sc-title">情境：新推出的疫苗有效率 θ。你的信念是？</div>
        <div class="presets">
          <button class="preset" [class.active]="belief() === 'flat'" (click)="setBelief('flat')">完全無知</button>
          <button class="preset" [class.active]="belief() === 'skeptic'" (click)="setBelief('skeptic')">懷疑派</button>
          <button class="preset" [class.active]="belief() === 'optimist'" (click)="setBelief('optimist')">樂觀派</button>
          <button class="preset" [class.active]="belief() === 'strong'" (click)="setBelief('strong')">強信念</button>
        </div>
      </div>

      <svg viewBox="0 0 440 220" class="p-svg">
        <line x1="40" y1="190" x2="420" y2="190" stroke="var(--border-strong)" stroke-width="1" />
        <line x1="40" y1="20" x2="40" y2="190" stroke="var(--border-strong)" stroke-width="1" />
        @for (t of ticks; track t) {
          <line [attr.x1]="mapX(t)" y1="190" [attr.x2]="mapX(t)" y2="194" stroke="var(--border-strong)" stroke-width="0.8" />
          <text [attr.x]="mapX(t)" y="208" class="tk" text-anchor="middle">{{ (t / 10).toFixed(1) }}</text>
        }
        <text x="230" y="220" class="tk" text-anchor="middle">θ（疫苗有效率）</text>

        <!-- Belief curve -->
        <path [attr.d]="beliefPath()" fill="var(--accent)" opacity="0.25" stroke="var(--accent)" stroke-width="2" />
      </svg>

      <div class="info">
        <div class="row-text">
          <strong>對貝氏派</strong>：這條曲線就是 <em>「你現在對 θ 的信念」</em>——
          高峰處表示「最可能的 θ 值」，寬度表示「不確定性」。<br>
          <strong>對頻率派</strong>：這張圖沒有意義——θ 是一個數字，不是分佈。
        </div>
      </div>

      <div class="legend-boxes">
        <div class="box">
          <div class="box-h">分佈中心</div>
          <div class="box-v">{{ beliefInfo().mean.toFixed(2) }}</div>
        </div>
        <div class="box">
          <div class="box-h">不確定性 (SD)</div>
          <div class="box-v">{{ beliefInfo().sd.toFixed(2) }}</div>
        </div>
        <div class="box">
          <div class="box-h">P(θ &gt; 0.5)</div>
          <div class="box-v">{{ beliefInfo().pGt50.toFixed(2) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        貝氏派把「對 θ 的信念」寫成機率分佈。
        這讓我們能直接談「θ 是這個數字的機率」——但代價是必須公開說明<em>先驗信念</em>（prior）。
        下一節：看資料如何更新這個信念。
      </p>
    </app-prose-block>
  `,
  styles: `
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
    .col { padding: 14px; border-radius: 12px; }
    .col.f { background: rgba(90, 138, 168, 0.08); border: 1px solid rgba(90, 138, 168, 0.3); }
    .col.b { background: var(--accent-10); border: 1px solid var(--accent-30); }
    .col-head { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .col.f .col-head { color: #5a8aa8; }
    .col.b .col-head { color: var(--accent); }
    .col ul { margin: 0 0 0 18px; padding: 0; font-size: 12px; line-height: 1.8; color: var(--text-secondary); }
    .col strong { color: var(--text); }
    .col em { color: #b06c4a; font-style: normal; font-weight: 600; }

    .def { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .def strong { color: var(--accent); }
    .def em { color: var(--text); font-style: normal; font-weight: 600; }

    .scenario { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sc-title { font-size: 13px; color: var(--text); font-weight: 600; margin-bottom: 10px; text-align: center; }
    .presets { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
    .preset { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .preset.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }

    .p-svg { width: 100%; display: block; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); padding: 4px 0; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .info { padding: 12px; background: var(--bg-surface); border-radius: 10px; margin-top: 10px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); border: 1px solid var(--border); }
    .info strong { color: var(--accent); }
    .info em { color: var(--text); font-style: normal; font-weight: 600; }

    .legend-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px; }
    .box { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .box-h { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .box-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class BayesCh1TwoWorldsComponent {
  readonly ticks = [0, 2, 4, 6, 8, 10];
  readonly belief = signal<'flat' | 'skeptic' | 'optimist' | 'strong'>('optimist');

  setBelief(b: 'flat' | 'skeptic' | 'optimist' | 'strong') { this.belief.set(b); }

  mapX(t: number): number { return 40 + (t / 10) * 380; }

  private betaPdf(x: number, a: number, b: number): number {
    if (x <= 0 || x >= 1) return 0;
    // Unnormalized beta pdf - we'll normalize visually
    return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1);
  }

  private params() {
    switch (this.belief()) {
      case 'flat': return { a: 1.0, b: 1.0 };
      case 'skeptic': return { a: 2.0, b: 5.0 };
      case 'optimist': return { a: 5.0, b: 3.0 };
      case 'strong': return { a: 12.0, b: 4.0 };
    }
  }

  beliefPath(): string {
    const { a, b } = this.params();
    const pts: string[] = [];
    const N = 200;
    // Find peak for scaling
    let peak = 0;
    for (let i = 1; i < N; i++) {
      const x = i / N;
      const y = this.betaPdf(x, a, b);
      if (y > peak) peak = y;
    }
    peak = Math.max(peak, 1e-9);
    const baseY = 190;
    const maxH = 160;
    // Start at baseline
    pts.push(`M 40 ${baseY}`);
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const y = this.betaPdf(x, a, b);
      const px = 40 + x * 380;
      const py = baseY - (y / peak) * maxH;
      pts.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    pts.push(`L 420 ${baseY} Z`);
    return pts.join(' ');
  }

  beliefInfo(): { mean: number; sd: number; pGt50: number } {
    const { a, b } = this.params();
    const mean = a / (a + b);
    const variance = (a * b) / ((a + b) ** 2 * (a + b + 1));
    // Compute P(θ > 0.5) numerically
    const N = 500;
    let total = 0, above = 0;
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) / N;
      const w = this.betaPdf(x, a, b);
      total += w;
      if (x > 0.5) above += w;
    }
    return { mean, sd: Math.sqrt(variance), pGt50: above / total };
  }
}
