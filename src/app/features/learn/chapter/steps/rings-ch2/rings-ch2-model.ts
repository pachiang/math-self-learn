export type RouteMode = 'whole' | 'split' | 'both';
export type WiringMode = 'correct' | 'miswired';

export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export interface DistributiveRoute {
  wholeSum: number;
  wholeEnd: number;
  leftProduct: number;
  rightProduct: number;
  splitEnd: number;
}

export function distributiveRoute(a: number, b: number, c: number, modulus = 6): DistributiveRoute {
  const wholeSum = mod(b + c, modulus);
  const leftProduct = mod(a * b, modulus);
  const rightProduct = mod(a * c, modulus);
  return {
    wholeSum,
    wholeEnd: mod(a * wholeSum, modulus),
    leftProduct,
    rightProduct,
    splitEnd: mod(leftProduct + rightProduct, modulus),
  };
}

export function multiplyMod3(a: number, b: number, wiring: WiringMode): number {
  if (wiring === 'miswired' && a === 0 && b === 0) return 1;
  return mod(a * b, 3);
}

export function faultRoute(wiring: WiringMode): DistributiveRoute {
  const wholeSum = 0;
  const wholeEnd = multiplyMod3(0, wholeSum, wiring);
  const leftProduct = multiplyMod3(0, 0, wiring);
  const rightProduct = multiplyMod3(0, 0, wiring);
  return { wholeSum, wholeEnd, leftProduct, rightProduct, splitEnd: mod(leftProduct + rightProduct, 3) };
}

export function countDistributiveTriples(wiring: WiringMode): number {
  let passing = 0;
  for (let a = 0; a < 3; a += 1) {
    for (let b = 0; b < 3; b += 1) {
      for (let c = 0; c < 3; c += 1) {
        const left = multiplyMod3(a, mod(b + c, 3), wiring);
        const right = mod(multiplyMod3(a, b, wiring) + multiplyMod3(a, c, wiring), 3);
        if (left === right) passing += 1;
      }
    }
  }
  return passing;
}

export function functionRoute(h: number, f: number, g: number): { sum: number; whole: number; hf: number; hg: number; split: number } {
  const sum = f + g;
  const hf = h * f;
  const hg = h * g;
  return { sum, whole: h * sum, hf, hg, split: hf + hg };
}
