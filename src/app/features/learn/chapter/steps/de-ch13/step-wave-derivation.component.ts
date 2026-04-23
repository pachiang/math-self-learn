import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch13-wave-derivation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從弦到波動方程" subtitle="§13.1">
      <p>
        把一條有質量 ρ（每單位長度）的弦，以張力 T 繃緊，在重力忽略下撥動。
        弦上某點 x 在時刻 t 的縱向位移 u(x, t) 滿足什麼方程？
      </p>

      <h4>對小段 [x, x+Δx] 用牛頓第二定律</h4>
      <p>
        把小段弦當質點：質量 = ρ·Δx、加速度 = ∂²u/∂t²。
        張力在兩端方向近似為 <code>T·∂u/∂x</code>（小斜率近似）。
      </p>
      <div class="centered-eq">
        ρ·Δx · ∂²u/∂t² = T · [∂u/∂x|_(x+Δx) − ∂u/∂x|_x]
      </div>
      <p>除以 Δx，令 Δx → 0：</p>
      <div class="centered-eq big">
        ∂²u/∂t² = c² · ∂²u/∂x², &nbsp;&nbsp; c² = T / ρ
      </div>
      <p class="key-idea">
        這就是<strong>波動方程</strong>。c 是波在弦上的傳播速度，單位是 m/s。
        張力越大、密度越小 → 波跑得越快——琴弦調音的物理就在這裡。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="播放：弦如何被「張力回復力」推動">
      <div class="string-viz">
        <svg viewBox="-10 -100 420 200" class="str-svg">
          <!-- Axes -->
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border)" stroke-width="0.5" />

          <!-- String: flat baseline -->
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 4" opacity="0.5" />

          <!-- Current string state -->
          <path [attr.d]="stringPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

          <!-- Highlight element [x, x+dx] -->
          <g>
            <circle [attr.cx]="xMark() * 400" [attr.cy]="-uAt(xMark()) * SCALE" r="3.5"
              fill="var(--accent)" stroke="white" stroke-width="1.3" />

            <!-- Tangent on the left -->
            <line [attr.x1]="(xMark() - 0.04) * 400" [attr.y1]="-(uAt(xMark() - 0.04)) * SCALE"
                  [attr.x2]="xMark() * 400" [attr.y2]="-uAt(xMark()) * SCALE"
                  stroke="#5a8aa8" stroke-width="2" />
            <line [attr.x1]="xMark() * 400" [attr.y1]="-uAt(xMark()) * SCALE"
                  [attr.x2]="(xMark() + 0.04) * 400" [attr.y2]="-uAt(xMark() + 0.04) * SCALE"
                  stroke="#c87b5e" stroke-width="2" />
            <text [attr.x]="(xMark() - 0.05) * 400" [attr.y]="-uAt(xMark() - 0.04) * SCALE - 5" class="leg-lab left" text-anchor="end">T·∂u/∂x|left</text>
            <text [attr.x]="(xMark() + 0.05) * 400" [attr.y]="-uAt(xMark() + 0.04) * SCALE - 5" class="leg-lab right" text-anchor="start">T·∂u/∂x|right</text>
          </g>

          <!-- Endpoints -->
          <circle cx="0" cy="0" r="4" fill="var(--text)" />
          <circle cx="400" cy="0" r="4" fill="var(--text)" />
          <text x="-4" y="14" class="tick">x=0</text>
          <text x="404" y="14" class="tick">L</text>
        </svg>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">{{ playing() ? '⏸ 暫停' : '▶ 播放' }}</button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <span class="t-display">t = {{ t().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">觀察點 x</span>
          <input type="range" min="0.05" max="0.95" step="0.01" [value]="xMark()"
            (input)="xMark.set(+$any($event).target.value)" />
          <span class="sl-val">{{ xMark().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">c²</span>
          <input type="range" min="0.2" max="4" step="0.1" [value]="cSquared()"
            (input)="cSquared.set(+$any($event).target.value)" />
          <span class="sl-val">{{ cSquared().toFixed(1) }}</span>
        </div>
      </div>

      <div class="physics-note">
        左右兩邊的斜率不平衡時，<strong>淨向上的張力分量 = T·uₓₓ·Δx</strong>，
        推動小段的加速度 <code>∂²u/∂t² = (T/ρ)·uₓₓ = c²·uₓₓ</code>。
        凹向上時加速向上、凹向下時加速向下——就像<strong>每個點都在做諧振</strong>，
        但頻率耦合到空間曲率。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>熱 vs 波的對比</h4>
      <table class="compare">
        <thead>
          <tr><th></th><th>熱方程</th><th>波動方程</th></tr>
        </thead>
        <tbody>
          <tr><td>時間導數階數</td><td>一階 uₜ</td><td>二階 uₜₜ</td></tr>
          <tr><td>初值條件</td><td>只要 u(x, 0)</td><td>u(x, 0) <strong>和</strong> uₜ(x, 0)</td></tr>
          <tr><td>時間可逆？</td><td>✗ 無法回溯</td><td>✓ 公式對 t → −t 對稱</td></tr>
          <tr><td>能量</td><td>流出去（耗散）</td><td>守恆（動能 + 位能）</td></tr>
          <tr><td>模態時間因子</td><td>e^(−αλₙt)</td><td>cos, sin(c√λₙ·t)</td></tr>
          <tr><td>傳播</td><td>瞬時（無限速度）</td><td>以速度 c 傳（有限速度）</td></tr>
        </tbody>
      </table>

      <p class="takeaway">
        <strong>take-away：</strong>
        波動方程有兩個時間導數，需要兩個初始條件（位移 + 速度）。
        它<strong>守恆</strong>、<strong>可逆</strong>、並以有限速度傳遞訊息。
        下一節用 d'Alembert 公式給出無邊界情況下的通解——一個特別漂亮的結果。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 15px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .string-viz { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .str-svg { width: 100%; display: block; }
    .tick { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .leg-lab { font-size: 9px; font-family: 'JetBrains Mono', monospace; }
    .leg-lab.left { fill: #5a8aa8; }
    .leg-lab.right { fill: #c87b5e; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 72px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }

    .physics-note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .physics-note strong { color: var(--accent); }

    .compare { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .compare th, .compare td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .compare th { background: var(--accent-10); color: var(--accent); font-weight: 700; }
    .compare td:first-child { color: var(--text-muted); font-weight: 600; }
    .compare tr:nth-child(even) td { background: var(--bg-surface); }
    .compare strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh13WaveDerivationComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly SCALE = 60;
  readonly t = signal(0);
  readonly xMark = signal(0.5);
  readonly cSquared = signal(1);
  readonly playing = signal(false);
  readonly T_MAX = 4;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        this.t.set((this.t() + dt * 1.5) % this.T_MAX);
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  ngOnDestroy(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); }

  togglePlay() { this.playing.set(!this.playing()); }
  reset() { this.t.set(0); this.playing.set(false); }

  /** Fundamental + 2nd mode superposition */
  uAt(x: number): number {
    const t = this.t();
    const c = Math.sqrt(this.cSquared());
    const L = 1;
    const y1 = 0.8 * Math.sin(Math.PI * x / L) * Math.cos(Math.PI * c * t / L);
    const y2 = 0.3 * Math.sin(2 * Math.PI * x / L) * Math.cos(2 * Math.PI * c * t / L);
    return y1 + y2;
  }

  stringPath(): string {
    const N = 180;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const x = i / N;
      const y = this.uAt(x);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(x * 400).toFixed(1)} ${(-y * this.SCALE).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
