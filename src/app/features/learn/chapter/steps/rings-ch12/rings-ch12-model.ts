import {
  allPairs,
  mod,
  Pair,
  pairKey,
  principalPairMembers,
  subtractPairs,
} from '../rings-ch10/rings-ch10-model';

export const MODULUS = 12;
export const RESIDUES = Array.from({ length: MODULUS }, (_, value) => value);
export const IDEAL_I = [0, 4, 8] as const;

export type CandidateMap = 'mod2' | 'mod3' | 'zero';
export type CompressionTarget = 'quotient' | 'parity' | 'zero';

export interface QuotientClass {
  readonly index: number;
  readonly representative: number;
  readonly members: readonly number[];
}

export interface MapDefinition {
  readonly id: CandidateMap;
  readonly label: string;
  readonly targetLabel: string;
  readonly targetSize: number;
}

export interface PairBucket {
  readonly representative: Pair;
  readonly members: readonly Pair[];
}

export const MAP_DEFINITIONS: readonly MapDefinition[] = [
  { id: 'mod2', label: 'f₂(x)=x mod 2', targetLabel: 'ℤ/2ℤ', targetSize: 2 },
  { id: 'mod3', label: 'f₃(x)=x mod 3', targetLabel: 'ℤ/3ℤ', targetSize: 3 },
  { id: 'zero', label: 'z(x)=0', targetLabel: 'zero ring', targetSize: 1 },
];

export function mod12(value: number): number {
  return ((value % MODULUS) + MODULUS) % MODULUS;
}

export function quotientClasses(): readonly QuotientClass[] {
  return [0, 1, 2, 3].map(index => ({
    index,
    representative: index,
    members: RESIDUES.filter(value => mod12(value - index) % 4 === 0),
  }));
}

export function quotientClassIndex(value: number): number {
  return mod12(value) % 4;
}

export function quotientClassFor(value: number): QuotientClass {
  return quotientClasses()[quotientClassIndex(value)];
}

export function classLabel(index: number): string {
  return `C${index}`;
}

export function mapOutput(map: CandidateMap, value: number): number {
  const normalized = mod12(value);
  if (map === 'mod2') return normalized % 2;
  if (map === 'mod3') return normalized % 3;
  return 0;
}

export function mapDefinition(map: CandidateMap): MapDefinition {
  return MAP_DEFINITIONS.find(definition => definition.id === map)!;
}

export function zeroFiberOutputs(map: CandidateMap): readonly number[] {
  return IDEAL_I.map(value => mapOutput(map, value));
}

export function killsIdeal(map: CandidateMap): boolean {
  return zeroFiberOutputs(map).every(output => output === 0);
}

export function classOutputs(map: CandidateMap, classIndex: number): readonly number[] {
  return quotientClasses()[classIndex].members.map(value => mapOutput(map, value));
}

export function inducedOutput(map: CandidateMap, classIndex: number): number | null {
  const outputs = [...new Set(classOutputs(map, classIndex))];
  return outputs.length === 1 ? outputs[0] : null;
}

export function compressionTargetForClass(target: CompressionTarget, classIndex: number): number {
  if (target === 'quotient') return classIndex;
  if (target === 'parity') return classIndex % 2;
  return 0;
}

export function compressionTargetSize(target: CompressionTarget): number {
  return target === 'quotient' ? 4 : target === 'parity' ? 2 : 1;
}

export function targetClassSources(target: CompressionTarget, targetIndex: number): readonly number[] {
  return quotientClasses()
    .map(quotientClass => quotientClass.index)
    .filter(index => compressionTargetForClass(target, index) === targetIndex);
}

// Compatibility helpers used by the current Ch13 implementation. They are not
// part of the Ch12 learning flow.
export const IDEAL_K: readonly Pair[] = principalPairMembers();

export function addPairs(left: Pair, right: Pair): Pair {
  return [mod(left[0] + right[0], 4), mod(left[1] + right[1], 4)];
}

export function containsPair(boundary: readonly Pair[], value: Pair): boolean {
  const key = pairKey(value);
  return boundary.some(member => pairKey(member) === key);
}

export function pairPartition(boundary: readonly Pair[]): PairBucket[] {
  const cards = allPairs();
  const remaining = new Set(cards.map(pairKey));
  const boundaryKeys = new Set(boundary.map(pairKey));
  const buckets: PairBucket[] = [];
  while (remaining.size > 0) {
    const representativeKey = remaining.values().next().value as string;
    const representative = cards.find(card => pairKey(card) === representativeKey)!;
    const members = cards.filter(card => boundaryKeys.has(pairKey(subtractPairs(card, representative))));
    buckets.push({ representative, members });
    for (const member of members) remaining.delete(pairKey(member));
  }
  return buckets;
}

export function pairBucketIndex(value: Pair, boundary: readonly Pair[]): number {
  return pairPartition(boundary)
    .findIndex(bucket => bucket.members.some(member => pairKey(member) === pairKey(value)));
}

export function verifyRingsCh12Model(): void {
  const classes = quotientClasses();
  if (classes.length !== 4 || classes.map(item => item.members.join(',')).join('|') !== '0,4,8|1,5,9|2,6,10|3,7,11') {
    throw new Error('Rings Ch12 invariant failed: quotient fibers are incorrect.');
  }
  if (!killsIdeal('mod2') || killsIdeal('mod3') || !killsIdeal('zero')) {
    throw new Error('Rings Ch12 invariant failed: descent gate verdicts are incorrect.');
  }
  if ([0, 1, 2, 3].map(index => inducedOutput('mod2', index)).join(',') !== '0,1,0,1') {
    throw new Error('Rings Ch12 invariant failed: induced parity map is incorrect.');
  }
  if ([0, 1, 2, 3].some(index => inducedOutput('mod3', index) !== null)) {
    throw new Error('Rings Ch12 invariant failed: mod 3 must conflict on every quotient class.');
  }
  if (targetClassSources('parity', 0).join(',') !== '0,2'
    || targetClassSources('parity', 1).join(',') !== '1,3'
    || targetClassSources('zero', 0).join(',') !== '0,1,2,3') {
    throw new Error('Rings Ch12 invariant failed: compression factor targets are incorrect.');
  }
}

verifyRingsCh12Model();
