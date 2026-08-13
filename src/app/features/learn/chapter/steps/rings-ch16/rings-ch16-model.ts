import {
  allPairs,
  mod,
  multiplyPairs,
  Pair,
  pairKey,
  pairLabel,
  principalPairMembers,
  subtractPairs,
} from '../rings-ch10/rings-ch10-model';

export type MaximalCandidateId = 'Q' | 'K';
export type NamedIdealId = 'Q' | 'K' | 'L' | 'R';

export interface PairBucket {
  readonly representative: Pair;
  readonly members: readonly Pair[];
}

export interface EnlargementCertificate {
  readonly output: Pair;
  readonly idealMember: Pair;
  readonly coefficient: Pair;
  readonly seedMultiple: Pair;
}

export interface EnlargementAuditRecord {
  readonly seed: Pair;
  readonly destination: NamedIdealId;
  readonly reachesWholeRing: boolean;
}

export interface InverseCertificate {
  readonly sourceClass: number;
  readonly inverseClass: number;
  readonly sourceRepresentative: Pair;
  readonly inverseRepresentative: Pair;
  readonly rawProduct: Pair;
  readonly idealCorrection: Pair;
}

export interface ClassInverseAudit {
  readonly classIndex: number;
  readonly label: string;
  readonly representative: Pair;
  readonly members: readonly Pair[];
  readonly isZero: boolean;
  readonly inverse: InverseCertificate | null;
}

export const IDENTITY: Pair = [1, 1];
export const IDEAL_Q: readonly Pair[] = principalPairMembers([2, 2]);
export const IDEAL_K: readonly Pair[] = principalPairMembers([1, 2]);
export const IDEAL_L: readonly Pair[] = principalPairMembers([2, 1]);

export function addPairs(left: Pair, right: Pair): Pair {
  return [mod(left[0] + right[0], 4), mod(left[1] + right[1], 4)];
}

export function containsPair(boundary: readonly Pair[], value: Pair): boolean {
  const key = pairKey(value);
  return boundary.some(member => pairKey(member) === key);
}

export function candidateMembers(id: MaximalCandidateId): readonly Pair[] {
  return id === 'Q' ? IDEAL_Q : IDEAL_K;
}

export function outsideSeeds(id: MaximalCandidateId): Pair[] {
  const members = candidateMembers(id);
  return allPairs().filter(card => !containsPair(members, card));
}

export function pairSetLabel(values: readonly Pair[]): string {
  return `{${values.map(pairLabel).join(', ')}}`;
}

function samePairSet(left: readonly Pair[], right: readonly Pair[]): boolean {
  const rightKeys = new Set(right.map(pairKey));
  return left.length === right.length && left.every(member => rightKeys.has(pairKey(member)));
}

export function quotientClasses(id: MaximalCandidateId): PairBucket[] {
  const cards = allPairs();
  const boundary = candidateMembers(id);
  const remaining = new Set(cards.map(pairKey));
  const buckets: PairBucket[] = [];
  while (remaining.size > 0) {
    const representativeKey = remaining.values().next().value as string;
    const representative = cards.find(card => pairKey(card) === representativeKey)!;
    const members = cards.filter(card => containsPair(boundary, subtractPairs(card, representative)));
    buckets.push({ representative, members });
    for (const member of members) remaining.delete(pairKey(member));
  }
  return buckets;
}

export function quotientClassIndex(id: MaximalCandidateId, value: Pair): number {
  return quotientClasses(id).findIndex(bucket => containsPair(bucket.members, value));
}

export function zeroClassIndex(id: MaximalCandidateId): number {
  return quotientClassIndex(id, [0, 0]);
}

export function identityClassIndex(id: MaximalCandidateId): number {
  return quotientClassIndex(id, IDENTITY);
}

export function quotientClassLabel(id: MaximalCandidateId, classIndex: number): string {
  const representative = quotientClasses(id)[classIndex].representative;
  if (id === 'K') return representative[1] % 2 === 0 ? 'E · ZERO CLASS' : 'O · NONZERO CLASS';
  const parity = `${representative[0] % 2}${representative[1] % 2}`;
  return parity === '00' ? '00 · ZERO CLASS' : `${parity} · NONZERO CLASS`;
}

export function quotientProduct(id: MaximalCandidateId, leftClass: number, rightClass: number): number {
  const classes = quotientClasses(id);
  return quotientClassIndex(id, multiplyPairs(classes[leftClass].representative, classes[rightClass].representative));
}

export function enlargementCertificates(id: MaximalCandidateId, seed: Pair): EnlargementCertificate[] {
  const firstByOutput = new Map<string, EnlargementCertificate>();
  for (const idealMember of candidateMembers(id)) {
    for (const coefficient of allPairs()) {
      const seedMultiple = multiplyPairs(coefficient, seed);
      const output = addPairs(idealMember, seedMultiple);
      if (!firstByOutput.has(pairKey(output))) {
        firstByOutput.set(pairKey(output), { output, idealMember, coefficient, seedMultiple });
      }
    }
  }
  return allPairs().flatMap(card => {
    const certificate = firstByOutput.get(pairKey(card));
    return certificate ? [certificate] : [];
  });
}

