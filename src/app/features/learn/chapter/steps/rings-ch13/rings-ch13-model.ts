export interface TargetPoint {
  readonly mod4: number;
  readonly mod2: number;
}

export interface KernelClass {
  readonly index: number;
  readonly members: readonly number[];
  readonly image: TargetPoint;
}

export type RingOperation = 'add' | 'multiply';

export const CH13_RESIDUES = Array.from({ length: 12 }, (_, value) => value);
export const CH13_KERNEL = [0, 4, 8] as const;

export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function mapToTarget(value: number): TargetPoint {
  return { mod4: mod(value, 4), mod2: mod(value, 2) };
}

export function targetKey(point: TargetPoint): string {
  return `${point.mod4},${point.mod2}`;
}

export function targetLabel(point: TargetPoint): string {
  return `(${point.mod4},${point.mod2})`;
}

export function sameTarget(left: number, right: number): boolean {
  return targetKey(mapToTarget(left)) === targetKey(mapToTarget(right));
}

export function residueDifference(left: number, right: number): number {
  return mod(left - right, 12);
}

export function isKernelElement(value: number): boolean {
  return targetKey(mapToTarget(value)) === '0,0';
}

export function translateKernel(anchor: number): readonly number[] {
  return CH13_KERNEL.map(value => mod(anchor + value, 12)).sort((a, b) => a - b);
}

export function fiberOf(anchor: number): readonly number[] {
  return CH13_RESIDUES.filter(value => sameTarget(value, anchor));
}

export const CH13_CLASSES: readonly KernelClass[] = Array.from({ length: 4 }, (_, index) => ({
  index,
  members: fiberOf(index),
  image: mapToTarget(index),
}));

export const CH13_TARGET: readonly TargetPoint[] = Array.from({ length: 4 }, (_, mod4) =>
  Array.from({ length: 2 }, (_, mod2) => ({ mod4, mod2 })),
).flat();

export const CH13_IMAGE: readonly TargetPoint[] = CH13_CLASSES.map(quotientClass => quotientClass.image);

export function isImagePoint(point: TargetPoint): boolean {
  return CH13_IMAGE.some(imagePoint => targetKey(imagePoint) === targetKey(point));
}

export function quotientOperate(operation: RingOperation, left: number, right: number): number {
  return mod(operation === 'add' ? left + right : left * right, 4);
}

export function targetOperate(operation: RingOperation, left: TargetPoint, right: TargetPoint): TargetPoint {
  const combine = operation === 'add'
    ? (a: number, b: number) => a + b
    : (a: number, b: number) => a * b;
  return {
    mod4: mod(combine(left.mod4, right.mod4), 4),
    mod2: mod(combine(left.mod2, right.mod2), 2),
  };
}

export function verifyRingsCh13Model(): void {
  if (CH13_RESIDUES.filter(isKernelElement).join(',') !== CH13_KERNEL.join(',')) {
    throw new Error('Ch13 invariant failed: kernel of f must be {0,4,8}.');
  }
  for (const left of CH13_RESIDUES) {
    for (const right of CH13_RESIDUES) {
      if (sameTarget(left, right) !== isKernelElement(residueDifference(left, right))) {
        throw new Error('Ch13 invariant failed: collisions must equal kernel differences.');
      }
    }
    if (fiberOf(left).join(',') !== translateKernel(left).join(',')) {
      throw new Error('Ch13 invariant failed: every fiber must be a kernel translate.');
    }
  }
  for (const operation of ['add', 'multiply'] as const) {
    for (const left of CH13_CLASSES) {
      for (const right of CH13_CLASSES) {
        const quotientOutput = mapToTarget(quotientOperate(operation, left.index, right.index));
        const targetOutput = targetOperate(operation, left.image, right.image);
        if (targetKey(quotientOutput) !== targetKey(targetOutput)) {
          throw new Error('Ch13 invariant failed: induced map must preserve both operations.');
        }
      }
    }
  }
}

verifyRingsCh13Model();
