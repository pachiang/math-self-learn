export function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}

export function multiplyMod(a: number, x: number, n = 10): number {
  return mod(a * x, n);
}

export function support(values: readonly number[]): number[] {
  return values.flatMap((value, index) => value === 0 ? [] : [index]);
}

export function pointwiseProduct(left: readonly number[], right: readonly number[]): number[] {
  return left.map((value, index) => value * right[index]);
}

export function isZeroVector(values: readonly number[]): boolean {
  return values.every(value => value === 0);
}

export function isNonzeroVector(values: readonly number[]): boolean {
  return values.some(value => value !== 0);
}
