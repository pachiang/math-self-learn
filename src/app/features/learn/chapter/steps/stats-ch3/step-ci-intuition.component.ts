import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function randNormal(mu: number, sigma: number): number {
  const u1 = Math.random() || 1e-9;
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

@Component({
  selector: 'app-stats-ch3-ci-intuition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="信賴區間：不是機率，是程序" subtitle="§3.1">
      <p>
        點估計給一個數字，但沒告訴我們「多準」。
        <strong>信賴區間 (CI)</strong> 補上這個缺口——給一個範圍 + 一個信賴水準（常見 95%）。
      </p>

      <div class="centered-eq big">
        95% CI = 點估計 ± 1.96 · SE
      </div>

      <h4>最容易誤解的一句話</h4>
      <p class="warn">
        ❌「真實 μ 有 95% 機率落在 [a, b] 裡面」——錯的！
      </p>
      <p>
        μ 是固定的（雖然我們不知道值）；[a, b] 才是隨機的（因為它從資料算出來）。
        一次算出的 [a, b] 要嘛包含 μ、要嘛不包含，根本沒有「機率」可言。
      </p>
      <p class="ok">
        ✓ 正確詮釋：<strong>若重複抽樣、每次算 CI，長期來看有 95% 的 CI 會包含 μ。</strong>
      </p>
      <p>
        95% 是<strong>程序的可靠度</strong>，不是單一區間的機率。
        這個區別在哲學上很關鍵（也是頻率派 vs 貝氏派的分水嶺）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="重複抽樣 50 次；每次算 95% CI。看看有幾個真的包含真實 μ">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">樣本 n</span>
          <input type="range" min="5" max="100" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">信賴水準</span>
          <select (change)="level.set(+$any($event).target.value)" [value]="level()">
            <option [value]="0.80">80%</option>
            <option [value]="0.90">90%</option>
            <option [value]="0.95">95%</option>
            <option [value]="0.99">99%</option>
          </select>
        </div>
        <button class="resample" (click)="resample()">重抽 50 次</button>
      </div>

      <svg viewBox="-10 0 420 360" class="p-svg">
        <line [attr.x1]="200" y1="0" [attr.x2]="200" y2="350"
              stroke="#5ca878" stroke-width="2" stroke-dasharray="3 2" />
        <text x="200" y="10" class="tk grn" text-anchor="middle">真實 μ</text>
        @for (c of cis(); track $index) {
          <line [attr.x1]="mapX(c.lo)" [attr.y1]="20 + $index * 6.5"
                [attr.x2]="mapX(c.hi)" [attr.y2]="20 + $index * 6.5"
                [attr.stroke]="c.covers ? 'var(--accent)' : '#b06c4a'"
                stroke-width="2" />
          <circle [attr.cx]="mapX(c.est)" [attr.cy]="20 + $index * 6.5" r="1.6"
                  [attr.fill]="c.covers ? 'var(--accent)' : '#b06c4a'" />
        }
      </svg>

      <div class="stats">
        <div class="st">
          <div class="st-l">設定水準</div>
          <div class="st-v">{{ (level() * 100).toFixed(0) }}%</div>
        </div>
        <div class="st">
          <div class="st-l">實際覆蓋</div>
          <div class="st-v">{{ coverage() }} / 50</div>
          <div class="st-d">({{ (coverage() * 2).toFixed(0) }}%)</div>
        </div>
        <div class="st">
          <div class="st-l">CI 平均寬度</div>
          <div class="st-v">{{ avgWidth().toFixed(2) }}</div>
        </div>
      </div>

      <p class="note">
        你會看到：水準越高 → CI 越寬（更保險，但也更沒資訊）。<br>
        n 越大 → CI 越窄（同樣保險水準，但更精確）。<br>
        少數 CI（橘色）沒包含 μ——<strong>這是正常的</strong>，CI 本來就允許失手 5%。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        95% CI ≠ μ 有 95% 機率在裡面。<br>
        95% CI = 若一直重抽做 CI，長期 95% 會包含 μ。<br>
        下一節我們把這個哲學具象化：算 μ 的 CI 公式。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .warn { color: #b06c4a; font-weight: 600; }
    .ok { color: #5ca878; font-weight: 600; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 150px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl select { font: inherit; font-size: 13px; padding: 4px 8px; border: 1px solid var(--border); background: var(--bg); border-radius: 6px; }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .p-svg { width: 100%; display: block; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); padding: 4px 0; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st-d { font-size: 9px; color: var(--text-muted); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh3CiIntuitionComponent {
  readonly trueMu = 5;
  readonly trueSigma = 2;
  readonly TRIALS = 50;

  readonly n = signal(25);
  readonly level = signal(0.95);
  private readonly seed = signal(0);

  mapX(x: number): number {
    // range [0, 10] -> [0, 400]
    return (x / 10) * 400;
  }

  readonly cis = computed(() => {
    this.seed();
    const out: Array<{ lo: number; hi: number; est: number; covers: boolean }> = [];
    const z = this.zValue();
    for (let t = 0; t < this.TRIALS; t++) {
      let sum = 0;
      for (let i = 0; i < this.n(); i++) sum += randNormal(this.trueMu, this.trueSigma);
      const xb = sum / this.n();
      const se = this.trueSigma / Math.sqrt(this.n());
      const lo = xb - z * se;
      const hi = xb + z * se;
      out.push({ lo, hi, est: xb, covers: lo <= this.trueMu && this.trueMu <= hi });
    }
    return out;
  });

  readonly coverage = computed(() => this.cis().filter(c => c.covers).length);
  readonly avgWidth = computed(() => {
    const arr = this.cis();
    const sum = arr.reduce((a, c) => a + (c.hi - c.lo), 0);
    return sum / arr.length;
  });

  private zValue(): number {
    const l = this.level();
    if (Math.abs(l - 0.80) < 1e-6) return 1.282;
    if (Math.abs(l - 0.90) < 1e-6) return 1.645;
    if (Math.abs(l - 0.95) < 1e-6) return 1.96;
    if (Math.abs(l - 0.99) < 1e-6) return 2.576;
    return 1.96;
  }

  resample() { this.seed.update(s => s + 1); }
}
