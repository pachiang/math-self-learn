/**
 * Utilities for Real Analysis Ch3: Series.
 */

/** Partial sum of a series: S_n = sum_{k=1}^{n} f(k). */
export function partialSums(fn: (k: number) => number, count: number): { n: number; term: number; sum: number }[] {
  const result: { n: number; term: number; sum: number }[] = [];
  let s = 0;
  for (let k = 1; k <= count; k++) {
    const t = fn(k);
    s += t;
    result.push({ n: k, term: t, sum: s });
  }
  return result;
}

/** Geometric partial sum: sum r^k for k=0..n-1. */
export function geometricPartialSum(r: number, n: number): number {
  if (Math.abs(r - 1) < 1e-12) return n;
  return (1 - Math.pow(r, n)) / (1 - r);
}

/** Ratio sequence: |a_{n+1}/a_n|. */
export function ratioSequence(fn: (k: number) => number, count: number): { n: number; val: number }[] {
  const result: { n: number; val: number }[] = [];
  for (let k = 1; k < count; k++) {
    const a = Math.abs(fn(k));
    const b = Math.abs(fn(k + 1));
    result.push({ n: k, val: a > 1e-15 ? b / a : 0 });
  }
  return result;
}

/** Root sequence: |a_n|^{1/n}. */
export function rootSequence(fn: (k: number) => number, count: number): { n: number; val: number }[] {
  const result: { n: number; val: number }[] = [];
  for (let k = 1; k <= count; k++) {
    result.push({ n: k, val: Math.pow(Math.abs(fn(k)), 1 / k) });
  }
  return result;
}

/** Taylor coefficients for standard functions at a=0. Returns (n) => coeff. */
export function taylorCoeff(name: string): (n: number) => number {
  switch (name) {
    case 'exp': return (n) => 1 / factorial(n);
    case 'sin': return (n) => n % 2 === 0 ? 0 : ((-1) ** ((n - 1) / 2)) / factorial(n);
    case 'cos': return (n) => n % 2 === 1 ? 0 : ((-1) ** (n / 2)) / factorial(n);
    case 'ln1px': return (n) => n === 0 ? 0 : ((-1) ** (n + 1)) / n;
    default: return () => 0;
  }
}

/** Evaluate Taylor polynomial sum_{k=0}^{N} c_k * (x-a)^k. */
export function taylorEval(coeffFn: (n: number) => number, x: number, a: number, N: number): number {
  let s = 0, power = 1;
  for (let k = 0; k <= N; k++) {
    s += coeffFn(k) * power;
    power *= (x - a);
  }
  return s;
}

/**
 * Riemann rearrangement of the alternating harmonic series to target.
 * Returns partial sums of the rearranged series.
 */
export function riemannRearrange(target: number, maxTerms: number): { n: number; sum: number }[] {
  const result: { n: number; sum: number }[] = [];
  let posIdx = 1; // next positive term: 1/(2k-1)
  let negIdx = 1; // next negative term: -1/(2k)
  let s = 0;
  for (let step = 1; step <= maxTerms; step++) {
    if (s < target) {
      // Add positive term 1/(2*posIdx - 1)
      s += 1 / (2 * posIdx - 1);
      posIdx++;
    } else {
      // Add negative term -1/(2*negIdx)
      s -= 1 / (2 * negIdx);
      negIdx++;
    }
    result.push({ n: step, sum: s });
  }
  return result;
}

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}
