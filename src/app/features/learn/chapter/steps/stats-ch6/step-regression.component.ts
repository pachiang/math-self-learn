import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; }

@Component({
  selector: 'app-stats-ch6-regression',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="簡單線性迴歸：OLS" subtitle="§6.1">
      <p>
        有一串 (xᵢ, yᵢ) 點，想找一條線最貼近它們。模型：
      </p>
      <div class="centered-eq big">
        yᵢ = β₀ + β₁ xᵢ + εᵢ，&nbsp; εᵢ ~ N(0, σ²)
      </div>

      <h4>最小平方法 (OLS)</h4>
      <p>
        選 β₀, β₁ 讓<strong>殘差平方和</strong>最小：
      </p>
      <div class="centered-eq big">
        SSE(β) = Σ (yᵢ − β₀ − β₁ xᵢ)²
      </div>
      <p>
        對 β₀、β₁ 求導設為 0，解出：
      </p>
      <div class="centered-eq">
        β̂₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)² = Cov(x,y) / Var(x)
      </div>
      <div class="centered-eq">
        β̂₀ = ȳ − β̂₁ x̄
      </div>
      <p>
        乾淨的封閉解——這就是 OLS 的美。
      </p>

      <h4>為什麼是最小「平方」和，不是絕對值和？</h4>
      <ul class="why">
        <li>平方 → 可微 → 有解析解（L1 絕對值沒有）</li>
        <li>平方誤差對應 Normal 誤差的 MLE（§2.2）</li>
        <li>Gauss–Markov 定理：在線性無偏估計中，OLS 變異最小（BLUE）</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="點擊圖加點。看迴歸線如何自動更新；試試加一個極端點">
      <div class="canvas-wrap">
        <svg viewBox="0 0 400 250" class="p-svg" (click)="addPoint($event)">
          <!-- Axes -->
          <line x1="30" y1="220" x2="380" y2="220" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="30" y1="20" x2="30" y2="220" stroke="var(--border-strong)" stroke-width="1" />
          @for (i of ticks; track i) {
            <line [attr.x1]="30 + i * 35" y1="220" [attr.x2]="30 + i * 35" y2="224" stroke="var(--border-strong)" stroke-width="0.6" />
            <text [attr.x]="30 + i * 35" y="236" class="tk" text-anchor="middle">{{ i }}</text>
          }
          <!-- Regression line -->
          @if (pts().length >= 2) {
            <line [attr.x1]="30" [attr.y1]="mapY(beta0() + beta1() * 0)"
                  [attr.x2]="380" [attr.y2]="mapY(beta0() + beta1() * 10)"
                  stroke="var(--accent)" stroke-width="2.4" />
          }
          <!-- Residuals -->
          @if (pts().length >= 2) {
            @for (p of pts(); track $index) {
              <line [attr.x1]="mapX(p.x)" [attr.y1]="mapY(p.y)"
                    [attr.x2]="mapX(p.x)" [attr.y2]="mapY(beta0() + beta1() * p.x)"
                    stroke="#b06c4a" stroke-width="1" opacity="0.5" />
            }
          }
          <!-- Points -->
          @for (p of pts(); track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="4" fill="var(--text)" />
          }
          @if (pts().length < 2) {
            <text x="200" y="125" class="tk" text-anchor="middle">點擊空白處加點</text>
          }
        </svg>
      </div>

      <div class="actions">
        <button class="btn" (click)="demoData()">載入示範資料</button>
        <button class="btn" (click)="clear()">清空</button>
        <span class="count">目前 {{ pts().length }} 點</span>
      </div>

      @if (pts().length >= 2) {
        <div class="stats">
          <div class="st">
            <div class="st-l">β̂₀ 截距</div>
            <div class="st-v">{{ beta0().toFixed(3) }}</div>
          </div>
          <div class="st">
            <div class="st-l">β̂₁ 斜率</div>
            <div class="st-v">{{ beta1().toFixed(3) }}</div>
          </div>
          <div class="st">
            <div class="st-l">殘差平方和 SSE</div>
            <div class="st-v">{{ sse().toFixed(3) }}</div>
          </div>
          <div class="st">
            <div class="st-l">相關係數 r</div>
            <div class="st-v">{{ correlation().toFixed(3) }}</div>
          </div>
        </div>

        <p class="note">
          橘色豎線是<strong>殘差</strong>——真實 y 到預測 ŷ 的距離。
          OLS 線是讓所有殘差平方相加最小的唯一直線。
          加一個離群點試試——整條線會被強烈拉動，這是 OLS 的弱點（對極端值敏感）。
        </p>
      }
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        OLS 有封閉解：β̂₁ = Cov(x,y)/Var(x)，β̂₀ = ȳ − β̂₁ x̄。
        下一節看模型好不好：R²、殘差診斷。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .why { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }

    .canvas-wrap { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--bg); }
    .p-svg { width: 100%; display: block; cursor: crosshair; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .actions { display: flex; gap: 8px; margin-top: 10px; align-items: center; flex-wrap: wrap; }
    .btn { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); background: var(--bg); border-radius: 8px; cursor: pointer; color: var(--text-muted); }
    .btn:hover { border-color: var(--accent); color: var(--accent); }
    .count { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-left: auto; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh6RegressionComponent {
  readonly ticks = [0, 2, 4, 6, 8, 10];
  readonly pts = signal<Pt[]>([
    { x: 1, y: 2 }, { x: 2, y: 3.5 }, { x: 3, y: 5 },
    { x: 5, y: 6.5 }, { x: 7, y: 7.5 }, { x: 9, y: 9 },
  ]);

  mapX(x: number): number { return 30 + (x / 10) * 350; }
  mapY(y: number): number { return 220 - (y / 10) * 200; }
  invX(px: number): number { return ((px - 30) / 350) * 10; }
  invY(py: number): number { return ((220 - py) / 200) * 10; }

  addPoint(ev: MouseEvent) {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) * (400 / rect.width);
    const sy = (ev.clientY - rect.top) * (250 / rect.height);
    const x = this.invX(sx);
    const y = this.invY(sy);
    if (x < 0 || x > 10 || y < 0 || y > 10) return;
    this.pts.update(arr => [...arr, { x, y }]);
  }

  clear() { this.pts.set([]); }
  demoData() {
    this.pts.set([
      { x: 1, y: 2 }, { x: 2, y: 3.5 }, { x: 3, y: 5 },
      { x: 5, y: 6.5 }, { x: 7, y: 7.5 }, { x: 9, y: 9 },
    ]);
  }

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
    if (p.length < 2) return 0;
    const xb = this.xBar(), yb = this.yBar();
    const num = p.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = p.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    return den > 1e-9 ? num / den : 0;
  });

  readonly beta0 = computed(() => this.yBar() - this.beta1() * this.xBar());

  readonly sse = computed(() => {
    const p = this.pts();
    return p.reduce((s, v) => s + (v.y - this.beta0() - this.beta1() * v.x) ** 2, 0);
  });

  readonly correlation = computed(() => {
    const p = this.pts();
    if (p.length < 2) return 0;
    const xb = this.xBar(), yb = this.yBar();
    const num = p.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const dx = Math.sqrt(p.reduce((s, v) => s + (v.x - xb) ** 2, 0));
    const dy = Math.sqrt(p.reduce((s, v) => s + (v.y - yb) ** 2, 0));
    return (dx > 0 && dy > 0) ? num / (dx * dy) : 0;
  });
}
