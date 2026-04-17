import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-pullback',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="拉回（Pullback）" subtitle="§19.5">
      <p>
        座標變換 φ: U → V 時，V 上的 k-form ω 可以「拉回」到 U 上：
      </p>
      <p class="formula">φ*ω = 拉回的形式（在 U 上定義）</p>
      <p>
        拉回讓微分形式可以在不同座標系之間「翻譯」。
        Ch14 的換元公式 ∬f |det J| du dv 其實就是拉回的特例！
      </p>
      <p>
        <strong>關鍵性質</strong>：拉回和外微分可交換：φ*(dω) = d(φ*ω)。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="極座標拉回：看 dx∧dy 如何變成 r dr∧dθ">
      <div class="example-box">
        <div class="ex-title">例：極座標 φ(r,θ) = (r cosθ, r sinθ)</div>
        <div class="ex-steps">
          <div class="step">
            <span class="sn">1</span>
            <span class="sc">x = r cosθ → dx = cosθ dr − r sinθ dθ</span>
          </div>
          <div class="step">
            <span class="sn">2</span>
            <span class="sc">y = r sinθ → dy = sinθ dr + r cosθ dθ</span>
          </div>
          <div class="step">
            <span class="sn">3</span>
            <span class="sc">dx ∧ dy = (cosθ dr − r sinθ dθ) ∧ (sinθ dr + r cosθ dθ)</span>
          </div>
          <div class="step highlight">
            <span class="sn">4</span>
            <span class="sc">= r(cos²θ + sin²θ) dr ∧ dθ = <strong>r dr ∧ dθ</strong></span>
          </div>
        </div>
      </div>

      <svg viewBox="-0.1 -0.1 2.2 1.2" class="pb-svg">
        <!-- Source (r,θ) rectangle -->
        <rect x="0" y="0" width="0.9" height="1" fill="rgba(90,138,90,0.08)" stroke="#5a8a5a" stroke-width="0.01" rx="0.02" />
        <text x="0.45" y="0.5" text-anchor="middle" fill="#5a8a5a" font-size="0.07">(r, θ) 空間</text>
        <!-- Grid in source -->
        @for (i of [1,2,3]; track i) {
          <line [attr.x1]="i * 0.225" y1="0" [attr.x2]="i * 0.225" y2="1" stroke="#5a8a5a" stroke-width="0.005" stroke-opacity="0.3" />
          <line x1="0" [attr.y1]="i * 0.25" x2="0.9" [attr.y2]="i * 0.25" stroke="#5a8a5a" stroke-width="0.005" stroke-opacity="0.3" />
        }

        <!-- Arrow -->
        <line x1="1.0" y1="0.5" x2="1.15" y2="0.5" stroke="var(--accent)" stroke-width="0.015" />
        <text x="1.075" y="0.43" text-anchor="middle" fill="var(--accent)" font-size="0.06">φ</text>
        <polygon points="1.15,0.47 1.2,0.5 1.15,0.53" fill="var(--accent)" />

        <!-- Target (x,y) with polar grid -->
        <g transform="translate(1.6, 0.5)">
          @for (r of [0.15, 0.3, 0.45]; track r) {
            <circle cx="0" cy="0" [attr.r]="r" fill="none" stroke="#5a7faa" stroke-width="0.005" stroke-opacity="0.3" />
          }
          @for (a of polarAngles; track a) {
            <line x1="0" y1="0" [attr.x2]="0.45 * Math.cos(a)" [attr.y2]="0.45 * Math.sin(a)"
                  stroke="#5a7faa" stroke-width="0.005" stroke-opacity="0.3" />
          }
          <circle cx="0" cy="0" r="0.45" fill="rgba(90,127,170,0.08)" stroke="#5a7faa" stroke-width="0.01" />
          <text x="0" y="0.02" text-anchor="middle" fill="#5a7faa" font-size="0.06">(x, y)</text>
        </g>
      </svg>

      <div class="result">
        <strong>φ*(dx ∧ dy) = r dr ∧ dθ</strong><br>
        多出來的 r 就是 Jacobian 行列式——拉回自動處理了面積拉伸！
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        拉回的意義：<strong>積分不依賴座標選擇</strong>。
        不管你用直角座標還是極座標，∬ ω 的值都一樣——因為拉回自動補償了座標變換的拉伸。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .example-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); margin-bottom: 12px; }
    .ex-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 10px; }
    .ex-steps { display: flex; flex-direction: column; gap: 6px; }
    .step { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-radius: 6px;
      &.highlight { background: var(--accent-10); border: 1px solid var(--accent); } }
    .sn { font-size: 12px; font-weight: 700; color: var(--accent); min-width: 18px; }
    .sc { font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .sc strong { color: var(--accent); font-size: 13px; }
    .pb-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .result { padding: 12px; border-radius: 8px; background: var(--accent-10); border: 2px solid var(--accent);
      text-align: center; font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); line-height: 1.7; }
    .result strong { color: var(--accent); font-size: 15px; }
  `,
})
export class StepPullbackComponent {
  readonly Math = Math;
  readonly polarAngles = Array.from({ length: 8 }, (_, i) => (2 * Math.PI * i) / 8);
}
