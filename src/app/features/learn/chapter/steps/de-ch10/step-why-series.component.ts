import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/** y'' + xy = 0 → Airy equation; no elementary closed form. RK4 for reference plot. */
function airyNumeric(x0: number, y0: number, yp0: number, xEnd: number, h = 0.01): Array<[number, number]> {
  const pts: Array<[number, number]> = [[x0, y0]];
  let y = y0, yp = yp0, x = x0;
  const dir = xEnd > x0 ? 1 : -1;
  const steps = Math.ceil(Math.abs((xEnd - x0) / h));
  for (let i = 0; i < steps; i++) {
    const f = (xx: number, yy: number, yyp: number) => [yyp, -xx * yy];
    const [k1a, k1b] = f(x, y, yp);
    const [k2a, k2b] = f(x + dir * h / 2, y + dir * h / 2 * k1a, yp + dir * h / 2 * k1b);
    const [k3a, k3b] = f(x + dir * h / 2, y + dir * h / 2 * k2a, yp + dir * h / 2 * k2b);
    const [k4a, k4b] = f(x + dir * h, y + dir * h * k3a, yp + dir * h * k3b);
    y += (dir * h / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
    yp += (dir * h / 6) * (k1b + 2 * k2b + 2 * k3b + k4b);
    x += dir * h;
    pts.push([x, y]);
  }
  return pts;
}

@Component({
  selector: 'app-de-ch10-why-series',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼需要級數解法？" subtitle="§10.1">
      <p>
        Ch5–Ch7 的所有工具（特徵方程、未定係數、Laplace）都假設一件事：
        <strong>ODE 的係數是常數</strong>。一旦係數變成 <code>x</code> 的函數，這些技巧立刻崩壞。
      </p>
      <p class="key-idea">
        <strong>但物理中最重要的 ODE 幾乎全是變係數的</strong>——量子力學的 Schrödinger 方程、
        圓形鼓面、氫原子、光學繞射⋯⋯都需要新的解法。
      </p>

      <div class="examples">
        <div class="ex">
          <div class="ex-name">Airy 方程</div>
          <code class="ex-eq">y'' + x·y = 0</code>
          <p>光的反射、量子粒子遇到三角位能。係數 <code>x</code> 讓解在 x&lt;0 振盪、x&gt;0 指數衰減。</p>
        </div>
        <div class="ex">
          <div class="ex-name">Bessel 方程</div>
          <code class="ex-eq">x²y'' + xy' + (x² − n²)y = 0</code>
          <p>圓形鼓面、圓柱電磁波、圓波導。x=0 是奇異點，需要 Frobenius 展開。</p>
        </div>
        <div class="ex">
          <div class="ex-name">Legendre 方程</div>
          <code class="ex-eq">(1−x²)y'' − 2xy' + n(n+1)y = 0</code>
          <p>球面諧波、氫原子軌道、重力多極矩。n 取整數時有<strong>多項式解</strong>。</p>
        </div>
        <div class="ex">
          <div class="ex-name">Hermite 方程</div>
          <code class="ex-eq">y'' − 2xy' + 2n·y = 0</code>
          <p>量子諧振子。n 取整數時同樣有多項式解。</p>
        </div>
      </div>

      <p>
        這些方程有共同特徵：<strong>係數隨位置變化</strong>，指數試探 <code>e^(rx)</code> 不再奏效。
        但我們能改寫解為無窮級數：
      </p>
      <div class="centered-eq big">y(x) = Σ aₙ xⁿ = a₀ + a₁x + a₂x² + a₃x³ + ⋯</div>
      <p>
        把這個代回 ODE，比對同次項，就能得到係數 <code>aₙ</code> 之間的<strong>遞迴關係</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Airy 方程的真實解：左側振盪、右側快速衰減">
      <div class="plot">
        <div class="plot-title">y'' + xy = 0，初值 y(0)=1, y'(0)=0</div>
        <svg viewBox="-220 -100 440 180" class="plot-svg">
          <line [attr.x1]="-200" y1="0" [attr.x2]="200" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" [attr.y1]="-90" x2="0" [attr.y2]="80" stroke="var(--border-strong)" stroke-width="1" />
          <text x="204" y="4" class="ax">x</text>
          <text x="4" y="-94" class="ax">y</text>
          @for (i of [-4,-3,-2,-1,1,2,3,4]; track i) {
            <line [attr.x1]="i * 30" [attr.y1]="-4" [attr.x2]="i * 30" [attr.y2]="4" stroke="var(--border-strong)" />
            <text [attr.x]="i * 30" y="14" class="tick">{{ i }}</text>
          }
          <path [attr.d]="airyPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
          <!-- marker for turning point -->
          <line x1="0" [attr.y1]="-90" x2="0" [attr.y2]="80" stroke="#ba8d2a" stroke-width="0.6"
            stroke-dasharray="3 2" opacity="0.7" />
          <text x="-4" y="-80" class="note" text-anchor="end">振盪區</text>
          <text x="4" y="-80" class="note">衰減區</text>
        </svg>
        <p class="caption">
          <strong>x &lt; 0</strong>：類似正弦振盪（回復力 −xy 把解拉回零）；
          <strong>x &gt; 0</strong>：指數衰減（回復力變成排斥）。
          這種<strong>連續變化</strong>的行為是常係數 ODE 做不到的。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>級數方法的藍圖</h4>
      <ol class="blueprint">
        <li>假設 <code>y = Σ aₙ(x−x₀)ⁿ</code>，x₀ 通常選 0。</li>
        <li>逐項微分得 <code>y'</code> 與 <code>y''</code>。</li>
        <li>代入 ODE，對 <code>xⁿ</code> 同次項的係數比對。</li>
        <li>得到 <code>aₙ₊₂ = (函數 of aₙ, aₙ₋₁, ...)</code> 的<strong>遞迴</strong>。</li>
        <li>由 a₀, a₁ 兩個初值出發算無窮多項。</li>
      </ol>
      <p class="takeaway">
        <strong>take-away：</strong>
        當 ODE 的係數隨 x 變化，指數試探失效，我們改用<strong>冪級數</strong>作為試探函數。
        下一節將逐步操作這個流程，解出 Airy 方程的全部係數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 16px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 18px; padding: 14px; }
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
    .examples {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }
    .ex {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }
    .ex-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 6px;
    }
    .ex-eq {
      display: block;
      font-size: 12px;
      padding: 4px 8px;
      margin-bottom: 6px;
      background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace;
    }
    .ex p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .plot-svg { width: 100%; display: block; }
    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .note { font-size: 10px; fill: var(--text-muted); }
    .caption { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 8px 4px 0; }
    .blueprint { margin: 10px 0 12px 20px; font-size: 14px; line-height: 1.8; color: var(--text-secondary); }
    .blueprint li strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 4px 0 6px; }
  `,
})
export class DeCh10WhySeriesComponent {
  readonly airyPath = computed(() => {
    const ptsR = airyNumeric(0, 1, 0, 6);
    const ptsL = airyNumeric(0, 1, 0, -6);
    const all = [...ptsL.slice().reverse(), ...ptsR.slice(1)];
    const scaleX = 30;
    const scaleY = 45;
    return all.map(([x, y], i) => {
      const yc = Math.max(-2, Math.min(2, y));
      return `${i === 0 ? 'M' : 'L'} ${(x * scaleX).toFixed(1)} ${(-yc * scaleY).toFixed(1)}`;
    }).join(' ');
  });
}
