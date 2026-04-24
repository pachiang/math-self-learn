import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function normPdf(x: number, mu: number, sigma: number): number {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

@Component({
  selector: 'app-stats-ch4-power',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="檢定力 Power：偵測到真實效應的機率" subtitle="§4.3">
      <p>
        檢定力 = <strong>1 − β</strong> = 當 H₁ 為真時，正確拒絕 H₀ 的機率。<br>
        換句話說：「若真的有效應，我們多大機率能發現它？」
      </p>

      <div class="centered-eq big">
        Power = P(拒絕 H₀ | H₁ 真) = 1 − β
      </div>

      <h4>四個影響因子</h4>
      <ul class="factors">
        <li><strong>效應大小 δ = μ₁ − μ₀</strong>：δ 越大 → 越容易偵測 → 檢定力越高</li>
        <li><strong>樣本數 n</strong>：n 越大 → SE 越小 → 檢定力越高</li>
        <li><strong>變異 σ</strong>：σ 越小 → 訊號比噪音大 → 檢定力越高</li>
        <li><strong>顯著水準 α</strong>：α 越寬 → 越容易拒絕 → 檢定力越高（代價：更多 Type I）</li>
      </ul>

      <div class="key-idea">
        <strong>實務慣例：</strong>目標檢定力 ≥ 0.80。
        低檢定力 = 即使真有效應也看不到 = 研究白做。
        醫學臨床試驗設計的第一步通常是<strong>樣本大小計算（power analysis）</strong>。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="兩條鐘形：H₀ 下的 X̄ 分佈 vs H₁ 下的。綠色為檢定力區">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">真 μ₁ − μ₀</span>
          <input type="range" min="0" max="3" step="0.05" [value]="delta()"
            (input)="delta.set(+$any($event).target.value)" />
          <span class="sl-val">{{ delta().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">樣本 n</span>
          <input type="range" min="4" max="200" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">σ</span>
          <input type="range" min="0.5" max="4" step="0.1" [value]="sigma()"
            (input)="sigma.set(+$any($event).target.value)" />
          <span class="sl-val">{{ sigma().toFixed(1) }}</span>
        </div>
      </div>

      <svg viewBox="-10 -100 420 130" class="p-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        @for (i of ticks; track i) {
          <line [attr.x1]="i * 40" y1="-2" [attr.x2]="i * 40" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
        }
        <!-- H0 curve -->
        <path [attr.d]="h0Path()" fill="none" stroke="#5a8aa8" stroke-width="2" />
        <!-- H1 curve filled past critical -->
        <path [attr.d]="h1PowerRegion()" fill="#5ca878" opacity="0.5" />
        <path [attr.d]="h1Path()" fill="none" stroke="var(--accent)" stroke-width="2" />
        <!-- Critical line -->
        <line [attr.x1]="critX()" y1="-95" [attr.x2]="critX()" y2="5"
              stroke="#b06c4a" stroke-width="1.6" stroke-dasharray="3 2" />
        <text [attr.x]="critX()" y="-98" class="tk bad" text-anchor="middle">臨界值</text>
        <text x="5" y="14" class="tk">μ₀</text>
        <text x="380" y="14" class="tk acc">μ₁</text>
      </svg>

      <div class="legend">
        <span class="leg"><span class="sw bl"></span>H₀ 下的 X̄ 分佈</span>
        <span class="leg"><span class="sw acc"></span>H₁ 下的 X̄ 分佈</span>
        <span class="leg"><span class="sw grn"></span>檢定力 = 1 − β</span>
      </div>

      <div class="stats">
        <div class="st">
          <div class="st-l">效應大小 δ/σ</div>
          <div class="st-v">{{ (delta() / sigma()).toFixed(2) }}</div>
          <div class="st-d">Cohen's d</div>
        </div>
        <div class="st">
          <div class="st-l">SE = σ/√n</div>
          <div class="st-v">{{ se().toFixed(3) }}</div>
        </div>
        <div class="st hi">
          <div class="st-l">檢定力 1 − β</div>
          <div class="st-v">{{ (power() * 100).toFixed(1) }}%</div>
        </div>
        <div class="st">
          <div class="st-l">β (Type II)</div>
          <div class="st-v">{{ ((1 - power()) * 100).toFixed(1) }}%</div>
        </div>
      </div>

      <p class="note">
        試試：δ = 0.5, σ = 2, n = 10 → 檢定力 ~ 15%（幾乎沒用）<br>
        調 n 到 80 → 檢定力 ~ 80%（達到慣例標準）<br>
        這就是為什麼「研究沒顯著」常常只是因為 n 太小、不是沒效應。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        檢定力 = 能偵測真效應的機率。低檢定力 = 即使對也看不到。
        做研究前先算 power，不要事後才發現 n 太小。
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
    .factors { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .factors strong { color: var(--accent); }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 150px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .p-svg { width: 100%; display: block; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); padding: 4px 0; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.acc { fill: var(--accent); }
    .tk.bad { fill: #b06c4a; font-weight: 700; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; flex-wrap: wrap; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.bl { background: #5a8aa8; }
    .sw.acc { background: var(--accent); }
    .sw.grn { background: #5ca878; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: #5ca878; background: rgba(92, 168, 120, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.hi .st-v { color: #5ca878; }
    .st-d { font-size: 9px; color: var(--text-muted); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh4PowerComponent {
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly Z_ALPHA = 1.96;  // 95% two-sided

  readonly delta = signal(1.0);
  readonly n = signal(25);
  readonly sigma = signal(2.0);

  readonly se = computed(() => this.sigma() / Math.sqrt(this.n()));

  readonly power = computed(() => {
    const z = this.delta() / this.se();
    return 1 - normCdf(this.Z_ALPHA - z) + normCdf(-this.Z_ALPHA - z);
  });

  critX(): number {
    const se = this.se();
    const se0Offset = 2.5 * se;
    const x = this.Z_ALPHA * se;
    return this.mapX(x, se0Offset);
  }

  private mapX(xRaw: number, scale: number): number {
    const span = 8 * this.se() + this.delta();
    const xMin = -3 * this.se();
    return ((xRaw - xMin) / span) * 400;
  }

  h0Path(): string {
    return this.curvePath(0);
  }

  h1Path(): string {
    return this.curvePath(this.delta());
  }

  h1PowerRegion(): string {
    const se = this.se();
    const mu = this.delta();
    const critRaw = this.Z_ALPHA * se;
    const span = 8 * se + this.delta();
    const xMin = -3 * se;
    const pts: string[] = [];
    const peakY = normPdf(mu, mu, se);
    pts.push(`M ${this.mapX(critRaw, se).toFixed(1)} 0`);
    const N = 100;
    const xMax = 3 * se + this.delta();
    for (let i = 0; i <= N; i++) {
      const x = critRaw + ((xMax - critRaw) * i) / N;
      const y = normPdf(x, mu, se);
      const px = ((x - xMin) / span) * 400;
      const py = -(y / peakY) * 85;
      pts.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    pts.push(`L ${((xMax - xMin) / span) * 400} 0 Z`);
    return pts.join(' ');
  }

  private curvePath(muOffset: number): string {
    const se = this.se();
    const span = 8 * se + this.delta();
    const xMin = -3 * se;
    const xMax = 3 * se + this.delta();
    const N = 200;
    const pts: string[] = [];
    const peakY = normPdf(muOffset, muOffset, se);
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      const y = normPdf(x, muOffset, se);
      const px = ((x - xMin) / span) * 400;
      const py = -(y / peakY) * 85;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
