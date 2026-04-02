import { zAdd, zMul, zNeg, zInv } from '../ch6/ring-utils';

/** Build the full multiplication table for Z_p (p prime), excluding 0 row/col. */
export function mulTableNonZero(p: number): number[][] {
  return Array.from({ length: p - 1 }, (_, i) =>
    Array.from({ length: p - 1 }, (__, j) => zMul(i + 1, j + 1, p)),
  );
}

/** Check if a polynomial is irreducible over Z_p (brute force for small degree). */
export function isIrreducible(coeffs: number[], p: number): boolean {
  const deg = coeffs.length - 1;
  if (deg <= 0) return false;
  if (deg === 1) return true;
  // Try all possible factor pairs of lower degree
  // For degree 2: check if it has roots in Z_p
  if (deg === 2) {
    for (let x = 0; x < p; x++) {
      if (evalPoly(coeffs, x, p) === 0) return false;
    }
    return true;
  }
  // For degree 3: same - check for roots (if has root, not irreducible)
  if (deg === 3) {
    for (let x = 0; x < p; x++) {
      if (evalPoly(coeffs, x, p) === 0) return false;
    }
    // Degree 3 with no roots is irreducible over Z_p
    return true;
  }
  return true; // simplification for higher degrees
}

/** Evaluate polynomial at x in Z_p. coeffs[i] = coefficient of x^i. */
export function evalPoly(coeffs: number[], x: number, p: number): number {
  let result = 0;
  let power = 1;
  for (const c of coeffs) {
    result = zAdd(result, zMul(c, power, p), p);
    power = zMul(power, x, p);
  }
  return result;
}

/** Format polynomial for display. coeffs[i] = coefficient of x^i. */
export function formatPoly(coeffs: number[]): string {
  const terms: string[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0) continue;
    if (i === 0) terms.push(String(c));
    else if (i === 1) terms.push(c === 1 ? 'x' : `${c}x`);
    else terms.push(c === 1 ? `x^${i}` : `${c}x^${i}`);
  }
  return terms.length > 0 ? terms.join(' + ') : '0';
}

/** GF(p^n) element: polynomial mod an irreducible. Represented as coefficient array length n. */
export function gfMul(
  a: number[], b: number[], irred: number[], p: number,
): number[] {
  const n = irred.length - 1; // degree of irreducible
  // Multiply as polynomials
  const product = new Array(2 * n - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      product[i + j] = zAdd(product[i + j], zMul(a[i], b[j], p), p);
    }
  }
  // Reduce mod irreducible
  return polyMod(product, irred, p);
}

export function gfAdd(a: number[], b: number[], p: number): number[] {
  const len = Math.max(a.length, b.length);
  return Array.from({ length: len }, (_, i) =>
    zAdd(a[i] ?? 0, b[i] ?? 0, p),
  );
}

function polyMod(poly: number[], irred: number[], p: number): number[] {
  const n = irred.length - 1;
  const result = [...poly];
  for (let i = result.length - 1; i >= n; i--) {
    const coeff = result[i];
    if (coeff === 0) continue;
    for (let j = 0; j <= n; j++) {
      result[i - n + j] = zAdd(result[i - n + j], zMul(p - coeff, irred[j], p), p);
    }
  }
  return result.slice(0, n);
}

export { zAdd, zMul, zNeg, zInv };
