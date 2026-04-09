/**
 * Numerical linear algebra utilities for Ch15.
 * IEEE-754 helpers, LU/QR factorisation, iterative solvers.
 */

export type Mat = number[][];

// ─── Basic matrix / vector helpers ───────────────────────────────

export function zeros(r: number, c: number): Mat {
  return Array.from({ length: r }, () => new Array(c).fill(0));
}

export function identity(n: number): Mat {
  const I = zeros(n, n);
  for (let i = 0; i < n; i++) I[i][i] = 1;
  return I;
}

export function matMul(A: Mat, B: Mat): Mat {
  const m = A.length, k = B.length, n = B[0].length;
  const C = zeros(m, n);
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let l = 0; l < k; l++) C[i][j] += A[i][l] * B[l][j];
  return C;
}

export function matVec(A: Mat, v: number[]): number[] {
  return A.map((row) => row.reduce((s, a, j) => s + a * v[j], 0));
}

export function vecSub(a: number[], b: number[]): number[] {
  return a.map((v, i) => v - b[i]);
}

export function vecAdd(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i]);
}

export function vecScale(a: number[], s: number): number[] {
  return a.map((v) => v * s);
}

export function vecDot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

export function vecNorm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

// ─── IEEE 754 ────────────────────────────────────────────────────

export interface IEEE754Bits {
  sign: number;
  exponent: string;   // 11-bit binary string
  mantissa: string;    // 52-bit binary string
  stored: number;      // the value JS actually stores
  error: number;       // |input - stored| (always 0 for exact representable)
}

export function toIEEE754(n: number): IEEE754Bits {
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setFloat64(0, n);
  const hi = dv.getUint32(0);
  const lo = dv.getUint32(4);
  const sign = (hi >>> 31) & 1;
  const exp = ((hi >>> 20) & 0x7FF).toString(2).padStart(11, '0');
  const mantHi = (hi & 0xFFFFF).toString(2).padStart(20, '0');
  const mantLo = lo.toString(2).padStart(32, '0');
  return { sign, exponent: exp, mantissa: mantHi + mantLo, stored: n, error: 0 };
}

/** Simulate limited-precision arithmetic (round to p significant decimal digits). */
export function roundSig(x: number, p: number): number {
  if (x === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(x)));
  const pow = Math.pow(10, p - d);
  return Math.round(x * pow) / pow;
}

// ─── LU Decomposition ───────────────────────────────────────────

export interface LUStep {
  desc: string;
  U: Mat;
  L: Mat;
  pivotRow?: number;
}

export interface LUResult {
  L: Mat;
  U: Mat;
  P: number[];          // permutation vector
  steps: LUStep[];
}

export function luDecompose(A: Mat, pivot = false): LUResult {
  const n = A.length;
  const U = A.map((r) => r.slice());
  const L = identity(n);
  const P = Array.from({ length: n }, (_, i) => i);
  const steps: LUStep[] = [{ desc: '初始矩陣', U: U.map((r) => r.slice()), L: L.map((r) => r.slice()) }];

  for (let col = 0; col < n - 1; col++) {
    // Partial pivoting
    if (pivot) {
      let maxVal = Math.abs(U[col][col]);
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(U[row][col]) > maxVal) {
          maxVal = Math.abs(U[row][col]);
          maxRow = row;
        }
      }
      if (maxRow !== col) {
        [U[col], U[maxRow]] = [U[maxRow], U[col]];
        [P[col], P[maxRow]] = [P[maxRow], P[col]];
        // Also swap L entries left of diagonal
        for (let j = 0; j < col; j++) {
          [L[col][j], L[maxRow][j]] = [L[maxRow][j], L[col][j]];
        }
        steps.push({
          desc: `交換列 ${col} 和列 ${maxRow}`,
          U: U.map((r) => r.slice()), L: L.map((r) => r.slice()),
          pivotRow: maxRow,
        });
      }
    }

    const pivotVal = U[col][col];
    if (Math.abs(pivotVal) < 1e-15) continue;

    for (let row = col + 1; row < n; row++) {
      const mult = U[row][col] / pivotVal;
      L[row][col] = mult;
      for (let j = col; j < n; j++) {
        U[row][j] -= mult * U[col][j];
      }
    }
    steps.push({
      desc: `消去第 ${col} 行下方`,
      U: U.map((r) => r.slice()), L: L.map((r) => r.slice()),
    });
  }

  return { L, U, P, steps };
}

