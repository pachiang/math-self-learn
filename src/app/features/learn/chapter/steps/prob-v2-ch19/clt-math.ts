export type CltSource = 'bernoulli' | 'uniform' | 'exponential' | 'rare';

export function unit(seed: number): number {
  const raw = Math.sin((seed + 1) * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}

export function sourceMoments(source: CltSource): { mean: number; sd: number } {
  if (source === 'bernoulli') return { mean: 0.3, sd: Math.sqrt(0.21) };
  if (source === 'uniform') return { mean: 0.5, sd: Math.sqrt(1 / 12) };
  if (source === 'exponential') return { mean: 1, sd: 1 };
  return { mean: 0, sd: 1 };
}

export function draw(source: CltSource, seed: number): number {
  const u = Math.min(0.999999, Math.max(0.000001, unit(seed)));
  if (source === 'bernoulli') return u < 0.3 ? 1 : 0;
  if (source === 'uniform') return u;
  if (source === 'exponential') return -Math.log(1 - u);
  return u < 0.005 ? Math.sqrt(199) : -1 / Math.sqrt(199);
}

export function standardizedMean(source: CltSource, world: number, n: number): number {
  const { mean, sd } = sourceMoments(source);
  let sum = 0;
  for (let index = 0; index < n; index += 1) sum += draw(source, world * 10009 + index * 101);
  return (Math.sqrt(n) * (sum / n - mean)) / sd;
}

export function rawMean(source: CltSource, world: number, n: number): number {
  let sum = 0;
  for (let index = 0; index < n; index += 1) sum += draw(source, world * 10009 + index * 101);
  return sum / n;
}

export function histogram(
  values: number[],
  bins = 41,
  min = -4,
  max = 4,
): { index: number; height: number }[] {
  const counts = Array(bins).fill(0) as number[];
  values.forEach((value) => {
    const index = Math.max(0, Math.min(bins - 1, Math.floor(((value - min) / (max - min)) * bins)));
    counts[index] += 1;
  });
  const peak = Math.max(...counts, 1);
  return counts.map((count, index) => ({ index, height: (count / peak) * 100 }));
}

export function normalPdf(x: number): number {
  return Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
}

export function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * z);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  return 0.5 * (1 + sign * erf);
}
