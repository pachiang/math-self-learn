import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// RS demo over the reals: degree-2 polynomial evaluated at 5 points
const EVAL_POINTS = [1, 2, 3, 4, 5];

function polyEval(coeffs: number[], x: number): number {
  return coeffs.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
}

// Given 3+ points, fit a degree-2 polynomial via least-squares (for reconstruction demo)
function fitPoly2(xs: number[], ys: number[]): number[] {
  // Solve 3x3 normal equations for degree-2
  const n = xs.length;
  const S = [0, 0, 0, 0, 0]; // S[k] = sum(x^k)
  const T = [0, 0, 0]; // T[k] = sum(y * x^k)
  for (let i = 0; i < n; i++) {
    let xp = 1;
    for (let k = 0; k < 5; k++) { S[k] += xp; xp *= xs[i]; }
    T[0] += ys[i];
    T[1] += ys[i] * xs[i];
    T[2] += ys[i] * xs[i] * xs[i];
  }
  // Solve via Cramer's for 3x3
  const A = [[S[0], S[1], S[2]], [S[1], S[2], S[3]], [S[2], S[3], S[4]]];
  const det3 = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det3(A);
  if (Math.abs(D) < 1e-10) return [0, 0, 0];
  const rep = (col: number) => A.map((r, i) => r.map((v, j) => j === col ? T[i] : v));
  return [det3(rep(0)) / D, det3(rep(1)) / D, det3(rep(2)) / D];
}

