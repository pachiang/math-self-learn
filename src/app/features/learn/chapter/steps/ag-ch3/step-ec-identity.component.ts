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

function ecF(x: number, y: number): number {
  return y * y - x * x * x - EC_A * x - EC_B;
}

function ecRhs(x: number): number {
  return x * x * x + EC_A * x + EC_B;
}

/** Snap to curve */
function snapToCurve(mx: number, my: number, xRange: [number, number]): [number, number] | null {
  let bestDist = Infinity;
  let bestPt: [number, number] | null = null;
  const radius = 1.5;
  const step = 0.02;
  for (let x = Math.max(xRange[0], mx - radius); x <= Math.min(xRange[1], mx + radius); x += step) {
    const rhs = ecRhs(x);
    if (rhs < 0) continue;
    const yp = Math.sqrt(rhs);
    const yn = -yp;
    const dp = (x - mx) ** 2 + (yp - my) ** 2;
    const dn = (x - mx) ** 2 + (yn - my) ** 2;
    if (dp < bestDist) { bestDist = dp; bestPt = [x, yp]; }
    if (dn < bestDist) { bestDist = dn; bestPt = [x, yn]; }
  }
  if (bestPt) {
    const cx = bestPt[0];
    for (let x = cx - 0.05; x <= cx + 0.05; x += 0.002) {
      const rhs = ecRhs(x);
      if (rhs < 0) continue;
      const yp = Math.sqrt(rhs);
      const yn = -yp;
      const dp = (x - mx) ** 2 + (yp - my) ** 2;
      const dn = (x - mx) ** 2 + (yn - my) ** 2;
      if (dp < bestDist) { bestDist = dp; bestPt = [x, yp]; }
      if (dn < bestDist) { bestDist = dn; bestPt = [x, yn]; }
    }
  }
  if (bestDist > 1.0) return null;
  return bestPt;
}

/** EC point addition */
function ecAdd(
  p: [number, number], q: [number, number], double: boolean,
): { result: [number, number] | null; slope: number | null; rPrime: [number, number] | null } {
  const [x1, y1] = p;
  const [x2, y2] = q;

  if (!double && Math.abs(x1 - x2) < 1e-9 && Math.abs(y1 + y2) < 1e-9) {
    return { result: null, slope: null, rPrime: null };
  }

  let m: number;
  if (double || (Math.abs(x1 - x2) < 1e-9 && Math.abs(y1 - y2) < 1e-9)) {
    if (Math.abs(y1) < 1e-9) return { result: null, slope: null, rPrime: null };
    m = (3 * x1 * x1 + EC_A) / (2 * y1);
  } else {
    if (Math.abs(x1 - x2) < 1e-12) return { result: null, slope: null, rPrime: null };
    m = (y2 - y1) / (x2 - x1);
  }

  const x3 = m * m - x1 - x2;
  const y3 = m * (x1 - x3) - y1;
  return { result: [x3, -y3], slope: m, rPrime: [x3, y3] };
}

type VisMode = 'inverse' | 'assoc';

/* ── Associativity construction data ── */
interface AssocData {
  P: [number, number];
  Q: [number, number];
  R: [number, number];
  /* Left path: (P+Q)+R */
  pqSum: { result: [number, number] | null; slope: number | null; rPrime: [number, number] | null };
  leftFinal: { result: [number, number] | null; slope: number | null; rPrime: [number, number] | null } | null;
  /* Right path: P+(Q+R) */
  qrSum: { result: [number, number] | null; slope: number | null; rPrime: [number, number] | null };
  rightFinal: { result: [number, number] | null; slope: number | null; rPrime: [number, number] | null } | null;
}

function buildAssocData(): AssocData {
  // Pick points on the curve: P ~ (-1, 1), Q ~ (0, 1), R ~ (1, 1)
  // Exact: y = sqrt(x^3 - x + 1)
  const P: [number, number] = [-1, Math.sqrt(ecRhs(-1))];
  const Q: [number, number] = [0, Math.sqrt(ecRhs(0))];
  const R: [number, number] = [1, Math.sqrt(ecRhs(1))];

  const pqSum = ecAdd(P, Q, false);
  let leftFinal: AssocData['leftFinal'] = null;
  if (pqSum.result) {
    leftFinal = ecAdd(pqSum.result, R, false);
  }

  const qrSum = ecAdd(Q, R, false);
  let rightFinal: AssocData['rightFinal'] = null;
  if (qrSum.result) {
    rightFinal = ecAdd(P, qrSum.result, false);
  }

  return { P, Q, R, pqSum, leftFinal, qrSum, rightFinal };
}

