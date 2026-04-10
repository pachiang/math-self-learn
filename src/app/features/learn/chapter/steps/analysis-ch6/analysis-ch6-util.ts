/**
 * Utilities for Real Analysis Ch6: Riemann Integration.
 */

/** Partition [a,b] into n equal subintervals. Returns endpoints. */
export function uniformPartition(a: number, b: number, n: number): number[] {
  const pts: number[] = [];
  const dx = (b - a) / n;
  for (let i = 0; i <= n; i++) pts.push(a + i * dx);
  return pts;
}

/** Left Riemann sum. */
export function leftSum(f: (x: number) => number, a: number, b: number, n: number): number {
  const dx = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += f(a + i * dx) * dx;
  return s;
}

/** Right Riemann sum. */
export function rightSum(f: (x: number) => number, a: number, b: number, n: number): number {
  const dx = (b - a) / n;
  let s = 0;
  for (let i = 1; i <= n; i++) s += f(a + i * dx) * dx;
  return s;
}

/** Upper Darboux sum: sup on each subinterval. */
export function upperSum(f: (x: number) => number, a: number, b: number, n: number, samples = 20): number {
  const dx = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    let mx = -Infinity;
    for (let j = 0; j <= samples; j++) {
      const x = a + i * dx + (j / samples) * dx;
      mx = Math.max(mx, f(x));
    }
    s += mx * dx;
  }
  return s;
}

/** Lower Darboux sum: inf on each subinterval. */
export function lowerSum(f: (x: number) => number, a: number, b: number, n: number, samples = 20): number {
  const dx = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    let mn = Infinity;
    for (let j = 0; j <= samples; j++) {
      const x = a + i * dx + (j / samples) * dx;
      mn = Math.min(mn, f(x));
    }
    s += mn * dx;
  }
  return s;
}

/** Get rectangle data for visualization. */
export interface RectData { x: number; width: number; yLow: number; yHigh: number; }

export function getRects(
  f: (x: number) => number, a: number, b: number, n: number, type: 'left' | 'right' | 'upper' | 'lower', samples = 20
): RectData[] {
  const dx = (b - a) / n;
  const rects: RectData[] = [];
  for (let i = 0; i < n; i++) {
    const xi = a + i * dx;
    if (type === 'left') {
      const h = f(xi);
      rects.push({ x: xi, width: dx, yLow: Math.min(0, h), yHigh: Math.max(0, h) });
    } else if (type === 'right') {
      const h = f(xi + dx);
      rects.push({ x: xi, width: dx, yLow: Math.min(0, h), yHigh: Math.max(0, h) });
    } else {
      let mn = Infinity, mx = -Infinity;
      for (let j = 0; j <= samples; j++) {
        const v = f(xi + (j / samples) * dx);
        mn = Math.min(mn, v); mx = Math.max(mx, v);
      }
      if (type === 'upper') rects.push({ x: xi, width: dx, yLow: 0, yHigh: mx });
      else rects.push({ x: xi, width: dx, yLow: 0, yHigh: mn });
    }
  }
  return rects;
}

/** Sample a function for curve plotting. */
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
