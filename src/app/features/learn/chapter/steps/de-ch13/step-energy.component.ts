import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch13-energy',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="能量守恆與本章總結" subtitle="§13.5">
      <p>
        對兩端固定的弦，總能量（動能 + 位能）為：
      </p>
      <div class="centered-eq big">
        E(t) = ½ ∫₀<sup>L</sup> [ρ·uₜ² + T·uₓ²] dx
      </div>
      <p>
        動能項 ρuₜ² 是小段 ρ·dx 的運動能量；
        位能項 T·uₓ² 來自弦被拉長的彈性位能（高中彈簧能 ½k·Δx² 的連續版）。
      </p>

      <h4>為什麼 E 守恆？</h4>
      <p>求 dE/dt，把 uₜₜ = c²uₓₓ 與分部積分用一下：</p>
      <div class="derivation">
        <div class="d-step">
          <code>dE/dt = ∫ [ρ·uₜ·uₜₜ + T·uₓ·uₓₜ] dx</code>
        </div>
        <div class="d-step">
          代入 uₜₜ = (T/ρ)·uₓₓ：<br>
          <code>= ∫ [T·uₜ·uₓₓ + T·uₓ·uₓₜ] dx = T·∫ ∂/∂x (uₜ·uₓ) dx</code>
        </div>
        <div class="d-step">
          基本定理：<code>= T·[uₜ·uₓ]₀<sup>L</sup></code>
        </div>
        <div class="d-step final">
          邊界 u(0,t) = u(L,t) = 0 → uₜ(0,t) = uₜ(L,t) = 0 → <strong>dE/dt = 0</strong>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="播放：看動能與位能的持續交換">
      <div class="plots">
        <div class="energy-plot">
          <div class="ep-title">位移 u(x, t)</div>
          <svg viewBox="-10 -60 420 110" class="ep-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <path [attr.d]="stringPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />
          </svg>
        </div>

        <div class="energy-bar">
          <div class="eb-title">動能 vs 位能（總和守恆）</div>
          <div class="bar-group">
            <div class="bar-container">
              <div class="bar-label">動能 (KE)</div>
              <div class="bar-track">
                <div class="bar-fill ke"
                  [style.width.%]="(keFraction() * 100)"></div>
              </div>
              <div class="bar-val">{{ (keFraction() * 100).toFixed(1) }}%</div>
            </div>
            <div class="bar-container">
              <div class="bar-label">位能 (PE)</div>
              <div class="bar-track">
                <div class="bar-fill pe"
                  [style.width.%]="((1 - keFraction()) * 100)"></div>
              </div>
              <div class="bar-val">{{ ((1 - keFraction()) * 100).toFixed(1) }}%</div>
            </div>
          </div>
          <div class="total">
            總能量 E ≈ <strong>{{ totalEnergy().toFixed(3) }}</strong>（應為常數）
          </div>
        </div>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">{{ playing() ? '⏸ 暫停' : '▶ 播放' }}</button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>
      </div>

      <div class="note">
        觀察：弦達到最大位移時 <strong>動能 = 0、位能 = 100%</strong>；
        穿過平衡點時 <strong>動能 = 100%、位能 = 0</strong>。
        兩者週期性交換，但總能守恆——就像 Ch5 的彈簧，只是連續版。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>本章總結</h4>
      <ol class="summary">
        <li>波動方程 <code>uₜₜ = c²·uₓₓ</code> 來自牛頓定律 + 張力，c² = T/ρ。</li>
        <li><strong>d'Alembert 通解</strong>：無邊界時 u = F(x−ct) + G(x+ct)，兩個行波。</li>
        <li>訊號以有限速度 c 傳遞 → <strong>光錐 / 依賴域</strong>的概念誕生。</li>
        <li>有限弦：分離變數法給<strong>駐波疊加</strong>，頻率 ωₙ = nπc/L 是整數倍（音高！）。</li>
        <li>2D：方形用 sin × sin、圓形用 Bessel——頻率比不再是整數倍（鼓聲）。</li>
        <li>能量 = ∫(ρuₜ² + Tuₓ²)/2 dx 守恆；動能位能週期性互換。</li>
      </ol>

      <h4>熱 vs 波 vs 穩態：三大基本 PDE 的比較</h4>
      <table class="three-way">
        <thead>
          <tr><th></th><th>熱 uₜ = α·Δu</th><th>波 uₜₜ = c²·Δu</th><th>穩態 Δu = 0</th></tr>
        </thead>
        <tbody>
          <tr><td>類型</td><td>拋物線型</td><td>雙曲線型</td><td>橢圓型</td></tr>
          <tr><td>時間</td><td>一階、不可逆</td><td>二階、可逆</td><td>無時間</td></tr>
          <tr><td>能量</td><td>流失</td><td>守恆</td><td>—</td></tr>
          <tr><td>訊號</td><td>瞬時 (∞ 速度)</td><td>有限 c</td><td>—</td></tr>
          <tr><td>特徵函數</td><td>衰減</td><td>振盪</td><td>調和</td></tr>
        </tbody>
      </table>

      <div class="next-ch">
        <h4>下一章：Laplace 方程</h4>
        <p>
          Ch12 做了熱方程 uₜ = α·Δu，Ch13 做了波 uₜₜ = c²·Δu。
          這兩個的穩態（t → ∞ 後不再變化）都滿足 <strong>Δu = 0</strong>——Laplace 方程。
          它統治了電磁位能、肥皂膜、溫度穩態、流體無旋流。
          Ch14 深入研究這個「最平滑」的 PDE。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .derivation { margin: 10px 0; }
    .d-step { padding: 8px 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 4px; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .d-step.final { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }

    .plots { display: grid; gap: 10px; }
    .energy-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .ep-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .ep-svg { width: 100%; display: block; }

    .energy-bar { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .eb-title { font-size: 12px; color: var(--text-muted); text-align: center; margin-bottom: 8px; }
    .bar-group { display: grid; gap: 6px; }
    .bar-container { display: grid; grid-template-columns: 70px 1fr 50px; gap: 8px; align-items: center; }
    .bar-label { font-size: 12px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .bar-track { height: 16px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .bar-fill { height: 100%; transition: width 0.12s ease; }
    .bar-fill.ke { background: linear-gradient(to right, #5a8aa8, #8fb4d0); }
    .bar-fill.pe { background: linear-gradient(to right, #c87b5e, #ddac96); }
    .bar-val { font-size: 11px; color: var(--text); font-family: 'JetBrains Mono', monospace; text-align: right; }
    .total { text-align: center; font-size: 13px; color: var(--text); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
    .total strong { color: var(--accent); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .note strong { color: var(--accent); }

    .summary { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .summary strong { color: var(--accent); }

    .three-way { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
    .three-way th, .three-way td { padding: 8px; border: 1px solid var(--border); text-align: left; }
    .three-way th { background: var(--accent-10); color: var(--accent); font-weight: 700; }
    .three-way td:first-child { color: var(--text-muted); font-weight: 600; }
    .three-way tr:nth-child(even) td { background: var(--bg-surface); }

    .next-ch { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .next-ch p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .next-ch strong { color: var(--accent); }
  `,
})
export class DeCh13EnergyComponent implements OnInit, OnDestroy {
  readonly t = signal(0);
  readonly playing = signal(true);
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

  /** Pure mode n=1 for simplicity */
  readonly omega = Math.PI;

  stringPath(): string {
    const N = 150;
    const pts: string[] = [];
    const tFactor = Math.cos(this.omega * this.t());
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = Math.sin(Math.PI * x / this.L) * tFactor;
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * 400).toFixed(1)} ${(-y * 40).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  /** KE fraction = sin²(ωt) / [sin²(ωt) + cos²(ωt)] = sin²(ωt) */
  readonly keFraction = computed(() => {
    const s = Math.sin(this.omega * this.t());
    return s * s;
  });

  readonly totalEnergy = computed(() => {
    // Pure mode: E ∝ ω² (constant). Add tiny numerical noise to demonstrate
    return 0.5 * this.omega * this.omega;
  });
}
