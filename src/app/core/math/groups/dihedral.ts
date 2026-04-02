import { Permutation } from '../permutation';
import {
  Group,
  GroupElement,
  GeometricTransform,
  findElement,
} from '../group';
import { superscript, subscript } from '../../../shared/utils/math-notation';

export function createDihedralGroup(n: number): Group {
  const elements: GroupElement[] = [];

  // Rotations r^k: position i → (i + k) mod n
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

  // Reflections s·r^k: position i → (n - i - k + n) mod n
  for (let k = 0; k < n; k++) {
    const mapping = Array.from(
      { length: n },
      (_, i) => ((n - i - k) % n + n) % n,
    );
    const label = k === 0 ? 's' : k === 1 ? 'sr' : `sr${superscript(k)}`;
    const axis = reflectionAxis(mapping, k, n);
    elements.push({
      id: `sr${k}`,
      label,
      permutation: new Permutation(mapping),
      transform: { type: 'reflection', axisDx: axis.dx, axisDy: axis.dy },
    });
  }

  const identity = elements[0];

  const group: Group = {
    name: `二面體群`,
    notation: `D${subscript(n)}`,
    description: `正${n}邊形的對稱群（${2 * n} 個元素）`,
    vertices: n,
    elements,
    generators: [elements[1], elements[n]], // r, s
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

/**
 * Compute the 2D axis direction for a reflection element sr^k.
 * Returns unit vector (dx, dy) in SVG coordinates (y-down).
 */
function reflectionAxis(
  mapping: number[],
  k: number,
  n: number,
): { dx: number; dy: number } {
  // Try to find a fixed vertex
  for (let i = 0; i < n; i++) {
    if (mapping[i] === i) {
      const angle = (2 * Math.PI * i) / n;
      return { dx: Math.sin(angle), dy: -Math.cos(angle) };
    }
  }

  // No fixed vertex (even n, odd k): use midpoint between vertex 0 and its image
  const img = ((n - k) % n + n) % n;
  const angleImg = (2 * Math.PI * img) / n;
  const mx = Math.sin(0) + Math.sin(angleImg); // sin(0) = 0
  const my = -Math.cos(0) + -Math.cos(angleImg); // -cos(0) = -1
  const len = Math.sqrt(mx * mx + my * my);
  return { dx: mx / len, dy: my / len };
}
