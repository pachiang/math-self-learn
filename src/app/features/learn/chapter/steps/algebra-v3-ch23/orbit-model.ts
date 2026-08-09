import { D3_ELEMENTS, type D3Element } from '../algebra-v3-ch16/d3-model';
import { vertexAction } from '../algebra-v3-ch22/action-model';

export const SCENE_POINTS = [0, 1, 2, 3] as const;
export type ScenePoint = (typeof SCENE_POINTS)[number];
export const SCENE_LABELS: Record<ScenePoint, string> = { 0: '▲', 1: '▶', 2: '◀', 3: '●' };

export function actOnScene(actor: D3Element, point: ScenePoint): ScenePoint {
  return point === 3 ? 3 : vertexAction(actor, point) as ScenePoint;
}

export function pointLabel(point: ScenePoint): string {
  return SCENE_LABELS[point];
}

export function orbitOf(point: ScenePoint): ScenePoint[] {
  return [...new Set(D3_ELEMENTS.map(actor => actOnScene(actor, point)))];
}

export function stabilizerOf(point: ScenePoint): D3Element[] {
  return D3_ELEMENTS.filter(actor => actOnScene(actor, point) === point);
}

export function pointSetLabel(points: readonly ScenePoint[]): string {
  return `{${points.map(pointLabel).join(', ')}}`;
}
