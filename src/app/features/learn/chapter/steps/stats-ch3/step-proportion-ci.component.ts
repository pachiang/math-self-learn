import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-stats-ch3-proportion-ci',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="比例的 CI 與樣本大小" subtitle="§3.3">
      <p>
        民調、A/B 測試最常問：「支持率 p 的 CI 是多少？」
        由 CLT，當 np 與 n(1−p) 都夠大（經驗法則 ≥ 10），p̂ = k/n 近似常態：
      </p>
      <div class="centered-eq big">
        p̂ ± z · √(p̂(1 − p̂) / n)
      </div>
      <p>
        這叫 <strong>Wald 區間</strong>，教科書標準版，但在極端 p 或小 n 時覆蓋很糟。
        更好的是 <strong>Wilson 區間</strong>（下方互動會顯示差異）。
      </p>

      <h4>樣本大小該抓多大？</h4>
      <p>
        想把誤差邊界 E（half-width）壓到某個目標，反解 n：
      </p>
      <div class="centered-eq big">
        n = (z · √(p(1−p)) / E)²
      </div>
      <p>
        <strong>最壞情況</strong>：p = 0.5 時 p(1−p) 最大，需要最多樣本。
        這就是民調常用 ±3%（E = 0.03）、95% CI 時：
      </p>
      <div class="centered-eq">
        n = (1.96)² · 0.25 / (0.03)² ≈ 1068
      </div>
      <p>
        為什麼民調常抓 ~1000 人？不是巧合——就是這條公式。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整觀察到的 k 與 n：比較 Wald 與 Wilson 區間">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">n</span>
          <input type="range" min="5" max="1200" step="5" [value]="n()"
            (input)="setN(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">k 成功</span>
          <input type="range" min="0" [attr.max]="n()" step="1" [value]="k()"
            (input)="k.set(+$any($event).target.value)" />
          <span class="sl-val">{{ k() }}</span>
        </div>
      </div>

      <div class="data-row">
        觀察 p̂ = {{ pHat().toFixed(4) }} &nbsp;&nbsp; (k = {{ k() }} / n = {{ n() }})
      </div>

      <svg viewBox="-10 -60 420 80" class="p-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        @for (i of ticks; track i) {
          <line [attr.x1]="i * 40" y1="-2" [attr.x2]="i * 40" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
          <text [attr.x]="i * 40" y="14" class="tk" text-anchor="middle">{{ (i / 10).toFixed(1) }}</text>
        }
        <!-- Wald CI -->
        <line [attr.x1]="waldLo() * 400" y1="-35" [attr.x2]="waldHi() * 400" y2="-35"
              stroke="#5a8aa8" stroke-width="3" />
        <circle [attr.cx]="pHat() * 400" cy="-35" r="3.5" fill="#5a8aa8" />
        <text x="2" y="-38" class="tk lab">Wald</text>
        <!-- Wilson CI -->
        <line [attr.x1]="wilsonLo() * 400" y1="-18" [attr.x2]="wilsonHi() * 400" y2="-18"
              stroke="var(--accent)" stroke-width="3" />
        <circle [attr.cx]="pHat() * 400" cy="-18" r="3.5" fill="var(--accent)" />
        <text x="2" y="-21" class="tk lab acc">Wilson</text>
      </svg>

      <div class="cis">
        <div class="ci-card">
          <div class="ci-head">Wald 95% CI</div>
          <div class="ci-val">[{{ waldLo().toFixed(3) }}, {{ waldHi().toFixed(3) }}]</div>
          <div class="ci-w">寬 {{ (waldHi() - waldLo()).toFixed(3) }}</div>
        </div>
        <div class="ci-card hi">
          <div class="ci-head">Wilson 95% CI</div>
          <div class="ci-val">[{{ wilsonLo().toFixed(3) }}, {{ wilsonHi().toFixed(3) }}]</div>
          <div class="ci-w">寬 {{ (wilsonHi() - wilsonLo()).toFixed(3) }}</div>
        </div>
      </div>

      <p class="note">
        試試 <code>k = 0</code>：Wald 給出荒謬的 [0, 0]（零寬！）——
        因為 p̂(1−p̂) = 0，SE 變成 0。Wilson 會給合理的 [0, 上界]。
        實務上幾乎所有統計軟體預設已改用 Wilson 或 exact 方法。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>樣本大小表（95% 水準，假設 p = 0.5）</h4>
      <table class="stab">
        <thead>
          <tr><th>誤差邊界 E</th><th>需要 n</th></tr>
        </thead>
        <tbody>
          <tr><td>±5%</td><td>385</td></tr>
          <tr><td>±3%</td><td>1068</td></tr>
          <tr><td>±2%</td><td>2401</td></tr>
          <tr><td>±1%</td><td>9604</td></tr>
        </tbody>
      </table>
      <p>
        減半誤差 = 4 倍樣本，這就是 √n 的代價。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        比例 CI 有公式 p̂ ± 1.96√(p̂(1−p̂)/n)。
        想要 ±3%？n ≈ 1000。極端 p 或小 n 時，Wald 不可靠，改用 Wilson。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 50px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .data-row { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; text-align: center; margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }

    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.lab { font-size: 10px; font-weight: 700; fill: #5a8aa8; }
    .tk.lab.acc { fill: var(--accent); }

    .cis { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
    .ci-card { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; text-align: center; }
    .ci-card.hi { border-color: var(--accent-30); }
    .ci-head { font-size: 11px; color: var(--text-muted); }
    .ci-val { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 4px; }
    .ci-w { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .stab { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; font-family: 'JetBrains Mono', monospace; }
    .stab th, .stab td { padding: 6px 10px; border: 1px solid var(--border); text-align: center; }
    .stab th { background: var(--accent-10); color: var(--accent); font-weight: 700; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh3ProportionCiComponent {
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly n = signal(100);
  readonly k = signal(52);
  readonly Z = 1.96;

  setN(newN: number) {
    this.n.set(newN);
    if (this.k() > newN) this.k.set(newN);
  }

  readonly pHat = computed(() => this.k() / this.n());

  readonly waldLo = computed(() => {
    const p = this.pHat();
    const se = Math.sqrt((p * (1 - p)) / this.n());
    return Math.max(0, p - this.Z * se);
  });
  readonly waldHi = computed(() => {
    const p = this.pHat();
    const se = Math.sqrt((p * (1 - p)) / this.n());
    return Math.min(1, p + this.Z * se);
  });

  readonly wilsonLo = computed(() => this.wilson(false));
  readonly wilsonHi = computed(() => this.wilson(true));

  private wilson(upper: boolean): number {
    const n = this.n();
    const p = this.pHat();
    const z = this.Z;
    const denom = 1 + (z * z) / n;
    const centre = (p + (z * z) / (2 * n)) / denom;
    const halfW = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
    return Math.max(0, Math.min(1, centre + (upper ? halfW : -halfW)));
  }
}
