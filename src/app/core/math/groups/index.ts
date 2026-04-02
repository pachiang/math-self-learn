import { Group } from '../group';
import { createDihedralGroup } from './dihedral';
import { createCyclicGroup } from './cyclic';

export { createDihedralGroup } from './dihedral';
export { createCyclicGroup } from './cyclic';

export interface GroupPreset {
  id: string;
  label: string;
  factory: () => Group;
}

export const GROUP_PRESETS: GroupPreset[] = [
  { id: 'd3', label: 'D₃ 三角形', factory: () => createDihedralGroup(3) },
  { id: 'd4', label: 'D₄ 正方形', factory: () => createDihedralGroup(4) },
  { id: 'd5', label: 'D₅ 五邊形', factory: () => createDihedralGroup(5) },
  { id: 'd6', label: 'D₆ 六邊形', factory: () => createDihedralGroup(6) },
  { id: 'z2', label: 'Z₂', factory: () => createCyclicGroup(2) },
  { id: 'z3', label: 'Z₃', factory: () => createCyclicGroup(3) },
  { id: 'z4', label: 'Z₄', factory: () => createCyclicGroup(4) },
  { id: 'z5', label: 'Z₅', factory: () => createCyclicGroup(5) },
  { id: 'z6', label: 'Z₆', factory: () => createCyclicGroup(6) },
];