@Component({
  selector: 'app-step-ec-identity',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="單位元、逆元與結合律" subtitle="&sect;3.3">
      <p>
        無窮遠點 O 是單位元：P + O = P 對曲線上的每個點 P 成立。
        你可以把 O 理解為「鉛直線在射影閉包頂端與曲線的交點」。
      </p>
      <app-math block [e]="formulaIdentity"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>
        P = (x, y) 的逆元是 -P = (x, -y)——關於 x 軸的反射。
        P + (-P) = O：過 P 和 -P 的直線是鉛直線，在「無窮遠處」交曲線。
      </p>
      <app-math block [e]="formulaInverse"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>
        結合律 (P+Q)+R = P+(Q+R) 是最難驗證的性質。它在幾何上<strong>不是</strong>顯然的——
        證明需要代數計算或更深的理論（Riemann-Roch 定理）。但我們可以對特定的點做視覺驗證。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="視覺驗證結合律：(P+Q)+R 和 P+(Q+R) 是同一點嗎？">
      <!-- Mode buttons -->
      <div class="mode-row">
        <button class="mode-btn" [class.active]="visMode() === 'inverse'"
                (click)="setVisMode('inverse')">逆元 P + (-P) = O</button>
        <button class="mode-btn" [class.active]="visMode() === 'assoc'"
                (click)="setVisMode('assoc')">結合律驗證</button>
      </div>

      @if (visMode() === 'inverse') {
        <!-- Inverse mode -->
        <div class="step-indicator">
          <span class="step-text">{{ invP() ? '已選取 P，顯示 P + (-P) = O' : '點擊曲線選取 P' }}</span>
          <button class="reset-btn" (click)="invP.set(null)">重置</button>
        </div>

        <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg"
             (click)="onInvClick($event)">
          <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />
          <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2.2"
                stroke-linecap="round" />

          @if (invP()) {
            <!-- P -->
            <circle [attr.cx]="toSvgX(invP()![0])" [attr.cy]="toSvgY(invP()![1])"
                    r="6" fill="#4a7ab5" stroke="#fff" stroke-width="1.5" />
            <text [attr.x]="toSvgX(invP()![0]) + 10"
                  [attr.y]="toSvgY(invP()![1]) - 10"
                  class="pt-label" fill="#4a7ab5">P</text>

            <!-- -P -->
            <circle [attr.cx]="toSvgX(invP()![0])" [attr.cy]="toSvgY(-invP()![1])"
                    r="6" fill="#8a5a7a" stroke="#fff" stroke-width="1.5" />
            <text [attr.x]="toSvgX(invP()![0]) + 10"
                  [attr.y]="toSvgY(-invP()![1]) - 10"
                  class="pt-label" fill="#8a5a7a">-P</text>

            <!-- Vertical line -->
            <line [attr.x1]="toSvgX(invP()![0])" [attr.y1]="v.pad"
                  [attr.x2]="toSvgX(invP()![0])" [attr.y2]="v.svgH - v.pad"
                  stroke="#8a5a7a" stroke-width="1.2" stroke-dasharray="6 3" />

            <!-- O label at top -->
            <text [attr.x]="toSvgX(invP()![0])"
                  [attr.y]="v.pad + 18"
                  text-anchor="middle" class="inf-label">= O</text>
          }
        </svg>

        @if (invP()) {
          <div class="info-row">
            <div class="info-card mono-card">
              <div class="ic-title">P</div>
              <div class="ic-val">({{ invP()![0].toFixed(2) }}, {{ invP()![1].toFixed(2) }})</div>
            </div>
            <div class="info-card mono-card">
              <div class="ic-title">-P</div>
              <div class="ic-val">({{ invP()![0].toFixed(2) }}, {{ (-invP()![1]).toFixed(2) }})</div>
            </div>
            <div class="info-card badge-card">
              <span class="badge inf-badge">P + (-P) = O</span>
            </div>
          </div>
        }
      }

      @if (visMode() === 'assoc') {
        <!-- Associativity mode -->
        <div class="step-btns">
          <button class="step-btn" [class.active]="assocStep() >= 1"
                  (click)="assocStep.set(1)">第一步</button>
          <button class="step-btn" [class.active]="assocStep() >= 2"
                  (click)="assocStep.set(2)">第二步</button>
          <button class="step-btn" [class.active]="assocStep() >= 3"
                  (click)="assocStep.set(3)">第三步</button>
          <button class="reset-btn" (click)="assocStep.set(0)">重置</button>
        </div>

        <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
          <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />
          <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2.2"
                stroke-linecap="round" />

          <!-- Base points P, Q, R (always shown) -->
          <circle [attr.cx]="toSvgX(ad.P[0])" [attr.cy]="toSvgY(ad.P[1])"
                  r="6" fill="#4a7ab5" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(ad.P[0]) - 16"
                [attr.y]="toSvgY(ad.P[1]) - 10"
                class="pt-label" fill="#4a7ab5">P</text>

          <circle [attr.cx]="toSvgX(ad.Q[0])" [attr.cy]="toSvgY(ad.Q[1])"
                  r="6" fill="#5a8a5a" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(ad.Q[0]) + 10"
                [attr.y]="toSvgY(ad.Q[1]) - 10"
                class="pt-label" fill="#5a8a5a">Q</text>

          <circle [attr.cx]="toSvgX(ad.R[0])" [attr.cy]="toSvgY(ad.R[1])"
                  r="6" fill="#7a6a5a" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="toSvgX(ad.R[0]) + 10"
                [attr.y]="toSvgY(ad.R[1]) - 10"
                class="pt-label" fill="#7a6a5a">R</text>

          <!-- Step 1: Left path — line P-Q (warm), Right path — line Q-R (cool) -->
          @if (assocStep() >= 1) {
            <!-- Left: P+Q line -->
            @if (ad.pqSum.slope !== null) {
              <line [attr.x1]="toSvgX(v.xRange[0] - 1)"
                    [attr.y1]="toSvgY(ad.P[1] + ad.pqSum.slope! * (v.xRange[0] - 1 - ad.P[0]))"
                    [attr.x2]="toSvgX(v.xRange[1] + 1)"
                    [attr.y2]="toSvgY(ad.P[1] + ad.pqSum.slope! * (v.xRange[1] + 1 - ad.P[0]))"
                    stroke="#8a6a5a" stroke-width="1.1" stroke-dasharray="5 3"
                    stroke-linecap="round" />
            }
            <!-- Right: Q+R line -->
            @if (ad.qrSum.slope !== null) {
              <line [attr.x1]="toSvgX(v.xRange[0] - 1)"
                    [attr.y1]="toSvgY(ad.Q[1] + ad.qrSum.slope! * (v.xRange[0] - 1 - ad.Q[0]))"
                    [attr.x2]="toSvgX(v.xRange[1] + 1)"
                    [attr.y2]="toSvgY(ad.Q[1] + ad.qrSum.slope! * (v.xRange[1] + 1 - ad.Q[0]))"
                    stroke="#5a6a8a" stroke-width="1.1" stroke-dasharray="5 3"
                    stroke-linecap="round" />
            }
          }

          <!-- Step 2: Show S1 = P+Q and S2 = Q+R -->
          @if (assocStep() >= 2) {
            @if (ad.pqSum.result) {
              <!-- Reflection line for P+Q -->
              @if (ad.pqSum.rPrime) {
                <line [attr.x1]="toSvgX(ad.pqSum.rPrime[0])"
                      [attr.y1]="toSvgY(ad.pqSum.rPrime[1])"
                      [attr.x2]="toSvgX(ad.pqSum.result[0])"
                      [attr.y2]="toSvgY(ad.pqSum.result[1])"
                      stroke="#8a6a5a" stroke-width="0.8" stroke-dasharray="3 2" />
              }
              <circle [attr.cx]="toSvgX(ad.pqSum.result[0])"
                      [attr.cy]="toSvgY(ad.pqSum.result[1])"
                      r="5" fill="#9a7a6a" stroke="#fff" stroke-width="1.2" />
              <text [attr.x]="toSvgX(ad.pqSum.result[0]) + 10"
                    [attr.y]="toSvgY(ad.pqSum.result[1]) - 8"
                    class="pt-label-sm" fill="#9a7a6a">S1=P+Q</text>
            }
            @if (ad.qrSum.result) {
              @if (ad.qrSum.rPrime) {
                <line [attr.x1]="toSvgX(ad.qrSum.rPrime[0])"
                      [attr.y1]="toSvgY(ad.qrSum.rPrime[1])"
                      [attr.x2]="toSvgX(ad.qrSum.result[0])"
                      [attr.y2]="toSvgY(ad.qrSum.result[1])"
                      stroke="#5a6a8a" stroke-width="0.8" stroke-dasharray="3 2" />
              }
              <circle [attr.cx]="toSvgX(ad.qrSum.result[0])"
                      [attr.cy]="toSvgY(ad.qrSum.result[1])"
                      r="5" fill="#6a7a9a" stroke="#fff" stroke-width="1.2" />
              <text [attr.x]="toSvgX(ad.qrSum.result[0]) + 10"
                    [attr.y]="toSvgY(ad.qrSum.result[1]) - 8"
                    class="pt-label-sm" fill="#6a7a9a">S2=Q+R</text>
            }
          }

          <!-- Step 3: Final sums T1 = (P+Q)+R and T2 = P+(Q+R) -->
          @if (assocStep() >= 3) {
            <!-- Left: S1 + R line -->
            @if (ad.leftFinal && ad.leftFinal.slope !== null && ad.pqSum.result) {
              <line [attr.x1]="toSvgX(v.xRange[0] - 1)"
                    [attr.y1]="toSvgY(ad.pqSum.result[1] + ad.leftFinal.slope! * (v.xRange[0] - 1 - ad.pqSum.result[0]))"
                    [attr.x2]="toSvgX(v.xRange[1] + 1)"
                    [attr.y2]="toSvgY(ad.pqSum.result[1] + ad.leftFinal.slope! * (v.xRange[1] + 1 - ad.pqSum.result[0]))"
                    stroke="#9a7a6a" stroke-width="1" stroke-dasharray="4 3"
                    stroke-linecap="round" opacity="0.7" />
            }
            <!-- Right: P + S2 line -->
            @if (ad.rightFinal && ad.rightFinal.slope !== null && ad.qrSum.result) {
              <line [attr.x1]="toSvgX(v.xRange[0] - 1)"
                    [attr.y1]="toSvgY(ad.P[1] + ad.rightFinal.slope! * (v.xRange[0] - 1 - ad.P[0]))"
                    [attr.x2]="toSvgX(v.xRange[1] + 1)"
                    [attr.y2]="toSvgY(ad.P[1] + ad.rightFinal.slope! * (v.xRange[1] + 1 - ad.P[0]))"
                    stroke="#6a7a9a" stroke-width="1" stroke-dasharray="4 3"
                    stroke-linecap="round" opacity="0.7" />
            }

            <!-- T1 = (P+Q)+R -->
            @if (ad.leftFinal && ad.leftFinal.result) {
              @if (ad.leftFinal.rPrime) {
                <line [attr.x1]="toSvgX(ad.leftFinal.rPrime[0])"
                      [attr.y1]="toSvgY(ad.leftFinal.rPrime[1])"
                      [attr.x2]="toSvgX(ad.leftFinal.result[0])"
                      [attr.y2]="toSvgY(ad.leftFinal.result[1])"
                      stroke="#9a7a6a" stroke-width="0.8" stroke-dasharray="3 2" />
              }
              <circle [attr.cx]="toSvgX(ad.leftFinal.result[0])"
                      [attr.cy]="toSvgY(ad.leftFinal.result[1])"
                      r="8" fill="none" stroke="#9a7a6a" stroke-width="2.2" />
              <text [attr.x]="toSvgX(ad.leftFinal.result[0]) - 50"
                    [attr.y]="toSvgY(ad.leftFinal.result[1]) - 14"
                    class="pt-label-sm" fill="#9a7a6a">T1=(P+Q)+R</text>
            }

            <!-- T2 = P+(Q+R) -->
            @if (ad.rightFinal && ad.rightFinal.result) {
              @if (ad.rightFinal.rPrime) {
                <line [attr.x1]="toSvgX(ad.rightFinal.rPrime[0])"
                      [attr.y1]="toSvgY(ad.rightFinal.rPrime[1])"
                      [attr.x2]="toSvgX(ad.rightFinal.result[0])"
                      [attr.y2]="toSvgY(ad.rightFinal.result[1])"
                      stroke="#6a7a9a" stroke-width="0.8" stroke-dasharray="3 2" />
              }
              <circle [attr.cx]="toSvgX(ad.rightFinal.result[0])"
                      [attr.cy]="toSvgY(ad.rightFinal.result[1])"
                      r="11" fill="none" stroke="#6a7a9a" stroke-width="1.8"
                      stroke-dasharray="4 2" />
              <text [attr.x]="toSvgX(ad.rightFinal.result[0]) + 16"
                    [attr.y]="toSvgY(ad.rightFinal.result[1]) + 5"
                    class="pt-label-sm" fill="#6a7a9a">T2=P+(Q+R)</text>
            }

            <!-- Equality marker -->
            @if (ad.leftFinal?.result && ad.rightFinal?.result) {
              <text [attr.x]="toSvgX(ad.leftFinal!.result![0])"
                    [attr.y]="toSvgY(ad.leftFinal!.result![1]) + 28"
                    text-anchor="middle" class="eq-label">=</text>
            }
          }
        </svg>

        <!-- Info cards for associativity -->
        <div class="info-row">
          <div class="info-card mono-card warm-card">
            <div class="ic-title">左路徑 (P+Q)+R</div>
            <div class="ic-val">{{ leftResultStr }}</div>
          </div>
          <div class="info-card mono-card cool-card">
            <div class="ic-title">右路徑 P+(Q+R)</div>
            <div class="ic-val">{{ rightResultStr }}</div>
          </div>
          @if (assocStep() >= 3) {
            <div class="info-card badge-card">
              <span class="badge ok-badge">結合律成立</span>
            </div>
          }
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        結合律是橢圓曲線群結構最深的性質。它的證明需要 Riemann-Roch 定理——代數幾何的核心工具。
        有了群結構，我們就能在橢圓曲線上做「算術」：整數倍、有理點的生成、以及密碼學應用。
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
    .step-btns {
      display: flex; gap: 6px; margin-bottom: 8px; align-items: center;
    }
    .step-btn {
      padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .reset-btn {
      padding: 4px 12px; border-radius: 5px; border: 1px solid var(--border);
      background: var(--bg); color: var(--text-muted); font-size: 11px;
      cursor: pointer; font-family: 'JetBrains Mono', monospace;
      margin-left: auto;
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
    .pt-label-sm {
      font-size: 10px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .inf-label {
      font-size: 14px; font-weight: 700; fill: #8a5a7a;
      font-family: 'JetBrains Mono', monospace;
    }
    .eq-label {
      font-size: 20px; font-weight: 900; fill: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
    .info-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 120px; padding: 10px 12px;
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
    .warm-card { border-left: 3px solid #9a7a6a; }
    .cool-card { border-left: 3px solid #6a7a9a; }
    .badge-card { display: flex; align-items: center; justify-content: center; }
    .badge {
      padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .inf-badge {
      background: rgba(138,90,122,0.12); color: #8a5a7a;
      border: 1px solid rgba(138,90,122,0.3);
    }
    .ok-badge {
      background: rgba(90,138,90,0.12); color: #5a8a5a;
      border: 1px solid rgba(90,138,90,0.3);
    }
  `,
})
export class StepEcIdentityComponent {
  readonly formulaIdentity = `P + O = O + P = P`;
  readonly formulaInverse = `-(x, y) = (x, -y), \\qquad P + (-P) = O`;

  readonly v: PlotView = {
    xRange: [-2.5, 3.5], yRange: [-4, 4], svgW: 520, svgH: 480, pad: 30,
  };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  readonly curvePath = implicitCurve(
    ecF, this.v.xRange, this.v.yRange, this.toSvgX, this.toSvgY, 140,
  );

  readonly visMode = signal<VisMode>('inverse');
  readonly invP = signal<[number, number] | null>(null);
  readonly assocStep = signal(0);

  /* Pre-compute associativity data */
  readonly ad: AssocData = buildAssocData();

  readonly leftResultStr: string = this.ad.leftFinal?.result
    ? '(' + this.ad.leftFinal.result[0].toFixed(3) + ', ' + this.ad.leftFinal.result[1].toFixed(3) + ')'
    : 'O';

  readonly rightResultStr: string = this.ad.rightFinal?.result
    ? '(' + this.ad.rightFinal.result[0].toFixed(3) + ', ' + this.ad.rightFinal.result[1].toFixed(3) + ')'
    : 'O';

  setVisMode(m: VisMode): void {
    this.visMode.set(m);
    this.invP.set(null);
    this.assocStep.set(0);
  }

  onInvClick(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const ratioX = (ev.clientX - rect.left) / rect.width;
    const ratioY = (ev.clientY - rect.top) / rect.height;
    const svgX = ratioX * this.v.svgW;
    const svgY = ratioY * this.v.svgH;

    const mx = this.v.xRange[0] +
      ((svgX - this.v.pad) / (this.v.svgW - 2 * this.v.pad)) * (this.v.xRange[1] - this.v.xRange[0]);
    const my = this.v.yRange[0] +
      ((this.v.svgH - this.v.pad - svgY) / (this.v.svgH - 2 * this.v.pad)) * (this.v.yRange[1] - this.v.yRange[0]);

    const snapped = snapToCurve(mx, my, this.v.xRange);
    if (snapped) {
      this.invP.set(snapped);
    }
  }
}
