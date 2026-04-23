import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch11-bvp-vs-ivp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="BVP vs IVP：在兩端定條件" subtitle="§11.1">
      <p>
        到 Ch10 為止我們都在做 <strong>初值問題（IVP）</strong>：
        在同一點 x₀ 給 <code>y(x₀)</code> 與 <code>y'(x₀)</code>，然後順著時間走下去。
        對自由演化（一顆球、一個電路）這很自然。
      </p>
      <p class="key-idea">
        但<strong>空間問題</strong>通常長得不一樣——我們在區間 <code>[a, b]</code> 的
        <strong>兩端</strong>各定一個條件。這叫做<strong>邊界值問題（BVP）</strong>。
      </p>

      <div class="compare">
        <div class="side ivp">
          <div class="side-title">IVP：初值問題</div>
          <code class="sample">y'' + y = 0</code>
          <code class="sample">y(0) = 1, y'(0) = 0</code>
          <div class="verdict ok">
            唯一解：y = cos(x)
          </div>
          <p>像看一顆球從初始位置/速度飛出去。Picard-Lindelöf 保證唯一性。</p>
        </div>
        <div class="side bvp">
          <div class="side-title">BVP：邊界值問題</div>
          <code class="sample">y'' + y = 0</code>
          <code class="sample">y(0) = 0, y(π) = 0</code>
          <div class="verdict weird">
            無窮多解：y = c·sin(x), 任意 c
          </div>
          <p>像綁住弦的兩端。解未必唯一也未必存在——<strong>邊界會反彈回來</strong>。</p>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="移動第二個邊界條件 y(L)：看 BVP 何時有解">
      <div class="plot">
        <div class="plot-title">y'' + y = 0,&nbsp;&nbsp;y(0) = 0,&nbsp;&nbsp;y(L) = 0</div>
        <svg viewBox="-20 -90 440 170" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-85" x2="0" y2="75" stroke="var(--border-strong)" stroke-width="1" />
          <text x="404" y="4" class="ax">x</text>
          <text x="4" y="-88" class="ax">y</text>
          <!-- x-marks -->
          @for (t of [Math.PI, 2*Math.PI, 3*Math.PI]; track $index) {
            <line [attr.x1]="(t / TOTAL) * 400" y1="-4" [attr.x2]="(t / TOTAL) * 400" y2="4" stroke="#ba8d2a" opacity="0.8" />
            <text [attr.x]="(t / TOTAL) * 400" y="-8" class="tick-mark">{{ $index + 1 }}π</text>
          }
          <!-- Family of solutions y = c sin(x) for various c; only show these if L is near multiple of pi -->
          @if (validL()) {
            @for (c of [-1.5, -1, -0.5, 0.5, 1, 1.5]; track c) {
              <path [attr.d]="sinPath(c)" fill="none"
                stroke="var(--accent)" stroke-width="1.5" opacity="0.7" />
            }
          } @else {
            <!-- No nontrivial solution: show only y=0 -->
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--accent)" stroke-width="2.5" />
            <text [attr.x]="(L() / TOTAL) * 200" y="-60" class="note" text-anchor="middle">
              只有平凡解 y ≡ 0
            </text>
          }
          <!-- L marker -->
          <line [attr.x1]="(L() / TOTAL) * 400" y1="-85"
            [attr.x2]="(L() / TOTAL) * 400" y2="75"
            stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2" />
          <text [attr.x]="(L() / TOTAL) * 400 + 3" y="70" class="ax-label">x = L</text>
        </svg>

        <div class="ctrl">
          <div class="sl">
            <span class="sl-lab">第二邊界 L</span>
            <input type="range" [min]="0.3" [max]="TOTAL" step="0.05" [value]="L()"
              (input)="L.set(+$any($event).target.value)" />
            <span class="sl-val">{{ L().toFixed(2) }}</span>
          </div>
        </div>

        <div class="verdict-box" [class.yes]="validL()" [class.no]="!validL()">
          @if (validL()) {
            ✓ L 是 π 的整數倍 → 無窮多解（解族 y = c sin(x)，c 為任意值）
          } @else {
            ✗ L 不是 π 的整數倍 → 只有平凡解 y = 0
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>關鍵觀察：BVP 的「共振」</h4>
      <p>
        上面的 BVP 只在 <code>L = π, 2π, 3π, …</code> 才有非平凡解。
        這些特殊的 L 值叫做<strong>本徵值（eigenvalues）</strong>，對應的
        <code>sin(nπx/L)</code> 叫做<strong>本徵函數（eigenfunctions）</strong>。
      </p>
      <p>
        如果我們改寫 ODE 為 <code>y'' + λy = 0</code>（λ 待定），邊界仍是 <code>y(0) = y(L) = 0</code>，
        則：
      </p>
      <div class="centered-eq big">
        λₙ = (nπ/L)²,&nbsp;&nbsp;yₙ(x) = sin(nπx/L),&nbsp;&nbsp;n = 1, 2, 3, …
      </div>
      <p>
        這正是「<strong>振動弦</strong>」的諧波頻率！
        弦樂器的基音、八度、五度——全部藏在這個 BVP 裡。
      </p>

      <h4>BVP 在物理中的角色</h4>
      <ul class="physics-list">
        <li><strong>振動弦</strong>：固定兩端，允許的振動頻率。</li>
        <li><strong>散熱棒</strong>：兩端溫度已知，穩態溫度分佈。</li>
        <li><strong>量子粒子在盒子裡</strong>：壁外無限位能，允許的能階。</li>
        <li><strong>光波導</strong>：固定邊界下的電磁場模態。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        BVP 本質上是「找出允許的 λ 與對應的形狀」。
        這是<strong>本徵值問題</strong>，也是 Ch12-Ch14 所有 PDE 分離變數法的核心。
        下一節正式定義並計算它們。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    @media (max-width: 640px) { .compare { grid-template-columns: 1fr; } }
    .side { padding: 14px; border-radius: 10px; border: 1px solid var(--border); }
    .side.ivp { background: rgba(92, 168, 120, 0.08); }
    .side.bvp { background: rgba(200, 123, 94, 0.08); }
    .side-title { font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .sample { display: block; background: var(--bg); padding: 5px 10px; margin: 3px 0; font-size: 13px; }
    .verdict { padding: 8px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; margin: 8px 0; text-align: center; }
    .verdict.ok { background: rgba(92, 168, 120, 0.15); color: #5ca878; }
    .verdict.weird { background: rgba(244, 200, 102, 0.15); color: #ba8d2a; }
    .side p { margin: 6px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-top: 10px; }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .plot-svg { width: 100%; display: block; }
    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }
    .tick-mark { font-size: 10px; fill: #ba8d2a; text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .note { font-size: 12px; fill: var(--accent); font-weight: 600; }
    .ax-label { font-size: 10px; fill: var(--accent); }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 84px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .verdict-box { padding: 10px 12px; border-radius: 8px; font-size: 13px; text-align: center; font-weight: 600; margin-top: 10px; }
    .verdict-box.yes { background: rgba(92, 168, 120, 0.12); color: #5ca878; }
    .verdict-box.no { background: rgba(200, 123, 94, 0.12); color: #c87b5e; }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .centered-eq {
      text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0;
    }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .physics-list { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .physics-list strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh11BvpVsIvpComponent {
  readonly Math = Math;
  readonly TOTAL = 3 * Math.PI + 0.3;
  readonly L = signal(Math.PI);

  readonly validL = computed(() => {
    const L = this.L();
    for (const k of [1, 2, 3]) {
      if (Math.abs(L - k * Math.PI) < 0.08) return true;
    }
    return false;
  });

  sinPath(c: number): string {
    const pts: string[] = [];
    const L = this.L();
    const W = 400;
    const H = 40;
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * L;
      const y = c * Math.sin(x);
      const px = (x / this.TOTAL) * W;
      const py = -y * H;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
