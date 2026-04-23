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
 * Compare linear pendulum θ'' + θ = 0  vs  real pendulum θ'' + sin θ = 0
 * Numerical RK4 for the real pendulum; analytical for linearized.
 */
function linearPendulum(theta0: number, t: number): number {
  return theta0 * Math.cos(t);
}

function realPendulum(theta0: number, t: number, dt = 0.01): number {
  const n = Math.ceil(t / dt);
  let theta = theta0;
  let omega = 0;
  for (let i = 0; i < n; i++) {
    const f = (th: number, om: number): [number, number] => [om, -Math.sin(th)];
    const [k1a, k1b] = f(theta, omega);
    const [k2a, k2b] = f(theta + (dt / 2) * k1a, omega + (dt / 2) * k1b);
    const [k3a, k3b] = f(theta + (dt / 2) * k2a, omega + (dt / 2) * k2b);
    const [k4a, k4b] = f(theta + dt * k3a, omega + dt * k3b);
    theta += (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
    omega += (dt / 6) * (k1b + 2 * k2b + 2 * k3b + k4b);
  }
  return theta;
}

const PX_PER_T = 18;
const PX_PER_THETA = 22;

@Component({
  selector: 'app-de-ch9-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="非線性世界登場" subtitle="§9.1">
      <p>
        Ch5–Ch8 的所有方法都依賴一個強烈假設：<strong>線性</strong>。加法、乘法、矩陣運算都是線性操作，解可以疊加、頻率響應有意義、特徵值分解有效。
      </p>
      <p class="key-idea">
        <strong>但現實世界幾乎全是非線性的</strong>——一旦外力跟狀態不成比例、或系統有本質的非線性回復力、或多變數彼此乘在一起，線性工具就崩壞。
      </p>
      <p>
        典型例子：<strong>真正的鐘擺</strong>。重力提供的回復力矩不是 <code>−kθ</code>，而是 <code>−mgL sin θ</code>。
        在小角度下 sin θ ≈ θ（Ch5 的線性化假設），但<strong>大振幅</strong>時差距顯著。
      </p>
      <div class="centered-eq big">
        θ″ + sin(θ) = 0  （真實）&nbsp;&nbsp;vs&nbsp;&nbsp;θ″ + θ = 0  （線性化）
      </div>
      <p>
        差一個字元，行為卻天差地別。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動初始角度 → 看線性預測何時開始失準">
      <div class="chart-wrap">
        <div class="chart-title">
          兩種鐘擺的 θ(t) 對比
        </div>
        <svg viewBox="-10 -90 360 150" class="chart-svg">
          <line x1="0" y1="0" x2="340" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-80" x2="0" y2="50" stroke="var(--border-strong)" stroke-width="1" />
          <text x="344" y="4" class="ax">t</text>
          <text x="-4" y="-82" class="ax">θ</text>

          @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_THETA" x2="340" [attr.y2]="-g * PX_PER_THETA"
              stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
            <text x="-4" [attr.y]="-g * PX_PER_THETA + 3" class="tick">{{ g }}</text>
          }

          <!-- Initial θ reference -->
          <line x1="0" [attr.y1]="-theta0() * PX_PER_THETA"
            x2="340" [attr.y2]="-theta0() * PX_PER_THETA"
            stroke="var(--text-muted)" stroke-width="0.6" stroke-dasharray="3 2" opacity="0.5" />

          <!-- Linear prediction (blue dashed) -->
          <path [attr.d]="linearPath()" fill="none"
            stroke="#5a8aa8" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.8" />

          <!-- Real pendulum (solid) -->
          <path [attr.d]="realPath()" fill="none"
            stroke="var(--accent)" stroke-width="2.2" />

          <line [attr.x1]="t() * PX_PER_T" y1="-80" [attr.x2]="t() * PX_PER_T" y2="50"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.4" />
          <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-realPendulumTheta() * PX_PER_THETA" r="4"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />
          <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-linearTheta() * PX_PER_THETA" r="3.5"
            fill="#5a8aa8" stroke="white" stroke-width="1.2" />
        </svg>

        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>真實 θ″ + sin θ = 0</span>
          <span class="leg"><span class="leg-dot dashed" style="color:#5a8aa8"></span>線性近似 θ″ + θ = 0</span>
        </div>
      </div>

      <!-- Pendulum animation -->
      <div class="pendulum-wrap">
        <div class="ch-head">鐘擺實景</div>
        <svg viewBox="-120 -20 240 180" class="pend-svg">
          <!-- Ceiling -->
          <line x1="-80" y1="0" x2="80" y2="0" stroke="var(--text)" stroke-width="2" />
          <!-- Real pendulum (accent) -->
          <g>
            <line x1="0" y1="0"
              [attr.x2]="Math.sin(realPendulumTheta()) * 100"
              [attr.y2]="Math.cos(realPendulumTheta()) * 100"
              stroke="var(--accent)" stroke-width="2.5" />
            <circle
              [attr.cx]="Math.sin(realPendulumTheta()) * 100"
              [attr.cy]="Math.cos(realPendulumTheta()) * 100"
              r="12" fill="var(--accent)" stroke="white" stroke-width="2" />
          </g>
          <!-- Linear ghost (faded) -->
          <g opacity="0.55">
            <line x1="0" y1="0"
              [attr.x2]="Math.sin(linearTheta()) * 100"
              [attr.y2]="Math.cos(linearTheta()) * 100"
              stroke="#5a8aa8" stroke-width="2" stroke-dasharray="3 2" />
            <circle
              [attr.cx]="Math.sin(linearTheta()) * 100"
              [attr.cy]="Math.cos(linearTheta()) * 100"
              r="9" fill="#5a8aa8" stroke="white" stroke-width="1.5" />
          </g>

          <!-- Arc showing current angle -->
          <path [attr.d]="angleArcPath(realPendulumTheta())"
            fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.4" />
        </svg>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>

        <div class="sl">
          <span class="sl-lab">初始角 θ₀</span>
          <input type="range" min="0.1" max="3" step="0.05"
            [value]="theta0()" (input)="theta0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ theta0().toFixed(2) }} rad</span>
        </div>
        <div class="presets">
          <button class="pre" (click)="theta0.set(0.2)">小 (0.2)</button>
          <button class="pre" (click)="theta0.set(0.8)">中 (0.8)</button>
          <button class="pre" (click)="theta0.set(1.5)">大 (1.5)</button>
          <button class="pre" (click)="theta0.set(2.8)">接近翻轉 (2.8)</button>
        </div>
        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>

        <div class="verdict" [attr.data-level]="disagreementLevel()">
          @if (disagreementLevel() === 'good') {
            ✓ 小角度：線性近似非常準（誤差小於 1%）
          } @else if (disagreementLevel() === 'ok') {
            ⚠ 中等角度：線性近似還可用但已出現可見誤差
          } @else if (disagreementLevel() === 'bad') {
            ✗ 大角度：線性近似明顯失真——相位和振幅都錯
          } @else {
            ✗ 接近翻轉：線性近似完全失敗
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        其他會在整章出現的非線性範例：
      </p>
      <div class="examples-grid">
        <div class="ex-card">
          <div class="ex-name">Lotka-Volterra 捕食者—獵物</div>
          <code class="ex-eq">x′ = ax − bxy,&nbsp;&nbsp;y′ = −cy + dxy</code>
          <p>兩變數乘在一起（xy）—— 非線性。描述生態循環。</p>
        </div>
        <div class="ex-card">
          <div class="ex-name">Van der Pol 振盪器</div>
          <code class="ex-eq">x″ − μ(1 − x²)x′ + x = 0</code>
          <p>阻尼係數 <code>μ(1 − x²)</code> 隨 x 變化—— 非線性阻尼。產生「極限環」。</p>
        </div>
        <div class="ex-card">
          <div class="ex-name">Logistic 族群</div>
          <code class="ex-eq">N′ = rN(1 − N/K)</code>
          <p>有 N² 項（Ch3 §3.6 看過）。產生 saddle-node 分岔。</p>
        </div>
        <div class="ex-card">
          <div class="ex-name">SIR 傳染病模型</div>
          <code class="ex-eq">S′ = −βSI,&nbsp;&nbsp;I′ = βSI − γI</code>
          <p>SI 乘積——非線性。描述疾病散播的閾值現象。</p>
        </div>
      </div>

      <div class="loss-box">
        <h4>線性世界崩壞的五個性質：</h4>
        <ul>
          <li><strong>疊加原理失效</strong>：解不能疊加得到新解。</li>
          <li><strong>頻率響應消失</strong>：正弦輸入不會產生純正弦輸出（會產生高階諧波）。</li>
          <li><strong>沒有通用解法</strong>：沒有矩陣指數那種「公式解」。</li>
          <li><strong>行為可能爆炸複雜</strong>：混沌、極限環、分岔、奇異吸引子⋯⋯</li>
          <li><strong>但局部仍然線性</strong>：在平衡點附近可以線性化——這就是下一節的主題。</li>
        </ul>
      </div>

      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        線性是「理想化 / 近似 / 小振幅」；非線性才是宇宙的原貌。
        但非線性也不是絕望——我們有<strong>局部線性化</strong>這個強大技巧，
        讓 Ch5–Ch8 的所有工具在平衡點附近繼續適用。下一節細看。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 19px; padding: 14px; }

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

    .chart-wrap, .pendulum-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 10px;
    }

    .chart-title, .ch-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-svg, .pend-svg {
      width: 100%;
      display: block;
    }

    .pend-svg {
      max-width: 300px;
      margin: 0 auto;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: end;
      font-family: 'JetBrains Mono', monospace;
    }

    .legend {
      display: flex;
      gap: 14px;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
      justify-content: center;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .leg-dot {
      display: inline-block;
      width: 12px;
      height: 3px;
      border-radius: 2px;
    }

    .leg-dot.dashed {
      background-image: linear-gradient(to right, currentColor 50%, transparent 50%);
      background-size: 4px 3px;
      background-color: transparent !important;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }

    .play-btn, .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn { background: transparent; color: var(--accent); }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 80px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 56px;
      text-align: right;
    }

    .presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .pre {
      font: inherit;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 5px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .pre:hover { border-color: var(--accent); color: var(--accent); }

    .verdict {
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      font-weight: 600;
    }

    .verdict[data-level='good'] {
      background: rgba(92, 168, 120, 0.1);
      color: #5ca878;
    }
    .verdict[data-level='ok'] {
      background: rgba(244, 200, 102, 0.1);
      color: #ba8d2a;
    }
    .verdict[data-level='bad'] {
      background: rgba(200, 123, 94, 0.1);
      color: #c87b5e;
    }
    .verdict[data-level='very-bad'] {
      background: rgba(200, 123, 94, 0.15);
      color: #a64a3a;
      border: 1px solid rgba(200, 123, 94, 0.4);
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .ex-card {
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
    }

    .ex-card p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .loss-box {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin: 12px 0;
    }

    .loss-box h4 {
      margin: 0 0 8px;
      font-size: 14px;
      color: var(--accent);
    }

    .loss-box ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh9IntroComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_THETA = PX_PER_THETA;
  readonly T_MAX = 20;

  readonly theta0 = signal(0.8);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.2;
        if (newT >= this.T_MAX) {
          this.t.set(this.T_MAX);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  togglePlay(): void {
    if (this.t() >= this.T_MAX - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  readonly realPendulumTheta = computed(() => realPendulum(this.theta0(), this.t()));
  readonly linearTheta = computed(() => linearPendulum(this.theta0(), this.t()));

  readonly realPath = computed(() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * this.T_MAX;
      const th = realPendulum(this.theta0(), tt);
      const c = Math.max(-3.5, Math.min(3.5, th));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-c * PX_PER_THETA).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly linearPath = computed(() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * this.T_MAX;
      const th = linearPendulum(this.theta0(), tt);
      const c = Math.max(-3.5, Math.min(3.5, th));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-c * PX_PER_THETA).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly disagreementLevel = computed<'good' | 'ok' | 'bad' | 'very-bad'>(() => {
    const theta = this.theta0();
    if (theta < 0.35) return 'good';
    if (theta < 1.0) return 'ok';
    if (theta < 2.3) return 'bad';
    return 'very-bad';
  });

  angleArcPath(currentTheta: number): string {
    const r = 70;
    const start = 0;
    const end = currentTheta;
    const sweep = end > start ? 1 : 0;
    const absTheta = Math.min(Math.abs(end), Math.PI);
    const largeArc = absTheta > Math.PI ? 1 : 0;
    const x1 = 0;
    const y1 = r;
    const x2 = r * Math.sin(end);
    const y2 = r * Math.cos(end);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
}
