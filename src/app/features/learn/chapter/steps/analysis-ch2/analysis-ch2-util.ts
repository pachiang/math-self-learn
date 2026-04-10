/**
 * Utilities for Real Analysis Ch2: Sequences and Limits.
 */

export interface SeqDef {
  name: string;
  fn: (n: number) => number;
  limit: number | null; // null = diverges
  desc: string;
}

export const COMMON_SEQUENCES: SeqDef[] = [
  { name: '1/n', fn: (n) => 1 / n, limit: 0, desc: '最經典的收斂數列' },
  { name: '(-1)ⁿ/n', fn: (n) => ((-1) ** n) / n, limit: 0, desc: '交替但振幅衰減' },
  { name: '1 − 1/n', fn: (n) => 1 - 1 / n, limit: 1, desc: '單調遞增趨向 1' },
  { name: '(2n+1)/(3n−1)', fn: (n) => (2 * n + 1) / (3 * n - 1), limit: 2 / 3, desc: '有理函數型' },
  { name: '(-1)ⁿ', fn: (n) => (-1) ** n, limit: null, desc: '發散（振盪）' },
  { name: '(1+1/n)ⁿ', fn: (n) => Math.pow(1 + 1 / n, n), limit: Math.E, desc: '收斂到 e' },
];

/** Generate first `count` terms of a sequence (n starts at 1). */
export function generateTerms(fn: (n: number) => number, count: number): { n: number; val: number }[] {
  return Array.from({ length: count }, (_, i) => ({ n: i + 1, val: fn(i + 1) }));
}

/**
 * Find the minimal N such that |fn(n) - L| < epsilon for all n > N.
 * Scans up to maxSearch.
 */
export function findMinN(fn: (n: number) => number, L: number, epsilon: number, maxSearch = 500): number {
  // Find the last n where |fn(n) - L| >= epsilon
  let lastBad = 0;
  for (let n = 1; n <= maxSearch; n++) {
    if (Math.abs(fn(n) - L) >= epsilon) lastBad = n;
  }
  return lastBad; // N = lastBad means for all n > N, condition holds
}

/** Harmonic partial sum H_n = 1 + 1/2 + ... + 1/n. */
export function harmonicSum(n: number): number {
  let s = 0;
  for (let k = 1; k <= n; k++) s += 1 / k;
  return s;
}

/** Newton/Babylonian iteration for √2: a_{n+1} = (a_n + 2/a_n)/2. */
export function newtonSqrt2(n: number): number {
  let a = 1;
  for (let i = 0; i < n; i++) a = (a + 2 / a) / 2;
  return a;
}

/** Partial sum of 1/k! for k=0..n (converges to e). */
export function factorialSum(n: number): number {
  let s = 0, fact = 1;
  for (let k = 0; k <= n; k++) {
    if (k > 0) fact *= k;
    s += 1 / fact;
  }
  return s;
}

/**
 * Extract a convergent subsequence from a bounded sequence using bisection.
 * Returns the subsequence indices and the intermediate intervals.
 */
export function bisectSubsequence(
  terms: number[],
  maxSteps = 10,
): { intervals: { a: number; b: number; pickedIdx: number }[]; subseqIndices: number[] } {
  let a = Math.min(...terms);
  let b = Math.max(...terms);
  const intervals: { a: number; b: number; pickedIdx: number }[] = [];
  const subseqIndices: number[] = [];
  let candidates = terms.map((v, i) => ({ v, i }));

  for (let step = 0; step < maxSteps && candidates.length > 1; step++) {
    const mid = (a + b) / 2;
    const left = candidates.filter((c) => c.v <= mid);
    const right = candidates.filter((c) => c.v > mid);
    if (left.length >= right.length) {
      b = mid;
      candidates = left;
    } else {
      a = mid;
      candidates = right;
    }
    const picked = candidates[Math.min(step, candidates.length - 1)];
    intervals.push({ a, b, pickedIdx: picked.i });
    subseqIndices.push(picked.i);
  }
  return { intervals, subseqIndices };
}
