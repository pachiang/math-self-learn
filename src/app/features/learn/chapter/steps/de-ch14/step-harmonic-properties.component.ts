import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch14-harmonic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="調和函數的神奇性質" subtitle="§14.2">
      <p>
        滿足 <code>Δu = 0</code> 的函數 u 稱為<strong>調和函數</strong>。
        它們有一連串相互糾纏的優美性質，這裡逐一介紹。
      </p>

      <h4>性質 1：平均值性質（Mean Value Property）</h4>
      <div class="prop-box">
        <div class="prop-title">MVP</div>
        <p>
          如果 u 在包含圓盤 B(x₀, r) 的開集上調和，則：
        </p>
        <div class="centered-eq">
          u(x₀) = (1 / 2πr) ∮_|x−x₀|=r u(x) dℓ
        </div>
        <p>
          「<strong>中心值 = 邊界圓平均值</strong>」——不管半徑多大（只要圓在定義域內）。
        </p>
      </div>

      <h4>性質 2：最大值原理（Maximum Principle）</h4>
      <div class="prop-box">
        <div class="prop-title">Max</div>
        <p>
          在有界區域 Ω 上若 u 調和、在邊界連續，則 <strong>u 的最大（小）值必在邊界上達到</strong>。
          內部不可能有嚴格最大值。
        </p>
        <p class="why">
          <strong>為什麼？</strong> 如果內部某點 x₀ 是嚴格最大，
          取小圓盤用 MVP：邊界平均值 = u(x₀) → 但邊界上每點 ≤ u(x₀) → 所有邊界點也等於 u(x₀)。
          把這個推論展開，可以證 u 為常數——跟「嚴格」矛盾。
        </p>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="點擊任意點：看該點的值 = 周圍圓環平均值">
      <div class="mvp-viz">
        <svg viewBox="-10 -10 420 220" class="mvp-svg" (click)="pickPoint($event)">
          <rect x="0" y="0" width="400" height="200" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1.5" />
          @for (cell of heatCells(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.s" [attr.height]="cell.s"
              [attr.fill]="cell.color" opacity="0.9" />
          }
          <!-- Sampling circle -->
          <circle [attr.cx]="px()" [attr.cy]="py()" [attr.r]="radiusPx()"
            fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3" />
          <circle [attr.cx]="px()" [attr.cy]="py()" r="4" fill="var(--accent)" stroke="white" stroke-width="1.5" />
          <!-- Sample points on circle -->
          @for (sp of samplePoints(); track $index) {
            <circle [attr.cx]="sp.x" [attr.cy]="sp.y" r="2.5" fill="#ba8d2a" />
          }
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">半徑 r</span>
          <input type="range" min="10" max="60" step="1" [value]="radiusPx()"
            (input)="radiusPx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ radiusPx() }} px</span>
        </div>
        <p class="hint">點擊金屬方塊中的任一點設定觀察中心。</p>
      </div>

      <div class="result-row">
        <div class="res">
          <div class="res-lab">中心值</div>
          <div class="res-val">{{ centerVal().toFixed(3) }}</div>
        </div>
        <div class="res eq">=</div>
        <div class="res">
          <div class="res-lab">圓環平均</div>
          <div class="res-val">{{ circleAvg().toFixed(3) }}</div>
        </div>
        <div class="res diff">
          <div class="res-lab">誤差</div>
          <div class="res-val">{{ Math.abs(centerVal() - circleAvg()).toFixed(4) }}</div>
        </div>
      </div>

      <p class="note">
        任意中心、任意半徑都成立（數值上有小誤差——因為離散化）。
        這個性質讓調和函數<strong>沒有任何「局部」信息</strong>，
        每個內部值都由整個邊界決定。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>性質 3：Liouville 定理</h4>
      <div class="prop-box">
        <p>
          在整個 ℝⁿ 上調和且有界的函數必為<strong>常數</strong>。
          （這個結論在複分析也出現過——不是巧合，因為複解析函數的實部就是調和的。）
        </p>
      </div>

      <h4>性質 4：解析性</h4>
      <div class="prop-box">
        <p>
          調和函數自動<strong>無窮可微、且是解析的</strong>（在其定義域內能展成 Taylor 級數）。
          這是「僅假設連續二階可微 + Δu = 0」就能推出的，非常強。
        </p>
      </div>

      <h4>性質 5：解的唯一性</h4>
      <div class="prop-box">
        <p>
          <strong>Dirichlet 問題的唯一性</strong>：
          若 u, v 都在 Ω 調和、在 ∂Ω 取相同值，則 u ≡ v。
          <br><br>
          <strong>證：</strong> w = u − v 是調和的，在 ∂Ω 為 0。由最大值原理，
          w 在 Ω 的最大、最小都是 0 → w ≡ 0 → u = v。
        </p>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        調和函數是最「規矩」的函數——沒有局部極值、沒有銳利特徵、完全由邊界決定。
        這些性質交織成一個強大的工具箱。下一節用它們解決<strong>Dirichlet 問題</strong>：
        給定邊界值，找滿足的調和延拓。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .prop-box { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin: 10px 0; position: relative; }
    .prop-title { position: absolute; top: -10px; left: 14px; background: var(--accent); color: white; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .prop-box p { margin: 4px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .prop-box .why { font-size: 12px; background: var(--bg); padding: 8px 10px; border-radius: 6px; margin-top: 8px; }
    .prop-box strong { color: var(--accent); }

    .mvp-viz { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .mvp-svg { width: 100%; display: block; cursor: crosshair; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }
    .hint { font-size: 11px; color: var(--text-muted); margin: 0; }

    .result-row { display: grid; grid-template-columns: 1fr 20px 1fr 1fr; gap: 6px; margin-top: 10px; }
    .res { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; text-align: center; }
    .res.eq { display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--accent); font-weight: 700; border: none; background: transparent; padding: 0; }
    .res.diff { background: rgba(92, 168, 120, 0.08); border-color: #5ca878; }
    .res-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .res-val { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .res.diff .res-val { color: #5ca878; }

    .note { padding: 12px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .note strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh14HarmonicComponent {
  readonly Math = Math;
  readonly px = signal(200);
  readonly py = signal(100);
  readonly radiusPx = signal(40);

  /** Use same "four sides" Laplace solution as §14.1 with fixed BC */
  private readonly topT = 1;
  private readonly bottomT = -0.5;
  private readonly leftT = 0.3;
  private readonly rightT = -0.2;

  private uAt(i: number, j: number): number {
    const xs = i / 400;
    const ys = 1 - j / 200;
    return laplaceSol(xs, ys, this.topT, this.bottomT, this.leftT, this.rightT);
  }

  pickPoint(evt: MouseEvent) {
    const svg = evt.target as SVGElement;
    const rect = (svg.closest('svg') || svg).getBoundingClientRect();
    const scaleX = 420 / rect.width;
    const scaleY = 220 / rect.height;
    const vx = (evt.clientX - rect.left) * scaleX - 10;
    const vy = (evt.clientY - rect.top) * scaleY - 10;
    if (vx < 0 || vx > 400 || vy < 0 || vy > 200) return;
    this.px.set(vx);
    this.py.set(vy);
  }

  readonly samplePoints = computed(() => {
    const cx = this.px();
    const cy = this.py();
    const r = this.radiusPx();
    const n = 16;
    const pts: Array<{ x: number; y: number }> = [];
    for (let k = 0; k < n; k++) {
      const theta = (2 * Math.PI * k) / n;
      pts.push({ x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) });
    }
    return pts;
  });

  readonly centerVal = computed(() => this.uAt(this.px(), this.py()));

  readonly circleAvg = computed(() => {
    const cx = this.px();
    const cy = this.py();
    const r = this.radiusPx();
    const N = 64;
    let sum = 0;
    for (let k = 0; k < N; k++) {
      const theta = (2 * Math.PI * k) / N;
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      sum += this.uAt(x, y);
    }
    return sum / N;
  });

  readonly heatCells = computed(() => {
    const grid = 50;
    const cellSize = 400 / grid;
    const gridY = 25;
    const cellSizeY = 200 / gridY;
    const out: Array<{ id: string; x: number; y: number; s: number; color: string }> = [];
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < gridY; j++) {
        const xs = (i + 0.5) / grid;
        const ys = 1 - (j + 0.5) / gridY;
        const u = laplaceSol(xs, ys, this.topT, this.bottomT, this.leftT, this.rightT);
        out.push({ id: `${i}_${j}`, x: i * cellSize, y: j * cellSizeY, s: Math.max(cellSize, cellSizeY) + 0.5, color: tempColor(u) });
      }
    }
    return out;
  });
}

function laplaceSol(x: number, y: number, top: number, bottom: number, left: number, right: number): number {
  const M = 8;
  let u = 0;
  for (let n = 1; n <= M; n += 2) {
    u += (4 * top / (n * Math.PI)) * Math.sin(n * Math.PI * x) * Math.sinh(n * Math.PI * y) / Math.sinh(n * Math.PI);
    u += (4 * bottom / (n * Math.PI)) * Math.sin(n * Math.PI * x) * Math.sinh(n * Math.PI * (1 - y)) / Math.sinh(n * Math.PI);
    u += (4 * left / (n * Math.PI)) * Math.sin(n * Math.PI * y) * Math.sinh(n * Math.PI * (1 - x)) / Math.sinh(n * Math.PI);
    u += (4 * right / (n * Math.PI)) * Math.sin(n * Math.PI * y) * Math.sinh(n * Math.PI * x) / Math.sinh(n * Math.PI);
  }
  return u;
}

function tempColor(v: number): string {
  const t = Math.max(-1, Math.min(1, v));
  if (t >= 0) {
    const s = t;
    return `rgb(${Math.round(240 - 20 * (1 - s))}, ${Math.round(220 - 150 * s)}, ${Math.round(210 - 150 * s)})`;
  } else {
    const s = -t;
    return `rgb(${Math.round(210 - 100 * s)}, ${Math.round(220 - 30 * s)}, ${Math.round(240 - 10 * s)})`;
  }
}
