import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const G = 9.8;

// Analytical solution for dv/dt = g - (k/m) v, v(0) = 0
// v(t) = (mg/k) * (1 - e^{-(k/m)t})
function velocityAt(t: number, k: number, m: number): number {
  if (k < 0.001) return G * t; // no drag → linear
  const terminal = (G * m) / k;
  return terminal * (1 - Math.exp(-(k / m) * t));
}

@Component({
  selector: 'app-de-ch1-free-fall',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="完整案例：自由落體 + 空氣阻力" subtitle="§1.7">
      <p>
        把前面所有概念合在一起，做一個完整的案例。我們從「一顆蘋果掉下來」這樣的物理現象開始，
        走完六個步驟，看微分方程的整條工作流長什麼樣子。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="按步驟展開，看現象如何變成可預測的曲線">
      <div class="steps-flow">
        <!-- Step 1: Physics -->
        <div class="flow-step">
          <div class="flow-num">1</div>
          <div class="flow-body">
            <div class="flow-title">寫下物理定律</div>
            <p>牛頓第二定律：<code>F = m · a</code>。對自由落體來說，兩個力同時作用：</p>
            <ul>
              <li><strong>重力</strong>：<code>F\u1d4d = m · g</code>（向下）</li>
              <li><strong>空氣阻力</strong>：<code>F\u1d05 = -k · v</code>（阻力與速度反向，假設低速情形）</li>
            </ul>
            <p>合力 = <code>mg - kv</code>。代入 F = ma 並注意 a = dv/dt：</p>
            <div class="derivation">m · dv/dt = m·g − k·v</div>
          </div>
        </div>

        <!-- Step 2: Normalize -->
        <div class="flow-step">
          <div class="flow-num">2</div>
          <div class="flow-body">
            <div class="flow-title">整理成標準形式</div>
            <p>兩邊除以 m：</p>
            <div class="derivation main">dv/dt = g − (k/m) v</div>
            <p>
              這是一條<strong>一階、線性、非齊次、自治</strong>的 ODE——也就是前一節地圖裡最容易處理的類別之一。
            </p>
          </div>
        </div>

        <!-- Step 3: Slope field -->
        <div class="flow-step">
          <div class="flow-num">3</div>
          <div class="flow-body">
            <div class="flow-title">看斜率場</div>
            <p>固定 k、m，調整滑桿，觀察斜率場。
              注意：存在一條水平線 <code>v = mg/k</code>，那上面斜率是 0——箭頭變水平。</p>

            <div class="slope-wrap">
              <svg viewBox="-10 -100 240 180" class="slope-svg">
                <!-- Axes -->
                <line x1="0" y1="80" x2="220" y2="80" stroke="var(--border-strong)" stroke-width="1" />
                <line x1="0" y1="-90" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="1" />
                <text x="222" y="84" class="axis">t</text>
                <text x="-4" y="-92" class="axis">v</text>

                <!-- v = 0 baseline -->
                <line x1="0" y1="80" x2="220" y2="80"
                  stroke="var(--text-muted)" stroke-width="0.5" opacity="0.6" />

                <!-- Tick labels -->
                @for (k of [2, 4, 6, 8]; track k) {
                  <line [attr.x1]="k * 25" y1="77" [attr.x2]="k * 25" y2="83"
                    stroke="var(--text-muted)" stroke-width="0.8" />
                  <text [attr.x]="k * 25" y="96" class="tick">{{ k }}</text>
                }
                @for (v of [10, 20, 30, 40]; track v) {
                  <line x1="-3" [attr.y1]="80 - v * 3.5" x2="3" [attr.y2]="80 - v * 3.5"
                    stroke="var(--text-muted)" stroke-width="0.8" />
                  <text x="-6" [attr.y]="80 - v * 3.5 + 3" class="tick right">{{ v }}</text>
                }

                <!-- Terminal velocity line -->
                <line x1="0" [attr.y1]="80 - terminalVelocity() * 3.5"
                  x2="220" [attr.y2]="80 - terminalVelocity() * 3.5"
                  stroke="#c87b5e" stroke-width="1.5" stroke-dasharray="4 3" />
                <text x="222" [attr.y]="80 - terminalVelocity() * 3.5 + 3" class="term-lab">
                  v_t
                </text>

                <!-- Slope field arrows -->
                @for (a of slopeArrows(); track a.key) {
                  <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"
                    stroke="var(--text-muted)" stroke-width="1.2" stroke-linecap="round" opacity="0.7" />
                }

                <!-- No-drag comparison: v = gt (unbounded) -->
                <path [attr.d]="noDragPath()" fill="none"
                  stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8" />
                <text x="50" y="-30" class="no-drag-lab">無阻力（k=0）：v = gt</text>

                <!-- Actual solution curve -->
                <path [attr.d]="solutionPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

                <!-- Start point -->
                <circle cx="0" cy="80" r="3" fill="var(--accent)" stroke="white" stroke-width="1.5" />
              </svg>
              <div class="slope-caption">
                灰箭頭：斜率場。<span style="color:var(--accent);font-weight:600">藍線</span>：有阻力的解。<span style="color:var(--text-muted);font-weight:600">灰虛線</span>：無阻力 v = gt（會無限制加速）。紅虛線：終端速度 v_t = mg/k。
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Terminal velocity -->
        <div class="flow-step">
          <div class="flow-num">4</div>
          <div class="flow-body">
            <div class="flow-title">用數學說：最終速度會停在哪</div>
            <p>
              長期會發生什麼事？如果 v 趨近一個定值 v*，那 dv/dt 必為 0，所以：
            </p>
            <div class="derivation">
              0 = g − (k/m) v* &nbsp;⇒&nbsp; <strong>v* = mg/k</strong>
            </div>
            <p>
              這就是<strong>終端速度</strong>。注意這個結論完全不需要「解」方程——只要用方程本身 + 「不動點」概念。
              這類手法在 Part III 相平面分析中會大量使用。
            </p>
          </div>
        </div>

        <!-- Step 5: Analytic solution -->
        <div class="flow-step">
          <div class="flow-num">5</div>
          <div class="flow-body">
            <div class="flow-title">解析解（下一章會學怎麼得到）</div>
            <p>這條方程恰好可解，答案是：</p>
            <div class="derivation main">
              v(t) = (mg/k) · (1 − e<sup>−(k/m)t</sup>)
            </div>
            <p>
              三件事一眼看懂：
            </p>
            <ul>
              <li>t = 0 時 v = 0（符合初值）</li>
              <li>t → ∞ 時 e<sup>−(k/m)t</sup> → 0，所以 v → mg/k（跟我們上面算的終端速度一致）</li>
              <li>收斂速度取決於 k/m：阻力越大、質量越輕 → 越快趨近終端</li>
            </ul>
            <p>Ch2 會教你怎麼從方程推出這條解。</p>
          </div>
        </div>

        <!-- Step 6: Experiment with animation -->
        <div class="flow-step">
          <div class="flow-num">6</div>
          <div class="flow-body">
            <div class="flow-title">讓它掉下來</div>
            <p>按 ▶ 播放——兩顆蘋果同時從頂端落下：<strong style="color:var(--accent)">有阻力</strong>的一顆會被拉到終端速度，<strong style="color:var(--text-muted)">無阻力</strong>的一顆會越掉越快。拉滑桿改變物理參數。</p>

            <div class="fall-panel">
              <!-- Left: vertical falling scene -->
              <div class="scene-col">
                <svg viewBox="-60 -5 120 230" class="fall-svg">
                  <!-- Sky -->
                  <rect x="-60" y="-5" width="120" height="200" fill="#a8c4d8" opacity="0.22" />
                  <!-- Ground -->
                  <rect x="-60" y="195" width="120" height="30" fill="#6a5a48" opacity="0.4" />
                  <line x1="-60" y1="195" x2="60" y2="195" stroke="#6a5a48" stroke-width="1.5" />
                  <text x="-58" y="212" class="fall-lab">地面</text>

                  <!-- Tick marks (fall distance) -->
                  @for (k of [40, 80, 120, 160]; track k) {
                    <line x1="-58" [attr.y1]="k" x2="-52" [attr.y2]="k"
                      stroke="var(--text-muted)" stroke-width="0.8" opacity="0.6" />
                  }

                  <!-- No-drag apple (gray, left) -->
                  <g [attr.transform]="'translate(-25, ' + noDragY() + ')'"
                     [attr.opacity]="noDragY() < 200 ? 1 : 0.3">
                    <circle r="8" fill="#8a9aa8" />
                    <line x1="0" y1="-8" x2="1" y2="-13" stroke="#4a3828" stroke-width="1.2" />
                    <!-- velocity arrow -->
                    <line x1="-10" y1="0"
                      [attr.x2]="-10 - noDragArrowLen()" y2="0"
                      stroke="#8a9aa8" stroke-width="1.8" marker-end="url(#arr-nodrag)" />
                    <text x="-12" [attr.y]="-18" class="fall-sm" text-anchor="end">無阻力</text>
                  </g>

                  <!-- Drag apple (red, right) -->
                  <g [attr.transform]="'translate(25, ' + dragY() + ')'">
                    <circle r="8" fill="#c8472a" />
                    <line x1="0" y1="-8" x2="1" y2="-13" stroke="#4a3828" stroke-width="1.2" />
                    <!-- velocity arrow -->
                    <line x1="10" y1="0"
                      [attr.x2]="10 + dragArrowLen()" y2="0"
                      stroke="var(--accent)" stroke-width="2" marker-end="url(#arr-drag)" />
                    <text x="12" [attr.y]="-18" class="fall-sm">有阻力</text>
                  </g>

                  <defs>
                    <marker id="arr-drag" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                      <polygon points="0 0, 5 2.5, 0 5" fill="var(--accent)" />
                    </marker>
                    <marker id="arr-nodrag" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                      <polygon points="0 0, 5 2.5, 0 5" fill="#8a9aa8" />
                    </marker>
                  </defs>
                </svg>

                <!-- Controls -->
                <div class="fall-controls">
                  <button class="fall-play" (click)="togglePlay()">
                    {{ playing() ? '⏸' : '▶' }}
                  </button>
                  <button class="fall-reset" (click)="resetFall()">↻</button>
                  <input type="range" min="0" max="8" step="0.02"
                    [value]="fallT()" (input)="onFallTChange($event)" />
                  <span class="fall-t">{{ fallT().toFixed(1) }}s</span>
                </div>
              </div>

              <!-- Right: sliders + readouts -->
              <div class="params-col">
                <div class="sliders">
                  <div class="sl">
                    <span class="sl-lab">m =</span>
                    <input type="range" min="0.05" max="5" step="0.05" [value]="m()"
                      (input)="m.set(+$any($event).target.value)" />
                    <span class="sl-val">{{ m().toFixed(2) }} kg</span>
                  </div>
                  <div class="sl">
                    <span class="sl-lab">k =</span>
                    <input type="range" min="0.05" max="2" step="0.02" [value]="k()"
                      (input)="k.set(+$any($event).target.value)" />
                    <span class="sl-val">{{ k().toFixed(2) }}</span>
                  </div>
                  <div class="sl-hint">k 越大 → 阻力越強 → 兩顆蘋果差距越明顯</div>
                </div>

                <div class="readout">
                  <div class="ro-row">
                    <span class="ro-k">有阻力現速</span>
                    <strong>{{ dragV().toFixed(2) }} m/s</strong>
                  </div>
                  <div class="ro-row">
                    <span class="ro-k">無阻力現速</span>
                    <strong style="color: #8a9aa8">{{ noDragV().toFixed(2) }} m/s</strong>
                  </div>
                  <div class="ro-row">
                    <span class="ro-k">終端速度 v*</span>
                    <strong>{{ terminalVelocityLabel() }} m/s</strong>
                  </div>
                  <div class="ro-row">
                    <span class="ro-k">達 95% v* 時間</span>
                    <strong>{{ time95Label() }} s</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個案例走過了整個 Ch1 的流程：
      </p>
      <ol>
        <li>觀察現象（§1.1）→ 寫下方程</li>
        <li>畫斜率場（§1.2）→ 看結構</li>
        <li>加上初值（§1.4）→ 選出唯一解</li>
        <li>用方程結構（不動點）<em>直接</em>推出終端速度</li>
        <li>解析解給出封閉公式（§1.5）</li>
      </ol>
      <p>
        整本書會一次次回到這個 pattern。寫方程 → 看結構 → 解出行為。每一章教你這三件事其中一項的更強版本。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        一個完整的微分方程工作流 = 物理定律 → ODE → 斜率場 → 初值 → 分析（或數值）解。
        你現在已經看過完整一輪。接下來的章節只是讓每一步變得更厲害、更普適、更精確。
      </p>
    </app-prose-block>
  `,
  styles: `
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

    .steps-flow {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .flow-step {
      display: grid;
      grid-template-columns: 36px 1fr;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px dashed var(--border);
    }

    .flow-step:last-child { border-bottom: none; }

    .flow-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .flow-body { font-size: 14px; line-height: 1.7; color: var(--text-secondary); }

    .flow-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 6px;
    }

    .flow-body p { margin: 0 0 8px; }
    .flow-body ul, .flow-body ol { margin: 6px 0 8px; padding-left: 20px; }
    .flow-body ul li, .flow-body ol li { margin-bottom: 3px; }

    .derivation {
      padding: 10px 14px;
      border: 1px dashed var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      text-align: center;
      margin: 6px 0;
    }

    .derivation.main {
      border-style: solid;
      border-color: var(--accent-30);
      background: var(--accent-10);
      color: var(--accent);
      font-size: 16px;
      font-weight: 600;
    }

    .slope-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
    }

    .slope-svg {
      width: 100%;
      display: block;
    }

    .slope-caption {
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .axis {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }
    .tick.right { text-anchor: end; }

    .term-lab {
      font-size: 10px;
      fill: #c87b5e;
      font-family: 'JetBrains Mono', monospace;
    }

    .no-drag-lab {
      font-size: 9px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .fall-panel {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 12px;
      padding: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-top: 10px;
    }

    @media (max-width: 560px) {
      .fall-panel { grid-template-columns: 1fr; }
    }

    .scene-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .fall-svg {
      width: 100%;
      display: block;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
    }

    .fall-lab {
      font-size: 10px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .fall-sm {
      font-size: 8px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .fall-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .fall-play, .fall-reset {
      font: inherit;
      font-size: 13px;
      min-width: 30px;
      padding: 4px 8px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 6px;
      cursor: pointer;
    }

    .fall-reset {
      background: transparent;
      color: var(--accent);
    }

    .fall-play:hover, .fall-reset:hover { opacity: 0.85; }

    .fall-controls input { flex: 1; accent-color: var(--accent); }

    .fall-t {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      min-width: 36px;
      text-align: right;
    }

    .params-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sliders {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      margin-bottom: 10px;
    }

    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .sl-lab {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      min-width: 34px;
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 70px;
      text-align: right;
    }

    .sl-hint {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
    }

    .readout {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .ro-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }

    .ro-row:last-child { border-bottom: none; }

    .ro-k { color: var(--text-muted); }
    .ro-row strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class DeCh1FreeFallComponent implements OnInit, OnDestroy {
  readonly m = signal(1.0);
  readonly k = signal(0.5);
  readonly fallT = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;
  private readonly FALL_T_MAX = 8;
  // Pixel distance from top (y=0) to ground (y=195) = 195 units.
  private readonly SCENE_HEIGHT = 195;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.fallT() + dt * 1.0;
        if (newT >= this.FALL_T_MAX) {
          this.fallT.set(this.FALL_T_MAX);
          this.playing.set(false);
        } else {
          this.fallT.set(newT);
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
    if (this.fallT() >= this.FALL_T_MAX - 0.01) this.fallT.set(0);
    this.playing.set(!this.playing());
  }

  resetFall(): void {
    this.fallT.set(0);
    this.playing.set(false);
  }

  onFallTChange(event: Event): void {
    this.fallT.set(+(event.target as HTMLInputElement).value);
    this.playing.set(false);
  }

  // Position integrals for both apples, clamped to ground.
  // Drag: dv/dt = g - (k/m)v  →  y(t) = v*(t + (1/a)(e^{-at} - 1)),  a = k/m, v* = g/a
  // No drag: y(t) = (1/2) g t²
  private readonly SCALE = 1.4; // visual scale: scene is 195 tall, total drop limited by this

  readonly dragY = computed(() => {
    const k = this.k(), m = this.m();
    const t = this.fallT();
    const a = k / m;
    const vStar = G / a;
    const dist = vStar * (t + (1 / a) * (Math.exp(-a * t) - 1));
    return Math.min(this.SCENE_HEIGHT, dist * this.SCALE);
  });

  readonly noDragY = computed(() => {
    const t = this.fallT();
    const dist = 0.5 * G * t * t;
    return Math.min(this.SCENE_HEIGHT, dist * this.SCALE);
  });

  readonly dragV = computed(() => velocityAt(this.fallT(), this.k(), this.m()));
  readonly noDragV = computed(() => G * this.fallT());

  readonly dragArrowLen = computed(() => {
    const v = this.dragV();
    return Math.min(28, v * 1.0);
  });

  readonly noDragArrowLen = computed(() => {
    const v = this.noDragV();
    return Math.min(28, v * 1.0);
  });

  readonly noDragPath = computed(() => {
    const pts: string[] = [];
    const n = 100;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * 9;
      const v = G * t;
      const x = t * 25;
      const y = 80 - Math.min(85, v * 3.5);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      if (y < -5) break;
    }
    return pts.join(' ');
  });

  readonly terminalVelocity = computed(() => {
    if (this.k() < 0.001) return 50; // cap display
    return (G * this.m()) / this.k();
  });

  readonly terminalVelocityLabel = computed(() => {
    if (this.k() < 0.001) return '∞ (無阻力)';
    return this.terminalVelocity().toFixed(2);
  });

  readonly time95Label = computed(() => {
    if (this.k() < 0.001) return '—';
    // v(t) = v_t (1 - e^{-t/tau}), solve for 95%: t = -tau * ln(0.05) ≈ 3·tau
    const tau = this.m() / this.k();
    return (3 * tau).toFixed(2);
  });

  readonly vAt5Label = computed(() => velocityAt(5, this.k(), this.m()).toFixed(2));

  readonly solutionPath = computed(() => {
    const pts: string[] = [];
    const n = 100;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * 9;
      const v = velocityAt(t, this.k(), this.m());
      const x = t * 25;
      const y = 80 - Math.min(85, v * 3.5);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly slopeArrows = computed(() => {
    const k = this.k();
    const m = this.m();
    const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    // f(t, v) = g - (k/m) v, independent of t
    for (let ti = 0; ti <= 8; ti += 1) {
      for (let vi = 0; vi <= 40; vi += 5) {
        const slope = G - (k / m) * vi;
        // in the plot: x = 25 * t, y = 80 - 3.5 * v  →  dy/dx = -3.5/25 * slope
        const cx = ti * 25;
        const cy = 80 - vi * 3.5;
        // visual unit vector
        const vsSlope = (-3.5 / 25) * slope;
        const norm = Math.sqrt(1 + vsSlope * vsSlope);
        const dx = 8 / norm;
        const dy = 8 * vsSlope / norm;
        out.push({
          key: `${ti}_${vi}`,
          x1: cx - dx,
          y1: cy - dy,
          x2: cx + dx,
          y2: cy + dy,
        });
      }
    }
    return out;
  });
}
