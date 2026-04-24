import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch7-logistic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Logistic 迴歸" subtitle="§7.2">
      <p>
        Y ∈ &#123;0, 1&#125;：通過 / 不通過、購買 / 不購買。
        我們想模型化 <strong>P(Y = 1 | x)</strong>——機率要在 (0, 1) 裡。
      </p>

      <h4>Sigmoid：把 ℝ 擠進 (0, 1)</h4>
      <div class="centered-eq big">
        p(x) = σ(β₀ + β₁x) = 1 / (1 + e^−(β₀ + β₁x))
      </div>
      <p>
        反過來寫（logit 連結）：
      </p>
      <div class="centered-eq big">
        log(p / (1 − p)) = β₀ + β₁x
      </div>
      <p>
        左側是<strong>對數勝算</strong>（log-odds, logit）——
        勝算 = p/(1−p) = 「成功 vs 失敗」的比率。
      </p>

      <div class="key-idea">
        <strong>β₁ 的解讀：</strong>
        x 每升 1 單位，<em>對數勝算</em>升 β₁；
        或等價地，<em>勝算</em>乘以 e^β₁ 倍。
        e^β₁ 稱為 <strong>勝算比 (odds ratio)</strong>——臨床流行病學的通用語言。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整 β₀、β₁，看 sigmoid 如何變">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">β₀ 截距</span>
          <input type="range" min="-5" max="5" step="0.1" [value]="b0()"
            (input)="b0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b0().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">β₁ 斜率</span>
          <input type="range" min="-3" max="3" step="0.05" [value]="b1()"
            (input)="b1.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b1().toFixed(2) }}</span>
        </div>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 240" class="p-svg">
          <!-- Reference line at p = 0.5 -->
          <line x1="40" y1="120" x2="420" y2="120" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="3 2" />
          <text x="45" y="116" class="tk">0.5</text>

          <!-- y axis grid -->
          @for (p of yTicks; track p) {
            <line x1="36" [attr.y1]="mapP(p)" x2="40" [attr.y2]="mapP(p)" stroke="var(--border-strong)" stroke-width="0.8" />
            <text x="32" [attr.y]="mapP(p) + 3" class="tk" text-anchor="end">{{ p }}</text>
          }

          <line x1="40" y1="220" x2="420" y2="220" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Sigmoid curve -->
          <path [attr.d]="sigmoidPath()" fill="none" stroke="var(--accent)" stroke-width="2.4" />

          <!-- x = x_half (midpoint) -->
          @if (b1() !== 0) {
            <line [attr.x1]="mapX(xHalf())" y1="20" [attr.x2]="mapX(xHalf())" y2="220"
                  stroke="#5ca878" stroke-width="1" stroke-dasharray="3 2" />
            <text [attr.x]="mapX(xHalf())" y="236" class="tk grn" text-anchor="middle">x₅₀ = {{ xHalf().toFixed(2) }}</text>
          }

          <!-- Data points (0/1 dots) -->
          @for (p of dataPoints(); track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapP(p.y)" r="3"
                    [attr.fill]="p.y === 1 ? 'var(--accent)' : '#b06c4a'" opacity="0.6" />
          }

          <text x="420" y="236" class="tk" text-anchor="end">x</text>
          <text x="30" y="16" class="tk">p</text>
        </svg>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">p(x = 0)</div><div class="st-v">{{ sigmoid(0).toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">p(x = 5)</div><div class="st-v">{{ sigmoid(5).toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">勝算比 e^β₁</div><div class="st-v">{{ Math.exp(b1()).toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">決策分界 x₅₀</div><div class="st-v">{{ b1() !== 0 ? xHalf().toFixed(2) : '—' }}</div></div>
      </div>

      <p class="note">
        β₁ &gt; 0：x 升高 → p 增加；β₁ &lt; 0：相反；β₁ = 0：p 不隨 x 變。<br>
        β₀ 移動整條 sigmoid；β₁ 控制陡峭程度。<br>
        <strong>Sigmoid 的美</strong>：線性世界的 β 與曲線的位置、陡度有直接幾何意義。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>訓練：MLE（伯努利）</h4>
      <p>
        每個觀察 yᵢ ~ Bernoulli(pᵢ)，pᵢ = σ(xᵢᵀβ)。log-likelihood：
      </p>
      <div class="centered-eq">
        ℓ(β) = Σ [yᵢ log pᵢ + (1 − yᵢ) log(1 − pᵢ)]
      </div>
      <p>
        這就是機器學習裡的「交叉熵損失」——最小化負 log-likelihood 等價於最大化 likelihood。
        沒有封閉解，但 IRLS（或牛頓法、梯度下降）能解。
      </p>

      <h4>分類決策</h4>
      <p>
        預測標籤：ŷ = 1 if p(x) &gt; 0.5，else 0。<br>
        0.5 不一定是最佳閾值——若有類別不平衡、誤判成本不對等，可用 ROC 曲線挑 threshold。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Logistic 迴歸把 logit(p) 寫成線性——p 本身是 S 形。
        β 可解讀為對數勝算變化；e^β 是勝算比。
        它是分類問題的「直線」——深度學習的最後一層通常就是 logistic / softmax。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 70px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .plot { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh7LogisticComponent {
  readonly Math = Math;
  readonly yTicks = [0, 0.25, 0.5, 0.75, 1];
  readonly b0 = signal(-2);
  readonly b1 = signal(0.8);

  mapX(x: number): number { return 40 + ((x + 5) / 15) * 380; }
  mapP(p: number): number { return 220 - p * 200; }

  sigmoid(x: number): number {
    const eta = this.b0() + this.b1() * x;
    return 1 / (1 + Math.exp(-eta));
  }

  xHalf(): number {
    return -this.b0() / this.b1();
  }

  sigmoidPath(): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = -5 + (i * 15) / N;
      const px = this.mapX(x);
      const py = this.mapP(this.sigmoid(x));
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly dataPoints = computed(() => {
    const rng = this.mulberry(17);
    const out: Array<{ x: number; y: 0 | 1 }> = [];
    for (let i = 0; i < 40; i++) {
      const x = -5 + rng() * 15;
      // Use a fixed "true" logistic to generate labels: p = σ(-2 + 0.8x)
      const p = 1 / (1 + Math.exp(-(-2 + 0.8 * x)));
      const y = rng() < p ? 1 : 0;
      out.push({ x, y });
    }
    return out;
  });

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
