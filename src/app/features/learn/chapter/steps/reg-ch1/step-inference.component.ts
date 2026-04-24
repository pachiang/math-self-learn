import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function randNormal(): number {
  const u1 = Math.random() || 1e-9;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
}

@Component({
  selector: 'app-reg-ch1-inference',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="β̂₁ 的信賴區間與 t 檢定" subtitle="§1.4">
      <p>
        β̂₁ 是隨機的（資料變就變），所以它自己有抽樣分佈。
        若假設 εᵢ ~ N(0, σ²) iid：
      </p>
      <div class="centered-eq big">
        β̂₁ ~ N(β₁, σ² / Σ(xᵢ − x̄)²)
      </div>

      <h4>標準誤差 SE(β̂₁)</h4>
      <div class="centered-eq big">
        SE(β̂₁) = σ̂ / √Σ(xᵢ − x̄)²，&nbsp;&nbsp; σ̂² = SSE / (n − 2)
      </div>
      <p>
        注意 <strong>n − 2</strong>（不是 n − 1）——兩個估計參數 β̂₀, β̂₁ 消掉兩個自由度。
      </p>

      <h4>推論工具</h4>
      <ul class="tools">
        <li><strong>CI</strong>：β̂₁ ± t_(α/2, n−2) · SE(β̂₁)</li>
        <li><strong>檢定 β₁ = 0</strong>：T = β̂₁ / SE(β̂₁) ~ t(n−2)</li>
        <li><strong>p-value</strong>：查 t 表</li>
      </ul>

      <div class="key-idea">
        <strong>為什麼 β̂₁ 的 SE 隨 Σ(x − x̄)² 變小？</strong>
        x 越分散 → 槓桿越長 → 斜率越容易定。
        這解釋了實驗設計的直覺：<em>要估斜率，就把 x 拉開</em>。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整真 β₁、n、σ。觀察 β̂₁ 的抽樣分佈與 95% CI">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">真 β₁</span>
          <input type="range" min="-2" max="2" step="0.05" [value]="trueBeta1()"
            (input)="trueBeta1.set(+$any($event).target.value)" />
          <span class="sl-val">{{ trueBeta1().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">n</span>
          <input type="range" min="4" max="200" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">σ 噪音</span>
          <input type="range" min="0.1" max="3" step="0.05" [value]="sigma()"
            (input)="sigma.set(+$any($event).target.value)" />
          <span class="sl-val">{{ sigma().toFixed(2) }}</span>
        </div>
        <button class="resample" (click)="resample()">重抽 500 次</button>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">單次資料 + OLS 線</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="160" x2="210" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="10" x2="24" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            @for (p of sampleOnce(); track $index) {
              <circle [attr.cx]="mapSx(p.x)" [attr.cy]="mapSy(p.y)" r="2.4" fill="var(--text)" opacity="0.7" />
            }
            <line [attr.x1]="mapSx(0)" [attr.y1]="mapSy(sampleBeta0())"
                  [attr.x2]="mapSx(10)" [attr.y2]="mapSy(sampleBeta0() + sampleBeta1() * 10)"
                  stroke="var(--accent)" stroke-width="1.8" />
            <line [attr.x1]="mapSx(0)" [attr.y1]="mapSy(0)"
                  [attr.x2]="mapSx(10)" [attr.y2]="mapSy(trueBeta1() * 10)"
                  stroke="#5ca878" stroke-width="1.4" stroke-dasharray="3 2" />
          </svg>
        </div>
        <div class="p">
          <div class="p-title">β̂₁ 的抽樣分佈 (500 次)</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="150" x2="210" y2="150" stroke="var(--border-strong)" stroke-width="1" />
            @for (b of hist(); track b.x) {
              <rect [attr.x]="b.x" [attr.y]="150 - b.h" [attr.width]="b.w" [attr.height]="b.h"
                    fill="var(--accent)" opacity="0.7" />
            }
            <line [attr.x1]="mapBetaX(trueBeta1())" y1="20" [attr.x2]="mapBetaX(trueBeta1())" y2="160"
                  stroke="#5ca878" stroke-width="1.8" stroke-dasharray="3 2" />
            <text [attr.x]="mapBetaX(trueBeta1())" y="16" class="tk grn" text-anchor="middle">真 β₁</text>
            <text x="24" y="172" class="tk">{{ (trueBeta1() - 1).toFixed(1) }}</text>
            <text x="210" y="172" class="tk" text-anchor="end">{{ (trueBeta1() + 1).toFixed(1) }}</text>
          </svg>
        </div>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">本次 β̂₁</div><div class="st-v">{{ sampleBeta1().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">SE(β̂₁)</div><div class="st-v">{{ seBeta1().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">t = β̂₁/SE</div><div class="st-v">{{ tStat().toFixed(2) }}</div></div>
        <div class="st" [class.sig]="Math.abs(tStat()) > 2">
          <div class="st-l">β₁ = 0 顯著？</div>
          <div class="st-v">{{ Math.abs(tStat()) > 2 ? '是' : '否' }}</div>
        </div>
      </div>

      <div class="ci-band">
        95% CI：[{{ ciLo().toFixed(3) }}, {{ ciHi().toFixed(3) }}]
        <span class="ci-in" [class.ok]="ciLo() <= trueBeta1() && trueBeta1() <= ciHi()">
          {{ ciLo() <= trueBeta1() && trueBeta1() <= ciHi() ? '✓ 包含真值' : '✗ 沒包含' }}
        </span>
      </div>

      <p class="note">
        重抽 500 次後 β̂₁ 直方圖接近 Normal，中心在真 β₁ 附近，展開度由 SE 控制。
        n 變大、σ 變小 → 直方圖收窄，SE 變小，檢定力變高。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        β̂₁ 是隨機變數，服從 Normal（σ² 已知）或 t（σ² 由 S² 估）。
        CI/檢定結構和第 2 章數統的 μ 推論完全平行——
        <em>迴歸推論不過是數統的延伸</em>。第 3 章會用矩陣形式一統所有係數的推論。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .tools { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .tools strong { color: var(--accent); }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 160px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.sig { border-color: #b06c4a; background: rgba(176, 108, 74, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.sig .st-v { color: #b06c4a; }

    .ci-band { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; text-align: center; margin-top: 8px; font-family: 'JetBrains Mono', monospace; }
    .ci-in { margin-left: 10px; color: #b06c4a; font-weight: 700; }
    .ci-in.ok { color: #5ca878; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh1InferenceComponent {
  readonly Math = Math;
  readonly trueBeta0 = 0;
  readonly trueBeta1 = signal(0.8);
  readonly n = signal(30);
  readonly sigma = signal(1.2);
  private readonly seed = signal(0);

  resample() { this.seed.update(s => s + 1); }

  mapSx(x: number): number { return 24 + (x / 10) * 186; }
  mapSy(y: number): number { return 160 - (y / 10) * 150; }

  mapBetaX(b: number): number {
    const mid = this.trueBeta1();
    const lo = mid - 1, hi = mid + 1;
    return 24 + ((b - lo) / (hi - lo)) * 186;
  }

  readonly sampleOnce = computed(() => {
    this.seed();
    const n = this.n();
    const sig = this.sigma();
    const b1 = this.trueBeta1();
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const x = 0.5 + (i * 9) / n;
      const y = this.trueBeta0 + b1 * x + sig * randNormal();
      out.push({ x, y });
    }
    return out;
  });

  private fit(pts: Array<{ x: number; y: number }>) {
    const n = pts.length;
    const xb = pts.reduce((s, v) => s + v.x, 0) / n;
    const yb = pts.reduce((s, v) => s + v.y, 0) / n;
    const num = pts.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = pts.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    const b1 = num / den;
    const b0 = yb - b1 * xb;
    const sse = pts.reduce((s, v) => s + (v.y - b0 - b1 * v.x) ** 2, 0);
    const s2 = sse / (n - 2);
    const seB1 = Math.sqrt(s2 / den);
    return { b0, b1, seB1 };
  }

  readonly currentFit = computed(() => this.fit(this.sampleOnce()));
  readonly sampleBeta0 = computed(() => this.currentFit().b0);
  readonly sampleBeta1 = computed(() => this.currentFit().b1);
  readonly seBeta1 = computed(() => this.currentFit().seB1);
  readonly tStat = computed(() => this.sampleBeta1() / this.seBeta1());
  readonly ciLo = computed(() => this.sampleBeta1() - 2.0 * this.seBeta1());
  readonly ciHi = computed(() => this.sampleBeta1() + 2.0 * this.seBeta1());

  readonly betaHats = computed(() => {
    this.seed();
    const n = this.n();
    const sig = this.sigma();
    const b1True = this.trueBeta1();
    const out: number[] = [];
    for (let t = 0; t < 500; t++) {
      const pts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < n; i++) {
        const x = 0.5 + (i * 9) / n;
        pts.push({ x, y: this.trueBeta0 + b1True * x + sig * randNormal() });
      }
      out.push(this.fit(pts).b1);
    }
    return out;
  });

  readonly hist = computed(() => {
    const data = this.betaHats();
    const mid = this.trueBeta1();
    const lo = mid - 1, hi = mid + 1;
    const BINS = 30;
    const bw = 186 / BINS;
    const counts = new Array(BINS).fill(0);
    for (const b of data) {
      const idx = Math.floor(((b - lo) / (hi - lo)) * BINS);
      if (idx >= 0 && idx < BINS) counts[idx]++;
    }
    const maxC = Math.max(1, ...counts);
    return counts.map((c, i) => ({ x: 24 + i * bw, w: bw - 0.5, h: (c / maxC) * 120 }));
  });
}
