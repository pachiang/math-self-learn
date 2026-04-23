import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch12-heat-derivation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="熱方程從哪裡來？" subtitle="§12.2">
      <p>
        熱方程 <code>∂u/∂t = α·∂²u/∂x²</code> 不是天上掉下來的公式。
        它來自<strong>兩個物理原則 + 泰勒展開</strong>。讓我們推一遍。
      </p>

      <h4>原則 1：Fourier 熱傳導定律</h4>
      <p>
        熱流量（單位時間通過單位面積的能量）正比於<strong>溫度梯度</strong>的負值：
      </p>
      <div class="centered-eq">
        q(x, t) = −k · ∂u/∂x
      </div>
      <p>
        k 是熱傳導係數。負號：熱<strong>從高往低流</strong>。
      </p>

      <h4>原則 2：能量守恆</h4>
      <p>
        考慮棒子裡一小段 <code>[x, x + Δx]</code>，面積 A：
      </p>
      <ul class="cons">
        <li>儲存的能量 = <code>c·ρ·A·Δx·u</code>（c 比熱、ρ 密度）。</li>
        <li>左端流入 − 右端流出 = <code>q(x)·A − q(x+Δx)·A</code>。</li>
        <li>能量變化率 = 淨流入：<code>c·ρ·A·Δx·∂u/∂t = [q(x) − q(x+Δx)]·A</code></li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="拖動 Δx 讓它變小：看熱方程如何從「盒子平衡」誕生">
      <div class="rod-wrap">
        <svg viewBox="-20 -80 440 160" class="rod-svg">
          <!-- Rod -->
          <rect x="0" y="-30" width="400" height="60" fill="var(--bg)" stroke="var(--border)" />
          <!-- Temperature gradient visualization -->
          <defs>
            <linearGradient id="heatGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#c87b5e" stop-opacity="0.8" />
              <stop offset="50%" stop-color="#f4c866" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#5a8aa8" stop-opacity="0.4" />
            </linearGradient>
          </defs>
          <rect x="0" y="-30" width="400" height="60" fill="url(#heatGrad)" opacity="0.5" />

          <!-- Small segment [x, x+dx] -->
          <rect [attr.x]="boxStart()" y="-30" [attr.width]="dx() * 400" height="60"
            fill="var(--accent)" opacity="0.25" stroke="var(--accent)" stroke-width="2" />

          <!-- Arrows for heat flux -->
          <g>
            <path [attr.d]="'M ' + (boxStart() - 25) + ' 0 L ' + (boxStart() - 8) + ' 0'"
              stroke="var(--accent)" stroke-width="2" marker-end="url(#arrow)" />
            <text [attr.x]="boxStart() - 18" y="-38" class="label" text-anchor="middle">q(x)</text>
          </g>
          <g>
            <path [attr.d]="'M ' + (boxStart() + dx() * 400 + 8) + ' 0 L ' + (boxStart() + dx() * 400 + 25) + ' 0'"
              stroke="var(--accent)" stroke-width="2" marker-end="url(#arrow)" />
            <text [attr.x]="boxStart() + dx() * 400 + 18" y="-38" class="label" text-anchor="middle">q(x+Δx)</text>
          </g>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
            </marker>
          </defs>

          <!-- Segment label -->
          <text [attr.x]="boxStart() + dx() * 200" y="46" class="box-label" text-anchor="middle">
            Δx = {{ dx().toFixed(3) }}
          </text>

          <!-- left/right boundaries -->
          <text x="0" y="55" class="tick" text-anchor="start">x</text>
          <text [attr.x]="dx() * 400" y="55" [attr.dx]="boxStart()" class="tick" text-anchor="start">x+Δx</text>
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">Δx</span>
          <input type="range" min="0.02" max="0.5" step="0.01" [value]="dx()"
            (input)="dx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ dx().toFixed(2) }}</span>
        </div>
      </div>

      <div class="derivation">
        <div class="deriv-step">
          <div class="deriv-num">1</div>
          <div class="deriv-body">
            能量守恆：<code>cρA·Δx · ∂u/∂t = [q(x) − q(x+Δx)] · A</code>
          </div>
        </div>
        <div class="deriv-step">
          <div class="deriv-num">2</div>
          <div class="deriv-body">
            代入 q = −k·∂u/∂x：
            <code>cρ·Δx · ∂u/∂t = k·[∂u/∂x|_(x+Δx) − ∂u/∂x|_x]</code>
          </div>
        </div>
        <div class="deriv-step">
          <div class="deriv-num">3</div>
          <div class="deriv-body">
            除以 Δx 兩邊，讓 <strong>Δx → 0</strong>：
            <code>cρ · ∂u/∂t = k · ∂²u/∂x²</code>
          </div>
        </div>
        <div class="deriv-step final">
          <div class="deriv-num">✓</div>
          <div class="deriv-body">
            定義熱擴散率 <code>α = k/(cρ)</code>：
            <div class="final-eq">∂u/∂t = α · ∂²u/∂x²</div>
          </div>
        </div>
      </div>

      <p class="note">
        當你把 Δx 拉得越小，盒子越貼近「一個點」，差分就變成二階導數。
        這就是<strong>二階擴散項 uₓₓ 的物理意義</strong>：它等於「左鄰居 + 右鄰居 − 2 倍自己」的極限。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>uₓₓ 的物理直覺</h4>
      <div class="intuition-grid">
        <div class="intu">
          <div class="intu-head">uₓₓ &gt; 0</div>
          <div class="intu-bowl">∪ 凹向上</div>
          <p>中間比左右鄰居低 → 熱會<strong>流進來</strong> → u 上升。</p>
        </div>
        <div class="intu">
          <div class="intu-head">uₓₓ = 0</div>
          <div class="intu-bowl">— 線性</div>
          <p>中間剛好等於左右鄰居平均 → <strong>不變</strong>。</p>
        </div>
        <div class="intu">
          <div class="intu-head">uₓₓ &lt; 0</div>
          <div class="intu-bowl">∩ 凹向下</div>
          <p>中間比左右鄰居高 → 熱會<strong>流出去</strong> → u 下降。</p>
        </div>
      </div>
      <p>
        這就是為什麼熱方程<strong>抹平</strong>凹凸：高的地方被拉下來，低的地方被填起來。
        它是一個<strong>平滑化算子</strong>。
      </p>

      <h4>相同結構的其他 PDE</h4>
      <p>
        這種推導（守恆 + 通量定律）會在很多場合重複出現：
      </p>
      <ul class="siblings">
        <li><strong>擴散方程</strong>：c = 濃度、k = 擴散係數，同一條方程。</li>
        <li><strong>地下水流（Darcy）</strong>：u = 水位、q = −K∇h。</li>
        <li><strong>黑-秀斯（Black-Scholes）</strong>：金融價格——帶飄移的擴散。</li>
        <li><strong>Fokker-Planck</strong>：機率密度的演化，物理變隨機。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        熱方程 ∂u/∂t = α·uₓₓ 來自<strong>Fourier 定律 + 能量守恆</strong>。
        uₓₓ 描述「跟鄰居的差」，決定局部上下變化。
        下一節把它解出來——用分離變數法。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .cons { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }

    .rod-wrap { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .rod-svg { width: 100%; display: block; }
    .label { font-size: 11px; fill: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .box-label { font-size: 11px; fill: var(--accent); font-weight: 700; }
    .tick { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 40px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 44px; text-align: right; }

    .derivation { margin-top: 10px; }
    .deriv-step { display: grid; grid-template-columns: 36px 1fr; gap: 10px; align-items: center; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 6px; }
    .deriv-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .deriv-step.final .deriv-num { background: #5ca878; }
    .deriv-body { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .final-eq { text-align: center; font-size: 17px; padding: 8px; margin-top: 4px; background: var(--accent-10); border-radius: 6px; color: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .note { font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin: 10px 0 0; padding: 10px; background: var(--bg-surface); border-radius: 8px; }
    .note strong { color: var(--accent); }

    .intuition-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 10px 0; }
    .intu { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); text-align: center; }
    .intu-head { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; }
    .intu-bowl { font-size: 20px; color: var(--text); margin-bottom: 4px; }
    .intu p { margin: 6px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .intu strong { color: var(--accent); }

    .siblings { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .siblings strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh12HeatDerivationComponent {
  readonly dx = signal(0.2);

  /** Start of the box — center it */
  readonly boxStart = computed(() => (0.4 - this.dx() / 2) * 400);
}
