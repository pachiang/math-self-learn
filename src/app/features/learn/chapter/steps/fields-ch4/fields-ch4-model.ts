// Fields & Galois · Chapter 4 shared model
// tower law：維度沿塔相乘。主視覺是 basis grid（列×行＝格數＝乘積）。

/** 兩個基底標籤的乘積顯示（處理 1 的情形）。 */
export function productLabel(a: string, b: string): string {
  if (a === '1' && b === '1') return '1';
  if (a === '1') return b;
  if (b === '1') return a;
  return `${a}·${b}`;
}

export interface TowerPreset {
  id: string;
  label: string; // 例如 'ℚ ⊂ ℚ(√2) ⊂ ℚ(√2, ∛2)'
  midField: string; // 'ℚ(√2)'
  topField: string; // 'ℚ(√2, ∛2)'
  botBasis: string[]; // [K:F] 的 basis（列）
  topBasis: string[]; // [L:K] 的相對 basis（行）
}

export function towerProduct(t: TowerPreset): number {
  return t.botBasis.length * t.topBasis.length;
}

export function towerSum(t: TowerPreset): number {
  return t.botBasis.length + t.topBasis.length;
}
