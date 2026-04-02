import { Permutation } from './permutation';

export type GeometricTransform =
  | { type: 'identity' }
  | { type: 'rotation'; angleDeg: number }
  | { type: 'reflection'; axisDx: number; axisDy: number };

export interface GroupElement {
  id: string;
  label: string;
  permutation: Permutation;
  transform: GeometricTransform;
}

export interface Group {
  name: string;
  notation: string;
  description: string;
  vertices: number;
  elements: GroupElement[];
  generators: GroupElement[];
  identity: GroupElement;
  multiply(a: GroupElement, b: GroupElement): GroupElement;
  inverse(a: GroupElement): GroupElement;
}

export function findElement(group: Group, perm: Permutation): GroupElement {
  const found = group.elements.find((e) => e.permutation.equals(perm));
  if (!found) throw new Error('Element not found in group');
  return found;
}
