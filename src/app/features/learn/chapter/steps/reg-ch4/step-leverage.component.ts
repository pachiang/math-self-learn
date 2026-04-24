import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; id: number; }

@Component({
  selector: 'app-reg-ch4-leverage',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="槓桿、離群、影響力：三個相近但不同的概念" subtitle="§4.3">
      <table class="defs">
        <thead><tr><th>概念</th><th>衡量什麼</th><th>指標</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>槓桿 (Leverage)</strong></td>
            <td>x 座標是否遠離其他點——<em>不看 y</em></td>
            <td>hᵢᵢ（帽子矩陣對角線）</td>
          </tr>
          <tr>
            <td><strong>離群 (Outlier)</strong></td>
            <td>y 和模型預測值差距大——<em>不看 x</em></td>
            <td>標準化殘差 |rᵢ| &gt; 2</td>
          </tr>
          <tr>
            <td><strong>影響力 (Influence)</strong></td>
            <td>拿掉它模型會變很多——<em>兩者乘積</em></td>
            <td>Cook's distance Dᵢ</td>
          </tr>
        </tbody>
      </table>

      <h4>三者的邏輯</h4>
      <ul class="logic">
        <li>高槓桿 + 符合趨勢 → <em>不</em>算影響力大（它把線釘得更牢）</li>
        <li>低槓桿 + 殘差大 → 離群但影響小（只影響 σ̂）</li>
        <li>高槓桿 + 殘差大 → <strong>危險！影響力大</strong>，能單手扭曲整條線</li>
      </ul>

      <div class="centered-eq big">
        Cook's Dᵢ = rᵢ² · hᵢᵢ / ((p + 1)(1 − hᵢᵢ))
      </div>
      <p>
        規則：Dᵢ &gt; 1 是明顯警訊；Dᵢ &gt; 4/n 也常用做警戒線。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖曳紅點。看 hᵢᵢ、標準化殘差、Cook's 如何變化">
      <div class="canvas-wrap">
        <svg viewBox="0 0 440 280" class="p-svg"
             (pointermove)="onDrag($event)"
             (pointerup)="endDrag()"
             (pointerleave)="endDrag()">
          <line x1="40" y1="230" x2="420" y2="230" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="230" stroke="var(--border-strong)" stroke-width="1" />
          @for (i of ticks; track i) {
            <text [attr.x]="mapX(i)" y="248" class="tk" text-anchor="middle">{{ i }}</text>
            <text x="32" [attr.y]="mapY(i) + 3" class="tk" text-anchor="end">{{ i }}</text>
          }

          <!-- Line without the flagged point -->
          @if (showBoth()) {
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(fitWithout().b0)"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(fitWithout().b0 + fitWithout().b1 * 10)"
                  stroke="#5ca878" stroke-width="1.6" stroke-dasharray="4 2" />
          }
          <!-- Line with all points -->
          <line [attr.x1]="mapX(0)" [attr.y1]="mapY(fitAll().b0)"
                [attr.x2]="mapX(10)" [attr.y2]="mapY(fitAll().b0 + fitAll().b1 * 10)"
                stroke="var(--accent)" stroke-width="2.2" />

          <!-- All points -->
          @for (p of pts(); track p.id) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)"
                    [attr.r]="p.id === draggable ? 7 : 4"
                    [attr.fill]="p.id === draggable ? '#b06c4a' : 'var(--text)'"
                    stroke="var(--bg)" stroke-width="1.5"
                    (pointerdown)="startDrag(p.id, $event)" class="pt" />
          }
        </svg>
      </div>

      <div class="legend">
        <span class="leg"><span class="sw acc"></span>含紅點的 OLS 線</span>
        <span class="leg"><span class="sw grn"></span>剔除紅點後的線</span>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">hᵢᵢ (leverage)</div><div class="st-v">{{ flagLeverage().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">標準化殘差 rᵢ</div><div class="st-v">{{ flagResStd().toFixed(2) }}</div></div>
        <div class="st" [class.warn]="flagCook() > 1">
          <div class="st-l">Cook's Dᵢ</div>
          <div class="st-v">{{ flagCook().toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">拿掉它斜率差</div>
          <div class="st-v">{{ (fitAll().b1 - fitWithout().b1).toFixed(3) }}</div>
        </div>
      </div>

      <div class="mini-panel">
        <div class="mp-lab">拉紅點到：</div>
        <button class="mp-btn" (click)="setFlag(3, 5)">① 資料中間</button>
        <button class="mp-btn" (click)="setFlag(9.5, 4.5)">② 遠 x、貼趨勢</button>
        <button class="mp-btn" (click)="setFlag(5, 9.5)">③ 中 x、離群</button>
        <button class="mp-btn warn" (click)="setFlag(9.5, 0.5)">④ 遠 x + 離群</button>
      </div>

      <p class="note">
        試完四個按鈕：
        ① 影響力極小；② h 高但殘差近 0 → D 仍小；③ 殘差大但 h 小 → D 中等；
        ④ 高 h + 高殘差 → D 爆炸、兩條線劈開。<strong>④ 就是最危險的影響力觀察</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        Leverage 看 x、Residual 看 y、Cook's 看總影響力。
        高影響力點不一定錯——可能是珍貴的資訊，也可能是輸入錯誤。
        <em>永遠把它挑出來人工檢查</em>，別自動丟。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .defs { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .defs th, .defs td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .defs th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .defs td strong { color: var(--accent); }
    .defs td em { color: var(--text); font-style: normal; font-weight: 600; }

    .logic { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .logic strong { color: #b06c4a; }
    .logic em { color: var(--text); font-style: normal; font-weight: 600; }

    .canvas-wrap { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--bg); touch-action: none; }
    .p-svg { width: 100%; display: block; user-select: none; }
    .pt { cursor: grab; }
    .pt:active { cursor: grabbing; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.acc { background: var(--accent); }
    .sw.grn { background: #5ca878; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.warn { border-color: #b06c4a; background: rgba(176, 108, 74, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.warn .st-v { color: #b06c4a; }

    .mini-panel { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; align-items: center; }
    .mp-lab { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .mp-btn { font: inherit; font-size: 11px; padding: 5px 10px; border: 1px solid var(--border); background: var(--bg-surface); border-radius: 8px; cursor: pointer; color: var(--text-secondary); }
    .mp-btn:hover { border-color: var(--accent); color: var(--accent); }
    .mp-btn.warn { border-color: rgba(176, 108, 74, 0.5); color: #b06c4a; }
    .mp-btn.warn:hover { background: rgba(176, 108, 74, 0.1); }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: #b06c4a; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh4LeverageComponent {
  readonly ticks = [0, 2, 4, 6, 8, 10];
  readonly draggable = 99;  // the red point id
  readonly showBoth = signal(true);
  readonly dragging = signal<number | null>(null);

  readonly pts = signal<Pt[]>([
    { x: 1, y: 1.8, id: 1 }, { x: 2, y: 2.5, id: 2 }, { x: 3, y: 3.1, id: 3 },
    { x: 4, y: 3.8, id: 4 }, { x: 5, y: 4.4, id: 5 }, { x: 6, y: 5.2, id: 6 },
    { x: 7, y: 5.9, id: 7 }, { x: 8, y: 6.5, id: 8 },
    { x: 3, y: 5, id: 99 },   // the draggable point, starts harmless
  ]);

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 230 - (y / 10) * 210; }
  invX(px: number): number { return ((px - 40) / 380) * 10; }
  invY(py: number): number { return ((230 - py) / 210) * 10; }

  startDrag(id: number, ev: PointerEvent) {
    if (id === this.draggable) {
      ev.stopPropagation();
      this.dragging.set(id);
    }
  }

  onDrag(ev: PointerEvent) {
    if (this.dragging() !== this.draggable) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const sx = (ev.clientX - rect.left) * (440 / rect.width);
    const sy = (ev.clientY - rect.top) * (280 / rect.height);
    const x = Math.max(0, Math.min(10, this.invX(sx)));
    const y = Math.max(0, Math.min(10, this.invY(sy)));
    this.pts.update(arr => arr.map(p => p.id === this.draggable ? { ...p, x, y } : p));
  }

  endDrag() { this.dragging.set(null); }

  setFlag(x: number, y: number) {
    this.pts.update(arr => arr.map(p => p.id === this.draggable ? { ...p, x, y } : p));
  }

  private fit(subset: Pt[]) {
    const n = subset.length;
    const xb = subset.reduce((s, v) => s + v.x, 0) / n;
    const yb = subset.reduce((s, v) => s + v.y, 0) / n;
    const num = subset.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = subset.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    const b1 = den > 1e-9 ? num / den : 0;
    const b0 = yb - b1 * xb;
    const sse = subset.reduce((s, v) => s + (v.y - b0 - b1 * v.x) ** 2, 0);
    return { b0, b1, xb, sXX: den, sse, n };
  }

  readonly fitAll = computed(() => this.fit(this.pts()));
  readonly fitWithout = computed(() => this.fit(this.pts().filter(p => p.id !== this.draggable)));

  readonly flaggedPt = computed(() => this.pts().find(p => p.id === this.draggable)!);

  readonly flagLeverage = computed(() => {
    const f = this.fitAll();
    const p = this.flaggedPt();
    return 1 / f.n + (p.x - f.xb) ** 2 / f.sXX;
  });

  readonly flagResStd = computed(() => {
    const f = this.fitAll();
    const p = this.flaggedPt();
    const s = Math.sqrt(f.sse / (f.n - 2));
    const h = this.flagLeverage();
    const raw = p.y - f.b0 - f.b1 * p.x;
    return raw / (s * Math.sqrt(Math.max(1e-9, 1 - h)));
  });

  readonly flagCook = computed(() => {
    const r = this.flagResStd();
    const h = this.flagLeverage();
    return (r * r * h) / (2 * Math.max(1e-9, 1 - h));
  });
}
