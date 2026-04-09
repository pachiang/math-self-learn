/**
 * Basic SVD utilities. Designed for small matrices (up to ~100x100) used by
 * the visualisation components in §8.4 (low-rank approximation) and
 * §8.5 (image compression).
 *
 * Approach: A = U Σ V^T computed via the symmetric eigendecomposition of A^T A
 * using cyclic Jacobi rotations.
 */

type Mat = number[][];

function zeros(rows: number, cols: number): Mat {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

function transpose(A: Mat): Mat {
  const m = A.length;
  const n = A[0].length;
  const T = zeros(n, m);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) T[j][i] = A[i][j];
  }
  return T;
}

function multiply(A: Mat, B: Mat): Mat {
  const m = A.length;
  const n = B[0].length;
  const k = B.length;
  const C = zeros(m, n);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let l = 0; l < k; l++) s += A[i][l] * B[l][j];
      C[i][j] = s;
    }
  }
  return C;
}

/**
 * Cyclic Jacobi eigendecomposition for symmetric matrices.
 * Returns { values, vectors } such that A = vectors · diag(values) · vectors^T.
 * vectors is an orthogonal matrix; values is in NO particular order.
 */
function jacobiEigen(A: Mat, maxSweeps = 50, tol = 1e-10): { values: number[]; vectors: Mat } {
  const n = A.length;
  // Work on a copy
  const M = A.map((row) => row.slice());
  // Vectors start as identity
  const V = zeros(n, n);
  for (let i = 0; i < n; i++) V[i][i] = 1;

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        off += M[p][q] * M[p][q];
      }
    }
    if (off < tol) break;

    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = M[p][q];
        if (Math.abs(apq) < 1e-14) continue;
        const app = M[p][p];
        const aqq = M[q][q];
        const theta = (aqq - app) / (2 * apq);
        let t: number;
        if (Math.abs(theta) > 1e15) {
          t = 0.5 / theta;
        } else {
          t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(1 + theta * theta));
          if (theta === 0) t = 1;
        }
        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;

        // Update M
        M[p][p] = app - t * apq;
        M[q][q] = aqq + t * apq;
        M[p][q] = 0;
        M[q][p] = 0;
        for (let i = 0; i < n; i++) {
          if (i !== p && i !== q) {
            const aip = M[i][p];
            const aiq = M[i][q];
            M[i][p] = c * aip - s * aiq;
            M[p][i] = M[i][p];
            M[i][q] = s * aip + c * aiq;
            M[q][i] = M[i][q];
          }
        }
        // Update V
        for (let i = 0; i < n; i++) {
          const vip = V[i][p];
          const viq = V[i][q];
          V[i][p] = c * vip - s * viq;
          V[i][q] = s * vip + c * viq;
        }
      }
    }
  }

  const values: number[] = [];
  for (let i = 0; i < n; i++) values.push(M[i][i]);
  return { values, vectors: V };
}

export interface SVDResult {
  /** Left singular vectors as columns of an m×m orthogonal matrix. */
  U: Mat;
  /** Singular values in descending order, length min(m, n). */
  S: number[];
  /** Right singular vectors as columns of an n×n orthogonal matrix. */
  V: Mat;
}

/**
 * Compute the (full) SVD of an m×n matrix A using the eigendecomposition of
 * A^T A. Output: A = U · diag(S) · V^T.
 */
export function svd(A: Mat): SVDResult {
  const m = A.length;
  const n = A[0].length;

  // For numerical stability, work on the smaller side: if m < n, compute eigen
  // of A·A^T (gives U directly), then derive V. Otherwise eigen of A^T·A.
  if (m < n) {
    const AAT = multiply(A, transpose(A)); // m×m
    const { values, vectors } = jacobiEigen(AAT);

    // Sort by descending eigenvalue (=σ²)
    const order = values
      .map((v, i) => ({ v, i }))
      .sort((a, b) => b.v - a.v)
      .map((x) => x.i);

    const U = zeros(m, m);
    const S: number[] = [];
    for (let k = 0; k < m; k++) {
      const idx = order[k];
      const lam = Math.max(0, values[idx]);
      S.push(Math.sqrt(lam));
      for (let i = 0; i < m; i++) U[i][k] = vectors[i][idx];
    }
    // Compute V columns: v_k = A^T u_k / σ_k
    const V = zeros(n, n);
    const r = Math.min(m, n);
    for (let k = 0; k < r; k++) {
      if (S[k] < 1e-12) continue;
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let i = 0; i < m; i++) s += A[i][j] * U[i][k];
        V[j][k] = s / S[k];
      }
    }
    return { U, S, V };
  } else {
    const ATA = multiply(transpose(A), A); // n×n
    const { values, vectors } = jacobiEigen(ATA);

    const order = values
      .map((v, i) => ({ v, i }))
      .sort((a, b) => b.v - a.v)
      .map((x) => x.i);

    const V = zeros(n, n);
    const S: number[] = [];
    for (let k = 0; k < n; k++) {
      const idx = order[k];
      const lam = Math.max(0, values[idx]);
      S.push(Math.sqrt(lam));
      for (let i = 0; i < n; i++) V[i][k] = vectors[i][idx];
    }
    // Compute U columns: u_k = A v_k / σ_k
    const U = zeros(m, m);
    const r = Math.min(m, n);
    for (let k = 0; k < r; k++) {
      if (S[k] < 1e-12) continue;
      for (let i = 0; i < m; i++) {
        let s = 0;
        for (let j = 0; j < n; j++) s += A[i][j] * V[j][k];
        U[i][k] = s / S[k];
      }
    }
    // Pad U with arbitrary orthonormal vectors if m > r (left null space basis)
    // For visualisation we don't need them.
    return { U, S, V };
  }
}

/** Reconstruct A from its SVD using only the top-k singular values. */
export function reconstructLowRank(svdResult: SVDResult, k: number): Mat {
  const { U, S, V } = svdResult;
  const m = U.length;
  const n = V.length;
  const A = zeros(m, n);
  const kk = Math.min(k, S.length);
  for (let r = 0; r < kk; r++) {
    const sigma = S[r];
    if (sigma < 1e-12) continue;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        A[i][j] += sigma * U[i][r] * V[j][r];
      }
    }
  }
  return A;
}

/** Frobenius norm of a matrix. */
export function frobenius(A: Mat): number {
  let s = 0;
  for (const row of A) for (const v of row) s += v * v;
  return Math.sqrt(s);
}

/** Frobenius norm of (A − B). */
export function frobeniusError(A: Mat, B: Mat): number {
  let s = 0;
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0].length; j++) {
      const d = A[i][j] - B[i][j];
      s += d * d;
    }
  }
  return Math.sqrt(s);
}
