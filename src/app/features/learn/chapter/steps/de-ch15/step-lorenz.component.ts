import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function lorenzStep(x: number, y: number, z: number, sigma: number, rho: number, beta: number, dt: number): [number, number, number] {
  const f = (xx: number, yy: number, zz: number) => [
    sigma * (yy - xx),
    xx * (rho - zz) - yy,
    xx * yy - beta * zz,
  ];
  const [k1x, k1y, k1z] = f(x, y, z);
  const [k2x, k2y, k2z] = f(x + dt * k1x / 2, y + dt * k1y / 2, z + dt * k1z / 2);
  const [k3x, k3y, k3z] = f(x + dt * k2x / 2, y + dt * k2y / 2, z + dt * k2z / 2);
  const [k4x, k4y, k4z] = f(x + dt * k3x, y + dt * k3y, z + dt * k3z);
  const nx = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
  const ny = y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
  const nz = z + (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);
  return [nx, ny, nz];
}

@Component({
  selector: 'app-de-ch15-lorenz',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Lorenz 吸引子：混沌的誕生" subtitle="§15.3">
      <p>
        1963 年，氣象學家 Edward Lorenz 研究對流簡化模型時，
        發現一個震驚世界的 3D 系統：
      </p>
      <div class="centered-eq big">
        ẋ = σ(y − x),&nbsp;&nbsp; ẏ = x(ρ − z) − y,&nbsp;&nbsp; ż = xy − βz
      </div>
      <p>
        典型參數：σ = 10、β = 8/3、ρ = 28。
        系統是<strong>確定性的</strong>（沒有隨機項），卻呈現<strong>混沌行為</strong>：
        初始條件的微小差距會<strong>指數放大</strong>——「巴西一隻蝴蝶搧動翅膀，德州起一場龍捲風」。
      </p>

      <p class="key-idea">
        <strong>混沌三個特徵：</strong>
        (1) 確定性卻不可預測，
        (2) 對初始條件敏感（Lyapunov 指數 &gt; 0），
        (3) 有限相空間內的<strong>奇異吸引子</strong>（分數維度、永不重複）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="播放：看兩個幾乎相同初始條件的軌跡如何分道揚鑣">
      <div class="lorenz-view">
        <svg viewBox="-150 -100 300 200" class="lz-svg">
          <!-- Attractor projection onto x-z plane -->
          <path [attr.d]="traj1Path()" fill="none" stroke="var(--accent)" stroke-width="0.8" opacity="0.75" />
          <path [attr.d]="traj2Path()" fill="none" stroke="#5a8aa8" stroke-width="0.8" opacity="0.75" />
          <!-- Current position markers -->
          <circle [attr.cx]="pos1X()" [attr.cy]="pos1Z()" r="4" fill="var(--accent)" stroke="white" stroke-width="1.5" />
          <circle [attr.cx]="pos2X()" [attr.cy]="pos2Z()" r="4" fill="#5a8aa8" stroke="white" stroke-width="1.5" />
          <!-- Equilibria C+ and C- -->
          <circle [attr.cx]="cPlusX * 5" [attr.cy]="-cPlusZ * 1.5" r="3" fill="white" stroke="#c87b5e" stroke-width="1.5" />
          <circle [attr.cx]="cMinusX * 5" [attr.cy]="-cMinusZ * 1.5" r="3" fill="white" stroke="#c87b5e" stroke-width="1.5" />

          <text x="-145" y="-90" class="axl">投影：(x, z) 平面</text>
          <text x="143" y="95" class="axl" text-anchor="end">x</text>
          <text x="-145" y="-78" class="axl" transform="rotate(-90, -145, -78)">z</text>
        </svg>
      </div>

      <div class="dist-display">
        <strong>兩軌跡的距離：</strong>
        <span class="dv">{{ distance().toExponential(2) }}</span>
        <span class="dl">（初始差 10⁻⁴，指數增長）</span>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">{{ playing() ? '⏸ 暫停' : '▶ 播放' }}</button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <span class="t-display">t = {{ simTime().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">ρ</span>
          <input type="range" min="0.5" max="40" step="0.1" [value]="rho()"
            (input)="setRho(+$any($event).target.value)" />
          <span class="sl-val">{{ rho().toFixed(1) }}</span>
        </div>
        <div class="presets">
          <button class="pre" (click)="setRho(0.5)">ρ=0.5 (穩定原點)</button>
          <button class="pre" (click)="setRho(15)">ρ=15 (穩定 C±)</button>
          <button class="pre" (click)="setRho(28)">ρ=28 (混沌)</button>
          <button class="pre" (click)="setRho(100)">ρ=100 (極限環)</button>
        </div>
      </div>

      <div class="regime" [attr.data-regime]="regime()">
        @if (regime() === 'origin') {
          <strong>ρ &lt; 1：</strong> 原點是唯一平衡點，全域穩定。無對流。
        } @else if (regime() === 'c-stable') {
          <strong>1 &lt; ρ &lt; 24.74：</strong> 原點不穩；出現兩個穩定平衡 C±（對稱）。
        } @else if (regime() === 'chaos') {
          <strong>ρ ≈ 28（經典值）：</strong> <strong>混沌！</strong> C± 也不穩定，軌跡在兩葉間隨機跳躍，形成蝴蝶狀吸引子。
        } @else {
          <strong>ρ 極大：</strong> 軌跡回歸規律——穩定極限環。
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼蝴蝶雙翼？</h4>
      <p>
        ρ = 28 時有兩個不穩定焦點 C+ 和 C−（對應對流順時針 vs 逆時針）。
        軌跡在一邊圍繞一段時間，然後<strong>無預警</strong>跳到另一邊。
        跳躍的次數、每次停留的時間完全不可預測——但軌跡永遠困在<strong>有限大小的吸引子</strong>裡。
      </p>

      <h4>分數維度：奇異吸引子</h4>
      <p>
        Lorenz 吸引子不是線（1D）、不是面（2D），而是介於兩者之間的<strong>碎形 (fractal)</strong>——
        Hausdorff 維度約為 2.06。這是「混沌吸引子」的標誌。
      </p>

      <h4>Lorenz 的啟發</h4>
      <ul class="impact">
        <li><strong>氣象預報極限</strong>：大氣本質混沌 → 超過兩週預報不可能。</li>
        <li><strong>心律失常</strong>：心房顫動是心臟電訊號的混沌狀態。</li>
        <li><strong>行星軌道</strong>：太陽系長時間動力學在某些時間尺度上混沌。</li>
        <li><strong>生態崩潰</strong>：非線性食物網會在某些參數下突然混沌化。</li>
        <li><strong>加密通訊</strong>：利用混沌的偽隨機性加密。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        Lorenz 展示了<strong>確定性混沌</strong>的存在。
        3 個變數、3 條簡單方程、無任何隨機——卻產生本質不可預測的行為。
        這改變了科學界對「預測」的理解：定律決定的未來不一定算得出來。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .lorenz-view { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .lz-svg { width: 100%; max-width: 450px; display: block; margin: 0 auto; }
    .axl { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .dist-display { padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 8px; font-size: 13px; }
    .dist-display strong { color: var(--accent); }
    .dv { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 700; margin: 0 8px; }
    .dl { color: var(--text-muted); font-size: 11px; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 30px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }
    .presets { display: flex; gap: 4px; flex-wrap: wrap; }
    .pre { font: inherit; font-size: 10px; padding: 4px 8px; border: 1px solid var(--border); background: var(--bg); border-radius: 12px; cursor: pointer; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .pre:hover { border-color: var(--accent); color: var(--accent); }

    .regime { padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 10px; line-height: 1.6; }
    .regime[data-regime='origin'] { background: rgba(92, 168, 120, 0.1); color: #5ca878; }
    .regime[data-regime='c-stable'] { background: rgba(90, 138, 168, 0.1); color: #5a8aa8; }
    .regime[data-regime='chaos'] { background: rgba(200, 123, 94, 0.1); color: #c87b5e; }
    .regime[data-regime='cycle'] { background: rgba(244, 200, 102, 0.1); color: #ba8d2a; }

    .impact { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .impact strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh15LorenzComponent implements OnInit, OnDestroy {
  readonly sigma = 10;
  readonly beta = 8 / 3;
  readonly rho = signal(28);
  readonly playing = signal(true);
  readonly simTime = signal(0);

  // Two trajectories with tiny initial difference
  private traj1: Array<[number, number, number]> = [[1, 1, 1]];
  private traj2: Array<[number, number, number]> = [[1 + 1e-4, 1, 1]];
  private state1: [number, number, number] = [1, 1, 1];
  private state2: [number, number, number] = [1 + 1e-4, 1, 1];

  readonly maxTrail = 3000;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = 0.008;
        for (let k = 0; k < 4; k++) {
          this.state1 = lorenzStep(this.state1[0], this.state1[1], this.state1[2], this.sigma, this.rho(), this.beta, dt);
          this.state2 = lorenzStep(this.state2[0], this.state2[1], this.state2[2], this.sigma, this.rho(), this.beta, dt);
          this.traj1.push([...this.state1]);
          this.traj2.push([...this.state2]);
          if (this.traj1.length > this.maxTrail) this.traj1.shift();
          if (this.traj2.length > this.maxTrail) this.traj2.shift();
          this.simTime.set(this.simTime() + dt);
        }
        this.tickSignal.set(this.tickSignal() + 1);
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  ngOnDestroy(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); }

  private tickSignal = signal(0);

  togglePlay() { this.playing.set(!this.playing()); }
  reset() {
    this.state1 = [1, 1, 1];
    this.state2 = [1 + 1e-4, 1, 1];
    this.traj1 = [[...this.state1]];
    this.traj2 = [[...this.state2]];
    this.simTime.set(0);
    this.tickSignal.set(this.tickSignal() + 1);
  }

  setRho(v: number) {
    this.rho.set(v);
    this.reset();
  }

  readonly regime = computed(() => {
    const r = this.rho();
    if (r < 1) return 'origin';
    if (r < 24.74) return 'c-stable';
    if (r < 70) return 'chaos';
    return 'cycle';
  });

  // Equilibria C+ and C-: (±√(β(ρ−1)), ±√(β(ρ−1)), ρ−1)
  get cPlusX() { return Math.sqrt(this.beta * Math.max(0, this.rho() - 1)); }
  get cPlusZ() { return this.rho() - 1; }
  get cMinusX() { return -this.cPlusX; }
  get cMinusZ() { return this.rho() - 1; }

  readonly pos1X = computed(() => { this.tickSignal(); return this.state1[0] * 5; });
  readonly pos1Z = computed(() => { this.tickSignal(); return -this.state1[2] * 1.5; });
  readonly pos2X = computed(() => { this.tickSignal(); return this.state2[0] * 5; });
  readonly pos2Z = computed(() => { this.tickSignal(); return -this.state2[2] * 1.5; });

  readonly distance = computed(() => {
    this.tickSignal();
    const dx = this.state1[0] - this.state2[0];
    const dy = this.state1[1] - this.state2[1];
    const dz = this.state1[2] - this.state2[2];
    return Math.hypot(dx, dy, dz);
  });

  traj1Path(): string { this.tickSignal(); return this.buildPath(this.traj1); }
  traj2Path(): string { this.tickSignal(); return this.buildPath(this.traj2); }

  private buildPath(pts: Array<[number, number, number]>): string {
    if (pts.length < 2) return '';
    const seg: string[] = [];
    for (let k = 0; k < pts.length; k += 2) {
      const [x, , z] = pts[k];
      const px = x * 5;
      const py = -z * 1.5;
      if (Math.abs(px) > 160 || py > 100 || py < -110) continue;
      seg.push(`${seg.length === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return seg.join(' ');
  }
}
