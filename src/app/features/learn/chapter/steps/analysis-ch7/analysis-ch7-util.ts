/**
 * Utilities for Real Analysis Ch7: Sequences and Series of Functions.
 */

/** Sample a function on [lo, hi]. */
export function sampleFn(f: (x: number) => number, lo: number, hi: number, steps = 300): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const dx = (hi - lo) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    const y = f(x);
    if (isFinite(y)) result.push({ x, y });
  }
  return result;
}

/** Sup norm ||f - g|| on a sampled grid. */
export function supNorm(
  f: (x: number) => number, g: (x: number) => number,
  lo: number, hi: number, steps = 500
): number {
  let mx = 0;
  const dx = (hi - lo) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    const diff = Math.abs(f(x) - g(x));
    if (isFinite(diff) && diff > mx) mx = diff;
  }
  return mx;
}

/** Weierstrass M-test helper: check if |fₙ(x)| ≤ Mₙ for all x in grid. */
export function checkMBound(
  fn: (x: number) => number, Mn: number,
  lo: number, hi: number, steps = 200
): boolean {
  const dx = (hi - lo) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    if (Math.abs(fn(x)) > Mn + 1e-10) return false;
  }
  return true;
}

/** Partial sum of a function series: S_N(x) = sum_{n=0}^{N} f_n(x). */
export function partialSumFn(
  termFn: (n: number, x: number) => number, N: number
): (x: number) => number {
  return (x: number) => {
    let s = 0;
    for (let n = 0; n <= N; n++) s += termFn(n, x);
    return s;
  };
}

/** Arzela-Ascoli: check equicontinuity on a sampled grid (heuristic). */
export function maxOscillation(
  f: (x: number) => number, lo: number, hi: number, delta: number, steps = 200
): number {
  let mx = 0;
  const dx = (hi - lo) / steps;
  for (let i = 0; i < steps; i++) {
    const x = lo + i * dx;
    const osc = Math.abs(f(x + delta) - f(x));
    if (isFinite(osc) && osc > mx) mx = osc;
  }
  return mx;
}
