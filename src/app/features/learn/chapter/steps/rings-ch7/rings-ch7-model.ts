export type RingMapOperation = 'add' | 'multiply';
export type FunctionPair = readonly [number, number];

export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function operatePair(
  left: FunctionPair,
  right: FunctionPair,
  operation: RingMapOperation,
  modulus = 4,
): FunctionPair {
  return operation === 'add'
    ? [mod(left[0] + right[0], modulus), mod(left[1] + right[1], modulus)]
    : [mod(left[0] * right[0], modulus), mod(left[1] * right[1], modulus)];
}

export function evaluateA(pair: FunctionPair): number {
  return pair[0];
}

export function operateValue(
  left: number,
  right: number,
  operation: RingMapOperation,
  modulus?: number,
): number {
  const output = operation === 'add' ? left + right : left * right;
  return modulus === undefined ? output : mod(output, modulus);
}

export function pairLabel(pair: FunctionPair): string {
  return `(${pair[0]}, ${pair[1]})`;
}

export function differencePair(left: FunctionPair, right: FunctionPair): FunctionPair {
  return [mod(left[0] - right[0], 4), mod(left[1] - right[1], 4)];
}

export function clampResidue(value: number): number {
  return mod(value, 4);
}
