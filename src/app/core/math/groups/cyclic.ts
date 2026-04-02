import { Permutation } from '../permutation';
import { Group, GroupElement, GeometricTransform, findElement } from '../group';
import { superscript, subscript } from '../../../shared/utils/math-notation';

export function createCyclicGroup(n: number): Group {
  const elements: GroupElement[] = [];

  for (let k = 0; k < n; k++) {
    const mapping = Array.from({ length: n }, (_, i) => (i + k) % n);
    const label = k === 0 ? 'e' : k === 1 ? 'r' : `r${superscript(k)}`;
    const transform: GeometricTransform =
      k === 0
        ? { type: 'identity' }
        : { type: 'rotation', angleDeg: (k * 360) / n };
    elements.push({
      id: `r${k}`,
      label,
      permutation: new Permutation(mapping),
      transform,
    });
  }

  const identity = elements[0];

  const group: Group = {
    name: `循環群`,
    notation: `Z${subscript(n)}`,
    description: `${n} 階循環群`,
    vertices: n,
    elements,
    generators: n > 1 ? [elements[1]] : [],
    identity,
    multiply(a: GroupElement, b: GroupElement): GroupElement {
      return findElement(group, a.permutation.compose(b.permutation));
    },
    inverse(a: GroupElement): GroupElement {
      return findElement(group, a.permutation.inverse());
    },
  };

  return group;
}
