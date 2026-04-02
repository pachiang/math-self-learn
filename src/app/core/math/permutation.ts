export class Permutation {
  readonly mapping: readonly number[];

  constructor(mapping: number[]) {
    this.mapping = Object.freeze([...mapping]);
  }

  get size(): number {
    return this.mapping.length;
  }

  apply(i: number): number {
    return this.mapping[i];
  }

  /** this ∘ other: first apply `other`, then `this`. */
  compose(other: Permutation): Permutation {
    return new Permutation(
      Array.from({ length: this.size }, (_, i) => this.mapping[other.mapping[i]]),
    );
  }

  inverse(): Permutation {
    const inv = new Array<number>(this.size);
    for (let i = 0; i < this.size; i++) {
      inv[this.mapping[i]] = i;
    }
    return new Permutation(inv);
  }

  equals(other: Permutation): boolean {
    return (
      this.size === other.size &&
      this.mapping.every((v, i) => v === other.mapping[i])
    );
  }

  isIdentity(): boolean {
    return this.mapping.every((v, i) => v === i);
  }

  /** Returns cycle notation string, e.g. "(0 1 2)" or "(0 1)(2 3)". */
  toCycleNotation(): string {
    const visited = new Array<boolean>(this.size).fill(false);
    const cycles: number[][] = [];

    for (let i = 0; i < this.size; i++) {
      if (visited[i]) continue;
      const cycle: number[] = [];
      let j = i;
      while (!visited[j]) {
        visited[j] = true;
        cycle.push(j);
        j = this.mapping[j];
      }
      if (cycle.length > 1) {
        cycles.push(cycle);
      }
    }

    if (cycles.length === 0) return '( )';
    return cycles.map((c) => `(${c.join(' ')})`).join('');
  }

  static identity(n: number): Permutation {
    return new Permutation(Array.from({ length: n }, (_, i) => i));
  }
}
