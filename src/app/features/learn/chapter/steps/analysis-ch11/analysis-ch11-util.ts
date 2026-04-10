/**
 * Utilities for Real Analysis Ch11: Lp Spaces.
 */

/** Approximate Lp norm of a function on [lo, hi] via trapezoidal rule. */
export function lpNorm(
  f: (x: number) => number, p: number, lo: number, hi: number, steps = 400
): number {
  if (p >= 50) {
    // L∞ (essential supremum)
    let mx = 0;
    const dx = (hi - lo) / steps;
    for (let i = 0; i <= steps; i++) {
      const v = Math.abs(f(lo + i * dx));
      if (v > mx) mx = v;
    }
    return mx;
  }
  const dx = (hi - lo) / steps;
  let s = 0;
  for (let i = 0; i <= steps; i++) {
    const v = Math.abs(f(lo + i * dx));
    const w = (i === 0 || i === steps) ? 0.5 : 1;
    s += w * Math.pow(v, p) * dx;
  }
  return Math.pow(s, 1 / p);
}

/** Approximate L2 inner product <f, g> on [lo, hi]. */
export function l2Inner(
  f: (x: number) => number, g: (x: number) => number,
  lo: number, hi: number, steps = 400
): number {
  const dx = (hi - lo) / steps;
  let s = 0;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    const w = (i === 0 || i === steps) ? 0.5 : 1;
    s += w * f(x) * g(x) * dx;
  }
  return s;
}

/** Sample a function for plotting. */
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
