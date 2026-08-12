import {
  allPairs,
  multiplyPairs,
  Pair,
  pairKey,
  pairLabel,
  principalPairMembers,
  subtractPairs,
} from '../rings-ch10/rings-ch10-model';
import { addPairs, containsPair, IDEAL_K } from '../rings-ch12/rings-ch12-model';
import {
  IDEAL_Q,
  isPrimeCandidate,
  isProper,
  quotientClassLabel,
  quotientClasses,
  quotientProduct,
  zeroClassIndex,
} from '../rings-ch15/rings-ch15-model';

export type MaximalCandidateId = 'Q' | 'K';
export type NamedIdealId = 'Q' | 'K' | 'L' | 'R';

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
  readonly isZero: boolean;
  readonly growthDestination: NamedIdealId;
  readonly inverse: InverseCertificate | null;
}

export const IDEAL_L: readonly Pair[] = principalPairMembers([2, 1]);
export const IDENTITY: Pair = [1, 1];

export function candidateMembers(id: MaximalCandidateId): readonly Pair[] {
  return id === 'Q' ? IDEAL_Q : IDEAL_K;
}

export function pairSetLabel(values: readonly Pair[]): string {
  return `{${values.map(pairLabel).join(', ')}}`;
}

function samePairSet(left: readonly Pair[], right: readonly Pair[]): boolean {
  const rightKeys = new Set(right.map(pairKey));
  return left.length === right.length && left.every(member => rightKeys.has(pairKey(member)));
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

export function outsideSeeds(id: MaximalCandidateId): Pair[] {
  const members = candidateMembers(id);
  return allPairs().filter(card => !containsPair(members, card));
}

export function enlargementAudit(id: MaximalCandidateId): EnlargementAuditRecord[] {
  return outsideSeeds(id).map(seed => {
    const destination = growthDestination(id, seed);
    return { seed, destination, reachesWholeRing: destination === 'R' };
  });
}

export function idealIsMaximal(id: MaximalCandidateId): boolean {
  return isProper(id) && enlargementAudit(id).every(record => record.reachesWholeRing);
}

export function inverseClassIndex(id: MaximalCandidateId, classIndex: number): number | null {
  const oneClass = quotientClasses(id).findIndex(bucket => containsPair(bucket.members, IDENTITY));
  for (let candidate = 0; candidate < quotientClasses(id).length; candidate += 1) {
    if (quotientProduct(id, classIndex, candidate) === oneClass) return candidate;
  }
  return null;
}

export function inverseCertificate(id: MaximalCandidateId, classIndex: number): InverseCertificate | null {
  const inverseClass = inverseClassIndex(id, classIndex);
  if (inverseClass === null) return null;
  const sourceRepresentative = quotientClasses(id)[classIndex].representative;
  const inverseRepresentative = quotientClasses(id)[inverseClass].representative;
  const rawProduct = multiplyPairs(sourceRepresentative, inverseRepresentative);
  const idealCorrection = subtractPairs(IDENTITY, rawProduct);
  if (!containsPair(candidateMembers(id), idealCorrection)) {
    throw new Error('Rings Ch16 invariant failed: inverse correction is not in the ideal.');
  }
  return {
    sourceClass: classIndex,
    inverseClass,
    sourceRepresentative,
    inverseRepresentative,
    rawProduct,
    idealCorrection,
  };
}

export function classInverseAudit(id: MaximalCandidateId): ClassInverseAudit[] {
  const zero = zeroClassIndex(id);
  return quotientClasses(id).map((bucket, classIndex) => ({
    classIndex,
    label: quotientClassLabel(id, classIndex),
    representative: bucket.representative,
    isZero: classIndex === zero,
    growthDestination: classIndex === zero ? id : growthDestination(id, bucket.representative),
    inverse: inverseCertificate(id, classIndex),
  }));
}

export function quotientIsField(id: MaximalCandidateId): boolean {
  if (!isProper(id)) return false;
  return classInverseAudit(id).filter(record => !record.isZero).every(record => record.inverse !== null);
}

function verifyIdeal(members: readonly Pair[], label: string): void {
  for (const left of members) {
    for (const right of members) {
      if (!containsPair(members, subtractPairs(left, right))) {
        throw new Error(`Rings Ch16 invariant failed: ${label} is not difference-stable.`);
      }
    }
    for (const ambient of allPairs()) {
      if (!containsPair(members, multiplyPairs(ambient, left))) {
        throw new Error(`Rings Ch16 invariant failed: ${label} is not absorbent.`);
      }
    }
  }
}

export function verifyRingsCh16Model(): void {
  if (IDEAL_Q.length !== 4 || IDEAL_K.length !== 8 || IDEAL_L.length !== 8 || allPairs().length !== 16) {
    throw new Error('Rings Ch16 invariant failed: named ideal sizes are incorrect.');
  }
  verifyIdeal(IDEAL_Q, 'Q');
  verifyIdeal(IDEAL_K, 'K');
  verifyIdeal(IDEAL_L, 'L');

  const qExamples: readonly [Pair, NamedIdealId][] = [
    [[1, 0], 'K'],
    [[0, 1], 'L'],
    [[1, 1], 'R'],
  ];
  for (const [seed, destination] of qExamples) {
    if (growthDestination('Q', seed) !== destination) {
      throw new Error('Rings Ch16 invariant failed: Q focused growth destination is incorrect.');
    }
  }
  for (const seed of [[0, 1], [2, 1], [3, 3]] as const) {
    if (growthDestination('K', seed) !== 'R') {
      throw new Error('Rings Ch16 invariant failed: every focused K outside seed must reach R.');
    }
  }

  const qAudit = enlargementAudit('Q');
  const kAudit = enlargementAudit('K');
  if (qAudit.length !== 12 || qAudit.filter(record => record.reachesWholeRing).length !== 4
    || qAudit.filter(record => !record.reachesWholeRing).length !== 8) {
    throw new Error('Rings Ch16 invariant failed: Q enlargement audit must split 4 whole / 8 intermediate.');
  }
  if (kAudit.length !== 8 || kAudit.some(record => !record.reachesWholeRing)) {
    throw new Error('Rings Ch16 invariant failed: all eight K outside seeds must reach R.');
  }
  if (idealIsMaximal('Q') || !idealIsMaximal('K')) {
    throw new Error('Rings Ch16 invariant failed: maximality verdicts are incorrect.');
  }

  for (const id of ['Q', 'K'] as const) {
    for (const seed of outsideSeeds(id)) {
      const classIndex = quotientClasses(id).findIndex(bucket => containsPair(bucket.members, seed));
      const growthIsWhole = growthDestination(id, seed) === 'R';
      const hasInverse = inverseCertificate(id, classIndex) !== null;
      if (growthIsWhole !== hasInverse) {
        throw new Error(`Rings Ch16 invariant failed: growth/inverse bridge fails for ${id} and ${pairKey(seed)}.`);
      }
      for (const certificate of enlargementCertificates(id, seed)) {
        if (pairKey(addPairs(certificate.idealMember, certificate.seedMultiple)) !== pairKey(certificate.output)
          || pairKey(multiplyPairs(certificate.coefficient, seed)) !== pairKey(certificate.seedMultiple)) {
          throw new Error('Rings Ch16 invariant failed: enlargement certificate is invalid.');
        }
      }
    }
  }

  const kRows = classInverseAudit('K');
  const qRows = classInverseAudit('Q');
  if (kRows.length !== 2 || kRows.filter(row => !row.isZero && row.inverse !== null).length !== 1) {
    throw new Error('Rings Ch16 invariant failed: R/K inverse audit is incorrect.');
  }
  if (qRows.length !== 4 || qRows.filter(row => !row.isZero && row.inverse !== null).length !== 1
    || qRows.filter(row => !row.isZero && row.inverse === null).length !== 2) {
    throw new Error('Rings Ch16 invariant failed: R/Q inverse audit is incorrect.');
  }
  if (quotientIsField('Q') || !quotientIsField('K') || idealIsMaximal('Q') !== quotientIsField('Q')
    || idealIsMaximal('K') !== quotientIsField('K')) {
    throw new Error('Rings Ch16 invariant failed: maximal/field correspondence is incorrect.');
  }
  if (!isPrimeCandidate('K') || isPrimeCandidate('Q')) {
    throw new Error('Rings Ch16 invariant failed: maximal/prime instance relationship is incorrect.');
  }

  const openClass = quotientClasses('K').findIndex(bucket => containsPair(bucket.members, [0, 1]));
  const openCertificate = inverseCertificate('K', openClass);
  if (!openCertificate || pairKey(openCertificate.idealCorrection) !== '1,0'
    || pairKey(openCertificate.inverseRepresentative) !== '0,1') {
    throw new Error('Rings Ch16 invariant failed: focused identity certificate must be 1=(1,0)+(0,1)(0,1).');
  }

  if ((3 * 2 - 1) % 5 !== 0 || 6 % 2 !== 0 || 2 % 6 === 0) {
    throw new Error('Rings Ch16 invariant failed: integer transfers are incorrect.');
  }
}

verifyRingsCh16Model();
