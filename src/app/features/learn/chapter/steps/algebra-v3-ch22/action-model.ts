import {
  D3_ELEMENTS,
  type D3Element,
  label,
  multiply,
} from '../algebra-v3-ch16/d3-model';

export type WorldId = 'vertices' | 'orientation' | 'center';

export interface ActionWorld {
  id: WorldId;
  title: string;
  question: string;
  states: readonly number[];
  stateLabels: readonly string[];
}

export const ACTION_WORLDS: readonly ActionWorld[] = [
  {
    id: 'vertices',
    title: 'VERTEX WORLD',
    question: '哪個角落被送到哪裡？',
    states: [0, 1, 2],
    stateLabels: ['▲', '▶', '◀'],
  },
  {
    id: 'orientation',
    title: 'ORIENTATION WORLD',
    question: '順、逆時針方向感有沒有翻轉？',
    states: [0, 1],
    stateLabels: ['CW', 'CCW'],
  },
  {
    id: 'center',
    title: 'CENTER WORLD',
    question: '中心點移動了嗎？',
    states: [0],
    stateLabels: ['CENTER'],
  },
] as const;

export function vertexAction(actor: D3Element, state: number): number {
  const rotation = actor % 3;
  const direction = actor < 3 ? 1 : -1;
  return ((rotation + direction * state) % 3 + 3) % 3;
}

export function act(world: WorldId, actor: D3Element, state: number): number {
  if (world === 'vertices') return vertexAction(actor, state);
  if (world === 'orientation') return actor < 3 ? state : 1 - state;
  return 0;
}

export function worldById(id: WorldId): ActionWorld {
  return ACTION_WORLDS.find(world => world.id === id)!;
}

export function actionSignature(world: WorldId, actor: D3Element): string {
  return worldById(world).states.map(state => act(world, actor, state)).join('');
}

export function isInvisible(world: WorldId, actor: D3Element): boolean {
  return worldById(world).states.every(state => act(world, actor, state) === state);
}

export function kernel(world: WorldId): D3Element[] {
  return D3_ELEMENTS.filter(actor => isInvisible(world, actor));
}

export function signatureGroups(world: WorldId): D3Element[][] {
  const groups = new Map<string, D3Element[]>();
  for (const actor of D3_ELEMENTS) {
    const signature = actionSignature(world, actor);
    groups.set(signature, [...(groups.get(signature) ?? []), actor]);
  }
  return [...groups.values()];
}

export interface ActionCandidate {
  id: string;
  title: string;
  description: string;
  worldLabel: string;
  states: readonly number[];
  stateLabels: readonly string[];
  faithful: boolean;
  apply: (actor: D3Element, state: number) => number;
}

export const ACTION_CANDIDATES: readonly ActionCandidate[] = [
  {
    id: 'triangle',
    title: 'Triangle vertices',
    description: 'D₃ 的真實 vertex motions。',
    worldLabel: '3 vertices',
    states: [0, 1, 2],
    stateLabels: ['▲', '▶', '◀'],
    faithful: true,
    apply: vertexAction,
  },
  {
    id: 'orientation',
    title: 'Orientation only',
    description: 'rotations 不變、reflections 翻轉 CW／CCW。',
    worldLabel: '2 orientations',
    states: [0, 1],
    stateLabels: ['CW', 'CCW'],
    faithful: false,
    apply: (actor, state) => actor < 3 ? state : 1 - state,
  },
  {
    id: 'identity-drift',
    title: 'Identity secretly drifts',
    description: '把 e 錯接成一次 vertex rotation。',
    worldLabel: '3 vertices',
    states: [0, 1, 2],
    stateLabels: ['▲', '▶', '◀'],
    faithful: false,
    apply: (actor, state) => actor === 0 ? (state + 1) % 3 : vertexAction(actor, state),
  },
  {
    id: 'broken-reflections',
    title: 'Reflections unplugged',
    description: '每張 card 都可逆，但所有 reflections 被錯接成 identity。',
    worldLabel: '3 vertices',
    states: [0, 1, 2],
    stateLabels: ['▲', '▶', '◀'],
    faithful: false,
    apply: (actor, state) => actor >= 3 ? state : vertexAction(actor, state),
  },
] as const;

export interface IdentityFailure {
  state: number;
  actual: number;
}

export interface CompositionFailure {
  g: D3Element;
  h: D3Element;
  state: number;
  direct: number;
  sequential: number;
}

export function firstIdentityFailure(candidate: ActionCandidate): IdentityFailure | null {
  for (const state of candidate.states) {
    const actual = candidate.apply(0, state);
    if (actual !== state) return { state, actual };
  }
  return null;
}

export function firstCompositionFailure(candidate: ActionCandidate): CompositionFailure | null {
  for (const g of D3_ELEMENTS) {
    for (const h of D3_ELEMENTS) {
      for (const state of candidate.states) {
        const direct = candidate.apply(multiply(g, h), state);
        const sequential = candidate.apply(g, candidate.apply(h, state));
        if (direct !== sequential) return { g, h, state, direct, sequential };
      }
    }
  }
  return null;
}

export function stateLabel(candidate: ActionCandidate, state: number): string {
  return candidate.stateLabels[state] ?? String(state);
}

export function actorSetLabel(actors: readonly D3Element[]): string {
  return `{${actors.map(label).join(', ')}}`;
}
