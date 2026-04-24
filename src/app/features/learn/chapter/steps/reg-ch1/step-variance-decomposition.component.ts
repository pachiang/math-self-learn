import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; }

@Component({
  selector: 'app-reg-ch1-variance-decomposition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="變異數分解：SST = SSR + SSE" subtitle="§1.2">
      <p>
        每個 yᵢ 到 ȳ 的距離可以拆成兩段：「被模型解釋」+「殘差」。
      </p>
      <div class="centered-eq big">
        (yᵢ − ȳ) = (ŷᵢ − ȳ) + (yᵢ − ŷᵢ)
      </div>
      <p>
        取平方和（交叉項剛好為 0，是 OLS 的正交性保證）：
      </p>
      <div class="centered-eq big">
        Σ(yᵢ − ȳ)² = Σ(ŷᵢ − ȳ)² + Σ(yᵢ − ŷᵢ)²
      </div>
      <div class="centered-eq big">
        SST&nbsp;=&nbsp;SSR&nbsp;+&nbsp;SSE
      </div>

      <ul class="ss">
        <li><strong>SST (Total)</strong>：y 相對於 ȳ 的總變異——問題的「大小」</li>
        <li><strong>SSR (Regression)</strong>：模型解釋的變異——斜線高度差的平方和</li>
        <li><strong>SSE (Error)</strong>：殘差平方和——模型<em>沒</em>解釋的部分</li>
      </ul>

      <h4>決定係數 R²</h4>
      <div class="centered-eq big">
        R² = SSR / SST = 1 − SSE / SST
      </div>
      <p>
        R² ∈ [0, 1]：解釋變異的比例。在簡單線性迴歸 R² = r²（相關係數平方）。
      </p>
      <p class="warn">
        ⚠️ R² 只說「變異被解釋多少」，不說「模型正確」。
        完全非線性的關係用直線擬合，R² 可能還不低——下一節看殘差會揭穿。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="切換資料型態：看 SST/SSR/SSE 的幾何拆解">
      <div class="dist-tabs">
        <button class="pill" [class.active]="mode() === 'strong'" (click)="setMode('strong')">強線性</button>
        <button class="pill" [class.active]="mode() === 'weak'" (click)="setMode('weak')">弱相關</button>
        <button class="pill" [class.active]="mode() === 'none'" (click)="setMode('none')">無相關</button>
        <button class="pill" [class.active]="mode() === 'curve'" (click)="setMode('curve')">非線性</button>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 280" class="p-svg">
          <!-- Axes -->
          <line x1="40" y1="240" x2="420" y2="240" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="240" stroke="var(--border-strong)" stroke-width="1" />

          <!-- y-bar horizontal -->
          <line x1="40" [attr.y1]="mapY(yBar())" x2="420" [attr.y2]="mapY(yBar())"
                stroke="#5ca878" stroke-width="1.2" stroke-dasharray="3 2" />
          <text x="45" [attr.y]="mapY(yBar()) - 4" class="tk grn">ȳ = {{ yBar().toFixed(2) }}</text>

          <!-- Regression line -->
          <line [attr.x1]="mapX(0)" [attr.y1]="mapY(beta0())"
                [attr.x2]="mapX(10)" [attr.y2]="mapY(beta0() + beta1() * 10)"
                stroke="var(--accent)" stroke-width="2" />

          @if (showBand() === 'sst') {
            <!-- y_i to ȳ (blue) -->
            @for (p of pts(); track $index) {
              <line [attr.x1]="mapX(p.x)" [attr.y1]="mapY(p.y)"
                    [attr.x2]="mapX(p.x)" [attr.y2]="mapY(yBar())"
                    stroke="#5a8aa8" stroke-width="1.6" opacity="0.7" />
            }
          }
          @if (showBand() === 'ssr') {
            <!-- ŷ_i to ȳ (accent) -->
            @for (p of pts(); track $index) {
              <line [attr.x1]="mapX(p.x)" [attr.y1]="mapY(beta0() + beta1() * p.x)"
                    [attr.x2]="mapX(p.x)" [attr.y2]="mapY(yBar())"
                    stroke="var(--accent)" stroke-width="1.6" opacity="0.75" />
            }
          }
          @if (showBand() === 'sse') {
            <!-- y_i to ŷ_i (orange) -->
            @for (p of pts(); track $index) {
              <line [attr.x1]="mapX(p.x)" [attr.y1]="mapY(p.y)"
                    [attr.x2]="mapX(p.x)" [attr.y2]="mapY(beta0() + beta1() * p.x)"
                    stroke="#b06c4a" stroke-width="1.6" opacity="0.8" />
            }
          }

          <!-- Points -->
          @for (p of pts(); track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="4" fill="var(--text)" />
          }
        </svg>
      </div>

      <div class="band-tabs">
        <button class="btn" [class.active]="showBand() === 'sst'" (click)="showBand.set('sst')">
          <span class="sw bl"></span>SST = {{ sst().toFixed(2) }}
        </button>
        <button class="btn" [class.active]="showBand() === 'ssr'" (click)="showBand.set('ssr')">
          <span class="sw acc"></span>SSR = {{ ssr().toFixed(2) }}
        </button>
        <button class="btn" [class.active]="showBand() === 'sse'" (click)="showBand.set('sse')">
          <span class="sw org"></span>SSE = {{ sse().toFixed(2) }}
        </button>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">R²</div><div class="st-v">{{ r2().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">相關係數 r</div><div class="st-v">{{ r().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">SSR/SST</div><div class="st-v">{{ (ssr() / sst() * 100).toFixed(1) }}%</div></div>
        <div class="st"><div class="st-l">SSE/SST</div><div class="st-v">{{ (sse() / sst() * 100).toFixed(1) }}%</div></div>
      </div>

      <p class="note">
        切換「無相關」：SSR ≈ 0，SSE ≈ SST → R² ≈ 0。<br>
        切換「非線性」：R² 看似還行，但殘差會有清楚的「笑臉」模式——<em>看起來</em>擬合 ≠ <em>正確</em>擬合。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        SST = SSR + SSE 不只是代數——幾何上每個點分解成「y 對 ȳ 偏多少」 = 「模型抓到多少」+「殘差多少」。
        R² = SSR/SST 量化前者佔比。但 R² 高 ≠ 模型合理，一定要看殘差圖。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .ss { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .ss strong { color: var(--accent); }
    .ss em { color: var(--text); font-style: normal; font-weight: 600; }
    .warn { color: #b06c4a; font-size: 13px; padding: 10px; background: rgba(176, 108, 74, 0.08); border-radius: 8px; margin: 10px 0; }

    .dist-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .plot { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .band-tabs { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .btn { font: inherit; font-size: 12px; padding: 8px 12px; border: 1px solid var(--border); background: var(--bg-surface); border-radius: 8px; cursor: pointer; color: var(--text); display: inline-flex; align-items: center; gap: 6px; flex: 1; justify-content: center; font-family: 'JetBrains Mono', monospace; }
    .btn.active { border-color: var(--accent); background: var(--accent-10); color: var(--accent); font-weight: 700; }
    .sw { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
    .sw.bl { background: #5a8aa8; }
    .sw.acc { background: var(--accent); }
    .sw.org { background: #b06c4a; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note em { color: var(--accent); font-style: normal; font-weight: 600; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh1VarianceDecompositionComponent {
  readonly mode = signal<'strong' | 'weak' | 'none' | 'curve'>('strong');
  readonly showBand = signal<'sst' | 'ssr' | 'sse'>('sst');

  readonly pts = computed<Pt[]>(() => {
    const m = this.mode();
    const rng = this.mulberry(42);
    const n = 20;
    const out: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const x = 0.5 + (i * 9) / n;
      let y = 5;
      if (m === 'strong') y = 1 + 0.8 * x + (rng() - 0.5) * 1.2;
      else if (m === 'weak') y = 3 + 0.3 * x + (rng() - 0.5) * 3.5;
      else if (m === 'none') y = 5 + (rng() - 0.5) * 4;
      else y = 1 + 0.3 * (x - 5) ** 2 + (rng() - 0.5) * 0.8;
      out.push({ x, y: Math.max(0.5, Math.min(9.5, y)) });
    }
    return out;
  });

  setMode(m: 'strong' | 'weak' | 'none' | 'curve') { this.mode.set(m); }

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 240 - (y / 10) * 220; }

  readonly xBar = computed(() => {
    const p = this.pts();
    return p.reduce((s, v) => s + v.x, 0) / p.length;
  });
  readonly yBar = computed(() => {
    const p = this.pts();
    return p.reduce((s, v) => s + v.y, 0) / p.length;
  });
  readonly beta1 = computed(() => {
    const p = this.pts();
    const xb = this.xBar(), yb = this.yBar();
    const num = p.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = p.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    return den > 1e-9 ? num / den : 0;
  });
  readonly beta0 = computed(() => this.yBar() - this.beta1() * this.xBar());

  readonly sst = computed(() => {
    const p = this.pts(); const yb = this.yBar();
    return p.reduce((s, v) => s + (v.y - yb) ** 2, 0);
  });
  readonly ssr = computed(() => {
    const p = this.pts(); const yb = this.yBar();
    return p.reduce((s, v) => s + (this.beta0() + this.beta1() * v.x - yb) ** 2, 0);
  });
  readonly sse = computed(() => this.sst() - this.ssr());
  readonly r2 = computed(() => this.sst() > 1e-9 ? 1 - this.sse() / this.sst() : 0);
  readonly r = computed(() => Math.sign(this.beta1()) * Math.sqrt(Math.max(0, this.r2())));

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
