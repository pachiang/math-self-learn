export type DiagnosisRoute = 'relation' | 'descent' | 'image' | 'paired' | 'domain' | 'field';
export type DescentIdeal = 'six' | 'three';
export type PairViewMode = 'mod46' | 'mod34';
export type BehaviorBoundary = 'six' | 'zero' | 'five';

export interface DiagnosisPrompt {
  readonly prompt: string;
  readonly route: DiagnosisRoute;
  readonly firstQuestion: string;
}

export interface Address {
  readonly first: number;
  readonly second: number;
}

export const DIAGNOSIS_PROMPTS: readonly DiagnosisPrompt[] = [
  { prompt: '讓 14 與 20 在新世界裡變成同一個 element', route: 'relation', firstQuestion: '哪個difference必須先變成zero？' },
  { prompt: 'Parity map 在 quotient 上仍要給每個class唯一答案', route: 'descent', firstQuestion: '新compression是否只合併map已看不見的differences？' },
  { prompt: '描述一張map真正保留下來的有效世界', route: 'image', firstQuestion: '哪些inputs collision？哪些target outputs真的reachable？' },
  { prompt: '用兩張 quotient views 重建原本的input', route: 'paired', firstQuestion: '有共同blind spot嗎？所有coordinates都reachable嗎？' },
  { prompt: 'Nonzero product 絕對不能變成zero', route: 'domain', firstQuestion: '能否找到兩個outsiders的product落進boundary？' },
  { prompt: 'Every nonzero class 都必須能回到 1', route: 'field', firstQuestion: '每張nonzero class都有inverse certificate嗎？' },
];

export const ROUTE_LABELS: Record<DiagnosisRoute, string> = {
  relation: 'RELATION → GENERATED IDEAL',
  descent: 'MAP SURVIVAL → I⊆ker f',
  image: 'MAP MEMORY → ker / image',
  paired: 'PAIRED VIEWS → ∩ / + / CRT',
  domain: 'ZERO-PRODUCT TRACE → PRIME',
  field: 'INVERSE-TO-1 → MAXIMAL',
};

export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function relationDifference(left = 14, right = 20): number {
  return Math.abs(right - left);
}

export function generatedIntegerIdealViewport(generator = 6, radius = 3): readonly number[] {
  return Array.from({ length: radius * 2 + 1 }, (_, index) => (index - radius) * generator);
}

export function descentGenerator(id: DescentIdeal): number { return id === 'six' ? 6 : 3; }
export function parity(value: number): number { return mod(value, 2); }
export function descentHandles(id: DescentIdeal, representative = 0): readonly number[] {
  const step = descentGenerator(id);
  return [representative, representative + step, representative + 2 * step];
}
export function descentOutputs(id: DescentIdeal): readonly number[] { return descentHandles(id).map(parity); }
export function descentSafe(id: DescentIdeal): boolean { return new Set(descentOutputs(id)).size === 1; }

export const MOD4_VALUES = [0, 1, 2, 3] as const;
export function diagonalPoint(value: number): Address { const v = mod(value, 4); return { first: v, second: v }; }
export function pointKey(point: Address): string { return `${point.first},${point.second}`; }
export function pointLabel(point: Address): string { return `(${point.first},${point.second})`; }
export function diagonalTarget(): readonly Address[] {
  return MOD4_VALUES.flatMap(first => MOD4_VALUES.map(second => ({ first, second })));
}
export function isDiagonal(point: Address): boolean { return point.first === point.second; }

export function pairModuli(mode: PairViewMode): readonly [number, number] { return mode === 'mod46' ? [4, 6] : [3, 4]; }
export function pairedAddress(value: number, mode: PairViewMode): Address {
  const [first, second] = pairModuli(mode);
  return { first: mod(value, first), second: mod(value, second) };
}
export function pairedTarget(mode: PairViewMode): readonly Address[] {
  const [first, second] = pairModuli(mode);
  return Array.from({ length: first }, (_, a) => Array.from({ length: second }, (__, b) => ({ first: a, second: b }))).flat();
}
export function reachablePairedAddresses(mode: PairViewMode): readonly Address[] {
  const seen = new Map<string, Address>();
  for (let value = 0; value < 12; value += 1) {
    const address = pairedAddress(value, mode);
    seen.set(pointKey(address), address);
  }
  return [...seen.values()];
}
export function pairedInjective(mode: PairViewMode): boolean { return reachablePairedAddresses(mode).length === 12; }
export function pairedSurjective(mode: PairViewMode): boolean { return reachablePairedAddresses(mode).length === pairedTarget(mode).length; }

export function boundaryLabel(id: BehaviorBoundary): string {
  if (id === 'zero') return '(0)';
  return id === 'six' ? '6ℤ' : '5ℤ';
}
export function quotientBehaviorLabel(id: BehaviorBoundary): string {
  if (id === 'zero') return 'ℤ/(0) ≅ ℤ';
  return id === 'six' ? 'ℤ/6ℤ' : 'ℤ/5ℤ';
}
export function hasDomainBehavior(id: BehaviorBoundary): boolean { return id !== 'six'; }
export function hasFieldBehavior(id: BehaviorBoundary): boolean { return id === 'five'; }

export function verifyRingsCh18Model(): void {
  if (relationDifference() !== 6 || generatedIntegerIdealViewport().join(',') !== '-18,-12,-6,0,6,12,18') throw new Error('Ch18 relation compiler invariant failed.');
  if (!descentSafe('six') || descentSafe('three')) throw new Error('Ch18 descent comparison invariant failed.');
  if (diagonalTarget().length !== 16 || diagonalTarget().filter(isDiagonal).length !== 4) throw new Error('Ch18 diagonal image invariant failed.');
  if (!pairedInjective('mod46') || pairedSurjective('mod46')) throw new Error('Ch18 mod4/mod6 gates must be injective but not surjective.');
  if (!pairedInjective('mod34') || !pairedSurjective('mod34')) throw new Error('Ch18 mod3/mod4 gates must both pass.');
  if (!hasDomainBehavior('zero') || hasFieldBehavior('zero') || !hasFieldBehavior('five')) throw new Error('Ch18 behavior detector invariant failed.');
}

verifyRingsCh18Model();
