export type RingOperation = 'add' | 'multiply';

export const MODULUS = 6;
export const RESIDUES = [0, 1, 2, 3, 4, 5] as const;
export const INTEGER_WINDOW = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;
export const FUNCTION_INPUTS = ['A', 'B', 'C'] as const;

export function mod(value: number, modulus = MODULUS): number {
  return ((value % modulus) + modulus) % modulus;
}

export function combineResidues(a: number, b: number, operation: RingOperation): number {
  return operation === 'add' ? mod(a + b) : mod(a * b);
}

export function clockPoint(value: number, radius = 112, center = 150): { x: number; y: number } {
  const angle = (value / MODULUS) * Math.PI * 2 - Math.PI / 2;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function integerImage(value: number, machine: 'translate' | 'double'): number {
  return machine === 'translate' ? value + 2 : value * 2;
}

export function integerPreimage(target: number, machine: 'translate' | 'double'): number | null {
  if (machine === 'translate') return target - 2;
  return target % 2 === 0 ? target / 2 : null;
}

export function combineFunctions(
  left: readonly number[],
  right: readonly number[],
  operation: RingOperation,
): number[] {
  return left.map((value, index) =>
    operation === 'add' ? value + right[index] : value * right[index],
  );
}

export function clampFunctionValue(value: number): number {
  return Math.max(-3, Math.min(3, value));
}
