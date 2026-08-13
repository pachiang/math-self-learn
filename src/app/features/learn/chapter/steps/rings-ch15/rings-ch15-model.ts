export interface CoordinateAddress {
  readonly mod2: number;
  readonly second: number;
}

export type PairMode = 'comaximal' | 'nested';
export type CoordinateOperation = 'add' | 'multiply';

export const CH15_RESIDUES = Array.from({ length: 12 }, (_, value) => value);
export const IDEAL_I = [0, 2, 4, 6, 8, 10] as const;
export const IDEAL_J = [0, 3, 6, 9] as const;
export const IDEAL_H = [0, 4, 8] as const;
export const SHARED_KERNEL = [0, 6] as const;

export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function address(value: number, mode: PairMode = 'comaximal'): CoordinateAddress {
  return { mod2: mod(value, 2), second: mod(value, mode === 'comaximal' ? 3 : 4) };
}

export function addressKey(value: CoordinateAddress): string { return `${value.mod2},${value.second}`; }
export function addressLabel(value: CoordinateAddress): string { return `(${value.mod2},${value.second})`; }
export function sameAddress(left: number, right: number, mode: PairMode = 'comaximal'): boolean {
  return addressKey(address(left, mode)) === addressKey(address(right, mode));
}
export function difference(left: number, right: number): number { return mod(left - right, 12); }
export function inIdeal(value: number, ideal: readonly number[]): boolean { return ideal.includes(mod(value, 12)); }
export function intersection(left: readonly number[], right: readonly number[]): readonly number[] { return left.filter(value => right.includes(value)); }
export function sumIdeal(left: readonly number[], right: readonly number[]): readonly number[] {
  return [...new Set(left.flatMap(a => right.map(b => mod(a + b, 12))))].sort((a, b) => a - b);
}
export function addressFiber(value: number, mode: PairMode = 'comaximal'): readonly number[] {
  return CH15_RESIDUES.filter(candidate => sameAddress(candidate, value, mode));
}
export function coordinateGrid(mode: PairMode): readonly CoordinateAddress[] {
  const secondModulus = mode === 'comaximal' ? 3 : 4;
  return Array.from({ length: 2 }, (_, mod2) => Array.from({ length: secondModulus }, (__, second) => ({ mod2, second }))).flat();
}
export function reachableAddresses(mode: PairMode): readonly CoordinateAddress[] {
  const seen = new Map<string, CoordinateAddress>();
  for (const value of CH15_RESIDUES) seen.set(addressKey(address(value, mode)), address(value, mode));
  return [...seen.values()];
}
export function representativeFor(target: CoordinateAddress, mode: PairMode): number | null {
  return CH15_RESIDUES.find(value => addressKey(address(value, mode)) === addressKey(target)) ?? null;
}

export function reconstruct(mod2Value: number, mod3Value: number): number {
  return mod(3 * mod2Value + 4 * mod3Value, 6);
}
export function quotientBundle(index: number): readonly number[] { return [mod(index, 6), mod(index, 6) + 6]; }
export function coordinateOperate(operation: CoordinateOperation, left: CoordinateAddress, right: CoordinateAddress): CoordinateAddress {
  const combine = operation === 'add' ? (a: number, b: number) => a + b : (a: number, b: number) => a * b;
  return { mod2: mod(combine(left.mod2, right.mod2), 2), second: mod(combine(left.second, right.second), 3) };
}
export function quotientOperate(operation: CoordinateOperation, left: number, right: number): number {
  return mod(operation === 'add' ? left + right : left * right, 6);
}

export function verifyRingsCh15Model(): void {
  if (intersection(IDEAL_I, IDEAL_J).join(',') !== SHARED_KERNEL.join(',')) throw new Error('Ch15 invariant failed: I∩J must equal (6).');
  if (sumIdeal(IDEAL_I, IDEAL_J).length !== 12) throw new Error('Ch15 invariant failed: I+J must equal R.');
  if (sumIdeal(IDEAL_I, IDEAL_H).join(',') !== IDEAL_I.join(',')) throw new Error('Ch15 invariant failed: nested pair must not be comaximal.');
  if (reachableAddresses('comaximal').length !== 6 || reachableAddresses('nested').length !== 4) throw new Error('Ch15 invariant failed: reachability counts are incorrect.');
  for (const left of CH15_RESIDUES) for (const right of CH15_RESIDUES) {
    const sharedBlind = inIdeal(difference(left, right), IDEAL_I) && inIdeal(difference(left, right), IDEAL_J);
    if (sameAddress(left, right) !== sharedBlind) throw new Error('Ch15 invariant failed: paired collisions must equal intersection differences.');
  }
  for (let mod2Value = 0; mod2Value < 2; mod2Value += 1) for (let mod3Value = 0; mod3Value < 3; mod3Value += 1) {
    const rebuilt = reconstruct(mod2Value, mod3Value);
    if (addressKey(address(rebuilt)) !== `${mod2Value},${mod3Value}`) throw new Error('Ch15 invariant failed: CRT reconstruction mismatch.');
  }
  for (const operation of ['add', 'multiply'] as const) for (let left = 0; left < 6; left += 1) for (let right = 0; right < 6; right += 1) {
    const coordinateOutput = coordinateOperate(operation, address(left), address(right));
    if (addressKey(coordinateOutput) !== addressKey(address(quotientOperate(operation, left, right)))) throw new Error('Ch15 invariant failed: coordinate operations mismatch.');
  }
}

verifyRingsCh15Model();
