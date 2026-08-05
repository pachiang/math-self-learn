const lanczos = [
  676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406, 12.507343278686905,
  -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7,
];

export function logGamma(value: number): number {
  if (value < 0.5)
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  const z = value - 1;
  let series = 0.9999999999998099;
  lanczos.forEach((coefficient, index) => (series += coefficient / (z + index + 1)));
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(series);
}

export function normalPdf(x: number, mean = 0, sd = 1): number {
  const z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

export function chiSquarePdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const half = df / 2;
  return Math.exp((half - 1) * Math.log(x) - x / 2 - half * Math.log(2) - logGamma(half));
}

export function betaPdf(x: number, alpha: number, beta: number): number {
  if (x <= 0 || x >= 1) return 0;
  const logBeta = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
  return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta);
}
