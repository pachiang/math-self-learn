import {
  allPairs,
  mod,
  multiplyPairs,
  Pair,
  pairKey,
  principalPairMembers,
  subtractPairs,
} from '../rings-ch10/rings-ch10-model';

export interface ResidueBucket {
  readonly representative: number;
  readonly members: readonly number[];
}

export type QuotientOperation = 'add' | 'multiply';

export const DIAGONAL_SUBGROUP: readonly Pair[] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 3],
];
export const FUNCTION_IDEAL: readonly Pair[] = principalPairMembers();

export const MODULUS = 12;
export const IDEAL_4 = [0, 4, 8] as const;
export const IDEAL_3 = [0, 3, 6, 9] as const;
export const IDEAL_2 = [0, 2, 4, 6, 8, 10] as const;

export function mod12(value: number): number {
  return ((value % MODULUS) + MODULUS) % MODULUS;
}

export function difference(left: number, right: number): number {
  return mod12(left - right);
}

export function sameUnderIdeal(left: number, right: number, ideal: readonly number[]): boolean {
  return ideal.includes(difference(left, right));
}

export function bucketFor(representative: number, ideal: readonly number[]): ResidueBucket {
  return {
    representative: mod12(representative),
    members: Array.from({ length: MODULUS }, (_, value) => value)
      .filter(value => sameUnderIdeal(value, representative, ideal)),
  };
}

export function partitionByIdeal(ideal: readonly number[]): ResidueBucket[] {
  const remaining = new Set(Array.from({ length: MODULUS }, (_, value) => value));
  const buckets: ResidueBucket[] = [];
  while (remaining.size > 0) {
    const representative = Math.min(...remaining);
    const bucket = bucketFor(representative, ideal);
    buckets.push(bucket);
    for (const member of bucket.members) remaining.delete(member);
  }
  return buckets;
}

export function bucketIndexFor(value: number, partition: readonly ResidueBucket[]): number {
  return partition.findIndex(bucket => bucket.members.includes(mod12(value)));
}

export function refinementTargets(
  fine: readonly ResidueBucket[],
  coarse: readonly ResidueBucket[],
): number[] {
  return fine.map(bucket => bucketIndexFor(bucket.representative, coarse));
}

export function addPairs(left: Pair, right: Pair): Pair {
  return [mod(left[0] + right[0], 4), mod(left[1] + right[1], 4)];
}

export function pairBoundaryContains(boundary: readonly Pair[], value: Pair): boolean {
  const key = pairKey(value);
  return boundary.some(member => pairKey(member) === key);
}

export function sameUnderPairBoundary(left: Pair, right: Pair, boundary: readonly Pair[]): boolean {
  return pairBoundaryContains(boundary, subtractPairs(left, right));
}

export function residueClassIndex(value: number, ideal: readonly number[] = IDEAL_4): number {
  const normalized = mod12(value);
  return partitionByIdeal(ideal).findIndex(bucket => bucket.members.includes(normalized));
}

export function operateResidues(left: number, right: number, operation: QuotientOperation): number {
  return operation === 'add' ? mod12(left + right) : mod12(left * right);
}

export function quotientOperation(
  left: number,
  right: number,
  operation: QuotientOperation,
  ideal: readonly number[] = IDEAL_4,
): { readonly raw: number; readonly outputClass: number } {
  const raw = operateResidues(left, right, operation);
  return { raw, outputClass: residueClassIndex(raw, ideal) };
}

export function functionSameUnderGeneratedIdeal(left: Pair, right: Pair): boolean {
  const idealKeys = new Set(principalPairMembers().map(pairKey));
  return idealKeys.has(pairKey(subtractPairs(left, right)));
}

export function functionResolutionBucketCount(): number {
  const cards = allPairs();
  const remaining = new Set(cards.map(pairKey));
  let count = 0;
  while (remaining.size > 0) {
    const representativeKey = remaining.values().next().value as string;
    const representative = cards.find(card => pairKey(card) === representativeKey)!;
    for (const card of cards) {
      if (functionSameUnderGeneratedIdeal(card, representative)) remaining.delete(pairKey(card));
    }
    count += 1;
  }
  return count;
}

export function verifyRingsCh11Model(): void {
  if (!sameUnderIdeal(1, 5, IDEAL_4) || sameUnderIdeal(1, 3, IDEAL_4)) {
    throw new Error('Rings Ch11 invariant failed: pair verdicts under (4) are incorrect.');
  }

  const fine = partitionByIdeal(IDEAL_4);
  const transfer = partitionByIdeal(IDEAL_3);
  const coarse = partitionByIdeal(IDEAL_2);
  if (fine.length !== 4 || fine.some(bucket => bucket.members.length !== 3)) {
    throw new Error('Rings Ch11 invariant failed: (4) must form four 3-card buckets.');
  }
  if (transfer.length !== 3 || transfer.some(bucket => bucket.members.length !== 4)) {
    throw new Error('Rings Ch11 invariant failed: (3) must form three 4-card buckets.');
  }
  if (coarse.length !== 2 || coarse.some(bucket => bucket.members.length !== 6)) {
    throw new Error('Rings Ch11 invariant failed: (2) must form two 6-card buckets.');
  }

  const targets = refinementTargets(fine, coarse);
  if (targets.join(',') !== '0,1,0,1') {
    throw new Error('Rings Ch11 invariant failed: fine buckets must merge whole into parity buckets.');
  }
  if (functionResolutionBucketCount() !== 2) {
    throw new Error('Rings Ch11 invariant failed: (1,2) must induce two function-card buckets.');
  }

  const baseX: Pair = [1, 0];
  const alternateX: Pair = [3, 2];
  const fixedY: Pair = [1, 0];
  const baseSum = addPairs(baseX, fixedY);
  const alternateSum = addPairs(alternateX, fixedY);
  const baseProduct = multiplyPairs(baseX, fixedY);
  const alternateProduct = multiplyPairs(alternateX, fixedY);
  if (!sameUnderPairBoundary(baseX, alternateX, DIAGONAL_SUBGROUP)
    || !sameUnderPairBoundary(baseSum, alternateSum, DIAGONAL_SUBGROUP)
    || sameUnderPairBoundary(baseProduct, alternateProduct, DIAGONAL_SUBGROUP)) {
    throw new Error('Rings Ch11 invariant failed: additive subgroup safety witness is incorrect.');
  }
  if (!sameUnderPairBoundary(baseProduct, alternateProduct, FUNCTION_IDEAL)) {
    throw new Error('Rings Ch11 invariant failed: ideal absorption must repair multiplication ambiguity.');
  }

  const addA = quotientOperation(1, 3, 'add');
  const addB = quotientOperation(5, 7, 'add');
  const multiplyA = quotientOperation(1, 3, 'multiply');
  const multiplyB = quotientOperation(5, 7, 'multiply');
  if (addA.outputClass !== addB.outputClass || multiplyA.outputClass !== multiplyB.outputClass) {
    throw new Error('Rings Ch11 invariant failed: quotient operations depend on representatives.');
  }
}

verifyRingsCh11Model();
