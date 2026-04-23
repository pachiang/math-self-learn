import { Component, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Shape {
  id: string;
  name: string;
  f: (x: number) => number;
}

const SHAPES: Shape[] = [
  { id: 'bump', name: '高斯塊', f: (x) => Math.exp(-80 * (x - 0.5) ** 2) },
  { id: 'square', name: '方波', f: (x) => (Math.abs(x - 0.5) < 0.1 ? 1 : 0) },
  { id: 'triangle', name: '三角', f: (x) => Math.max(0, 1 - 10 * Math.abs(x - 0.5)) },
  { id: 'sine', name: '半弧 sin', f: (x) => (x > 0.3 && x < 0.7 ? Math.sin(Math.PI * (x - 0.3) / 0.4) : 0) },
];

@Component({
  selector: 'app-de-ch13-dalembert',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="d'Alembert 通解：兩個行波的和" subtitle="§13.2">
      <p>
        對無邊界的波動方程 <code>uₜₜ = c²·uₓₓ</code>，有一個極漂亮的通解：
      </p>
      <div class="centered-eq big">
        u(x, t) = F(x − c·t) + G(x + c·t)
      </div>
      <p>
        任何足夠光滑的 F、G 都能得到一個解。驗證：
      </p>
      <ul class="verify">
        <li>對 t 取兩次偏導：<code>uₜₜ = c²·F″ + c²·G″</code></li>
        <li>對 x 取兩次偏導：<code>uₓₓ = F″ + G″</code></li>
        <li>兩者差 c²——滿足！</li>
      </ul>

      <h4>物理詮釋</h4>
      <p class="key-idea">
        <strong>F(x − ct) 是「朝右走的形狀」</strong>：
        時間推移時，在任何 x 點看到的值等於初始時刻 x − ct 位置的值——
        形狀<strong>剛性地向右位移 ct</strong>。
        G(x + ct) 同理朝左。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇初始形狀：看它怎麼分裂成左右兩個">
      <div class="shape-row">
        @for (s of shapes; track s.id) {
          <button class="pill" [class.active]="shape() === s.id" (click)="shape.set(s.id)">{{ s.name }}</button>
        }
      </div>

      <div class="plot">
        <div class="plot-title">d'Alembert 解：u(x,t) = ½·f(x−ct) + ½·f(x+ct)</div>
        <svg viewBox="-20 -80 440 150" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <!-- Light cone markers for t -->
          @if (t() > 0) {
            <line [attr.x1]="leftArrivalPx()" y1="-75" [attr.x2]="leftArrivalPx()" y2="20" stroke="#ba8d2a" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.6" />
            <line [attr.x1]="rightArrivalPx()" y1="-75" [attr.x2]="rightArrivalPx()" y2="20" stroke="#ba8d2a" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.6" />
          }

          <!-- Initial (dashed) -->
          <path [attr.d]="initialPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.7" />

          <!-- Left mover G (blue, transparent) -->
          <path [attr.d]="leftPath()" fill="none" stroke="#5a8aa8" stroke-width="1.8" opacity="0.8" />

          <!-- Right mover F (red, transparent) -->
          <path [attr.d]="rightPath()" fill="none" stroke="#c87b5e" stroke-width="1.8" opacity="0.8" />

          <!-- Sum (accent, bold) -->
          <path [attr.d]="sumPath()" fill="none" stroke="var(--accent)" stroke-width="2.6" />

          <text x="-4" y="14" class="tick">0</text>
          <text x="400" y="14" class="tick" text-anchor="middle">L</text>
        </svg>
        <div class="legend">
          <span class="leg"><span class="sw dashed"></span>初始 f(x)</span>
          <span class="leg"><span class="sw bl"></span>½·f(x+ct) 往左</span>
          <span class="leg"><span class="sw re"></span>½·f(x−ct) 往右</span>
          <span class="leg"><span class="sw acc"></span>總和 u(x,t)</span>
        </div>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">{{ playing() ? '⏸ 暫停' : '▶ 播放' }}</button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <span class="t-display">ct = {{ (c * t()).toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">時間 t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.01" [value]="t()"
            (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>d'Alembert 公式的一般形式</h4>
      <p>給定初值 u(x, 0) = f(x)、uₜ(x, 0) = g(x)：</p>
      <div class="centered-eq big">
        u(x, t) = ½[f(x − ct) + f(x + ct)] + (1/2c) ∫<sub>x−ct</sub><sup>x+ct</sup> g(s) ds
      </div>
      <p>
        當初始速度 g ≡ 0（只有位移），第二項消失，剩下對稱分裂的兩個波。
        加入 g 時，積分項帶來額外的動能貢獻。
      </p>

      <h4>因果關係：光錐與訊號速度</h4>
      <p>
        u(x, t) 的值只依賴於初始時刻 <strong>[x−ct, x+ct]</strong> 這個區間的 f、g。
        這叫做<strong>依賴域（domain of dependence）</strong>。
      </p>
      <div class="key-idea">
        <strong>訊號以速度 c 傳遞，不會超越</strong>。
        這跟熱方程的「瞬間影響全體」恰成對比，也是相對論裡光錐概念的數學起源。
      </div>

      <div class="cone-diagram">
        <svg viewBox="-20 -10 420 200" class="cone-svg">
          <line x1="0" y1="180" x2="400" y2="180" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="0" x2="0" y2="180" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Forward light cone from (x0, 0) -->
          <polygon points="200,180 50,20 350,20" fill="var(--accent-10)" stroke="var(--accent)" stroke-width="1.4" />
          <circle cx="200" cy="180" r="4" fill="var(--accent)" />

          <text x="200" y="195" class="cl" text-anchor="middle">x₀</text>
          <text x="-4" y="10" class="cl" text-anchor="end">t</text>
          <text x="404" y="195" class="cl">x</text>
          <text x="200" y="100" class="cone-lab" text-anchor="middle">影響域</text>
          <text x="95" y="65" class="cone-side" text-anchor="middle">斜率 1/c</text>

          <!-- Backward cone from (x1, t1) -->
          <polygon points="260,30 170,180 350,180" fill="rgba(92, 168, 120, 0.15)" stroke="#5ca878" stroke-width="1.2" />
          <circle cx="260" cy="30" r="4" fill="#5ca878" />
          <text x="262" y="22" class="cl" style="fill:#5ca878;">(x,t)</text>
          <text x="265" y="115" class="cone-lab" text-anchor="start" style="fill:#5ca878;">依賴域</text>
        </svg>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        d'Alembert 給出無邊界波動方程的通解：<strong>兩個行波</strong>的和。
        F 朝右、G 朝左，兩者獨立前進。下一節看當兩端固定時會發生什麼——
        波反彈、疊加、形成駐波。
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

    .verify { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }

    .shape-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .plot-svg { width: 100%; display: block; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: end; font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; gap: 14px; justify-content: center; margin-top: 6px; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.dashed { background-image: linear-gradient(to right, var(--text-muted) 50%, transparent 50%); background-size: 4px 3px; }
    .sw.bl { background: #5a8aa8; }
    .sw.re { background: #c87b5e; }
    .sw.acc { background: var(--accent); }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .cone-diagram { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin: 10px 0; }
    .cone-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto; }
    .cl { font-size: 10px; fill: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .cone-lab { font-size: 11px; fill: var(--accent); font-weight: 700; }
    .cone-side { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh13DAlembertComponent implements OnInit, OnDestroy {
  readonly shape = signal('bump');
  readonly t = signal(0);
  readonly playing = signal(false);
  readonly T_MAX = 0.5;
  readonly c = 1;
  readonly shapes = SHAPES;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 0.12;
        if (newT >= this.T_MAX) { this.t.set(this.T_MAX); this.playing.set(false); }
        else this.t.set(newT);
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  ngOnDestroy(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); }

  togglePlay() { if (this.t() >= this.T_MAX - 0.01) this.t.set(0); this.playing.set(!this.playing()); }
  reset() { this.t.set(0); this.playing.set(false); }

  readonly fFn = computed(() => SHAPES.find(s => s.id === this.shape())!.f);

  /** Periodic extension sampling */
  sample(x: number): number {
    const f = this.fFn();
    if (x < 0 || x > 1) return 0;
    return f(x);
  }

  readonly leftArrivalPx = computed(() => Math.max(0, (0.5 - this.c * this.t())) * 400);
  readonly rightArrivalPx = computed(() => Math.min(1, (0.5 + this.c * this.t())) * 400);

  initialPath(): string {
    return this.buildPath(x => this.sample(x));
  }
  rightPath(): string {
    const ct = this.c * this.t();
    return this.buildPath(x => 0.5 * this.sample(x - ct));
  }
  leftPath(): string {
    const ct = this.c * this.t();
    return this.buildPath(x => 0.5 * this.sample(x + ct));
  }
  sumPath(): string {
    const ct = this.c * this.t();
    return this.buildPath(x => 0.5 * this.sample(x - ct) + 0.5 * this.sample(x + ct));
  }

  private buildPath(f: (x: number) => number): string {
    const pts: string[] = [];
    const N = 300;
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const y = f(x);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(x * 400).toFixed(1)} ${(-y * 50).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
