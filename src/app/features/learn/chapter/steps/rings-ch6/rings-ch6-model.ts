export type Pair = readonly [number, number];
export type PairOperation = 'add' | 'difference' | 'multiply';

export function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}

export function pairKey(pair: Pair): string {
  return `${pair[0]},${pair[1]}`;
}

export function pairLabel(pair: Pair): string {
  return `(${pair[0]},${pair[1]})`;
}

export function parsePair(key: string): Pair {
  const [left, right] = key.split(',').map(Number);
  return [left, right];
}

export function allPairs(n: number): Pair[] {
  return Array.from({length: n}, (_, first) =>
    Array.from({length: n}, (_, second) => [first, second] as Pair),
  ).flat();
}

export function operatePair(left: Pair, right: Pair, operation: PairOperation, n: number): Pair {
  if (operation === 'add') return [mod(left[0] + right[0], n), mod(left[1] + right[1], n)];
  if (operation === 'difference') return [mod(left[0] - right[0], n), mod(left[1] - right[1], n)];
  return [mod(left[0] * right[0], n), mod(left[1] * right[1], n)];
}

export function constantFunctions(n: number): Pair[] {
  return Array.from({length: n}, (_, value) => [value, value] as Pair);
}

export function almostConstantFunctions(): Pair[] {
  return [...constantFunctions(4), [1, 0] as Pair];
}

export function aSupportedFunctions(): Pair[] {
  return Array.from({length: 4}, (_, value) => [value, 0] as Pair);
}

export function containsPair(collection: readonly Pair[], target: Pair): boolean {
  const targetKey = pairKey(target);
  return collection.some(pair => pairKey(pair) === targetKey);
}
