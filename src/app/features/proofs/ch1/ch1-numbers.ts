export function euler(n: number): number {
  return n * n + n + 41;
}

export function smallestFactor(m: number): number {
  if (m < 2) return m;
  if (m % 2 === 0) return 2;
  for (let d = 3; d * d <= m; d += 2) {
    if (m % d === 0) return d;
  }
  return m;
}

export function isPrime(m: number): boolean {
  return m >= 2 && smallestFactor(m) === m;
}

/** The most square-like factor pair (rows ≤ cols), e.g. 2021 → 43 × 47. */
export function squarestPair(m: number): [number, number] {
  for (let r = Math.floor(Math.sqrt(m)); r >= 1; r--) {
    if (m % r === 0) return [r, m / r];
  }
  return [1, m];
}

export function isOddComposite(m: number): boolean {
  return Number.isInteger(m) && m > 1 && m % 2 === 1 && !isPrime(m);
}
