export type KernelPair = readonly [number, number];

export function mod(value: number, modulus = 4): number {
  return ((value % modulus) + modulus) % modulus;
}

export function allFunctionPairs(): KernelPair[] {
  return Array.from({ length: 4 }, (_, a) =>
    Array.from({ length: 4 }, (_, b) => [a, b] as KernelPair),
  ).flat();
}

export function pairLabel(pair: KernelPair): string {
  return `(${pair[0]}, ${pair[1]})`;
}

export function evaluateA(pair: KernelPair): number {
  return pair[0];
}

export function subtractPairs(left: KernelPair, right: KernelPair): KernelPair {
  return [mod(left[0] - right[0]), mod(left[1] - right[1])];
}

export function multiplyPairs(left: KernelPair, right: KernelPair): KernelPair {
  return [mod(left[0] * right[0]), mod(left[1] * right[1])];
}

export function isZeroPair(pair: KernelPair): boolean {
  return pair[0] === 0 && pair[1] === 0;
}
