import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Fixed curve: y^2 = x^3 - x + 1  (a = -1, b = 1) ── */
const EC_A = -1;
const EC_B = 1;

/** f(x,y) = y^2 - x^3 - ax - b */
function ecF(x: number, y: number): number {
  return y * y - x * x * x - EC_A * x - EC_B;
}

/** Evaluate y^2 = x^3 + ax + b => rhs */
function ecRhs(x: number): number {
  return x * x * x + EC_A * x + EC_B;
}

/** Snap a click position to the nearest point on the curve */
function snapToCurve(mx: number, my: number, xRange: [number, number]): [number, number] | null {
  let bestDist = Infinity;
  let bestPt: [number, number] | null = null;

  // Coarse search: sample x values near mx
  const searchRadius = 1.5;
  const step = 0.02;
  for (let x = Math.max(xRange[0], mx - searchRadius); x <= Math.min(xRange[1], mx + searchRadius); x += step) {
    const rhs = ecRhs(x);
    if (rhs < 0) continue;
    const yp = Math.sqrt(rhs);
    const yn = -yp;
    const dp = (x - mx) * (x - mx) + (yp - my) * (yp - my);
    const dn = (x - mx) * (x - mx) + (yn - my) * (yn - my);
    if (dp < bestDist) { bestDist = dp; bestPt = [x, yp]; }
    if (dn < bestDist) { bestDist = dn; bestPt = [x, yn]; }
  }
  // Refine
  if (bestPt) {
    const cx = bestPt[0];
    for (let x = cx - 0.05; x <= cx + 0.05; x += 0.002) {
      const rhs = ecRhs(x);
      if (rhs < 0) continue;
      const yp = Math.sqrt(rhs);
      const yn = -yp;
      const dp = (x - mx) * (x - mx) + (yp - my) * (yp - my);
      const dn = (x - mx) * (x - mx) + (yn - my) * (yn - my);
      if (dp < bestDist) { bestDist = dp; bestPt = [x, yp]; }
      if (dn < bestDist) { bestDist = dn; bestPt = [x, yn]; }
    }
  }
  if (bestDist > 1.0) return null;
  return bestPt;
}

/**
 * Compute P + Q on y^2 = x^3 + ax + b.
 * Returns null when result is O (point at infinity).
 */
function ecAdd(
  p: [number, number],
  q: [number, number],
  double: boolean,
): { result: [number, number] | null; slope: number | null; rPrime: [number, number] | null } {
  const [x1, y1] = p;
  const [x2, y2] = q;

  // Vertical line check: P + (-P) = O
  if (!double && Math.abs(x1 - x2) < 1e-9 && Math.abs(y1 + y2) < 1e-9) {
    return { result: null, slope: null, rPrime: null };
  }

  let m: number;
  if (double || (Math.abs(x1 - x2) < 1e-9 && Math.abs(y1 - y2) < 1e-9)) {
    // Doubling: tangent slope = (3x1^2 + a) / (2y1)
    if (Math.abs(y1) < 1e-9) {
      return { result: null, slope: null, rPrime: null };
    }
    m = (3 * x1 * x1 + EC_A) / (2 * y1);
  } else {
    if (Math.abs(x1 - x2) < 1e-12) {
      return { result: null, slope: null, rPrime: null };
    }
    m = (y2 - y1) / (x2 - x1);
  }

  const x3 = m * m - x1 - x2;
  const y3 = m * (x1 - x3) - y1;
  const rPrime: [number, number] = [x3, y3];
  const result: [number, number] = [x3, -y3];

  return { result, slope: m, rPrime };
}

type OpMode = 'add' | 'double' | 'inverse';

