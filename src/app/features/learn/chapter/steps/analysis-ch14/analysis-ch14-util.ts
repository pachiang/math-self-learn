/**
 * Utilities for Real Analysis Ch14: Multivariable Integration & Fubini.
 */

/** Sample a 2D function on a grid, returning vertices + values. */
export function sampleSurface(
  f: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  nx: number,
  ny: number,
): { positions: Float32Array; values: Float32Array; indices: number[] } {
  const positions = new Float32Array((nx + 1) * (ny + 1) * 3);
  const values = new Float32Array((nx + 1) * (ny + 1));
  const dx = (xRange[1] - xRange[0]) / nx;
  const dy = (yRange[1] - yRange[0]) / ny;

  let idx = 0;
  for (let j = 0; j <= ny; j++) {
    const y = yRange[0] + j * dy;
    for (let i = 0; i <= nx; i++) {
      const x = xRange[0] + i * dx;
      const z = f(x, y);
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = z;
      positions[idx * 3 + 2] = y;
      values[idx] = z;
      idx++;
    }
  }

  const indices: number[] = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      const b = a + 1;
      const c = a + (nx + 1);
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }
  return { positions, values, indices };
}

/** Numerically compute a double integral via midpoint rule. */
export function doubleIntegral(
  f: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  nx = 100,
  ny = 100,
): number {
  const dx = (xRange[1] - xRange[0]) / nx;
  const dy = (yRange[1] - yRange[0]) / ny;
  let sum = 0;
  for (let j = 0; j < ny; j++) {
    const y = yRange[0] + (j + 0.5) * dy;
    for (let i = 0; i < nx; i++) {
      const x = xRange[0] + (i + 0.5) * dx;
      sum += f(x, y);
    }
  }
  return sum * dx * dy;
}

/** Compute iterated integral ∫∫ f dx dy via fixed y slices. */
export function iteratedIntegralDxDy(
  f: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  nx = 200,
  ny = 200,
): { sliceValues: number[]; total: number } {
  const dx = (xRange[1] - xRange[0]) / nx;
  const dy = (yRange[1] - yRange[0]) / ny;
  const sliceValues: number[] = [];
  let total = 0;
  for (let j = 0; j < ny; j++) {
    const y = yRange[0] + (j + 0.5) * dy;
    let inner = 0;
    for (let i = 0; i < nx; i++) {
      const x = xRange[0] + (i + 0.5) * dx;
      inner += f(x, y) * dx;
    }
    sliceValues.push(inner);
    total += inner * dy;
  }
  return { sliceValues, total };
}

/** Compute the Jacobian determinant of a 2D transformation numerically. */
export function jacobianDet2D(
  u: (x: number, y: number) => number,
  v: (x: number, y: number) => number,
  x: number,
  y: number,
  h = 1e-5,
): number {
  const dudx = (u(x + h, y) - u(x - h, y)) / (2 * h);
  const dudy = (u(x, y + h) - u(x, y - h)) / (2 * h);
  const dvdx = (v(x + h, y) - v(x - h, y)) / (2 * h);
  const dvdy = (v(x, y + h) - v(x, y - h)) / (2 * h);
  return dudx * dvdy - dudy * dvdx;
}
