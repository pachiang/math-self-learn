/**
 * Utilities for Real Analysis Ch12: Hilbert Spaces.
 */

/** L2 inner product on [0,1]. */
export function l2Inner(f: (x: number) => number, g: (x: number) => number, steps = 400): number {
  const dx = 1 / steps;
  let s = 0;
  for (let i = 0; i <= steps; i++) {
    const x = i * dx;
    const w = (i === 0 || i === steps) ? 0.5 : 1;
    s += w * f(x) * g(x) * dx;
  }
  return s;
}

/** L2 norm on [0,1]. */
export function l2Norm(f: (x: number) => number, steps = 400): number {
  return Math.sqrt(l2Inner(f, f, steps));
}

/** Fourier coefficients for f on [0,1] using sin/cos basis. */
export function fourierCoeffs(f: (x: number) => number, nTerms: number): { a0: number; a: number[]; b: number[] } {
  const a0 = l2Inner(f, () => 1) * 2;
  const a: number[] = [];
  const b: number[] = [];
  for (let n = 1; n <= nTerms; n++) {
    a.push(l2Inner(f, (x) => Math.cos(2 * Math.PI * n * x)) * 2);
    b.push(l2Inner(f, (x) => Math.sin(2 * Math.PI * n * x)) * 2);
  }
  return { a0, a, b };
}

/** Evaluate Fourier partial sum at x. */
export function fourierEval(coeffs: { a0: number; a: number[]; b: number[] }, x: number, N: number): number {
  let s = coeffs.a0 / 2;
  for (let n = 0; n < N && n < coeffs.a.length; n++) {
    s += coeffs.a[n] * Math.cos(2 * Math.PI * (n + 1) * x);
    s += coeffs.b[n] * Math.sin(2 * Math.PI * (n + 1) * x);
  }
  return s;
}

/** Projection of f onto span of basis functions. */
export function projectOnto(
  f: (x: number) => number,
  basis: ((x: number) => number)[],
): { coeffs: number[]; projected: (x: number) => number } {
  const coeffs = basis.map((e) => l2Inner(f, e));
  const projected = (x: number) => {
    let s = 0;
    for (let k = 0; k < basis.length; k++) s += coeffs[k] * basis[k](x);
    return s;
  };
  return { coeffs, projected };
}

/** Sample function for plotting. */
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
