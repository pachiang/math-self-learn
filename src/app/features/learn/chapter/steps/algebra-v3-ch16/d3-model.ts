export const D3_ELEMENTS = [0, 1, 2, 3, 4, 5] as const;
export type D3Element = (typeof D3_ELEMENTS)[number];

export const D3_LABELS: Record<D3Element, string> = {
  0: 'e',
  1: 'r',
  2: 'r²',
  3: 's',
  4: 'rs',
  5: 'r²s',
};

function pair(element: D3Element): [number, number] {
  return element < 3 ? [element, 0] : [element - 3, 1];
}

function fromPair(rotation: number, reflection: number): D3Element {
  const normalized = ((rotation % 3) + 3) % 3;
  return (reflection ? normalized + 3 : normalized) as D3Element;
}

export function multiply(a: D3Element, b: D3Element): D3Element {
  const [rotationA, reflectionA] = pair(a);
  const [rotationB, reflectionB] = pair(b);
  const signedRotationB = reflectionA ? -rotationB : rotationB;
  return fromPair(rotationA + signedRotationB, reflectionA ^ reflectionB);
}

export function inverse(element: D3Element): D3Element {
  const [rotation, reflection] = pair(element);
  return reflection ? element : fromPair(-rotation, 0);
}

export function conjugate(g: D3Element, h: D3Element): D3Element {
  return multiply(multiply(g, h), inverse(g));
}

export function label(element: D3Element): string {
  return D3_LABELS[element];
}

export function setLabel(elements: readonly D3Element[]): string {
  const sorted = [...new Set(elements)].sort((a, b) => a - b);
  return `{${sorted.map(label).join(', ')}}`;
}
