import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Logistic with constant harvest:  dN/dt = r N (1 - N/K) - h
 * Equilibria at r(N - N²/K) = h  =>  N² - K N + K h / r = 0
 * => N = K/2 ± sqrt( K²/4 - K h / r )
 * => exists only when h <= r K / 4.
 */

const R = 0.5;
const K = 100;

function rhsOf(N: number, h: number): number {
  return R * N * (1 - N / K) - h;
}

function equilibria(h: number): { lower: number | null; upper: number | null; crit: number } {
  const crit = (R * K) / 4; // max sustainable harvest
  if (h > crit) return { lower: null, upper: null, crit };
  const disc = (K * K) / 4 - (K * h) / R;
  if (disc < 0) return { lower: null, upper: null, crit };
  const s = Math.sqrt(disc);
  return { lower: K / 2 - s, upper: K / 2 + s, crit };
}

function simulate(N0: number, h: number, tMax = 40, dt = 0.05): Array<[number, number]> {
  const pts: Array<[number, number]> = [[0, N0]];
  let N = N0;
  let t = 0;
  const steps = Math.ceil(tMax / dt);
  for (let i = 0; i < steps; i++) {
    const k1 = rhsOf(N, h);
    const k2 = rhsOf(N + (dt / 2) * k1, h);
    const k3 = rhsOf(N + (dt / 2) * k2, h);
    const k4 = rhsOf(N + dt * k3, h);
    N = N + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + dt;
    if (N < 0) { pts.push([t, 0]); break; }
    if (N > 200) { pts.push([t, 200]); break; }
    pts.push([t, N]);
  }
  return pts;
}