/** Solve LU system given L, U (forward + back substitution). */
export function luSolve(L: Mat, U: Mat, b: number[]): number[] {
  const n = b.length;
  // Forward sub: Ly = b
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = b[i];
    for (let j = 0; j < i; j++) s -= L[i][j] * y[j];
    y[i] = s / L[i][i];
  }
  // Back sub: Ux = y
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let j = i + 1; j < n; j++) s -= U[i][j] * x[j];
    x[i] = s / (U[i][i] || 1e-15);
  }
  return x;
}

// ─── QR Decomposition (Gram-Schmidt) ─────────────────────────────

export interface QRStep {
  desc: string;
  qVecs: number[][];   // columns of Q built so far
  R: Mat;
}

export interface QRResult {
  Q: Mat;
  R: Mat;
  steps: QRStep[];
}

export function qrGramSchmidt(A: Mat): QRResult {
  const m = A.length;
  const n = A[0].length;
  const cols = n;
  const Q: number[][] = []; // columns as arrays
  const R = zeros(cols, cols);
  const steps: QRStep[] = [];

  for (let j = 0; j < cols; j++) {
    // Start with column j of A
    let v = A.map((row) => row[j]);

    // Subtract projections
    for (let i = 0; i < Q.length; i++) {
      const r = vecDot(Q[i], v);
      R[i][j] = r;
      v = vecSub(v, vecScale(Q[i], r));
    }

    const norm = vecNorm(v);
    R[j][j] = norm;
    const q = norm > 1e-12 ? vecScale(v, 1 / norm) : v;
    Q.push(q);

    steps.push({
      desc: j === 0
        ? `q₁ = a₁ / ‖a₁‖`
        : `a${j + 1} 減去在 q₁…q${j} 上的投影，正規化得 q${j + 1}`,
      qVecs: Q.map((c) => c.slice()),
      R: R.map((r) => r.slice()),
    });
  }

  // Build Q as m×n matrix
  const Qmat = zeros(m, cols);
  for (let j = 0; j < cols; j++)
    for (let i = 0; i < m; i++) Qmat[i][j] = Q[j][i];

  return { Q: Qmat, R, steps };
}

// ─── Iterative Solvers ───────────────────────────────────────────

export interface IterStep { x: number[]; resNorm: number; }

export function jacobiSolve(A: Mat, b: number[], x0: number[], maxIter: number): IterStep[] {
  const n = b.length;
  const steps: IterStep[] = [{ x: x0.slice(), resNorm: vecNorm(vecSub(b, matVec(A, x0))) }];
  let x = x0.slice();
  for (let iter = 0; iter < maxIter; iter++) {
    const xNew = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < n; j++) {
        if (j !== i) s -= A[i][j] * x[j];
      }
      xNew[i] = s / A[i][i];
    }
    x = xNew;
    steps.push({ x: x.slice(), resNorm: vecNorm(vecSub(b, matVec(A, x))) });
    if (steps[steps.length - 1].resNorm < 1e-10) break;
  }
  return steps;
}

export function gaussSeidelSolve(A: Mat, b: number[], x0: number[], maxIter: number): IterStep[] {
  const n = b.length;
  const steps: IterStep[] = [{ x: x0.slice(), resNorm: vecNorm(vecSub(b, matVec(A, x0))) }];
  const x = x0.slice();
  for (let iter = 0; iter < maxIter; iter++) {
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < n; j++) {
        if (j !== i) s -= A[i][j] * x[j];
      }
      x[i] = s / A[i][i];
    }
    steps.push({ x: x.slice(), resNorm: vecNorm(vecSub(b, matVec(A, x))) });
    if (steps[steps.length - 1].resNorm < 1e-10) break;
  }
  return steps;
}

// ─── Conjugate Gradient ──────────────────────────────────────────

export interface CGStep {
  x: number[];
  r: number[];
  d: number[];
  resNorm: number;
}

export function conjugateGradient(A: Mat, b: number[], x0: number[], maxIter: number): CGStep[] {
  let x = x0.slice();
  let r = vecSub(b, matVec(A, x));
  let d = r.slice();
  const steps: CGStep[] = [{ x: x.slice(), r: r.slice(), d: d.slice(), resNorm: vecNorm(r) }];

  for (let k = 0; k < maxIter; k++) {
    const Ad = matVec(A, d);
    const rr = vecDot(r, r);
    if (rr < 1e-20) break;
    const alpha = rr / vecDot(d, Ad);
    x = vecAdd(x, vecScale(d, alpha));
    const rNew = vecSub(r, vecScale(Ad, alpha));
    const beta = vecDot(rNew, rNew) / rr;
    d = vecAdd(rNew, vecScale(d, beta));
    r = rNew;
    steps.push({ x: x.slice(), r: r.slice(), d: d.slice(), resNorm: vecNorm(r) });
    if (vecNorm(r) < 1e-10) break;
  }
  return steps;
}
