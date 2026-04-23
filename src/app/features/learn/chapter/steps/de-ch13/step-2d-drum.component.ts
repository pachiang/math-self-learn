import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch13-drum',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="2D 波動：方形鼓與圓鼓" subtitle="§13.4">
      <p>
        把弦升級到面：2D 波動方程
      </p>
      <div class="centered-eq big">
        uₜₜ = c²·(uₓₓ + uᵧᵧ) = c²·Δu
      </div>
      <p>
        Laplace 算子 Δ 又來了。對固定邊界的方形 [0, L]×[0, L]，
        用兩次分離變數 <code>u = X(x)·Y(y)·T(t)</code> 得：
      </p>
      <div class="centered-eq">
        X″/X = −μ,&nbsp;&nbsp;Y″/Y = −ν,&nbsp;&nbsp;T″ = −c²(μ + ν)·T
      </div>
      <p>
        邊界條件給 μ = (mπ/L)², ν = (nπ/L)²，模態為：
      </p>
      <div class="centered-eq big">
        u_m,n(x, y, t) = sin(mπx/L) sin(nπy/L) · cos(ω_m,n t)
      </div>
      <div class="centered-eq">
        ω_m,n = c·π·√(m² + n²) / L
      </div>
    </app-prose-block>

    <app-challenge-card prompt="選 (m, n)：看方形鼓的振動模態">
      <div class="mn-grid">
        @for (m of [1, 2, 3, 4]; track m) {
          @for (n of [1, 2, 3, 4]; track n) {
            <button class="cell" [class.active]="current()[0] === m && current()[1] === n"
              (click)="setMode(m, n)">
              <div class="cell-mn">({{ m }},{{ n }})</div>
              <div class="cell-freq">ω ≈ {{ omegaMN(m, n).toFixed(2) }}</div>
            </button>
          }
        }
      </div>

      <div class="plate">
        <svg viewBox="-5 -5 210 210" class="plate-svg">
          <rect x="0" y="0" width="200" height="200" fill="var(--bg)" stroke="var(--border-strong)" stroke-width="1.5" />
          @for (cell of cells(); track cell.id) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y"
              [attr.width]="cell.s" [attr.height]="cell.s"
              [attr.fill]="cell.color" opacity="0.9" />
          }
          <!-- Nodal lines -->
          @for (lx of verticalNodes(); track $index) {
            <line [attr.x1]="lx * 200" y1="0" [attr.x2]="lx * 200" y2="200"
              stroke="var(--text)" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.5" />
          }
          @for (ly of horizontalNodes(); track $index) {
            <line x1="0" [attr.y1]="ly * 200" x2="200" [attr.y2]="ly * 200"
              stroke="var(--text)" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.5" />
          }
        </svg>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">{{ playing() ? '⏸ 暫停' : '▶ 播放' }}</button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <span class="t-display">t = {{ t().toFixed(2) }}</span>
        </div>
      </div>

      <div class="info-row">
        <div class="info">
          <div class="info-lab">當前模態</div>
          <div class="info-val">({{ current()[0] }}, {{ current()[1] }})</div>
        </div>
        <div class="info">
          <div class="info-lab">頻率比基音</div>
          <div class="info-val">{{ ratio().toFixed(2) }}×</div>
        </div>
        <div class="info">
          <div class="info-lab">節線數</div>
          <div class="info-val">{{ current()[0] + current()[1] - 2 }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>方形鼓 vs 圓形鼓</h4>
      <p>
        方形用直角座標 → sin × sin 模態。
        圓形用極座標 <code>r, θ</code> → 分離變數後，徑向方程是<strong>Bessel 方程</strong>：
      </p>
      <div class="centered-eq">
        r²R″ + rR′ + (k²r² − n²)R = 0
      </div>
      <p>
        跟 §10.5 的圓形鼓面一模一樣！解是 Jₙ(k·r)，邊界 R(a) = 0 選出 k·a = Bessel 零點。
      </p>
      <p class="key-idea">
        <strong>頻率比較：</strong>
        方形鼓的頻率比為 √(m²+n²) 的比——大多為無理數。
        圓形鼓的頻率比為 Bessel 零點比——同樣無理。
        這就是為什麼鼓聲「不是音高明確的音」，而是<strong>混雜的打擊聲</strong>。
        相對地，弦樂器（1D）頻率為整數倍——產生明確的音高。
      </p>

      <h4>著名問題：你能聽出鼓的形狀嗎？</h4>
      <p>
        Mark Kac（1966）問：如果兩個鼓面<strong>所有振動頻率</strong>都一樣，
        它們的形狀必然相同嗎？
        1992 年 Gordon–Webb–Wolpert 給出<strong>反例</strong>：
        兩個形狀不同的鼓可以有完全相同的頻譜——「同音鼓」。
        這展示了「頻譜 → 幾何」的反問題多微妙。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        2D 波動 = 空間兩維各自 BVP + 時間振盪。
        方形用 sin × sin、圓形用 Bessel×cos(nθ)。
        節線與頻率決定鼓的音色。下一節看波動方程的能量守恆，以及本章收尾。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .mn-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; }
    .cell { padding: 8px 4px; font: inherit; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; text-align: center; }
    .cell.active { background: var(--accent); border-color: var(--accent); color: white; }
    .cell:hover:not(.active) { border-color: var(--accent); }
    .cell-mn { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: var(--accent); }
    .cell.active .cell-mn { color: white; }
    .cell-freq { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .cell.active .cell-freq { color: rgba(255,255,255,0.8); }

    .plate { text-align: center; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plate-svg { width: 300px; max-width: 100%; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }

    .info-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px; }
    .info { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .info-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .info-val { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh13DrumComponent implements OnInit, OnDestroy {
  readonly t = signal(0);
  readonly playing = signal(true);
  readonly current = signal<[number, number]>([1, 1]);
  readonly L = 1;
  readonly c = 1;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        this.t.set((this.t() + dt * 0.8) % 8);
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  ngOnDestroy(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); }

  togglePlay() { this.playing.set(!this.playing()); }
  reset() { this.t.set(0); this.playing.set(false); }
  setMode(m: number, n: number) { this.current.set([m, n]); }

  omegaMN(m: number, n: number): number {
    return this.c * Math.PI * Math.sqrt(m * m + n * n) / this.L;
  }
  readonly omega = computed(() => this.omegaMN(this.current()[0], this.current()[1]));
  readonly ratio = computed(() => this.omega() / this.omegaMN(1, 1));

  readonly verticalNodes = computed(() => {
    const m = this.current()[0];
    const arr: number[] = [];
    for (let k = 1; k < m; k++) arr.push(k / m);
    return arr;
  });

  readonly horizontalNodes = computed(() => {
    const n = this.current()[1];
    const arr: number[] = [];
    for (let k = 1; k < n; k++) arr.push(k / n);
    return arr;
  });

  readonly cells = computed(() => {
    const [m, n] = this.current();
    const omega = this.omega();
    const grid = 40;
    const cellSize = 200 / grid;
    const tFactor = Math.cos(omega * this.t());
    const out: Array<{ id: string; x: number; y: number; s: number; color: string }> = [];
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const x = (i + 0.5) / grid;
        const y = (j + 0.5) / grid;
        const u = Math.sin(m * Math.PI * x) * Math.sin(n * Math.PI * y) * tFactor;
        const color = mapColor(u);
        out.push({
          id: `${i}_${j}`,
          x: i * cellSize,
          y: j * cellSize,
          s: cellSize + 0.5,
          color,
        });
      }
    }
    return out;
  });
}

function mapColor(v: number): string {
  const t = Math.max(-1, Math.min(1, v));
  if (t >= 0) {
    const s = t;
    return `rgb(${Math.round(240 - 30 * (1 - s))}, ${Math.round(220 - 150 * s)}, ${Math.round(210 - 150 * s)})`;
  } else {
    const s = -t;
    return `rgb(${Math.round(210 - 100 * s)}, ${Math.round(220 - 30 * s)}, ${Math.round(240 - 10 * s)})`;
  }
}
