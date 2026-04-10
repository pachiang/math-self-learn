/**
 * Utilities for Real Analysis Ch4: Continuity.
 */

/** Bisection root finding with intermediate steps. */
export function bisectionRoot(
  f: (x: number) => number, a: number, b: number, maxSteps: number
): { a: number; b: number; mid: number; fMid: number }[] {
  const steps: { a: number; b: number; mid: number; fMid: number }[] = [];
  let lo = a, hi = b;
  for (let i = 0; i < maxSteps; i++) {
    const mid = (lo + hi) / 2;
    const fMid = f(mid);
    steps.push({ a: lo, b: hi, mid, fMid });
    if (Math.abs(fMid) < 1e-14) break;
    if (f(lo) * fMid < 0) hi = mid; else lo = mid;
  }
  return steps;
}

/**
 * Find a valid delta for the epsilon-delta definition.
 * For lim_{x→c} f(x) = L, find delta such that |x-c| < delta ⟹ |f(x)-L| < eps.
 */
export function findDelta(
  f: (x: number) => number, c: number, L: number, eps: number, maxSearch = 2, resolution = 0.001
): number {
  // Binary search for the largest delta that works
  let lo = 0, hi = maxSearch;
  for (let iter = 0; iter < 40; iter++) {
    const delta = (lo + hi) / 2;
    // Check if all x in (c-delta, c+delta) satisfy |f(x) - L| < eps
    let works = true;
    for (let x = c - delta; x <= c + delta; x += resolution) {
      if (Math.abs(x - c) < 1e-12) continue;
      if (Math.abs(f(x) - L) >= eps) { works = false; break; }
    }
    if (works) lo = delta; else hi = delta;
  }
  return lo;
}

/** Weierstrass nowhere-differentiable function: Σ aⁿ cos(bⁿ π x). */
export function weierstrass(x: number, terms: number, a = 0.5, b = 7): number {
  let s = 0;
  for (let n = 0; n < terms; n++) {
    s += Math.pow(a, n) * Math.cos(Math.pow(b, n) * Math.PI * x);
  }
  return s;
}

/** Evaluate a function on a grid for plotting. */
export function sampleFunction(
  f: (x: number) => number, xMin: number, xMax: number, steps: number
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const dx = (xMax - xMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const y = f(x);
    if (isFinite(y)) result.push({ x, y });
  }
  return result;
}
