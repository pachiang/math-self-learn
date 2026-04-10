/**
 * Utilities for Real Analysis Ch10: Lebesgue Integration.
 */

/** Simple function: sum of aₖ * 1_{Eₖ}. Evaluate at x. */
export function simpleFunction(
  coeffs: number[],
  intervals: [number, number][],
  x: number
): number {
  for (let k = 0; k < coeffs.length; k++) {
    const [lo, hi] = intervals[k];
    if (x >= lo && x < hi) return coeffs[k];
  }
  return 0;
}

/** Integral of a simple function: Σ aₖ · m(Eₖ). */
export function simpleIntegral(coeffs: number[], intervals: [number, number][]): number {
  let s = 0;
  for (let k = 0; k < coeffs.length; k++) {
    s += coeffs[k] * (intervals[k][1] - intervals[k][0]);
  }
  return s;
}

/**
 * Approximate a non-negative function by a simple function
 * with n levels on [lo, hi].
 */
export function approximateBySimple(
  f: (x: number) => number, lo: number, hi: number, nLevels: number
): { coeffs: number[]; intervals: [number, number][] } {
  // Find max value
  let mx = 0;
  const steps = 200;
  const dx = (hi - lo) / steps;
  for (let i = 0; i <= steps; i++) {
    const v = f(lo + i * dx);
    if (isFinite(v) && v > mx) mx = v;
  }
  if (mx === 0) return { coeffs: [], intervals: [] };

  const levelHeight = mx / nLevels;
  const coeffs: number[] = [];
  const intervals: [number, number][] = [];

  // For each level k, find the set where f(x) >= k * levelHeight
  // Approximate as union of sub-intervals
  for (let k = 0; k < nLevels; k++) {
    const threshold = k * levelHeight;
    coeffs.push(levelHeight);
    // Find approximate measure of {x : f(x) > threshold}
    let segStart = -1;
    for (let i = 0; i <= steps; i++) {
      const x = lo + i * dx;
      const above = f(x) >= threshold;
      if (above && segStart < 0) segStart = x;
      if ((!above || i === steps) && segStart >= 0) {
        intervals.push([segStart, x]);
        segStart = -1;
        break; // simplify: one interval per level
      }
    }
    if (intervals.length <= k) intervals.push([lo, hi]); // fallback
  }
  return { coeffs, intervals };
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
