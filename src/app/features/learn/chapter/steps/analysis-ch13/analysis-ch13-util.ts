/**
 * Utilities for Real Analysis Ch13: Multivariable Differentiation.
 */

/** 2D gradient (numerical). */
export function gradient2D(
  f: (x: number, y: number) => number, x: number, y: number, h = 1e-5
): [number, number] {
  const fx = (f(x + h, y) - f(x - h, y)) / (2 * h);
  const fy = (f(x, y + h) - f(x, y - h)) / (2 * h);
  return [fx, fy];
}

/** Jacobian matrix (2×2) of a map F: R² → R² at (x,y). */
export function jacobian2x2(
  F: (x: number, y: number) => [number, number], x: number, y: number, h = 1e-5
): number[][] {
  const [f1x, f1y] = [
    (F(x + h, y)[0] - F(x - h, y)[0]) / (2 * h),
    (F(x, y + h)[0] - F(x, y - h)[0]) / (2 * h),
  ];
  const [f2x, f2y] = [
    (F(x + h, y)[1] - F(x - h, y)[1]) / (2 * h),
    (F(x, y + h)[1] - F(x, y - h)[1]) / (2 * h),
  ];
  return [[f1x, f1y], [f2x, f2y]];
}

/** Determinant of 2×2 matrix. */
export function det2x2(M: number[][]): number {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0];
}

/** Hessian matrix (2×2) of f: R² → R at (x,y). */
export function hessian2x2(
  f: (x: number, y: number) => number, x: number, y: number, h = 1e-4
): number[][] {
  const fxx = (f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h * h);
  const fyy = (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h);
  const fxy = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h);
  return [[fxx, fxy], [fxy, fyy]];
}

/** Generate contour data for a 2D function. */
export function contourPoints(
  f: (x: number, y: number) => number,
  xRange: [number, number], yRange: [number, number],
  level: number, steps = 60
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const dx = (xRange[1] - xRange[0]) / steps;
  const dy = (yRange[1] - yRange[0]) / steps;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      const x = xRange[0] + i * dx;
      const y = yRange[0] + j * dy;
      const v00 = f(x, y) - level;
      const v10 = f(x + dx, y) - level;
      const v01 = f(x, y + dy) - level;
      // Simple: if sign change across cell edge, interpolate
      if (v00 * v10 < 0) {
        const t = v00 / (v00 - v10);
        pts.push({ x: x + t * dx, y });
      }
      if (v00 * v01 < 0) {
        const t = v00 / (v00 - v01);
        pts.push({ x, y: y + t * dy });
      }
    }
  }
  return pts;
}
