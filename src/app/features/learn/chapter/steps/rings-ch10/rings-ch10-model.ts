export type Pair = readonly [number, number];

export interface PairCertificate {
  readonly output: Pair;
  readonly coefficient: Pair;
}

export interface ResidueCertificate {
  readonly output: number;
  readonly leftCoefficient: number;
  readonly rightCoefficient: number;
}

export const FUNCTION_MODULUS = 4;
export const FUNCTION_SEED: Pair = [1, 2];
export const RESIDUE_MODULUS = 12;
export const RESIDUE_SEEDS = [4, 6] as const;

export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function pairKey(pair: Pair): string {
  return `${pair[0]},${pair[1]}`;
}

export function pairLabel(pair: Pair): string {
  return `(${pair[0]}, ${pair[1]})`;
}

export function allPairs(modulus = FUNCTION_MODULUS): Pair[] {
  return Array.from({ length: modulus }, (_, left) =>
    Array.from({ length: modulus }, (_, right) => [left, right] as Pair),
  ).flat();
}

export function multiplyPairs(left: Pair, right: Pair, modulus = FUNCTION_MODULUS): Pair {
  return [mod(left[0] * right[0], modulus), mod(left[1] * right[1], modulus)];
}

export function subtractPairs(left: Pair, right: Pair, modulus = FUNCTION_MODULUS): Pair {
  return [mod(left[0] - right[0], modulus), mod(left[1] - right[1], modulus)];
}

export function principalPairCertificates(seed: Pair = FUNCTION_SEED): PairCertificate[] {
  const firstByOutput = new Map<string, PairCertificate>();
  for (const coefficient of allPairs()) {
    const output = multiplyPairs(coefficient, seed);
    if (!firstByOutput.has(pairKey(output))) {
      firstByOutput.set(pairKey(output), { output, coefficient });
    }
  }
  return [...firstByOutput.values()];
}

export function principalPairMembers(seed: Pair = FUNCTION_SEED): Pair[] {
  return principalPairCertificates(seed).map(({ output }) => output);
}

export function principalResidues(generator: number, modulus = RESIDUE_MODULUS): number[] {
  return Array.from({ length: modulus }, (_, coefficient) => mod(coefficient * generator, modulus))
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((left, right) => left - right);
}

export function generatedResidueCertificates(
  leftSeed = RESIDUE_SEEDS[0],
  rightSeed = RESIDUE_SEEDS[1],
  modulus = RESIDUE_MODULUS,
): ResidueCertificate[] {
  const firstByOutput = new Map<number, ResidueCertificate>();
  for (let leftCoefficient = 0; leftCoefficient < modulus; leftCoefficient += 1) {
    for (let rightCoefficient = 0; rightCoefficient < modulus; rightCoefficient += 1) {
      const output = mod(leftCoefficient * leftSeed + rightCoefficient * rightSeed, modulus);
      if (!firstByOutput.has(output)) {
        firstByOutput.set(output, { output, leftCoefficient, rightCoefficient });
      }
    }
  }
  return [...firstByOutput.values()].sort((left, right) => left.output - right.output);
}

export function generatedResidues(): number[] {
  return generatedResidueCertificates().map(({ output }) => output);
}

export function residueCombination(leftCoefficient: number, rightCoefficient: number): number {
  return mod(
    leftCoefficient * RESIDUE_SEEDS[0] + rightCoefficient * RESIDUE_SEEDS[1],
    RESIDUE_MODULUS,
  );
}

export function certificateForResidue(value: number): ResidueCertificate | null {
  return generatedResidueCertificates().find(({ output }) => output === mod(value, RESIDUE_MODULUS)) ?? null;
}

export function verifyRingsCh10Model(): void {
  const pairMembers = principalPairMembers().map(pairKey).sort();
  const expectedPairs = ['0,0', '0,2', '1,0', '1,2', '2,0', '2,2', '3,0', '3,2'].sort();
  if (pairMembers.join('|') !== expectedPairs.join('|')) {
    throw new Error('Rings Ch10 invariant failed: (1,2) must generate exactly eight function cards.');
  }

  const left = principalResidues(4);
  const right = principalResidues(6);
  if (left.join(',') !== '0,4,8' || right.join(',') !== '0,6') {
    throw new Error('Rings Ch10 invariant failed: principal residue clouds are incorrect.');
  }

  if (generatedResidues().join(',') !== '0,2,4,6,8,10') {
    throw new Error('Rings Ch10 invariant failed: (4,6) must be the even residues modulo 12.');
  }

  const union = new Set([...left, ...right]);
  if (union.has(mod(4 - 6, RESIDUE_MODULUS))) {
    throw new Error('Rings Ch10 invariant failed: the union witness 4-6=10 must escape.');
  }
}

verifyRingsCh10Model();
