export type IntegerIdealId = 'zero' | 'six' | 'two';

export interface FactorPair {
  readonly a: number;
  readonly b: number;
  readonly purpose: 'breach' | 'outside-safe' | 'caught-factor';
}

export interface PrimeSensorReading {
  readonly aInside: boolean;
  readonly bInside: boolean;
  readonly product: number;
  readonly productInside: boolean;
  readonly breach: boolean;
}

export const FACTOR_PAIRS: readonly FactorPair[] = [
  { a: 2, b: 3, purpose: 'breach' },
  { a: 2, b: 4, purpose: 'outside-safe' },
  { a: 6, b: 5, purpose: 'caught-factor' },
];

export function idealLabel(id: IntegerIdealId): string {
  if (id === 'zero') return '(0)';
  return id === 'six' ? '6ℤ' : '2ℤ';
}

export function quotientLabel(id: IntegerIdealId): string {
  if (id === 'zero') return 'ℤ/(0) ≅ ℤ';
  return id === 'six' ? 'ℤ/6ℤ' : 'ℤ/2ℤ';
}

export function modulus(id: IntegerIdealId): number | null {
  if (id === 'zero') return null;
  return id === 'six' ? 6 : 2;
}

export function inIdeal(value: number, id: IntegerIdealId): boolean {
  const divisor = modulus(id);
  return divisor === null ? value === 0 : value % divisor === 0;
}

export function quotientValue(value: number, id: IntegerIdealId): number {
  const divisor = modulus(id);
  if (divisor === null) return value;
  return ((value % divisor) + divisor) % divisor;
}

export function classLabel(value: number, id: IntegerIdealId): string {
  return `${quotientValue(value, id)}+${idealLabel(id)}`;
}

export function sensorReading(pair: FactorPair, id: IntegerIdealId): PrimeSensorReading {
  const product = pair.a * pair.b;
  const aInside = inIdeal(pair.a, id);
  const bInside = inIdeal(pair.b, id);
  const productInside = inIdeal(product, id);
  return {
    aInside,
    bInside,
    product,
    productInside,
    breach: !aInside && !bInside && productInside,
  };
}

export function productClassEquation(pair: FactorPair, id: IntegerIdealId): string {
  return `(${classLabel(pair.a, id)})(${classLabel(pair.b, id)}) = ${classLabel(pair.a * pair.b, id)}`;
}

export function knownPrimeVerdict(id: IntegerIdealId): boolean {
  return id !== 'six';
}

export function knownMaximalVerdict(id: IntegerIdealId): boolean {
  return id === 'two';
}

export function verifyRingsCh17Model(): void {
  const witness = FACTOR_PAIRS[0];
  const safe = FACTOR_PAIRS[1];
  const caught = FACTOR_PAIRS[2];

  if (!sensorReading(witness, 'six').breach) throw new Error('Ch17 invariant failed: 2·3 must breach 6ℤ.');
  if (sensorReading(witness, 'zero').breach) throw new Error('Ch17 invariant failed: 2·3 must not breach (0).');
  if (sensorReading(safe, 'six').productInside) throw new Error('Ch17 invariant failed: 2·4 must stay outside 6ℤ.');
  if (sensorReading(caught, 'six').breach || !sensorReading(caught, 'six').aInside) {
    throw new Error('Ch17 invariant failed: 6·5 must be caught by an inside factor.');
  }
  for (const id of ['zero', 'six', 'two'] as const) {
    for (const pair of FACTOR_PAIRS) {
      const reading = sensorReading(pair, id);
      const downstairsCrash = quotientValue(reading.product, id) === 0;
      if (downstairsCrash !== reading.productInside) {
        throw new Error(`Ch17 invariant failed: product membership and quotient zero disagree for ${id}.`);
      }
    }
  }
  if (!knownPrimeVerdict('zero') || knownMaximalVerdict('zero')) {
    throw new Error('Ch17 invariant failed: (0) in ℤ must be prime but not maximal.');
  }
  if (!knownPrimeVerdict('two') || !knownMaximalVerdict('two')) {
    throw new Error('Ch17 invariant failed: 2ℤ in ℤ must be maximal and prime.');
  }
}

verifyRingsCh17Model();
