/**
 * Utilities for Real Analysis Ch9: Lebesgue Measure.
 */

/** Cantor set segments at iteration k. */
export function cantorSegments(k: number): [number, number][] {
  let segs: [number, number][] = [[0, 1]];
  for (let i = 0; i < k; i++) {
    const next: [number, number][] = [];
    for (const [a, b] of segs) {
      const third = (b - a) / 3;
      next.push([a, a + third], [b - third, b]);
    }
    segs = next;
  }
  return segs;
}

/** Total length of Cantor segments at iteration k. */
export function cantorTotalLength(k: number): number {
  return Math.pow(2 / 3, k);
}

/**
 * Cover a set of points with open intervals of total length ≤ epsilon.
 * Returns the intervals used.
 */
export function epsilonCover(
  points: number[], epsilon: number
): { center: number; halfWidth: number }[] {
  // Cover each point with an interval of width epsilon / 2^(n+1)
  return points.map((p, i) => ({
    center: p,
    halfWidth: epsilon / Math.pow(2, i + 2),
  }));
}

/** Generate first n rationals in [0,1] using Stern-Brocot enumeration. */
export function rationalsIn01(count: number): number[] {
  const rats: number[] = [];
  for (let q = 1; rats.length < count; q++) {
    for (let p = 0; p <= q && rats.length < count; p++) {
      const val = p / q;
      if (val >= 0 && val <= 1 && !rats.some((r) => Math.abs(r - val) < 1e-10)) {
        rats.push(val);
      }
    }
  }
  return rats.sort((a, b) => a - b);
}

/**
 * Outer measure approximation: cover a set with intervals,
 * compute total length.
 */
export function outerMeasureDemo(
  intervals: { lo: number; hi: number }[]
): number {
  return intervals.reduce((s, iv) => s + (iv.hi - iv.lo), 0);
}
