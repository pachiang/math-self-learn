import type { AlgebraV2Lesson } from './algebra-v2-lessons';
import { ALGEBRA_V2_PART4A_LESSONS } from './algebra-v2-part4a-lessons';
import { ALGEBRA_V2_PART4B_LESSONS } from './algebra-v2-part4b-lessons';

type Part4ChapterId =
  | 'ch19'
  | 'ch20'
  | 'ch21'
  | 'ch22'
  | 'ch23'
  | 'ch24'
  | 'ch25'
  | 'ch26'
  | 'ch27';

export const ALGEBRA_V2_PART4_LESSONS: Record<Part4ChapterId, AlgebraV2Lesson[]> = {
  ...ALGEBRA_V2_PART4A_LESSONS,
  ...ALGEBRA_V2_PART4B_LESSONS,
};
