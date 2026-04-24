import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch7-poisson',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Poisson 迴歸：計數資料" subtitle="§7.3">
      <p>
        Y = 每小時客服電話數、每年交通事故數、網頁點擊次數——
        都是 Poisson 分佈。平均率 λ &gt; 0，變異 = 平均。
      </p>

      <h4>Log link：把 λ 從 (0, ∞) 拉到 ℝ</h4>
      <div class="centered-eq big">
        log λ(x) = β₀ + β₁ x &nbsp; → &nbsp; λ(x) = e^(β₀ + β₁ x)
      </div>
      <p>
        β₁ 的解讀：x 每升 1 單位，λ <strong>乘以 e^β₁ 倍</strong>（乘法效應、不是加法）。
      </p>

      <div class="key-idea">
        <strong>為何不直接對 log(y) 做線性迴歸？</strong>
        因為 y 可能為 0，log(0) = −∞。而且 Poisson 的 Var = Mean，
        異方差很嚴重，OLS 的 SE 會錯。GLM 原生處理這個。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調 β₀, β₁，看指數曲線 vs 計數資料">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">β₀</span>
          <input type="range" min="-2" max="4" step="0.1" [value]="b0()"
            (input)="b0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b0().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">β₁</span>
          <input type="range" min="-0.5" max="0.5" step="0.01" [value]="b1()"
            (input)="b1.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b1().toFixed(2) }}</span>
        </div>
      </div>

      <div class="plot">
        <div class="p-title">資料（計數）+ 擬合曲線 λ(x) = e^(β₀ + β₁x)</div>
        <svg viewBox="0 0 440 240" class="p-svg">
          <line x1="40" y1="210" x2="420" y2="210" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="210" stroke="var(--border-strong)" stroke-width="1" />

          @for (ty of yTicks; track ty) {
            <line x1="36" [attr.y1]="mapY(ty)" x2="40" [attr.y2]="mapY(ty)" stroke="var(--border-strong)" stroke-width="0.8" />
            <text x="32" [attr.y]="mapY(ty) + 3" class="tk" text-anchor="end">{{ ty }}</text>
          }

          <path [attr.d]="lambdaPath()" fill="none" stroke="var(--accent)" stroke-width="2.4" />

          @for (p of dataPoints(); track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="3" fill="var(--text)" opacity="0.65" />
          }

          <text x="230" y="228" class="tk" text-anchor="middle">x</text>
          <text x="30" y="14" class="tk">y (計數)</text>
        </svg>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">λ(x=0)</div><div class="st-v">{{ Math.exp(b0()).toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">λ(x=5)</div><div class="st-v">{{ Math.exp(b0() + 5 * b1()).toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">倍率 e^β₁</div><div class="st-v">{{ Math.exp(b1()).toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">x+1 λ 增多少 %</div><div class="st-v">{{ ((Math.exp(b1()) - 1) * 100).toFixed(1) }}%</div></div>
      </div>

      <p class="note">
        「β₁ = 0.1」讀成：x 每多 1，λ 多約 10.5%（exp(0.1) − 1）。<br>
        負 β₁ → 曲線遞減；大正 β₁ → 指數爆炸。<br>
        把 β₁ 設到 0.5 試試——真實資料中 λ 通常不會這麼陡（否則方差太大）。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>Offset：調整暴露時間</h4>
      <p>
        實務中每個觀察的「暴露」時間可能不同（一間店觀察 1 小時 vs 3 小時）。
        用 offset 修正：
      </p>
      <div class="centered-eq">
        log λ = β₀ + β₁ x + log(exposure)
      </div>
      <p>
        把 log(exposure) 當成「係數固定為 1 的預測變數」——
        模型化的是<strong>率</strong>（每單位時間的計數）而不是絕對計數。
      </p>

      <h4>過度離散 (Overdispersion)</h4>
      <p>
        Poisson 假設 Var = Mean。真實資料常 Var &gt; Mean（可能因為潛在異質性）。
        解法：
      </p>
      <ul class="fix">
        <li><strong>Quasi-Poisson</strong>：保持均值模型，允許 Var = φ · Mean</li>
        <li><strong>Negative Binomial</strong>：明確模型化過度離散，常用且穩健</li>
        <li><strong>Zero-inflated</strong>：0 比 Poisson 預期多時（例：大多時間沒事故，偶爾有）</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        Poisson 迴歸處理「非負整數計數」——log link 讓效應變「乘法」。
        β₁ = 0.1 ≈ 率增 10%。現實中別忘了處理 offset 和過度離散。
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
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .fix { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .fix strong { color: var(--accent); }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 40px; font-family: 'JetBrains Mono', monospace; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .plot { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

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
export class RegCh7PoissonComponent {
  readonly Math = Math;
  readonly yTicks = [0, 5, 10, 15, 20];
  readonly b0 = signal(1);
  readonly b1 = signal(0.15);

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 210 - (y / 22) * 190; }

  lambdaPath(): string {
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (i * 10) / N;
      const lam = Math.exp(this.b0() + this.b1() * x);
      const px = this.mapX(x);
      const py = this.mapY(Math.min(22, lam));
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly dataPoints = computed(() => {
    // Sample Poisson(lambda) points from current model
    const rng = this.mulberry(23);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 40; i++) {
      const x = 0.3 + rng() * 9.4;
      const lam = Math.exp(this.b0() + this.b1() * x);
      // Knuth's Poisson sampler
      let L = Math.exp(-lam), k = 0, p = 1;
      do { k++; p *= rng(); } while (p > L);
      out.push({ x, y: k - 1 });
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
