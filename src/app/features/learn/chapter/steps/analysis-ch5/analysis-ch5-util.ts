/**
 * Utilities for Real Analysis Ch5: Differentiation.
 */

/** Numerical derivative at x using central difference. */
export function numericalDerivative(f: (x: number) => number, x: number, h = 1e-6): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Difference quotient (f(x+h) - f(x)) / h. */
export function differenceQuotient(f: (x: number) => number, x: number, h: number): number {
  return (f(x + h) - f(x)) / h;
}

/** Find c in (a,b) where f'(c) = (f(b)-f(a))/(b-a) using bisection-like scan. */
export function findMVTPoint(
  f: (x: number) => number, a: number, b: number, resolution = 0.001
): number {
  const slope = (f(b) - f(a)) / (b - a);
  let bestC = (a + b) / 2;
  let bestErr = Infinity;
  for (let x = a + resolution; x < b; x += resolution) {
    const d = numericalDerivative(f, x);
    const err = Math.abs(d - slope);
    if (err < bestErr) { bestErr = err; bestC = x; }
  }
  return bestC;
}

/** Taylor polynomial value: sum f^(k)(a)/k! * (x-a)^k for k=0..N. */
export function taylorPoly(
  derivatives: number[], // derivatives[k] = f^(k)(a)
  a: number, x: number, N: number
): number {
  let s = 0, power = 1, fact = 1;
  for (let k = 0; k <= N && k < derivatives.length; k++) {
    s += derivatives[k] / fact * power;
    power *= (x - a);
    fact *= (k + 1);
  }
  return s;
}

/** Sample a function for plotting, with optional break at discontinuities. */
export function sampleFn(
  f: (x: number) => number, lo: number, hi: number, steps = 300
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const dx = (hi - lo) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    const y = f(x);
    if (isFinite(y)) result.push({ x, y });
  }
  return result;
}
