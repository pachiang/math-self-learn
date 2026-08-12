import { D3_ELEMENTS, type D3Element, inverse, label, multiply } from '../algebra-v3-ch16/d3-model';
import { actionSignature, vertexAction } from '../algebra-v3-ch22/action-model';
import { sylowConstraints } from '../algebra-v3-ch31/sylow-landscape-model';

export type ObservableRoute = 'representation' | 'compression' | 'action' | 'order';

export interface DiagnosticScenario {
  id: string;
  known: string;
  goal: string;
  cue: string;
  route: ObservableRoute;
  observable: string;
  chapter: string;
}

export const DIAGNOSTIC_SCENARIOS: readonly DiagnosticScenario[] = [
  {
    id: 'encode',
    known: 'G 是由抽象 generators 與 relations 給出',
    goal: '把每個 element 變成可計算的 motion',
    cue: '區分所有 actors',
    route: 'representation',
    observable: '一組 distinct action signatures',
    chapter: '回看 Ch21–22',
  },
  {
    id: 'forget',
    known: 'φ(a)=φ(b) 對許多不同 inputs 發生',
    goal: '精確忘掉 φ 看不見的差異',
    cue: '忽略 invisible differences',
    route: 'compression',
    observable: 'kernel fibers 與 quotient buckets',
    chapter: '回看 Ch15–18',
  },
  {
    id: 'count',
    known: '一組 configurations 被 symmetry 重複計數',
    goal: '數出真正不同的 symmetry classes',
    cue: '數 reachable／fixed structure',
    route: 'action',
    observable: 'orbits 或 fixed-state incidence',
    chapter: '回看 Ch22–27',
  },
  {
    id: 'finite',
    known: '只知道有限群的 order |G|=21',
    goal: '逼出一定存在的 subgroup structure',
    cue: '只知道 finite order',
    route: 'order',
    observable: 'element orders 與 Sylow candidates',
    chapter: '回看 Ch29–31',
  },
] as const;

export const ROUTE_LABELS: Record<ObservableRoute, string> = {
  representation: 'CONCRETE ENCODING',
  compression: 'INVISIBLE DIFFERENCE',
  action: 'REACHABLE / FIXED',
  order: 'FINITE CONSTRAINT',
};

export type ResolutionWorldId = 'point' | 'orientation' | 'vertices' | 'regular';

export interface ResolutionWorld {
  id: ResolutionWorldId;
  label: string;
  stateCount: number;
  description: string;
}

export const RESOLUTION_WORLDS: readonly ResolutionWorld[] = [
  { id: 'point', label: 'ONE POINT', stateCount: 1, description: '所有 motions 都不可見' },
  { id: 'orientation', label: 'ORIENTATION', stateCount: 2, description: '只記得有沒有翻面' },
  {
    id: 'vertices',
    label: 'TRIANGLE',
    stateCount: 3,
    description: '三個 vertices 記得完整 D₃ action',
  },
  { id: 'regular', label: 'REGULAR', stateCount: 6, description: '讓 G 作用在自己的六個 states' },
] as const;

export function resolutionSignature(world: ResolutionWorldId, actor: D3Element): string {
  if (world === 'point') return '0';
  if (world === 'orientation') return actionSignature('orientation', actor);
  if (world === 'vertices') return [0, 1, 2].map((state) => vertexAction(actor, state)).join('');
  return D3_ELEMENTS.map((state) => multiply(actor, state)).join('');
}

export function resolutionBuckets(world: ResolutionWorldId): D3Element[][] {
  const buckets = new Map<string, D3Element[]>();
  for (const actor of D3_ELEMENTS) {
    const signature = resolutionSignature(world, actor);
    buckets.set(signature, [...(buckets.get(signature) ?? []), actor]);
  }
  return [...buckets.values()];
}

