import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { jordanBlockExp } from './jordan-util';

@Component({
  selector: 'app-step-jordan-applications',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="應用：ODE 的重根案例" subtitle="§17.7">
      <p>
        第九章解 dx/dt = Ax 時，如果 A 可對角化，解是 e^(λt) 的線性組合。
        但如果 A 有<strong>缺陷特徵值</strong>呢？
      </p>
      <p>
        用 Jordan 形：A = PJP⁻¹，所以 e^(At) = P e^(Jt) P⁻¹。
        每個 Jordan 區塊的指數：
      </p>
      <p class="formula">e^(Jₖ(λ)t) = eᵏᵗ × [1, t, t²/2!, …; 0, 1, t, …; …]</p>
      <p>
        這就是為什麼重根 ODE 出現 <strong>t·eᵏᵗ</strong> 項——它來自 Jordan 區塊的超對角！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看 2×2 Jordan 區塊的 ODE 解長什麼樣">
      <div class="ctrl-row">
        <div class="ctrl">
          <span class="ctrl-label">λ =</span>
          <input type="range" min="-2" max="1" step="0.1" [value]="lambda()"
                 (input)="onLambda($event)" class="ctrl-slider" />
          <span class="ctrl-val">{{ lambda().toFixed(1) }}</span>
        </div>
      </div>

      <div class="layout">
        <div class="svg-panel">
          <svg viewBox="-3 -3 6 6" class="phase-svg">
            <!-- Axes -->
            <line x1="-3" y1="0" x2="3" y2="0" stroke="var(--border)" stroke-width="0.02" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--border)" stroke-width="0.02" />
            <text x="2.7" y="-0.15" class="ax">x₁</text>
            <text x="0.1" y="-2.7" class="ax">x₂</text>

            <!-- Trajectories -->
            @for (traj of trajectories(); track $index) {
              <path [attr.d]="traj.path" fill="none" stroke="var(--accent)"
                    stroke-width="0.04" stroke-opacity="0.6" />
              <circle [attr.cx]="traj.endX" [attr.cy]="traj.endY" r="0.06"
                      fill="var(--accent)" />
            }
          </svg>
        </div>

        <div class="plot-panel">
          <div class="plot-title">解的分量（初始值 x₀ = [1, 0]）</div>
          <svg viewBox="-5 -2.5 55 5.5" class="plot-svg">
            <!-- t axis -->
            <line x1="0" y1="0" x2="50" y2="0" stroke="var(--border)" stroke-width="0.1" />
            @for (tick of tTicks; track tick) {
              <line [attr.x1]="tick * 10" y1="-0.2" [attr.x2]="tick * 10" y2="0.2"
                    stroke="var(--border)" stroke-width="0.1" />
              <text [attr.x]="tick * 10" y="0.8" class="tick-label">{{ tick }}</text>
            }

            <!-- x1(t) = e^λt (1 + t) -->
            <path [attr.d]="x1Path()" fill="none" stroke="#5a7faa" stroke-width="0.15" />
            <!-- x2(t) = 0 (for x0 = [1,0] with J2(λ)) — actually depends on the initial condition -->

            <text x="42" y="-1.5" class="curve-label" fill="#5a7faa">x₁(t)</text>
          </svg>
          <div class="plot-note">
            x₁(t) = eᵏᵗ(1 + t) — 注意<strong> t·eᵏᵗ </strong>這一項！
          </div>
        </div>
      </div>

      <div class="stability-box" [class.stable]="lambda() < 0" [class.unstable]="lambda() >= 0">
        @if (lambda() < 0) {
          λ < 0 → 指數衰減主導，t·eᵏᵗ 最終也趨近 0（穩定）
        } @else if (lambda() === 0) {
          λ = 0 → 解是多項式增長（t, t², …），不穩定
        } @else {
          λ > 0 → 指數增長，t·eᵏᵗ 爆炸（不穩定）
        }
      </div>
    </app-challenge-card>

    <app-prose-block title="第十七章總結">
      <p>
        這一章填補了第六章留下的缺口：
      </p>
      <ul>
        <li><strong>缺陷矩陣</strong>：特徵向量不夠，無法對角化（§17.1）</li>
        <li><strong>Schur 分解</strong>：至少能做到上三角，而且永遠成立（§17.2）</li>
        <li><strong>Cayley-Hamilton</strong>：每個矩陣滿足自己的特徵方程（§17.3）</li>
        <li><strong>廣義特徵向量</strong>：放寬條件，補齊缺少的向量（§17.4）</li>
        <li><strong>Jordan 區塊</strong>：λ + 位移，冪次包含二項式係數（§17.5）</li>
        <li><strong>Jordan 標準形</strong>：矩陣在相似變換下的唯一最簡形式（§17.6）</li>
        <li><strong>ODE 應用</strong>：t·eᵏᵗ 的來源就是 Jordan 區塊（§17.7）</li>
      </ul>
      <p>
        Jordan 形是線性代數的「終極武器」——任何方陣的行為都可以用它完整描述。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.7; }

    .ctrl-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
    .ctrl { display: flex; align-items: center; gap: 8px; }
    .ctrl-label { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-slider { width: 140px; accent-color: var(--accent); }
    .ctrl-val { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 30px; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .svg-panel { display: flex; justify-content: center; }
    .phase-svg { width: 100%; max-width: 280px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .ax { font-size: 0.2px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .plot-panel { display: flex; flex-direction: column; gap: 6px; }
    .plot-title { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .plot-svg { width: 100%; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg); }
    .tick-label { font-size: 0.8px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .curve-label { font-size: 1px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .plot-note { font-size: 12px; color: var(--text-secondary);
      strong { color: var(--accent); } }

    .stability-box { padding: 10px 14px; border-radius: 8px; text-align: center;
      font-size: 13px; font-weight: 600;
      &.stable { background: rgba(90, 138, 90, 0.1); color: #5a8a5a; }
      &.unstable { background: rgba(160, 90, 90, 0.1); color: #a05a5a; } }
  `,
})
export class StepJordanApplicationsComponent {
  readonly lambda = signal(-0.5);
  readonly tTicks = [0, 1, 2, 3, 4, 5];

  // Phase portrait trajectories for J2(λ)
  readonly trajectories = computed(() => {
    const lam = this.lambda();
    const initials = [
      [1, 0], [0, 1], [-1, 0], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1],
    ];
    return initials.map((x0) => {
      const pts: string[] = [];
      let lastX = 0, lastY = 0;
      for (let t = 0; t <= 5; t += 0.05) {
        const expJ = jordanBlockExp(lam, 2, t);
        const x1 = expJ[0][0] * x0[0] + expJ[0][1] * x0[1];
        const x2 = expJ[1][0] * x0[0] + expJ[1][1] * x0[1];
        if (Math.abs(x1) > 3 || Math.abs(x2) > 3) break;
        pts.push(`${x1},${x2}`);
        lastX = x1; lastY = x2;
      }
      return {
        path: pts.length > 1 ? 'M' + pts.join('L') : '',
        endX: lastX, endY: lastY,
      };
    });
  });

  // x1(t) plot for x0=[1,0]
  x1Path(): string {
    const lam = this.lambda();
    const pts: string[] = [];
    for (let t = 0; t <= 5; t += 0.05) {
      const val = Math.exp(lam * t) * (1 + t); // e^λt (1 + t·1) for J2
      const x = t * 10;
      const y = -val; // flip for SVG
      if (Math.abs(y) > 2.5) break;
      pts.push(`${x},${y}`);
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }

  onLambda(ev: Event): void {
    this.lambda.set(+(ev.target as HTMLInputElement).value);
  }
}