@Component({
  selector: 'app-step-ec-group-law',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="群法則：幾何加法" subtitle="&sect;3.2">
      <p>
        給定橢圓曲線上的兩個點 P 和 Q，我們定義 P + Q 的步驟：
      </p>
      <ol>
        <li>過 P 和 Q 畫一條直線</li>
        <li>這條直線與曲線交於<strong>第三個點</strong> R'（B&eacute;zout 定理：三次曲線與一次直線交 3 點）</li>
        <li>將 R' 關於 x 軸反射得到 R = P + Q</li>
      </ol>
      <app-math block [e]="formulaAdd"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>特殊情況：</p>
      <ul>
        <li><strong>P = Q（倍點）</strong>：用 P 處的切線代替割線</li>
        <li><strong>P + O = P</strong>：無窮遠點 O 是單位元</li>
        <li><strong>P + (-P) = O</strong>：(x, y) 的逆元是 (x, -y)（關於 x 軸的反射）</li>
        <li><strong>鉛直線（P 和 -P）</strong>：直線「在無窮遠處交曲線」，結果是 O</li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        這個運算是<strong>交換的</strong>（P+Q = Q+P）且<strong>結合的</strong>（(P+Q)+R = P+(Q+R)）——使得曲線成為一個<strong>Abel 群</strong>。
        幾何形狀承載代數結構，這是非凡的！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點擊曲線上的兩個點 P 和 Q，觀察幾何加法如何運作">
      <!-- Mode buttons -->
      <div class="mode-row">
        <button class="mode-btn" [class.active]="opMode() === 'add'"
                (click)="setMode('add')">P + Q (加法)</button>
        <button class="mode-btn" [class.active]="opMode() === 'double'"
                (click)="setMode('double')">P + P (倍點)</button>
        <button class="mode-btn" [class.active]="opMode() === 'inverse'"
                (click)="setMode('inverse')">P + (-P) = O</button>
      </div>

      <!-- Step indicator -->
      <div class="step-indicator">
        @switch (stepPhase()) {
          @case (0) {
            <span class="step-text">{{ opMode() === 'add' ? '點擊選取 P' : '點擊選取 P' }}</span>
          }
          @case (1) {
            <span class="step-text">{{ opMode() === 'add' ? '點擊選取 Q' : '已計算' }}</span>
          }
          @case (2) {
            <span class="step-text">已計算 P + Q</span>
          }
        }
        <button class="reset-btn" (click)="reset()">重置</button>
      </div>

      <!-- SVG -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg"
           (click)="onSvgClick($event)">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Elliptic curve -->
        <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2.2"
              stroke-linecap="round" />

        <!-- Secant / tangent line -->
        @if (lineEndpoints()) {
          <line [attr.x1]="lineEndpoints()![0]" [attr.y1]="lineEndpoints()![1]"
                [attr.x2]="lineEndpoints()![2]" [attr.y2]="lineEndpoints()![3]"
                stroke="var(--text-muted)" stroke-width="1.2"
                stroke-dasharray="6 3" stroke-linecap="round" />
        }

        <!-- Vertical reflection line from R' to R -->
        @if (addResult() && addResult()!.rPrime && addResult()!.result) {
          <line [attr.x1]="toSvgX(addResult()!.rPrime![0])"
                [attr.y1]="toSvgY(addResult()!.rPrime![1])"
                [attr.x2]="toSvgX(addResult()!.result![0])"
                [attr.y2]="toSvgY(addResult()!.result![1])"
                stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 3" />
        }

        <!-- Point P -->
        @if (pointP()) {
          <circle [attr.cx]="toSvgX(pointP()![0])" [attr.cy]="toSvgY(pointP()![1])"
                  r="6" fill="#4a7ab5" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(pointP()![0]) + 10"
                [attr.y]="toSvgY(pointP()![1]) - 10"
                class="pt-label" fill="#4a7ab5">P</text>
        }

        <!-- Point Q (add mode only) -->
        @if (pointQ()) {
          <circle [attr.cx]="toSvgX(pointQ()![0])" [attr.cy]="toSvgY(pointQ()![1])"
                  r="6" fill="#5a8a5a" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(pointQ()![0]) + 10"
                [attr.y]="toSvgY(pointQ()![1]) - 10"
                class="pt-label" fill="#5a8a5a">Q</text>
        }

        <!-- Inverse point -P (inverse mode) -->
        @if (opMode() === 'inverse' && pointP()) {
          <circle [attr.cx]="toSvgX(pointP()![0])" [attr.cy]="toSvgY(-pointP()![1])"
                  r="6" fill="#8a5a7a" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(pointP()![0]) + 10"
                [attr.y]="toSvgY(-pointP()![1]) - 10"
                class="pt-label" fill="#8a5a7a">-P</text>
          <!-- Vertical line through P and -P -->
          <line [attr.x1]="toSvgX(pointP()![0])"
                [attr.y1]="v.pad"
                [attr.x2]="toSvgX(pointP()![0])"
                [attr.y2]="v.svgH - v.pad"
                stroke="#8a5a7a" stroke-width="1.2" stroke-dasharray="6 3" />
        }

        <!-- Third intersection R' -->
        @if (addResult() && addResult()!.rPrime) {
          <circle [attr.cx]="toSvgX(addResult()!.rPrime![0])"
                  [attr.cy]="toSvgY(addResult()!.rPrime![1])"
                  r="5" fill="none" stroke="#b07830" stroke-width="2" />
          <text [attr.x]="toSvgX(addResult()!.rPrime![0]) + 10"
                [attr.y]="toSvgY(addResult()!.rPrime![1]) - 10"
                class="pt-label" fill="#b07830">R'</text>
        }

        <!-- Result P+Q -->
        @if (addResult() && addResult()!.result) {
          <circle [attr.cx]="toSvgX(addResult()!.result![0])"
                  [attr.cy]="toSvgY(addResult()!.result![1])"
                  r="7" fill="#c05050" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(addResult()!.result![0]) + 10"
                [attr.y]="toSvgY(addResult()!.result![1]) - 10"
                class="pt-label result-label" fill="#c05050">P+Q</text>
        }

        <!-- Infinity label -->
        @if (isInfinity()) {
          <text [attr.x]="v.svgW / 2" [attr.y]="v.pad + 20"
                text-anchor="middle" class="inf-label">= O (無窮遠點)</text>
        }
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card mono-card">
          <div class="ic-title">P</div>
          <div class="ic-val">{{ pointP() ? '(' + pointP()![0].toFixed(2) + ', ' + pointP()![1].toFixed(2) + ')' : '--' }}</div>
        </div>
        <div class="info-card mono-card">
          <div class="ic-title">{{ opMode() === 'double' ? 'P (倍點)' : opMode() === 'inverse' ? '-P' : 'Q' }}</div>
          <div class="ic-val">{{ qDisplayStr() }}</div>
        </div>
        <div class="info-card mono-card">
          <div class="ic-title">{{ opMode() === 'inverse' ? 'P+(-P)' : 'P+Q' }}</div>
          <div class="ic-val">{{ resultDisplayStr() }}</div>
        </div>
        @if (addResult() && addResult()!.slope !== null) {
          <div class="info-card mono-card">
            <div class="ic-title">斜率 m</div>
            <div class="ic-val">{{ addResult()!.slope!.toFixed(4) }}</div>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個加法看似隨意，但它滿足群公理：有單位元（O）、逆元（反射）、結合律（驗證起來很不簡單！）。
        橢圓曲線上的點因此構成一個 Abel 群。
      </p>
    </app-prose-block>
  `,
  styles: `
    .mode-row {
      display: flex; gap: 8px; margin-bottom: 8px;
    }
    .mode-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .step-indicator {
      display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
      padding: 6px 12px; border-radius: 6px; background: var(--bg-surface);
      border: 1px solid var(--border);
    }
    .step-text {
      flex: 1; font-size: 12px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    .reset-btn {
      padding: 4px 12px; border-radius: 5px; border: 1px solid var(--border);
      background: var(--bg); color: var(--text-muted); font-size: 11px;
      cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: border-color 0.15s;
      &:hover { border-color: var(--accent); color: var(--accent); }
    }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
      cursor: crosshair;
    }
    .pt-label {
      font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .result-label { font-size: 14px; }
    .inf-label {
      font-size: 14px; font-weight: 700; fill: #8a5a7a;
      font-family: 'JetBrains Mono', monospace;
    }
    .info-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 100px; padding: 8px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 13px;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;
    }
    .mono-card {
      font-family: 'JetBrains Mono', monospace; font-size: 12px;
    }
    .ic-val { color: var(--text); font-weight: 600; }
  `,
})
export class StepEcGroupLawComponent {
  readonly formulaAdd = `P + Q:\\; \\text{draw line} \\to \\text{third intersection } R' \\to \\text{reflect } \\Rightarrow R = P+Q`;

  readonly v: PlotView = {
    xRange: [-2.5, 3.5], yRange: [-4, 4], svgW: 520, svgH: 480, pad: 30,
  };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /** Pre-compute the curve path (fixed curve) */
  readonly curvePath = implicitCurve(
    ecF, this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 140,
  );

  readonly opMode = signal<OpMode>('add');
  readonly pointP = signal<[number, number] | null>(null);
  readonly pointQ = signal<[number, number] | null>(null);

  /** Current interaction phase: 0 = need P, 1 = need Q (or done for double/inverse), 2 = done */
  readonly stepPhase = computed(() => {
    if (!this.pointP()) return 0;
    const mode = this.opMode();
    if (mode === 'double' || mode === 'inverse') return 1;
    if (!this.pointQ()) return 1;
    return 2;
  });

  /** Compute addition result */
  readonly addResult = computed(() => {
    const p = this.pointP();
    if (!p) return null;
    const mode = this.opMode();

    if (mode === 'inverse') {
      // P + (-P) = O always
      return { result: null, slope: null, rPrime: null } as ReturnType<typeof ecAdd>;
    }
    if (mode === 'double') {
      return ecAdd(p, p, true);
    }
    // add mode
    const q = this.pointQ();
    if (!q) return null;
    return ecAdd(p, q, false);
  });

  /** Is result the point at infinity? */
  readonly isInfinity = computed(() => {
    const mode = this.opMode();
    if (mode === 'inverse' && this.pointP()) return true;
    const r = this.addResult();
    return r !== null && r.result === null;
  });

  /** Line endpoints for the secant/tangent */
  readonly lineEndpoints = computed((): [number, number, number, number] | null => {
    const r = this.addResult();
    if (!r || r.slope === null) return null;
    const p = this.pointP()!;
    const m = r.slope;
    // Extend line across the view
    const xL = this.v.xRange[0] - 1;
    const xR = this.v.xRange[1] + 1;
    const yL = p[1] + m * (xL - p[0]);
    const yR = p[1] + m * (xR - p[0]);
    return [this.toSvgX(xL), this.toSvgY(yL), this.toSvgX(xR), this.toSvgY(yR)];
  });

  /** Display strings */
  readonly qDisplayStr = computed(() => {
    const mode = this.opMode();
    const p = this.pointP();
    if (mode === 'double') {
      return p ? '(' + p[0].toFixed(2) + ', ' + p[1].toFixed(2) + ')' : '--';
    }
    if (mode === 'inverse') {
      return p ? '(' + p[0].toFixed(2) + ', ' + (-p[1]).toFixed(2) + ')' : '--';
    }
    const q = this.pointQ();
    return q ? '(' + q[0].toFixed(2) + ', ' + q[1].toFixed(2) + ')' : '--';
  });

  readonly resultDisplayStr = computed(() => {
    if (this.isInfinity()) return 'O (無窮遠點)';
    const r = this.addResult();
    if (!r || !r.result) return '--';
    return '(' + r.result[0].toFixed(2) + ', ' + r.result[1].toFixed(2) + ')';
  });

  setMode(m: OpMode): void {
    this.opMode.set(m);
    this.reset();
  }

  reset(): void {
    this.pointP.set(null);
    this.pointQ.set(null);
  }

  onSvgClick(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const ratioX = (ev.clientX - rect.left) / rect.width;
    const ratioY = (ev.clientY - rect.top) / rect.height;
    const svgX = ratioX * this.v.svgW;
    const svgY = ratioY * this.v.svgH;

    // Convert to math coords
    const mx = this.v.xRange[0] +
      ((svgX - this.v.pad) / (this.v.svgW - 2 * this.v.pad)) * (this.v.xRange[1] - this.v.xRange[0]);
    const my = this.v.yRange[0] +
      ((this.v.svgH - this.v.pad - svgY) / (this.v.svgH - 2 * this.v.pad)) * (this.v.yRange[1] - this.v.yRange[0]);

    const snapped = snapToCurve(mx, my, this.v.xRange);
    if (!snapped) return;

    const mode = this.opMode();

    if (mode === 'double' || mode === 'inverse') {
      // Only need one point
      this.pointP.set(snapped);
      this.pointQ.set(null);
      return;
    }

    // Add mode: set P then Q
    if (!this.pointP()) {
      this.pointP.set(snapped);
    } else if (!this.pointQ()) {
      this.pointQ.set(snapped);
    } else {
      // Already have both — restart
      this.pointP.set(snapped);
      this.pointQ.set(null);
    }
  }
}
