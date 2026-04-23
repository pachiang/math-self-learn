import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * System: y'' + 0.5·y' + 4·y = F(t)
 * Impulse response h(t) = (1/β) · e^(αt) · sin(βt),  α=-0.25, β=√(4 - 0.0625)≈1.98
 */
const ALPHA = -0.25;
const BETA = Math.sqrt(4 - 0.0625);

function h(t: number): number {
  if (t < 0) return 0;
  return (1 / BETA) * Math.exp(ALPHA * t) * Math.sin(BETA * t);
}

/** Example input f(t): rectangular pulse from t=1 to t=3, height 1 */
function fInput(t: number): number {
  return (t >= 1 && t <= 3) ? 1 : 0;
}

/**
 * Convolution (f * h)(t) = ∫₀^t f(τ) · h(t - τ) dτ
 * Numerical via trapezoidal rule.
 */
function convolution(t: number): number {
  if (t <= 0) return 0;
  const n = 300;
  const dt = t / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const tau = i * dt;
    const val = fInput(tau) * h(t - tau);
    const weight = (i === 0 || i === n) ? 0.5 : 1;
    sum += weight * val;
  }
  return sum * dt;
}

const PX_PER_T = 30;
const PX_PER_Y = 50;
const T_MAX = 10;

@Component({
  selector: 'app-de-ch7-convolution',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="卷積與傳遞函數" subtitle="§7.5">
      <p>
        上一節提到：系統對<strong>衝擊 δ(t)</strong> 的響應 h(t) 是「系統的指紋」。
        這一節揭示為什麼——<strong>卷積定理</strong>告訴我們，有了 h(t)，對<em>任何</em>輸入的響應都能算出來。
      </p>
      <p class="key-idea">
        <strong>卷積定理：</strong>時域的卷積 = s-域的乘法。
      </p>
      <div class="centered-eq big">
        ℒ[(f * h)(t)] = F(s) · H(s)
      </div>
      <p>
        這裡 <code>(f * h)(t) = ∫₀^t f(τ)·h(t − τ) dτ</code> 是卷積積分。
        對 LTI（線性時不變）系統，<strong>y = f * h</strong>——
        輸出 = 輸入跟衝擊響應的卷積。
      </p>
      <p>
        換言之，系統的輸入—輸出關係在 s-域非常乾淨：
      </p>
      <div class="centered-eq">
        Y(s) = H(s) · F(s)
      </div>
      <p>
        其中 <strong>H(s) = 1 / (ms² + cs + k)</strong> 叫做<strong>傳遞函數</strong>（transfer function）。
        它是系統的完整指紋——包含所有動態資訊。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="卷積的幾何：看 f(τ) 與「翻轉後滑動」的 h(t−τ) 如何相乘累積">
      <div class="convo-viz">
        <div class="v-head">
          輸入 f 為矩形脈衝（t∈[1,3]），h 是衝擊響應。
          拖動 t，看積分窗口如何掃過。
        </div>

        <!-- Top: f(τ) and h(t-τ) overlap visualization -->
        <div class="overlap-chart">
          <svg viewBox="-10 -90 380 160" class="svg-overlap">
            <line x1="0" y1="0" x2="360" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-80" x2="0" y2="60" stroke="var(--border-strong)" stroke-width="1" />
            <text x="364" y="4" class="ax">τ</text>

            @for (g of [0, 1, 2, 3, 4, 5, 6, 7]; track g) {
              <text [attr.x]="g * PX_PER_T" y="16" class="tick">{{ g }}</text>
              <line [attr.x1]="g * PX_PER_T" y1="-3" [attr.x2]="g * PX_PER_T" y2="3"
                stroke="var(--text-muted)" stroke-width="0.5" opacity="0.5" />
            }

            <!-- f(τ) rectangle -->
            <path [attr.d]="fInputPath" fill="#c87b5e33" stroke="#c87b5e" stroke-width="1.8" />
            <text [attr.x]="2 * PX_PER_T" [attr.y]="-1.1 * PX_PER_Y - 4" class="label"
              text-anchor="middle" style="fill: #c87b5e; font-weight: 700">
              f(τ)
            </text>

            <!-- h(t-τ) — flipped and shifted impulse response -->
            <path [attr.d]="hFlippedPath()" fill="#5ca87844" stroke="#5ca878" stroke-width="1.8" />
            <text [attr.x]="Math.max(40, t() * PX_PER_T - 40)"
              [attr.y]="-0.85 * PX_PER_Y - 4" class="label"
              style="fill: #5ca878; font-weight: 700">
              h(t − τ)
            </text>

            <!-- Overlap (product) shaded -->
            <path [attr.d]="overlapPath()" fill="#8b6aa877" />

            <!-- Current t marker -->
            <line [attr.x1]="t() * PX_PER_T" y1="-80" [attr.x2]="t() * PX_PER_T" y2="40"
              stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.5" />
            <text [attr.x]="t() * PX_PER_T + 4" y="-78" class="tlab" style="fill: var(--accent)">
              t = {{ t().toFixed(2) }}
            </text>
          </svg>
          <p class="caption">
            重疊面積（紫色）= 卷積積分 ∫ f(τ)·h(t−τ) dτ ≈ {{ currentConv().toFixed(3) }}
          </p>
        </div>

        <!-- Bottom: y(t) as it builds up -->
        <div class="y-chart">
          <div class="y-head">累積的系統響應 y(t) = (f * h)(t)</div>
          <svg viewBox="-10 -80 380 130" class="svg-y">
            <line x1="0" y1="0" x2="360" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="40" stroke="var(--border-strong)" stroke-width="1" />
            <text x="364" y="4" class="ax">t</text>
            <text x="-4" y="-72" class="ax">y</text>

            @for (g of [0.1, 0.2, 0.3]; track g) {
              <line x1="0" [attr.y1]="-g * 180" x2="360" [attr.y2]="-g * 180"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            }

            <!-- Full convolution response (precomputed) -->
            <path [attr.d]="yFullPath" fill="none"
              stroke="var(--accent)" stroke-width="1.2" opacity="0.4" />
            <!-- Progressively revealed portion -->
            <path [attr.d]="yRevealedPath()" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />
            <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-currentConv() * 180" r="4"
              fill="var(--accent)" stroke="white" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放卷積' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>

        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="s-平面：極點位置決定響應行為">
      <div class="pole-layout">
        <div class="pole-svg-wrap">
          <div class="pole-head">
            拖「極點」到不同位置 → 看對應的衝擊響應 h(t)
          </div>
          <svg viewBox="-80 -80 160 160" class="pole-svg"
            (mousedown)="startDrag($event)"
            (mousemove)="drag($event)"
            (mouseup)="endDrag()"
            (mouseleave)="endDrag()"
            #poleSvg>
            <!-- Axes -->
            <line x1="-70" y1="0" x2="70" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            <text x="72" y="4" class="ax-complex">Re</text>
            <text x="4" y="-72" class="ax-complex">Im</text>

            @for (g of [-3, -2, -1, 1, 2, 3]; track g) {
              <line [attr.x1]="g * 15" y1="-70" [attr.x2]="g * 15" y2="70"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
              <line x1="-70" [attr.y1]="-g * 15" x2="70" [attr.y2]="-g * 15"
                stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            }

            <!-- Stable / unstable region shading -->
            <rect x="-70" y="-70" width="70" height="140"
              fill="#5ca878" opacity="0.05" />
            <text x="-68" y="66" class="zone" style="fill: #5ca878">穩定</text>
            <rect x="0" y="-70" width="70" height="140"
              fill="#c87b5e" opacity="0.05" />
            <text x="4" y="66" class="zone" style="fill: #c87b5e">不穩定</text>

            <!-- Pole pair (conjugate) -->
            <circle [attr.cx]="poleRe() * 15" [attr.cy]="-poleIm() * 15"
              r="6" fill="var(--accent)" stroke="white" stroke-width="2" style="cursor: grab" />
            @if (poleIm() > 0.05) {
              <circle [attr.cx]="poleRe() * 15" [attr.cy]="poleIm() * 15"
                r="6" fill="var(--accent)" stroke="white" stroke-width="2" opacity="0.5" />
            }

            <text [attr.x]="poleRe() * 15 + 8" [attr.y]="-poleIm() * 15 - 4"
              class="pole-lab">
              ({{ poleRe().toFixed(1) }}, {{ poleIm().toFixed(1) }}i)
            </text>
          </svg>
        </div>

        <div class="h-plot-wrap">
          <div class="pole-head">對應的 h(t)</div>
          <svg viewBox="-10 -80 340 160" class="h-svg">
            <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="1" />
            <text x="324" y="4" class="ax">t</text>
            <text x="-4" y="-72" class="ax">h(t)</text>

            <path [attr.d]="poleHPath()" fill="none"
              stroke="var(--accent)" stroke-width="2" />
          </svg>

          <div class="pole-readout">
            @if (poleRe() < -0.05) {
              @if (Math.abs(poleIm()) < 0.05) {
                → 純衰退（過阻尼）
              } @else {
                → 衰退振盪（欠阻尼）
              }
            } @else if (poleRe() > 0.05) {
              @if (Math.abs(poleIm()) < 0.05) {
                ⚠ 指數爆炸（不穩定）
              } @else {
                ⚠ 振盪爆炸（不穩定）
              }
            } @else {
              @if (Math.abs(poleIm()) > 0.05) {
                → 純振盪（邊界）
              } @else {
                → 無響應
              }
            }
          </div>
        </div>
      </div>

      <div class="pole-presets">
        <button class="pre-pole" (click)="setPole(-1, 2)">(−1, 2i) 欠阻尼</button>
        <button class="pre-pole" (click)="setPole(-2, 0)">(−2, 0) 過阻尼</button>
        <button class="pre-pole" (click)="setPole(0, 2)">(0, 2i) 純振盪</button>
        <button class="pre-pole unstable" (click)="setPole(0.5, 2)">(0.5, 2i) 不穩定</button>
      </div>

      <p class="pole-insight">
        <strong>核心觀察</strong>：傳遞函數 H(s) = 1/(ms²+cs+k) 的極點就是<strong>特徵多項式的根</strong>——
        跟 Ch5 §5.2 完全同源。複極點在左半平面（Re &lt; 0）系統就穩定，在右半平面就爆炸。
        工程師設計控制器的終極目標就是：<strong>把系統所有極點放在左半平面</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        卷積 y = f * h 告訴我們：<strong>知道衝擊響應 h(t)，就知道任何輸入的響應</strong>。
        Laplace 把卷積變成 s-域的乘法 Y = H·F。
        傳遞函數 H(s) 的極點位置決定系統穩定性——這是整個控制理論的起點。
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
    .centered-eq.big { font-size: 20px; padding: 16px; }

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

    .convo-viz {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .v-head {
      padding: 8px 10px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
      margin-bottom: 10px;
      line-height: 1.6;
    }

    .overlap-chart, .y-chart {
      margin-bottom: 8px;
    }

    .y-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .svg-overlap, .svg-y {
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

    .label {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
    }

    .tlab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    .caption {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 14px;
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
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 30px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 50px;
      text-align: right;
    }

    .pole-layout {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    @media (max-width: 640px) {
      .pole-layout { grid-template-columns: 1fr; }
    }

    .pole-svg-wrap, .h-plot-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .pole-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .pole-svg {
      width: 100%;
      display: block;
      cursor: grab;
    }

    .ax-complex {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }

    .zone {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
    }

    .pole-lab {
      font-size: 10px;
      fill: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .h-svg {
      width: 100%;
      display: block;
    }

    .pole-readout {
      margin-top: 6px;
      padding: 6px 10px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }

    .pole-presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin: 10px 0;
    }

    .pre-pole {
      font: inherit;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      padding: 5px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .pre-pole:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .pre-pole.unstable {
      border-color: #c87b5e;
      color: #c87b5e;
    }

    .pole-insight {
      padding: 12px 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin: 10px 0 0;
    }

    .pole-insight strong { color: var(--accent); }
  `,
})
export class DeCh7ConvolutionComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;
  readonly T_MAX = T_MAX;

  readonly t = signal(3);
  readonly playing = signal(false);

  // Pole position (conjugate pair at Re + Im·i)
  readonly poleRe = signal(-0.5);
  readonly poleIm = signal(2);

  readonly poleSvgRef = viewChild<ElementRef<SVGSVGElement>>('poleSvg');
  private dragging = false;

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.0;
        if (newT >= T_MAX) {
          this.t.set(T_MAX);
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
    if (this.t() >= T_MAX - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  setPole(re: number, im: number): void {
    this.poleRe.set(re);
    this.poleIm.set(im);
  }

  // f(τ) rectangle path (τ from 1 to 3, height 1)
  readonly fInputPath = (() => {
    const pts: string[] = [];
    pts.push(`M ${(1 * PX_PER_T).toFixed(1)} 0`);
    pts.push(`L ${(1 * PX_PER_T).toFixed(1)} ${(-1.1 * PX_PER_Y).toFixed(1)}`);
    pts.push(`L ${(3 * PX_PER_T).toFixed(1)} ${(-1.1 * PX_PER_Y).toFixed(1)}`);
    pts.push(`L ${(3 * PX_PER_T).toFixed(1)} 0`);
    pts.push('Z');
    return pts.join(' ');
  })();

  // Flipped impulse response h(t-τ) — for current t
  readonly hFlippedPath = computed(() => {
    const tNow = this.t();
    const pts: string[] = [];
    const n = 150;
    for (let i = 0; i <= n; i++) {
      const tau = (i / n) * T_MAX;
      const val = h(tNow - tau);
      const clamp = Math.max(-0.5, Math.min(0.9, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tau * PX_PER_T).toFixed(1)} ${(-clamp * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  // Overlap area (f × h_flipped) — shaded band
  readonly overlapPath = computed(() => {
    const tNow = this.t();
    const pts: string[] = [];
    const n = 80;
    pts.push(`M ${(1 * PX_PER_T).toFixed(1)} 0`);
    for (let i = 0; i <= n; i++) {
      const tau = 1 + (i / n) * 2; // integrate only over [1, 3]
      if (tau > tNow) break;
      const product = fInput(tau) * h(tNow - tau);
      const clamp = Math.max(-0.5, Math.min(1, product));
      pts.push(`L ${(tau * PX_PER_T).toFixed(1)} ${(-clamp * PX_PER_Y).toFixed(1)}`);
    }
    const endTau = Math.min(3, tNow);
    pts.push(`L ${(endTau * PX_PER_T).toFixed(1)} 0`);
    pts.push('Z');
    return pts.join(' ');
  });

  readonly currentConv = computed(() => convolution(this.t()));

  // Full convolution over all t (precomputed)
  readonly yFullPath = (() => {
    const pts: string[] = [];
    const n = 150;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * T_MAX;
      const val = convolution(t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-val * 180).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  readonly yRevealedPath = computed(() => {
    const pts: string[] = [];
    const n = 150;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * T_MAX;
      if (t > this.t()) break;
      const val = convolution(t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-val * 180).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  // ====== Pole→h(t) interactive ======

  startDrag(event: MouseEvent): void {
    this.dragging = true;
    this.drag(event);
  }

  drag(event: MouseEvent): void {
    if (!this.dragging) return;
    const svg = this.poleSvgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const re = inv.x / 15;
    const im = -inv.y / 15;
    if (Math.abs(re) < 4 && Math.abs(im) < 4) {
      this.poleRe.set(Math.round(re * 10) / 10);
      this.poleIm.set(Math.max(0, Math.round(im * 10) / 10));
    }
  }

  endDrag(): void {
    this.dragging = false;
  }

  /**
   * h(t) for conjugate pair at (Re ± Im·i):
   * if Im > 0: h(t) = e^(Re·t) · sin(Im·t) / Im  (approximate)
   * if Im = 0: h(t) = t · e^(Re·t)  (double real pole)
   */
  readonly poleHPath = computed(() => {
    const re = this.poleRe();
    const im = this.poleIm();
    const pts: string[] = [];
    const n = 150;
    const tPlotMax = 8;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * tPlotMax;
      let val: number;
      if (Math.abs(im) < 0.05) {
        // Real poles
        val = t * Math.exp(re * t);
      } else {
        val = Math.exp(re * t) * Math.sin(im * t) / im;
      }
      const clamp = Math.max(-2, Math.min(2, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 40).toFixed(1)} ${(-clamp * 30).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
