import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-stats-ch4-hypothesis-framework',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="假設檢定的框架：H₀、H₁、α、β、p-value" subtitle="§4.1">
      <p>
        統計檢定就像科學法庭：
        <strong>被告（H₀）被假定無罪，除非證據夠強才判有罪（H₁）</strong>。
      </p>

      <h4>四個基本元素</h4>
      <ul class="gloss">
        <li><strong>H₀（虛無假設）</strong>：預設、無差異的立場。「藥沒效」、「硬幣公正」、「μ = 0」。</li>
        <li><strong>H₁（對立假設）</strong>：我們想證明的事情。「藥有效」、「硬幣偏」、「μ &gt; 0」。</li>
        <li><strong>顯著水準 α</strong>：<em>我們能接受的 Type I 錯誤率</em>——H₀ 真，卻誤判為 H₁ 的機率。常見 0.05。</li>
        <li><strong>p-value</strong>：<em>假設 H₀ 真，看到像這樣「或更極端」資料的機率</em>。若 p &lt; α，拒絕 H₀。</li>
      </ul>

      <h4>兩種錯誤（永遠存在的取捨）</h4>
      <table class="errors">
        <thead>
          <tr><th></th><th>H₀ 真</th><th>H₁ 真</th></tr>
        </thead>
        <tbody>
          <tr><td>不拒絕 H₀</td><td class="ok">正確 (1 − α)</td><td class="bad">Type II (β)</td></tr>
          <tr><td>拒絕 H₀</td><td class="bad">Type I (α)</td><td class="ok">正確 (1 − β = 檢定力)</td></tr>
        </tbody>
      </table>
      <p>
        Type I（冤枉無辜）＝ 把沒效的藥說成有效。<br>
        Type II（放過真凶）＝ 把有效的藥當成沒效。<br>
        兩者<strong>不能同時降低</strong>——除非增加 n。
      </p>

      <div class="key-idea">
        <strong>p-value 的正確詮釋：</strong>
        <em>若 H₀ 是真的</em>，我們會多常看到像這樣極端的資料？
        <br>p = 0.03 ≠「H₀ 有 3% 機率是真的」！
        <br>p = 0.03 = 「若 H₀ 真，看到這麼極端資料的機率是 3%」。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="投硬幣 n 次得到 k 正面。H₀：p = 0.5 vs H₁：p ≠ 0.5。算 p-value">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">n 次</span>
          <input type="range" min="10" max="500" step="5" [value]="n()"
            (input)="setN(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">k 正</span>
          <input type="range" min="0" [attr.max]="n()" step="1" [value]="k()"
            (input)="k.set(+$any($event).target.value)" />
          <span class="sl-val">{{ k() }}</span>
        </div>
      </div>

      <div class="p">
        <div class="p-title">H₀ 下 k 的分佈：Binomial(n, 0.5)。p-value = 兩尾比觀察值更極端的總機率</div>
        <svg viewBox="-10 -100 420 130" class="p-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          @for (b of histBars(); track b.x) {
            <rect [attr.x]="b.x" [attr.y]="-b.h" [attr.width]="b.w" [attr.height]="b.h"
                  [attr.fill]="b.extreme ? '#b06c4a' : 'var(--text-muted)'"
                  [attr.opacity]="b.extreme ? 0.85 : 0.4" />
          }
          <line [attr.x1]="kBarX()" y1="-95" [attr.x2]="kBarX()" y2="5"
                stroke="var(--accent)" stroke-width="2" />
          <text [attr.x]="kBarX()" y="-98" class="tk acc" text-anchor="middle">k = {{ k() }}</text>
          <text x="2" y="14" class="tk" text-anchor="start">0</text>
          <text x="398" y="14" class="tk" text-anchor="end">n = {{ n() }}</text>
        </svg>
      </div>

      <div class="stats">
        <div class="st">
          <div class="st-l">p̂ = k/n</div>
          <div class="st-v">{{ (k() / n()).toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">z 統計量</div>
          <div class="st-v">{{ zStat().toFixed(2) }}</div>
        </div>
        <div class="st" [class.sig]="pValue() < 0.05">
          <div class="st-l">p-value (雙尾)</div>
          <div class="st-v">{{ pValue().toFixed(4) }}</div>
        </div>
        <div class="st">
          <div class="st-l">在 α = 0.05</div>
          <div class="st-v">{{ pValue() < 0.05 ? '拒絕 H₀' : '不拒絕' }}</div>
        </div>
      </div>

      <p class="note">
        試試 n = 100, k = 60：p ≈ 0.057，不夠拒絕。<br>
        試試 n = 1000, k = 550：p ≈ 0.0016，強拒絕——<strong>相同比例（0.55），但 n 大 10 倍，證據強很多</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        檢定三步走：① 寫 H₀ vs H₁；② 算檢定統計量與 p-value；③ 若 p &lt; α → 拒絕 H₀。
        記住 p-value 是「資料有多奇怪」，<strong>不是</strong>「H₀ 多可能真」。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .gloss { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .gloss strong { color: var(--accent); }
    .gloss em { color: var(--text); font-style: normal; font-weight: 600; }

    .errors { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .errors th, .errors td { padding: 8px; border: 1px solid var(--border); text-align: center; }
    .errors th { background: var(--accent-10); color: var(--accent); }
    .errors td:first-child { font-weight: 600; color: var(--text); text-align: left; }
    .errors td.ok { color: #5ca878; }
    .errors td.bad { color: #b06c4a; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 50px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .p { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.acc { fill: var(--accent); font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.sig { border-color: #b06c4a; background: rgba(176, 108, 74, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.sig .st-v { color: #b06c4a; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh4HypothesisFrameworkComponent {
  readonly n = signal(100);
  readonly k = signal(55);

  setN(newN: number) {
    this.n.set(newN);
    if (this.k() > newN) this.k.set(newN);
  }

  readonly zStat = computed(() => {
    const n = this.n();
    const p = this.k() / n;
    return (p - 0.5) / Math.sqrt(0.25 / n);
  });

  readonly pValue = computed(() => {
    // two-tailed using normal approx
    const z = Math.abs(this.zStat());
    return 2 * (1 - this.normCdf(z));
  });

  kBarX(): number {
    const n = this.n();
    return ((this.k() - 0.5) / n) * 400 + (0.5 / n) * 400;
  }

  private normCdf(z: number): number {
    // Abramowitz-Stegun approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  readonly histBars = computed(() => {
    const n = this.n();
    const k = this.k();
    const mu = n / 2;
    const sigma = Math.sqrt(n * 0.25);
    const observed = Math.abs(k - mu);
    // Show binomial pdf via normal approximation for speed
    const bars: Array<{ x: number; w: number; h: number; extreme: boolean }> = [];
    const nBars = 40;
    const bw = 400 / nBars;
    for (let i = 0; i < nBars; i++) {
      const kVal = (i / nBars) * n;
      const density = Math.exp(-0.5 * ((kVal - mu) / sigma) ** 2);
      const isExtreme = Math.abs(kVal - mu) >= observed;
      bars.push({ x: i * bw, w: bw - 0.3, h: density * 85, extreme: isExtreme });
    }
    return bars;
  });
}
