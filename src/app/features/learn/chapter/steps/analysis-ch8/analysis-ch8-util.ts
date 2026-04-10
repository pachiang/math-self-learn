/**
 * Utilities for Real Analysis Ch8: Metric Spaces.
 */

/** Lp distance between two 2D points. */
export function lpDist(a: [number, number], b: [number, number], p: number): number {
  if (p >= 50) return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  return Math.pow(Math.pow(Math.abs(a[0] - b[0]), p) + Math.pow(Math.abs(a[1] - b[1]), p), 1 / p);
}

/** Lp ball boundary points centered at origin with given radius. */
export function lpBallBoundary(p: number, radius = 1, numPoints = 400): { x: number; y: number }[] {
  if (p >= 50) {
    // L∞: square
    const r = radius;
    return [{ x: r, y: r }, { x: -r, y: r }, { x: -r, y: -r }, { x: r, y: -r }, { x: r, y: r }];
  }
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const theta = (2 * Math.PI * i) / numPoints;
    const ct = Math.cos(theta), st = Math.sin(theta);
    const denom = Math.pow(Math.abs(ct), p) + Math.pow(Math.abs(st), p);
    const r = radius * Math.pow(1 / denom, 1 / p);
    pts.push({ x: r * ct, y: r * st });
  }
  return pts;
}

/** Sup-norm distance between two functions on [lo, hi]. */
export function supNormDist(
  f: (x: number) => number, g: (x: number) => number,
  lo: number, hi: number, steps = 400
): { dist: number; maxX: number } {
  let mx = 0, mxX = lo;
  const dx = (hi - lo) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    const d = Math.abs(f(x) - g(x));
    if (d > mx) { mx = d; mxX = x; }
  }
  return { dist: mx, maxX: mxX };
}

/** L2-norm distance (approximate via trapezoidal rule). */
export function l2NormDist(
  f: (x: number) => number, g: (x: number) => number,
  lo: number, hi: number, steps = 400
): number {
  const dx = (hi - lo) / steps;
  let s = 0;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    const d = f(x) - g(x);
    const w = (i === 0 || i === steps) ? 0.5 : 1;
    s += w * d * d * dx;
  }
  return Math.sqrt(s);
}

/** L1-norm distance. */
export function l1NormDist(
  f: (x: number) => number, g: (x: number) => number,
  lo: number, hi: number, steps = 400
): number {
  const dx = (hi - lo) / steps;
  let s = 0;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    const w = (i === 0 || i === steps) ? 0.5 : 1;
    s += w * Math.abs(f(x) - g(x)) * dx;
  }
  return s;
}

/** Iterate a contraction map from x0 for n steps. */
export function iterateContraction(f: (x: number) => number, x0: number, steps: number): number[] {
  const result = [x0];
  let x = x0;
  for (let i = 0; i < steps; i++) {
    x = f(x);
    result.push(x);
  }
  return result;
}

/** Generate cobweb diagram points for plotting. */
export function cobwebPoints(f: (x: number) => number, x0: number, steps: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [{ x: x0, y: 0 }];
  let x = x0;
  for (let i = 0; i < steps; i++) {
    const y = f(x);
    pts.push({ x, y }); // vertical to curve
    pts.push({ x: y, y }); // horizontal to y=x
    x = y;
  }
  return pts;
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
