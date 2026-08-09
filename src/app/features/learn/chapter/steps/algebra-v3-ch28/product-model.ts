export interface ProductCell {
  x: number;
  y: number;
  key: string;
}

export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

export function productGrid(m: number, n: number): ProductCell[] {
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: m }, (_, x) => ({ x, y, key: `${x},${y}` })),
  ).flat();
}

export function coordinateOrder(modulus: number, step: number): number {
  return modulus / gcd(modulus, step);
}

export function pairOrder(m: number, n: number, dx: number, dy: number): number {
  return lcm(coordinateOrder(m, dx), coordinateOrder(n, dy));
}

export function productTrace(m: number, n: number, dx: number, dy: number): ProductCell[] {
  return Array.from({ length: pairOrder(m, n, dx, dy) }, (_, time) => {
    const x = mod(time * dx, m);
    const y = mod(time * dy, n);
    return { x, y, key: `${x},${y}` };
  });
}
