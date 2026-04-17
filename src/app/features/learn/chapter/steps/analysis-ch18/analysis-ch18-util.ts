/**
 * Utilities for Real Analysis Ch18: Distributions & Generalized Functions.
 */

/** Gaussian approximation to delta: δ_ε(x) = (1/√(2πε²)) exp(−x²/(2ε²)). */
export function gaussianDelta(x: number, eps: number): number {
  return (1 / (eps * Math.sqrt(2 * Math.PI))) * Math.exp(-x * x / (2 * eps * eps));
}

/** Hat function (tent) approximation to delta. */
export function hatDelta(x: number, eps: number): number {
  if (Math.abs(x) >= eps) return 0;
  return (1 / eps) * (1 - Math.abs(x) / eps);
}

/** Rectangular approximation to delta. */
export function rectDelta(x: number, eps: number): number {
  return Math.abs(x) < eps / 2 ? 1 / eps : 0;
}

/** Sinc-squared approximation to delta. */
export function sincDelta(x: number, eps: number): number {
  if (Math.abs(x) < 1e-10) return 1 / eps;
  const t = x / eps;
  const s = Math.sin(Math.PI * t) / (Math.PI * t);
  return s * s / eps;
}

/** Bump function (smooth, compactly supported test function). */
export function bumpFunction(x: number, support = 1): number {
  if (Math.abs(x) >= support) return 0;
  const t = x / support;
  return Math.exp(-1 / (1 - t * t));
}

/** Standard test functions. */
export const TEST_FUNCTIONS: { name: string; fn: (x: number) => number; formula: string }[] = [
  { name: 'bump', fn: (x) => bumpFunction(x), formula: 'exp(−1/(1−x²))' },
  { name: 'cos', fn: (x) => Math.cos(x), formula: 'cos(x)' },
  { name: 'x²', fn: (x) => x * x, formula: 'x²' },
  { name: 'sin(πx)', fn: (x) => Math.sin(Math.PI * x), formula: 'sin(πx)' },
];

/** Delta approximation families. */
export const DELTA_FAMILIES: {
  name: string;
  fn: (x: number, eps: number) => number;
  formula: string;
}[] = [
  { name: '高斯', fn: gaussianDelta, formula: '(1/σ√2π) exp(−x²/2σ²)' },
  { name: '矩形', fn: rectDelta, formula: '(1/ε) 1_(−ε/2, ε/2)' },
  { name: '三角帽', fn: hatDelta, formula: '(1/ε)(1−|x|/ε)⁺' },
  { name: 'sinc²', fn: sincDelta, formula: '(1/ε) sinc²(x/ε)' },
];

/** Sample a function for SVG path. */
export function samplePath(
  f: (x: number) => number,
  xMin: number, xMax: number,
  yScale: number, yOffset: number,
  xScale: number, xOffset: number,
  steps = 400,
): string {
  let path = '';
  const dx = (xMax - xMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const y = f(x);
    if (!isFinite(y)) continue;
    const px = xOffset + x * xScale;
    const py = yOffset - y * yScale;
    path += (path === '' ? 'M' : 'L') + `${px.toFixed(3)},${py.toFixed(3)}`;
  }
  return path;
}

/** Heaviside step function. */
export function heaviside(x: number): number {
  return x > 0 ? 1 : x < 0 ? 0 : 0.5;
}

/** Derivative of Heaviside = delta (approximated). */
export function heavisideSmooth(x: number, eps: number): number {
  // Smooth approximation: (1 + tanh(x/ε)) / 2
  return (1 + Math.tanh(x / eps)) / 2;
}
