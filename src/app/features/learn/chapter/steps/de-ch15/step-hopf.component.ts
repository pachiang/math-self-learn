import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/** Normal form of Hopf: r' = μr - r^3, θ' = ω   (supercritical) */
function simulateHopf(mu: number, x0: number, y0: number, steps: number, dt: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  let x = x0, y = y0;
  const omega = 1;
  for (let i = 0; i < steps; i++) {
    const r2 = x * x + y * y;
    const fx = mu * x - omega * y - x * r2;
    const fy = omega * x + mu * y - y * r2;
    x += fx * dt;
    y += fy * dt;
    pts.push([x, y]);
  }
  return pts;
}

@Component({
  selector: 'app-de-ch15-hopf',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Hopf 分岔：平衡點生出極限環" subtitle="§15.2">
      <p>
        在 2D 中有一個更戲劇性的分岔：一個<strong>穩定平衡點</strong>
        隨參數變化<strong>失去穩定性</strong>，但同時周圍誕生一個<strong>小小的極限環</strong>。
        這叫做<strong>Hopf 分岔</strong>。
      </p>

      <h4>Hopf 正規形式</h4>
      <div class="centered-eq big">
        ẋ = μx − ωy − x(x² + y²),&nbsp;&nbsp; ẏ = ωx + μy − y(x² + y²)
      </div>
      <p>
        用極座標 <code>r² = x² + y²</code> 改寫：
      </p>
      <div class="centered-eq">
        ṙ = μr − r³,&nbsp;&nbsp; θ̇ = ω
      </div>
      <ul class="analysis">
        <li>
          <strong>μ &lt; 0：</strong> r 收斂到 0（指數衰減），原點是穩定螺旋。沒有極限環。
        </li>
        <li>
          <strong>μ = 0：</strong> 臨界——原點變成弱穩定（像 1/√t 慢速趨近）。
        </li>
        <li>
          <strong>μ &gt; 0：</strong> 原點變不穩定，出現半徑 <code>r = √μ</code> 的<strong>穩定極限環</strong>。
        </li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="滑動 μ：觀察極限環從無到有">
      <div class="phase-plot">
        <div class="pp-title">相平面軌跡（從多個初始點出發）</div>
        <svg viewBox="-110 -110 220 220" class="pp-svg">
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border)" stroke-width="0.5" opacity="0.5" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border)" stroke-width="0.5" opacity="0.5" />

          <!-- Limit cycle (if mu > 0) -->
          @if (mu() > 0.005) {
            <circle cx="0" cy="0" [attr.r]="Math.sqrt(mu()) * 100"
              fill="none" stroke="#ba8d2a" stroke-width="2" stroke-dasharray="4 3" opacity="0.9" />
            <text x="3" [attr.y]="-Math.sqrt(mu()) * 100 - 3" class="lc-lab">極限環 r=√μ</text>
          }

          <!-- Trajectories -->
          @for (traj of trajectories(); track traj.id) {
            <path [attr.d]="traj.d" fill="none" stroke="var(--accent)" stroke-width="1.3" opacity="0.55" />
            <circle [attr.cx]="traj.cx" [attr.cy]="traj.cy" r="2.5" fill="var(--accent)" />
          }

          <!-- Origin equilibrium -->
          <circle cx="0" cy="0" r="4.5"
            [attr.fill]="mu() > 0 ? 'white' : '#5ca878'"
            [attr.stroke]="mu() > 0 ? '#c87b5e' : '#5ca878'"
            stroke-width="2" />
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">μ</span>
          <input type="range" min="-0.5" max="1" step="0.01" [value]="mu()"
            (input)="mu.set(+$any($event).target.value)" />
          <span class="sl-val">{{ mu().toFixed(2) }}</span>
        </div>
      </div>

      <div class="verdict" [attr.data-stage]="stage()">
        @if (stage() === 'stable') {
          <strong>μ &lt; 0：</strong> 原點是穩定螺旋——所有軌跡螺旋收斂到它。
        } @else if (stage() === 'crit') {
          <strong>μ ≈ 0：</strong> 分岔點。原點<strong>正在失去穩定性</strong>。
        } @else {
          <strong>μ &gt; 0：</strong> 極限環誕生！半徑 = √{{ mu().toFixed(2) }} = {{ Math.sqrt(Math.max(0, mu())).toFixed(2) }}。
          所有軌跡（無論內外）趨於這個環。
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>Hopf 分岔的應用</h4>
      <div class="app-grid">
        <div class="app">
          <div class="app-name">心跳節律</div>
          <p>心臟起搏器細胞：藥物或疾病改變某參數 → Hopf → 週期性跳動誕生（或消失）。</p>
        </div>
        <div class="app">
          <div class="app-name">雷射</div>
          <p>泵浦功率跨越閾值 → 從「無光輸出」Hopf 到「相干光震盪」。</p>
        </div>
        <div class="app">
          <div class="app-name">經濟週期</div>
          <p>景氣循環模型中，某參數（投資率）Hopf → 從穩定經濟到週期性榮枯。</p>
        </div>
        <div class="app">
          <div class="app-name">生態</div>
          <p>Lotka-Volterra 的修正模型，參數變化 → 族群振盪出現或消失。</p>
        </div>
        <div class="app">
          <div class="app-name">化學振盪</div>
          <p>Belousov-Zhabotinsky 反應——顏色週期性變化由 Hopf 產生。</p>
        </div>
        <div class="app">
          <div class="app-name">神經元放電</div>
          <p>Hodgkin-Huxley 方程：輸入電流增大 → Hopf → 神經元開始規律發射脈衝。</p>
        </div>
      </div>

      <h4>Subcritical vs Supercritical</h4>
      <p>
        上面是 <strong>supercritical Hopf</strong>（高次項 -r³ 穩定）：
        環溫和地從 0 長出來，安全。
      </p>
      <p>
        <strong>Subcritical Hopf</strong>（高次項 +r³ 不穩定，需要更高次 -r⁵ 安定）：
        穩定環與不穩定環共存於 μ 小於 0 的區間，當 μ 跨越 0，
        系統<strong>突然跳到大振幅</strong>——危險！
        航空業的「flutter」（氣動彈性震盪）、心室纖顫、電網大規模振盪都屬此類。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        Hopf 分岔 = 平衡點變不穩定時誕生極限環。
        許多「週期性」現象的根本起源——從心跳到雷射。
        Ch9 的 Van der Pol 就是典型的 Hopf 之後。
        下一節跳到高維：Lorenz 吸引子與混沌。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .analysis { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .analysis strong { color: var(--accent); }

    .phase-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pp-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pp-svg { width: 340px; max-width: 100%; display: block; margin: 0 auto; }
    .lc-lab { font-size: 9px; fill: #ba8d2a; font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 30px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .verdict { padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 10px; line-height: 1.6; }
    .verdict[data-stage='stable'] { background: rgba(92, 168, 120, 0.1); color: #5ca878; }
    .verdict[data-stage='crit'] { background: rgba(244, 200, 102, 0.1); color: #ba8d2a; }
    .verdict[data-stage='unstable'] { background: rgba(200, 123, 94, 0.1); color: #c87b5e; }
    .verdict strong { color: inherit; }

    .app-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 10px 0; }
    .app { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .app-name { font-weight: 700; color: var(--accent); font-size: 13px; }
    .app p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh15HopfComponent {
  readonly Math = Math;
  readonly mu = signal(0.3);

  readonly stage = computed(() => {
    const m = this.mu();
    if (m < -0.03) return 'stable';
    if (m < 0.03) return 'crit';
    return 'unstable';
  });

  readonly trajectories = computed(() => {
    const mu = this.mu();
    const initials: Array<[number, number]> = [
      [0.05, 0], [0.08, 0.04], [0.1, 0], [-0.1, 0],
      [0, 1], [0.8, 0.5], [-0.8, -0.3], [1.0, -0.1],
    ];
    const SCALE = 100;
    return initials.map((init, i) => {
      const pts = simulateHopf(mu, init[0], init[1], 600, 0.05);
      const seg: string[] = [];
      for (let k = 0; k < pts.length; k += 2) {
        const [x, y] = pts[k];
        const px = x * SCALE;
        const py = -y * SCALE;
        if (Math.abs(px) > 110 || Math.abs(py) > 110) continue;
        seg.push(`${seg.length === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
      }
      const last = pts[pts.length - 1];
      return {
        id: i,
        d: seg.join(' '),
        cx: last[0] * SCALE,
        cy: -last[1] * SCALE,
      };
    });
  });
}
