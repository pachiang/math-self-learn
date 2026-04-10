/**
 * Utilities for Real Analysis Ch1: Completeness of the Reals.
 */

/** Best rational approximation to x with denominator ≤ maxDenom. */
export function rationalApprox(x: number, maxDenom: number): [number, number] {
  let bestP = Math.round(x), bestQ = 1, bestErr = Math.abs(x - bestP);
  for (let q = 2; q <= maxDenom; q++) {
    const p = Math.round(x * q);
    const err = Math.abs(x - p / q);
    if (err < bestErr) { bestP = p; bestQ = q; bestErr = err; }
  }
  return [bestP, bestQ];
}

/** Long division: compute decimal expansion of p/q. */
export function longDivision(p: number, q: number, maxDigits = 60): {
  intPart: number;
  digits: number[];
  periodStart: number;
  periodLength: number;
} {
  const sign = Math.sign(p) * Math.sign(q);
  p = Math.abs(p);
  q = Math.abs(q);
  const intPart = Math.floor(p / q) * sign;
  let remainder = p % q;
  const digits: number[] = [];
  const remainderMap = new Map<number, number>();
  let periodStart = -1, periodLength = 0;

  for (let i = 0; i < maxDigits; i++) {
    if (remainder === 0) break;
    if (remainderMap.has(remainder)) {
      periodStart = remainderMap.get(remainder)!;
      periodLength = i - periodStart;
      break;
    }
    remainderMap.set(remainder, i);
    remainder *= 10;
    digits.push(Math.floor(remainder / q));
    remainder = remainder % q;
  }

  return { intPart, digits, periodStart, periodLength };
}

/** Find a rational between a and b (a < b). Returns [p, q]. */
export function findRationalBetween(a: number, b: number): [number, number] {
  if (a >= b) return [Math.round((a + b) / 2 * 10), 10];
  // Find n such that 1/n < b - a
  const n = Math.ceil(1 / (b - a)) + 1;
  // Find p such that a < p/n < b
  const p = Math.ceil(a * n);
  if (p / n < b) return [p, n];
  return [p + 1, n];
}

/** Cantor set segments at a given iteration. */
export function cantorSegments(iteration: number): [number, number][] {
  let segments: [number, number][] = [[0, 1]];
  for (let i = 0; i < iteration; i++) {
    const next: [number, number][] = [];
    for (const [a, b] of segments) {
      const third = (b - a) / 3;
      next.push([a, a + third]);
      next.push([b - third, b]);
    }
    segments = next;
  }
  return segments;
}

/** Generate rational approximations to sqrt(2) from below and above. */
export function sqrt2Approximations(count: number): { below: [number, number][]; above: [number, number][] } {
  const below: [number, number][] = [];
  const above: [number, number][] = [];
  // Use continued fraction convergents: 1, 3/2, 7/5, 17/12, 41/29, ...
  let p0 = 1, q0 = 1, p1 = 3, q1 = 2;
  for (let i = 0; i < count; i++) {
    const val = p0 / q0;
    if (val * val < 2) below.push([p0, q0]); else above.push([p0, q0]);
    const val1 = p1 / q1;
    if (val1 * val1 < 2) below.push([p1, q1]); else above.push([p1, q1]);
    const p2 = 2 * p1 + p0;
    const q2 = 2 * q1 + q0;
    p0 = p1; q0 = q1;
    p1 = p2; q1 = q2;
  }
  return { below, above };
}