export function sufficientForGoal(
  world: ResolutionWorldId,
  goal: 'reflection' | 'faithful',
): boolean {
  return goal === 'reflection'
    ? resolutionBuckets(world).every(
        (bucket) => bucket.every((x) => x < 3) || bucket.every((x) => x >= 3),
      )
    : resolutionBuckets(world).length === D3_ELEMENTS.length;
}

export function parity(element: D3Element): 0 | 1 {
  return element < 3 ? 0 : 1;
}

export function kernelDifference(a: D3Element, b: D3Element): D3Element {
  return multiply(inverse(a), b);
}

export interface ActionSocket {
  id: 'vertices' | 'cosets' | 'conjugation' | 'colorings';
  label: string;
  world: string;
  goal: string;
  observable: string;
  output: string;
  missing: string;
  chapter: string;
}

export const ACTION_SOCKETS: readonly ActionSocket[] = [
  {
    id: 'vertices',
    label: 'VERTEX WORLD',
    world: 'triangle vertices',
    goal: '哪些位置彼此可達？誰留住指定位置？',
    observable: 'orbit + stabilizer',
    output: '3 reachable vertices · local symmetry size 2',
    missing: '這個 world 不直接編碼 subgroup containment',
    chapter: 'Ch23–24',
  },
  {
    id: 'cosets',
    label: 'COSET WORLD',
    world: 'left cosets G/H',
    goal: '某個 subgroup 是否被 conjugate 吸收？',
    observable: 'fixed coset',
    output: 'fixed gH decodes K ≤ gHg⁻¹',
    missing: '這個 world 不直接 quotient configuration symmetry',
    chapter: 'Ch12、Ch30–31',
  },
  {
    id: 'conjugation',
    label: 'CONJUGATION WORLD',
    world: 'elements or subgroups',
    goal: '哪些 objects 只是換了 frame？',
    observable: 'conjugacy orbit + centralizer',
    output: 'same structural type across reframings',
    missing: '這個 world 不直接數一般 configurations',
    chapter: 'Ch25–26',
  },
  {
    id: 'colorings',
    label: 'COLORING WORLD',
    world: 'configuration set X',
    goal: '有多少 configurations up to symmetry？',
    observable: 'fixed-state incidence',
    output: 'Burnside average reveals orbit count',
    missing: '這個 world 不直接保存每個 group element 的內部結構',
    chapter: 'Ch27',
  },
] as const;

export interface OrderPreset {
  order: number;
  primes: readonly number[];
}

export const ORDER_PRESETS: readonly OrderPreset[] = [
  { order: 12, primes: [2, 3] },
  { order: 21, primes: [3, 7] },
  { order: 30, primes: [2, 3, 5] },
] as const;

export function primeFactors(order: number): number[] {
  const factors: number[] = [];
  let rest = order;
  for (let prime = 2; prime <= rest; prime += 1) {
    while (rest % prime === 0) {
      factors.push(prime);
      rest /= prime;
    }
  }
  return factors;
}

export function sylowCandidateLabel(order: number, prime: number): string {
  return `n${subscript(prime)}∈{${sylowConstraints(order, prime).survivors.join(',')}}`;
}

export function sylowCandidates(order: number, prime: number): number[] {
  return sylowConstraints(order, prime).survivors;
}

export function subscript(value: number): string {
  const digits: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return String(value)
    .split('')
    .map((digit) => digits[digit])
    .join('');
}

export interface Order30Branch {
  prime: 3 | 5;
  sylowCount: number;
  nonIdentityPerSubgroup: number;
  required: number;
}

export const ORDER_30_BRANCHES: readonly Order30Branch[] = [
  { prime: 5, sylowCount: 6, nonIdentityPerSubgroup: 4, required: 24 },
  { prime: 3, sylowCount: 10, nonIdentityPerSubgroup: 2, required: 20 },
] as const;

export const ORDER_30_REQUIRED =
  1 + ORDER_30_BRANCHES.reduce((sum, branch) => sum + branch.required, 0);

export function elementLabel(element: D3Element): string {
  return label(element);
}