@Component({
  selector: 'app-de-ch3-logistic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Logistic 族群 + 捕撈" subtitle="§3.6">
      <p>
        前面的指數成長模型 <code>dN/dt = rN</code> 有個大問題——它預測族群會無止境爆炸。現實中，資源有限，
        當族群變大時就會因食物／空間不足而放慢。
      </p>
      <p>
        Verhulst 在 1838 年提出修正：
      </p>
      <div class="centered-eq big">dN/dt = r N (1 − N/K)</div>
      <p>
        <strong>K</strong> 是<strong>承載量</strong>（carrying capacity）——環境所能供養的最大族群。
        N 小時成長近似指數（項 <code>1 − N/K ≈ 1</code>）；N 接近 K 時成長趨近 0（項 <code>1 − N/K → 0</code>）。
        最終 N → K。
      </p>
      <p class="key-idea">
        現在加一個真實因素：<strong>人類捕撈</strong>。假設我們每年捕走固定量 <code>h</code>（條魚）：
      </p>
      <div class="centered-eq big">dN/dt = r N (1 − N/K) − h</div>
      <p>
        這一招看起來只加了一個常數，但<strong>它徹底改變系統的行為</strong>——出現兩個平衡點、
        一個<strong>臨界捕撈率</strong>，越過它整個族群會滅絕。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 h 的滑桿，看 dN/dt 的相線、平衡點、N(t) 怎麼變">
      <div class="viz-grid">
        <!-- Phase line dN/dt vs N -->
        <div class="viz-col">
          <div class="viz-head">相線：dN/dt vs N</div>
          <svg viewBox="-10 -140 260 260" class="phase-svg">
            <!-- Axes -->
            <line x1="0" y1="60" x2="240" y2="60" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-130" x2="0" y2="120" stroke="var(--border-strong)" stroke-width="1" />
            <text x="242" y="64" class="ax">N</text>
            <text x="-4" y="-132" class="ax">dN/dt</text>

            <!-- Grid -->
            @for (n of [0, 25, 50, 75, 100]; track n) {
              <line [attr.x1]="n * 2.1" y1="57" [attr.x2]="n * 2.1" y2="63"
                stroke="var(--text-muted)" stroke-width="0.8" />
              <text [attr.x]="n * 2.1" y="74" class="tick">{{ n }}</text>
            }

            <!-- Critical harvest reference -->
            <line x1="0" y1="-65" x2="240" y2="-65"
              stroke="#c87b5e" stroke-width="0.6" stroke-dasharray="2 2" opacity="0.4" />
            <text x="238" y="-67" class="tick" style="fill: #c87b5e" text-anchor="end">
              rK/4 = {{ (R * K / 4).toFixed(1) }}
            </text>

            <!-- dN/dt curve -->
            <path [attr.d]="phasePath()" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />

            <!-- Zero horizontal line (where dN/dt = 0) -->
            <line x1="0" y1="60" x2="240" y2="60" stroke="none" />

            <!-- Equilibria markers -->
            @if (eq().lower !== null) {
              <circle [attr.cx]="eq().lower! * 2.1" cy="60" r="5.5"
                fill="none" stroke="#c87b5e" stroke-width="2" />
              <text [attr.x]="eq().lower! * 2.1" y="92" class="eq-lab unstable">
                不穩定 N₁
              </text>
            }
            @if (eq().upper !== null) {
              <circle [attr.cx]="eq().upper! * 2.1" cy="60" r="5.5"
                fill="#5ca878" stroke="white" stroke-width="1.5" />
              <text [attr.x]="eq().upper! * 2.1" y="92" class="eq-lab stable">
                穩定 N₂
              </text>
            }
          </svg>
          <p class="viz-note">
            曲線跟 x 軸的交點 = 平衡點。開口下方的 ● 穩定（吸引），上方的 ○ 不穩定（排斥）。
          </p>
        </div>

        <!-- Time evolution -->
        <div class="viz-col">
          <div class="viz-head">N(t) 不同初值演化</div>
          <svg viewBox="-10 -10 280 240" class="ts-svg">
            <line x1="0" y1="220" x2="260" y2="220" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="0" x2="0" y2="220" stroke="var(--border-strong)" stroke-width="1" />
            <text x="262" y="224" class="ax">t</text>
            <text x="-4" y="-4" class="ax">N</text>

            <!-- N axis ticks -->
            @for (n of [25, 50, 75, 100, 125]; track n) {
              <line x1="-3" [attr.y1]="220 - n * 1.5" x2="3" [attr.y2]="220 - n * 1.5"
                stroke="var(--text-muted)" stroke-width="0.8" />
              <text x="-4" [attr.y]="220 - n * 1.5 + 3" class="tick right">{{ n }}</text>
            }

            <!-- Equilibrium horizontal lines -->
            @if (eq().lower !== null) {
              <line x1="0" [attr.y1]="220 - eq().lower! * 1.5"
                x2="260" [attr.y2]="220 - eq().lower! * 1.5"
                stroke="#c87b5e" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.6" />
            }
            @if (eq().upper !== null) {
              <line x1="0" [attr.y1]="220 - eq().upper! * 1.5"
                x2="260" [attr.y2]="220 - eq().upper! * 1.5"
                stroke="#5ca878" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.6" />
            }

            <!-- Multiple trajectories -->
            @for (curve of trajectoryPaths(); track $index) {
              <path [attr.d]="curve.path" fill="none"
                [attr.stroke]="curve.color"
                stroke-width="1.6" opacity="0.85" />
            }
          </svg>
          <p class="viz-note">
            多條解曲線（不同初值 N₀）。高於不穩定點 → 收斂到 N₂；低於則滅絕。
          </p>
        </div>
      </div>

      <!-- Bifurcation diagram -->
      <div class="bif-wrap">
        <div class="viz-head">分岔圖：平衡點 vs 捕撈率 h</div>
        <svg viewBox="-30 -10 390 200" class="bif-svg">
          <line x1="0" y1="170" x2="360" y2="170" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="0" x2="0" y2="170" stroke="var(--border-strong)" stroke-width="1" />
          <text x="362" y="174" class="ax">h</text>
          <text x="-10" y="-4" class="ax">N*</text>

          <!-- Ticks -->
          @for (n of [25, 50, 75, 100]; track n) {
            <text x="-6" [attr.y]="170 - n * 1.4 + 3" class="tick right">{{ n }}</text>
          }
          @for (hTick of [5, 10, 12.5]; track hTick) {
            <text [attr.x]="hTick * 22" y="184" class="tick">{{ hTick }}</text>
          }

          <!-- Critical h marker -->
          <line [attr.x1]="(R * K / 4) * 22" y1="170"
            [attr.x2]="(R * K / 4) * 22" y2="0"
            stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.7" />
          <text [attr.x]="(R * K / 4) * 22 + 4" y="14" class="tick" style="fill: #c87b5e">
            h_crit = rK/4 = {{ (R * K / 4).toFixed(1) }}
          </text>

          <!-- Stable branch (upper) -->
          <path [attr.d]="stableBranchPath()" fill="none"
            stroke="#5ca878" stroke-width="2.4" />
          <!-- Unstable branch (lower) -->
          <path [attr.d]="unstableBranchPath()" fill="none"
            stroke="#c87b5e" stroke-width="2" stroke-dasharray="5 3" />

          <!-- Current h marker -->
          <line [attr.x1]="h() * 22" y1="170"
            [attr.x2]="h() * 22" y2="0"
            stroke="var(--accent)" stroke-width="1.5" opacity="0.5" />
          @if (eq().upper !== null) {
            <circle [attr.cx]="h() * 22" [attr.cy]="170 - eq().upper! * 1.4"
              r="5" fill="#5ca878" stroke="white" stroke-width="1.5" />
          }
          @if (eq().lower !== null) {
            <circle [attr.cx]="h() * 22" [attr.cy]="170 - eq().lower! * 1.4"
              r="4.5" fill="none" stroke="#c87b5e" stroke-width="2" />
          }

          <!-- Legend -->
          <rect x="230" y="14" width="120" height="38" fill="var(--bg-surface)"
            stroke="var(--border)" rx="3" />
          <line x1="236" y1="24" x2="248" y2="24" stroke="#5ca878" stroke-width="2.2" />
          <text x="252" y="27" class="leg">穩定（高平衡）</text>
          <line x1="236" y1="40" x2="248" y2="40"
            stroke="#c87b5e" stroke-width="1.8" stroke-dasharray="3 2" />
          <text x="252" y="43" class="leg">不穩定（低平衡）</text>
        </svg>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">捕撈率 h</span>
          <input type="range" min="0" max="18" step="0.1"
            [value]="h()" (input)="h.set(+$any($event).target.value)" />
          <span class="sl-val">{{ h().toFixed(1) }}</span>
        </div>

        <div class="status-line" [attr.data-kind]="statusKind()">
          @if (h() < 0.05) {
            無捕撈：族群穩定在承載量 K = {{ K }}。
          } @else if (h() < R * K / 4 - 0.5) {
            <strong>永續捕撈區</strong>：出現兩個平衡點。族群會向穩態 N₂ =
            <strong>{{ eq().upper!.toFixed(1) }}</strong> 收斂，前提是初值不能低於不穩定點 N₁ =
            {{ eq().lower!.toFixed(1) }}。
          } @else if (h() <= R * K / 4 + 0.05) {
            <strong>⚠ 接近臨界</strong>：兩個平衡點幾乎合併在 N = K/2 = 50，
            已經很難穩定維持。
          } @else {
            <strong>✗ 過度捕撈</strong>：超過臨界值 rK/4 = {{ (R * K / 4).toFixed(1) }}，
            不論初值多少，族群都會滅絕。這就是為什麼漁業要有配額！
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個模型教我們一件漁業經濟學裡真實的事：<strong>可持續捕撈有上限</strong>。
        越過 <code>rK/4</code> 這個臨界值，不是「捕得多」而是「魚群直接崩盤」。
      </p>
      <ul>
        <li><strong>最大可持續產量 MSY = rK/4</strong>：漁業與野生動物管理最重要的概念之一。捕撈應該<em>恰好</em>在 MSY 或以下。</li>
        <li><strong>兩個平衡，一個陷阱</strong>：高平衡 N₂ 穩定、低平衡 N₁ 不穩定。若意外讓族群掉到 N₁ 以下——就再也回不去了。</li>
        <li><strong>分岔圖</strong>：h 從 0 增加到 rK/4 時，兩平衡點從 (0, K) 向中央夾逼，最終在 K/2 碰撞並消失——這叫 <strong>saddle-node 分岔</strong>。Ch10 會細看這現象。</li>
      </ul>
      <p>
        類似的結構出現在很多非線性一階：生態系、經濟學的技術採用、疾病傳染的「突破門檻」——
        所有具備「穩定狀態＋臨界點」的現象都繼承這個骨架。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Logistic + 捕撈是 ODE 課裡最小但最有啟發的非線性模型。
        它示範了「非線性帶來多重平衡、分岔、突發崩塌」——這些現象是 §3.1–§3.4 的線性模型永遠無法表現的。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 18px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 22px; padding: 16px; }

    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .viz-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    @media (max-width: 640px) {
      .viz-grid { grid-template-columns: 1fr; }
    }

    .viz-col, .bif-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .bif-wrap { margin-bottom: 14px; }

    .viz-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 6px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .phase-svg, .ts-svg, .bif-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .tick.right { text-anchor: end; }

    .leg {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .eq-lab {
      font-size: 10px;
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .eq-lab.stable { fill: #5ca878; font-weight: 700; }
    .eq-lab.unstable { fill: #c87b5e; }

    .viz-note {
      margin: 4px 0 0;
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.5;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .sl-lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      min-width: 80px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .status-line {
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .status-line[data-kind='safe'] {
      background: rgba(92, 168, 120, 0.08);
      border: 1px solid rgba(92, 168, 120, 0.3);
    }

    .status-line[data-kind='critical'] {
      background: rgba(244, 200, 102, 0.08);
      border: 1px solid rgba(244, 200, 102, 0.35);
    }

    .status-line[data-kind='collapse'] {
      background: rgba(200, 123, 94, 0.1);
      border: 1px solid rgba(200, 123, 94, 0.35);
    }

    .status-line strong { color: var(--text); }
  `,
})
export class DeCh3LogisticComponent implements OnInit, OnDestroy {
  readonly h = signal(3);
  readonly K = K;
  readonly R = R;

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  readonly eq = computed(() => equilibria(this.h()));

  readonly statusKind = computed(() => {
    const h = this.h();
    const crit = (R * K) / 4;
    if (h < crit - 0.5) return 'safe';
    if (h <= crit + 0.05) return 'critical';
    return 'collapse';
  });

  // Phase plot: x from 0 to 120 (N-axis), y the value of dN/dt
  // Plot coordinates: x = N * 2.1, y = 60 - (dN/dt) * 2 (clamped)
  readonly phasePath = computed(() => {
    const pts: string[] = [];
    const h = this.h();
    for (let i = 0; i <= 120; i++) {
      const N = i;
      const dNdt = rhsOf(N, h);
      const x = N * 2.1;
      const y = 60 - Math.max(-180, Math.min(180, dNdt * 4));
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  });

  // Multiple trajectories: scan initial N0
  readonly trajectoryPaths = computed(() => {
    const h = this.h();
    const initials = [10, 25, 40, 60, 80, 100, 120];
    const out: { path: string; color: string }[] = [];
    for (const N0 of initials) {
      const traj = simulate(N0, h);
      const path = traj.map(([t, N], i) => {
        const x = t * 6.5;
        const y = 220 - Math.max(-10, Math.min(230, N * 1.5));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ');
      // Color by fate: if ends near upper eq → green; if near 0 → red; else grey
      const finalN = traj[traj.length - 1][1];
      let color = '#888';
      if (finalN > 1) color = '#5ca878';
      else color = '#c87b5e';
      out.push({ path, color });
    }
    return out;
  });

  readonly stableBranchPath = computed(() => {
    // upper branch: N = K/2 + sqrt(K²/4 - K h / r) for h in [0, rK/4]
    const pts: string[] = [];
    const crit = (R * K) / 4;
    for (let i = 0; i <= 100; i++) {
      const h = (i / 100) * crit;
      const s = Math.sqrt(Math.max(0, (K * K) / 4 - (K * h) / R));
      const Nu = K / 2 + s;
      pts.push(`${i === 0 ? 'M' : 'L'} ${(h * 22).toFixed(1)} ${(170 - Nu * 1.4).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly unstableBranchPath = computed(() => {
    const pts: string[] = [];
    const crit = (R * K) / 4;
    for (let i = 0; i <= 100; i++) {
      const h = (i / 100) * crit;
      const s = Math.sqrt(Math.max(0, (K * K) / 4 - (K * h) / R));
      const Nl = K / 2 - s;
      pts.push(`${i === 0 ? 'M' : 'L'} ${(h * 22).toFixed(1)} ${(170 - Nl * 1.4).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
