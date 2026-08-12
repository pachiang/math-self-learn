import { KernelPair, mod } from '../rings-ch8/rings-ch8-model';

export type ContractLens = 'subring' | 'ideal';
export type ContractCell = 'both' | 'subring-only' | 'ideal-only' | 'neither';

export const AMBIENT_CARDS: readonly KernelPair[] = Array.from({ length: 4 }, (_, a) =>
  Array.from({ length: 4 }, (_, b) => [a, b] as KernelPair),
).flat();

export function isConstant(pair: KernelPair): boolean {
  return pair[0] === pair[1];
}

export function multiply(left: KernelPair, right: KernelPair): KernelPair {
  return [mod(left[0] * right[0]), mod(left[1] * right[1])];
}

export function pairLabel(pair: KernelPair): string {
  return `(${pair[0]}, ${pair[1]})`;
}
