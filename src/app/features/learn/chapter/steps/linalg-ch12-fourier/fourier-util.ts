export type ScalarFn = (x: number) => number;

export function samplePath(
  fn: ScalarFn,
  options: {
    xMin?: number;
    xMax?: number;
    samples?: number;
    scaleX?: number;
    scaleY?: number;
  } = {},
): string {
  const {
    xMin = -Math.PI,
    xMax = Math.PI,
    samples = 220,
    scaleX = 34,
    scaleY = 26,
  } = options;
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = xMin + (xMax - xMin) * t;
    const y = fn(x);
    points.push(`${(x * scaleX).toFixed(2)},${(-y * scaleY).toFixed(2)}`);
  }
  return `M ${points.join(' L ')}`;
}

export function integrate(
  fn: ScalarFn,
  a = -Math.PI,
  b = Math.PI,
  samples = 600,
): number {
  let total = 0;
  const h = (b - a) / samples;
  for (let i = 0; i <= samples; i++) {
    const x = a + i * h;
    const weight = i === 0 || i === samples ? 0.5 : 1;
    total += weight * fn(x);
  }
  return total * h;
}

export function cumulativeIntegralPath(
  fn: ScalarFn,
  options: {
    xMin?: number;
    xMax?: number;
    samples?: number;
    scaleX?: number;
    scaleY?: number;
  } = {},
): string {
  const {
    xMin = -Math.PI,
    xMax = Math.PI,
    samples = 180,
    scaleX = 34,
    scaleY = 18,
  } = options;
  const h = (xMax - xMin) / samples;
  let total = 0;
  const points: string[] = [];
  let prev = fn(xMin);
  points.push(`${(xMin * scaleX).toFixed(2)},0`);
  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * h;
    const cur = fn(x);
    total += 0.5 * (prev + cur) * h;
    points.push(`${(x * scaleX).toFixed(2)},${(-total * scaleY).toFixed(2)}`);
    prev = cur;
  }
  return `M ${points.join(' L ')}`;
}

export function trigBasis(index: number): { label: string; fn: ScalarFn } {
  if (index === 0) return { label: '1', fn: () => 1 };
  const k = Math.floor((index + 1) / 2);
  if (index % 2 === 1) {
    return { label: `cos(${k}x)`, fn: (x) => Math.cos(k * x) };
  }
  return { label: `sin(${k}x)`, fn: (x) => Math.sin(k * x) };
}

export function trigBasisList(count: number): { label: string; fn: ScalarFn }[] {
  return Array.from({ length: count }, (_, i) => trigBasis(i));
}

export function projectOntoBasis(target: ScalarFn, count: number): number[] {
  const basis = trigBasisList(count);
  return basis.map(({ fn }, i) => {
    const numerator = integrate((x) => target(x) * fn(x));
    const denominator = integrate((x) => fn(x) * fn(x));
    if (i === 0) return numerator / denominator;
    return numerator / denominator;
  });
}

export function combineBasis(coeffs: readonly number[]): ScalarFn {
  return (x: number) => {
    let total = 0;
    for (let i = 0; i < coeffs.length; i++) {
      total += coeffs[i] * trigBasis(i).fn(x);
    }
    return total;
  };
}

export function squareWave(x: number): number {
  if (x === 0) return 0;
  return Math.sin(x) >= 0 ? 1 : -1;
}

export function sawWave(x: number): number {
  return x / Math.PI;
}

export function triangleWave(x: number): number {
  return (2 / Math.PI) * Math.asin(Math.sin(x));
}

export function fourierCoefficient(kind: 'square' | 'triangle' | 'saw', n: number): number {
  if (kind === 'square') {
    return n % 2 === 1 ? 4 / (Math.PI * n) : 0;
  }
  if (kind === 'triangle') {
    if (n % 2 === 0) return 0;
    const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
    return sign * 8 / (Math.PI * Math.PI * n * n);
  }
  return 2 * (n % 2 === 0 ? -1 : 1) / (Math.PI * n);
}

export function partialFourier(kind: 'square' | 'triangle' | 'saw', terms: number): ScalarFn {
  return (x: number) => {
    let total = 0;
    for (let n = 1; n <= terms; n++) {
      total += fourierCoefficient(kind, n) * Math.sin(n * x);
    }
    return total;
  };
}

export function legendre(n: number, x: number): number {
  switch (n) {
    case 0: return 1;
    case 1: return x;
    case 2: return 0.5 * (3 * x * x - 1);
    case 3: return 0.5 * (5 * x * x * x - 3 * x);
    case 4: return (35 * x ** 4 - 30 * x * x + 3) / 8;
    default: return 0;
  }
}

export function legendreLabel(n: number): string {
  return `P${n}`;
}
