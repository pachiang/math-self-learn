import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; }

// True function: f(x) = 0.4 sin(1.5x) - 0.2 x. Plus noise.
function trueFunction(x: number): number {
  return 0.4 * Math.sin(1.5 * x) - 0.2 * x;
}

function makeDataPoints(seed: number, n: number = 10): Pt[] {
  // Deterministic pseudo-random
  let s = seed | 0;
  const rand = (): number => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff) - 0.5;
  };
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = -3.5 + (i + 0.5 + rand() * 0.4) * 7 / n;
    const noise = rand() * 0.3;
    pts.push({ x, y: trueFunction(x) + noise });
  }
  return pts;
}

/** Solve normal equations Aᵀ A x = Aᵀ b for general matrix A using Gauss elimination. */
function solveNormal(A: number[][], b: number[]): number[] {
  const n = A[0].length;
  const m = A.length;
  // ATA (n×n) and ATb (n)
  const ATA: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const ATb: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < m; k++) s += A[k][i] * A[k][j];
      ATA[i][j] = s;
    }
    let s = 0;
    for (let k = 0; k < m; k++) s += A[k][i] * b[k];
    ATb[i] = s;
  }
  // Solve via Gauss elimination
  return gauss(ATA, ATb);
}

function gauss(M: number[][], b: number[]): number[] {
  const n = M.length;
  const A = M.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    if (Math.abs(A[i][i]) < 1e-12) continue;
    for (let k = i + 1; k < n; k++) {
      const f = A[k][i] / A[i][i];
      for (let j = i; j <= n; j++) A[k][j] -= f * A[i][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = A[i][n];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = Math.abs(A[i][i]) < 1e-12 ? 0 : s / A[i][i];
  }
  return x;
}

@Component({
  selector: 'app-step-polynomial-fit',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u591A\u9805\u5F0F\u64EC\u5408\u8207\u904E\u64EC\u5408" subtitle="\u00A713.2">
      <p>
        \u5982\u679C\u8CC7\u6599\u4E0D\u662F\u76F4\u7DDA\uFF0C\u4F60\u53EF\u4EE5\u4F7F\u7528\u591A\u9805\u5F0F\uFF1A
      </p>
      <p class="formula">y = a\u2080 + a\u2081 x + a\u2082 x\u00B2 + ... + a_d x^d</p>
      <p>
        \u9019\u4ECD\u662F\u4E00\u500B\u300C\u7DDA\u6027\u300D\u554F\u984C \u2014 \u300C\u7DDA\u6027\u300D\u662F\u6307\u5C0D<strong>\u4FC2\u6578\u300C a\u1D62 \u300D\u300D</strong>\u800C\u8A00\u3002
        \u5B83\u53EF\u4EE5\u5BEB\u6210 Ax = b\uFF0C\u5176\u4E2D A \u662F\u6709\u540D\u7684 <strong>Vandermonde \u77E9\u9663</strong>\uFF1A
      </p>
      <p class="formula">A = [[1, x\u2081, x\u2081\u00B2, ..., x\u2081^d], [1, x\u2082, x\u2082\u00B2, ...], ...]</p>
      <p>
        \u9019\u8DDF \u00A713.1 \u4E00\u6A23 \u2014 \u8DD1\u6700\u5C0F\u5E73\u65B9\u3001\u89E3\u6B63\u898F\u65B9\u7A0B Aᵀ Ax = Aᵀ b\uFF0C\u4F60\u5C31\u5F97\u5230\u6700\u4F73\u591A\u9805\u5F0F\u3002
      </p>
      <p>
        \u4F46\u9019\u88E1\u6709\u500B\u9677\u9631\u3002\u4F60\u5982\u679C\u8B93 d \u592A\u5927\uFF0C\u591A\u9805\u5F0F\u80FD\u5B8C\u7F8E\u7A7F\u904E\u6BCF\u500B\u8CC7\u6599\u9EDE\u2014\u70BA\u4EC0\u9EBC\u9019\u4E0D\u597D\uFF1F
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 d \u6ED1\u6876\u770B\u7B49\u968E\u591A\u9805\u5F0F\u600E\u9EBC\u5728\u300C\u9069\u5408\u300D\u8DDF\u300C\u904E\u64EC\u5408\u300D\u4E4B\u9593\u53C3\u52D5">
      <div class="grid-wrap">
        <svg viewBox="-150 -130 300 260" class="reg-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-120" [attr.y1]="g" [attr.x2]="120" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-130" y1="0" x2="130" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- True function (faint reference) -->
          <path [attr.d]="truePath" fill="none" stroke="var(--text-muted)" stroke-width="1.5"
            stroke-dasharray="3 3" opacity="0.6" />

          <!-- Fitted polynomial -->
          <path [attr.d]="fitPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

          <!-- Data points -->
          @for (p of points; track $index) {
            <circle [attr.cx]="p.x * 25" [attr.cy]="-p.y * 25" r="5"
              fill="var(--v1)" stroke="white" stroke-width="2" />
          }
        </svg>
      </div>

      <div class="d-row">
        <span class="d-lab">\u968E\u6578 d =</span>
        <input type="range" min="0" max="14" step="1" [value]="degree()"
          (input)="degree.set(+$any($event).target.value)" />
        <span class="d-val">{{ degree() }}</span>
      </div>

      <div class="presets">
        <button class="pst" (click)="degree.set(1)">\u7DDA\u6027 (d=1)</button>
        <button class="pst" (click)="degree.set(3)">\u4E09\u6B21 (d=3)</button>
        <button class="pst" (click)="degree.set(5)">\u4E94\u6B21 (d=5)</button>
        <button class="pst" (click)="degree.set(9)">\u4E5D\u6B21 (d=9)</button>
        <button class="pst" (click)="degree.set(14)">\u4E5D\u6B21 \u00D7 \u904E\u64EC\u5408</button>
      </div>

      <div class="info" [class.under]="degree() < 3" [class.good]="degree() >= 3 && degree() <= 5"
        [class.over]="degree() > 7">
        <div class="info-row">
          <span class="il">\u8A13\u7DF4\u8AA4\u5DEE</span>
          <span class="iv">\u03A3 (y\u1D62 \u2212 \u0177\u1D62)\u00B2 = <strong>{{ trainErr().toFixed(4) }}</strong></span>
        </div>
        <div class="info-row">
          <span class="il">\u72C0\u614B</span>
          <span class="iv plain">
            @if (degree() < 3) { \u6B20\u64EC\u5408\uFF1A\u591A\u9805\u5F0F\u592A\u7C21\u55AE\uFF0C\u62FF\u4E0D\u4F4F\u8CC7\u6599\u7684\u8D70\u52E2 }
            @else if (degree() <= 5) { \u9069\u5408\uFF1A\u8DDF\u771F\u5BE6\u51FD\u6578\uFF08\u865B\u7DDA\uFF09\u63A5\u8FD1 }
            @else if (degree() <= 8) { \u958B\u59CB\u904E\u64EC\u5408\uFF1A\u66F2\u7DDA\u6691\u73FE\u300C\u53CD\u63D2\u300D\u6F22 }
            @else { \u4E25\u91CD\u904E\u64EC\u5408\uFF1A\u66F2\u7DDA\u6298\u660E\u660E\u8DDF\u8CC7\u6599\u8D70\u52E2\u7121\u95DC }
          </span>
        </div>
      </div>

      <div class="key-insight">
        \u26A1 d=14 \u6642\u8AA4\u5DEE\u53EF\u80FD\u8DD1\u5230\u5F88\u5C0F\uFF0C\u4F46\u66F2\u7DDA\u9023\u300C\u8CC7\u6599\u9019\u4E9B\u9EDE\u4E4B\u5916\u300D\u90FD\u80A1\u4E0D\u8D77 \u2014
        \u9019\u5C31\u662F\u300C<strong>\u904E\u64EC\u5408</strong>\u300D\u3002
        \u8AA4\u5DEE\u8B8A\u5C0F\u4E0D\u4EE3\u8868\u6A21\u578B\u8B8A\u597D\uFF0C\u4ED6\u53EA\u662F\u300C\u80CC\u300D\u4E86\u8CC7\u6599\u3002
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u70BA\u4EC0\u9EBC\u904E\u64EC\u5408\u4F1A\u767C\u751F\uFF1F\u56E0\u70BA d \u6B21\u591A\u9805\u5F0F\u6709 d+1 \u500B\u4FC2\u6578\u3002\u7576 d+1 \u63A5\u8FD1\u6216\u8D85\u904E\u8CC7\u6599\u9EDE\u6578\u91CF\u6642\uFF0C
        \u6A21\u578B\u300C\u81EA\u7531\u5EA6\u592A\u591A\u300D\uFF0C\u7AE0\u67E5\u8B70\u90FD\u80FD\u63B0\u3002
      </p>
      <p>
        \u9019\u8DDF Ch5 \u7684\u300C\u79E9\u300D\u7684\u6982\u5FF5\u6709\u95DC\u4FC2\u3002\u4F60\u7684 Vandermonde \u77E9\u9663\u662F N\u00D7(d+1)\u3002\u7576 d+1 > N \u6642\uFF0C\u8CC7\u6599\u4E0D\u8DB3\u4EE5\u9650\u5236\u4FC2\u6578\uFF0C\u6709<strong>\u7121\u7AAE\u591A\u500B\u300C\u5B8C\u7F8E\u300D\u89E3</strong>\u3002
      </p>
      <p>
        \u9019\u500B\u554F\u984C\u600E\u9EBC\u8FA6\uFF1F\u6700\u7C21\u55AE\u7684\u624B\u6CD5\u53EB\u300C<strong>\u6B63\u5247\u5316</strong>\u300D\uFF1A\u52A0\u4E00\u500B\u8655\u7F70\u9805\u9F13\u52F5\u300C\u4FC2\u6578\u8B8A\u5C0F\u300D\u3002\u4E0B\u4E00\u7BC0\u898B\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.7; }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .reg-svg { width: 100%; max-width: 380px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }

    .d-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 10px; }
    .d-lab { font-size: 13px; font-weight: 700; color: var(--accent); }
    .d-row input { flex: 1; accent-color: var(--accent); }
    .d-val { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      min-width: 28px; text-align: right; }

    .presets { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pst { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px;
      &.under { border-color: rgba(212, 161, 75, 0.4); }
      &.good { border-color: rgba(90, 138, 90, 0.4); }
      &.over { border-color: rgba(160, 90, 90, 0.4); } }
    .info-row { display: grid; grid-template-columns: 90px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.plain { font-family: inherit; } }
    .iv strong { color: var(--accent); font-size: 13px; }

    .key-insight { padding: 12px 16px; border-radius: 8px;
      background: rgba(160, 90, 90, 0.06); border: 1px dashed rgba(160, 90, 90, 0.3);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: #a05a5a; } }
  `,
})
export class StepPolynomialFitComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly points = makeDataPoints(42, 10);

  readonly degree = signal(3);

  readonly truePath = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = -4.5 + (i / 100) * 9;
      const y = trueFunction(x);
      const sx = x * 25;
      const sy = -Math.max(-110, Math.min(110, y * 25));
      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  })();

  // Fit polynomial of given degree using normal equations
  readonly coeffs = computed(() => {
    const d = this.degree();
    const n = this.points.length;
    // Vandermonde matrix N × (d+1)
    const A: number[][] = [];
    const b: number[] = [];
    for (const p of this.points) {
      const row: number[] = [];
      for (let k = 0; k <= d; k++) row.push(Math.pow(p.x, k));
      A.push(row);
      b.push(p.y);
    }
    // Add tiny regularisation for numerical stability at high d
    const lambda = d >= 10 ? 1e-8 : 0;
    if (lambda > 0) {
      // Augment ATA with λI by hand inside solveNormal — easier: just solve normally
      // For safety we leave it at 0; gauss handles ill-conditioned cases via partial pivot
    }
    return solveNormal(A, b);
  });

  readonly fitPath = computed(() => {
    const c = this.coeffs();
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = -4.5 + (i / 200) * 9;
      let y = 0;
      let xk = 1;
      for (const ci of c) {
        y += ci * xk;
        xk *= x;
      }
      const sx = x * 25;
      const sy = -Math.max(-130, Math.min(130, y * 25));
      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  });

  readonly trainErr = computed(() => {
    const c = this.coeffs();
    let s = 0;
    for (const p of this.points) {
      let yhat = 0;
      let xk = 1;
      for (const ci of c) {
        yhat += ci * xk;
        xk *= p.x;
      }
      s += (p.y - yhat) ** 2;
    }
    return s;
  });
}
