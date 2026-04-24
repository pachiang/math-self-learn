import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; id: number; }

@Component({
  selector: 'app-reg-ch1-ols',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從散點到一條線：OLS 的誕生" subtitle="§1.1">
      <p>
        給定 n 組 (xᵢ, yᵢ)，我們想找一條直線 <code>ŷ = β̂₀ + β̂₁ x</code>
        讓它「最貼近」這堆點。但「貼近」是什麼意思？
      </p>

      <h4>三個候選</h4>
      <ul class="cands">
        <li><strong>垂直距離總和</strong> Σ |yᵢ − ŷᵢ|：L1，不可微</li>
        <li><strong>垂直距離平方和</strong> Σ (yᵢ − ŷᵢ)²：L2，可微，有封閉解 ← OLS</li>
        <li><strong>歐氏距離</strong>（點到線的垂直距離）：TLS，處理 x 也有誤差的情況</li>
      </ul>

      <p>
        歷史上最早成形的是 OLS（最小平方法，Gauss & Legendre 1800s）。
        選擇 L2 不只是數學方便——它對應 Normal 誤差的 MLE，
        並由 Gauss–Markov 定理保證是所有線性無偏估計中變異最小的（第 3 章深入）。
      </p>

      <h4>封閉解</h4>
      <p>
        對 β₀, β₁ 求偏導設為 0（<em>兩個方程、兩個未知數</em>），解出：
      </p>
      <div class="centered-eq big">
        β̂₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)² = Cov(x,y) / Var(x)
      </div>
      <div class="centered-eq big">
        β̂₀ = ȳ − β̂₁ x̄
      </div>
      <p>
        直覺：斜率是「共變」除以「x 的散度」；截距讓直線<em>必定</em>通過 (x̄, ȳ)。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點擊空白加點、拖曳移動。觀察 OLS 線如何自動更新">
      <div class="canvas-wrap">
        <svg viewBox="0 0 440 300" class="p-svg"
             (click)="onClick($event)"
             (pointermove)="onDrag($event)"
             (pointerup)="endDrag()"
             (pointerleave)="endDrag()">
          <!-- Grid -->
          <g stroke="var(--border)" stroke-width="0.5">
            @for (g of gridV; track g) {
              <line [attr.x1]="mapX(g)" y1="30" [attr.x2]="mapX(g)" y2="260" />
            }
            @for (g of gridH; track g) {
              <line x1="40" [attr.y1]="mapY(g)" x2="420" [attr.y2]="mapY(g)" />
            }
          </g>
          <!-- Axes -->
          <line x1="40" y1="260" x2="420" y2="260" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="30" x2="40" y2="260" stroke="var(--border-strong)" stroke-width="1" />
          @for (i of ticks; track i) {
            <text [attr.x]="mapX(i)" y="278" class="tk" text-anchor="middle">{{ i }}</text>
            <text x="32" [attr.y]="mapY(i) + 3" class="tk" text-anchor="end">{{ i }}</text>
          }
          <text x="230" y="296" class="axis-lab" text-anchor="middle">x</text>
          <text x="20" y="145" class="axis-lab" text-anchor="middle">y</text>

          <!-- Mean center -->
          @if (pts().length >= 2) {
            <g opacity="0.5">
              <line [attr.x1]="mapX(xBar())" y1="30" [attr.x2]="mapX(xBar())" y2="260"
                    stroke="#5ca878" stroke-width="0.8" stroke-dasharray="2 2" />
              <line x1="40" [attr.y1]="mapY(yBar())" x2="420" [attr.y2]="mapY(yBar())"
                    stroke="#5ca878" stroke-width="0.8" stroke-dasharray="2 2" />
              <circle [attr.cx]="mapX(xBar())" [attr.cy]="mapY(yBar())" r="3" fill="#5ca878" />
              <text [attr.x]="mapX(xBar()) + 6" [attr.y]="mapY(yBar()) - 4" class="tk grn">(x̄, ȳ)</text>
            </g>
          }

          <!-- Regression line -->
          @if (pts().length >= 2) {
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(beta0())"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(beta0() + beta1() * 10)"
                  stroke="var(--accent)" stroke-width="2.2" />
          }
          <!-- Residuals -->
          @if (pts().length >= 2 && showRes()) {
            @for (p of pts(); track p.id) {
              <line [attr.x1]="mapX(p.x)" [attr.y1]="mapY(p.y)"
                    [attr.x2]="mapX(p.x)" [attr.y2]="mapY(beta0() + beta1() * p.x)"
                    stroke="#b06c4a" stroke-width="1.3" opacity="0.75" />
            }
          }
          <!-- Points -->
          @for (p of pts(); track p.id) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="5"
                    fill="var(--text)" stroke="var(--bg)" stroke-width="1.5"
                    (pointerdown)="startDrag(p.id, $event)" class="pt" />
          }
          @if (pts().length < 2) {
            <text x="230" y="150" class="hint" text-anchor="middle">點擊空白加點（至少 2 個）</text>
          }
        </svg>
      </div>

      <div class="actions">
        <button class="btn" (click)="showRes.set(!showRes())">{{ showRes() ? '隱藏' : '顯示' }}殘差</button>
        <button class="btn" (click)="demoLinear()">線性示範</button>
        <button class="btn" (click)="demoScatter()">含雜訊</button>
        <button class="btn" (click)="demoOutlier()">加離群點</button>
        <button class="btn" (click)="clear()">清空</button>
      </div>

      @if (pts().length >= 2) {
        <div class="stats">
          <div class="st"><div class="st-l">β̂₁ 斜率</div><div class="st-v">{{ beta1().toFixed(3) }}</div></div>
          <div class="st"><div class="st-l">β̂₀ 截距</div><div class="st-v">{{ beta0().toFixed(3) }}</div></div>
          <div class="st"><div class="st-l">SSE</div><div class="st-v">{{ sse().toFixed(2) }}</div></div>
          <div class="st"><div class="st-l">R²</div><div class="st-v">{{ r2().toFixed(3) }}</div></div>
        </div>

        <p class="note">
          觀察：<strong>(x̄, ȳ) 永遠在線上</strong>——這是截距公式 β̂₀ = ȳ − β̂₁ x̄ 的幾何意義。<br>
          試「加離群點」：整條線會被拉向那個點——OLS 對極端 y 很敏感。
        </p>
      }
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        OLS = 最小化殘差平方和。唯一解、封閉形式、過 (x̄, ȳ) 的直線。
        這是整個線性模型世界的起點——下一節看這條線「解釋了多少」變異。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .cands { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .cands strong { color: var(--accent); }

    .canvas-wrap { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--bg); touch-action: none; }
    .p-svg { width: 100%; display: block; cursor: crosshair; user-select: none; }
    .pt { cursor: grab; }
    .pt:active { cursor: grabbing; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }
    .axis-lab { font-size: 12px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .hint { font-size: 12px; fill: var(--text-muted); font-family: system-ui, sans-serif; }

    .actions { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
    .btn { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); background: var(--bg); border-radius: 8px; cursor: pointer; color: var(--text-muted); }
    .btn:hover { border-color: var(--accent); color: var(--accent); }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh1OlsComponent {
  readonly ticks = [0, 2, 4, 6, 8, 10];
  readonly gridV = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  readonly gridH = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  private nextId = 100;

  readonly pts = signal<Pt[]>([
    { x: 1, y: 2.2, id: 1 }, { x: 2, y: 3.0, id: 2 }, { x: 3, y: 4.8, id: 3 },
    { x: 4, y: 5.1, id: 4 }, { x: 6, y: 6.8, id: 5 }, { x: 7, y: 8.0, id: 6 },
    { x: 8, y: 8.4, id: 7 }, { x: 9, y: 9.2, id: 8 },
  ]);
  readonly showRes = signal(true);
  readonly dragging = signal<number | null>(null);

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 260 - (y / 10) * 230; }
  invX(px: number): number { return ((px - 40) / 380) * 10; }
  invY(py: number): number { return ((260 - py) / 230) * 10; }

  private svgCoords(ev: PointerEvent): { x: number; y: number } {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) * (440 / rect.width);
    const sy = (ev.clientY - rect.top) * (300 / rect.height);
    return { x: this.invX(sx), y: this.invY(sy) };
  }

  onClick(ev: MouseEvent) {
    if (this.dragging() !== null) return;
    const target = ev.target as Element;
    if (target.tagName.toLowerCase() === 'circle') return;
    const p = this.svgCoords(ev as unknown as PointerEvent);
    if (p.x < 0 || p.x > 10 || p.y < 0 || p.y > 10) return;
    this.pts.update(arr => [...arr, { x: p.x, y: p.y, id: this.nextId++ }]);
  }

  startDrag(id: number, ev: PointerEvent) {
    ev.stopPropagation();
    this.dragging.set(id);
  }

  onDrag(ev: PointerEvent) {
    const id = this.dragging();
    if (id === null) return;
    const p = this.svgCoords(ev);
    this.pts.update(arr => arr.map(pt =>
      pt.id === id ? { ...pt, x: Math.max(0, Math.min(10, p.x)), y: Math.max(0, Math.min(10, p.y)) } : pt
    ));
  }

  endDrag() { this.dragging.set(null); }

  clear() { this.pts.set([]); }

  demoLinear() {
    this.pts.set([
      { x: 1, y: 1.5, id: this.nextId++ }, { x: 2, y: 2.5, id: this.nextId++ },
      { x: 3, y: 3.5, id: this.nextId++ }, { x: 4, y: 4.5, id: this.nextId++ },
      { x: 5, y: 5.5, id: this.nextId++ }, { x: 6, y: 6.5, id: this.nextId++ },
      { x: 7, y: 7.5, id: this.nextId++ }, { x: 8, y: 8.5, id: this.nextId++ },
    ]);
  }

  demoScatter() {
    const noise = () => (Math.random() - 0.5) * 2;
    const out: Pt[] = [];
    for (let i = 0; i < 12; i++) {
      const x = 0.5 + (i * 9) / 12;
      out.push({ x, y: Math.max(0.5, Math.min(9.5, 0.8 * x + 1 + noise())), id: this.nextId++ });
    }
    this.pts.set(out);
  }

  demoOutlier() {
    this.demoScatter();
    this.pts.update(arr => [...arr, { x: 2, y: 9, id: this.nextId++ }]);
  }

  readonly xBar = computed(() => {
    const p = this.pts();
    return p.length ? p.reduce((s, v) => s + v.x, 0) / p.length : 0;
  });
  readonly yBar = computed(() => {
    const p = this.pts();
    return p.length ? p.reduce((s, v) => s + v.y, 0) / p.length : 0;
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
  readonly r2 = computed(() => {
    const p = this.pts();
    if (p.length < 2) return 0;
    const sst = p.reduce((s, v) => s + (v.y - this.yBar()) ** 2, 0);
    return sst > 1e-9 ? 1 - this.sse() / sst : 0;
  });
}
