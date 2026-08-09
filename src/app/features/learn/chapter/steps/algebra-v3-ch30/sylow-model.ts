export type Permutation = readonly number[];

export interface Coset {
  key: string;
  representative: Permutation;
  members: Permutation[];
  label: string;
}

export interface CosetOrbit {
  indices: number[];
  fixed: boolean;
}

export interface GrowthStage {
  name: string;
  subgroup: Permutation[];
  cosets: Coset[];
  orbits: CosetOrbit[];
  normalizer: Permutation[];
  fixedCosets: Coset[];
}

export function permutationKey(permutation: Permutation): string {
  return permutation.join('');
}

export function identityPermutation(size: number): Permutation {
  return Array.from({ length: size }, (_, index) => index);
}

export function compose(left: Permutation, right: Permutation): Permutation {
  return right.map((image) => left[image]);
}

export function inversePermutation(permutation: Permutation): Permutation {
  const result = Array(permutation.length).fill(0);
  permutation.forEach((image, source) => (result[image] = source));
  return result;
}

export function cyclePermutation(size: number, ...cycles: number[][]): Permutation {
  const result = [...identityPermutation(size)];
  for (const cycle of cycles) {
    cycle.forEach((value, index) => {
      result[value - 1] = cycle[(index + 1) % cycle.length] - 1;
    });
  }
  return result;
}

export function permutationLabel(permutation: Permutation): string {
  const visited = new Set<number>();
  const cycles: string[] = [];
  for (let start = 0; start < permutation.length; start += 1) {
    if (visited.has(start) || permutation[start] === start) continue;
    const cycle: number[] = [];
    let current = start;
    while (!visited.has(current)) {
      visited.add(current);
      cycle.push(current + 1);
      current = permutation[current];
    }
    cycles.push(`(${cycle.join('')})`);
  }
  return cycles.length ? cycles.join('') : 'e';
}

export function allPermutations(size: number): Permutation[] {
  const build = (prefix: number[], remaining: number[]): number[][] =>
    remaining.length === 0
      ? [prefix]
      : remaining.flatMap((value, index) =>
          build([...prefix, value], [...remaining.slice(0, index), ...remaining.slice(index + 1)]),
        );
  return build([], [...identityPermutation(size)]);
}

export function generatedSubgroup(size: number, generators: Permutation[]): Permutation[] {
  const identity = identityPermutation(size);
  const moves = [...generators, ...generators.map(inversePermutation)];
  const known = new Map([[permutationKey(identity), identity]]);
  const queue: Permutation[] = [identity];
  while (queue.length) {
    const current = queue.shift()!;
    for (const move of moves) {
      const next = compose(current, move);
      const key = permutationKey(next);
      if (!known.has(key)) {
        known.set(key, next);
        queue.push(next);
      }
    }
  }
  return sortPermutations([...known.values()]);
}

export function conjugateSubgroup(subgroup: Permutation[], frame: Permutation): Permutation[] {
  const frameInverse = inversePermutation(frame);
  return sortPermutations(
    subgroup.map((element) => compose(compose(frameInverse, element), frame)),
  );
}

export function sameSubgroup(left: Permutation[], right: Permutation[]): boolean {
  if (left.length !== right.length) return false;
  const rightKeys = new Set(right.map(permutationKey));
  return left.every((element) => rightKeys.has(permutationKey(element)));
}

export function normalizer(group: Permutation[], subgroup: Permutation[]): Permutation[] {
  return sortPermutations(
    group.filter((frame) => sameSubgroup(conjugateSubgroup(subgroup, frame), subgroup)),
  );
}

export function leftCosets(group: Permutation[], subgroup: Permutation[]): Coset[] {
  const remaining = new Set(group.map(permutationKey));
  const cosets: Coset[] = [];
  for (const representative of sortPermutations(group)) {
    if (!remaining.has(permutationKey(representative))) continue;
    const members = sortPermutations(subgroup.map((element) => compose(representative, element)));
    members.forEach((member) => remaining.delete(permutationKey(member)));
    const key = members.map(permutationKey).sort().join('|');
    cosets.push({
      key,
      representative: members[0],
      members,
      label: members.map(permutationLabel).join(' · '),
    });
  }
  return cosets;
}

export function cosetOrbits(subgroup: Permutation[], cosets: Coset[]): CosetOrbit[] {
  const memberToCoset = new Map<string, number>();
  cosets.forEach((coset, index) =>
    coset.members.forEach((member) => memberToCoset.set(permutationKey(member), index)),
  );
  const unassigned = new Set(cosets.map((_, index) => index));
  const orbits: CosetOrbit[] = [];
  while (unassigned.size) {
    const start = unassigned.values().next().value as number;
    const indices = new Set<number>();
    const queue = [start];
    while (queue.length) {
      const index = queue.shift()!;
      if (indices.has(index)) continue;
      indices.add(index);
      const representative = cosets[index].representative;
      for (const actor of subgroup) {
        const destination = memberToCoset.get(permutationKey(compose(actor, representative)));
        if (destination !== undefined && !indices.has(destination)) queue.push(destination);
      }
    }
    indices.forEach((index) => unassigned.delete(index));
    const sorted = [...indices].sort((a, b) => a - b);
    orbits.push({ indices: sorted, fixed: sorted.length === 1 });
  }
  return orbits.sort((a, b) => Number(a.fixed) - Number(b.fixed));
}

export function pPart(
  order: number,
  prime: number,
): { exponent: number; power: number; rest: number } {
  let rest = order;
  let exponent = 0;
  while (rest % prime === 0) {
    rest /= prime;
    exponent += 1;
  }
  return { exponent, power: prime ** exponent, rest };
}

export const S4 = allPermutations(4);
const transposition12 = cyclePermutation(4, [1, 2]);
const transposition34 = cyclePermutation(4, [3, 4]);
export const S4_P2 = generatedSubgroup(4, [transposition12]);
export const S4_P4 = generatedSubgroup(4, [transposition12, transposition34]);
export const S4_P8 = normalizer(S4, S4_P4);

export const S4_GROWTH_STAGES: GrowthStage[] = [
  { name: 'P₂ = ⟨(12)⟩', subgroup: S4_P2 },
  { name: 'P₄ = ⟨(12),(34)⟩', subgroup: S4_P4 },
  { name: 'P₈ = N(P₄)', subgroup: S4_P8 },
].map(({ name, subgroup }) => {
  const cosets = leftCosets(S4, subgroup);
  const orbits = cosetOrbits(subgroup, cosets);
  const subgroupNormalizer = normalizer(S4, subgroup);
  const fixedIndices = new Set(
    orbits.filter((orbit) => orbit.fixed).flatMap((orbit) => orbit.indices),
  );
  return {
    name,
    subgroup,
    cosets,
    orbits,
    normalizer: subgroupNormalizer,
    fixedCosets: cosets.filter((_, index) => fixedIndices.has(index)),
  };
});

export function subgroupLabel(subgroup: Permutation[]): string {
  return `{ ${subgroup.map(permutationLabel).join(', ')} }`;
}

function sortPermutations(permutations: Permutation[]): Permutation[] {
  return [...permutations].sort((left, right) => {
    const leftLabel = permutationLabel(left);
    const rightLabel = permutationLabel(right);
    if (leftLabel === 'e') return -1;
    if (rightLabel === 'e') return 1;
    return leftLabel.localeCompare(rightLabel);
  });
}
