import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function randNormal(mu: number, sigma: number): number {
  const u1 = Math.random() || 1e-9;
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

@Component({
  selector: 'app-stats-ch1-sample-stats',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="樣本統計量與 Bessel 修正" subtitle="§1.2">
      <p>
        給定樣本 X₁, X₂, …, Xₙ，最常算的兩個統計量是：
      </p>
      <div class="centered-eq big">
        X̄ = (X₁ + ⋯ + Xₙ) / n
      </div>
      <div class="centered-eq big">
        S² = Σ (Xᵢ − X̄)² / (n − 1)
      </div>

      <h4>為什麼是 n − 1 而不是 n？</h4>
      <p>
        這叫 <strong>Bessel 修正</strong>。直覺是：我們拿 X̄ 當中心，
        而 X̄ 本身就是<em>用這組資料</em>算的——它已經「剛好」最小化 Σ (Xᵢ − X̄)²。
        所以用 X̄ 算出的離差會系統性地<strong>低估</strong>真實變異 σ²。
      </p>
      <p>
        除以 n 會得到偏誤估計量（E[S²ₙ] = σ²·(n−1)/n &lt; σ²）；<br>
        除以 n − 1 則無偏（E[S²] = σ²）。這條規則我們之後會在第二章嚴格證明。
      </p>

      <h4>標準誤差 (Standard Error)</h4>
      <div class="centered-eq">
        SE(X̄) = σ / √n
      </div>
      <p>
        X̄ 本身是隨機的——不同次抽樣會得到不同 X̄。
        SE 量化 X̄ 的波動；n 增為 4 倍，SE 只減半。這就是為什麼民調加大樣本邊際改善遞減。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="抽樣 n 個點；觀察 X̄ 如何收斂到 μ，S² 如何收斂到 σ²">
      <div class="truth">
        母體 N(μ = {{ trueMu }}, σ² = {{ trueSigma * trueSigma }})
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">樣本數 n</span>
          <input type="range" min="2" max="500" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <button class="resample" (click)="resample()">重新抽樣</button>
      </div>

      <svg viewBox="-10 -70 420 90" class="p-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        @for (i of ticks; track i) {
          <line [attr.x1]="i * 40" y1="-2" [attr.x2]="i * 40" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
          <text [attr.x]="i * 40" y="14" class="tk" text-anchor="middle">{{ i - 5 }}</text>
        }
        <!-- Sample points -->
        @for (x of sample(); track $index) {
          <circle [attr.cx]="(x + 5) * 40" cy="-5" r="2.4" fill="var(--accent)" opacity="0.45" />
        }
        <!-- X-bar marker -->
        <line [attr.x1]="(xBar() + 5) * 40" y1="-55" [attr.x2]="(xBar() + 5) * 40" y2="5"
              stroke="var(--accent)" stroke-width="2.4" />
        <text [attr.x]="(xBar() + 5) * 40" y="-58" class="tk acc" text-anchor="middle">X̄</text>
        <!-- True mu marker -->
        <line [attr.x1]="(trueMu + 5) * 40" y1="-40" [attr.x2]="(trueMu + 5) * 40" y2="5"
              stroke="#5ca878" stroke-width="1.6" stroke-dasharray="3 2" />
        <text [attr.x]="(trueMu + 5) * 40" y="-43" class="tk grn" text-anchor="middle">μ</text>
      </svg>

      <div class="stats">
        <div class="st">
          <div class="st-l">X̄</div>
          <div class="st-v">{{ xBar().toFixed(3) }}</div>
          <div class="st-d">誤差 {{ (xBar() - trueMu).toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">S² (n − 1)</div>
          <div class="st-v">{{ s2Unbiased().toFixed(3) }}</div>
          <div class="st-d">真 σ² = {{ (trueSigma * trueSigma).toFixed(2) }}</div>
        </div>
        <div class="st">
          <div class="st-l">S² (n)（有偏）</div>
          <div class="st-v bad">{{ s2Biased().toFixed(3) }}</div>
          <div class="st-d">永遠偏小</div>
        </div>
        <div class="st">
          <div class="st-l">SE = S/√n</div>
          <div class="st-v">{{ se().toFixed(3) }}</div>
          <div class="st-d">理論 σ/√n = {{ (trueSigma / Math.sqrt(n())).toFixed(3) }}</div>
        </div>
      </div>

      <p class="note">
        連續按「重新抽樣」：X̄ 會在 μ 附近跳，跳的幅度約 SE；
        n 變大時不只 X̄ 更靠近 μ，連<strong>跳動幅度也隨 1/√n 變小</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>小結：兩種 S²</h4>
      <ul class="sum">
        <li><code>Σ(Xᵢ − X̄)² / n</code>：樣本的實際平均偏差平方，<strong>有偏（低估 σ²）</strong>。</li>
        <li><code>Σ(Xᵢ − X̄)² / (n − 1)</code>：Bessel 修正後的無偏估計；幾乎所有統計軟體的預設。</li>
      </ul>
      <p class="key-idea">
        <strong>自由度 (degrees of freedom) 的第一次登場：</strong>
        n 個樣本，但 X̄ 把 Σ(Xᵢ − X̄) 約束為 0 ——只剩 n − 1 個獨立離差可玩。
        自由度概念之後會一路貫穿 t 分佈、χ² 分佈、迴歸分析。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        X̄ 是 μ 的自然估計，S² 是 σ² 的無偏估計（記得除 n − 1）。
        SE = σ/√n 是所有信賴區間的骨幹——下一章就會用它。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .sum { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }

    .truth { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; text-align: center; margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text); }

    .ctrl { display: flex; gap: 10px; align-items: center; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.acc { fill: var(--accent); font-weight: 700; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st-v.bad { color: #b06c4a; }
    .st-d { font-size: 9px; color: var(--text-muted); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh1SampleStatsComponent {
  readonly Math = Math;
  readonly trueMu = 1.0;
  readonly trueSigma = 1.5;
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  readonly n = signal(20);
  private readonly seed = signal(0);

  readonly sample = computed(() => {
    this.seed();
    const n = this.n();
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      let x = randNormal(this.trueMu, this.trueSigma);
      if (x < -5) x = -5;
      if (x > 5) x = 5;
      out.push(x);
    }
    return out;
  });

  readonly xBar = computed(() => {
    const s = this.sample();
    return s.reduce((a, b) => a + b, 0) / s.length;
  });

  readonly s2Unbiased = computed(() => {
    const s = this.sample();
    const m = this.xBar();
    const ss = s.reduce((a, b) => a + (b - m) ** 2, 0);
    return ss / (s.length - 1);
  });

  readonly s2Biased = computed(() => {
    const s = this.sample();
    const m = this.xBar();
    const ss = s.reduce((a, b) => a + (b - m) ** 2, 0);
    return ss / s.length;
  });

  readonly se = computed(() => Math.sqrt(this.s2Unbiased() / this.n()));

  resample() { this.seed.update(s => s + 1); }
}
