import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch13-standing',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="駐波：分離變數解有限弦" subtitle="§13.3">
      <p>
        兩端固定的弦 <code>u(0,t) = u(L,t) = 0</code>，初值 u(x, 0) = f(x)、uₜ(x, 0) = g(x)。
        用 §12.3 的分離變數法，u = X(x)T(t)：
      </p>
      <div class="centered-eq">
        X·T″ = c²·X″·T &nbsp;→&nbsp; T″/(c²T) = X″/X = −λ
      </div>
      <p>
        空間部分跟 Ch11 一樣：<code>X″ + λX = 0, X(0)=X(L)=0</code>，給出 λₙ = (nπ/L)², Xₙ = sin(nπx/L)。
      </p>
      <p>
        <strong>時間部分不同了！</strong> <code>T″ + c²λₙ·T = 0</code>——這是簡諧振動，不再指數衰減：
      </p>
      <div class="centered-eq big">
        Tₙ(t) = Aₙ cos(ωₙ t) + Bₙ sin(ωₙ t), &nbsp;&nbsp; ωₙ = c·√λₙ = cnπ/L
      </div>
      <p class="key-idea">
        每個模態是一個獨立的<strong>駐波</strong>：
        空間形狀 sin(nπx/L) <strong>原地</strong>振盪，振幅隨時間按頻率 ωₙ 振盪。
        弦上不同點<strong>同步</strong>達到峰值、同步穿零點。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇模態 n：看駐波的節點與時間振盪">
      <div class="mode-row">
        @for (k of [1, 2, 3, 4, 5]; track k) {
          <button class="pill" [class.active]="n() === k" (click)="n.set(k)">n = {{ k }}</button>
        }
      </div>

      <div class="plot">
        <div class="plot-title">uₙ(x, t) = sin(nπx/L) · cos(nπct/L)</div>
        <svg viewBox="-10 -100 420 190" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3 2" />
          <line x1="0" y1="-95" x2="0" y2="85" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="400" y1="-95" x2="400" y2="85" stroke="var(--border-strong)" stroke-width="1" />
          <!-- Envelope -->
          <path [attr.d]="envelopePath(true)" fill="none" stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.5" />
          <path [attr.d]="envelopePath(false)" fill="none" stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.5" />
          <!-- Node markers -->
          @for (nx of nodes(); track $index) {
            <circle [attr.cx]="nx * 400" cy="0" r="3" fill="#ba8d2a" />
          }
          <!-- Current wave -->
          <path [attr.d]="stringPath()" fill="none" stroke="var(--accent)" stroke-width="2.6" />
          <!-- Endpoints -->
          <circle cx="0" cy="0" r="4" fill="var(--text)" />
          <circle cx="400" cy="0" r="4" fill="var(--text)" />
        </svg>
        <div class="mode-info">
          <span><strong>節點（不動）：</strong> x/L = {{ nodeTextDisplay() }}</span>
          <span><strong>頻率：</strong> ωₙ = {{ n() }}·π·c/L</span>
          <span><strong>波長：</strong> λ_wave = 2L/{{ n() }}</span>
        </div>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">{{ playing() ? '⏸ 暫停' : '▶ 播放' }}</button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <span class="t-display">ct/L = {{ t().toFixed(2) }}</span>
        </div>
      </div>

      <div class="music-note">
        <strong>音樂小箱：</strong>
        n = 1 是<strong>基音</strong>，n = 2 是<strong>八度</strong>、n = 3 是<strong>五度</strong>⋯
        吉他的「泛音技法」——把手指輕放在 x = L/2 就能激發 n = 2，因為 L/2 是 n = 2 的節點。
        任何試圖在節點激發的駐波都會被抑制；手指不按住節點 → 激發它。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>完整解：模態疊加</h4>
      <p>
        線性 → 疊加。完整解是所有駐波的和：
      </p>
      <div class="centered-eq big">
        u(x, t) = Σ<sub>n=1</sub><sup>∞</sup> sin(nπx/L) · [Aₙ cos(ωₙt) + Bₙ sin(ωₙt)]
      </div>
      <p>
        <strong>係數 Aₙ, Bₙ 由兩個初值決定</strong>：
      </p>
      <div class="centered-eq">
        Aₙ = (2/L) ∫₀<sup>L</sup> f(x)·sin(nπx/L) dx
      </div>
      <div class="centered-eq">
        Bₙ = (2/(Lωₙ)) ∫₀<sup>L</sup> g(x)·sin(nπx/L) dx
      </div>
      <p>
        Aₙ 來自位移 f（cos 項 t=0 時等於振幅），Bₙ 來自速度 g（sin 項 t=0 時導數等於 ωₙ·Bₙ）。
      </p>

      <h4>用 d'Alembert 也能寫：相當於「對稱延拓」</h4>
      <p>
        對有限弦應用 d'Alembert，必須把 f 和 g 做<strong>奇延拓 + 週期 2L</strong>。
        當行波到達 x = 0 或 x = L 時，遇上「負號的自己」——就像彈跳回來倒反。
        分離變數法 = d'Alembert + 延拓：兩條路殊途同歸。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        有限弦的波 = 駐波的疊加。每個 n 對應一個頻率 ωₙ，不同模態獨立振盪。
        音色 = 模態的相對強度（Aₙ, Bₙ 分佈）。
        下一節把這個推廣到 2D（鼓面）。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .mode-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 16px; background: transparent; cursor: pointer; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .plot-svg { width: 100%; display: block; }

    .mode-info { display: flex; gap: 10px; justify-content: center; font-size: 12px; color: var(--text-secondary); margin-top: 6px; flex-wrap: wrap; }
    .mode-info strong { color: var(--accent); }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .row { display: flex; align-items: center; gap: 8px; }
    .play-btn, .reset-btn { font: inherit; font-size: 13px; padding: 5px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .reset-btn { background: transparent; color: var(--accent); }
    .t-display { margin-left: auto; font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 700; }

    .music-note { padding: 12px; background: rgba(244, 200, 102, 0.1); border-left: 3px solid #ba8d2a; border-radius: 0 8px 8px 0; margin-top: 10px; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .music-note strong { color: #ba8d2a; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh13StandingComponent implements OnInit, OnDestroy {
  readonly n = signal(2);
  readonly t = signal(0);
  readonly playing = signal(true);
  readonly T_CYCLE = 4;
  readonly L = 1;
  readonly c = 1;
  readonly SCALE = 70;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        this.t.set((this.t() + dt * 0.3) % this.T_CYCLE);
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  ngOnDestroy(): void { if (this.rafId !== null) cancelAnimationFrame(this.rafId); }
  togglePlay() { this.playing.set(!this.playing()); }
  reset() { this.t.set(0); this.playing.set(false); }

  readonly nodes = computed(() => {
    const arr: number[] = [];
    for (let k = 1; k < this.n(); k++) arr.push(k / this.n());
    return arr;
  });

  nodeTextDisplay(): string {
    const ns = this.nodes();
    if (ns.length === 0) return '無';
    return ns.map(n => n.toFixed(3)).join(', ');
  }

  stringPath(): string {
    const N = 200;
    const pts: string[] = [];
    const tFactor = Math.cos(this.n() * Math.PI * this.c * this.t() / this.L);
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = Math.sin(this.n() * Math.PI * x / this.L) * tFactor;
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * 400).toFixed(1)} ${(-y * this.SCALE).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  envelopePath(top: boolean): string {
    const N = 200;
    const pts: string[] = [];
    const sign = top ? 1 : -1;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = sign * Math.abs(Math.sin(this.n() * Math.PI * x / this.L));
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * 400).toFixed(1)} ${(-y * this.SCALE).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
