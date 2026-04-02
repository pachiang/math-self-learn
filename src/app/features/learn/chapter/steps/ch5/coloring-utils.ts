import { Permutation } from '../../../../../core/math/permutation';
import { Group, GroupElement } from '../../../../../core/math/group';

export const PALETTE = ['var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)'];
export const PALETTE_NAMES = ['\u25CF', '\u25CB'];

/** Apply a permutation to a vertex coloring: new[j] = old[\u03C3\u207B\u00B9(j)]. */
export function applyPerm(perm: Permutation, coloring: number[]): number[] {
  const inv = perm.inverse();
  return coloring.map((_, i) => coloring[inv.apply(i)]);
}

/** Generate all k-colorings of n vertices. */
export function allColorings(n: number, k: number): number[][] {
  if (n === 0) return [[]];
  const rest = allColorings(n - 1, k);
  return Array.from({ length: k }, (_, c) =>
    rest.map((r) => [...r, c]),
  ).flat();
}

/** Coloring key for deduplication. */
export function coloringKey(c: number[]): string {
  return c.join(',');
}

/** Compute the orbit of a coloring under a group. */
export function orbit(group: Group, coloring: number[]): number[][] {
  const seen = new Set<string>();
  const result: number[][] = [];
  for (const el of group.elements) {
    const c = applyPerm(el.permutation, coloring);
    const key = coloringKey(c);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(c);
    }
  }
  return result;
}

/** Find the stabilizer of a coloring (elements that fix it). */
export function stabilizer(group: Group, coloring: number[]): GroupElement[] {
  const key = coloringKey(coloring);
  return group.elements.filter(
    (el) => coloringKey(applyPerm(el.permutation, coloring)) === key,
  );
}

/** Count colorings fixed by a given element. */
export function fixedCount(el: GroupElement, allC: number[][]): number {
  return allC.filter(
    (c) => coloringKey(applyPerm(el.permutation, c)) === coloringKey(c),
  ).length;
}

/** Partition all colorings into orbits. */
export function allOrbits(group: Group, colorings: number[][]): number[][][] {
  const assigned = new Set<string>();
  const orbits: number[][][] = [];
  for (const c of colorings) {
    const key = coloringKey(c);
    if (assigned.has(key)) continue;
    const orb = orbit(group, c);
    orb.forEach((o) => assigned.add(coloringKey(o)));
    orbits.push(orb);
  }
  return orbits;
}

/** SVG points for a mini-triangle (vertex 0=top, 1=bottom-right, 2=bottom-left). */
export const MINI_TRI = {
  points: '30,6 55,50 5,50',
  vertices: [
    { x: 30, y: 6 },   // vertex 0 (top)
    { x: 55, y: 50 },  // vertex 1 (bottom-right)
    { x: 5, y: 50 },   // vertex 2 (bottom-left)
  ],
  viewBox: '0 0 60 56',
  width: 60,
  height: 56,
};
