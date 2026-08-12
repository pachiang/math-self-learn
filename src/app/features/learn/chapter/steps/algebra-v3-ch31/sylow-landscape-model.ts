import {
  type Coset,
  type Permutation,
  S4,
  S4_P2,
  S4_P4,
  S4_P8,
  compose,
  conjugateSubgroup,
  cyclePermutation,
  generatedSubgroup,
  inversePermutation,
  leftCosets,
  normalizer,
  pPart,
  permutationKey,
  permutationLabel,
  sameSubgroup,
} from '../algebra-v3-ch30/sylow-model';

export interface SylowPoint {
  id: string;
  subgroup: Permutation[];
  frames: Permutation[];
}

export interface SylowOrbit {
  indices: number[];
  fixed: boolean;
}

export interface MagnetCoset {
  coset: Coset;
  fixed: boolean;
  targetIndex: number;
}

export interface ConstraintResult {
  order: number;
  prime: number;
  power: number;
  exponent: number;
  rest: number;
  divisors: number[];
  survivors: number[];
}

export function uniqueConjugates(group: Permutation[], subgroup: Permutation[]): SylowPoint[] {
  const points: SylowPoint[] = [];
  for (const frame of group) {
    const conjugate = conjugateSubgroup(subgroup, frame);
    const existing = points.find((point) => sameSubgroup(point.subgroup, conjugate));
    if (existing) {
      existing.frames.push(frame);
    } else {
      points.push({
        id: `P${points.length + 1}`,
        subgroup: conjugate,
        frames: [frame],
      });
    }
  }
  return points;
}

export function subgroupActionOrbits(actors: Permutation[], points: SylowPoint[]): SylowOrbit[] {
  const unassigned = new Set(points.map((_, index) => index));
  const orbits: SylowOrbit[] = [];
  while (unassigned.size) {
    const start = unassigned.values().next().value as number;
    const indices = new Set<number>();
    const queue = [start];
    while (queue.length) {
      const index = queue.shift()!;
      if (indices.has(index)) continue;
      indices.add(index);
      for (const actor of actors) {
        const output = conjugateSubgroup(points[index].subgroup, actor);
        const destination = points.findIndex((point) => sameSubgroup(point.subgroup, output));
        if (destination >= 0 && !indices.has(destination)) queue.push(destination);
      }
    }
    indices.forEach((index) => unassigned.delete(index));
    const sorted = [...indices].sort((left, right) => left - right);
    orbits.push({ indices: sorted, fixed: sorted.length === 1 });
  }
  return orbits.sort((left, right) => left.indices[0] - right.indices[0]);
}

export function frameBuckets(source: Permutation[], points: SylowPoint[]): Permutation[][] {
  return points.map((point) =>
    S4.filter((frame) => sameSubgroup(conjugateSubgroup(source, frame), point.subgroup)),
  );
}

export function magnetCosets(
  actors: Permutation[],
  baseSylow: Permutation[],
  points: SylowPoint[],
): MagnetCoset[] {
  return leftCosets(S4, baseSylow).map((coset) => {
    const memberKeys = new Set(coset.members.map(permutationKey));
    const fixed = actors.every((actor) =>
      memberKeys.has(permutationKey(compose(actor, coset.representative))),
    );
    const containingSylow = conjugateSubgroup(baseSylow, inversePermutation(coset.representative));
    return {
      coset,
      fixed,
      targetIndex: points.findIndex((point) => sameSubgroup(point.subgroup, containingSylow)),
    };
  });
}

export function subgroupSummary(subgroup: Permutation[], limit = 4): string {
  const labels = subgroup.map(permutationLabel);
  return labels.length <= limit
    ? `{ ${labels.join(', ')} }`
    : `{ ${labels.slice(0, limit).join(', ')}, … }`;
}

export function divisorsOf(value: number): number[] {
  const divisors: number[] = [];
  for (let candidate = 1; candidate <= value; candidate += 1) {
    if (value % candidate === 0) divisors.push(candidate);
  }
  return divisors;
}

export function sylowConstraints(order: number, prime: number): ConstraintResult {
  const { exponent, power, rest } = pPart(order, prime);
  const divisors = divisorsOf(rest);
  return {
    order,
    prime,
    exponent,
    power,
    rest,
    divisors,
    survivors: divisors.filter((candidate) => candidate % prime === 1),
  };
}

export const S4_SYLOW_2_POINTS = uniqueConjugates(S4, S4_P8);
export const S4_P3 = generatedSubgroup(4, [cyclePermutation(4, [1, 2, 3])]);
export const S4_SYLOW_3_POINTS = uniqueConjugates(S4, S4_P3);

export const MAGNET_ACTORS = [
  { label: 'H₂ = ⟨(12)⟩', note: 'order 2 seed', subgroup: S4_P2 },
  { label: 'H₄ = ⟨(12),(34)⟩', note: 'order 4 rung', subgroup: S4_P4 },
  {
    label: 'H₈ = Sylow point P₂',
    note: '另一個 Sylow point',
    subgroup: S4_SYLOW_2_POINTS[1].subgroup,
  },
] as const;

export const SYLOW_ACTION_EXAMPLES = [
  {
    label: 'S₄ · p=2',
    prime: 2,
    actors: S4_P8,
    points: S4_SYLOW_2_POINTS,
  },
  {
    label: 'S₄ · p=3',
    prime: 3,
    actors: S4_P3,
    points: S4_SYLOW_3_POINTS,
  },
] as const;

export const CONSTRAINT_PRESETS = [
  { order: 12, prime: 3 },
  { order: 24, prime: 2 },
  { order: 60, prime: 5 },
  { order: 21, prime: 7 },
  { order: 21, prime: 3 },
] as const;

export const S4_P8_NORMALIZER = normalizer(S4, S4_P8);
