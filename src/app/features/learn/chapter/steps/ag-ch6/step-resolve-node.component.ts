import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { PlotView, plotToSvgX, plotToSvgY, plotAxesPath } from '../ag-ch1/ag-util';

/* ── Sampling helpers ── */

/**
 * Sample the node curve y^2 = x^2(x+1).
 * Upper branch: y = x * sqrt(x+1), s = sqrt(x+1)
 * Lower branch: y = -x * sqrt(x+1), s = -sqrt(x+1)
 *
 * At parameter t in [0,1], interpolate between y-display and s-display:
 *   display = (1-t)*y + t*s
 */
function sampleBranch(
  xSamples: number[],
  upper: boolean,
  t: number,
): { x: number; display: number }[] {
  const pts: { x: number; display: number }[] = [];
  for (const x of xSamples) {
    if (x + 1 < 0) continue;
    const sqrtVal = Math.sqrt(x + 1);
    const y = upper ? x * sqrtVal : -x * sqrtVal;
    const s = upper ? sqrtVal : -sqrtVal;
    const display = (1 - t) * y + t * s;
    pts.push({ x, display });
  }
  return pts;
}

/** Build SVG path from sample points */
function buildPath(
  pts: { x: number; display: number }[],
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number,
): string {
  if (pts.length < 2) return '';
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const sx = toSvgX(pts[i].x).toFixed(1);
    const sy = toSvgY(pts[i].display).toFixed(1);
    d += (i === 0 ? `M${sx},${sy}` : `L${sx},${sy}`);
  }
  return d;
}

