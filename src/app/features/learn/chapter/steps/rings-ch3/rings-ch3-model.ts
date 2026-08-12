export type ContractModule = 'add' | 'multiply' | 'distribute';
export type CandidateWorld = 'integers' | 'naturals' | 'matrices' | 'functions';

export interface DifferenceSolution {
  shift: number;
  exists: boolean;
}

export function solveDifference(start: number, target: number, world: 'integers' | 'naturals'): DifferenceSolution {
  const shift = target - start;
  return { shift, exists: world === 'integers' || shift >= 0 };
}

export function groupedProduct(grouping: 'left' | 'right', includeIdentity: boolean): {
  first: number;
  result: number;
  expression: string;
} {
  if (grouping === 'left') {
    return { first: 2 * 3, result: 2 * 3 * 4, expression: includeIdentity ? '((1·2)·3)·4' : '(2·3)·4' };
  }
  return { first: 3 * 4, result: 2 * 3 * 4, expression: includeIdentity ? '1·(2·(3·4))' : '2·(3·4)' };
}

export interface CandidateVerdict {
  ring: boolean;
  commutative: boolean;
  decisive: string;
  module: ContractModule | 'scope';
}

export const CANDIDATE_VERDICTS: Record<CandidateWorld, CandidateVerdict> = {
  integers: {
    ring: true,
    commutative: true,
    decisive: 'ADD differences 可撤銷；MULTIPLY chain 與 1 穩定；mixed routes 對齊。',
    module: 'distribute',
  },
  naturals: {
    ring: false,
    commutative: true,
    decisive: '2+x=1 需要 x=−1，但 −1 不在 ℕ；ADD backbone 缺少 inverse。',
    module: 'add',
  },
  matrices: {
    ring: true,
    commutative: false,
    decisive: 'Core contract 通過；但 AB≠BA，因此只離開 commutative main lane。',
    module: 'scope',
  },
  functions: {
    ring: true,
    commutative: true,
    decisive: 'Pointwise ADD 與 MULTIPLY 逐 lane 繼承 ℤ 的 contract。',
    module: 'distribute',
  },
};

export const MATRIX_WITNESS = {
  a: '[[0,1],[0,0]]',
  b: '[[0,0],[1,0]]',
  ab: '[[1,0],[0,0]]',
  ba: '[[0,0],[0,1]]',
};