@Component({
  selector: 'app-step-reed-solomon',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Reed-Solomon 碼" subtitle="§13.5">
      <p>
        漢明碼在 GF(2) 上逐<strong>位</strong>操作。<strong>Reed-Solomon 碼</strong>在
        GF(2ᵐ) 上逐<strong>符號</strong>操作——一個符號是 m 位。
      </p>
      <p>
        核心想法：一個 k−1 次多項式由 k 個點決定。如果我在 n > k 個點上求值，
        就得到 n 個符號。接收端只要收到任意 k 個正確符號就能重建多項式。
        所以最多可以「丟掉」n−k 個符號。
      </p>
      <p>
        這跟第八章有限域上的<strong>多項式算術</strong>直接對應。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="用整數多項式感受 RS 的核心想法：多項式插值">
      <div class="coeff-row">
        <span class="c-label">多項式 p(x) = a₀ + a₁x + a₂x²</span>
      </div>
      <div class="coeff-row">
        @for (c of coeffs(); track $index; let i = $index) {
          <div class="coeff-ctrl">
            <span class="cc-label">a{{ i }}</span>
            <input type="range" min="-3" max="5" step="0.5" [value]="c"
                   (input)="setCoeff(i, $event)" class="cc-slider" />
            <span class="cc-val">{{ c }}</span>
          </div>
        }
      </div>

      <div class="viz-area">
        <svg viewBox="-10 -50 320 200" class="rs-svg">
          <!-- Grid -->
          <line x1="0" y1="120" x2="300" y2="120" stroke="var(--border)" stroke-width="0.5" />
          @for (pt of evalPoints; track pt) {
            <line [attr.x1]="xToSvg(pt)" y1="0" [attr.x2]="xToSvg(pt)" y2="140"
                  stroke="var(--border)" stroke-width="0.3" stroke-dasharray="3 3" />
          }

          <!-- Polynomial curve -->
          <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

          <!-- Reconstructed curve (if corrupted) -->
          @if (corruptIdx() !== null) {
            <path [attr.d]="reconPath()" fill="none" stroke="#5a8a5a" stroke-width="1.5"
                  stroke-dasharray="5 3" />
          }

          <!-- Evaluation points -->
          @for (pt of evalData(); track pt.x; let i = $index) {
            <circle [attr.cx]="xToSvg(pt.x)" [attr.cy]="yToSvg(pt.y)"
                    r="6" [attr.fill]="corruptIdx() === i ? '#a05a5a' : 'var(--accent)'"
                    stroke="white" stroke-width="1.5" cursor="pointer"
                    (click)="toggleCorrupt(i)" />
            <text [attr.x]="xToSvg(pt.x)" [attr.y]="yToSvg(pt.y) - 10"
                  class="pt-label">{{ pt.yDisplay }}</text>
          }

          <!-- Corrupted point -->
          @if (corruptIdx() !== null) {
            <circle [attr.cx]="xToSvg(evalData()[corruptIdx()!].x)"
                    [attr.cy]="yToSvg(corruptedY())"
                    r="6" fill="#a05a5a" stroke="white" stroke-width="1.5" />
            <line [attr.x1]="xToSvg(evalData()[corruptIdx()!].x)"
                  [attr.y1]="yToSvg(evalData()[corruptIdx()!].y)"
                  [attr.x2]="xToSvg(evalData()[corruptIdx()!].x)"
                  [attr.y2]="yToSvg(corruptedY())"
                  stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="3 3" />
          }
        </svg>
        @if (corruptIdx() !== null) {
          <div class="recon-note">
            綠色虛線 = 用剩餘 4 個正確點重建的多項式（仍然匹配原始！）
          </div>
        }
      </div>

      <div class="point-row">
        <span class="pr-label">5 個求值點（點一個來「損壞」）：</span>
        @for (pt of evalData(); track pt.x; let i = $index) {
          <span class="pr-pt" [class.bad]="corruptIdx() === i">
            p({{ pt.x }}) = {{ corruptIdx() === i ? '?' : pt.yDisplay }}
          </span>
        }
      </div>
    </app-challenge-card>

    <app-prose-block title="RS 碼的實際應用">
      <p>RS 碼無處不在：</p>
      <ul>
        <li><strong>QR code</strong>：RS(255,223) over GF(2⁸)。即使遮住 30%，還是能掃。</li>
        <li><strong>CD / DVD</strong>：Cross-Interleaved RS (CIRC) 處理刮痕造成的連續錯誤。</li>
        <li><strong>深太空通訊</strong>：NASA 的 Voyager、Mars rover 都用 RS + 卷積碼。</li>
        <li><strong>數位電視</strong>：DVB-T 標準用 RS(204,188)。</li>
      </ul>
    </app-prose-block>

    <app-prose-block title="專題總結">
      <p>
        這一章你看到了<strong>有限域</strong>（第八章）最重要的應用之一。
      </p>
      <ul>
        <li><strong>線性碼</strong>：碼字是 GF(2) 上的向量空間，用矩陣乘法編解碼</li>
        <li><strong>漢明碼</strong>：症狀 = 錯誤位置的二進位，巧妙的結構</li>
        <li><strong>Reed-Solomon</strong>：在 GF(2ᵐ) 上做多項式插值，能處理連續錯誤</li>
      </ul>
      <p>
        糾錯碼讓數位通訊成為可能——從太空深處到你手上的 QR code。
        每次你掃 QR code，背後都在做<strong>有限域上的多項式算術</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .coeff-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .c-label { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .coeff-ctrl { display: flex; align-items: center; gap: 6px; }
    .cc-label { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      min-width: 20px; }
    .cc-slider { width: 80px; accent-color: var(--accent); }
    .cc-val { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 28px; }

    .viz-area { margin-bottom: 12px; }
    .rs-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pt-label { font-size: 10px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .recon-note { font-size: 11px; color: #5a8a5a; text-align: center; margin-top: 6px;
      font-weight: 600; }

    .point-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
      padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .pr-label { font-size: 12px; color: var(--text-muted); }
    .pr-pt { padding: 3px 8px; border-radius: 4px; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; background: var(--accent-10);
      color: var(--text);
      &.bad { background: rgba(160, 90, 90, 0.15); color: #a05a5a; font-weight: 700; } }
  `,
})
export class StepReedSolomonComponent {
  readonly evalPoints = EVAL_POINTS;
  readonly coeffs = signal([1, 2, -0.5]);
  readonly corruptIdx = signal<number | null>(null);

  readonly evalData = computed(() =>
    EVAL_POINTS.map((x) => ({
      x,
      y: polyEval(this.coeffs(), x),
      yDisplay: polyEval(this.coeffs(), x).toFixed(1),
    })),
  );

  readonly corruptedY = computed(() => {
    const idx = this.corruptIdx();
    if (idx === null) return 0;
    return this.evalData()[idx].y + 8; // shift by fixed offset
  });

  // Reconstruct using the 4 uncorrupted points
  private readonly reconCoeffs = computed(() => {
    const idx = this.corruptIdx();
    if (idx === null) return this.coeffs();
    const xs: number[] = [], ys: number[] = [];
    this.evalData().forEach((pt, i) => {
      if (i !== idx) { xs.push(pt.x); ys.push(pt.y); }
    });
    return fitPoly2(xs, ys);
  });

  curvePath(): string {
    const c = this.coeffs();
    const pts: string[] = [];
    for (let x = 0.5; x <= 5.5; x += 0.1) {
      const y = polyEval(c, x);
      pts.push(`${this.xToSvg(x)},${this.yToSvg(y)}`);
    }
    return 'M' + pts.join('L');
  }

  reconPath(): string {
    const c = this.reconCoeffs();
    const pts: string[] = [];
    for (let x = 0.5; x <= 5.5; x += 0.1) {
      const y = polyEval(c, x);
      pts.push(`${this.xToSvg(x)},${this.yToSvg(y)}`);
    }
    return 'M' + pts.join('L');
  }

  xToSvg(x: number): number { return (x - 0.5) * 60; }
  yToSvg(y: number): number { return 120 - y * 6; }

  setCoeff(i: number, ev: Event): void {
    const next = [...this.coeffs()];
    next[i] = +(ev.target as HTMLInputElement).value;
    this.coeffs.set(next);
    this.corruptIdx.set(null);
  }

  toggleCorrupt(i: number): void {
    this.corruptIdx.set(this.corruptIdx() === i ? null : i);
  }
}