/** easeInOut */
function easeInOut(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

@Component({
  selector: 'app-step-resolve-node',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="結點的消解" subtitle="&sect;6.3">
      <p>
        結點（node）是最簡單的奇異點：兩條光滑分支在一點交叉。
        經典範例是 <app-math e="y^2 = x^2(x+1)" />，
        兩條分支 <app-math e="y = \\pm x\\sqrt{x+1}" /> 在原點相遇。
      </p>
      <p>
        Blowup 後：代入 y = xs 得 <app-math e="x^2 s^2 = x^2(x+1)" />，
        消去 <app-math e="x^2" />，得到嚴格變換
        <app-math e="s^2 = x + 1" />。
        這是一條光滑的拋物線！兩條分支分別在
        <app-math e="s = \\pm 1" /> 處與 E 相交。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>讓我們用動畫逐步觀察這個過程。</p>
    </app-prose-block>

    <app-challenge-card prompt="觀察結點消解的動畫——兩條交叉的分支逐漸分離">
      <!-- Animation SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Exceptional divisor E: fade in as t increases -->
        <line [attr.x1]="toSvgX(0)" [attr.y1]="v.pad"
              [attr.x2]="toSvgX(0)" [attr.y2]="v.svgH - v.pad"
              stroke="#c06060" stroke-width="2.5"
              [attr.stroke-opacity]="eOpacity()" />

        @if (tVal() > 0.3) {
          <text [attr.x]="toSvgX(0) - 18" [attr.y]="v.pad + 16"
                class="e-label" [attr.fill-opacity]="eOpacity()">E</text>
        }

        <!-- Upper branch -->
        <path [attr.d]="upperPath()" fill="none" stroke="var(--accent)" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round" />

        <!-- Lower branch -->
        <path [attr.d]="lowerPath()" fill="none" stroke="#5a8a5a" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round" />

        <!-- Node point at origin (visible when t < 0.5) -->
        @if (tVal() < 0.5) {
          <circle [attr.cx]="toSvgX(0)" [attr.cy]="toSvgY(nodeY())" r="6"
                  fill="#cc4444" fill-opacity="0.85" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(0) + 12" [attr.y]="toSvgY(nodeY()) - 8"
                class="sing-label">奇異點</text>
        }

        <!-- Separated points on E (visible when t > 0.5) -->
        @if (tVal() > 0.5) {
          <!-- s = +1 meeting point -->
          <circle [attr.cx]="toSvgX(0)" [attr.cy]="toSvgY(meetUpper())" r="5"
                  fill="#5a8a5a" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(0) + 10" [attr.y]="toSvgY(meetUpper()) - 6"
                class="smooth-label">光滑</text>

          <!-- s = -1 meeting point -->
          <circle [attr.cx]="toSvgX(0)" [attr.cy]="toSvgY(meetLower())" r="5"
                  fill="#5a8a5a" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(0) + 10" [attr.y]="toSvgY(meetLower()) - 6"
                class="smooth-label">光滑</text>
        }

        <!-- Y-axis label -->
        <text [attr.x]="toSvgX(0) + 8" [attr.y]="v.pad - 6"
              class="axis-label">{{ tVal() < 0.5 ? 'y' : 's (斜率方向)' }}</text>
        <text [attr.x]="v.svgW - v.pad + 8" [attr.y]="toSvgY(0) + 4"
              class="axis-label">x</text>
      </svg>

      <!-- Controls -->
      <div class="ctrl-row">
        <button class="ctrl-btn play-btn" (click)="togglePlay()">
          {{ playing() ? '暫停' : '播放' }}
        </button>
        <button class="ctrl-btn" (click)="resetAnim()">重置</button>
        <div class="slider-group">
          <span class="sl-label">blowup 進度</span>
          <input type="range" min="0" max="1" step="0.005"
                 [value]="tVal()"
                 (input)="onSlider($event)"
                 class="sl-input" />
          <span class="sl-val">{{ tVal().toFixed(2) }}</span>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">t</div>
          <div class="ic-body accent">{{ tVal().toFixed(2) }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">狀態</div>
          <div class="ic-body">
            {{ tVal() < 0.5 ? '結點：兩條分支在原點交叉' : '消解完成：兩條分支在 E 上分離' }}
          </div>
        </div>
        <div class="info-card badge-card">
          <span class="badge" [class.singular]="tVal() < 0.5"
                [class.smooth]="tVal() >= 0.5">
            {{ tVal() < 0.5 ? '奇異' : '光滑' }}
          </span>
        </div>
      </div>

      <!-- Step-by-step construction -->
      <div class="steps-box">
        <div class="step-item" [class.active]="tVal() >= 0">
          <span class="step-num">1</span>
          <span class="step-text">代入 y = xs:</span>
          <app-math e="x^2 s^2 = x^2(x+1)"></app-math>
        </div>
        <div class="step-item" [class.active]="tVal() >= 0.33">
          <span class="step-num">2</span>
          <span class="step-text">消去 <app-math e="x^2" />:</span>
          <app-math e="s^2 = x + 1"></app-math>
        </div>
        <div class="step-item" [class.active]="tVal() >= 0.66">
          <span class="step-num">3</span>
          <span class="step-text">嚴格變換在 E 上:</span>
          <app-math e="s = \\pm 1 \\quad\\text{（分離！）}"></app-math>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        一次 blowup 就把結點完全消解——因為兩條分支有不同的切線斜率
        （s = +1 和 s = -1），在 blowup 後它們自然分離到例外除子 E 的不同位置。
        尖點更困難——下一節見。
      </p>
    </app-prose-block>
  `,
  styles: `
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .e-label {
      font-size: 14px; fill: #c06060; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .sing-label {
      font-size: 11px; fill: #cc4444; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .smooth-label {
      font-size: 11px; fill: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .axis-label {
      font-size: 11px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
    }

    .ctrl-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; align-items: center;
    }
    .ctrl-btn {
      padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px;
      cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
    }
    .play-btn {
      min-width: 60px;
    }
    .slider-group {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 180px;
    }
    .sl-label {
      font-size: 11px; font-weight: 600; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; white-space: nowrap;
    }
    .sl-input { flex: 1; accent-color: var(--accent); }
    .sl-val {
      font-size: 12px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right;
    }

    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .info-card {
      flex: 1; min-width: 100px; padding: 10px 12px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .ic-body.accent { color: var(--accent); font-size: 16px; }

    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.4s, color 0.4s, border-color 0.4s;
    }
    .badge.singular {
      background: rgba(204,68,68,0.12); color: #cc4444;
      border: 1px solid rgba(204,68,68,0.3);
    }
    .badge.smooth {
      background: rgba(90,138,90,0.12); color: #5a8a5a;
      border: 1px solid rgba(90,138,90,0.3);
    }

    .steps-box {
      display: flex; flex-direction: column; gap: 8px;
      padding: 12px 14px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface);
    }
    .step-item {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      opacity: 0.3; transition: opacity 0.5s;
    }
    .step-item.active { opacity: 1; }
    .step-num {
      width: 22px; height: 22px; border-radius: 50%;
      background: var(--accent-10); color: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
    }
    .step-text {
      font-size: 12px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
  `,
})
export class StepResolveNodeComponent implements OnDestroy {
  /* ── Plot view ── */

  readonly v: PlotView = {
    xRange: [-1.5, 2.5], yRange: [-3, 3],
    svgW: 520, svgH: 420, pad: 30,
  };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /* ── Animation state ── */

  /** Raw linear progress [0,1] — easing is applied when reading tVal */
  private rawT = 0;
  readonly tVal = signal(0);
  readonly playing = signal(false);

  private animFrameId = 0;
  private lastTime = 0;
  private readonly DURATION = 3500; // ms for full animation

  /* ── Sample points ── */

  private readonly xSamples: number[] = (() => {
    const pts: number[] = [];
    // Dense sampling from -1 to 2.5
    for (let i = 0; i <= 400; i++) {
      pts.push(-1 + (i / 400) * 3.5);
    }
    return pts;
  })();

  /* ── Computed paths ── */

  readonly upperPath = computed(() => {
    const t = this.tVal();
    const pts = sampleBranch(this.xSamples, true, t);
    return buildPath(pts, this.toSvgX, this.toSvgY);
  });

  readonly lowerPath = computed(() => {
    const t = this.tVal();
    const pts = sampleBranch(this.xSamples, false, t);
    return buildPath(pts, this.toSvgX, this.toSvgY);
  });

  /** Opacity of exceptional divisor E line */
  readonly eOpacity = computed(() => {
    const t = this.tVal();
    return Math.min(1, t * 2);
  });

  /** Y-position of the node point (interpolated) */
  readonly nodeY = computed(() => {
    // At t=0, both branches meet at (0,0). As t increases, they separate.
    // Upper branch at x=0: y=0, s=1. Display = (1-t)*0 + t*1 = t
    // We show the midpoint
    return 0;
  });

  /** Y-position where upper branch meets E at x=0 */
  readonly meetUpper = computed(() => {
    const t = this.tVal();
    // At x=0: y=0, s=+1. Display = (1-t)*0 + t*1 = t
    return (1 - t) * 0 + t * 1;
  });

  /** Y-position where lower branch meets E at x=0 */
  readonly meetLower = computed(() => {
    const t = this.tVal();
    // At x=0: y=0, s=-1. Display = (1-t)*0 + t*(-1) = -t
    return (1 - t) * 0 + t * (-1);
  });

  /* ── Playback controls ── */

  togglePlay(): void {
    if (this.playing()) {
      this.playing.set(false);
      cancelAnimationFrame(this.animFrameId);
    } else {
      // If at end, restart
      if (this.rawT >= 0.99) {
        this.rawT = 0;
        this.tVal.set(0);
      }
      this.playing.set(true);
      this.lastTime = 0;
      this.animFrameId = requestAnimationFrame((ts) => this.tick(ts));
    }
  }

  resetAnim(): void {
    this.playing.set(false);
    cancelAnimationFrame(this.animFrameId);
    this.rawT = 0;
    this.tVal.set(0);
  }

  onSlider(ev: Event): void {
    const val = +(ev.target as HTMLInputElement).value;
    this.rawT = val;
    this.tVal.set(val);
    // Pause if user interacts with slider
    if (this.playing()) {
      this.playing.set(false);
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private tick(timestamp: number): void {
    if (!this.playing()) return;

    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }

    const elapsed = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.rawT += elapsed / this.DURATION;

    if (this.rawT >= 1) {
      this.rawT = 1;
      this.tVal.set(1);
      this.playing.set(false);
      return;
    }

    // Apply easeInOut for smooth start/end
    this.tVal.set(easeInOut(this.rawT));

    this.animFrameId = requestAnimationFrame((ts) => this.tick(ts));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
  }
}
