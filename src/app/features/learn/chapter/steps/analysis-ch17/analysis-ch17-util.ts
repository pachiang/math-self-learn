/**
 * Utilities for Real Analysis Ch17: Fourier Analysis.
 */

/** Compute Fourier coefficients (real form) for a periodic function on [-π, π]. */
export function fourierCoeffs(
  f: (x: number) => number,
  N: number,
  numSamples = 500,
): { a0: number; an: number[]; bn: number[] } {
  const dx = (2 * Math.PI) / numSamples;
  let a0 = 0;
  const an: number[] = [];
  const bn: number[] = [];

  for (let i = 0; i < numSamples; i++) {
    const x = -Math.PI + (i + 0.5) * dx;
    a0 += f(x) * dx;
  }
  a0 /= (2 * Math.PI);

  for (let n = 1; n <= N; n++) {
    let aSum = 0, bSum = 0;
    for (let i = 0; i < numSamples; i++) {
      const x = -Math.PI + (i + 0.5) * dx;
      const fx = f(x);
      aSum += fx * Math.cos(n * x) * dx;
      bSum += fx * Math.sin(n * x) * dx;
    }
    an.push(aSum / Math.PI);
    bn.push(bSum / Math.PI);
  }

  return { a0, an, bn };
}

/** Evaluate Fourier partial sum Sₙ(x). */
export function fourierPartialSum(
  x: number,
  coeffs: { a0: number; an: number[]; bn: number[] },
  N: number,
): number {
  let sum = coeffs.a0;
  const limit = Math.min(N, coeffs.an.length);
  for (let n = 1; n <= limit; n++) {
    sum += coeffs.an[n - 1] * Math.cos(n * x) + coeffs.bn[n - 1] * Math.sin(n * x);
  }
  return sum;
}

/** Standard periodic functions for demos. */
export const WAVE_FUNCTIONS: {
  name: string;
  fn: (x: number) => number;
  formula: string;
}[] = [
  {
    name: '方波',
    fn: (x: number) => {
      const xn = ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return xn >= 0 ? 1 : -1;
    },
    formula: 'f(x) = sgn(x)',
  },
  {
    name: '鋸齒波',
    fn: (x: number) => {
      const xn = ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return xn / Math.PI;
    },
    formula: 'f(x) = x/π',
  },
  {
    name: '三角波',
    fn: (x: number) => {
      const xn = ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return 1 - (2 * Math.abs(xn)) / Math.PI;
    },
    formula: 'f(x) = 1 − 2|x|/π',
  },
  {
    name: '半波整流',
    fn: (x: number) => {
      const xn = ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return Math.max(0, Math.sin(xn));
    },
    formula: 'f(x) = max(0, sin x)',
  },
];

/** Sample a function for plotting. */
export function sampleWave(
  f: (x: number) => number,
  lo: number,
  hi: number,
  steps = 500,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const dx = (hi - lo) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * dx;
    result.push({ x, y: f(x) });
  }
  return result;
}

/** Compute Parseval energy from coefficients. */
export function parsevalEnergy(
  coeffs: { a0: number; an: number[]; bn: number[] },
  N: number,
): number {
  let energy = 2 * coeffs.a0 * coeffs.a0;
  const limit = Math.min(N, coeffs.an.length);
  for (let n = 0; n < limit; n++) {
    energy += coeffs.an[n] * coeffs.an[n] + coeffs.bn[n] * coeffs.bn[n];
  }
  return energy * Math.PI;
}
