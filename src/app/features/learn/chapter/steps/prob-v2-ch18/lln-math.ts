export function unit(seed: number): number {
  const raw = Math.sin((seed + 1) * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}

export function bernoulli(seed: number, p: number): number {
  return unit(seed) < p ? 1 : 0;
}

export function sampleMean(world: number, n: number, p: number): number {
  let sum = 0;
  for (let index = 0; index < n; index += 1) sum += bernoulli(world * 10007 + index * 97, p);
  return sum / n;
}

export function histogram(
  values: number[],
  bins: number,
  min = 0,
  max = 1,
): { index: number; height: number; count: number }[] {
  const counts = Array(bins).fill(0) as number[];
  values.forEach((value) => {
    const index = Math.max(0, Math.min(bins - 1, Math.floor(((value - min) / (max - min)) * bins)));
    counts[index] += 1;
  });
  const peak = Math.max(...counts, 1);
  return counts.map((count, index) => ({ index, count, height: (count / peak) * 100 }));
}
