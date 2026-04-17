/**
 * Shared utilities for Algebraic Geometry course.
 */

/* ── Implicit curve via marching squares ── */

/**
 * Compute SVG path segments for the zero set { (x,y) : f(x,y) = 0 }
 * using marching squares on a grid.
 *
 * Returns ONE combined path string (many M...L... segments).
 */
export function implicitCurve(
  f: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number,
  resolution = 80,
): string {
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const dx = (x1 - x0) / resolution;
  const dy = (y1 - y0) / resolution;

  // Sample the function on the grid
  const grid: number[][] = [];
  for (let i = 0; i <= resolution; i++) {
    grid[i] = [];
    for (let j = 0; j <= resolution; j++) {
      let val = f(x0 + i * dx, y0 + j * dy);
      if (!isFinite(val)) val = 1e6;
      // Nudge exact zeros to avoid marching-squares miss on grid-aligned curves
      if (Math.abs(val) < 1e-12) val = 1e-12;
      grid[i][j] = val;
    }
  }

  let d = '';

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const v00 = grid[i][j];
      const v10 = grid[i + 1][j];
      const v11 = grid[i + 1][j + 1];
      const v01 = grid[i][j + 1];

      const cx = x0 + i * dx;
      const cy = y0 + j * dy;

      // Find zero-crossings on edges
      const crossings: [number, number][] = [];

      // Bottom: (i,j) → (i+1,j)
      if (v00 * v10 < 0) {
        const t = v00 / (v00 - v10);
        crossings.push([cx + t * dx, cy]);
      }
      // Right: (i+1,j) → (i+1,j+1)
      if (v10 * v11 < 0) {
        const t = v10 / (v10 - v11);
        crossings.push([cx + dx, cy + t * dy]);
      }
      // Top: (i+1,j+1) → (i,j+1)
      if (v11 * v01 < 0) {
        const t = v11 / (v11 - v01);
        crossings.push([cx + dx - t * dx, cy + dy]);
      }
      // Left: (i,j+1) → (i,j)
      if (v01 * v00 < 0) {
        const t = v01 / (v01 - v00);
        crossings.push([cx, cy + dy - t * dy]);
      }

      // Connect pairs of crossings
      if (crossings.length >= 2) {
        const [sx1, sy1] = [toSvgX(crossings[0][0]), toSvgY(crossings[0][1])];
        const [sx2, sy2] = [toSvgX(crossings[1][0]), toSvgY(crossings[1][1])];
        d += `M${sx1.toFixed(1)},${sy1.toFixed(1)}L${sx2.toFixed(1)},${sy2.toFixed(1)}`;
      }
      // Saddle case: 4 crossings → two line segments
      if (crossings.length >= 4) {
        const [sx3, sy3] = [toSvgX(crossings[2][0]), toSvgY(crossings[2][1])];
        const [sx4, sy4] = [toSvgX(crossings[3][0]), toSvgY(crossings[3][1])];
        d += `M${sx3.toFixed(1)},${sy3.toFixed(1)}L${sx4.toFixed(1)},${sy4.toFixed(1)}`;
      }
    }
  }

  return d;
}

/**
 * Draw multiple contour levels of a function.
 * Returns an array of { level, path } objects.
 */
export function contourPaths(
  f: (x: number, y: number) => number,
  levels: number[],
  xRange: [number, number],
  yRange: [number, number],
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number,
  resolution = 60,
): { level: number; path: string }[] {
  return levels.map(c => ({
    level: c,
    path: implicitCurve((x, y) => f(x, y) - c, xRange, yRange, toSvgX, toSvgY, resolution),
  }));
}

/* ── Coordinate helpers ── */

export interface PlotView {
  xRange: [number, number];
  yRange: [number, number];
  svgW: number;
  svgH: number;
  pad: number;
}

export function plotToSvgX(v: PlotView, x: number): number {
  return v.pad + ((x - v.xRange[0]) / (v.xRange[1] - v.xRange[0])) * (v.svgW - 2 * v.pad);
}

export function plotToSvgY(v: PlotView, y: number): number {
  return v.svgH - v.pad - ((y - v.yRange[0]) / (v.yRange[1] - v.yRange[0])) * (v.svgH - 2 * v.pad);
}

export function plotAxesPath(v: PlotView): string {
  const ox = plotToSvgX(v, 0);
  const oy = plotToSvgY(v, 0);
  const l = v.pad, r = v.svgW - v.pad, t = v.pad, b = v.svgH - v.pad;

  let d = '';
  // Only draw axes if origin is within view
  if (ox >= l && ox <= r) d += `M${ox},${t}L${ox},${b}`;
  if (oy >= t && oy <= b) d += `M${l},${oy}L${r},${oy}`;

  // Ticks
  const xStep = tickStep(v.xRange);
  const yStep = tickStep(v.yRange);

  for (let x = Math.ceil(v.xRange[0] / xStep) * xStep; x <= v.xRange[1]; x += xStep) {
    if (Math.abs(x) < xStep * 0.01) continue;
    const sx = plotToSvgX(v, x);
    if (oy >= t && oy <= b) d += `M${sx},${oy - 3}L${sx},${oy + 3}`;
  }
  for (let y = Math.ceil(v.yRange[0] / yStep) * yStep; y <= v.yRange[1]; y += yStep) {
    if (Math.abs(y) < yStep * 0.01) continue;
    const sy = plotToSvgY(v, y);
    if (ox >= l && ox <= r) d += `M${ox - 3},${sy}L${ox + 3},${sy}`;
  }

  return d;
}

function tickStep(range: [number, number]): number {
  const span = range[1] - range[0];
  if (span <= 4) return 1;
  if (span <= 10) return 2;
  return 5;
}

/** Compute numerical gradient of f at (x, y). */
export function gradient(f: (x: number, y: number) => number, x: number, y: number, h = 0.001): [number, number] {
  const dfdx = (f(x + h, y) - f(x - h, y)) / (2 * h);
  const dfdy = (f(x, y + h) - f(x, y - h)) / (2 * h);
  return [dfdx, dfdy];
}