export function generatedEnlargement(id: MaximalCandidateId, seed: Pair): Pair[] {
  return enlargementCertificates(id, seed).map(certificate => certificate.output);
}

export function namedIdealForMembers(members: readonly Pair[]): NamedIdealId {
  if (samePairSet(members, IDEAL_Q)) return 'Q';
  if (samePairSet(members, IDEAL_K)) return 'K';
  if (samePairSet(members, IDEAL_L)) return 'L';
  if (samePairSet(members, allPairs())) return 'R';
  throw new Error('Rings Ch16 invariant failed: enlargement does not match a named ideal.');
}

export function growthDestination(id: MaximalCandidateId, seed: Pair): NamedIdealId {
  return namedIdealForMembers(generatedEnlargement(id, seed));
}

export function enlargementAudit(id: MaximalCandidateId): EnlargementAuditRecord[] {
  return outsideSeeds(id).map(seed => {
    const destination = growthDestination(id, seed);
    return { seed, destination, reachesWholeRing: destination === 'R' };
  });
}

export function idealIsMaximal(id: MaximalCandidateId): boolean {
  return enlargementAudit(id).every(record => record.reachesWholeRing);
}

export function inverseClassIndex(id: MaximalCandidateId, sourceClass: number): number | null {
  for (let candidate = 0; candidate < quotientClasses(id).length; candidate += 1) {
    if (quotientProduct(id, sourceClass, candidate) === identityClassIndex(id)) return candidate;
  }
  return null;
}

export function inverseCertificate(id: MaximalCandidateId, sourceClass: number): InverseCertificate | null {
  const inverseClass = inverseClassIndex(id, sourceClass);
  if (inverseClass === null) return null;
  const sourceRepresentative = quotientClasses(id)[sourceClass].representative;
  const inverseRepresentative = quotientClasses(id)[inverseClass].representative;
  const rawProduct = multiplyPairs(sourceRepresentative, inverseRepresentative);
  const idealCorrection = subtractPairs(IDENTITY, rawProduct);
  if (!containsPair(candidateMembers(id), idealCorrection)) {
    throw new Error('Rings Ch16 invariant failed: inverse correction is not in the ideal.');
  }
  return { sourceClass, inverseClass, sourceRepresentative, inverseRepresentative, rawProduct, idealCorrection };
}

export function classInverseAudit(id: MaximalCandidateId): ClassInverseAudit[] {
  const zero = zeroClassIndex(id);
  return quotientClasses(id).map((bucket, classIndex) => ({
    classIndex,
    label: quotientClassLabel(id, classIndex),
    representative: bucket.representative,
    members: bucket.members,
    isZero: classIndex === zero,
    inverse: inverseCertificate(id, classIndex),
  }));
}

export function quotientIsField(id: MaximalCandidateId): boolean {
  return classInverseAudit(id).filter(row => !row.isZero).every(row => row.inverse !== null);
}

function verifyIdeal(members: readonly Pair[], label: string): void {
  for (const left of members) {
    for (const right of members) {
      if (!containsPair(members, subtractPairs(left, right))) throw new Error(`${label} is not difference-stable.`);
    }
    for (const ambient of allPairs()) {
      if (!containsPair(members, multiplyPairs(ambient, left))) throw new Error(`${label} is not absorbent.`);
    }
  }
}

export function verifyRingsCh16Model(): void {
  if (IDEAL_Q.length !== 4 || IDEAL_K.length !== 8 || IDEAL_L.length !== 8) {
    throw new Error('Rings Ch16 invariant failed: named ideal sizes are incorrect.');
  }
  verifyIdeal(IDEAL_Q, 'Q');
  verifyIdeal(IDEAL_K, 'K');
  verifyIdeal(IDEAL_L, 'L');

  if (quotientClasses('Q').length !== 4 || quotientClasses('K').length !== 2) {
    throw new Error('Rings Ch16 invariant failed: quotient class counts are incorrect.');
  }
  if (quotientIsField('Q') || !quotientIsField('K')) {
    throw new Error('Rings Ch16 invariant failed: field verdicts are incorrect.');
  }
  if (idealIsMaximal('Q') || !idealIsMaximal('K')) {
    throw new Error('Rings Ch16 invariant failed: maximal verdicts are incorrect.');
  }

  for (const id of ['Q', 'K'] as const) {
    for (const seed of outsideSeeds(id)) {
      const classIndex = quotientClassIndex(id, seed);
      const growthReachesIdentity = containsPair(generatedEnlargement(id, seed), IDENTITY);
      if (growthReachesIdentity !== (inverseCertificate(id, classIndex) !== null)) {
        throw new Error(`Rings Ch16 invariant failed: certificate bridge fails for ${id}/${pairKey(seed)}.`);
      }
      for (const handle of quotientClasses(id)[classIndex].members) {
        if (growthDestination(id, handle) !== growthDestination(id, seed)) {
          throw new Error('Rings Ch16 invariant failed: growth depends on quotient representative.');
        }
      }
    }
  }
}

verifyRingsCh16Model();
