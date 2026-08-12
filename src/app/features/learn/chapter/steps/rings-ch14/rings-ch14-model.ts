export type IdealKey = 'k' | 'two' | 'three' | 'r';

export interface IdealRecord {
  readonly key: IdealKey;
  readonly upstairsName: string;
  readonly downstairsName: string;
  readonly upstairs: readonly number[];
  readonly downstairs: readonly number[];
  readonly tier: 'bottom' | 'middle-left' | 'middle-right' | 'top';
}

export interface QuotientClass {
  readonly index: number;
  readonly members: readonly number[];
}

export const CH14_RESIDUES = Array.from({ length: 12 }, (_, value) => value);
export const CH14_CLASSES: readonly QuotientClass[] = Array.from({ length: 6 }, (_, index) => ({
  index,
  members: [index, index + 6],
}));

export const CH14_IDEALS: readonly IdealRecord[] = [
  { key: 'k', upstairsName: 'K=(6)', downstairsName: '0̄', upstairs: [0, 6], downstairs: [0], tier: 'bottom' },
  { key: 'two', upstairsName: '(2)', downstairsName: '(2)/K', upstairs: [0, 2, 4, 6, 8, 10], downstairs: [0, 2, 4], tier: 'middle-left' },
  { key: 'three', upstairsName: '(3)', downstairsName: '(3)/K', upstairs: [0, 3, 6, 9], downstairs: [0, 3], tier: 'middle-right' },
  { key: 'r', upstairsName: 'R', downstairsName: 'R/K', upstairs: CH14_RESIDUES, downstairs: [0, 1, 2, 3, 4, 5], tier: 'top' },
];

export const CH14_EDGES: readonly [IdealKey, IdealKey][] = [
  ['k', 'two'], ['k', 'three'], ['two', 'r'], ['three', 'r'],
];

export function idealRecord(key: IdealKey): IdealRecord {
  const record = CH14_IDEALS.find(ideal => ideal.key === key);
  if (!record) throw new Error(`Unknown Ch14 ideal: ${key}`);
  return record;
}

export function classLabel(index: number): string { return `C${index}`; }
export function setLabel(values: readonly number[]): string { return `{${values.join(',')}}`; }
export function classSetLabel(values: readonly number[]): string { return `{${values.map(classLabel).join(',')}}`; }
export function project(value: number): number { return ((value % 6) + 6) % 6; }

export function pullback(downstairs: readonly number[]): readonly number[] {
  return CH14_RESIDUES.filter(value => downstairs.includes(project(value)));
}

export function pushdown(upstairs: readonly number[]): readonly number[] {
  return [...new Set(upstairs.map(project))].sort((a, b) => a - b);
}

export function isSubset(left: readonly number[], right: readonly number[]): boolean {
  return left.every(value => right.includes(value));
}

export function compareIdeals(left: IdealKey, right: IdealKey): 'subset' | 'superset' | 'equal' | 'incomparable' {
  const leftSet = idealRecord(left).upstairs;
  const rightSet = idealRecord(right).upstairs;
  const leftInRight = isSubset(leftSet, rightSet);
  const rightInLeft = isSubset(rightSet, leftSet);
  if (leftInRight && rightInLeft) return 'equal';
  if (leftInRight) return 'subset';
  if (rightInLeft) return 'superset';
  return 'incomparable';
}

export function directJClass(value: number): number { return ((value % 3) + 3) % 3; }
export function firstStageClass(value: number): number { return project(value); }
export function secondStageClass(quotientIndex: number): number { return ((quotientIndex % 3) + 3) % 3; }
export function finalBundle(index: number): readonly number[] { return CH14_RESIDUES.filter(value => directJClass(value) === index); }

export function verifyRingsCh14Model(): void {
  const kernel = idealRecord('k').upstairs;
  for (const ideal of CH14_IDEALS) {
    if (!isSubset(kernel, ideal.upstairs)) throw new Error('Ch14 invariant failed: every upstairs ideal must contain K.');
    if (pullback(ideal.downstairs).join(',') !== ideal.upstairs.join(',')) throw new Error('Ch14 invariant failed: pullback mismatch.');
    if (pushdown(ideal.upstairs).join(',') !== ideal.downstairs.join(',')) throw new Error('Ch14 invariant failed: pushdown mismatch.');
  }
  for (const left of CH14_IDEALS) for (const right of CH14_IDEALS) {
    if (isSubset(left.upstairs, right.upstairs) !== isSubset(left.downstairs, right.downstairs)) {
      throw new Error('Ch14 invariant failed: correspondence must preserve inclusion.');
    }
  }
  for (const value of CH14_RESIDUES) {
    if (secondStageClass(firstStageClass(value)) !== directJClass(value)) {
      throw new Error('Ch14 invariant failed: two-stage and direct quotient must agree.');
    }
  }
}

verifyRingsCh14Model();
