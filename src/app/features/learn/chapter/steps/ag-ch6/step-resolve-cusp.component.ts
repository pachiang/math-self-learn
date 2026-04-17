import { Component, signal, computed, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Animation stages ── */

const TOTAL_FRAMES = 60;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/** Sample parametric curve as SVG polyline points string. */
function samplePolyline(
  xFn: (p: number) => number,
  yFn: (p: number) => number,
  pRange: [number, number],
  steps: number,
  v: PlotView,
): string {
  const pts: string[] = [];
  const dp = (pRange[1] - pRange[0]) / steps;
  for (let i = 0; i <= steps; i++) {
    const p = pRange[0] + i * dp;
    const x = xFn(p);
    const y = yFn(p);
    if (!isFinite(x) || !isFinite(y)) continue;
    if (x < v.xRange[0] - 0.5 || x > v.xRange[1] + 0.5) continue;
    if (y < v.yRange[0] - 0.5 || y > v.yRange[1] + 0.5) continue;
    pts.push(`${plotToSvgX(v, x).toFixed(1)},${plotToSvgY(v, y).toFixed(1)}`);
  }
  return pts.join(' ');
}

@Component({
  selector: 'app-step-resolve-cusp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="尖點的消解：兩次 Blowup" subtitle="&sect;6.4">
      <p>
        尖點 y&sup2; = x&sup3; 擁有比結點更頑固的奇異性：兩條分支以<strong>相同的切線方向</strong>（x 軸）趨近原點。
        一次 blowup 無法分離來自同一方向的分支。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        <strong>第一次 blowup</strong>（令 y = xs）：
      </p>
      <p>
        代入 f(x, xs) = x&sup2;s&sup2; &minus; x&sup3; = x&sup2;(s&sup2; &minus; x)。
        消去 x&sup2;，嚴格變換是 s&sup2; = x ——仍然是尖點！
        奇異性移動了，但沒有消失。
      </p>
    </app-prose-block>

    <div class="katex-block">
      <app-math block [e]="formulaChain" />
    </div>

    <app-prose-block>
      <p>
        <strong>第二次 blowup</strong>（在 (x, s) 平面令 s = xu）：
      </p>
      <p>
        (xu)&sup2; = x &rarr; x&sup2;u&sup2; = x &rarr; x(xu&sup2; &minus; 1) = 0。
        消去 x，嚴格變換是 xu&sup2; = 1，即 x = 1/u&sup2;。
        這是一條光滑的雙曲線！奇異點徹底消解。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="觀察尖點消解的兩步過程——一次 blowup 不夠，兩次才行">
      <!-- Stage buttons -->
      <div class="stage-row">
        <button class="stage-btn" [class.active]="stage() === 0" (click)="goStage(0)">
          原始尖點
        </button>
        <button class="stage-btn anim-btn" [class.active]="animating() && animTarget() === 1"
                (click)="animateTo(1)" [disabled]="animating()">
          第一次 Blowup &#9654;
        </button>
        <button class="stage-btn anim-btn" [class.active]="animating() && animTarget() === 2"
                (click)="animateTo(2)" [disabled]="animating() || stage() < 1">
          第二次 Blowup &#9654;
        </button>
        <button class="stage-btn reset-btn" (click)="goStage(0)">
          重置
        </button>
      </div>

      <!-- Main SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath()" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Stage label -->
        <text x="14" y="22" class="stage-title">{{ stageLabel() }}</text>

        <!-- Y-axis label (changes per stage) -->
        <text [attr.x]="toSvgX(0) - 16" y="16" class="axis-label">{{ yAxisLabel() }}</text>
        <text [attr.x]="v.svgW - 14" [attr.y]="toSvgY(0) + 16" class="axis-label">x</text>

        <!-- Exceptional divisor E1 (stages 1, 2) -->
        @if (stage() >= 1 && !animating()) {
          <line [attr.x1]="toSvgX(0)" [attr.y1]="v.pad"
                [attr.x2]="toSvgX(0)" [attr.y2]="v.svgH - v.pad"
                stroke="#cc4444" stroke-width="1.5" stroke-dasharray="6 3" opacity="0.7" />
          <text [attr.x]="toSvgX(0) + 6" [attr.y]="v.pad + 14" class="e-label">E&#x2081;</text>
        }

        <!-- Exceptional divisor E2 (stage 2 only) -->
        @if (stage() >= 2 && !animating()) {
          <line [attr.x1]="v.pad" [attr.y1]="toSvgY(0)"
                [attr.x2]="v.svgW - v.pad" [attr.y2]="toSvgY(0)"
                stroke="#cc4444" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.5" />
          <text [attr.x]="v.svgW - v.pad - 30" [attr.y]="toSvgY(0) - 8" class="e-label">E&#x2082;</text>
        }

        <!-- Curve path (main) -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5"
              stroke-linecap="round" />

        <!-- Animated / static upper branch polyline -->
        @if (animBranchUpper()) {
          <polyline [attr.points]="animBranchUpper()" fill="none"
                    stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        }
        <!-- Lower branch polyline -->
        @if (animBranchLower()) {
          <polyline [attr.points]="animBranchLower()" fill="none"
                    stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        }

        <!-- Singular / smooth marker -->
        @if (stage() < 2 && !animating()) {
          <circle [attr.cx]="toSvgX(0)" [attr.cy]="toSvgY(0)" r="6"
                  fill="#cc4444" opacity="0.85" />
          <text [attr.x]="toSvgX(0) + 12" [attr.y]="toSvgY(0) - 10"
                class="sing-text">{{ stage() === 0 ? '尖點' : '仍然奇異！' }}</text>
        }

        @if (stage() === 2 && !animating()) {
          <!-- Smooth points on the curve -->
          @for (pt of smoothMarkers; track $index) {
            <circle [attr.cx]="toSvgX(pt[0])" [attr.cy]="toSvgY(pt[1])" r="4"
                    fill="#3a9a3a" opacity="0.85" />
          }
          <text [attr.x]="toSvgX(smoothMarkers[0][0]) + 10"
                [attr.y]="toSvgY(smoothMarkers[0][1]) - 8"
                class="smooth-text">光滑</text>
        }
      </svg>

      <!-- Step summary cards -->
      <div class="step-cards">
        <div class="step-card" [class.active]="stage() === 0">
          <div class="sc-header">步驟 1</div>
          <app-math [e]="'y^2 = x^3'" />
          <div class="sc-status fail">尖點</div>
          <div class="sc-detail">blowup y = xs</div>
        </div>
        <div class="step-arrow">&rarr;</div>
        <div class="step-card" [class.active]="stage() === 1">
          <div class="sc-header">步驟 2</div>
          <app-math [e]="'s^2 = x'" />
          <div class="sc-status fail">仍然尖點</div>
          <div class="sc-detail">blowup s = xu</div>
        </div>
        <div class="step-arrow">&rarr;</div>
        <div class="step-card" [class.active]="stage() === 2">
          <div class="sc-header">結果</div>
          <app-math [e]="'xu^2 = 1'" />
          <div class="sc-status pass">光滑</div>
          <div class="sc-detail">消解完成！</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        尖點需要兩次 blowup 才能消解。更複雜的奇異點可能需要更多次。
        <strong>Hironaka 定理</strong>保證：無論多複雜，有限次 blowup
        一定能消解所有奇異點。
      </p>
    </app-prose-block>
  `,
  styles: `
    .katex-block {
      margin: 12px 0 16px; text-align: center;
    }

    .stage-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    }
    .stage-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
    }
    .stage-btn:hover:not(:disabled) { border-color: var(--accent); }
    .stage-btn.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    .stage-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .anim-btn { background: var(--accent-10); }
    .reset-btn { margin-left: auto; color: var(--text-muted); font-size: 11px; }

    .plot-svg {
      width: 100%; display: block; margin-bottom: 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .stage-title {
      font-size: 13px; font-weight: 700; fill: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
    .axis-label {
      font-size: 11px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .e-label {
      font-size: 11px; fill: #cc4444; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .sing-text {
      font-size: 12px; fill: #cc4444; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .smooth-text {
      font-size: 12px; fill: #3a9a3a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Step summary cards */
    .step-cards {
      display: flex; align-items: center; gap: 0; justify-content: center;
      flex-wrap: wrap; margin-top: 8px;
    }
    .step-card {
      flex: 0 1 160px; padding: 12px 14px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--bg-surface);
      text-align: center; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .step-card.active {
      border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-10);
    }
    .sc-header {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;
    }
    .sc-status {
      font-size: 12px; font-weight: 700; margin: 6px 0 4px;
      font-family: 'JetBrains Mono', monospace; padding: 3px 10px;
      border-radius: 4px; display: inline-block;
    }
    .sc-status.fail { color: #cc4444; background: rgba(204,68,68,0.1); }
    .sc-status.pass { color: #3a9a3a; background: rgba(58,154,58,0.1); }
    .sc-detail {
      font-size: 11px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .step-arrow {
      font-size: 20px; color: var(--text-muted); padding: 0 8px;
      font-weight: 300;
    }
  `,
})
export class StepResolveCuspComponent implements OnDestroy {
  /* ── Formula ── */
  readonly formulaChain = `y^2 = x^3 \\;\\xrightarrow{\\text{blowup 1}}\\; s^2 = x \\;\\xrightarrow{\\text{blowup 2}}\\; \\text{smooth!}`;

  /* ── Plot view ── */
  readonly v: PlotView = { xRange: [-1.5, 2.5], yRange: [-2.5, 2.5], svgW: 520, svgH: 400, pad: 30 };

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /* ── Smooth markers for stage 2 ── */
  readonly smoothMarkers: [number, number][] = [
    [1 / (1.2 * 1.2), 1.2],
    [1 / (0.8 * 0.8), 0.8],
    [1 / (1.5 * 1.5), -1.5],
  ];

  /* ── State ── */
  readonly stage = signal(0);        // 0 = original, 1 = after blowup 1, 2 = after blowup 2
  readonly animating = signal(false);
  readonly animTarget = signal(0);
  readonly animT = signal(0);        // 0..1 animation parameter

  private animFrameId = 0;
  private animFrame = 0;

  /* ── Computed axes (changes per stage for label) ── */
  readonly axesPath = computed(() => plotAxesPath(this.v));

  readonly yAxisLabel = computed(() => {
    const s = this.stage();
    const a = this.animating();
    const at = this.animTarget();
    if (a && at === 2) return 'u';
    if (a && at === 1) return 's';
    if (s === 0) return 'y';
    if (s === 1) return 's';
    return 'u';
  });

  readonly stageLabel = computed(() => {
    if (this.animating()) {
      const t = this.animTarget();
      return t === 1 ? '第一次 Blowup 中...' : '第二次 Blowup 中...';
    }
    const s = this.stage();
    if (s === 0) return '原始尖點 y\u00B2 = x\u00B3';
    if (s === 1) return '第一次 Blowup 後: s\u00B2 = x';
    return '第二次 Blowup 後: xu\u00B2 = 1';
  });

  /* ── Curve rendering ── */

  /** Use implicitCurve for static stages, polyline branches for animations */
  readonly curvePath = computed(() => {
    if (this.animating()) return ''; // polyline branches handle animated frames
    const s = this.stage();
    if (s === 0) {
      return implicitCurve(
        (x, y) => y * y - x * x * x,
        this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120,
      );
    }
    if (s === 1) {
      return implicitCurve(
        (x, s) => s * s - x,
        this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120,
      );
    }
    // Stage 2: xu^2 = 1 → implicit: xu^2 - 1 = 0
    return implicitCurve(
      (x, u) => x * u * u - 1,
      this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 120,
    );
  });

  /** Animated upper branch polyline */
  readonly animBranchUpper = computed(() => {
    if (!this.animating()) return '';
    const t = this.animT();
    const target = this.animTarget();
    if (target === 1) return this.interpBranch1(t, +1);
    return this.interpBranch2(t, +1);
  });

  /** Animated lower branch polyline */
  readonly animBranchLower = computed(() => {
    if (!this.animating()) return '';
    const t = this.animT();
    const target = this.animTarget();
    if (target === 1) return this.interpBranch1(t, -1);
    return this.interpBranch2(t, -1);
  });

  /**
   * Interpolation for blowup 1: y^2 = x^3 → s^2 = x
   * At t=0: y = sign * x^(3/2)
   * At t=1: s = sign * sqrt(x)
   *
   * For a given x, y0 = x^(3/2), y1 = sqrt(x).
   * Interpolate: y(t) = (1-t)*x^(3/2) + t*sqrt(x)
   */
  private interpBranch1(t: number, sign: number): string {
    const steps = 120;
    const xMin = 0.001;
    const xMax = this.v.xRange[1];
    const dx = (xMax - xMin) / steps;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y0 = Math.pow(x, 1.5);   // cusp: y = x^(3/2)
      const y1 = Math.sqrt(x);        // after blowup: s = sqrt(x)
      const y = sign * ((1 - t) * y0 + t * y1);
      if (y < this.v.yRange[0] || y > this.v.yRange[1]) continue;
      pts.push(`${this.toSvgX(x).toFixed(1)},${this.toSvgY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  /**
   * Interpolation for blowup 2: s^2 = x → xu^2 = 1
   * At t=0: for x in [0.01..2.5], s = sign*sqrt(x)
   * At t=1: x = 1/u^2, so for u in [0.3..2.5], plot (1/u^2, u)
   *
   * We parametrize by u: at t=0, x = u^2 (from s=sqrt(x) with s=u), y=u;
   * at t=1, x = 1/u^2, y=u.
   * Interpolate x: x(t) = (1-t)*u^2 + t*(1/u^2)
   */
  private interpBranch2(t: number, sign: number): string {
    const steps = 120;
    const uMin = 0.35;
    const uMax = 2.4;
    const du = (uMax - uMin) / steps;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = uMin + i * du;
      const x0 = u * u;           // s^2 = x with s=u → x=u^2
      const x1 = 1 / (u * u);     // xu^2 = 1 → x=1/u^2
      const x = (1 - t) * x0 + t * x1;
      const y = sign * u;
      if (x < this.v.xRange[0] || x > this.v.xRange[1]) continue;
      if (y < this.v.yRange[0] || y > this.v.yRange[1]) continue;
      pts.push(`${this.toSvgX(x).toFixed(1)},${this.toSvgY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  /* ── Animation control ── */

  animateTo(target: number): void {
    if (this.animating()) return;
    // Ensure prerequisite stage
    if (target === 1) this.stage.set(0);
    if (target === 2) this.stage.set(1);

    this.animTarget.set(target);
    this.animating.set(true);
    this.animFrame = 0;
    this.animT.set(0);
    this.runAnimation();
  }

  private runAnimation(): void {
    this.animFrameId = requestAnimationFrame(() => {
      this.animFrame++;
      const t = easeInOut(Math.min(1, this.animFrame / TOTAL_FRAMES));
      this.animT.set(t);

      if (this.animFrame >= TOTAL_FRAMES) {
        this.animating.set(false);
        this.stage.set(this.animTarget());
        this.animT.set(0);
        return;
      }
      this.runAnimation();
    });
  }

  goStage(s: number): void {
    this.stopAnimation();
    this.stage.set(s);
  }

  private stopAnimation(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
    this.animating.set(false);
    this.animT.set(0);
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }
}
