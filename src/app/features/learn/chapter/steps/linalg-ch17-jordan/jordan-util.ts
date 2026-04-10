/**
 * Jordan normal form utilities for Ch17.
 * Characteristic / minimal polynomial, Schur decomposition,
 * Jordan block powers & exponentials, generalized eigenvectors.
 */

export type Mat = number[][];
export type Complex = [number, number]; // [re, im]

// ─── Basic matrix ops ────────────────────────────────────────────

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

export function matAdd(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

export function matScale(A: Mat, s: number): Mat {
  return A.map((row) => row.map((v) => v * s));
}

export function matSub(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((v, j) => v - B[i][j]));
}

export function matCopy(A: Mat): Mat {
  return A.map((r) => r.slice());
}

export function vecNorm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

// ─── 2×2 eigenvalues (possibly complex) ──────────────────────────

export function eigen2x2(A: Mat): Complex[] {
  const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (disc >= 0) {
    const sq = Math.sqrt(disc);
    return [[(tr + sq) / 2, 0], [(tr - sq) / 2, 0]];
  } else {
    const sq = Math.sqrt(-disc);
    return [[tr / 2, sq / 2], [tr / 2, -sq / 2]];
  }
}

// ─── Characteristic polynomial (2×2 and 3×3) ────────────────────

/** Returns coefficients [c0, c1, ..., cn] of det(A - λI) = c0 + c1λ + ... */
export function charPoly2x2(A: Mat): number[] {
  const tr = A[0][0] + A[1][1];
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  return [det, -tr, 1]; // det - tr·λ + λ²
}

export function charPoly3x3(A: Mat): number[] {
  const a = A[0][0], b = A[0][1], c = A[0][2];
  const d = A[1][0], e = A[1][1], f = A[1][2];
  const g = A[2][0], h = A[2][1], k = A[2][2];
  const tr = a + e + k;
  const cofSum = (a * e - b * d) + (a * k - c * g) + (e * k - f * h);
  const det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
  return [-det, cofSum, -tr, 1]; // -det + cofSum·λ - tr·λ² + λ³
}

// ─── Evaluate polynomial at a matrix ─────────────────────────────

export function polyEvalMatrix(coeffs: number[], A: Mat): Mat {
  const n = A.length;
  let result = zeros(n, n);
  let power = identity(n);
  for (let i = 0; i < coeffs.length; i++) {
    result = matAdd(result, matScale(power, coeffs[i]));
    if (i < coeffs.length - 1) power = matMul(power, A);
  }
  return result;
}

// ─── Jordan block operations ─────────────────────────────────────

/** Create a Jordan block J_k(λ) */
export function jordanBlock(lambda: number, size: number): Mat {
  const J = zeros(size, size);
  for (let i = 0; i < size; i++) {
    J[i][i] = lambda;
    if (i < size - 1) J[i][i + 1] = 1;
  }
  return J;
}

/** J_k(λ)^n — uses binomial coefficients */
export function jordanBlockPower(lambda: number, size: number, n: number): Mat {
  const J = zeros(size, size);
  for (let i = 0; i < size; i++) {
    for (let j = i; j < size; j++) {
      const shift = j - i;
      // Entry = C(n, shift) * lambda^(n-shift)
      if (n < shift) continue;
      J[i][j] = binomial(n, shift) * Math.pow(lambda, n - shift);
    }
  }
  return J;
}

/** e^{J_k(λ)t} */
export function jordanBlockExp(lambda: number, size: number, t: number): Mat {
  const J = zeros(size, size);
  const elt = Math.exp(lambda * t);
  for (let i = 0; i < size; i++) {
    for (let j = i; j < size; j++) {
      const shift = j - i;
      J[i][j] = elt * Math.pow(t, shift) / factorial(shift);
    }
  }
  return J;
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) result = result * (n - i) / (i + 1);
  return result;
}

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

// ─── Kernel computation (for generalized eigenvectors) ───────────

/** Find basis of kernel of M using row reduction. Returns array of vectors. */
export function kernel(M: Mat): number[][] {
  const m = M.length, n = M[0].length;
  const R = matCopy(M);
  const pivotCols: number[] = [];

  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    // Find pivot
    let maxRow = row;
    for (let i = row + 1; i < m; i++) {
      if (Math.abs(R[i][col]) > Math.abs(R[maxRow][col])) maxRow = i;
    }
    if (Math.abs(R[maxRow][col]) < 1e-10) continue;
    [R[row], R[maxRow]] = [R[maxRow], R[row]];

    const scale = R[row][col];
    for (let j = 0; j < n; j++) R[row][j] /= scale;
    for (let i = 0; i < m; i++) {
      if (i !== row && Math.abs(R[i][col]) > 1e-12) {
        const f = R[i][col];
        for (let j = 0; j < n; j++) R[i][j] -= f * R[row][j];
      }
    }
    pivotCols.push(col);
    row++;
  }

  // Free columns
  const freeCols: number[] = [];
  for (let j = 0; j < n; j++) {
    if (!pivotCols.includes(j)) freeCols.push(j);
  }

  const result: number[][] = [];
  for (const fc of freeCols) {
    const v = new Array(n).fill(0);
    v[fc] = 1;
    for (let i = 0; i < pivotCols.length; i++) {
      v[pivotCols[i]] = -R[i][fc];
    }
    result.push(v);
  }
  return result;
}

/** Compute (A - λI)^k */
export function shiftPower(A: Mat, lambda: number, k: number): Mat {
  const n = A.length;
  const shifted = matSub(A, matScale(identity(n), lambda));
  let result = identity(n);
  for (let i = 0; i < k; i++) result = matMul(result, shifted);
  return result;
}
