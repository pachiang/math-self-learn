import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type Pattern = 'good' | 'nonlinear' | 'hetero' | 'outlier';

@Component({
  selector: 'app-reg-ch1-residuals',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="殘差圖：模型的誠實報告" subtitle="§1.3">
      <p>
        擬合後一定要看殘差。<strong>殘差圖 (residuals vs fitted)</strong> 把「什麼被解釋了」放一邊，
        直接盯著「什麼沒被解釋」——模型所有的缺陷都藏在這裡。
      </p>

      <h4>健康殘差的兩個條件</h4>
      <ol class="conds">
        <li><strong>隨機散佈</strong>：在 y = 0 水平線上下均勻分佈，<em>沒有</em>結構</li>
        <li><strong>均勻散度</strong>：沿 x 軸散度大致不變（等變異數 / homoscedasticity）</li>
      </ol>

      <h4>四種病徵</h4>
      <table class="symptom">
        <thead><tr><th>殘差圖樣貌</th><th>問題</th><th>處方</th></tr></thead>
        <tbody>
          <tr><td>隨機霧</td><td class="ok">健康</td><td>—</td></tr>
          <tr><td>微笑 / 皺眉曲線</td><td>模型漏掉非線性</td><td>加 x²、log、spline</td></tr>
          <tr><td>喇叭型散度擴張</td><td>異方差</td><td>log-Y、WLS、robust SE</td></tr>
          <tr><td>幾個遠離的點</td><td>離群 / 高影響力</td><td>查資料、回到 Ch4 診斷</td></tr>
        </tbody>
      </table>
    </app-prose-block>

    <app-challenge-card prompt="切換四種情境：左為擬合圖、右為殘差圖。看看殘差如何「供出」問題">
      <div class="pat-tabs">
        <button class="pill" [class.active]="pattern() === 'good'" (click)="pattern.set('good')">健康</button>
        <button class="pill" [class.active]="pattern() === 'nonlinear'" (click)="pattern.set('nonlinear')">非線性</button>
        <button class="pill" [class.active]="pattern() === 'hetero'" (click)="pattern.set('hetero')">異方差</button>
        <button class="pill" [class.active]="pattern() === 'outlier'" (click)="pattern.set('outlier')">離群點</button>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">擬合圖 y ~ x</div>
          <svg viewBox="0 0 220 220" class="p-svg">
            <line x1="24" y1="200" x2="210" y2="200" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="10" x2="24" y2="200" stroke="var(--border-strong)" stroke-width="1" />
            <line [attr.x1]="24" [attr.y1]="fitY(0, 200)" [attr.x2]="210" [attr.y2]="fitY(10, 200)"
                  stroke="var(--accent)" stroke-width="2" />
            @for (p of pts(); track $index) {
              <circle [attr.cx]="mapFitX(p.x)" [attr.cy]="mapFitY(p.y)" r="3" fill="var(--text)" />
            }
            <text x="117" y="215" class="tk" text-anchor="middle">x</text>
            <text x="13" y="105" class="tk">y</text>
          </svg>
          <div class="r2-tag">R² = {{ r2().toFixed(3) }}</div>
        </div>

        <div class="p">
          <div class="p-title">殘差 vs 擬合值</div>
          <svg viewBox="0 0 220 220" class="p-svg">
            <line x1="24" y1="105" x2="210" y2="105" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="3 2" />
            <line x1="24" y1="10" x2="24" y2="200" stroke="var(--border-strong)" stroke-width="1" />
            <!-- LOESS-ish smoother -->
            <path [attr.d]="smootherPath()" fill="none" stroke="#b06c4a" stroke-width="1.4" stroke-dasharray="4 2" opacity="0.7" />
            @for (p of pts(); track $index) {
              <circle [attr.cx]="mapResFit(p.yhat)" [attr.cy]="mapResY(p.res)" r="3" fill="var(--text)" />
            }
            <text x="117" y="215" class="tk" text-anchor="middle">ŷ</text>
            <text x="13" y="25" class="tk">res</text>
            <text x="28" y="110" class="tk" fill="#5ca878">0</text>
          </svg>
          <div class="diag-tag" [class.ok]="diagnosis() === '健康'">{{ diagnosis() }}</div>
        </div>
      </div>

      <p class="note">
        <strong>「健康」</strong>：殘差像雲，LOESS 貼近 0——OK。<br>
        <strong>「非線性」</strong>：殘差呈 U 形——直線漏掉彎曲，需加 x² 項或轉換。<br>
        <strong>「異方差」</strong>：殘差散度隨 ŷ 變大——考慮 log(y) 或 WLS。<br>
        <strong>「離群點」</strong>：一兩顆殘差特別大——手動檢查是否資料錯誤。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        擬合完<em>先看殘差</em>。R² 告訴你模型抓到多少、殘差圖告訴你模型漏了什麼。
        第 4 章會把這一頁擴展成完整的「診斷四件套」。
      </p>
    </app-prose-block>
  `,
  styles: `
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .conds { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .conds strong { color: var(--accent); }
    .conds em { color: var(--text); font-style: normal; font-weight: 700; }

    .symptom { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .symptom th, .symptom td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .symptom th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .symptom td.ok { color: #5ca878; font-weight: 600; }

    .pat-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .r2-tag, .diag-tag { font-size: 11px; text-align: center; color: var(--text-muted); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
    .diag-tag { color: #b06c4a; font-weight: 700; }
    .diag-tag.ok { color: #5ca878; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh1ResidualsComponent {
  readonly pattern = signal<Pattern>('good');

  readonly pts = computed(() => {
    const p = this.pattern();
    const rng = this.mulberry(7);
    const n = 25;
    const out: Array<{ x: number; y: number; yhat: number; res: number }> = [];
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < n; i++) {
      const x = 0.5 + (i * 9) / n;
      let y = 5;
      if (p === 'good') y = 1 + 0.8 * x + (rng() - 0.5) * 1.0;
      else if (p === 'nonlinear') y = 1 + 0.5 * (x - 5) ** 2 / 3 + 3 + (rng() - 0.5) * 0.6;
      else if (p === 'hetero') y = 1 + 0.8 * x + (rng() - 0.5) * x * 0.6;
      else {
        y = 1 + 0.8 * x + (rng() - 0.5) * 0.8;
        if (i === 5) y = 9;
        if (i === 20) y = 8.5;
      }
      xs.push(x); ys.push(y);
    }
    const xb = xs.reduce((a, b) => a + b, 0) / n;
    const yb = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((s, x, i) => s + (x - xb) * (ys[i] - yb), 0);
    const den = xs.reduce((s, x) => s + (x - xb) ** 2, 0);
    const b1 = num / den;
    const b0 = yb - b1 * xb;
    for (let i = 0; i < n; i++) {
      const yhat = b0 + b1 * xs[i];
      out.push({ x: xs[i], y: ys[i], yhat, res: ys[i] - yhat });
    }
    return out;
  });

  readonly betaCache = computed(() => {
    const p = this.pts();
    const xb = p.reduce((s, v) => s + v.x, 0) / p.length;
    const yb = p.reduce((s, v) => s + v.y, 0) / p.length;
    const num = p.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = p.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    const b1 = num / den;
    return { b0: yb - b1 * xb, b1 };
  });

  readonly r2 = computed(() => {
    const p = this.pts();
    const yb = p.reduce((s, v) => s + v.y, 0) / p.length;
    const sst = p.reduce((s, v) => s + (v.y - yb) ** 2, 0);
    const sse = p.reduce((s, v) => s + v.res ** 2, 0);
    return sst > 1e-9 ? 1 - sse / sst : 0;
  });

  readonly diagnosis = computed(() => {
    switch (this.pattern()) {
      case 'good': return '健康';
      case 'nonlinear': return '非線性遺漏';
      case 'hetero': return '異方差';
      case 'outlier': return '有離群點';
    }
  });

  fitY(x: number, _h: number): number {
    const b = this.betaCache();
    const y = b.b0 + b.b1 * x;
    return this.mapFitY(y);
  }

  mapFitX(x: number): number { return 24 + (x / 10) * 186; }
  mapFitY(y: number): number { return 200 - (y / 10) * 190; }
  mapResFit(yhat: number): number {
    const minY = this.minYhat(), maxY = this.maxYhat();
    const r = maxY - minY;
    return 24 + ((yhat - minY) / r) * 186;
  }
  mapResY(res: number): number {
    return 105 - (res / this.resRange()) * 85;
  }

  private minYhat(): number {
    return Math.min(...this.pts().map(p => p.yhat));
  }
  private maxYhat(): number {
    return Math.max(...this.pts().map(p => p.yhat));
  }
  private resRange(): number {
    return Math.max(1, Math.max(...this.pts().map(p => Math.abs(p.res))) * 1.2);
  }

  smootherPath(): string {
    const p = this.pts();
    const sorted = [...p].sort((a, b) => a.yhat - b.yhat);
    // Simple moving average smoother
    const w = 5;
    const pts: string[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const lo = Math.max(0, i - w), hi = Math.min(sorted.length - 1, i + w);
      let avg = 0;
      for (let j = lo; j <= hi; j++) avg += sorted[j].res;
      avg /= hi - lo + 1;
      const px = this.mapResFit(sorted[i].yhat);
      const py = this.mapResY(avg);
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
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
