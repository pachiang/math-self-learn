import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-stats-ch3-mean-ci',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="μ 的信賴區間：z 與 t" subtitle="§3.2">
      <h4>情況一：σ 已知（罕見，但最乾淨）</h4>
      <p>
        由 CLT：<code>(X̄ − μ) / (σ/√n) ~ N(0, 1)</code>。所以 95% CI 是：
      </p>
      <div class="centered-eq big">
        X̄ ± z_(α/2) · σ / √n
      </div>
      <p>
        常用臨界值：90% → 1.645；95% → 1.96；99% → 2.576。
      </p>

      <h4>情況二：σ 未知（實務中的預設）</h4>
      <p>
        用 S（樣本標準差）取代 σ。但這多了不確定性——
        <code>(X̄ − μ) / (S/√n) ~ t(n − 1)</code>，服從 t 分佈，不是 Normal。
      </p>
      <div class="centered-eq big">
        X̄ ± t_(α/2, n−1) · S / √n
      </div>
      <p>
        t 臨界值比 z 大一點（尾巴重），所以 CI 比較寬——反映我們對 σ 也有不確定性。
        當 n ≥ 30，t(n−1) 幾乎 = N(0,1)，實務上可直接用 z。
      </p>

      <div class="key-idea">
        <strong>四個決定 CI 寬度的旋鈕：</strong>
        <ul>
          <li>信賴水準 ↑ → CI 寬 ↑（要更保險）</li>
          <li>σ（或 S）↑ → CI 寬 ↑（資料越亂）</li>
          <li>n ↑ → CI 窄（√n 降誤差）</li>
          <li>n 小 + σ 未知 → 用 t 而不是 z → 再加一點寬</li>
        </ul>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整 n、σ、信賴水準：觀察 CI 寬度如何變化">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">樣本 n</span>
          <input type="range" min="2" max="200" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">樣本 S</span>
          <input type="range" min="0.5" max="5" step="0.1" [value]="s()"
            (input)="s.set(+$any($event).target.value)" />
          <span class="sl-val">{{ s().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">X̄</span>
          <input type="range" min="0" max="10" step="0.1" [value]="xBar()"
            (input)="xBar.set(+$any($event).target.value)" />
          <span class="sl-val">{{ xBar().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">水準</span>
          <select (change)="level.set(+$any($event).target.value)" [value]="level()">
            <option [value]="0.80">80%</option>
            <option [value]="0.90">90%</option>
            <option [value]="0.95">95%</option>
            <option [value]="0.99">99%</option>
          </select>
        </div>
      </div>

      <div class="p">
        <div class="p-title">X̄ = {{ xBar().toFixed(2) }}，兩種 CI</div>
        <svg viewBox="-10 -80 420 110" class="p-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          @for (i of ticks; track i) {
            <line [attr.x1]="i * 40" y1="-2" [attr.x2]="i * 40" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
            <text [attr.x]="i * 40" y="14" class="tk" text-anchor="middle">{{ i }}</text>
          }
          <!-- z CI -->
          <line [attr.x1]="mapX(zLo())" [attr.y1]="-50" [attr.x2]="mapX(zHi())" [attr.y2]="-50"
                stroke="#5a8aa8" stroke-width="3" />
          <circle [attr.cx]="mapX(xBar())" [attr.cy]="-50" r="3.5" fill="#5a8aa8" />
          <text x="5" y="-53" class="tk lab">z</text>
          <!-- t CI -->
          <line [attr.x1]="mapX(tLo())" [attr.y1]="-30" [attr.x2]="mapX(tHi())" [attr.y2]="-30"
                stroke="var(--accent)" stroke-width="3" />
          <circle [attr.cx]="mapX(xBar())" [attr.cy]="-30" r="3.5" fill="var(--accent)" />
          <text x="5" y="-33" class="tk lab acc">t</text>
        </svg>
      </div>

      <div class="cis">
        <div class="ci-card">
          <div class="ci-head">z 區間（假設 σ = S 已知）</div>
          <div class="ci-val">[{{ zLo().toFixed(2) }}, {{ zHi().toFixed(2) }}]</div>
          <div class="ci-w">寬度 {{ (zHi() - zLo()).toFixed(3) }}</div>
          <div class="ci-crit">z = {{ zCrit().toFixed(3) }}</div>
        </div>
        <div class="ci-card hi">
          <div class="ci-head">t 區間（σ 未知，用 S 估）</div>
          <div class="ci-val">[{{ tLo().toFixed(2) }}, {{ tHi().toFixed(2) }}]</div>
          <div class="ci-w">寬度 {{ (tHi() - tLo()).toFixed(3) }}</div>
          <div class="ci-crit">t = {{ tCrit().toFixed(3) }}</div>
        </div>
      </div>

      <p class="note">
        n 小時（例如 n = 5），t 區間明顯比 z 寬——反映小樣本對 S ≠ σ 的不確定性。
        n 超過 30，兩者幾乎重合。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        記住結構 <code>估計 ± 臨界值 · SE</code>——整章信賴區間都是這個模板。
        σ 已知用 z；未知用 t；n 大時隨便選都差不多。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 13px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea ul { margin: 6px 0 0 20px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 44px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl select { font: inherit; font-size: 13px; padding: 4px 8px; border: 1px solid var(--border); background: var(--bg); border-radius: 6px; }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; text-align: right; }

    .p { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.lab { font-size: 10px; font-weight: 700; fill: #5a8aa8; }
    .tk.lab.acc { fill: var(--accent); }

    .cis { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
    .ci-card { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; text-align: center; }
    .ci-card.hi { border-color: var(--accent-30); }
    .ci-head { font-size: 11px; color: var(--text-muted); }
    .ci-val { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 4px; }
    .ci-w { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .ci-crit { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh3MeanCiComponent {
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  readonly n = signal(20);
  readonly s = signal(2);
  readonly xBar = signal(5);
  readonly level = signal(0.95);

  mapX(x: number): number {
    return Math.max(0, Math.min(400, (x / 10) * 400));
  }

  readonly zCrit = computed(() => {
    const l = this.level();
    if (Math.abs(l - 0.80) < 1e-6) return 1.282;
    if (Math.abs(l - 0.90) < 1e-6) return 1.645;
    if (Math.abs(l - 0.95) < 1e-6) return 1.96;
    if (Math.abs(l - 0.99) < 1e-6) return 2.576;
    return 1.96;
  });

  readonly tCrit = computed(() => this.tCritical(this.n() - 1, this.level()));

  readonly se = computed(() => this.s() / Math.sqrt(this.n()));
  readonly zLo = computed(() => this.xBar() - this.zCrit() * this.se());
  readonly zHi = computed(() => this.xBar() + this.zCrit() * this.se());
  readonly tLo = computed(() => this.xBar() - this.tCrit() * this.se());
  readonly tHi = computed(() => this.xBar() + this.tCrit() * this.se());

  // Approximate t-critical via Wilson-Hilferty-esque approximation
  private tCritical(df: number, level: number): number {
    const z = this.level() === level ? this.zCrit() : 1.96;
    if (df < 1) return 12.7;
    // Fischer-Cornish small-sample correction
    return z + (z * z * z + z) / (4 * df) + (5 * Math.pow(z, 5) + 16 * Math.pow(z, 3) + 3 * z) / (96 * df * df);
  }
}
