export function factorial(n: number): number {
  let value = 1;
  for (let i = 2; i <= n; i += 1) value *= i;
  return value;
}

export function choose(n: number, k: number): number {
  const r = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= r; i += 1) value = (value * (n - r + i)) / i;
  return value;
}

export function poissonPmf(k: number, mean: number): number {
  return (Math.exp(-mean) * mean ** k) / factorial(k);
}

export function binomialPmf(k: number, n: number, p: number): number {
  return choose(n, k) * p ** k * (1 - p) ** (n - k);
}

export function gammaPdf(x: number, shape: number, rate: number): number {
  if (x < 0) return 0;
  return (rate ** shape * x ** (shape - 1) * Math.exp(-rate * x)) / factorial(shape - 1);
}

export function poissonAtLeast(k: number, mean: number): number {
  let below = 0;
  for (let i = 0; i < k; i += 1) below += poissonPmf(i, mean);
  return Math.max(0, Math.min(1, 1 - below));
}

export function percent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}
