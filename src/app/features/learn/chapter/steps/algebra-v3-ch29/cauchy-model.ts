export interface FiniteGroup {
  id: string;
  name: string;
  elements: string[];
  identity: string;
  multiply(left: string, right: string): string;
}

export interface TuplePacket {
  key: string;
  tuples: string[][];
  fixed: boolean;
}

function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function cyclicGroup(order: number): FiniteGroup {
  const elements = Array.from({ length: order }, (_, value) => String(value));
  return {
    id: `c${order}`,
    name: `C${subscript(order)}`,
    elements,
    identity: '0',
    multiply: (left, right) => String(mod(Number(left) + Number(right), order)),
  };
}

const d3Pairs: Record<string, [number, number]> = {
  e: [0, 0],
  r: [1, 0],
  'r²': [2, 0],
  s: [0, 1],
  rs: [1, 1],
  'r²s': [2, 1],
};

const d3Labels = new Map<string, string>(
  Object.entries(d3Pairs).map(([label, pair]) => [pair.join(','), label]),
);

export const D3_GROUP: FiniteGroup = {
  id: 'd3',
  name: 'D₃',
  elements: Object.keys(d3Pairs),
  identity: 'e',
  multiply(left, right) {
    const [a, b] = d3Pairs[left];
    const [c, d] = d3Pairs[right];
    const rotation = mod(a + (b === 0 ? c : -c), 3);
    const reflection = mod(b + d, 2);
    return d3Labels.get(`${rotation},${reflection}`)!;
  },
};

export const C6_GROUP = cyclicGroup(6);
export const C8_GROUP = cyclicGroup(8);

export function power(group: FiniteGroup, element: string, exponent: number): string {
  let result = group.identity;
  for (let i = 0; i < exponent; i += 1) result = group.multiply(result, element);
  return result;
}

export function elementOrder(group: FiniteGroup, element: string): number {
  let result = group.identity;
  for (let exponent = 1; exponent <= group.elements.length; exponent += 1) {
    result = group.multiply(result, element);
    if (result === group.identity) return exponent;
  }
  throw new Error(`No finite order found for ${element} in ${group.name}`);
}

export function inverse(group: FiniteGroup, element: string): string {
  const candidate = group.elements.find(
    (right) =>
      group.multiply(element, right) === group.identity &&
      group.multiply(right, element) === group.identity,
  );
  if (!candidate) throw new Error(`No inverse found for ${element} in ${group.name}`);
  return candidate;
}

export function tupleProduct(group: FiniteGroup, tuple: string[]): string {
  return tuple.reduce((result, element) => group.multiply(result, element), group.identity);
}

export function completeTuple(group: FiniteGroup, prefix: string[]): string[] {
  return [...prefix, inverse(group, tupleProduct(group, prefix))];
}

export function rotateTuple(tuple: string[], amount = 1): string[] {
  const shift = mod(amount, tuple.length);
  return [...tuple.slice(shift), ...tuple.slice(0, shift)];
}

export function constrainedTuples(group: FiniteGroup, prime: number): string[][] {
  let prefixes: string[][] = [[]];
  for (let slot = 0; slot < prime - 1; slot += 1) {
    prefixes = prefixes.flatMap((prefix) => group.elements.map((element) => [...prefix, element]));
  }
  return prefixes.map((prefix) => completeTuple(group, prefix));
}

export function tupleKey(tuple: string[]): string {
  return tuple.join('|');
}

export function rotationPackets(group: FiniteGroup, prime: number): TuplePacket[] {
  const tuples = constrainedTuples(group, prime);
  const tupleByKey = new Map(tuples.map((tuple) => [tupleKey(tuple), tuple]));
  const assigned = new Set<string>();
  const packets: TuplePacket[] = [];

  for (const tuple of tuples) {
    const startKey = tupleKey(tuple);
    if (assigned.has(startKey)) continue;
    const orbit: string[][] = [];
    let current = tuple;
    do {
      const key = tupleKey(current);
      if (!orbit.some((item) => tupleKey(item) === key)) {
        const canonical = tupleByKey.get(key) ?? current;
        orbit.push(canonical);
        assigned.add(key);
      }
      current = rotateTuple(current);
    } while (tupleKey(current) !== startKey);

    packets.push({
      key: startKey,
      tuples: orbit,
      fixed: orbit.length === 1,
    });
  }

  return packets.sort((a, b) => Number(a.fixed) - Number(b.fixed));
}

export function fixedElements(group: FiniteGroup, prime: number): string[] {
  return group.elements.filter((element) => power(group, element, prime) === group.identity);
}

export function displayElement(group: FiniteGroup, element: string): string {
  return group.id.startsWith('c') ? `[${element}]` : element;
}

export function displayTuple(group: FiniteGroup, tuple: string[]): string {
  return `(${tuple.map((element) => displayElement(group, element)).join(', ')})`;
}

function subscript(value: number): string {
  return String(value)
    .replace(/0/g, '₀')
    .replace(/1/g, '₁')
    .replace(/2/g, '₂')
    .replace(/3/g, '₃')
    .replace(/4/g, '₄')
    .replace(/5/g, '₅')
    .replace(/6/g, '₆')
    .replace(/7/g, '₇')
    .replace(/8/g, '₈')
    .replace(/9/g, '₉');
}
