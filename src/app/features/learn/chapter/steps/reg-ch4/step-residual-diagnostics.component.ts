import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type Sim = 'clean' | 'missingSq' | 'hetero' | 'outliers';

@Component({
  selector: 'app-reg-ch4-residual-diagnostics',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="殘差診斷：四張必看的圖" subtitle="§4.1">
      <p>
        擬合完，軟體會給四張標準診斷圖。每張圖問不同的問題。
      </p>

      <ol class="four">
        <li><strong>殘差 vs 擬合值</strong>：線性 + 等變異嗎？</li>
        <li><strong>Scale-Location</strong> (√|standardized residual| vs ŷ)：等變異更敏銳的檢視</li>
        <li><strong>Q–Q plot</strong>（下一節）：誤差常態嗎？</li>
        <li><strong>Residuals vs Leverage</strong>（§4.3）：哪些點影響力大？</li>
      </ol>

      <h4>本節聚焦：殘差 vs 擬合 + Scale-Location</h4>
      <p>
        這兩張抓兩件事：<strong>平均</strong>是否抓對（趨勢線貼近 0）、<strong>散度</strong>是否穩定（喇叭？）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換四種情境，看兩張圖的反應">
      <div class="sim-tabs">
        <button class="pill" [class.active]="sim() === 'clean'" (click)="sim.set('clean')">乾淨</button>
        <button class="pill" [class.active]="sim() === 'missingSq'" (click)="sim.set('missingSq')">漏掉 x²</button>
        <button class="pill" [class.active]="sim() === 'hetero'" (click)="sim.set('hetero')">異方差</button>
        <button class="pill" [class.active]="sim() === 'outliers'" (click)="sim.set('outliers')">離群點</button>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">① 殘差 vs 擬合值</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="90" x2="210" y2="90" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="3 2" />
            <line x1="24" y1="10" x2="24" y2="170" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="170" x2="210" y2="170" stroke="var(--border-strong)" stroke-width="1" />
            <path [attr.d]="smootherResPath()" fill="none" stroke="#b06c4a" stroke-width="1.6" />
            @for (p of pts(); track $index) {
              <circle [attr.cx]="mapFit(p.yhat)" [attr.cy]="mapRes(p.res)" r="2.6"
                      fill="var(--text)" opacity="0.6" />
            }
            <text x="117" y="178" class="tk" text-anchor="middle">ŷ</text>
            <text x="14" y="95" class="tk grn">0</text>
          </svg>
        </div>
        <div class="p">
          <div class="p-title">② Scale-Location: √|res| vs ŷ</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="170" x2="210" y2="170" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="10" x2="24" y2="170" stroke="var(--border-strong)" stroke-width="1" />
            <path [attr.d]="smootherScalePath()" fill="none" stroke="#ba8d2a" stroke-width="1.6" />
            @for (p of pts(); track $index) {
              <circle [attr.cx]="mapFit(p.yhat)" [attr.cy]="mapScale(p.resStd)" r="2.6"
                      fill="var(--text)" opacity="0.6" />
            }
            <text x="117" y="178" class="tk" text-anchor="middle">ŷ</text>
          </svg>
        </div>
      </div>

      <div class="findings">
        @switch (sim()) {
          @case ('clean') {
            <p>
              <strong>① 雲狀、趨勢線貼近 0 ✓</strong><br>
              <strong>② 橘線平穩 ✓</strong><br>
              沒有異常——模型通過這兩關。
            </p>
          }
          @case ('missingSq') {
            <p>
              <strong>① U 形（或倒 U） ✗</strong>——模型漏掉 x² 非線性<br>
              <strong>② 可能也不平穩（殘差大在兩端）</strong><br>
              <em>修法</em>：加入 <code>x²</code> 項或用 spline（第 8 章）
            </p>
          }
          @case ('hetero') {
            <p>
              <strong>① 散度隨 ŷ 擴大（喇叭）✗</strong><br>
              <strong>② 橘線明顯上升 ✗</strong>——明確訊號<br>
              <em>修法</em>：log(y) 轉換、WLS、或 robust SE
            </p>
          }
          @case ('outliers') {
            <p>
              <strong>① 幾個殘差遠離其他 ✗</strong><br>
              <strong>② 這些點在 Scale-Location 也很突出</strong><br>
              <em>修法</em>：手動檢查資料、§4.3 的 Cook's distance
            </p>
          }
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        ① 殘差 vs 擬合：看趨勢（線性） + 散度（等變異）。
        ② Scale-Location：散度的更敏感版。
        殘差圖說謊能力為零——它會誠實招供所有問題。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .four { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .four strong { color: var(--accent); }

    .sim-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .findings { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .findings strong { color: var(--accent); }
    .findings em { color: var(--text); font-style: normal; font-weight: 600; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh4ResidualDiagnosticsComponent {
  readonly sim = signal<Sim>('clean');

  readonly pts = computed(() => {
    const s = this.sim();
    const rng = this.mulberry(31);
    const n = 40;
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i < n; i++) {
      const x = 0.3 + (i * 9.4) / n;
      let y = 0;
      if (s === 'clean') y = 1 + 0.6 * x + (rng() - 0.5) * 0.8;
      else if (s === 'missingSq') y = 1 + 0.15 * (x - 5) ** 2 + 0.3 + (rng() - 0.5) * 0.5;
      else if (s === 'hetero') y = 1 + 0.6 * x + (rng() - 0.5) * x * 0.4;
      else {
        y = 1 + 0.6 * x + (rng() - 0.5) * 0.6;
        if (i === 8) y = 9;
        if (i === 28) y = 0.5;
      }
      xs.push(x); ys.push(y);
    }
    const xb = xs.reduce((a, b) => a + b, 0) / n;
    const yb = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((s, x, i) => s + (x - xb) * (ys[i] - yb), 0);
    const den = xs.reduce((s, x) => s + (x - xb) ** 2, 0);
    const b1 = num / den;
    const b0 = yb - b1 * xb;
    const residuals = ys.map((y, i) => y - b0 - b1 * xs[i]);
    const sse = residuals.reduce((s, r) => s + r * r, 0);
    const sd = Math.sqrt(sse / (n - 2));
    return xs.map((x, i) => ({
      x, y: ys[i], yhat: b0 + b1 * x, res: residuals[i],
      resStd: Math.sqrt(Math.abs(residuals[i] / sd)),
    }));
  });

  readonly smootherResPath = computed(() => this.smoother(p => p.res, p => p.yhat, 5, 90, 50));
  readonly smootherScalePath = computed(() => this.smoother(p => p.resStd, p => p.yhat, 5, 170, 120));

  private smoother(
    fRes: (p: { x: number; res: number; resStd: number; yhat: number }) => number,
    fFit: (p: { x: number; res: number; resStd: number; yhat: number }) => number,
    w: number,
    zeroY: number,
    scale: number,
  ): string {
    const arr = [...this.pts()].sort((a, b) => fFit(a) - fFit(b));
    const pts: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      const lo = Math.max(0, i - w), hi = Math.min(arr.length - 1, i + w);
      let avg = 0;
      for (let j = lo; j <= hi; j++) avg += fRes(arr[j]);
      avg /= hi - lo + 1;
      const px = this.mapFit(fFit(arr[i]));
      const py = zeroY === 90 ? this.mapRes(avg) : this.mapScale(avg);
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  private fitRange() {
    const arr = this.pts();
    return { min: Math.min(...arr.map(p => p.yhat)), max: Math.max(...arr.map(p => p.yhat)) };
  }

  mapFit(yhat: number): number {
    const r = this.fitRange();
    return 24 + ((yhat - r.min) / (r.max - r.min)) * 186;
  }

  mapRes(res: number): number {
    const arr = this.pts();
    const maxAbs = Math.max(0.5, ...arr.map(p => Math.abs(p.res)));
    return 90 - (res / (maxAbs * 1.2)) * 75;
  }

  mapScale(v: number): number {
    const arr = this.pts();
    const maxV = Math.max(0.5, ...arr.map(p => p.resStd));
    return 170 - (v / (maxV * 1.1)) * 155;
  }

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
