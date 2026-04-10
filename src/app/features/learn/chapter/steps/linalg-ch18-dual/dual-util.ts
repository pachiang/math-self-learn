/**
 * Dual space utilities for Ch18.
 * Dual basis computation, level set geometry, annihilator.
 */

export type Mat = number[][];

export function zeros(r: number, c: number): Mat {
  return Array.from({ length: r }, () => new Array(c).fill(0));
}

export function identity(n: number): Mat {
  const I = zeros(n, n);
  for (let i = 0; i < n; i++) I[i][i] = 1;
  return I;
}

/** Invert a 2×2 matrix. Returns null if singular. */
export function invert2x2(M: Mat): Mat | null {
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  if (Math.abs(det) < 1e-12) return null;
  return [
    [M[1][1] / det, -M[0][1] / det],
    [-M[1][0] / det, M[0][0] / det],
  ];
}

/**
 * Given basis vectors as columns of P (2×2),
 * compute dual basis vectors (rows of P⁻¹).
 * Returns array of two row vectors.
 */
export function dualBasis2d(e1: number[], e2: number[]): number[][] | null {
  const P = [[e1[0], e2[0]], [e1[1], e2[1]]];
  const Pinv = invert2x2(P);
  if (!Pinv) return null;
  // Rows of P⁻¹ are the dual basis
  return [Pinv[0], Pinv[1]];
}

/**
 * Compute SVG path data for level lines of φ(x,y) = ax + by = c
 * within a bounding box [-R, R] × [-R, R].
 */
export function levelLinePath(a: number, b: number, c: number, R: number): string {
  // Line: ax + by = c → y = (c - ax)/b  or  x = (c - by)/a
  if (Math.abs(b) > Math.abs(a)) {
    const y1 = (c - a * (-R)) / b;
    const y2 = (c - a * R) / b;
    return `M${-R},${y1}L${R},${y2}`;
  } else if (Math.abs(a) > 1e-10) {
    const x1 = (c - b * (-R)) / a;
    const x2 = (c - b * R) / a;
    return `M${x1},${-R}L${x2},${R}`;
  }
  return '';
}

/** Apply a linear functional φ = [a, b] to vector v = [x, y]. */
export function applyFunctional(phi: number[], v: number[]): number {
  return phi.reduce((s, p, i) => s + p * v[i], 0);
}

/** Transpose of a matrix. */
export function transpose(A: Mat): Mat {
  const m = A.length, n = A[0].length;
  const T = zeros(n, m);
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) T[j][i] = A[i][j];
  return T;
}
